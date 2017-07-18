var env = process.env.NODE_ENV || 'development';
var db = process.env.DATABASE || 'mongodb';

if (env === 'development') {
    process.env.PORT = 3000;
    process.env.HOSTNAME = '192.168.200.100';
}

if (db === 'mongodb') {
    process.env.MONGODB_URI = 'mongodb://localhost:27017/CharSheetApp';
    require('./../db/mongo/mongodb');
}