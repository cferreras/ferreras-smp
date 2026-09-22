(function () {
	'use strict';

	var bar = document.querySelector('[data-blog-filters]');
	if (!bar) return;

	var buttons = Array.prototype.slice.call(bar.querySelectorAll('[data-filter]'));
	var posts = Array.prototype.slice.call(document.querySelectorAll('[data-post]'));
	var leads = Array.prototype.slice.call(document.querySelectorAll('[data-blog-lead]'));
	var count = bar.querySelector('[data-blog-count]');
	var PARAM = 'etiqueta';

	function plural(n) {
		return n + (n === 1 ? ' artículo' : ' artículos');
	}

	/* «Todos» enseña el destacado y la rejilla sin él; una etiqueta oculta el
	   destacado y filtra la rejilla completa, para que Novedades no salga vacía
	   aunque su único artículo sea el destacado. */
	function apply(tag) {
		var button = buttons.filter(function (b) { return b.dataset.filter === tag; })[0];
		if (!button) {
			tag = 'all';
			button = buttons[0];
		}
		var all = tag === 'all';

		buttons.forEach(function (b) {
			b.setAttribute('aria-pressed', String(b === button));
		});
		leads.forEach(function (el) {
			el.hidden = !all;
		});
		posts.forEach(function (post) {
			post.hidden = all ? post.hasAttribute('data-featured') : post.dataset.tag !== tag;
		});

		var n = Number(button.dataset.count);
		if (count) count.textContent = all ? plural(n) : plural(n) + ' en ' + button.dataset.label;
		return tag;
	}

	buttons.forEach(function (button) {
		button.addEventListener('click', function () {
			var tag = apply(button.dataset.filter);
			/* La etiqueta queda en la URL para poder compartir el listado filtrado. */
			var url = new URL(window.location.href);
			if (tag === 'all') url.searchParams.delete(PARAM);
			else url.searchParams.set(PARAM, tag);
			window.history.replaceState(null, '', url);
		});
	});

	apply(new URLSearchParams(window.location.search).get(PARAM) || 'all');
	bar.hidden = false;
})();
