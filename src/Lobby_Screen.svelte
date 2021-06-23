<script>
    import { dbUser, dbUsers,dbDefault,dbDuet, dbThemeValue,dbPage, dbGameSessionRound,listenFirebaseKey} from "./database";
    import Tick from "./Tick.svelte";
    import LoadingSvg from './LoadingSvg.svelte';
    import DownSvg from './DownSvg.svelte';
    import DisconnectedSvg from './DisconnectedSvg.svelte';
    import { shuffleArray, create_NewArray_Of_List } from "./utils";

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
    let bluePlayerButtonText = "Choose Blue";
    let redPlayerButtonText = "Choose Red";
    let blueSpymasterButtonText = "Be Spymaster";
    let redSpymasterButtonText = "Be Spymaster";
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
    listenFirebaseKey(dbPage, dbPageRef => {
        dbPageRef.on('value',(snap)=>{
            if(!snap.exists()) {
                return;
            }
            page = snap.val();
        })
    })
    listenFirebaseKey(dbThemeValue, (dbThemeValueRef) => {
        dbThemeValueRef.on('value',(snap)=>{
            if(!snap.exists()) {
                return 
            }
            themeValue = snap.val();
        })
    })

    dbDefault.on('value',(snap)=>{
        if(!snap.exists()) {
            return;
        }
        defaultTheme = snap.val();
    })

    dbDuet.on('value',(snap)=>{
        if(!snap.exists()) {
            return;
        }
        duetTheme = snap.val();
    })
    
    
    dbUsers.on('value',(snap)=>{
        if(!snap.exists()) {
            return ;
        }
        usersList = snap.val();
    })

    dbUser.on('value',(snap)=>{
        if(!snap.exists()) {
            return ;
        }
        currUser = snap.val();
        isSpymaster = currUser.spymaster;
    })
    $: {
        if(currUser) {
            team = currUser.team;
            userId = currUser.id;
            isSpymaster = currUser.spymaster;
        }
    }
    $: {
        if(team) {
            if(isSpymaster) {
                bluePlayerButtonText = "Choose Blue";
                redPlayerButtonText = "Choose Red";

                redSpymasterButtonText = "Be Spymaster";
                blueSpymasterButtonText = "Be Spymaster";
                if(team === "Red") {
                    redSpymasterButtonText = "Spymaster";
                }
                else if(team === "Blue") {
                    blueSpymasterButtonText = "Spymaster";
                }
            }
            else {
                redSpymasterButtonText = "Be Spymaster";
                blueSpymasterButtonText = "Be Spymaster";
                if(team === "Red") {
                    redPlayerButtonText = "Picked Red";
                    bluePlayerButtonText = "Choose Blue";
                }
                else if(team === "Blue") {
                    bluePlayerButtonText = "Picked Blue";
                    redPlayerButtonText = "Choose Red";
                }
            }
        }
        else {
            bluePlayerButtonText = "Choose Blue";
            redPlayerButtonText = "Choose Red";
        }
    }
    $: {
        redTeam = [];
        blueTeam = [];
        redTeam_has_Spymaster = false;
        blueTeam_has_Spymaster = false;
        for(const id in usersList)
        {
            user = usersList[id];
            // Code when new user visit game after game has been started.
            if(user.id === userId && !user.team) {
                if(team === "Blue" && allUserOnlineStatus[user.id]) {
                    blueTeam.push(user);
                }
                else if(team === "Red" && allUserOnlineStatus[user.id]) {
                    redTeam.push(user);
                }
            }
            else if(user.team === "Blue")
            {
                //make sure that blue team has one online spymaster only
                if(user.spymaster && allUserOnlineStatus[user.id]) {
                    if(blueTeam_has_Spymaster) {
                        user.spymaster = false;

                        // make update to the database and make him normal player
                        if(user.id === userId) {
                            isSpymaster = false;
                        }
                        dbUsers.child(user.id).update({
                            spymaster : false
                        })
                    }
                    else {
                        blueTeam_has_Spymaster = true;
                    }
                }
                
                blueTeam.push(user);
            }
            else if(user.team === "Red")
            {
                if(user.spymaster === true && allUserOnlineStatus[user.id]) {
                    if(redTeam_has_Spymaster) {
                        user.spymaster = false;

                        if(user.id === userId) {
                            isSpymaster = false;
                        }
                        // make update to the database and make him normal player
                        
                        dbUsers.child(user.id).update({
                            spymaster : false
                        })
                    }
                    else {
                        redTeam_has_Spymaster = true;
                    }
                }
                
                redTeam.push(user);
            }

        }
        blueTeam = blueTeam;
        redTeam = redTeam;
    }
    $ : {
        if(redTeam_has_Spymaster) {
            disableRedSpymasterBtn = true;
        }
        else {
            disableRedSpymasterBtn = false;
        }
    }
    $ : {
        if(blueTeam_has_Spymaster) {
            disableBlueSpymasterBtn = true;
        }
        else {
            disableBlueSpymasterBtn = false;
        }
    }
    $:{
        onlineBlueTeam = blueTeam.filter((blueUser)=> allUserOnlineStatus[blueUser.id]);
        onlineRedTeam = redTeam.filter((redUser)=> allUserOnlineStatus[redUser.id]);
    }
    $ : {
        if( onlineBlueTeam.length > 1 && onlineRedTeam.length > 1 && redTeam_has_Spymaster && blueTeam_has_Spymaster && team) {

            disableStartGameBtn = false;
        }
        else {
            disableStartGameBtn = true;
        }
    }
    $ : {
        if(disableStartGameBtn) {
            if(!team) {
                alertDivText = "Please join one of the two team"
            }
            else {
                alertDivText = "Need atleast 2 online Player and 1 online Spymaster in each team !!!"
            }
        }
    }
    $: {
        if(!themeValue) {
            themeValue = 'Default';
        }
        if(themeValue === "Default") {
            wordList = defaultTheme;
        }
        else if(themeValue === "Duet") {
            wordList = duetTheme;
        }
    }

    function keepUpdatingUsersOnlineStatus() {
        setInterval(updateUsersOnlineStatus, 1000);
    }
    let allUserOnlineStatus = {};
    function updateUsersOnlineStatus() {
        for(const id in usersList) {
            user = usersList[id];
            if( (user.online === true) || (Date.now() - user.online <= 5000) ) {
                allUserOnlineStatus[user.id] = true;
            }
            else {
                allUserOnlineStatus[user.id] = false;
            }
        }
    }
    updateUsersOnlineStatus();

    function handle_Blue_Player_Btn(){
        if(page && page !== 'Lobby Screen') {
            team = "Blue";
            return ;
        }
        dbUser.update({
            team : "Blue",
            spymaster : false
        })
    }

    function handle_Red_Player_Btn(){
        if(page && page !== 'Lobby Screen') {
            team = "Red";
            return ;
        }
        dbUser.update({
            team : "Red",
            spymaster : false
        })
    }

    function handle_Blue_Spymaster_Btn(){
        dbUser.update({
            spymaster : true,
            team : "Blue"
        })
    }

    function handle_Red_Spymaster_Btn(){
        
        dbUser.update({
            spymaster : true,
            team : "Red"
        })
    }
    function setShuffledWordList() {
        shuffledWordList = shuffleArray(wordList).slice(0,25);
        shuffledWordList = create_NewArray_Of_List(shuffledWordList);
        shuffledWordList = shuffleArray(shuffledWordList);

        for(let i = 0; i<shuffledWordList.length ; i++) {
            shuffledWordList[i]["id"] = i;
        }
    }
    function makeSureEachTeamHaveOneSpymaster() {
        let redHasSpymaster = false;
        let blueHasSpymaster = false;
        for(const id in usersList) {
            let thisUser = usersList[id];
            if(thisUser.team === 'Blue') {
                if(thisUser.spymaster) {
                    if(blueHasSpymaster) {
                        thisUser.spymaster = false;
                        dbUsers.child(thisUser.id).update({
                            spymaster : false
                        })
                    }
                    else {
                        blueHasSpymaster = true;
                    }
                }
            }
            else if(thisUser.team === 'Red') {
                if(thisUser.spymaster) {
                    if(redHasSpymaster) {
                        thisUser.spymaster = false;
                        dbUsers.child(thisUser.id).update({
                            spymaster : false
                        })
                    }
                    else {
                        redHasSpymaster = true;
                    }
                }
            } 
        }
    }
    function handle_Start_Game_Btn(){
        if(page && page !== 'Lobby Screen') {
            dbUser.update({
                team ,
                spymaster : false
            });
            return ;
        }
        makeSureEachTeamHaveOneSpymaster();
        setShuffledWordList();
        logsArray.push({
            actor : currUser,
            action : "has started the game",
            isWordSelected : false
        });
        listenFirebaseKey(dbGameSessionRound,(dbGameSessionRoundRef)=>{
            dbGameSessionRoundRef.update({
                page : "Lobby",
                time : Date.now() + 6000,
                shuffledWordList,
                turn : "Red",
                redScore : 9,
                blueScore : 8,
                gameStarter : currUser.userName,
                logsArray
            })
        })
        
    }
    function changeThemeValue(newThemeValue) {
        listenFirebaseKey(dbGameSessionRound,(dbGameSessionRoundRef)=>{
            dbGameSessionRoundRef.update({
                themeValue : newThemeValue
            })
        })
        
    }

    function processName(user){
        let name = user.userName;
        let fname = name?.split(" ")[0];
        if(fname?.length > 10)
        {
            fname = fname.slice(0,8) + "...";
        }
        if(user.spymaster) {
            fname = fname + " (Spymaster)";
        }
        else if(user.id === userId) {
            fname = fname + " (You)";
        }
        return fname;
    }

    // Call keep updating users online status
    keepUpdatingUsersOnlineStatus();
