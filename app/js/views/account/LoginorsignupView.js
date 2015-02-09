define([
        'text!templates/account/loginorsignupTemplate.html',
        'views/account/FbLoginView',
        'i18n!nls/login'
  
], function (loginorsignupTemplate, FbLoginView, login) {

    var LoginorsignupView = Parse.View.extend({
        el: $("#page"),
        events:{
        	"click #fbLoginBtn": "fbLogin"
        },

        initialize: function () {
            _.bindAll(this, 'render');
        },

        template: _.template(loginorsignupTemplate),

        render: function () {
           
            this.$el.html(this.template());
            $("#signUpBtn").html(login.SignUpButton);
            $("#loginBtnContent").html(login.LoginButton);
            return this;
        },
        
        fbLogin: function(){
        	var fbLoginView = new FbLoginView();
        	fbLoginView.render();
        }
    });
    return LoginorsignupView;
});