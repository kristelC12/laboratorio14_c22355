const { z } = require('zod');

const albumSchema = z.object({
    titulo: z.string(),
    artista: z.string(),
    genero: z.string(),
    anio: z.number(),
    sello: z.string(),
    pistas: z.number(),
    imagen: z.string(),
    slug: z.string(),
    resumen: z.string(),
    descripcion: z.string()
});