


module.exports = class Faucet {
    constructor(
        eventEmitter,
        logger,
        systemUtil
    ) {
        this.eventEmitter = eventEmitter;
        this.logger = logger;
        this.systemUtil = systemUtil;
    }

    start() {
        console.log('Faucet module start...');

        const me = this;
        const { eventEmitter } = this;

        // setTimeout(async () => {
        //     // console.log(`Got: ${this.tickerLength} tickers`);
        //     console.log('Backfill Tickers module finish');

        //     process.exit(0);
        // }, time);

        setInterval(async () => {
            
        }, 1000 * 60 * 5);
    }
};
