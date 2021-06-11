<script>
    let page = "Loading";
    let clicked = false;
    import Loading from './Loading.svelte';
    import {dbGameSession, dbUser} from './database.js';
    import LobbyScreen from './Lobby_Screen.svelte';
    import Game from './Game.svelte';
    import CustomButton from './CustomButton.svelte';
    import Loby from './loby.svelte';
    function updateClick() {
        if(clicked === false)
        {
            clicked = true;
        }
    }
    
    dbGameSession.on('value',(snap)=>{
        if(!snap.exists()){
            return;
        }
        
        if(snap.val().page === undefined)
            page = "Lobby Screen";
        else
        {
            clicked = true;
            page = snap.val().page;
        }
    })
</script>
{#if clicked === false}
    <Loading/>
    <CustomButton on:click = {updateClick}/>
{:else if page === "Lobby Screen"}
    <LobbyScreen/>
{:else if page === "Lobby"}
    <Loby/>
{:else if page === 'Game Screen'}
    <Game/>
{/if}
    