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
                method: 'GET',
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
                reject(err)
            });
        });
    }

    executePOSTRequest(uri, method, options = {}, body, headers) {
        return new Promise((resolve, reject) => {

            if (!uri || !method) throw new Error(`Url and method are allowed`);

            let url = uri;

            if (Object.keys(options).length > 0) {
                const query = querystring.stringify(options);
                url = `${url}?${query}`;
            }

            f(url, {
                method: method ? method : 'POST',
                body:   body ? JSON.stringify(body) : JSON.stringify({}),
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
                reject(err)
            });
        })
    }

    executeUploadRequest(uri, method, options = {}, body, headers) {
        return new Promise(resolve => {
            if (!uri) throw new Error(`Uri is allowed`);
            let url = uri;

            if (Object.keys(options).length > 0) {
                const query = querystring.stringify(options);
                url = `${url}?${query}`;
            }

            f(url, {
                method: method ? method : 'GET',
                body:   body ? JSON.stringify(body) : JSON.stringify({}),
                headers: headers ? headers : { 'Content-Type': 'application/json' },
            })
            .then(res => {
                if (!res.ok) throw new Error(`${JSON.stringify(res.statusText)}`);
                resolve(res);
            })
            .catch(err => {
                this.logger.error(`Request execute error: ${String(err)}`);
                resolve()
            });
        })
    }
}