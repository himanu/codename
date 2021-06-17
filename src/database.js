import firebase from "firebase/app";
import "firebase/database";
import { getGameSessionId, getParams } from "./utils";

const firebaseConfig = {
    apiKey: "AIzaSyAkHeZ4jd3yxaEV7oP23CV3MXTdohs6btY",
    authDomain: "da-cn-dev.firebaseapp.com",
    databaseURL: "https://da-cn-dev-default-rtdb.firebaseio.com",
    projectId: "da-cn-dev",
    storageBucket: "da-cn-dev.appspot.com",
    messagingSenderId: "50285255069",
    appId: "1:50285255069:web:2c3a709277dbeb781b7774"
};

firebase.initializeApp(firebaseConfig);

let roundValue = 2;

function getRoundValue() {
    console.log(roundValue);
    return roundValue;
}
console.log("Hey I should run again");
export const dbRoot = firebase.database().ref('codename');
export const dbCodenameWords = firebase.database().ref('codenameWords');
export const dbDeepUndercover = dbCodenameWords.child('deepUndercover');
export const dbDefault = dbCodenameWords.child('default');
export const dbDuet = dbCodenameWords.child('duet');
export const dbGameSession = dbRoot.child(getGameSessionId());

export const dbGameSessionRoundValue = dbGameSession.child("roundValue");
export const dbGameSessionRounds = dbGameSession.child("rounds");

export const dbGameSessionRound = () => dbGameSessionRounds.child(getRoundValue());

export const dbUsers = dbGameSession.child('users');
export const dbUser = dbUsers.child(getParams('userId'));
export const dbWordList = () => dbGameSessionRound().child('shuffledWordList');
export const dbSelectedWordsList = () => dbGameSessionRound().child('selectedWordsList');
export const dbPage = () => dbGameSessionRound().child('page');
export const dbLastWordSelected = () => dbGameSessionRound().child('lastWordSelected');
export const dbRedScore = () => dbGameSessionRound().child('redScore');
export const dbBlueScore = () => dbGameSessionRound().child('blueScore');
export const dbLogsArray = () => dbGameSessionRound().child('logsArray');

export const dbTurn = () => dbGameSessionRound().child('turn');
export const dbClue = () => dbGameSessionRound().child('clue');
export const dbTime = () => dbGameSessionRound().child('time');
export const dbThemeValue = () => dbGameSessionRound().child('themeValue');

export function listenFirebaseKey(key, callback) {
    Promise.resolve(roundTimeValuePromise).then(() => {
        callback(key());
    });
}


const roundTimeValuePromise = new Promise((resolve, reject) => {
    dbGameSessionRoundValue.once("value").then((snap) => {
        if(!snap.exists()) {
            roundValue = 1;
        } else {
            roundValue = snap.val();
        }
        resolve();
    })
})

dbGameSessionRoundValue.on("value", (snap) => {
    if(!snap.exists()) {
        dbGameSessionRoundValue.set(1);
        roundValue = 1;
        return ;
    }
    roundValue = snap.val();

})

var connectedRef = firebase.database().ref('.info/connected');
connectedRef.on('value', (snap) => {
    if (snap.val() === true) {

		dbUser.update({
            online : true
        });

        dbUser.onDisconnect().update({
            online : firebase.database.ServerValue.TIMESTAMP
        });
    }
});

dbUser.update({
    id: getParams('userId'),
    userName: getParams('userName'),
    profilePicture: getParams('userProfilePicture')
});



