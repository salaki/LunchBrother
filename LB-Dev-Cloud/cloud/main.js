var express = require('express');
var app = express();

// Global app configuration section
app.use(express.bodyParser());  // Populate req.body
app.post('/receiveSMS',
    function(req, res) {
        console.log("Received a new text: " + req.body.From);
        console.log("Received body: " + req.body.Body);
        res.send('Success');

        if (req.body.Body.toUpperCase() === "yes".toUpperCase()) {
            //TODO - Use Parse Config to replace Twilio Credentials
        	var accountSID;
        	var authToken;
        	Parse.Config.get().then(function(config) {
        		accountSID = config.get("TwilioAccountSid");
        		}, function(error) {
        			console.log("Failed to fetch the TwilioAccountSid.");
        		});
        	Parse.Config.get().then(function(config) {
        		authToken = config.get("TwilioAuthToken");
        		}, function(error) {
        			console.log("Failed to fetch the TwilioAuthToken.");
        		});
            twilioSMSService(accountSID, authToken, req.body.From, "Thank you for your confirmation!"); 	

            //TODO - Update Corresponding Inventory Status
            
        }  else {
            console.log("No key words matched!");
        }
    });

app.listen();

Parse.Cloud.define("pay",
    function (request, response) {
        var Stripe = require("stripe");
        Stripe.initialize('sk_test_aslYgXx9b5OXsHKWqw3JxDCC');
        var tempAmount = request.params.totalCharge * 100;
        var params = {
            amount: tempAmount.toFixed(0),
            currency: "usd"
        };
        if (request.params.paymentToken) {
            params.card = request.params.paymentToken;
        }
        else {
            params.customer = request.params.customerId;
        }
        Stripe.Charges.create(params, {
                success: function (httpResponse) {
                    response.success("Purchase made!");
                }
                ,
                error: function (httpResponse) {
                    response.error("Error: " + httpResponse.message + "\n" + "Params:\n" + request.params.stripeToken + "," + request.params.amount);
                }
            }
        );
    }
);
Parse.Cloud.define("saveCard", function (request, response) {
    var Stripe = require("stripe");
    Stripe.initialize('sk_test_aslYgXx9b5OXsHKWqw3JxDCC');
    var last4Digit = request.params.last4Digit;
    Stripe.Customers.create({
        card: request.params.card,
        description: Parse.User.current().get('username') + ' - ' + last4Digit
    }).then(function (customer) {
        console.log('Stripe customer created with info', customer);
        var Card = Parse.Object.extend("Card");
        var card = new Card();
        card.set("customerId", customer.id);
        card.set("createdBy", Parse.User.current());
        card.set("last4Digit", last4Digit);
        card.save();
        response.success(customer.id);
    });
})
Parse.Cloud.define("email",
    function (request, response) {
        /*var Mandrill = require('mandrill');
         Mandrill.initialize('JRaXC3NG1BqZ_JWDnjX8gA');*/
        var orderId = request.params.orderId;
        var paymentModel = Parse.Object.extend("Payment");
        var payQuery = new Parse.Query(paymentModel);
        payQuery.get(orderId, {
            success: function (paymentDetail) {
                var emailAddress = paymentDetail.get('email');
                var fname = paymentDetail.get('fname');
                var lname = paymentDetail.get('lname');
                var quantity1 = paymentDetail.get('quantity1');
                var dishName1 = paymentDetail.get('dishName1');
                var quantity2 = paymentDetail.get('quantity2');
                var dishName2 = paymentDetail.get('dishName2');
                var totalPrice = paymentDetail.get('totalPrice');
                var address = paymentDetail.get('address');
                if (dishName1 != undefined) {
                    if (dishName2 != undefined) {
                        var text = " Dish1 " + dishName1 + " " + quantity1 + "  Dish2 " + dishName2 + " " + quantity2;
                    } else {
                        text = "  Dish " + dishName1 + " " + quantity1;
                    }
                }
                else {
                    text = " Dish " + dishName2 + " " + quantity2;
                }

                if (address == "Regents Drive Parking Garage") {
                    var addressDetails = "Regents Drive Parking Garage, College Park, MD 20740";
                    var addressNotes = "Meter space, Ground Floor, next to the elevator in the South-East corner.";
                    var contactInfo = "Fish：7245108760";
                }
                if (address == "McKeldin Library") {
                    addressDetails = "Library Ln,College Park, MD 20740";
                    addressNotes = "Meter space, next to the health center.";
                    contactInfo = "Jabber：2028124286";
                }
                if (address == "AV Williams Bldg") {
                    addressDetails = "AV Williams Building, College Park, MD 20740, XX5 parking lot";
                    addressNotes = "Side entrance of A.V.W. close to Kim BLD";
                    contactInfo = "Rachel：3013124798";
                }

                sendEmail({
                    message: {
                        html: '<p style="position: relative" align="middle"><b><big>' + fname + '</big></b></p><p style="position: relative" align="middle"><b><big>Thank you for placing your order at <a href="http://www.lunchbrother.com" style="color: blue">lunchbrother.com</a>!</big></b></p>' +
                            '<table border="0" cellpadding="10" align="center" style="position: relative">' +
                            '<tr><th align="right" width="30%">OrderNumber:</th>' +
                            '<td>' + orderId + '</td>' + '</tr>' + '<tr>' +
                            '<th align="right">Dish:</th>' +
                            '<td>' + text + '</td>' +
                            '</tr>' +
                            '<tr>' +
                            '<th align="right">Total Price: </th>' +
                            '<td>' + totalPrice + '</td>' +
                            '</tr>' +
                            '<tr>' +
                            '<th align="right "> Pick-Up Address:</th>' +
                            '<td>' + addressDetails + '</td>' +
                            '</tr>' +
                            '<tr>' +
                            '<td>&nbsp;</td>' +
                            '<td>' + addressNotes + '</td>' +
                            '</tr>' +
                            '<tr>' +
                            '<th align="right">Pick-Up Time:</th>' +
                            '<td> 12:00-13:00* Weekdays </td>' +
                            '</tr>' +
                            '<tr>' +
                            '<th align="right">ContactInfo</th>' +
                            '<td>' + contactInfo + '</td>' +
                            '</tr>' +
                            '</table>' +
                            '<p align="middle" style="position:relative;  color: red">*Please <a href="www.lunchbrother.com/#status">check the delivery status on Lunchbrother</a> to find the specific pick-up start time.</p>' +
                            '<p align="middle" style="position:relative;  color: red">**No pick-up later than <a style="color: blue;">13:10</a>, please manage well your pick-up time.' +
                            '</p>',
                        subject: "Notification: your lunch is on your way",
                        from_email: "orders@lunchbrother.com",
                        from_name: "LunchBrother",
                        to: [{
                            email: emailAddress,
                            name: lname + "," + fname
                        }],
                        inline_css: true,
                    },
                    success: function (httpResponse) { response.success("Email sent!"); },
                    error: function (httpResponse) { response.error("Uh oh, something went wrong"); }
                });
            },
            error: function (object, error) {
                // The object was not retrieved successfully.
                // error is a Parse.Error with an error code and message.
                console.log(error.message);
            }
        });
    });

