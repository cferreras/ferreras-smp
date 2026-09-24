// Capturas del mundo, compartidas por la galería y la portada. `hero` marca
// las que funcionan recortadas al marco vertical del hero (449 × 727): solo
// las casi cuadradas, con el punto de interés que debe quedar dentro.
export interface Shot {
	src: string;
	alt: string;
	width: number;
	height: number;
	caption: string;
	hero?: { position: string };
}

export const shots: Shot[] = [
	{ src: '/images/gallery/veronicucha-fortaleza.jpg', alt: 'Veronicucha sobre la muralla de una fortaleza de piedra y madera', width: 1720, height: 1366, caption: 'Fortalezas que empiezan arriba.', hero: { position: '12% 50%' } },
	{ src: '/images/gallery/ferreritas-costa-atardecer.jpg', alt: 'Ferreritas sobre una colina junto a la costa, rodeada de árboles y cultivos', width: 1800, height: 1343, caption: 'La costa al caer la tarde.', hero: { position: '50% 50%' } },
	{ src: '/images/gallery/ferreritas-nether.jpg', alt: 'Ferreritas con armadura verde junto a una mesa de trabajo en el Nether', width: 1800, height: 715, caption: 'Trabajo en condiciones difíciles.' },
	{ src: '/images/gallery/veronicucha-bosque.jpg', alt: 'Veronicucha junto a un árbol en un bosque con caminos de tierra', width: 1800, height: 716, caption: 'Un rincón entre los árboles.' },
	{ src: '/images/gallery/casas-frente-al-mar.jpg', alt: 'Casas de piedra y madera frente al mar en Cubusfera', width: 1800, height: 716, caption: 'Un barrio frente al mar.' },
	{ src: '/images/gallery/refugio-de-madera.jpg', alt: 'Entrada de madera y piedra decorada con vegetación y faroles', width: 1800, height: 716, caption: 'Detalles que hacen hogar.' },
	{ src: '/images/gallery/casa-entre-bambus.jpg', alt: 'Refugio de madera rodeado de vegetación y bambú', width: 1800, height: 716, caption: 'Un refugio para seguir construyendo.' },
	{ src: '/images/gallery/granja-de-hierro-aldea.jpg', alt: 'Jugador con armadura de diamante frente a una granja de hierro junto a una aldea de sabana', width: 1800, height: 962, caption: 'Redstone con vistas a la aldea.', hero: { position: '54% 50%' } },
	{ src: '/images/gallery/estructura-purpur-end.jpg', alt: 'Estructura de purpur de varias plantas sobre las islas exteriores del End, rodeada de plantas coro', width: 1800, height: 962, caption: 'Obras grandes en el End.', hero: { position: '54% 50%' } },
	{ src: '/images/gallery/jugador-ovejas-aldea.webp', alt: 'Jugador con armadura de diamante sentado en un cojín naranja junto a unas ovejas, con una construcción de piedra, una hoguera y bambú detrás', width: 1800, height: 963, caption: 'Probando los nuevos cojines de la 26.3.', hero: { position: '50% 50%' } },
];

const find = (file: string) => {
	const shot = shots.find((s) => s.src.endsWith(file));
	if (!shot) throw new Error(`Falta la captura ${file} en src/lib/gallery.ts`);
	return shot;
};

// Orden del carrusel del hero: abre la captura más reciente del mundo y el resto
// alterna superficie, redstone y End.
export const heroShots = ['jugador-ovejas-aldea.webp', 'granja-de-hierro-aldea.jpg', 'estructura-purpur-end.jpg', 'veronicucha-fortaleza.jpg'].map(find);

export const shotByFile = find;
