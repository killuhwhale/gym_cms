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

function SubscriptionItem(props) {
  var spinnerId = "spinner_".concat(props.id);
  var rowStyle = props.status == "active" ? "table-success" : "table-info";
  return React.createElement("tbody", {
    className: "table-hover"
  }, React.createElement("tr", {
    className: rowStyle
  }, React.createElement("td", null, React.createElement("span", {
    className: "d-inline-block text-truncate"
  }, props.id)), React.createElement("td", null, React.createElement("span", {
    className: "d-inline-block text-truncate"
  }, props.username)), React.createElement("td", null, React.createElement("span", {
    className: "d-inline-block text-truncate"
  }, props.start)), React.createElement("td", null, React.createElement("span", {
    className: "d-inline-block text-truncate"
  }, props.status)), React.createElement("td", null, React.createElement("span", {
    className: "d-inline-block text-truncate"
  }, props.name)), React.createElement("td", null, React.createElement("span", {
    className: "d-inline-block text-truncate"
  }, props.desc)), React.createElement("td", null, React.createElement("span", {
    className: "d-inline-block text-truncate"
  }, props.price)), React.createElement("td", null, React.createElement("span", {
    className: "d-inline-block text-truncate"
  }, props.interval)), React.createElement("td", null, React.createElement("span", {
    id: spinnerId
  }, React.createElement("button", {
    className: "btn btn-danger btn-sm",
    id: props.id,
    onClick: function onClick(ev) {
      props.onclick(props.id);
    }
  }, "Cancel")))));
}

var SubscriptionItemList =
/*#__PURE__*/
function (_React$Component) {
  _inherits(SubscriptionItemList, _React$Component);

  function SubscriptionItemList(props) {
    var _this;

    _classCallCheck(this, SubscriptionItemList);

    _this = _possibleConstructorReturn(this, _getPrototypeOf(SubscriptionItemList).call(this, props));
    _this.state = {
      subs: props.subs
    };
    return _this;
  }

  _createClass(SubscriptionItemList, [{
    key: "cancelSubscription",
    value: function cancelSubscription(id) {
      if (confirm("Are you sure you want to cancel this subscription?")) {
        setSpinner(id, "spinner");
        deleteData("/api/stripe_subscriptions/cus/".concat(id, "/")).then(function (response) {
          hideSpinner("spinner");

          if (response == "False") {
            alert("Error deleting subscription");
          } else {
            alert(response);
          }

          console.log("%c Delete resp: ".concat(response), "color: orange;");
        });
      }
    }
  }, {
    key: "render",
    value: function render() {
      var _this2 = this;

      var items = this.props.subs;
      var key_index = 0;
      return React.createElement("table", {
        className: "table table-responsive text-center table-bordered table-sm",
        key: "-0",
        align: "center"
      }, React.createElement("thead", {
        className: "thead-dark",
        key: "-1"
      }, React.createElement("tr", {
        key: "-2"
      }, React.createElement("th", null, " Sub Id "), React.createElement("th", null, " Username "), React.createElement("th", null, " Created "), React.createElement("th", null, " Sub Status "), React.createElement("th", null, " Name "), React.createElement("th", null, " Desc "), React.createElement("th", null, " Price "), React.createElement("th", null, " Stripe Interval "), React.createElement("th", null, " Cancel "))), items.map(function (el) {
        return React.createElement(SubscriptionItem, {
          key: key_index++,
          id: el.id,
          username: el.username,
          created: el.created,
          start: el.start,
          amount: el.amount,
          nickname: el.nickname,
          interval: el.interval,
          name: el.products.name,
          desc: el.products.desc,
          price: el.products.price,
          status: el.status,
          onclick: _this2.cancelSubscription
        });
      }));
    }
  }]);

  return SubscriptionItemList;
}(React.Component);

function getSubscriptions(root, pk) {
  getData("/api/stripe_subscriptions/".concat(pk, "/0/0/active/")).then(function (data) {
    console.log("data:");
    console.log(data.length);

    if (data.length > 0) {
      // ReactDOM.unmountComponentAtNode(root);
      ReactDOM.render(React.createElement(SubscriptionItemList, {
        subs: data
      }), root);
    } else {
      alert("No subscriptions found for member!");
    }
  })["catch"](function (err) {
    console.error("%c Search User Error: ".concat(err), "color: red;");
  });
}