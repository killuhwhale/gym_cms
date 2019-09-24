from django.db import models
from django.contrib.auth.models import AbstractUser
import datetime
from gym_cms import settings
from django.db.models.signals import post_save
from django.dispatch import receiver
from rest_framework.authtoken.models import Token
from decimal import Decimal
from django.utils import timezone

class User(AbstractUser):
	photo = models.ImageField(upload_to="user_images", default='default_user.jpeg')
	DOB = models.DateField(default = datetime.date.today)
	rest_token = models.CharField(max_length=100, blank=True, null =True)
	stripe_token = models.CharField(max_length=30, default = "None")
	stripe_email = models.EmailField(default = "None@none.com")
	customer_id = models.CharField(max_length=30, default = "None")
	membership_type = models.CharField(max_length=30, default="None")
	
	def __str__(self):
		return "{} (PK:{})".format(self.username, self.id)
	
	# @receiver(post_save, sender=settings.AUTH_USER_MODEL)
	# def create_auth_token(sender, instance=None, created=False, **kwargs):
	# 	print("Token Info Below")
	# 	print(sender,instance,created)
	# 	if created:
	# 		token = Token.objects.create(user=instance)
	# 		instance.rest_token = token.key
	# 		instance.save()


class UserID(models.Model):
	user = models.ForeignKey(User, on_delete=models.CASCADE)
	qr_img = models.ImageField(upload_to="qr_codes", default='default_qr.png')
	qr_code = models.CharField(max_length=100, blank=True, null=True)

	def __str__(self):
		return "{} -- {}".format(self.user, self.qr_code)



class MembershipPlan(models.Model):
	name = models.CharField(max_length=100, default = "30 Days Membership")
	desc = models.CharField(max_length=100, default = "30 day membership recurring")
	price = models.FloatField(max_length=8, default = 25.0)
	recurring = models.BooleanField(default=False)
	duration = models.IntegerField(default=0)
	# if customer wants recurring, plan_id will be tied to customer on stripe's side
	plan_id = models.CharField(max_length=100, default = "None")

	def __str__(self):
		return "PK:{} {} - {} - ${} - subscription: {} - {}".format(self.id, self.name, self.desc, 
			self.price, self.recurring, self.plan_id)


## Only for customers month-to-month aka charge and not subscription
## Stripe will track Subscriptions and remaining days. Make API calls
## 		to check subscription status.
class UserMembership(models.Model):
	user = models.ForeignKey(User, on_delete=models.CASCADE)
	last_mem_id = models.CharField(max_length=150, default="None")
	remaining_days = models.IntegerField(default=0)

	class Meta:
		unique_together = ("id", "user")

	def __str__(self):
		return "User: {} Days left: {}".format(self.user, self.remaining_days)


class GymProduct(models.Model):
	name = models.CharField(max_length=100, default="sport drink")
	price = models.FloatField(max_length=8, default=3.99)
	sku = models.CharField(max_length=100, default="AC3EWE9VDKL")
	img = models.ImageField(upload_to="products", default='default_product.png')

	def __str__(self):
		return "({}) {} - ${} - {} - {}".format(self.id, self.name,self.price, self.sku, self.img)

class Contract(models.Model):
	contract = models.FileField(upload_to="contracts", default="user_agreement.pdf")
	title = models.CharField(max_length = 100, default = "User Agreement")
	

	def __str__(self):
		return "{}".format(self.title)


class UserContract(models.Model):
	user = models.ForeignKey(User, on_delete=models.CASCADE)
	contract = models.ForeignKey(Contract, on_delete=models.CASCADE)
	signature = models.ImageField(upload_to="contractSignatures", default='no_sig.png')

	def __str__(self):
		return "PK:{} {} for {}".format(self.id, self.contract, self.user)

	class Meta:
		unique_together = ("user", "contract")

