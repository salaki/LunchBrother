define([
  'views/manage/DeliveryView',
  'text!templates/manage/loginTemplate.html'
], function(DeliveryView, loginTemplate) {

  var LoginView = Parse.View.extend({
    el: $("#page"),

    events: {
      'submit #loginForm': 'continueLogin'
    },

    initialize: function() {
      _.bindAll(this, 'render', 'continueLogin');
    },

    template: _.template(loginTemplate),

    render: function() {
      this.$el.html(this.template());
      this.$('.ui.form').form({
        'username': {
          identifier: 'username',
          rules: [{
            type: 'empty',
            prompt: 'Please enter your username'
          }]
        },
        'password': {
          identifier: 'password',
          rules: [{
            type: 'empty',
            prompt: 'Please enter your password'
          }]
        }
      }, {
        on: 'blur',
        inline: 'true'
      });
      return this;
    },
    
    continueLogin: function(e) {
      var self = this;
      var username = this.$("#username").val();
      var password = this.$("#password").val();
     
      
      Parse.User.logIn(username, password, {
        success: function(user) {
          var view = new DeliveryView();
          $("#reminder,#loginInfo").remove();
           console.log(view.render().el);
          $("#page").append(view.render().el);
        },
        error: function(user, error) {
          self.$("#loginForm .error").html("Invalid username or password. Please try again.").show();
          self.$("#loginForm button").removeAttr("disabled");
        }
      });
      var $form = this.$('form');
      $form.find('#loginBtn').prop('disabled', true);
      return false;
    }
  });
  return LoginView;
});
