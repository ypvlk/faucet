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

    insertOneFile(options = {}, cb) {
        const { path } = options;
        
        try {
            fs.accessSync(path, fs.constants.F_OK);
        } catch (err) {
            this.logger.error(`Insert file error: ${err}`);
            return undefined;
        }

        let data = [];
        const count = 500; 

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
                
                //TODO
                //Сейчас последние строки меньше 1000 не вставляет в базу
                //Это нужно будет потом исправить, пока малое значения count будет решать
                if (data && data.length > count) {
                    try {
                        stream.pause();
                        await this.tickersRepository.insert(data);
                    } catch (err) {
                        this.logger.error(`Stream pause or insert into db error: ${String(err)}`);
                    } finally {
                        data = [];
                        stream.resume();
                    }
                }
            })
            .on('end',function() {
                fs.unlink(path, function() {
                    console.log('File was deleted.');
                    if (cb && typeof cb === 'function') {
                        cb();
                    }
                });
            });
    }
}