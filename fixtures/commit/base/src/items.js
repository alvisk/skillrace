const items = Array.from({ length: 95 }, (_, i) => ({
  id: i + 1,
  name: `item-${i + 1}`,
}));

module.exports = { items };
