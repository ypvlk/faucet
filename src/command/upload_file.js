const services = require('../modules/services');

module.exports = class UploadFileCommand {
    constructor() {}

    execute(options, cb) {
        services.getUploadFileService().uploadOneFileFromServer(options, cb);
    }
};
