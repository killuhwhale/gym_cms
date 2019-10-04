function CartItem(props){
    let subtotal = fmtNumber(parseFloat(props.price) * parseFloat(props.qty));
    return(
        <div className="col-12">
            {props.name} | {props.qty} | ${props.price}ea | ${subtotal}
        </div>
    );
}

class Cart extends React.Component{
    constructor(props){
        super(props);

        // Cart will operate of a Map instance, to iterate over
        //  cart items and calculate totals.
        // if localStorage is empty, Json will parse a vlaue of
        //   null which Map() will create an empty instance 
        this.state = {
            cartItems: new Map(JSON.parse(window.localStorage.getItem(LOCAL_STOR_PRODUCT))),
            products: new Map(
                this.props.products.map((el)=>{
                    return [el.id, el];
                })
            )
        }
    }

    

    checkout(){
        if(this.state.cartItems.size > 0){
            window.location = "/product_payment/";
        }else{
            alert("cart is empty");
        }
    }

    clearCart(){
        if(confirm("Yeee sure?")){
            window.localStorage.removeItem(LOCAL_STOR_PRODUCT);
            updateCart();
        }
    }

    shoppingBtns(){
        return (
        <div className="row">
            <div className="col-6">

                <button type="button" className='btn btn-outline-danger'
                    onClick={()=>{this.clearCart()}}>
                    Clear Cart
                </button>
            </div>
            <div className="col-6">

                <button type="button" className='btn btn-outline-success'
                    onClick={()=>{this.checkout()}}>
                    Checkout
                </button>
            </div>
        </div>
        );
    }

    render(){

        let items = this.state.cartItems; // pk: qty
        let itemKeys = Array.from(this.state.cartItems.keys());
        let cartTotal = 0.0;
        console.log(items);

        console.log(this.state.products); // list
        if(this.state.cartItems.size > 0){
            cartTotal = itemKeys.map((key)=>{
                console.log(key);
                let itemQty = parseFloat(items.get(key));
                let itemPrice = parseFloat(this.state.products.get(key).price);
                return  itemPrice * itemQty;
            })
            .reduce((acc, cur)=>{return acc + cur});
        }



        return(
            <div className="row">
            {
                itemKeys.map((key)=>{
                    let curItem = this.state.products.get(key);
                    
                    return(<CartItem key={key}
                                    name = {curItem.name}
                                    price = {curItem.price}
                                    qty = {items.get(key)}
                    />);
                })
            }

            <div className="col-12">
                Total: ${fmtNumber(cartTotal)}
            </div>
            <div className="col-12">
            {   
                (this.props.isShopping)? this.shoppingBtns() : ''               
            }
            </div>
            </div>
        );
    }
}
