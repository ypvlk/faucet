const moment = require('moment');

module.exports = class LogsRepository {
    constructor(
        mysqlDB,
        logger
    ) {
        this.mysqlDB = mysqlDB;
        this.logger = logger;

        this.table = 'logs'
    }

    cleanOldLogEntries(days = 7) {
        return new Promise(resolve => {
            const created_at = moment().subtract(days, 'days').unix();

            this.mysqlDB(this.table)
                .timeout(3000, {cancel: true})
                .where(`${this.table}.created_at`, '<', created_at)
                .del()
                .then(result => { 
                    resolve();
                })
                .catch(err => { 
                    this.logger.error(`Mysql error in table ${this.table}: ${err}`);
                    resolve();
                })
        });
    }

    getLatestLogs(excludes = ['debug'], limit = 400) {
        return new Promise(resolve => {
            const parameters = {};

            if (excludes.length > 0) {
                this.mysqlDB(this.table)
                    .timeout(3000, {cancel: true})
                    .select('*')
                    .whereNotIn(`${this.table}.level`, excludes)
                    .limit(limit)
                    .orderBy(`${this.table}.created_at`, 'desc')
                    .then(result => { 
                        if (result && result.length) resolve(result);
                        resolve([]);
                    })
                    .catch(err => { 
                        this.logger.error(`Mysql error in table ${this.table}: ${err}`);
                        resolve([]);
                    })
            } else {
                this.mysqlDB(this.table)
                    .timeout(3000, {cancel: true})
                    .select('*')
                    .limit(limit)
                    .orderBy(`${this.table}.created_at`, 'desc')
                    .then(result => { 
                        if (result && result.length) resolve(result);
                        resolve([]);
                    })
                    .catch(err => { 
                        this.logger(`Mysql get logs levels error: ${err}`);
                        resolve([]);
                    })
            }
        });
    }

    getLevels() {
        return new Promise(resolve => {
            this.mysqlDB(this.table)
                .timeout(3000, {cancel: true})
                .select(`${this.table}.level`)
                .groupBy('level')
                .then(result => { 
                    if (result && result.length) resolve(result.map(r => r.level));
                    resolve([]);
                })
                .catch(err => { 
                    this.logger.error(`Mysql error in table ${this.table}: ${err}`);
                    resolve([]);
                })
        });
    }
};
