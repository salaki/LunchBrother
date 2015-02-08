define([
        'text!templates/account/loginorsignupTemplate.html',
        'views/account/FbLoginView'
  
], function (loginorsignupTemplate, FbLoginView) {

    var LoginorsignupView = Parse.View.extend({
        el: $("#page"),
        events:{
        	"click #fbLoginBtn": "fbLogin"
        },

        initialize: function () {
            _.bindAll(this, 'render', 'fbLogin');
        },

        template: _.template(loginorsignupTemplate),

        render: function () {
           
            this.$el.html(this.template());
            return this;
        },
        
        fbLogin: function(){
        	var fbLoginView = new FbLoginView();
        	fbLoginView.render();
        }
    });
    return LoginorsignupView;
});