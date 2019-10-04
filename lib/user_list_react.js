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

// Gets all users and allows a search filter
// Click button to get id of item and then do something with it
// React elements will not survive page refresh
//
// User search
//
function UserRow(props) {
  var id = "User" + props.id;
  return React.createElement("div", {
    id: id,
    className: "text-center"
  }, React.createElement("p", {
    className: "no-click"
  }, props.username), React.createElement("p", {
    className: "no-click"
  }, props.qr_code), React.createElement("button", {
    id: props.id,
    className: "btn btn-primary",
    onClick: props.rmBtn,
    "data-toggle": "tooltip",
    "data-placement": "bottom",
    title: "Check Status"
  }, React.createElement("i", {
    className: "fas fa-atlas no-click"
  })), React.createElement("hr", null));
}

var UserList =
/*#__PURE__*/
function (_React$Component) {
  _inherits(UserList, _React$Component);

  function UserList(props) {
    var _this;

    _classCallCheck(this, UserList);

    _this = _possibleConstructorReturn(this, _getPrototypeOf(UserList).call(this, props));
    _this.state = {
      users: [],
      initItems: props.users
    };
    return _this;
  }

  _createClass(UserList, [{
    key: "userSelected",
    value: function userSelected(ev) {
      // showStatus(ev.target.id);
      this.props.userSelectedCallback(ev.target.id);
    }
  }, {
    key: "searchHandler",
    value: function searchHandler(ev) {
      var query = ev.target.value.toLowerCase();
      var newItems = this.state.initItems.filter(function (el) {
        var searchBy = el.username.toLowerCase();
        return searchBy.indexOf(query) !== -1;
      }); // hide full list of users if no query

      if (query == "") {
        this.setState({
          users: []
        });
      } else {
        this.setState({
          users: newItems
        });
      }
    }
  }, {
    key: "render",
    value: function render() {
      var _this2 = this;

      var items = this.state.users;
      console.log(items);
      return React.createElement("div", {
        id: "searchUsersReact"
      }, React.createElement("div", {
        className: "row"
      }, React.createElement("div", {
        className: "col-12 "
      }, React.createElement("input", {
        type: "text",
        className: "form-control text-center",
        placeholder: "Name",
        onChange: this.searchHandler.bind(this)
      }))), React.createElement("div", {
        className: "row search-results"
      }, React.createElement("div", {
        className: "col-12 text-center"
      }, items.map(function (el) {
        return React.createElement(UserRow, {
          key: el.id,
          username: el.username,
          id: el.id,
          qr_code: el.qr_code,
          rmBtn: _this2.userSelected.bind(_this2)
        });
      }))));
    }
  }]);

  return UserList;
}(React.Component); //end product inv list
// Add event listener to button to
// load user list


function loadUserList(root, userSelectedCallback) {
  getData("/api/get_users/").then(function (data) {
    ReactDOM.unmountComponentAtNode(root);
    ReactDOM.render(React.createElement(UserList, {
      users: data,
      userSelectedCallback: userSelectedCallback
    }), root);
  });
}

function hideSearch(root) {
  ReactDOM.unmountComponentAtNode(root);
}