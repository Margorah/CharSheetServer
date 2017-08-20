const env = process.env.CONFIG || 'default';
const CONFIG = require(`./${env}.json`);

module.exports = CONFIG;

require(CONFIG.DATABASE.PATH);