<script>
	import { fly } from 'svelte/transition';
	import CustomButton from './CustomButton.svelte';
	import { dbGameSessionRound, listenFirebaseKey } from './database';

	function updateClick() {
		listenFirebaseKey(dbGameSessionRound, (dbGameSessionRoundRef) => {
			dbGameSessionRoundRef.update({
				page: 'Lobby Screen',
			});
		});
	}
</script>

<main>
	<div class="container">
		<img class="codenamePng" alt="codenamePng" src="/images/codenames-logo.png" in:fly={{ y: -20, duration: 1000 }} />
	</div>
	<CustomButton on:click={updateClick} btnText={'Start Game'} disableBtn={false} />
</main>

<style>
	main {
		background-image: url(/images/background.svg);
		width: 100%;
		height: 100%;
		background-size: 100% 100%;
		padding: 2rem;
		display: flex;
		justify-content: center;
		align-items: center;
		flex-direction: column;
	}
	.codenamePng {
		width: 20rem;
	}
	.container {
		margin: auto;
	}
</style>
