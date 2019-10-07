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
function reactAdminGetCharges(root) {
  getData("/api/stripe_charges/0/0/0/all_admin/ ").then(function (charges) {
    if (charges.length == 0) {
      charges = [{
        "metadata": {
          "username": "No Charges Found",
          "charge_type": "none"
        },
        refunded: false,
        amount: "0.0"
      }];
    }

    ReactDOM.unmountComponentAtNode(root);
    ReactDOM.render(React.createElement(ChargeTable, {
      charges: charges
    }), root);
  });
}

function ChargeRow(props) {
  var rowStyle = props.refunded ? "table-danger" : "table-success";
  return React.createElement("tr", {
    className: rowStyle
  }, React.createElement("td", null, React.createElement("span", {
    className: "d-inline-block text-truncate"
  }, " ", props.created)), React.createElement("td", null, React.createElement("span", {
    className: "d-inline-block text-truncate"
  }, " ", props.id)), React.createElement("td", null, React.createElement("span", {
    className: "d-inline-block text-truncate"
  }, " ", props.username)), React.createElement("td", null, React.createElement("span", {
    className: "d-inline-block text-truncate"
  }, " ", props.purchase)), React.createElement("td", null, React.createElement("span", {
    className: "d-inline-block text-truncate"
  }, " $", props.amount)), React.createElement("td", null, React.createElement("span", {
    className: "d-inline-block text-truncate"
  }, " ", props.network_status)), React.createElement("td", null, React.createElement("span", {
    className: "d-inline-block text-truncate"
  }, " ", props.last4)), React.createElement("td", null, React.createElement("span", {
    className: "d-inline-block text-truncate"
  }, " ", React.createElement("a", {
    target: "_blank",
    href: props.receipt_url
  }, " link"))));
}

