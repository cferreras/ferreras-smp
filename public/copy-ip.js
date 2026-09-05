(function () {
	'use strict';

	var RESET_MS = 2000;

	function flash(button, label, text) {
		button.dataset.copied = 'true';
		if (label) label.textContent = text;
		window.setTimeout(function () {
			delete button.dataset.copied;
			if (label) label.textContent = 'Copiar';
		}, RESET_MS);
	}

	/* Fallback para contextos sin clipboard API (http, navegadores viejos):
	   un textarea fuera de pantalla y execCommand, que sigue funcionando. */
	function legacyCopy(value) {
		var field = document.createElement('textarea');
		field.value = value;
		field.setAttribute('readonly', '');
		field.style.position = 'fixed';
		field.style.top = '-9999px';
		document.body.appendChild(field);
		field.select();
		var ok = false;
		try {
			ok = document.execCommand('copy');
		} catch (error) {
			ok = false;
		}
		document.body.removeChild(field);
		return ok;
	}

	document.querySelectorAll('[data-copy-ip]').forEach(function (button) {
		var label = button.querySelector('[data-copy-label]');
		var value = button.dataset.copyIp;

		button.addEventListener('click', function () {
			if (navigator.clipboard && window.isSecureContext) {
				navigator.clipboard.writeText(value).then(
					function () {
						flash(button, label, 'Copiada');
					},
					function () {
						flash(button, label, legacyCopy(value) ? 'Copiada' : 'Cópiala a mano');
					}
				);
				return;
			}

			flash(button, label, legacyCopy(value) ? 'Copiada' : 'Cópiala a mano');
		});
	});
})();
