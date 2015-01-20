define([
  'text!templates/manage/manageTemplate.html',
  'text!templates/manage/orderListTemplate.html',
  'models/order/PaymentModel'
], function(manageTemplate, orderListTemplate, PaymentModel){

  var ManageView = Parse.View.extend({
    el: $("#page"),
    template: _.template(manageTemplate),
    orderListTemplate: _.template(orderListTemplate),
      events: {
          'keyup #searchInput': 'onSearchBarInput',
          'change #addressOption': 'onAddressSelect'
      },

    render: function(){
      $('.menu li').removeClass('active');
      $('.menu li a[href="#"]').parent().addClass('active');
        var paymentQuery = new Parse.Query(PaymentModel);
        paymentQuery.ascending("lname");
        var self = this;
        this.$el.html(this.template());
        this.$("#buildingLabel").text("總共");
        this.applyQuery(paymentQuery, self);
    },

      logOut: function(e) {
          Parse.User.logOut();
          this.undelegateEvents();
          delete this;
      },

      onSearchBarInput: function(){
        var paymentQuery = new Parse.Query(PaymentModel);
        this.$("#addressOption").val("");
        var searchText = this.$("#searchInput").val();
        if (searchText != "") {
            paymentQuery.contains("lname", searchText);
            this.$("#searchResultLabel").text("符合搜尋");
        } else {
            this.$("#searchResultLabel").text("");
        }
        paymentQuery.ascending("lname");
        var self = this;
        this.applyQuery(paymentQuery, self);
    },

      onAddressSelect: function(){
          var paymentQuery = new Parse.Query(PaymentModel);
          this.$("#searchResultLabel").text("");
          this.$("#searchInput").val("");
          paymentQuery.contains("address", this.$("#addressOption").val());
          paymentQuery.ascending("lname");
          if (this.$("#addressOption").val() == "College Park") {
              this.$("#buildingLabel").text("化学楼");
          } else if(this.$("#addressOption").val() == "Shady Grove"){
              this.$("#buildingLabel").text("黃鹤楼");
          } else {
              this.$("#buildingLabel").text("總共");
          }
          var self = this;
          this.applyQuery(paymentQuery, self);
      },

      applyQuery: function(query, self) {
          query.find({
              success: function(results) {
                  self.$("#orderNumberLabel").text(results.length);
                  self.$("#orderList").html(self.orderListTemplate({orders: results}));
              },
              error: function(error) {
                  alert("Error: " + error.code + " " + error.message);
              }
          });
      }
  });

  return ManageView;
  
});