
const getData = (url='') => {
	return fetch(url,{
			"method" : "GET",
			"headers" : {
				"Content-Type": "application/json; charset=utf-8",
				"CSRF_TOKEN" : CSRF_TOKEN, // created in base.html
				"X-CSRFToken" : CSRF_TOKEN
			},
		})
		.then(response => response.json());
		
}


const postData = (url='', data={}) => {
	return fetch(url,{
			"method" : "POST",
			"headers" : {
				"Content-Type": "application/json; charset=utf-8",
				"CSRF_TOKEN" : CSRF_TOKEN, // created in base.html
				"X-CSRFToken" : CSRF_TOKEN
			},
			"body": JSON.stringify(data)
		})
		.then(response => response.json());
}


const deleteData = (url='') => {
	return fetch(url,{
			"method" : "DELETE",
			"headers" : {
				"Content-Type": "application/json; charset=utf-8",
				"CSRF_TOKEN" : CSRF_TOKEN, // created in base.html
				"X-CSRFToken" : CSRF_TOKEN
			}
		})
		.then(response => response.json());
}