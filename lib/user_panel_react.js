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

// Given a userpk
// Return a panel with proper info for user
// User status
function UserPanel(props) {
  var img_src = "/get_image/qr_codes/" + props.img_src + "/";
  console.log("imgSrc: ".concat(img_src)); // console.log(props);

  var payment_url = "/membership_payment/" + props.id;
  var agreementStyle = props.agreement ? {
    "border": "2px solid green"
  } : {
    "border": "2px solid red"
  };
  var btnColor = props.r_days < 1 ? props.r_days == 0 ? "btn-danger" : "btn-info" : "btn-success";
  btnColor = "btn " + btnColor;
  return React.createElement("div", {
    className: "row",
    style: agreementStyle
  }, React.createElement("div", {
    className: "col-6"
  }, React.createElement("span", null, " ", props.username, " ")), React.createElement("div", {
    className: "col-6"
  }, "blank"), React.createElement("div", {
    className: "col-6"
  }, React.createElement("img", {
    src: img_src
  })), React.createElement("div", {
    className: "col-6"
  }, React.createElement("span", {
    className: "align-middle"
  }, React.createElement("a", {
    href: payment_url,
    className: btnColor
  }, "Status: ", props.r_days < 1 ? props.r_days == 0 ? "Inactive" : " In Trial" : "Active"))), React.createElement("div", {
    className: "col-6"
  }, React.createElement("a", {
    href: payment_url,
    id: "make_payment",
    className: "btn btn-success btn-sm"
  }, "Make Payment")), React.createElement("div", {
    className: "col-6"
  }, "Remaining Days: ", React.createElement("span", null, " ", props.r_days == null ? "zer0" : props.r_days, " ")));
}

var ShowUserPanel =
/*#__PURE__*/
function (_React$Component) {
  _inherits(ShowUserPanel, _React$Component);

  function ShowUserPanel(props) {
    var _this;

    _classCallCheck(this, ShowUserPanel);

    _this = _possibleConstructorReturn(this, _getPrototypeOf(ShowUserPanel).call(this, props));
    _this.state = {
      userpk: props.userpk,
      user: null
    };
    return _this;
  }

  _createClass(ShowUserPanel, [{
    key: "getUserInfo",
    value: function getUserInfo() {
      var _this2 = this;

      console.log("getting user info");
      console.log(this.state.userpk);
      getData("/api/get_users/".concat(this.state.userpk)).then(function (data) {
        _this2.setState({
          user: data
        });
      });
    }
  }, {
    key: "render",
    value: function render() {
      if (this.state.user == null) {
        console.log("user null");
        this.getUserInfo();
      }

      if (this.state.user != null) {
        return React.createElement(UserPanel, {
          key: this.state.user.id,
          id: this.state.user.id,
          username: this.state.user.username,
          img_src: this.state.user.qr_img,
          status: this.state.user.status,
          r_days: this.state.user.remaining_days,
          agreement: this.state.user.has_agreement
        });
      } else {
        return React.createElement(UserPanel, {
          key: this.props.userpk,
          username: "None",
          img_src: "defaultQR.png",
          status: "Inactive",
          r_days: "-inf",
          agreement: "False"
        });
      }
    }
  }]);

  return ShowUserPanel;
}(React.Component);

function showPanel(root, pk) {
  ReactDOM.unmountComponentAtNode(root);
  ReactDOM.render(React.createElement(ShowUserPanel, {
    userpk: pk
  }), root);
}