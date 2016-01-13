define([
    'models/dish/DishModel',
  'models/dish/DishCollection',
  'models/order/OrderModel',
  'models/order/PaymentModel',
  'models/user/CardModel',
  'models/PickUpLocation',
  'models/Grid',
  'models/InventoryModel',
  'views/home/DishCollectionView',
  'views/confirm/ConfirmView',
  'views/confirm/TextView',
    'stripe',
  'text!templates/home/statsTemplate.html',
  'text!templates/order/orderTemplate.html',
  'libs/semantic/checkbox.min',
  'libs/semantic/form.min'
], function (DishModel, DishCollection, OrderModel, PaymentModel, CardModel, PickUpLocationModel,
             GridModel, InventoryModel, DishCollectionView, ConfirmView, TextView, Stripe, statsTemplate,
             orderTemplate) {
    var OrderView = Parse.View.extend({

        id: "order",

        tagName: "div",

        attributes: {
            class: 'column'
        },

        template: _.template(orderTemplate),

        events: {
            'submit #paymentForm': 'orderSubmit',
            'click #newCard':'toggleNewCardForm',
            'click #payCardBtn' : 'showCardInfo',
            'click #payCashBtn' : 'showCashInfo'
        },

        paymentMethod: "Cash",

        finalCharge: 0,

        initialize: function () {
            _.bindAll(this, 'render', 'stripeResponseHandler');
            Stripe.setPublishableKey(STRIPE_KEY);
            this.finalCharge = this.stats.totalCharge - this.stats.tax;
        },

        render: function () {
            var self = this;
        	var cardQuery = new Parse.Query(CardModel);
            cardQuery.equalTo("createdBy", Parse.User.current());
            cardQuery.find().then(function(cards){
                $(self.el).html(self.template({cards: cards}));
                self.$("#termsInput").prop('checked', true);
                self.$("#cardNumber").attr("placeholder", "Your Card Number");

                // TODO - Show Youtube Video if is available
                //if(self.model.youtubeLink) {
                //    self.$("#youtubeDiv").show();
                //    self.$("#frame").attr("src", self.model.youtubeLink + "?autoplay=0");
                //} else {
                //    self.$("#youtubeDiv").hide();
                //}

            }, function(error){
                showMessage("Oops!", "Something is wrong! Reason: " + error.message);

            });

            return this;
        },

        toggleNewCardForm: function(e) {
        	$('#newCardInfo').transition('slide down');
        	$('#userCardList').toggleClass('disabled');
        	$('.ui.checkbox', '#userCardList').toggleClass('disabled');
        	
        },

        orderSubmit: function (e) {
            e.preventDefault();
            this.checkInventory();
        },

        showCardInfo: function(e) {
            $("#cardInfo").removeClass("hide");
            $("#cashInfo").addClass("hide");
            $("#payCardBtn").addClass("orange");
            $("#payCashBtn").removeClass("orange");
            this.paymentMethod = "Credit Card";
            this.finalCharge = this.stats.totalCharge;
            $(".summary-total").html(this.finalCharge);
        },
        
        showCashInfo: function(e) {
            $("#cardInfo").addClass("hide");
            $("#cashInfo").removeClass("hide");
            $("#payCardBtn").removeClass("orange");
            $("#payCashBtn").addClass("orange");
            this.paymentMethod = "Cash";
            this.finalCharge = this.stats.totalCharge - this.stats.tax;
            $(".summary-total").html(this.finalCharge);
        },

        checkInventory: function() {
            var dishCountMap = {};
            var inventoryIds = [];

            _.each(this.model.orders, function (dish) {
                inventoryIds.push(dish.inventoryId);
                dishCountMap[dish.inventoryId] = dish.count;
            });

            var inventoryQuery = new Parse.Query(InventoryModel);
            inventoryQuery.containedIn("objectId", inventoryIds);
            var self = this;
            var exceedInventory = false;
            inventoryQuery.find().then(function(inventories){
                _.each(inventories, function(inventory) {
                    var newQantity = inventory.get('currentQuantity') - dishCountMap[inventory.id];
                    if (newQantity < 0) {
                        exceedInventory = true;
                    }
                });

                if (exceedInventory) {
                    $('#inventoryExceededAlert').modal({
                        closable: false,
                        onApprove: function () {
                            window.location.href='#home';
                        }
                    }).modal('show');
                } else {
                    self.updateInventory();
                }
            });
        },

        updateInventory: function() {
            var self = this;
            var inventoryIds = [];
            var dishCount = {};
            _.each(this.model.orders, function (dish) {
                inventoryIds.push(dish.inventoryId);
                dishCount[dish.inventoryId] = dish.count;
            });

            var inventoryQuery = new Parse.Query(InventoryModel);
            inventoryQuery.containedIn("objectId", inventoryIds);
            inventoryQuery.find().then(function(inventories){
                _.each(inventories, function(inventory){
                    var newQantity = inventory.get('currentQuantity') - dishCount[inventory.id];
                    inventory.set('currentQuantity', newQantity);
                });

                return Parse.Object.saveAll(inventories);

            }).then(function(inventories){
                self.createToken();

            });
        },

        createToken: function() {
            var $form = this.$('form');
            //Disable the button
            $('#orderBtn').removeClass('red').addClass('grey');
            $('#orderBtn').prop('disabled', true);

            if(this.$('#userCardList').length == 0 || this.$('#userCardList').find('.disabled').length > 0){
                Stripe.card.createToken($form, this.stripeResponseHandler);
            }
            else{
                this.charge({
                    customerId: this.$('input[type=radio]:checked', '#userCardList').val(),
                    totalCharge: this.model.totalCharge,
                    coupon: this.model.coupon
                });
            }
        },

        stripeResponseHandler: function (status, response) {
            var $form = $('#paymentForm');
            if (response.error) {
                // Pop out the error message window
                this.displayPaymentFailDialog(response.error.message);
                $('#orderBtn').prop('disabled', false);
                $('#orderBtn').removeClass('grey').addClass('red');
            }
            else {
                // No errors, submit the form.
                var self = this;
                if(this.$('#rememberme input[type=checkbox]').is(':checked')){
                    var user = Parse.User.current();
                    var last4Digit = $form.find('input[name=number]').val().slice(-4);

                    Parse.Cloud.run('saveCard', {
                        card: response.id,
                        last4Digit: last4Digit
                    }, {
                        success: function (customer) {
                            self.charge({
                                totalCharge: self.model.totalCharge,
                                customerId: customer,
                                coupon: self.model.coupon
                            });
                            console.log(self.model.coupon);
                        }
                    });
                }
                else{
                    this.charge({
                        totalCharge: this.model.totalCharge,
                        paymentToken: response.id,
                        coupon: this.model.coupon
                    });
                    console.log(this.model.coupon);
                }
            }
        },

        displayPaymentFailDialog: function (errorMessage) {
            $('#paymentFailMessage').text(errorMessage);
            $('#failPaymentDialog').modal({
                closable: false,
                onApprove: function () {
                    var inventoryIds = [];
                    var dishCount = {};
                    _.each(this.model.orders, function (dish) {
                        inventoryIds.push(dish.inventoryId);
                        dishCount[dish.inventoryId] = dish.count;
                    });

                    var inventoryQuery = new Parse.Query(InventoryModel);
                    inventoryQuery.containedIn("objectId", inventoryIds);
                    inventoryQuery.find().then(function(inventories){
                        _.each(inventories, function(inventory){
                            var newQantity = inventory.get('currentQuantity') + dishCount[inventory.id];
                            inventory.set('currentQuantity', newQantity);
                        });

                        return Parse.Object.saveAll(inventories);

                    }).then(function(inventories){
                        //Do nothing

                    });
                }
            }).modal('show');
        },
        
        charge: function(params){
            var orderSummaryArray = [];

            _.each(this.model.orders, function (order) {
                var summary = order.code + "-" + order.name + "-" + order.count;
                orderSummaryArray.push(summary);
            });

            var self = this;
        	Parse.Cloud.run('pay', params, {
                success: function () {
                	var paymentDetails = new PaymentModel();
            		var user = Parse.User.current();
                    var fname = user.get('firstName');
                    var lname = user.get('lastName');
                    var email = user.get('email');
                    var phoneNumber = user.get('telnum');
                    var pickUpLocationId = $('#addressdetails option:selected').val();

                    paymentDetails.set('telnum', phoneNumber);
                    paymentDetails.set('fname', fname);
                    paymentDetails.set('lname', lname);
                    paymentDetails.set('lowercaseLastName', lname.toLowerCase());
                    paymentDetails.set('email', email);
                    if(params.customerId){
                    	paymentDetails.set('stripeToken', params.customerId);
                    }
                    else{
                    	paymentDetails.set('stripeToken', params.paymentToken);
                    }
                    var pickUpLocation = new PickUpLocationModel();
                    pickUpLocation.id = pickUpLocationId;
                    paymentDetails.set('pickUpLocation', pickUpLocation);
                    paymentDetails.set('totalPrice', params.totalCharge);
                    paymentDetails.set('paymentMethod', self.paymentMethod);

                    if (self.paymentMethod === "Cash") {
                        paymentDetails.set('paymentCheck', false);

                    } else {
                        paymentDetails.set('paymentCheck', true);
                    }

                    paymentDetails.set('orderSummary', orderSummaryArray);
                    paymentDetails.save().then(function(paymentDetails){
                        self.saveOrders(paymentDetails)

                    });
                },
                error: function (error) {
                    self.displayPaymentFailDialog(error.message);
        	        $('#orderBtn').prop('disabled', false);
                    $('#orderBtn').removeClass('grey').addClass('red');
                }
            });
        },

        saveOrders: function(paymentDetails) {
            var self = this;
            var ordersToSave = [];
            _.each(this.model.orders, function (order) {
                var dish = new DishModel();
                dish.id = order.dishId;
                var orderDetails = new OrderModel();
                orderDetails.set('dishId', dish);
                orderDetails.set('quantity', order.count);
                orderDetails.set('paymentId', paymentDetails);
                orderDetails.set('orderBy', Parse.User.current());
                orderDetails.set('unitPrice', order.price);
                orderDetails.set('subTotalPrice', order.price * order.count);
                orderDetails.set('restaurantId', order.restaurant);
                orderDetails.set('pickUpLocation', paymentDetails.get('pickUpLocation'));
                ordersToSave.push(orderDetails);
            });

            Parse.Object.saveAll(ordersToSave).then(function(){
                self.emailService(paymentDetails);

            }, function(err){
                console.log("Failed to save orders. Reason: " + err.message);

            });
        },

        emailService: function (paymentDetails) {
            Parse.Cloud.run('email', {
                paymentId: paymentDetails.id

            }, {
                success: function () {
                    var view1 = new TextView({
                        model: paymentDetails
                    });
                    var view2 = new ConfirmView({
                        model: paymentDetails
                    });
                    $("#paymentForm").remove();
                    $("#page").prepend(view1.render().el);
                    $("#page").append(view2.render().el);
                    $('#orderBtn').prop('disabled', false);
                    $('#orderBtn').removeClass('grey').addClass('red');
                },

                error: function (error) {
                    console.log("Fail to send email. Reason: " + error.message);
                }
            });
        }
    });
    return OrderView;
});
