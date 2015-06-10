define([
    'models/Grid',
    'models/Restaurant',
    'models/PickUpLocation',
    'text!templates/manage/managerHomeTemplate.html'
], function(GridModel, RestaurantModel, PickUpLocationModel, managerHomeTemplate) {

    var ManagerHomeView = Parse.View.extend({
        el: $("#page"),
        template: _.template(managerHomeTemplate),
        events: {
            'click #DPAdd': 'onEditOrAddClick'
        },

        initialize: function() {
            _.bindAll(this, 'render');
            var currentUser = Parse.User.current();
            if(currentUser != null) {
                currentUser.fetch();
                $("#userEmail").text(currentUser.get('email'));
                var gridId = "nmbyDzTp7m";
                if (currentUser.get('gridId') == undefined) {
                    $("#userGrid").text("University of Maryland College Park");
                }else {
                    var gridQuery = new Parse.Query(GridModel);
                    gridId = currentUser.get('gridId').id;
                    gridQuery.get(currentUser.get('gridId').id, {
                        success: function(grid) {
                            $("#userGrid").text(grid.get('name'));
                        },
                        error: function(object, error) {
                            console.log(error.message);
                        }
                    });
                }
                $("#userPhone").text(currentUser.get('telnum'));
                $("#userFullName").text(currentUser.get('firstName') + " " + currentUser.get('lastName'));
                $("#userCreditBalance").text(currentUser.get('creditBalance').toFixed(2));
                $("#accountBarFirstName").text(currentUser.get('firstName'));
            }
            $('#account').show();
        },

        render: function() {
            var self = this;
            var chefGrid = Parse.User.current().get('gridId');
            var newEvent = {};
            //default chef's grid to University of Maryland College Park
            if (chefGrid == undefined){
                chefGrid = new GridModel();
                chefGrid.id = "nmbyDzTp7m";
            }
            var pickUpLocationQuery = new Parse.Query(PickUpLocationModel);
            pickUpLocationQuery.equalTo("gridId", chefGrid);
            pickUpLocationQuery.find({
                success:function(locations) {
                    _.each(locations, function(location) {
                        newEvent["click #dpEditButton-" + location.id] = 'onEditOrAddClick';
                        newEvent["click #dpDeleteButton-" + location.id] = 'onDeleteClick';
                    });
                    self.delegateEvents(_.extend(self.events, newEvent));
                    self.$el.html(self.template({distributingPoints: locations}));
                },
                error: function(error) {
                    console.log(error.message);
                }
            })
        },

        onEditOrAddClick: function(ev) {
            this.$('.ui.form').form({
                dp_location: {
                    identifier: 'dp_location',
                    rules: [{
                        type: 'empty',
                        prompt: 'Please enter the name of your location'
                    }]
                },
                dp_youtube_link: {
                    identifier: 'dp_youtube_link',
                    rules: [{
                        type: 'empty',
                        prompt: 'Please enter youtube link'
                    }]
                }
            }, {
                on: 'blur',
                inline: 'true'
            });

            var self = this;
            var dpId = $(ev.currentTarget).data('id');
            var address = $(ev.currentTarget).data('address');
            var youtubeLink = $(ev.currentTarget).data('youtube');
            $("#dp_location").val(address);
            $("#dp_youtubeLink").val(youtubeLink);
            $('#editDPDialog').modal({
                closable: false,
                onDeny: function () {

                },
                onApprove: function () {
                    self.saveDP(dpId, $("#dp_location").val(), $("#dp_youtubeLink").val());
                }
            }).modal('show');
        },

        onDeleteClick: function(ev) {
            var self = this;
            var dpId = $(ev.currentTarget).data('id');
            $('#deleteDPDialog').modal({
                closable: false,
                onDeny: function () {

                },
                onApprove: function () {
                    self.deleteDP(dpId);
                }
            }).modal('show');
        },

        saveDP: function(id, address, youtubeLink) {
            var chefGrid = Parse.User.current().get('gridId');
            //default chef's grid to University of Maryland College Park
            if (chefGrid === undefined){
                chefGrid = new GridModel();
                chefGrid.id = "nmbyDzTp7m";
            }

            if (address.trim() !== "" && youtubeLink.trim() !== "") {
                var dp = new PickUpLocationModel();
                dp.id = id;
                dp.set("gridId", chefGrid);
                dp.set("address", address);
                dp.set("youtubeLink", youtubeLink);
                dp.save(null, {
                    success: function(dp) {
                        if (id === undefined) {
                            alert('New distributing point created with Id: ' + dp.id);
                        } else {
                            alert('Distributing point info updated!');
                        }
                        location.reload();
                    },
                    error: function(error) {
                        alert('Update failed! Reason: ' + error.message);
                    }
                });
            } else {
                alert("Please enter the required information.");
            }
        },

        deleteDP: function(id) {
            var dp = new PickUpLocationModel();
            dp.id = id;
            dp.destroy({
                success: function(dp) {
                    alert("Delete Distributing Point successfully!");
                    location.reload();
                },
                error: function(dp, error) {
                    alert("Delete fail: Reason: " + error.message);
                }
            });
        }
    });
    return ManagerHomeView;
});
