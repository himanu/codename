<script>
    let page = "Loading";
    let clicked = false;
    let roundValue;
    var dbGameSessionRound;
    import Loading from './Loading.svelte';
    import firebase from "firebase/app";
    import "firebase/database";
    import {dbGameSession, dbUser,listenFirebaseKey, dbGameSessionRoundValue,dbGameSessionRounds, dbPage} from './database.js';
    import {getParams} from './utils';
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
    const snapFun = function(snap){
        if(!snap.exists()) {
            return;
        }
        if(snap.val().page === undefined) {
            page = "Lobby Screen";
        }
        else {
            clicked = true;
            page = snap.val().page;
        }
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
    
    
    
    // listenFirebaseKey(dbPage,(dbPageRef)=>{
    //     dbPageRef.on('value',(snap)=>{
    //         console.log("page value is changed in app.svelte")
    //         if(!snap.exists()) {
    //             return;
    //         }
    //         if(snap.val().page === undefined) {
    //             page = 'Lobby Screen';
    //         }
    //         else {
    //             clicked = true;
    //             page = snap.val();
    //         }
    //     })
    // })
    // dbGameSessionRound().on('value',(snap)=>{
    //     if(!snap.exists()){
    //         return;
    //     }
        
    //     if(snap.val().page === undefined)
    //         page = "Lobby Screen";
    //     else
    //     {
    //         clicked = true;
    //         page = snap.val().page;
    //     }
    // })
    
    let connectedRef;
    
    $ : {
        if(roundValue) {
            page = 'Lobby Screen';
        }
    }
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
    