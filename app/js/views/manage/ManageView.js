define([
  'views/status/StatusView',
  'models/order/PaymentModel',
  'models/order/OrderModel',
  'models/manage/DeliveryModel',
  'text!templates/manage/manageTemplate.html',
  'text!templates/manage/orderListTemplate.html',
], function(StatusView, PaymentModel, OrderModel, DeliveryModel, manageTemplate, orderListTemplate) {
  var ManageView = Parse.View.extend({
    el: $("#page"),
    template: _.template(manageTemplate),
    orderListTemplate: _.template(orderListTemplate),
    events: {
      //view listenTo model change
      'keyup #searchInput': 'onSearchBarInput',
      'change #addressOption': 'onAddressSelect',
      'click #arriveBtn': 'updateStatus'
    },

    initialize: function() {
      _.bindAll(this, 'render', 'updateStatus', 'onAddressSelect');
    },

    render: function() {
      $('.menu li').removeClass('active');
      $('.menu li a[href="#"]').parent().addClass('active');
      $('select.dropdown').dropdown({
        'addressOption': {
          identifier: 'addressOption',
          rules: [{
            type: 'empty',
            prompt: 'Please select a location'
          }]
        },
      },{
        on: 'blur',
        inline: 'true'
      });
      var paymentQuery = new Parse.Query(PaymentModel);
      paymentQuery.ascending("lname");
      var self = this;
      this.$el.html(this.template());
      this.$("#buildingLabel").text("总共");
      this.applyQuery(paymentQuery, self);
    },

    logOut: function(e) {
      Parse.User.logOut();
      this.undelegateEvents();
      delete this;
    },

    onSearchBarInput: function() {
      var paymentQuery = new Parse.Query(PaymentModel);
      this.$("#addressOption").val("");
      var searchText = this.$("#searchInput").val();
      if (searchText != "") {
        paymentQuery.contains("lname", searchText);
        this.$("#searchResultLabel").text("符合搜寻");
      }
      else {
        this.$("#searchResultLabel").text("");
      }
      paymentQuery.ascending("lname");
      var self = this;
      this.applyQuery(paymentQuery, self);
    },

    onAddressSelect: function() {
      var paymentQuery = new Parse.Query(PaymentModel);
      this.$("#searchResultLabel").text("");
      this.$("#searchInput").val("");
      paymentQuery.contains("address", this.$("#addressOption").val());
      paymentQuery.ascending("lname");
      if (this.$("#addressOption").val() == "RDPG") {
        this.$("#buildingLabel").text("Regents Drive Parking Garage");
      }
      else if (this.$("#addressOption").val() == "VM") {
        this.$("#buildingLabel").text("Van Munching");
      }
      else {
        this.$("#buildingLabel").text("总共");
      }
      var self = this;
      this.applyQuery(paymentQuery, self);
    },

    applyQuery: function(query, self) {
      query.find({
        success: function(results) {
          self.$("#orderNumberLabel").text(results.length);
          self.$("#orderList").html(self.orderListTemplate({
            orders: results
          }));
        },
        error: function(error) {
          alert("Error: " + error.code + " " + error.message);
        }
      });
    },

    //date and getCurrentUser
    updateStatus: function() {
      $("#arriveBtn").click(function() {
        var statusDetails = new DeliveryModel({
          defaults: {
            status1: "正在路上...",
            status2: "正在路上..."
          }
        });

        var deliveryDetails = new DeliveryModel();
        // var name = Parse.User.current();
        if ($("#buildingLabel").text("总共")) {
          statusDetails.set('status1', '我已到达!');
          statusDetails.set('status2', '我已到达!');
          deliveryDetails.set('status', "我已到达!");
          deliveryDetails.set('address', "我已到达!");
        }

        if ($("#buildingLabel").text("Regents Drive Parking Garage")) {
          statusDetails.set('status1', '我已到达!');
        }

        if ($("#buildingLabel").text("Van Munching")) {
          statusDetails.set('status2', '我已到达!');
        }

        var view = new StatusView({
          model: statusDetails
        })


        //   var $this = $(this);
        //     $this.toggleClass('arrive');
        // if($(this).hasClass('arrive')){
        //     $(this).text('正在路上');
        // }else{
        //     $(this).text('我已到达');
        // }
      });
    }
  });

  return ManageView;

});