const _ = require('lodash');
const moment = require('moment');
const fs = require('fs');
const { Parser, AsyncParser } = require('json2csv');

module.exports = class CsvExportHttp {
    constructor(
        meanReversionRepository,
        logger,
        projectDir
    ) {
        this.meanReversionRepository = meanReversionRepository;
        this.logger = logger;
        this.projectDir = projectDir;
    }

    saveSyncIntoFile(data, path, fields) {
        this.logger.debug(`Save sync into file start...`);
        console.log('Saving data into file...');

        if (data && data.length === 0) {
            this.logger.error(`File save fail: data is empty`);
            return;
        }

        if (fields && fields.length === 0) {
            this.logger.error(`File save fail: fields is empty`);
            return;
        }

        if (!path) {
            this.logger.error(`File save fail: path is not defined`);
            return;
        }

        const csvParser = new Parser({ fields });
        const csv = csvParser.parse(data); //[это массив обьектов]

        fs.writeFileSync(`${path}`, csv, function(err) {
            if (err) this.logger.error(`Write save into file sync error: ${String(err)}`);
        });

        this.logger.info(`File: ${path} saved.`);
        console.log(`File ${path} saved.`);
    }

    async downloadMeanReversionTable(leadExchange, leadSymbol, drivenExchange, drivenSymbol, limit) {
        const result = await this.meanReversionRepository.getData(leadExchange, leadSymbol, drivenExchange, drivenSymbol, limit);
        
        if (result && result.length) {
            const fields = Object.keys(_.head(result));
            // [
            //     'id', 'lead_exchange', 'lead_symbol', 'lead_change', 'lead_price', 'lead_side', 'lead_tier', 'lead_amount', 'driven_exchange', 'driven_symbol', 'driven_change', 'driven_price', 'adj_driven_change', 'driven_side', 'driven_tier', 'driven_amount', 'delta', 'signal', 'income_at'
            // ];
            const csvParser = new Parser({ fields });
            return csvParser.parse(result);
        }
    }

    
};