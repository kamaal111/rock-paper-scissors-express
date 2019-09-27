const express = require('express');
const socketIO = require('socket.io');

const User = require('./models/User');
const Lobby = require('./models/Lobby');

const socket = require('./socket');

const { port } = require('../config');

User.belongsTo(Lobby);
Lobby.hasMany(User);

const app = express();

const server = app.listen(port, () => console.log(`listening on ${port}`));
const io = socketIO(server);

socket(io);
