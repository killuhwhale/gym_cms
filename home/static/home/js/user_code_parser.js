function parse_qr_code(code, pos){
	let pairs = code.split(',');
	if(pairs != "False"){
		return pairs[pos].split(':')[1];
	}return -2;
	
	
}

function getLocationFromQRCode(code){
	return parse_qr_code(code, 0)
}
function getGymFromQRCode(code){
	return parse_qr_code(code, 1)
}
function getIdFromQRCode(code){
	return parse_qr_code(code, 2)
}
