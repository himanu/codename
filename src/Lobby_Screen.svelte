<script>
    import { dbUser, dbUsers, dbGameSession ,dbDeepUndercover,dbDefault,dbDuet, dbThemeValue,dbPage} from "./database";
    import Tick from "./Tick.svelte";
    import LoadingSvg from './LoadingSvg.svelte';
    import CodeName from "./CodeName.svelte";
    import DownSvg from './DownSvg.svelte';
    import { getParams, shuffleArray, create_NewArray_Of_List } from "./utils";

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
    let deepUndercoverTheme;
    let defaultTheme;
    let duetTheme;
    let onlineBlueTeam = [];
    let onlineRedTeam = [];
    let isSpymaster = false;
    let logsArray = [];
    let page;
    let alertDivText;
    
    dbPage.on('value',(snap)=>{
        if(!snap.exists) {
            return;
        }
        page = snap.val();
        console.log(page);
    })
    dbThemeValue.on('value',(snap)=>{
        if(!snap.exists) {
            return ;
        }
        themeValue = snap.val();
    })
    dbDeepUndercover.on('value',(snap)=>{
        if(!snap.exists) {
            return;
        }
        deepUndercoverTheme = snap.val();
    })

    dbDefault.on('value',(snap)=>{
        if(!snap.exists) {
            return;
        }
        defaultTheme = snap.val();
    })

    dbDuet.on('value',(snap)=>{
        if(!snap.exists) {
            return;
        }
        duetTheme = snap.val();
    })
    
    dbUsers.on('value',(snap)=>{
        if(!snap.exists) {
            return ;
        }
        usersList = snap.val();
    })

    dbUser.on('value',(snap)=>{
        if(!snap.exists) {
            return ;
        }
        currUser = snap.val();
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

            if(user.id === userId && !user.team) {
                if(team === "Blue" && allUserOnlineStatus[userId]) {
                    blueTeam.push(user);
                }
                else if(team === "Red" && allUserOnlineStatus[userId]) {
                    redTeam.push(user);
                }
            }
            else if(user.team === "Blue")
            {
                redTeam = redTeam.filter((player)=>{
                    return player.id != user.id;
                })
                
                //make sure that blues team has one spymaster only
                if(user.spymaster && allUserOnlineStatus[user.id]) {
                    if(blueTeam_has_Spymaster) {
                        user.spymaster = false;
                    }
                    else {
                        blueTeam_has_Spymaster = true;
                    }
                }
                
                blueTeam.push(user);
            }
            else if(user.team === "Red")
            {
                blueTeam = blueTeam.filter((player)=>{
                    return player.id != user.id;
                })

                if(user.spymaster === true && allUserOnlineStatus[user.id]) {
                    if(redTeam_has_Spymaster) {
                        user.spymaster = false;
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
        else if(themeValue === "Deep Undercover") {
            wordList = deepUndercoverTheme;
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
            if( (user.online === true) || (Date.now() - user.online <= 10000) ) {
                allUserOnlineStatus[user.id] = true;
            }
            else {
                allUserOnlineStatus[user.id] = false;
            }
        }
    }
    function handle_Blue_Player_Btn(){
        if(page) {
            team = "Blue";
            return ;
        }
        dbUser.update({
            team : "Blue",
            spymaster : false
        })
    }

    function handle_Red_Player_Btn(){
        if(page) {
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
    function handle_Start_Game_Btn(){
        if(page) {
            dbUser.update({
                team ,
                spymaster : false
            });
            return ;
        }
        setShuffledWordList();
        logsArray.push({
            actor : user,
            action : "has started the game"
        });
        dbGameSession.update({
            page : "Lobby",
            time : 5,
            shuffledWordList,
            turn : "Red",
            redScore : 9,
            blueScore : 8,
            gameStarter : currUser.userName,
            logsArray
        })
    }
    function changeThemeValue(newThemeValue) {
        dbGameSession.update({
            themeValue : newThemeValue
        })
    }

    function processName(user){
        let name = user.userName;
        let fname = name.split(" ")[0];
        if(fname.length > 10)
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
        <CodeName/> 
    </div>
    <div class = "container">
        <div class = "heading">
            Choose a team you want to join
        </div>
        <div class = "teams">
            <div class = "blue">
                <div class = "blueH">Blue Team({blueTeam.length})</div>
                
                <div class = "user-list">
                    <div class = "users">
                        {#if blueTeam.length === 0}
                            <div class = "emptyTeamMsg">Empty team ...</div>
                        {/if}
                        {#each blueTeam as user}
                            <div class="user">
                                <div class = "userDetails">
                                    <img class = "profilePicture" src = {user.profilePicture} alt = "UserProfilePicture">
                                    <div class="name"> {processName(user)} </div>
                                </div>
                                {#if allUserOnlineStatus[user.id] }
                                    <Tick/>
                                {:else}
                                    <LoadingSvg/>
                                {/if}
                            </div>
                        {/each}
                    </div>
                </div>

                <div class = "btn">
                    <button class = "player" class:disabledBluePlayerBtn = {team === "Blue" && !isSpymaster} on:click = {handle_Blue_Player_Btn}> {bluePlayerButtonText} </button>
                    <button class = "spymaster" class:disabledBlueSpymasterBtn = {disableBlueSpymasterBtn} id = "blueSpymasterBtn" on:click = {handle_Blue_Spymaster_Btn}>{blueSpymasterButtonText}</button>
                </div>
            </div>

            <div class  = "vs">
                VS          
            </div>

            <div class = "red">
                <div class = "redH">Red Team({redTeam.length})</div>

                <div class = "user-list">
                    <div class = "users">
                        {#if redTeam.length === 0}
                            <div class="emptyTeamMsg">Empty team ...</div>
                        {/if}
                        {#each redTeam as user}
                            <div class="user">
                                <div class="userDetails"> 
                                    <img class = "profilePicture" src = {user.profilePicture} alt = "UserProfilePicture">
                                    <div class = "name">
                                        {processName(user)} 
                                    </div>
                                </div>
                                {#if allUserOnlineStatus[user.id] }
                                    <Tick class = 'onlineStatus'/>
                                {:else}
                                    <LoadingSvg class = 'onlineStatus'/>
                                {/if}
                            </div>
                        {/each}
                    </div>
                </div>
                <div class = "btn">
                    <button class = "player" class:disabledRedPlayerBtn = {team === "Red" && !isSpymaster} on:click = {handle_Red_Player_Btn}> {redPlayerButtonText} </button>
                    <button class = "spymaster" class:disabledRedSpymasterBtn = {disableRedSpymasterBtn} on:click = {handle_Red_Spymaster_Btn}> {redSpymasterButtonText} </button>
                </div>
            </div>
        </div>
        {#if !page}
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
                        <div class="theme" on:click = {()=> changeThemeValue("Deep Undercover")}>
                            Deep Undercover
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

   *::-webkit-scrollbar,
    *::-webkit-scrollbar-thumb {
        width: 26px;
        border-radius: 13px;
        border: 10px solid transparent;
        color : #2A337E;
    }

    *::-webkit-scrollbar-thumb {        
        box-shadow: inset 0 0 0 10px;
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
        height : auto;
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
        margin : 0px 30px;
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
        margin : 5% 5%;
        background-color: #fff;
        border-radius: 15px;
        padding : 10px 5px 10px 10px;
    }
    .blue > .user-list{
        border: 1px solid #5E96E8;
    }
    .red > .user-list{
        border: 1px solid #E96143;
    }
    .users{
        width : 100%;
        height : 100%;
        overflow-y: scroll;
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
        padding : 5px 10px 5px 5px;
        width : 100%;
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
    .name{
        font-family: 'Manrope',sans-serif;
        font-weight : 700;
        font-size : 14px;
        color: #0C0030;
    }
    
    .btn{
        width : 100%;
        display : flex;
        justify-content: space-evenly;
    }
    .player,.spymaster{
        border-radius: 41px;
        text-align : center;
        min-width : 40%;
        font-family : 'Manrope';
        font-size : 16px;
        font-weight : 900;
        line-height: 24px;
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
    }
    .vs{
        position : absolute;
        bottom : 30%;
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
        width : 300px;
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
		top : 100%;
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
        margin : 10px 0px;
        padding-left : 10px;
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
        .blueH,.redH {
            font-size : 0.9em;
        }
        .player,.spymaster {
            font-size : 0.7em;
        }
        .vs {
            width : 60px;
            height : 60px;
            font-size : 0.9em;
        }
        .heading {
            font-size : 0.8em;
        }
        .emptyTeamMsg{
            font-size : 14px;
        }
        .btnText {
            font-size : 16px;
        }
    }
    @media screen and (max-width : 1000px), screen and (max-height : 670px) {
        .player,.spymaster {
            font-size : 0.6em;
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
            font-size : 15px;
        }
    }
</style>