define([
  'text!templates/manage/manageRestaurantsTemplate.html'
], function (manageRestaurantsTemplate) {

    var ManageRestaurantsView = Parse.View.extend({
        el: $("#page"),

        initialize: function () {
            _.bindAll(this, 'render');
        },

        template: _.template(manageRestaurantsTemplate),

        render: function () {
            this.$el.html(this.template());
            return this;
        }
    });
    return ManageRestaurantsView;
});

