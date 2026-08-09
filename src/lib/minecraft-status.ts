import dns from 'node:dns/promises';

const SERVER_HOST = 'mc.ferreras.dev';
const SERVER_PORT = 25565;
const PING_TIMEOUT_MS = 2500;
const CACHE_TTL_MS = 30_000;

export interface MinecraftStatus {
	online: boolean;
	players: {
		online: number | null;
		max: number | null;
	} | null;
	version: string | null;
	latencyMs: number | null;
}

interface CachedStatus {
	expiresAt: number;
	value: MinecraftStatus;
}

interface MinecraftEndpoint {
	hostname: string;
	port: number;
}

interface MinecraftPingResult {
	players?: {
		online?: unknown;
		max?: unknown;
	};
	version?: {
		name?: unknown;
	};
	latency?: unknown;
}

interface MinecraftServerListPing {
	ping(protocol: number, host: string, port: number, timeout: number): Promise<MinecraftPingResult>;
}

let cachedStatus: CachedStatus | null = null;
let minecraftStatusPromise: Promise<MinecraftServerListPing> | null = null;

export async function getMinecraftStatus(): Promise<MinecraftStatus> {
	const now = Date.now();
	if (cachedStatus && cachedStatus.expiresAt > now) {
		return cachedStatus.value;
	}

	try {
		const endpoint = await resolveMinecraftEndpoint();
		const startedAt = Date.now();
		const minecraftServerListPing = await loadMinecraftStatusPinger();
		const response = (await withTimeout(
			minecraftServerListPing.ping(769, endpoint.hostname, endpoint.port, PING_TIMEOUT_MS),
			PING_TIMEOUT_MS,
		)) as MinecraftPingResult;
		const value: MinecraftStatus = {
			online: true,
			players: {
				online: toSafeNumber(response.players?.online),
				max: toSafeNumber(response.players?.max),
			},
			version: typeof response.version?.name === 'string' ? response.version.name : null,
			latencyMs: toSafeNumber(response.latency) ?? Date.now() - startedAt,
		};

		cachedStatus = { expiresAt: now + CACHE_TTL_MS, value };
		return value;
	} catch {
		const value: MinecraftStatus = {
			online: false,
			players: null,
			version: null,
			latencyMs: null,
		};

		cachedStatus = { expiresAt: now + 10_000, value };
		return value;
	}
}

async function resolveMinecraftEndpoint(): Promise<MinecraftEndpoint> {
	try {
		const records = await dns.resolveSrv(`_minecraft._tcp.${SERVER_HOST}`);
		const record = records
			.filter(({ port, name }) => Number.isInteger(port) && port > 0 && typeof name === 'string' && name.length > 0)
			.sort((left, right) => left.priority - right.priority || right.weight - left.weight)[0];

		if (record) {
			return {
				hostname: record.name.replace(/\.$/, ''),
				port: record.port,
			};
		}
	} catch {
		// Fall back to the normal Minecraft port when no SRV record exists.
	}

	return { hostname: SERVER_HOST, port: SERVER_PORT };
}

async function loadMinecraftStatusPinger(): Promise<MinecraftServerListPing> {
	minecraftStatusPromise ??= import('minecraft-status').then((module) => {
		return module.MinecraftServerListPing as MinecraftServerListPing;
	});

	return minecraftStatusPromise;
}

async function withTimeout<T>(promise: Promise<T>, timeoutMs: number): Promise<T> {
	let timeout: NodeJS.Timeout;

	const timeoutPromise = new Promise<never>((_, reject) => {
		timeout = setTimeout(() => reject(new Error('minecraft_status_timeout')), timeoutMs);
	});

	try {
		return await Promise.race([promise, timeoutPromise]);
	} finally {
		clearTimeout(timeout!);
	}
}

function toSafeNumber(value: unknown): number | null {
	return typeof value === 'number' && Number.isSafeInteger(value) && value >= 0 ? value : null;
}
