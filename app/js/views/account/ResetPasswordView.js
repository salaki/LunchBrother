define([
    'text!templates/account/resetpasswordTemplate.html'
], function (resetPasswordTemplate) {

    var resetPasswordView = Parse.View.extend({
        el: $("#page"),

        events: {
            'click #resetBtn': 'resetPassword'
        },

        initialize: function (options) {
            this.options = options;
            _.bindAll(this, 'render', 'resetPassword');
        },

        template: _.template(resetPasswordTemplate),

        render: function () {
            this.$el.html(this.template());
            return this;
        },

        resetPassword: function() {
            var query = new Parse.Query(Parse.User);
            var linkResetKey = this.options.resetKey;
            if(this.$("#newPassword").val() != this.$("#confirmPassword").val()) {
                alert("Passwords do not match, please check them and try again.");
            } else {
                query.get(this.options.userId, {
                    success: function(user) {
                        var userResetKey = user.get('resetKey');
                        if (linkResetKey == userResetKey){
                            Parse.Cloud.run("saveNewPassword", {
                                userId: user.id,
                                password: this.$("#newPassword").val()
                            },{
                                success: function() {
                                    alert("Your password has been reset, now you can login with your new password!");
                                    window.location.href = "#";
                                },
                                error: function(error) {
                                    console.log("Save new password failed! Reason: " + error.message);
                                }
                            });
                        }else {
                            console.log("Reset key does not match!");
                        }
                    },
                    error: function() {
                        console.log("Can't find this user!");
                    }
                });
            }
        }
    });
    return resetPasswordView;
});