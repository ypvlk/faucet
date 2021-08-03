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
        const { path } = options;
        
        try {
            fs.accessSync(path, fs.constants.F_OK);
        } catch (err) {
            this.logger.error(`Insert file error: ${err}`);
            return undefined;
        }

        let data = [];
        const count = 9;

        fs.createReadStream(path)
            .pipe(csvParse({delimiter: ',', from_line: 2}))
            .on('data', async row => {
                if (data && data.length === count) {
                    await this.tickersRepository.insert(data);
                    data = [];
                }

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
            })
            .on('end',function() {
                fs.unlink(path, function() {
                    console.log('File was deleted.');
                })
            });
    }
}