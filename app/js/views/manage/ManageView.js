define([
  'text!templates/manage/manageTemplate.html'
], function(manageTemplate){

  var ManageView = Parse.View.extend({
    el: $("#page"),
    
    template: _.template(manageTemplate),
    
    render: function(){
      $('.menu li').removeClass('active');
      $('.menu li a[href="#"]').parent().addClass('active');
      this.$el.html(this.template());
    },
    
    logOut: function(e) {
      Parse.User.logOut();
      this.undelegateEvents();
      delete this;
    },
  });

  return ManageView;
  
});