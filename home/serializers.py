from rest_framework import serializers
from decimal import Decimal
import stripe
from .models import *
import json
from home.MembershipManager import MembershipManager 

class UserSerializer(serializers.Serializer):
	id = serializers.IntegerField()
	username = serializers.CharField(max_length=50)
	qr_code = serializers.SerializerMethodField()
	qr_img = serializers.SerializerMethodField()
	remaining_days = serializers.SerializerMethodField()
	has_agreement = serializers.SerializerMethodField()
	customer_id = serializers.CharField()

	# instance == User instance
	def get_qr_code(self, instance):
		# Get userid_set
		userid = instance.userid_set.all()
		if(userid):
			return userid[0].qr_code
		return None

	def get_has_agreement(self, instance):
		uc = UserContract.objects.filter(user_id=instance.id, contract_id = 1)
		if(len(uc) > 0):
			return  True
		return False

	def get_qr_img(self, instance):
		# Get userid_set
		userid = instance.userid_set.all()
		if(userid):
			if(userid[0].qr_img):
				# print(userid[0].qr_img.path, dir(userid[0].qr_img))
				# /home/kplusplus/workspace_p36/virtual/gym_cms/media/qr_codes/qrcodes_FeXMkRq
				search_str = "/media/qr_codes/"
				i = userid[0].qr_img.path.find(search_str) + len(search_str)
				return userid[0].qr_img.path[i:]
		return None

	def get_remaining_days(self, instance):
		# return MembershipManager(instance.id).get_remaining_days()
		# Daily Server Check Update each users status. using membership manager
		user_mem = instance.usermembership_set.all()
		if(user_mem):
			return user_mem[0].remaining_days
		return 0

class MembershipSerializer(serializers.Serializer):
	id = serializers.IntegerField()
	name = serializers.CharField(max_length=100)
	desc = serializers.CharField(max_length=100)
	price = serializers.FloatField()
	recurring = serializers.CharField(max_length=10)
	plan_id = serializers.CharField(max_length=100)

class GymProductSerializer(serializers.Serializer):
	id = serializers.IntegerField()
	name = serializers.CharField()
	price = serializers.FloatField()
	sku = serializers.CharField()
	img = serializers.ImageField()

class ContractSerializer(serializers.Serializer):
	id = serializers.IntegerField()
	title = serializers.CharField()
	contract = serializers.FileField()

class UserContractSerializer(serializers.Serializer):
	id = serializers.IntegerField()
	contract = serializers.SerializerMethodField()
	signature = serializers.ImageField()
	title = serializers.SerializerMethodField()
	
	def get_title(self, instance):
		return instance.contract.title

	def get_contract(self, instance):
		return instance.contract.contract.url

class UserModelSerializer(serializers.ModelSerializer):
	class Meta:
		model = User
		fields = ["id",  "username", "customer_id"]

class ChargeSerializer(serializers.Serializer):
	id = serializers.CharField()
	amount = serializers.SerializerMethodField()
	amount_refunded = serializers.SerializerMethodField()
	created = serializers.SerializerMethodField()
	customer = serializers.CharField()
	description = serializers.CharField()
	metadata = serializers.SerializerMethodField()
	product_ids = serializers.SerializerMethodField()
	product_info = serializers.SerializerMethodField()
	source = serializers.CharField()
	outcome_type = serializers.SerializerMethodField()
	seller_message = serializers.SerializerMethodField()
	network_status = serializers.SerializerMethodField()
	last4 = serializers.SerializerMethodField()
	receipt_url = serializers.CharField()
	refunded = serializers.BooleanField()
	products = serializers.SerializerMethodField()

	def get_products(self, instance):
		try:
			return json.loads(instance.metadata.product_info)
		except:
			return "None"
	def get_product_info(self, instance):
		if("product_info" in instance.metadata.keys()):
			return instance.metadata.product_info
		return "None"
	def get_product_ids(self, instance):
		if("product_ids" in instance.metadata.keys()):
			return instance.metadata.product_ids
		return "None"
	def get_username(self, instance):
		if("username" in instance.metadata.keys()):
			return instance.metadata.username
		return "None"
	def get_amount(self, instance):
		return fmt_amt(instance.amount)
	def get_amount_refunded(self, instance):
		return fmt_amt(instance.amount_refunded)
	def get_metadata(self, instance):
		if("username" in instance.metadata.keys() and
			"charge_type" in instance.metadata.keys()):
			return {"username": instance.metadata.username,
				"charge_type": instance.metadata.charge_type}
		return {"username": "None",
				"charge_type": "None"}
	def get_outcome_type(self, instance):
		return instance.outcome.type
	def get_seller_message(self, instance):
		return instance.outcome.seller_message
	def get_network_status(self, instance):
		return instance.outcome.network_status
	def get_last4(self, instance):
		return instance.source.last4
	def get_created(self, instance):
		return ts_to_date(instance.created)

