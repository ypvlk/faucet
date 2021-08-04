const services = require('../modules/services');

module.exports = class InsertFileCommand {
    constructor() {}

    execute(options, cb) {
        services.getInsertFileService().insertOneFile(options, cb);
    }
};
