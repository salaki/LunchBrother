/**
 * Created by Jack on 7/13/15.
 */
define([
    'models/University',
    'models/Grid',
    'models/InventoryModel',
    'models/UserRequestModel',
    'text!templates/home/landingTemplate.html',
    'text!templates/home/weeklyMenuTemplate.html'
], function(UniversityModel, GridModel, InventoryModel, UserRequestModel, landingTemplate, weeklyMenuTemplate) {

    var LandingView = Parse.View.extend({
        el: $("#page"),
        template: _.template(landingTemplate),
        weeklyMenuTemplate: _.template(weeklyMenuTemplate),

        initialize: function() {
            _.bindAll(this, 'render');
        },

        render: function() {
            var self = this;            
            var universityQuery = new Parse.Query(UniversityModel);
            universityQuery.equalTo("e_country", "USA");
            universityQuery.containedIn("e_state", ["MD", "DC", "VA"]);
            universityQuery.ascending("biz_name");
            universityQuery.limit(800);
            universityQuery.find({
                success: function(universities) {
                    self.$el.html(self.template({universities: universities}));
                    self.$(".college-selector").dropdown('set selected', "University of Maryland College Park");
                    self.refreshWeeklyMenu("University of Maryland College Park");
                    self.$(".college-selector").dropdown({
                        onChange: function (collegeName) {
                            self.refreshWeeklyMenu(collegeName);
                        }
                    });
                },
                error: function(err) {
                    console.log(err.message);
                }
            });
        },

        refreshWeeklyMenu: function(collegeName) {
            var self = this;
            var gridQuery = new Parse.Query(GridModel);
            gridQuery.equalTo('name', collegeName);
            gridQuery.first({
                success: function(grid) {
                    if(grid) {
                        self.getGridManager(grid);
                    } else {
                        self.showVoteDialog(collegeName);
                    }
                },
                error: function(error) {
                    showMessage("Oops!", "Find grid failed! Reason: " + error.message);
                }
            });
        },

        getGridManager: function(grid) {
            var self = this;
            var userQuery = new Parse.Query(Parse.User);
            userQuery.equalTo("permission", LOCAL_MANAGER);
            userQuery.equalTo("gridId", grid);
            userQuery.first({
                success: function(manager) {
                    self.getManagerInventory(manager);
                },
                error: function(error){
                    showMessage("Oops!", "Find manager failed! Reason" + error.message);
                }
            });
        },

        getManagerInventory: function(manager) {
            var d = new Date();
            var day = d.getDay(),
                diff = d.getDate() - day + (day == 0 ? -6:1); // adjust when day is sunday
            var monday = new Date(d.setDate(diff));
            var firstWeek = (monday.getMonth() + 1) + "/" + monday.getDate() + "-";

            var firstMonday = new Date(monday);

            var diff2 = monday.getDate() + 4;
            var friday = new Date(monday.setDate(diff2));
            firstWeek += (friday.getMonth() + 1) + "/" + friday.getDate();

            var diff3 = friday.getDate() + 3;
            var monday2 = new Date(friday.setDate(diff3));
            var secondWeek = (monday2.getMonth() + 1) + "/" + monday2.getDate() + "-";

            var secondMonday = new Date(monday2);

            var diff4 = monday2.getDate() + 4;
            var friday2 = new Date(monday2.setDate(diff4));
            secondWeek += (friday2.getMonth() + 1) + "/" + friday2.getDate();

            var diff5 = friday2.getDate() + 3;
            var monday3 = new Date(friday2.setDate(diff5));
            var thirdWeek = (monday3.getMonth() + 1) + "/" + monday3.getDate() + "-";

            var thirdMonday = new Date(monday3);

            var diff6 = monday3.getDate() + 4;
            var friday3 = new Date(monday3.setDate(diff6));
            thirdWeek += (friday3.getMonth() + 1) + "/" + friday3.getDate();

            firstMonday.setFullYear(firstMonday.getFullYear(), firstMonday.getMonth(), firstMonday.getDate());
            firstMonday.setHours(0, 0, 0, 0);
            secondMonday.setFullYear(secondMonday.getFullYear(), secondMonday.getMonth(), secondMonday.getDate());
            secondMonday.setHours(0, 0, 0, 0);
            thirdMonday.setFullYear(thirdMonday.getFullYear(), thirdMonday.getMonth(), thirdMonday.getDate());
            thirdMonday.setHours(0, 0, 0, 0);
            friday3.setFullYear(friday.getFullYear(), friday3.getMonth(), friday3.getDate());
            friday3.setHours(23, 59, 59, 0);

            var self = this;
            var inventoryQuery = new Parse.Query(InventoryModel);
            inventoryQuery.equalTo("orderBy", manager);
            inventoryQuery.greaterThan("pickUpDate", firstMonday);
            inventoryQuery.lessThan("pickUpDate", friday3);
            inventoryQuery.include("dish");
            inventoryQuery.include("dish.restaurant");
            inventoryQuery.find({
                success: function (inventories) {
                    var firstWeekMenu = {Mon:[], Tue:[], Wed:[], Thu:[], Fri:[]};
                    var secondWeekMenu = {Mon:[], Tue:[], Wed:[], Thu:[], Fri:[]};
                    var thirdWeekMenu = {Mon:[], Tue:[], Wed:[], Thu:[], Fri:[]};

                    _.each(inventories, function(inventory){
                        if (inventory.get('pickUpDate') > firstMonday && inventory.get('pickUpDate') < secondMonday) {
                            self.populateDayMenu(inventory.get('pickUpDate').getDay(), firstWeekMenu, inventory);

                        } else if (inventory.get('pickUpDate') > secondMonday && inventory.get('pickUpDate') < thirdMonday) {
                            self.populateDayMenu(inventory.get('pickUpDate').getDay(), secondWeekMenu, inventory);

                        } else {
                            self.populateDayMenu(inventory.get('pickUpDate').getDay(), thirdWeekMenu, inventory);
                        }
                    });
                    self.$("#weeklyMenu").html(self.weeklyMenuTemplate({menu:[firstWeekMenu, secondWeekMenu, thirdWeekMenu], weeks: [firstWeek, secondWeek, thirdWeek]}));
                },
                error: function (error) {
                    showMessage("Oops!", "Inventory Query Error: " + error.code + " " + error.message);
                }
            });
        },

        populateDayMenu: function(day, menu, inventory) {
            switch(day) {
                case 1:
                    menu.Mon.push(inventory);
                    break;
                case 2:
                    menu.Tue.push(inventory);
                    break;
                case 3:
                    menu.Wed.push(inventory);
                    break;
                case 4:
                    menu.Thu.push(inventory);
                    break;
                default:
                    menu.Fri.push(inventory);
                    break;
            }
        },

        showVoteDialog: function(collegeName) {
            $('#targetCollege').text(collegeName);
            $('#voterEmail').val("");
            var requestQuery = new Parse.Query(UserRequestModel);
            requestQuery.equalTo("requestType", "SERVICE");
            requestQuery.equalTo("requestTargetId", collegeName);
            requestQuery.count({
                success: function(count) {
                    $('#numberOfVote').text(count);
                    $('#voteDialog').modal({
                        closable: true,
                        onDeny: function () {
                            // This is not an option
                        },
                        onApprove: function () {
                            var voterEmail = $('#voterEmail').val();
                            var emailRegEx = /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,4}$/i;
                            var collegeRegex = /\.edu/;

                            if (voterEmail.trim() === "") {
                                showMessage("Oops!", "Please enter your email address.");

                            } else if (!emailRegEx.test(voterEmail)) {
                                showMessage("Oops!", "Please enter valid email address.");

                            } else if (!collegeRegex.test(voterEmail)) {
                                showMessage("Oops!", "Sorry, we currently only accept school email address.");

                            } else {
                                var requestQuery = new Parse.Query(UserRequestModel);
                                requestQuery.equalTo("requestByEmail", voterEmail);
                                requestQuery.equalTo("requestTargetId", collegeName);
                                requestQuery.find({
                                    success: function(users) {
                                        if (users.length > 0){
                                            showMessage("Success", "We already have your request record, thank you very much!");

                                        } else {
                                            var newRequest = new UserRequestModel();
                                            newRequest.set("requestType", "SERVICE");
                                            newRequest.set("requestByEmail", voterEmail);
                                            newRequest.set("requestTargetId", collegeName);
                                            newRequest.save({
                                                success: function(request) {
                                                    showMessage("Success", "Request saved, thank you for your response!");
                                                },
                                                error: function(error) {
                                                    showMessage("Error", "Save request failed! Error: " + error.code + " " + error.message);
                                                }
                                            });
                                        }
                                    },
                                    error: function(error) {
                                        showMessage("Error", "Save request record failed! Error: " + error.code + " " + error.message);
                                    }
                                });
                            }
                        }
                    }).modal('show');
                },
                error: function(error) {
                    showMessage("Error", "Find request record failed! Error: " + error.code + " " + error.message);
                }
            });
        }
    });
    return LandingView;
});