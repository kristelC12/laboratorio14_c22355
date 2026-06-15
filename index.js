require('dotenv').config();

const express = require('express');

const app = express();

require('./database');

app.use(express.json());

app.use(
    '/imagenes',
    express.static('public/imagenes')
);

app.get('/',(req,res)=>{

    res.status(200).json({
        nombre: 'DiscoStore API',
        version: '1.0',
        rutas: [
            '/albumes',
            '/album/:slug',
            '/genero/:genero',
            '/search/:text',
            '/imagenes/*'
        ]
    });

});

app.use('/', require('./routes/albumes'));

app.listen(
    process.env.PORT,
    process.env.HOST,
    ()=>{
        console.log(
            `Servidor ejecutandose en http://${process.env.HOST}:${process.env.PORT}`
        );
    }
);