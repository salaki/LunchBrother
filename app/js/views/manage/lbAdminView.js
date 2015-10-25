/**
 * Created by Jack on 10/18/15.
 */
define([
    'models/RegistrationCodeModel',
    'text!templates/manage/lbAdminTemplate.html'
], function (RegistrationCodeModel, adminTemplate) {

    var adminView = Parse.View.extend({
        el: $("#page"),

        template: _.template(adminTemplate),

        events: {
            'click #generateCode': 'generateCode'
        },

        initialize: function () {

        },

        render: function () {
            this.$el.html(this.template());
            var codeQuery = new Parse.Query(RegistrationCodeModel);
            codeQuery.count({
                success: function(number) {
                    $("#numberOfCodes").text(number);
                },
                error: function(error) {
                    console.log(error.message);
                }
            });
            return this;
        },

        generateCode: function() {
            //TODO - Need to pass in a number for how many registration codes need to generate
            var codes = [];
            for (var i=0; i<10; i++) {
                var code = new RegistrationCodeModel();
                code.set("usedToLogin", false);
                code.set("usedToSignUp", false);
                codes.push(code);
            }

            Parse.Object.saveAll(codes, {
                success: function(objs) {
                    showMessage("Success", objs.length + " registration codes have been generated!", function() {
                        location.reload();
                    });
                },
                error: function(error) {
                    showMessage("Error", error.message);
                }
            });
        },
    });
    return adminView;
});
