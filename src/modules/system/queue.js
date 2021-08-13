const Queue = require('queue-promise');

module.exports = class {
    constructor() {
        this.tasks = {};

        this.queue = new Queue({
            concurrent: 1,
            interval: 1000 * 60, // every minutes;
            start: true
        })
        .on('resolve', key => {
            if (key in this.tasks) delete this.tasks[key];
        })
        .on('reject', key => {
            if (key in this.tasks) delete this.tasks[key];
        })
        // .on("start", () => console.log('start'))
        // .on("dequeue", () => console.log('dequeue'))
        // .on("end", () => console.log('end'));
        

        // this.queue2 = new Queue({
        //     concurrent: 2,
        //     interval: 6000,
        //     start: false
        // });

        // this.queue3 = new Queue({
        //     concurrent: 2,
        //     interval: 1180,
        //     start: true
        // });
    }

    addQueue(key, promise) {
        if (!key || key in this.tasks) return;
        this.tasks[key] = key;

        return this.queue.add(promise);
    }

    // addQueue2(promise) {
    //     return this.queue2.enqueue(promise);
    // }

    // addQueue3(promise) {
    //     return this.queue3.enqueue(promise);
    // }
};
