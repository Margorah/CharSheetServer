const mg = require('mongoose');
const User = require('./user');

var StatSchema = new mg.Schema({
    _id: {
        type: String,
        required: true,
        minlength: 7
    },
    name: {
        type: String,
        required: true,
        minlength: 2
    },
    value: {
        type: Number,
        required: true
    },
    maxValue: {
        type: Number,
        default: 0
    },
    statType: {
        type: String,
        required: true,
        minlength: 2,
        default: 'MDC'
    },
    updated: {
        type: Number,
        required: true,
        default: Date.now
    }
});

var CharacterSchema = new mg.Schema({
    _id: {
        type: String,
        required: true,
        minlength: 7
    },
    name: {
        type: String,
        required: true,
        minlength: 2
    },
    owner: {
        required: true,
        type: mg.Schema.Types.ObjectId,
        ref: 'User'
    },
    metaUpdated: {
        required: true,
        type: Number,
        default: Date.now
    },
    stats: [StatSchema]
});

var Character = mg.model('Character', CharacterSchema);
module.exports = Character;