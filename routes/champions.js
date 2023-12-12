const express = require('express');
const router = express.Router();
const { Champion } = require('../models');
const { Op } = require('sequelize');
const sequelize = require('../config/database');
const HttpException = require('../HttpException');
const asyncHandler = require('../utils/asyncHandler');

router.get('/', asyncHandler(async (req, res) => {
    const searchedChampions = await Champion.findAll({
        attributes: ['id', 'name', 'image']
    });

    res.status(200).send(searchedChampions);
}));

router.get('/search', asyncHandler(async (req, res) => {
    // 비구조화할당 
    const {champion} = req.body;
    
    if(!champion){
      throw new HttpException(400, '검색할 챔피언명이 없습니다.')
    }
  
    const searchedChampions = await Champion.findAll({
      attributes: ['id', 'name', 'image'],
      where: {
        [Op.or]: [
          {
            name: {
              [Op.like]: "%" + champion + "%"
            },
          }
        ],
      },
    });
  
    res.status(200).send(searchedChampions);
  }));

  module.exports = router;