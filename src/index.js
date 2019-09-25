const express = require('express');
const socketIO = require('socket.io');

const User = require('./models/User');
const Lobby = require('./models/Lobby');
const { findOrCreateUser } = require('./controllers/user.controller');
const { createLobby } = require('./controllers/lobby.controller');

User.belongsTo(Lobby);
Lobby.hasMany(User);

const app = express();

const port = process.env.PORT | 4000;
const server = app.listen(port, () => console.log(`listening on ${port}`));
const io = socketIO(server);

app.use(express.json());

io.on('connection', socket => {
  console.log(`New user with userId ${socket.id}`);
  socket.emit('welcome-from-server', 'Welcome');

  socket.on('username-from-client', async data => {
    try {
      const userEntity = await findOrCreateUser(data.toUpperCase());
      if (userEntity.success === false) {
        return console.error('ERROR:', userEntity.error);
      }

      return socket.emit('send-user-entity-from-server', userEntity);
    } catch (error) {
      return console.error('ERROR:', error);
    }
  });

  socket.on('lobby-from-client', async data => {
    try {
      const lobbyEntity = await createLobby(data);

      if (lobbyEntity.status === false) {
        return console.error('ERROR:', lobbyEntity.error);
      }

      socket.emit('send-lobby-entity-from-server', lobbyEntity);
      return socket.broadcast.emit(
        'send-lobby-entity-from-server',
        lobbyEntity,
      );
    } catch (error) {
      return console.error('ERROR:', error);
    }
  });
});
