// MODO DEMOSTRACIÓN — catálogo ficticio.
// El catálogo y los precios reales del negocio no se incluyen en el portafolio.
export const CATEGORIAS = [
    { id: 'cat-cervezas',   nombre: 'Cervezas',    descripcion: '' },
    { id: 'cat-cocteleria', nombre: 'Coctelería',  descripcion: '' },
    { id: 'cat-shots',      nombre: 'Shots',       descripcion: '' },
    { id: 'cat-botellas',   nombre: 'Botellas',    descripcion: '' },
    { id: 'cat-sin-alcohol',nombre: 'Sin alcohol', descripcion: '' },
    { id: 'cat-snacks',     nombre: 'Snacks',      descripcion: '' },
    { id: 'cat-especiales', nombre: 'Especiales',  descripcion: 'Solo admin' },
];

export const PRODUCTOS = [
    { id: 'cerveza-clara',     categoria_id: 'cat-cervezas',    nombre: 'Cerveza clara',          precio_base: 55,   tipo_producto: 'otro' },
    { id: 'cerveza-oscura',    categoria_id: 'cat-cervezas',    nombre: 'Cerveza oscura',         precio_base: 60,   tipo_producto: 'otro' },
    { id: 'cubeta-6',          categoria_id: 'cat-cervezas',    nombre: 'Cubeta (6 cervezas)',    precio_base: 300,  tipo_producto: 'otro' },
    { id: 'michelada',         categoria_id: 'cat-cervezas',    nombre: 'Michelada',              precio_base: 75,   tipo_producto: 'otro' },

    { id: 'mojito',            categoria_id: 'cat-cocteleria',  nombre: 'Mojito',                 precio_base: 95,   tipo_producto: 'copa' },
    { id: 'margarita',         categoria_id: 'cat-cocteleria',  nombre: 'Margarita',              precio_base: 95,   tipo_producto: 'copa' },
    { id: 'paloma',            categoria_id: 'cat-cocteleria',  nombre: 'Paloma',                 precio_base: 90,   tipo_producto: 'copa' },
    { id: 'coctel-casa',       categoria_id: 'cat-cocteleria',  nombre: 'Coctel de la casa',      precio_base: 110,  tipo_producto: 'copa' },

    { id: 'shot-tequila',      categoria_id: 'cat-shots',       nombre: 'Shot de tequila',        precio_base: 70,   tipo_producto: 'copa' },
    { id: 'shot-mezcal',       categoria_id: 'cat-shots',       nombre: 'Shot de mezcal',         precio_base: 80,   tipo_producto: 'copa' },
    { id: 'tabla-shots',       categoria_id: 'cat-shots',       nombre: 'Tabla de shots (10)',    precio_base: 550,  tipo_producto: 'otro' },

    { id: 'botella-ron',       categoria_id: 'cat-botellas',    nombre: 'Botella de ron',         precio_base: 1200, tipo_producto: 'botella' },
    { id: 'botella-tequila',   categoria_id: 'cat-botellas',    nombre: 'Botella de tequila',     precio_base: 1500, tipo_producto: 'botella' },
    { id: 'botella-vodka',     categoria_id: 'cat-botellas',    nombre: 'Botella de vodka',       precio_base: 1300, tipo_producto: 'botella' },
    { id: 'botella-whisky',    categoria_id: 'cat-botellas',    nombre: 'Botella de whisky',      precio_base: 1800, tipo_producto: 'botella' },

    { id: 'refresco',          categoria_id: 'cat-sin-alcohol', nombre: 'Refresco',               precio_base: 35,   tipo_producto: 'otro' },
    { id: 'agua-mineral',      categoria_id: 'cat-sin-alcohol', nombre: 'Agua mineral',           precio_base: 35,   tipo_producto: 'otro' },
    { id: 'energizante',       categoria_id: 'cat-sin-alcohol', nombre: 'Bebida energética',      precio_base: 70,   tipo_producto: 'otro' },

    { id: 'papas',             categoria_id: 'cat-snacks',      nombre: 'Papas a la francesa',    precio_base: 90,   tipo_producto: 'otro' },
    { id: 'alitas',            categoria_id: 'cat-snacks',      nombre: 'Alitas (10 pzas)',       precio_base: 160,  tipo_producto: 'otro' },

    { id: 'barra-libre',       categoria_id: 'cat-especiales',  nombre: 'Barra libre (por persona)', precio_base: 350, tipo_producto: 'barra_libre' },
];
