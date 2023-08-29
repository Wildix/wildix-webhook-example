# Wildix Webhook integration

Install dependencies
```bash
npm install
```

## Webhook transport

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

## AWS SQS transport

1 Open file `src/sqs.js`;

2 Set your `queueUrl` and your `AWS region & credentials`

3 Run AWS SQS queue pooling
```bash
npm run sqs:pool
```
Make calls and view logs in the server console
