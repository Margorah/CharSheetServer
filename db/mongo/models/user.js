const mg = require('mongoose');
const jwt = require('jsonwebtoken');
const bcj = require('bcryptjs');

const Character = require('./character');
const CONFIG = require('../../../config/enviornment');

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
        minlength: 6,
        trim: true,
        unique: true,
        lowercase: true
            // validate: {
            //     validator: (value) => {
            //         var regex = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
            //         return regex.test(value)
            //     },
            //     message: '{VALUE} is not a valid email'
            // }
    },
    password: {
        type: String,
        required: true,
        minlength: 6
    },
    tokens: [{
            access: {
                type: String,
                required: true
            },
            token: {
                type: String,
                required: true
            },
            _id: false
        }]
        // characters: [{
        //     type: mg.Schema.Types.ObjectId,
        //     ref: 'Character'
        // }]
});

// UserSchema.methods.toJSON = function() {
//     var user = this;
//     var userObject = user.toObject();

//     return {id: userObject._id, name: userObject.name, email: userObject.email};
// };

UserSchema.methods.generateAuthToken = function() {
    var user = this;
    var access = 'auth';
    var token = jwt.sign({ _id: user._id.toHexString(), access }, CONFIG.DATABASE.JWT_SECRET).toString();

    user.tokens.push({ access, token });
    return user.save().then(() => {
        return token;
    });
};

UserSchema.methods.removeToken = function(token) {
    var user = this;

    return user.update({ $pull: { tokens: { token } } });
};

UserSchema.methods.changePassword = function(oldPass, newPass) {
    var user = this;

    return new Promise((resolve, reject) => {
        bcj.compare(oldPass, user.password, (err, res) => {
            if (res) {
                user.password = newPass;
                resolve(user);
            } else {
                reject('Invalid Password');
            }
        });
    });
}

UserSchema.statics.findByCredentials = function(email, password) {
    var User = this;

    return User.findOne({ email }).then((user) => {
        if (!user) {
            return Promise.reject('Invalid Credentials');
        }

        return new Promise((resolve, reject) => {
            bcj.compare(password, user.password, (err, res) => {
                if (res) {
                    resolve(user);
                } else {
                    reject('Invalid Credentials');
                }
            });
        });
    });
};

UserSchema.statics.findByToken = function(token) {
    var User = this;
    var decoded;

    try {
        decoded = jwt.verify(token, CONFIG.DATABASE.JWT_SECRET);
    } catch (e) {
        return Promise.reject('Invalid Token');
    }

    return User.findOne({ '_id': decoded._id, 'tokens.token': token, 'tokens.access': 'auth' });
};

UserSchema.pre('save', function(next) {
    var user = this;
    if (user.isModified('password')) {
        bcj.genSalt(10, (err, salt) => { // Will Timeout if number too large
            bcj.hash(user.password, salt, (err, hash) => {
                user.password = hash;
                next();
            });
        });
    } else {
        next();
    }
});

var User = mg.model('User', UserSchema);
module.exports = User;