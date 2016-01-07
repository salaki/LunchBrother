define(['views/home/DishView',
    'views/order/OrderView',
    'models/dish/DishModel',
    'models/dish/DishCollection',
    'models/Grid',
    'models/Restaurant',
    'models/InventoryModel',
    'models/UserRequestModel',
    'text!templates/home/homeTemplate.html',
    'text!templates/home/statsTemplate.html',
    'text!templates/order/orderTemplate.html'],
    function(DishView, OrderView, DishModel, DishCollection, GridModel, RestaurantModel, InventoryModel, UserRequestModel, homeTemplate, statsTemplate, orderTemplate) {

	var HomeView = Parse.View.extend({
		// tagName: 'ul', // required, but defaults to 'div' if not set
		el : $("#page"),

		statsTemplate : _.template(statsTemplate),
		stats : {
			orders : [],
			coupon : 0,
			tax : 0,
			totalCharge : 0
		},

		events : {
			'click #paymentBtn' : 'continuePay'
		},

        inventoryMap : {},
		initialize : function() {
			_.bindAll(this, 'render', 'loadAll', 'addOne', 'continuePay');
			this.$el.html(_.template(homeTemplate)());
                
            this.dishes = new DishCollection;
            var self = this;
            var inventoryQuery = new Parse.Query(InventoryModel);
            
            //Display the inventory dishes
            var upperDate = new Date();
            upperDate.setHours(13, 0, 0, 0);
            var lowerDate = new Date();
            lowerDate.setHours(10, 0, 0, 0);

            inventoryQuery.include("dish");
            inventoryQuery.include("dish.restaurant");
            inventoryQuery.greaterThan("pickUpDate", lowerDate);
            inventoryQuery.lessThan("pickUpDate", upperDate);
            inventoryQuery.find({
                success: function(inventories) {
                    _.each(inventories, function(inventory) {
                        var dish = inventory.get("dish");
                        dish.add("price", inventory.get('price'));
                        self.dishes.add(dish);
                        self.inventoryMap[dish.id] = {
                            inventoryId: inventory.id,
                            price: inventory.get('price'),
                            currentQuantity: inventory.get('currentQuantity'),
                            restaurant: dish.get('restaurant')
                        }
                    });

                    self.loadAll();
                    self.dishes.bind('all', self.render);
                },
                error: function(error) {
                    showMessage("Error", "Find inventory failed! Reason: " + error.message);
                }
            });
            

            // Enable or disable checkout button based on current time
            this.disableOrEnableCheckOutBtn();
		},

        disableOrEnableCheckOutBtn: function() {
            var currentTime = new Date();
            var weekday = currentTime.getDay();

            var startOrderTime = new Date();
            startOrderTime.setHours(11, 0, 0, 0);
            var stopOrderTime = new Date();
            stopOrderTime.setHours(13, 0, 0, 0);

            if (Parse.User.current().get('permission') != LB_ADMIN) {
                if (weekday == 6 || weekday == 0) {
                    $("#timeAlert").css("display", "block");
                    $("#paymentBtn").addClass('disabled');
                    $("#timeAlert").text("Sorry, we don't provide the service on weekends. Please come back on Monday :)");

                } else if(currentTime > stopOrderTime || currentTime < startOrderTime) {
                    $("#timeAlert").css("display", "block");
                    $("#paymentBtn").addClass('disabled');
                    $("#timeAlert").text("Sorry, we don't take order before 11:00AM or after 1:00PM. Our order time is 11:00AM-1:00PM.");

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
                order.code = dish.get('dishCode');
                order.name = dish.get('dishName');
                order.inventoryId = self.inventoryMap[dish.id].inventoryId;
                order.restaurant = self.inventoryMap[dish.id].restaurant;
                self.stats.orders.push(order);
            });

            var charge = 0;
            _.each(this.stats.orders, function(order) {
                charge += order.count * order.price;
            });

            this.stats.tax = parseFloat((charge * 0.11).toFixed(2));
            var currentUser = Parse.User.current();
            var ordercoupon = 3 * this.dishes.totalCount();
            if (ordercoupon <= currentUser.get('creditBalance')) {
                this.stats.coupon = ordercoupon;
            } else {
                this.stats.coupon = currentUser.get('creditBalance');
            }
            //this.stats.totalCharge = parseFloat((charge + this.stats.tax - this.stats.coupon).toFixed(2));
            this.stats.totalCharge = parseFloat((charge).toFixed(2));
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

            var newEvent = {};
            newEvent["click #" + dish.id +"-dimmerButton"] = 'onRequestClick';
            this.delegateEvents(_.extend(this.events, newEvent));

            var current = new Date();
            var startOrderTime = new Date();
            startOrderTime.setHours(11, 0, 0, 0);
            var stopOrderTime = new Date();
            stopOrderTime.setHours(13, 0, 0, 0);

            if (current > startOrderTime && current < stopOrderTime) {
                if (currentQuantity <= 5) {
                    $('#' + dish.id + '-currentQuantityWarning').text("Only " + currentQuantity + " left!");
                    $('#' + dish.id + '-currentQuantityWarning').show();
                }

                if (dish.get('count') === currentQuantity) {
                    $('#' + dish.id + '-dimmer').addClass('active');
                    $('#' + dish.id + '-plusButton').prop('disabled', true);
                    $('#' + dish.id + '-currentQuantityWarning').hide();
                } else {
                    $('#' + dish.id + '-dimmer').dimmer('hide');
                }
            } else if (Parse.User.current().get('permission') != LB_ADMIN) {
                $('#' + dish.id + '-plusButton').prop('disabled', true);
                $('#' + dish.id + '-minusButton').prop('disabled', true);
            }

		},


        onRequestClick: function(ev) {
            var dishId = $(ev.currentTarget).data('id');
            var inventoryId = $(ev.currentTarget).data('inventoryId');

            //Time frame to query user request
            var current = new Date();
            var currentHour = current.getHours();
            if (currentHour > 14) {
                //After 14:00, look for the user request from today 14:00 to tomorrow 14:00
                var dayStart = current;
                dayStart.setHours(14, 0, 0, 0);
                var dayEnd = new Date(current.getTime() + 24 * 60 * 60 * 1000);
                dayEnd.setHours(14, 0, 0, 0);
            }
            else {
                //Before 14:00, look for the user request from yesterday 14:00 to today 14:00
                var dayStart = new Date(current.getTime() - 24 * 60 * 60 * 1000);
                dayStart.setHours(14, 0, 0, 0);
                var dayEnd = current;
                dayEnd.setHours(14, 0, 0, 0);
            }

            var self = this;
            var userEmail = Parse.User.current().get('email');
            var userRequestQuery = new Parse.Query(UserRequestModel);
            userRequestQuery.equalTo("requestType", "INVENTORY");
            userRequestQuery.equalTo("requestByEmail", userEmail);
            userRequestQuery.greaterThan("createdAt", dayStart);
            userRequestQuery.lessThan("createdAt", dayEnd);
            userRequestQuery.find({
                success: function(requests) {
                    if (requests.length === 0) {
                        var userRequest = new UserRequestModel();
                        userRequest.set("requestType", "INVENTORY");
                        userRequest.set("requestTargetId", dishId);
                        userRequest.set("requestByEmail", userEmail);
                        userRequest.save();

                        self.updateInventoryRequestNumber(inventoryId);

                        $('#' + dishId + '-dimmerButton').text('Request Sent!');
                    } else {
                        $('#' + dishId + '-dimmerButton').text('Sorry, one request per day!');
                    }
                },
                error: function(error) {
                    showMessage("Error", "Find request records failed! Reason: " + error.message);
                }
            });
        },

        updateInventoryRequestNumber: function(inventoryId) {
            var inventoryQuery = new Parse.Query(InventoryModel);
            inventoryQuery.get(inventoryId, {
                success: function(inventory) {
                    var requestNumber = 0;
                    if (inventory.get('numberOfRequest')){
                        requestNumber = inventory.get('numberOfRequest');
                    }
                    inventory.set("numberOfRequest", requestNumber + 1);
                    inventory.save();
                },
                error: function(error) {
                    showMessage("Error", "Find inventory failed! Reason: " + error.message + "Inventory Id: " + inventoryId);
                }
            })
        },

		continuePay : function() {
            var view = new OrderView({
                model : this.stats
            });

            $("#dishTitle,#dishList,#paymentBtn,#orderMessage,#payCashBtn").remove();
            $("#page").append(view.render().el);
        }
	});
	return HomeView;
});
