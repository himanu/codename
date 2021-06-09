<script>
    import CodeName from "./CodeName.svelte";
    import Cross from "./Cross.svelte";
    import { dbGameSession, dbUser, dbUsers, dbWordList, dbTurn, dbClue, dbSelectedWordsList, dbPage} from "./database";
    import Tick from "./Tick.svelte";
    import { getParams } from './utils';

    let wordList = [];
    let team;
    let user;
    let profile_picture_border_color;
    let turn;
    let clue;
    let resultDeclared = false;
    let winner;
    let looser;
    let clueWord,clueWord_Count;
    let clueSenderTeam;
    let redTeam = [],blueTeam = [];
    let is_This_User_Turn;
    let selectedWordsList = [];
    let redScore = 9, blueScore = 8;
    let lastWordSelected;
    let selectedInfoType = 0;
    let selectedInfoTypeTimeout;
    let showSelectedInfo = false;
    let tableBorderColor;
    let clueMsgTeamIdentifierColor;
    let postWordClickMsg;
    let tableBorderMap = {
        0 : "#4C1A96",
        1 : "#3FAB8B",
        2 : "#E1BC36",
        3 : "#9C9C9C",
        4 : "#3FAB8B",
        5 : "#E1BC36",
        6 : "#3FAB8B",
        7 : "#3B3B3B",
        8 : "#3FAB8B"
    }

    //user Profile picture
    let userProfilePicture = getParams("userProfilePicture");
    let userName = getParams("userName");
    let userId = getParams("userId");

    //To know whether this player is spymaster or not and to determine the border-color of profile picture
    dbUser.on('value',(snap)=>{
        if(!snap.exists)
        return;
        user = snap.val();
    })

    //To fill redTeam and blueTeam
    dbUsers.on('value',(snap)=>{
        let users = snap.val();
        for(const id in users)
        {
            const user = users[id];
            if(user.team === "Red")
            {
                redTeam.push(user);
            }
            else if(user.team === "Blue")
                blueTeam.push(user);
        }
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

    // dbRedScore.on('value',(snap)=>{
    //     if(!snap.exists) {
    //         return;
    //     }
    //     redScore = snap.val();
    // })

    // dbBlueScore.on('value',(snap)=>{
    //     if(!snap.exists) {
    //         return;
    //     }
    //     blueScore = snap.val();
    // })
    // dbLastWordSelected.on('value',(snap)=>{
    //     if(!snap.exists) {
    //         return;
    //     }
    //     lastWordSelected = snap.val();
    // })
    //
    dbSelectedWordsList.on('value',(snap)=>{
        if(!snap.exists){
            return;
        }
        selectedWordsList = snap.val();
    })

    $:{
        if(selectedWordsList)
        {
            let wordSelected;
            let cnt1 = 0;
            let cnt2 = 0;
            for(const id in selectedWordsList) {
                wordSelected = selectedWordsList[id];
                if(wordSelected.color === "Red") {
                    cnt1++;
                }
                else if(wordSelected.color === "Blue") {
                    cnt2++;
                }
            }
            redScore = 9 - cnt1;
            blueScore = 8 - cnt2;
        }
    }
    $:{
        if(selectedWordsList) {
            lastWordSelected = selectedWordsList[selectedWordsList.length - 1];
        }
    }
    $: {
        if(lastWordSelected) {
            showSelectedInfo = true;
            updateSelectionInfoType();
        }
    }
    $: {

        if(lastWordSelected) {
            if(lastWordSelected.color === lastWordSelected.selectorTeam && team === lastWordSelected.color){
                selectedInfoType = 1;
                if(user.id === userId) {
                    postWordClickMsg = "";
                }
                else {
                    let selector = lastWordSelected.selectorName;
                    postWordClickMsg = "Hurrah! " + {selector} + "(Your Teammate) select correct word";
                }
            }
            else if(lastWordSelected.color === lastWordSelected.selectorTeam && team !== lastWordSelected.color){
                selectedInfoType = 2;
                postWordClickMsg = "";
            }
            else if(lastWordSelected.color === "Grey" && team !== turn){
                selectedInfoType = 3;
                let selector = lastWordSelected.selectorName;
                if(user.id === userId) {
                    postWordClickMsg = "Uff! You select grey word by mistake and your team chance is passed";
                }
                else {
                    postWordClickMsg = "Uff! " + selector + "(Your Teammate) select grey word by mistake and your team chance is passed";
                }
            }
            else if(lastWordSelected.color === "Grey" && team === turn){
                selectedInfoType = 4;
                postWordClickMsg = "Hurrah! Your opponent team select grey word by mistake and now it's your team turn";
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
                let selector = lastWordSelected.selectorName;
                if(user.id === userId) {
                    postWordClickMsg = "Uff! You choose opponent's word by mistake, they get a free word and your chance is passed.";
                }
                else {
                    postWordClickMsg = "Uff! " + {selector} + "(Your Teammate) choose opponent's word by mistake, they get a free word and your chance is passed."
                }
            }
            else if(lastWordSelected.color !== lastWordSelected.selectorTeam && team === turn){
                selectedInfoType = 6;
                postWordClickMsg = "Hurrah! Your opponet choose your's team word by mistake, your team get a free word and now it's your team turn."
            }
        }
    }
    function updateSelectionInfoType() {
        clearTimeout(selectedInfoTypeTimeout);

        selectedInfoTypeTimeout = setTimeout(()=>{
                showSelectedInfo = false;
        },100000);
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
    $: {
        if(showSelectedInfo) {
            if(selectedInfoType === 1) {

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

        if(!selectedWordsList)
        selectedWordsList = [];

        selectedWordsList.push(word);
        dbGameSession.update({
            selectedWordsList
        })
        if(word.color === "Grey"){
            changeTurn();
        }
        else if(word.color !== team && word.color !== "Black") {
            changeTurn();
        }
    }
    //to send clues to the other player
    function giveClue(event){
        event.preventDefault();
        dbGameSession.update({
            clue : {
                clueWord,
                clueWord_Count,
                senderName : userName,
                senderId : userId,
                clueSenderTeam : turn
            }
        })
    }

    function changeTurn() {
        showSelectedInfo = false;
        if(turn === "Red")
        {
            dbGameSession.update({
                turn : "Blue",
                clue : null
            })
        }
        else if(turn === "Blue")
        {
            dbGameSession.update({
                turn : "Red",
                clue : null
            })
        }
    }

    function processName(name){
        let fname = name.split(" ")[0];
        if(fname.length > 10)
        {
            fname = fname.slice(0,7) + "...";
        }
        return fname;
    }
    function handleRestartBtn() {
        dbGameSession.update({
            page : "Lobby Screen",
            selectedWordsList : null,
            clue : null
        })
    }
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
            {#if (!clue || clue.clueSenderTeam != team) }
                <form class = "form-container" on:submit = {giveClue}>
                    <input type = "text" placeholder = "Clue ..." bind:value = {clueWord} class = "input-box" required>
                    <select class = "count-word-box" bind:value = {clueWord_Count}>
                        <option value = "1">
                            x 1
                        </option>
                        <option value = "2">
                            x 2
                        </option>
                        <option value = "3">
                            x 3
                        </option>
                        <option value = "4">
                            x 4
                        </option>
                        <option value = "5">
                            x 5
                        </option>
                        <option value = "6">
                            x 6
                        </option>
                        <option value = "7">
                            x 7
                        </option>
                        <option value = "8">
                            x 8
                        </option>
                    </select>
                    <button class = "give-clue-btn" type = "submit">
                        Give Clue
                    </button>
                </form>
                <div class = "sendClueMsg">Send clue to your team</div>
            {/if}
            {#if clue && clue.clueSenderTeam === turn && team === turn}
                <div class="clueMsgBox">You have send clue {clue.clueWord} x {clue.clueWord_Count} words</div>
            {/if}
            {#if showSelectedInfo}
                <div class = "postWordClickMsgBox"> {postWordClickMsg} </div>
            {/if}
        {:else}
            {#if (clue && clue.clueSenderTeam === turn)}
                <div class = "clueMsgBox">
                    <div class = "clueMsgTeamIdentifier" style = "background-color : {clueMsgTeamIdentifierColor}"> {turn.toUpperCase()}</div>
                    <div class = "clueMsg"> {clue.clueWord} x {clue.clueWord_Count} </div>
                </div>
            {/if}
            {#if showSelectedInfo}
                <div class="postWordClickMsgBox"> {postWordClickMsg} </div>
            {/if}
            {#if is_This_User_Turn}
                <button class="endTurnBtn" on:click = {changeTurn}>End Turn</button>
            {/if}
        {/if}
    </div>
    <div class="blueTeam_List">
        <div class = "blue_heading">
            Blue Team
        </div>
        <div class = "blueUserBox">
            <div class = "blueUsers">
                {#each blueTeam as user}
                    <div class = "blueUser">
                        <img class = "blueUser_profilePicture" src = {user.profilePicture} alt = "profilePicture">
                        {#if user.spymaster}
                            <div class = "blueUser_name"> { processName(user.userName) }(Spymaster) </div>
                        {:else}
                            <div class = "blueUser_name"> { processName(user.userName) }{user.id === userId?"(You)":''} </div>
                        {/if}

                    </div>
                {/each}
            </div>
        </div>
    </div>
    <div class="redTeam_List">
        <div class = "red_heading">
            Red Team
        </div>
        <div class = "redUserBox">
            <div class = "redUsers">
                {#each redTeam as user}
                    <div class="redUser">
                        <img class = "redUser_profilePicture" src = {user.profilePicture} alt = "profilePicture">
                        {#if user.spymaster}
                            <div class="redUser_name"> {processName(user.userName)}(Spymaster)</div>
                        {:else}
                            <div class="redUser_name"> {processName(user.userName)}{user.id === userId?"(You)":''}</div>
                        {/if}
                    </div>
                {/each}
            </div>
        </div>
    </div>
    {#if showSelectedInfo}
        <span class="{ selectedInfoType === 1 ?"Word-show" : "Word-hide"}" style = "background-color : {tableBorderMap[selectedInfoType]};">Hurrah!!! Correct word Selected</span>
        <span class="{ selectedInfoType === 2 ?"Word-show" : "Word-hide"}" style = "background-color : {tableBorderMap[selectedInfoType]};">Uff!!! Opponent selected correct word</span>

        <span class="{ selectedInfoType === 3 ?"Word-show" : "Word-hide"}" style = "background-color : {tableBorderMap[selectedInfoType]};">Uff!!! Grey word Selected</span>
        <span class="{ selectedInfoType === 4 ?"Word-show" : "Word-hide"}" style = "background-color : {tableBorderMap[selectedInfoType]};">Hurrah!!! Opponent selected grey word </span>

        <span class="{ selectedInfoType === 5 ?"Word-show" : "Word-hide"}" style = "background-color : {tableBorderMap[selectedInfoType]};">Uff!!! Opponent word Selected</span>
        <span class="{ selectedInfoType === 6 ?"Word-show" : "Word-hide"}" style = "background-color : {tableBorderMap[selectedInfoType]};">Hurrah!!! Opponent selected your word </span>

        <span class="{ selectedInfoType === 7 ?"Word-show" : "Word-hide"}" style = "background-color : {tableBorderMap[selectedInfoType]};">Uff!!! Black word Selected</span>
        <span class="{ selectedInfoType === 8 ?"Word-show" : "Word-hide"}" style = "background-color : {tableBorderMap[selectedInfoType]};">Hurrah!!! Opponent selected black word</span>
    {/if}
</main>
<style>
    @import url('https://fonts.googleapis.com/css2?family=Manrope:wght@700;800&display=swap');
    ::-webkit-scrollbar {
        width: 10px;
    }

    /* Track */
    ::-webkit-scrollbar-track {
        background: #fff
    }
        
        /* Handle */
    ::-webkit-scrollbar-thumb {
        height : 10px;
        background: #2A337E; 
        border-radius : 5px;
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
        padding : 0px;
        height : 40px;
        width : 12.5%;
        border-radius: 46px;
        display : flex;
        align-items : center;
        justify-content: space-between;
        padding-right : 1%;
    }
    .spymasterProfilePicture{
        margin : 0px;
        padding : 0px;
        height : 40px;
        width : 40px;
        border-radius: 50%;
    }
    .spymaster{
        font-size : 18px;
        font-family: 'Manrope', sans-serif;
        font-weight : 700;
        line-height: 17px;
    }
    .scorecard{
        background-color: #F5C13B;
        display : flex;
        flex-direction:  column;
        justify-content: center;
        align-items: center;
        border-radius: 46px;
        padding : 0.5% 1%;
        color : #fff;
        font-family: 'Manrope', sans-serif;
        font-weight : 700;
        line-height: 20px;
        font-size: 15px;
        width : 10%;
    }
    .blueScore {
        color : #5E96E8;
        padding : 1%;
    }
    .redScore {
        color : #E44C4F;
        padding : 1%;
    }
    

    .table{
        width : 60%;
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
        text-align: center;
        font-weight : bold;
        line-height: 17px;
        letter-spacing: 0.04em;
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
    .input-box{
        border : 0px;
        border-radius : 10px;
        border-top-right-radius: 0px;
        border-bottom-right-radius: 0px;
        flex : 3;
        margin-right : -10px;
    }
    .count-word-box{
        border : 0px;
        flex : 1;
        border-radius : 10px;
        background : #ECECEC;
    }
    .give-clue-btn{
        border : 0px;
        background : #3AC180;
        color : #ffffff;
        margin-left : 10px;
        border-radius : 10px;
        flex : 2;
        cursor : pointer;
    }
    .sendClueMsg {
        color : #fff;
        text-align : center;
    }
    .clueMsgBox{
        display : flex;
        justify-content: center;
        align-items : center;
        padding : 20px 20px 5px;
        color : #fff;
    }
    .clueMsgTeamIdentifier {
        color : #fff;
        padding : 10px 30px;
        border-radius : 40px;
        font-size : 15px;
        font-weight: bold;
        letter-spacing: 1px;
    }
    .clueMsg{
        color : #fff;
        padding : 10px 10px;
        font-size : 20px;
    }
    .postWordClickMsgBox {
        color: rgba(255, 255, 255);
        text-align : center;
        margin : 0px auto;
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
        font-size : 20px;
    }
    .redTeam_List{
        position : absolute;
        bottom : 3%;
        right : 4%;
        width : 15%;
    }
    .blueTeam_List{
        position : absolute;
        bottom : 3%;
        left : 4%;
        width : 15%;
    }
    .blue_heading{
        font-family: 'Manrope', sans-serif;
        font-weight : bold;
        color : #5E96E8;
        text-align : center;
        padding : 10px;
        font-size : 18px;
    }
    .red_heading{
        font-family : 'Manrope', sans-serif;
        font-weight : bold;
        color : #E44C4F;
        text-align: center;
        padding : 10px;
        font-size : 18px;
    }
    .redUserBox,.blueUserBox{
        background-color : #fff;
        height : 150px;
        border-radius : 10px;
        padding : 10px;
    }
    .redUsers, .blueUsers{
        height : 100%;
        width : 100%;
        overflow-y : scroll;
    }
    .redUser,.blueUser{
        padding : 10px;
        display : flex;
        align-items : center;
        justify-content : flex-start;
    }
    .blueUser_profilePicture,.redUser_profilePicture{
        width : 20px;
        height : 20px;
        border-radius : 50%;
    }
    .blueUser_name,.redUser_name{
        padding-left : 10px;
        font-family : 'Manrope', sans-serif;
        font-weight : 700;
        font-size : 14px;
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
        font-size : 14px;
        color : #fff;
        border-radius : 10px;
    }
</style>