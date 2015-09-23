define([
    'text!templates/manage/managerListTemplate.html'

    ], function (managerListTemplate) {

      var ManagerListView = Parse.View.extend({
        el: $("#page"),

          initialize: function () {
            _.bindAll(this, 'render');

          },

          template: _.template(managerListTemplate),

          render: function () {
            this.$el.html(this.template());
            return this;

          }

      });
      return ManagerListView;

    });


