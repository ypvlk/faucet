module.exports = class TickerExportHttp {
    constructor(tickersRepository) {
        this.tickersRepository = tickersRepository;
    }

    async getMultipleTickers(pairs, period, startTime, endTime, limit) {
        return this.tickersRepository.getMultipleTickers(pairs, period, startTime, endTime, limit);
    }
};