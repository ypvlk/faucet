const compression = require('compression');
const express = require('express');
const auth = require('basic-auth');
const crypto = require('crypto');
const cookieParser = require('cookie-parser');
const moment = require('moment');
const os = require('os');
const fs = require('fs');
// const multer = require('multer');
// const upload = multer({ dest: 'uploads/' });

module.exports = class Http {
    constructor(
        systemUtil,
        logger,
        requestClient,
        csvExportHttp,
        uploadFileService,
        insertFileService,
        projectDir
    ) {
        this.systemUtil = systemUtil;
        this.logger = logger;
        this.requestClient = requestClient;
        this.csvExportHttp = csvExportHttp;
        this.uploadFileService = uploadFileService;
        this.insertFileService = insertFileService;
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

        app.get('/check-servers', async (req, res) => {

            const hosts_keys = this.systemUtil.getConfig('skinrobots.hosts');
            const hosts_ips = Object.keys(hosts_keys);

            let promises = [];
            let result;

            const headers = {
                'Authorization': 'Basic ' + Buffer.from(username + ':' + password).toString('base64'),
            }

            hosts_ips.forEach(host => {
                const url = `http://${host}/servertime`;            
                promises.push(this.requestClient.executeGETRequest(url, {}, headers));
            });

            try {
                result = await Promise.allSettled(promises);
            } catch(e) {
                this.logger.error(`Check servers promise allsettled error: ${e}`);
                res.status(400).end(`Check servers promise allsettled error: ${e}`);
            }

            const respone = {};
            
            result.forEach((p, index) => {
                respone[hosts_ips[index]] = p.status === 'fulfilled' ? 'OK' : 'FAIL';
            });

            res.json(respone)
        });

        app.get('/tickers/upload', async (req, res) => {
            //localhost:3000/tickers/upload?date=2021-08-13&period=3000&limit=1000&host=167.172.44.124:3000
            const {
                date,
                period,
                limit,
                host
            } = req.query;

            if (!date || !period || !limit || !host) res.status(400).end('Error: date, period, limit and host query params are allowed');

            const path = `${this.projectDir}/var/tickers/${host}_${date}_tickers.csv`;

            const url = `http://${host}/tickers/download`;
            const queries = { date: date, period: period, limit: limit };
            const headers = {};

            try {
                await this.uploadFileService.uploadOneFileFromServer({url, path, headers, queries});
            } catch(err) {
                return res.json({ success: true, message: `File uploaded error: ${err}` })
            }

            res.json({ success: true, message: 'File uploaded successful' });
        });

        app.get('/tickers/insert', async (req, res) => {
            //localhost:3000/tickers/insert?pack_count=500&filename=167.172.44.124:3000_2021-08-13_tickers.csv
            const {
                filename,
                pack_count //TODO delete this parametr and input it into conf.json
            } = req.query;

            if (!filename || !pack_count) res.status(400).end('Error: filename and pack_count query params are allowed');

            const path = `${this.projectDir}/var/tickers/${filename}`;
        
            try {
                await this.insertFileService.insertOneFile({path, pack_count});
            } catch(err) {
                return res.json({ success: true, message: `File insert fail: ${err}` });
            }

            res.json({ success: true, message: 'File insered successful' });
        });

        app.get('/mean_reversion/download', async (req, res) => {
            //localhost:3000/mean_reversion/download?lead=binance_futures.BTCBUSD&driven=binance_futures.ETHBUSD
            const {
                lead,
                driven,
                limit
            } = req.query;

            let result = [];

            if (!lead || !driven) res.status(400).end('Error: lead and driven query params are allowed');

            const split_lead = lead.split('.');
            const leadExchange = split_lead[0];
            const leadSymbol = split_lead[1];

            const split_driven = driven.split('.');
            const drivenExchange = split_driven[0];
            const drivenSymbol = split_driven[1];

            result = await this.csvExportHttp.downloadMeanReversionTable(leadExchange, leadSymbol, drivenExchange, drivenSymbol, limit);
            
            res.setHeader("Content-Type", "text/csv");
            res.setHeader("Content-Disposition", `attachment; filename=${leadSymbol.toLowerCase()}_${drivenSymbol.toLowerCase()}_meanreversion_.csv`);

            res.status(200).end(result);
        });

        app.get('/backtesting/download', async (req, res) => {
            //localhost:3000/backtesting/download?filename=BTCBUSD_ETHBUSD_2021-08-18.csv
            const {
                filename,
            } = req.query;

            if (!filename) res.status(400).end('Error: filename query params is allowed');

            const file = `${this.projectDir}/var/backtesting/${filename}`;

            res.download(file, filename, function (err) {
                if (err) res.status(400).end(`Error: ${String(err)}`);
            })
        });
        
        const ip = this.systemUtil.getConfig('webserver.ip', '0.0.0.0');
        const port = this.systemUtil.getConfig('webserver.port', 3000);

        app.listen(port, ip);

        this.logger.info(`Webserver listening on: ${ip}:${port}`);
        console.log(`Webserver listening on: ${ip}:${port}`);
    }
}