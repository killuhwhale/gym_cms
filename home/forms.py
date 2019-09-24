from django.contrib.auth import get_user_model
from django import forms

from django.contrib.auth import authenticate

# class ChangePasswordForm(forms.Form):
#     currentPassword = forms.CharField(widget=forms.PasswordInput(attrs={'placeholder':'Current Password', "class":"text-center"}))
#     newPassword = forms.CharField(widget=forms.PasswordInput(attrs={'placeholder':'New Password', "class":"text-center"}))
#     newPasswordConfirm = forms.CharField(widget=forms.PasswordInput(attrs={'placeholder':'Confirm Password', "class":"text-center"}))

#     def clean_password(self):
#         return Clean_Password(self.cleaned_data['currentPassword'])
    
#     def password_match(self):
#         return self.cleaned_data['newPassword'] == self.cleaned_data['newPasswordConfirm']

#     def isCurrentPasswordCorrect(self, currentUsername):
#         return not (authenticate(username=currentUsername, password=self.cleaned_data['currentPassword']) == None)


class UserForm(forms.ModelForm):
    password = forms.CharField(widget=forms.PasswordInput)
    
    class Meta:
        model = get_user_model()
        fields = ['username', 'password']

    def clean_password(self):
        return Clean_Password(self.cleaned_data['password'])





def Clean_Password(password):
    hasChar = False
    hasNum = False
    if len(password) < 8:
        raise forms.ValidationError("Password must be 8 characters long...")
    for c in password:
        print(type(c))
        try:
            print(int(c))
        except:
            print("str")
        if(type(c) == str):
            hasChar = True
    
        try:
            if(int(c) > -1 or int(c) < 10):
                hasNum = True
        except:
            print("Cannot convert to int")
    if(not hasChar or not hasNum):
        print("Must contain letters and numbers...")
        raise forms.ValidationError("Must contain letters and numbers")


    # Always return a value to use as the new cleaned data, even if
    # this method didn't change it.
    return password