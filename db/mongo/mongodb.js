const mongoose = require('mongoose');
const ObjectID = require('mongodb');

mongoose.Promise = require('bluebird');
var connectPromse = mongoose.connect(process.env.MONGODB_URI, {
    useMongoClient: true
});

module.exports = db = {

};

// const {MongoClient} = require('mongodb');

// var db;

// module.exports = db = {

//     connect: () => {
//         MongoClient.connect(process.env.MONGODB_URI, (error, database) => {
//             if (error) {
//                 return console.log('Unable to Connect to DB');
//             }
//             db = database;
//             return console.log('Connected to MongoDB');
//         });
//     },

//     disconnect: () => {
//         MongoClient.disconnect();
//         return console.log('MongoDB disconnected');
//     },

//     create: (object, path, callback) => {
//         //Add Validation. Data types and if user by email already exists
//         console.log('Create Reached');
//         db.collection(path).insert(object);
//         return callback(undefined, `Successful Insert of ${path}`);
//     },

//     retrieve: (object, path, callback) => {
//         console.log('Retrieve Reached');
//         findADocument(object, path, (err, doc) => {
//             if (err) {
//                 console.log(err);
//                 callback('MongoRetrieve Error', undefined);
//             } 
//                  callback(undefined, doc);
//         });
//     }
// }

// findADocument = (object, path, callback) => {
//     db.collection(path).findOne(object, (err, doc) => {
//         callback(err, doc);
//     });
// }