
module.exports = class Faucet {
    constructor(
        eventEmitter,
        logger,
        throttler,
        systemUtil,
        projectDir
    ) {
        this.eventEmitter = eventEmitter;
        this.logger = logger;
        this.throttler = throttler;
        this.systemUtil = systemUtil;
        this.projectDir = projectDir;
    }

    start() {
        console.log('Faucet module start...');

        const me = this;
        const { eventEmitter } = this;

        //В этом классе будет логи отслеживания событий для рассчета 
        //А также кроны для:
        //1.Достаю со списка серверов все файлы
        //2.Вставляю все файлы в базу и удаляю их
        //3.Как то создаю очередь на рассчет по стратегиям которые создадут файлы
        //4.Выберу например какое то время это будет техническое время. 

        // setTimeout(async () => {
        //     // console.log(`Got: ${this.tickerLength} tickers`);
        //     console.log('Backfill Tickers module finish');

        //     process.exit(0);
        // }, time);

        setInterval(async () => {
            const date = new Date();    
            if (date.getUTCHours === 23 && date.getUTCMinutes() > 50 && date.getUTCMinutes() < 58) {
                //It's time a faucet tickers from skinrobot servers
                
            }
        }, 1000 * 60 * 5);

        eventEmitter.on('tick', function(options) {
            me.tickListener.onTick(options);
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
