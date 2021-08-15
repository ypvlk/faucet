const fs = require('fs');

module.exports = class InsertFileCron {
    constructor(
        systemUtil,
        logger,
        queue,
        insertFileService,
        throttler,
        projectDir
    ) {
        this.systemUtil = systemUtil;
        this.logger = logger;
        this.queue = queue;
        this.insertFileService = insertFileService;
        this.throttler = throttler;
        this.projectDir = projectDir;
    }

    async start() {
        const me = this;

        const folder = `${this.projectDir}/var/tickers/`;

        fs.readdirSync(folder).forEach(file => {
            const check_file = file.slice(file.length - 4);
            
            if (check_file === '.csv') {
                const key = 'insert_file_cron' + '_' + file;
                const options = {
                    path: folder + file,
                    pack_count: 500
                };

                //Check queue taska
                const queue_tasks = me.queue.getQueueTasks();
                if (key in queue_tasks) return;

                me.logger.debug(`Insert file cron start`);
                
                const promise = () => new Promise(async (resolve, reject) => {
                    try {
                        await me.insertFileService.insertOneFile(options);
                        resolve(key);
                    } catch(err) {
                        me.logger.error(`Insert one file service error: ${String(err)}`);
                        reject(key);
                    }
                })
    
                me.queue.addQueue(key, promise);
            }
        });
    }
};
