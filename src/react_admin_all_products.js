// get init data and populate Panel
function reactAdminGetProducts(root){
	getData(`/api/stripe_charges/0/0/0/all_admin_gym_product/ `)
	.then((charges) =>{
		if(charges.length < 1){
			charges = [{
				"metadata":{
					"username" : "No Products Found",
					"charge_type" : "none"
				},
				"products" : [{
					"name" : "none",
					"price" : 0,
					"qty" : "1"
				}],
				refunded : false,
				amount: "0.0"
			}];
		}
		ReactDOM.unmountComponentAtNode(root);
		console.log(charges);
		ReactDOM.render(<ProductTable charges= {charges}/>, root);
	});
}

function ProductRow(props){
	let rowStyle = (props.refunded)? "table-danger":"table-success";
	return(
			<tr className={rowStyle} >
				<td>
					<span className="d-inline-block text-truncate"> {props.created}</span>
				</td>
				<td>
					<span className="d-inline-block text-truncate"> {props.id}</span>
				</td>
				<td>
					<span className="d-inline-block text-truncate"> {props.username}</span>
				</td>
				<td>
					<span className="d-inline-block text-truncate"> {props.purchase}</span>
				</td>

				<td>
					<span className="d-inline-block text-truncate"> ${props.amount}</span>
				</td>
				<td>
					<span className="d-inline-block text-truncate"> {props.network_status}</span>
				</td>
				<td>
					<span className="d-inline-block text-truncate"> {props.last4}</span>
				</td><td>
					<span className="d-inline-block text-truncate"> <a target="_blank" href={props.receipt_url}> link</a></span>
				</td>
			</tr>
	);
}

function ProductTotalsRow(props){
	return(
		<tr>
			<td> {props.productName} </td>
			<td>
				{props.chargeCount}
			</td>
			<td>
				{props.chargeTotal}
			</td>
			<td>
				{props.refundCount}
			</td>
			<td>
				{props.refundTotal}
			</td>
		</tr>
	);
}

class ProductTable extends React.Component{
	constructor(props){
		super(props);
		this.state = {
			charges: props.charges,
			productInfo : {}
		};
		this.leftChart = null;
		this.rightChart = null;
	}


	calculateTotals(items){
		let all_products = {};

		items.map( el => {
			let {amount, metadata: {charge_type}, products, refunded} = el;
			// append new products
			products.map( product => {
				let {name, price, qty} = product;
				let status = (refunded)? "refunded" : "";
				let key = `${name}`;
				
				if(all_products.hasOwnProperty(key)){
					if(refunded){
						all_products[key].refunds.count += parseInt(qty);
						all_products[key].refunds.subtotal += price * parseInt(qty); 
					}else{
						all_products[key].charges.count += parseInt(qty);
						all_products[key].charges.subtotal += price * parseInt(qty); 
					}
				}else{

					all_products[key] = {
						"charges" :{
							"count" : (!refunded)? parseInt(qty) : 0,
							"subtotal" : (!refunded)? price * parseInt(qty) : 0
						},
						"refunds" :{
							"count" : (refunded)? parseInt(qty) : 0,
							"subtotal" :  (refunded)? price * parseInt(qty) : 0	
						}
					}
				}
			});
		});

		console.log("All Products");
		console.log(all_products);
		this.setState({productInfo: all_products});
		return all_products;
	}

	componentDidMount(){
		console.log("hello");
		let d = $('input[id="_datepicker"]'); 
		d.daterangepicker({
			opens: 'left'
		}, (start, end, label) => {
			console.log("A new date selection was made: " + start + ' to ' + end.format('YYYY-MM-DD'));
			this.updateData(start,end);

		});
		this.loadCharts();
	}


