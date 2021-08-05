module.exports = class TickEvent {
    constructor(
        pairs, 
        strategy, 
        options
    ) {
        this.pairs = pairs;
        this.strategy = strategy;
        this.options = options;
    }
};