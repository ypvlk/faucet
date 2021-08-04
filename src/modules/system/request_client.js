const f = require('node-fetch');
const querystring = require('querystring');

module.exports = class RequestClient {
    constructor(logger) {
        this.logger = logger;
    }

    executeGETRequest(uri, options = {}, headers) {
        return new Promise(resolve => {
            if (!uri) throw new Error(`Uri is allowed`);
            let url = uri;

            if (Object.keys(options).length > 0) {
                const query = querystring.stringify(options);
                url = `${url}?${query}`;
            }

            f(url, {
                headers: headers ? headers : {'Content-Type': 'application/json'}
            })
            .then(res => {
                if (!res.ok) throw new Error(`${JSON.stringify(res.statusText)}`);
                return res.json();
            })
            .then(body => {
                resolve(body);
            })
            .catch(err => {
                this.logger.error(`Request execute error: ${String(err)}`);
                resolve()
            });
        });
    }

    executePOSTRequest(url, method, body, headers) {
        return new Promise(resolve => {

            if (!url || !method) throw new Error(`Url and method are allowed`);

            f(url, {
                method: method,
                body:    JSON.stringify(body),
                headers: headers ? headers : { 'Content-Type': 'application/json' },
            })
            .then(res => {
                if (!res.ok) throw new Error(`${JSON.stringify(res.statusText)}`);
                return res.json();
            })
            .then(body => {
                resolve(body);
            })
            .catch(err => {
                this.logger.error(`Request execute error: ${String(err)}`);
                resolve()
            });
        })
    }

    executeUploadStreamRequest(uri, method, readStream, fileSizeInBytes, options = {}, headers) {
        return new Promise(resolve => {
            if (!uri || !method) throw new Error(`Uri and method are allowed`);

            let url = uri;

            if (Object.keys(options).length > 0) {
                const query = querystring.stringify(options);
                url = `${url}?${query}`;
            }

            f(uri, {
                method: method,
                body:   readStream,
                headers: headers ? headers : {
                    "Content-length": fileSizeInBytes
                },
            })
            .then(res => {
                if (!res.ok) throw new Error(`${JSON.stringify(res.statusText)}`);
                return res.json();
            })
            .then(body => {
                resolve(body);
            })
            .catch(err => {
                this.logger.error(`Request execute error: ${String(err)}`);
                resolve()
            });
        })
    }
}