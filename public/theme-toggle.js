(() => {
	const button = document.querySelector('[data-theme-toggle]');

	if (!button) return;

	const label = button.querySelector('[data-theme-label]');
	const systemPreference = window.matchMedia('(prefers-color-scheme: light)');
	const preferences = ['system', 'light', 'dark'];
	const preferenceLabels = {
		system: 'sistema',
		light: 'claro',
		dark: 'oscuro',
	};
	let preference = document.documentElement.dataset.themePreference || 'system';

	const resolveTheme = () => preference === 'system' ? (systemPreference.matches ? 'light' : 'dark') : preference;

	const updateTheme = (persist = false) => {
		document.documentElement.dataset.themePreference = preference;
		document.documentElement.dataset.theme = resolveTheme();
		const nextPreference = preferences[(preferences.indexOf(preference) + 1) % preferences.length];
		button.setAttribute('aria-label', `Tema actual: ${preferenceLabels[preference]}. Cambiar a tema ${preferenceLabels[nextPreference]}`);
		if (label) label.textContent = preferenceLabels[preference].replace(/^./, (letter) => letter.toUpperCase());
		document.querySelector('meta[name="theme-color"]')?.setAttribute('content', document.documentElement.dataset.theme === 'dark' ? '#101011' : '#f7f4ed');

		if (persist) {
			try {
				localStorage.setItem('ferreras-theme', preference);
			} catch {
				// The theme remains active for the current page when storage is unavailable.
			}
		}
	};

	if (!preferences.includes(preference)) preference = 'system';
	updateTheme();

	button.addEventListener('click', () => {
		preference = preferences[(preferences.indexOf(preference) + 1) % preferences.length];
		updateTheme(true);
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
