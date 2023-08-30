import {Consumer} from 'sqs-consumer';
import {SQSClient} from '@aws-sdk/client-sqs';
import crypto from 'crypto';
import {config} from 'dotenv';

config();

console.log(process.env);

const queueUrl = process.env.SQS_URL || 'https://sqs.us-east-2.amazonaws.com/367378456882/webhook-demo';

const awsCredentials = {
    region: process.env.AWS_DEFAULT_REGION || 'us-east-1',
    credentials: {
        accessKeyId: process.env.AWS_ACCESS_KEY_ID || 'yourAwsKeyId',
        secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY || 'yourAwsSecret'
    }
}

const getSqsConsumer = function (queueUrl, sqsConfig, handleMessageBatch) {
    const sqsConsumer = Consumer.create({
        queueUrl,
        handleMessageBatch,
        sqs: new SQSClient(sqsConfig),
        attributeNames: ['SentTimestamp'],
        messageAttributeNames: ['All'],
        batchSize: 10,
        waitTimeSeconds: 20,
    });

    sqsConsumer.on('started', () => {
        console.info('polling started');
    });

    sqsConsumer.on('error', (err) => {
        console.error(err.message);
    });

    sqsConsumer.on('timeout_error', (err) => {
        console.error(err.message);
    });

    return sqsConsumer;
}

async function batchMessageHandler(messages) {
    // console.log(messages);
    if (messages && messages.length) {
        for (const message of messages) {
            await processMessage(message);
        }
    }
}

async function processMessage(message) {
    // console.log(message);
    const {Body, MessageAttributes} = message;
    try {
        const signature = MessageAttributes?.['X-SIGNATURE']?.StringValue || '';
        const item = JSON.parse(Body);

        const data = {
            time: item?.time || 0,
            id: item?.id || '',
            type: item?.type || '',
            companyId: item?.company || '',
            pbx: item?.pbx || '',
            integrationId: item?.integrationId || '',
            callee: item?.data?.callee?.phone || '',
            caller: item?.data?.caller?.phone || '',
            signature,
            isValid: checkSignature(Body, awsCredentials.credentials.secretAccessKey, signature),
        }
        console.info(JSON.stringify(data));
    } catch (e) {
        console.error(e.message);
    }
}

const checkSignature = function (body, secret, signature) {
    const key = Buffer.from(secret, 'utf8');
    const hash = crypto.createHmac('sha256', key).update(body).digest('hex');

    try {
        return crypto.timingSafeEqual(Buffer.from(hash), Buffer.from(signature));
    } catch {
        return false;
    }
}

const sqsConsumer = getSqsConsumer(queueUrl, awsCredentials, batchMessageHandler);
sqsConsumer.start();
