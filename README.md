## Amazon Pinpoint-Lex Bot
Use Amazon Web Services (AWS) Pinpoint, Lambda, and Lex to let your customers interact with (Lex) chat-bots via 2-way SMS.

With this approach you will be able to create an SMS-based chatbot using Amazon Lex and Amazon Pinpoint. Such a chatbot can help your customers schedule appointments, lookup latest account information, or most common solutions to their troubles. Note that we will be using a generic Lex bot, which means you can reuse the same bot for your other services as well, be it Web or, for example, Amazon Connect/IVR.

Major benefits:
1. Customer can use standard SMS
2. No need for any other means of communication or installation of proprietary apps 
3. No need for a dedicated/separate chatbot
4. Standard Lex settings and capabilities are supported
5. Standard Lex security can be easily enabled for further security
6. Customer phone number context is standard, remains linked to the phone number, allowing for pause-resume/reuse off another application (eg. website, app, etc.)
7. Lex conversations can be easily stored and reused to enrich customer view

## License Summary
This sample code and flow is made available under Open Source - MIT No Attribution License (MIT-0). See the [LICENSE](/LICENSE) file.

### Architecture
Upon an SMS request from the user, AWS Pinpoint publishes to AWS SNS queue. A custom AWS Lambda function detects a new event and redirects information, specifically the originating phone number and message, to Lex. Lex uses the phone number to keep context of the conversation, sends response back, and Lambda sends that response over to the customer. Once first loop completes, the customer can continue this back-and-forth, just like they would with the chat-bot in Alexa or on a website.

![Architecture Diagram](misc/architecture.png?raw=true)

### Prerequisites
This flow requires that you have an AWS Account with AWS Pinpoint project and access to Lex.   
No extra configuration is required - you can start right out of the gate.

### Repository content
Main files:
```bash
.
├── README.MD                   <-- This instructions file
├── template.yaml               <-- SAM template. Make sure to edit manually first!
├── ExecutionRole.json          <-- Sample IAM policy (also part of the SAM template). Make sure to edit manually first!
├── src                         <-- Actual source code
│   └── app.js                  <-- Lambda function code
│   └── Sample-AccountBot.json  <-- Sample Lex bot you can reuse for testing your flow for the fist time.
│   └── package.json            <-- NodeJS dependencies and scripts
│   └── tests                   <-- Unit tests
│       └── unit
│           └── eventData.json  <-- Sample payload that mimics the SMS received from customer (from Pinpoint via SNS). Make sure to edit manually first!
```

### Setup
> Below is a high-level how-to, but you should feel free to follow the more expanded version of the walk-through with screenshots @ https://aws.amazon.com/blogs/messaging-and-targeting/create-an-sms-chatbox-with-amazon-pinpoint-and-lex/ 
#### Step 1: Pinpoint
1. Create the new Pinpoint project and request a new long-code (the phone number through which all of the interactions will take place). See [steps 1.1 and 1.2 of this tutorial](https://docs.aws.amazon.com/pinpoint/latest/developerguide/tutorials-two-way-sms-part-1.html). Alternatively, you can simply reuse an existing project and phone number (aka long- or short-code).  
2. Enable two-way SMS by clicking on the long-code of choice under the "SMS and voice" Settings and enabling the 2-way with the SNS topic defined. See [step 1.3 of the same tutorial](https://docs.aws.amazon.com/pinpoint/latest/developerguide/tutorials-two-way-sms-part-1.html). Take note of this SNS topic (new or existing).    
If this number will be used for outgoing notifications, make sure you handle unsubscribe (aka STOP) requests before going to production.  
3. Optionally add a temporary email subscription to the SNS topic to passively and proactively monitor it during debugging.  
4. Send SMS through and confirm SNS event occurs.
#### Step 2: Lex
1. Create the new Lex bot or identify the one you want to reuse.  
There are no special considerations in our implementation, even one intent should be sufficient. Feel free to use one of the Demo Lex bots as a starting point, if you don't have one already.  
As with any bot, try to keep messages on the shorter side and avoid special characters.
#### Step 3: Permissions/IAM
1. Add new Lambda execution role with limited permissions to Pinpoint (to respond to the customer), Lex (to actually communicate with the bot), and CloudWatch Logs (for basic logging and debugging).   
Feel free to either reuse ExecutionRole.json provided, copy YAML portion from template.yaml if you prefer, or use Managed policies to build out the role.  
Remember that AWS Policies are always designed to only allow what is absolutely necessary. As you expand your application, you may need to add new (or remove) resources and functions you intend to call. You may also want to add X-Ray permissions down the line for full tracing support.
#### Step 4: Lambda
1. Add the new Lambda function (either upload the included Lambda directly or copy-paste).  
2. Set Environment variables - these are dynamic configuration parameters that you will be able to switch/change in production.  
* PinpointApplicationId 	The ID of the Pinpoint project that you created earlier.  
* BotName 	The name of the Lex bot that you created earlier.  
* BotNumber The Pinpoint number Lex Bot should use (if you have more than one). Alternatively, consider checking which number customer sent the request to first.
* BotAlias 	Latest (or whichever alias you gave the bot)
* Region 	The AWS Region that you created the Amazon Pinpoint project and Lex bot in.  
3. Associate Lambda with SNS.   
4. Save.  
5. Configure a new Lambda Test event - use included eventData.json for the sample payload, but remember to change the phone number.
#### Step 5: Run and Confirm
1. Run test and confirm your event produces the SMS back to the number you specified or check console for errors.  
2. Send a manual SMS to your Pinpoint number and confirm your event goes through SNS and you receive the bot response via SMS. 
3. Feel free to engage the bot and try out various scenarios.