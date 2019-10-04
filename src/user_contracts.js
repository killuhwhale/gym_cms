function DocuBtn(props){
    let btnColor = (props.userHas)? "btn-outline-success": "btn-outline-danger";
    let onFileText = (props.userHas)? " - On File" : " - Not on File";

    let classes = `btn ${btnColor}`;
    return(
        <a href={props.link} target="_blank" className={classes}>
            {props.title} {onFileText} 
        </a>
    );
}

class UserDocuments extends React.Component{
    constructor(props){
        super(props);
        console.log("recieved:");
        console.log(props.contractData);
        this.state = {
            allDocs : props.contractData,
            userDocs : []
        };
        this.getAllDocuments();
    }

    getAllDocuments(){
        getData(`/api/user_contract/user/${this.props.userid}/`)
        .then((userContracts)=>{
            userContracts = userContracts.map(({title}) => title);
            this.setState({
                userDocs: userContracts
            });
        })
        .catch((err)=>{
            console.log(err);
        });
    }

    render(){
        let items = this.state.allDocs;
        let partial_link = `/show_user_contract/${this.props.userid}/`;
        return(
            <div id="btn-box">
                {
                    items.map((el)=>{
                        let userHas = this.state.userDocs.indexOf(el.title) > -1;
                        let signContract = (userHas)? 0 : 1;
                        return(<DocuBtn key = {el.id}
                                id = {el.id}
                                title = {el.title}
                                userid = {this.props.userid}
                                link = {`${partial_link}${el.id}/${signContract}/`}
                                userHas = {userHas}/>
                        );
                    })
                }
            </div>
        );
    }
}

function showUserDocuments(root, contractData, userpk){
    ReactDOM.unmountComponentAtNode(root);
    ReactDOM.render(<UserDocuments userid = {userpk} contractData = {contractData}/>,
                    root);  
}