Parse.Cloud.define("emailNotification",
    function (request, response) {
        var pickupAddress = request.params.pickupAddress;
        var orders = request.params.ordersToSend;

        if (pickupAddress == "Regents Drive Parking Garage") {
            var addressDetails = "Regents Drive Parking Garage, College Park, MD 20740";
            var addressNotes = "Meter space, Ground Floor, next to the elevator in the South-East corner.";
            var contactInfo = "Fish：7245108760";
        }
        if (pickupAddress == "McKeldin Library") {
            addressDetails = "Library Ln,College Park, MD 20740";
            addressNotes = "Meter space, next to the health center.";
            contactInfo = "Jabber：2028124286";
        }
        if (pickupAddress == "AV Williams Bldg") {
            addressDetails = "AV Williams Building, College Park, MD 20740, XX5 parking lot";
            addressNotes = "Side entrance of A.V.W. close to Kim BLD";
            contactInfo = "Rachel：3013124798";
        }

        for (var i = 0; i < orders.length; i++) {
            var emailInfo = orders[i].split(",");
            var fname = emailInfo[0];
            var lname = emailInfo[1];
            var email = emailInfo[2];

            sendEmail({
                message: {
                    html: '<p style="position: relative" align="middle"><b><big>' + fname + '</big></b> </p>' +
                        '<p style="position: relative" align="middle"><b><big>Thank you for ordering at <a href="http://www.lunchbrother.com" style="color: blue">lunchbrother.com</a>!</big></b></p>' +
                        '<p style="position: relative" align="middle"><b><big>Your lunch is ready for picking up!</big></b></p>' +
                        '<table style="position: relative" cellpadding="10" align="center">' +
                        '<tr>' +
                        '<th align="right " width="30%"> Pick-Up Address:</th>' +
                        '<td>' + addressDetails + '</td>' +
                        '</tr>' +
                        '<tr>' +
                        '<td>&nbsp;</td>' +
                        '<td>' + addressNotes + '</td>' +
                        '</tr>' +
                        '<tr>' +
                        '<th align="right">Contact Info</th>' +
                        '<td>' + contactInfo + '</td>' +
                        '</tr>' +
                        '</table>' +
                        '<p style="color: red; position: relative" align="middle">***no pick-up later than <a style="color: blue">13:10</a>, please manage well your pick-up time***</p>',
                    subject: "Notification: your lunch is ready to pick up",
                    from_email: "orders@lunchbrother.com",
                    from_name: "LunchBrother",
                    to: [{
                        email: email,
                        name: lname + "," + fname
                    }],
                    inline_css: true
                },
                success: function (httpResponse) { response.success("Email sent!"); },
                error: function (httpResponse) { response.error("Uh oh, something went wrong"); }
            });
        }
    });

