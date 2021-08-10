
module.exports = class Faucet {
    constructor(
        eventEmitter,
        logger,
        throttler,
        systemUtil,
        uploadFileCron,
        projectDir
    ) {
        this.eventEmitter = eventEmitter;
        this.logger = logger;
        this.throttler = throttler;
        this.systemUtil = systemUtil;
        this.uploadFileCron = uploadFileCron;
        this.projectDir = projectDir;
    }

    start() {
        console.log('Faucet module start...');

        const me = this;
        const { eventEmitter } = this;

        setInterval(async () => {
            const date = new Date();    
            if (date.getUTCHours === 23 && date.getUTCMinutes() > 50 && date.getUTCMinutes() < 59) {
                //It's time a faucet tickers from skinrobot servers
                await me.uploadFileCron.start();
            }

            //TODO
            //Дальше нужно сделать сохранения всех файлов в папке тикерс в базу по очереди

            //TODO 
            //Дальше нужно сделать расчет стратегий и сохранения результатов в файл
            //Также нужно сделать запросы http такие же
            //И может команды

            
        }, 1000 * 60 * 5); //* 60 * 5

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
