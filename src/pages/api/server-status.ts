import type { APIRoute } from 'astro';
import { getMinecraftStatus } from '../../lib/minecraft-status';

export const prerender = false;

export const GET: APIRoute = async () => {
	const status = await getMinecraftStatus();

	return new Response(
		JSON.stringify({
			...status,
			checkedAt: new Date().toISOString(),
		}),
		{
			headers: {
				'Cache-Control': 'public, max-age=0, s-maxage=30, stale-while-revalidate=15',
				'Content-Type': 'application/json; charset=utf-8',
			},
		},
	);
};