</script>
<main>
    <div class = "gameHeading">
        <img class = "codenamePng" src = '/images/codenames-logo.png' alt = "codenamesPng">
    </div>
    <div class = "container">
        <div class = "heading">
            Choose a team you want to join
        </div>
        <div class = "teams">
            <div class = "blue">
                <div class = "blueH">Blue Team ({blueTeam.length})</div>
                
                <div class = "user-list">
                    <div class = "users">
                        {#if blueTeam.length === 0}
                            <div class = "emptyTeamMsg">Empty team ...</div>
                        {/if}
                        {#each blueTeam as user}
                            <div class="user">
                                <div class = "userDetails">
                                    {#if user.profilePicture}
                                        <img class = "profilePicture" src = {user.profilePicture} alt = "UserProfilePicture">
                                    {:else}
                                        <div class="fakeProfilePicture"> {user.userName[0].toUpperCase()} </div>
                                    {/if}
                                    <div class="name"> {processName(user)} </div>
                                </div>
                                {#if allUserOnlineStatus[user.id] }
                                    {#if user.online === true}
                                        <Tick/>
                                    {:else}
                                        <LoadingSvg/>
                                    {/if}
                                {:else}
                                    <DisconnectedSvg/>
                                {/if}
                            </div>
                        {/each}
                    </div>
                </div>

                <div class = "btn">
                    <button class = "player" class:disabledBluePlayerBtn = {team === "Blue" && !isSpymaster} on:click = {handle_Blue_Player_Btn}> {bluePlayerButtonText} </button>
                    {#if !page || page === 'Lobby Screen'}
                        <button class = "spymaster" class:disabledBlueSpymasterBtn = {disableBlueSpymasterBtn} id = "blueSpymasterBtn" on:click = {handle_Blue_Spymaster_Btn}>{blueSpymasterButtonText}</button>
                    {/if}
                </div>
            </div>

            <div class  = "vsBox">
                <div class = "vs"> VS </div>         
            </div>

            <div class = "red">
                <div class = "redH">Red Team ({redTeam.length})</div>

                <div class = "user-list">
                    <div class = "users">
                        {#if redTeam.length === 0}
                            <div class="emptyTeamMsg">Empty team ...</div>
                        {/if}
                        {#each redTeam as user}
                            <div class="user">
                                <div class="userDetails"> 
                                    {#if user.profilePicture}
                                        <img class = "profilePicture" src = {user.profilePicture} alt = "UserProfilePicture">
                                    {:else}
                                        <div class="fakeProfilePicture"> {user.userName[0].toUpperCase()} </div>
                                    {/if}
                                    <div class = "name">
                                        {processName(user)} 
                                    </div>
                                </div>
                                {#if allUserOnlineStatus[user.id] }
                                    {#if user.online === true}
                                        <Tick/>
                                    {:else}
                                        <LoadingSvg/>
                                    {/if}
                                {:else}
                                    <DisconnectedSvg />
                                {/if}
                            </div>
                        {/each}
                    </div>
                </div>
                <div class = "btn">
                    <button class = "player" class:disabledRedPlayerBtn = {team === "Red" && !isSpymaster} on:click = {handle_Red_Player_Btn}> {redPlayerButtonText} </button>
                    {#if !page || page === 'Lobby Screen'}
                        <button class = "spymaster" class:disabledRedSpymasterBtn = {disableRedSpymasterBtn} on:click = {handle_Red_Spymaster_Btn}> {redSpymasterButtonText} </button>
                    {/if}
                </div>
            </div>
        </div>
        {#if !page || page === 'Lobby Screen'}
            <div class="themeSelectorBox">
                <div class = "selectATheme">
                    Select a theme
                </div>
                <div class = themesBox>
                    <div class="themes">
                        {themeValue}
                        <DownSvg/>
                    </div>
                    
                    <div class="themeContainer">
                        <div class="theme" on:click = {()=> changeThemeValue("Default")}>
                            Default
                        </div>
                        <div class="theme" on:click = {()=> changeThemeValue("Duet")}>
                            Duet
                        </div>
                    </div>
                </div>
            </div>
        {/if}
        <button class = "startBtn" class:disabledStartBtn = {disableStartGameBtn === true} on:click = {handle_Start_Game_Btn} disabled = {disableStartGameBtn} style = "cursor : {disableStartGameBtn ? "not-allowed" : "pointer"}">
            <div class = "btnText">Start Game</div>
            <div class = "btnArrow">
                <svg width="23" height="15" viewBox="0 0 23 15" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M1.25391 5.94377L14.5352 4.94377V1.79534C14.5352 1.46721 14.6953 1.22112 15.0156 0.975025C15.3359 0.892994 15.6563 0.892993 15.8945 1.05706C19.1758 3.35393 22.2969 7.20159 22.375 7.36565C22.4531 7.5219 22.5273 7.75627 22.5313 7.92034C22.5313 7.92424 22.5352 7.93206 22.5352 7.93596C22.5352 8.10002 22.457 8.34612 22.375 8.42815C22.2969 8.59221 19.2539 12.4516 15.8945 14.7485C15.5742 14.9125 15.2539 14.9946 15.0156 14.8305C14.6953 14.6664 14.5352 14.4203 14.5352 14.0922V10.9438L1.25391 9.94377C0.855469 9.62346 0.535156 8.81877 0.535156 7.93596C0.535156 7.13909 0.773438 6.26409 1.25391 5.94377Z" fill="#343E98"/>
                </svg>	
            </div>
        </button>
        <div class = "alertDiv">
            {alertDivText}
        </div>
    </div>
</main>

<style>
   @import url('https://fonts.googleapis.com/css2?family=Manrope:wght@600;700;800&display=swap');

    
   ::-webkit-scrollbar {
        width: 10px;
    }

    /* Track */
    ::-webkit-scrollbar-track {
        background: #fff;
        border-radius : 5px;
    }

    /* Handle */
    ::-webkit-scrollbar-thumb {
        background: #888;;
        border-radius : 5px;
    }
    ::-webkit-scrollbar-thumb:hover {
        background: rgb(70, 69, 69);
        cursor : pointer;
    }
    main{
        background-image : url(/images/background.svg);
        border-radius: 20px;
        background-size: 100% 100%;
        width : 100%;
        height : 100%;
        text-align : center;
    }
    .gameHeading{
        padding : 3%;
    }
    .codenamePng {
        height : 60px;
    }
    
    .container{
        display: flex;
        flex-direction : column;
        align-items : center;
        justify-content: center;
        width : 100%;
    }
    .heading{
        color : #fff;
        font-family: 'Manrope', sans-serif;
        font-size : 18px;
        line-height: 24px;
        margin-bottom : 1.5%;
        font-weight : 700;
    }

    .teams{
        position : relative;
        display : flex;
        justify-content: center;
        width : 100%;
        max-height : 275px;
    }
    .red,.blue{
        position: relative;
        display : flex;
        flex-direction: column;
        justify-content: space-between;
        align-items: center;
        padding : 15px;
        width : 25%;
        height : auto;
        background: #ffffff;
        border-radius : 15px;
        margin : 0px;
    }
    .blue{
        box-shadow : -5px -5px #5E96E8;
    }
    .red{
        box-shadow: -5px -5px #E96143;
    }
    .blueH{
        font-family: 'Manrope', sans-serif;
        font-style: normal;
        font-weight: 800;
        font-size: 20px;
        line-height: 28px;
        text-align: center;
        color: #5E96E8;
    }
    .redH{
        font-family: 'Manrope', sans-serif;
        font-style: normal;
        font-weight: 800;
        font-size: 20px;
        line-height: 28px;
        text-align: center;
        color: #E96143;
    }
    .user-list{
        max-height : 100px;
        width : 85%;
        max-height : 50%;
        margin : 5% 5%;
        background-color: #fff;
        border-radius: 15px;
        padding : 5px;
    }
    .blue > .user-list{
        border: 1px solid #5E96E8;
    }
    .red > .user-list{
        border: 1px solid #E96143;
    }
    .users{
        overflow : auto;
        max-height : 100%;
    }
    .emptyTeamMsg{
        font-size : 16px;
        color : grey;
        font-style: oblique;
    }
    .user{
        display : flex;
        justify-content: space-between;
        align-items: center;
        padding : 5px;
        overflow-x : hidden;
    }
    .userDetails {
        display : flex;
        align-items: center;
        justify-content: flex-start;
    }
    .profilePicture {
        width : 20px;
        height : 20px;
        border-radius : 50%;
        margin-right : 5px;
    }
    .fakeProfilePicture{
        min-width : 20px;
        min-height : 20px;
        max-width : 20px;
        max-height : 20px;
        font-size : 14px;
        color : white;
        font-weight : 700;
        display : flex;
        font-family : 'Manrope',sans-serif;
        justify-content: center;
        align-items : center;
        border-radius : 50%;
        background-color : #343E98;
        margin-right: 5px;
    }
    .name{
        font-family: 'Manrope',sans-serif;
        font-weight : 700;
        font-size : 14px;
        color: #0C0030;
        white-space : nowrap;
    }
    
    .btn{
        width : 100%;
        display : flex;
        justify-content: space-evenly;
        white-space : nowrap;
    }
    .player,.spymaster{
        border-radius: 41px;
        text-align : center;
        min-width : 40%;
        font-family : 'Manrope', sans-serif;
        font-size : 14px;
        font-weight : 800;
        line-height: 24px;
        letter-spacing : 0.5px;
        padding : 5px 10px;
        cursor : pointer;
    }
     
    .disabledRedPlayerBtn,.disabledBluePlayerBtn {
        cursor : text;
    }
    .disabledBlueSpymasterBtn {
        opacity : 0.7;
        cursor : text;
    }
    .disabledRedSpymasterBtn {
        opacity : 0.7;
        cursor : text;
    }
    .blue .player{
        background-color : #5E96E8;
        color : #ffffff;
    }
    .red .player{
        background-color : #E96143;
        color : #ffffff;
    }
    .spymaster{
        background-color: #ffffff;
        border-color : black;
        color : #333333f2;
    }
    .vsBox {
        display : flex;
        align-items : center;
        z-index : 1;
    }
    .vs{
        display : flex;
        align-items: center;
        justify-content: center;
        width : 70px;
        height : 70px;
        background: linear-gradient(0deg, #FFFFF8, #FFFFF8);
        border: 1px solid #7D51FA;
        border-radius: 13.7723px;
        transform: rotate(3.5deg);
        font-family: 'Manrope', sans-serif;
        font-style: normal;
        font-weight: 800;
        font-size: 22px;
        line-height: 33px;
        box-shadow: -5px -5px #7D51FA;
        z-index : 10;
    }
    .themeSelectorBox {
        color : #fff;
        display : flex;
        justify-content: space-between;
        align-items: center;
        margin-top : 20px;
    }
    .selectATheme {
        font-family : 'Manrope' , sans-serif;
        font-weight : 700;
        font-size : 14px;
        line-height : 19px;
        margin-right : 10px;
    }
    .themesBox {
        border : 1px solid #fff;
        border-radius : 8px;
        font-family : 'Manrope' , sans-serif;
        font-size : 14px;
        font-weight : 600;
        cursor : pointer;
		position : relative;
        width : 150px;
        padding : 10px;
        text-align: left;
    }
    .themeContainer {
        position : absolute;
		top : calc(100% + 1px);
        left : 0%;
		opacity : 0;
        width : 100%;
        border-radius : 8px;
		transition : opacity .5s linear visibility 0.5s linear;
		margin-bottom : 5px;
        border : 1px solid #fff;
        z-index : 100;
        box-sizing: border-box;
        background-color: #3F1575;
        visibility: hidden;
        overflow : hidden;
    }
    .themes {
        display : flex;
        align-items : center;
        justify-content: space-between;
    }
    .themesBox:hover .themeContainer{
        opacity: 1;
        visibility : visible;
    }
    .theme {
        padding : 10px;
    }
    .theme:hover{
        background-color: #fff;
        color : #3F1575;
    }
    
    .startBtn{
		display : flex;
        background : #ffffff;
        align-items : center;
		box-shadow: 0px 4px 4px rgba(0, 0, 0, 0.25), inset 0px -8px 0px #98C8E2;
		border-radius: 30px;
        padding : 10px 20px;
        margin-top : 20px;
	}
    .startBtn:hover {
        box-shadow: 0px 4px 4px rgba(0, 0, 0, 0.25), inset 0px -6px 0px #98C8E2;
    }
    
	.startBtn:hover .btnText{
		transform: scale3d(1.05,1.05,1.25);
	}
	.startBtn:hover .btnArrow{
		transform: scale3d(1.05,1.05,1.25);
	}
	.startBtn:focus{
		box-shadow: 0px 0px 0px;
	}
	.btnText{
		color: #343E98;
        font-family: 'Manrope', sans-serif;
        font-weight : 900;
        font-size : 18px;
	}
	.btnArrow{
		margin : 8px;
	}
    .alertDiv{
        color : white; 
        padding : 8px;
        font-family: 'Manrope', sans-serif;
        font-weight : 700;
        font-size : 14px;
        visibility : hidden;
    }
    .disabledStartBtn:hover + .alertDiv{
        visibility : visible;
    }
    @media screen and (max-width : 1150px) {
        .blueH,.redH,.heading {
            font-size : 16px;
        }
        .player,.spymaster {
            font-size : 10px;
        }
        .name {
            font-size: 10px;
        }

        .vs {
            width : 60px;
            height : 60px;
            font-size : 0.9em;
        }
        .emptyTeamMsg{
            font-size : 10px;
        }
        .btnText {
            font-size : 16px;
        }
    }
    @media screen and (max-width : 1100px) {
        .teams {
            max-height : 250px;
        }
        ::-webkit-scrollbar {
            width: 5px;
        }

        /* Track */
        ::-webkit-scrollbar-track {
            background: #fff;
            border-radius : 2.5px;
        }

        /* Handle */
        ::-webkit-scrollbar-thumb {
            background: #888;;
            border-radius : 2.5px;
        }
    }
    @media screen and (max-width : 1000px) {
        .startBtn {
            padding : 5px 10px;
        }
        .player,.spymaster {
            font-size : 11px;
        }
        .red,.blue {
            width : 30%;
        }
        .name {
            font-size : 11.5px;
        }
        .vs {
            font-size : 0.9em;
            font-size : 0.8em
        }
        .emptyTeamMsg {
            font-size : 12px;
        }
        .btnText {
            font-size : 0.70rem;
        }
    }
    @media screen and (max-width : 900px){
        .red,.blue {
            width : 35%;
        }
    }
    @media screen and (max-height : 650px) {
        .teams {
            max-height : 230px;
        }
    }
    
</style>