const functions = require("firebase-functions");
const axios = require("axios");

exports.updateLeaderBoard = functions.https.onCall((data, context)=>{
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
      "X-APP-ACCESS-SECRET": `Token ${functions.config().app.secret}`
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
