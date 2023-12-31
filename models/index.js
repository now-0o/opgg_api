const Champion = require('./Champion');
const User = require('./User');
const Rank = require('./Rank');
const Tier = require('./Tier');
const Lane = require('./Lane');
const Game = require('./Game');
const ChampGameData = require('./ChampGameData');
const Rotation = require('./Rotation');
const SearchHistory  = require('./SearchHistory');

Rank.hasMany(User);
User.belongsTo(Rank);

Tier.hasMany(User);
User.belongsTo(Tier);

User.hasMany(Champion);
Champion.belongsTo(User);

Game.hasMany(ChampGameData);
ChampGameData.belongsTo(Game);

Lane.hasMany(ChampGameData);
ChampGameData.belongsTo(Lane);

User.hasMany(ChampGameData);
ChampGameData.belongsTo(User);

Champion.hasMany(ChampGameData, { as: 'pickChampion', foreignKey: 'pickId' });
ChampGameData.belongsTo(Champion, { foreignKey: 'pickId' });

Champion.hasMany(ChampGameData, { as: 'banChampion', foreignKey: 'banId' });
ChampGameData.belongsTo(Champion, { foreignKey: 'banId' });

Champion.belongsToMany(Lane, {through : "champion_lane"});
Lane.belongsToMany(Champion, {through : "champion_lane"});

Champion.hasMany(SearchHistory);
SearchHistory.belongsTo(Champion);

User.hasMany(SearchHistory);
SearchHistory.belongsTo(User);

Champion.hasMany(Rotation);
Rotation.belongsTo(Champion);

User.hasMany(Rotation);
Rotation.belongsTo(User);

module.exports = {
    Champion,
    User,
    Rank,
    Tier,
    Lane,
    Game,
    ChampGameData,
    Rotation,
    SearchHistory 
}