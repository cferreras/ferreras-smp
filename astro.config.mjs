// @ts-check
import { defineConfig, envField } from 'astro/config';
import sitemap from '@astrojs/sitemap';
import vercel from '@astrojs/vercel';

// Rutas con noindex en el layout: se excluyen también del sitemap para no
// pedirle a Google que rastree lo que luego le decimos que no indexe.
const noindexRoutes = ['/estado/'];

// https://astro.build/config
export default defineConfig({
	site: 'https://cubusfera.com',
	output: 'server',
	trailingSlash: 'always',
	adapter: vercel(),
	// API del panel con la lista de miembros (/comunidad/). Solo se leen en el
	// servidor; son opcionales para que el build no falle sin ellas y la página
	// muestre su aviso de lista no disponible.
	env: {
		schema: {
			MEMBERS_API_URL: envField.string({ context: 'server', access: 'secret', optional: true }),
			MEMBERS_API_TOKEN: envField.string({ context: 'server', access: 'secret', optional: true }),
		},
	},
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
