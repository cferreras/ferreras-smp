import type { APIRoute } from 'astro';
import { PNG } from 'pngjs';
import { getMembers } from '../../../lib/members';

export const prerender = false;

const FETCH_TIMEOUT_MS = 3000;
const STEVE = '/images/cabeza-steve.png';

// Solo los nombres de cuenta de Mojang: el resto es seguro no-premium.
const PREMIUM_NAME = /^[A-Za-z0-9_]{3,16}$/;

// Cabeza de 8 × 8 px (cara y capa del sombrero) recortada aquí de la skin que
// da Mojang, para que el navegador de quien visita no llame a nadie más. Antes
// se pedía a minotar, que devolvía a Steve para algunas cuentas premium con
// skin propia. Solo se sirven las de miembros, para no ser un proxy abierto.
export const GET: APIRoute = async ({ params }) => {
	const name = params.name ?? '';
	const { members } = await getMembers();

	if (!members.some((member) => member.name === name)) {
		return new Response(null, { status: 404 });
	}

	const cached = heads.get(name);
	if (cached && cached.expiresAt > Date.now()) {
		return cached.png ? png(cached.png, 86400) : steve(86400);
	}

	try {
		const skin = await mojangSkin(name);
		const result = skin ? head(skin) : null;
		heads.set(name, { png: result, expiresAt: Date.now() + DAY_MS });
		// Sin cuenta premium o sin skin propia: Steve, que es lo que ve el juego.
		return result ? png(result, 86400) : steve(86400);
	} catch {
		// Mojang limita las peticiones (429) cuando se piden muchas cabezas a la
		// vez. Mientras, la de minotar, que casi siempre acierta, o Steve; con
		// poca caché para volver a preguntar a Mojang pronto.
		const fallback = await minotarHead(name).catch(() => null);
		return fallback ? png(fallback, 300) : steve(300);
	}
};

const DAY_MS = 86_400_000;

// Cabezas ya resueltas en esta instancia, para no repetir peticiones a Mojang.
const heads = new Map<string, { png: Buffer | null; expiresAt: number }>();

function png(body: Buffer, maxAge: number): Response {
	return new Response(body, {
		headers: {
			'Cache-Control': `public, max-age=${maxAge}, s-maxage=${maxAge}, stale-while-revalidate=604800`,
			'Content-Type': 'image/png',
		},
	});
}

function steve(maxAge: number): Response {
	return new Response(null, {
		status: 302,
		headers: { 'Cache-Control': `public, max-age=${maxAge}`, Location: STEVE },
	});
}

async function minotarHead(name: string): Promise<Buffer | null> {
	const response = await fetch(`https://minotar.net/helm/${encodeURIComponent(name)}/8.png`, {
		signal: AbortSignal.timeout(FETCH_TIMEOUT_MS),
	});
	return response.ok ? Buffer.from(await response.arrayBuffer()) : null;
}

async function fetchMojang(url: string): Promise<Response | null> {
	const response = await fetch(url, { signal: AbortSignal.timeout(FETCH_TIMEOUT_MS) });
	// 204/404: ese nombre no es una cuenta premium.
	if (response.status === 204 || response.status === 404) return null;
	if (!response.ok) throw new Error(`mojang_${response.status}`);
	return response;
}

/** PNG de la skin de una cuenta premium, o null si no lo es o no tiene skin propia. */
async function mojangSkin(name: string): Promise<Buffer | null> {
	if (!PREMIUM_NAME.test(name)) return null;

	const profile = await fetchMojang(`https://api.mojang.com/users/profiles/minecraft/${name}`);
	if (!profile) return null;
	const { id } = (await profile.json()) as { id: string };

	const session = await fetchMojang(`https://sessionserver.mojang.com/session/minecraft/profile/${id}`);
	if (!session) return null;
	const { properties = [] } = (await session.json()) as { properties?: { name: string; value: string }[] };
	const encoded = properties.find((property) => property.name === 'textures')?.value;
	if (!encoded) return null;

	const textures = JSON.parse(Buffer.from(encoded, 'base64').toString('utf8')) as {
		textures?: { SKIN?: { url?: string } };
	};
	const url = textures.textures?.SKIN?.url;
	if (!url) return null;

	// Solo el servidor de texturas de Mojang.
	const skinUrl = new URL(url);
	if (skinUrl.hostname !== 'textures.minecraft.net') return null;
	skinUrl.protocol = 'https:';

	const skin = await fetchMojang(skinUrl.toString());
	return skin ? Buffer.from(await skin.arrayBuffer()) : null;
}

/** Cara (8,8) con el sombrero (40,8) encima, en un PNG de 8 × 8. */
function head(skinPng: Buffer): Buffer {
	const skin = PNG.sync.read(skinPng);
	const out = new PNG({ width: 8, height: 8 });
	const at = (x: number, y: number) => (y * skin.width + x) * 4;

	// Las skins antiguas (64 × 32) sin ningún píxel transparente en el sombrero
	// lo tienen relleno: el juego lo ignora y aquí también.
	let hatIsFiller = skin.height === 32;
	for (let y = 0; y < 8 && hatIsFiller; y++) {
		for (let x = 0; x < 8; x++) {
			if (skin.data[at(40 + x, 8 + y) + 3] < 255) {
				hatIsFiller = false;
				break;
			}
		}
	}

	for (let y = 0; y < 8; y++) {
		for (let x = 0; x < 8; x++) {
			const face = at(8 + x, 8 + y);
			const hat = at(40 + x, 8 + y);
			const o = (y * 8 + x) * 4;
			const alpha = hatIsFiller ? 0 : skin.data[hat + 3] / 255;
			for (let c = 0; c < 3; c++) {
				out.data[o + c] = Math.round(skin.data[hat + c] * alpha + skin.data[face + c] * (1 - alpha));
			}
			out.data[o + 3] = 255;
		}
	}

	return PNG.sync.write(out);
}
