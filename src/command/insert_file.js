const services = require('../modules/services');

module.exports = class InsertFileCommand {
    constructor() {}

    execute(options) {
        services.getInsertFileService().insertOneFile(options);
    }
};
