const {DataTypes} = require("sequelize");
const sequelize = require('../config/database');

const Champion = sequelize.define('champions',{
    id: {
        autoIncrement : true,
        primaryKey : true,
        type : DataTypes.INTEGER
    }, name : {
        type : DataTypes.STRING
    }, image : {
        type : DataTypes.STRING
    }
})

module.exports = Champion;