const functions = require("firebase-functions");
const axios = require('axios');
const appId = "dapp_ccf92c4dd1f243f09d2483e6017d6dce";
const secret = "687aaf289f84731589c70d3f9cea180905aaad0a7789b63cde2f7c2cdd89d5a7";
const url = "https://dev.app.letsdive.io";

exports.updateLeaderBoard = functions.https.onCall((data, context) => {
    const roomIdSessionId = data.gameSessionId;
    const sessionId = roomIdSessionId.split("+")[1];
    const winningTeamOnlinePlayersId = data.winningTeamOnlinePlayersId;
    
    let scoresArray = [];
    winningTeamOnlinePlayersId.forEach(userId => {
        scoresArray.push({
            userid : userId,
            score : 10
        })
    });
    console.log('secret ',functions.config().app.secret);
    return axios({
      method: "post",
      headers: {
        Host: functions.config().app.url,
        "X-APP-ACCESS-SECRET": `Token ${functions.config().app.secret}`,
      },
      url: `${functions.config().app.url}/v1/api/dapp/extension/${
        functions.config().app.id
      }/leaderboard/save/`,
      data: {
        session_id: `${sessionId}`,
        scores: scoresArray,
      },
    })
      .then(function (response) {
        console.log(response.data);
      })
      .catch((error) => {
        console.log(error.response);
      });
  });
