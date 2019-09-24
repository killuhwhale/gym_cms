from __future__ import absolute_import, unicode_literals
from celery.utils.log import get_task_logger
from celery import Celery, states
from celery.exceptions import Ignore
from gym_cms.celery_app import app
from .models import *
# from . import celery_signals
import time

logger = get_task_logger(__name__)


class MembershipManager:
	def __init__(self, userpk):
		self.userpk = int(userpk)
		self.user = None
		self.user_mem = None
		self.valid = True	
		if(not self.lookup_user()):			
			self.valid = False
		if(not self.lookup_user_membership()):
			if(not self.create_membership_entry()):
				self.valid = False

	def lookup_user(self):
		u = User.objects.get(pk=self.userpk)
		if(u):
			self.user = u
			return True
		return False

	def lookup_user_membership(self):
		user_mem = UserMembership.objects.filter(user=self.user.id)
		if(len(user_mem) > 0):
			user_mem = user_mem[0]
			self.user_mem = user_mem
			return True
		return False

	def create_membership_entry(self):
		user_mem = UserMembership(user=self.user, remaining_days=0)
		if(user_mem):
			self.user_mem = user_mem
			return True
		return False

	def add_days(self, days):
		self.user_mem.remaining_days += abs(days)

	def subtract_days(self, days):
		self.user_mem.remaining_days -= abs(days)		


	def close(self):
		self.user_mem.save()
		return True

@app.task(bind=True)
def add_day(self, userpk, days):
	logger.debug(type(userpk), userpk)
	manager = MembershipManager(userpk)
	if(manager.valid):
		logger.debug("tasks::add_days: adding {} Days to {}".format(days, manager.user))
		manager.add_days(days)
		manager.close()
		return True
	else:
		return False


@app.task(bind=True)
def subtract_days(self, userpk, days):
	manager = MembershipManager(userpk)
	if(manager.valid):
		manager.subtract_days(days)
		manager.close()
		return True
	else:
		return False


@app.task(bind=True)
def log_gym_product_sale(self, userpk, cart, discount, receipt_url, charge_id):
	try:
		print(receipt_url)
		for p in cart:
			print(p)
			tmp = SoldGymProduct()
			tmp.user_id = userpk
			tmp.product_id = p['pk']
			tmp.qty = p['qty']
			tmp.discount = discount
			tmp.receipt_url = receipt_url
			tmp.charge_id = charge_id
			tmp.save()
		print("Saved all sold gym proucts successfully")
	except:
		print("Failed saving gym product sale for {} with products: {}".format(user, cart))

