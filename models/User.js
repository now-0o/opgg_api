const {DataTypes} = require("sequelize");
const sequelize = require('../config/database');

const User = sequelize.define('users',{
    id: {
        autoIncrement : true,
        primaryKey : true,
        type : DataTypes.INTEGER
    }, email : {
        type : DataTypes.STRING
    }, password : {
        type : DataTypes.STRING
    }
})

module.exports = User;