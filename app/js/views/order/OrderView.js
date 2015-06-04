define([
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
  'text!templates/home/statsTemplate.html',
  'text!templates/order/orderTemplate.html',
  'stripe',
  'i18n!nls/order',
  'libs/semantic/checkbox.min',
  'libs/semantic/form.min'

], function (DishCollection, OrderModel, PaymentModel, CardModel, PickUpLocationModel, GridModel, InventoryModel, DishCollectionView, ConfirmView, TextView, statsTemplate, orderTemplate, Stripe, OrderViewLocal) {
//    Stripe.setPublishableKey('pk_live_YzLQL6HfUiVf8XAdxGxWv5AkH');
    Stripe.setPublishableKey('pk_test_pb95pxk797ZxEFRk55wswMRk');
    var OrderView = Parse.View.extend({

        id: "order",

        tagName: "div",

        attributes: {
            class: 'column'
        },

        template: _.template(orderTemplate),

        events: {
            'submit #paymentForm': 'orderSubmit',
            'click #newCard':'toggleNewCardForm'
        },

        initialize: function () {
            _.bindAll(this, 'render', 'stripeResponseHandler', 'orderSubmit', 'toggleNewCardForm', 'charge');
//            Stripe.setPublishableKey('pk_live_YzLQL6HfUiVf8XAxGxWv5AkH');
            Stripe.setPublishableKey('pk_test_pb95pxk797ZxEFRk55wswMRk');
       },

        render: function () {
        	var that = this;
        	var query = new Parse.Query(CardModel);

            var grid = Parse.User.current().get('gridId');
            if (grid == undefined) {
                var gridQuery = new Parse.Query(GridModel);
                gridQuery.get("nmbyDzTp7m", {
                    success: function(defaultGrid) {
                        var pickUpLocationQuery = new Parse.Query(PickUpLocationModel);
                        pickUpLocationQuery.equalTo('gridId', defaultGrid);
                        pickUpLocationQuery.find({
                            success: function(pickUpLocations) {
                                query.equalTo("createdBy", Parse.User.current());
                                query.find({
                                    success: function(cards) {
                                        $(that.el).html(that.template({ cards: cards, pickUpLocations: pickUpLocations }));
                                        that.$('.ui.checkbox').checkbox();
                                        that.$('select.dropdown').dropdown();
                                        that.$('.ui.form').form({
                                            address: {
                                                identifier: 'address',
                                                rules: [{
                                                    type: 'empty',
                                                    prompt: 'Please select a location'
                                                }]
                                            },
                                            terms: {
                                                identifier: 'terms',
                                                rules: [{
                                                    type: 'checked',
                                                    prompt: 'You must agree to the terms and conditions'
                                                }]
                                            }
                                        }, {
                                            on: 'blur',
                                            inline: 'true'
                                        });

                                        //Localization
                                        that.$("#termsInput").prop('checked', true);
                                        that.$("#pickUpAddress").text(OrderViewLocal.pickUpAddress);
                                        that.$("#addressdetails").dropdown();
                                        that.$("#inputCardInfo").text(OrderViewLocal.inputCardInfo);
                                        that.$("#cardNumber").attr("placeholder", OrderViewLocal.cardNumber);
                                        that.$("#expDate").text(OrderViewLocal.expirationDate);
                                        that.$("#cvv2VerificationCode").text(OrderViewLocal.cvv2VerificationCode);
                                        that.$("label[for=terms]").text(OrderViewLocal.termOfUse);
                                        that.$("label[for=rememberme]").text(OrderViewLocal.rememberMe);
                                        that.$("#readTermOfUse").text(OrderViewLocal.readTermOfUse);
                                        that.$("#orderBtn").text(OrderViewLocal.orderBtn);
                                        that.$("#paymentFail").text(OrderViewLocal.orderBtn);
                                        that.$("#failedReason").text(OrderViewLocal.failedReason);
                                        that.$("#pleaseDoubleCheckOrder").text(OrderViewLocal.pleaseDoubleCheckOrder);
                                    }
                                });
                            },
                            error: function(error) {
                                console.log(error.message);
                            }
                        });
                    },
                    error: function(object, error) {
                        console.log(error.message);
                    }
                });
            } else {
                var pickUpLocationQuery = new Parse.Query(PickUpLocationModel);
                pickUpLocationQuery.equalTo('gridId', grid);
                pickUpLocationQuery.addAscending('address');
                pickUpLocationQuery.find({
                    success: function(pickUpLocations) {
                        query.equalTo("createdBy", Parse.User.current());
                        query.find({
                            success: function(cards) {
                                $(that.el).html(that.template({ cards: cards, pickUpLocations: pickUpLocations }));
                                that.$('.ui.checkbox').checkbox();
                                that.$('select.dropdown').dropdown();
                                that.$('.ui.form').form({
                                    address: {
                                        identifier: 'address',
                                        rules: [{
                                            type: 'empty',
                                            prompt: 'Please select a location'
                                        }]
                                    },
                                    terms: {
                                        identifier: 'terms',
                                        rules: [{
                                            type: 'checked',
                                            prompt: 'You must agree to the terms and conditions'
                                        }]
                                    }
                                }, {
                                    on: 'blur',
                                    inline: 'true'
                                });

                                //Localization
                                that.$("#pickUpAddress").text(OrderViewLocal.pickUpAddress);
                                that.$("#addressdetails").dropdown();
                                that.$("#inputCardInfo").text(OrderViewLocal.inputCardInfo);
                                that.$("#cardNumber").attr("placeholder", OrderViewLocal.cardNumber);
                                that.$("#expDate").text(OrderViewLocal.expirationDate);
                                that.$("#cvv2VerificationCode").text(OrderViewLocal.cvv2VerificationCode);
                                that.$("label[for=terms]").text(OrderViewLocal.termOfUse);
                                that.$("label[for=rememberme]").text(OrderViewLocal.rememberMe);
                                that.$("#readTermOfUse").text(OrderViewLocal.readTermOfUse);
                                that.$("#orderBtn").text(OrderViewLocal.orderBtn);
                                that.$("#paymentFail").text(OrderViewLocal.orderBtn);
                                that.$("#failedReason").text(OrderViewLocal.failedReason);
                                that.$("#pleaseDoubleCheckOrder").text(OrderViewLocal.pleaseDoubleCheckOrder);
                            }
                        });
                    },
                    error: function(error) {
                        console.log(error.message);
                    }
                });
            }


       	
            return this;
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
        toggleNewCardForm: function(e) {
        	$('#newCardInfo').transition('slide down');
        	$('#userCardList').toggleClass('disabled');
        	$('.ui.checkbox', '#userCardList').toggleClass('disabled');
        	
        },
        orderSubmit: function (e) {
            e.preventDefault();
            var $form = this.$('form');
            //Disable the button
            $('#orderBtn').removeClass('red').addClass('grey');
            $('#orderBtn').prop('disabled', true);

            this.checkInventory();
        },

        displayPaymentFailDialog: function (errorMessage) {
            $('#paymentFailMessage').text(errorMessage);
            $('#failPaymentDialog').modal({
                closable: false,
                onApprove: function () {
                    //Do nothing
                }
            }).modal('show');
        },
        
        chargeCreditBalance: function(coupon){
        	var currentUser = Parse.User.current();
        	var currentCredit = parseFloat((currentUser.get('creditBalance') - coupon).toFixed(2));
            	currentUser.set('creditBalance', currentCredit);
            	currentUser.save();
        },
        
        
        emailService: function (paymentId) {
            Parse.Cloud.run('email', {
                orderId: paymentId

            }, {
                success: function () {
                    console.log("Confirmation email has been sent!");
                },

                error: function (error) {
                    console.log("Fail to send email. Reason: " + error.message);
                }
            });
        },
        
        charge: function(params){
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
                    paymentDetails.set('paymentCheck', true);
                    paymentDetails.save(null, {
                        success: function (paymentDetails) {
                            self.saveOrders(paymentDetails);
                            self.updateInventory();
                            self.emailService(paymentDetails.id);
                            self.chargeCreditBalance(params.coupon);

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
                        error: function (payment, error) {
                            alert('Failed to create new object, with error code: ' + error.message);
                        }
                    });
                },
                error: function (error) {
                    self.displayPaymentFailDialog(error.message);
        	        $('#orderBtn').prop('disabled', false);
                    $('#orderBtn').removeClass('grey').addClass('red');
                }
            });
        },

        checkInventory: function() {
            var dishCountMap = {};
            _.each(this.model.orders, function (dish) {
                dishCountMap[dish.id] = dish.get('count');
            });

            var inventoryQuery = new Parse.Query(InventoryModel);
            var self = this;
            var exceedInventory = false;
            inventoryQuery.find({
                success: function(inventories) {
                    _.each(inventories, function(inventory) {
                        if (inventory.get('dishId') in dishCountMap) {
                            var newQantity = inventory.get('currentQuantity') - dishCountMap[inventory.get('dishId')];
                            if (newQantity < 0) {
                                exceedInventory = true;
                            }
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
                        self.charge({
                            customerId: self.$('input[type=radio]:checked', '#userCardList').val(),
                            totalCharge: self.model.totalCharge,
                            coupon: self.model.coupon
                        });
                    }
                },
                error: function(err) {
                    console.log(err.message);
                }
            });
        },

        updateInventory: function() {
            _.each(this.model.orders, function (dish) {
                var inventoryQuery = new Parse.Query(InventoryModel);
                inventoryQuery.equalTo('dishId', dish.id);
                inventoryQuery.first({
                    success: function(inventory) {
                        var newQantity = inventory.get('currentQuantity') - dish.get('count');
                        inventory.set('currentQuantity', newQantity);
                        inventory.save(null, {
                            success: function() {
                                console.log("update current quantity successfully!");
                            },
                            error: function(err) {
                                console.log("Failed to update dish current quantity. Reason: " + err.message);
                            }
                        })
                    },
                    error: function(err) {
                        console.log(err.message);
                    }
                });
            });
        },

        saveOrders: function(paymentDetails) {
            _.each(this.model.orders, function (dish) {
                var orderDetails = new OrderModel();
                orderDetails.set('dishId', dish);
                orderDetails.set('quantity', dish.get('count'));
                orderDetails.set('paymentId', paymentDetails);
                orderDetails.set('orderBy', Parse.User.current());
                orderDetails.set('unitPrice', dish.get('Unit_Price'));
                orderDetails.set('subTotalPrice', dish.get('Unit_Price') * dish.get('count'));
                orderDetails.set('restaurantId', dish.get('restaurant'));
                orderDetails.set('pickUpLocation', paymentDetails.get('pickUpLocation'));
                orderDetails.save(null, {
                        success: function() {
                            //Do nothing
                        },
                        error: function(err) {
                            console.log("Failed to save orders. Reason: " + err.message);
                        }
                    }
                );
            });
        }
    });
    return OrderView;
});
