<script>
    let page;
    let roundValue;
    var dbGameSessionRound;
    import Loading from './Loading.svelte';
    import { dbGameSessionRoundValue,dbGameSessionRounds} from './database.js';
    import LobbyScreen from './Lobby_Screen.svelte';
    import Game from './Game.svelte';
    import CustomButton from './CustomButton.svelte';
    import Loby from './loby.svelte';
    import {fly} from 'svelte/transition';
    
    const snapFun = function(snap){
        if(!snap.exists()) {
            if(roundValue === 1)
                page = 'Welcome';
            return;
        }
        page = snap.val().page;
    }
    dbGameSessionRoundValue.on('value',(snap)=>{
        if(!snap.exists()) {
            return;
        }
        roundValue = snap.val();
        if(dbGameSessionRound){
            dbGameSessionRound.off('value',snapFun);
        }
        
        dbGameSessionRound = dbGameSessionRounds.child(roundValue);
        dbGameSessionRound.on('value',snapFun);
    })
    
    
    $ : {
        if(roundValue) {
            console.log('roundValue ',roundValue);
            if(roundValue != 1) {
                dbGameSessionRound.update({
                    page  : 'Lobby Screen'
                })
            }
        }
    }
    $: {
        console.log('page ',page);
    }
</script>
{#if page === 'Welcome' }
    <Loading/>
{:else if page === "Lobby Screen"}
    <LobbyScreen/>
{:else if page === "Lobby"}
    <Loby/>
{:else if page === 'Game Screen'}
    <Game/>
{:else}
    <main in:fly ="{{ y: -20, duration: 1000 }}">
        <div class = "container">
            <img class = 'codenamePng' alt = 'codenamePng' src = '/images/codenames-logo.png' >
        </div>
    </main>
{/if}
    
<style>
    :global(*){
        box-sizing: border-box;
        outline : 0;
    }
    :global(html) {
        font-size : 20px;
    }
    @media screen and (max-width : 1000px) {
        :global(html) {
            font-size : 18px;
        }
    }
    @media screen and (max-width : 900px) {
        :global(html) {
            font-size : 16px;
        }
    }
    main{
		background-image: url(/images/background.svg);
		width : 100%;
		height : 100%;
		background-size: 100% 100%;
		padding : 2rem;
		display : flex;
		justify-content: center;
		align-items: center;
		flex-direction: column;
	}
	.codenamePng {
		width : 20rem;
	}
	.container{
		margin : auto;
	}
</style>