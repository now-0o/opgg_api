const express = require('express');
const router = express.Router();
const { User, Game, ChampGameData, Champion } = require('../models');
const sequelize = require('../config/database');
const asyncHandler = require("../utils/asyncHandler");
const jwt = require("jsonwebtoken");
const HttpException = require('../HttpException');

router.post('/', asyncHandler(async(req, res)=>{
    const {gameData} = req.body;

    if(!gameData){
        throw new HttpException(400, '등록할 게임의 정보가 없습니다.');
    }

    if(gameData.length !== 2){
        throw new HttpException(400, '두팀의 정보가 모두 들어있어야 합니다.');
    }

    if(gameData[0].result === gameData[1].result){
        throw new HttpException(400, '두팀의 승패는 다른 값이여야 합니다.');
    }

    const fristTeamResultValueCheck = gameData[0].result === "win" || gameData[0].result === "lose";
    const secondTeamResultValueCheck = gameData[1].result === "win" || gameData[1].result === "lose";

    if(!fristTeamResultValueCheck||!secondTeamResultValueCheck){
        throw new HttpException(400, '결과값은 win 또는 lose 여야 합니다.');
    }

    const firstTeamPickChampion = gameData[0].pickIds;
    const secondTeamPickChampion = gameData[1].pickIds;

    if(!firstTeamPickChampion||!secondTeamPickChampion){
        throw new HttpException(400, '양 팀은 최소 한명, 최대 다섯명의 챔피언이 있어야 합니다.');
    }

    const isfirstTeamPickChampionDuplicate  = firstTeamPickChampion.length !== new Set(firstTeamPickChampion).size;
    const isSecondTeamPickChampionDuplicate  = secondTeamPickChampion.length !== new Set(secondTeamPickChampion).size;

    if(firstTeamPickChampion.length === 0||secondTeamPickChampion === 0 || firstTeamPickChampion.length > 5 || secondTeamPickChampion.length > 5){
        throw new HttpException(400, '양 팀은 최소 한명, 최대 다섯명의 챔피언이 있어야 합니다.');
    }

    if(isfirstTeamPickChampionDuplicate||isSecondTeamPickChampionDuplicate){
        throw new HttpException(400, '각 팀에 중복된 챔피언이 있을 수 없습니다.');
    }

    for (let championId of firstTeamPickChampion) {
        const foundChampion = await Champion.findByPk(championId);

        if(!foundChampion){
            throw new HttpException(400, '선택된 챔피언중 존재하지 않는 챔피언이 있습니다.');
        }
    }

    for (let championId of secondTeamPickChampion) {
        const foundChampion = await Champion.findByPk(championId);

        if(!foundChampion){
            throw new HttpException(400, '선택된 챔피언중 존재하지 않는 챔피언이 있습니다.');
        }
    }

    const firstTeamBanChampion = gameData[0].banIds;
    const secondTeamBanChampion = gameData[1].banIds;

    if(firstTeamBanChampion){
        const isfirstTeamBanChampionDuplicate  = firstTeamBanChampion.length !== new Set(firstTeamBanChampion).size;
        if(isfirstTeamBanChampionDuplicate){
            throw new HttpException(400, '한 팀에 중복된 금지 챔피언이 있을 수 없습니다.');
        }

        const checkFirstPickFirstBanDuplicateChampion = firstTeamPickChampion.filter(champion => firstTeamBanChampion.includes(champion));
        const hascheckFirstPickFirstBanDuplicateChampion = checkFirstPickFirstBanDuplicateChampion.length > 0;

        const checkSecondPickFirstBanDuplicateChampion = secondTeamPickChampion.filter(champion => firstTeamBanChampion.includes(champion));
        const hascheckSecondPickFirstBanDuplicateChampion = checkSecondPickFirstBanDuplicateChampion.length > 0;

        const isPickBanDuplicate = checkFirstPickFirstBanDuplicateChampion || checkSecondPickFirstBanDuplicateChampion;

        if(isPickBanDuplicate.length > 0){
            throw new HttpException(400, '금지된 챔피언은 선택된 챔피언과 중복 될 수 없습니다.');
        }
    }
    if(secondTeamBanChampion){
        const isSecondTeamBanChampionDuplicate  = secondTeamBanChampion.length !== new Set(secondTeamBanChampion).size;
        if(isSecondTeamBanChampionDuplicate){
            throw new HttpException(400, '한 팀에 중복된 금지 챔피언이 있을 수 없습니다.');
        }

        const checkFirstPickSecondBanDuplicateChampion = firstTeamPickChampion.filter(champion => secondTeamBanChampion.includes(champion));
        const hascheckFirstPickSecondBanDuplicateChampion = checkFirstPickSecondBanDuplicateChampion.length > 0;
    
        const checkSecondPickSecondBanDuplicateChampion = secondTeamPickChampion.filter(champion => secondTeamBanChampion.includes(champion));
        const hascheckSecondPickSecondBanDuplicateChampion = checkSecondPickSecondBanDuplicateChampion.length > 0;
    
        const isPickBanDuplicate = checkFirstPickSecondBanDuplicateChampion || checkSecondPickSecondBanDuplicateChampion;

        if(isPickBanDuplicate.length > 0){
            throw new HttpException(400, '금지된 챔피언은 선택된 챔피언과 중복 될 수 없습니다.');
        }
    }

    if(firstTeamBanChampion&&secondTeamBanChampion){
        if(firstTeamPickChampion.length < firstTeamBanChampion.length || secondTeamPickChampion.length < secondTeamBanChampion.length){
            throw new HttpException(400, '양 팀의 챔피언 수보다 금지 챔피언 수가 많을 수 없습니다.');
        }

        if(firstTeamBanChampion.length > 5 || secondTeamBanChampion.length > 5){
            throw new HttpException(400, '양 팀의 금지된 챔피언은 최대 다섯명 입니다.');
        }
    }else if(firstTeamBanChampion&&!secondTeamBanChampion){
        if(firstTeamPickChampion.length < firstTeamBanChampion.length){
            throw new HttpException(400, '양 팀의 챔피언 수보다 금지 챔피언 수가 많을 수 없습니다.');
        }

        if(firstTeamBanChampion.length > 5){
            throw new HttpException(400, '양 팀의 금지된 챔피언은 최대 다섯명 입니다.');
        }
    }else if(!firstTeamBanChampion&&secondTeamBanChampion){
        if(secondTeamPickChampion.length < secondTeamBanChampion.length){
            throw new HttpException(400, '양 팀의 챔피언 수보다 금지 챔피언 수가 많을 수 없습니다.');
        }

        if(secondTeamBanChampion.length > 5){
            throw new HttpException(400, '양 팀의 금지된 챔피언은 최대 다섯명 입니다.');
        }
    }

    const firstTeamUser = gameData[0].userIds;
    const secondTeamUser = gameData[1].userIds;

    if(!firstTeamUser||!secondTeamUser){
        throw new HttpException(400, '양 팀에 최소 한명의 유저가 있어야 합니다.');
    }

    if(firstTeamUser.length !== firstTeamPickChampion.length || secondTeamUser.length !== secondTeamPickChampion.length){
        throw new HttpException(400, '양 팀의 챔피언 수와 유저 수는 같아야 합니다.');
    }

    const isfirstTeamUserDuplicate  = firstTeamUser.length !== new Set(firstTeamUser).size;
    const isSecondTeamUserDuplicate  = secondTeamUser.length !== new Set(secondTeamUser).size;

    const DuplicateUser = firstTeamUser.filter(user => secondTeamUser.includes(user));
    const hasDuplicateUser = DuplicateUser.length > 0;

    if(isfirstTeamUserDuplicate||isSecondTeamUserDuplicate){
        throw new HttpException(400, '각 팀에 중복된 유저가 있을 수 없습니다.');
    }

    if(hasDuplicateUser){
        throw new HttpException(400, '각 팀에 중복된 유저가 있을 수 없습니다.');
    }

    for (let championId of firstTeamPickChampion) {
        const foundChampion = await Champion.findByPk(championId);

        if(!foundChampion){
            throw new HttpException(400, '금지된 챔피언 중 존재하지 않는 챔피언이 있습니다.');
        }
    }

    for (let championId of secondTeamPickChampion) {
        const foundChampion = await Champion.findByPk(championId);

        if(!foundChampion){
            throw new HttpException(400, '금지된 챔피언 중 존재하지 않는 챔피언이 있습니다.');
        }
    }

    const result = await sequelize.transaction(async () => {
        const savedGame = await Game.create();

        const savedChampGameData = await ChampGameData.create({
            userId: userId,
            championId: championId,
            createdAt: savedDatetime,
        })

        return savedGame;
    });
  
    res.status(201).json(result);
}));

module.exports = router;