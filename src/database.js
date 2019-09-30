const Sequelize = require('sequelize');

const { databaseUrl } = require('../config');

const db = new Sequelize(databaseUrl);

db.sync({ force: false })
  .then(() => console.log('Database connected'))
  .catch(console.error);

module.exports = db;
