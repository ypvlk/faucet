const program = require('commander');

const ServerCommand = require('./src/command/server');

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

program.parse(process.argv);