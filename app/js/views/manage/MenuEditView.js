/**
 * Created by Jack on 7/13/15.
 */
define([
    'models/Grid',
    'models/Restaurant',
    'models/dish/DishModel',
    'text!templates/manage/menuEditTemplate.html',
    'text!templates/manage/menuEditDishListTemplate.html'
], function(GridModel, RestaurantModel, DishModel, menuEditTemplate, menuEditDishListTemplate) {

    var MenuEditView = Parse.View.extend({
        el: $("#page"),
        template: _.template(menuEditTemplate),
        menuEditDishListTemplate: _.template(menuEditDishListTemplate),

        events: {
            'click #menuEditCancelBtn': 'onCancelClick',
            'click #menuEditSaveBtn': 'onSaveClick'
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
            var inventoryIds = this.options.inventoryIds;
            var date = this.options.date;
            var inventoryArray = inventoryIds.split(",");

            var self = this;
            var currentUser = Parse.User.current();
            var restaurantQuery = new Parse.Query(RestaurantModel);
            restaurantQuery.equalTo("gridId", currentUser.get('gridId'));
            restaurantQuery.find({
                success:function(restaurants) {
                    self.$el.html(self.template({restaurants: restaurants, date: date}));
                    self.$(".restaurant-selection").dropdown({
                        onChange: function (restaurantId) {
                            self.refreshRestaurantMenu(restaurantId);
                        }
                    });

                    //self.$("#menuEditDishList").html(self.menuEditDishListTemplate());
                },
                error: function(err) {
                    console.log(err.message);
                }
            });
        },

        refreshRestaurantMenu: function(restaurantId) {
            var dishQuery = new Parse.Query(DishModel);
            dishQuery.equalTo("restaurant", {
            	__type:"Pointer",
            	className: "Restaurant",
            	objectId: restaurantId
            });
            var self = this;
            console.log(restaurantId);
            dishQuery.find({
            	success: function(dishes){
            		console.log(dishes.length);
            		console.log(dishes[2].get('dishName'));
            		console.log(dishes[2].get('Image_File')._url);
            		self.$("#menuEditDishList").html(self.menuEditDishListTemplate({dishes : dishes}));            		
            	},
            	error: function(err){
            		console.log(err.message);
            	}
            });
            //TODO@Jenny - Refresh dish list on menu edit
            //Step 1 - Query dish based on selected restaurant
            //Step 2 - Pass the query results to the template menuEditDishListTemplate like above example
            //(You need to use self.$("#menuEditDishList").html(self.menuEditDishListTemplate({dishes: dishes}));
            // when you retrieve the query results successfully)
        },

        onSaveClick: function() {
            //TODO@Jack - Save added dishes to inventory
            alert("Under construction!");
        },

        onCancelClick: function() {
            window.location.hash = "#managerHome";
        }
    });
    return MenuEditView;
});
