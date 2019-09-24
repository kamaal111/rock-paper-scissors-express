const express = require('express');
const socketIO = require('socket.io');

const app = express();

const port = process.env.PORT | 4000;
const server = app.listen(port, () => console.log(`listening on ${port}`));
const io = socketIO(server);

io.on('connection', socket => {
  console.log('New user');
  socket.emit('message-from-server', 'hello-world');
  socket.on('message-from-client', data => console.log('data', data));
});
