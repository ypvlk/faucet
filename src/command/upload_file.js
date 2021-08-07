const services = require('../modules/services');

module.exports = class UploadFileCommand {
    constructor() {}

    async execute(options) {
        await services.getUploadFileService().uploadOneFileFromServer(options);
    }
};
