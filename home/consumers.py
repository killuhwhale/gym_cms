from channels.generic.websocket import AsyncWebsocketConsumer, WebsocketConsumer
from asgiref.sync import async_to_sync #Wrapper for sync code
import cv2 as cv
import time
import base64
import numpy as np
import json
import threading
import urllib.request as urllib2
from . import scanner


class CamConsumer(WebsocketConsumer):

	def connect(self):
		self.room_name = "ServerCams"
		self.room_group_name = "ServerCam"
		async_to_sync(self.channel_layer.group_add)(
				self.room_group_name,
				self.channel_name
			)
		self.accept()

	def disconnect(self, close_code):
		async_to_sync(self.channel_layer.group_discard)(
				self.room_group_name,
				self.channel_name
			)

	def receive(self, text_data=None):
		text_data = json.loads(text_data)
		print("Message Recevied \n", text_data)
		async_to_sync(self.channel_layer.group_send)(
			self.room_group_name,
			{
			'type' : 'scan_qr_code',
			'text' : text_data['url']
			}
		)
	

	def scan_qr_code(self, event):
		print("Scanning...\n", event)
		cut_beginning = len("data:image/png;base64,")
		if(len(event['text'])>cut_beginning):
			# # Get Base64 data from WebSocket as a string
			frame = event['text'][cut_beginning:]
			img = None
			print(frame[:50])
			sec_byte_array = base64.b64decode(frame)
		
			im_array = np.asarray(bytearray(sec_byte_array), dtype=np.uint8)
			img = cv.imdecode(im_array, cv.IMREAD_COLOR)
			
			scan = scanner.Scanner()
			code = scan.from_img(img)
			print("Code: {}".format(code))
			self.send(text_data=str(code))	
		else:
			self.send(text_data="False")
		# 	# Alter image previously

		# 	ret, frame = cv.imencode('.png', img)
		# 	base64_img = base64.b64encode(frame)
			
		# 	png_base64 = base64_img.decode("utf-8")
		
		# 	png_hdr = "data:image/png;base64,"
		# self.send(text_data = png_hdr + png_base64)
		


