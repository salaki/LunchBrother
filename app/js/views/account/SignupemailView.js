define([
  'text!templates/account/signupemailTemplate.html'
], function (signupemailTemplate) {

    var SignupemailView = Parse.View.extend({
        el: $("#page"),
        
        initialize: function () {
            _.bindAll(this, 'render');
        },

        template: _.template(signupemailTemplate),

        render: function () {
           
            this.$el.html(this.template());
            return this;
        }

    });
    return SignupemailView;
});