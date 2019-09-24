const express = require('express');
const socketIO = require('socket.io');

const { findOrCreateUser } = require('./controllers/user.controller');

const app = express();

const port = process.env.PORT | 4000;
const server = app.listen(port, () => console.log(`listening on ${port}`));
const io = socketIO(server);

app.use(express.json());

io.on('connection', socket => {
  console.log('New user');
  socket.emit('welcome-from-server', 'Welcome');
  socket.on('username-from-client', async data => {
    try {
      const userEntity = await findOrCreateUser(data);
      if (userEntity.success === false) {
        return console.error('ERROR:', userEntity.error);
      }

      return socket.emit('send-entity-from-server', userEntity);
    } catch (error) {
      return console.error('ERROR:', error);
    }
  });
});
