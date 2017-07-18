const mongoose = require('mongoose');
// const ObjectID = require('mongodb');

const User = require('./models/user');
const Character = require('./models/character');

mongoose.Promise = require('bluebird');
var connectPromse = mongoose.connect(process.env.MONGODB_URI, {
    useMongoClient: true
});

module.exports = db = {
    user: {
        get: (req, callback) => {
            User.findOne({ email: req.params.email.toLowerCase(), password: req.params.pass })
                .lean()
                .select('_id name')
                .then((userDoc) => {
                    callback(undefined, userDoc);
                }).catch(e => callback(e));
        },
        post: (req, callback) => {
            var user = new User({
                name: req.body.name,
                email: req.body.email,
                password: req.body.password,
                characters: []
            });
            user.save().then((doc) => {
                callback(undefined, { id: doc._id, name: doc.name, email: doc.email });
            }).catch(e => callback(e));
        },
        patchUserPass: (req, callback) => {
            console.log('Not Implemented!');
        },
        deleteById: (req, callback) => {
            console.log('Not Implemented!');
        }
    },
    character: {
        getAll: (req, callback) => {
            User.findById(req.params.uid)
                .lean()
                .populate('characters', '_id name')
                .then((docs) => {
                    // if (docs.characters.length < 1) {
                    //     docs.characters = 'None'
                    // }
                    callback(undefined, docs.characters);
                }).catch(e => callback(e));
        },
        postNewChar: (req, callback) => {
            User.findById(req.params.uid)
                .then((userDoc) => {
                    var char = new Character({
                        name: req.body.name,
                        stats: []
                    });
                    char.save().then((charDoc) => {
                        userDoc.update({ $push: { characters: charDoc._id } })
                            .then(() => {
                                callback(undefined, charDoc._id);
                            }).catch(e => callback(e));
                    }).catch(e => callback(e));
                }).catch(e => callback(e));
        },
        patchCharName: (req, callback) => {
            Character.findByIdAndUpdate(req.params.cid, { $set: { name: req.body.name } }, { safe: true, new: true, runValidators: true })
                .then((doc) => {
                    callback(doc.name);
                }).catch(e => callback(e));
        },
        deleteCharById: (req, callback) => {
            User.findById(req.params.uid)
                .then((userDoc) => {
                    Character.findByIdAndRemove(req.params.cid)
                        .then(() => {
                            userDoc.update({ $pull: { characters: req.params.cid } })
                                .then(() => {
                                    callback(undefined, 'Complete!');
                                }).catch(e => callback(e));
                        }).catch(e => callback(e));
                }).catch(e => callback(e));
        },
        getById: (req, callback) => {
            Character.findById(req.params.cid)
                .lean()
                .select('_id name stats')
                .then((doc) => {
                    callback(undefined, doc);
                }).catch(e => callback(e));
        },
        postNewStat: (req, callback) => {
            statObj = {
                name: req.body.name,
                value: req.body.value,
                maxValue: req.body.maximum,
                statType: req.body.type
            }
            Character.findByIdAndUpdate(req.params.cid, { $push: { stats: statObj } }, { safe: true, new: true, runValidators: true })
                .then((doc) => {
                    callback(undefined, doc.stats);
                }).catch(e => callback(e));
        },
        patchStatByName: (req, callback) => {
            statObj = {
                name: req.body.name,
                value: req.body.value,
                maxValue: req.body.maximum,
                statType: req.body.type
            }
            Character.findOneAndUpdate({ _id: req.params.cid, 'stats.name': req.params.name }, { $set: { "stats.$": statObj } }, { safe: true, new: true, runValidators: true })
                .then((doc) => {
                    callback(undefined, req.body);
                }).catch(e => callback(e));
        },
        deleteStatByName: (req, callback) => {
            Character.findByIdAndUpdate(req.params.cid, { $pull: { stats: { name: req.params.name } } }, { safe: true, new: true })
                .then((doc) => {
                    callback(undefined, doc.stats);
                }).catch(e => callback(e));
        }
    }
};