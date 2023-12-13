const {DataTypes} = require("sequelize");
const sequelize = require('../config/database');

const SearchHistory = sequelize.define('search_histories', {
    id: {
        autoIncrement : true,
        primaryKey : true,
        type : DataTypes.INTEGER
    }
});

module.exports = SearchHistory;
