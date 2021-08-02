const fs = require('fs');

describe('#validate pre deployment files', function() {

    test('test conf.json file is not valid', () => {
        const config = JSON.parse(fs.readFileSync(`${__dirname}/../config/conf.json`, 'utf8'));

        expect(config.webserver.ip).toBe('0.0.0.0');
        expect(typeof config.webserver.port).toBe('number');

        expect(typeof config.mysql_db.prod.port).toBe('number');
        expect(config.mysql_db.dev.host).toBe('localhost');
        expect(config.mysql_db.dev.user).toBe('root');
        expect(config.mysql_db.dev.debug).toBe(true);
        expect(config.mysql_db.prod.debug).toBe(false);
    });
});