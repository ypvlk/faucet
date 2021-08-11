
module.exports = class Faucet {
    constructor(
        eventEmitter,
        logger,
        throttler,
        systemUtil,
        uploadFileCron,
        insertFileCron,
        projectDir
    ) {
        this.eventEmitter = eventEmitter;
        this.logger = logger;
        this.throttler = throttler;
        this.systemUtil = systemUtil;
        this.uploadFileCron = uploadFileCron;
        this.insertFileCron = insertFileCron;
        this.projectDir = projectDir;
    }

    start() {
        console.log('Faucet module start...');

        const me = this;
        const { eventEmitter } = this;

        setInterval(async () => {
            const date = new Date();  
            const hours = date.getUTCHours();
            const minutes = date.getUTCMinutes();
            
            if (hours === 23 && minutes >= 47 && minutes <= 50) {
                //It's time a faucet tickers from skinrobot servers
                await me.uploadFileCron.start();
            }
            
            if (hours === 0 && minutes >= 5 && minutes <= 30) {
                //It's time a insert tickers from files into db
                await me.insertFileCron.start();
            }

            //TODO 
            //Дальше нужно сделать расчет стратегий и сохранения результатов в файл
            //Также нужно сделать запросы http такие же
            //И может команды

            //check commit
        }, 1000 * 60 * 1); //* 60 * 5

        eventEmitter.on('tick', function(options) {
            // me.tickListener.onTick(options);
        });

        eventEmitter.on('tick_signal', async function(signalEvent) {
            // await me.strategyDatabaseListener.saveData(signalEvent); //save strategy data at db 
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
