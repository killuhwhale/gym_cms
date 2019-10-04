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

function Product(props) {
  // img: "/media/products/range_post.png"
  // split => ['/', 'media', 'products', 'range_post.png']
  // nginx serves these files, only needs dir and filename
  var imgUrl = props.img.split("/");
  var img_src = "/get_image/".concat(imgUrl[2], "/").concat(imgUrl[3]);
  return React.createElement("div", {
    className: "col-6"
  }, React.createElement("div", {
    className: "col-10 bucket-border"
  }, React.createElement("h2", null, " ", props.name, " "), React.createElement("img", {
    className: "img-thumbnail product-thm-nail",
    src: img_src
  }), React.createElement("h3", null, " $", props.price, " "), React.createElement("div", {
    className: "col-12 d-flex justify-content-between"
  }, React.createElement("button", {
    className: "btn btn-outline-dark form-control",
    type: "button",
    onClick: function onClick() {
      return props.onclick(props.id, QTY_SELECT_1);
    }
  }, "1"), React.createElement("button", {
    className: "btn btn-outline-dark form-control",
    type: "button",
    onClick: function onClick() {
      return props.onclick(props.id, QTY_SELECT_2);
    }
  }, QTY_SELECT_2), React.createElement("button", {
    className: "btn btn-outline-dark form-control",
    type: "button",
    onClick: function onClick() {
      return props.onclick(props.id, QTY_SELECT_5);
    }
  }, QTY_SELECT_5), React.createElement("button", {
    className: "btn btn-outline-dark form-control",
    type: "button",
    onClick: function onClick() {
      return props.onclick(props.id, QTY_SELECT_10);
    }
  }, QTY_SELECT_10))), React.createElement("div", {
    className: "col-2"
  }));
} // Manages each product
//      Renders product from properties
//      Stores product qty in state
//      When form submitted, post request sent w/ hidden input
//          value => current state  of product quantity to server


var ProductPanel =
/*#__PURE__*/
function (_React$Component) {
  _inherits(ProductPanel, _React$Component);

  function ProductPanel(props) {
    _classCallCheck(this, ProductPanel);

    return _possibleConstructorReturn(this, _getPrototypeOf(ProductPanel).call(this, props));
  }

  _createClass(ProductPanel, [{
    key: "changeQty",
    value: function changeQty(pk, qty) {
      var storedItems = new Map(JSON.parse(window.localStorage.getItem(LOCAL_STOR_PRODUCT)));

      if (pk > 0 && qty > 0 && qty <= QTY_SELECT_MAX_VAL) {
        // if item is in cart, update total qty, else add item
        if (storedItems.has(pk)) {
          var originalQty = parseInt(storedItems.get(pk));
          storedItems.set(pk, originalQty + parseInt(qty));
        } else {
          storedItems.set(pk, parseInt(qty));
        }

        window.localStorage.setItem(LOCAL_STOR_PRODUCT, JSON.stringify(Array.from(storedItems)));
        updateCart(); // global function defined at bottom of script
      }
    }
  }, {
    key: "render",
    value: function render() {
      var _this = this;

      var products = this.props.products;
      var productKey = "product_item_area";
      return React.createElement("div", {
        className: "row",
        key: "{productKey}"
      }, products.map(function (el) {
        var itemKey = "product_".concat(el.id);
        return React.createElement(Product, {
          key: itemKey,
          id: el.id,
          name: el.name,
          price: el.price,
          img: el.img,
          onclick: _this.changeQty.bind(_this)
        });
      }));
    }
  }]);

  return ProductPanel;
}(React.Component);

function renderProductList(root1, productData) {
  var root = document.getElementById(root1);
  ReactDOM.unmountComponentAtNode(root);
  ReactDOM.render(React.createElement(ProductPanel, {
    products: productData
  }), root);
}