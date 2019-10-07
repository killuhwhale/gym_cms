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

function RefundItem(props) {
  return React.createElement("tbody", {
    className: "table-hover"
  }, React.createElement("tr", {
    className: "table-danger"
  }, React.createElement("td", null, React.createElement("span", {
    className: "d-inline-block text-truncate"
  }, " ", props.date)), React.createElement("td", null, React.createElement("span", {
    className: "d-inline-block text-truncate"
  }, " ", props.charge_id)), React.createElement("td", null, React.createElement("span", {
    className: "d-inline-block text-truncate"
  }, " ", props.customer)), React.createElement("td", null, React.createElement("span", {
    className: "d-inline-block text-truncate"
  }, " ", props.products)), React.createElement("td", null, React.createElement("span", {
    className: "d-inline-block text-truncate"
  }, " $", props.charge_amt)), React.createElement("td", null, React.createElement("span", {
    className: "d-inline-block text-truncate"
  }, " $", props.refund_amt)), React.createElement("td", null, props.receipt_url == "None" ? "No" : React.createElement("span", {
    className: "d-inline-block text-truncate"
  }, " ", React.createElement("a", {
    target: "_blank",
    href: props.receipt_url
  }, " link")))));
}

var RefundItemList =
/*#__PURE__*/
function (_React$Component) {
  _inherits(RefundItemList, _React$Component);

  function RefundItemList(props) {
    var _this;

    _classCallCheck(this, RefundItemList);

    _this = _possibleConstructorReturn(this, _getPrototypeOf(RefundItemList).call(this, props));
    _this.state = {
      refunds: props.refunds
    };
    return _this;
  }

  _createClass(RefundItemList, [{
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

      getData("/api/stripe_charges/".concat(this.props.user, "/").concat(startTimestamp, "/").concat(endTimestamp, "/refunded/")).then(function (data) {
        console.log(data);

        if (data != "False") {
          console.log("Setting updated data");

          _this3.setState({
            refunds: data
          });
        } else {
          console.log("No charges found for member!");
        }
      });
    }
  }, {
    key: "render",
    value: function render() {
      var items = this.state.refunds;
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
      })), React.createElement("th", null, " Charge Id "), React.createElement("th", null, " User "), React.createElement("th", null, " Product Info "), React.createElement("th", null, " Charge Amount "), React.createElement("th", null, " Refund Amount "), React.createElement("th", null, " Receipt "))), items.map(function (el) {
        return React.createElement(RefundItem, {
          key: el.id,
          charge_id: el.id,
          customer: el.metadata.username,
          date: el.created,
          products: el.product_info,
          refund_amt: el.amount_refunded,
          charge_amt: el.amount,
          receipt_url: el.receipt_url
        });
      })));
    }
  }]);

  return RefundItemList;
}(React.Component);

function getCharges(root, pk) {
  getData("/api/stripe_charges/cus/".concat(pk, "/refunded/")).then(function (data) {
    ReactDOM.unmountComponentAtNode(root);
    ReactDOM.render(React.createElement(RefundItemList, {
      refunds: data,
      user: pk
    }), root);
  });
}