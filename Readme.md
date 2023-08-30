# Wildix Webhook integration

> This demo for webhook integration with Wildix infrastructure.
> For setup integration please read [this page](https://wildix.atlassian.net/wiki/x/AYCODg)

Install dependencies
```bash
npm install
```

### Webhook transport

In this demo, we use the `localtunnel` library to create a public URL for your local server.
You can use another library if needed (ngrok, etc).


1 Open `src/server.js` and set your unique subdomain name (random string)

2 Run webhook server
```bash
npm run webhook:serve
```
3 Copy & open link from console in the browser

4 Confirm your public IP: Paste your public IP to the form

5 Go to PBX and install Webhook integration with URL from step 3

6 Copy integration secret and put to the `src/server.js`

```
const secret = 'pasteCopiedSecretHere';
```
7 Restart server with correct secret (step 2)

8 Make calls and view logs in the server console

### AWS SQS transport

1 Open file `src/sqs.js`;

2 Set your `queueUrl` and your `AWS region & credentials`

3 Run AWS SQS queue pooling
```bash
npm run sqs:pool
```
Make calls and view logs in the server console

## Supported event types

### Call start (call:start)

```json
{
  "id": "it_w118741_1693389850.110",
  "pbx": "221100001bab",
  "time": 1693389850810,
  "company": "it_w118741",
  "type": "call:start",
  "integrationId": "8qkmnq",
  "data": {
    "status": "CONNECTING",
    "caller": {
      "type": "LOCAL",
      "phone": "1001",
      "name": "admin",
      "company": null,
      "email": "vladimir.gorobets@wildix.com",
      "userId": "1257510555",
      "userExtension": "1001",
      "userDepartment": null,
      "groupId": "62177694",
      "groupName": "Admin",
      "userAgent": "Wildix Zero Distance 4.0.1 WebRTC-f2a0f5f1-6c4e-444f-b99f-a968bb5f7297",
      "userDevice": "COLLABORATION_WEB"
    },
    "callee": null,
    "service": null,
    "destination": "10020",
    "trunkName": null,
    "queueName": null,
    "queueId": null,
    "tags": [],
    "flags": [],
    "endCause": null,
    "endCauseStr": null,
    "endBy": null
  }
}
```

### Call update (call:update)

```json
{
  "id": "it_w118741_1693389850.110",
  "pbx": "221100001bab",
  "time": 1693389850810,
  "company": "it_w118741",
  "type": "call:update",
  "integrationId": "8qkmnq",
  "data": {
    "status": "CONNECTING",
    "caller": {
      "type": "LOCAL",
      "phone": "1001",
      "name": "admin",
      "company": null,
      "email": "vladimir.gorobets@wildix.com",
      "userId": "1257510555",
      "userExtension": "1001",
      "userDepartment": null,
      "groupId": "62177694",
      "groupName": "Admin",
      "userAgent": "Wildix Zero Distance 4.0.1 WebRTC-f2a0f5f1-6c4e-444f-b99f-a968bb5f7297",
      "userDevice": "COLLABORATION_WEB"
    },
    "callee": {
      "type": "LOCAL",
      "phone": "10020",
      "name": "user20",
      "company": null,
      "email": "vladimir.gorobets+3@wildix.com",
      "userId": "5753746",
      "userExtension": "10020",
      "userDepartment": null,
      "groupId": "874629312",
      "groupName": "Default",
      "userAgent": null,
      "userDevice": null
    },
    "service": null,
    "destination": "10020",
    "trunkName": null,
    "queueName": null,
    "queueId": null,
    "tags": [],
    "flags": [],
    "endCause": null,
    "endCauseStr": null,
    "endBy": null
  }
}
```

### Call end (call:end)

```json
{
  "id": "it_w118741_1693389850.110",
  "pbx": "221100001bab",
  "time": 1693389853611,
  "company": "it_w118741",
  "type": "call:end",
  "integrationId": "8qkmnq",
  "data": {
    "status": "CONNECTING",
    "caller": {
      "type": "LOCAL",
      "phone": "1001",
      "name": "admin",
      "company": null,
      "email": "vladimir.gorobets@wildix.com",
      "userId": "1257510555",
      "userExtension": "1001",
      "userDepartment": null,
      "groupId": "62177694",
      "groupName": "Admin",
      "userAgent": "Wildix Zero Distance 4.0.1 WebRTC-f2a0f5f1-6c4e-444f-b99f-a968bb5f7297",
      "userDevice": "COLLABORATION_WEB"
    },
    "callee": {
      "type": "LOCAL",
      "phone": "10020",
      "name": "user20",
      "company": null,
      "email": "vladimir.gorobets+3@wildix.com",
      "userId": "5753746",
      "userExtension": "10020",
      "userDepartment": null,
      "groupId": "874629312",
      "groupName": "Default",
      "userAgent": null,
      "userDevice": null
    },
    "service": null,
    "destination": "10020",
    "trunkName": null,
    "queueName": null,
    "queueId": null,
    "tags": [],
    "flags": [],
    "endCause": "21",
    "endCauseStr": "Call Rejected",
    "endBy": "CALLER"
  }
}
```

## Security

> Important: For all received events need to check `signature`

- For `webhook transport` need to read request's header `x-signature`
- For `SQS transport` need to read `MessageAttributes.['X-SIGNATURE']`

Example check signature for Node Js

```js
import crypto from 'crypto';

const checkSignature = function (body, secret, signature) {
    const key = Buffer.from(secret, 'utf8');
    const hash = crypto.createHmac('sha256', key).update(body).digest('hex');

    try {
        return crypto.timingSafeEqual(Buffer.from(hash), Buffer.from(signature));
    } catch {
        return false;
    }
}

// stringBody - raw message body as string
// secret - secret from webhook configuration
// signature - received message signature

if (!checkSignature(stringBody, secret, signature)) {
    // skip incorrect message
    return;
}
// process message
```
