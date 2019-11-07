dog = "pet"
try:
	print(1)
	dog = "animal"
	raise Exception("lol")
	cat = "kitty"
except:
	pass
print(dog, cat)

