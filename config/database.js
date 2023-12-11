const { Sequelize } = require("sequelize");
const cls = require('cls-hooked');
const namespace = cls.createNamespace('sequelize-namespace');
Sequelize.useCLS(namespace);

const sequelize = new Sequelize('jewoo', 'root', process.env.databasePassword, {
    host: 'localhost',
    dialect: 'mysql',
    logQueryParameters : true,
    define: {
      timestamps: true
    }
  });

const checkConnection = async ()=>{
    try {
        await sequelize.authenticate();
        console.log('Connection has been established successfully.');
      } catch (error) {
        console.error('Unable to connect to the database:', error);
      }
}

checkConnection();

module.exports = sequelize;