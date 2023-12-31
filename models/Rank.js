const {DataTypes} = require("sequelize");
const sequelize = require('../config/database');

const Rank = sequelize.define('ranks',{
    id: {
        autoIncrement : true,
        primaryKey : true,
        type : DataTypes.INTEGER
    }, rank : {
        type : DataTypes.STRING
    }
})

module.exports = Rank;