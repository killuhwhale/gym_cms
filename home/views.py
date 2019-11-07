from django.shortcuts import render, redirect
from django.views.generic import TemplateView, View
from django.contrib.auth import authenticate
from django.db import IntegrityError

from django.core.files.base import ContentFile
from django.core.files.images import ImageFile 
from django.core.files.uploadedfile import InMemoryUploadedFile

from .MembershipManager import MembershipManager 

from .forms import UserForm
from .models import  *
from .serializers import *

from rest_framework.views import APIView
from rest_framework.response import Response
from django.http import HttpResponse

from gym_cms import settings

import io
import qrcode
import stripe
import json
import datetime
import base64


# Membership status: Search for users 
# @param pk given => populates user panel for given pk
# @param pk None => no user panel rendered
class UserStatus(TemplateView):
    template_name = "home/user_status.html"
    def get(self, request, pk=None):
        if pk is not None:
            return render(request, self.template_name, {"userpk": pk})
        return render(request, self.template_name, {"userpk": -1})

def create_qr_code(code):
    '''
    Generates QR image from given data.
    Returns byte array of QR image
    '''
    byte_arr = None
    try:
        qr = qrcode.QRCode(
                version=1,
                error_correction=qrcode.constants.ERROR_CORRECT_L,
                box_size=10,
                border=4,
            )
        qr.add_data(code)
        qr.make(fit=True)

        img = qr.make_image(fill_color="black", back_color="white")
        byte_arr = io.BytesIO()
        img.save(byte_arr, format='PNG')
        byte_arr = byte_arr.getvalue()
    except Exception as e:
        print(e)
    return byte_arr
    

# 
class CreateUser(TemplateView):
    
    form_class = UserForm # forms.py
    template_name = 'home/createuserform.html'

    
    #Display blank form
    def get(self, request):
        form = self.form_class(None)
        return render(request, self.template_name, {'form': form})
    
    #   
    def post(self, request):
        form = self.form_class(request.POST)
        # @param user_agreement refers to the pk of the document
        # This is the document the user will sign upon registration.
        user_agreement = 1 # default user agreement pk in database
        if form.is_valid():
            #Create object to save later (does not save to DB)
            user = form.save(commit = False)
            p_match = False
            qr_code_error = False

            #Clean and normalized data (proper formatting)
            
            username = form.cleaned_data['username']
            password = form.cleaned_data['password']
            password1 = request.POST['password_check'] 

            # check that passwords are both given and match
            if not password1:
                form.add_error("password","You must confirm your password")
            elif password != password1:
                print("passwords do not match")
                form.add_error("password", "Your passwords do not match")
            else:
                try:
                    user.set_password(password)
                    user.save()
                    print("User saved.")
                    
                    #Returns User object if credentials are correct
                    user = authenticate(username=username, password=password)
                    p_match = True
                except:
                    form.add_error(None, "Error creating user.")
                    print('Error creating user')

            ## Generate QR code and image            
            # if user was created and their passwords match
            if user is not None and p_match:
                try:
                    # this qr code will be unique to each gym in prod.
                    code="location:turlock,gym:19,id:{}".format(user.id)
                    
                    # user id ties a user and qr_code together
                    userid = UserID()
                    userid.user = user
                    userid.qr_code = code
                    userid.save()
                    
                    # save to media/qrcodes/
                    byte_arr = create_qr_code(code)
                    userid.qr_img.save("qrcodes",
                        InMemoryUploadedFile(
                            ContentFile(byte_arr),   # file
                            None,   # field name
                            "qrcode_{}_{}.png".format(user.username, user.id), #file name
                            "image/png", # content type
                            None, #size
                            None, #contentTypeExtra
                        )
                    )
                except:
                    form.add_error(None, "Error creating user qr code.")
                    qr_code_error = True
                    

                # render contract signing page for the user that was made
                # template parameters
                #    userpk: user.id => pk of user just created
                #    contractpk: user_agreement => default contract to have user sign, pk of document
                #    signContract: 1 => 0 if signed, 1 if needs to be signed.
                if not qr_code_error:
                    return render(request, "home/show_user_contract.html", {"userpk": user.id, "contractpk": user_agreement, "signContract": 1})

        # if form is not valid, creating user fails or creating UserID fails render form again with any error messages
        return render(request, self.template_name, {'form': form})

