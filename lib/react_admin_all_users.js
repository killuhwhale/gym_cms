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

// get init data and populate Panel
function reactAdminGetUsers(root) {
  getData("/api/get_users/").then(function (users) {
    if (users.length > 0) {
      ReactDOM.unmountComponentAtNode(root);
      console.log(users);
      ReactDOM.render(React.createElement(UserTable, {
        users: users
      }), root);
    } else {
      alert("No users found!");
    }
  });
}

function UserRow(props) {
  return React.createElement("tr", {
    className: "table-info"
  }, React.createElement("td", null, React.createElement("span", {
    className: "d-inline-block text-truncate"
  }, " ", props.id)), React.createElement("td", null, React.createElement("span", {
    className: "d-inline-block text-truncate"
  }, " ", props.username)), React.createElement("td", null, React.createElement("span", {
    className: "d-inline-block text-truncate"
  }, " ", props.customer_id)), React.createElement("td", null, React.createElement("span", {
    className: "d-inline-block text-truncate"
  }, " ", props.qr_code)), React.createElement("td", null, React.createElement("span", {
    className: "d-inline-block text-truncate"
  }, " ", props.qr_img)), React.createElement("td", null, React.createElement("span", {
    className: "d-inline-block text-truncate"
  }, " ", props.remaining_days)));
}

var UserTable =
/*#__PURE__*/
function (_React$Component) {
  _inherits(UserTable, _React$Component);

  function UserTable(props) {
    var _this;

    _classCallCheck(this, UserTable);

    _this = _possibleConstructorReturn(this, _getPrototypeOf(UserTable).call(this, props));
    _this.state = {
      users: props.users
    };
    return _this;
  }

  _createClass(UserTable, [{
    key: "render",
    value: function render() {
      var items = this.state.users;
      return React.createElement("div", {
        "class": "table-responsive"
      }, React.createElement("table", {
        className: "table text-center table-bordered table-sm",
        align: "center"
      }, React.createElement("thead", {
        className: "thead-dark"
      }, React.createElement("tr", null, React.createElement("th", null, " Id "), React.createElement("th", null, " Username "), React.createElement("th", null, " Customer ID "), React.createElement("th", null, " QR Code "), React.createElement("th", null, " QR Img "), React.createElement("th", null, " Remaining Days "))), React.createElement("tbody", {
        className: "table-hover"
      }, items.map(function (el) {
        return React.createElement(UserRow, {
          key: el.id,
          id: el.id,
          username: el.username,
          customer_id: el.customer_id,
          qr_code: el.qr_code,
          qr_img: el.qr_img,
          remaining_days: el.remaining_days
        });
      }))));
    }
  }]);

  return UserTable;
}(React.Component);