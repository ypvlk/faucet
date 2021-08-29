const _ = require('lodash');
const fs = require('fs');

module.exports = class StrategyDatabaseListener {
    constructor(
        meanReversionRepository,
        backtestingStorage,

        logger,
        projectDir
    ) {
        this.meanReversionRepository = meanReversionRepository;
        this.backtestingStorage = backtestingStorage;

        this.logger = logger;
        this.projectDir = projectDir;

        this.files_data = {};
        _files.push(me.files_data);
    }

    async saveData(signalEvent) {
        const {strategy, data} = signalEvent;

        const me = this;

        if (!data || !strategy) return;

        me.updateBacktestingStorage(data);

        const pairs = `${data.lead_exchange}.${data.lead_symbol}_${data.driven_exchange}.${data.driven_symbol}`;
        const path = `${me.projectDir}/var/strategy/${strategy}_${pairs}_${date}.csv`;

        //checkread file if file not exists
        if (!me.isFileExists(path, date, strategy)) return;

        const fields = Object.keys(me.files_data);
        
        me.csvExportHttp.saveSyncIntoFile(_files, path, fields);
        
        // const strategy_repository = this.getRepository(strategy);
        // return strategy_repository.insertData(data); //save data into db
    }

    getRepository(name) {
        if (name === 'mean_reversion') {
            return this.meanReversionRepository;
        }
        if (name === 'mean_reversion_2') {
            return this.meanReversionRepository;
        }
    }

    updateBacktestingStorage(data) {
        if (data.balance) this.backtestingStorage.updateBalance(data.balance);
        if (data.balance_comm) this.backtestingStorage.updateBalanceWithComm(data.balance_comm);
        if (data.drawdown) this.backtestingStorage.updateDrawdown(data.drawdown);
        if (data.all_positions) this.backtestingStorage.updateAllPositions(data.all_positions);
        if (data.positive_positions) this.backtestingStorage.updatePositivePositions(data.positive_positions);
        if (data.negative_positions) this.backtestingStorage.updateNegativePositions(data.negative_positions);

        if (data.max_position_profit) this.backtestingStorage.updateMaxPositionProfit(data.max_position_profit);
        if (data.max_position_lose) this.backtestingStorage.updateMaxPositionLose(data.max_position_lose);
        if (data.min_position_profit) this.backtestingStorage.updateMinPositionProfit(data.min_position_profit);
        if (data.min_position_lose) this.backtestingStorage.updateMinPositionLose(data.min_position_lose);
        if (data.average_position_profit) this.backtestingStorage.updateAveragePositionProfit(data.average_position_profit);
        if (data.average_position_lose) this.backtestingStorage.updateAveragePositionLose(data.average_position_lose);
    }

    isFileExists(path) {

        try {
            fs.accessSync(path, fs.constants.F_OK);
        } catch(e) {
            return true;
        }
        
        this.logger.debug(`File: ${path} exists.`);
        return false;
    }
};
