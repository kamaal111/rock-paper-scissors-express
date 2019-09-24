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

module.exports = { findOrCreateUser };
