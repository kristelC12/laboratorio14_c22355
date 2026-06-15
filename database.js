const sqlite3 = require('sqlite3').verbose();
const fs = require('fs');

const db = new sqlite3.Database('./discostore.db');

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

            if(row.total === 0){

                const albumes = JSON.parse(
                    fs.readFileSync('./data/albumes.json')
                );

                albumes.forEach(album=>{

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
                        ]
                    );
                });
            }
        }
    );
});

module.exports = db;