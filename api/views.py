from django.shortcuts import render
from rest_framework.views import APIView
from rest_framework.response import Response
from django.core.files.base import ContentFile
from home.models import *

from home.tasks import add_day, subtract_days, log_gym_product_sale
from home.serializers import *
from gym_cms import settings
from home.MembershipManager import MembershipManager

import io
import qrcode
import stripe
import json
from datetime import datetime
import base64

class UsersAPI(APIView):
    def get(self, request, pk=-1):
        if(pk==-1):
            users = User.objects.filter(is_superuser=False)
            all_users = list()
            for u in users:
                all_users.append(UserSerializer(u).data)
            return Response(all_users)
        else:
            user = User.objects.get(pk=pk)
            return Response(UserSerializer(user).data)

class MembershipAPI(APIView):
    def get(self, request, pk=-1):
        if(pk == -1):
            plans = list()
            for m in MembershipPlan.objects.all():
                plans.append(MembershipSerializer(m).data)
            return Response(plans)
        else:
            plan = MembershipPlan.objects.get(pk=pk)
            if(plan):
                return Response(MembershipSerializer(plan))
        return Response("Failed getting membership plans.")

# Products excluding memberships/ subscriptions
class GymProductAPI(APIView):
    def get(self, request, pk=-1):
        if(pk == -1):
            products = GymProduct.objects.all()
            data = list()
            for p in products:
                data.append(GymProductSerializer(p).data)
            return Response(data)

## gte_time : timestamp (miliseconds) of beginning date range
## lte_time : timestamp (miliseconds) of ending date range
## if nothing given, return range of last 30 days
def get_date_range(gte_time, lte_time):
    # seconds
    today_date = datetime.today()
    today = int(datetime.timestamp(datetime.today()))
    beginning_today = int(datetime.timestamp(datetime(today_date.year, today_date.month, today_date.day)))
    
    #convert gte_time to seconds, not ms
    print("T, BT", today, beginning_today)
    gte_time = gte_time//1000 if gte_time !=0 else beginning_today
    lte_time = lte_time//1000 if lte_time !=0 else today
    
    return gte_time, lte_time

# Get list of charges by user pk or by time created 
class StripeChargesAPI(APIView):
    def filter_charges(self, charges, show):
        c = list()
        for charge in charges.auto_paging_iter():
            #show all charges -- 
            # Some charges are created for subscriptions, do not inclue these
            # Those charges will not have metadata.
            if("charge_type" in charge.metadata.keys()):
                if(show == "all" and not charge.refunded):
                    c.append(ChargeSerializer(charge).data)
                elif(show == "refunded" and charge.refunded):
                    c.append(ChargeSerializer(charge).data)
                elif(show == "all_admin"):
                    c.append(ProductChargeSerializer(charge).data)
                elif(show == "all_admin_gym_product" and charge.metadata.charge_type == "Gym Product"):
                    c.append(ProductChargeSerializer(charge).data)
                elif(show == "Membership" and charge.metadata.charge_type == "Membership" and not charge.refunded):
                    c.append(ChargeSerializer(charge).data)
                elif(show == "Gym Product" and charge.metadata.charge_type == "Gym Product" and not charge.refunded):
                    c.append(ProductChargeSerializer(charge).data)
        return c

    def get(self, request, userpk=None, gte_time=0, lte_time=0, show="all"):
        stripe.api_key = "sk_test_fWqQzMbbfiKxEJkgJAsJeqXV"
        print(userpk, gte_time, lte_time, show)
        
        data = None

        gte_time, lte_time = get_date_range(gte_time, lte_time)
        print(ts_to_date(gte_time), ts_to_date(lte_time))
        if(userpk is not None):
            try:
                if(userpk == 0):
                    print("Admin charge request")
                    data = stripe.Charge.list(created={"gte":gte_time, "lte":lte_time})
                    print(data)
                else:
                    user = User.objects.get(pk=userpk)
                    if(user.customer_id != "None"):
                        data = stripe.Charge.list(customer=user.customer_id, created={"gte":gte_time, "lte":lte_time})
            except:            
                return Response(list())
        
        else:
            return Response(list())

        if data is not None:
            charges = self.filter_charges(data, show)
            print("Length: {}".format(len(charges)))
            return Response(charges)
        else:
            return Response(list())


    def post(self, request):
        # Get cart info
        stripe.api_key = settings.STRIPE_API_KEY
        cart = request.data["cart"]
        print("Cart: {}".format(cart))
        if(not cart):
            return Response("False")
        # [{'subtotal': 7.98, 'product_name': 'sport drink', 'product_price':  3.99, 'pk': 1, 'qty': '2'},...]
        cart_items = cart[0]
        cart_total = cart[1]
        product_ids = [c["pk"] for c in cart_items]
        product_info = [{"name":c["product_name"], "qty":c["qty"], "price":c["product_price"]} for c in cart_items]

        userpk = request.data['userpk']
        print("")
        print("Cart total: {}".format(cart_total))
        print("Cart items: {}".format(cart_items))
        print("")
        # Look Up customer id
        tax = 0.09

        cur_user = User.objects.get(pk=userpk)
        charge = stripe.Charge.create(
                amount=int(((cart_total * (1+tax) * 1.029) + 0.30) *100),
                currency='usd',
                description='Example charge',
                statement_descriptor= "Gym Product",
                metadata={
                    "username" : cur_user.username,
                    "charge_type" : "Gym Product",
                    "product_ids" : json.dumps(product_ids),
                    "product_info" : json.dumps(product_info) 

                    },
                customer= cur_user.customer_id
            )

        if charge.paid:        
            request.session.pop('cart')
            request.session.pop('cart_total')
            request.session.modified = True
            print("Logging purchase")
            # log_gym_product_sale.delay(cur_user.id, cart_items, 0.0, charge['receipt_url'], charge['id'])
            return Response("PaymentSuccessful")
        return Response("Error making payments")

