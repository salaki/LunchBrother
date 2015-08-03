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
                    alert("Error: " + error.code + " " + error.message);
                }
            });
        },

        getGridManager: function(grid) {
            var self = this;
            var userQuery = new Parse.Query(Parse.User);
            userQuery.equalTo("permission", 2);  // find all the women
            userQuery.equalTo("gridId", grid);
            userQuery.first({
                success: function(manager) {
                    self.getManagerInventory(manager);
                },
                error: function(error){
                    alert("Error: " + error.code + " " + error.message);
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
                    var firstWeekMenu = [];
                    var secondWeekMenu = [];
                    var thirdWeekMenu = [];

                    _.each(inventories, function(inventory){
                        if (inventory.get('pickUpDate') > firstMonday && inventory.get('pickUpDate') < secondMonday) {
                            firstWeekMenu.push(inventory);
                        } else if (inventory.get('pickUpDate') > secondMonday && inventory.get('pickUpDate') < thirdMonday) {
                            secondWeekMenu.push(inventory);
                        } else {
                            thirdWeekMenu.push(inventory);
                        }
                    });
                    self.$("#weeklyMenu").html(self.weeklyMenuTemplate({menu:[firstWeekMenu, secondWeekMenu, thirdWeekMenu], weeks: [firstWeek, secondWeek, thirdWeek]}));
                },
                error: function (error) {
                    console.log("Inventory Query Error: " + error.code + " " + error.message);
                }
            });
        },

        showVoteDialog: function(collegeName) {
            $('#targetCollege').text(collegeName);
            var requestQuery = new Parse.Query(UserRequestModel);
            //TODO - Count request by college name, and use jquery to update value

            $('#voteDialog').modal({
                closable: true,
                onDeny: function () {
                    // This is not an option
                },
                onApprove: function () {
                    //TODO - check if it is requested by the same email, if yes, pop out a funny dialog,
                    // otherwise save the request data
                    var voterEmail = $('#voterEmail').val();
                    console.log(voterEmail);


                    alert("Thank you for your response, we will work hard on your request!");
                }
            }).modal('show');
        },

        checkIfRequestedAlready: function() {

        }
    });
    return LandingView;
});