const program = require('commander');

const Faucet = require('./src/command/faucet');
const ServerCommand = require('./src/command/server');
const InsertFileCommand = require('./src/command/insert_file');
const BacktestingCommand = require('./src/command/backtesting');
const UploadFileCommand = require('./src/command/upload_file');

// init
const services = require('./src/modules/services');

program
    .command('faucet')
    .description('run faucet module. It\'s a main module')
    .option('-m, --mode <mode>', 'development or production', 'development')
    .action(async options => {
        
        await services.boot(__dirname, options);
        const cmd = new Faucet();
        cmd.execute(options);
    });

program
    .command('server')
    .description('run http server')
    .option('-m, --mode <mode>', 'development or production', 'development')
    .action(async options => {

        await services.boot(__dirname, options);
        const cmd = new ServerCommand();
        cmd.execute(options);
    });

program
    .command('insert-file')
    .description('insert data from file into db')
    .option('-p, --path <path>', 'path for file who need insert')
    .option('-c, --pack_count <pack_count>', 'count how much rows insert for one tick', '500')
    .option('-m, --mode <mode>', 'development or production', 'development')
    .action(async options => {

        await services.boot(__dirname, options);
        const cmd = new InsertFileCommand(options);
        await cmd.execute(options);

        process.exit(0);
    });

program
    .command('upload-file')
    .description('upload file from another server')
    .option('-p, --path <path>', 'path for file who need insert', 'var/tickers/command_test_tickers.csv')
    .option('-u, --url <url>', 'servers url', 'http://206.189.96.37:3000/tickers/download')
    .option('-q, --queries <queries>', 'query params')
    .option('-m, --mode <mode>', 'development or production', 'development')
    .action(async options => {

        await services.boot(__dirname, options);
        const cmd = new UploadFileCommand(options);
        await cmd.execute(options);

        process.exit(0);
    });

program
    .command('backtesting')
    .description('process testing strategy on saved data and params')
    .option('-d, --date <date>')
    .option('-ps, --pairs <pairs>')//должен соответствовать одному из элементов в массиве в instance
    .option('-c, --correction [correction...]')
    .option('-gp, --get_position [get_position...]')
    .option('-tp, --take_profit <take_profit>', 'change for take profit', '0.055')
    .option('-ec, --exchange_commission <exchange_commission>', 'commission for one position', '0.04')
    .option('-p, --period <period>', 'period for one tick saved in millsecond', '3000')
    .option('-l, --limit <limit>', 'limits for gets from db for one tick', '1000')
    .action(async options => {
        
        if (!options.date || !options.pairs || !options.correction || !options.get_position || !options.take_profit) {
            throw new Error('Not all options are given');
        }
        
        await services.boot(__dirname, options);

        const cmd = new BacktestingCommand();
        cmd.execute(options);
    });

program.parse(process.argv);