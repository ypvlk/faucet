

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
            table.increments('id');
            table.string('uuid', 64).unique().notNull();
            table.string('level', 32).notNull();
            table.text('message');
            table.integer('created_at', 4).unsigned().notNull();

            table.index('created_at', 'created_at_idx');
            table.index(['level', 'created_at'], 'level_created_at_idx');
            table.index('level', 'level_idx');
        }),

        knex.schema
        .createTable('mean_reversion', table => {
            table.increments('id');
            table.string('lead_exchange', 255).notNull().defaultTo('');
            table.string('lead_symbol', 255).notNull().defaultTo('');
            table.string('lead_change', 255).notNull().defaultTo('');
            table.string('lead_price', 255).notNull().defaultTo('');
            table.string('lead_side', 10).notNull().defaultTo('');
            table.string('lead_tier', 255).notNull().defaultTo('');
            table.string('lead_amount', 255).notNull().defaultTo('');
            table.string('driven_exchange', 255).notNull().defaultTo('');
            table.string('driven_symbol', 255).notNull().defaultTo('');
            table.string('driven_change', 255).notNull().defaultTo('');
            table.string('driven_price', 255).notNull().defaultTo('');
            table.string('adj_driven_change', 255).notNull().defaultTo('');
            table.string('driven_side', 10).notNull().defaultTo('');
            table.string('driven_tier', 255).notNull().defaultTo('');
            table.string('driven_amount', 255).notNull().defaultTo('');
            table.string('delta', 255).notNull().defaultTo('');
            table.string('signal', 10).notNull().defaultTo('');
            table.string('balance', 255).notNull().defaultTo('');
            table.string('balance_comm', 255).notNull().defaultTo('');
            table.bigInteger('income_at', 8).unsigned().notNull();

            table.index('income_at', 'income_at_idx');
        })
    ])
};

exports.down = function(knex) {
    return Promise.all([
        knex.schema
        .dropTable('tickers')
        .dropTable('logs')
        .dropTable('mean_reversion')
    ])
};
