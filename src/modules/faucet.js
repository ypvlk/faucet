
module.exports = class Faucet {
    constructor(
        eventEmitter,
        logger,
        systemUtil
    ) {
        this.eventEmitter = eventEmitter;
        this.logger = logger;
        this.systemUtil = systemUtil;
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
            // if (new Date().getUTCHours === 23 &&)
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
