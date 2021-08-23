

module.exports = class MeanReversionRepository {
    constructor(
        mysqlDB,
        logger
    ) {
        this.mysqlDB = mysqlDB;
        this.logger = logger;

        this.table = 'mean_reversion'
    }

    insertData(data) {
        return new Promise(resolve => {
            const parameters = {
                lead_exchange: data.lead_exchange,
                lead_symbol: data.lead_symbol,
                lead_change: data.lead_change,
                lead_price: data.lead_price,
                lead_side: data.lead_side,
                lead_tier: data.lead_tier,
                lead_amount: data.lead_amount,
                driven_exchange: data.driven_exchange,
                driven_symbol: data.driven_symbol,
                driven_change: data.driven_change,
                driven_price: data.driven_price,
                adj_driven_change: data.adj_driven_change,
                driven_side: data.driven_side,
                driven_tier: data.driven_tier,
                driven_amount: data.driven_amount,
                delta: data.delta,
                signal: data.signal,
                balance: data.balance,
                balance_comm: data.balance_comm,
                income_at: Math.floor(Date.now() / 1000)
            };

            this.mysqlDB(this.table)
                .timeout(3000, {cancel: true})
                .insert(parameters)
                .then(data => { 
                    resolve(); 
                })
                .catch(err => { 
                    this.logger.error(`Mysql error in table ${this.table}: ${err}`);
                    resolve();
                })
        });
    }

    getData(leadExchange, leadSymbol, drivenExchange, drivenSymbol, limit = 100000) {
        return new Promise(resolve => {

            this.mysqlDB(this.table)
                .timeout(3000, {cancel: true})
                .select('*')
                .where({
                    lead_exchange: leadExchange,
                    lead_symbol:  leadSymbol
                })
                .andWhere({
                    driven_exchange: drivenExchange,
                    driven_symbol:  drivenSymbol
                })
                .limit(limit)
                .then(result => { 
                    resolve(result);
                })
                .catch(err => { 
                    this.logger.error(`Mysql error in table ${this.table}: ${err}`);
                    resolve([]);
                })
        });
    }

    cleanOldEntries(days = 7) {
        return new Promise(resolve => {
            const income_at = moment().subtract(days, 'days').unix();

            this.mysqlDB(this.table)
                .timeout(10000, {cancel: true})
                .where(`${this.table}.income_at`, '<', income_at)
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

};
