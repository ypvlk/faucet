const fs = require('fs');

describe('#validate pre deployment files', function() {

    test('test conf.json file is not valid', () => {
        const config = JSON.parse(fs.readFileSync(`${__dirname}/../conf.json`, 'utf8'));

        expect(config.webserver.ip).toBe('0.0.0.0');
        expect(typeof config.webserver.port).toBe('number');
    });
});