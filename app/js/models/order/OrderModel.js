define(function(){
  //when onclick, change model field: quantity
  var OrderModel = Parse.Object.extend("Order");
  return OrderModel;
});