class SubscriptionSerializer(serializers.Serializer):
	username = serializers.SerializerMethodField()
	created = serializers.SerializerMethodField()
	customer = serializers.CharField()
	id = serializers.CharField()
	start = serializers.SerializerMethodField()
	tax_percent = serializers.FloatField()
	amount = serializers.SerializerMethodField()
	interval = serializers.SerializerMethodField()
	nickname = serializers.SerializerMethodField()
	products = serializers.SerializerMethodField()
	canceled_at = serializers.SerializerMethodField()
	status = serializers.SerializerMethodField()
	
	def get_status(self, instance):
		return instance['status']
	def get_canceled_at(self, instance):
		return ts_to_date(instance['canceled_at']) if instance['canceled_at'] else 0 
	def get_products(self, instance):
		try:
			return json.loads(instance['metadata']['product_info'])
		except:
			return "None"		
	def get_username(self, instance):
		print(type(instance))
		return instance['metadata']['username']
	def get_created(self, instance):
		return ts_to_date(instance['created'])
	def get_start(self, instance):
		return ts_to_date(instance['start'])
	def get_amount(self, instance):
		return fmt_amt(instance['plan']['amount'])
	def get_interval(self, instance):
		return instance['plan']['interval']
	def get_nickname(self, instance):
		return instance['plan']['nickname']

def ts_to_date(ts):
    return datetime.datetime.fromtimestamp(ts).strftime('%Y-%m-%d %H:%M:%S')
# format amount Ex: 999 => 9.99 , 4 => 0.04 , 90 => 0.90
def fmt_amt(amount):
    amt = abs(amount)
    left = amt // 100
    mod100 = amt % 100
    right = mod100 if len(str(mod100)) > 1 else "0{}".format(mod100)

    return "{}{}.{}".format("-" if amount < 0 else "", left, right)

class ProductChargeSerializer(serializers.Serializer):
	id = serializers.CharField()
	amount = serializers.SerializerMethodField()
	amount_refunded = serializers.SerializerMethodField()
	created = serializers.SerializerMethodField()
	customer = serializers.CharField()
	description = serializers.CharField()
	metadata = serializers.SerializerMethodField()
	product_ids = serializers.SerializerMethodField()
	product_info = serializers.SerializerMethodField()
	source = serializers.CharField()
	outcome_type = serializers.SerializerMethodField()
	seller_message = serializers.SerializerMethodField()
	network_status = serializers.SerializerMethodField()
	last4 = serializers.SerializerMethodField()
	receipt_url = serializers.CharField()
	refunded = serializers.BooleanField()
	products = serializers.SerializerMethodField()

	def get_products(self, instance):
		try:
			return json.loads(instance.metadata.product_info)
		except:
			print("error loadin {} into json".format(instance.metadata.product_info))

	def get_product_info(self, instance):
		if("product_info" in instance.metadata.keys()):
			return instance.metadata.product_info
		return "None"
	def get_product_ids(self, instance):
		if("product_ids" in instance.metadata.keys()):
			return instance.metadata.product_ids
		return "None"
	def get_username(self, instance):
		if("username" in instance.metadata.keys()):
			return instance.metadata.username
		return "None"
	def get_amount(self, instance):
		return fmt_amt(instance.amount)
	def get_amount_refunded(self, instance):
		return fmt_amt(instance.amount_refunded)
	def get_metadata(self, instance):
		if("username" in instance.metadata.keys() and
			"charge_type" in instance.metadata.keys()):
			return {"username": instance.metadata.username,
				"charge_type": instance.metadata.charge_type}
		return {"username": "None",
				"charge_type": "None"}
		
	def get_outcome_type(self, instance):
		return instance.outcome.type
	def get_seller_message(self, instance):
		return instance.outcome.seller_message
	def get_network_status(self, instance):
		return instance.outcome.network_status
	def get_last4(self, instance):
		return instance.source.last4
	def get_created(self, instance):
		return ts_to_date(instance.created)
