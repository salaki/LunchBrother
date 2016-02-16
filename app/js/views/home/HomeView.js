define(['views/home/DishView',
    'views/order/OrderView',
    'models/dish/DishModel',
    'models/dish/DishCollection',
    'models/Grid',
    'models/Restaurant',
    'models/PickUpLocation',
    'models/InventoryModel',
    'models/UserRequestModel',
    'text!templates/home/homeTemplate.html',
    'text!templates/home/statsTemplate.html',
    'text!templates/order/orderTemplate.html'],
    function(DishView, OrderView, DishModel, DishCollection, GridModel, RestaurantModel, PickUpLocationModel,
             InventoryModel, UserRequestModel, homeTemplate, statsTemplate, orderTemplate) {

        var DEFAULT_DP = "DBR7M5Pw6q";

	var HomeView = Parse.View.extend({
		// tagName: 'ul', // required, but defaults to 'div' if not set
		el : $("#page"),

		statsTemplate : _.template(statsTemplate),
		stats : {
			orders : [],
			coupon : 0,
			tax : 0,
			totalCharge : 0,
            totalCashCharge : 0,
            youtubeLink: "",
            dp:""
		},

		events : {
			'click #paymentBtn' : 'continuePay'
		},

        inventoryMap : {},

        pickUpLocationYouTubeLinkMap: {},

		initialize : function() {
			_.bindAll(this, 'render', 'loadAll', 'addOne', 'continuePay');
            this.$el.html(_.template(homeTemplate)());
            this.dishes = new DishCollection;

            // Find pick-up locations
            this.getPickUpLocations();

            // Display the inventory dishes
            this.collectInventoryDishes();

            // Enable or disable checkout button based on current time
            this.disableOrEnableCheckOutBtn();

		},

        getPickUpLocations: function() {
            var self = this;
            var grid = Parse.User.current().get('gridId');
            if (grid === undefined) {
                grid = new GridModel();
                grid.id = UMCP_GRID_ID;
            }

            var pickUpLocationQuery = new Parse.Query(PickUpLocationModel);
            pickUpLocationQuery.equalTo('gridId', grid);
            pickUpLocationQuery.addAscending('address');
            pickUpLocationQuery.find().then(function(pickUpLocations){
                $.each(pickUpLocations, function (i, pickUpLocation) {
                    self.pickUpLocationYouTubeLinkMap[pickUpLocation.id] = pickUpLocation.get("youtubeLink");
                    $('#address').append($('<option>', {
                        value: pickUpLocation.id,
                        text : pickUpLocation.get('address')
                    }));
                });

                // Default setting
                self.setPageInfo(DEFAULT_DP);
                $("#address").dropdown('set selected', DEFAULT_DP);

                // Drop-down change event
                $("#address").change(function() {
                    self.setPageInfo($("#address").val());
                });

            }, function(error){
                showMessage("Oops!", "Something is wrong! Reason: " + error.message);

            });
        },

        setPageInfo: function(selectedPickupLocation) {
            this.stats.youtubeLink = this.pickUpLocationYouTubeLinkMap[selectedPickupLocation];
            this.stats.dp = selectedPickupLocation;
            this.filterOutDish(selectedPickupLocation);
        },

        filterOutDish: function(selectedPickupLocation) {
            _.each(this.dishes.models, function(order){
                var dp = order.get("pickUpLocationId")[0];
                if (dp === selectedPickupLocation) {
                    $(".pickUpLocation-" + dp).show();
                } else {
                    $(".pickUpLocation-" + dp).hide();
                }
            });
        },

        collectInventoryDishes: function() {
            var self = this;
            var inventoryQuery = new Parse.Query(InventoryModel);

            //Display the inventory dishes
            var current = new Date();
            var currentHour = current.getHours();
            if (currentHour >= 14) {
                //After 14:00, display the inventory of the next day
                var upperDate = new Date(current.getTime() + 24 * 60 * 60 * 1000);
                upperDate.setHours(13, 0, 0, 0);
                var lowerDate = new Date(current.getTime() + 24 * 60 * 60 * 1000);
                lowerDate.setHours(10, 0, 0, 0);
            }
            else {
                //Before 14:00, display the inventory of the current day
                var upperDate = new Date(current.getTime());
                upperDate.setHours(13, 0, 0, 0);
                var lowerDate = new Date(current.getTime());
                lowerDate.setHours(10, 0, 0, 0);
            }

            inventoryQuery.include("dish");
            inventoryQuery.include("dish.restaurant");
            inventoryQuery.greaterThan("pickUpDate", lowerDate);
            inventoryQuery.lessThan("pickUpDate", upperDate);
            inventoryQuery.find({
                success: function(inventories) {
                    _.each(inventories, function(inventory) {
                        var dish = inventory.get("dish");
                        dish.add("price", inventory.get('price'));
                        dish.add("pickUpLocationId", inventory.get('pickUpLocation').id);
                        self.dishes.add(dish);
                        self.inventoryMap[dish.id] = {
                            inventoryId: inventory.id,
                            price: inventory.get('price'),
                            cashPrice: inventory.get('cashPrice'),
                            currentQuantity: inventory.get('currentQuantity'),
                            restaurant: dish.get('restaurant'),
                            dpId: inventory.get('pickUpLocation').id
                        }
                    });

                    self.loadAll();
                    self.dishes.bind('all', self.render);
                },
                error: function(error) {
                    showMessage("Error", "Find inventory failed! Reason: " + error.message);
                }
            });
        },

        disableOrEnableCheckOutBtn: function() {
            var currentTime = new Date();
            var weekday = currentTime.getDay();

            var startOrderTime = new Date();
            startOrderTime.setHours(14, 0, 0, 0);
            var stopOrderTime = new Date();
            stopOrderTime.setHours(21, 20, 0, 0);

            // Disable check out button by default unless adding orders
            $('#paymentBtn').prop('disabled', true);
            $('#paymentBtn').addClass('grey');

            if (Parse.User.current().get('permission') != LB_ADMIN) {
                if (weekday == 6 && weekday == 5) {
                    $("#timeAlert").css("display", "block").text("Sorry, we don't provide service on weekends. Please come back on Sunday after 2:00PM :)");

                } else if(currentTime > stopOrderTime || currentTime < startOrderTime) {
                    $("#timeAlert").css("display", "block").text("Sorry, our order time is 2:00PM-9:15PM.");

                } else {
                    // Do nothing
                }
            }
        },

        loadAll : function() {
            this.$("#dishList").html("");
            this.dishes.each(this.addOne);
        },

		render : function() {
            var self = this;
            this.stats.orders = [];
            _.each(this.dishes.orders(), function(dish){
                var order = {};
                order.dishId = dish.id;
                order.count = dish.get('count');
                order.price = self.inventoryMap[dish.id].price;
                order.cashPrice = self.inventoryMap[dish.id].cashPrice;
                order.code = dish.get('dishCode');
                order.name = dish.get('dishName');
                order.inventoryId = self.inventoryMap[dish.id].inventoryId;
                order.restaurant = self.inventoryMap[dish.id].restaurant;
                order.dpId = self.inventoryMap[dish.id].dpId;
                self.stats.orders.push(order);
            });

            if (this.dishes.orders().length > 0) {
                $('#paymentBtn').prop('disabled', false);
                $('#paymentBtn').removeClass('grey');

            } else {
                $('#paymentBtn').prop('disabled', true);
                $('#paymentBtn').addClass('grey');
            }

            var charge = 0;
            var cashCharge = 0;
            _.each(this.stats.orders, function(order) {
                charge += order.count * order.price;
                cashCharge += order.count * order.cashPrice;
            });

            this.stats.totalCharge = parseFloat((charge).toFixed(2));
            this.stats.totalCashCharge = parseFloat((cashCharge).toFixed(2));
            this.$('#orderStats').html(this.statsTemplate(this.stats));
            this.delegateEvents();
            return this;
		},

		addOne : function(dish) {
			var view = new DishView({
				model : dish
			});

            var currentQuantity = this.inventoryMap[dish.id].currentQuantity;
            var inventoryId = this.inventoryMap[dish.id].inventoryId;
            view.setCurrentQuantity(currentQuantity);
            view.setInventoryId(inventoryId);

			this.$("#dishList").append(view.render().el);
            $('#' + dish.id + ' .menu .item').tab({context: $('#' + dish.id)});
            $('.ui.rating').rating({
                interactive: false
            });

            var current = new Date();
            var startOrderTime = new Date();
            startOrderTime.setHours(14, 0, 0, 0);
            var stopOrderTime = new Date();
            stopOrderTime.setHours(21, 20, 0, 0);
            var operatingTime = current > startOrderTime && current < stopOrderTime;

            if (!operatingTime && Parse.User.current().get('permission') != LB_ADMIN) {
                $('#' + dish.id + '-plusButton').prop('disabled', true);
                $('#' + dish.id + '-minusButton').prop('disabled', true);
            }
		},

		continuePay : function() {
            var view = new OrderView({
                model : this.stats
            });

            $("#dishTitle,#dishList,#paymentBtn,#orderMessage,#payCashBtn,#pickUpLocationWrapper").remove();
            $("#page").append(view.render().el);
        }
	});
	return HomeView;
});
