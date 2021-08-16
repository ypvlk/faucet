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

    uploadOneFileFromServer(options = {}) {
        return new Promise(async (resolve, reject) => {
            const { 
                path,
                url,
                headers,
                queries
            } = options;
    
            if (!url || !path) {
                this.logger.error(`Upload file empty params, url: ${url}, path: ${path}`);
                return reject(`Upload file empty params, url: ${url}, path: ${path}`);
            }

            const username = this.systemUtil.getConfig('webserver.username');
            const password = this.systemUtil.getConfig('webserver.password');

            const new_headers = { //TODO убрать отсюда headers
                'Authorization': 'Basic ' + Buffer.from(username + ':' + password).toString('base64'),
            }

            const me = this;

            try {
                fs.accessSync(path, fs.constants.F_OK);
            } catch (err) {
                const data = await me.requestClient.executeUploadRequest(url, null, queries, null, {...new_headers, ...headers});
                if (!data) {
                    me.logger.error(`File from: ${url} uploads fail. Data is: ${data}`);
                    return reject(`File from: ${url} uploads fail. Data is: ${data}`);
                }
                
                const fileStream = fs.createWriteStream(path);
                
                await new Promise((resolve, reject) => {
                    data.body.pipe(fileStream);
                    data.body.on('error', reject);
                    fileStream.on('finish', resolve);
                });
    
                me.logger.info(`File from: ${url} uploads success`);
                console.log(`File from: ${url} uploads success`);
    
                return resolve();
            }
            
            console.log(`File: ${path} already maked.`);
    
            return resolve();
        });
    }
}