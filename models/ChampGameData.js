const {DataTypes} = require("sequelize");
const sequelize = require('../config/database');

const ChampGameData = sequelize.define('champgamedata',{ // champ_game_data 스네이크 케이스, 축약어 금지
    id: {
        autoIncrement : true,
        primaryKey : true,
        type : DataTypes.INTEGER
    }, result : { // winOrLose 직관적으로
        type : DataTypes.STRING
    },
    
})

module.exports = ChampGameData;