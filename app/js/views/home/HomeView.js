define(['views/home/DishView',
    'views/order/OrderView',
    'models/dish/DishModel',
    'models/dish/DishCollection',
    'models/Grid',
    'models/Restaurant',
    'models/InventoryModel',
    'text!templates/home/homeTemplate.html',
    'text!templates/home/statsTemplate.html',
    'text!templates/order/orderTemplate.html'],
    function(DishView, OrderView, DishModel, DishCollection, GridModel, RestaurantModel, InventoryModel, homeTemplate, statsTemplate, orderTemplate) {

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

		initialize : function() {
			// Move to account panel view when added
			$('#referlink input').val('https://www.lunchbrother.com/?refer=' + Parse.User.current().id + '#signupemail');

			_.bindAll(this, 'render', 'loadAll', 'addOne', 'continuePay');
			this.$el.html(_.template(homeTemplate)());

			var currentUser = Parse.User.current();
			if (currentUser != null) {
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

            this.dishes = new DishCollection;

            //TODO - Create an UI to set dishes to true for restaurants
            var mainQuery = new Parse.Query(DishModel);
//            mainQuery.equalTo("active", true);
//            alert(this.getDayOfWeekAndWeekOfYearCode());
            mainQuery.equalTo("Dish_Id", new Date().getDay() + 1);
            mainQuery.include("restaurant");

            //TODO - Find out restaurants in the user's grid
            var self = this;
            var restaurantQuery = new Parse.Query(RestaurantModel);
            var userGrid = new GridModel();
            userGrid.id = gridId;
            restaurantQuery.equalTo("gridId", userGrid);
            restaurantQuery.find({
                success: function(restaurants) {
                    var restaurantArray = [];
                    for (var i=0; i<restaurants.length; i++) {
                        restaurantArray.push(restaurants[i]);
                    }
                    mainQuery.containedIn("restaurant", restaurantArray);
                    self.dishes.query = mainQuery;
                    self.dishes.bind('reset', self.loadAll);
                    self.dishes.bind('all', self.render);
                    self.dishes.fetch();
                },
                error: function(error) {
                    console.log(error.message);
                }
            });
		},

		render : function() {
			this.stats.orders = this.dishes.orders();
			this.stats.tax = parseFloat((this.dishes.charge() * 0.11).toFixed(2));
			var currentUser = Parse.User.current();
			var ordercoupon = 3 * this.dishes.totalCount();
			if (ordercoupon <= currentUser.get('creditBalance')) {
				this.stats.coupon = ordercoupon;
			} else {
				this.stats.coupon = currentUser.get('creditBalance');
			}
			this.stats.totalCharge = parseFloat((this.dishes.charge() + this.stats.tax - this.stats.coupon).toFixed(2));
			this.$('#orderStats').html(this.statsTemplate(this.stats));
			this.delegateEvents();
			return this;
		},

		getDayOfWeekAndWeekOfYearCode: function() {
			var currentTime = new Date();

			var day = new Date();
			var onejan = new Date(day.getFullYear(), 0, 1);
                        var today = new Date(day.getFullYear(),day.getMonth(),day.getDate());
  			var dayOfYear = ((today - onejan + 86400000)/86400000);
			var weekOfYear = Math.ceil(dayOfYear/7)+1;
            var weekOfYearCode = 11;
			var dayOfWeek = today.getDay();
			var hours = currentTime.getHours();
			//Sunday and Saturday show Monday Pic
			if (dayOfWeek == 6) {
				dayOfWeek = 1;
				weekOfYear++;
			}
			else if(dayOfWeek == 0) {
				dayOfWeek = 1;
			}
			//Monday to Thursday
			else if (hours >= 14 && (dayOfWeek <= 4 && dayOfWeek >= 1)) {
				dayOfWeek++;
			}

			if (weekOfYear % 2 == 0) {
				dayOfWeek += 5;
                weekOfYearCode = 12;
			}
                        console.log(weekOfYear);
                        console.log(dayOfWeek);
			return [dayOfWeek, weekOfYearCode];
		},

		addOne : function(dish) {
			var view = new DishView({
				model : dish
			});

			this.$("#dishList").append(view.render().el);
            $('#' + dish.id + ' .menu .item').tab({context: $('#' + dish.id)});
            $('.ui.rating').rating({
                interactive: false
            });


            var inventoryQuery = new Parse.Query(InventoryModel);
            inventoryQuery.equalTo('dishId', dish.id);
            inventoryQuery.descending('createdAt');
            inventoryQuery.find({
                success: function(inventories) {
                    var currentQuantity = 4;
                if (inventories.length !== 0) {
                    currentQuantity = inventories[0].get('currentQuantity');
                }
                    view.setCurrentQuantity(currentQuantity);

                    if (currentQuantity <= 5) {
                        $('#' + dish.id + '-currentQuantityWarning').text("Only " + currentQuantity + " left!");
                        $('#' + dish.id + '-currentQuantityWarning').show();
                    }

                    if (dish.get('count') === currentQuantity) {
                        $('#' + dish.id + '-dimmer').dimmer('show');
                        $('#' + dish.id + '-plusButton').prop('disabled', true);
                        $('#' + dish.id + '-currentQuantityWarning').hide();
                    } else {
                        $('#' + dish.id + '-dimmer').dimmer('hide');
                    }
                },
                error: function(err) {
                    console.log(err.message);
                }
            });
		},

		loadAll : function(collection, filter) {
			this.$("#dishList").html("");
			this.dishes.each(this.addOne);
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
