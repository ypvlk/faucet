

exports.up = function(knex, Promise) {
    return knex.schema
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
    })
};

exports.down = function(knex, Promise) {
    return knex.schema
        .dropTable('tickers')
};
