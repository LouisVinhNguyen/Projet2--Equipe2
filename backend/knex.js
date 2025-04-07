const knex = require('knex');
const path = require('path');
const fs = require('fs');

// Create absolute path to the database file
const dbPath = path.resolve(__dirname, './sqlite3/Cabinet.sqlite3');
const dbDir = path.dirname(dbPath);

// Ensure directory exists
if (!fs.existsSync(dbDir)) {
  fs.mkdirSync(dbDir, { recursive: true });
}

const db = knex({
    client: 'sqlite3',
    connection: {
        filename: dbPath // Using absolute path
    },
    useNullAsDefault: true // Required for SQLite to handle default values properly
});

module.exports = db;