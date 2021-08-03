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
                    console.log('err');
                    this.logger.error(`Mysql error in table ${this.table}: ${err}`);
                })
        });
    }
};
