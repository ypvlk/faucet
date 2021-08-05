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
        console.log('Saving data into file...');

        const csvParser = new Parser({ fields });
        const csv = csvParser.parse(data); //[это массив обьектов]

        fs.writeFileSync(`${path}.csv`, csv, function(err) {
            if (err) this.logger.error(`Write save into file sync error: ${String(err)}`);
        });

        console.log(`File ${path}.csv saved.`);
    }

    async downloadMeanReversionTable(leadExchange, leadSymbol, drivenExchange, drivenSymbol, limit) {
        const result = await this.meanReversionRepository.getData(leadExchange, leadSymbol, drivenExchange, drivenSymbol, limit);
        
        if (!result.length) return [];
        
        const fields = Object.keys(_.head(result));
        // [
        //     'id', 'lead_exchange', 'lead_symbol', 'lead_change', 'lead_price', 'lead_side', 'lead_tier', 'lead_amount', 'driven_exchange', 'driven_symbol', 'driven_change', 'driven_price', 'adj_driven_change', 'driven_side', 'driven_tier', 'driven_amount', 'delta', 'signal', 'income_at'
        // ];
        const csvParser = new Parser({ fields });
        return csvParser.parse(result);
    }
};