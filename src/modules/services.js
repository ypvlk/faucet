const fs = require('fs');
const events = require('events');

const { createLogger, transports, format } = require('winston');

const _ = require('lodash');

const knexConfig = require('../../knexfile');
const knex = require('knex');

const Http = require('./http/server');
const Backtesting = require('./backtesting/backtesting');
const Faucet = require('./faucet');

const InsertFileService = require('./insert_file');
const TickersStreamService = require('./backtesting/tickers_stream_service');
const UploadFileService = require('./upload_file');

const StrategyManager = require('./strategy/strategy_manager');

const StrategyDatabaseListener = require('./listener/strategy_database_listener');
const TickListener = require('./listener/tick_listener');

const TickerExportHttp = require('./http/controller/ticker_export_http');
const CsvExportHttp = require('./http/controller/csv_export_http');

const LogsRepository = require('./db/repository/logs_repository');
const TickersRepository = require('./db/repository/tickers_repository');
const MeanReversionRepository = require('./db/repository/mean_reversion_repository');

const WinstonMysqlTransport = require('./system/winston_mysql_transport');
const SystemUtil = require('./system/system_util');
const RequestClient = require('./system/request_client');
const Queue = require('./system/queue');
const Throttler = require('./system/queue');

const Tickers = require('../storage/tickers');
const BacktestingStorage = require('../storage/backtesting');

let config;
let instances;
let eventEmitter;
let logger;
let systemUtil;
let mysqlDB;
let logsRepository;
let tickersRepository;
let insertFileService;
let requestClient;
let strategyManager;
let tickersStreamService;
let strategyDatabaseListener;
let backtestingStorage;
let meanReversionRepository;
let tickListener;
let tickers;
let queue;
let tickerExportHttp;
let csvExportHttp;
let throttler;
let uploadFileService;

const parameters = {};

