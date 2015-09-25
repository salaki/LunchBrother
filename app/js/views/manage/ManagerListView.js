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
              var managerQuery = new Parse.Query(Parse.User);
              managerQuery.equalTo("permission", LOCAL_MANAGER);
              managerQuery.include("gridId");
              managerQuery.find({
                  success: function(managers) {
                      self.$el.html(self.template({managers: managers}));
                  },
                  error: function(error) {
                      alert("Find managers failed! Reason: " + error.message);
                  }
              });
          },

          onNewManagerClick: function() {
              window.location.href = '#newManager';
          }
      });
      return ManagerListView;

    });


