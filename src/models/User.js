const Sequelize = require('sequelize');

const db = require('../database');

const User = db.define(
  'user',
  {
    name: Sequelize.STRING,
    score: Sequelize.INTEGER,
    lobbyScore: Sequelize.INTEGER,
  },
  { timestamps: false },
);

module.exports = User;
