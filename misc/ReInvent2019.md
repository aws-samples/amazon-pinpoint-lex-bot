## Amazon Pinpoint-Lex Bot: ReInvent 2019
Materials for the 2019 re:Invent Pinpoint Builder Session - Build and Deploy Your Own 2 Way Text Chatbot for re:Invent 2019.
Use https://github.com/Mottie/GitHub-userscripts/wiki/GitHub-copy-code-snippet to quickly copy the code.

## License Summary
This sample code and flow is made available under Open Source - MIT No Attribution License (MIT-0). See the [LICENSE](../LICENSE) file.

### Setup
> Quick setup below, but you should follow the [expanded version](https://aws.amazon.com/blogs/messaging-and-targeting/create-an-sms-chatbox-with-amazon-pinpoint-and-lex/). 
#### Step 3: Permissions/IAM
```JSON
      {
        "document": {
          "Version": "2012-10-17",
          "Statement": [
            {
              "Sid": "Logs",
              "Effect": "Allow",
              "Action": [
                "logs:CreateLogStream",
                "logs:CreateLogGroup",
                "logs:PutLogEvents"
              ],
              "Resource": [
                "arn:aws:logs:*:*:*"
              ]
            },
            {
              "Sid": "Pinpoint",
              "Effect": "Allow",
              "Action": [
                "mobiletargeting:SendMessages"
              ],
              "Resource": [
                "arn:aws:mobiletargeting:YOURREGION:YOURACCOUNTID:apps/YOURPROJECTORAPPID/endpoints/*"
              ]
            },
            {
              "Sid": "Lex",
              "Effect": "Allow",
              "Action": [
                "lex:PostContent",
                "lex:PostText"
              ],
              "Resource": [
                "arn:aws:lex:YOURREGION:YOURACCOUNTID:bot/YOURBOTNAME"
              ]
            }
          ]
        },
        "name": "PinpointLexFunctionRole",
        "type": "managed"
      }
```
#### Step 4: Lambda
```javascript
const AWS = require('aws-sdk');
AWS.config.update({
    region: process.env.Region
});
const pinpoint = new AWS.Pinpoint();
const lex = new AWS.LexRuntime();

var AppId = process.env.PinpointApplicationId;
var BotName = process.env.BotName;
var BotAlias = process.env.BotAlias;

exports.handler = (event, context)  => {
    /*
    * Event info is sent via the SNS subscription: https://console.aws.amazon.com/sns/home
    * 
    * - PinpointApplicationId is your Pinpoint Project ID.
    * - BotName is your Lex Bot name.
    * - BotAlias is your Lex Bot alias (aka Lex function/flow).
    */
    console.log('Received event: ' + event.Records[0].Sns.Message);
    var message = JSON.parse(event.Records[0].Sns.Message);
    var customerPhoneNumber = message.originationNumber;
    var chatbotPhoneNumber = message.destinationNumber;
    var response = message.messageBody.toLowerCase();
    var userId = customerPhoneNumber.replace("+1", "");

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
            sendResponse(customerPhoneNumber, chatbotPhoneNumber, response.response.data.message);
        }
        else {
            console.log("Lex did not send a message back!");
        }
    });
}

function sendResponse(custPhone, botPhone, response) {
    var paramsSMS = {
        ApplicationId: AppId,
        MessageRequest: {
            Addresses: {
                [custPhone]: {
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
        else if (data['MessageResponse']['Result'][custPhone]['DeliveryStatus'] != "SUCCESSFUL") {
            console.log("Failed to send SMS response:");
            console.log(data['MessageResponse']['Result']);
        }
        else {
            console.log("Successfully sent response via SMS from " + botPhone + " to " + custPhone);
        }
    });
}
```
Remember to set:

| Key  | Value |
| ------------- | ------------- |
| PinpointApplicationId  | The name of the Pinpoint project that you created earlier.  |
| BotName  | The name of the Lex bot that you created earlier.  |
| BotAlias  | Latest |
| Region  | The AWS Region that you created the Amazon Pinpoint project and Lex bot in.  |
