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
export const dbGameSession = dbRoot.child(getGameSessionId());
export const dbUsers = dbGameSession.child('users');
export const dbUser = dbUsers.child(getParams('userId'));
export const dbWordList = dbGameSession.child('shuffled_WordList');
export const dbSelectedWordsList = dbGameSession.child('selectedWordsList');
// New Data Added
export const dbLastWordSelected = dbGameSession.child('lastWordSelected');
export const dbRedScore = dbGameSession.child('redScore');
export const dbBlueScore = dbGameSession.child('blueScore');
//
export const dbTurn = dbGameSession.child('turn');
export const dbClue = dbGameSession.child('clue');
export const dbTime = dbGameSession.child('time');

export const team = getParams('team');

dbUser.update({
    id: getParams('userId'),
    userName: getParams('userName'),
    profilePicture: getParams('userProfilePicture'),
    isOnline: true,
    onlineTime: firebase.database.ServerValue.TIMESTAMP
});



