(() => {
	const button = document.querySelector('[data-back-to-top]');
	const topbar = document.querySelector('.topbar');

	if (!button || !topbar) return;

	// Solo se enseña cuando la cabecera ha quedado por encima de la pantalla,
	// no cuando aún no ha llegado a verse (por ejemplo, al cargar con un ancla).
	const observer = new IntersectionObserver(([entry]) => {
		const passed = !entry.isIntersecting && entry.boundingClientRect.bottom < 0;
		button.toggleAttribute('data-visible', passed);
	});

	observer.observe(topbar);

	button.addEventListener('click', () => {
		// behavior 'auto' respeta el scroll-behavior del CSS, que ya se apaga
		// con prefers-reduced-motion.
		window.scrollTo({ top: 0, behavior: 'auto' });
		// El foco vuelve a la marca para que el teclado siga desde arriba.
		document.querySelector('.brand')?.focus({ preventScroll: true });
	});
})();
