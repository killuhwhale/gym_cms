
function SubscriptionItem(props){
        let spinnerId  = `spinner_${props.id}`;
        let rowStyle = (props.status == "active")? "table-success":"table-info";
        return(
            <tbody className="table-hover">
                <tr className={rowStyle}>
                    <td>
                        <span className="d-inline-block text-truncate">{props.id}</span>
                    </td>
                    <td>
                        <span className="d-inline-block text-truncate">{props.username}</span>
                    </td>
                    <td>
                        <span className="d-inline-block text-truncate">{props.start}</span>
                    </td>
                    <td>
                        <span className="d-inline-block text-truncate">{props.status}</span>
                    </td>
                    <td>
                        <span className="d-inline-block text-truncate">{props.name}</span>
                    </td>
                    <td>
                        <span className="d-inline-block text-truncate">{props.desc}</span>
                    </td>
                    <td>
                        <span className="d-inline-block text-truncate">{props.price}</span>
                    </td>
                    <td>
                        <span className="d-inline-block text-truncate">{props.interval}</span>
                    </td>
                    <td><span id={spinnerId}>
                        <button className="btn btn-danger btn-sm" id={props.id} onClick={ (ev) => { props.onclick(props.id)} }>
                        Cancel</button>
                    </span></td>

                </tr>
            </tbody>
        );
    }

class SubscriptionItemList extends React.Component{
    constructor(props){
        super(props);
        this.state = {
            subs: props.subs
        };
    }

    cancelSubscription(id){
        if(confirm("Are you sure you want to cancel this subscription?")){
            setSpinner(id, "spinner");
            deleteData(`/api/stripe_subscriptions/cus/${id}/`)
            .then( (response) => {
                hideSpinner("spinner");
                if(response == "False"){
                    alert("Error deleting subscription");
                }else{
                    alert(response);
                }
                console.log(`%c Delete resp: ${response}`, "color: orange;");
            } );
        }
    }

    render(){
        let items = this.props.subs;
        let key_index = 0;
        return(
            <div className = "table-responsive">
            <table className="table text-center table-bordered table-sm" key="-0" align="center">
            <thead className="thead-dark" key="-1">
            <tr key="-2">
                <th> Sub Id </th>
                <th> Username </th>
                <th> Created </th>
                <th> Sub Status </th>
                <th> Name </th>
                <th> Desc </th>
                <th> Price </th>
                <th> Stripe Interval </th>
                <th> Cancel </th>
            </tr>
            </thead>
            {
            items.map((el) => {                 
                return(
                    <SubscriptionItem key = {key_index++}
                        id = {el.id} 
                        username = {el.username}
                        created = {el.created}
                        start = {el.start}
                        amount = {el.amount}
                        nickname = {el.nickname}
                        interval = {el.interval}
                        name = {el.products.name}
                        desc = {el.products.desc}
                        price = {el.products.price}
                        status = {el.status} 
                        onclick = {this.cancelSubscription} />
                )
            })
            }
            </table>
            </div>
        );
    }
}

function getSubscriptions(root, pk){
    getData(`/api/stripe_subscriptions/${pk}/0/0/active/`)
    .then((data) => {
        ReactDOM.unmountComponentAtNode(root);
        ReactDOM.render(<SubscriptionItemList subs = {data}/>, root);
    })
    .catch((err) => {
        console.error(`%c Search User Error: ${err}`, "color: red;");
    });

}