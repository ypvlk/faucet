const fs = require('fs');
const events = require('events');

const { createLogger, transports, format } = require('winston');

const _ = require('lodash');

const Http = require('./http/server');

let config;
let eventEmitter;
let logger;
let systemUtil;

const parameters = {};

module.exports = {
    boot: async function(projectDir) {
        parameters.projectDir = projectDir;

        try {
            config = JSON.parse(fs.readFileSync(`${parameters.projectDir}/conf.json`, 'utf8'));
        } catch (e) {
            throw new Error(`Invalid conf.json file. Please check: ${String(e)}`);
        }
    
        // this.getDatabase();
    },

    // getDatabase: () => {
    //   // sqlite3 database.db -init dump.sql
    //     if (db) {
    //         return db;
    //     }
  
    //   const myDb = Sqlite('bot.db');
    //   myDb.pragma('journal_mode = WAL');
  
    //   myDb.pragma('SYNCHRONOUS = 1;');
    //   myDb.pragma('LOCKING_MODE = EXCLUSIVE;');
  
    //   return (db = myDb);
    // },

    getConfig: () => {
        return config;
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

    getSystemUtil: function() {
        if (systemUtil) {
            return systemUtil;
        }
    
        return (systemUtil = new SystemUtil(this.getConfig()));
    },

    createWebserverInstance: function() {
        return new Http(
            this.getSystemUtil(),
            parameters.projectDir
        );
    },
}