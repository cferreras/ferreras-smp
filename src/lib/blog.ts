import type { CollectionEntry } from 'astro:content';

// La categoría hace de etiqueta: su slug elige el color (ver `[data-tag]` en
// phi.css) y es el valor que usa el filtro del listado.
export const slugify = (text: string) =>
	text
		.normalize('NFD')
		.replace(/\p{Diacritic}/gu, '')
		.toLowerCase()
		.replace(/\s+/g, '-');

export const formatDate = (date: Date) => date.toLocaleDateString('es-ES', { day: 'numeric', month: 'short', year: 'numeric' });

export const readingMinutes = (body = '') => Math.max(1, Math.ceil(body.split(/\s+/).filter(Boolean).length / 200));

export const toCard = (entry: CollectionEntry<'blog'>) => ({
	href: `/blog/${entry.id}/`,
	title: entry.data.title,
	description: entry.data.description,
	image: entry.data.image,
	imageAlt: entry.data.imageAlt,
	category: entry.data.category,
	tag: slugify(entry.data.category),
	meta: `${formatDate(entry.data.publishedAt)} · ${readingMinutes(entry.body)} min`,
});

export type PostCard = ReturnType<typeof toCard>;
