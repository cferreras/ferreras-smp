(() => {
	const nav = document.querySelector('[data-site-nav]');
	const bar = nav?.querySelector('.topbar');
	// El contenido que sigue a la banda: la hoja en la portada, main en el resto.
	const content = document.querySelector('.topband ~ :is(.home-sheet, main)');
	// En las páginas interiores la banda verde no se queda pegada como el hero
	// de la portada: su titular sube con el scroll y pasaría por debajo de la
	// barra transparente, mezclándose con ella.
	const heroCopy = document.querySelector('.topband:not(.topband-video) > :first-child');

	if (!nav || !bar || !content) return;

	// La barra es transparente mientras va sobre la banda (vídeo o verde) y se
	// vuelve cápsula oscura en cuanto el texto del hero o el contenido claro
	// llegan a tocarla. El hero cuenta desde su primera línea, sin su relleno.
	// El CSS hace la transición; toggleAttribute no toca el DOM si no cambia.
	const reaches = (element, inset = 0) => element.getBoundingClientRect().top + inset <= bar.getBoundingClientRect().bottom;

	const update = () => {
		const touching =
			reaches(content) ||
			(heroCopy !== null && reaches(heroCopy, parseFloat(getComputedStyle(heroCopy).paddingTop)));
		nav.toggleAttribute('data-solid', touching);
	};

	window.addEventListener('scroll', update, { passive: true });
	window.addEventListener('resize', update);
	update();
})();
