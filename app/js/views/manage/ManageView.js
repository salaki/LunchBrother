define([
  'text!templates/manage/manageTemplate.html'
], function(manageTemplate){

  var ManageView = Parse.View.extend({
    el: $("#page"),
    
    template: _.template(manageTemplate),
    
    render: function(){
      
      $('.menu li').removeClass('active');
      $('.menu li a[href="#pay"]').parent().addClass('active');
      this.$el.html(this.template());
			$('.btn-check').click(function(){
				$('.modal').modal('show');
			})
    }

  });

  return ManageView;
  
});