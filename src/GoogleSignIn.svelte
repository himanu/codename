<script>
    let userLoggedIn = false;
    $:  console.log('userLoggedin ', userLoggedIn);
    window.onLoadCallback = () => {
        // userLoggedIn = gapi.auth2.getAuthInstance().isSignedIn.get();
        // gapi.auth2.
        // if (userLoggedIn) {  
        // // Handle login
        //     console.log('UserLoggedIn ', userLoggedIn);
            
        // }
        gapi.load('auth2', function() {
            
            gapi.auth2.init();
            userLoggedIn = gapi.auth2.getAuthInstance().isSignedIn.get();
            console.log('userLoggedin ', userLoggedIn);

        });
    }
    window.onSignIn = (googleUser) => {
       const profile = googleUser.getBasicProfile();
       console.log('ID: ' + profile.getId());
       console.log('Name: ' + profile.getName());
       console.log('Image URL: ' + profile.getImageUrl());
       console.log('Email: ' + profile.getEmail());
       userLoggedIn = true;
    };
    function signOut(){
        const auth2 = gapi.auth2.getAuthInstance();
        auth2.signOut().then(() => {
        // User is now signed out
            userLoggedIn = false;
            console.log("signedOut");
        }).catch((err) => {
            console.log("Error ", err);
        });
  }
  </script>
  
  <!-- svelte-ignore non-top-level-reactive-declaration -->
  <svelte:head>
    <script src="https://apis.google.com/js/platform.js?onload=onLoadCallback" async defer></script>
  </svelte:head>
  {#if userLoggedIn === false}
    <div class="g-signin2" data-longtitle="true" data-onsuccess="onSignIn" />
  {:else if userLoggedIn === true}
    <button on:click={signOut}> Logout </button>
  {/if}