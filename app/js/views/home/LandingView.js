/**
 * Created by Jack on 7/13/15.
 */
define([
    'models/University',
    'text!templates/home/landingTemplate.html'
], function(UniversityModel, landingTemplate) {

    var LandingView = Parse.View.extend({
        el: $("#page"),
        template: _.template(landingTemplate),

        initialize: function() {
            _.bindAll(this, 'render');
        },

        render: function() {
//            var x = document.cookie;
//            console.log(x);
            var self = this;            
            var universityQuery = new Parse.Query(UniversityModel);
            universityQuery.equalTo("e_country", "USA");
            universityQuery.containedIn("e_state", ["MD", "DC", "VA"]);
            universityQuery.ascending("biz_name");
            universityQuery.limit(800);
            universityQuery.find({
                success: function(universities) {
                    self.$el.html(self.template({universities: universities}));
                    self.$(".college-selector").dropdown();
                },
                error: function(err) {
                    console.log(err.message);
                }
            });
        }
    });
    return LandingView;
});