"use strict";

function _typeof(obj) { if (typeof Symbol === "function" && typeof Symbol.iterator === "symbol") { _typeof = function _typeof(obj) { return typeof obj; }; } else { _typeof = function _typeof(obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; }; } return _typeof(obj); }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } }

function _createClass(Constructor, protoProps, staticProps) { if (protoProps) _defineProperties(Constructor.prototype, protoProps); if (staticProps) _defineProperties(Constructor, staticProps); return Constructor; }

function _possibleConstructorReturn(self, call) { if (call && (_typeof(call) === "object" || typeof call === "function")) { return call; } return _assertThisInitialized(self); }

function _assertThisInitialized(self) { if (self === void 0) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return self; }

function _getPrototypeOf(o) { _getPrototypeOf = Object.setPrototypeOf ? Object.getPrototypeOf : function _getPrototypeOf(o) { return o.__proto__ || Object.getPrototypeOf(o); }; return _getPrototypeOf(o); }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function"); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, writable: true, configurable: true } }); if (superClass) _setPrototypeOf(subClass, superClass); }

function _setPrototypeOf(o, p) { _setPrototypeOf = Object.setPrototypeOf || function _setPrototypeOf(o, p) { o.__proto__ = p; return o; }; return _setPrototypeOf(o, p); }

function CartItem(props) {
  var subtotal = fmtNumber(parseFloat(props.price) * parseFloat(props.qty));
  return React.createElement("div", {
    className: "col-12"
  }, React.createElement("div", {
    className: "row"
  }, React.createElement("div", {
    className: "col-9"
  }, props.name, " | ", props.qty, " | $", props.price, "ea | $", subtotal), React.createElement("div", {
    className: "col-3"
  }, React.createElement("button", {
    type: "button",
    onClick: function onClick() {
      return props.removeItem(props.pk);
    },
    className: "btn btn-sm btn-outline-danger"
  }, "Remove"))));
}

var Cart =
/*#__PURE__*/
function (_React$Component) {
  _inherits(Cart, _React$Component);

  function Cart(props) {
    var _this;

    _classCallCheck(this, Cart);

    _this = _possibleConstructorReturn(this, _getPrototypeOf(Cart).call(this, props)); // Cart will operate of a Map instance, to iterate over
    //  cart items and calculate totals.
    // if localStorage is empty, Json will parse a vlaue of
    //   null which Map() will create an empty instance 

    _this.state = {
      cartItems: new Map(JSON.parse(window.localStorage.getItem(LOCAL_STOR_PRODUCT))),
      products: new Map(_this.props.products.map(function (el) {
        return [el.id, el];
      }))
    };
    return _this;
  }

  _createClass(Cart, [{
    key: "checkout",
    value: function checkout() {
      if (this.state.cartItems.size > 0) {
        window.location = "/product_payment/";
      } else {
        alert("cart is empty");
      }
    }
  }, {
    key: "clearCart",
    value: function clearCart() {
      if (confirm("Yeee sure?")) {
        window.localStorage.removeItem(LOCAL_STOR_PRODUCT);
        updateCart();
      }
    }
  }, {
    key: "removeItem",
    value: function removeItem(key) {
      this.state.cartItems["delete"](key);
      window.localStorage.setItem(LOCAL_STOR_PRODUCT, JSON.stringify(Array.from(this.state.cartItems)));
      updateCart();
    }
  }, {
    key: "shoppingBtns",
    value: function shoppingBtns() {
      var _this2 = this;

      return React.createElement("div", {
        className: "row"
      }, React.createElement("div", {
        className: "col-6"
      }, React.createElement("button", {
        type: "button",
        className: "btn btn-outline-danger",
        onClick: function onClick() {
          _this2.clearCart();
        }
      }, "Clear Cart")), React.createElement("div", {
        className: "col-6"
      }, React.createElement("button", {
        type: "button",
        className: "btn btn-outline-success",
        onClick: function onClick() {
          _this2.checkout();
        }
      }, "Checkout")));
    }
  }, {
    key: "render",
    value: function render() {
      var _this3 = this;

      var items = this.state.cartItems; // pk: qty

      var itemKeys = Array.from(this.state.cartItems.keys());
      var cartTotal = 0.0;

      if (this.state.cartItems.size > 0) {
        cartTotal = itemKeys.map(function (key) {
          console.log(key);
          var itemQty = parseFloat(items.get(key));
          var itemPrice = parseFloat(_this3.state.products.get(key).price);
          return itemPrice * itemQty;
        }).reduce(function (acc, cur) {
          return acc + cur;
        });
      }

      return React.createElement("div", {
        className: "row"
      }, itemKeys.map(function (key) {
        var curItem = _this3.state.products.get(key);

        return React.createElement(CartItem, {
          key: key,
          pk: key,
          name: curItem.name,
          price: curItem.price,
          qty: items.get(key),
          removeItem: _this3.removeItem.bind(_this3)
        });
      }), React.createElement("div", {
        className: "col-12"
      }, "Total: $", fmtNumber(cartTotal)), React.createElement("div", {
        className: "col-12"
      }, this.props.isShopping ? this.shoppingBtns() : ''));
    }
  }]);

  return Cart;
}(React.Component);

function renderCart(root, productData) {
  var cartRoot = document.getElementById(root);
  ReactDOM.unmountComponentAtNode(cartRoot);
  var isShopping = true;
  var productCart = ReactDOM.render(React.createElement(Cart, {
    products: productData,
    isShopping: isShopping
  }), cartRoot);

  window.updateCart = function () {
    productCart.setState({
      cartItems: new Map(JSON.parse(window.localStorage.getItem(LOCAL_STOR_PRODUCT)))
    });
  };
}