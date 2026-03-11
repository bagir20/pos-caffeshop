const store = require('../config/db');

exports.getUsers = (req, res) => {
  const users = store.users.map(({ pin_plain, ...u }) => u);
  res.json(users);
};

exports.createUser = (req, res) => {
  const { name, role, pin } = req.body;
  const newUser = {
    id: store.users.length + 1,
    name, role,
    pin_plain: pin,
  };
  store.users.push(newUser);
  const { pin_plain, ...user } = newUser;
  res.json({ message: 'User created', user });
};

exports.updateUser = (req, res) => {
  const { id } = req.params;
  const { name, role, pin } = req.body;
  const idx = store.users.findIndex(u => u.id === Number(id));
  if (idx === -1) return res.status(404).json({ message: 'User tidak ditemukan' });
  store.users[idx] = { ...store.users[idx], name, role, ...(pin && { pin_plain: pin }) };
  const { pin_plain, ...user } = store.users[idx];
  res.json({ message: 'User updated', user });
};

exports.deleteUser = (req, res) => {
  const { id } = req.params;
  const idx = store.users.findIndex(u => u.id === Number(id));
  if (idx === -1) return res.status(404).json({ message: 'User tidak ditemukan' });
  store.users.splice(idx, 1);
  res.json({ message: 'User deleted' });
};
