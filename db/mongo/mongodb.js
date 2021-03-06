// jshint esversion: 6
const mongoose = require('mongoose');

const User = require('./models/user');
const Character = require('./models/character');
const CONFIG = require('../../config/enviornment');

const BULK = require('./methods/bulk');
const CHANGETYPES = require('./models/changeTypes');

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
        },
        checkEmailAvail: (req, callback) => {
            User.find({ email: req.body.email }).then((users) => {
                let response = true;
                if (users.length > 0) {
                    response = false;
                }
                callback(undefined, response);
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
                _id: req.body.id,
                name: req.body.name,
                owner: req.user._id,
                updated: req.body.updated,
                stats: []
            });
            char.save().then(() => {
                // req.user.update({ $push: { characters: charDoc._id } })
                // .then(() => {
                callback(undefined, true);
                // }).catch(e => callback(e));
            }).catch(e => callback(e));
        },
        patchCharName: (req, callback) => {
            Character.findOneAndUpdate({ _id: req.body.id, owner: req.user._id }, { $set: { name: req.body.name, metaUpdated: req.body.updated } }, { safe: true, new: true, runValidators: true })
                .then((doc) => {
                    callback(undefined, doc.name);
                }).catch(e => callback(e));
        },
        deleteCharById: (req, callback) => {
            Character.findOneAndRemove({ _id: req.body.id, owner: req.user._id })
                .then(() => {
                    callback(undefined, 'Ok');
                }).catch(e => callback(e));
        },
        getMetaChanged: (req, callback) => {
            let timestamp = Number(req.params.timestamp);
            Character.find({ owner: req.user._id, metaUpdated: { $gt: timestamp } })
                .lean()
                .select('_id name updated')
                .then((docs) => {
                    if (docs.length > 0) {
                        callback(undefined, docs);
                    } else {
                        callback(undefined, 'None');
                    }
                }).catch(e => callback(e));
        },
        patchMetaChanges: (req, callback) => {
            let bulk = BULK.buildChars(req.body, req.user._id);
            try {
                Character.bulkWrite(bulk, { ordered: true });
            } catch (e) {
                return callback(e);
            }
            return callback(undefined, bulk);
        }
    },
    stat: {
        getStatChanged: (req, callback) => {
            let timestamp = Number(req.params.timestamp);
            Character.aggregate([
                    { $match: { owner: req.user._id, _id: req.params.cid, "stats.updated": { $gt: timestamp } } },
                    { $project: { _id: 1, stats: { $filter: { input: '$stats', as: 'stat', cond: { $gt: ['$$stat.updated', timestamp] } } } } }
                ])
                .then((docs) => {
                    if (docs.length > 0) {
                        callback(undefined, docs);
                    } else {
                        callback(undefined, 'None');
                    }
                }).catch(e => callback(e));
        },
        getChanged: (req, callback) => {
            let timestamp = Number(req.params.timestamp);
            Character.aggregate([
                    { $match: { owner: req.user._id, $or: [{ "stats.updated": { $gt: timestamp } }, { metaUpdated: { $gt: timestamp } }] } },
                    {
                        $project: {
                            _id: 1,
                            // name: { $cond: [{ $gt: ['$metaUpdated', timestamp] }, 0, '$name'] },
                            meta: { $cond: { if: { $gt: ['$metaUpdated', timestamp] }, then: { 'name': '$name', 'metaUpdated': '$metaUpdated' }, else: 0 } },
                            stats: { $filter: { input: '$stats', as: 'stat', cond: { $gt: ['$$stat.updated', timestamp] } } }
                        }
                    }
                ])
                .then((docs) => {
                    if (docs.length > 0) {
                        callback(undefined, docs);
                    } else {
                        callback(undefined, 'None');
                    }
                }).catch(e => callback(e));
        },
        getById: (req, callback) => {
            Character.findOne({ _id: req.params.id, owner: req.user._id })
                .lean()
                .select('stats')
                .then((doc) => {
                    let toReturn = doc.stats.map((stat) => {
                        return {
                            id: stat._id,
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
            var statObj = {
                _id: req.body.id,
                name: req.body.name,
                value: req.body.value,
                maxValue: req.body.maximum,
                statType: req.body.type
            };
            if (req.body.updated) {
                statObj[updated] = req.body.updated;
            }
            Character.findOneAndUpdate({ _id: req.body.cid, owner: req.user._id }, { $push: { stats: statObj } }, { safe: true, new: true, runValidators: true })
                .then((doc) => {
                    callback(undefined, { name: req.body.name, value: req.body.value, maximum: req.body.maximum, type: req.body.type });
                }).catch(e => callback(e));
        },
        patchStatById: (req, callback) => {
            statObj = {
                _id: req.body.id,
                name: req.body.name,
                value: req.body.value,
                maxValue: req.body.maximum,
                statType: req.body.type
            }
            Character.findOneAndUpdate({ _id: req.body.cid, owner: req.user._id, 'stats._id': req.body.id }, { $set: { "stats.$": statObj, updated: req.body.updated } }, { safe: true, runValidators: true })
                .then((doc) => {
                    callback(undefined, req.body);
                }).catch(e => callback(e));
        },
        patchMultipleById: (req, callback) => {
            let bulk = BULK.buildUpdateWithStats(req.body, req.user._id, req.body.cid);
            try {
                Character.bulkWrite(bulk, { ordered: true });
            } catch (e) {
                return callback(e);
            }
            return callback(undefined, bulk);
        },
        deleteStatById: (req, callback) => {
            Character.findOneAndUpdate({ _id: req.params.cid, owner: req.user._id }, { $pull: { stats: { _id: req.params.sid } } }, { safe: true, new: true })
                .then((doc) => {
                    callback(undefined, true);
                }).catch(e => callback(e));
        }
    }
};