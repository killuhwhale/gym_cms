from django.contrib import admin
from .models import *
# Register your models here.


admin.site.register(User)
admin.site.register(UserID)
admin.site.register(MembershipPlan)
admin.site.register(UserMembership)
admin.site.register(GymProduct)
admin.site.register(Contract)
admin.site.register(UserContract)
