require('dotenv').config();

const express = require('express');
const app = express();
const port = 3000;
app.use(express.json());

const HttpException = require('./HttpException');
const asyncHandler = require('./utils/asyncHandler');

const championRouter = require('./routes/champions');
const authRouter = require('./routes/auth');

const sequelize = require('./config/database');
require('./models');
sequelize.sync({
    alter: true
})

app.use('/champions', championRouter);
app.use('/auth', authRouter);

app.use((req, res, next) => {
  res.status(404).send('등록되지 않은 API입니다.');
});

app.listen(port, async () => {
  console.log(`서버가 실행됩니다. http://localhost:${port}`);
})

app.use((err, req, res, next) => {
  console.log(err);
  if(err instanceof HttpException){
    res.status(err.status).send(err.message);
    return;
  }
  res.status(500).send({
    message : "서버에러입니다."
  })
})