module.exports = {
    boot: async function(projectDir, options) {
        const { mode } = options;
        parameters.projectDir = projectDir;
        parameters.projectMode = mode;

        try {
            instances = require(`${parameters.projectDir}/instance.js`);
        } catch (e) {
            throw new Error(`Invalid instance.js file. Please check: ${String(e)}`);
        }
        
        try {
            config = JSON.parse(fs.readFileSync(`${parameters.projectDir}/config/conf.json`, 'utf8'));
        } catch (e) {
            throw new Error(`Invalid conf.json file. Please check: ${String(e)}`);
        }
    
        this.getMysqlDatabase();

        if (mysqlDB) { //Check knex connection
            try {
                await mysqlDB.raw('select 1+1 as result')
            } catch (e) {
                throw new Error(`Knex test is failed, please check ${String(e)}`);
            } 
        }
    },

    getConfig: () => {
        return config;
    },

    getInstances: () => {
        return instances;
    },

    getSystemUtil: function() {
        if (systemUtil) {
            return systemUtil;
        }
    
        return (systemUtil = new SystemUtil(this.getConfig()));
    },

    getMysqlDatabase: function() {
        if (mysqlDB) {
            return mysqlDB;
        }

        const knexDb = knex(knexConfig[process.env.NODE_ENV]);
        
        return (mysqlDB = knexDb);
    },

    getEventEmitter: function() {
        if (eventEmitter) {
            return eventEmitter;
        }
    
        return (eventEmitter = new events.EventEmitter());
    },

    getQueue: function() {
        if (queue) {
            return queue;
        }
    
        return (queue = new Queue());
    },

    getThrottler: function() {
        if (throttler) {
            return throttler;
        }
    
        return (throttler = new Throttler(
            this.getLogger(),
        ));
    },

    getLogger: function() {
        if (logger) {
            return logger;
        }

        return (logger = createLogger({
            format: format.combine(format.timestamp(), format.json()),
            transports: [
                new transports.File({
                    filename: `${parameters.projectDir}/logs/log.log`,
                    level: 'debug'
                }),
                new transports.Console({
                    level: 'error'
                }),
                new WinstonMysqlTransport({
                    level: 'debug',
                    database_connection: this.getMysqlDatabase(),
                    table: 'logs'
                })
            ]
        }));
    },

    getLogsRepository: function() {
        if (logsRepository) {
            return logsRepository;
        }
    
        return (logsRepository = new LogsRepository(
            this.getMysqlDatabase(),
            this.getLogger()
        ));
    },

    getBacktestingStorage: function() {
        if (backtestingStorage) {
            return backtestingStorage;
        }
    
        return (backtestingStorage = new BacktestingStorage());
    },

    getRequestClient: function() {
        if (requestClient) {
            return requestClient;
        }
    
        return (requestClient = new RequestClient(
            this.getLogger()
        ));
    },

    getTickers: function() {
        if (tickers) {
            return tickers;
        }
    
        return (tickers = new Tickers());
    },

    getTickersRepository: function() {
        if (tickersRepository) {
            return tickersRepository;
        }
    
        return (tickersRepository = new TickersRepository(
            this.getMysqlDatabase(),
            this.getLogger()
        ));
    },

    getMeanReversionRepository: function() {
        if (meanReversionRepository) {
            return meanReversionRepository;
        }
    
        return (meanReversionRepository = new MeanReversionRepository(
            this.getMysqlDatabase(),
            this.getLogger()
        ));
    },

    getStrategyManager: function() {
        if (strategyManager) {
            return strategyManager;
        }
    
        return (strategyManager = new StrategyManager(
            this.getEventEmitter(),
            this.getLogger(),
            parameters.projectDir
        ));
    },

    getInsertFileService: function() {
        if (insertFileService) {
            return insertFileService;
        }
    
        return (insertFileService = new InsertFileService(
            this.getSystemUtil(),
            this.getLogger(),
            this.getTickersRepository()
        ));
    },

    getUploadFileService: function() {
        if (uploadFileService) {
            return uploadFileService;
        }
    
        return (uploadFileService = new UploadFileService(
            this.getSystemUtil(),
            this.getLogger(),
            this.getRequestClient(),
            parameters.projectDir
        ));
    },

    getStrategyDatabaseListener: function() {
        if (strategyDatabaseListener) {
            return strategyDatabaseListener;
        }
    
        return (strategyDatabaseListener = new StrategyDatabaseListener(
            this.getMeanReversionRepository(),
            this.getBacktestingStorage()
        ));
    },

    getTickListener: function() {
        if (tickListener) {
            return tickListener;
        }
    
        return (tickListener = new TickListener(
            this.getTickers(),
            this.getInstances(),
            this.getStrategyManager(),
            this.getEventEmitter(),
            this.getLogger(),
            this.getSystemUtil()
        ));
    },

    getTickerExportHttp: function() {
        if (tickerExportHttp) {
            return tickerExportHttp;
        }
    
        return (tickerExportHttp = new TickerExportHttp(
            this.getTickersRepository()
        ));
    },

    getCsvExportHttp: function() {
        if (csvExportHttp) {
            return csvExportHttp;
        }
    
        return (csvExportHttp = new CsvExportHttp(
            this.getMeanReversionRepository(),
            this.getLogger(),
            parameters.projectDir
        ));
    },

    getTickersStreamService: function() {
        if (tickersStreamService) {
            return tickersStreamService;
        }
    
        return (tickersStreamService = new TickersStreamService(
            this.getEventEmitter(),
            this.getLogger(),
            this.getInstances(),
            this.getSystemUtil(),
            this.getTickerExportHttp(),
            this.getTickers(),
            this.getBacktestingStorage(),
            this.getCsvExportHttp(),
            parameters.projectDir
        ));
    },

    createWebserverInstance: function() {
        return new Http(
            this.getSystemUtil(),
            this.getLogger(),
            this.getRequestClient(),
            this.getCsvExportHttp(),
            this.getUploadFileService(),
            parameters.projectDir
        );
    },

    createBacktestingInstance: function() {
        return new Backtesting(
            this.getEventEmitter(),
            this.getTickListener(),
            this.getTickersStreamService(),
            this.getStrategyDatabaseListener(),
            this.getInstances(),
            this.getSystemUtil()
        );
    },
    
    createFaucetInstance: function() {
    
        return new Faucet(
            this.getEventEmitter(),
            this.getLogger(),
            this.getThrottler(),
            this.getSystemUtil(),
            parameters.projectDir
        );
    },
}