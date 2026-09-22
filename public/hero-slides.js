(function () {
	'use strict';

	var root = document.querySelector('[data-hero-slides]');
	if (!root) return;

	var slides = Array.prototype.slice.call(root.querySelectorAll('[data-slide]'));
	if (slides.length < 2) return;

	var controls = root.querySelector('[data-slides-controls]');
	var dots = Array.prototype.slice.call(root.querySelectorAll('[data-slide-to]'));
	var pauseButton = root.querySelector('[data-slides-pause]');
	/* El primer cambio llega pronto para que se note que hay más capturas; los
	   siguientes dejan algo más de tiempo (4,5 / 2,8 ≈ φ). */
	var FIRST = 2800;
	var INTERVAL = 4500;
	var reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');

	var current = 0;
	var timer = null;
	var firstRun = true;
	/* Pausado por la persona (botón) o por el contexto (ratón encima, foco
	   dentro, pestaña oculta). Solo el primero se recuerda al volver. */
	var userPaused = reducedMotion.matches;
	var contextPaused = false;

	/* El resto de capturas se piden cuando la página ya ha cargado, para no
	   competir con la primera, que es la imagen principal del hero. */
	function loadRest() {
		slides.forEach(function (slide) {
			var img = slide.querySelector('img[data-src]');
			if (img) {
				img.src = img.getAttribute('data-src');
				img.removeAttribute('data-src');
			}
		});
	}

	function show(index) {
		current = (index + slides.length) % slides.length;
		slides.forEach(function (slide, i) {
			var active = i === current;
			slide.toggleAttribute('data-active', active);
			if (active) slide.removeAttribute('aria-hidden');
			else slide.setAttribute('aria-hidden', 'true');
		});
		dots.forEach(function (dot, i) {
			if (i === current) dot.setAttribute('aria-current', 'true');
			else dot.removeAttribute('aria-current');
		});
	}

	/* El punto activo se rellena durante el tiempo que queda: es la pista de
	   que la imagen va a cambiar. Se reinicia en cada programación. */
	function runProgress(delay) {
		dots.forEach(function (dot) {
			dot.removeAttribute('data-running');
		});
		if (delay === null) return;
		var dot = dots[current];
		dot.style.setProperty('--slide-duration', delay + 'ms');
		void dot.offsetWidth;
		dot.setAttribute('data-running', '');
	}

	function schedule() {
		window.clearTimeout(timer);
		if (userPaused || contextPaused) {
			runProgress(null);
			return;
		}
		var delay = firstRun ? FIRST : INTERVAL;
		runProgress(delay);
		timer = window.setTimeout(function () {
			firstRun = false;
			show(current + 1);
			schedule();
		}, delay);
	}

	function setUserPaused(paused) {
		userPaused = paused;
		root.toggleAttribute('data-paused', paused);
		pauseButton.setAttribute('aria-label', paused ? 'Reanudar las capturas' : 'Pausar las capturas');
		schedule();
	}

	dots.forEach(function (dot) {
		dot.addEventListener('click', function () {
			firstRun = false;
			show(Number(dot.getAttribute('data-slide-to')));
			schedule();
		});
	});

	pauseButton.addEventListener('click', function () {
		setUserPaused(!userPaused);
	});

	function setContextPaused(paused) {
		contextPaused = paused;
		schedule();
	}

	root.addEventListener('mouseenter', function () { setContextPaused(true); });
	root.addEventListener('mouseleave', function () { setContextPaused(root.contains(document.activeElement)); });
	root.addEventListener('focusin', function () { setContextPaused(true); });
	root.addEventListener('focusout', function (event) {
		if (!root.contains(event.relatedTarget)) setContextPaused(root.matches(':hover'));
	});
	document.addEventListener('visibilitychange', function () {
		setContextPaused(document.hidden);
	});

	if (document.readyState === 'complete') loadRest();
	else window.addEventListener('load', loadRest);

	controls.hidden = false;
	setUserPaused(userPaused);
})();
