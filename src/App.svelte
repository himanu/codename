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
    function updateClick() {
        dbGameSessionRound.update({
            page : 'Lobby Screen'
        })
    }
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
    <CustomButton on:click = {updateClick}/>
{:else if page === "Lobby Screen"}
    <LobbyScreen/>
{:else if page === "Lobby"}
    <Loby/>
{:else if page === 'Game Screen'}
    <Game/>
{:else}
    <Loading/>
{/if}
    
<style>
    :global(*){
        box-sizing: border-box;
        outline : 0;
    }
</style>