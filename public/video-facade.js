(function () {
	'use strict';

	/* El enlace a YouTube se queda como respaldo: si el script no carga, abrir el
	   Short en una pestaña nueva sigue funcionando. Aquí lo cambiamos por el
	   reproductor solo cuando alguien lo pulsa. */
	document.querySelectorAll('[data-video-embed]').forEach(function (link) {
		link.addEventListener('click', function (event) {
			if (event.metaKey || event.ctrlKey || event.shiftKey || event.button !== 0) return;
			event.preventDefault();

			var frame = document.createElement('iframe');
			frame.src = link.dataset.videoEmbed;
			frame.title = link.dataset.videoTitle || 'Vídeo de YouTube';
			frame.allow = 'autoplay; encrypted-media; picture-in-picture; fullscreen';
			frame.referrerPolicy = 'strict-origin-when-cross-origin';
			frame.allowFullscreen = true;

			var box = document.createElement('div');
			box.className = link.className;
			box.dataset.playing = '';
			box.appendChild(frame);
			link.replaceWith(box);
			frame.focus();
		});
	});
})();
