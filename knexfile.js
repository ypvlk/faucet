require('dotenv').config();


module.exports = {
    development: {
        client: 'mysql2',
        connection: {
            host:       process.env.DB_HOST,
            port:       process.env.DB_PORT,
            user:       process.env.DB_USER,
            password:   process.env.DB_PASSWORD,
            database:   process.env.DB_NAME,
            charset:    process.env.DB_CHARSET
        },
        migrations: {
            directory: 'db/migrations'
        },
        seeds: {
            directory: 'db/seeds/dev'
        },
        pool: {
            min: 1,
            max: 2, ///connections = ((core_count * 2) + effective_spindle_count)
            propagateCreateError: false // <- default is true, set to false
        },
        debug: true, //Включает вывод инфы по запросам в консоль
    },

    production: {
        client: 'mysql2',
        connection: {
            host:       process.env.DB_HOST,
            port:       process.env.DB_PORT,
            user:       process.env.DB_USER,
            password:   process.env.DB_PASSWORD,
            database:   process.env.DB_NAME,
            charset:    process.env.DB_CHARSET
        },
        migrations: {
            directory: 'db/migrations'
        },
        seeds: {
            directory: 'db/seeds/prod'
        },
        pool: {
            min: 1,
            max: 2, ///connections = ((core_count * 2) + effective_spindle_count)
            propagateCreateError: false // <- default is true, set to false
        },

        //Это важное время, таймаут подключение knex к бд
        //Поставил из за транзакций и pool
        //Когда пул забит транзакция зависает
        //нужно смотреть за этим значений
        acquireConnectionTimeout: 3000,
        
        debug: false, //Включает вывод инфы по запросам в консоль

        // acquire promises are rejected after this many milliseconds
        // if a resource cannot be acquired
        acquireTimeoutMillis: 30000,

        // create operations are cancelled after this many milliseconds
        // if a resource cannot be acquired
        createTimeoutMillis: 30000,

        // destroy operations are awaited for at most this many milliseconds
        // new resources will be created after this timeout
        destroyTimeoutMillis: 5000,

        // free resouces are destroyed after this many milliseconds
        idleTimeoutMillis: 30000,

        // how often to check for idle resources to destroy
        reapIntervalMillis: 1000,

        // how long to idle after failed create before trying again
        createRetryIntervalMillis: 200,
        // propagateCreateError: false
    }
}
