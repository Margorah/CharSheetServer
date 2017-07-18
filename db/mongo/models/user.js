const mg = require('mongoose');

const Character = require('./character');

var UserSchema = new mg.Schema({
    name: {
        type: String,
        require: true,
        trim: true,
        minlength: 2
    },
    email: {
        type: String,
        required: true,
        minlength: 2,
        trim: true
    },
    password: {
        type: String,
        required: true,
        minlength: 2
    },
    characters: [{
        type: mg.Schema.Types.ObjectId,
        ref: 'Character'
    }]
});

var User = mg.model('User', UserSchema);
module.exports = User;