var ChargeTable =
/*#__PURE__*/
function (_React$Component) {
  _inherits(ChargeTable, _React$Component);

  function ChargeTable(props) {
    var _this;

    _classCallCheck(this, ChargeTable);

    _this = _possibleConstructorReturn(this, _getPrototypeOf(ChargeTable).call(this, props));
    _this.state = {
      charges: props.charges
    };
    _this.leftChart = null;
    _this.rightChart = null;
    return _this;
  }

  _createClass(ChargeTable, [{
    key: "calcTotalAmount",
    value: function calcTotalAmount(items) {
      var productTotal = 0;
      var membershipTotal = 0;
      var productTotalRefund = 0;
      var membershipTotalRefund = 0;
      var productTotalCount = 0;
      var membershipTotalCount = 0;
      var productTotalRefundCount = 0;
      var membershipTotalRefundCount = 0;
      items.map(function (el) {
        var charge_type = el.metadata.charge_type,
            amount = el.amount,
            refunded = el.refunded;
        amount = parseFloat(amount);

        if (charge_type == "Membership") {
          if (refunded) {
            membershipTotalRefund += amount;
            membershipTotalRefundCount++;
          } else {
            membershipTotal += amount;
            membershipTotalCount++;
          }
        } else if (charge_type == "Gym Product") {
          if (refunded) {
            productTotalRefund += amount;
            productTotalRefundCount++;
          } else {
            productTotal += amount;
            productTotalCount++;
          }
        }
      });
      console.log(productTotal, membershipTotal, productTotalRefund, membershipTotalRefund);
      return [[productTotalCount, membershipTotalCount, productTotalRefundCount, membershipTotalRefundCount], [productTotal, membershipTotal, productTotalRefund, membershipTotalRefund]];
    }
  }, {
    key: "componentDidMount",
    value: function componentDidMount() {
      var _this2 = this;

      console.log("hello all charges");
      var d = $('input[id="_datepicker"]');
      d.daterangepicker({
        opens: 'left'
      }, function (start, end, label) {
        console.log("A new date selection was made: " + start + ' to ' + end.format('YYYY-MM-DD'));

        _this2.updateData(start, end);
      });
      this.loadCharts();
    }
  }, {
    key: "loadCharts",
    value: function loadCharts() {
      // Charts
      var leftCtx = document.getElementById("leftChart").getContext('2d');
      var initData = this.calcTotalAmount(this.props.charges);
      var initCounts = initData[0];
      var initTotals = initData[1];
      var leftChart = new Chart(leftCtx, {
        type: 'bar',
        data: {
          labels: ["Products", "Memberships"],
          datasets: [{
            label: 'Charges',
            data: [initTotals[0], initTotals[1]],
            backgroundColor: "green",
            borderWidth: 1
          }, {
            label: 'Refunds',
            data: [initTotals[2], initTotals[3]],
            backgroundColor: "red",
            borderWidth: 1
          }]
        },
        options: {
          scales: {
            yAxes: [{
              ticks: {
                beginAtZero: true
              }
            }]
          }
        }
      });
      var rightCtx = document.getElementById("rightChart").getContext('2d');
      var rightChart = new Chart(rightCtx, {
        type: 'doughnut',
        data: {
          labels: ["Charged", "Refunded"],
          datasets: [{
            label: ["Products", "Refunded Products"],
            data: [initCounts[0], initCounts[2]],
            backgroundColor: ["green", "red"],
            borderWidth: 3,
            borderColor: "green"
          }, {
            label: ["Memberships", "Refunded Memberships"],
            data: [initCounts[1], initCounts[3]],
            backgroundColor: ["green", "red"],
            borderWidth: 3,
            borderColor: "red"
          }]
        },
        options: {
          tooltips: {
            callbacks: {
              label: function label(item, data) {
                return data.datasets[item.datasetIndex].label[item.index] + ": " + data.datasets[item.datasetIndex].data[item.index];
              }
            }
          },
          legend: {
            display: true,
            labels: {
              fontColor: 'black'
            }
          },
          scales: {
            yAxes: [{
              ticks: {
                beginAtZero: true
              }
            }]
          }
        }
      });
      console.log(rightChart);
      this.leftChart = leftChart;
      this.rightChart = rightChart;
    }
  }, {
    key: "removeDataFromChart",
    value: function removeDataFromChart(chart) {
      chart.data.datasets = [];
      chart.update();
    }
  }, {
    key: "updateDoughChart",
    value: function updateDoughChart(chart, data) {
      chart.data.datasets.push({
        label: ["Products", "Refunded Products"],
        data: [data[0], data[2]],
        backgroundColor: ["green", "red"],
        borderWidth: 1
      });
      chart.data.datasets.push({
        label: ["Memberships", "Refunded Memberships"],
        data: [data[1], data[3]],
        backgroundColor: ["green", "red"],
        borderWidth: 1
      });
      chart.update();
    }
  }, {
    key: "updateBarChart",
    value: function updateBarChart(chart, data) {
      chart.data.datasets.push({
        label: 'Charges',
        data: [data[0], data[1]],
        backgroundColor: "green",
        borderWidth: 1
      });
      chart.data.datasets.push({
        label: 'Refunds',
        data: [data[2], data[3]],
        backgroundColor: "red",
        borderWidth: 1
      });
      chart.update();
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

      getData("/api/stripe_charges/0/".concat(startTimestamp, "/").concat(endTimestamp, "/all_admin/")).then(function (data) {
        console.log(data);

        if (data != "False") {
          console.log("Setting updated data");

          _this3.removeDataFromChart(_this3.leftChart);

          _this3.removeDataFromChart(_this3.rightChart);

          _this3.setState({
            charges: data
          });

          _this3.updateBarChart(_this3.leftChart, _this3.calcTotalAmount(data)[1]);

          _this3.updateDoughChart(_this3.rightChart, _this3.calcTotalAmount(data)[0]);
        } else {
          console.log("No charges found for member!");
        }
      });
    }
  }, {
    key: "render",
    value: function render() {
      var items = this.state.charges;
      return React.createElement("div", {
        className: "col-12"
      }, React.createElement("table", {
        className: "table table-responsive text-center table-bordered table-sm",
        align: "center"
      }, React.createElement("thead", {
        className: "thead-dark"
      }, React.createElement("tr", null, React.createElement("th", null, " Date", React.createElement("input", {
        id: "_datepicker",
        className: "text-center",
        type: "text"
      })), React.createElement("th", null, " Charge Id "), React.createElement("th", null, " Username "), React.createElement("th", null, " Purchase"), React.createElement("th", null, " Amount Charged* "), React.createElement("th", null, " Status "), React.createElement("th", null, " Last 4 "), React.createElement("th", null, " Receipt "))), React.createElement("tbody", {
        className: "table-hover"
      }, items.map(function (el) {
        return React.createElement(ChargeRow, {
          key: el.id,
          id: el.id,
          purchase: el.product_info,
          amount: el.amount,
          created: el.created,
          customer: el.customer,
          description: el.description,
          username: el.metadata.username,
          network_status: el.network_status,
          last4: el.last4,
          receipt_url: el.receipt_url,
          refunded: el.refunded
        });
      }), React.createElement("tr", null, React.createElement("td", {
        colSpan: "10"
      }, "* Taxes and fees")))), React.createElement("div", {
        className: "row"
      }, React.createElement("div", {
        className: "col-6"
      }, React.createElement("canvas", {
        id: "leftChart",
        className: "chart",
        width: "400",
        height: "300"
      })), React.createElement("div", {
        className: "col-6"
      }, React.createElement("canvas", {
        id: "rightChart",
        className: "chart",
        width: "400",
        height: "300"
      }))));
    }
  }]);

  return ChargeTable;
}(React.Component);