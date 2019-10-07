
function SubscriptionItem(props){
        let spinnerId  = `spinner_${props.id}`;
        return(
            <tbody className="table-hover">
                <tr className="table-danger">
                    <td>
                        <span className="d-inline-block text-truncate">{props.start}</span>
                    </td>
                    <td>
                        <span className="d-inline-block text-truncate">{props.id}</span>
                    </td>
                    <td>
                        <span className="d-inline-block text-truncate">{props.username}</span>
                    </td>
                    <td>
                        <span className="d-inline-block text-truncate">{props.name}</span>
                    </td>
                    <td>
                        <span className="d-inline-block text-truncate">{props.canceled_at}</span>
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
        getData(`/api/stripe_subscriptions/${this.props.user}/${startTimestamp}/${endTimestamp}/canceled/`)
        .then((data) => {
            console.log(data);
            if(data != "False"){
                console.log("Setting updated data");
                this.setState({
                    subs: data
                });
            }else{
                console.log("No charges found for member!");
            }
        });
    }


    render(){
        let items = this.state.subs;
        let key_index = 0;
        return(
            <div className = "table-responsive">
            <table className="table text-center table-bordered table-sm" key="-0" align="center">
            <thead className="thead-dark" key="-1">
            <tr key="-2">
                <th> Created<br/>
                    <input id="_datepicker"  
                     className="text-center" type="text"/>
                </th>
                <th> Sub Id </th>
                <th> Username </th>
                <th> Name </th>
                <th> Canceled </th>
                <th> Desc </th>
                <th> Price </th>
                <th> Stripe Interval </th>
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
                        canceled_at = {el.canceled_at}
                        amount = {el.amount}
                        nickname = {el.nickname}
                        interval = {el.interval}
                        name = {el.products.name}
                        desc = {el.products.desc}
                        price = {el.products.price} 
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
    getData(`/api/stripe_subscriptions/${pk}/0/0/canceled/`)
    .then((data) => {
        ReactDOM.unmountComponentAtNode(root);
        ReactDOM.render(<SubscriptionItemList subs = {data}
                            user ={pk}/>, root);
    })
    .catch((err) => {
        console.error(`%c Search User Error: ${err}`, "color: red;");
    });

}
