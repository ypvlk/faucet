module.exports = class TickerExportHttp {
    constructor(tickersRepository) {
        this.tickersRepository = tickersRepository;
    }

    async getMultipleTickers(pairs, period, limit, time) {
        return this.tickersRepository.getMultipleTickers(pairs, period, limit, time);
    }
};