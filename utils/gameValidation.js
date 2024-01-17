const HttpException = require('../HttpException');
const { Champion } = require('../models');

function isWinOrLose(gameResults) {
  const blueTeamResult = gameResults[0].win_or_lose;
  const redTeamResult = gameResults[1].win_or_lose;

  if (blueTeamResult === redTeamResult) {
    throw new HttpException(400, '두팀의 승패는 다른 값이여야 합니다.');
  }

  if (blueTeamResult !== 'win' && blueTeamResult !== 'lose') {
    throw new HttpException(400, '결과값은 win 또는 lose 여야 합니다.');
  }

  if (redTeamResult !== 'win' && redTeamResult !== 'lose') {
    throw new HttpException(400, '결과값은 win 또는 lose 여야 합니다.');
  }
}

async function champValidation(gameData) {
  for (const teamData of gameData) {
    const pickChamps = teamData.pickIds;
    const banChamps = teamData.banIds;
    if (!pickChamps) {
      throw new HttpException(400, '양 팀은 최소 한명, 최대 다섯명의 챔피언이 있어야 합니다.');
    }

    const PickChampDuplicate = pickChamps.length !== new Set(pickChamps).size;

    if (PickChampDuplicate) {
      throw new HttpException(400, '각 팀에 중복된 챔피언이 있을 수 없습니다.');
    }

    if (pickChamps.length === 0 || pickChamps.length > 5) {
      throw new HttpException(400, '양 팀은 최소 한명, 최대 다섯명의 챔피언이 있어야 합니다.');
    }

    for (let pickChamp of pickChamps) {
      const foundChampion = await Champion.findByPk(pickChamp);

      if (!foundChampion) {
        throw new HttpException(400, '선택된 챔피언중 존재하지 않는 챔피언이 있습니다.');
      }
    }

    let isBanDuplicate = false;
    const appearedBanChampions = {};

    for (const banChamp of banChamps) {
      if (banChamp !== '') {
        // 금지를 안한 경우를 표시하는 방법에 대해 고민하기 빈 문자열은 오해를 불러옴
        if (appearedBanChampions[banChamp]) {
          isBanDuplicate = true;
          break;
        }
        appearedBanChampions[banChamp] = true;
      }
    }

    if (isBanDuplicate) {
      throw new HttpException(400, '한팀에 중복된 금지된 챔피언(빈 값 제외)이 나올 수 없습니다. ');
    }

    if (pickChamps.length !== banChamps.length) {
      throw new HttpException(400, '양 팀의 선택 챔피언의 수와 금지 챔피언(빈값 포함)의 수는 같아야합니다.');
    }
  }

  const firstTeamPickChamp = gameData[0].pickIds;
  const firstTeamBanChamp = gameData[0].banIds;
  const secondTeamPickChamp = gameData[1].pickIds;
  const secondTeamBanChamp = gameData[1].banIds;

  let isfirstTeamPickChampBanned =
    firstTeamPickChamp.filter((champion) => firstTeamBanChamp.includes(champion)).length > 0;

  if (!isfirstTeamPickChampBanned) {
    firstTeamPickChamp.filter((champion) => secondTeamBanChamp.includes(champion)).length > 0;
  }

  let isSecondTeamPickChampBanned =
    secondTeamPickChamp.filter((champion) => firstTeamBanChamp.includes(champion)).length > 0;

  if (!isSecondTeamPickChampBanned) {
    secondTeamPickChamp.filter((champion) => secondTeamBanChamp.includes(champion)).length > 0;
  }

  if (isfirstTeamPickChampBanned || isSecondTeamPickChampBanned) {
    throw new HttpException(400, '금지된 챔피언은 선택된 챔피언과 중복 될 수 없습니다.');
  }
}

module.exports = {
  isWinOrLose,
  champValidation,
};
