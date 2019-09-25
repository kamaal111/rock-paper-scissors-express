const express = require('express');
const socketIO = require('socket.io');

const User = require('./models/User');
const Lobby = require('./models/Lobby');
const { findOrCreateUser } = require('./controllers/user.controller');
const {
  createLobby,
  getAllLobbies,
  putUserInLobby,
} = require('./controllers/lobby.controller');

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

  socket.on('all-lobbies-request-from-client', async _data => {
    try {
      const allLobbies = await getAllLobbies();

      if (allLobbies.status === false) {
        return console.error('ERROR:', allLobbies.error);
      }

      socket.emit('all-lobbies-from-server', allLobbies);
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

  socket.on('user-in-lobby-from-client', async data => {
    try {
      const { lobbyId, userId } = data;
      const updateLobbyEntity = await putUserInLobby(lobbyId, userId);
      const allLobbies = await getAllLobbies();

      if (
        (updateLobbyEntity.status === false) |
        (allLobbies.status === false)
      ) {
        if (allLobbies.status === false) {
          return console.error('ERROR:', allLobbies.error);
        }

        return console.error('ERROR:', updateLobbyEntity.error);
      }

      return socket.broadcast.emit('user-in-lobby-from-server', allLobbies);
    } catch (error) {
      return console.error('ERROR:', error);
    }
  });
});
