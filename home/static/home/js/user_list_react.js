// Gets all users and allows a search filter
// Click button to get id of item and then do something with it

// React elements will not survive page refresh
window.beforeunload = (e) => {
	console.log('Stop this');
	event.preventDefault();
	event.returnValue = '';
};

//
// User search
//
function UserRow(props){
	let id = "User"+props.id;
	return(
		<div id={id} className="text-center">
			<p className="no-click">
				{props.username}
			</p>
			<p className="no-click"> 
				{props.qr_code} 
			</p>

			<button 
				id = {props.id} 
				className = "btn btn-primary"
				onClick={props.rmBtn}
				data-toggle="tooltip"
				data-placement="bottom"
				title="Check Status"
			>
				<i className="fas fa-atlas no-click"></i>
			</button>
			<hr/>
		</div>
	);
}

class UserList extends React.Component{

	constructor(props){
		super(props);
		
		this.state = {
			users : [],
			initItems : props.users
		};
	}


	// removeProduct(ev){
	// 	if(window.confirm("User pk: "+ ev.target.id)){
	// 		console.log("Delete User" + ev.target.id);
	// 		showStatus(ev.target.id);
	// 	}
	// }


	userSelected(ev){
			// showStatus(ev.target.id);
			this.props.userSelectedCallback(ev.target.id);
	}

	searchHandler(ev){
		let query = ev.target.value.toLowerCase();
		let newItems = this.state.initItems.filter((el)=>{
			let searchBy = el.username.toLowerCase();
			return searchBy.indexOf(query) !== -1;
		})
		// hide full list of users if no query
		if(query == ""){
			this.setState({ users: [] });
		}else{
			this.setState({users: newItems});
		}
	}

	render(){
		let items = this.state.users;
		console.log(items);
		return(
			<div id="searchUsersReact">
			<div className="row">
				<div className="col-12 ">
					<input type="text" className="form-control text-center" 
						placeholder="Name" onChange={this.searchHandler.bind(this)}/>
				</div>
			</div>
			<div className="row search-results">

				<div className='col-12 text-center'>
					{
						items.map((el)=>{
							return <UserRow key={el.id}
											username={el.username}
											id={el.id}
											qr_code={el.qr_code}
											rmBtn={this.userSelected.bind(this)}/>
						})
					}
				</div>
			</div>
			</div>
		);
	}
}//end product inv list



// Add event listener to button to
//  load user list
function loadUserList(root_id, userSelectedCallback){
	getData("/api/get_users/").then(function (data){
		console.log(data);
		let root = document.getElementById(root_id);
		ReactDOM.unmountComponentAtNode(root);
		ReactDOM.render(<UserList users= {data}
						userSelectedCallback = {userSelectedCallback}/>,
						root);	
	});

}


