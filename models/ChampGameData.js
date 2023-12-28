const {DataTypes} = require("sequelize");
const sequelize = require('../config/database');

const ChampGameData = sequelize.define('champ_game_data',{ // champ_game_data 스네이크 케이스, 축약어 금지
    id: {
        autoIncrement : true,
        primaryKey : true,
        type : DataTypes.INTEGER
    }, win_or_lose : { // winOrLose 직관적으로
        type : DataTypes.STRING
    },
    
})

module.exports = ChampGameData;