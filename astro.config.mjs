// @ts-check
import { defineConfig } from 'astro/config';
import sitemap from '@astrojs/sitemap';
import vercel from '@astrojs/vercel';

// Rutas con noindex en el layout: se excluyen también del sitemap para no
// pedirle a Google que rastree lo que luego le decimos que no indexe.
const noindexRoutes = ['/estado/', '/bluemap/'];

// https://astro.build/config
export default defineConfig({
	site: 'https://mc.ferreras.dev',
	output: 'server',
	trailingSlash: 'always',
	adapter: vercel(),
	integrations: [
		sitemap({
			filter: (page) => !noindexRoutes.some((route) => new URL(page).pathname === route),
		}),
	],
	vite: {
		ssr: {
			noExternal: [
				'@fortawesome/fontawesome-svg-core',
				'@fortawesome/free-brands-svg-icons',
				'@fortawesome/free-solid-svg-icons',
				'minecraft-status',
			],
		},
	},
});
