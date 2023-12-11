const {DataTypes} = require("sequelize");
const sequelize = require('../config/database');

const Tier = sequelize.define('tiers',{
    id: {
        autoIncrement : true,
        primaryKey : true,
        type : DataTypes.INTEGER
    }, tier : {
        type : DataTypes.STRING
    }
})

module.exports = Tier;