	loadCharts(){
		let data = this.calculateTotals(this.props.charges);
		this.calculateTotals(this.props.charges);
		
		let chargeTotal = [];
		let chargeCount = [];
		let refundTotal = [];
		let refundCount = [];

		Object.keys(data).map( key => {
			chargeTotal.push(data[key]['charges'].subtotal);
			refundTotal.push(data[key]['refunds'].subtotal);
			chargeCount.push(data[key]['charges'].count);
			refundCount.push(data[key]['refunds'].count);
		});

		// Charts
		let leftCtx = document.getElementById("leftChart").getContext('2d');
		let leftChart = new Chart(leftCtx, {
		    type: 'bar',
		    data: {
		    	labels: Object.keys(data),
		        datasets: [{
		            label: 'Charged',
		            data:  chargeTotal,
		            backgroundColor: "green",
		            borderWidth: 1
		        },
		        {
		            label: 'Refunded',
		            data: refundTotal,
		            backgroundColor: "red",
		            borderWidth: 1
		        }]
		    },
		    options: {
		        scales: {
		            yAxes: [{
		                ticks: {
		                    beginAtZero:true
		                }
		            }]
		        }
		    }
		});

		let rightCtx = document.getElementById("rightChart").getContext('2d');
		let rightChart = new Chart(rightCtx, {
		    type: 'doughnut',
		    data: {
		    	labels: Object.keys(data),
				datasets:[{
					label: Object.keys(data),
					data: chargeCount,
					backgroundColor:[ "green", "red"],
					borderWidth: 3,
					borderColor : "green"
				},
				{
					label: Object.keys(data),
					data: refundCount,
					backgroundColor:[ "green", "red"],
					borderWidth: 3,
					borderColor : "red"
				}]
			},
		    options: {
		    	tooltips: {
				    callbacks: {
				        label: function(item, data) {
				            return data.datasets[item.datasetIndex].label[item.index]
				                        + ": " + data.datasets[item.datasetIndex].data[item.index];
				        }
				    }
				},
				legend: {
		            display: true,
		            labels: {
		                fontColor: 'black'
		            }
		        },
				scales: {
					yAxes:[{
						ticks:{
							beginAtZero:true
						}
					}]
				}
			}
		});

		let radarCtxCount = document.getElementById("radarChartCount").getContext('2d');
		let radarChartCount = new Chart(radarCtxCount, {
		    type: 'radar',
		    data: {
		    	labels: ["Prouct 1", "Product 2", "Product 3", "Product 4"],
				datasets:[{
					label: "Dataset1-Counts-charged",
					data: chargeCount,
					backgroundColor:"rgba(0,255,0,.1)",
					borderWidth: 3,
					borderColor : "green",
					fill: "origin"
				},{
					label: "Dataset2-Counts-refunded",
					data: refundCount,
					backgroundColor:"rgba(255,0,0,.1)",
					borderWidth: 3,
					borderColor : "red"
				}]
			},
		    options: {
				legend: {
		            display: true,
		            labels: {
		                fontColor: 'black'
		            }
		        },
				scales: {
					yAxes:[{
						ticks:{
							beginAtZero:true
						}
					}]
				}
			}
		});

		let radarCtxTotals = document.getElementById("radarChartTotals").getContext('2d');
		let radarChartTotals = new Chart(radarCtxTotals, {
		    type: 'radar',
		    data: {
		    	labels: Object.keys(data),
				datasets:[{
					label: "Dataset1-Totals-charged",
					data: chargeTotal,
					backgroundColor:"rgba(0,255,0,.1)",
					borderWidth: 3,
					borderColor : "green",
					fill: "origin"
				},{
					label: "Dataset2-Totals-refunded",
					data: refundTotal,
					backgroundColor:"rgba(255,0,0,.1)",
					borderColor : "red",
					borderWidth: 3
				}]
			},
		    options: {
				legend: {
		            display: true,
		            labels: {
		                fontColor: 'black'
		            }
		        },
				scales: {
					yAxes:[{
						ticks:{
							beginAtZero:true
						}
					}]
				}
			}
		});

		this.leftChart = leftChart;
		this.rightChart = rightChart;
		this.radarChartCount = radarChartCount;
		this.radarChartTotals = radarChartTotals;
	}


