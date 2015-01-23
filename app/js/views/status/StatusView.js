define([
  'models/manage/DeliveryModel',
  'text!templates/status/statusTemplate.html'
], function(DeliveryModel,statusTemplate){

  var StatusView = Parse.View.extend({
    el: $("#page"),
    
    template: _.template(statusTemplate),
    
    initialize: function(){
      _.bindAll(this,'render');
   },
    
    render: function(){
      $('.menu li').removeClass('active');
      $('.menu li a[href="#"]').parent().addClass('active');
      var statusQuery = new Parse.Query(DeliveryModel);
      var today = new Date();
      today.setHours(0, 0, 0, 0);
      var tomorrow = new Date();
      tomorrow.setHours(0, 0, 0, 0);
      tomorrow.setDate(tomorrow.getDate() + 1);
      statusQuery.greaterThanOrEqualTo("createdAt", today);
      statusQuery.lessThanOrEqualTo("createdAt", tomorrow);
      statusQuery.find({
        success:function(results){
          _.each(results,function(result){
            var status1 = result.get('status1');
            var status2 = result.get('status2');
            if(status1 !== undefined){
              $('#status1').text(status1);
              $('#status1').addClass("arrived");
            }
            if(status2 !== undefined){
            $('#status2').text(status2);
            $('#status2').addClass("arrived");
            }
        });
      },
      error: function(error){
        alert("Error: " + error.code + " " + error.message);
      }
      });
      this.$el.html(this.template());
      return this;
    }
  });

  return StatusView;
  
});