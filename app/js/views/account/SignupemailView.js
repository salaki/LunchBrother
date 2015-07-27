define([
  'text!templates/account/signupemailTemplate.html',
  'models/Grid',
], function (signupemailTemplate, GridModel) {
    var SignupemailView = Parse.View.extend({
        el: $("#page"),
        events: {
            'click  #signUpBtn': 'createAccount'
        },

        initialize: function () {
            _.bindAll(this, 'render', 'createAccount');
            
        },

        template: _.template(signupemailTemplate),

        render: function () {
             var gridQuery = new Parse.Query(GridModel);
             var self = this;
             gridQuery.find({
                 success: function(grids) {
                     self.$el.html(self.template({grids: grids}));
                     self.$('.ui.form').form({
                         first_name: {
                             identifier: 'first_name',
                             rules: [{
                                 type: 'empty',
                                 prompt: 'Please enter your first name'
                             }]
                         },
                         last_name: {
                             identifier: 'last_name',
                             rules: [{
                                 type: 'empty',
                                 prompt: 'Please enter your last name'
                             }]
                         },
                         email: {
                             identifier: 'email',
                             rules: [{
                                 type: 'empty',
                                 prompt: 'Please enter your e-mail'
                             }, {
                                 type: 'email',
                                 prompt: 'Please enter a valid e-mail'
                             }]
                         },
                         phonenumber: {
                             identifier: 'phonenumber',
                             rules: [{
                                 type: 'empty',
                                 prompt: 'Please enter your phone number'
                             },{
                                 type: 'length[10]',
                                 prompt:'Your phone number must be 10 digits'
                             }]
                         },
                         password: {
                             identifier: 'password',
                             rules: [{
                                 type: 'empty',
                                 prompt: 'Please enter your password'
                             }]
                         },
                         gridOptions: {
                             identifier: 'gridOptions',
                             rules: [{
                                 type: 'empty',
                                 prompt: 'Please select an area for you'
                             }]
                         }
                     }, {
                         on: 'blur',
                         inline: 'true'
                     });
                 },
                 error: function(){
                     console.log("Error finding grid data.");
                 }
             });
             return this;
        },

        createAccount: function() {
        	var self = this;
            var query = new Parse.Query(Parse.User);
            query.equalTo("username", this.$("#email").val());
            query.find({
                success: function(users) {
                    if (users.length > 0) {
                        alert("This username already exists!");
                    } else {
                        var user = new Parse.User();
                        var grid = new GridModel();
                        grid.id = this.$("#gridOptions").val();

                        user.set("gridId", grid);
                        user.set("firstName", this.$("#first_name").val());
                        user.set("lastName", this.$("#last_name").val());
                        user.set("username", this.$("#email").val());
                        user.set("password", this.$("#password").val());
                        user.set("permission", 1);
                        user.set("email", this.$("#email").val());
                        user.set("telnum", Number(this.$("#phonenumber").val()));
                        if(self.model.refer){
	                        var referQuery = new Parse.Query(Parse.User);
	                        referQuery.get(self.model.refer, {
	                        	success: function(referredBy){
                        			user.set("referredBy", referredBy);
                        			user.set("creditBalance", 40);
	    	                        user.signUp(null, {
	    	                            success: function(user) {
	    	                                window.location.href = '#home';
	    	                            },
	    	                            error: function(user, error) {
	    	                                alert("Error: " + error.code + " " + error.message);
	    	                            }
	    	                        });
	                        	},
	                        	error: function(){
	                        		alert("Please make sure the invitation link is correct.");
	                        	}
	                        });
                        }
                        else{
                        	user.set("creditBalance", 30);
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
                }
            });
        }

    });
    return SignupemailView;
});