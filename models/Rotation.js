const {DataTypes} = require("sequelize");
const sequelize = require('../config/database');

const Rotation = sequelize.define('rotatinos',{
    id: {
        autoIncrement : true,
        primaryKey : true,
        type : DataTypes.INTEGER
    }, live : {
        type: DataTypes.BOOLEAN
    }
})

module.exports = Rotation;