const express = require('express');
const app = express();
const http = require('http');
const server = http.createServer(app);
const { Server } = require("socket.io");
const io = new Server(server);
const path = require('path');

var rs = require('jsrsasign');
var rsu = require('jsrsasign-util');

const PORT = process.env.PORT || 3000;

const MessagePool = require('./js/messagePool');
const ConnectionPool = require('./js/connectionPool');
const ClientPool = require('./js/clientPool');
var messagePool = new MessagePool(10);
var connectionPool = new ConnectionPool();
var clientPool = new ClientPool();

app.use(express.static(path.join(__dirname, 'client')))
    .use(express.json());

app.get('/messages', (req, res) => {
    res.status(200).send(messagePool.pool);
});

app.get('/connections', (req, res) => {
    res.status(200).send(Object.values(connectionPool));
});

app.get('/clients', (req, res) => {
    res.status(200).send(Object.values(clientPool));
});

app.get('/clients/:name', (req, res) => {
    const name = req.params.name;

    if (clientPool.getClient(name)) {
        res.status(200).send(clientPool[name]);
    } else {
        res.status(404).send({});
    }
});

app.post('/register', (req, res) => {
    const client = req.body.client;
    if (!client) {
        res.status(400).send({error: 'Incorrect parameters'});
    } else {
        if (client.name && client.color && client.curve && client.encoding && client.hashAlgorithm && client.ecpubhex) {
            if (clientPool.addClient(client)) {
                res.status(201).send({status: 'Client added'});
            } else {
                res.status(400).send({status: 'Person with same name exists'});
            }
        } else {
            res.status(400).send({status: 'Missing parameters'});
        }
    }
});

io.on('connection', (socket) => {  
    console.log(`client ${socket.id} connected`);

    connectionPool.onConnect(socket.id);

    socket.on('disconnect', () => {
        console.log(`client ${socket.id} disconnected`);

        connectionPool.onDisconnect(socket.id);
    });

    socket.on('message', (msg) => {
        var parsedMsg = "";
        try {
            parsedMsg = JSON.parse(msg)
        } catch(e) {
            console.log(`Got invalid message from ${socket.id}`);
            return;
        }

        const possibleClient = clientPool.getClient(parsedMsg.clientName);

        console.log(`socket ${socket.id} send ${msg}`);

        if (possibleClient) {
            console.log(possibleClient);

            const ec = new rs.KJUR.crypto.ECDSA({"curve": possibleClient.curve});
            const hash = rs.KJUR.crypto.Util.sha256(parsedMsg.text);

            if (ec.verifyHex(hash, parsedMsg.signedMessage, possibleClient.ecpubhex)) {
                console.log(`For socket ${socket.id} and client ${possibleClient.name} message validation succeeded`);

                const message = JSON.stringify({
                    id: socket.id,
                    username: possibleClient.name,
                    text: parsedMsg.text,
                    valid: true,
                });
    
                messagePool.addMessage(message);
    
                io.emit('message', message);
            } else {
                console.log(`For socket ${socket.id} and client ${possibleClient.name} message validation failed`);

                const message = JSON.stringify({
                    id: socket.id,
                    username: possibleClient.name,
                    text: parsedMsg.text,
                    valid: false,
                });
    
                io.emit('message', message);
            }
        } else {
            console.log('Client not found');
        }
    });
});

server.listen(PORT, () => {
  console.log(`listening on ${PORT}`);
});