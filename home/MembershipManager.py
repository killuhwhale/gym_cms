from .models import *
import datetime
import stripe
import json
# 1. Check if user exists
# 2. If m_plan is given, look it up to make sure it exists
	# - Check if m_plan matches user membership_type
		# -charge => not m_plan.recurring 
		# - subscription => m_plan.recurring
# 3. Check if UserMembership() exist
	# - Create if does not exist
# Now, 
	# - self.valid will be True/False
	# - self.add_days_mode = True if m_plan is given AND is a charge membership
# If self.valid 
	# - able to get remaining days
	# - able to add days from m_plan => add_days()

## Add days to UserMembership -- charge memberships only
## Remove day from UserMembership -- charge memberships only
## Get remaining days of membership -- all memberships
## To RUN in ./manage.py shell ##
# from home.MembershipManager import MembershipManager

class MembershipManager:
	def __init__(self, userpk, m_planpk=-1):
		self.userpk = int(userpk)
		self.m_planpk = int(m_planpk)
		self.user = None 	 # User model
		self.m_plan =None	 # Memberhip Plan model
		self.user_mem = None # User Membership
		self.errors = dict()
		self.add_days_mode = False # checked in self.check_membership_type()

		self.valid = True
		# Check if user exists
		if(not self.lookup_user()):
			self.valid = False
		if(not self.lookup_user_membership()):
			if(not self.create_membership_entry()):
				self.valid = False
				
		# If given m_plan pk, allow ading days
		if(m_planpk != -1):
			# Check plan exists
			if(not self.lookup_m_plan()):
				self.valid = False
			# Check membership_type is correct
			if(self.has_membership()):
				self.valid = False
		
	def lookup_user(self):
		try:
			u = User.objects.get(pk=self.userpk)
			if(u):
				self.user = u
				return True
		except:
			self.errors["lookup_user"] = "failed finding User obj"
		return False

	def lookup_m_plan(self):
		m_plan = None
		try:
			m_plan = MembershipPlan.objects.get(pk=self.m_planpk)
			if m_plan:
				self.m_plan = m_plan
				self.add_days_mode = not m_plan.recurring
				return True
		except:
			self.errors["lookup_m_plan"] = "failed finding MembershipPlan obj"
		return False

	def lookup_user_membership(self):
		user_mem = None
		try:
			user_mem = UserMembership.objects.filter(user_id=self.user.id)
			if(len(user_mem) > 0):
				user_mem = user_mem[0]
				self.user_mem = user_mem
				return True
		except:
			self.errors["lookup_user_membership"] = "failed finding UserMembership obj"
		return False

	## Just need to check if the user has an active subscription.
	# NOthing should be done with an active subscription
	# If not subscription, process charge, add days or add subscription. 

	## Make sure membership type and m_plan are a valid match
	## 	if user is a charge membership, make sure plan is non recurring
	## if user is a subsciprtion membership, make usre plan is recurring and that the user does not have an active subscription
	def has_membership(self):
		remaining_days = self.get_remaining_days()
		if remaining_days > 1:
			self.errors['has_membership'] = "User has {} days left".format(remaining_days)
			return True
			# user membership type match and is a subscription
		return False

	def create_membership_entry(self):
		user_mem = UserMembership()
		user_mem.user_id = self.userpk
		user_mem.remaining_days = 0
		try:
			self.user_mem = user_mem
			return True
		except:
			self.errors["create_membership_entry"] = "failed creating User membership entry"
		return False
	
	def get_remaining_days(self):
		if self.valid:
			return self.user_mem.remaining_days
		return 0

	# Call stripe for details
	def update_remaining_days(self):
		r_days = 0
		if self.valid:
			stripe.api_key = "sk_test_fWqQzMbbfiKxEJkgJAsJeqXV"
			if self.user.customer_id != "None":
				if self.user_mem.last_mem_id[:4] == "sub_":
					sub = stripe.Subscription.retrieve(self.user_mem.last_mem_id)
					if sub.status in ["active", "trialing"]:
						# calculate remaining days by date
						ts_today = datetime.datetime.now().timestamp()
						remaining_time = sub.current_period_end - ts_today
						r_days = ts_to_days(remaining_time)
						# Indicate trial period with negative days
						if(sub.status == "trialing"):
							r_days = -r_days
					elif sub.status in ["incomplete", "incomplete_expired", "past_due", "canceled", "unpaid"]:
						self.errors["current_subscription_status"] = sub.status
				elif self.user_mem.last_mem_id[:3] == "ch_":
					charge = stripe.Charge.retrieve(self.user_mem.last_mem_id)
					period_start = charge.created
					last_m_plan_id = json.loads(charge.metadata.product_ids)['plan']
					last_m_plan = MembershipPlan.objects.get(pk=last_m_plan_id)
					period_end = period_start + (last_m_plan.duration*24*60*60)
					ts_today = datetime.datetime.now().timestamp()
					remaining_time = period_end - ts_today 
					r_days = ts_to_days(remaining_time)
		print("MManager::update_remaining_days:: {}".format(r_days))
		self.user_mem.remaining_days = round(r_days)
		return r_days
	
	# Charges only allowed to add days
	def add_days(self):
		if self.valid and self.add_days_mode:
			print("MemMan:: adding days: {}".format(self.m_plan.duration))
			self.user_mem.remaining_days += abs(self.m_plan.duration)
			return True
		else:
			self.errors["apply_m_plan"] = "Failed adding days to plan. {} -- {}".format(self.user, self.user_mem)
		return False

	def subtract_days(self, days=1):
		self.user_mem.remaining_days -= abs(days)	

	def update_last_mem_id(self, new_id):
		self.user_mem.last_mem_id = new_id
	def update_r_days(self, days):
		self.user_mem.remaining_days += days

	def close(self):
		print("Closing manager")
		self.user_mem.save()
		return True

def ts_to_days(ts):
	return ts / (60*60*24)

def ts_to_date(ts):
    return datetime.datetime.fromtimestamp(ts).strftime('%Y-%m-%d %H:%M:%S')