(function () {
	'use strict';

	/* Da forma al código de /entrar/ mientras se escribe: mayúsculas, sin
	   espacios ni símbolos y con el guion en medio (K7M-4QX). Sin JavaScript
	   el servidor lo acepta igual, con o sin guion. */
	var HALF = 3;
	var LENGTH = 6;

	function clean(text) {
		return text.toUpperCase().replace(/[^0-9A-Z]/g, '').slice(0, LENGTH);
	}

	/* Al escribir, el guion sale en cuanto se llega a la mitad; al borrar no,
	   para que no se quede pegado detrás. */
	function format(chars, typing) {
		if (chars.length > HALF) return chars.slice(0, HALF) + '-' + chars.slice(HALF);
		if (chars.length === HALF && typing) return chars + '-';
		return chars;
	}

	/* La posición que deja detrás `count` letras, saltando el guion si va justo
	   después: así el cursor sigue donde estaba aunque cambie el texto. */
	function positionAfter(formatted, count) {
		if (count === 0) return 0;
		var seen = 0;
		for (var i = 0; i < formatted.length; i++) {
			if (formatted.charAt(i) !== '-') seen++;
			if (seen === count) return formatted.charAt(i + 1) === '-' ? i + 2 : i + 1;
		}
		return formatted.length;
	}

	function apply(input, typing) {
		var raw = input.value;
		var caret = input.selectionStart === null ? raw.length : input.selectionStart;
		var formatted = format(clean(raw), typing);
		if (formatted === raw) return;
		input.value = formatted;
		if (document.activeElement !== input) return;
		var position = positionAfter(formatted, clean(raw.slice(0, caret)).length);
		input.setSelectionRange(position, position);
	}

	/* Borrar el guion no lo quita (vuelve a salir): se lleva la letra de al lado,
	   como en cualquier campo con formato. */
	function skipDash(input, event) {
		var start = input.selectionStart;
		if (start === null || start !== input.selectionEnd) return;
		var value = input.value;
		var back = event.inputType === 'deleteContentBackward' && value.charAt(start - 1) === '-';
		var forward = event.inputType === 'deleteContentForward' && value.charAt(start) === '-';
		if (!back && !forward) return;
		var at = back ? start - 2 : start + 1;
		if (at < 0 || at >= value.length) return;
		event.preventDefault();
		input.value = value.slice(0, at) + value.slice(at + 1);
		var caret = back ? at : start;
		input.setSelectionRange(caret, caret);
		apply(input, false);
	}

	document.querySelectorAll('input[data-join-code]').forEach(function (input) {
		input.addEventListener('beforeinput', function (event) {
			skipDash(input, event);
		});
		input.addEventListener('input', function (event) {
			if (event.isComposing) return;
			apply(input, !event.inputType || event.inputType.indexOf('insert') === 0);
		});
		input.addEventListener('compositionend', function () {
			apply(input, true);
		});
		apply(input, false);
	});
})();
