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

    if(gameData[0].win_or_lose === gameData[1].win_or_lose){
        throw new HttpException(400, '두팀의 승패는 다른 값이여야 합니다.');
    }

    const fristTeamResultValueCheck = gameData[0].win_or_lose === "win" || gameData[0].win_or_lose === "lose";
    const secondTeamResultValueCheck = gameData[1].win_or_lose === "win" || gameData[1].win_or_lose === "lose";

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

    if(!firstTeamBanChampion||!secondTeamBanChampion){
        throw new HttpException(400, '금지 챔피언의 데이터가 없습니다.');
    }


    let isBanChampionDuplicate = false;
    const appearedFristTeamBanChampions = {}; // 첫번째 팀 금지 챔피언 중복 체크용 배열
    const appearedSecondTeamBanChampions = {}; // 두번째 팀 금지 챔피언 중복 체크용 배열

    for (const fristTeamBanChampId of firstTeamBanChampion) {
        if (fristTeamBanChampId !== "") {
            if (appearedFristTeamBanChampions[fristTeamBanChampId]) {
                isBanChampionDuplicate = true;
                break;
            }
            appearedFristTeamBanChampions[fristTeamBanChampId] = true;
        }
    }

    for (const secondTeamBanChampId of secondTeamBanChampion) {
        if (secondTeamBanChampId !== "") {
            if (appearedSecondTeamBanChampions[secondTeamBanChampId]) {
                isBanChampionDuplicate = true;
                break;
            }
            appearedSecondTeamBanChampions[secondTeamBanChampId] = true;
        }
    }

    if(isBanChampionDuplicate){
        throw new HttpException(400, '한팀에 중복된 금지된 챔피언(빈 값 제외)이 나올 수 없습니다. ');
    }

    const checkFirstPickFirstBanDuplicateChampion = firstTeamPickChampion.filter(champion => firstTeamBanChampion.includes(champion));
    const hascheckFirstPickFirstBanDuplicateChampion = checkFirstPickFirstBanDuplicateChampion.length > 0;

    const checkSecondPickFirstBanDuplicateChampion = secondTeamPickChampion.filter(champion => firstTeamBanChampion.includes(champion));
    const hascheckSecondPickFirstBanDuplicateChampion = checkSecondPickFirstBanDuplicateChampion.length > 0;

    const checkFirstPickSecondBanDuplicateChampion = firstTeamPickChampion.filter(champion => secondTeamBanChampion.includes(champion));
    const hascheckFirstPickSecondBanDuplicateChampion = checkFirstPickSecondBanDuplicateChampion.length > 0;

    const checkSecondPickSecondBanDuplicateChampion = secondTeamPickChampion.filter(champion => secondTeamBanChampion.includes(champion));
    const hascheckSecondPickSecondBanDuplicateChampion = checkSecondPickSecondBanDuplicateChampion.length > 0;

    const isPickBanDuplicate = hascheckFirstPickFirstBanDuplicateChampion || hascheckSecondPickFirstBanDuplicateChampion || hascheckFirstPickSecondBanDuplicateChampion || hascheckSecondPickSecondBanDuplicateChampion;

    if(isPickBanDuplicate){
        throw new HttpException(400, '금지된 챔피언은 선택된 챔피언과 중복 될 수 없습니다.');
    }


    if(firstTeamPickChampion.length !== firstTeamBanChampion.length){
        throw new HttpException(400, '양 팀의 선택 챔피언의 수와 금지 챔피언(빈값 포함)의 수는 같아야합니다.');
    }

    if(secondTeamPickChampion.length !== secondTeamBanChampion.length){
        throw new HttpException(400, '양 팀의 선택 챔피언의 수와 금지 챔피언(빈값 포함)의 수는 같아야합니다.');
    }



    const firstTeamLane = gameData[0].laneIds; // 첫번째 팀 챔피언들의 라인 데이터
    const secondTeamLane = gameData[1].laneIds; // 두번째 팀 챔피언들의 라인 데이터

    if(!firstTeamLane||!secondTeamLane){
        throw new HttpException(400, '양 팀의 선택 챔피언의 라인 데이터가 있어야합니다.');
    }

    if(firstTeamPickChampion.length !== firstTeamLane.length || secondTeamPickChampion.length !== secondTeamLane.length){
        throw new HttpException(400, '양 팀읜 선택 챔피언의 수와 라인 데이터의 수는 같아야 합니다.');
    }

    for (let laneId of firstTeamLane) {
        const foundLane = await Champion.findByPk(laneId);

        if(!foundLane){
            throw new HttpException(400, '존재하지 않은 라인 데이터가 있습니다.');
        }
    }

    for (let laneId of secondTeamLane) {
        const foundLane = await Champion.findByPk(laneId);

        if(!foundLane){
            throw new HttpException(400, '존재하지 않은 라인 데이터가 있습니다.');
        }
    }

    const isfirstTeamLaneDuplicate  = firstTeamLane.length !== new Set(firstTeamLane).size;
    if(isfirstTeamLaneDuplicate){
        throw new HttpException(400, '한 팀에 중복된 라인 데이터는 있을 수 없습니다.');
    }

    const isSecondTeamLaneDuplicate  = secondTeamLane.length !== new Set(secondTeamLane).size;
    if(isSecondTeamLaneDuplicate){
        throw new HttpException(400, '한 팀에 중복된 라인 데이터는 있을 수 없습니다.');
    }

    const firstTeamUser = gameData[0].userIds;
    const secondTeamUser = gameData[1].userIds;

    if(!firstTeamUser||!secondTeamUser){
        throw new HttpException(400, '양 팀에 최소 한명의 유저가 있어야 합니다.');
    }

    for (let userId of firstTeamUser) {
        const founduser = await User.findByPk(userId);

        if(!founduser){
            throw new HttpException(400, '존재하지 않은 유저가 있습니다.');
        }
    }

    for (let userId of secondTeamUser) {
        const founduser = await User.findByPk(userId);

        if(!founduser){
            throw new HttpException(400, '존재하지 않은 유저가 있습니다.');
        }
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
        const savedGameId = savedGame.dataValues.id;
        const willInsertChampGameDatas = [];

        for (let participatedTeam of gameData) {
            participatedTeam.userIds.forEach((userId, index)=>{
                const willInsertChampGameData = {};

                willInsertChampGameData.win_or_lose = participatedTeam.win_or_lose;
                willInsertChampGameData.gameId = savedGameId;
                willInsertChampGameData.laneId = participatedTeam.laneIds[index];
                willInsertChampGameData.pickId = participatedTeam.pickIds[index];
                willInsertChampGameData.banId = participatedTeam.banIds[index] !== "" ? Number(participatedTeam.banIds[index]) : null;
                willInsertChampGameData.userId = participatedTeam.userIds[index];

                willInsertChampGameDatas.push(willInsertChampGameData);
            });
        }

        const createdChampGameData = await ChampGameData.bulkCreate(willInsertChampGameDatas);

        return createdChampGameData;
    });
  
    res.status(201).json(result);
}));

module.exports = router;