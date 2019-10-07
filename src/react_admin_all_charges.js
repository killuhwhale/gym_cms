
// get init data and populate Panel
function reactAdminGetCharges(root){
	getData(`/api/stripe_charges/0/0/0/all_admin/ `)
	.then((charges) =>{
		if(charges.length == 0){
			charges = [{
				"metadata":{
					"username" : "No Charges Found",
					"charge_type" : "none"
				},
				refunded : false,
				amount: "0.0"
			}];
		}
		ReactDOM.unmountComponentAtNode(root);
		ReactDOM.render(<ChargeTable charges= {charges}/>, root);
	});
}

function ChargeRow(props){
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

class ChargeTable extends React.Component{
	constructor(props){
		super(props);
		this.state = {
			charges: props.charges,
		};
		this.leftChart = null;
		this.rightChart = null;

	}

	calcTotalAmount(items){
		let productTotal = 0;
		let membershipTotal = 0;
		let productTotalRefund = 0;
		let membershipTotalRefund = 0;

		let productTotalCount = 0;
		let membershipTotalCount = 0;
		let productTotalRefundCount = 0;
		let membershipTotalRefundCount = 0;

		items.map((el) => {
			let {metadata: {charge_type}, amount, refunded} = el;
			amount = parseFloat(amount);
			if(charge_type =="Membership"){
				if(refunded){
					membershipTotalRefund += amount;
					membershipTotalRefundCount++;
				}else{
					membershipTotal += amount;
					membershipTotalCount++;
				}
			}
			else if(charge_type == "Gym Product"){
				if(refunded){
					productTotalRefund += amount;	
					productTotalRefundCount++;
				}else{
					productTotal += amount;
					productTotalCount++;
				}
			}
		});
		console.log(productTotal, membershipTotal, productTotalRefund, membershipTotalRefund);
		return [[productTotalCount, membershipTotalCount, productTotalRefundCount, membershipTotalRefundCount], 
				[productTotal, membershipTotal, productTotalRefund, membershipTotalRefund]];
	}

	componentDidMount(){
		console.log("hello all charges");
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

					// Charts
		let leftCtx = document.getElementById("leftChart").getContext('2d');
		let initData = this.calcTotalAmount(this.props.charges);
		let initCounts = initData[0];
		let initTotals = initData[1];
		let leftChart = new Chart(leftCtx, {
		    type: 'bar',
		    data: {
		    	labels: ["Products", "Memberships"],
		        datasets: [{
		            label: 'Charges',
		            data:  [initTotals[0], initTotals[1]],
		            backgroundColor: "green",
		            borderWidth: 1
		        },
		        {
		            label: 'Refunds',
		            data: [initTotals[2], initTotals[3]],
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
		    	labels: ["Charged", "Refunded"],
				datasets:[{
					label: ["Products", "Refunded Products"],
					data: [initCounts[0], initCounts[2]],
					backgroundColor:[ "green", "red"],
					borderWidth: 3,
					borderColor : "green"
				},
				{
					label:["Memberships", "Refunded Memberships"],
					data: [initCounts[1], initCounts[3]],
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
		console.log(rightChart);
		this.leftChart = leftChart;
		this.rightChart = rightChart;
	}


	removeDataFromChart(chart){
		chart.data.datasets = [];
		chart.update();
	}


	updateDoughChart(chart, data){
		chart.data.datasets.push(
			{
	            label: ["Products", "Refunded Products"],
	            data: [data[0], data[2]],
	            backgroundColor: [ "green", "red"],
	            borderWidth: 1
	        }
		); 
		chart.data.datasets.push(
			{
	            label: ["Memberships", "Refunded Memberships"],
	            data: [data[1], data[3]],
	            backgroundColor: [ "green", "red"],
	            borderWidth: 1
	        }
		); 
		chart.update();
	}

	updateBarChart(chart, data){
		chart.data.datasets.push(
			{
	            label: 'Charges',
	            data: [data[0], data[1]],
	            backgroundColor: "green",
	            borderWidth: 1
	        }
		); 
		chart.data.datasets.push(
			{
	            label: 'Refunds',
	            data: [data[2], data[3]],
	            backgroundColor:  "red",
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

		getData(`/api/stripe_charges/0/${startTimestamp}/${endTimestamp}/all_admin/`)
		.then((data) => {
			console.log(data);
			if(data != "False"){
				console.log("Setting updated data");
				this.removeDataFromChart(this.leftChart);
				this.removeDataFromChart(this.rightChart);
				this.setState({
					charges: data
				});
				this.updateBarChart(this.leftChart, this.calcTotalAmount(data)[1]);
				this.updateDoughChart(this.rightChart, this.calcTotalAmount(data)[0]);
			}else{
				console.log("No charges found for member!");
			}
		});
	}

	render(){
		let items = this.state.charges;
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
					<ChargeRow key = {el.id}
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
			<div className="row">
				<div className="col-6">
					<canvas id="leftChart" className="chart" width="400" height="300"></canvas>
				</div>
				<div className="col-6">
					<canvas id="rightChart" className="chart" width="400" height="300"></canvas>
				</div>
			</div>
			</div>
		);
	}
}
