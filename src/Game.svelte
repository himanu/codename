<script>
    import Cross from "./Cross.svelte";
    import { dbGameSession, dbUser, dbUsers, dbWordList,dbTurn,dbClue,dbSelectedWordsList} from "./database";
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
    let tableBorderColor = "#4C1A96";
    let is_This_User_Turn;
    let selectedWordsList = [];
    let redScore = 8, blueScore = 8;
    let lastWordSelected;
    let selectedInfoType = 0;
    let tableBorderMap = {
        1 : "#3FAB8B",
        2 : "#9C9C9C",
        3 : "#9C9C9C",
        4 : "#3FAB8B",
        5 : "yellow",
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
            redScore = 8 - cnt1;
            blueScore = 8 - cnt2;
        }
    }
    $:{
        if(selectedWordsList) {
            lastWordSelected = selectedWordsList[selectedWordsList.length - 1];
        }
    }
    $: {
        if(tableBorderColor) {
            clearTimeout(tableBorderColorTimeout);
            tableBorderColorTimeout = setTimeout(()=>{
                selectedInfoType = 0;
            },3000);
        }
    }

    $: {
        if(lastWordSelected.color === lastWordSelected.selectorTeam && team === turn){
            tableBorderColor = "#3FAB8B";
            selectedInfoType = 1;
        }
        else if(lastWordSelected.color === lastWordSelected.selectorTeam && team !== turn){
            tableBorderColor = "#9C9C9C";
            selectedInfoType = 2;
        }
        else if(lastWordSelected.color === "Grey" && team !== turn){
            tableBorderColor = "#9C9C9C";
            selectedInfoType = 3;
        }
        else if(lastWordSelected.color === "Grey" && team === turn){
            tableBorderColor = "#3FAB8B";
            selectedInfoType = 4;
        }
        else if(lastWordSelected.color !== lastWordSelected.selectorTeam && team === turn){
            tableBorderColor = "yellow";
            selectedInfoType = 5;
        }
        else if(lastWordSelected.color !== lastWordSelected.selectorTeam && team !== turn){
            tableBorderColor = "#3FAB8B";
            selectedInfoType = 6;
        }
        else if(lastWordSelected.color === "Black" && team === turn){
            tableBorderColor = "#3B3B3B";
            selectedInfoType = 7;
            resultDeclared = true;
            looser = turn;
        }
        else if(lastWordSelected.color === "Black" && team !== turn){
            tableBorderColor = "#3FAB8B";
            selectedInfoType = 8;
            resultDeclared = true;
            winner = turn;
        }
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
        if(clue && turn === team && !isSpymaster) {
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
        clueSenderTeam = team;
        dbGameSession.update({
            clue : {
                clueWord,
                clueWord_Count,
                senderName : userName,
                senderId : userId,
                clueSenderTeam
            }
        })
    }

    function changeTurn() {
        if(turn === "Red")
        {
            dbGameSession.update({
                turn : "Blue"
            })
        }
        else if(turn === "Blue")
        {
            dbGameSession.update({
                turn : "Red"
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
                <button class = "restart-game">Restart Game</button>
            {:else}
                <Cross/>
                <div class="loosing-btn">
                    Wrong Answer!
                    <svg class = "tick-cross" width="15" height="15" viewBox="0 0 10 10" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path fill-rule="evenodd" clip-rule="evenodd" d="M8.56539 9.88682L9.96921 8.48294L6.46021 4.97406L9.87206 1.56233L8.46824 0.158459L5.05634 3.57024L1.48597 0L0.0821475 1.40387L3.65247 4.97406L0.0302734 8.59613L1.4341 10L5.05634 6.37789L8.56539 9.88682Z" fill="#FFEBEE"/>
                    </svg>
                        
                </div>
                <div class="result-text">Your team has lost the Game</div>
                <button class = "restart-game">Restart Game</button>
            {/if}

        </div>
    {/if}
    <div class = "gameHeading">
        <div class = "spymaster-box">
            <img class = "spymasterProfilePicture" src = {userProfilePicture} alt = "Your Spymaster" style = "border : 3px solid {profile_picture_border_color}">
            <div class = "spymaster" style = "color : {profile_picture_border_color}">SPY MASTER</div>
        </div>
        <div class = "codename">
            <svg width="134" height="60" viewBox="0 0 134 60" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M15.0449 14.8555L15.0521 14.8695L15.0594 14.8835C15.5556 15.821 16.7562 17.2294 18.6792 17.1161L19.853 17.0471C20.9648 16.9816 22.0074 16.5274 22.7849 15.7954C22.7778 16.2214 22.7877 16.6546 22.8135 17.0942C22.8426 17.5874 22.8909 18.0702 22.9596 18.5416C22.1671 17.9795 21.1823 17.6984 20.1837 17.7501L18.683 17.8278C16.8344 17.9234 15.8014 19.3545 15.3803 20.2447L15.3772 20.2513L15.3741 20.2578C15.3365 20.3389 15.2924 20.3976 15.2363 20.4495L16.7017 22.0322L15.2363 20.4495C15.1888 20.4935 15.1106 20.5503 14.974 20.6059C14.8436 20.6532 14.6447 20.6999 14.3538 20.717C13.8696 20.7455 13.5781 20.6548 13.3863 20.5463C13.209 20.4408 12.9952 20.2428 12.79 19.8144C12.5844 19.3665 12.4125 18.6904 12.3548 17.7099C12.3013 16.8017 12.3879 16.1305 12.5417 15.6455C12.6941 15.1834 12.8916 14.9336 13.0807 14.7809C13.2492 14.6486 13.5226 14.5165 14.0242 14.4869C14.3143 14.4699 14.5022 14.5007 14.6167 14.535L14.6313 14.5394L14.6459 14.5436C14.7765 14.5807 14.8375 14.623 14.8682 14.6491L14.8873 14.6653L14.9068 14.681C14.9597 14.7238 15.0038 14.775 15.0449 14.8555ZM23.9387 10.6065C23.8559 10.7757 23.7779 10.9472 23.7046 11.1208C23.693 11.0968 23.6812 11.0729 23.6692 11.0489L23.6691 11.0489C23.5832 10.8784 23.4923 10.7109 23.3965 10.5465L21.5331 11.6329L23.3965 10.5465C22.7359 9.41342 21.8811 8.453 20.8339 7.69061C19.8022 6.9336 18.6393 6.39562 17.3696 6.06388L16.8299 8.12968L17.3696 6.06388C16.0967 5.7313 14.7542 5.61878 13.3581 5.70097C11.3266 5.82056 9.45214 6.38077 7.78258 7.41302C6.07211 8.46401 4.76651 9.94523 3.86832 11.7898C2.93629 13.6968 2.60364 15.8907 2.74405 18.2757C2.88351 20.6447 3.45982 22.7731 4.58088 24.5579L4.58087 24.5579L4.58464 24.5638C5.68031 26.2957 7.14233 27.6203 8.95972 28.4722L8.96338 28.4739C10.7504 29.3075 12.6988 29.6396 14.7603 29.5182C16.3678 29.4236 17.8592 29.0887 19.186 28.457C20.4316 27.8639 21.5184 27.0897 22.4018 26.1132L22.4019 26.1131C23.2322 25.1952 23.8847 24.1811 24.3293 23.0701L24.3316 23.0644C24.3533 23.0098 24.3736 22.9551 24.3926 22.9005C24.4871 23.0673 24.586 23.2313 24.6895 23.3925L24.6894 23.3925L24.6954 23.4017C25.8104 25.1198 27.2843 26.4342 29.104 27.2866L29.104 27.2866L29.1143 27.2914C30.9071 28.1196 32.8518 28.4532 34.9039 28.3323C36.9435 28.2123 38.8268 27.6566 40.5071 26.6335L40.5135 26.6296C42.0121 25.7101 43.2052 24.4681 44.0879 22.9438L44.1133 23.3744C44.2479 25.6614 46.211 27.4061 48.4979 27.2715L53.8175 26.9583C56.0284 26.8282 58.0367 26.275 59.7653 25.2192L59.7715 25.2154C61.2241 24.3214 62.3841 23.1398 63.2322 21.6947L63.2842 22.5782C63.4081 24.6822 65.2141 26.2874 67.3181 26.1635L77.2347 25.5797C79.5711 25.4422 81.3536 23.4367 81.216 21.1003L79.0628 21.227L81.216 21.1002C81.1133 19.3555 79.9689 17.9196 78.4229 17.3616C79.5212 16.5369 80.1984 15.1948 80.1116 13.721C80.0252 12.2535 79.2019 11.0045 78.0224 10.3125C79.5046 9.58156 80.4829 8.01445 80.3797 6.26098C80.2421 3.92457 78.2366 2.14205 75.9002 2.27959L65.9465 2.86558C63.8425 2.98944 62.2373 4.79547 62.3612 6.89943L62.4145 7.80439C61.3969 6.4555 60.0932 5.41311 58.5271 4.69947C56.6782 3.84763 54.6031 3.53338 52.3718 3.66474L47.1263 3.97354C44.8394 4.10818 43.0946 6.07124 43.2292 8.35817L43.255 8.79601C42.1997 7.38229 40.8684 6.28818 39.2695 5.55556C37.48 4.72956 35.5431 4.39491 33.5018 4.51508C31.4504 4.63585 29.5589 5.19492 27.8761 6.22704C26.159 7.27719 24.8458 8.758 23.94 10.6038L23.9387 10.6065ZM35.5417 14.2242L35.5459 14.2335L35.5502 14.2429C35.7553 14.6904 35.9249 15.3583 35.9815 16.319C36.038 17.2789 35.9485 17.9678 35.7956 18.4461L35.7955 18.4461L35.7928 18.4549C35.6508 18.9057 35.4655 19.1318 35.2981 19.2639C35.1519 19.3777 34.892 19.5079 34.3862 19.5376C33.89 19.5669 33.6097 19.4727 33.4391 19.3732C33.2601 19.2596 33.0492 19.0524 32.8511 18.6238C32.6467 18.1621 32.4806 17.4858 32.4243 16.5284C32.3677 15.5667 32.4546 14.8797 32.6028 14.4068C32.7532 13.9388 32.9419 13.7161 33.0971 13.5947L33.1008 13.5918C33.2557 13.4701 33.519 13.3393 34.0195 13.3098C34.5209 13.2803 34.7897 13.3801 34.9466 13.477L34.9577 13.4839L34.9689 13.4906C35.1373 13.5918 35.3457 13.7854 35.5417 14.2242ZM54.6176 17.9348L54.6109 17.9383C54.3356 18.0845 53.921 18.2175 53.308 18.272L52.9595 12.3516C53.5586 12.3457 53.9795 12.4275 54.2667 12.5357L54.2735 12.5382C54.4457 12.6024 54.6141 12.7169 54.7867 13.031L54.7902 13.0374L54.7937 13.0438C54.97 13.3596 55.1751 14.0118 55.2442 15.185C55.3134 16.3615 55.189 17.0385 55.0518 17.3772L55.0491 17.384L55.0464 17.3909C54.91 17.7344 54.7584 17.8607 54.6176 17.9348Z" fill="white" stroke="#7D51FA" stroke-width="4.31394"/>
                <g filter="url(#filter0_d)">
                <rect x="83.0557" y="23.1162" width="25.728" height="25.728" rx="4.57022" transform="rotate(7.16454 83.0557 23.1162)" fill="#7B4FF7"/>
                <rect x="81.6224" y="21.1882" width="25.3962" height="25.3962" rx="4.4043" transform="rotate(7.16454 81.6224 21.1882)" fill="url(#paint0_linear)" stroke="#7D51FA" stroke-width="0.331841"/>
                <g filter="url(#filter1_i)">
                <path d="M96.6978 40.3033L88.3351 39.2521L89.6443 28.837L98.007 29.8882L97.7259 32.1244L91.8138 31.3812L91.5886 33.1732L96.3826 33.7758L96.1111 35.9354L91.3171 35.3328L91.0668 37.3239L96.9789 38.0671L96.6978 40.3033Z" fill="#260C4B"/>
                </g>
                </g>
                <g filter="url(#filter2_d)">
                <rect x="103.183" y="24.9482" width="25.728" height="25.728" rx="4.57022" transform="rotate(-1.98181 103.183 24.9482)" fill="#7B4FF7"/>
                <rect x="101.461" y="23.2734" width="25.3962" height="25.3962" rx="4.4043" transform="rotate(-1.98181 101.461 23.2734)" fill="url(#paint1_linear)" stroke="#7D51FA" stroke-width="0.331841"/>
                <g filter="url(#filter3_i)">
                <path d="M115.038 35.8984L113.06 35.4417C111.43 35.0553 110.59 34.137 110.54 32.6868C110.507 31.7303 110.85 30.9359 111.57 30.3034C112.289 29.6607 113.338 29.3155 114.716 29.2678C115.425 29.2432 116.128 29.3013 116.822 29.442C117.517 29.5725 118.089 29.7483 118.54 29.9695L117.879 32.2939C117.458 32.0407 116.952 31.842 116.36 31.6977C115.778 31.5428 115.219 31.4746 114.685 31.4931C113.656 31.5287 113.152 31.8345 113.172 32.4104C113.179 32.6264 113.257 32.7936 113.405 32.9121C113.564 33.0199 113.814 33.1193 114.157 33.2104L116.028 33.7017C117.004 33.9563 117.727 34.3071 118.196 34.7543C118.664 35.2015 118.911 35.785 118.936 36.505C118.971 37.5232 118.604 38.3597 117.833 39.0145C117.073 39.6689 116.04 40.0188 114.734 40.0639C114.024 40.0885 113.317 40.0203 112.611 39.8594C111.905 39.6882 111.347 39.4964 110.938 39.284L111.459 36.9182C111.89 37.1916 112.398 37.4211 112.981 37.6069C113.574 37.782 114.148 37.86 114.703 37.8408C115.218 37.823 115.61 37.7167 115.882 37.522C116.163 37.3269 116.299 37.0802 116.289 36.7819C116.281 36.5659 116.172 36.3895 115.961 36.2526C115.761 36.1154 115.453 35.9973 115.038 35.8984Z" fill="#260C4B"/>
                </g>
                </g>
                <g filter="url(#filter4_d)">
                <rect x="55.9863" y="29.3545" width="25.728" height="25.728" rx="4.57022" transform="rotate(-11.022 55.9863 29.3545)" fill="#7B4FF7"/>
                <rect x="55.7288" y="27.2962" width="25.3962" height="25.3962" rx="4.4043" transform="rotate(-11.022 55.7288 27.2962)" fill="url(#paint2_linear)" stroke="#7D51FA" stroke-width="0.331841"/>
                <g filter="url(#filter5_i)">
                <path d="M74.9432 40.9595L73.7154 34.6562L71.3353 38.9887L70.8959 39.0742L67.0788 35.9489L68.3066 42.2522L65.761 42.748L63.7541 32.4446L65.9512 32.0166L70.4561 35.6056L73.2848 30.5882L75.4818 30.1603L77.4887 40.4637L74.9432 40.9595Z" fill="#260C4B"/>
                </g>
                </g>
                <g filter="url(#filter6_d)">
                <rect x="36.7891" y="27.0283" width="25.728" height="25.728" rx="4.57022" transform="rotate(3.18723 36.7891 27.0283)" fill="#7B4FF7"/>
                <rect x="35.2473" y="25.3975" width="25.3962" height="25.3962" rx="4.4043" transform="rotate(3.18723 35.2473 25.3975)" fill="url(#paint3_linear)" stroke="#7D51FA" stroke-width="0.331841"/>
                <g filter="url(#filter7_i)">
                <path d="M41.578 42.862L46.2152 32.6069L49.2515 32.776L52.6445 43.4782L50.0243 43.3323L49.4226 41.3662L45.0299 41.1216L44.1982 43.0079L41.578 42.862ZM47.5986 35.2504L45.7828 39.2618L48.8808 39.4344L47.5986 35.2504Z" fill="#260C4B"/>
                </g>
                </g>
                <g filter="url(#filter8_d)">
                <rect x="8.66748" y="30.6816" width="25.728" height="25.728" rx="4.57022" transform="rotate(-10.5922 8.66748 30.6816)" fill="#7B4FF7"/>
                <rect x="10.1692" y="28.6345" width="25.3962" height="25.3962" rx="4.4043" transform="rotate(-10.5922 10.1692 28.6345)" fill="url(#paint4_linear)" stroke="#7D51FA" stroke-width="0.331841"/>
                <g filter="url(#filter9_i)">
                <path d="M28.7283 42.5451L22.3518 37.2516L23.5237 43.5184L20.9745 43.9951L19.045 33.6769L21.2604 33.2627L27.6217 38.559L26.4498 32.2922L28.999 31.8155L30.9285 42.1337L28.7283 42.5451Z" fill="#260C4B"/>
                </g>
                </g>
                <rect x="12.4692" y="13.9287" width="4.31394" height="7.30051" fill="#7D51FA"/>
                <defs>
                <filter id="filter0_d" x="77.8336" y="17.0792" width="37.6272" height="38.1633" filterUnits="userSpaceOnUse" color-interpolation-filters="sRGB">
                <feFlood flood-opacity="0" result="BackgroundImageFix"/>
                <feColorMatrix in="SourceAlpha" type="matrix" values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 127 0"/>
                <feOffset dx="3.4878"/>
                <feGaussianBlur stdDeviation="1.96189"/>
                <feColorMatrix type="matrix" values="0 0 0 0 0.294118 0 0 0 0 0.12549 0 0 0 0 0.513726 0 0 0 0.25 0"/>
                <feBlend mode="normal" in2="BackgroundImageFix" result="effect1_dropShadow"/>
                <feBlend mode="normal" in="SourceGraphic" in2="effect1_dropShadow" result="shape"/>
                </filter>
                <filter id="filter1_i" x="88.335" y="28.8369" width="9.67188" height="11.9023" filterUnits="userSpaceOnUse" color-interpolation-filters="sRGB">
                <feFlood flood-opacity="0" result="BackgroundImageFix"/>
                <feBlend mode="normal" in="SourceGraphic" in2="BackgroundImageFix" result="shape"/>
                <feColorMatrix in="SourceAlpha" type="matrix" values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 127 0" result="hardAlpha"/>
                <feOffset dy="0.435975"/>
                <feGaussianBlur stdDeviation="0.217988"/>
                <feComposite in2="hardAlpha" operator="arithmetic" k2="-1" k3="1"/>
                <feColorMatrix type="matrix" values="0 0 0 0 0.235294 0 0 0 0 0.235294 0 0 0 0 0.235294 0 0 0 0.65 0"/>
                <feBlend mode="normal" in2="shape" result="effect1_innerShadow"/>
                </filter>
                <filter id="filter2_d" x="95.6478" y="17.5779" width="37.6322" height="37.5737" filterUnits="userSpaceOnUse" color-interpolation-filters="sRGB">
                <feFlood flood-opacity="0" result="BackgroundImageFix"/>
                <feColorMatrix in="SourceAlpha" type="matrix" values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 127 0"/>
                <feOffset dx="-0.995524"/>
                <feGaussianBlur stdDeviation="2.32289"/>
                <feColorMatrix type="matrix" values="0 0 0 0 0.294118 0 0 0 0 0.12549 0 0 0 0 0.513726 0 0 0 0.25 0"/>
                <feBlend mode="normal" in2="BackgroundImageFix" result="effect1_dropShadow"/>
                <feBlend mode="normal" in="SourceGraphic" in2="effect1_dropShadow" result="shape"/>
                </filter>
                <filter id="filter3_i" x="110.538" y="29.2627" width="8.40026" height="11.2425" filterUnits="userSpaceOnUse" color-interpolation-filters="sRGB">
                <feFlood flood-opacity="0" result="BackgroundImageFix"/>
                <feBlend mode="normal" in="SourceGraphic" in2="BackgroundImageFix" result="shape"/>
                <feColorMatrix in="SourceAlpha" type="matrix" values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 127 0" result="hardAlpha"/>
                <feOffset dy="0.435975"/>
                <feGaussianBlur stdDeviation="0.217988"/>
                <feComposite in2="hardAlpha" operator="arithmetic" k2="-1" k3="1"/>
                <feColorMatrix type="matrix" values="0 0 0 0 0.235294 0 0 0 0 0.235294 0 0 0 0 0.235294 0 0 0 0.65 0"/>
                <feBlend mode="normal" in2="shape" result="effect1_innerShadow"/>
                </filter>
                <filter id="filter4_d" x="55.0982" y="18.3223" width="38.0198" height="39.4212" filterUnits="userSpaceOnUse" color-interpolation-filters="sRGB">
                <feFlood flood-opacity="0" result="BackgroundImageFix"/>
                <feColorMatrix in="SourceAlpha" type="matrix" values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 127 0"/>
                <feOffset dx="3.4878"/>
                <feGaussianBlur stdDeviation="1.96189"/>
                <feColorMatrix type="matrix" values="0 0 0 0 0.294118 0 0 0 0 0.12549 0 0 0 0 0.513726 0 0 0 0.25 0"/>
                <feBlend mode="normal" in2="BackgroundImageFix" result="effect1_dropShadow"/>
                <feBlend mode="normal" in="SourceGraphic" in2="effect1_dropShadow" result="shape"/>
                </filter>
                <filter id="filter5_i" x="63.7539" y="30.1602" width="13.7346" height="13.0237" filterUnits="userSpaceOnUse" color-interpolation-filters="sRGB">
                <feFlood flood-opacity="0" result="BackgroundImageFix"/>
                <feBlend mode="normal" in="SourceGraphic" in2="BackgroundImageFix" result="shape"/>
                <feColorMatrix in="SourceAlpha" type="matrix" values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 127 0" result="hardAlpha"/>
                <feOffset dy="0.435975"/>
                <feGaussianBlur stdDeviation="0.217988"/>
                <feComposite in2="hardAlpha" operator="arithmetic" k2="-1" k3="1"/>
                <feColorMatrix type="matrix" values="0 0 0 0 0.235294 0 0 0 0 0.235294 0 0 0 0 0.235294 0 0 0 0.65 0"/>
                <feBlend mode="normal" in2="shape" result="effect1_innerShadow"/>
                </filter>
                <filter id="filter6_d" x="33.2242" y="21.2989" width="36.4178" height="36.5252" filterUnits="userSpaceOnUse" color-interpolation-filters="sRGB">
                <feFlood flood-opacity="0" result="BackgroundImageFix"/>
                <feColorMatrix in="SourceAlpha" type="matrix" values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 127 0"/>
                <feOffset dx="3.4878"/>
                <feGaussianBlur stdDeviation="1.96189"/>
                <feColorMatrix type="matrix" values="0 0 0 0 0.294118 0 0 0 0 0.12549 0 0 0 0 0.513726 0 0 0 0.25 0"/>
                <feBlend mode="normal" in2="BackgroundImageFix" result="effect1_dropShadow"/>
                <feBlend mode="normal" in="SourceGraphic" in2="effect1_dropShadow" result="shape"/>
                </filter>
                <filter id="filter7_i" x="41.5781" y="32.6064" width="11.0665" height="11.3073" filterUnits="userSpaceOnUse" color-interpolation-filters="sRGB">
                <feFlood flood-opacity="0" result="BackgroundImageFix"/>
                <feBlend mode="normal" in="SourceGraphic" in2="BackgroundImageFix" result="shape"/>
                <feColorMatrix in="SourceAlpha" type="matrix" values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 127 0" result="hardAlpha"/>
                <feOffset dy="0.435975"/>
                <feGaussianBlur stdDeviation="0.217988"/>
                <feComposite in2="hardAlpha" operator="arithmetic" k2="-1" k3="1"/>
                <feColorMatrix type="matrix" values="0 0 0 0 0.235294 0 0 0 0 0.235294 0 0 0 0 0.235294 0 0 0 0.65 0"/>
                <feBlend mode="normal" in2="shape" result="effect1_innerShadow"/>
                </filter>
                <filter id="filter8_d" x="8.99274" y="19.8487" width="38.4133" height="39.2851" filterUnits="userSpaceOnUse" color-interpolation-filters="sRGB">
                <feFlood flood-opacity="0" result="BackgroundImageFix"/>
                <feColorMatrix in="SourceAlpha" type="matrix" values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 127 0"/>
                <feOffset dx="3.4878"/>
                <feGaussianBlur stdDeviation="1.96189"/>
                <feColorMatrix type="matrix" values="0 0 0 0 0.294118 0 0 0 0 0.12549 0 0 0 0 0.513726 0 0 0 0.25 0"/>
                <feBlend mode="normal" in2="BackgroundImageFix" result="effect1_dropShadow"/>
                <feBlend mode="normal" in="SourceGraphic" in2="effect1_dropShadow" result="shape"/>
                </filter>
                <filter id="filter9_i" x="19.0449" y="31.8154" width="11.8835" height="12.6156" filterUnits="userSpaceOnUse" color-interpolation-filters="sRGB">
                <feFlood flood-opacity="0" result="BackgroundImageFix"/>
                <feBlend mode="normal" in="SourceGraphic" in2="BackgroundImageFix" result="shape"/>
                <feColorMatrix in="SourceAlpha" type="matrix" values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 127 0" result="hardAlpha"/>
                <feOffset dy="0.435975"/>
                <feGaussianBlur stdDeviation="0.217988"/>
                <feComposite in2="hardAlpha" operator="arithmetic" k2="-1" k3="1"/>
                <feColorMatrix type="matrix" values="0 0 0 0 0.235294 0 0 0 0 0.235294 0 0 0 0 0.235294 0 0 0 0.65 0"/>
                <feBlend mode="normal" in2="shape" result="effect1_innerShadow"/>
                </filter>
                <linearGradient id="paint0_linear" x1="94.3425" y1="21.0029" x2="94.3425" y2="46.731" gradientUnits="userSpaceOnUse">
                <stop stop-color="#FFFFF8"/>
                </linearGradient>
                <linearGradient id="paint1_linear" x1="114.153" y1="23.1133" x2="114.153" y2="48.8413" gradientUnits="userSpaceOnUse">
                <stop stop-color="#FFFFF8"/>
                </linearGradient>
                <linearGradient id="paint2_linear" x1="68.3982" y1="27.165" x2="68.3982" y2="52.8931" gradientUnits="userSpaceOnUse">
                <stop stop-color="#FFFFF8"/>
                </linearGradient>
                <linearGradient id="paint3_linear" x1="47.9548" y1="25.2227" x2="47.9548" y2="50.9507" gradientUnits="userSpaceOnUse">
                <stop stop-color="#FFFFF8"/>
                </linearGradient>
                <linearGradient id="paint4_linear" x1="22.8396" y1="28.502" x2="22.8396" y2="54.23" gradientUnits="userSpaceOnUse">
                <stop stop-color="#FFFFF8"/>
                </linearGradient>
                </defs>
            </svg> 
        </div>
        <div class="scorecard">
            {blueScore} - {redScore}
        </div>
    </div>
    <div class = "table">
        <div class="word-matrix" style = "border :6px solid {tableBorderColor};">
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
            {/if}
            {#if clue && clue.clueSenderTeam === turn && team === turn}
                <div class="clueMsg">You have send clue {clue.clueWord} x {clue.clueWord_Count}</div>
            {/if}
        {:else}
            {#if is_This_User_Turn}
                <button class="endTurnBtn" on:click = {changeTurn}>End Turn</button>
            {/if}
            {#if (clue && clue.clueSenderTeam === turn)}
                <div class = "clueMsg">{clue.senderName}({turn} Spymaster) has send {clue.clueWord} x {clue.clueWord_Count}</div>
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
                        <div class = "blueUser_name"> { processName(user.userName) } </div>

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
                        <div class="redUser_name"> {processName(user.userName)} </div>
                    </div>
                {/each}
            </div>
        </div>
    </div>
    <span class="{ selectedInfoType === 1 ?"Word-show" : "Word-hide"}" style = "background-color : ;">Hurrah!!! Correct word Selected</span>
    <span class="{ selectedInfoType === 2 ?"Word-show" : "Word-hide"}" style = "background-color : ;">Opponent selected correct word</span>

    <span class="{ selectedInfoType === 3 ?"Word-show" : "Word-hide"}" style = "background-color : ;">Uff!!! Grey word Selected</span>
    <span class="{ selectedInfoType === 4 ?"Word-show" : "Word-hide"}" style = "background-color : ;">Hurrah!!! Opponent selected grey word </span>

    <span class="{ selectedInfoType === 5 ?"Word-show" : "Word-hide"}" style = "background-color : ;">Uff!!! Opponent word Selected</span>
    <span class="{ selectedInfoType === 6 ?"Word-show" : "Word-hide"}" style = "background-color : ;">Hurrah!!! Opponent selected your word </span>

    <span class="{ selectedInfoType === 7 ?"Word-show" : "Word-hide"}" style = "background-color : ;">Uff!!! Black word Selected</span>
    <span class="{ selectedInfoType === 8 ?"Word-show" : "Word-hide"}" style = "background-color : ;">Hurrah!!! Opponent selected black word</span>
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
        height : 20px;
        border-radius: 46px;
        padding : 0.5% 1%;
        color : #fff;
        font-family: 'Manrope', sans-serif;
        font-weight : 700;
        line-height: 20px;
        font-size: 15px;
    }
    

    .table{
        width : 60%;
        margin : auto;
        position: relative;
        top : 10%;
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
    .clueMsg{
        color : #fff;
    }
    .endTurnBtn{
        margin : 2% auto 0;
        padding : 1% 2%;
        cursor : pointer;
        display : block;
        background: #E44C4F;
        color : #fff;
        box-shadow: 2.14663px 3.21994px 3.21994px rgba(29, 13, 54, 0.2), inset 0px 1px 0px #FFFEFE;
        border-radius: 8px;
    }
    .redTeam_List{
        position : absolute;
        bottom : 3%;
        right : 4%;
        width : 175px
    }
    .blueTeam_List{
        position : absolute;
        bottom : 3%;
        left : 4%;
        width : 175px;
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
        top : 18%;
        left : 50%;
        transform : translateX(-50%);
        padding : 5px;
        font-size : 14px;
        color : #fff;
        border-radius : 10px;
    }
</style>