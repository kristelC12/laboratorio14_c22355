const express = require('express');
const { z } = require('zod');

const router = express.Router();
const db = require('../database');

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

    db.get(
        'SELECT slug FROM albumes WHERE slug=?',
        [album.slug],
        (err,row)=>{

            if(row){
                return res.status(409).json({
                    mensaje:'Slug ya existe'
                });
            }

            db.run(
                `INSERT INTO albumes VALUES(?,?,?,?,?,?,?,?,?,?)`,
                [
                    album.slug,
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
                        .location(`/album/${album.slug}`)
                        .json(album);
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

    db.run(
        `
        UPDATE albumes
        SET titulo=?,
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

            res.status(200).json(album);
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