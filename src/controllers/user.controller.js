const User = require('../models/User');

const findOrCreateUser = async username => {
  try {
    const findUser = await User.findOne({ where: { name: username } });

    if (!findUser) {
      const createdUser = await User.create({ name: username, score: 0 });
      return { success: true, doc: createdUser };
    }

    return { success: true, doc: findUser };
  } catch (error) {
    return { success: false, error };
  }
};

const incrementUserScore = async userId => {
  try {
    const findUser = await User.findOne({ where: { id: userId } });

    if (!findUser) {
      return { success: false, error: 'USER NOT FOUND' };
    }

    const incrementedUserScore = await findUser.update({
      score: findUser.score + 1,
    });

    return { success: true, doc: incrementedUserScore };
  } catch (error) {
    return { success: false, error };
  }
};

module.exports = { findOrCreateUser, incrementUserScore };
