
function ChargeItem(props){
    let spinnerId  = `spinner_${props.id}`;
    console.log("lol"+props.products);
    return(
        <tbody className="table-hover">
            <tr>
                <td>
                    <span className="d-inline-block text-truncate"> {props.created}</span>
                </td>
                <td>
                    <span className="d-inline-block text-truncate"> {props.id}</span>
                </td>
                <td>
                    <span className="d-inline-block text-truncate"> {props.info}</span>
                </td>
                <td>
                    <span className="d-inline-block text-truncate"> ${props.amount}</span>
                </td>

            
                <td>
                    <span className="d-inline-block text-truncate"> {props.message}</span>
                </td>

                <td>
                    <span className="d-inline-block text-truncate"> {props.network_status}</span>
                </td>
                <td>
                    <span className="d-inline-block text-truncate"> {props.last4}</span>
                </td>
                <td>
                    <span className="d-inline-block text-truncate"> <a target="_blank" href={props.receipt_url}> link</a></span>
                </td>
                <td>
                    <span className="d-inline-block text-truncate " id={spinnerId}>
                        <button onClick= { () => {props.refundCharge(props.id)} } className="btn btn-danger btn-sm" id={props.id}> 
                            Refund
                        </button>
                    </span>
                </td>
            </tr>
        </tbody>
    );
}



class ChargeItemList extends React.Component{
    constructor(props){
        super(props);
        this.state = {
            charges: props.charges
        };
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
        getData(`/api/stripe_charges/${this.props.user}/${startTimestamp}/${endTimestamp}/all/`)
        .then((data) => {
            console.log(data);
            if(data != "False"){
                console.log("Setting updated data");
                this.setState({
                    charges: data
                });
            }else{
                console.log("No charges found for member!");
            }
        });
    }

    refundCharge(charge_id){
        console.log(`%c Refunding charge: ${charge_id}`, "color: yellow;");
        // Show Spinner
        setSpinner(charge_id, "spinner");

        postData(`/api/charge_refund/`, {"charge_id":charge_id, "refund_percent": 1.0})
        .then((data) => {
            console.log(data);
            // Hide Spinner
            hideSpinner("spinner"); 
            if(data==="False"){
                alert("Failed making refund, may already be refunded");
            }else if(data==="True"){
                alert("Charge refunded successfully!");
            }
        });
    }

    render(){
        let items = this.state.charges;
        return(
            <table className="table text-center table-responsive table-bordered table-sm"  align="center">
            <thead className="thead-dark">
            <tr>
                <th> Date<br/>
                    <input id="_datepicker"  
                     className="text-center" type="text"/>
                </th>
                <th> Charge Id </th>
                <th> Product Info </th>
                <th> Amount </th>
                <th> Message </th>
                <th> Status </th>
                <th> Last 4 </th>
                <th> Receipt </th>
                <th> Refund </th>
            </tr>
            </thead>
            {
            items.map((el) => {
                return(
                    <ChargeItem key = {el.id}
                        id = {el.id} 
                        info = {el.product_info}

                        amount = {el.amount} 
                        created = {el.created}
                        customer = {el.customer}
                        description = {el.description}
                        username = {el.metadata.username}
                        charge_type = {el.metadata.charge_type}
                        type = {el.outcome_type}
                        message = {el.seller_message}
                        network_status = {el.network_status}
                        last4 = {el.last4}
                        receipt_url = {el.receipt_url}
                        isRefunded = {el.is_refunded} 
                        refundCharge = {this.refundCharge}/>
                )
            })
            }
            </table>
        );
    }
}

function getCharges(root, pk){
    getData(`/api/stripe_charges/cus/${pk}/all/`)
    .then((data) => {
        console.log(`data: ${data}`);
        if(data.length > 0){
            ReactDOM.unmountComponentAtNode(root);
            console.log(data);
            ReactDOM.render(<ChargeItemList charges= {data}
                                    user = {pk}/>, root);
        }else{
            alert("No charges found for member!");
        }
    })
    .catch((err) => {
        console.error(`%c Search User Error: ${err}`, "color: red;");
    });
}
