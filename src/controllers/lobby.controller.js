const Lobby = require('../models/Lobby');
const User = require('../models/User');

const createLobby = async lobbyName => {
  try {
    const createdLobby = await Lobby.create({
      name: lobbyName,
      score: '0-0',
    });

    return { success: true, doc: createdLobby };
  } catch (error) {
    return { success: false, error };
  }
};

module.exports = { createLobby };
