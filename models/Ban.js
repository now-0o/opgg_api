const {DataTypes} = require("sequelize");
const sequelize = require('../config/database');

const Ban = sequelize.define('bans',{
    id: {
        autoIncrement : true,
        primaryKey : true,
        type : DataTypes.INTEGER
    }
})

module.exports = Ban;