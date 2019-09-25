const Lobby = require('../models/Lobby');
const User = require('../models/User');

const getAllLobbies = async () => {
  try {
    const findAllLobbies = await Lobby.findAll({ include: [User] });

    return { success: true, doc: findAllLobbies };
  } catch (error) {
    return { success: false, error };
  }
};

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

module.exports = { createLobby, getAllLobbies };