	removeDataFromChart(chart){
		chart.data.datasets = [];
		chart.update();
	}

	updateRadarChartTotal(chart, data){
		chart.data.labels = Object.keys(data);
		
		let charge_data = [];
		let refund_data = [];

		Object.keys(data).map( key => {
			charge_data.push(data[key]['charges'].subtotal);
			refund_data.push(data[key]['refunds'].subtotal);
		});
		
		chart.data.datasets.push(
			{
	            label: "Charged",
	            data: charge_data,
	            backgroundColor:"rgba(0,255,0,.1)",
				borderColor : "green",
	            borderWidth: 3
	        }
		);
		chart.data.datasets.push(
			{
	            label: "Refunded",
	            data: refund_data,
	            backgroundColor:"rgba(255,0,0,.1)",
				borderColor : "red",
	            borderWidth: 3
	        }
		); 
		chart.update();
	}

	updateRadarChartCount(chart, data){
		chart.data.labels = Object.keys(data);
		
		let charge_data = [];
		let refund_data = [];

		Object.keys(data).map( key => {
			charge_data.push(data[key]['charges'].count);
			refund_data.push(data[key]['refunds'].count);
		});
		

		chart.data.datasets.push(
			{
	            label: "Charged",
	            data: charge_data,
	            backgroundColor:"rgba(0,255,0,.1)",
				borderColor : "green",
	            borderWidth: 3
	        }
		);
		chart.data.datasets.push(
			{
	            label: "Refunded",
	            data: refund_data,
	            backgroundColor:"rgba(255,0,0,.1)",
				borderColor : "red",
	            borderWidth: 3
	        }
		); 
		chart.update();
	}

	updateDoughChart(chart, data){
		let charge_data = [];
		let refund_data = [];

		Object.keys(data).map( key => {
			charge_data.push(data[key]['charges'].count);
			refund_data.push(data[key]['refunds'].count);
		});


		let labels = Object.keys(data);
		chart.data.labels = labels;
		chart.data.datasets.push(
			{
	            label: labels,
	            data: charge_data,
	            backgroundColor: ["green", "yellow", "blue", "red", "brown", "orange"],
	            borderWidth: 1
	        }
		); 
		chart.data.datasets.push(
			{
	            label: Object.keys(data).map( key => `Refunded ${key}` ),
	            data: refund_data,
	            backgroundColor: ["green", "yellow", "blue", "red", "brown", "orange"],
	            borderWidth: 1
	        }
		); 
		chart.update();
	}

	updateBarChart(chart, data){
		let charge_data = [];
		let refund_data = [];

		Object.keys(data).map( key => {
			charge_data.push(data[key]['charges'].subtotal);
			refund_data.push(data[key]['refunds'].subtotal);
		});

		chart.data.labels = Object.keys(data);
		chart.data.datasets.push(
			{
				label: "Charged",
	            data: charge_data,
	            backgroundColor: "green",
	            borderWidth: 1
	        }
		);
		chart.data.datasets.push(
			{
				label: "Refunded",
	            data: refund_data,
	            backgroundColor: "red",
	            borderWidth: 1
	        }
		); 
		chart.update();
	}

