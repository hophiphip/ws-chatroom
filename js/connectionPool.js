class ConnectionPool {
    constructor() {
        this.pool = {};
    }

    onConnect(id) {
        this.pool[id] = {
            name: "None",
        };
    }

    onDisconnect(id) {
        if (this.pool[id] != undefined) {
            delete this.pool[id];
        }
    }
}

module.exports = ConnectionPool;