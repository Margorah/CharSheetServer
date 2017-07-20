const env = process.env.NODE_ENV || 'development';
const db = process.env.DATABASE || 'mongodb';

if (env === 'development' || env === 'test') {
    const config = require('./config.json');
    const envConfig = config[env][db];

    Object.keys(envConfig).forEach((key) => {
        process.env[key] = envConfig[key];
    });
    require(process.env.PATH);
}