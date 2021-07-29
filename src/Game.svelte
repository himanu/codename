<script>
    import Cross from "./Cross.svelte";
    import { afterUpdate, beforeUpdate,onMount} from 'svelte';
    import { dbGameSession, dbUser, dbUsers, dbWordList, dbTurn, dbClue, dbLogsArray,dbLastWordSelected,dbBlueScore,dbRedScore,dbGameSessionRound,dbGameSessionRoundValue, listenFirebaseKey, updateLeaderBoard } from "./database";
    import LoadingSvg from "./LoadingSvg.svelte";
    import CorrectAnswerTick from "./CorrectAnswerTick.svelte";
    import Tick from './Tick.svelte';
    import { getGameSessionId, getParams } from './utils';
    import DownSvg from "./DownSvg.svelte";
    import Lobby_Screen from './Lobby_Screen.svelte' 
    import DisconnectedSvg from "./DisconnectedSvg.svelte";
    import LogBox from './LogBox.svelte';

    let wordList = [];
    let team;
    let user;
    let showLogs = false;
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
    let clueCount = [1,2,3,4,5,6,7,8,9];
    let blueTeam_has_Spymaster = false;
    let redTeam_has_Spymaster = false;
    let turnIndicatorBackgroundColor;
    let view;
    let leftValue;
    let redTeamPlayersCount = 0;
    let blueTeamPlayersCount = 0;
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
    let isSpymaster = false;
    let textColorOfSpymaster,textColorOfPlayer;

    //To know whether this player is spymaster or not and to determine the border-color of profile picture
    
    dbUser.on('value',(snap)=>{
        if(!snap.exists())
        return;
        user = snap.val();
    })

    //To fill redTeam and blueTeam
    
    dbUsers.on('value',(snap)=>{
        if(!snap.exists()) {
            return;
        }
        users = snap.val();
    })

    listenFirebaseKey(dbClue, (dbClueRef) => {
        dbClueRef.on('value',(snap)=>{
            if(!snap.exists()) {
                clue = null;
                return;
            }
            clue = snap.val();
        })
    })

    

    listenFirebaseKey(dbTurn, (dbTurnRef) => {
        dbTurnRef.on('value',(snap)=>{
            if(!snap.exists()) {
                turn = null;
                return;
            }
            turn = snap.val();
        })
    })
    

    listenFirebaseKey(dbWordList, (dbWordListRef) => {
        dbWordListRef.on('value',(snap)=>{
            if(!snap.exists()) {
                return;
            }
            wordList = snap.val();
        })
        
    })


    //new code added
    listenFirebaseKey(dbBlueScore, (dbBlueScoreRef) => {
        dbBlueScoreRef.on('value',(snap)=>{
            if(!snap.exists()) {
                return;
            }
            blueScore = snap.val();
        })
    })
    
    listenFirebaseKey(dbRedScore, (dbRedScoreRef) => {
        dbRedScoreRef.on('value',(snap)=>{
            if(!snap.exists()) {
                return;
            }
            redScore = snap.val();
        })
        
    })
    

    listenFirebaseKey(dbLastWordSelected, (dbLastWordSelectedRef) => {
        dbLastWordSelectedRef.on('value',(snap)=>{
            if(!snap.exists()) {
                lastWordSelected = null;
                return;
            }
            lastWordSelected = snap.val();
        })
        
    })
    
    
    listenFirebaseKey(dbLogsArray, (dbLogsArrayRef) => {
        dbLogsArrayRef.on('value',(snap)=>{
            if(!snap.exists()) {
                return;
            }
            logsArray = snap.val();
            if(logsdiv)
                logsdiv.scrollTo(0,logsdiv.scrollHeight);
        })
        
    })

    onMount(()=>{
        if(logsdiv) {
            logsdiv.scrollTo(0,logsdiv.scrollHeight);
        }
    })
    
    let autoscroll;
    beforeUpdate(()=>{
        autoscroll = logsdiv && (logsdiv.offsetHeight + logsdiv.scrollTop) > (logsdiv.scrollHeight - 20);
    })
    afterUpdate(()=>{
        if(autoscroll && logsdiv) {
            logsdiv.scrollTo(0, logsdiv.scrollHeight);
        }
    })

    $: {
        if(turn === "Red") {
            turnIndicatorBackgroundColor = tableBorderMap[10];
        }
        else if(turn === "Blue") {
            turnIndicatorBackgroundColor = tableBorderMap[9];
        }
    }
    $: {
        if(lastWordSelected || turn || clue) {
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
                postWordClickMsg = "Grey word is selected and your team chance is passed";
            }
            else if(lastWordSelected.color === "Grey" && team === turn){
                selectedInfoType = 4;
                postWordClickMsg = "Opponent selected grey word and now it's your team turn";
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
                postWordClickMsg = "Uff! Opponent's word selected, they get free word and turn.";
            }
            else if(lastWordSelected.color !== lastWordSelected.selectorTeam && team === turn){
                selectedInfoType = 6;
                postWordClickMsg = "Hurrah! Opponent selected your's team word, your team gets free word and turn."
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

    $:{
        isSpymaster = user?.spymaster;
        if(isSpymaster) {
            view = "Spymaster";
        }
    }
    $: {
        if(view === 'Spymaster') {
            textColorOfSpymaster = '#fff';
            textColorOfPlayer = '#000';
            leftValue = '0%';
        }
        else if(view === 'Player') {
            textColorOfSpymaster = '#000';
            textColorOfPlayer = '#fff';
            leftValue = '50%';
        }
    } 
    $: team = user?.team;
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
            redTeamPlayersCount = 0;
            blueTeamPlayersCount = 0;
            for(const id in users)
            {
                let currUser = users[id];
                if(currUser.team === "Red") {
                    redTeam.push(currUser);
                    if(currUser.spymaster && allUsersOnlineStatus[currUser.id]) {
                        // if( allUsersOnlineStatus[currUser.id] ) {
                        //     redTeam_has_Spymaster  = true;
                        // }
                        if(redTeam_has_Spymaster) {
                            currUser.spymaster = false;

                            if(currUser.id === userId) {
                                isSpymaster = false;
                            }

                            dbUsers.child(currUser.id).update({
                                spymaster : false
                            })
                        }
                        else {
                            redTeam_has_Spymaster = true;
                        }
                    }
                    else {
                        if( allUsersOnlineStatus[currUser.id] ) {
                            redTeamPlayersCount += 1;
                        }
                    }
                }
                else if(currUser.team === "Blue"){
                    blueTeam.push(currUser);
                    if(currUser.spymaster && allUsersOnlineStatus[currUser.id]) {
                        if(blueTeam_has_Spymaster) {
                            currUser.spymaster = false;
                            
                            if(currUser.id === userId) {
                                isSpymaster = false;
                            }
                            dbUsers.child(currUser.id).update({
                                spymaster : false
                            })
                        }
                        else {
                            blueTeam_has_Spymaster = true;
                        }
                    }
                    else {
                        if(allUsersOnlineStatus[currUser.id]) {
                            blueTeamPlayersCount += 1;
                        }
                    }
                }
            }
            redTeamPlayersCount = redTeamPlayersCount;
            blueTeamPlayersCount = blueTeamPlayersCount;
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
            if( (thisUser.online === true) || (Date.now() - thisUser.online <= 5000) ) {
                allUsersOnlineStatus[thisUser.id] = true;
            }
            else {
                allUsersOnlineStatus[thisUser.id] = false;
            }
        }
    }
    updateUsersOnlineStatus()
    async function postData(url = '', data = {}) {
    // Default options are marked with *
        const response = await fetch(url, {
            method: 'POST', // *GET, POST, PUT, DELETE, etc.
            mode: 'cors', // no-cors, *cors, same-origin
            cache: 'no-cache', // *default, no-cache, reload, force-cache, only-if-cached
            credentials: 'same-origin', // include, *same-origin, omit
            headers: {
            'Content-Type': 'application/json'
            // 'Content-Type': 'application/x-www-form-urlencoded',
            },
            redirect: 'follow', // manual, *follow, error
            referrerPolicy: 'no-referrer', // no-referrer, *no-referrer-when-downgrade, origin, origin-when-cross-origin, same-origin, strict-origin, strict-origin-when-cross-origin, unsafe-url
            body: JSON.stringify(data) // body data type must match "Content-Type" header
        });
        return response.json(); // parses JSON response into native JavaScript objects
    }
    let redTeamOnlinePlayersId = [];
    let blueTeamOnlinePlayersId = [];
    function getBothTeamOnlinePlayersId() {
        redTeamOnlinePlayersId = [];
        blueTeamOnlinePlayersId = [];
        for(const id in users) {
            if(users[id].team === 'Red' && allUsersOnlineStatus[id]) {
                redTeamOnlinePlayersId.push(id);
            }
            else if(users[id].team === 'Blue' && allUsersOnlineStatus[id]) {
                blueTeamOnlinePlayersId.push(id);
            }
        }
    }
    let gameSessionId = getGameSessionId();
    function checkWord(word) {
        if(!is_This_User_Turn)
        {
            return ;
        }
        listenFirebaseKey(dbWordList,(dbWordListRef)=>{
            dbWordListRef.child(word.id).update({
                selectedBy : userId
            });
        })

        let winningTeamOnlinePlayersId;
        getBothTeamOnlinePlayersId();

        word["selectorName"] = userName;
        word["selectorTeam"] = team;
        
        if(!logsArray) {
            logsArray = [];
        }
        logsArray.push({
            actor : user,
            action : " selects " + word.name,
            isWordSelected : true,
            word
        })

        if(word.color === "Red") {

            if(turn !== "Red") {
                winningTeamOnlinePlayersId = redTeamOnlinePlayersId;
                listenFirebaseKey(dbGameSessionRound,(dbGameSessionRoundRef)=>{
                    dbGameSessionRoundRef.update({
                        lastWordSelected : word,
                        redScore : redScore - 1,
                        logsArray,
                        clue : null,
                        turn : "Red"
                    })
                })
            }
            else {
                winningTeamOnlinePlayersId = redTeamOnlinePlayersId;
                listenFirebaseKey(dbGameSessionRound,(dbGameSessionRoundRef)=>{
                    dbGameSessionRoundRef.update({
                        lastWordSelected : word,
                        redScore : redScore -1,
                        logsArray,
                        clue,
                        turn : 'Red'
                    })
                })
            }
            
        }
        else if(word.color === "Blue") {

            if(turn != "Blue") {
                winningTeamOnlinePlayersId = blueTeamOnlinePlayersId;
                listenFirebaseKey(dbGameSessionRound,(dbGameSessionRoundRef)=>{
                    dbGameSessionRoundRef.update({
                        lastWordSelected : word,
                        blueScore : blueScore - 1,
                        logsArray,
                        clue : null,
                        turn : 'Blue'
                    })
                })
            }
            else {
                winningTeamOnlinePlayersId = blueTeamOnlinePlayersId;
                listenFirebaseKey(dbGameSessionRound,(dbGameSessionRoundRef)=>{
                    dbGameSessionRoundRef.update({
                        lastWordSelected : word,
                        blueScore : blueScore - 1,
                        logsArray,
                        clue,
                        turn : 'Blue'
                    })
                })
            }
            
        }
        else if(word.color === "Grey") {
            if(turn === 'Red') {
                winningTeamOnlinePlayersId = blueTeamOnlinePlayersId;
                listenFirebaseKey(dbGameSessionRound,(dbGameSessionRoundRef)=>{
                    dbGameSessionRoundRef.update({
                        lastWordSelected : word,
                        logsArray,
                        clue : null,
                        turn : 'Blue'
                    })
                })
            }
            else if(turn === 'Blue') {
                winningTeamOnlinePlayersId = redTeamOnlinePlayersId;
                listenFirebaseKey(dbGameSessionRound,(dbGameSessionRoundRef)=>{
                    dbGameSessionRoundRef.update({
                        lastWordSelected : word,
                        logsArray,
                        clue : null,
                        turn : 'Red'
                    })
                })
            }
            
        }
        else if(word.color === "Black") {
            if(turn === 'Red') {
                winningTeamOnlinePlayersId = blueTeamOnlinePlayersId;
            }
            else {
                winningTeamOnlinePlayersId = redTeamOnlinePlayersId;
            }

            listenFirebaseKey(dbGameSessionRound,(dbGameSessionRoundRef)=>{
                dbGameSessionRoundRef.update({
                    lastWordSelected : word,
                    logsArray
                })
            })
        }
        console.log('winningTeam' ,winningTeamOnlinePlayersId);
        updateLeaderBoard({gameSessionId,winningTeamOnlinePlayersId}).then(()=>{
            console.log('Scores are updated');
        })
        .catch((err)=>{
            console.log('Some error occured ',err);
        })
    }
    //to send clues to the other player
    function giveClue(event){
        event.preventDefault();
        if(!logsArray) {
            logsArray = [];
        }
        
        let actionString = " sends clue " + "(" +  clueWord + " x " + clueWord_Count + ")";
        logsArray.push({
            actor : user,
            action : actionString,
            isWordSelected : false
        })
        listenFirebaseKey(dbGameSessionRound,(dbGameSessionRoundRef)=>{
            dbGameSessionRoundRef.update({
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
            clueWord = '';
        })
        
    }

    function handleEndTurnBtn() {
        if(!logsArray) {
            logsArray = [];
        }
        logsArray.push({
            actor : user,
            action : ` clicked End Turn button`,
            isWordSelected : false
        })
        if(turn === 'Red') {
            turn = 'Blue';
        }
        else {
            turn = 'Red';
        }
        
        listenFirebaseKey(dbGameSessionRound, (dbGameSessionRoundRef)=>{
            dbGameSessionRoundRef.update({
                logsArray,
                turn,
                clue : null,
                lastWordSelected : null
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
    function changeView() {
        if(view === 'Spymaster') {
            view = 'Player';
        }
        else if(view === 'Player') {
            view = 'Spymaster';
        }
    }
    let roundValue;
    dbGameSessionRoundValue.on("value", (snap) => {
        if(!snap.exists()) {
            dbGameSessionRoundValue.set(1);
            roundValue = 1;
            return ;
        }
        roundValue = snap.val();
    })
    function handleRestartBtn() {
        dbGameSession.update({
            roundValue : roundValue + 1,
        })
    }
    function handleShowLogsBtn() {
        if(showLogs === false) {
            showLogs = true;
        }
        else if(showLogs === true) {
            showLogs = false;
        }
    }
    function validUserProfilePicture(str) {
        try {
            new URL(str);
            return true;
        }
        catch(err){
            return false;
        }
    }
    keepUpdatingUsersOnlineStatus();

</script>
<main>
    {#if !user?.team}
        <Lobby_Screen/>
    {:else}
        {#if resultDeclared}
            <div class="fadedBackground"></div>
            <div class = "result">
                {#if winner === team}
                    <CorrectAnswerTick/>
                    <div class = "winning-btn">
                        {#if lastWordSelected?.color === team}
                            {#if lastWordSelected?.selectorTeam === team}
                                Correct Answer
                            {:else}
                                Opponent selected your word
                            {/if}
                        {:else}
                            Opponent selected black word
                        {/if}
                        <svg class = "tick-cross" width="20" height="15" viewBox="0 0 14 10" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <path d="M11.9811 0L4.92831 7.0606L2.01749 4.15653L0.548828 5.62831L4.93091 10L13.4519 1.4697L11.9811 0Z" fill="white"/>
                        </svg>
                    </div>
                    <div class = "result-text"> Hurrah!! Your team has won the game.</div>
                    <button class = "restart-game" on:click = {handleRestartBtn}>Restart Game</button>
                {:else}
                    <Cross/>
                    <div class="loosing-btn">
                        {#if lastWordSelected?.color === 'Black'}
                            Black word selected
                        {:else}
                            {#if lastWordSelected?.selectorTeam === team} 
                                Opponent's word selected
                            {:else}
                                Opponent has found all their words
                            {/if}
                        {/if}
                        <svg class = "tick-cross" width="15" height="15" viewBox="0 0 10 10" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <path fill-rule="evenodd" clip-rule="evenodd" d="M8.56539 9.88682L9.96921 8.48294L6.46021 4.97406L9.87206 1.56233L8.46824 0.158459L5.05634 3.57024L1.48597 0L0.0821475 1.40387L3.65247 4.97406L0.0302734 8.59613L1.4341 10L5.05634 6.37789L8.56539 9.88682Z" fill="#FFEBEE"/>
                        </svg>
                            
                    </div>
                    <div class="result-text">Your team has lost the Game.</div>
                    <button class = "restart-game" on:click = {handleRestartBtn}>Restart Game</button>
                {/if}

            </div>
        {/if}
        <div style = "display : flex ; width : 100%; justify-content: center;z-index : 100">
            <LogBox showLogs = {showLogs}/>
        </div> 
        <div class = "gameHeading">
            <div class = 'playerDetails'>
                {#if isSpymaster}
                    <div class = "spymasterBox" on:click = {changeView}>
                        <div class = "spymaster" style = 'color : {textColorOfSpymaster}'>
                            SPYMASTER
                        </div>
                        <div class = "player" style = 'color : {textColorOfPlayer}'>
                            PLAYER
                        </div>
                        <div class = "slider" style = "left : {leftValue};background-color : {profile_picture_border_color}">
                        </div>
                    </div>
                {:else}
                    <div class = "player-box">
                        <img class = "playerProfilePicture" src = {userProfilePicture} alt = "Your Spymaster" style = "border : 3px solid {profile_picture_border_color}">
                        <div class = "player" style = "color : {profile_picture_border_color}">PLAYER</div>
                    </div>
                {/if}
                <div class = "teamIndicator" style = "background-color : {profile_picture_border_color}">
                    {team} Team
                </div>
            </div>
            <div class = "codename">
                <img src = '/images/codenames-logo.png' class = "codenamePng" style = "height : 60px" alt = "codenames"> 
                <div class="turnIndicatorBox">
                    <div class = "turnIndicator" style = "background-color : {turnIndicatorBackgroundColor}">
                        {#if !clue || (clue.clueSenderTeam !== turn)}
                            {#if team !== turn}
                                {turn} Team Spymaster Turn.
                            {:else}
                                {#if isSpymaster}
                                    Your turn, send clue.
                                {:else}
                                    Your Spymaster turn, wait for clue.
                                {/if}
                            {/if}
                        {:else}
                            {#if team !== turn}
                                {turn} Team turn.
                            {:else}
                                {#if isSpymaster}
                                    Your Team turn.
                                {:else}
                                    Your turn, guess your words.
                                {/if}
                            {/if}
                        {/if}
                    </div>
                </div>
            </div>
            <div class="scorecardAndLogs">
                <div class = 'scorecard'>
                    <div class="blueScore">Remaining Code for Blue - {blueScore}</div>
                    <div class="redScore">Remaining Code for Red - {redScore}</div>
                </div>
                <div class = "logsBtn" on:click = {handleShowLogsBtn}>
                    Logs
                </div>
                
            </div>
        </div>
        
        <div class = "container">
            <div class="word-matrix" style = "border : 6px solid {tableBorderColor};">
                {#each wordList as word}
                    {#if (isSpymaster && view === 'Spymaster') || word.selectedBy}
                        {#if word.color === "Grey"}
                        <div class = "word greyTeamWord" class:selected = {word.selectedBy} title = {word.name}> {word.name}</div>
                        {:else if word.color === "Red"}
                            <div class = "word redTeamWord" class:selected = {word.selectedBy} title = {word.name}> {word.name}</div>
                        {:else if word.color === "Blue"}
                            <div class = "word blueTeamWord" class:selected = {word.selectedBy} title = {word.name}> {word.name}</div>
                        {:else if word.color === "Black"}
                            <div class = "word blackTeamWord" title = {word.name}> {word.name}</div>
                        {/if}
                    {:else if (isSpymaster && view === 'Player')}
                        {#if word.selectedBy}
                            {#if word.color === "Grey"}
                                <div class = "word greyTeamWord" class:selected = {word.selectedBy} title = {word.name}> {word.name}</div>
                            {:else if word.color === "Red"}
                                <div class = "word redTeamWord" class:selected = {word.selectedBy} title = {word.name}> {word.name}</div>
                            {:else if word.color === "Blue"}
                                <div class = "word blueTeamWord" class:selected = {word.selectedBy} title = {word.name}> {word.name}</div>
                            {:else if word.color === "Black"}
                                <div class = "word blackTeamWord" title = {word.name}> {word.name}</div>
                            {/if}
                        {:else}
                            <div class = "word simpleWord" title = {word.name}> {word.name} </div>
                        {/if}
                    {:else }
                        <div class = "word simpleWord" class:cursorPointer = {is_This_User_Turn} on:click = {checkWord(word)} title = {word.name}> {word.name} </div>
                    {/if}
                {/each}
                {#if showSelectedInfo}
                    <span class="{ selectedInfoType === 1 ?"Word-show" : "Word-hide"}" style = "background-color : {tableBorderMap[selectedInfoType]};">&#x1F60D Correct word Selected</span>
                    <span class="{ selectedInfoType === 2 ?"Word-show" : "Word-hide"}" style = "background-color : {tableBorderMap[selectedInfoType]};">&#128532 Opponent selects correct word</span>

                    <span class="{ selectedInfoType === 3 ?"Word-show" : "Word-hide"}" style = "background-color : {tableBorderMap[selectedInfoType]};"> &#128532 Grey word Selected</span>
                    <span class="{ selectedInfoType === 4 ?"Word-show" : "Word-hide"}" style = "background-color : {tableBorderMap[selectedInfoType]};">&#x1F60D Opponent selects grey word </span>

                    <span class="{ selectedInfoType === 5 ?"Word-show" : "Word-hide"}" style = "background-color : {tableBorderMap[selectedInfoType]};"> &#128532 Opponent word Selected</span>
                    <span class="{ selectedInfoType === 6 ?"Word-show" : "Word-hide"}" style = "background-color : {tableBorderMap[selectedInfoType]};">&#x1F60D Opponent selects your word </span>

                    <span class="{ selectedInfoType === 7 ?"Word-show" : "Word-hide"}" style = "background-color : {tableBorderMap[selectedInfoType]};"> &#128532 Black word Selected</span>
                    <span class="{ selectedInfoType === 8 ?"Word-show" : "Word-hide"}" style = "background-color : {tableBorderMap[selectedInfoType]};">&#x1F60D Opponent selects black word</span>

                    <span class="{ selectedInfoType === 9 ?"Word-show" : "Word-hide"}" style = "background-color : {tableBorderMap[selectedInfoType]};">
                        {#if clue}
                            {#if team === turn}
                                {#if isSpymaster}
                                    You have sent clue
                                {:else}
                                    Your spymaster have sent clue
                                {/if}
                            {:else if turn === "Red"}
                                Red Spymaster have sent clue
                            {:else if turn === "Blue"}
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
            </div>
            <div class = "extraStuff">
                {#if isSpymaster && team === turn }
                    {#if (!clue || clue.clueSenderTeam !== turn)}
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
                    {#if allUsersOnlineStatus[user.id] === false}
                        <div class = "noOnlinePlayer">
                            You are offline, please check your connection and refresh the page.
                        </div>
                    {/if}
                    {#if clue && clue.clueSenderTeam === turn && team === turn}
                        <div class="clueMsgBox">You have send clue {clue.clueWord} (x {clue.clueWord_Count} )</div>
                    {/if}
                    
                    {#if (team === "Red" && !redTeamPlayersCount) || (team === "Blue" && !blueTeamPlayersCount)}
                        <div class = "noOnlinePlayer">
                            No online player in your team. To continue the game ask someone to join.
                        </div>
                    {/if}
                    
                    {#if showSelectedInfo}
                        <div class = "postWordClickMsgBox"> {postWordClickMsg} </div>
                    {/if}
                {:else}
                    {#if allUsersOnlineStatus[user.id] === false}
                        <div class = "noOnlinePlayer">
                            You are offline, please check your connection and refresh the page.
                        </div>
                    {/if}
                    {#if clue && clue.clueSenderTeam === turn}
                        <div class = "clueMsgBox">
                            <div class = "clueMsgTeamIdentifier" style = "background-color : {clueMsgTeamIdentifierColor}"> {turn.toUpperCase()}</div>
                            <div class = "clueMsg"> {clue.clueWord} (x {clue.clueWord_Count} )</div>
                        </div>
                        {#if turn !== team}
                            {#if ((turn === "Red" && !redTeamPlayersCount) || (turn === "Blue" && !blueTeamPlayersCount))}
                                <div class="noOnlinePlayer">
                                    No online player in {turn} team. To continue the game ask someone to join.
                                </div>
                            {/if}
                        {/if}
                    {:else}
                        {#if !isSpymaster && team === turn}
                            {#if team === "Red" && !redTeam_has_Spymaster}
                                <div class="redSpymasterDisappear">
                                    Your Spymaster is offline. To continue the game ask him to join.
                                </div>
                            {:else if team === "Blue" && !blueTeam_has_Spymaster}
                                <div class="blueSpymasterDisappear">
                                    Your Spymaster is offline. To continue the game ask him to join.
                                </div>
                            {/if}
                            <div class = "clueWaiting"> Waiting for clue ...</div>
                        {:else if team !== turn}
                            {#if turn === "Red" && !redTeam_has_Spymaster}
                                <div class="redSpymasterDisappear">
                                    Red Spymaster is offline. To continue the game ask him to join.
                                </div>
                            {:else if turn === "Blue" && !blueTeam_has_Spymaster}
                                <div class="blueSpymasterDisappear">
                                    Blue Spymaster is offline. To continue the game ask him to join.
                                </div>
                            {/if}
                        {/if}
                    {/if}
                    {#if showSelectedInfo}
                        <div class="postWordClickMsgBox"> {postWordClickMsg} </div>
                    {/if}
                    {#if is_This_User_Turn}
                        <button class="endTurnBtn" on:click = {handleEndTurnBtn}>End Turn</button>
                    {/if}
                {/if}
            </div>
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
                                {#if validUserProfilePicture(user.profilePicture)}
                                    <img class = "profilePicture" src = {user.profilePicture} alt = "profilePicture">
                                {:else}
                                    <div class = "fakeProfilePicture"> {user.userName[0].toUpperCase()} </div>
                                {/if}
                                <div class="userName"> { processName(user) }</div>
                            </div>
                            <div class="onlineStatus">
                                {#if allUsersOnlineStatus[user.id]}
                                    {#if user.online === true}
                                        <Tick/>
                                    {:else}
                                        <LoadingSvg/>
                                    {/if}
                                {:else}
                                    <DisconnectedSvg/>
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
                <div class = "users">
                    {#each redTeam as user}
                        <div class="user">
                            <div class="userDetails">
                                {#if validUserProfilePicture(user.profilePicture)}
                                        <img class = "profilePicture" src = {user.profilePicture} alt = "profilePicture">
                                {:else}
                                    <div class = "fakeProfilePicture"> {user.userName[0].toUpperCase()} </div>
                                {/if}
                                <div class="userName"> { processName(user) }</div>
                            </div>
                            <div class="onlineStatus">
                                {#if allUsersOnlineStatus[user.id]}
                                    {#if user.online === true}
                                        <Tick/>
                                    {:else}
                                        <LoadingSvg/>
                                    {/if}
                                {:else}
                                    <DisconnectedSvg/>
                                {/if}
                            </div>
                        </div>
                    {/each}
                </div>
            </div>
        </div>
    {/if}
</main>
<style>
    @import url('https://fonts.googleapis.com/css2?family=Manrope:wght@500;600;700;800;900&display=swap');
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
        background: #888;
        border-radius : 5px;
    }
    ::-webkit-scrollbar-thumb:hover {
        background: rgb(70, 69, 69);
        cursor : pointer;
    }
    
    *:focus {
        outline: none;
    }
    *{
        padding : 0px;
        margin : 0px;
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
        background-color: #2a0f4d;
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
        font-family : monospace;
        font-size : 22px;
        letter-spacing : 0.25px;
    }
    @media screen and (max-width : 1150px) {
        .result {
            font-size : 20px;
        }
    }
    @media screen and (max-width : 1000px) {
        .result {
            font-size : 18px;
        }
    }
    .winning-btn,.loosing-btn{
        border-radius: 45px;
        padding : 8px 16px;
        margin : 20px 0px;
        color : #fff;
        font-weight: 700;
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
        font-weight: 800;
        text-align: center;
        color: #FFFFFF;
    }
    .restart-game{
        background: #6C44A8;
        font-weight: 700;
        padding : 10px 20px;
        box-shadow: 0px 3px 10px rgba(108, 68, 168, 0.5);
        border-radius: 41px;
        margin : 20px 0px;
        color : #fff;
        cursor : pointer;
        letter-spacing : 0.25px;
    }
    .restart-game:hover {
        transform : scale3d(1.05,1.05,1.25)
    }
    .gameHeading{
        position : relative;
        width : calc(100% - 24px);
        margin : auto;
        top : 12px;
    }
    .playerDetails {
        position : absolute;
        left : 0px;
        top : 0px;
    }
    .spymasterBox {
        background-color : #fff;
        display : flex;
        justify-content : space-between;
        align-items : center;
        position : relative;
        cursor : pointer;
        font-family : 'Manrope',sans-serif;
        font-size : 14px;
        font-weight : 700;
        border-radius : 47px;
        height : 50%;
    }
    .spymaster {
        text-align : center;
        transition : 0.25s;
        padding : 10px;
        z-index : 1;
    }
    .player {
        text-align : center;
        transition : .25s;
        padding : 10px 22.5px;
        z-index : 1;
        font-size : 14px;
        font-family: 'Manrope', sans-serif;
        font-weight : 700;
    }
    .slider {
        position : absolute;
        top : 0px;
        width : 50%;
        height : 100%;
        transition : .25s;
        border-radius : 47px;
        box-shadow: 0px 5px 10px rgba(0, 0, 0, 0.25);
    }
    .teamIndicator {
        color : #fff;
        padding : 5px;
        font-family : 'Manrope',sans-serif;
        font-weight : 700;
        font-size : 14px;
        text-align : center;
        margin-top : 12px;
        border-radius: 47px;
    }
    .player-box{
        background-color: #ffffff;
        border-radius: 46px;
        flex : 1;
        display : flex;
        align-items : center;
        padding : 0px;
        height : 40px;
    }
    .playerProfilePicture{
        margin : 0px;
        height : 40px;
        border-radius: 50%;
    }
    
    .codename {
        position : absolute;
        left : 50%;
        transform : translateX(-50%);
        text-align : center;
        display : flex;
        flex-direction : column;
        justify-content : center;
    }
    .codenamePng {
        height : 60px;
        align-self : center;
    }
    .scorecardAndLogs{
        position : absolute;
        right : 0%;
        display : flex;
        flex-direction : column;
        align-items : flex-end;
        
    }
    .scorecard {
        background-color: #fff;
        display : flex;
        flex-direction:  column;
        justify-content: center;
        align-items: center;
        border-radius: 46px;
        padding : 10px 25px;
        font-family: 'Manrope', sans-serif;
        font-weight : 700;
        line-height: 20px;
        font-size: 14px;
    }
    .logsBtn {
        background-color : white;
        color : #343E98;
        text-align : center;
        width : 50%;
        margin : 12px 0px;
        border-radius : 15px;
        padding : 5px;
        cursor : pointer;
        font-family : 'Manrope', sans-serif;
        font-weight : 700;
        font-size: 14px;
    }
    .logsBtn:hover {
        transform : scale3d(1.05,1.05,1.25);
    }
    .blueScore {
        color : #5E96E8;
        white-space : nowrap;
    }
    .redScore {
        color : #E44C4F;
        white-space : nowrap;
    }
    .turnIndicatorBox {
        margin : 12px 0px 0px 0px;
    }
    .turnIndicator {
        display: inline;
        color : #fff;
        padding : 5px 10px;
        border-radius : 10px;
        font-family: 'Manrope', sans-serif;
        font-weight : 700;
        line-height: 20px;
        font-size: 14px;
    }
    .container {
        position : relative;
        top : 50%;
        transform : translateY(-50%);
        max-width : 60%;
        margin : auto;
    }
    .extraStuff {
        position : absolute;
        width : 100%;
    }
    .word-matrix {
        position : relative;
        display: grid;
        grid-template-rows : repeat(5,1fr);
        grid-template-columns: repeat(5,1fr);
        background-color: #260C4B;
        padding: 10px;
        grid-gap : 10px;
        border-radius: 17.7699px;
        margin-bottom : 15px;
    }
    .word {
        box-shadow: 2.87862px 4.31793px 4.31793px #1D0D36, inset 0px 1.00428px 0.719655px #BBBBBB;
        border-radius: 6.43678px;
        padding: 20px;
        font-family : 'Manrope',sans-serif;
        font-weight : 700;
        font-size : 18px;
        line-height : 22px;
        text-align: center;
        letter-spacing: 0.04em;
        overflow : hidden;
        text-overflow : ellipsis;
        min-width : 0;
        white-space : nowrap;
    }
    .cursorPointer{
        cursor : pointer;
    }
    .greyTeamWord{
        background-color : #C1BFBF;
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
        display : grid;
        grid-template-columns: 3fr 1fr 1fr;
        grid-gap : 10px;
        width : 100%;
        margin-bottom : 10px;
    }
    .clueInputBox{
        border : 0px;
        border-radius : 10px;
        padding : 10px;
        font-family : 'Manrope', sans-serif;
        font-weight : 500;
        font-size : 16px;
    }
    .clueCountWordBox{
        border : 0px;
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
        border-radius : 10px;
        cursor : pointer;
        font-family : 'Manrope',sans-serif;
        font-weight : 700;
        font-size : 14px;
    }
    .give-clue-btn:hover {
        transform : scale3d(1.05,1.05,1.25);
    }
    .sendClueMsg {
        color : #fff;
        text-align : center;
        font-family: 'Manrope', sans-serif;
        font-weight : 700;
        line-height: 20px;
        font-size: 14px;
        line-height: 22px;
    }
    .clueMsgBox{
        display : flex;
        justify-content: center;
        align-items : center;
        color : #fff;
        font-family: 'Manrope',sans-serif;
        font-weight : 700;
        font-size : 14px;
        line-height: 20px;
        margin-bottom : 10px;
    }
    .clueMsgTeamIdentifier {
        color : #fff;
        padding : 5px 10px;
        border-radius : 10px;
        font-family: 'Manrope', sans-serif;
        font-weight : 700;
        line-height: 20px;
        font-size: 14px;
    }
    .clueMsg{
        color : #fff;
        margin-left : 10px;
        font-family : 'Manrope',sans-serif;
        font-weight : 700;
        font-size : 14px;
        line-height : 25px;
    }
    .clueWaiting {
        color: rgba(255, 255, 255,1);
        font-family : 'Manrope',sans-serif;
        font-weight : 700;
        font-size : 14px;
        line-height : 19px;
        text-align : center;
        margin : 0px auto 10px;
        width : 60%;
    }
    .redSpymasterDisappear,.blueSpymasterDisappear {
        color: rgba(255, 255, 255,1);
        font-family : 'Manrope',sans-serif;
        font-weight : 700;
        font-size : 14px;
        line-height : 19px;
        text-align : center;
        margin : 0px auto 10px;
        width : 60%;
        color: #c9c920;
    }
    .noOnlinePlayer {
        color: rgba(255, 255, 255,1);
        font-family : 'Manrope',sans-serif;
        font-weight : 700;
        font-size : 14px;
        line-height : 19px;
        text-align : center;
        margin : 0px auto  10px auto;
        width : 60%;
        color: #c9c920;
    }
    .postWordClickMsgBox {
        color: #c9c920;
        font-family : 'Manrope',sans-serif;
        font-weight : 700;
        font-size : 14px;
        line-height : 19px;
        text-align : center;
        margin : 0px auto 10px;
        width : 60%;
    }
    .endTurnBtn{
        margin : 0px auto;
        padding : 1% 2%;
        cursor : pointer;
        display : block;
        background: #E44C4F;
        color : #fff;
        box-shadow: 2.14663px 3.21994px 3.21994px rgba(29, 13, 54, 0.2), inset 0px 1px 0px #FFFEFE;
        border-radius: 8px;
        font-family: 'Manrope', sans-serif;
        font-weight : 800;
        line-height: 20px;
        font-size: 14px;
    }
    .endTurnBtn:hover {
        transform : scale3d(1.05,1.05,1.25);
    }
    .redTeam_List{
        position : absolute;
        top : 50%;
        transform : translateY(-50%);
        right : 22px;
        width : 16%;
    }
    .blueTeam_List{
        position : absolute;
        top : 50%;
        transform : translateY(-50%);
        left : 22px;
        width : 16%;
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
        border-radius : 10px;
        padding : 5px;
    }
    .users {
        overflow : auto;
        max-height : 150px;
    }
    .user{
        display : flex;
        align-items : center;
        justify-content : space-between;
        padding : 5px;
    }
    .userDetails {
        display : flex;
        align-items : center;
        justify-content: center;
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
    .userName{
        padding-left : 10px;
        font-family : 'Manrope', sans-serif;
        font-size : 12px;
        font-weight : 700;
        line-height : 14px;
    }
    .Word-hide{
        display: none;
    }
    .Word-show{
        display : inline;
        position: absolute;
        top : -6%;
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
    @media screen and (max-height : 670px) {
        .word {
            padding : 10px;
        }
    }

    @media screen and (max-width : 1200px) {
        .playerDetails {
            flex : 1.25;
        }
        .scorecard {
            flex : 0.75;
        }
    }
    @media screen and (max-width : 1100px)  {
        
        .scorecard {
            font-size : 12px;
        }
        .spymasterBox,.teamIndicator ,.player,.turnIndicator,.noOnlinePlayer,.redSpymasterDisappear,.blueSpymasterDisappear,.postWordClickMsgBox,.sendClueMsg,.clueMsgBox,.clueMsg,.clueMsgTeamIdentifier,.clueWaiting,.sendClueMsg,.give-clue-btn,.Word-show,.logsBtn{
            font-size : 12px;
        }
        .Word-show{
            padding : 4px;
        }
        .redTeam_List,.blueTeam_List {
            width : 14.5%;
        }
        .player-box {
            height : 30px;
        }
        .playerProfilePicture {
            height : 30px;
            width : 30px;
        }
        ::-webkit-scrollbar {
            width : 5px;
        }
        ::-webkit-scrollbar-track {
            background: #fff;
            border-radius : 2.5px;
        }

        /* Handle */
        ::-webkit-scrollbar-thumb {
            background: #888;
            border-radius : 2.5px;
        }

        .codenamePng {
            height : 50px;
        }
        
    }
    
    @media screen and (max-width : 900) {
        .codenamePng {
            height : 40px;
        }
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
    @media screen and (max-width : 900px) {
        .blueTeam_List,.redTeam_List {
            width : 15%;
        }
    }
    @media screen and (max-width : 1150px){
        .word-matrix{
            padding: 8px;
            grid-gap : 8px;
            grid-template-rows : repeat(5,1fr);
        }
        .word {
            font-size : 14px;
            padding : 10px
        }
        .sendClueMsg{
            font-size : 14px;
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
        .redTeam_List,.blueTeam_List {
            width : 16%;
        }
        .container {
            width : 58%;
        }
    }
    @media screen and (max-width : 1000px) {
        .blue_heading,.red_heading {
            font-size: 14px;
        }
        .codenamePng {
            height : 45px;
        }
        .blueTeam_List,.redTeam_List {
            width : 17%;
        }
    }
    @media screen and (max-width : 950px) {
        .word {
            font-size : 13px;
        }
    }
</style>