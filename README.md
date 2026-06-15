# DiscoStore API

API REST para administrar el catálogo de álbumes de DiscoStore.

## Requisitos

- Node.js instalado
- SQLite local
- Archivo `.env` con estas variables:

```env
HOST=localhost
PORT=3000
```

## Instalación

```bash
npm install
```

## Ejecución

```bash
npm start
```

La API queda disponible en `http://localhost:3000` si usas los valores anteriores.

## Carga inicial de datos

La base `discostore.db` se crea automáticamente la primera vez que arrancas la API. En ese arranque se lee `data/albumes.json` y se insertan los álbumes iniciales en SQLite.

Si quieres reiniciar la carga, borra `discostore.db` y vuelve a iniciar el servidor.

## Rutas

- `GET /` información general de la API
- `GET /albumes` lista todos los álbumes
- `GET /album/:slug` obtiene un álbum por slug
- `GET /genero/:genero` devuelve los slugs del género indicado
- `GET /search/:text` busca por título o artista
- `POST /albumes` crea un álbum
- `PUT /album/:slug` actualiza un álbum
- `DELETE /album/:slug` elimina un álbum
- `GET /imagenes/*` sirve imágenes estáticas

## Estructura de álbum

```json
{
  "titulo": "Thriller",
  "artista": "Michael Jackson",
  "genero": "Pop",
  "anio": 1982,
  "sello": "Epic",
  "pistas": 9,
  "imagen": "Thriller",
  "slug": "thriller",
  "resumen": "El album mas vendido de la historia.",
  "descripcion": "Album de Michael Jackson que redefinio la musica pop de los anos 80."
}
```

## Notas

- El `slug` se genera a partir del `titulo`.
- Las escrituras modifican directamente SQLite.
