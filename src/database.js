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

export const dbRoot = firebase.database().ref('codename');
export const dbCodenameWords = firebase.database().ref('codenameWords');
export const dbDeepUndercover = dbCodenameWords.child('deepUndercover');
export const dbDefault = dbCodenameWords.child('default');
export const dbDuet = dbCodenameWords.child('duet');
export const dbGameSession = dbRoot.child(getGameSessionId());
export const dbUsers = dbGameSession.child('users');
export const dbUser = dbUsers.child(getParams('userId'));
export const dbWordList = dbGameSession.child('shuffledWordList');
export const dbSelectedWordsList = dbGameSession.child('selectedWordsList');
export const dbPage = dbGameSession.child('page');
export const dbLastWordSelected = dbGameSession.child('lastWordSelected');
export const dbRedScore = dbGameSession.child('redScore');
export const dbBlueScore = dbGameSession.child('blueScore');
export const dbLogsArray = dbGameSession.child('logsArray');
//
export const dbTurn = dbGameSession.child('turn');
export const dbClue = dbGameSession.child('clue');
export const dbTime = dbGameSession.child('time');


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



