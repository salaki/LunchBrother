define([
  'text!templates/account/forgotpasswordTemplate.html'
], function (forgotpasswordTemplate) {

    var ForgotpasswordView = Parse.View.extend({
        el: $("#page"),

        events: {
            'click #sendemailBtn': 'onSendResetPasswordEmailClick'
        },

        initialize: function () {
            _.bindAll(this, 'render');
        },

        template: _.template(forgotpasswordTemplate),

        render: function () {
            this.$el.html(this.template());
            return this;
        },

        onSendResetPasswordEmailClick: function() {
            var self = this;
            var email = this.$("#resetEmail").val();
            var resetKey = self.generateResetKey();

            Parse.Cloud.run('saveResetKeyForUser', {
                emailAddress: email,
                resetKey: resetKey
            }, {
                success: function (user) {
                    if (user == null || user == undefined) {
                        alert("We cannot find this email in our system, please check it and try again!");
                    } else {
                        var verificationLink = config.appUrl + "#resetPassword?userId=" + user.id + "&resetKey=" + resetKey;
                        Parse.Cloud.run('emailResetPasswordLink', {
                            firstName: user.get("firstName"),
                            emailAddress: email,
                            verificationLink: verificationLink
                        }, {
                            success: function () {
                                console.log("Verification link sent to " + email + " successfully!");
                            },
                            error: function (error) {
                                console.log("Verification link failed to send. Error: " + error.message);
                            }
                        });
                        alert("An email has been sent to " + email + " to reset your password!");
                    }
                },
                error: function (error) {
                    console.log(error.message);
                }
            });
        },

        generateResetKey: function() {
            var text = "";
            var possible = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";

            for( var i=0; i < 5; i++ )
                text += possible.charAt(Math.floor(Math.random() * possible.length));

            return text;
        }
    });
    return ForgotpasswordView;
});