const fs = require('fs');
const csvParse = require('csv-parse');

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
        return new Promise(async (resolve, reject) => {
            const { path, pack_count } = options;
            
            try {
                fs.accessSync(path, fs.constants.F_OK);
            } catch (err) {
                this.logger.error(`File find file error: ${String(err)}`);
                reject(`File find file error: ${String(err)}`);
            }

            const me = this;
            let data = [];
            
            const stream = fs.createReadStream(path)
                .pipe(csvParse({delimiter: ',', from_line: 2}))
                .on('data', async row => {
                    data.push({
                        id: row[0],
                        exchange: row[1],
                        symbol: row[2],
                        bidPrice: row[3],
                        bidSize: row[4],
                        askPrice: row[5],
                        askSize: row[6],
                        period: row[7],
                        close: row[8],
                        income_at: row[9]
                    });       
                    
                    if (data && data.length > pack_count) {
                        try {
                            stream.pause();
                            await me.tickersRepository.insert(data);
                        } catch (err) {
                            me.logger.error(`Stream pause or insert into db error: ${String(err)}`);
                            reject(`Stream pause or insert into db error: ${String(err)}`);
                        } finally {
                            data = [];
                            stream.resume();
                        }
                    }
                })
                .on('end', function() {
                    me.logger.info(`Попали в удаления файла: ${path}`); //TODO delete
                    fs.unlink(path, function() {
                        me.logger.info(`File: ${path} was deleted.`);
                        console.log(`File: ${path} was deleted.`);
                        resolve();
                    });
                });
            });
    }
}