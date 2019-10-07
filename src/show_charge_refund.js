
function RefundItem(props){
    return(
        <tbody className="table-hover">
            <tr className="table-danger">
                <td>
                    <span className="d-inline-block text-truncate"> {props.date}</span>
                </td>
                <td>
                    <span className="d-inline-block text-truncate"> {props.charge_id}</span>
                </td>
                <td>
                    <span className="d-inline-block text-truncate"> {props.customer}</span>
                </td>
                <td>
                    <span className="d-inline-block text-truncate"> {props.products}</span>
                </td>
                <td>
                    <span className="d-inline-block text-truncate"> ${props.charge_amt}</span>
                </td>
                <td>
                    <span className="d-inline-block text-truncate"> ${props.refund_amt}</span>
                </td>
                <td>
                {
                    (props.receipt_url == "None")? "No": 
                    <span className="d-inline-block text-truncate"> <a target="_blank" href={props.receipt_url}> link</a></span>
                }
                </td>   
            </tr>
        </tbody>
    );
}

class RefundItemList extends React.Component{
    constructor(props){
        super(props);
        this.state = {
            refunds: props.refunds
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
        getData(`/api/stripe_charges/${this.props.user}/${startTimestamp}/${endTimestamp}/refunded/`)
        .then((data) => {
            console.log(data);
            if(data != "False"){
                console.log("Setting updated data");
                this.setState({
                    refunds: data
                });
            }else{
                console.log("No charges found for member!");
            }
        });
    }


    render(){
        let items = this.state.refunds;
        return(
            <div className = "table-responsive">
            <table className="table text-center table-bordered table-sm"  align="center">
            <thead className="thead-dark">
            <tr>
                <th> Date<br/>
                    <input id="_datepicker"  
                     className="text-center" type="text"/>
                </th>
                <th> Charge Id </th>
                <th> User </th>
                <th> Product Info </th>
                <th> Charge Amount </th>
                <th> Refund Amount </th>
                <th> Receipt </th>
                
            </tr>
            </thead>
            {
            items.map((el) => {
                return(
                    <RefundItem key = {el.id}
                        charge_id = {el.id} 
                        customer = {el.metadata.username}
                        date = {el.created}
                        products = {el.product_info}
                        refund_amt = {el.amount_refunded} 
                        charge_amt = {el.amount} 
                        receipt_url = {el.receipt_url} />
                    
                )
            })
            }
            </table>
            </div>
        );
    }
}


function getCharges(root, pk){
    getData(`/api/stripe_charges/cus/${pk}/refunded/`)
    .then((data) => {
        ReactDOM.unmountComponentAtNode(root);
        ReactDOM.render(<RefundItemList refunds= {data}
                            user = {pk}/>, root);
    });
}
