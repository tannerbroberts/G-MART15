// This file provides CommonJS compatibility for the database utilities
const dbModule = require('../utils/db.ts');

// Export the pool as default export
module.exports = dbModule.default;

// Export named exports
module.exports.query = dbModule.query;
module.exports.initDb = dbModule.initDb;
module.exports.db = dbModule.db;