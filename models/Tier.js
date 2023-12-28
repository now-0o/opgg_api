const {DataTypes} = require("sequelize");
const sequelize = require('../config/database');

const Tier = sequelize.define('tiers',{
    id: {
        autoIncrement : true,
        primaryKey : true,
        type : DataTypes.INTEGER
    }, name : {
        type : DataTypes.STRING
    }
})

module.exports = Tier;