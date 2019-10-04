from django.urls import path
from django.contrib.auth import views as auth_views
from . import views
app_name = "api"

urlpatterns = [
	path('memberships/', views.MembershipAPI.as_view(), name="api_memberships"),
	path('get_users/', views.UsersAPI.as_view(), name="get_users"),
	path('get_users/<int:pk>/', views.UsersAPI.as_view()),
	path('gym_products/', views.GymProductAPI.as_view(), name="API_gym_products"),
	path('gym_products/pks/', views.GymProductAPI.as_view(), name="API_gym_products"),
	path('make_product_payment/', views.StripeChargesAPI.as_view(), name="make_product_payment"),

	path('stripe_charges/cus/<int:userpk>/<str:show>/', views.StripeChargesAPI.as_view(), name="stripe_charge_API"),
	path('stripe_charges/<int:userpk>/<int:gte_time>/<int:lte_time>/<str:show>/', views.StripeChargesAPI.as_view(), name="stripe_charge_API"),

	path('stripe_subscriptions/<int:userpk>/<int:gte_time>/<int:lte_time>/<str:show>/', views.StripeSubscriptionsAPI.as_view(), name="stripe_subscriptions"),
	path('stripe_subscriptions/cus/<str:sub_id>/', views.StripeSubscriptionsAPI.as_view(), name="stripe_subscription_API"),

	path('contract/', views.ContractAPI.as_view(), name="contract_API"),
	path('contract/<int:pk>/', views.ContractAPI.as_view(), name="contract_API"),
	path('user_contract/', views.UserContractAPI.as_view(), name="user_contract_API"),
	path('user_contract/user/<int:pk>/', views.UserContractAPI.as_view(), name="user_contract_API"),
	path('user_contract/document/<int:docpk>/', views.UserContractAPI.as_view(), name="user_contract_API"),
	path('user_contract/user/<int:pk>/document/<int:docpk>/', views.UserContractAPI.as_view(), name="user_contract_API"),
	path('charge_refund/', views.ChargeRefundAPI.as_view(), name="charge_refund_API_all_charges"),
	path('remaining_days/<int:userpk>/', views.RemainingDaysAPI.as_view(), name="remaining_days_API")
]
