import type { APIRoute } from 'astro';
import { getMembers } from '../../../lib/members';

export const prerender = false;

const FETCH_TIMEOUT_MS = 3000;

// Cabeza de 8 × 8 px (cara y capa del sombrero) servida desde aquí para que el
// navegador de quien visita no llame a minotar. Las skins cambian poco, así que
// la CDN la guarda un día. Solo se sirven las de miembros, para no ser un proxy
// abierto de minotar.
export const GET: APIRoute = async ({ params }) => {
	const name = params.name ?? '';
	const { members } = await getMembers();

	if (!members.some((member) => member.name === name)) {
		return new Response(null, { status: 404 });
	}

	try {
		const response = await fetch(`https://minotar.net/helm/${encodeURIComponent(name)}/8.png`, {
			signal: AbortSignal.timeout(FETCH_TIMEOUT_MS),
		});

		if (!response.ok) {
			throw new Error(`minotar_${response.status}`);
		}

		return new Response(await response.arrayBuffer(), {
			headers: {
				'Cache-Control': 'public, max-age=86400, s-maxage=86400, stale-while-revalidate=604800',
				'Content-Type': 'image/png',
			},
		});
	} catch {
		// Si minotar no responde, Steve, con poca caché para reintentar pronto.
		return new Response(null, {
			status: 302,
			headers: {
				'Cache-Control': 'public, max-age=300',
				Location: '/images/cabeza-steve.png',
			},
		});
	}
};
