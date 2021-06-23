<script>
    import Tick from './Tick.svelte';
    import { dbUser,dbUsers ,dbTime,dbGameSessionRound,listenFirebaseKey} from "./database";
    import LobbyScreen from "./Lobby_Screen.svelte";
    import LoadingSvg from './LoadingSvg.svelte';
    import DisconnectedSvg from './DisconnectedSvg.svelte';
    var leftTime = 5;
    let time;
    let user;
    let redTeam = [];
    let blueTeam = [];
    let users;
    let userId;
    let currUser;
    
    dbUser.on('value',(snap)=>{
        if(!snap.exists)
        return;
        user = snap.val();
        userId = user.id;
    })


    listenFirebaseKey(dbTime, (dbTimeRef) => {
        dbTimeRef.on('value',(snap)=>{
            if(!snap.exists()) {
                return;
            }
            time = snap.val();
        })
    })
    
    
    dbUsers.on('value',(snap)=>{
        if(!snap.exists){
            return ;
        }
        users = snap.val();
    })

     $:{
        redTeam = [];
        blueTeam = [];
        for(const id in users) {
            let currentUser = users[id];
            if(currentUser.team === "Red") {
                redTeam.push(currentUser);
            }
            else if(currentUser.team === "Blue") {
                blueTeam.push(currentUser);
            }
        }
        redTeam = redTeam;
        blueTeam = blueTeam;
     }
    


    var interval = setInterval(updateTime,1000);
	function updateTime() {
        if(time) {
            leftTime = time - Date.now();
            leftTime = Math.floor( leftTime/1000 );
            if(leftTime <= 0) {
                clearInterval(interval);
                listenFirebaseKey(dbGameSessionRound,(dbGameSessionRoundRef)=>{
                    dbGameSessionRoundRef.update({
                        page : "Game Screen"
                    })
                })
            }
        }	
	}
    function keepUpdatingUsersOnlineStatus() {
        setInterval(updateUsersOnlineStatus, 1000);
    }
    let allUserOnlineStatus = {};
    function updateUsersOnlineStatus() {
        for(const id in usersList) {
            currUser = usersList[id];
            if( (currUser.online === true) || (Date.now() - currUser.online <= 5000) ) {
                allUserOnlineStatus[currUser.id] = true;
            }
            else {
                allUserOnlineStatus[currUser.id] = false;
            }
        }
    }
    updateUsersOnlineStatus();
    keepUpdatingUsersOnlineStatus();
    function processName(user) {
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
    updateTime();
</script>
<main>
    {#if !user?.team}
        <LobbyScreen/>
    {:else}
        <div class = "gameHeading">
            <img class = "codenamePng" src = '/images/codenames-logo.png' alt = "codenamesPng">
        </div>
        <div class="container">
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
                                        {#if user.profilePicture}
                                        <img class = "profilePicture" src = {user.profilePicture} alt = "profilePicture">
                                        {:else}
                                            <div class = "fakeProfilePicture"> {user.userName[0].toUpperCase()} </div>
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
                                        <DisconnectedSvg />
                                    {/if}
                                </div>
                            {/each}
                        </div>
                    </div>
                </div>
        
                <div class="vsBox">
                    <div class="vs">VS</div>
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
                                        {#if user.profilePicture}
                                        <img class = "profilePicture" src = {user.profilePicture} alt = "profilePicture">
                                        {:else}
                                            <div class = "fakeProfilePicture"> {user.userName[0].toUpperCase()} </div>
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
                </div>
            </div>
            <div class = "text">
                Game will start in {leftTime} seconds...
            </div>
        </div>
    {/if}
</main>
<style>
   @import url('https://fonts.googleapis.com/css2?family=Manrope:wght@700;800&display=swap');
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
    @media screen and (max-width : 1100px) {
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
    
    .container {
        position : absolute;
        top : 50%;
        left : 50%;
        transform: translate(-50%,-50%);
        width : 60%;
    }
    .teams{
        display : flex;
        justify-content: center;
        width : 100%;
        margin : auto;
    }
    .text{
        color : #fff;
        font-family: 'Manrope', sans-serif;
        font-size : 24px;
        line-height: 24px;
        margin-top : 5%;
        font-weight : 700;
    }
    
    .red,.blue{
        display : flex;
        flex-direction: column;
        justify-content: space-between;
        align-items: center;
        padding : 15px;
        width : 50%;
        max-height : 300px;
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
    .blueH,.redH{
        margin : 0px;
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
        max-height: 50%;
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
    @media screen and (max-width : 1150px) {
        .blueH,.redH {
            font-size : 0.9em;
        }
        .vs {
            width : 60px;
            height : 60px;
            font-size : 0.9em;
        }
        .emptyTeamMsg{
            font-size : 14px;
        }
    }
    @media screen and (max-width : 1100px) {
        .codenamePng {
            height : 50px;
        }
    }
    @media screen and (max-width : 1000px) {
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
        .codenamePng {
            height : 45px;
        }
    }
    @media screen and (max-width : 900px) {
        .codenamePng {
            height : 40px;
        }
    }
</style>