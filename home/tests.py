from django.test import TestCase
from .MembershipManager import MembershipManager, ts_to_days, days_to_ts, calc_remaining_days
from .models import *
from .forms import *

import stripe

# Create your tests here.

# helper
def get_user_membership_manager(username, membership_plan_pk = -1):
    user = User.objects.filter(username=username).first()
    man = None

    # if user is not in database, use 0 zero for user id
    if user is not None:
        man = MembershipManager(user.id, membership_plan_pk)
    else:
        man = MembershipManager(0, membership_plan_pk) 
    return man


class MembershipManagerTest(TestCase):
    def setUp(self):
        
        # re-create test users from dev database

        # test charge user 
        c_user = User.objects.create_user(username="charge_tester", password="password11")
        c_user.customer_id = "cus_Eqqz5IXiVOs7ba"
        c_user.save()

        # test subscription user
        s_user = User.objects.create_user(username="sub_tester", password="password11")
        s_user.customer_id = "cus_EqqsZXm4IG0IMP"
        s_user.save()
        
        # test charge membership
        c_user_membership = UserMembership()
        c_user_membership.user_id = c_user.id
        c_user_membership.last_mem_id = "ch_1EN9HHGmVYkbsBQwXx0OltFR"
        c_user_membership.save()

        # test subscription membership
        s_user_membership = UserMembership()
        s_user_membership.user_id = s_user.id
        s_user_membership.last_mem_id = "sub_EsHhMvXN1sL5ru"
        s_user_membership.save()

        # membership default plan: charge membership
        # 30 day membership, $25
        MembershipPlan.objects.create()

    
    # MembershipManager will be valid as long as user
    def test_is_valid(self):
        c_user = User.objects.get(pk=1)
        s_user = User.objects.get(pk=2)
        charge_plan = MembershipPlan.objects.get(pk=1)
        
        man = get_user_membership_manager("charge_tester")
        
        self.assertEqual(man.valid, True)

        man = get_user_membership_manager("charge_tester", charge_plan.id)
        self.assertEqual(man.valid, True)

        man = get_user_membership_manager("sub_tester", charge_plan.id)
        self.assertEqual(man.valid, True)

        man = get_user_membership_manager("sub_tester", charge_plan.id)
        self.assertEqual(man.valid, True)

        man = get_user_membership_manager("sub_tester", 1337)
        self.assertEqual(man.valid, True)

        man = get_user_membership_manager("kN0tr331", charge_plan.id)
        self.assertEqual(man.valid, False)


    '''
        Test network connection w/ Stripe
        All Tests:   - needs customerId
        Test Charge: - needs membership plan pk

        Method: update_remaining_days, checks stripes api for test user which were created
           using test users with the development database. Part of update_remaining_days get the membership id from the Stripe metadata
           This metadata is storing pks of membershiip plans that are stored on the dev DB. Therefore, the charge test checks for the 
           membership plan id to be 4 which is what is expected for this test user. 
    '''
    def test_update_remaining_days(self):
        c_man = get_user_membership_manager("charge_tester")
        s_man = get_user_membership_manager("sub_tester")
        
        c_man.update_remaining_days()
        self.assertEqual('calc_remaining_days' in c_man.errors, True) # error because metadata product id doesnt exist in test database, only in dev
        self.assertEqual('test_charge' in c_man.errors, True)
        self.assertEqual(c_man.errors['test_charge'], 4)
        self.assertEqual('no_last_membership_id' in c_man.errors, False)
        self.assertEqual('no_customerId' in c_man.errors, False)
        
        s_man.update_remaining_days()
        self.assertEqual('calc_remaining_days' in s_man.errors, False)
        self.assertEqual('no_last_membership_id' in s_man.errors, False)
        self.assertEqual('no_customerId' in s_man.errors, False)

    '''
        Test cases:
        1. Ensure add_days functions with valid MembershipPlan id
        2. Ensure data committed to db
        3. Ensure days are not added with invalid MembershipPlan id

        4. Ensure subscription user is not adding days to membership
    '''

    def test_add_days(self):
        plan = MembershipPlan.objects.all().first()
        c_man = get_user_membership_manager("charge_tester", plan.id)
        s_man = get_user_membership_manager("sub_tester")

        # T1
        # get_remaining_days will check current member variables, not actual database 
        init_remain = c_man.get_remaining_days()
        self.assertEqual(c_man.add_days(), True, "added days:  False, expected True")
        remain = c_man.get_remaining_days()
        self.assertEqual(remain, init_remain + plan.duration, "{} and {} do not match".format(remain, init_remain + plan.duration))
        # save changes to database
        c_man.close()
        # clear reference to test user
        
        # T2
        del c_man
        # re init charge user
        c_man = get_user_membership_manager("charge_tester", plan.id)
        init_remain = c_man.get_remaining_days()
        # check that changes were commited to db
        self.assertEqual(init_remain, remain, "{} and {} do not match".format(init_remain, remain))

        # T3
        # clear reference to test user
        del c_man
        # re init charge user: check with invalid membership plan
        c_man = get_user_membership_manager("charge_tester", plan.id)

        # T4
        self.assertEqual(s_man.add_days(), False, "added_days: True, expected False")


    def test_subtract_days(self):
        c_man = get_user_membership_manager("charge_tester")
        s_man = get_user_membership_manager("sub_tester")

        init_remain = c_man.get_remaining_days()

        c_man.subtract_days(10)

        remain = c_man.get_remaining_days()
        self.assertEqual(init_remain - 10, remain, "Initital + 10 {} does not match remaining days: {}".format(init_remain, remain))

    def test_update_last_mem_id(self):
        c_man = get_user_membership_manager("charge_tester")
        last_id = c_man.get_last_mem_id()
        c_man.update_last_mem_id("n3w_1Dw")
        new_id = c_man.get_last_mem_id()
        self.assertNotEqual(last_id, new_id, "Expected different ids: {} - {}".format(last_id, new_id))

    def test_helper_methods(self):
        days = 10
        ts = days *24 * 60 * 60
        self.assertEqual(ts_to_days(ts), days, "Timestamp Not Equal to days")
        self.assertEqual(days_to_ts(days), ts, "Days Not Equal to timestamp")

    # def test_PurchaseMembership(self):
    #     plan = MemerbshipPlan.objects.all().first()
    #     data = dict()
    #     data['username'] = "test_user"
    #     data['password'] = "password11"
    #     data['password_check'] = "password11"
    #     self.client.post("/create_user/", data)
        
    #     user = User.objects.filter(username='test_user').first()

