define([
	'views/account/ForgotpasswordView',
    'text!templates/account/resetpasswordTemplate.html'
], function (ForgotpasswordView,resetPasswordTemplate) {

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
        	var self = this;
        	var exception = "Your resetkey is invalid, please try again";
        	var subquery = new Parse.Query(Parse.User);
        	var currentURL = window.location.href;
        	var linkResetKey = currentURL.substring(currentURL.length-5,currentURL.length);
        	var userId = this.options.userId;
        	Parse.Cloud.run("matchResetKey", {
        		userId : userId,
        		resetKey:linkResetKey
        	    },{
        	    	success:function(user){
                        var current = new Date();
                        var updateTime = user.updatedAt;
                        var timeDifference = (current.getTime() - updateTime.getTime())/1000/60;

                        if (timeDifference > 5) {
                            $("#alertTitle").text("Reset Link Expired");
                            $("#alertMessage").text("Your reset password link is expired, please submit the request again.");
                            $('#alertDialog').modal({
                                closable: false,
                                onApprove: function () {
                                    window.location.hash = "#forgotpassword";
                                }
                            }).modal('show');
                        } else {
                            self.$el.html(self.template());
                            self.$('.ui.form').form({
                                'newPassword': {
                                    identifier: 'newPassword',
                                    rules: [{
                                        type: 'empty',
                                        prompt: 'Please enter your new password'
                                    }]
                                },
                                'confirmPassword': {
                                    identifier: 'confirmPassword',
                                    rules: [{
                                        type: 'empty',
                                        prompt: 'Please confirm your password'
                                    }]
                                }
                            }, {
                                on: 'blur',
                                inline: 'true'
                            });
                        }
                    },
                error:function(error){
                    $("#alertTitle").text("Invalid Reset Key");
                    $("#alertMessage").text("Your reset key is invalid, please try again");
                    $('#alertDialog').modal({
                        closable: false,
                        onApprove: function () {
                            window.location.hash = "#forgotpassword";
                        }
                    }).modal('show');
                }
        	    });
            return this;
        },

        resetPassword: function() {
            var query = new Parse.Query(Parse.User);
            var linkResetKey = this.options.resetKey;
            var confirmPassword = this.$("#confirmPassword").val();
            var newPassword = this.$("#newPassword").val();
            if( newPassword.trim() == "" || confirmPassword.trim() == "") {
                //do nothing
            } else {
                if( newPassword != confirmPassword) {
                    $("#alertTitle").text("Passwords Mismatch");
                    $("#alertMessage").text("Your passwords do not match, please check them and try again.");
                    $('#alertDialog').modal('show');
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
                                        $("#alertTitle").text("Success");
                                        $("#alertMessage").text("Your password has been reset, now you can login with your new password!");
                                        $('#alertDialog').modal({
                                            closable: false,
                                            onApprove: function () {
                                                window.location.hash = "#";
                                            }
                                        }).modal('show');
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
        }
    });
    return resetPasswordView;
});