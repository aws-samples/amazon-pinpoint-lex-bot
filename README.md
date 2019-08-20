## Amazon Pinpoint-Lex Bot
Use Amazon Web Services (AWS) Pinpoint, Lambda, and Lex to let your customers interact with (Lex) chat-bots via 2-way SMS.

## License Summary
This sample code and flow is made available under Open Source - MIT No Attribution License (MIT-0). See the [LICENSE](/LICENSE) file.

### Architecture
Upon an SMS request from the user, AWS Pinpoint publishes to AWS SNS queue. A custom AWS Lambda function detects a new event and redirects information, specifically the originating phone number and message, to Lex. Lex uses the phone number to keep context of the conversation, sends response back, and Lambda sends that response over to the customer. Once first loop completes, the customer can continue this back-and-forth, just like they would with the chat-bot in Alexa or on a website.

Major benefits:
1. Customer can use standard SMS
2. No need for any other means of communication or installation of proprietary apps 
3. No need for a dedicated/separate chatbot
4. Standard Lex settings and capabilities are supported
5. Standard Lex security can be easily enabled for further security
6. Customer phone number context is standard, remains linked to the phone number, allowing for pause-resume/reuse off another application (eg. website, app, etc.)
7. Lex conversations can be easily stored and reused to enrich customer view

![Architecture Diagram](misc/architecture.png?raw=true)

### Prerequisites
This flow requires that you have an AWS Account with AWS Pinpoint project and access to Lex. 
No extra configuration is required - you can start right out of the gate.

### Repository content
Main files:
```bash
.
├── README.MD                   <-- This instructions file
├── ExecutionRole.json          <-- Sample IAM policy (also part of the SAM template). Make sure to edit manually first!
├── src                         <-- Source code for a lambda function
│   └── app.js                  <-- Lambda function code
│   └── Sample-AccountBot.json  <-- Sample Lex bot you can reuse for testing your flow for the fist time. Feel free to create your own instead! 
│   └── package.json            <-- NodeJS dependencies and scripts
│   └── tests                   <-- Unit tests
│       └── unit
│           └── eventData.json  <-- Sample payload that mimics the SMS received from customer (from Pinpoint via SNS). Make sure to edit manually first!
├── template.yaml               <-- SAM template. Make sure to edit manually first!
```

### Setup
#### Step 1: Pinpoint
Create the new Pinpoint project or identify one you want to reuse along with the long-code. 
Setup two-way SMS. Take note of the SNS topic (new or existing). 
Since this number will be used for outgoing notifications (eg. not limited to customer originating requests only), make sure you handle unsubscribe (aka STOP) requests.
Optionally add a temporary email subscription to the SNS topic to passively and proactively monitor it during debugging.
Send SMS through and confirm SNS event occurs.
#### Step 2: Lex
Create the new Lex bot or identify the one you want to reuse. 
There are no special considerations in our implementation, even one intent should be sufficient. Feel free to use one of the Demo Lex bots as a starting point, if you don't have one already.
As with any bot, try to keep messages on the shorter side and avoid special characters.
#### Step 3: Permissions/IAM
Add new Lambda execution role with limited permissions to Pinpoint (to respond to the customer), Lex (to actually communicate with the bot), and CloudWatch Logs (for basic logging and debugging). 
Feel free to either reuse ExecutionRole.json provided, copy YAML portion from template.yaml if you prefer, or use Managed policies to build out the role.
Remember that AWS Policies are always designed to only allow what is absolutely necessary. As you expand your application, you may need to add new (or remove) resources and functions you intend to call. You may also want to add X-Ray permissions down the line for full tracing support.
#### Step 4: Lambda
Add the new Lambda function (either upload the included Lambda directly or copy-paste).
Set Environment variables - these are dynamic configuration parameters that you will be able to switch/change in production.
Associate Lambda with SNS. 
Save.
Configure a new Lambda Test event - use included eventData.json for the sample payload, but remember to change the phone number.
#### Step 5: Run and Confirm
Run test and confirm Lambda gets a good response from Lex. 
Send an SMS to your Pinpoint # and verify that your event goes through SNS and you receive the bot response via SMS. Feel free to engage the bot and try out various scenarios.