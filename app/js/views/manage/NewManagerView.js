define([
    'text!templates/manage/newManagerTemplate.html'

    ], function (newManagerTemplate) {

      var NewManagerView = Parse.View.extend({
        el: $("#page"),

          initialize: function () {
            _.bindAll(this, 'render');

          },

          template: _.template(newManagerTemplate),

          render: function () {
            this.$el.html(this.template());
            return this;

          }

      });
      return NewManagerView;

    });


