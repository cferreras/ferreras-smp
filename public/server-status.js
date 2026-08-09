(() => {
	const heroStatus = document.querySelector('[data-server-status="hero"]');
	const liveStatus = document.querySelector('[data-server-status="live"]');
	const onlinePlayers = document.querySelector('[data-server-players-online]');
	const maxPlayers = document.querySelector('[data-server-players-max]');
	const playersLabel = document.querySelector('[data-server-players-label]');

	if (!heroStatus && !liveStatus && !onlinePlayers) {
		return;
	}

	const controllerTimeout = 5000;
	const updateState = (state) => {
		[heroStatus, liveStatus].filter(Boolean).forEach((node) => {
			node.dataset.statusState = state;
		});
	};

	const updateText = (node, text) => {
		const target = node?.querySelector('[data-server-status-text]');
		if (target) {
			target.textContent = text;
		}
	};

	const setLoading = () => {
		updateState('loading');
		updateText(heroStatus, 'Comprobando servidor…');
		updateText(liveStatus, 'Comprobando');
		if (playersLabel) {
			playersLabel.textContent = 'comprobando jugadores conectados';
		}
	};

	const setOffline = () => {
		updateState('offline');
		updateText(heroStatus, 'Servidor no disponible ahora');
		updateText(liveStatus, 'Offline');
		if (onlinePlayers) {
			onlinePlayers.textContent = '—';
		}
		if (maxPlayers) {
			maxPlayers.textContent = '—';
		}
		if (playersLabel) {
			playersLabel.textContent = 'jugadores no disponibles ahora';
		}
	};

	const setOnline = (data) => {
		const players = data.players || {};
		const online = Number.isFinite(players.online) ? players.online : null;
		const max = Number.isFinite(players.max) ? players.max : null;

		updateState('online');
		updateText(
			heroStatus,
			online !== null && max !== null ? `Servidor online · ${online}/${max} jugadores` : 'Servidor online',
		);
		updateText(liveStatus, 'Online');
		if (onlinePlayers) {
			onlinePlayers.textContent = online === null ? '—' : String(online);
		}
		if (maxPlayers) {
			maxPlayers.textContent = max === null ? '—' : String(max);
		}
		if (playersLabel) {
			playersLabel.textContent = 'jugadores conectados ahora';
		}
	};

	const checkServer = async () => {
		setLoading();
		const controller = new AbortController();
		const timeout = window.setTimeout(() => controller.abort(), controllerTimeout);

		try {
			const response = await fetch('/api/server-status', {
				headers: { Accept: 'application/json' },
				cache: 'no-store',
				signal: controller.signal,
			});
			if (!response.ok) {
				throw new Error(`server_status_${response.status}`);
			}
			const data = await response.json();
			if (data.online === true) {
				setOnline(data);
			} else {
				setOffline();
			}
		} catch {
			setOffline();
		} finally {
			window.clearTimeout(timeout);
		}
	};

	checkServer();
	window.setInterval(checkServer, 60_000);
})();
