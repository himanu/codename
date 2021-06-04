<script>

</script>
<main>
    <div class = "container">
        <pre class = "preJoin-msg">
            Need atleast 4 players to start the Game
            Waiting for others to join...
        </pre>
        <div class = "user-list">
            <div class = "users">
                <div class = "name">Himanshu</div>  
                <div class = "name">Himanshu</div> 
                <div class = "name">Himanshu</div> 
                <div class = "name">Himanshu</div> 
                <div class = "name">Himanshu</div>
            </div>
        </div>
        <button class = "startBtn">
            <div class = "btnText">Start Game</div>
            <div class = "btnArrow">
                <svg width="23" height="15" viewBox="0 0 23 15" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M1.25391 5.94377L14.5352 4.94377V1.79534C14.5352 1.46721 14.6953 1.22112 15.0156 0.975025C15.3359 0.892994 15.6563 0.892993 15.8945 1.05706C19.1758 3.35393 22.2969 7.20159 22.375 7.36565C22.4531 7.5219 22.5273 7.75627 22.5313 7.92034C22.5313 7.92424 22.5352 7.93206 22.5352 7.93596C22.5352 8.10002 22.457 8.34612 22.375 8.42815C22.2969 8.59221 19.2539 12.4516 15.8945 14.7485C15.5742 14.9125 15.2539 14.9946 15.0156 14.8305C14.6953 14.6664 14.5352 14.4203 14.5352 14.0922V10.9438L1.25391 9.94377C0.855469 9.62346 0.535156 8.81877 0.535156 7.93596C0.535156 7.13909 0.773438 6.26409 1.25391 5.94377Z" fill="#343E98"/>
                </svg>	
            </div>
        </button>
    </div>
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
        height : 30%;
        background: #2A337E; 
        border-top-left-radius: 5px;
        border-top-right-radius: 5px; 
        border-bottom-left-radius: 5px;
        border-bottom-right-radius: 5px;
    }

    main{
        background-image: url('/images/background.svg');
        width : 100%;
        height : 100%;
        background-size: 100% 100%;
    }
    .container{
        width : 50%;
        margin : auto;
        height : 100%;
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
    }
    .user-list{
        height : 40%;
        width : 40%;
        margin : 5% 0;
        background-color: #fff;
        border-radius: 15px;
        padding : 10px 5px 10px 10px;
    }
    .users{
        width : 100%;
        height : 100%;
        overflow-y: scroll;
    }
    .user{
        display : flex;
        justify-content: space-between;
        align-items: center;
        padding : 5px 10px 5px 5px;
    }
    .name{
        font-weight : bold;
        color: #0C0030;
    }
    .joinedUser{
        background-image: url('/images/tick.svg');
        width : 18px;
        height : 18px;
    }
    .preJoin-msg{
        color : #fff;
        font-family: 'Manrope', sans-serif;
        font-weight : 800;
        font-size : 16px;
        line-height: 21.86px;
    }
    .startBtn{
		background: #FFFFFF;
		box-shadow: 0px 4px 4px rgba(0, 0, 0, 0.25), inset 0px -8px 0px #98C8E2;
		border-radius: 30px;
		padding : 0.8% 2%;
		display : flex;
		justify-content: center;
		align-items: center;
		cursor : pointer;
	}
	.startBtn:focus{
		box-shadow: 0px 0px 0px;
	}
	.btnText{
		color: #343E98;
	}
	.btnArrow{
		margin : 8px;
	}
</style>