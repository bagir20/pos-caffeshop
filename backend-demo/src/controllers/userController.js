const store = require('../config/db');

exports.getUsers = (req, res) => {
  const users = store.users.map(({ pin_plain, ...u }) => u);
  res.json(users);
};
