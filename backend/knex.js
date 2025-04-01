const knex = require('knex');

const db = knex({
    client: 'mssql',
    connection: {
        server: 'DESKTOP-67ADTQ8\\SQLEXPRESS',
        user: 'user',
        password: 'password',
        database: 'Cabinet',
        options: {
            encrypt: true,
            trustServerCertificate: true,
            enableArithAbort: true,
            trustedConnection: true // Use Windows Authentication
        }
    }
});

module.exports = db;