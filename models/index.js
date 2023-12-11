const Champion = require('./Champion');
const User = require('./User');
const Rank = require('./Rank');

Rank.hasMany(User);
User.belongsTo(Rank);

User.hasMany(Champion);
Champion.belongsTo(User);

module.exports = {
    Champion,
    User,
    Rank
}