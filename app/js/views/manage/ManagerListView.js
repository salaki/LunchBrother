define([
    'text!templates/manage/managerListTemplate.html'

    ], function (managerListTemplate) {

      var ManagerListView = Parse.View.extend({

          el: $("#page"),

          events: {
              'click .toNewManager': 'onNewManagerClick'
          },

          initialize: function () {
            _.bindAll(this, 'render');

          },

          template: _.template(managerListTemplate),

          render: function () {
              var self = this;
              //TODO@Lian - Query users where permission equals to LOCAL_MANAGER
              //TODO@Lian - In the success call back, render the page (self.$el.html(self.template({managers: managers}));)
            this.$el.html(this.template());
            return this;
          },

          onNewManagerClick: function() {
              window.location.href = '#newManager';
          }
      });
      return ManagerListView;

    });


