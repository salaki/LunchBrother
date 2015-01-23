define([
  'models/order/PaymentModel',
  'models/order/OrderModel',
  'views/manage/DeliveryView',
  'text!templates/manage/loginTemplate.html'
], function(PaymentModel, OrderModel, DeliveryView, loginTemplate) {

  var LoginView = Parse.View.extend({
    el: $("#page"),

    events: {
      'submit #loginForm': 'continueLogin'
    },

    initialize: function() {
      _.bindAll(this, 'render', 'continueLogin');
    },

    template: _.template(loginTemplate),

    render: function() {
      this.$el.html(this.template());
      this.$('.ui.form').form({
        'username': {
          identifier: 'username',
          rules: [{
            type: 'empty',
            prompt: 'Please enter your username'
          }]
        },
        'password': {
          identifier: 'password',
          rules: [{
            type: 'empty',
            prompt: 'Please enter your password'
          }]
        }
      }, {
        on: 'blur',
        inline: 'true'
      });
      return this;
    },

    continueLogin: function(e) {
      var self = this;
      var username = this.$("#username").val();
      var password = this.$("#password").val();
      
      var found = "Combo";
      var orderDetails = new OrderModel();
      orderDetails.set('comboQuantity1', 0);
      orderDetails.set('dishQuantity1', 0);
      orderDetails.set('comboQuantity2', 0);
      orderDetails.set('dishQuantity2', 0);
      var today = new Date();
      today.setHours(0, 0, 0, 0);
      var tomorrow = new Date();
      tomorrow.setHours(0, 0, 0, 0);
      tomorrow.setDate(tomorrow.getDate() + 1);
      var tdcomboinQuery1 = new Parse.Query(PaymentModel);
      tdcomboinQuery1.greaterThanOrEqualTo("createdAt", today);
      tdcomboinQuery1.lessThanOrEqualTo("createdAt", tomorrow);
      tdcomboinQuery1.equalTo("address", "RDPG");

      tdcomboinQuery1.find({
        success: function(results) {
          _.each(results, function(result) {
            var dish1= result.get("dishName1");
            if (dish1 !== undefined) {
              var quantity1 = result.get("quantity1");
              if (dish1.match(found)) {
                orderDetails.set('comboQuantity1', quantity1);
              } 
              if(!dish1.match(found)) {
                orderDetails.set('dishQuantity1', quantity1);
              }
            }
            var dish2 = result.get("dishName2");
            if (dish2 !== undefined) {
              var quantity2 = result.get("quantity2");
              if (dish2.match(found)) {
                orderDetails.set('comboQuantity1', quantity2);
              }
              if(!dish2.match(found)) {
                orderDetails.set('dishQuantity1', quantity2);
              }
            }
          });
          var final1 = (orderDetails.get('comboQuantity1') + orderDetails.get('dishQuantity1')) * 10;
          orderDetails.set("final1", final1);
          orderDetails.set("date", today);
          orderDetails.save();
        },
        error: function(error) {
          alert("Error: " + error.code + " " + error.message);
        }
      });
      var tdcomboinQuery2 = new Parse.Query(PaymentModel);
      tdcomboinQuery2.greaterThanOrEqualTo("createdAt", today);
      tdcomboinQuery2.lessThanOrEqualTo("createdAt", tomorrow);
      tdcomboinQuery2.equalTo("address", "VM");
      tdcomboinQuery2.find({
        success: function(results) {
          _.each(results, function(result) {
            var dish1 = result.get("dishName1");
            if (dish1 !== undefined) {
              var quantity1 = result.get("quantity1");
              if (dish1.match(found)) {
                orderDetails.set('comboQuantity2', quantity1);
              }
              if(!dish1.match(found)) {
                orderDetails.set('dishQuantity2', quantity1);
              }
            }
            
            var dish2 = result.get("dishName2");
            if (dish2 !== undefined) {
              var quantity2 = result.get("quantity2");
              if (dish2.match(found)) {
                orderDetails.set('comboQuantity2', quantity2);
              }
              if(!dish2.match(found)) {
                orderDetails.set('dishQuantity2', quantity2);
              }
            }
          });

          var final2 = (orderDetails.get('comboQuantity2') + orderDetails.get('dishQuantity2')) * 10;
          orderDetails.set("final2", final2);
          orderDetails.set("date", today);
          orderDetails.save();
        },
        error: function(error) {
          alert("Error: " + error.code + " " + error.message);
        }
      });

      Parse.User.logIn(username, password, {
        success: function(user) {
          var view = new DeliveryView({
            model: orderDetails
          });
          $("#reminder,#loginInfo").remove();
          $("#page").append(view.render().el);
        },
        error: function(user, error) {
          self.$("#loginInfo .error").html("Invalid username or password. Please try again.").show();
          self.$("#loginForm button").removeAttr("disabled");
        }
      });
      var $form = this.$('form');
      $form.find('#loginBtn').prop('disabled', true);
      return false;
    }
  });
  return LoginView;
});
