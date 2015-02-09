define([
  'views/manage/LoginView',
  'text!templates/manage/deliveryTemplate.html'
], function (LoginView, deliveryTemplate) {

    var DeliveryView = Parse.View.extend({
        el: $("#page"),

        initialize: function () {
            _.bindAll(this, 'render');
            var currentUser = Parse.User.current();
            if(currentUser != null) {
                currentUser.fetch();
                $("#userEmail").text(currentUser.get('email'));
                $("#userPhone").text(currentUser.get('telnum'));
                $("#userFullName").text(currentUser.get('firstName') + " " + currentUser.get('lastName'));
                $("#userCreditBalance").text(currentUser.get('creditBalance'));
                $("#accountBarFirstName").text(currentUser.get('firstName'));
            }
            $('#account').show();
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