# Get list of subscriptions by user pk
class StripeSubscriptionsAPI(APIView):

    def get(self, request, userpk=None, gte_time=0, lte_time=0, show="active"):
        stripe.api_key = "sk_test_fWqQzMbbfiKxEJkgJAsJeqXV"
        data = None
        gte_time , lte_time = get_date_range(gte_time, lte_time)
        
        if(userpk is not None):
            if userpk == 0:
                print("Userp 0!!!")
                data = stripe.Subscription.list(status="all", created={"gte":gte_time, "lte":lte_time})
            else:
                user = User.objects.get(pk=userpk)
                if user.customer_id != "None":
                    if(show == "active"):
                        data = stripe.Subscription.list(customer=user.customer_id, status="active")
                        if len(data['data']) < 1:
                            data = stripe.Subscription.list(customer=user.customer_id, status="trialing")
                    else:
                        data = stripe.Subscription.list(customer=user.customer_id, status="canceled",
                            created={"gte": gte_time, "lte":lte_time})
        else:
            return Response(list())
        
        subs = list()
        if data is not None:
            for sub in data.auto_paging_iter():
                subs.append(SubscriptionSerializer(sub).data)
            
            return Response(subs)
        else:
            return Response(list())

    def delete(self, request, sub_id=None):
        if(sub_id):
            stripe.api_key = "sk_test_fWqQzMbbfiKxEJkgJAsJeqXV"
            try:
                sub = stripe.Subscription.retrieve(sub_id)
                print("Deleting {}".format(sub_id))
                sub.delete(prorate=True)
                return Response("Deleted subscription: {}".format(sub_id))
            except:
                print("Error canceling subscription")
                return Response("False")        
        print("No (stripe)customer id")
        return Response("False")

class ContractAPI(APIView):
    def get(self, request, pk=-1):
        if(pk != -1):
            c = Contract.objects.get(pk=pk)
            return Response(ContractSerializer(c).data)
        contracts = Contract.objects.all()
        all_contracts = list()
        for c in contracts:
            all_contracts.append(ContractSerializer(c).data)
        return Response(all_contracts)

class UserContractAPI(APIView):
    def get(self, request, pk=-1, docpk=-1):
        uc = None
        if( (pk!=-1) and (docpk!=-1) ):
            print("Getting user specific user contract")
            uc = UserContract.objects.filter(user_id=pk, contract_id=docpk)
        elif(pk!=-1):
            uc = UserContract.objects.filter(user_id=pk)
        elif(docpk!=-1):
            uc = UserContract.objects.filter(contract_id=docpk)
        else:
            return Response("No pk given")
        
        usercontracts = list()
        for ucontract in uc:
            print(ucontract)
            usercontracts.append(UserContractSerializer(ucontract).data)
        return Response(usercontracts)

            

    def post(self, request):
        userpk = request.data['userpk']
        contractpk = request.data['contractpk']
        error = None
        png = None
        user = None
        contract = None
        try:
            user = User.objects.get(pk=userpk)
            contract = Contract.objects.get(pk=contractpk)
        except:
            error = "Cant find user or contract"
        sig = request.data['signature']
        
        fmt, imgstr = sig.split(';base64,') 
        ext = fmt.split('/')[-1] 
        try:
            png = ContentFile(base64.b64decode(imgstr), name='{}_useragreement.{}'.format(user.username, ext))
        except:
            error = "Could not create signature"
        try:            
            uc = UserContract()
            uc.user = user
            uc.contract = contract
            uc.signature = png
            uc.save()
        except IntegrityError as e:
            if(e):
                error = "Contract already saved to user: {}".format(user.username)
            else:
                error = "Failed saving contract for user: {}".format(user.username)
        if error:
            return Response(error)
        return Response("Contract Saved")

class CurrentCartSession(APIView):
    def post(self, request):
        print(request.session.keys())
        if(("cart" in request.session.keys()) and
            ("cart_total" in request.session.keys())):
            data = [request.session['cart'], 
                    request.session['cart_total']]
            return Response(data)
        return Response({"cart" : "None", "cart_total": "None"})

    def delete(self, request):
        if(("cart" in request.session.keys()) and
            ("cart_total" in request.session.keys())):
            del request.session['cart'],
            del request.session['cart_total']
            return Response("Delete successful")
        return Response("Keys not in sesssion")

# 1. Lookup charge on stripe
# 2. Calc amount to refund
# 3. Create refund object
# 4. If refund succeeded
#       - Find all gym profucts mathing charge_id and save recipt id
#       - Crrate refund object with chrage_id, refund_id, charge_amt, refund_amt, gym_product_pk
class ChargeRefundAPI(APIView):
    # Create  Refund
    def post(self, request):
        charge_id = request.data['charge_id']
        refund_percent = request.data['refund_percent']
        
        stripe.api_key = "sk_test_fWqQzMbbfiKxEJkgJAsJeqXV"
        re = None
        charge = stripe.Charge.retrieve(charge_id)
        amount = charge.amount * refund_percent
        try:
            re = stripe.Refund.create(
                charge=charge_id,
                amount=amount
            )
        except:
            print("Failed creating refund...refund already refunded")
            return Response("False")
        print("Refund: {}".format(re.status))
        if(re.status == "succeeded"):
            return Response("True")
        #refund did not succeed
        return Response("False")

class RemainingDaysAPI(APIView):
    def get(self, request, userpk=-1):
        man = MembershipManager(userpk, -1)
        return Response(man.get_remaining_days())


def ts_to_date(ts):
    return datetime.fromtimestamp(ts).strftime('%Y-%m-%d')