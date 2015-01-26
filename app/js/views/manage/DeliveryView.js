define([
  'views/manage/LoginView',
  'text!templates/manage/deliveryTemplate.html'
], function (LoginView, deliveryTemplate) {

    var DeliveryView = Parse.View.extend({
        el: $("#page"),

        initialize: function () {
            _.bindAll(this, 'render');
        },

        template: _.template(deliveryTemplate),

        render: function () {
            var totalNumber = this.model.length;
            $('.delivery-order').text(totalNumber);
            this.$el.html(this.template());
            return this;
        }

    });
    return DeliveryView;
});