Parse.Cloud.define("emailResetPasswordLink",
    function (request, response) {
        var fname = request.params.firstName;
        var email = request.params.emailAddress;
        var verificationLink = request.params.verificationLink;
        sendEmail({
            message: {
                html: '<p style="position: relative" align="middle"><b><big>' + fname + '</big></b> </p>' +
                    '<p style="position: relative" align="middle"><b><big>You have requested to reset your password, please click the following link and proceed to reset your password.</big></b></p>' +
                    '<p style="position: relative" align="middle"><b><big><a href="' + verificationLink + '" style="color: blue">' + verificationLink + '</a></big></b></p>',
                subject: "Reset your password for your LunchBrother account",
                from_email: "orders@lunchbrother.com",
                from_name: "LunchBrother",
                to: [{
                    email: email
                }],
                inline_css: true
            },
            success: function (httpResponse) { response.success("Verification link sent!"); },
            error: function (httpResponse) { response.error("Uh oh, something went wrong"); }
        });
    });

function sendEmail(options) {
    Parse.Cloud.httpRequest({
        method: 'POST',
        headers: {
            'Content-Type': 'application/json; charset=utf-8'
        },
        url: 'https://mandrillapp.com/api/1.0/messages/send.json',
        body: {
            key: "JRaXC3NG1BqZ_JWDnjX8gA",
            message: options.message
        },
        success: options.success,
        error: options.error
    });
}

Parse.Cloud.define("sms",
    function (request, response) {
        var targetNumber = request.params.targetNumber;
        var accountSID = request.params.accountSID;
        var authToken = request.params.authToken;
        var messageBody = request.params.messageBody;

        twilioSMSService(accountSID, authToken, '+1' + targetNumber, messageBody);
    }
);

