<script>
	import { fly } from 'svelte/transition';
	import CustomButton from './CustomButton.svelte';
	import { dbDefault, dbDuet, dbGameSessionRound, dbPage, dbThemeValue, dbUser, dbUsers, listenFirebaseKey } from './database';
	import DisconnectedSvg from './DisconnectedSvg.svelte';
	import DownSvg from './DownSvg.svelte';
	import LoadingSvg from './LoadingSvg.svelte';
	import Tick from './Tick.svelte';
	import { create_NewArray_Of_List, shuffleArray } from './utils';

	let redTeam = [];
	let blueTeam = [];
	let userId;
	let disableRedSpymasterBtn = false;
	let disableBlueSpymasterBtn = false;
	let disableStartGameBtn = true;
	let user;
	let usersList;
	let redTeam_has_Spymaster = false;
	let blueTeam_has_Spymaster = false;
	let shuffledWordList;
	let team;
	let bluePlayerButtonText = 'Choose Blue';
	let redPlayerButtonText = 'Choose Red';
	let blueSpymasterButtonText = 'Be Spymaster';
	let redSpymasterButtonText = 'Be Spymaster';
	let currUser;
	let themeValue = 'Default';
	let wordList;
	let defaultTheme;
	let duetTheme;
	let onlineBlueTeam = [];
	let onlineRedTeam = [];
	let isSpymaster = false;
	let logsArray = [];
	let page;
	let alertDivText;
	listenFirebaseKey(dbPage, (dbPageRef) => {
		dbPageRef.on('value', (snap) => {
			if (!snap.exists()) {
				return;
			}
			page = snap.val();
		});
	});
	listenFirebaseKey(dbThemeValue, (dbThemeValueRef) => {
		dbThemeValueRef.on('value', (snap) => {
			if (!snap.exists()) {
				return;
			}
			themeValue = snap.val();
		});
	});

	dbDefault.on('value', (snap) => {
		if (!snap.exists()) {
			return;
		}
		defaultTheme = snap.val();
	});

	dbDuet.on('value', (snap) => {
		if (!snap.exists()) {
			return;
		}
		duetTheme = snap.val();
	});

	dbUsers.on('value', (snap) => {
		if (!snap.exists()) {
			return;
		}
		usersList = snap.val();
	});

	dbUser.on('value', (snap) => {
		if (!snap.exists()) {
			return;
		}
		currUser = snap.val();
		isSpymaster = currUser.spymaster;
	});
	$: {
		if (currUser) {
			team = currUser.team;
			userId = currUser.id;
			isSpymaster = currUser.spymaster;
		}
	}
	$: {
		if (team) {
			if (isSpymaster) {
				bluePlayerButtonText = 'Choose Blue';
				redPlayerButtonText = 'Choose Red';

				redSpymasterButtonText = 'Be Spymaster';
				blueSpymasterButtonText = 'Be Spymaster';
				if (team === 'Red') {
					redSpymasterButtonText = 'Spymaster';
				} else if (team === 'Blue') {
					blueSpymasterButtonText = 'Spymaster';
				}
			} else {
				redSpymasterButtonText = 'Be Spymaster';
				blueSpymasterButtonText = 'Be Spymaster';
				if (team === 'Red') {
					redPlayerButtonText = 'Picked Red';
					bluePlayerButtonText = 'Choose Blue';
				} else if (team === 'Blue') {
					bluePlayerButtonText = 'Picked Blue';
					redPlayerButtonText = 'Choose Red';
				}
			}
		} else {
			bluePlayerButtonText = 'Choose Blue';
			redPlayerButtonText = 'Choose Red';
		}
	}
	$: {
		redTeam = [];
		blueTeam = [];
		redTeam_has_Spymaster = false;
		blueTeam_has_Spymaster = false;
		for (const id in usersList) {
			user = usersList[id];
			// Code when new user visit game after game has been started.
			if (user.id === userId && !user.team) {
				if (team === 'Blue' && allUserOnlineStatus[user.id]) {
					blueTeam.push(user);
				} else if (team === 'Red' && allUserOnlineStatus[user.id]) {
					redTeam.push(user);
				}
			} else if (user.team === 'Blue') {
				//make sure that blue team has one online spymaster only
				if (user.spymaster && allUserOnlineStatus[user.id]) {
					if (blueTeam_has_Spymaster) {
						user.spymaster = false;

						// make update to the database and make him normal player
						if (user.id === userId) {
							isSpymaster = false;
						}
						dbUsers.child(user.id).update({
							spymaster: false,
						});
					} else {
						blueTeam_has_Spymaster = true;
					}
				}

				blueTeam.push(user);
			} else if (user.team === 'Red') {
				if (user.spymaster === true && allUserOnlineStatus[user.id]) {
					if (redTeam_has_Spymaster) {
						user.spymaster = false;

						if (user.id === userId) {
							isSpymaster = false;
						}
						// make update to the database and make him normal player

						dbUsers.child(user.id).update({
							spymaster: false,
						});
					} else {
						redTeam_has_Spymaster = true;
					}
				}

				redTeam.push(user);
			}
		}
		blueTeam = blueTeam;
		redTeam = redTeam;
	}
	$: {
		if (redTeam_has_Spymaster) {
			disableRedSpymasterBtn = true;
		} else {
			disableRedSpymasterBtn = false;
		}
	}
	$: {
		if (blueTeam_has_Spymaster) {
			disableBlueSpymasterBtn = true;
		} else {
			disableBlueSpymasterBtn = false;
		}
	}
	$: {
		onlineBlueTeam = blueTeam.filter((blueUser) => allUserOnlineStatus[blueUser.id]);
		onlineRedTeam = redTeam.filter((redUser) => allUserOnlineStatus[redUser.id]);
	}
	$: {
		if (onlineBlueTeam.length > 1 && onlineRedTeam.length > 1 && redTeam_has_Spymaster && blueTeam_has_Spymaster && team) {
			disableStartGameBtn = false;
		} else {
			disableStartGameBtn = true;
		}
	}
	$: {
		if (disableStartGameBtn) {
			if (!team) {
				alertDivText = 'Please join one of the two team';
			} else {
				alertDivText = 'Need atleast 2 online Player and 1 online Spymaster in each team !!!';
			}
		} else {
			alertDivText = '';
		}
	}
	$: {
		if (!themeValue) {
			themeValue = 'Default';
		}
		if (themeValue === 'Default') {
			wordList = defaultTheme;
		} else if (themeValue === 'Duet') {
			wordList = duetTheme;
		}
	}

	function keepUpdatingUsersOnlineStatus() {
		setInterval(updateUsersOnlineStatus, 1000);
	}
	let allUserOnlineStatus = {};
	function updateUsersOnlineStatus() {
		for (const id in usersList) {
			user = usersList[id];
			if (user.online === true || Date.now() - user.online <= 5000) {
				allUserOnlineStatus[user.id] = true;
			} else {
				allUserOnlineStatus[user.id] = false;
			}
		}
	}
	updateUsersOnlineStatus();

	function handle_Blue_Player_Btn() {
		if (page && page !== 'Lobby Screen') {
			team = 'Blue';
			return;
		}
		dbUser.update({
			team: 'Blue',
			spymaster: false,
		});
	}

	function handle_Red_Player_Btn() {
		if (page && page !== 'Lobby Screen') {
			team = 'Red';
			return;
		}
		dbUser.update({
			team: 'Red',
			spymaster: false,
		});
	}

	function handle_Blue_Spymaster_Btn() {
		dbUser.update({
			spymaster: true,
			team: 'Blue',
		});
	}

	function handle_Red_Spymaster_Btn() {
		dbUser.update({
			spymaster: true,
			team: 'Red',
		});
	}
	function setShuffledWordList() {
		shuffledWordList = shuffleArray(wordList).slice(0, 25);
		shuffledWordList = create_NewArray_Of_List(shuffledWordList);
		shuffledWordList = shuffleArray(shuffledWordList);

		for (let i = 0; i < shuffledWordList.length; i++) {
			shuffledWordList[i]['id'] = i;
		}
	}
	function makeSureEachTeamHaveOneSpymaster() {
		let redHasSpymaster = false;
		let blueHasSpymaster = false;
		for (const id in usersList) {
			let thisUser = usersList[id];
			if (thisUser.team === 'Blue') {
				if (thisUser.spymaster) {
					if (blueHasSpymaster) {
						thisUser.spymaster = false;
						dbUsers.child(thisUser.id).update({
							spymaster: false,
						});
					} else {
						blueHasSpymaster = true;
					}
				}
			} else if (thisUser.team === 'Red') {
				if (thisUser.spymaster) {
					if (redHasSpymaster) {
						thisUser.spymaster = false;
						dbUsers.child(thisUser.id).update({
							spymaster: false,
						});
					} else {
						redHasSpymaster = true;
					}
				}
			}
		}
	}
	function handle_Start_Game_Btn() {
		if (page && page !== 'Lobby Screen') {
			dbUser.update({
				team,
				spymaster: false,
			});
			return;
		}
		makeSureEachTeamHaveOneSpymaster();
		setShuffledWordList();
		logsArray.push({
			actor: currUser,
			action: 'has started the game',
			isWordSelected: false,
		});
		listenFirebaseKey(dbGameSessionRound, (dbGameSessionRoundRef) => {
			dbGameSessionRoundRef.update({
				page: 'Lobby',
				time: Date.now() + 6000,
				shuffledWordList,
				turn: 'Red',
				redScore: 9,
				blueScore: 8,
				gameStarter: currUser.userName,
				logsArray,
			});
		});
	}
	function changeThemeValue(newThemeValue) {
		listenFirebaseKey(dbGameSessionRound, (dbGameSessionRoundRef) => {
			dbGameSessionRoundRef.update({
				themeValue: newThemeValue,
			});
		});
	}

	function processName(user) {
		let name = user.userName;
		let fname = name?.split(' ')[0];
		if (fname?.length > 10) {
			fname = fname.slice(0, 8) + '...';
		}
		if (user.spymaster) {
			fname = fname + ' (Spymaster)';
		} else if (user.id === userId) {
			fname = fname + ' (You)';
		}
		return fname;
	}
	function validUserProfilePicture(str) {
		try {
			new URL(str);
			return true;
		} catch (err) {
			return false;
		}
	}
	// Call keep updating users online status
	keepUpdatingUsersOnlineStatus();
