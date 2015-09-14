/**
 * Created by Jack on 9/11/15.
 */
define([
        'text!templates/home/activateTemplate.html'],
    function(activateTemplate) {

        var ActivateView = Parse.View.extend({
            // tagName: 'ul', // required, but defaults to 'div' if not set
            el : $("#page"),

            initialize : function() {
                _.bindAll(this, 'render');
                this.$el.html(_.template(activateTemplate)());
            },

            render : function() {
                var userId = this.options.userId;

                //TODO@Jenny - Update user's active state to true,
                //TODO@Jenny   your have to use cloud code again,
                //TODO@Jenny   because only there you can update user by using the masterKey. (Refer to some user related methods in the cloud code)
                //TODO@Jenny - Once update successfully, wait for 2 seconds, to let user see the message, and then direct user back to login page

//                window.location.hash = '#login';
            }
        });
        return ActivateView;
    });