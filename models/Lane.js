const {DataTypes} = require("sequelize");
const sequelize = require('../config/database');

const Lane = sequelize.define('lanes',{
    id: {
        autoIncrement : true,
        primaryKey : true,
        type : DataTypes.INTEGER
    }, lane : {
        type : DataTypes.STRING
    }
})

module.exports = Lane;