define([
  'text!templates/manage/bankTemplate.html'
], function (bankTemplate) {

    var BankView = Parse.View.extend({
        el: $("#page"),

        initialize: function () {
            _.bindAll(this, 'render');
        },

        template: _.template(bankTemplate),

        render: function () {
            this.$el.html(this.template());
            return this;
        }
    });
    return BankView;
});

