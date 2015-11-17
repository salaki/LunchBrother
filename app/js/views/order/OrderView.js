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
], function (DishModel, DishCollection, OrderModel, PaymentModel, CardModel, PickUpLocationModel, GridModel, InventoryModel, DishCollectionView, ConfirmView, TextView, Stripe, statsTemplate, orderTemplate) {
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
            Stripe.setPublishableKey(STRIPE_KEY);
       },

        render: function () {
        	var that = this;
        	var query = new Parse.Query(CardModel);

            var grid = Parse.User.current().get('gridId');
            if (grid === undefined) {
                var gridQuery = new Parse.Query(GridModel);
                gridQuery.get(UMCP_GRID_ID, {
                    success: function(defaultGrid) {
                        var pickUpLocationQuery = new Parse.Query(PickUpLocationModel);
                        pickUpLocationQuery.equalTo('gridId', defaultGrid);
                        pickUpLocationQuery.find({
                            success: function(pickUpLocations) {
                                var pickUpLocationMap = {};
                                for(var i = 0; i < pickUpLocations.length; i++) {
                                    pickUpLocationMap[pickUpLocations[i].toJSON().objectId] = pickUpLocations[i].toJSON();
                                }
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

                                        that.$("#addressdetails").change(function() {
                                            if (pickUpLocationMap[$("#addressdetails").val()]['youtubeLink']) {
                                                that.$("#youtubeDiv").show();
                                                that.$("#frame").attr("src", pickUpLocationMap[$("#addressdetails").val()]['youtubeLink'] + "?autoplay=0");
                                            }
                                        });

                                        //Localization
                                        that.$("#termsInput").prop('checked', true);
                                        that.$("#addressdetails").dropdown();
                                        that.$("#cardNumber").attr("placeholder", "Your Card Number");
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
                        var pickUpLocationMap = {};
                        for(var i = 0; i < pickUpLocations.length; i++) {
                            pickUpLocationMap[pickUpLocations[i].toJSON().objectId] = pickUpLocations[i].toJSON();
                        }
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

                                that.$("#addressdetails").change(function() {
                                    if(pickUpLocationMap[$("#addressdetails").val()]['youtubeLink']) {
                                        that.$("#youtubeDiv").show();
                                        that.$("#frame").attr("src", pickUpLocationMap[$("#addressdetails").val()]['youtubeLink'] + "?autoplay=0");
                                    } else {
                                        that.$("#youtubeDiv").hide();
                                    }
                                });

                                that.$("#addressdetails").dropdown();
                                that.$("#cardNumber").attr("placeholder", "Your Card Number");
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

        toggleNewCardForm: function(e) {
        	$('#newCardInfo').transition('slide down');
        	$('#userCardList').toggleClass('disabled');
        	$('.ui.checkbox', '#userCardList').toggleClass('disabled');
        	
        },

        orderSubmit: function (e) {
            e.preventDefault();
            this.checkInventory();
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
            inventoryQuery.find({
                success: function(inventories) {
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
                        self.createToken();
                    }
                },
                error: function(err) {
                    console.log(err.message);
                }
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
                    //Do nothing
                }
            }).modal('show');
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
                            self.updateInventory(paymentDetails, params.coupon); // Execute a series of actions

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
                            showMessage("Fail", "Save payment record failed! Error: " + error.code + " " + error.message);
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

        updateInventory: function(paymentDetails, coupon) {
            var self = this;
            _.each(this.model.orders, function (dish) {
                var inventoryQuery = new Parse.Query(InventoryModel);
                inventoryQuery.get(dish.inventoryId, {
                    success: function(inventory) {
                        var newQantity = inventory.get('currentQuantity') - dish.count;
                        inventory.set('currentQuantity', newQantity);
                        inventory.save(null, {
                            success: function() {
                                console.log("Update current quantity successfully!");
                                self.saveOrders(paymentDetails, coupon);
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

        saveOrders: function(paymentDetails, coupon) {
            var self = this;
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
                orderDetails.save(null, {
                        success: function() {
                            self.chargeCreditBalance(coupon, paymentDetails.id);
                        },
                        error: function(err) {
                            console.log("Failed to save orders. Reason: " + err.message);
                        }
                    }
                );
            });
        },

        chargeCreditBalance: function(coupon, paymentDetailId){
            var currentUser = Parse.User.current();
            var currentCredit = parseFloat((currentUser.get('creditBalance') - coupon).toFixed(2));
            currentUser.set('creditBalance', currentCredit);
            currentUser.save();
            this.emailService(paymentDetailId);
        },

        emailService: function (paymentId) {
            Parse.Cloud.run('email', {
                paymentId: paymentId

            }, {
                success: function () {
                    console.log("Confirmation email has been sent!");
                },

                error: function (error) {
                    console.log("Fail to send email. Reason: " + error.message);
                }
            });
        }
    });
    return OrderView;
});
