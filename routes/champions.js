const express = require('express');
const router = express.Router();
const { Champion, Lane, Rotation, User, SearchHistory } = require('../models');
const { Op } = require('sequelize');
const sequelize = require('../config/database');
const HttpException = require('../HttpException');
const asyncHandler = require('../utils/asyncHandler');
const authenticateToken = require('../middlewares/authenticateToken');

router.get('/', asyncHandler(async (req, res) => {
    const searchedChampions = await Champion.findAll({
        attributes: ['id', 'name', 'image']
    });

    res.status(200).send(searchedChampions);
}));

router.get('/search', asyncHandler(async (req, res) => {
    // 비구조화할당 
    const {champion} = req.query;
    
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

  router.get('/search/:lane', asyncHandler(async (req, res) => {
     const { laneId } = req.params;

     if(!laneId){
        throw new HttpException(400, '조회할 라인의 값이 없습니다.');
     }

     const searchedChampions = await Champion.findAll({
        attributes: ['id', 'name', 'image'],
        include: [
            {
            model: Lane,
            where: {
                id : laneId
            },
            attributes: ['lane'], 
            },
            {
            model: Rotation,
            attributes: ['id']
            }
        ],
     });

     res.status(200).send(searchedChampions);
  }));

  router.post('/save-recent-search', authenticateToken, asyncHandler(async (req, res) => {
    const userId = req.user.id;
    const {championId} = req.body;

    if(!championId){
      throw new HttpException(400, "챔피언 ID는 필수값 입니다.");
    }
    
    const result = await sequelize.transaction(async () => {
      const foundChampion = await Champion.findByPk(championId);

      if(!foundChampion){
          throw new HttpException(400, '존재하지 않는 챔피언의 ID입니다.');
      }

      const savedDatetime = new Date();

      const savedRecentSearch = await SearchHistory.create({
        userId: userId,
        championId: championId,
        createdAt: savedDatetime,
      });

      return savedRecentSearch;
    });

    res.status(201).json(result);
  }));

  router.get('/get-recent-search', authenticateToken, asyncHandler(async (req, res) => {
    const userId = req.user.id;

    const recentSearch = await SearchHistory.findAll({
        attributes: ['userId', 'championId', 'createdAt'],
        where: {
            userId
        },
        include: [
            {
                model: Champion,
                attributes: ['id', 'name', 'image']
            }
        ],
        limit: 3
    });

    res.status(200).json(recentSearch);
}));

module.exports = router;