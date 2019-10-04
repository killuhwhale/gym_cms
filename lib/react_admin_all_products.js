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
function reactAdminGetProducts(root) {
  getData("/api/stripe_charges/0/0/0/all_admin_gym_product/ ").then(function (charges) {
    if (charges.length < 1) {
      charges = [{
        "metadata": {
          "username": "No Products Found",
          "charge_type": "none"
        },
        "products": [{
          "name": "none",
          "price": 0,
          "qty": "1"
        }],
        refunded: false,
        amount: "0.0"
      }];
    }

    ReactDOM.unmountComponentAtNode(root);
    console.log(charges);
    ReactDOM.render(React.createElement(ProductTable, {
      charges: charges
    }), root);
  });
}

function ProductRow(props) {
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

function ProductTotalsRow(props) {
  return React.createElement("tr", null, React.createElement("td", null, " ", props.productName, " "), React.createElement("td", null, props.chargeCount), React.createElement("td", null, props.chargeTotal), React.createElement("td", null, props.refundCount), React.createElement("td", null, props.refundTotal));
}

var ProductTable =
/*#__PURE__*/
function (_React$Component) {
  _inherits(ProductTable, _React$Component);

  function ProductTable(props) {
    var _this;

    _classCallCheck(this, ProductTable);

    _this = _possibleConstructorReturn(this, _getPrototypeOf(ProductTable).call(this, props));
    _this.state = {
      charges: props.charges,
      productInfo: {}
    };
    _this.leftChart = null;
    _this.rightChart = null;
    return _this;
  }

  _createClass(ProductTable, [{
    key: "calculateTotals",
    value: function calculateTotals(items) {
      var all_products = {};
      items.map(function (el) {
        var amount = el.amount,
            charge_type = el.metadata.charge_type,
            products = el.products,
            refunded = el.refunded; // append new products

        products.map(function (product) {
          var name = product.name,
              price = product.price,
              qty = product.qty;
          var status = refunded ? "refunded" : "";
          var key = "".concat(name);

          if (all_products.hasOwnProperty(key)) {
            if (refunded) {
              all_products[key].refunds.count += parseInt(qty);
              all_products[key].refunds.subtotal += price * parseInt(qty);
            } else {
              all_products[key].charges.count += parseInt(qty);
              all_products[key].charges.subtotal += price * parseInt(qty);
            }
          } else {
            all_products[key] = {
              "charges": {
                "count": !refunded ? parseInt(qty) : 0,
                "subtotal": !refunded ? price * parseInt(qty) : 0
              },
              "refunds": {
                "count": refunded ? parseInt(qty) : 0,
                "subtotal": refunded ? price * parseInt(qty) : 0
              }
            };
          }
        });
      });
      console.log("All Products");
      console.log(all_products);
      this.setState({
        productInfo: all_products
      });
      return all_products;
    }
  }, {
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
      this.loadCharts();
    }
  }, {
    key: "loadCharts",
    value: function loadCharts() {
      var data = this.calculateTotals(this.props.charges);
      this.calculateTotals(this.props.charges);
      var chargeTotal = [];
      var chargeCount = [];
      var refundTotal = [];
      var refundCount = [];
      Object.keys(data).map(function (key) {
        chargeTotal.push(data[key]['charges'].subtotal);
        refundTotal.push(data[key]['refunds'].subtotal);
        chargeCount.push(data[key]['charges'].count);
        refundCount.push(data[key]['refunds'].count);
      }); // Charts

      var leftCtx = document.getElementById("leftChart").getContext('2d');
      var leftChart = new Chart(leftCtx, {
        type: 'bar',
        data: {
          labels: Object.keys(data),
          datasets: [{
            label: 'Charged',
            data: chargeTotal,
            backgroundColor: "green",
            borderWidth: 1
          }, {
            label: 'Refunded',
            data: refundTotal,
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
          labels: Object.keys(data),
          datasets: [{
            label: Object.keys(data),
            data: chargeCount,
            backgroundColor: ["green", "red"],
            borderWidth: 3,
            borderColor: "green"
          }, {
            label: Object.keys(data),
            data: refundCount,
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
      var radarCtxCount = document.getElementById("radarChartCount").getContext('2d');
      var radarChartCount = new Chart(radarCtxCount, {
        type: 'radar',
        data: {
          labels: ["Prouct 1", "Product 2", "Product 3", "Product 4"],
          datasets: [{
            label: "Dataset1-Counts-charged",
            data: chargeCount,
            backgroundColor: "rgba(0,255,0,.1)",
            borderWidth: 3,
            borderColor: "green",
            fill: "origin"
          }, {
            label: "Dataset2-Counts-refunded",
            data: refundCount,
            backgroundColor: "rgba(255,0,0,.1)",
            borderWidth: 3,
            borderColor: "red"
          }]
        },
        options: {
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
      var radarCtxTotals = document.getElementById("radarChartTotals").getContext('2d');
      var radarChartTotals = new Chart(radarCtxTotals, {
        type: 'radar',
        data: {
          labels: Object.keys(data),
          datasets: [{
            label: "Dataset1-Totals-charged",
            data: chargeTotal,
            backgroundColor: "rgba(0,255,0,.1)",
            borderWidth: 3,
            borderColor: "green",
            fill: "origin"
          }, {
            label: "Dataset2-Totals-refunded",
            data: refundTotal,
            backgroundColor: "rgba(255,0,0,.1)",
            borderColor: "red",
            borderWidth: 3
          }]
        },
        options: {
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
      this.radarChartCount = radarChartCount;
      this.radarChartTotals = radarChartTotals;
    }
  }, {
    key: "removeDataFromChart",
    value: function removeDataFromChart(chart) {
      chart.data.datasets = [];
      chart.update();
    }
  }, {
    key: "updateRadarChartTotal",
    value: function updateRadarChartTotal(chart, data) {
      chart.data.labels = Object.keys(data);
      var charge_data = [];
      var refund_data = [];
      Object.keys(data).map(function (key) {
        charge_data.push(data[key]['charges'].subtotal);
        refund_data.push(data[key]['refunds'].subtotal);
      });
      chart.data.datasets.push({
        label: "Charged",
        data: charge_data,
        backgroundColor: "rgba(0,255,0,.1)",
        borderColor: "green",
        borderWidth: 3
      });
      chart.data.datasets.push({
        label: "Refunded",
        data: refund_data,
        backgroundColor: "rgba(255,0,0,.1)",
        borderColor: "red",
        borderWidth: 3
      });
      chart.update();
    }
  }, {
    key: "updateRadarChartCount",
    value: function updateRadarChartCount(chart, data) {
      chart.data.labels = Object.keys(data);
      var charge_data = [];
      var refund_data = [];
      Object.keys(data).map(function (key) {
        charge_data.push(data[key]['charges'].count);
        refund_data.push(data[key]['refunds'].count);
      });
      chart.data.datasets.push({
        label: "Charged",
        data: charge_data,
        backgroundColor: "rgba(0,255,0,.1)",
        borderColor: "green",
        borderWidth: 3
      });
      chart.data.datasets.push({
        label: "Refunded",
        data: refund_data,
        backgroundColor: "rgba(255,0,0,.1)",
        borderColor: "red",
        borderWidth: 3
      });
      chart.update();
    }
  }, {
    key: "updateDoughChart",
    value: function updateDoughChart(chart, data) {
      var charge_data = [];
      var refund_data = [];
      Object.keys(data).map(function (key) {
        charge_data.push(data[key]['charges'].count);
        refund_data.push(data[key]['refunds'].count);
      });
      var labels = Object.keys(data);
      chart.data.labels = labels;
      chart.data.datasets.push({
        label: labels,
        data: charge_data,
        backgroundColor: ["green", "yellow", "blue", "red", "brown", "orange"],
        borderWidth: 1
      });
      chart.data.datasets.push({
        label: Object.keys(data).map(function (key) {
          return "Refunded ".concat(key);
        }),
        data: refund_data,
        backgroundColor: ["green", "yellow", "blue", "red", "brown", "orange"],
        borderWidth: 1
      });
      chart.update();
    }
  }, {
    key: "updateBarChart",
    value: function updateBarChart(chart, data) {
      var charge_data = [];
      var refund_data = [];
      Object.keys(data).map(function (key) {
        charge_data.push(data[key]['charges'].subtotal);
        refund_data.push(data[key]['refunds'].subtotal);
      });
      chart.data.labels = Object.keys(data);
      chart.data.datasets.push({
        label: "Charged",
        data: charge_data,
        backgroundColor: "green",
        borderWidth: 1
      });
      chart.data.datasets.push({
        label: "Refunded",
        data: refund_data,
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

      getData("/api/stripe_charges/0/".concat(startTimestamp, "/").concat(endTimestamp, "/all_admin_gym_product/")).then(function (data) {
        console.log(data);

        if (data.length > 0) {
          console.log("Setting updated data");

          _this3.removeDataFromChart(_this3.leftChart);

          _this3.removeDataFromChart(_this3.rightChart);

          _this3.removeDataFromChart(_this3.radarChartCount);

          _this3.removeDataFromChart(_this3.radarChartTotals);

          _this3.setState({
            charges: data
          });

          var crunchedData = _this3.calculateTotals(data);

          _this3.updateBarChart(_this3.leftChart, crunchedData);

          _this3.updateDoughChart(_this3.rightChart, crunchedData);

          _this3.updateRadarChartCount(_this3.radarChartCount, crunchedData);

          _this3.updateRadarChartTotal(_this3.radarChartTotals, crunchedData);
        } else {
          console.log("No charges found for member!");
        }
      });
    }
  }, {
    key: "render",
    value: function render() {
      var _this4 = this;

      var items = this.state.charges;
      var chargeTotal = 0;
      var refundTotal = 0;
      items.map(function (el) {
        if (el.refunded) {
          refundTotal += parseFloat(el.amount);
        } else {
          chargeTotal += parseFloat(el.amount);
        }
      });
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
        return React.createElement(ProductRow, {
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
      }, "* Taxes and fees")))), React.createElement("table", {
        className: "table table-responsive text-center table-bordered table-sm",
        align: "center"
      }, React.createElement("thead", {
        className: "thead-dark"
      }, React.createElement("tr", null, React.createElement("th", null, " Charge Total "), React.createElement("th", null, " Refund Total "))), React.createElement("tbody", {
        className: "table-hover"
      }, React.createElement("tr", {
        key: "totalsRow"
      }, React.createElement("td", null, chargeTotal), React.createElement("td", null, refundTotal)))), React.createElement("table", {
        className: "table table-responsive text-center table-bordered table-sm",
        align: "center"
      }, React.createElement("thead", {
        className: "thead-dark"
      }, React.createElement("tr", null, React.createElement("td", null, " Product "), React.createElement("td", null, " Charged "), React.createElement("td", null, " Sutotal "), React.createElement("td", null, " Refunded "), React.createElement("td", null, " Sutotal "))), React.createElement("tbody", {
        className: "table-hover"
      }, Object.keys(this.state.productInfo).map(function (product) {
        return React.createElement(ProductTotalsRow, {
          key: product,
          productName: product,
          chargeCount: _this4.state.productInfo[product]["charges"].count,
          chargeTotal: _this4.state.productInfo[product]["charges"].subtotal,
          refundCount: _this4.state.productInfo[product]["refunds"].count,
          refundTotal: _this4.state.productInfo[product]["refunds"].subtotal
        });
      }))), React.createElement("div", {
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
      })), React.createElement("div", {
        className: "col-6"
      }, React.createElement("canvas", {
        id: "radarChartTotals",
        className: "chart",
        width: "400",
        height: "300"
      })), React.createElement("div", {
        className: "col-6"
      }, React.createElement("canvas", {
        id: "radarChartCount",
        className: "chart",
        width: "400",
        height: "300"
      }))));
    }
  }]);

  return ProductTable;
}(React.Component);