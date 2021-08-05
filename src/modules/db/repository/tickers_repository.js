const moment = require('moment');

module.exports = class TickersRepository {
    constructor(
        mysqlDB,
        logger
    ) {
        this.mysqlDB = mysqlDB;
        this.logger = logger;

        this.table = 'tickers'
    }

    insert(tickers, period = 500) { //tickers: ArrayOfObject
        return new Promise(resolve => {
            
            const parameters = tickers.map(ticker => ({
                exchange: ticker.exchange,
                symbol: ticker.symbol,
                bidPrice: ticker.bidPrice,
                bidSize: ticker.bidSize,
                askPrice: ticker.askPrice,
                askSize: ticker.askSize,
                period: ticker.period ? ticker.period : period,
                close: ticker.close,
                income_at: ticker.income_at ? ticker.income_at : new Date().getTime() //ticker.createdAt.getTime()
            }));

            this.mysqlDB(this.table)
                .timeout(3000, {cancel: true})
                .insert(parameters)
                .then(data => { 
                    resolve(); 
                })
                .catch(err => { 
                    this.logger.error(`Mysql error in table ${this.table}: ${err}`);
                })
        });
    }

    getMultipleTickers(pairs, period, startTime, endTime, limit = 1000) {
        return new Promise(resolve => {
            const parameters = pairs.map(Object.values);

            console.log('param', parameters);

            this.mysqlDB
                .timeout(3000, {cancel: true})
                .from(this.table)
                .select('*')
                .whereIn([`${this.table}.exchange`, `${this.table}.symbol`], parameters)
                .andWhere(`${this.table}.period`, period)
                .andWhere(`${this.table}.income_at`, '>=', start)
                .andWhere(`${this.table}.income_at`, '<', end)
                .limit(limit)
                .orderBy(`${this.table}.income_at`, 'asc')
                .then(result => { 
                    if (result && result.length) resolve(result);
                })
                .catch(err => { 
                    this.logger.error(`Mysql error in table ${this.table}: ${err}`)
                })
        });
    }
};
