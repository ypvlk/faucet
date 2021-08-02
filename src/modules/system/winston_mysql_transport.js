const Transport = require('winston-transport');

module.exports = class WinstonMysqlTransport extends Transport {
    constructor(opts) {
        super(opts);

        if (!opts.database_connection) {
            throw new Error('database_connection is needed');
        }

        if (!opts.table) {
            throw new Error('table is needed');
        }

        this.db = opts.database_connection;
        this.table = opts.table;
    }

    log(info, callback) {
        setImmediate(() => {
            this.emit('logged', info);
        });

        const parameters = {
            uuid: WinstonMysqlTransport.createUUID(),
            level: info.level,
            message: info.message,
            created_at: Math.floor(Date.now() / 1000)
        };

        this.db(this.table)
            .timeout(3000, {cancel: true})
            .insert(parameters)
            .then(data => { 
                callback(); 
            })
            .catch(err => { 
                throw new Error(`Winston mysql transport error: ${err}`); 
            })
    }

    static createUUID() {
        let dt = new Date().getTime();
        return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
            const r = (dt + Math.random() * 16) % 16 | 0;
            dt = Math.floor(dt / 16);
            return (c == 'x' ? r : (r & 0x3) | 0x8).toString(16);
        });
    }
};
