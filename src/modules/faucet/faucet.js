const os = require('os');
const moment = require('moment');

module.exports = class Faucet {
    constructor(
        eventEmitter,
        tickListener,
        strategyDatabaseListener,
        logger,
        throttler,
        systemUtil,
        uploadFileCron,
        insertFileCron,
        backtestingCron,
        logsRepository,
        instances,
        projectDir
    ) {
        this.eventEmitter = eventEmitter;
        this.tickListener = tickListener;
        this.strategyDatabaseListener = strategyDatabaseListener;
        this.logger = logger;
        this.throttler = throttler;
        this.systemUtil = systemUtil;
        this.uploadFileCron = uploadFileCron;
        this.insertFileCron = insertFileCron;
        this.backtestingCron = backtestingCron;
        this.logsRepository = logsRepository;
        this.instances = instances;
        this.projectDir = projectDir;

        // this.pairs = [];
    }

    start() {
        process.on('SIGINT', async () => {
            // force exit in any case
            setTimeout(() => {
                process.exit(0);
            }, 1500);
        });
        
        const message = `Start: faucet module - ${os.hostname()} - ${os.platform()} - ${moment().format()}`;
        
        this.logger.info(message);
        console.log(message);

        const me = this;
        const { eventEmitter } = this;

        // me.pairs = me.instances.symbols;
        
        setInterval(async () => {
            await me.logsRepository.cleanOldLogEntries();
            
            me.logger.info('Cleanup old entries');
        }, 86455000 * 2); //* 3 days

        setInterval(async () => {
            const date = new Date();  
            const hours = date.getUTCHours();
            const minutes = date.getUTCMinutes();
            
            if (hours === 23 && minutes >= 47 && minutes <= 55) {
                me.logger.debug('It\'s time a faucet tickers from skinrobot servers');
                await me.uploadFileCron.start();
            }
            
            if (hours === 0 && minutes >= 2 && minutes <= 10) {
                me.logger.debug('It\'s time a insert tickers from files into db');
                await me.insertFileCron.start();
            }
            
            if (hours > 0 && hours < 20) {
                // if (me.pairs.length > 0) {
                    me.backtestingCron.start();
                // }
            }
        }, me.systemUtil.getConfig('faucet.faucet_time_interval'), 1000 * 60);

        eventEmitter.on('tick', function(tickEvent) {
            me.tickListener.onTick(tickEvent);
        });

        eventEmitter.on('tick_signal', async function(signalEvent) {
            await me.strategyDatabaseListener.saveData(signalEvent); //save strategy data at db 
            // await me.signalDatabaseListener.saveSignal(signalEvent); //save signal at db
            
            // if (signalEvent.signals && signalEvent.signals.length > 0) {
            //     console.log('GET SIGNAL EVENT');
            //     me.signalListener.onSignal(signalEvent.signals);
            // }
        });

        eventEmitter.on('actions',  async actionsEvent => {
            // console.log('GET ACTION EVENT');
            // await this.actionDatabaseListener.insertActions(actionsEvent);
        });
    }
};
