import express from 'express';
import localtunnel from 'localtunnel';
import crypto from 'crypto';

// need to configure this parameters
const subdomain = 'my-subdomain-123234';
const secret = '3xocj9iiwBxDD0f0Qi85EJaTgCQ7LY';

const port = 8088;

const app = express();
app.use(express.json());
app.use(express.urlencoded({extended: true}));


app.get('/', (req, res) => {
    res.send('Hello World I am running locally');
});

app.all('/webhook', (req, res) => {

    if (req.method === 'POST') {
        const signature = req.headers?.['x-signature'] || '';

        const item = req.body;
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
            isValid: checkSignature(JSON.stringify(req.body), secret, signature),
        }

        console.info(JSON.stringify(data));
        res.send('Ok');
    } else {
        res.send('I am waiting for POST events... Please see them in the server console');
    }
});

function checkSignature(body, secret, signature) {
    const key = Buffer.from(secret, 'utf8');
    const hash = crypto.createHmac('sha256', key).update(body).digest('hex');

    try {
        return crypto.timingSafeEqual(Buffer.from(hash), Buffer.from(signature));
    } catch {
        return false;
    }
}

const server = app.listen(port, () => {});

const tunnel = localtunnel(
    port,
    { subdomain},
    (err, tunnel) => {
        console.log(`Use this URL for config webhook ${tunnel.url}/webhook`);
    });
