(() => {
	const button = document.querySelector('[data-back-to-top]');

	if (!button) return;

	// Solo se enseña cuando ya ha pasado la primera pantalla. La cabecera es
	// fija y el hero de la portada se queda pegado arriba, así que la pista es
	// lo que se ha bajado, no si la cabecera se ve.
	const update = () => button.toggleAttribute('data-visible', window.scrollY > window.innerHeight * 0.9);

	window.addEventListener('scroll', update, { passive: true });
	update();

	button.addEventListener('click', () => {
		// behavior 'auto' respeta el scroll-behavior del CSS, que ya se apaga
		// con prefers-reduced-motion.
		window.scrollTo({ top: 0, behavior: 'auto' });
		// El foco vuelve a la marca para que el teclado siga desde arriba.
		document.querySelector('.brand')?.focus({ preventScroll: true });
	});
})();
