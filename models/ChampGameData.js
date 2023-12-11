const {DataTypes} = require("sequelize");
const sequelize = require('../config/database');

const ChampGameData = sequelize.define('champgamedata',{
    id: {
        autoIncrement : true,
        primaryKey : true,
        type : DataTypes.INTEGER
    }, result : {
        type : DataTypes.STRING
    }
})

module.exports = ChampGameData;