const store = require('../config/db');

exports.getCategories = (req, res) => {
  const sorted = [...store.categories].sort((a, b) => a.name.localeCompare(b.name));
  res.json(sorted);
};
