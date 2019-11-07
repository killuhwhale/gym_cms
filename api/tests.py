from django.test import TestCase
from rest_framework.test import APITestCase
from home.models import *
# Create your tests here.

class Test(APITestCase):
    def setUp(self):
        user1 = User.objects.create(username="test1")
        user2 = User.objects.create(username="test2")

        MembershipPlan.objects.create()  # default
        MembershipPlan.objects.create(
            name = "1 Year",
            desc = "Yearly memby",
            price = 360.0,
            recurring = False,
            duration = 365
        )

        GymProduct.objects.create(
            name = "Product 1",
            price = 5.99,
            sku = "abc1337",
        )

    def test_UsersAPI_get(self):
        resp1 = self.client.get("/api/get_users/")
        resp2 = self.client.get("/api/get_users/1/")

        self.assertEqual(len(resp1.data), 2, "Expected two users")
        self.assertEqual(resp2.data['username'], 'test1', "Expected to get user with pk 1 & username: test1")

    def test_MembershipAPI(self):
        resp1 = self.client.get("/api/memberships/")
        resp2 = self.client.get("/api/memberships/1/")

        self.assertEqual(len(resp1.data), 2, "Expected two memberships")
        print(resp2.data)
        self.assertEqual(resp2.data['duration'], 30, "Expected to get MembershipPlan with pk 1 default duration: 30 days")

    def test_GymProductAPI_get(self):
        resp1 = self.client.get("/api/gym_products/")
        self.assertEqual(len(resp1.data), 2, "Expceted two GymProducts")


        
    def test_GymProductAPI_post(self):
        resp1 = self.client.post("/api/gym_products/pks/")