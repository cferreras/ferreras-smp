(() => {
	const video = document.querySelector('[data-hero-video]');
	const button = document.querySelector('[data-hero-video-toggle]');

	if (!video || !button) return;

	const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
	const saveData = navigator.connection?.saveData === true;

	// Pausado por la persona (botón, o de entrada con movimiento reducido o
	// ahorro de datos) o por el contexto (la hoja de contenido tapa el hero,
	// pestaña oculta). Solo el primero manda al volver.
	let userPaused = reducedMotion || saveData;
	let covered = false;

	const sync = () => {
		const shouldPlay = !userPaused && !covered && !document.hidden;
		if (shouldPlay && video.paused) {
			// Si el navegador bloquea la reproducción se queda en el póster.
			video.play().catch(() => {});
		} else if (!shouldPlay && !video.paused) {
			video.pause();
		}
	};

	const setUserPaused = (paused) => {
		userPaused = paused;
		button.toggleAttribute('data-paused', paused);
		button.setAttribute('aria-label', paused ? 'Reproducir el vídeo' : 'Pausar el vídeo');
		sync();
	};

	// El hero está pegado arriba toda la página: cuenta como tapado en cuanto
	// se ha bajado más de una pantalla.
	const checkCovered = () => {
		const next = window.scrollY > window.innerHeight;
		if (next !== covered) {
			covered = next;
			sync();
		}
	};

	window.addEventListener('scroll', checkCovered, { passive: true });
	document.addEventListener('visibilitychange', sync);
	button.addEventListener('click', () => setUserPaused(!userPaused));

	button.hidden = false;
	checkCovered();
	setUserPaused(userPaused);
})();
