define([
  'text!templates/account/signupemailTemplate.html'
], function (signupemailTemplate) {

    var SignupemailView = Parse.View.extend({
        el: $("#page"),
        events: {
            'click  #signUpBtn': 'createAccount'
        },

        initialize: function () {
            _.bindAll(this, 'render');
        },

        template: _.template(signupemailTemplate),

        render: function () {
           
            this.$el.html(this.template());
            return this;
        },

        createAccount: function() {
            var query = new Parse.Query(Parse.User);
            query.equalTo("username", this.$("#email").val());
            query.find({
                success: function(users) {
                    if (users.length > 0) {
                        alert("This username already exists!");
                    } else {
                        var user = new Parse.User();
                        user.set("creditBalance", 30);
                        user.set("gridName", "UMCP");
                        user.set("firstName", this.$("#first_name").val());
                        user.set("lastName", this.$("#last_name").val());
                        user.set("username", this.$("#email").val());
                        user.set("password", this.$("#password").val());
                        user.set("permission", 1);
                        user.set("email", this.$("#email").val());
                        user.set("telnum", Number(this.$("#phonenumber").val()));
                        user.signUp(null, {
                            success: function(user) {
                                window.location.href = '#home';
                            },
                            error: function(user, error) {
                                alert("Error: " + error.code + " " + error.message);
                            }
                        });
                    }
                }
            });
        }

    });
    return SignupemailView;
});