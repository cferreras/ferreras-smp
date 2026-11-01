(() => {
	const blocks = Array.from(document.querySelectorAll('[data-reveal]'));

	// Con movimiento reducido la frase se queda entera, como sin JavaScript.
	if (!blocks.length || window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

	const items = blocks.map((block) => ({ block, words: Array.from(block.querySelectorAll('[data-word]')) }));
	let frame = 0;

	// Las palabras se van encendiendo desde que el párrafo asoma por abajo
	// (90 % de la pantalla) hasta que su última línea pasa por el 45 %.
	const update = () => {
		frame = 0;
		const viewport = window.innerHeight;
		const start = viewport * 0.9;
		const end = viewport * 0.45;

		items.forEach(({ block, words }) => {
			const rect = block.getBoundingClientRect();
			const progress = Math.min(1, Math.max(0, (start - rect.top) / (start - end + rect.height)));
			const lit = Math.round(progress * words.length);
			words.forEach((word, index) => word.toggleAttribute('data-lit', index < lit));
		});
	};

	const request = () => {
		if (!frame) frame = window.requestAnimationFrame(update);
	};

	update();
	blocks.forEach((block) => block.setAttribute('data-reveal-ready', ''));
	window.addEventListener('scroll', request, { passive: true });
	window.addEventListener('resize', request);
})();
