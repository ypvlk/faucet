const _ = require('lodash');

module.exports = class BacktestingCron {
    constructor(
        systemUtil,
        logger,
        queue,
        throttler,
        instances,
        tickersStreamService,
        projectDir
    ) {
        this.systemUtil = systemUtil;
        this.logger = logger;
        this.queue = queue;
        this.throttler = throttler;
        this.instances = instances;
        this.tickersStreamService = tickersStreamService;
        this.projectDir = projectDir;

        this.pairs = instances.symbols;

        //TODO 
        //add setinterval update pairs
    }

    start() {
        //Check Queue Tasks
        const queue_tasks = this.queue.getQueue2Tasks();
        console.log('Q', Object.keys(queue_tasks).length);
        if (Object.keys(queue_tasks).length !== 0) return;
    
        this.logger.debug('Backtesting cron start');
        console.log('Backtesting cron start');

        const me = this;

        const yesterday = new Date(new Date().setDate(new Date().getDate()-1)).toISOString().slice(0, 10);

        const options = { 
            date: '2021-08-05', 
            limit: 2000, 
            period: 3000,
            correction: me.systemUtil.getConfig('backtesting.correction'),
            get_position: me.systemUtil.getConfig('backtesting.get_position'),
            take_profit: me.systemUtil.getConfig('backtesting.take_profit'),
            exchange_commission: me.systemUtil.getConfig('backtesting.exchange_commission')
        };

        const item = me.pairs.shift();
        const key = `tickers-stream-service-${item.pair}`;

        const promise = () => new Promise(async (resolve, reject) => {
            try {
                await me.tickersStreamService.init(item, options);
                resolve(key);
            } catch(err) {
                me.logger.error(`Ticker stream promise error: ${String(err)}`);
                reject(key);
            }
        })

        me.queue.addQueue2(key, promise);
    }
}