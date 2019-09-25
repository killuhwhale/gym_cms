from django.urls import re_path, path
from django.conf.urls import url

from . import consumers

websocket_urlpatterns = [
	url('ws/home/scan/', consumers.CamConsumer),
]