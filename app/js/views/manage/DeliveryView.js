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
            var finalPrice = this.model.get('final1') + this.model.get('final2');
            this.model.set('final', finalPrice);
            this.$el.html(this.template(this.model.toJSON()));
            return this;
        }

    });
    return DeliveryView;
});