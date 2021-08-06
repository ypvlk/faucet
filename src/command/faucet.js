const services = require('../modules/services');

module.exports = class FaucetCommand {
    constructor() {}

    execute(options) {
        services.createWebserverInstance().start();
        services.getStrategyManager().init();
        services.createFaucetInstance().start();
    }
};
