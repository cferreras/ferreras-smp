(() => {
	const menu = document.querySelector('[data-theme-menu]');
	const button = menu?.querySelector('[data-theme-toggle]');
	const panel = menu?.querySelector('[role="menu"]');

	if (!menu || !button || !panel) return;

	const label = button.querySelector('[data-theme-label]');
	const options = Array.from(panel.querySelectorAll('[data-theme-option]'));
	const systemPreference = window.matchMedia('(prefers-color-scheme: light)');
	const preferences = ['system', 'light', 'dark'];
	const preferenceLabels = {
		system: 'Sistema',
		light: 'Claro',
		dark: 'Oscuro',
	};
	let preference = document.documentElement.dataset.themePreference || 'system';

	const resolveTheme = () => preference === 'system' ? (systemPreference.matches ? 'light' : 'dark') : preference;

	const updateTheme = (persist = false) => {
		document.documentElement.dataset.themePreference = preference;
		document.documentElement.dataset.theme = resolveTheme();
		if (label) label.textContent = `Tema: ${preferenceLabels[preference]}`;
		options.forEach((option) => {
			option.setAttribute('aria-checked', String(option.dataset.themeOption === preference));
		});
		document.querySelector('meta[name="theme-color"]')?.setAttribute('content', document.documentElement.dataset.theme === 'dark' ? '#100f13' : '#7c3aed');

		if (persist) {
			try {
				localStorage.setItem('ferreras-theme', preference);
			} catch {
				// The theme remains active for the current page when storage is unavailable.
			}
		}
	};

	const isOpen = () => !panel.hidden;

	const openMenu = (focusTarget = 'checked') => {
		// Solo un desplegable abierto a la vez en la cabecera.
		document.querySelector('.mobile-menu[open]')?.removeAttribute('open');
		panel.hidden = false;
		button.setAttribute('aria-expanded', 'true');
		const checked = options.find((option) => option.dataset.themeOption === preference);
		const target = focusTarget === 'last' ? options[options.length - 1] : focusTarget === 'first' ? options[0] : checked || options[0];
		target.focus();
	};

	const closeMenu = (restoreFocus = false) => {
		if (!isOpen()) return;
		panel.hidden = true;
		button.setAttribute('aria-expanded', 'false');
		if (restoreFocus) button.focus();
	};

	if (!preferences.includes(preference)) preference = 'system';
	updateTheme();

	button.addEventListener('click', () => {
		if (isOpen()) closeMenu();
		else openMenu();
	});

	button.addEventListener('keydown', (event) => {
		if (event.key === 'ArrowDown' || event.key === 'ArrowUp') {
			event.preventDefault();
			openMenu(event.key === 'ArrowUp' ? 'last' : 'checked');
		}
	});

	options.forEach((option) => {
		option.addEventListener('click', () => {
			preference = option.dataset.themeOption;
			updateTheme(true);
			closeMenu(true);
		});
	});

	panel.addEventListener('keydown', (event) => {
		const index = options.indexOf(document.activeElement);

		switch (event.key) {
			case 'ArrowDown':
				event.preventDefault();
				options[(index + 1) % options.length].focus();
				break;
			case 'ArrowUp':
				event.preventDefault();
				options[(index - 1 + options.length) % options.length].focus();
				break;
			case 'Home':
				event.preventDefault();
				options[0].focus();
				break;
			case 'End':
				event.preventDefault();
				options[options.length - 1].focus();
				break;
			case 'Escape':
				event.preventDefault();
				closeMenu(true);
				break;
			case 'Tab':
				closeMenu();
				break;
		}
	});

	document.addEventListener('click', (event) => {
		if (!menu.contains(event.target)) closeMenu();
	});

	menu.addEventListener('focusout', (event) => {
		if (event.relatedTarget && !menu.contains(event.relatedTarget)) closeMenu();
	});

	document.querySelector('.mobile-menu')?.addEventListener('toggle', (event) => {
		if (event.currentTarget.open) closeMenu();
	});

	const handleSystemChange = () => {
		if (preference === 'system') updateTheme();
	};

	if (typeof systemPreference.addEventListener === 'function') {
		systemPreference.addEventListener('change', handleSystemChange);
	} else {
		systemPreference.addListener(handleSystemChange);
	}
})();
