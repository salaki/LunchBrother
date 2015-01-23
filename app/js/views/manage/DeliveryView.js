define([
  'views/manage/LoginView',
  'text!templates/manage/deliveryTemplate.html'
], function(LoginView, deliveryTemplate) {

  var DeliveryView = Parse.View.extend({
    el: $("#page"),

    initialize: function() {
      _.bindAll(this, 'render');
    },

    template: _.template(deliveryTemplate),

    render: function() {
      this.$el.html(this.template(this.model.toJSON()));
      return this;
    }

  });
  return DeliveryView;
});