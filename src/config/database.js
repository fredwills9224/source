const Sequelize = require('sequelize');
const config = require('config');
// parsing timestamp for postgres
    // require('pg').defaults.parseInt8 = true;
// parsing timestamp for postgres

const dbConfig = config.get('database');
const sequelize = new Sequelize(dbConfig.database, dbConfig.username, dbConfig.password, {
    dialect: dbConfig.dialect,
    storage: dbConfig.storage,
    logging: dbConfig.logging
});

module.exports = sequelize;