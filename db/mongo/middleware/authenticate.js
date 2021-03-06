// jshint esversion: 6
const User = require('./../models/user');

const authenticate = (req, callback, next) => {
    const token = req.header('x-auth');

    User.findByToken(token).then((user) => {
        if (!user) {
            return Promise.reject('Invalid User');
        }
        req.user = user;
        req.token = token;
        next();
    }).catch(e => Promise.reject(e));
};

module.exports = authenticate;