	updateData(start, end){
		let startTimestamp = start;
        let endTimestamp = end;
        if(start.hasOwnProperty("_isAMomentObject")){
            startTimestamp = start.valueOf();
        }
        if(end.hasOwnProperty("_isAMomentObject")){
            endTimestamp = end.valueOf();
        }

		getData(`/api/stripe_charges/0/${startTimestamp}/${endTimestamp}/all_admin_gym_product/`)
		.then((data) => {
			console.log(data);
			if(data.length > 0){
				console.log("Setting updated data");
				this.removeDataFromChart(this.leftChart);
				this.removeDataFromChart(this.rightChart);
				this.removeDataFromChart(this.radarChartCount);
				this.removeDataFromChart(this.radarChartTotals);
				this.setState({
					charges: data
				});
				
				let crunchedData = this.calculateTotals(data);
				this.updateBarChart(this.leftChart, crunchedData);
				this.updateDoughChart(this.rightChart, crunchedData);
				this.updateRadarChartCount(this.radarChartCount, crunchedData);
				this.updateRadarChartTotal(this.radarChartTotals, crunchedData);
			}else{
				console.log("No charges found for member!");
			}
		});
	}

	render(){
		let items = this.state.charges;
		let chargeTotal = 0;
		let refundTotal = 0;

		items.map(el => {
			if(el.refunded){
				refundTotal += parseFloat(el.amount);
			}else{
				chargeTotal += parseFloat(el.amount);
			}
		});
		
		
		
		return(
			<div className="col-12">
			<table className="table table-responsive text-center table-bordered table-sm"  align="center">
			<thead className="thead-dark">
			<tr>
				<th> Date<input id="_datepicker"  
					 	className="text-center" type="text"/>
				</th>
				<th> Charge Id </th>
				<th> Username </th>
				<th> Purchase</th>
				<th> Amount Charged* </th>
				<th> Status </th>
				<th> Last 4 </th>
				<th> Receipt </th>
			</tr>
			</thead>
			<tbody className="table-hover">
			{
			items.map((el) => {
				return(
					<ProductRow key = {el.id}
						id = {el.id} 
						purchase = {el.product_info}
						amount = {el.amount} 
						created = {el.created}
						customer = {el.customer}
						description = {el.description}
						username = {el.metadata.username}
						network_status = {el.network_status}
						last4 = {el.last4}
						receipt_url = {el.receipt_url} 
						refunded = {el.refunded} />
				)
			})
			}
			<tr>
			<td colSpan="10">
				* Taxes and fees
			</td>
			</tr>
			</tbody>
			</table>

			
			<table className="table table-responsive text-center table-bordered table-sm"  align="center">
				<thead className="thead-dark">
				<tr>
					<th> Charge Total </th>
					<th> Refund Total </th>
				</tr>
				</thead>
				<tbody className="table-hover">
					<tr key = "totalsRow">
						<td>
							{chargeTotal}
						</td>
						<td>
							{refundTotal}
						</td>
					</tr>
				</tbody>
			</table>

			<table className="table table-responsive text-center table-bordered table-sm"  align="center">
				<thead className="thead-dark">
				<tr>
					<td> Product </td>
					<td> Charged </td>
					<td> Sutotal </td>
					<td> Refunded </td>
					<td> Sutotal </td>
				</tr>
				</thead>
				<tbody className="table-hover">
						{
						Object.keys(this.state.productInfo).map( product =>{
							return(
								<ProductTotalsRow key = {product}
									productName = {product}
									chargeCount = {this.state.productInfo[product]["charges"].count}
									chargeTotal = {this.state.productInfo[product]["charges"].subtotal}
									refundCount = {this.state.productInfo[product]["refunds"].count}
									refundTotal = {this.state.productInfo[product]["refunds"].subtotal} />
							)
						})
					}
				</tbody>
			</table>

			<div className="row">
				<div className="col-6">
					<canvas id="leftChart" className="chart" width="400" height="300"></canvas>
				</div>
				<div className="col-6">
					<canvas id="rightChart" className="chart" width="400" height="300"></canvas>
				</div>
				<div className="col-6">
					<canvas id="radarChartTotals" className="chart" width="400" height="300"></canvas>
				</div>
				<div className="col-6">
					<canvas id="radarChartCount" className="chart" width="400" height="300"></canvas>
				</div>
			</div>
			</div>
		);
	}
}
