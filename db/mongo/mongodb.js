const mongoose = require('mongoose');
// const ObjectID = require('mongodb');

const User = require('./models/user');
const Character = require('./models/character');
const CONFIG = require('../../config/enviornment');

mongoose.Promise = require('bluebird');
var connectPromse = mongoose.connect(CONFIG.DATABASE.MONGODB_URI, {
    useMongoClient: true
});

module.exports = db = {
    user: {
        post: (req, callback) => {
            var user = new User({
                name: req.body.name,
                email: req.body.email.toLowerCase(),
                password: req.body.password,
                characters: []
            });
            user.save().then(() => {
                return user.generateAuthToken();
            }).then((token) => {
                callback(undefined, { id: user._id, name: user.name, email: user.email }, token);
            }).catch(e => callback(e));
        },
        auth: (req, callback) => {
            callback(undefined, { id: req.user.id });
        },
        login: (req, callback) => {
            User.findByCredentials(req.body.email.toLowerCase(), req.body.password)
                .then((user) => {
                    return user.generateAuthToken().then((token) => {
                        callback(undefined, { id: user._id, name: user.name, email: user.email }, token);
                    });
                }).catch(e => callback(e));
        },
        logout: (req, callback) => {
            req.user.removeToken(req.token).then(() => {
                callback(undefined, "OK");
            }).catch(e => callback(e));
        },
        patchUserPass: (req, callback) => {
            // console.log('Not Implemented!');
            req.user.changePassword(req.body.old, req.body.new)
                .then((newDoc) => {
                    newDoc.save().then(() => {
                        callback(undefined, 'Password Changed');
                    }).catch(e => callback(e));
                }).catch(e => callback(e));
        },
        deleteById: (req, callback) => {
            // console.log('Not Implemented!');
            req.user.remove().then(() => {
                callback(undefined, 'User Removed');
            }).catch(e => callback(e));
        }
    },
    character: {
        getAll: (req, callback) => {
            Character.find({ owner: req.user._id })
                .lean()
                .select('_id, name')
                .then((charDocs) => {
                    callback(undefined, charDocs);
                }).catch(e => callback(e));
        },
        postNewChar: (req, callback) => {
            var char = new Character({
                name: req.body.name,
                owner: req.user._id,
                stats: []
            });
            char.save().then((charDoc) => {
                req.user.update({ $push: { characters: charDoc._id } })
                    .then(() => {
                        callback(undefined, charDoc._id);
                    }).catch(e => callback(e));
            }).catch(e => callback(e));
        },
        patchCharName: (req, callback) => {
            Character.findOneAndUpdate({ _id: req.body.id, owner: req.user._id }, { $set: { name: req.body.name } }, { safe: true, new: true, runValidators: true })
                .then((doc) => {
                    callback(doc.name);
                }).catch(e => callback(e));
        },
        deleteCharById: (req, callback) => {
            Character.findOneAndRemove({ _id: req.body.id, owner: req.user._id })
                .then(() => {
                    callback(undefined, 'Ok');
                }).catch(e => callback(e));
        },
        getById: (req, callback) => {
            Character.findOne({ _id: req.params.id, owner: req.user._id })
                .lean()
                .select('stats')
                .then((doc) => {
                    let toReturn = doc.stats.map((stat) => {
                        return {
                            name: stat.name,
                            value: stat.value,
                            maximum: stat.maxValue,
                            type: stat.statType
                        }
                    });
                    callback(undefined, toReturn);
                }).catch(e => callback(e));
        },
        postNewStat: (req, callback) => {
            statObj = {
                name: req.body.name,
                value: req.body.value,
                maxValue: req.body.maximum,
                statType: req.body.type
            }
            Character.findOneAndUpdate({ _id: req.body.id, owner: req.user._id }, { $push: { stats: statObj } }, { safe: true, new: true, runValidators: true })
                .then((doc) => {
                    callback(undefined, { name: req.body.name, value: req.body.value, maximum: req.body.maximum, type: req.body.type });
                }).catch(e => callback(e));
        },
        patchStatByName: (req, callback) => {
            statObj = {
                name: req.body.name,
                value: req.body.value,
                maxValue: req.body.maximum,
                statType: req.body.type
            }
            Character.findOneAndUpdate({ _id: req.body.id, owner: req.user._id, 'stats.name': req.body.name }, { $set: { "stats.$": statObj } }, { safe: true, runValidators: true })
                .then((doc) => {
                    callback(undefined, req.body);
                }).catch(e => callback(e));
        },
        deleteStatByName: (req, callback) => {
            Character.findOneAndUpdate({ _id: req.params.cid, owner: req.user._id }, { $pull: { stats: { name: req.params.name } } }, { safe: true, new: true })
                .then((doc) => {
                    callback(undefined, true);
                }).catch(e => callback(e));
        }
    }
};