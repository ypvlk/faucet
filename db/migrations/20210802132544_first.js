

exports.up = function(knex) {
    return Promise.all([
        knex.schema
        .createTable('tickers', table => {
            table.increments('id');
            table.string('exchange', 255).notNull().defaultTo('');
            table.string('symbol', 255).notNull().defaultTo('');
            table.string('bidPrice', 255).notNull().defaultTo('');
            table.string('bidSize', 255).notNull().defaultTo('');
            table.string('askPrice', 255).notNull().defaultTo('');
            table.string('askSize', 255).notNull().defaultTo('');
            table.specificType('period', 'smallint(2)').unsigned().notNull().defaultTo(1000);
            table.string('close', 255).notNull().defaultTo('');
            table.bigInteger('income_at', 8).unsigned().notNull();

            table.index(['exchange', 'symbol'], 'tickers_idx');
            table.index(['exchange', 'symbol', 'income_at'], 'tickers_time_idx');
        }),

        knex.schema
        .createTable('logs', table => {
            table.string('uuid', 64).primary().unique().notNull();
            table.string('level', 32).notNull();
            table.text('message');
            table.integer('created_at', 4).unsigned().notNull();

            table.index('created_at', 'created_at_idx');
            table.index(['level', 'created_at'], 'level_created_at_idx');
            table.index('level', 'level_idx');
        })
    ])
};

exports.down = function(knex) {
    return Promise.all([
        knex.schema
        .dropTable('tickers')
        .dropTable('logs')
    ])
};
