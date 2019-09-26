const Lobby = require('../models/Lobby');
const User = require('../models/User');

const getAllLobbies = async () => {
  try {
    const findAllLobbies = await Lobby.findAll({ include: [{ model: User }] });

    return { success: true, doc: findAllLobbies };
  } catch (error) {
    return { success: false, error };
  }
};

const createLobby = async lobbyName => {
  try {
    const createdLobby = await Lobby.create(
      {
        name: lobbyName,
      },
      { include: [{ model: User }] },
    );

    return { success: true, doc: createdLobby };
  } catch (error) {
    return { success: false, error };
  }
};

const putUserInLobby = async (lobbyId, userId) => {
  try {
    const findUser = await User.findOne({ where: { id: userId } });

    if (!findUser) {
      return { success: false, error: 'COULD NOT FIND USER' };
    }

    await findUser.update({ lobbyId: lobbyId, lobbyScore: 0 });
    const findLobby = await Lobby.findOne({
      where: { id: lobbyId },
      include: [{ model: User }],
    });
    return { success: true, doc: findLobby };
  } catch (error) {
    return { success: false, error };
  }
};

const updateLobbyChoices = async (userId, choice, lobby) => {
  try {
    if (!lobby) {
      return { success: false, error: 'COULD NOT FIND LOBBY' };
    }

    if (lobby.playerOneChoice === null) {
      const updatedLobby = await lobby.update({
        playerOneChoice: `${userId}-${choice}-1`,
      });
      return { success: true, doc: updatedLobby };
    }

    const updatedLobby = await lobby.update({
      playerTwoChoice: `${userId}-${choice}-2`,
    });
    return { success: true, doc: updatedLobby };
  } catch (error) {
    return { success: false, error };
  }
};

const resetLobbyAndSetScore = async lobby => {
  try {
    if (!lobby) {
      return { success: false, error: 'COULD NOT FIND LOBBY' };
    }

    const updatedLobby = await lobby.update({
      playerOneChoice: null,
      playerTwoChoice: null,
    });
    return { success: true, doc: updatedLobby };
  } catch (error) {
    return { success: false, error };
  }
};

module.exports = {
  createLobby,
  getAllLobbies,
  putUserInLobby,
  updateLobbyChoices,
  resetLobbyAndSetScore,
};
