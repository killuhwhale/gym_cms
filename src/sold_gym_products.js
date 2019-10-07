

function ProductSubRow(props){
    let subtotal = props.qty * props.price;
    return(
        <tr>
        <td>
            {props.name}
        </td>
        <td>
            {props.price}
        </td>
        <td>
            {props.qty}
        </td>
        <td>
            {subtotal}
        </td>
        </tr>
    );
}


function Product(props){
return(
    <tbody className="table-hover">
        <tr>
            <td>
                <span className="d-inline-block text-truncate">
                {props.created}</span>
            </td>
            <td>
                <span className="d-inline-block text-truncate">
                {props.charge_id}</span>
            </td>
            <td>
                <span className="d-inline-block text-truncate">
                {props.username}</span>
            </td>
            
            <td>
                <span className="d-inline-block text-truncate">
                ${props.amount}</span>
            </td>
            <td>
                <span className="d-inline-block text-truncate">
                    <a target="_blank" href={(props.receipt_url == "None")? "#" : props.receipt_url}>
                    link
                    </a>
                </span>
            </td>
        </tr>
        
        
        <tr>
            <th>
                Item Name
            </th>
            <th>
                Item Price
            </th>
            <th>
                Qty
            </th>
            <th>
                Subtotal
            </th>
        </tr>
            {
                props.products.map((el)=>{
                    return <ProductSubRow key = {el.name}
                                        name = {el.name}
                                        price = {el.price}
                                        qty = {el.qty} />
                })
            }
        

    </tbody>
);
}

class SoldProductList extends React.Component{
    constructor(props){
        super(props);
        this.state = {
            products: props.products
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
        getData(`/api/stripe_charges/${this.props.user}/${startTimestamp}/${endTimestamp}/Gym Product/`)
        .then((data) => {
            console.log(data);
            if(data != "False"){
                console.log("Setting updated data");
                this.setState({
                    products: data
                });
            }else{
                console.log("No charges found for member!");
            }
        });
    }

    render(){
        let items = this.state.products;
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
                <th> Member </th>
                <th> Total </th>
                <th> Receipt </th>
            </tr>
            </thead>
            {
            items.map((el) => {
                return(
                    <Product key = {el.id}
                        charge_id = {el.id} 
                        created = {el.created}
                        username = {el.metadata.username} 
                        product_info = {el.product_info}
                        products = {el.products}
                        amount = {el.amount}
                        receipt_url = {el.receipt_url} 
                        refunded = {el.refunded} />
                )
            })
            }
            </table>
            </div>
        );
    }
}

function getCharges(root, id){
    getData(`/api/stripe_charges/cus/${id}/Gym Product/`)
    .then((data) => {
        ReactDOM.unmountComponentAtNode(root);
        ReactDOM.render(<SoldProductList products= {data}
                            user = {id}/>, root);
    })
    .catch((err) => {
        console.error(`%c Search User Error: ${err}`, "color: red;");
    });     
}
