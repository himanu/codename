<script>
    import CodeName from "./CodeName.svelte";
    import { dbGameSession,dbUser,dbUsers ,dbTime} from "./database";
    let time;
    let user;
    let redTeam = [];
    let blueTeam = [];
    let users;
    
    dbUser.on('value',(snap)=>{
        if(!snap.exists)
        return;
        user = snap.val();
    })

    dbGameSession.on('value',(snap)=>{
        if(!snap.exists)
            return;
    })

    dbTime.on('value',(snap)=>{
        if(!snap.exists){
            return ;
        }
        time = snap.val();
    })

    dbUsers.on('value',(snap)=>{
        if(!snap.exists){
            return ;
        }
        users = snap.val();
    })

     $:{
        if(users.length) {
            for(const id in users) {
                let currentUser = users[id];
                if(currentUser.team === "Red") {
                    redTeam.push(user);
                }
                else if(currentUser.team === "Blue") {
                    blueTeam.push(user);
                }
            }
        }
     }
    


    var interval = setInterval(updateTime,1000);
	function updateTime(){
		time = time - 1;
        if(time>=0)
        {
            dbGameSession.update({
                time 
            })
        }
        
		if(time === 0)
		{
            clearInterval(interval);
            dbGameSession.update({
                page : "Game Screen"
            })
        }	
	}
</script>
<main>
    <div class = "gameHeading">
        <CodeName/>
    </div>
    <div class = "container">
        <div class = "teams">
            <div class = "blue">
                <div class = "blueH">Blue Team</div>
                <div class = "players">
                    {#each blueTeam as user}
                        <img class = "player" src = '{user.profilePicture? user.profilePicture : './images/smiley.svg'}' alt = 'player profilePicture'>
                    {/each}
                </div>
            </div>
            <div class = "red">
                <div class = "redH">Red Team</div>
                <div class = "players">
                    {#each redTeam as user}
                        <img class = "player" src = '{user.profilePicture? user.profilePicture : './images/smiley.svg'}' alt = 'player profilePicture'>
                    {/each}
                </div>
            </div>
        </div>

        <div class="vs">
            VS
        </div>
        <div class = "text">
            Game will start in {time} seconds...
        </div>
    </div>
</main>
<style>
   @import url('https://fonts.googleapis.com/css2?family=Manrope:wght@700;800&display=swap');
    main{
        background-image : url(/images/background.svg);
        border-radius: 20px;
        background-size: 100% 100%;
        width : 100%;
        height : 100%;
        text-align : center;
        display : flex;
        justify-content: center;
        align-items: center;
    }
    .gameHeading{
        position : absolute;
        top : 5%;
    }
    .container{
        display: flex;
        flex-direction : column;
        align-items : center;
        justify-content: center;
        width : 100%;
    }
    .text{
        color : #fff;
        font-family: 'Manrope', sans-serif;
        font-size : 24px;
        line-height: 24px;
        margin-top : 5%;
        font-weight : 700;
    }
    .teams{
        display : flex;
        justify-content: center;
        width : 100%;
    }
    .red,.blue{
        display : flex;
        flex-direction: column;
        justify-content: center;
        align-items: center;
        padding : 15px;
        width : 362px;
        height : 135px;
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
    .blueH,.redH{
        margin-bottom : 28px;
    }
    .blueH{
        font-family: 'Manrope', sans-serif;
        font-style: normal;
        font-weight: 800;
        font-size: 24px;
        line-height: 33px;
        text-align: center;
        color: #5E96E8;
    }
    .redH{
        font-family: 'Manrope', sans-serif;
        font-style: normal;
        font-weight: 800;
        font-size: 24px;
        line-height: 33px;
        text-align: center;
        color: #E96143;
    }
    .players{
        width : 100%;
        display : flex;
        justify-content: space-evenly;
        align-items: center;
    }
    .player{
        box-shadow: 0px 11.3008px 14.126px rgba(0, 0, 0, 0.15);
        width : 35px;
        height : 35px;
        border-radius : 50%;
    }
    .vs{
        position : absolute;
        bottom : 50%;
        display : flex;
        align-items: center;
        justify-content: center;
        width : 80px;
        height : 80px;
        background: linear-gradient(0deg, #FFFFF8, #FFFFF8);
        border: 1px solid #7D51FA;
        border-radius: 13.7723px;
        transform: rotate(3.5deg);
        font-family: 'Manrope', sans-serif;
        font-style: normal;
        font-weight: 800;
        font-size: 24px;
        line-height: 33px;
        box-shadow: 5px 5px #7D51FA;
    }
</style>