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

function DocuBtn(props) {
  var btnColor = props.userHas ? "btn-outline-success" : "btn-outline-danger";
  var onFileText = props.userHas ? " - On File" : " - Not on File";
  var classes = "btn ".concat(btnColor);
  return React.createElement("a", {
    href: props.link,
    target: "_blank",
    className: classes
  }, props.title, " ", onFileText);
}

var UserDocuments =
/*#__PURE__*/
function (_React$Component) {
  _inherits(UserDocuments, _React$Component);

  function UserDocuments(props) {
    var _this;

    _classCallCheck(this, UserDocuments);

    _this = _possibleConstructorReturn(this, _getPrototypeOf(UserDocuments).call(this, props));
    console.log("recieved:");
    console.log(props.contractData);
    _this.state = {
      allDocs: props.contractData,
      userDocs: []
    };

    _this.getAllDocuments();

    return _this;
  }

  _createClass(UserDocuments, [{
    key: "getAllDocuments",
    value: function getAllDocuments() {
      var _this2 = this;

      getData("/api/user_contract/user/".concat(this.props.userid, "/")).then(function (userContracts) {
        userContracts = userContracts.map(function (_ref) {
          var title = _ref.title;
          return title;
        });

        _this2.setState({
          userDocs: userContracts
        });
      })["catch"](function (err) {
        console.log(err);
      });
    }
  }, {
    key: "render",
    value: function render() {
      var _this3 = this;

      var items = this.state.allDocs;
      var partial_link = "/show_user_contract/".concat(this.props.userid, "/");
      return React.createElement("div", {
        id: "btn-box"
      }, items.map(function (el) {
        var userHas = _this3.state.userDocs.indexOf(el.title) > -1;
        var signContract = userHas ? 0 : 1;
        return React.createElement(DocuBtn, {
          key: el.id,
          id: el.id,
          title: el.title,
          userid: _this3.props.userid,
          link: "".concat(partial_link).concat(el.id, "/").concat(signContract, "/"),
          userHas: userHas
        });
      }));
    }
  }]);

  return UserDocuments;
}(React.Component);

function showUserDocuments(root, contractData, userpk) {
  ReactDOM.unmountComponentAtNode(root);
  ReactDOM.render(React.createElement(UserDocuments, {
    userid: userpk,
    contractData: contractData
  }), root);
}