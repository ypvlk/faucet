const c = module.exports = {}

function splt(pairs, type) {
    const pair = pairs.split(':');
    if (type === 'lead') return pair[0].split('.')[1];
    if (type === 'driven') return pair[1].split('.')[1];
    return undefined;
}

// 'binance_futures.BTCBUSD:binance_futures.ETHBUSD',
    // 'binance_futures.BTCUSDT:binance_futures.ETHUSDT',
    // 'binance_futures.BTCUSDT:binance_futures.LTCUSDT',
    // 'binance_futures.ETHUSDT:binance_futures.LTCUSDT',
    // 'binance_futures.BTCUSDT:binance_futures.BTTUSDT',
    // 'binance_futures.BTCUSDT:binance_futures.HOTUSDT'

c.symbols = [];

let l = [
    'binance_futures.BTCUSDT:binance_futures.ETHUSDT'
]

// node main.js backtesting -m development -pr binance_futures.BTCBUSD:binance_futures.ETHBUSD  -d 2021-07-16 -c 0.02 0.03 -g 0.1 0.11 -tp 0.05 -p 3000 -l 1000
l.forEach((pair) => {
    c.symbols.push({
        'pair': pair,
        'backtesting': {
            'limit': 2000,
            'period': 3000,
            'correction': [0.02, 0.2],
            'get_position': [0.1, 0.8],
            'take_profit': 0.055,
            'exchange_commission': 0.08
        },
        'strategy': {
            'name': 'mean_reversion',
            'options': {
                'lead': splt(pair, 'lead'),
                'driven': splt(pair, 'driven'),
                'correction_indicator_changes': 0.1, //% - значения отклонения новой разницы процентов от старой
                'exchange_commission': 0.04,
                'get_position_change_tier_1': 0.19, //%
                'get_position_change_tier_2': 0.6, //%
                'get_position_change_tier_3': 0.8, //%
                'stop_lose_position_change': 1.2, //%
                'take_profit_position_change': 0.05, //%
                'hand_delta': 0,
                'tiers': [
                    33, //USDT (Asset)
                    33,
                    33 
                ],
                'ban_trading_time': 30000//in mill
            }
        }
    })
});

let k = [
    'binance_futures.BTCUSDT:binance_futures.LTCUSDT'
]

// node main.js backtesting -m development -pr binance_futures.BTCBUSD:binance_futures.ETHBUSD  -d 2021-07-16 -c 0.02 0.03 -g 0.1 0.11 -tp 0.05 -p 3000 -l 1000
k.forEach((pair) => {
    c.symbols.push({
        'pair': pair,
        'backtesting': {
            'limit': 2000,
            'period': 3000,
            'correction': [0.02, 0.2],
            'get_position': [0.1, 0.8],
            'take_profit': 0.055,
            'exchange_commission': 0.08
        },
        'strategy': {
            'name': 'mean_reversion',
            'options': {
                'lead': splt(pair, 'lead'),
                'driven': splt(pair, 'driven'),
                'correction_indicator_changes': 0.1, //% - значения отклонения новой разницы процентов от старой
                'exchange_commission': 0.04,
                'get_position_change_tier_1': 0.19, //%
                'get_position_change_tier_2': 0.6, //%
                'get_position_change_tier_3': 0.8, //%
                'stop_lose_position_change': 1.2, //%
                'take_profit_position_change': 0.05, //%
                'hand_delta': 0,
                'tiers': [
                    33, //USDT (Asset)
                    33,
                    33 
                ],
                'ban_trading_time': 30000//in mill
            }
        }
    })
});

let m = [
    'binance_futures.BTCBUSD:binance_futures.ETHBUSD'
]

// node main.js backtesting -m development -pr binance_futures.BTCBUSD:binance_futures.ETHBUSD  -d 2021-07-16 -c 0.02 0.03 -g 0.1 0.11 -tp 0.05 -p 3000 -l 1000
m.forEach((pair) => {
    c.symbols.push({
        'pair': pair,
        'backtesting': {
            'limit': 2000,
            'period': 3000,
            'correction': [0.02, 0.2],
            'get_position': [0.1, 0.8],
            'take_profit': 0.055,
            'exchange_commission': 0.08
        },
        'strategy': {
            'name': 'mean_reversion',
            'options': {
                'lead': splt(pair, 'lead'),
                'driven': splt(pair, 'driven'),
                'correction_indicator_changes': 0.1, //% - значения отклонения новой разницы процентов от старой
                'exchange_commission': 0.04,
                'get_position_change_tier_1': 0.19, //%
                'get_position_change_tier_2': 0.6, //%
                'get_position_change_tier_3': 0.8, //%
                'stop_lose_position_change': 1.2, //%
                'take_profit_position_change': 0.05, //%
                'hand_delta': 0,
                'tiers': [
                    33, //USDT (Asset)
                    33,
                    33 
                ],
                'ban_trading_time': 30000//in mill
            }
        }
    })
});