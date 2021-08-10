


module.exports = class UploadFileCron {
    constructor(
        systemUtil,
        logger,
        queue,
        uploadFileService,
        throttler,
        projectDir
    ) {
        this.systemUtil = systemUtil;
        this.logger = logger;
        this.queue = queue;
        this.uploadFileService = uploadFileService;
        this.throttler = throttler;
        this.projectDir = projectDir;
    }

    async start() {
        const me = this;

        const hosts_keys = me.systemUtil.getConfig('skinrobots.hosts');
        const hosts_ips = Object.keys(hosts_keys);

        const today = new Date().toISOString().slice(0, 10);

        const headers = {};
        const queries = { 
            date: today, 
            period: hosts_keys.period ? hosts_keys.period : 3000, 
            limit: hosts_keys.limit ? hosts_keys.limit : 1000
        };

        const promises = [];
        
        hosts_ips.forEach(host => {
            const path = `${this.projectDir}/var/tickers/${host}_${today}_tickers.csv`;
            const url = `http://${host}/tickers/download`;            

            promises.push(me.uploadFileService.uploadOneFileFromServer({path, url, headers, queries}));
        });

        return me.executePromises(promises);
    }

    async executePromises(promises, retry = 0) {
        
        if (!promises) return;
        if (retry > this.systemUtil.getConfig('settings.retry_count', 3)) {
            this.logger.error(`Retry (${retry}) upload files are max values`);
            return;
        }

        if (retry > 0) {
            this.logger.info(`Retry: (${retry}) upload files`);
        }
        
        let result;

        try {
            result = await Promise.allSettled(promises);
        } catch(err) {
            this.logger.error(`Upload files from servers error promise.all: ${err}`);
        }

        const me = this;

        if (result && result.length) {
            let new_promises = [];

            result.forEach((p, index) => {
                if (p.status === 'rejected') {
                    new_promises.push(promises[index]);
                    
                    //Retry rejected promises
                    me.throttler.addTask('upload_file_cron_execute_promise', async () => {
                        await me.executePromises(new_promises, ++retry);
                    }, me.systemUtil.getConfig('settings.retry_ms', 1000));
                }
            });
        }
    }
};
