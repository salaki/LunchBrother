define([
  //brother click the button,username, status and address pass to the delivery class.
  //Model Changes:View 正在路上 改为 我已到达
  //一进去：所有订单，选择地点，点到达
  //dropdown 取值
  //1个model 2个fields,每个field 一个状态
  'models/manage/DeliveryModel',
  'text!templates/status/statusTemplate.html'
], function(DeliveryModel,statusTemplate){

  var StatusView = Parse.View.extend({
    el: $("#page"),
    
    template: _.template(statusTemplate),
    
    initialize: function(){
      _.bindAll(this,'render');
      console.log(this.model);
   },
    
    render: function(){
      $('.menu li').removeClass('active');
      $('.menu li a[href="#status"]').parent().addClass('active');
      this.$el.html(this.template(this.model.toJSON()));
      return this;
    }
  });

  return StatusView;
  
});