/*
 * Copyright 2019 Amazon.com, Inc. or its affiliates. All Rights Reserved.
 *
 * Permission is hereby granted, free of charge, to any person obtaining a copy of this
 * software and associated documentation files (the "Software"), to deal in the Software
 * without restriction, including without limitation the rights to use, copy, modify,
 * merge, publish, distribute, sublicense, and/or sell copies of the Software, and to
 * permit persons to whom the Software is furnished to do so.
 *
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED,
 * INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A
 * PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT
 * HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION
 * OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE
 * SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
 */
const AWS = require('aws-sdk');
AWS.config.update({
    region: process.env.region
});
const pinpoint = new AWS.Pinpoint();
const lex = new AWS.LexRuntime();

var AppId = process.env.PinpointApplicationId;
var BotName = process.env.BotName;
var BotAlias = process.env.BotAlias;
var BotNumber = process.env.BotNumber;

// eslint-disable-next-line no-unused-vars
exports.handler = (event, context)  => {
    /*
    * Event info is sent via the SNS subscription: https://console.aws.amazon.com/sns/home
    * 
    * - PinpointApplicationId is your Pinpoint Project ID.
    * - BotName is your Lex Bot name.
    * - BotAlias is your Lex Bot alias (aka Lex function/flow).
    * - BotNumber is your Pinpoint number Lex Bot should use (if you have more than one). 
    *       Alternatively, consider checking which number customer sent the request on.
    */
    console.log('Received event: ' + event.Records[0].Sns.Message);
    var message = JSON.parse(event.Records[0].Sns.Message);
    var originationNumber = message.originationNumber;
    var response = message.messageBody.toLowerCase();
    var userId = originationNumber.replace("+1", "");

    var params = {
        botName: BotName,
        botAlias: BotAlias,
        inputText: response,
        userId: userId
    };
    response = lex.postText(params, function (err, data) {
        if (err) {
            console.log(err, err.stack);
            //return null;
        }
        else if (data != null && data.message != null) {
            console.log("Lex response: " + data.message);
            sendResponse(originationNumber, BotNumber, response.response.data.message);
        }
        else {
            console.log("Lex did not send a message back!");
        }
    });
}

function sendResponse(phone, botPhone, response) {
    var paramsSMS = {
        ApplicationId: AppId,
        MessageRequest: {
            Addresses: {
                [phone]: {
                    ChannelType: 'SMS'
                }
            },
            MessageConfiguration: {
                SMSMessage: {
                    Body: response,
                    MessageType: "TRANSACTIONAL",
                    OriginationNumber: botPhone
                }
            }
        }
    };
    pinpoint.sendMessages(paramsSMS, function (err, data) {
        if (err) {
            console.log("An error occurred.\n");
            console.log(err, err.stack);
        }
        else if (data['MessageResponse']['Result'][phone]['DeliveryStatus'] != "SUCCESSFUL") {
            console.log("Failed to send SMS response:");
            console.log(data['MessageResponse']['Result']);
        }
        else {
            console.log("Successfully sent response via SMS from " + botPhone + " to " + phone);
        }
    });
}