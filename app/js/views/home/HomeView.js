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
            var current = new Date();
            var currentHour = current.getHours();
            if (currentHour > 14) {
                //After 14:00, display the inventory of the next day
                var upperDate = new Date(current.getTime() + 24 * 60 * 60 * 1000);
                upperDate.setHours(12, 0, 0, 0);
                var lowerDate = new Date(current.getTime() + 24 * 60 * 60 * 1000);
                lowerDate.setHours(10, 0, 0, 0);
            }
            else {
                //Before 14:00, display the inventory of the current day
                var upperDate = new Date(current.getTime());
                upperDate.setHours(12, 0, 0, 0);
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
                    alert("Error: " + error.code + " " + error.message);
                }
            });
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
                    alert("Error: " + error.code + " " + error.message);
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
                    alert("Error: " + error.code + " " + error.message);
                }
            })
        },

		continuePay : function() {
			var currentTime = new Date();
			var weekday = currentTime.getDay();

            var stopOrderTimeStart = new Date();
            stopOrderTimeStart.setHours(11, 45, 0, 0);
            var stopOrderTimeEnd = new Date();
            stopOrderTimeEnd.setHours(14, 0, 0, 0);

            var view = new OrderView({
                model : this.stats
            });

            if ((weekday == 6) || (weekday == 0 && currentTime < stopOrderTimeEnd)) {
                $("#timeAlert").css("display", "block");
                $("#paymentBtn").addClass('disabled');
                $("#timeAlert").text("Sorry, we don't provide service in weekends. Please come back Sunday after 2:00PM.");
            } else if(weekday !== 0 && (currentTime > stopOrderTimeStart && currentTime < stopOrderTimeEnd)) {
                $("#timeAlert").css("display", "block");
                $("#paymentBtn").addClass('disabled');
                $("#timeAlert").text("Sorry, we don't take order after 11:45AM. Our order time is 2:00PM-11:45AM.");
            } else if ((weekday == 0 && currentTime > stopOrderTimeEnd) || (weekday == 5 && currentTime < stopOrderTimeStart) && ($("#order").length == 0)) {
                $("#dishTitle,#dishList,#paymentBtn,#orderMessage").remove();
                $("#page").append(view.render().el);
            } else if ((weekday >= 1 && weekday <= 4) && (currentTime < stopOrderTimeStart || currentTime > stopOrderTimeEnd) && ($("#order").length == 0)) {
                $("#dishTitle,#dishList,#paymentBtn,#orderMessage").remove();
                $("#page").append(view.render().el);
            }
		}
	});
	return HomeView;
});
