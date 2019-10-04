"use strict";

function _typeof(obj) { if (typeof Symbol === "function" && typeof Symbol.iterator === "symbol") { _typeof = function _typeof(obj) { return typeof obj; }; } else { _typeof = function _typeof(obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; }; } return _typeof(obj); }

function _toConsumableArray(arr) { return _arrayWithoutHoles(arr) || _iterableToArray(arr) || _nonIterableSpread(); }

function _nonIterableSpread() { throw new TypeError("Invalid attempt to spread non-iterable instance"); }

function _iterableToArray(iter) { if (Symbol.iterator in Object(iter) || Object.prototype.toString.call(iter) === "[object Arguments]") return Array.from(iter); }

function _arrayWithoutHoles(arr) { if (Array.isArray(arr)) { for (var i = 0, arr2 = new Array(arr.length); i < arr.length; i++) { arr2[i] = arr[i]; } return arr2; } }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } }

function _createClass(Constructor, protoProps, staticProps) { if (protoProps) _defineProperties(Constructor.prototype, protoProps); if (staticProps) _defineProperties(Constructor, staticProps); return Constructor; }

function _possibleConstructorReturn(self, call) { if (call && (_typeof(call) === "object" || typeof call === "function")) { return call; } return _assertThisInitialized(self); }

function _assertThisInitialized(self) { if (self === void 0) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return self; }

function _getPrototypeOf(o) { _getPrototypeOf = Object.setPrototypeOf ? Object.getPrototypeOf : function _getPrototypeOf(o) { return o.__proto__ || Object.getPrototypeOf(o); }; return _getPrototypeOf(o); }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function"); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, writable: true, configurable: true } }); if (superClass) _setPrototypeOf(subClass, superClass); }

function _setPrototypeOf(o, p) { _setPrototypeOf = Object.setPrototypeOf || function _setPrototypeOf(o, p) { o.__proto__ = p; return o; }; return _setPrototypeOf(o, p); }

// get init data and populate Panel
function reactAdminGetSubs(root) {
  getData("/api/stripe_subscriptions/0/0/0/all_admin/ ").then(function (subs) {
    if (subs.length == 0) {
      subs = [{
        "id": -1,
        "username": "No Subscriptions Found",
        "amount": "0",
        "interval": "Eternity",
        "status": "Son"
      }];
    }

    ReactDOM.unmountComponentAtNode(root);
    console.log(subs);
    ReactDOM.render(React.createElement(SubscriptionTable, {
      subs: subs
    }), root);
  });
}

function SubRow(props) {
  var rowStyle = props.status == "canceled" ? "table-danger" : props.status == "trialing" ? "table-info" : props.status == "active" ? "table-success" : "table-warning";
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
  }, " ", props.products)), React.createElement("td", null, React.createElement("span", {
    className: "d-inline-block text-truncate"
  }, " $", props.amount)), React.createElement("td", null, React.createElement("span", {
    className: "d-inline-block text-truncate"
  }, " ", props.status)), React.createElement("td", null, React.createElement("span", {
    className: "d-inline-block text-truncate"
  }, " ", props.customer)), React.createElement("td", null, React.createElement("span", {
    className: "d-inline-block text-truncate"
  }, props.interval)));
}

