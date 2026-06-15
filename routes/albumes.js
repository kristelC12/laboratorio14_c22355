const express = require('express');
const { z } = require('zod');

const router = express.Router();
const db = require('../database');

function generarSlug(texto) {
    return texto
        .toLowerCase()
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '')
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/^-+|-+$/g, '');
}

const albumSchema = z.object({
    titulo: z.string().trim().min(1),
    artista: z.string().trim().min(1),
    genero: z.string().trim().min(1),
    anio: z.coerce.number().int(),
    sello: z.string().trim().min(1),
    pistas: z.coerce.number().int().positive(),
    imagen: z.string().trim().min(1),
    resumen: z.string().trim().min(1),
    descripcion: z.string().trim().min(1)
});

/* GET /albumes */
router.get('/albumes',(req,res)=>{

    db.all(
        'SELECT * FROM albumes',
        (err,rows)=>{
            res.status(200).json(rows);
        }
    );
});

/* GET /album/:slug */
router.get('/album/:slug',(req,res)=>{

    db.get(
        'SELECT * FROM albumes WHERE slug=?',
        [req.params.slug],
        (err,row)=>{

            if(!row){
                return res.status(404).json({
                    mensaje:'Album no encontrado'
                });
            }

            res.status(200).json(row);
        }
    );
});

/* GET /genero/:genero */
router.get('/genero/:genero',(req,res)=>{

    db.all(
        'SELECT slug FROM albumes WHERE genero=?',
        [req.params.genero],
        (err,rows)=>{
            res.status(200).json(rows);
        }
    );
});

/* GET /search/:text */
router.get('/search/:text',(req,res)=>{

    const texto = `%${req.params.text}%`;

    db.all(
        `SELECT * FROM albumes
        WHERE titulo LIKE ?
        OR artista LIKE ?`,
        [texto,texto],
        (err,rows)=>{
            res.status(200).json(rows);
        }
    );
});

/* POST /albumes */
router.post('/albumes',(req,res)=>{

    const validacion = albumSchema.safeParse(req.body);

    if(!validacion.success){
        return res.status(400).json(validacion.error);
    }

    const album = validacion.data;
    const slug = generarSlug(album.titulo);

    if(!slug){
        return res.status(400).json({
            mensaje:'El titulo no produce un slug valido'
        });
    }

    db.get(
        'SELECT slug FROM albumes WHERE slug=?',
        [slug],
        (err,row)=>{

            if(row){
                return res.status(409).json({
                    mensaje:'Slug ya existe'
                });
            }

            db.run(
                `INSERT INTO albumes VALUES(?,?,?,?,?,?,?,?,?,?)`,
                [
                    slug,
                    album.titulo,
                    album.artista,
                    album.genero,
                    album.anio,
                    album.sello,
                    album.pistas,
                    album.imagen,
                    album.resumen,
                    album.descripcion
                ],
                ()=>{
                    res
                        .status(201)
                        .location(`/album/${slug}`)
                        .json({
                            ...album,
                            slug
                        });
                }
            );
        }
    );
});

/* PUT /album/:slug */
router.put('/album/:slug',(req,res)=>{

    const validacion = albumSchema.safeParse(req.body);

    if(!validacion.success){
        return res.status(400).json(validacion.error);
    }

    const album = validacion.data;
    const nuevoSlug = generarSlug(album.titulo);

    if(!nuevoSlug){
        return res.status(400).json({
            mensaje:'El titulo no produce un slug valido'
        });
    }

    db.get(
        'SELECT slug FROM albumes WHERE slug=?',
        [req.params.slug],
        (err,row)=>{

            if(!row){
                return res.status(404).json({
                    mensaje:'Album no encontrado'
                });
            }

            db.get(
                'SELECT slug FROM albumes WHERE slug=?',
                [nuevoSlug],
                (slugErr, existingRow)=>{

                    if(existingRow && existingRow.slug !== req.params.slug){
                        return res.status(409).json({
                            mensaje:'Slug ya existe'
                        });
                    }

                    db.run(
                        `
                        UPDATE albumes
                        SET slug=?,
                            titulo=?,
                            artista=?,
                            genero=?,
                            anio=?,
                            sello=?,
                            pistas=?,
                            imagen=?,
                            resumen=?,
                            descripcion=?
                        WHERE slug=?
                        `,
                        [
                            nuevoSlug,
                            album.titulo,
                            album.artista,
                            album.genero,
                            album.anio,
                            album.sello,
                            album.pistas,
                            album.imagen,
                            album.resumen,
                            album.descripcion,
                            req.params.slug
                        ],
                        function(){

                            if(this.changes === 0){
                                return res.status(404).json({
                                    mensaje:'Album no encontrado'
                                });
                            }

                            res.status(200).json({
                                ...album,
                                slug: nuevoSlug
                            });
                        }
                    );
                }
            );
        }
    );
});

/* DELETE /album/:slug */
router.delete('/album/:slug',(req,res)=>{

    db.run(
        'DELETE FROM albumes WHERE slug=?',
        [req.params.slug],
        function(){

            if(this.changes === 0){
                return res.status(404).json({
                    mensaje:'Album no encontrado'
                });
            }

            res.status(204).send();
        }
    );
});

module.exports = router;