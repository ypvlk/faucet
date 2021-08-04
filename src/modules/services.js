const fs = require('fs');
const events = require('events');

const { createLogger, transports, format } = require('winston');

const _ = require('lodash');

const knexConfig = require('../../knexfile');
const knex = require('knex');

const Http = require('./http/server');

const InsertFileService = require('./insert_file');

const StrategyManager = require('./strategy/strategy_manager');

const LogsRepository = require('./db/repository/logs_repository');
const TickersRepository = require('./db/repository/tickers_repository');

const WinstonMysqlTransport = require('./system/winston_mysql_transport');
const SystemUtil = require('./system/system_util');
const RequestClient = require('./system/request_client');

let config;
let eventEmitter;
let logger;
let systemUtil;
let mysqlDB;
let logsRepository;
let tickersRepository;
let insertFileService;
let requestClient;
let strategyManager;

const parameters = {};

module.exports = {
    boot: async function(projectDir, options) {
        const { mode } = options;
        parameters.projectDir = projectDir;
        parameters.projectMode = mode;

        try {
            config = JSON.parse(fs.readFileSync(`${parameters.projectDir}/config/conf.json`, 'utf8'));
        } catch (e) {
            throw new Error(`Invalid conf.json file. Please check: ${String(e)}`);
        }
    
        this.getMysqlDatabase();

        if (mysqlDB) { //Check knex connection
            try {
                await mysqlDB.raw('select 1+1 as result')
            } catch (err) {
                throw new Error(`Knex test is failed, please check ${err}`);
            } 
        }
    },

    getConfig: () => {
        return config;
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

    getRequestClient: function() {
        if (requestClient) {
            return requestClient;
        }
    
        return (requestClient = new RequestClient(
            this.getLogger()
        ));
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

    createWebserverInstance: function() {
        return new Http(
            this.getSystemUtil(),
            this.getLogger(),
            this.getRequestClient(),
            parameters.projectDir
        );
    },
    

    // createFaucetInstance: function() {
    // this.getStrategyManager().init();
    //     return new Http(
    //         this.getSystemUtil(),
    //         this.getLogger(),
    //         parameters.projectDir
    //     );
    // },
}