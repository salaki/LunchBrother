define([
  'jQuery',
  'Underscore',
  'Backbone',
  'models/owner/OrderModel',
  'text!templates/order/orderTemplate.html'
], function($, _, Backbone, OrderModel, orderTemplate){
  
  var FooterView = Backbone.View.extend({
    el: $("#page"),

    initialize: function() {

      var that = this;
      var options = {query: 'thomasdavis'}
     

      var onDataHandler = function(collection) {
          that.render();
      }

      this.model = new OrderModel(options);
      this.model.fetch({ success : onDataHandler, dataType: "jsonp"});

    },

    render: function(){

      var data = {
        owner: this.model.toJSON(),
        _: _ 
      };

      var compiledTemplate = _.template( orderTemplate, data );
      this.$el.html(compiledTemplate);
    }

  });

  return FooterView;
});