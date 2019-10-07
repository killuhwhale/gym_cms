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

function ChargeItem(props) {
  var spinnerId = "spinner_".concat(props.id);
  console.log("lol" + props.products);
  return React.createElement("tbody", {
    className: "table-hover"
  }, React.createElement("tr", null, React.createElement("td", null, React.createElement("span", {
    className: "d-inline-block text-truncate"
  }, " ", props.created)), React.createElement("td", null, React.createElement("span", {
    className: "d-inline-block text-truncate"
  }, " ", props.id)), React.createElement("td", null, React.createElement("span", {
    className: "d-inline-block text-truncate"
  }, " ", props.info)), React.createElement("td", null, React.createElement("span", {
    className: "d-inline-block text-truncate"
  }, " $", props.amount)), React.createElement("td", null, React.createElement("span", {
    className: "d-inline-block text-truncate"
  }, " ", props.message)), React.createElement("td", null, React.createElement("span", {
    className: "d-inline-block text-truncate"
  }, " ", props.network_status)), React.createElement("td", null, React.createElement("span", {
    className: "d-inline-block text-truncate"
  }, " ", props.last4)), React.createElement("td", null, React.createElement("span", {
    className: "d-inline-block text-truncate"
  }, " ", React.createElement("a", {
    target: "_blank",
    href: props.receipt_url
  }, " link"))), React.createElement("td", null, React.createElement("span", {
    className: "d-inline-block text-truncate ",
    id: spinnerId
  }, React.createElement("button", {
    onClick: function onClick() {
      props.refundCharge(props.id);
    },
    className: "btn btn-danger btn-sm",
    id: props.id
  }, "Refund")))));
}

var ChargeItemList =
/*#__PURE__*/
function (_React$Component) {
  _inherits(ChargeItemList, _React$Component);

  function ChargeItemList(props) {
    var _this;

    _classCallCheck(this, ChargeItemList);

    _this = _possibleConstructorReturn(this, _getPrototypeOf(ChargeItemList).call(this, props));
    _this.state = {
      charges: props.charges
    };
    return _this;
  }

  _createClass(ChargeItemList, [{
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

      getData("/api/stripe_charges/".concat(this.props.user, "/").concat(startTimestamp, "/").concat(endTimestamp, "/all/")).then(function (data) {
        console.log(data);

        if (data != "False") {
          console.log("Setting updated data");

          _this3.setState({
            charges: data
          });
        } else {
          console.log("No charges found for member!");
        }
      });
    }
  }, {
    key: "refundCharge",
    value: function refundCharge(charge_id) {
      console.log("%c Refunding charge: ".concat(charge_id), "color: yellow;"); // Show Spinner

      setSpinner(charge_id, "spinner");
      postData("/api/charge_refund/", {
        "charge_id": charge_id,
        "refund_percent": 1.0
      }).then(function (data) {
        console.log(data); // Hide Spinner

        hideSpinner("spinner");

        if (data === "False") {
          alert("Failed making refund, may already be refunded");
        } else if (data === "True") {
          alert("Charge refunded successfully!");
        }
      });
    }
  }, {
    key: "render",
    value: function render() {
      var _this4 = this;

      var items = this.state.charges;
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
      })), React.createElement("th", null, " Charge Id "), React.createElement("th", null, " Product Info "), React.createElement("th", null, " Amount "), React.createElement("th", null, " Message "), React.createElement("th", null, " Status "), React.createElement("th", null, " Last 4 "), React.createElement("th", null, " Receipt "), React.createElement("th", null, " Refund "))), items.map(function (el) {
        return React.createElement(ChargeItem, {
          key: el.id,
          id: el.id,
          info: el.product_info,
          amount: el.amount,
          created: el.created,
          customer: el.customer,
          description: el.description,
          username: el.metadata.username,
          charge_type: el.metadata.charge_type,
          type: el.outcome_type,
          message: el.seller_message,
          network_status: el.network_status,
          last4: el.last4,
          receipt_url: el.receipt_url,
          isRefunded: el.is_refunded,
          refundCharge: _this4.refundCharge
        });
      })));
    }
  }]);

  return ChargeItemList;
}(React.Component);

function getCharges(root, pk) {
  getData("/api/stripe_charges/cus/".concat(pk, "/all/")).then(function (data) {
    ReactDOM.unmountComponentAtNode(root);
    ReactDOM.render(React.createElement(ChargeItemList, {
      charges: data,
      user: pk
    }), root);
  })["catch"](function (err) {
    console.error("%c Search User Error: ".concat(err), "color: red;");
  });
}