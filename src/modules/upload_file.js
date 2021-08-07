const fs = require('fs');

module.exports = class UploadFileService {
    constructor(
        systemUtil,
        logger,
        requestClient,
        projectDir
    ) {
        this.logger = logger;
        this.systemUtil = systemUtil;
        this.requestClient = requestClient;
        this.projectDir = projectDir;
    }

    uploadOneFileFromServer(options = {}, cb) {
        const { 
            path,
            url,
            headers,
            queries
        } = options;

        if (!url || !path || !cb || typeof cb !== 'function') {
            me.logger.error(`Upload file empty params`);
            cb();
        }

        const me = this;

        try {
            fs.accessSync(path, fs.constants.F_OK);
        } catch (err) {
            const data = await me.requestClient.executeUploadRequest(url, null, queries, null, headers);

            const fileStream = fs.createWriteStream(path);
            
            await new Promise((resolve, reject) => {
                data.body.pipe(fileStream);
                data.body.on('error', reject);
                fileStream.on('finish', resolve);
            });

            me.logger.info(`File from: ${url} uploads success`);
            console.log(`File from: ${url} uploads success`);

            cb();
        }

        me.logger.info(`File: ${path} already maked.`);
        console.log(`File: ${path} already maked.`);

        cb();
    }
}