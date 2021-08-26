const functions = require('firebase-functions');
const axios = require('axios');

exports.updateLeaderBoard = functions.https.onCall((data, context) => {
	const roomIdSessionId = data.gameSessionId;
	const sessionId = roomIdSessionId.split('+')[1];
	const winningTeamOnlinePlayersId = data.winningTeamOnlinePlayersId;
	const scoresArray = [];
	winningTeamOnlinePlayersId.forEach((userId) => {
		scoresArray.push({
			userid: userId,
			score: 10,
		});
	});
	return axios({
		method: 'post',
		headers: {
			'X-APP-ACCESS-SECRET': `Token ${functions.config().app.secret}`,
		},
		url: `${functions.config().app.url}/v1/api/dapp/extension/${functions.config().app.id}/leaderboard/save/`,
		data: {
			session_id: `${sessionId}`,
			scores: scoresArray,
		},
	})
		.then(function (response) {
			console.log('Success response is ', response);
		})
		.catch((error) => {
			console.log('Failure is ', error);
		});
});
