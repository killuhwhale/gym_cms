from pyzbar import pyzbar
import cv2

###########

'''
 Test program to 
 	- generate qr code from user input.
 	- read qr code and send in json details

'''

def check_QR_code(code):
	codes = ["000", "FFF"]
	return code in codes


class Scanner():
	def webcam(self):
		cap = cv2.VideoCapture(0)
		ret,img=cap.read() # bool, img (frame read correctly, frame that was read)

		# release(cap)
		while ret:
			try:
				print("scanning...")
				decoded_objs = pyzbar.decode(img)
				if(decoded_objs):
					print("Detected Barcode")
					self.release(cap)
					return str(decoded_objs[0].data.rstrip(), 'utf-8')
				ret,img=cap.read()
			except KeyboardInterrupt:
				print("Key pressed")
				self.release(cap)
				return None

	def from_file(self, path):
		im = cv2.imread(path, 0)
		decoded_objs = pyzbar.decode(im)
		if(decoded_objs):
			print("Detected Barcode")
			return str(decoded_objs[0].data.rstrip(), 'utf-8')
		else:
			return False

	def from_img(self, img):
		decoded_objs = pyzbar.decode(img)
		if(decoded_objs):
			print("Detected Barcode")
			return str(decoded_objs[0].data.rstrip(), 'utf-8')
		else:
			return False

	def release(self, cap):
		cap.release()
		cv2.destroyAllWindows()
