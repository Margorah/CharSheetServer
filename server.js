require('./config/enviornment');

const express = require('express');
const bodyParser = require('body-parser');

var server = express();

server.use(bodyParser.json());

server.use((req, res, next) => {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS, PUT, PATCH, DELETE');
    res.setHeader('Access-Control-Allow-Headers', 'X-Requested-With,content-type');
    res.setHeader('Access-Control-Allow-Credentials', true);

    next();
});

dbCallSimple = (dbMethod, errCode, reqObj, resObj) => {
    dbMethod(reqObj, (error, success) => {
        if (error) {
            resObj.status(errCode).send(error);
        }
        resObj.send(success);
    });
};

// User
server.get('/Users/:email/Pass/:pass', (req, res) => {
    dbCallSimple(db.user.get, 404, req, res);
});

server.post('/Users', (req, res) => {
    dbCallSimple(db.user.post, 404, req, res);
});

server.patch('/Users/:uid/Password', (req, res) => {
    dbCallSimple(db.user.patchUserPass, 404, req, res);
});

server.delete('/Users/:uid/', (req, res) => {
    dbCallSimple(db.user.deleteById, 400, req, res);
});

// Character
server.get('/Users/:uid/Characters', (req, res) => {
    dbCallSimple(db.character.getAll, 404, req, res);
});

server.post('/Users/:uid/Characters', (req, res) => {
    dbCallSimple(db.character.postNewChar, 404, req, res);
});

server.patch('/Users/:uid/Characters/:cid', (req, res) => {
    dbCallSimple(db.character.patchCharName, 404, req, res);
});

server.delete('/Users/:uid/Characters/:cid', (req, res) => {
    dbCallSimple(db.character.deleteCharById, 404, req, res);
});

// Rename a Character??

// Character - Stats
server.get('/Users/:uid/Characters/:cid', (req, res) => {
    dbCallSimple(db.character.getById, 404, req, res);
});

server.post('/Users/:uid/Characters/:cid/Stats', (req, res) => {
    dbCallSimple(db.character.postNewStat, 404, req, res);
});

server.patch('/Users/:uid/Characters/:cid/Stats/:name', (req, res) => {
    dbCallSimple(db.character.patchStatByName, 404, req, res);
});

server.delete('/Users/:uid/Characters/:cid/Stats/:name', (req, res) => {
    dbCallSimple(db.character.deleteStatByName, 404, req, res);
});

// Hey! Listen!
server.listen(process.env.PORT, process.env.HOSTNAME, () => {
    console.log(`Listening on ${process.env.HOSTNAME}:${process.env.PORT}`);
});