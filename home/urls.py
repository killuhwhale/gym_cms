from django.urls import path
from django.contrib.auth import views as auth_views
from . import views
app_name = "home"

urlpatterns = [
	path('', views.index.as_view(), name="index"),
	path('scan_code/', views.ScanCode.as_view(), name="scan_code"),
	path('create_user/', views.CreateUser.as_view(), name="create_user"),
	path('user_status/', views.UserStatus.as_view(), name="search_user_status"),
	path('user_status/<int:pk>/', views.UserStatus.as_view(), name="get_user_status"),
	path('membership_payment/', views.MembershipPayment.as_view(), name="membership_payment"),
	path('membership_payment/<int:pk>/', views.MembershipPayment.as_view(), name="user_membership_payment"),
	path('membership_payment/', views.MembershipPayment.as_view(), name="process_charge"),	
	path('gym_products/', views.GymProducts.as_view(), name="gym_products"),
	path('product_payment/', views.ProductPayment.as_view(), name="product_payment"),
	path('product_payment_anon/', views.ProductPaymentAnon.as_view(), name="product_payment_anon"),
	path('stripe_charges/', views.StripeCharges.as_view(), name="show_stripe_charge"),
	path('stripe_subscriptions/', views.StripeSubscriptions.as_view(), name="show_stripe_subscriptions"),
	path('stripe_subscriptions_canceled/', views.CanceledSubscriptions.as_view(), name="show_stripe_subscriptions_canceled"),
	path('show_user_contract/<int:userpk>/<int:contractpk>/<int:signContract>/', views.ShowUserContract.as_view(), name="contract_API"),
	path('user_contracts/', views.UserContracts.as_view(), name="user_contracts_API"),
	path('sold_gym_product/', views.SoldGymProducts.as_view(), name="sold_gym_product"),
	path('charge_refund/', views.ChargeRefund.as_view(), name="charge_refund"),
	path('show_charge_refund/', views.ShowChargeRefund.as_view(), name="show_charge_refund"),
	path('admin_panel/', views.AdminPanel.as_view(), name="admin_panel"),
	path('remove_source/', views.RemoveCustomerSource.as_view(), name="remove_source")
]