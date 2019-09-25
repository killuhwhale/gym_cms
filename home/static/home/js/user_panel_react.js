// Given a userpk
// Return a panel with proper info for user


// User status
function UserPanel(props){
	let img_src = "/get_image/qr_codes/" + props.img_src + "/";
	console.log(`imgSrc: ${img_src}`);
	// console.log(props);
	let payment_url = "/membership_payment/" + props.id;

	let agreementStyle = (props.agreement)? {"border": "2px solid green"} : {"border": "2px solid red"} ;
	let btnColor = (props.r_days < 1) ? ( (props.r_days == 0)? "btn-danger": "btn-info" ) : "btn-success";
	btnColor = "btn " + btnColor;
		
	return(
		<div className="row" style={agreementStyle}>
			<div className="col-6">
				<span> {props.username} </span>
			</div>
			<div className="col-6">blank</div>

			<div className="col-6">
				
				<iframe src ={img_src}/>
			</div>
			<div className="col-6">
				<span className="align-middle"> 
					<a href={payment_url} className={btnColor} >
						Status: {(props.r_days < 1)? ( (props.r_days == 0)? "Inactive":" In Trial" ) : "Active"} 
					</a>
				</span>
			</div>

			<div className="col-6">
				<a href={payment_url} id="make_payment" className="btn btn-success btn-sm">
					Make Payment
				</a>
			</div>
			<div className="col-6">
				Remaining Days: <span> { (props.r_days == null)? "zer0" : props.r_days } </span>
			</div>

		</div>

	);
}

class ShowUserPanel extends React.Component{
	constructor(props){
		super(props);
		this.state = {
			userpk: props.userpk,
			user: null
		}
	}

	getUserInfo(){
		console.log("getting user info");
		console.log(this.state.userpk);
		getData(`/api/get_users/${this.state.userpk}`)
		.then( (data) => {
			this.setState({user:data});
		});
	};

	render(){
		if(this.state.user == null){
			console.log("user null");
			this.getUserInfo();
		}
		if(this.state.user != null){

			return(
				<UserPanel 
					key = {this.state.user.id}
					id = {this.state.user.id}
					username={ this.state.user.username }
					img_src = { this.state.user.qr_img }
					status = { this.state.user.status }
					r_days = { this.state.user.remaining_days }
					agreement = { this.state.user.has_agreement } />
			);
			
		}else{
			return(
				<UserPanel 
					key = {this.props.userpk}
					username="None"
					img_src = "defaultQR.png"
					status = "Inactive"
					r_days = "-inf"
					agreement = "False" />
			);
		}
	}

}