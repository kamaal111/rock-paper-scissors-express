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
        score: '0-0',
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

    await findUser.update({ lobbyId: lobbyId });
    const findLobby = await Lobby.findOne({
      where: { id: lobbyId },
      include: [{ model: User }],
    });
    return { success: true, doc: findLobby };
  } catch (error) {
    return { success: false, error };
  }
};

module.exports = { createLobby, getAllLobbies, putUserInLobby };
