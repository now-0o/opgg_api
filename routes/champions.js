const express = require('express');
const router = express.Router();
const { Champion, Lane, Rotation, User, SearchHistory, ChampGameData, Game } = require('../models');
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

  router.get('/search/lane/rank/:lane', asyncHandler(async (req, res) => {
    const { lane } = req.params;

    if(!lane){
      throw new HttpException(400, '조회할 라인의 값이 없습니다.');
    }

    const totalGames = await sequelize.query('SELECT COUNT(*) AS totalGames FROM games', {
      type: sequelize.QueryTypes.SELECT,
      raw: true,
    }); // totalGames = [{totalGames : 2}]
    
    const result = await sequelize.query(`
      SELECT
        A.id,
        A.name,
        ${totalGames[0].totalGames} AS totalGames,
        SUM(CASE WHEN cg.pickId = A.id THEN 1 ELSE 0 END) AS pickCount,
        SUM(CASE WHEN cg.banId = A.id THEN 1 ELSE 0 END) AS banCount,
        (SUM(CASE WHEN cg.pickId = A.id THEN 1 ELSE 0 END) / ${totalGames[0].totalGames}) * 100 AS pickRate,
        (SUM(CASE WHEN cg.banId = A.id THEN 1 ELSE 0 END) / ${totalGames[0].totalGames}) * 100 AS banRate,
        (SUM(CASE WHEN cg.pickId = A.id AND cg.result = 'win' THEN 1 ELSE 0 END) / SUM(CASE WHEN cg.pickId = A.id THEN 1 ELSE 0 END)) * 100 AS winRate
      FROM (
        SELECT
          c.id,
          c.name
        FROM
          champions c, champion_lane b
        WHERE
          c.id = b.championId
        And
          b.laneId = ${lane}
      ) A
      LEFT JOIN
        champgamedata cg ON A.id = cg.pickId OR A.id = cg.banId
      GROUP BY
        A.id, A.name, totalGames;
    `, {
      type: sequelize.QueryTypes.SELECT,
      raw: true,
    });

    res.status(200).send(result);
  }));

  router.get('/search/lane/:lane', asyncHandler(async (req, res) => {
    const { lane } = req.params;

    if(!lane){
       throw new HttpException(400, '조회할 라인의 값이 없습니다.');
    }

    const searchedChampions = await Champion.findAll({
       attributes: ['id', 'name', 'image'],
       include: [
           {
           model: Lane,
           where: {
               id : lane
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

router.post('/rotation', authenticateToken, asyncHandler(async (req, res) => {
  const userId = req.user.id;
  const {championId} = req.body;

  if(!championId){
    throw new HttpException(400, "챔피언 ID는 필수값 입니다.");
  }

  const result = await sequelize.transaction(async () => {
    const userRank = await User.findByPk(userId);
    const isAdmin = userRank.dataValues.rankId == 2;

    if(!isAdmin){
      throw new HttpException(403, "로테이션은 관리자만 등록할 수 있습니다.");
    }

    const foundChampion = await User.findByPk(championId);

    if(!championId){
      throw new HttpException(400, "존재하지 않는 챔피언입니다.");
    }

    const settedChampion = await Rotation.create({
      championId,
      userId,
      live : true
    });

    return settedChampion;
  });

  res.status(201).json(result);
}));

module.exports = router;