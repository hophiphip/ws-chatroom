class ClientPool {
    constructor() {
        this.pool = {};
    }

    getClient(name) {
        return this.pool[name];
    }

    addClient(client) {
        if (this.pool[client.name] == undefined) {
            this.pool[client.name] = client;
            return true;
        } else {
            return false;
        }
    }

    updateClientIdByName(name, newId) {
        if (this.pool[name] != undefined) {
            this.pool[client.name].id = newId;
        }
    }
}

module.exports = ClientPool;