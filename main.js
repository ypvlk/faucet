const program = require('commander');

const ServerCommand = require('./src/command/server');
const InsertFileCommand = require('./src/command/insert_file');

// init
const services = require('./src/modules/services');

program
    .command('server')
    .description('run http server')
    .option('-m, --mode <mode>')
    .action(async options => {

        if (options && !options.mode) {
            throw new Error(`Option mode is allowed`);
        }

        await services.boot(__dirname, options);
        const cmd = new ServerCommand();
        cmd.execute(options);
    });

program
    .command('insert-file')
    .description('insert data from file into db')
    .option('-p, --path <path>')
    .option('-m, --mode <mode>', 'development')
    .action(async options => {

        await services.boot(__dirname, options);
        const cmd = new InsertFileCommand(options);
        cmd.execute(options);
    });

program.parse(process.argv);