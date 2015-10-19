/**
 * Created by Jack on 10/18/15.
 */
define([
    'text!templates/manage/lbAdminTemplate.html'
], function (adminTemplate) {

    var adminView = Parse.View.extend({
        el: $("#page"),

        template: _.template(adminTemplate),

        initialize: function () {

        },

        render: function () {
            this.$el.html(this.template());
            return this;
        }
    });
    return adminView;
});
