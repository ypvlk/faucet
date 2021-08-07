


module.exports = class UploadFileCron {
    constructor(
        systemUtil,
        logger,
        projectDir
    ) {
        this.systemUtil = systemUtil;
        this.logger = logger;
        this.projectDir = projectDir;
    }

    async start() {
        const me = this;

        const hosts = me.systemUtil.getConfig('skinrobots.hosts');
        console.log('hosts', hosts);
    }
};
