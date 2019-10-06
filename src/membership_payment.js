// React def
function MembershipPackage(props){
    return (
        <div className="col-4 membership-package">
            <div className="card" >
                <div className="card-body">
                    <p> ${props.pkg_price} </p>
                    <input type="radio" id={props.pkg_name}
                        name="m_plans"  value={props.id} className="radio"/>
                    <label htmlFor={props.pkg_name} className="label">
                        {props.pkg_desc}
                    </label>
                </div>
            </div>
        </div>
    );
}

class ShowMembershipPackage extends React.Component{
    constructor(props){
        super(props);
        this.state = {
            packages: props.packages
        };
    }

    render(){
        let pkgs = this.state.packages;
        return(
            <div className="row justify-content-center">
                {
                    pkgs.map( (el)=> {
                        return <MembershipPackage key = {el.id}
                                    id = {el.id}
                                    pkg_name = {el.name}
                                    pkg_price = {el.price}
                                    pkg_desc = {el.desc} />
                    })
                }
            </div>
        );
    }

}

function showMembershipPackage(root){
    ReactDOM.unmountComponentAtNode(root);

    getData("/api/memberships/").then((data)=>{
        console.log(data);
        ReactDOM.render(<ShowMembershipPackage packages= {data}/>, root);
    });
}