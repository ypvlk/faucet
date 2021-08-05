const services = require('../modules/services');

module.exports = class BacktestingCommand {
    constructor() {}

    execute(options) {
        services.createBacktestingInstance().start(options, cb);
        services.getStrategyManager().init();
        // services.getTickersStreamService().init(options);
    }
};
