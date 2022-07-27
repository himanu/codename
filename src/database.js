import firebase from 'firebase/app';
import 'firebase/database';
import 'firebase/functions';
import "firebase/auth";
import { getGameSessionId, getParams,defaultWordsArray,duetWordsArray } from "./utils";

const firebaseConfig = {
	apiKey: "AIzaSyAaWOflD1Hg4VmQJSvlqtdsiIi1HcdNbnk",
	authDomain: "fir-384a7.firebaseapp.com",
	databaseURL: "https://fir-384a7-default-rtdb.firebaseio.com",
	projectId: "fir-384a7",
	storageBucket: "fir-384a7.appspot.com",
	messagingSenderId: "156594093226",
	appId: "1:156594093226:web:baf0e766e480e5a0a8a4d3",
	measurementId: "G-6J07C7WESN"
};

const app = firebase.initializeApp(firebaseConfig);
var functions = firebase.functions();

const auth = firebase.auth();
// function signUp(email, password) {
// 	auth.createUserWithEmailAndPassword(email, password)
// 	.then((userCredential) => {
// 	  // Signed in 
// 	  var user = userCredential.user;
// 	  console.log('user ', user);
// 	  // ...
// 	})
// 	.catch((error) => {
// 	  var errorCode = error.code;
// 	  var errorMessage = error.message;
// 	  console.log('error ', error);
// 	  // ..
// 	});
// }
// function signIn(email, password) {
// 	auth.signInWithEmailAndPassword(email, password)
// 	.then((userCredential) => {
// 		// Signed in
// 		var user = userCredential.user;
// 		console.log('user ', user);
// 		// ...
// 	})
// 	.catch((error) => {
// 		var errorCode = error.code;
// 		var errorMessage = error.message;
// 		console.log('error ', error);
// 	});
// }
// signUp('hy287720@gmail.com', '123456');
// const provider = new firebase.auth.GoogleAuthProvider();
// provider.addScope('https://www.googleapis.com/auth/contacts.readonly');
// auth.signInWithPopup(provider).then(function(result) {
//   var user = result.user;
//   var credential = result.credential;
//   console.log('User ', user);
// }, function(error) {
//   // The provider's account email, can be used in case of
//   // auth/account-exists-with-different-credential to fetch the providers
//   // linked to the email:
//   var email = error.email;
//   console.log("error ", error);
//   // The provider's credential:
//   var credential = error.credential;
//   // In case of auth/account-exists-with-different-credential error,
//   // you can fetch the providers using this:
//   if (error.code === 'auth/account-exists-with-different-credential') {
//     auth.fetchSignInMethodsForEmail(email).then(function(providers) {
//       // The returned 'providers' is a list of the available providers
//       // linked to the email address. Please refer to the guide for a more
//       // complete explanation on how to recover from this error.
//     });
//   }
// });

if (process.env.EMULATE) {
	var firebaseEmulators = {
		database: {
			host: 'localhost',
			port: 9000,
		},
		functions: {
			host: 'localhost',
			port: 5001,
		},
	};
	if (firebaseEmulators) {
		console.log('Automatically connecting Firebase SDKs to running emulators:');
		Object.keys(firebaseEmulators).forEach(function (key) {
			console.log('\t' + key + ': http://' + firebaseEmulators[key].host + ':' + firebaseEmulators[key].port);
		});
		if (firebaseEmulators.database && typeof firebase.database === 'function') {
			firebase.database().useEmulator(firebaseEmulators.database.host, firebaseEmulators.database.port);
		}
		if (firebaseEmulators.firestore && typeof firebase.firestore === 'function') {
			firebase.firestore().useEmulator(firebaseEmulators.firestore.host, firebaseEmulators.firestore.port);
		}
		if (firebaseEmulators.functions && typeof firebase.functions === 'function') {
			firebase.functions().useEmulator(firebaseEmulators.functions.host, firebaseEmulators.functions.port);
		}
		if (firebaseEmulators.auth && typeof firebase.auth === 'function') {
			firebase.auth().useEmulator('http://' + firebaseEmulators.auth.host + ':' + firebaseEmulators.auth.port);
		}
	} else {
		console.log(
			"To automatically connect the Firebase SDKs to running emulators, replace '/__/firebase/init.js' with '/__/firebase/init.js?useEmulator=true' in your index.html",
		);
	}
}

let roundValue = 1;

function getRoundValue() {
	return roundValue;
}

export const dbCodenameWords = firebase.database().ref('codenameWords');
export const dbDefault = dbCodenameWords.child('default');
export const dbDuet = dbCodenameWords.child('duet');

export const dbRoot = firebase.database().ref('codename');
export const dbGameSession = dbRoot.child(getGameSessionId());
export const dbGameSessionRoundValue = dbGameSession.child('roundValue');
export const dbGameSessionRounds = dbGameSession.child('rounds');

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

export const updateLeaderBoard = functions.httpsCallable('updateLeaderBoard');

const roundTimeValuePromise = new Promise((resolve, reject) => {
	dbGameSessionRoundValue.once('value').then((snap) => {
		if (!snap.exists()) {
			roundValue = 1;
		} else {
			roundValue = snap.val();
		}
		resolve();
	});
});

dbGameSessionRoundValue.on('value', (snap) => {
	if (!snap.exists()) {
		dbGameSessionRoundValue.set(1);
		roundValue = 1;
		return;
	}
	roundValue = snap.val();
});

var connectedRef = firebase.database().ref('.info/connected');
connectedRef.on('value', (snap) => {
	if (snap.val() === true) {
		dbUser.update({
			online: true,
		});

		dbUser.onDisconnect().update({
			online: firebase.database.ServerValue.TIMESTAMP,
		});
	}
});

dbUser.update({
	id: getParams('userId'),
	userName: getParams('userName'),
	profilePicture: getParams('userProfilePicture'),
});

// dbDefault.set(defaultWordsArray);
// dbDuet.set(duetWordsArray);
