
// get init data and populate Panel
function reactAdminGetSubs(root){
	getData(`/api/stripe_subscriptions/0/0/0/all_admin/ `)
	.then((subs) =>{
		if(subs.length == 0){
			subs = [{
				"id" : -1,				
				"username" :"No Subscriptions Found",
				"amount": "0",
				"interval": "Eternity",
				"status": "Son"
			}]
		}
		ReactDOM.unmountComponentAtNode(root);
		console.log(subs);
		ReactDOM.render(<SubscriptionTable subs= {subs}/>, root);
	});
}

function SubRow(props){
	let rowStyle = (props.status == "canceled")? "table-danger":
					(props.status == "trialing")? "table-info" :
					(props.status == "active")? "table-success":
					"table-warning";
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
					<span className="d-inline-block text-truncate"> {props.products}</span>
				</td>

				<td>
					<span className="d-inline-block text-truncate"> ${props.amount}</span>
				</td>
				<td>
					<span className="d-inline-block text-truncate"> {props.status}</span>
				</td>
				<td>
					<span className="d-inline-block text-truncate"> {props.customer}</span>
				</td><td>
					<span className="d-inline-block text-truncate">{props.interval}</span>
				</td>
			</tr>
	);
}

class SubscriptionTable extends React.Component{
	constructor(props){
		super(props);
		this.state = {
			subs: props.subs,
		};
		this.leftChart = null;
		this.rightChart = null;

	}
	componentDidMount(){
		let d = $('input[id="_datepicker"]'); 
		d.daterangepicker({
			opens: 'left'
		}, (start, end, label) => {
			this.updateData(start,end);
		});
		this.loadCharts();
	}

	calcTotalAmount(items){
		let intervals = {};
		let statusSet = new Set();
		// collect data by interval, tally count and sum totals
		// {
		// 	interval1:{
		// 		status1 : {
		// 			count : a,
		// 			total : aa
		// 		},
		// 		status2 : {
		// 			count : a1,
		// 			total : aa1
		// 		},
		// 		...
		// 	},
		// 	interval2 : {
		// 		status2 : {
		// 			count : z,
		// 			total : zz
		// 		},
		// 		status3 : {
		// 			count : z1,
		//			total : zz1
		// 		}
		// 	}
		// }
		// Problem: Each interval may not have the same statuses. Which makes generating uniform datasets not so straightforward.
		// Process data and create a dict of intervals, each ineral should be a dict of lists.

		// labels = [status1. status 2. status3]
		// interval1 = {				   ----> dataset
				// counts =  [a, a1, 0],   ----> list of data for a bar graph 
				// totals = [aa, aa1, 0]   ----> list of data for a bar graph
		// }
		// interval2 = {
				// counts =  [0, z, zz],
				// totals = [0, zz, zz1]
		// }
		items.map((el) => {
			let {amount, interval, status} = el;
			let key = `${interval}`;
			statusSet.add(status);
			if(intervals.hasOwnProperty(key)){
				if(intervals[key].hasOwnProperty(status)){
					intervals[key][status].count++;
					intervals[key][status].total += parseFloat(amount);
				}else{
					intervals[key][status] = {
						"count" : 1,
						"total" : parseFloat(amount) 
					};	
				}
			}else{
				// Track statuses
				
				intervals[key] = {};
				intervals[key][status] = {
						"count" : 1,
						"total" : parseFloat(amount) 
				};
			}
		});
		let finalDataset = {};
		// For each interval
		Object.keys(intervals).map( interval => {
			let intervalCounts = [];
			let intervalTotals = [];
			// For each status
			statusSet.forEach( status => {
				if(intervals[interval].hasOwnProperty(status)){
					intervalCounts.push(intervals[interval][status].count);
					intervalTotals.push(intervals[interval][status].total);
				}else{
					intervalCounts.push(0);
					intervalTotals.push(0);
				}
			});
			finalDataset[interval] = {
				"counts" : intervalCounts,
				"totals" : intervalTotals
			}

		} );
		return [[...statusSet], finalDataset];
	}

	loadCharts(){
		// Charts
		let leftCtx = document.getElementById("leftChart").getContext('2d');
		let intervals = this.calcTotalAmount(this.props.subs);
		let initTotal = Object.keys(intervals).map( key => intervals[key].total );
		let initCount = Object.keys(intervals).map( key => intervals[key].count );

		let leftChart = new Chart(leftCtx, {
		    type: 'bar',
		    data: {
		    	labels: ['active', 'trials', 'canceled', 'unpaid', "incomplete", "incomplete_expired"] ,
		        datasets: [{
		            label: 'Subscriptions',
		            data: initTotal,
		            backgroundColor: [ "green", "blue", "yellow", "red", "orange", "grey"],
		            borderWidth: 1
		        }]
		    },
		    options: {
		    	maintainAspectRatio : false,
		    	aspectRatio : .01,
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
		    	labels: Object.keys(intervals),
				datasets:[{
					data: Object.keys(intervals).map( key => intervals[key].count ),
					backgroundColor: [ "green", "red", "blue", "yellow"],
					borderWidth: 3,
					borderColor : "green"
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
		this.leftChart = leftChart;
		this.rightChart = rightChart;
	}


	removeDataFromChart(chart){
		chart.data.labels = [];
		chart.data.datasets = [];
		chart.update();
	}

	updateBarChart(chart, data){
		console.log("Updating bar chart");
		console.log(data);
		let labels = data[0];
		data = data[1];
		chart.data.labels = labels;
		Object.keys(data).map( interval => {

			chart.data.datasets.push({
		            label: interval,
		            data: data[interval].totals,
		            backgroundColor: [ "green", "blue", "yellow", "red", "orange", "grey"],
		            borderWidth: 1
		        });
		});

		chart.update();
	}

	updateDoughChart(chart, data){
		console.log("Updating bar chart");
		console.log(data);
		let labels = data[0];
		data = data[1];
		chart.data.labels = labels;
		Object.keys(data).map( interval => {
			console.log("Tester");
			console.log(labels.map(status => `${interval}_${status}`));

			chart.data.datasets.push({
		            label: labels.map(status => `${interval}_${status}` ),
		            data: data[interval].counts,
		            backgroundColor: [ "green", "blue", "yellow", "red", "orange", "grey"],
		            borderWidth: 1
		        });
		});

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

		getData(`/api/stripe_subscriptions/0/${startTimestamp}/${endTimestamp}/all_admin/`)
		.then((data) => {
			if(data != "False"){
				this.removeDataFromChart(this.leftChart);
				this.removeDataFromChart(this.rightChart);
				this.setState({
					subs: data
				});
				this.updateBarChart(this.leftChart, this.calcTotalAmount(data));
				this.updateDoughChart(this.rightChart, this.calcTotalAmount(data));
			}else{
				console.log("No charges found for member!");
			}
		});
	}

	render(){
		let items = this.state.subs;
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
				<th> Customer </th>
				<th> Interval </th>
			</tr>
			</thead>
			<tbody className="table-hover">
			{
			items.map((el) => {
				return(
					<SubRow key = {el.id}
						created = {el.created}
						id = {el.id} 
						username = {el.username}
						products = {JSON.stringify(el.products)}
						amount = {el.amount} 
						status = {el.status}
						customer = {el.customer}
						interval = {el.interval} />
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
					<canvas id="leftChart" className="chart" width="1" height="1"></canvas>
				</div>
				<div className="col-6">
					<canvas id="rightChart" className="chart" width="1" height="1"></canvas>
				</div>
			</div>
			</div>
		);
	}
}
