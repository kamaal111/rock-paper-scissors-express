const Sequelize = require('sequelize');

const db = require('../database');

const Lobby = db.define(
  'lobby',
  {
    name: Sequelize.STRING,
    score: Sequelize.STRING,
  },
  { timestamps: false },
);

module.exports = Lobby;
