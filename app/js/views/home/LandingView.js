/**
 * Created by Jack on 7/13/15.
 */
define([
    'text!templates/home/landingTemplate.html'
], function(landingTemplate) {

    var LandingView = Parse.View.extend({
        el: $("#page"),
        template: _.template(landingTemplate),


        initialize: function() {
            _.bindAll(this, 'render');
        },

        render: function() {
            this.$el.html(this.template());
        }
    });
    return LandingView;
});