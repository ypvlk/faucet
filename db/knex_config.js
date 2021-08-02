
const knexfile = require('../knexfile');

module.exports = class KnexConfig {

    static get MODE_DEV() {
        return 'development';
    }

    static get MODE_PROD() {
        return 'production';
    }

    constructor(
        systemUtil,
        projectDir,
        projectMode
    ) {
        if (![KnexConfig.MODE_DEV, KnexConfig.MODE_PROD].includes(projectMode)) {
            throw new Error(`Invalid options mode given: ${projectMode}`);
        }

        this.client = knexfile[projectMode].client,
        this.connection = {
            host:       systemUtil.getConfig(`mysql_db.${projectMode}.host`, 'localhost'),
            port:       systemUtil.getConfig(`mysql_db.${projectMode}.port`, 3306),
            user:       systemUtil.getConfig(`mysql_db.${projectMode}.user`, 'root'),
            password:   systemUtil.getConfig(`mysql_db.${projectMode}.password`, 'pass'),
            database:   systemUtil.getConfig(`mysql_db.${projectMode}.database`, 'main'),
            charset:    systemUtil.getConfig(`mysql_db.${projectMode}.charset`, 'ut8')
        };
        this.pool = {
            min: 1,
            max: 2 ///connections = ((core_count * 2) + effective_spindle_count)
        };

        //Это важное время, таймаут подключение knex к бд
        //Поставил из за транзакций и pool
        //Когда пул забит транзакция зависает
        //нужно смотреть за этим значений
        this.acquireConnectionTimeout = 3000;
        
        this.debug = systemUtil.getConfig(`mysql_db.${projectMode}.debug`, true); //Включает вывод инфы по запросам в консоль

        // acquire promises are rejected after this many milliseconds
        // if a resource cannot be acquired
        this.acquireTimeoutMillis = 30000;

        // create operations are cancelled after this many milliseconds
        // if a resource cannot be acquired
        this.createTimeoutMillis = 30000;

        // destroy operations are awaited for at most this many milliseconds
        // new resources will be created after this timeout
        this.destroyTimeoutMillis = 5000;

        // free resouces are destroyed after this many milliseconds
        this.idleTimeoutMillis = 30000;

        // how often to check for idle resources to destroy
        this.reapIntervalMillis = 1000;

        // how long to idle after failed create before trying again
        this.createRetryIntervalMillis = 200;
        this.propagateCreateError = false;

        this.migrations = knexfile[projectMode].migrations;
        this.seeds = knexfile[projectMode].seeds;
    }
}