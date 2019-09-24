function setSpinner(base_id, parent_id){
	document.querySelector(`#${base_id}`).hidden = true;
	window.sessionStorage.hiddenCharge = base_id;
	let spinner = document.createElement("div");
	spinner.setAttribute('class', "loader");
	spinner.setAttribute('id', "spinny");
	document.querySelector(`#${parent_id}_${base_id}`).appendChild(spinner);

}

function hideSpinner(parent_id){
	let base_id = window.sessionStorage.hiddenCharge;
	let spinner = document.querySelector("#spinny");
	document.querySelector(`#${parent_id}_${base_id}`).removeChild(spinner);
	document.querySelector(`#${base_id}`).hidden = false;		
}