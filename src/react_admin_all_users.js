
// get init data and populate Panel
function reactAdminGetUsers(root){
	getData(`/api/get_users/`)
	.then((users) =>{
		if(users.length > 0){
			ReactDOM.unmountComponentAtNode(root);
			console.log(users);
			ReactDOM.render(<UserTable users= {users}/>, root);
		}
		else{
			alert("No users found!");
		}
	});
}

function UserRow(props){
	return(
			<tr className="table-info" >
				<td>
					<span className="d-inline-block text-truncate"> {props.id}</span>
				</td>
				<td>
					<span className="d-inline-block text-truncate"> {props.username}</span>
				</td>
				<td>
					<span className="d-inline-block text-truncate"> {props.customer_id}</span>
				</td>
				<td>
					<span className="d-inline-block text-truncate"> {props.qr_code}</span>
				</td>
				<td>
					<span className="d-inline-block text-truncate"> {props.qr_img}</span>
				</td>
				<td>
					<span className="d-inline-block text-truncate"> {props.remaining_days}</span>
				</td>
			</tr>
	)
}

class UserTable extends React.Component{
	constructor(props){
		super(props);
		this.state = {
			users: props.users
		};
	}

	render(){
		let items = this.state.users;
		return(
		<div class="table-responsive">
			<table className="table text-center table-bordered table-sm"  align="center">
			<thead className="thead-dark">
			<tr>
				<th> Id </th>
				<th> Username </th>
				<th> Customer ID </th>
				<th> QR Code </th>
				<th> QR Img </th>
				<th> Remaining Days </th>
			</tr>
			</thead>
			<tbody className="table-hover">
			{
			items.map((el) => {
				return(
					<UserRow key = {el.id}
						id = {el.id} 
						username= {el.username}
						customer_id = {el.customer_id}
						qr_code = {el.qr_code}
						qr_img = {el.qr_img} 
						remaining_days = {el.remaining_days} />
				)
			})
			}
			</tbody>
			</table>
		</div>
		);
	}
}