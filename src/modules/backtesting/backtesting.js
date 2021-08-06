const _ = require('lodash');

module.exports = class Backtesting {
    constructor(
        eventEmitter,
        tickListener,
        tickersStreamService,
        strategyDatabaseListener,
        instances,
        systemUtil
    ) {
        this.eventEmitter = eventEmitter;
        this.tickListener = tickListener;
        this.tickersStreamService = tickersStreamService;
        this.strategyDatabaseListener = strategyDatabaseListener;
        this.instances = instances;
        this.systemUtil = systemUtil;
    }

    start(options = {}) {
        console.log('Backtesting module started...');

        const me = this;
        const { eventEmitter } = this;
        const { pairs } = options; 
        
        const item = me.instances.symbols.filter(p => p.pair === pairs)
        
        //Жду 30 сек и начинаю доставать тикеры с бд
        setTimeout(async () => {
            await me.tickersStreamService.init(_.head(item), options);
            
            setTimeout(async () => {
                process.exit(0);
            }, 3000);
        }, me.systemUtil.getConfig('settings.warmup_time', 30000))

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
