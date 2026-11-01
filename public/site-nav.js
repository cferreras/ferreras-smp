(() => {
	const nav = document.querySelector('[data-site-nav]');
	const bar = nav?.querySelector('.topbar');
	// El contenido que sigue a la banda: la hoja en la portada, main en el resto.
	const content = document.querySelector('.topband ~ :is(.home-sheet, main)');

	if (!nav || !bar || !content) return;

	// La barra es transparente mientras va sobre la banda (vídeo o verde) y se
	// vuelve cápsula oscura en cuanto el contenido claro llega a tocarla. El
	// CSS hace la transición; toggleAttribute no toca el DOM si no cambia.
	const update = () => {
		const touching = content.getBoundingClientRect().top <= bar.getBoundingClientRect().bottom;
		nav.toggleAttribute('data-solid', touching);
	};

	window.addEventListener('scroll', update, { passive: true });
	window.addEventListener('resize', update);
	update();
})();
