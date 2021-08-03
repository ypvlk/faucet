const fs = require('fs');

module.exports = class InsertFileService {
    constructor(
        systemUtil,
        logger,
        tickersRepository
    ) {
        this.logger = logger;
        this.systemUtil = systemUtil;
        this.tickersRepository = tickersRepository;
    }

    insertOneFile(options = {}) {
        const { path } = options;

        try {
            fs.accessSync(path, fs.constants.F_OK);
        } catch (err) {
            this.logger.error(`Insert file error: ${err}`);
            return undefined;
        }

        //Теперь я хочу читать по строчке (по 10 например) с csv 
        //и тупо эти же данные вставлять в базу
        //при чем я хочу это делать в цикле
        
    }
}