</script>

<main>
	<div class="gameHeading" in:fly={{ y: -20, duration: 1000 }}>
		<img class="codenamePng" src="/images/codenames-logo.png" alt="codenamesPng" />
	</div>
	<div class="container" in:fly={{ y: -20, duration: 1000 }}>
		<div class="heading">Choose a team you want to join</div>
		<div class="teams">
			<div class="blue">
				<div class="blueH">Blue Team ({blueTeam.length})</div>

				<div class="user-list">
					<div class="users">
						{#each blueTeam as user}
							<div class="user">
								<div class="userDetails">
									{#if validUserProfilePicture(user.profilePicture)}
										<img class="profilePicture" src={user.profilePicture} alt="UserProfilePicture" />
									{:else}
										<div class="fakeProfilePicture">{user.userName[0].toUpperCase()}</div>
									{/if}
									<div class="name">{processName(user)}</div>
								</div>
								{#if allUserOnlineStatus[user.id]}
									{#if user.online === true}
										<Tick />
									{:else}
										<LoadingSvg />
									{/if}
								{:else}
									<DisconnectedSvg />
								{/if}
							</div>
						{:else}
							<div class="emptyTeamMsg">Empty team ...</div>
						{/each}
					</div>
				</div>

				<div class="btn">
					<button class="player" class:disabledBluePlayerBtn={team === 'Blue' && !isSpymaster} on:click={handle_Blue_Player_Btn}>
						{bluePlayerButtonText}
					</button>
					{#if !page || page === 'Lobby Screen'}
						<button
							class="spymaster"
							class:disabledBlueSpymasterBtn={disableBlueSpymasterBtn}
							id="blueSpymasterBtn"
							on:click={handle_Blue_Spymaster_Btn}>{blueSpymasterButtonText}</button
						>
					{/if}
				</div>
			</div>

			<div class="vsBox">
				<div class="vs">VS</div>
			</div>

			<div class="red">
				<div class="redH">Red Team ({redTeam.length})</div>

				<div class="user-list">
					<div class="users">
						{#each redTeam as user}
							<div class="user">
								<div class="userDetails">
									{#if validUserProfilePicture(user.profilePicture)}
										<img class="profilePicture" src={user.profilePicture} alt="UserProfilePicture" />
									{:else}
										<div class="fakeProfilePicture">{user.userName[0].toUpperCase()}</div>
									{/if}
									<div class="name">
										{processName(user)}
									</div>
								</div>
								{#if allUserOnlineStatus[user.id]}
									{#if user.online === true}
										<Tick />
									{:else}
										<LoadingSvg />
									{/if}
								{:else}
									<DisconnectedSvg />
								{/if}
							</div>
						{:else}
							<div class="emptyTeamMsg">Empty team ...</div>
						{/each}
					</div>
				</div>
				<div class="btn">
					<button class="player" class:disabledRedPlayerBtn={team === 'Red' && !isSpymaster} on:click={handle_Red_Player_Btn}>
						{redPlayerButtonText}
					</button>
					{#if !page || page === 'Lobby Screen'}
						<button class="spymaster" class:disabledRedSpymasterBtn={disableRedSpymasterBtn} on:click={handle_Red_Spymaster_Btn}>
							{redSpymasterButtonText}
						</button>
					{/if}
				</div>
			</div>
		</div>
		{#if !page || page === 'Lobby Screen'}
			<div class="themeSelectorBox">
				<div class="selectATheme">Select a theme</div>
				<div class="themesBox">
					<div class="themes">
						{themeValue}
						<DownSvg />
					</div>

					<div class="themeContainer">
						<div class="theme" on:click={() => changeThemeValue('Default')}>Default</div>
						<div class="theme" on:click={() => changeThemeValue('Duet')}>Duet</div>
					</div>
				</div>
			</div>
		{/if}
	</div>
	<CustomButton btnText={'Start Game'} disableBtn={disableStartGameBtn} on:click={handle_Start_Game_Btn} tooltipMsg={alertDivText} />
</main>

<style>
	@import url('https://fonts.googleapis.com/css2?family=Manrope:wght@600;700;800&display=swap');

	::-webkit-scrollbar {
		width: 10px;
	}

	/* Track */
	::-webkit-scrollbar-track {
		background: #fff;
		border-radius: 5px;
	}

	/* Handle */
	::-webkit-scrollbar-thumb {
		background: #888;
		border-radius: 5px;
	}
	::-webkit-scrollbar-thumb:hover {
		background: rgb(70, 69, 69);
		cursor: pointer;
	}
	main {
		background-image: url(/images/background.svg);
		border-radius: 20px;
		background-size: 100% 100%;
		width: 100%;
		height: 100%;
		display: flex;
		flex-direction: column;
		align-items: center;
		padding: 2rem;
	}
	.codenamePng {
		height: 3rem;
	}

	.container {
		display: flex;
		flex-direction: column;
		align-items: center;
		justify-content: center;
		width: 100%;
		margin: auto;
	}
	.heading {
		color: #fff;
		font-family: 'Manrope', sans-serif;
		font-size: 0.85rem;
		line-height: 24px;
		margin-bottom: 1rem;
		font-weight: 700;
	}

	.teams {
		position: relative;
		display: flex;
		justify-content: center;
		width: 100%;
		max-height: 275px;
	}
	.red,
	.blue {
		position: relative;
		display: flex;
		flex-direction: column;
		justify-content: space-between;
		align-items: center;
		padding: 15px;
		width: 25%;
		height: auto;
		background: #ffffff;
		border-radius: 15px;
		margin: 0px;
	}
	.blue {
		box-shadow: -5px -5px #5e96e8;
	}
	.red {
		box-shadow: -5px -5px #e96143;
	}
	.blueH {
		font-family: 'Manrope', sans-serif;
		font-style: normal;
		font-weight: 800;
		font-size: 1rem;
		line-height: 28px;
		text-align: center;
		color: #5e96e8;
	}
	.redH {
		font-family: 'Manrope', sans-serif;
		font-style: normal;
		font-weight: 800;
		font-size: 1rem;
		line-height: 28px;
		text-align: center;
		color: #e96143;
	}
	.user-list {
		max-height: 100px;
		width: 85%;
		max-height: 50%;
		margin: 5% 5%;
		background-color: #fff;
		border-radius: 15px;
		padding: 5px;
	}
	.blue > .user-list {
		border: 1px solid #5e96e8;
	}
	.red > .user-list {
		border: 1px solid #e96143;
	}
	.users {
		overflow: auto;
		max-height: 100%;
	}
	.emptyTeamMsg {
		font-size: 0.75rem;
		color: grey;
		font-style: oblique;
	}
	.user {
		display: flex;
		justify-content: space-between;
		align-items: center;
		padding: 5px;
		overflow-x: hidden;
	}
	.userDetails {
		display: flex;
		align-items: center;
		justify-content: flex-start;
	}
	.profilePicture {
		width: 20px;
		height: 20px;
		border-radius: 50%;
		margin-right: 5px;
	}
	.fakeProfilePicture {
		min-width: 20px;
		min-height: 20px;
		max-width: 20px;
		max-height: 20px;
		font-size: 14px;
		color: white;
		font-weight: 700;
		display: flex;
		font-family: 'Manrope', sans-serif;
		justify-content: center;
		align-items: center;
		border-radius: 50%;
		background-color: #343e98;
		margin-right: 5px;
	}
	.name {
		font-family: 'Manrope', sans-serif;
		font-weight: 700;
		font-size: 14px;
		color: #0c0030;
		white-space: nowrap;
	}

	.btn {
		width: 100%;
		display: flex;
		justify-content: space-evenly;
		white-space: nowrap;
	}
	.player,
	.spymaster {
		border-radius: 41px;
		text-align: center;
		min-width: 40%;
		font-family: 'Manrope', sans-serif;
		font-size: 14px;
		font-weight: 800;
		line-height: 24px;
		letter-spacing: 0.5px;
		padding: 5px 10px;
		cursor: pointer;
	}

	.disabledRedPlayerBtn,
	.disabledBluePlayerBtn {
		cursor: text;
	}
	.disabledBlueSpymasterBtn {
		opacity: 0.7;
		cursor: text;
	}
	.disabledRedSpymasterBtn {
		opacity: 0.7;
		cursor: text;
	}
	.blue .player {
		background-color: #5e96e8;
		color: #ffffff;
	}
	.red .player {
		background-color: #e96143;
		color: #ffffff;
	}
	.spymaster {
		background-color: #ffffff;
		border-color: black;
		color: #333333f2;
	}
	.vsBox {
		display: flex;
		align-items: center;
		z-index: 1;
	}
	.vs {
		display: flex;
		align-items: center;
		justify-content: center;
		width: 70px;
		height: 70px;
		background: linear-gradient(0deg, #fffff8, #fffff8);
		border: 1px solid #7d51fa;
		border-radius: 13.7723px;
		transform: rotate(3.5deg);
		font-family: 'Manrope', sans-serif;
		font-style: normal;
		font-weight: 800;
		font-size: 22px;
		line-height: 33px;
		box-shadow: -5px -5px #7d51fa;
		z-index: 10;
	}
	.themeSelectorBox {
		color: #fff;
		display: flex;
		justify-content: space-between;
		align-items: center;
		margin-top: 1rem;
	}
	.selectATheme {
		font-family: 'Manrope', sans-serif;
		font-weight: 700;
		font-size: 14px;
		line-height: 19px;
		margin-right: 10px;
	}
	.themesBox {
		border: 1px solid #fff;
		border-radius: 8px;
		font-family: 'Manrope', sans-serif;
		font-size: 14px;
		font-weight: 600;
		cursor: pointer;
		position: relative;
		width: 150px;
		padding: 10px;
		text-align: left;
	}
	.themeContainer {
		position: absolute;
		top: calc(100% + 1px);
		left: 0%;
		opacity: 0;
		width: 100%;
		border-radius: 8px;
		transition: opacity 0.5s linear visibility 0.5s linear;
		margin-bottom: 5px;
		border: 1px solid #fff;
		z-index: 100;
		box-sizing: border-box;
		background-color: #3f1575;
		visibility: hidden;
		overflow: hidden;
	}
	.themes {
		display: flex;
		align-items: center;
		justify-content: space-between;
	}
	.themesBox:hover .themeContainer {
		opacity: 1;
		visibility: visible;
	}
	.theme {
		padding: 10px;
	}
	.theme:hover {
		background-color: #fff;
		color: #3f1575;
	}

	@media screen and (max-width: 1150px) {
		.blueH,
		.redH,
		.heading {
			font-size: 16px;
		}
		.player,
		.spymaster {
			font-size: 10px;
		}
		.name {
			font-size: 10px;
		}

		.vs {
			width: 60px;
			height: 60px;
			font-size: 0.9em;
		}
		.emptyTeamMsg {
			font-size: 10px;
		}
	}
	@media screen and (max-width: 1100px) {
		.teams {
			max-height: 250px;
		}
		::-webkit-scrollbar {
			width: 5px;
		}

		/* Track */
		::-webkit-scrollbar-track {
			background: #fff;
			border-radius: 2.5px;
		}

		/* Handle */
		::-webkit-scrollbar-thumb {
			background: #888;
			border-radius: 2.5px;
		}
	}
	@media screen and (max-width: 1000px) {
		.player,
		.spymaster {
			font-size: 11px;
		}
		.red,
		.blue {
			width: 30%;
		}
		.name {
			font-size: 11.5px;
		}
		.vs {
			font-size: 0.9em;
			font-size: 0.8em;
		}
		.emptyTeamMsg {
			font-size: 12px;
		}
	}
	@media screen and (max-width: 900px) {
		.red,
		.blue {
			width: 35%;
		}
	}
	@media screen and (max-height: 650px) {
		.teams {
			max-height: 230px;
		}
	}
</style>
