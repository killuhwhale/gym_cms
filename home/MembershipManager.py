from .models import *
from gym_cms import settings
import datetime
import stripe
import json

# Membership Manager

# To use: 
#   from home.MembershipManager import MembershipManager
# Script:
#	- MembershipManager(user_pk, membership_plan_pk=-1)
# Console,
#	- ./manage.py shell (runs within context of Django Project)

# Must call close() to save changes to UserMembership

#####################

# What it do
# 1. Check remaining days
# 2. Add days
# 3. Subtract days

# Init Flow
# 1. Look up User
# 2. Lazily (create if not exists) Look up UserMembership
# 3. Look up MembershipPlan if given
#  * If any of the above fails, the Membership manager will be invalid.
#     - Will not be able to alter UserMembership

#####################

# If MembershipManager is valid for current User
# Membership can use methods to add days or update days

# To do a daily update of Memberships (via cron) use update_remaining_days()

#     - This will call Stripe and retrieve the membership from stripe using last membership plan id and calculate the remaining days.

# To add days when User purchases a charge(non-recurring) Membership use add_days()
#     - allowed if user is valid and membership plan pk that was given is a membership plan representing a non recurring membership

####################

# Underlying data structure
# home.models.UserMembership
# - User, last_mem_id, remaining_days

class MembershipManager:
	def __init__(self, userpk, m_planpk = -1):
		# pks
		self.userpk = int(userpk)
		self.m_planpk = int(m_planpk)
		
		# objects
		self.user = None 	 # User model
		self.m_plan = None	 # Memberhip Plan model
		self.user_mem = None # User Membership
		
		# errors
		self.errors = dict()
		
		# flags
		self.add_days_mode = False # checked in self.check_membership_type()
		self.valid = False
		
		# init
		self.is_valid()  # checks if userpk and m_planpk are valid
		if(m_planpk != -1):
			# Check membersip plan exists in DB
			self.lookup_m_plan()

	###############################		
	# Private
	###############################

	def is_valid(self):
		# Check if user exists
		if(not self.lookup_user()):
			return False
		# Check if user has UserMembership entry in DB
		if(not self.lookup_user_membership()):
			# if not, create it
			if(not self.create_membership_entry()):
				# if not created successfully: invalid
				return False
		self.valid = True
		return True

	def lookup_user(self):
		valid_user = False
		try:
			u = User.objects.get(pk=self.userpk)
			if u is not None:
				self.user = u
				valid_user = True
		except:
			self.errors["lookup_user"] = "failed finding User obj"
		return valid_user

	def lookup_m_plan(self):
		m_plan = None
		valid_plan = False
		try:
			m_plan = MembershipPlan.objects.get(pk=self.m_planpk)
			if m_plan is not None:
				self.m_plan = m_plan
				# if user has subscription
				self.add_days_mode = not m_plan.recurring  # recurring == True => not True == False
				valid_plan = True
		except:
			self.errors["lookup_m_plan"] = "failed finding MembershipPlan obj"
		return valid_plan

	'''
		Checks if user pk has a UserMembership already.
		Returns True if UserMembership is found in DB
	'''
	def lookup_user_membership(self):
		user_mem = None  #
		has_membership = False
		try:
			user_mem = UserMembership.objects.filter(user_id=self.user.id).first()
			if user_mem is not None:
				self.user_mem = user_mem
				has_membership = True
		except:
			pass
		self.errors["lookup_user_membership"] = "failed finding UserMembership obj"
		return has_membership

	def create_membership_entry(self):
		created = False
		user_mem = UserMembership()
		user_mem.user_id = self.userpk
		user_mem.remaining_days = 0
		try:
			self.user_mem = user_mem
			created =  True
		except:
			self.errors["create_membership_entry"] = "failed creating User membership entry"
		return created
	

	###############################
	# Public
	###############################
	
	def get_remaining_days(self):
		if self.valid:
			return self.user_mem.remaining_days
		return 0

	'''
		Query Stripe with current user and membership plan pk
	'''
	def update_remaining_days(self):
		r_days = 0
		if self.valid:
			stripe.api_key = settings.STRIPE_API_KEY
			# if user has customer_id
			print("User's custId: {}".format(self.user.customer_id))
			if self.user.customer_id != "None":
				try:
					# Look up subscription from Stripe
					ts_today = datetime.datetime.now().timestamp()
					
					if self.user_mem.last_mem_id[:4] == "sub_":
						sub = stripe.Subscription.retrieve(self.user_mem.last_mem_id)
					
						# Check if current subscription is active or on trial period as defined by Stripe
						if sub.status in ["active", "trialing"]:
							# calculate remaining days by date
							r_days = calc_remaining_days(ts_today, sub.current_period_end)
							
							# Indicate trial period with negative days
							if(sub.status == "trialing"):
								r_days = -r_days
						
						# if subscription status is not active or trialing, then it is not active, leave r_days = 0 and set error msg
						elif sub.status in ["incomplete", "incomplete_expired", "past_due", "canceled", "unpaid"]:
							self.errors["current_subscription_status"] = sub.status

					# Look up charge from Stripe
					elif self.user_mem.last_mem_id[:3] == "ch_":
						# gym_cms will store the last charge_id purchased by user
						print("Getting Charge")
						charge = stripe.Charge.retrieve(self.user_mem.last_mem_id)
						print("Got charge")
						# membership plan pk in DB					
						last_m_plan_id = json.loads(charge.metadata.product_ids)['plan']
						
						# report back to tests the pk, which should be 4 for this test user
						self.errors['test_charge'] = int(last_m_plan_id)
						# membership plan from db
						last_m_plan = MembershipPlan.objects.get(pk=last_m_plan_id)
						
						# calc remaining days
						r_days = calc_remaining_days(ts_today, charge.created + days_to_ts(last_m_plan.duration))

					else:
						self.errors['no_last_membership_id'] = "last_mem_id is: {}".format(self.user_mem.last_mem_id)
				
					self.user_mem.remaining_days = round(r_days)

				except Exception as e:
					self.errors['calc_remaining_days'] = "Error calculating remaining days"

			else:
				self.errors['no_customerId'] = "cutomerId is: {}".format(self.user.customer_id)
		return r_days

	'''
		Charges only allowed to add days 
		Used after a successful payment
	'''
	def add_days(self):
		added_days = False
		if self.valid and self.add_days_mode:
			self.user_mem.remaining_days += abs(self.m_plan.duration)
			added_days = True
		else:
			self.errors["apply_m_plan"] = "Failed adding days to plan. {} -- {}".format(self.user, self.user_mem)
		return added_days

	'''
		Remove days from a user's UserMembership
	'''
	def subtract_days(self, days=1):
		sub_days = False
		if self.valid:
			self.user_mem.remaining_days -= abs(days)	
			sub_days = True
		return sub_days

	'''
		When new membership is purcahsed, save newest id
	'''
	def update_last_mem_id(self, new_id):
		updated = False
		if self.valid:
			self.user_mem.last_mem_id = new_id
			updated = True
		return updated

	def get_last_mem_id(self):
		if self.valid:
			return self.user_mem.last_mem_id
	'''
		Save data to DB, UserMembership
	'''
	def close(self):
		closed = False
		try:
			self.user_mem.save()
			closed = True
		except:
			pass
		return closed

def ts_to_days(ts):
	return ts / (60*60*24)

def calc_remaining_days(start, end):
	return ts_to_days(end - start)

def days_to_ts(days):
	return days * 24 * 60 * 60

def ts_to_date(ts):
    return datetime.datetime.fromtimestamp(ts).strftime('%Y-%m-%d %H:%M:%S')

