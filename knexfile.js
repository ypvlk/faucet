
//Этот файл я создал только для того чтобы knex понимал где лежат миграции и сиды

module.exports = {
    development: {
        client: 'mysql2',
        connection: {
            host:       'localhost',
            port:       3306,
            user:       'root',
            password:   'password',
            database:   'skinrobot',
            charset:    'utf8'
        },
        migrations: {
            directory: 'db/migrations'
        },
        seeds: {
            directory: 'db/seeds'
        }
    },
    production: {
        client: 'mysql2',
        connection: {
            host:       'localhost',
            port:       3306,
            user:       'root',
            password:   'password',
            database:   'skinrobot',
            charset:    'utf8'
        },
        migrations: {
            directory: 'db/migrations'
        },
        seeds: {
            directory: 'db/seeds'
        }
    }
}
