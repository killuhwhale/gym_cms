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

// React def
function MembershipPackage(props) {
  return React.createElement("div", {
    className: "col-4 membership-package"
  }, React.createElement("div", {
    className: "card"
  }, React.createElement("div", {
    className: "card-body"
  }, React.createElement("p", null, " $", props.pkg_price, " "), React.createElement("input", {
    type: "radio",
    id: props.pkg_name,
    name: "m_plans",
    value: props.id,
    className: "radio"
  }), React.createElement("label", {
    htmlFor: props.pkg_name,
    className: "label"
  }, props.pkg_desc))));
}

var ShowMembershipPackage =
/*#__PURE__*/
function (_React$Component) {
  _inherits(ShowMembershipPackage, _React$Component);

  function ShowMembershipPackage(props) {
    var _this;

    _classCallCheck(this, ShowMembershipPackage);

    _this = _possibleConstructorReturn(this, _getPrototypeOf(ShowMembershipPackage).call(this, props));
    _this.state = {
      packages: props.packages
    };
    return _this;
  }

  _createClass(ShowMembershipPackage, [{
    key: "render",
    value: function render() {
      var pkgs = this.state.packages;
      return React.createElement("div", {
        className: "row justify-content-center"
      }, pkgs.map(function (el) {
        return React.createElement(MembershipPackage, {
          key: el.id,
          id: el.id,
          pkg_name: el.name,
          pkg_price: el.price,
          pkg_desc: el.desc
        });
      }));
    }
  }]);

  return ShowMembershipPackage;
}(React.Component);

function showMembershipPackage(root) {
  ReactDOM.unmountComponentAtNode(root);
  getData("/api/memberships/").then(function (data) {
    console.log(data);
    ReactDOM.render(React.createElement(ShowMembershipPackage, {
      packages: data
    }), root);
  });
}