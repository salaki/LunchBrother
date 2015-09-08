define([
  'text!templates/manage/newdishTemplate.html'
], function (newdishTemplate) {

    var NewdishView = Parse.View.extend({
        el: $("#page"),

        initialize: function () {
            _.bindAll(this, 'render');
        },

        template: _.template(newdishTemplate),
  
        render: function () {
            this.$el.html(this.template());
            return this;
        }
    });
    return NewdishView;
});