var SubscriptionTable =
/*#__PURE__*/
function (_React$Component) {
  _inherits(SubscriptionTable, _React$Component);

  function SubscriptionTable(props) {
    var _this;

    _classCallCheck(this, SubscriptionTable);

    _this = _possibleConstructorReturn(this, _getPrototypeOf(SubscriptionTable).call(this, props));
    _this.state = {
      subs: props.subs
    };
    _this.leftChart = null;
    _this.rightChart = null;
    return _this;
  }

  _createClass(SubscriptionTable, [{
    key: "componentDidMount",
    value: function componentDidMount() {
      var _this2 = this;

      var d = $('input[id="_datepicker"]');
      d.daterangepicker({
        opens: 'left'
      }, function (start, end, label) {
        _this2.updateData(start, end);
      });
      this.loadCharts();
    }
  }, {
    key: "calcTotalAmount",
    value: function calcTotalAmount(items) {
      var intervals = {};
      var statusSet = new Set(); // collect data by interval, tally count and sum totals
      // {
      // 	interval1:{
      // 		status1 : {
      // 			count : a,
      // 			total : aa
      // 		},
      // 		status2 : {
      // 			count : a1,
      // 			total : aa1
      // 		},
      // 		...
      // 	},
      // 	interval2 : {
      // 		status2 : {
      // 			count : z,
      // 			total : zz
      // 		},
      // 		status3 : {
      // 			count : z1,
      //			total : zz1
      // 		}
      // 	}
      // }
      // Problem: Each interval may not have the same statuses. Which makes generating uniform datasets not so straightforward.
      // Process data and create a dict of intervals, each ineral should be a dict of lists.
      // labels = [status1. status 2. status3]
      // interval1 = {				   ----> dataset
      // counts =  [a, a1, 0],   ----> list of data for a bar graph 
      // totals = [aa, aa1, 0]   ----> list of data for a bar graph
      // }
      // interval2 = {
      // counts =  [0, z, zz],
      // totals = [0, zz, zz1]
      // }

      items.map(function (el) {
        var amount = el.amount,
            interval = el.interval,
            status = el.status;
        var key = "".concat(interval);
        statusSet.add(status);

        if (intervals.hasOwnProperty(key)) {
          if (intervals[key].hasOwnProperty(status)) {
            intervals[key][status].count++;
            intervals[key][status].total += parseFloat(amount);
          } else {
            intervals[key][status] = {
              "count": 1,
              "total": parseFloat(amount)
            };
          }
        } else {
          // Track statuses
          intervals[key] = {};
          intervals[key][status] = {
            "count": 1,
            "total": parseFloat(amount)
          };
        }
      });
      var finalDataset = {}; // For each interval

      Object.keys(intervals).map(function (interval) {
        var intervalCounts = [];
        var intervalTotals = []; // For each status

        statusSet.forEach(function (status) {
          if (intervals[interval].hasOwnProperty(status)) {
            intervalCounts.push(intervals[interval][status].count);
            intervalTotals.push(intervals[interval][status].total);
          } else {
            intervalCounts.push(0);
            intervalTotals.push(0);
          }
        });
        finalDataset[interval] = {
          "counts": intervalCounts,
          "totals": intervalTotals
        };
      });
      return [_toConsumableArray(statusSet), finalDataset];
    }
  }, {
    key: "loadCharts",
    value: function loadCharts() {
      // Charts
      var leftCtx = document.getElementById("leftChart").getContext('2d');
      var intervals = this.calcTotalAmount(this.props.subs);
      var initTotal = Object.keys(intervals).map(function (key) {
        return intervals[key].total;
      });
      var initCount = Object.keys(intervals).map(function (key) {
        return intervals[key].count;
      });
      var leftChart = new Chart(leftCtx, {
        type: 'bar',
        data: {
          labels: ['active', 'trials', 'canceled', 'unpaid', "incomplete", "incomplete_expired"],
          datasets: [{
            label: 'Subscriptions',
            data: initTotal,
            backgroundColor: ["green", "blue", "yellow", "red", "orange", "grey"],
            borderWidth: 1
          }]
        },
        options: {
          maintainAspectRatio: false,
          aspectRatio: .01,
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
          labels: Object.keys(intervals),
          datasets: [{
            data: Object.keys(intervals).map(function (key) {
              return intervals[key].count;
            }),
            backgroundColor: ["green", "red", "blue", "yellow"],
            borderWidth: 3,
            borderColor: "green"
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
      this.leftChart = leftChart;
      this.rightChart = rightChart;
    }
  }, {
    key: "removeDataFromChart",
    value: function removeDataFromChart(chart) {
      chart.data.labels = [];
      chart.data.datasets = [];
      chart.update();
    }
  }, {
    key: "updateBarChart",
    value: function updateBarChart(chart, data) {
      console.log("Updating bar chart");
      console.log(data);
      var labels = data[0];
      data = data[1];
      chart.data.labels = labels;
      Object.keys(data).map(function (interval) {
        chart.data.datasets.push({
          label: interval,
          data: data[interval].totals,
          backgroundColor: ["green", "blue", "yellow", "red", "orange", "grey"],
          borderWidth: 1
        });
      });
      chart.update();
    }
  }, {
    key: "updateDoughChart",
    value: function updateDoughChart(chart, data) {
      console.log("Updating bar chart");
      console.log(data);
      var labels = data[0];
      data = data[1];
      chart.data.labels = labels;
      Object.keys(data).map(function (interval) {
        console.log("Tester");
        console.log(labels.map(function (status) {
          return "".concat(interval, "_").concat(status);
        }));
        chart.data.datasets.push({
          label: labels.map(function (status) {
            return "".concat(interval, "_").concat(status);
          }),
          data: data[interval].counts,
          backgroundColor: ["green", "blue", "yellow", "red", "orange", "grey"],
          borderWidth: 1
        });
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

      getData("/api/stripe_subscriptions/0/".concat(startTimestamp, "/").concat(endTimestamp, "/all_admin/")).then(function (data) {
        if (data != "False") {
          _this3.removeDataFromChart(_this3.leftChart);

          _this3.removeDataFromChart(_this3.rightChart);

          _this3.setState({
            subs: data
          });

          _this3.updateBarChart(_this3.leftChart, _this3.calcTotalAmount(data));

          _this3.updateDoughChart(_this3.rightChart, _this3.calcTotalAmount(data));
        } else {
          console.log("No charges found for member!");
        }
      });
    }
  }, {
    key: "render",
    value: function render() {
      var items = this.state.subs;
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
      })), React.createElement("th", null, " Charge Id "), React.createElement("th", null, " Username "), React.createElement("th", null, " Purchase"), React.createElement("th", null, " Amount Charged* "), React.createElement("th", null, " Status "), React.createElement("th", null, " Customer "), React.createElement("th", null, " Interval "))), React.createElement("tbody", {
        className: "table-hover"
      }, items.map(function (el) {
        return React.createElement(SubRow, {
          key: el.id,
          created: el.created,
          id: el.id,
          username: el.username,
          products: JSON.stringify(el.products),
          amount: el.amount,
          status: el.status,
          customer: el.customer,
          interval: el.interval
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
        width: "1",
        height: "1"
      })), React.createElement("div", {
        className: "col-6"
      }, React.createElement("canvas", {
        id: "rightChart",
        className: "chart",
        width: "1",
        height: "1"
      }))));
    }
  }]);

  return SubscriptionTable;
}(React.Component);