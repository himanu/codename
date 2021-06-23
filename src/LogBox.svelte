<script>
	import Log from './LogIcon.svelte';
    import {dbLogsArray} from './database';
    import {getParams} from './utils';
    import {listenFirebaseKey} from './database';
    import {beforeUpdate,afterUpdate} from 'svelte';
    let logsArray = [];
    export let showLogs;
    let logsdiv;
    listenFirebaseKey(dbLogsArray,(dbLogsArrayRef)=>{
        dbLogsArrayRef.on('value',(snap)=>{
            if(!snap.exists()) {
                logsArray = [];
                return;
            }
            logsArray = snap.val();
        })
    })
    let userId = getParams('userId');
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
    function setShowLogsFalse() {
        showLogs = false;
    }
    let autoscroll;
    beforeUpdate(()=>{
        autoscroll = logsdiv && (logsdiv.offsetHeight + logsdiv.scrollTop) > (logsdiv.scrollHeight - 20);
    })
    afterUpdate(()=>{
        if(autoscroll && logsdiv) {
            logsdiv.scrollTo(0, logsdiv.scrollHeight);
        }
    })
</script>
<div class = "container" class:showContainer = {showLogs} >
	<div class = "heading">
		<div class = "logo">
			<Log/>
            <div class = "codenamesLogs"> Codenames Logs </div>
		</div>
		<div class = "cross" on:click = {setShowLogsFalse}>
			<div class = "line1"> </div>
			<div class = "line2"> </div>
		</div>
	</div>
	<div class = "logsContainer" bind:this = {logsdiv}>
        {#each logsArray as log}
            <div class = "log">
                <div class = "logActorProfilePictureContainer">
                    {#if log.actor.profilePicture}
                        <img class = "logActorProfilePicture" src = {log.actor.profilePicture} alt = "LogActorProfilePicture">
                    {:else}
                        <div class = "logActorFakeProfilePicture"> {log.actor.userName[0]}</div>
                    {/if}
                </div>
                <div class = "logBody">
                    <div class="logsActor" style = "color : {log.actor.team === "Red" ?"#E44C4F" : "#5E96E8"}">
                        {processName(log.actor)}
                    </div>
                    {#if log.isWordSelected === true}
                        selects
                        {#if log.word.color === 'Red'}
                            <span style = 'color : #E44C4F' class = "wordName">  {log.word.name} </span>
                        {:else if log.word.color === 'Blue'}
                            <span style = 'color : #5E96E8' class = "wordName">  {log.word.name}</span>
                        {:else}
                            <span style = 'margin-left : 5px;'>  {log.word.name} </span>
                        {/if}
                    {:else}
                        {log.action}
                    {/if}
                </div>
            </div>
        {/each}
	</div>
</div>

<style>
    @import url('https://fonts.googleapis.com/css2?family=Manrope:wght@500;600;700;800;900&display=swap');
    ::-webkit-scrollbar {
        width: 10px;
    }

    /* Track */
    ::-webkit-scrollbar-track {
        background: #f1f1f1;
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

    .container {
        width : 50%;
		margin : auto;
		position : relative;
        background : #fff;
        position : absolute;
        transform : translateY(-150%);
        transition : transform 0.15s ease;
        z-index : 100;
        border-radius : 10px;
        border : 2px solid #C1BFBF;
    }
    .showContainer {
        transform: translateY(20%);
    }
	.heading {
		display : flex;
		justify-content : space-between;
        align-items : center;
		padding : 10px 20px;
		border-bottom : 1px solid grey;
	}
    .logo {
        display : flex;
        align-items : center;
    }
    .codenamesLogs {
        margin-left : 5px;
        font-family : 'Manrope',sans-serif;
        font-weight : 700;
        font-size : 16px;
    }
    @media screen and (max-width : 1000px) {
        .codenamesLogs {
            font-size : 14px;
        }
    }
	.cross {
		display : grid;
		cursor : pointer;
		align-items : center;
	}
	.line1,.line2 {
		grid-column : 1;
		grid-row : 1;
		width : 20px;
		height : 3px;
		background : grey;
	}
    
	.line1{
		transform : rotate(45deg);
	}
	.line2 {
		transform : rotate(-45deg);
	}
	.logsContainer {
		width : calc(100% - 40px);
		margin : auto;
        max-height : 30vh;
        overflow : auto;
	}
	.log {
		padding : 10px 0px;
		border-bottom : 0.5px solid gray;
        display : flex;
        align-items : center;
	}
    .logActorProfilePictureContainer {
        margin-right : 10px;
        display : flex;
        justify-content : center;
        align-items : center;
    }
    .logActorProfilePicture{
        width : 20px;
        height : 20px;
        border-radius : 50%;
    }
    .logActorFakeProfilePicture {
        width : 20px;
        height : 20px;
        font-size : 0.75em;
        color : white;
        font-weight : 700;
        display : flex;
        font-family : 'Manrope',sans-serif;
        justify-content: center;
        align-items : center;
        border-radius : 50%;
        background-color : #343E98;
    }
    .logBody {
        font-family : 'Manrope',sans-serif;
        font-size : 14px;
        font-size : 600;
        display : flex;
    }
    @media screen and (max-width : 1100px) {
        .logBody {
            font-size : 12px;
        }
        .line1,.line2 {
            width : 15px;
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
    }
    .logsActor {
        font-weight : 700;
        margin-right : 5px;
    }
    .wordName {
        font-weight : 700;
        margin-left: 5px;
    }
</style>