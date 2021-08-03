const compression = require('compression');
const express = require('express');
const auth = require('basic-auth');
const crypto = require('crypto');
const cookieParser = require('cookie-parser');
const moment = require('moment');
const os = require('os');
const fs = require('fs');

module.exports = class Http {
    constructor(
        systemUtil,
        logger,
        projectDir
    ) {
        this.systemUtil = systemUtil;
        this.logger = logger;
        this.projectDir = projectDir;
    }

    start() {
        const app = express();

        app.use(express.urlencoded({ limit: '12mb', extended: true, parameterLimit: 50000 }));
        app.use(cookieParser());
        app.use(compression());
        app.use(express.static(`${this.projectDir}/web/static`, { maxAge: 3600000 * 24 }));

        const username = this.systemUtil.getConfig('webserver.username');
        const password = this.systemUtil.getConfig('webserver.password');
        
        if (username && password) {
            app.use((request, response, next) => {
                const user = auth(request);
                
                if (!user || !(user.name === username && user.pass === password)) {
                    response.set('WWW-Authenticate', 'Basic realm="Please Login"');
                    return response.status(401).send();
                }

                return next();
            });
        }

        app.get('/', async (req, res) => {
            res.json({ success: true, message: '(>___<)' })
        });

        app.get('/logs/download', async (req, res) => {
            //localhost:3000/logs/download?type=general //type=pm2-error
            const {
                type,
            } = req.query;

            let file = '';
            let filename = '';

            const types = {
                general: 'general',
                pm2error: 'pm2error',
                pm2out: 'pm2out'
            }

            const today = new Date().toISOString().slice(0, 10)

            if (!type) res.status(400).end('Error: type query params is allowed');

            if (type === types.general) {
                file = `${this.projectDir}/logs/log.log`;
                filename = `${type}_${today}.log`;
            }

            if (type === types.pm2error) {
                file = `${os.homedir()}/.pm2/logs/skinrobot-worker-error.log`;
                filename = `${type}_${today}.log`;
            }

            if (type === types.pm2out) {
                file = `${os.homedir()}/.pm2/logs/skinrobot-worker-out.log`;
                filename = `${type}_${today}.log`;
            }

            res.download(file, filename, function (err) {
                if (err) res.status(400).end(`Error: ${String(err)}`);
            })
        });

        app.get('/servertime', async (req, res) => {

            const server_date = new Date();
            const server_date_in_unix = new Date() / 1;
            const server_date_now_in_utc = Date.now();
            const today = new Date().toISOString().slice(0, 10)

            res.json({ 
                success: true, 
                server_date: `new Date(): ${server_date}`, 
                server_date_in_unix: `new Date() / 1: ${server_date_in_unix}`,
                server_date_now_in_utc: `Date.now(): ${server_date_now_in_utc}`,
                today: `new Date().toISOString().slice(0, 10): ${today}`
            })
        });

        app.post('/tickers/upload', async (req, res) => {
            // const file = req.file;
            // console.log('file', file);
            // const buffer = file.buffer;
            // console.log('buffer', buffer);

            
        });
        
        const ip = this.systemUtil.getConfig('webserver.ip', '0.0.0.0');
        const port = this.systemUtil.getConfig('webserver.port', 3000);

        app.listen(port, ip);

        this.logger.info(`Webserver listening on: ${ip}:${port}`);
        console.log(`Webserver listening on: ${ip}:${port}`);
    }
}