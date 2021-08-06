const program = require('commander');

const ServerCommand = require('./src/command/server');
const InsertFileCommand = require('./src/command/insert_file');
const BacktestingCommand = require('./src/command/backtesting');
const Faucet = require('./src/modules/faucet');

// init
const services = require('./src/modules/services');

program
    .command('faucet')
    .description('run faucet module')
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
    .option('-m, --mode <mode>', 'development or production', 'development')
    .action(async options => {

        await services.boot(__dirname, options);
        const cmd = new InsertFileCommand(options);
        cmd.execute(options, function() {
            process.exit(0);
        });
    });

program
    .command('backtesting')
    .description('process testing strategy saved data and params')
    .option('-m, --mode <mode>', 'development or production', 'development')
    .option('-pr, --pairs <pairs>')
    .option('-d, --date <date>')
    .option('-c, --correction [correction...]')
    .option('-g, --gposition [gposition...]')
    .option('-tp, --tprofit <tprofit>')
    .option('-p, --period <period>', '', '3000')
    .option('-l, --limit <limit>', '', '1000')
    .action(async options => {
        
        if (!options.pairs || !options.date || !options.correction || !options.gposition || !options.tprofit) {
            throw new Error('Not all options are given');
        }
        
        await services.boot(__dirname, options);

        const cmd = new BacktestingCommand();
        cmd.execute(options);
    });

program.parse(process.argv);