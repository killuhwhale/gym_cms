function ChargeItem(props){
    return(
            <tr className="table-info" >
                <td>
                    <span className="d-inline-block text-truncate"> {props.created}</span>
                </td>
                <td>
                    <span className="d-inline-block text-truncate"> {props.id}</span>
                </td>
                <td>
                    <span className="d-inline-block text-truncate"> {props.name}</span>
                </td>
                <td>
                    <span className="d-inline-block text-truncate"> {props.desc}</span>
                </td>
                <td>
                    <span className="d-inline-block text-truncate"> ${props.price}</span>
                </td>
                <td>
                    <span className="d-inline-block text-truncate"> {props.customer}</span>
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

class ChargeItemList extends React.Component{
    constructor(props){
        super(props);
        this.state = {
            charges: props.charges
        };
    }

    componentDidMount(){
        let d = $('input[id="_datepicker"]'); 
        d.daterangepicker({
            opens: 'left'
        }, (start, end, label) => {
            console.log("A new date selection was made: " + start + ' to ' + end);
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
        
        getData(`/api/stripe_charges/${this.props.user}/${startTimestamp}/${endTimestamp}/Membership/`)
        .then((data) => {
            console.log(data);
            if(data.length > 0){
                this.setState({
                    charges: data
                });
            }else{
                alert("No charges found for member!");
            }
        });
    }

    render(){
        let items = this.state.charges;
        return(
            <table className="table table-responsive text-center table-bordered table-sm"  align="center">
            <thead className="thead-dark">
            <tr>
                <th> Date<input id="_datepicker"  
                        className="text-center" type="text"/>
                </th>
                <th> Charge Id </th>
                <th> Membership </th>
                <th> Desc </th>
                <th> Price </th>
                <th> Customer ID </th>
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
                    <ChargeItem key = {el.id}
                        id = {el.id} 
                        name = {el.products.name}
                        desc = {el.products.desc}
                        price = {el.products.price}
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
                        isRefunded = {el.is_refunded} />
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
        );
    }
}


function getCharges(root, pk){
    getData(`/api/stripe_charges/cus/${pk}/Membership/`)
    .then((data) => {
        if(data.length > 0){
            ReactDOM.unmountComponentAtNode(root);
            ReactDOM.render(<ChargeItemList charges = {data} user = {pk}/>, root);
        }else{
            alert("No charges found for member!");
        }
    });
}