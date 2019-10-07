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

function ProductSubRow(props) {
  var subtotal = props.qty * props.price;
  return React.createElement("tr", null, React.createElement("td", null, props.name), React.createElement("td", null, props.price), React.createElement("td", null, props.qty), React.createElement("td", null, subtotal));
}

function Product(props) {
  return React.createElement("tbody", {
    className: "table-hover"
  }, React.createElement("tr", null, React.createElement("td", null, React.createElement("span", {
    className: "d-inline-block text-truncate"
  }, props.created)), React.createElement("td", null, React.createElement("span", {
    className: "d-inline-block text-truncate"
  }, props.charge_id)), React.createElement("td", null, React.createElement("span", {
    className: "d-inline-block text-truncate"
  }, props.username)), React.createElement("td", null, React.createElement("span", {
    className: "d-inline-block text-truncate"
  }, "$", props.amount)), React.createElement("td", null, React.createElement("span", {
    className: "d-inline-block text-truncate"
  }, React.createElement("a", {
    target: "_blank",
    href: props.receipt_url == "None" ? "#" : props.receipt_url
  }, "link")))), React.createElement("tr", null, React.createElement("th", null, "Item Name"), React.createElement("th", null, "Item Price"), React.createElement("th", null, "Qty"), React.createElement("th", null, "Subtotal")), props.products.map(function (el) {
    return React.createElement(ProductSubRow, {
      key: el.name,
      name: el.name,
      price: el.price,
      qty: el.qty
    });
  }));
}

var SoldProductList =
/*#__PURE__*/
function (_React$Component) {
  _inherits(SoldProductList, _React$Component);

  function SoldProductList(props) {
    var _this;

    _classCallCheck(this, SoldProductList);

    _this = _possibleConstructorReturn(this, _getPrototypeOf(SoldProductList).call(this, props));
    _this.state = {
      products: props.products
    };
    return _this;
  }

  _createClass(SoldProductList, [{
    key: "componentDidMount",
    value: function componentDidMount() {
      var _this2 = this;

      console.log("hello");
      var d = $('input[id="_datepicker"]');
      d.daterangepicker({
        opens: 'left'
      }, function (start, end, label) {
        console.log("A new date selection was made: " + start + ' to ' + end.format('YYYY-MM-DD'));

        _this2.updateData(start, end);
      });
    }
  }, {
    key: "updateData",
    value: function updateData(start, end) {
      var _this3 = this;

      var startTimestamp = start;
      var endTimestamp = end;

      if (start.hasOwnProperty("_isAMomentObject")) {
        startTimestamp = start.valueOf();
      }

      if (end.hasOwnProperty("_isAMomentObject")) {
        endTimestamp = end.valueOf();
      }

      getData("/api/stripe_charges/".concat(this.props.user, "/").concat(startTimestamp, "/").concat(endTimestamp, "/Gym Product/")).then(function (data) {
        console.log(data);

        if (data != "False") {
          console.log("Setting updated data");

          _this3.setState({
            products: data
          });
        } else {
          console.log("No charges found for member!");
        }
      });
    }
  }, {
    key: "render",
    value: function render() {
      var items = this.state.products;
      return React.createElement("div", {
        className: "table-responsive"
      }, React.createElement("table", {
        className: "table text-center table-bordered table-sm",
        align: "center"
      }, React.createElement("thead", {
        className: "thead-dark"
      }, React.createElement("tr", null, React.createElement("th", null, " Date", React.createElement("br", null), React.createElement("input", {
        id: "_datepicker",
        className: "text-center",
        type: "text"
      })), React.createElement("th", null, " Charge Id "), React.createElement("th", null, " Member "), React.createElement("th", null, " Total "), React.createElement("th", null, " Receipt "))), items.map(function (el) {
        return React.createElement(Product, {
          key: el.id,
          charge_id: el.id,
          created: el.created,
          username: el.metadata.username,
          product_info: el.product_info,
          products: el.products,
          amount: el.amount,
          receipt_url: el.receipt_url,
          refunded: el.refunded
        });
      })));
    }
  }]);

  return SoldProductList;
}(React.Component);

function getCharges(root, id) {
  getData("/api/stripe_charges/cus/".concat(id, "/Gym Product/")).then(function (data) {
    ReactDOM.unmountComponentAtNode(root);
    ReactDOM.render(React.createElement(SoldProductList, {
      products: data,
      user: id
    }), root);
  })["catch"](function (err) {
    console.error("%c Search User Error: ".concat(err), "color: red;");
  });
}