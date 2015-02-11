define([
  'text!templates/account/forgotpasswordTemplate.html'
], function (forgotpasswordTemplate) {

    var ForgotpasswordView = Parse.View.extend({
        el: $("#page"),

        initialize: function () {
            _.bindAll(this, 'render');
        },

        template: _.template(forgotpasswordTemplate),

        render: function () {
            this.$el.html(this.template());
            return this;
        }
    });
    return ForgotpasswordView;
});