function twilioSMSService(accountSID, authToken, targetNumber, messageBody) {
    // Require and initialize the Twilio module with your credentials
    var client = require('twilio')(accountSID, authToken);

    // Send an SMS message
    client.sendSms({
            to: targetNumber,
            from: '+18082022277',
            body: messageBody
        }, {
            success: function (httpResponse) {
                console.log("SMS sent!");
            },
            error: function (httpResponse) {
                console.log("Uh oh, something went wrong");
            }
        }
    );
}

Parse.Cloud.define("saveResetKeyForUser", function (request, response) {
    var email = request.params.emailAddress;
    var resetKey = request.params.resetKey;
    Parse.Cloud.useMasterKey();
    var query = new Parse.Query(Parse.User);
    query.equalTo("username", email);
    query.first({
        success: function (user) {
            if (user == null || user == undefined) {
                response.error("This email address is not in our system, please verify the email address and try again.");
            } else {
                user.set("resetKey", resetKey);
                user.save();
                response.success(user);
            }
        },
        error: function (error) {
            response.error(error.message);
        }
    });
});

Parse.Cloud.define("matchResetKey", function (request, response) {
    var resetLinkKey = request.params.resetKey;
    var userId = request.params.userId;
    getUser(userId).then(
        function (user) {
            var resetKey = user.get('resetKey');
            if (resetLinkKey == resetKey) {
                response.success(user);
            }
        },
        function (error) {
            response.error(error);
        }
    );
});

function getUser(userId){
    Parse.Cloud.useMasterKey();
    var userQuery = new Parse.Query(Parse.User);
    userQuery.equalTo("objectId",userId);
    return userQuery.first({
        success:function(userRetrieved){
            return userRetrieved;
        },
        error: function(error){
            return error;
        }
    });
};


Parse.Cloud.define("saveNewPassword", function (request, response) {
    var userId = request.params.userId;
    var password = request.params.password;
    Parse.Cloud.useMasterKey();
    var query = new Parse.Query(Parse.User);
    query.get(userId, {
        success: function (user) {
            user.set("password", password);
            user.set("resetKey", null);
            user.save();
            response.success();
        },
        error: function (error) {
            response.error(error.message);
        }
    });
});

function getSequence(callback) {
    var Test = Parse.Object.extend("Sequence");
    var query = new Parse.Query(Test);
    query.get("xIZdCZIeff", {
            success: function (object) {
                object.increment('sequence');
                object.save(null, {
                        success: function (object) {
                            callback(object.get('sequence'));
                        }
                        ,
                        error: function (object,
                                         error) {
                            callback(undefined);
                        }
                    }
                );
            }
            ,
            error: function (error) {
                console.log(error);
                callback(undefined);
            }
        }
    );
}
function getCurrentSequence(callback) {
    var Test = Parse.Object.extend("Sequence");
    var query = new Parse.Query(Test);
    query.get("lQyJu5P86j", {
            success: function (object) {
                callback(object.get('sequence'));
            }
            ,
            error: function (error) {
                callback(undefined);
            }
        }
    );
}
Parse.Cloud.beforeSave("Payment",
    function (request, response) {
        if (request.object.isNew()) {
            getSequence(function (sequence) {
                    if (sequence) {
                        request.object.set("orderId", sequence);
                        response.success();
                    }
                    else {
                        response.error('Could not get a sequence.');
                    }
                }
            );
        }
        else {
            response.success();
        }
    }
);

Parse.Cloud.beforeSave(Parse.User, function (request, response) {

    // If a new user is about to be created and it has a referredBy user, 
    // then increase the referredBy user's credit by 10
    if (request.object.isNew() && request.object.get('referredBy')) {
        Parse.Cloud.useMasterKey();
        var query = new Parse.Query(Parse.User);
        query.get(request.object.get('referredBy').id, {
            success: function (referredBy) {
                referredBy.set('creditBalance', referredBy.get('creditBalance') + 10);
                referredBy.save();
                response.success();
            },
            error: function (error) {
                response.error('Invitation link is not correct.');
            }
        });
    } else {
        response.success();
    }
});