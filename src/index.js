const express = require('express');
const socketIO = require('socket.io');

const User = require('./models/User');
const Lobby = require('./models/Lobby');
const {
  findOrCreateUser,
  incrementUserScore,
} = require('./controllers/user.controller');
const {
  createLobby,
  getAllLobbies,
  putUserInLobby,
  updateLobbyChoices,
  resetLobbyAndSetScore,
} = require('./controllers/lobby.controller');

const { port } = require('../config');

User.belongsTo(Lobby);
Lobby.hasMany(User);

const app = express();

const server = app.listen(port, () => console.log(`listening on ${port}`));
const io = socketIO(server);

app.use(express.json());

const gameWinner = (choice1, choice2) => {
  const [, choiceOne] = choice1.split('-');
  const [, choiceTwo] = choice2.split('-');

  const choices = {
    scissors: 'scissors',
    rock: 'rock',
    paper: 'paper',
  };

  const { scissors, rock, paper } = choices;

  if (choiceOne === scissors && choiceTwo === rock) {
    return choice2;
  }

  if (choiceOne === paper && choiceTwo === rock) {
    return choice1;
  }

  if (choiceOne === rock && choiceTwo === rock) {
    return 'DRAW';
  }

  if (choiceOne === scissors && choiceTwo === paper) {
    return choice1;
  }

  if (choiceOne === rock && choiceTwo === paper) {
    return choice2;
  }

  if (choiceOne === paper && choiceTwo === paper) {
    return 'DRAW';
  }

  if (choiceOne === paper && choiceTwo === scissors) {
    return choice2;
  }

  if (choiceOne === rock && choiceTwo === scissors) {
    return choice1;
  }

  return 'DRAW';
};

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

      socket.emit('user-in-lobby-from-server', allLobbies);
      return socket.broadcast.emit('user-in-lobby-from-server', allLobbies);
    } catch (error) {
      return console.error('ERROR:', error);
    }
  });

  socket.on('user-in-game-choice-from-client', async data => {
    try {
      const { userId, lobbyId, choice } = data;

      const findLobby = await Lobby.findOne({
        where: { id: lobbyId },
        include: [{ model: User }],
      });

      if (
        findLobby.playerOneChoice !== null ||
        findLobby.playerTwoChoice !== null
      ) {
        const updatedLobby = await updateLobbyChoices(
          userId,
          choice,
          findLobby,
        );

        if (updatedLobby.success === false) {
          return console.error('ERROR:', updatedLobby.error);
        }

        const { playerOneChoice, playerTwoChoice, score } = updatedLobby.doc;

        const winner = gameWinner(playerOneChoice, playerTwoChoice);

        const [winningUser, , winnerPosition] = winner.split('-');
        const [playerOneScore, playerTwoScore] = score.split('-');

        const [playerOneId] = playerOneChoice.split('-');
        const [playerTwoId] = playerTwoChoice.split('-');

        const resetLobbyAndIncrementUserScore = async score => {
          const resetedLobby = await resetLobbyAndSetScore(score, findLobby);

          await incrementUserScore(Number(winningUser));

          socket.broadcast.emit(`user-in-game-${lobbyId}-winner-from-server`, {
            winner,
            score: resetedLobby.doc.score,
          });
          return socket.emit(`user-in-game-${lobbyId}-winner-from-server`, {
            winner,
            score: resetedLobby.doc.score,
          });
        };

        if (Number(winnerPosition) === 1) {
          if (Number(playerOneId < Number(playerTwoId))) {
            return await resetLobbyAndIncrementUserScore(
              `${Number(playerOneScore) + 1}-${playerTwoScore}`,
            );
          }

          return await resetLobbyAndIncrementUserScore(
            `${playerTwoScore}-${Number(playerOneScore) + 1}`,
          );
        }

        if (Number(winnerPosition) === 2) {
          if (Number(playerOneId < Number(playerTwoId))) {
            return await resetLobbyAndIncrementUserScore(
              `${playerOneScore}-${Number(playerTwoScore) + 1}`,
            );
          }

          return await resetLobbyAndIncrementUserScore(
            `${Number(playerTwoScore) + 1}-${playerOneScore}`,
          );
        }

        if (Number(playerOneId < Number(playerTwoId))) {
          return await resetLobbyAndIncrementUserScore(
            `${playerOneScore}-${playerOneScore}`,
          );
        }

        return await resetLobbyAndIncrementUserScore(
          `${playerTwoScore}-${playerOneScore}`,
        );
      }

      const updatedLobby = await updateLobbyChoices(userId, choice, findLobby);

      if (updatedLobby.success === false) {
        return console.error('ERROR:', updatedLobby.error);
      }

      socket.broadcast.emit(`user-in-game-${lobbyId}-choice-from-server`, {
        winner: null,
      });
      return socket.emit(`user-in-game-${lobbyId}-choice-from-server`, {
        winner: null,
      });
    } catch (error) {
      return console.error('ERROR:', error);
    }
  });
});
