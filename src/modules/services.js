const fs = require('fs');
const events = require('events');

const { createLogger, transports, format } = require('winston');

const _ = require('lodash');
const knex = require('knex');

const Http = require('./http/server');

const KnexConfig = require('../../db/knex_config');
const SystemUtil = require('./system/system_util');

let config;
let eventEmitter;
let logger;
let systemUtil;
let knexConfig;
let mysqlDB;

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
    
        await this.getMysqlDatabase();
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

    getKnexConfig: function() {
        if (knexConfig) {
            return knexConfig;
        }

        return (knexConfig = new KnexConfig(
            this.getSystemUtil(),
            parameters.projectDir,
            parameters.projectMode
        ))
    },

    getMysqlDatabase: async function() {
        if (mysqlDB) {
            return mysqlDB;
        }

        const knexDb = knex(this.getKnexConfig());

        try {
            await knexDb.raw('select 1+1 as result')
        } catch (err) {
            throw new Error(`Knex test is failed, please check ${err}`);
        } finally {
            knexDb.destroy();
        }

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
                // new WinstonSqliteTransport({
                //     level: 'debug',
                //     database_connection: this.getDatabase(),
                //     table: 'logs'
                // })
            ]
        }));
    },

    createWebserverInstance: function() {
        return new Http(
            this.getSystemUtil(),
            parameters.projectDir
        );
    },
}