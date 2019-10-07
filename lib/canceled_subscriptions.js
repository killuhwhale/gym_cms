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
  return React.createElement("tbody", {
    className: "table-hover"
  }, React.createElement("tr", {
    className: "table-danger"
  }, React.createElement("td", null, React.createElement("span", {
    className: "d-inline-block text-truncate"
  }, props.start)), React.createElement("td", null, React.createElement("span", {
    className: "d-inline-block text-truncate"
  }, props.id)), React.createElement("td", null, React.createElement("span", {
    className: "d-inline-block text-truncate"
  }, props.username)), React.createElement("td", null, React.createElement("span", {
    className: "d-inline-block text-truncate"
  }, props.name)), React.createElement("td", null, React.createElement("span", {
    className: "d-inline-block text-truncate"
  }, props.canceled_at)), React.createElement("td", null, React.createElement("span", {
    className: "d-inline-block text-truncate"
  }, props.desc)), React.createElement("td", null, React.createElement("span", {
    className: "d-inline-block text-truncate"
  }, props.price)), React.createElement("td", null, React.createElement("span", {
    className: "d-inline-block text-truncate"
  }, props.interval))));
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

      getData("/api/stripe_subscriptions/".concat(this.props.user, "/").concat(startTimestamp, "/").concat(endTimestamp, "/canceled/")).then(function (data) {
        console.log(data);

        if (data != "False") {
          console.log("Setting updated data");

          _this3.setState({
            subs: data
          });
        } else {
          console.log("No charges found for member!");
        }
      });
    }
  }, {
    key: "render",
    value: function render() {
      var _this4 = this;

      var items = this.state.subs;
      var key_index = 0;
      return React.createElement("div", {
        className: "table-responsive"
      }, React.createElement("table", {
        className: "table text-center table-bordered table-sm",
        key: "-0",
        align: "center"
      }, React.createElement("thead", {
        className: "thead-dark",
        key: "-1"
      }, React.createElement("tr", {
        key: "-2"
      }, React.createElement("th", null, " Created", React.createElement("br", null), React.createElement("input", {
        id: "_datepicker",
        className: "text-center",
        type: "text"
      })), React.createElement("th", null, " Sub Id "), React.createElement("th", null, " Username "), React.createElement("th", null, " Name "), React.createElement("th", null, " Canceled "), React.createElement("th", null, " Desc "), React.createElement("th", null, " Price "), React.createElement("th", null, " Stripe Interval "))), items.map(function (el) {
        return React.createElement(SubscriptionItem, {
          key: key_index++,
          id: el.id,
          username: el.username,
          created: el.created,
          start: el.start,
          canceled_at: el.canceled_at,
          amount: el.amount,
          nickname: el.nickname,
          interval: el.interval,
          name: el.products.name,
          desc: el.products.desc,
          price: el.products.price,
          onclick: _this4.cancelSubscription
        });
      })));
    }
  }]);

  return SubscriptionItemList;
}(React.Component);

function getSubscriptions(root, pk) {
  getData("/api/stripe_subscriptions/".concat(pk, "/0/0/canceled/")).then(function (data) {
    ReactDOM.unmountComponentAtNode(root);
    ReactDOM.render(React.createElement(SubscriptionItemList, {
      subs: data,
      user: pk
    }), root);
  })["catch"](function (err) {
    console.error("%c Search User Error: ".concat(err), "color: red;");
  });
}