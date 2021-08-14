const moment = require('moment');
const _ = require('lodash');

module.exports = class TickListener {
    constructor(
        tickers,
        instances,
        strategyManager,
        eventEmitter,
        logger,
        systemUtil
    ) {
        this.tickers = tickers;
        this.instances = instances;
        this.strategyManager = strategyManager;
        this.eventEmitter = eventEmitter;
        this.logger = logger;
        this.systemUtil = systemUtil;
    }

    onTick(tickEvent) { //tickEvent: Object
        const me = this;

        const { pairs, strategy, options } = tickEvent; //pairs: ArrayOfObject, strategy: Objcet
        
        const strategyInstance = me.strategyManager.findStrategy(strategy.name);
        if (!strategyInstance) {
            me.logger.error(`Invalid find strategy: ${JSON.stringify(strategy.name)}`);
            return;
        }

        switch (pairs.length) {
            case 2:
                return me.visitTwoPairsStrategy(pairs, strategy, options);
            case 1:
                return me.visitOnePairsStrategy();
            default:
                return me.visitMultiplicityPairsStrategy();
        }
    }

    visitTwoPairsStrategy(pairs, strategy, options) {
        // items: ArrayOfObject | startegy: Object 

        const me = this;

        const tickers = [];
        
        const opt = {...strategy.options, ...options};
        
        pairs.forEach(pair => {
            const ticker = me.tickers.get(pair.exchange, pair.symbol);
            
            if (!ticker) { //Check is ticker empty
                me.logger.error(`Ticker: <${pair.exchange}>.<${pair.symbol}> not found.`);
                console.log(`Ticker: <${pair.exchange}>.<${pair.symbol}> not found.`);
                return;
            }

            tickers.push(ticker);
        });
        
        //get a signal from stratygy what we must do with pairs | {}
        return me.strategyManager.execute(strategy.name, null, null, tickers, opt);
    }

    visitOnePairsStrategy() {
        return undefined;
    }

    visitMultiplicityPairsStrategy() {
        return undefined;
    }
};
