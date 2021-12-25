class MessagePool {
    constructor(limit) {
        this.limit = limit;
        this.pool = new Array();
    }

    addMessage(message) {
        if (this.pool.length >= this.limit) {
            this.pool.shift();
        }

        this.pool.push(message);
    }
}

module.exports = MessagePool;