const sqlite3 = require('sqlite3').verbose();
const fs = require('fs');

const db = new sqlite3.Database('./discostore.db');

function generarSlug(texto) {
    return texto
        .toLowerCase()
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '')
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/^-+|-+$/g, '');
}

db.serialize(() => {

    db.run(`
        CREATE TABLE IF NOT EXISTS albumes(
            slug TEXT PRIMARY KEY,
            titulo TEXT NOT NULL,
            artista TEXT NOT NULL,
            genero TEXT NOT NULL,
            anio INTEGER NOT NULL,
            sello TEXT NOT NULL,
            pistas INTEGER NOT NULL,
            imagen TEXT NOT NULL,
            resumen TEXT NOT NULL,
            descripcion TEXT NOT NULL
        )
    `);

    db.get(
        "SELECT COUNT(*) AS total FROM albumes",
        (err,row)=>{

            if(err || !row || row.total === 0){

                const albumes = JSON.parse(
                    fs.readFileSync('./data/albumes.json', 'utf8')
                );

                albumes.forEach(album=>{
                    const slug = generarSlug(album.titulo);

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
                        ]
                    );
                });
            }
        }
    );
});

module.exports = db;