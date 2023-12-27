const { Sequelize } = require("sequelize");
const cls = require('cls-hooked');
const namespace = cls.createNamespace('sequelize-namespace');
Sequelize.useCLS(namespace);

const sequelize = new Sequelize('opgg', 'root', process.env.databasePassword, {
    host: 'localhost',
    dialect: 'mysql',
    logQueryParameters : true, // SQL 쿼리문을 실행할때마다 콘솔에 출력
    define: {
      timestamps: true // createdAt updateAt 추가
    }
  });

const checkConnection = async ()=>{
    try {
        await sequelize.authenticate(); // 데이터베이스에 연결 시도
        console.log('Connection has been established successfully.');
      } catch (error) {
        console.error('Unable to connect to the database:', error);
      }
}

checkConnection();

module.exports = sequelize;