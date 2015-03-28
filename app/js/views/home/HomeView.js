define(['views/home/DishView', 'views/order/OrderView', 'models/dish/DishModel', 'models/dish/DishCollection', 'i18n!nls/string', 'text!templates/home/homeTemplate.html', 'text!templates/home/statsTemplate.html', 'text!templates/order/orderTemplate.html'], function(DishView, OrderView, DishModel, DishCollection, string, homeTemplate, statsTemplate, orderTemplate) {

	var HomeView = Parse.View.extend({
		// tagName: 'ul', // required, but defaults to 'div' if not set
		el : $("#page"),

		statsTemplate : _.template(statsTemplate),
		stats : {
			orders : [],
			coupon : 0,
			tax : 0,
			totalCharge : 0,
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
				$("#userPhone").text(currentUser.get('telnum'));
				$("#userFullName").text(currentUser.get('firstName') + " " + currentUser.get('lastName'));
				$("#userCreditBalance").text(currentUser.get('creditBalance').toFixed(2));
				$("#accountBarFirstName").text(currentUser.get('firstName'));
			}
			$('#account').show();

			this.dishes = new DishCollection;

			var bdQuery = new Parse.Query(DishModel);
			bdQuery.equalTo("Dish_Id", this.getDishId());
			var comboQuery = new Parse.Query(DishModel);
			comboQuery.equalTo("Dish_Id", 11);
            var comboCQuery = new Parse.Query(DishModel);
            comboCQuery.equalTo("Dish_Id", 13);


			var mainQuery = Parse.Query.or(bdQuery, comboQuery, comboCQuery);

			this.dishes.query = mainQuery;

			this.dishes.bind('reset', this.loadAll);
			this.dishes.bind('all', this.render);

			this.dishes.fetch();

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
			//Localization
			$("#dishTitle").html(string.dishTitle);
			$("#orderDetails").html(string.orderDetails);
			$("#orderMessage").html(string.orderMessage);
			$("#paymentBtn").html(string.paymentBtn);
			$(".summary-coupon-label").html(string.summaryCouponLabel);
			$(".summary-tax-label").html(string.summaryTaxLabel);
			$(".summary-total-label").html(string.summaryTotalLabel);

			this.delegateEvents();
			return this;
		},

		getDishId : function() {
			var currentTime = new Date();
			var now = new Date();
			var onejan = new Date(now.getFullYear(), 0, 1);
			var weekOfYear = Math.ceil( (((now - onejan) / 86400000) + onejan.getDay() + 1) / 7 );
			var dayOfWeek = now.getDay();
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
			}
                        console.log(weekOfYear);
                        console.log(dayOfWeek);
			return dayOfWeek;
		},

		addOne : function(dish) {
			var view = new DishView({
				model : dish
			});
			this.$("#dishList").append(view.render().el);
		},

		loadAll : function(collection, filter) {
			this.$("#dishList").html("");
			this.dishes.each(this.addOne);
		},

		continuePay : function() {
			var currentTime = new Date();
			var weekday = currentTime.getDay();
			var hours = currentTime.getHours();
			var view = new OrderView({
				model : this.stats
			});

            var currentUserEmail = Parse.User.current().get('email');
            if (currentUserEmail == 'jackypig0906@gmail.com' || currentUserEmail == 'quqing11@gmail.com' || currentUserEmail == 'zhengzho@umd.edu') {
                if (($("#order").length == 0)) {
                    $("#dishTitle,#dishList,#paymentBtn,#orderMessage").remove();
                    $("#page").append(view.render().el);
                }
            } else {
                if ((weekday == 6) || (weekday == 0 && hours < 14)) {
                    $("#timeAlert").css("display", "block");
                    $("#paymentBtn").addClass('disabled');
                    if (locale == "zh-cn") {
                        $("#timeAlert").text("不好意思，带饭大哥周末不订餐，周一订餐从周日晚八点开始");
                    } else {
                        $("#timeAlert").text("Sorry, we don't provide service in weekends. Please come back Sunday after 2:00PM.");
                    }
                } else if(weekday !== 0 && (hours>=11 && hours<=13)) {
                    $("#timeAlert").css("display", "block");
                    $("#paymentBtn").addClass('disabled');
                    if (locale == "zh-cn") {
                        $("#timeAlert").text("不好意思，带饭大哥订餐11点结束，明天请早儿吧");
                    } else {
                        $("#timeAlert").text("Sorry, we don't take order after 11:00AM. Our order time is 2:00PM-11:00AM.");
                    }
                }else if ((weekday == 0 && hours >= 14) || (weekday == 5 && hours <= 10) && ($("#order").length == 0)) {
                    $("#dishTitle,#dishList,#paymentBtn,#orderMessage").remove();
                    $("#page").append(view.render().el);
                } else if ((weekday >= 1 && weekday <= 4) && (hours <= 10 || hours >= 14) && ($("#order").length == 0)) {
                    $("#dishTitle,#dishList,#paymentBtn,#orderMessage").remove();
                    $("#page").append(view.render().el);
                }
            }
		}
	});
	return HomeView;
});
