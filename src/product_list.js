function Product(props){
    // img: "/media/products/range_post.png"
    // split => ['/', 'media', 'products', 'range_post.png']
    // nginx serves these files, only needs dir and filename
    let imgUrl = props.img.split("/");
    let img_src = `/get_image/${imgUrl[2]}/${imgUrl[3]}`;

    return(
        <div className="col-6">
            <div className="col-10 bucket-border">
                <h2> {props.name} </h2>
                <img className='img-thumbnail product-thm-nail' src={img_src}/>
                <h3> ${props.price} </h3>
                <div className="col-12 d-flex justify-content-between">
                    <button className="btn btn-outline-dark form-control" type="button"
                        onClick={() => props.onclick(props.id, QTY_SELECT_1)} >1</button>

                    <button className="btn btn-outline-dark form-control" type="button"
                        onClick={() => props.onclick(props.id, QTY_SELECT_2)} >{QTY_SELECT_2}</button>
                    <button className="btn btn-outline-dark form-control" type="button"
                        onClick={() => props.onclick(props.id, QTY_SELECT_5)} >{QTY_SELECT_5}</button>
                    <button className="btn btn-outline-dark form-control" type="button"
                        onClick={() => props.onclick(props.id, QTY_SELECT_10)} >{QTY_SELECT_10}</button>

                </div>
            </div>
            <div className="col-2"></div>
        </div>
    );
}


// Manages each product
//      Renders product from properties
//      Stores product qty in state
//      When form submitted, post request sent w/ hidden input
//          value => current state  of product quantity to server
class ProductPanel extends React.Component{
    constructor(props){
        super(props);
    }

    changeQty(pk, qty){
        let storedItems = new Map(
            JSON.parse(window.localStorage.getItem(LOCAL_STOR_PRODUCT))
        );
        if(pk > 0 && qty > 0 && qty <= QTY_SELECT_MAX_VAL){
            // if item is in cart, update total qty, else add item
            if(storedItems.has(pk)){
                let originalQty = parseInt(storedItems.get(pk));
                storedItems.set(pk, originalQty + parseInt(qty));
            }else{
                storedItems.set(pk, parseInt(qty));
            }

            window.localStorage.setItem(
                LOCAL_STOR_PRODUCT,
                JSON.stringify(Array.from(storedItems))
            );
            updateCart(); // global function defined at bottom of script
        }
    }

    render(){
        let products = this.props.products;
        let productKey = `product_item_area`;
        
        return(
            <div className='row' key="{productKey}">
            {
                products.map((el) => {
                    let itemKey = `product_${el.id}`;

                    return( <Product key = {itemKey}
                                id = {el.id}
                                name = {el.name}
                                price = {el.price}
                                img = {el.img}
                                onclick = {this.changeQty.bind(this)}/>
                    );
                })
            }
            </div>
        );
    }
}


function renderProductList(root1, productData){
    let root = document.getElementById(root1);
    ReactDOM.unmountComponentAtNode(root);
    ReactDOM.render(<ProductPanel products = {productData}/>, root);
}