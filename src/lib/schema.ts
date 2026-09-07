const SITE_URL = 'https://mc.ferreras.dev';

/**
 * BreadcrumbList para las páginas de sección. El último elemento va sin `item`,
 * como recomienda Google para la página actual.
 */
export function breadcrumbSchema(trail: { name: string; path?: string }[]) {
	return {
		'@context': 'https://schema.org',
		'@type': 'BreadcrumbList',
		itemListElement: [{ name: 'Inicio', path: '/' }, ...trail].map((item, index) => ({
			'@type': 'ListItem',
			position: index + 1,
			name: item.name,
			...(item.path ? { item: new URL(item.path, SITE_URL).toString() } : {}),
		})),
	};
}