class ViewsTest(TestCase):
    def setUp(self):
        # title: User Agreement - contract: user_agreement.pdf
        Contract.objects.create()
        # name: 30 Days Membership - price: 25.0 - duration: 30 - recurring: False
        MembershipPlan.objects.create()
        # name: sport_Drink - price 3.99 - sku: AC3EWE9VDKL - img: default_product.jpeg
        GymProduct.objects.create()
        User.objects.create(username="default")

    def test_UserStatus(self):
        '''
        path('user_status/', views.UserStatus.as_view(), name="search_user_status"),
        path('user_status/<int:pk>/', views.UserStatus.as_view(), name="get_user_status"),
        '''
        resp = self.client.get('/user_status/')
        self.assertEqual(resp.context['userpk'], -1)

        resp = self.client.get('/user_status/1/')
        self.assertEqual(resp.context['userpk'], 1)

    def test_CreateUser_get(self):
        resp = self.client.get("/create_user/")        
        self.assertEqual(type(UserForm()), type(resp.context['form']), "Form not valid")

    def test_CreateUser_post(self):
        data = dict()
        data['username'] = "tester"
        data['password'] = "password11"
        data['password_check'] = "password11"

        resp = self.client.post("/create_user/", data)
        
        self.assertEqual(resp.context['userpk'], 1, "Expected user to have pk 1, failed to create user")
        self.assertEqual(resp.context['contractpk'], 1, "Expected contract pk to be 1")
        self.assertEqual(resp.context['signContract'], 1, "Expected to sign contract")

        new_user = User.objects.filter(username="tester").first()
        self.assertEqual(new_user.username, "tester", "User w/ username tester not found: {}".format(new_user))

        # check UserID was created for new user, qr code
        new_user_id = UserID.objects.filter(user_id = new_user.id).first()
        self.assertEqual(new_user_id.user.username, "tester", "UserID not found for tester")

    def test_MembershipPayment_get(self):
        resp = self.client.get("/membership_payment/")
        # view should have a context containing all membership plan objects
        self.assertEqual(len(resp.context['membership_pkgs']), 1, "Expected 1 default membership package")
        # default membership plan plan_id is 'None'
        self.assertEqual(resp.context['membership_pkgs'][0]['plan_id'], 'None', "Expceted memebrship to have a plan_id of str(None)")

    def test_MembershipPayment_post(self):
        '''
        Create user
        Simulate Stripe form submission
        Check that user has correct remaining days with MembershipManager
        '''
        stripe.api_key = "sk_test_fWqQzMbbfiKxEJkgJAsJeqXV"
        
        data = dict()
        data['username'] = "tester"
        data['password'] = "password11"
        data['password_check'] = "password11"

        self.client.post("/create_user/", data)
        user = User.objects.filter(username="tester").first()
        plan = MembershipPlan.objects.get(pk=1)
        man = get_user_membership_manager("tester", plan.id)
        init_r_days = man.get_remaining_days()

        token = stripe.Token.create(
          card={
            "number": "4242424242424242",
            "exp_month": 10,
            "exp_year": 2020,
            "cvc": "271",
          },
        )

        data = dict()
        data['userpk'] = user.id
        data['m_plans'] = plan.id
        data['stripeTokenType'] = "card"
        data['stripeToken'] = token['id']
        data['stripeEmail'] = "c@g.com"
        resp = self.client.post("/membership_payment/", data)
        
        # re-init manager
        del man
        man = get_user_membership_manager("tester", plan.id)
        cur_r_days = man.get_remaining_days()
        self.assertNotEqual(init_r_days, cur_r_days, "Expected remaining days to be different {} - {}".format(init_r_days, cur_r_days))
        self.assertEqual(resp.context['isSuccessful'], True, "Stripe transaction is not successful")

    def test_ProductPayment_get(self):
        resp = self.client.get("/product_payment/")
        print(resp)
        print(dir(resp))
        self.assertEqual(resp.status_code, 200, "Request not successful: {}".format(resp.status_code))

    def test_ShowUserContract_get(self):
        user = User.objects.filter(username="default").first()
        contract = Contract.objects.all().first()

        resp = self.client.get("/show_user_contract/{}/{}/1/".format(user.id, contract.id))
        self.assertEqual(
            resp.context['userpk'],
            user.id,
            "User returned is not the one sent in request. Req: {} - Resp: {}".format(user.id, resp.context['userpk'])
        )





