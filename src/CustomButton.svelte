<script>
	import { fly } from 'svelte/transition';
	export let btnText;
	export let disableBtn;
	export let tooltipMsg;
</script>

<div class = "startBtn" disabled = {disableBtn} class:disabledBtn = {disableBtn === true} on:click in:fly ="{{ y: -20, duration: 1000 }}">
	{#if tooltipMsg}
		<div class="tooltip">
			{tooltipMsg}
		</div>
	{/if}
	<div class="text">{btnText}</div>
	<div class="btnArrow">
		<svg width="23" height="15" viewBox="0 0 23 15" fill="none" xmlns="http://www.w3.org/2000/svg">
			<path
				d="M1.25391 5.94377L14.5352 4.94377V1.79534C14.5352 1.46721 14.6953 1.22112 15.0156 0.975025C15.3359 0.892994 15.6563 0.892993 15.8945 1.05706C19.1758 3.35393 22.2969 7.20159 22.375 7.36565C22.4531 7.5219 22.5273 7.75627 22.5313 7.92034C22.5313 7.92424 22.5352 7.93206 22.5352 7.93596C22.5352 8.10002 22.457 8.34612 22.375 8.42815C22.2969 8.59221 19.2539 12.4516 15.8945 14.7485C15.5742 14.9125 15.2539 14.9946 15.0156 14.8305C14.6953 14.6664 14.5352 14.4203 14.5352 14.0922V10.9438L1.25391 9.94377C0.855469 9.62346 0.535156 8.81877 0.535156 7.93596C0.535156 7.13909 0.773438 6.26409 1.25391 5.94377Z"
				fill="#343E98"
			/>
		</svg>
	</div>
</div>

<style>
	@import url('https://fonts.googleapis.com/css2?family=Manrope:wght@600;700;800;900&display=swap');
	.startBtn {
		position: relative;
		background: #ffffff;
		box-shadow: 0px 4px 4px rgba(0, 0, 0, 0.25), inset 0px -6px 0px #98c8e2;
		border-radius: 30px;
		padding: 0.4rem 1rem;
		display: flex;
		justify-content: center;
		align-items: center;
		cursor: pointer;
	}
	.disabledBtn {
		opacity: 0.8;
		cursor: not-allowed;
	}
	.startBtn:hover .text {
		transform: scale3d(1.05, 1.05, 1.25);
	}
	.startBtn:hover .btnArrow {
		transform: scale3d(1.05, 1.05, 1.25);
	}
	.startBtn:focus {
		box-shadow: 0px 0px 0px;
	}
	.startBtn:hover .tooltip {
		opacity: 1;
		visibility: visible;
	}
	.tooltip {
		position: absolute;
		bottom: 130%;
		background: #fff;
		color: rgb(32, 30, 30);
		font-family: 'Padauk';
		font-size: 0.65rem;
		padding: 0.2rem 0.5rem;
		font-weight: 700;
		border-radius: 10px;
		opacity: 0;
		transition: opacity 0.3s;
		visibility: hidden;
	}
	.tooltip::after {
		content: '';
		position: absolute;
		top: 100%;
		left: 50%;
		margin-left: -5px;
		border-width: 5px;
		border-style: solid;
		border-color: #fff transparent transparent transparent;
	}
	.text {
		color: #343e98;
		font-family: 'Manrope', sans-serif;
		font-weight: 900;
		font-size: 1rem;
		margin-bottom: 5px;
		transition: all 0.3s ease;
	}
	.btnArrow {
		margin: 8px;
		transition: all 0.3s ease;
	}
</style>