class MembershipPayment(TemplateView):
    template_name = "home/membership_payment.html"

    # To prevent multiple charges via multiple POST requests, session key 'payment_processed' with store a bool
    #   - set to False in get request
    #   - set to True in beginning of post method and if post requests are sent, only the first will complete processing
    #       - A post request with session key 'payment_processed' set to True will redirect to get

    # Return all memebership objects which represent memerbships to pay for
    def get(self, request, pk=-1):
        all_memberships = MembershipPlan.objects.all()
        memberships = [MembershipSerializer(m).data for m in all_memberships]
        request.session['payment_processed'] = False
        return render(request, self.template_name, {"userpk":pk, "membership_pkgs": memberships })

    def post(self, request):
        '''
        Check if a payment is in process already
        Get user, membershipPlan data from DB
        Get stripe token from form
        Init Membership Manger for user to update membership info for user
        Make a subscription or charge to Stripe depending on given membership plan
        If successful, update user membership info via Membership
        '''

        if("payment_processed" in request.session):
            print("Session started", request.session['payment_processed'])
            if(request.session['payment_processed']):
                #redirect
                return render(request, "home/user_status.html", {"userpk": request.POST['userpk']})
        request.session['payment_processed'] = True
        
        cur_user, m_plan = None, None
        try:
            cur_user = User.objects.get(pk=request.POST['userpk'])
            m_plan = MembershipPlan.objects.get(pk=request.POST['m_plans'])
        except Exception as e:
            print(e)
            print("Could not find information for: user pk {} - MembershipPlan pk {}".format(request.POST['userpk'], request.POST['m_plans']))
        
        stripe.api_key = settings.STRIPE_API_KEY

        paymentType = request.POST['stripeTokenType'] 
        token =  request.POST['stripeToken']
        stripe_email = request.POST['stripeEmail']

        
        # Try to create a customer
        customerId = None
        if(cur_user.customer_id == "None"):
            try:
                customer = stripe.Customer.create(
                    email = stripe_email,
                    source = token,
                    metadata = {
                        "username" : cur_user.username,
                        "pk" : cur_user.id,
                        "code" : cur_user.userid_set.all().first()
                    }
                )
                cur_user.customer_id = customer.id
                customerId = customer.id
                cur_user.save()

            except Exception as e:
                print(e)
                print('Error creating customer')
        else:
            customerId = cur_user.customer_id


        # MembershipManager 
        membership_manager = MembershipManager(cur_user.id, m_plan.id)

        if not membership_manager.valid:
            return render(request, 
                    "home/payment_result.html",
                    {
                        "isSuccessful": False,
                        "charge": None,
                        "subscription": None
                    }
                )
        

        print("Checking out via Stripe. token:{} - {} - cust_id:{}".format(token, stripe_email, customerId))
        # move tax info to database        
        subtotal, tax, stripe_tax = m_plan.price, 0.09, 0.03
        subscription, charge = None, None
        isSuccessful = False

        if(m_plan.recurring):
            # Make subscription
            sub_errors = ['incomplete', 'incomplete_expired', 'past_due', 'canceled', 'unpaid']
            subscription = stripe.Subscription.create(
                customer = customerId,
                plan = m_plan.plan_id,
                tax_percent = tax + stripe_tax + 0.01,
                metadata = {
                    "username": cur_user.username,
                    "charge_type": "Recurring Membership",
                    "product_ids": json.dumps({"plan": str(m_plan.id) }),
                    "product_info": json.dumps({"name":m_plan.name, "desc":m_plan.desc, "price":m_plan.price})
                },
            )
            cur_user.subscription_id = subscription.id
            isSuccessful = True if subscription.status not in sub_errors else False
            if(isSuccessful):
                cur_user.status = True
                cur_user.membership_type = "subscription"
                membership_manager.update_last_mem_id(subscription.id)
                membership_manager.update_remaining_days()
                membership_manager.close()
                cur_user.save()
        else:
            ## Calculate current total
            total = round((float(subtotal) * (1+stripe_tax) * (1+tax)) + 0.30, 2)*100
            # Make Charge
            charge = stripe.Charge.create(
                amount = int(total),
                currency = 'usd',
                description = 'Example charge',
                statement_descriptor = "Gym Membership",
                metadata = {
                    "username": cur_user.username,
                    "charge_type": "Membership",
                    "product_ids": json.dumps({"plan": str(m_plan.id)}),
                    "product_info": json.dumps({"name": m_plan.name, "desc": m_plan.desc, "price": m_plan.price})
                    },
                customer = customerId
            )
            if charge.paid: 
                isSuccessful = True   
                cur_user.status = True
                cur_user.membership_type = "charge"
                membership_manager.update_last_mem_id(charge.id)
                membership_manager.update_remaining_days()
                membership_manager.close()
                cur_user.save()

        return render(request, "home/payment_result.html", {"isSuccessful": isSuccessful,
                                                             "charge": charge,
                                                             "subscription":subscription})
