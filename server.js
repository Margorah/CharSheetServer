// jshint esversion: 6
const express = require('express');
const bodyParser = require('body-parser');

const CONFIG = require('./config/enviornment');

const authenticate = require(CONFIG.DATABASE.AUTH);

var server = express();

server.use(bodyParser.json());

server.use((req, res, next) => {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS, PUT, PATCH, DELETE');
    res.setHeader('Access-Control-Allow-Headers', 'X-Requested-With, Content-type, x-auth');
    res.setHeader('Access-Control-Expose-Headers', 'x-auth');
    res.setHeader('Access-Control-Allow-Credentials', true);

    next();
});

dbCallSimple = (dbMethod, errCode, reqObj, resObj) => {
    dbMethod(reqObj, (error, success, token) => {
        if (error) {
            resObj.status(errCode).send(error);
        }
        if (token) {
            resObj.header('x-auth', token).send(success);
        } else {
            resObj.send(success);
        }
    });
};

// User
server.post('/Users', (req, res) => {
    dbCallSimple(db.user.post, 400, req, res);
});

server.get('/Users/Me', authenticate, (req, res) => {
    dbCallSimple(db.user.auth, 401, req, res);
});

server.post('/Users/Me', (req, res) => {
    dbCallSimple(db.user.login, 401, req, res);
});

server.delete('/Users/Me', authenticate, (req, res) => {
    dbCallSimple(db.user.logout, 401, req, res);
});

server.patch('/Users/Password', authenticate, (req, res) => {
    dbCallSimple(db.user.patchUserPass, 401, req, res);
});

server.delete('/Users/', authenticate, (req, res) => {
    dbCallSimple(db.user.deleteById, 400, req, res);
});

server.post('/Users/Email', (req, res) => {
    dbCallSimple(db.user.checkEmailAvail, 400, req, res);
});

// Character
server.get('/Users/Characters', authenticate, (req, res) => {
    dbCallSimple(db.character.getAll, 404, req, res);
});

server.post('/Users/Characters', authenticate, (req, res) => {
    dbCallSimple(db.character.postNewChar, 404, req, res);
});

server.delete('/Users/Characters', authenticate, (req, res) => {
    dbCallSimple(db.character.deleteCharById, 404, req, res);
});

server.patch('/Users/Characters/Name', authenticate, (req, res) => {
    dbCallSimple(db.character.patchCharName, 404, req, res);
});

server.get('/Users/Characters/:timestamp', authenticate, (req, res) => {
    dbCallSimple(db.character.getMetaChanged, 404, req, res);
});

server.patch('/Users/Characters', authenticate, (req, res) => {
    dbCallSimple(db.character.patchMetaChanges, 404, req, res);
});

// Character - Stats
server.get('/Users/Characters/:id/Stats', authenticate, (req, res) => {
    dbCallSimple(db.stat.getById, 404, req, res);
});

server.get('/Users/Characters/:cid/Stats/:timestamp', authenticate, (req, res) => {
    dbCallSimple(db.stat.getStatChanged, 404, req, res);
});

// Where to put?

server.get('/Users/Characters/Stats/:timestamp', authenticate, (req, res) => {
    dbCallSimple(db.stat.getChanged, 404, req, res);
});

server.post('/Users/Characters/Stats', authenticate, (req, res) => {
    dbCallSimple(db.stat.postNewStat, 404, req, res);
});

server.patch('/Users/Characters/Stats', authenticate, (req, res) => {
    dbCallSimple(db.stat.patchStatById, 404, req, res);
});

server.patch('/Users/Characters/Stats/id', authenticate, (req, res) => {
    dbCallSimple(db.stat.patchMultipleById, 404, req, res);
});

server.delete('/Users/Characters/:cid/Stats/:sid', authenticate, (req, res) => {
    dbCallSimple(db.stat.deleteStatById, 404, req, res);
});

// Hey! Listen!
server.listen(CONFIG.HOST.PORT, CONFIG.HOST.NAME, () => {
    console.log(`Listening on ${CONFIG.HOST.NAME}:${CONFIG.HOST.PORT}`);
});

// Trying to find what is throwing that error
process.on('unhandledRejection', r => console.log(r));