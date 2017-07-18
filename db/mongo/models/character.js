const mg = require('mongoose');

var StatSchema = new mg.Schema({
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
    }
}, { _id: false });

var CharacterSchema = new mg.Schema({
    name: {
        type: String,
        required: true,
        minlength: 2
    },
    stats: [StatSchema]
});

var Character = mg.model('Character', CharacterSchema);
module.exports = Character;