'''
Since product payments are a soley a charge there are made with the API
'''
class ProductPaymentAnon(TemplateView):
    template_name = "home/product_payment_anon.html"

    def get(self, request):
        cart = request.session['cart']
        cart_total = request.session['cart_total']
        print(cart, cart_total)
        context = dict()
        context['cart'] = cart
        context['cart_total'] = cart_total * 1.13
        context['cart_total_stripe'] = cart_total * 100 * 1.13
        return render(request, self.template_name, context)

    def post(self, request):
        print(request.POST.keys())
        stripeToken = request.POST['stripeToken']
        stripeTokenType = request.POST['stripeTokenType']
        stripeEmail = request.POST['stripeEmail']
        cart_total = request.POST['cart_total_stripe']
        print(stripeToken, stripeTokenType, stripeEmail)
        p_id = []
        p_info = []
        for key in request.POST.keys():
            if key[:5] == "p_id_":
                p_id.append(request.POST[key])
            if key[:7] == "p_info_":
                p_info.append(request.POST[key])
        print(p_id)
        print(p_info)
        context = dict()
        context['success'] = "yee"
        context['email'] = stripeEmail
        context['payment_type'] = stripeTokenType

        stripe.api_key = settings.STRIPE_API_KEY
        print(type(cart_total), cart_total)
        cart_total = cart_total[:cart_total.find('.')]

        charge = stripe.Charge.create(
                amount=int(cart_total),
                currency='usd',
                description='Example charge',
                statement_descriptor= "Gym Membership",
                metadata={
                    "username" : "_anon",
                    "charge_type" : "Gym Product",
                    "product_ids" : json.dumps(p_id),
                    "product_info" : json.dumps(p_info)
                    },
                source=stripeToken
            )
        print(charge)
        if charge.paid:
            context['success'] = charge.status


        return render(request, self.template_name, context)
class ProductPayment(TemplateView):
    template_name = "home/product_payment.html"
    
    def get(self, request):
        return render(request, self.template_name)
    # Deprecated, product payment is handled on front end
    def post(self, request):
        product_cart = json.loads(request.POST['products'])
        # Get ids for each product
        ids = [int(pk) for pk in product_cart.keys()]
        selected = GymProduct.objects.filter(id__in=ids)
        print(selected)
        results = list()
        subtotals = list()
        for product in selected:
            tmp_qty = product_cart[str(product.id)]
            tmp_subtotal = product.price * float(tmp_qty)
            subtotals.append(tmp_subtotal) 
            tmp = {"subtotal": tmp_subtotal, 
                    "product_name": product.name,
                    "product_price": product.price,
                    "pk": product.id,
                    "qty" : tmp_qty
                    }
            results.append(tmp)

        request.session['cart'] = results
        request.session["cart_total"] = sum(subtotals)
        return render(request, self.template_name, {"products": results})

## After Sign up
class ShowUserContract(TemplateView):
    template_name = "home/show_user_contract.html"
    # signContract == 0, dont sign. Show contract and signature
    def get(self, request, userpk=-1, contractpk=-1, signContract=1):
        # Check if contract exists....
        return render(request, self.template_name, {"userpk" : userpk, "contractpk":contractpk, "signContract":signContract})


class index(TemplateView):
    template_name = "home/index.html"

class ScanCode(TemplateView):
    template_name = "home/scan_code.html"

class GymProducts(TemplateView):
    template_name = "home/gym_products.html"
class SoldGymProducts(TemplateView):
    template_name = "home/sold_gym_products.html"

class StripeCharges(TemplateView):
    template_name = "home/stripe_charges.html"
class ChargeRefund(TemplateView):
    template_name = "home/charge_refund.html"
class ShowChargeRefund(TemplateView):
    template_name = "home/show_charge_refund.html"

class StripeSubscriptions(TemplateView):
    template_name = "home/stripe_subscriptions.html"
class CanceledSubscriptions(TemplateView):
    template_name = "home/canceled_subscriptions.html"

class UserContracts(TemplateView):
    template_name = "home/user_contracts.html"

class GetImage(APIView):
    
    def get(self, request, folder=None, filename=None):
        if folder is not None and filename is not None:
            # Build video path with filename
            servefilename = "{0}/{1}".format(folder, filename)
            # Build nginx path
            nginxpath = "/protected/media/{0}".format(servefilename)
            
            response = HttpResponse()
            mimes = {
                'pdf': 'application/pdf',
                'png': "image/png",
                "jpeg": 'image/jpeg',
                "jpg": 'image/jpg'
            }
            
            ext = filename[filename.find(".")+1:]
            response["Content-Type"] = mimes[ext] if ext in mimes else "*/*"
            response["X-Accel-Redirect"] = nginxpath
            # response["Content-Disposition"] = "inline"
            response["Cache-Control"] = "no-cache, no-store, must-revalidate"
            response["Pragma"] = "no-cache"
            response["Expires"] = "0"
        
            return response
        return Response("no folder or filename given.")



class AdminPanel(TemplateView):
    template_name = "home/admin_panel.html"

class RemoveCustomerSource(TemplateView):
    template_name = "home/removeCustomerSource.html"

