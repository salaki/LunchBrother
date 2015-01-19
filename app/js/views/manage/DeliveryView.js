//query: Address:address
//       Date:createdAt query.greaterThan("updateAt", )
//       Total:totalPrice = quantity * 10
//quantity: dish contains Combo 
//dishName1 || dishName2: Combo
//Has Combo: Quantity1 + Quantity2
//No Combo:
define([
  'models/order/PaymentModel',
  'views/manage/LoginView',
  'text!templates/manage/deliveryTemplate.html'
], function(PaymentModel, LoginView, deliveryTemplate) {

  var DeliveryView = Parse.View.extend({
    el: $("#page"),

    initialize: function() {
      var businessDetails = new PaymentModel();
      var today = new Date();
      today.setHours(0, 0, 0, 0);
      var tomorrow = new Date();
      tomorrow.setHours(0, 0, 0, 0);
      tomorrow.setDate(tomorrow.getDate() + 1);
      var tdcomboinQuery = new Parse.Query(PaymentModel);
      tdcomboinQuery.greaterThanOrEqualTo("createdAt", today);
      tdcomboinQuery.lessThanOrEqualTo("createdAt", tomorrow);
      tdcomboinQuery.equalTo("address", "College Park,MD");
      // var subcomboQuery1 = tdcomboinQuery.contains("dishName1", "Combo");
      // var subcomboQuery2 = tdcomboinQuery.contains("dishName2", "Combo");
      // var tdcomboQuery = Parse.Query.or(subcomboQuery1,subcomboQuery2);
      tdcomboinQuery.find({
        success: function(results) {
          console.log(results);
          _.each(results,function(result){
             var dish1 = result.get("dishName1");
             var dish2 = result.get("dishName2");
          }); 
        },
        error: function(error) {
          alert("Error: " + error.code + " " + error.message);
        }
      });
      _.bindAll(this, 'render');
    },

    template: _.template(deliveryTemplate),

    render: function() {
      this.$el.html(this.template());
      return this;
    },
  });
  return DeliveryView;
});