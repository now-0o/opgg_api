const {DataTypes} = require("sequelize");
const sequelize = require('../config/database');

const Lane = sequelize.define('lanes',{
    id: {
        autoIncrement : true,
        primaryKey : true,
        type : DataTypes.INTEGER
    }, name : { // name이 더 자연스러움
        type : DataTypes.STRING
    }
})

module.exports = Lane;