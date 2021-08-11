const services = require('../modules/services');

module.exports = class InsertFileCommand {
    constructor() {}

    async execute(options) {
        await services.getInsertFileService().insertOneFile(options);
    }
};
