const Queue = require('queue-promise');

module.exports = class {
    constructor() {
        this.queue_tasks = {};
        this.queue2_tasks = {};

        this.queue = new Queue({
            concurrent: 1,
            interval: 1000 * 60, // every minutes;
            start: true
        })
        .on('resolve', key => {
            if (key in this.queue_tasks) delete this.queue_tasks[key];
        })
        .on('reject', key => {
            if (key in this.queue_tasks) delete this.queue_tasks[key];
        })
        // .on("start", () => console.log('start'))
        // .on("dequeue", () => console.log('dequeue'))
        // .on("end", () => console.log('end'));
        
        this.queue2 = new Queue({
            concurrent: 1,
            interval: 1000 * 60,
            start: true
        })
        .on('resolve', key => {
            if (key in this.queue2_tasks) delete this.queue2_tasks[key];
        })
        .on('reject', key => {
            if (key in this.queue2_tasks) delete this.queue2_tasks[key];
        })

        // this.queue3 = new Queue({
        //     concurrent: 2,
        //     interval: 1180,
        //     start: true
        // });
    }

    addQueue(key, promise) {
        if (!key || key in this.queue_tasks) return;
        this.queue_tasks[key] = key;

        return this.queue.add(promise);
    }

    addQueue2(key, promise) {
        if (!key || key in this.queue2_tasks) return;
        this.queue2_tasks[key] = key;

        return this.queue2.add(promise);
    }

    getQueueTasks() {
        return this.queue_tasks;
    }

    getQueue2Tasks() {
        return this.queue2_tasks;
    }

    // addQueue3(promise) {
    //     return this.queue3.enqueue(promise);
    // }
};
