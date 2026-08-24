// @ts-check
import { defineConfig } from 'astro/config';
import sitemap from '@astrojs/sitemap';
import vercel from '@astrojs/vercel';

// https://astro.build/config
export default defineConfig({
	site: 'https://mc.ferreras.dev',
	output: 'server',
	trailingSlash: 'always',
	adapter: vercel(),
	integrations: [sitemap()],
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
