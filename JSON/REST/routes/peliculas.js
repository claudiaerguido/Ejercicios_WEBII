const express = require('express');
const router = express.Router();
const db = require('../data/db');

// ─────────────────────────────────────────────────────────────────────────────
// GET /peliculas
// Devuelve la lista de todas las películas de la cartelera
// Query params opcionales: ?genero=Acción  ?clasificacion=PG-13
// ─────────────────────────────────────────────────────────────────────────────
router.get('/', (req, res) => {
    let resultado = [...db.peliculas];

    // Filtros opcionales por query string
    if (req.query.genero) {
        resultado = resultado.filter(p =>
            p.genero.toLowerCase().includes(req.query.genero.toLowerCase())
        );
    }
    if (req.query.clasificacion) {
        resultado = resultado.filter(p =>
            p.clasificacion.toLowerCase() === req.query.clasificacion.toLowerCase()
        );
    }

    res.status(200).json({
        total: resultado.length,
        peliculas: resultado
    });
});

// ─────────────────────────────────────────────────────────────────────────────
// GET /peliculas/:id
// Devuelve los detalles de una película concreta
// ─────────────────────────────────────────────────────────────────────────────
router.get('/:id', (req, res) => {
    const id = parseInt(req.params.id);
    const pelicula = db.peliculas.find(p => p.id === id);

    if (!pelicula) {
        return res.status(404).json({
            error: 'Not Found',
            message: `No existe ninguna película con id ${id}`
        });
    }

    res.status(200).json(pelicula);
});

// ─────────────────────────────────────────────────────────────────────────────
// GET /peliculas/:id/sesiones
// Devuelve todas las sesiones disponibles para una película concreta
// ─────────────────────────────────────────────────────────────────────────────
router.get('/:id/sesiones', (req, res) => {
    const id = parseInt(req.params.id);
    const pelicula = db.peliculas.find(p => p.id === id);

    if (!pelicula) {
        return res.status(404).json({
            error: 'Not Found',
            message: `No existe ninguna película con id ${id}`
        });
    }

    const sesiones = db.sesiones.filter(s => s.peliculaId === id);

    res.status(200).json({
        pelicula: { id: pelicula.id, titulo: pelicula.titulo },
        total: sesiones.length,
        sesiones
    });
});

// ─────────────────────────────────────────────────────────────────────────────
// POST /peliculas
// Añade una nueva película a la cartelera
// Body requerido: titulo, director, genero, duracion, clasificacion
// ─────────────────────────────────────────────────────────────────────────────
router.post('/', (req, res) => {
    const { titulo, director, genero, duracion, clasificacion, sinopsis, anio, poster } = req.body;

    // Validación de campos obligatorios
    if (!titulo || !director || !genero || !duracion || !clasificacion) {
        return res.status(422).json({
            error: 'Unprocessable Entity',
            message: 'Los campos titulo, director, genero, duracion y clasificacion son obligatorios'
        });
    }

    if (typeof duracion !== 'number' || duracion <= 0) {
        return res.status(422).json({
            error: 'Unprocessable Entity',
            message: 'El campo duracion debe ser un número positivo (minutos)'
        });
    }

    const nueva = {
        id: db.getNextPeliculaId(),
        titulo,
        director,
        genero,
        duracion,
        clasificacion,
        sinopsis: sinopsis || '',
        anio: anio || new Date().getFullYear(),
        poster: poster || null
    };

    db.peliculas.push(nueva);

    // 201 Created con Location header apuntando al nuevo recurso
    res.status(201)
        .location(`/peliculas/${nueva.id}`)
        .json(nueva);
});

// ─────────────────────────────────────────────────────────────────────────────
// PUT /peliculas/:id
// Actualiza completamente los datos de una película
// ─────────────────────────────────────────────────────────────────────────────
router.put('/:id', (req, res) => {
    const id = parseInt(req.params.id);
    const idx = db.peliculas.findIndex(p => p.id === id);

    if (idx === -1) {
        return res.status(404).json({
            error: 'Not Found',
            message: `No existe ninguna película con id ${id}`
        });
    }

    const { titulo, director, genero, duracion, clasificacion, sinopsis, anio, poster } = req.body;

    if (!titulo || !director || !genero || !duracion || !clasificacion) {
        return res.status(422).json({
            error: 'Unprocessable Entity',
            message: 'Los campos titulo, director, genero, duracion y clasificacion son obligatorios'
        });
    }

    db.peliculas[idx] = {
        id,
        titulo,
        director,
        genero,
        duracion,
        clasificacion,
        sinopsis: sinopsis || '',
        anio: anio || db.peliculas[idx].anio,
        poster: poster || db.peliculas[idx].poster
    };

    res.status(200).json(db.peliculas[idx]);
});

// ─────────────────────────────────────────────────────────────────────────────
// PATCH /peliculas/:id
// Actualiza parcialmente los datos de una película
// ─────────────────────────────────────────────────────────────────────────────
router.patch('/:id', (req, res) => {
    const id = parseInt(req.params.id);
    const idx = db.peliculas.findIndex(p => p.id === id);

    if (idx === -1) {
        return res.status(404).json({
            error: 'Not Found',
            message: `No existe ninguna película con id ${id}`
        });
    }

    // Solo actualizamos los campos enviados en el body
    db.peliculas[idx] = { ...db.peliculas[idx], ...req.body, id };

    res.status(200).json(db.peliculas[idx]);
});

// ─────────────────────────────────────────────────────────────────────────────
// DELETE /peliculas/:id
// Elimina una película de la cartelera
// ─────────────────────────────────────────────────────────────────────────────
router.delete('/:id', (req, res) => {
    const id = parseInt(req.params.id);
    const idx = db.peliculas.findIndex(p => p.id === id);

    if (idx === -1) {
        return res.status(404).json({
            error: 'Not Found',
            message: `No existe ninguna película con id ${id}`
        });
    }

    db.peliculas.splice(idx, 1);

    // 204 No Content: éxito pero sin cuerpo de respuesta
    res.status(204).send();
});

module.exports = router;
