<script>
    let page = 'Game'
    import Loading from './Loading.svelte';
    import App1 from './App1.svelte';
    import Loby from './loby.svelte';
    import Game from './Game.svelte';
</script>

{#if page === "Loading"}
    <Loading/>
{:else if page === 'Game'}
    <Game/>
{/if}
    