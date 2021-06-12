<script>
    import CodeName from "./CodeName.svelte";
    import Cross from "./Cross.svelte";
    import { beforeUpdate, afterUpdate } from 'svelte';
    import { dbGameSession, dbUser, dbUsers, dbWordList, dbTurn, dbClue, dbLogsArray,dbLastWordSelected,dbBlueScore,dbRedScore} from "./database";
    import LoadingSvg from "./LoadingSvg.svelte";
    import Tick from "./Tick.svelte";
    import { getParams } from './utils';
import DownSvg from "./DownSvg.svelte";

    let wordList = [];
    let team;
    let user;
    let profile_picture_border_color;
    let turn;
    let clue;
    let resultDeclared = false;
    let winner;
    let looser;
    let clueWord,clueWord_Count = 1;
    let clueSenderTeam;
    let redTeam = [],blueTeam = [];
    let is_This_User_Turn;
    let redScore = 9, blueScore = 8;
    let lastWordSelected;
    let selectedInfoType = 0;
    let selectedInfoTypeTimeout;
    let showSelectedInfo = false;
    let tableBorderColor;
    let clueMsgTeamIdentifierColor;
    let postWordClickMsg;
    let logsArray = [];
    let allUsersOnlineStatus = {};
    let logsdiv;
    let autoscroll;
    let clueCount = [1,2,3,4,5,6,7,8,9];
    let blueTeam_has_Spymaster = false;
    let redTeam_has_Spymaster = false;
    let logsLength;
    let tableBorderMap = {
        0 : "#4C1A96",
        1 : "#3FAB8B",
        2 : "#E1BC36",
        3 : "#9C9C9C",
        4 : "#3FAB8B",
        5 : "#E1BC36",
        6 : "#3FAB8B",
        7 : "#3B3B3B",
        8 : "#3FAB8B",
        9 : "#5E96E8",
        10 : '#E44C4F'
    }

    //user Profile picture
    let userProfilePicture = getParams('userProfilePicture');
    let userName = getParams('userName');
    let userId = getParams('userId');
    let users;

    //To know whether this player is spymaster or not and to determine the border-color of profile picture
    dbUser.on('value',(snap)=>{
        if(!snap.exists)
        return;
        user = snap.val();
    })

    //To fill redTeam and blueTeam
    dbUsers.on('value',(snap)=>{
        if(!snap.exists) {
            return;
        }

        users = snap.val();
    })

    
    dbClue.on('value',(snap)=>{
        if(!snap.exists){
            return;
        }
        clue = snap.val();
    })

    dbTurn.on('value',(snap)=>{
        if(!snap.exists){
            return;
        }
        turn = snap.val();
    })

    dbWordList.on('value',(snap)=>{
        if(!snap.exists){
            return;
        }
        wordList = snap.val();
    })

    //new code added
    dbBlueScore.on('value',(snap)=>{
        if(!snap.exists) {
            return; 
        }
        blueScore = snap.val();
    })
    dbRedScore.on('value',(snap)=>{
        if(!snap.exists) {
            return;
        }
        redScore = snap.val();
    })

    dbLastWordSelected.on('value',(snap)=>{
        if(!snap.exists) {
            return;
        }
        lastWordSelected = snap.val();
    })

    dbLogsArray.on('value',(snap)=>{
        if(!snap.exists) {
            return;
        }
        logsArray = snap.val();
        if(logsdiv){
            logsdiv.scrollTo(0, logsdiv.scrollHeight);
        }
    })


    $: {
        if(lastWordSelected || turn) {
            showSelectedInfo = true;
            updateSelectionInfoType();
        }
    }
    $: {

        if(lastWordSelected) {
            if(lastWordSelected.color === lastWordSelected.selectorTeam && team === lastWordSelected.color){
                selectedInfoType = 1;
                postWordClickMsg = "";
            }
            else if(lastWordSelected.color === lastWordSelected.selectorTeam && team !== lastWordSelected.color){
                selectedInfoType = 2;
                postWordClickMsg = "";
            }
            else if(lastWordSelected.color === "Grey" && team !== turn){
                selectedInfoType = 3;
                postWordClickMsg = "Grey word selected by mistake and your team chance is passed";
            }
            else if(lastWordSelected.color === "Grey" && team === turn){
                selectedInfoType = 4;
                postWordClickMsg = "Your opponent team choose grey word by mistake and now it's your team turn";
            }
            else if(lastWordSelected.color === "Black" && team === turn){
                selectedInfoType = 7;
                resultDeclared = true;
                looser = team;
            }
            else if(lastWordSelected.color === "Black" && team !== turn){
                selectedInfoType = 8;
                resultDeclared = true;
                winner = team;
            }
            else if(lastWordSelected.color !== lastWordSelected.selectorTeam && team !== turn){
                selectedInfoType = 5;
                postWordClickMsg = "Uff! Opponent's word is selected by mistake, they get a free word and your team chance is passed.";
            }
            else if(lastWordSelected.color !== lastWordSelected.selectorTeam && team === turn){
                selectedInfoType = 6;
                postWordClickMsg = "Hurrah! Your opponent choose your's team word by mistake, your team get a free word and now it's your team turn."
            }
        }
        else if(clue) {
            postWordClickMsg = '';
            if(turn === "Blue") {
                selectedInfoType = 9;
            }
            else if(turn === "Red") {
                selectedInfoType = 10;
            }
        }
        else if(turn) {
            if( turn === "Blue") {
                selectedInfoType = 9;
            }
            else if(turn === "Red") {
                selectedInfoType = 10;
            }
            postWordClickMsg = '';
        }
        else {
            selectedInfoType = 0;
        }
    }
    function updateSelectionInfoType() {
        clearTimeout(selectedInfoTypeTimeout);

        selectedInfoTypeTimeout = setTimeout(()=>{
                showSelectedInfo = false;
        },5000);
    }
    $: {
        if(looser === "Red") {
            winner = "Blue";
        }
        else if(looser === "Blue") {
            winner = "Red";
        }
    } 
    $: {
        if(redScore === 0) {
            resultDeclared = true;
            winner = "Red";
            looser = "Blue";
        }
        else if(blueScore === 0) {
            resultDeclared = true;
            winner = "Blue";
            looser = "Red";
        }
    }

    $: {
        if(clue && clue.clueSenderTeam === team && turn === team && !isSpymaster) {
            is_This_User_Turn = true;
        }
        else {
            is_This_User_Turn = false
        }
    } 

    $: isSpymaster = user.spymaster;
    $: team = user.team;
    $: {
        if(team === "Blue") {
            profile_picture_border_color = "#5E96E8";
        }
        else if(team === "Red") {
            profile_picture_border_color = "#E44C4F";
        }
    }
    $: {
        if(clue) {
            if(clue.clueSenderTeam === "Red") {
                clueMsgTeamIdentifierColor = "#E44C4F";
            }
            else if(clue.clueSenderTeam === "Blue") {
                clueMsgTeamIdentifierColor = "#5E96E8";
            }
        }
        
    }
    $: {
        if(showSelectedInfo) {
            tableBorderColor = tableBorderMap[selectedInfoType];
        }
        else {
            tableBorderColor = tableBorderMap[0];
        }
    }

    $ : {
        if(users) {
            redTeam = [];
            blueTeam = [];
            redTeam_has_Spymaster = false;
            blueTeam_has_Spymaster = false;
            for(const id in users)
            {
                let currUser = users[id];
                if(currUser.team === "Red") {
                    redTeam.push(currUser);
                    if(currUser.spymaster && allUsersOnlineStatus[currUser.id]) {
                        redTeam_has_Spymaster  = true;
                    }
                }
                else if(currUser.team === "Blue"){
                    blueTeam.push(currUser);
                    if(currUser.spymaster && allUsersOnlineStatus[currUser.id]) {
                        blueTeam_has_Spymaster = true;
                    }
                }
            }
            redTeam = redTeam;
            blueTeam = blueTeam;
        }
    }


    function keepUpdatingUsersOnlineStatus() {
        setInterval(updateUsersOnlineStatus, 1000);
    }

    function updateUsersOnlineStatus() {

        for(const id in users) {
            let thisUser = users[id];
            if( (thisUser.online === true) || (Date.now() - thisUser.online <= 10000) ) {
                allUsersOnlineStatus[thisUser.id] = true;
            }
            else {
                allUsersOnlineStatus[thisUser.id] = false;
            }
        }
    }

    function checkWord(word) {
        if(!is_This_User_Turn)
        return ;
        
        let dbWord = dbWordList.child(word.id);

        dbWord.update({
            selectedBy : userId
        })
        
        word["selectorName"] = userName;
        word["selectorTeam"] = team;
        
        if(!logsArray) {
            logsArray = [];
        }
        logsArray.push({
            actor : user,
            action : " selects " + word.name
        })

        if(word.color === "Red") {
            dbGameSession.update({
                lastWordSelected : word,
                redScore : redScore - 1,
                logsArray
            }) 

            if(team !== "Red") {
                changeTurn();
            }
        }
        else if(word.color === "Blue") {
            dbGameSession.update({
                lastWordSelected : word,
                blueScore : blueScore - 1,
                logsArray
            })

            if(team != "Blue") {
                changeTurn();
            }
        }
        else if(word.color === "Grey") {
            dbGameSession.update({
                lastWordSelected : word,
                logsArray
            })
            changeTurn();
        }
        else if(word.color === "Black") {
            dbGameSession.update({
                lastWordSelected : word,
                logsArray
            })
        }
    }
    //to send clues to the other player
    function giveClue(event){
        showSelectedInfo = 0;
        event.preventDefault();
        if(!logsArray) {
            logsArray = [];
        }
        let actionString = " sends clue " + "(" +  clueWord + " x " + clueWord_Count + ")";
        logsArray.push({
            actor : user,
            action : actionString
        })
        dbGameSession.update({
            clue : {
                clueWord,
                clueWord_Count,
                senderName : userName,
                senderId : userId,
                clueSenderTeam : turn
            },
            lastWordSelected : null,
            logsArray
        })
    }

    function changeTurn() {
        showSelectedInfo = false;
        if(turn === "Red")
        {
            dbGameSession.update({
                turn : "Blue",
                lastWordSelected : null,
                clue : null
            })
        }
        else if(turn === "Blue")
        {
            dbGameSession.update({
                turn : "Red",
                lastWordSelected : null,
                clue : null
            })
        }
    }

    function handleEndTurnBtn() {
        if(!logsArray) {
            logsArray = [];
        }
        logsArray.push({
            actor : user,
            action : ` ended ${user.team} Turn button`
        })
        dbGameSession.update({
            logsArray
        });
        changeTurn();
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
    function handleRestartBtn() {
        dbGameSession.update({
            page : "Lobby Screen",
            lastWordSelected : null,
            clue : null,
            logsArray : null
        })
    }

    keepUpdatingUsersOnlineStatus();

</script>
<main>
    {#if resultDeclared}
        <div class="fadedBackground"></div>
        <div class = "result">
            {#if winner === team}
                <Tick/>
                <div class = "winning-btn">
                    Correct Answer
                    <svg class = "tick-cross" width="20" height="15" viewBox="0 0 14 10" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M11.9811 0L4.92831 7.0606L2.01749 4.15653L0.548828 5.62831L4.93091 10L13.4519 1.4697L11.9811 0Z" fill="white"/>
                    </svg>
                </div>
                <div class = "result-text"> {team} team won the game</div>
                <button class = "restart-game" on:click = {handleRestartBtn}>Restart Game</button>
            {:else}
                <Cross/>
                <div class="loosing-btn">
                    Wrong Answer!
                    <svg class = "tick-cross" width="15" height="15" viewBox="0 0 10 10" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path fill-rule="evenodd" clip-rule="evenodd" d="M8.56539 9.88682L9.96921 8.48294L6.46021 4.97406L9.87206 1.56233L8.46824 0.158459L5.05634 3.57024L1.48597 0L0.0821475 1.40387L3.65247 4.97406L0.0302734 8.59613L1.4341 10L5.05634 6.37789L8.56539 9.88682Z" fill="#FFEBEE"/>
                    </svg>
                        
                </div>
                <div class="result-text">Your team has lost the Game</div>
                <button class = "restart-game" on:click = {handleRestartBtn}>Restart Game</button>
            {/if}

        </div>
    {/if}
    <div class = "gameHeading">
        <div class = "spymaster-box">
            <img class = "spymasterProfilePicture" src = {userProfilePicture} alt = "Your Spymaster" style = "border : 3px solid {profile_picture_border_color}">
            <div class = "spymaster" style = "color : {profile_picture_border_color}">SPY MASTER</div>
        </div>
        <div class = "codename">
            <CodeName/> 
        </div>
        <div class="scorecard">
            <div class="blueScore">Blue Score - {blueScore}</div>
            <div class="redScore">Red Score - {redScore}</div>
        </div>
    </div>
    <div class = "table">
        <div class="word-matrix" style = "border : 6px solid {tableBorderColor};">
            {#each wordList as word}
                {#if isSpymaster || word.selectedBy}
                    {#if word.color === "Grey"}
                        <div class = "word greyTeamWord" class:selected = {word.selectedBy}> {word.name}</div>
                    {:else if word.color === "Red"}
                        <div class = "word redTeamWord" class:selected = {word.selectedBy}> {word.name}</div>
                    {:else if word.color === "Blue"}
                        <div class = "word blueTeamWord" class:selected = {word.selectedBy}> {word.name}</div>
                    {:else if word.color === "Black"}
                        <div class = "word blackTeamWord"> {word.name}</div>
                    {/if}
                {:else}
                    <div class = "word simpleWord" class:cursorPointer = {is_This_User_Turn} on:click = {checkWord(word)}> {word.name} </div>
                {/if}
            {/each}
        </div>
        {#if isSpymaster && team === turn }
            {#if (!clue)}
                <form class = "form-container" on:submit = {giveClue}>
                    <input type = "text" placeholder = "Clue ..." bind:value = {clueWord} class = "clueInputBox" required>
                    <div class = "clueCountWordBox">
                        <div class = "defaultClueCount">
                            x {clueWord_Count}
                            <DownSvg/>
                        </div>
                        <div class="clueCountList">
                            {#each clueCount as count}
                                <div class="clueCount" on:click= {()=> clueWord_Count = count}> x {count} </div>
                            {/each}
                        </div>
                    </div>
                    <button class = "give-clue-btn" type = "submit">
                        Give Clue
                    </button>
                </form>
                <div class = "sendClueMsg">
                    Send clue to your team
                </div>
            {/if}
            {#if clue && clue.clueSenderTeam === turn && team === turn}
                <div class="clueMsgBox">You have send clue {clue.clueWord} x {clue.clueWord_Count} words</div>
            {/if}
            {#if showSelectedInfo}
                <div class = "postWordClickMsgBox"> {postWordClickMsg} </div>
            {/if}
        {:else}
            {#if clue}
                <div class = "clueMsgBox">
                    <div class = "clueMsgTeamIdentifier" style = "background-color : {clueMsgTeamIdentifierColor}"> {turn.toUpperCase()}</div>
                    <div class = "clueMsg"> {clue.clueWord} x {clue.clueWord_Count} </div>
                </div>
            {:else if !isSpymaster && team === turn}
                <div class = "clueWaiting"> Waiting for clue </div>
            {/if}
            {#if showSelectedInfo}
                <div class="postWordClickMsgBox"> {postWordClickMsg} </div>
            {/if}
            {#if is_This_User_Turn}
                <button class="endTurnBtn" on:click = {handleEndTurnBtn}>End Turn</button>
            {/if}
        {/if}
    </div>
    <div class = "logsContainer" bind:this = {logsdiv}>
        {#if logsArray && logsArray.length !== 0}
            {#each logsArray as log}
                <div class="log">
                    <div class="logsActor" style = "color : {log.actor.team === "Red" ?"#E44C4F" : "#5E96E8"}">
                        {processName(log.actor)}
                    </div>
                    <div class="logsAction">
                        {log.action}
                    </div>
                </div>
            {/each}
        {/if}
    </div>
    <div class="blueTeam_List">
        <div class = "blue_heading">
            Blue Team
        </div>
        <div class = "userContainer">
            <div class = "users">
                {#each blueTeam as user}
                    <div class="user">
                        <div class="userDetails">
                            <img class = "userProfilePicture" src = {user.profilePicture} alt = "profilePicture">
                            <div class="userName"> { processName(user) }</div>
                        </div>
                        <div class="onlineStatus">
                            {#if allUsersOnlineStatus[user.id] }
                                <Tick/>
                            {:else}
                                <LoadingSvg/>
                            {/if}
                        </div>
                    </div>
                {/each}
            </div>
        </div>
    </div>
    <div class="redTeam_List">
        <div class = "red_heading">
            Red Team
        </div>
        <div class = "userContainer">
            {#each redTeam as user}
                <div class="user">
                    <div class="userDetails">
                        <img class = "userProfilePicture" src = {user.profilePicture} alt = "profilePicture">
                        <div class="userName"> { processName(user) }</div>
                    </div>
                    <div class="onlineStatus">
                        {#if allUsersOnlineStatus[user.id] }
                            <Tick/>
                        {:else}
                            <LoadingSvg/>
                        {/if}
                    </div>
                </div>
            {/each}
        </div>
    </div>
    {#if showSelectedInfo}
        <span class="{ selectedInfoType === 1 ?"Word-show" : "Word-hide"}" style = "background-color : {tableBorderMap[selectedInfoType]};">&#x1F60D Correct word Selected</span>
        <span class="{ selectedInfoType === 2 ?"Word-show" : "Word-hide"}" style = "background-color : {tableBorderMap[selectedInfoType]};">&#128532 Opponent selected correct word</span>

        <span class="{ selectedInfoType === 3 ?"Word-show" : "Word-hide"}" style = "background-color : {tableBorderMap[selectedInfoType]};"> &#128532 Grey word Selected</span>
        <span class="{ selectedInfoType === 4 ?"Word-show" : "Word-hide"}" style = "background-color : {tableBorderMap[selectedInfoType]};">&#x1F60D Opponent selected grey word </span>

        <span class="{ selectedInfoType === 5 ?"Word-show" : "Word-hide"}" style = "background-color : {tableBorderMap[selectedInfoType]};"> &#128532 Opponent word Selected</span>
        <span class="{ selectedInfoType === 6 ?"Word-show" : "Word-hide"}" style = "background-color : {tableBorderMap[selectedInfoType]};">&#x1F60D Opponent selected your word </span>

        <span class="{ selectedInfoType === 7 ?"Word-show" : "Word-hide"}" style = "background-color : {tableBorderMap[selectedInfoType]};"> &#128532 Black word Selected</span>
        <span class="{ selectedInfoType === 8 ?"Word-show" : "Word-hide"}" style = "background-color : {tableBorderMap[selectedInfoType]};">&#x1F60D Opponent selected black word</span>

        <span class="{ selectedInfoType === 9 ?"Word-show" : "Word-hide"}" style = "background-color : {tableBorderMap[selectedInfoType]};">
            {#if clue}
                {#if team === turn}
                    {#if isSpymaster}
                        You have sent clue
                    {:else}
                        Your spymaster have sent clue
                    {/if}
                {:else}
                    Blue Spymaster have sent clue
                {/if}
            {:else}
                {#if team === turn}
                    Your Team turn
                {:else}
                    Blue Team turn
                {/if}
            {/if}
        </span>
        <span class="{ selectedInfoType === 10 ?"Word-show" : "Word-hide"}" style = "background-color : {tableBorderMap[selectedInfoType]};">
            {#if clue}
                {#if team === turn}
                    {#if isSpymaster}
                        You have sent clue
                    {:else}
                        Your spymaster have sent clue
                    {/if}
                {:else}
                    Red Spymaster have sent clue
                {/if}
            {:else}
                {#if team === turn}
                    Your Team turn
                {:else}
                    Red Team turn
                {/if}
            {/if}
        </span>

    {/if}
</main>
<style>
    @import url('https://fonts.googleapis.com/css2?family=Manrope:wght@500;600;700;800;900&display=swap');
    *::-webkit-scrollbar,
    *::-webkit-scrollbar-thumb {
        width: 26px;
        border-radius: 13px;
        border: 10px solid transparent;
        color : #9395A8;
    }

    *::-webkit-scrollbar-thumb {        
        box-shadow: inset 0 0 0 10px;
    }
    *:focus {
        outline: none;
    }
    main{
        background-image : url(/images/background.svg);
        border-radius: 20px;
        background-size: 100% 100%;
        width : 100%;
        height : 100%;
    }
    .fadedBackground{
        width : 100%;
        height : 100%;
        position : absolute;
        top : 0;
        left : 0;
        background-color: #3F1575;
        opacity : 0.5;
        z-index : 100;
    }
    .result{
        width : 100%;
        height : 100%;
        position : absolute;
        top : 0;
        left : 0;
        display : flex;
        flex-direction: column;
        justify-content: center;
        align-items : center;
        z-index : 200;
    }
    .winning-btn,.loosing-btn{
        border-radius: 45px;
        padding : 8px 16px;
        margin : 20px 0px;
        color : #fff;
        font-family: 'Manrope', sans-serif;
        font-style: normal;
        font-weight: bold;
    }
    .winning-btn{
        background: #3FAB8B;
        box-shadow: 0px 2px 8px rgba(63, 171, 139, 0.2);
    }
    .loosing-btn{
        background: #F05757;
        box-shadow: 0px 2px 8px rgba(240, 87, 87, 0.5);
    }
    .tick-cross{
        margin-left : 8px;
    }
    .result-text{
        font-family: Manrope;
        font-style: normal;
        font-weight: 800;
        text-align: center;
        color: #FFFFFF;
    }
    .restart-game{
        background: #6C44A8;
        font-family: Manrope;
        font-style: normal;
        font-weight: bold;
        padding : 10px 20px;
        box-shadow: 0px 3px 10px rgba(108, 68, 168, 0.5);
        border-radius: 41px;
        margin : 20px 0px;
        color : #fff;
        cursor : pointer;
    }
    .gameHeading{
        position : relative;
        display : flex;
        justify-content: space-between;
        width : 90%;
        margin : auto;
        top : 2%;
    }
    .spymaster-box{
        background-color: #ffffff;
        border-radius: 46px;
        display : flex;
        align-items : center;
        justify-content: space-between;
        padding : 0px;
        height : 40px;
    }
    .spymasterProfilePicture{
        margin : 0px;
        height : 40px;
        border-radius: 50%;
    }
    .spymaster{
        font-size : 16px;
        font-family: 'Manrope', sans-serif;
        font-weight : 700;
        line-height: 17px;
        padding : 10px;
    }
    .codename {
        height : 64px;
    }
    .scorecard{
        background-color: #F5C13B;
        display : flex;
        flex-direction:  column;
        justify-content: center;
        align-items: center;
        border-radius: 46px;
        padding : 10px 25px;
        color : #fff;
        font-family: 'Manrope', sans-serif;
        font-weight : 700;
        line-height: 20px;
        font-size: 14px;
    }
    .blueScore {
        color : #5E96E8;
    }
    .redScore {
        color : #E44C4F;
    }
    

    .table{
        width : 65%;
        margin : auto;
        position: relative;
        top : 5%;
    }
    .word-matrix {
        display: grid;
        grid-template-rows : repeat(5,1fr);
        grid-template-columns: repeat(5,1fr);
        background-color: #260C4B;
        padding: 10px;
        grid-gap : 10px;
        border-radius: 17.7699px;
    }
    .word {
        box-shadow: 2.87862px 4.31793px 4.31793px #1D0D36, inset 0px 1.00428px 0.719655px #BBBBBB;
        border-radius: 6.43678px;
        padding: 25px 10px;
        font-family : 'Manrope',sans-serif;
        font-weight : 700;
        font-size : 20px;
        line-height : 22px;
        text-align: center;
        letter-spacing: 0.04em;
        overflow : hidden;
        word-break: break-all;
        min-width : 0;
    }
    .cursorPointer{
        cursor : pointer;
    }
    .greyTeamWord{
        background-color : #9c9c9c;
        color : black;
    }
    .redTeamWord{
        color : black;
        background-color: #E44C4F;
    }
    .blueTeamWord{
        color : black;
        background-color: #5E96E8;
    }
    .blackTeamWord{
        color : #fff;
        background-color: #3B3B3B;
    }
    .selected{
        color : #fff;
    }
    .simpleWord{
        background-color: #fff;
        color : #260C4B
    }
    .form-container{
        display : flex;
        width : 100%;
        margin-top : 20px;
    }
    .clueInputBox{
        border : 0px;
        border-radius : 10px;
        margin-right : 3px;
        margin-bottom : 0px;
        flex : 3;
        padding : 10px;
        font-family : 'Manrope', sans-serif;
        font-weight : 500;
        font-size : 16px;
    }
    .clueCountWordBox{
        border : 0px;
        flex : 1;
        cursor : pointer;
        border-radius : 10px;
        background : #ECECEC;
        font-family : 'Manrope', sans-serif;
        font-weight : 600;
        font-size : 14px;
        position : relative;
        background-color : rgba(0,0,0,0.5);
        color : #fff;
        padding : 10px;
    }
    .clueCountWordBox:hover {
        background-color : rgba(0,0,0,1);
        border : 1px solid #fff;
    }
    .clueCountWordBox:hover .clueCountList{
        opacity : 1;
        visibility : visible;
    }
    .defaultClueCount {
        display : flex;
        justify-content: space-between;
        align-items: center;
    }
    
    .clueCountList {
        position :absolute;
        bottom : 100%;
        left : 0%;
        width : 100%;
        opacity : 0;
        visibility : hidden;
        transition: opacity 1s linear visibility 1s linear;
        background-color : #fff;
        color : black;
        height : 300px;
        overflow : auto;
        border-radius: 10px;
    }
    .clueCount {
        padding : 10px;
    }
    .clueCount:hover {
        background-color: rgba(0,0,0,0.5);
        color : #fff;
    }
    .give-clue-btn{
        border : 0px;
        background : #3AC180;
        color : #ffffff;
        margin-left : 10px;
        border-radius : 10px;
        flex : 2;
        cursor : pointer;
        font-family : 'Pluto';
        font-weight : 700;
        font-size : 14px;
        line-height : 13px;
        margin-bottom: 0px;;
    }
    .sendClueMsg {
        color : #fff;
        text-align : center;
        font-family: 'Manrope',sans-serif;
        font-weight : 800;
        font-size : 16px;
        line-height: 22px;
    }
    .clueMsgBox{
        display : flex;
        justify-content: center;
        align-items : center;
        padding : 20px 20px 5px;
        color : #fff;
        font-family: 'Manrope',sans-serif;
        font-weight : 700;
        font-size : 14px;
        line-height: 20px;
    }
    .clueMsgTeamIdentifier {
        color : #fff;
        padding : 10px 30px;
        border-radius : 40px;
        font-family : 'Pluto';
        font-size : 12px;
        font-weight: 900;
        line-height : 15px;
        letter-spacing: 1px;
    }
    .clueMsg{
        color : #fff;
        padding : 10px 10px;
        font-family : 'Manrope';
        font-weight : 700;
        font-size : 18px;
        line-height : 25px;
    }
    .clueWaiting {
        color: rgba(255, 255, 255,1);
        font-family : 'Manrope';
        font-weight : 800;
        font-size : 18px;
        line-height : 19px;
        text-align : center;
        margin : 5px auto;
        width : 60%;
    }
    .postWordClickMsgBox {
        color: rgba(255, 255, 255,0.5);
        font-family : 'Manrope';
        font-weight : 800;
        font-size : 14px;
        line-height : 19px;
        text-align : center;
        margin : 5px auto;
        width : 60%;
    }
    .endTurnBtn{
        margin : 8px auto 0px;
        padding : 1% 2%;
        cursor : pointer;
        display : block;
        background: #E44C4F;
        color : #fff;
        box-shadow: 2.14663px 3.21994px 3.21994px rgba(29, 13, 54, 0.2), inset 0px 1px 0px #FFFEFE;
        border-radius: 8px;
        font-family : 'Pluto';
        font-size : 14px;
        font-weight : bold;
        line-height: 13px;
    }
    .logsContainer {
        position : absolute;
        left : 2%;
        bottom : 40%;
        width : 15%;
        max-height : 150px;
        overflow : auto;
        font-family:  'Manrope',sans-serif;
        font-size : 10px;
        line-height : 19px;
    }
    .log{
        padding : 5px 0;
        color : #fff;
    }
    .logsActor {
        margin-top : 5px;
        font-weight : bold;
        font-size : 11.5px;
    }
    .redTeam_List{
        position : absolute;
        bottom : 3%;
        right : 4%;
        width : 12%;
    }
    .blueTeam_List{
        position : absolute;
        bottom : 3%;
        left : 4%;
        width : 12%;
    }
    .blue_heading{
        font-family: 'Manrope', sans-serif;
        font-weight : 800;
        color : #5E96E8;
        text-align : center;
        padding : 10px;
        font-size : 16px;
        line-height : 18px;
    }
    .red_heading{
        font-family : 'Manrope', sans-serif;
        font-weight : 800;
        color : #E44C4F;
        text-align: center;
        padding : 10px;
        font-size : 16px;
        line-height: 18px;
    }
    .userContainer{
        background-color : #fff;
        max-height : 150px;
        border-radius : 10px;
        padding : 10px;
        overflow : auto;
    }
    .user{
        display : flex;
        align-items : center;
        justify-content : space-between;
        padding : 10px 0;
    }
    .userDetails {
        display : flex;
    }
    
    .userProfilePicture{
        width : 20px;
        height : 20px;
        border-radius : 50%;
    }
    .userName{
        padding-left : 10px;
        font-family : 'Manrope', sans-serif;
        font-size : 12px;
        font-weight : 700;
        line-height : 19px;
    }
    .Word-hide{
        display: none;
    }
    .Word-show{
        display : inline;
        position: absolute;
        top : 13%;
        left : 50%;
        transform : translateX(-50%);
        padding : 5px;
        font-family: 'Manrope',sans-serif;
        font-size : 14px;
        line-height: 20px;
        font-weight: 700;
        color : #fff;
        border-radius : 10px;
    }
    @media screen and (max-width : 1400px) {
        .word-matrix {
            padding : 8px;
            grid-gap : 8px;
            grid-template-rows: repeat(5,1fr);
        }
        .word {
            font-size : 18px;
            padding : 10px
        }
    }
    @media screen and (max-width : 1150px) {
        .word-matrix{
            padding: 8px;
            grid-gap : 8px;
            grid-template-rows : repeat(5,1fr);
        }
        .word {
            font-size : 16px;
            padding : 10px
        }
        .sendClueMsg{
            font-size : 14px;
        }
        .redTeam_List,.blueTeam_List {
            width : 14%;
        }
        .userContainer {
            padding : 5px;
        }
        .user {
            padding : 5px;
        }
        .userName {
            font-size : 10px;
            padding-left : 5px;
        }
    }
    @media screen and (max-width : 950px) {
        .word {
            font-size : 15px;
        }
    }
</style>