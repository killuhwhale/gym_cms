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

class UserStatus(TemplateView):
    template_name = "home/user_status.html"

    def get(self, request):
        return render(request, self.template_name, {"userpk": -1})

class CreateUser(TemplateView):
    
    form_class = UserForm # forms.py
    template_name = 'home/createuserform.html'

    
    #Display blank form
    def get(self, request):
        form = self.form_class(None)
        return render(request, self.template_name, {'form': form})
    
    def post(self, request):
        form = self.form_class(request.POST)
        # @param user_agreement refers to the pk of the document
        # This is the document the user will sign upon registration.
        user_agreement = 1 
        if form.is_valid():
            #Create object to save later (does not save to DB)
            user = form.save(commit = False)
            p_match = False

            #Clean and normalized data (proper formatting)
            username = form.cleaned_data['username']
            password = form.cleaned_data['password']    
            password1 = request.POST['password_check'] 

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
                    print('Error creating user')

            # ## On a thread, create two subscriptions for a new user
            # # Website and Snapchat == Holds days left of membership etc...
            # try:
            #     kwargs ={}
            #     args = (user.id,None)
            #     mythread = _thread.start_new_thread(self.createSubs,args,kwargs)
            # except:
            #     print("Could not create user's subscriptions")

            ## Generate QR code and grab image. Display

            if user is not None and p_match:
                
                # Find python library to gnerate QR code.
                code="location:turlock,gym:19,id:{}".format(user.id)
                qr = qrcode.QRCode(
                        version=1,
                        error_correction=qrcode.constants.ERROR_CORRECT_L,
                        box_size=10,
                        border=4,
                    )
                qr.add_data(code)
                qr.make(fit=True)

                img = qr.make_image(fill_color="black", back_color="white")
                imgByteArr = io.BytesIO()
                img.save(imgByteArr, format='PNG')
                imgByteArr = imgByteArr.getvalue()
                
                userid = UserID()
                userid.user = user
                userid.qr_code = code
                userid.save()
                
                userid.qr_img.save("qrcodes", InMemoryUploadedFile(
                    ContentFile(imgByteArr),   # file 
                    None,   # field name
                    "qrcodes.png", #file name
                    "image/png", # content type
                    None, #size
                     None, #contentTypeExtra
                    ))
                return render(request, "home/show_user_contract.html", {"userpk": user.id, "contractpk": user_agreement, "signContract": 1} )

        return render(request, self.template_name, {'form': form})

class MembershipPayment(TemplateView):
    template_name = "home/membership_payment.html"

    def get(self, request, pk=-1):
        all_memberships = MembershipPlan.objects.all()
        memberships = list()
        for m in all_memberships:
            memberships.append( MembershipSerializer(m).data )
        request.session['payment_processed'] = False
        return render(request, self.template_name, {"userpk":pk, "membership_pkgs": memberships })

    def post(self, request):
        print(request)
        if("payment_processed" in request.session):
            print("Session started")
            print(request.session['payment_processed'])
            # check and toggle
            if(request.session['payment_processed']):
                #redirect
                print("Redirect")
                return render(request, "home/user_status.html", {"userpk": request.POST['userpk']})
            else:
                request.session['payment_processed'] = True
        else:
            # init 
            request.session['payment_processed'] = True
        # Check if user just came from Checkout(Stripe form)
        # If user refreshes page, send them home, do not re-process,
        # Else, toggle paymentProcessed and actually process payment
        cur_user = User.objects.get(pk=request.POST['userpk'])
        print("Current user: {}".format(cur_user))
        print(request.POST)
        ## Get Stripe form data
        stripe.api_key = settings.STRIPE_API_KEY
        paymentType = request.POST['stripeTokenType'] 
        token =  request.POST['stripeToken']
        stripe_email = request.POST['stripeEmail']

        # get plan from DB
        m_plan = MembershipPlan.objects.get(pk=request.POST['m_plans'])
        print(cur_user.id, m_plan.id)
        print(MembershipManager)
        membership_manager = MembershipManager(cur_user.id, m_plan.id)

        print("Membership manager started!")
        print("Valid: {}".format(membership_manager.valid))
        print("Errors: {}".format(membership_manager.errors))
        if not membership_manager.valid:
            return render(request, "home/payment_result.html", {"isSuccessful": False,
                                                             "charge": None,
                                                             "subscription": None})

         # Try to create a customer
        customerId = None

        if(cur_user.customer_id == "None"):
            try:
                print('Creating customer...')
                customer = stripe.Customer.create(
                    email = stripe_email,
                    source = token,
                    metadata = {
                        "username" : cur_user.username,
                        "pk" : cur_user.id,
                        "code" : cur_user.userid_set.all()[0]
                    }
                )
                print(customer)
                cur_user.customer_id = customer.id
                customerId = customer.id

            except:
                print('Error creating customer')
        else:
            customerId = cur_user.customer_id
            print("Customer ")

        print("Checking Out via Stripe. token:{} - {} - cust_id:{}".format(token, stripe_email, customerId))
        

        
        subtotal = m_plan.price
        tax = 0.09
        stripe_tax = 0.03
        subscription = None
        charge = None
        isSuccessful = False

        if(m_plan.recurring):
            #Make subscription
            sub_errors = ['incomplete', 'incomplete_expired', 'past_due', 'canceled', 'unpaid']

            subscription = stripe.Subscription.create(
                            customer=customerId,
                            plan = m_plan.plan_id,
                            tax_percent= tax+stripe_tax + 0.01,
                            metadata={
                                "username" : cur_user.username,
                                "charge_type" : "Recurring Membership",
                                "product_ids" : json.dumps( {"plan": str(m_plan.id) }),
                                "product_info" : json.dumps({"name":m_plan.name, "desc":m_plan.desc, "price":m_plan.price})
                            },
            )
            cur_user.subscription_id = subscription.id
            isSuccessful = True if subscription.status not in sub_errors else False
            if(isSuccessful):
                cur_user.status = True
                cur_user.membership_type = "subscription"
                membership_manager.update_last_mem_id(subscription.id)
                membership_manager.update_r_days(m_plan.duration)
                membership_manager.close()
                cur_user.save()
        else:
            ## Calculate current total
            total = round((float(subtotal) * (1+stripe_tax) * (1+tax)) + 0.30, 2)*100
            # Make Charge
            charge = stripe.Charge.create(
                        amount=int(total),
                        currency='usd',
                        description='Example charge',
                        statement_descriptor= "Gym Membership",
                        metadata={
                            "username" : cur_user.username,
                            "charge_type" : "Membership",
                            "product_ids" : json.dumps({"plan": str(m_plan.id) }),
                            "product_info" : json.dumps({"name":m_plan.name, "desc":m_plan.desc, "price":m_plan.price})
                            },
                        customer= customerId
            )
            
            if charge.paid: 
                isSuccessful = True   
                cur_user.status = True
                cur_user.membership_type = "charge"
                membership_manager.update_last_mem_id(charge.id)
                membership_manager.update_r_days(m_plan.duration)
                membership_manager.close()
                cur_user.save()
                print("userpk: {} ".format(cur_user.id))

        return render(request, "home/payment_result.html", {"isSuccessful": isSuccessful,
                                                             "charge": charge,
                                                             "subscription":subscription})

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

# Upon Selection, display all selected items
# Shows user qr code scanner to 
class ProductPayment(TemplateView):
    template_name = "home/product_payment.html"
    ## populates session from post request from gym prouct page
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

