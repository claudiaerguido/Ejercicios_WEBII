const express = require('express');
const router = express.Router();
const db = require('../data/db');

// ─────────────────────────────────────────────────────────────────────────────
// GET /sesiones
// Devuelve todas las sesiones. Filtros opcionales por fecha y/o peliculaId
// Ej: GET /sesiones?fecha=2026-03-06&peliculaId=1
// ─────────────────────────────────────────────────────────────────────────────
router.get('/', (req, res) => {
    let resultado = [...db.sesiones];

    if (req.query.fecha) {
        resultado = resultado.filter(s => s.fecha === req.query.fecha);
    }
    if (req.query.peliculaId) {
        resultado = resultado.filter(s => s.peliculaId === parseInt(req.query.peliculaId));
    }
    if (req.query.salaId) {
        resultado = resultado.filter(s => s.salaId === parseInt(req.query.salaId));
    }

    // Enriquecer la respuesta con título de la película y nombre de sala
    const resultado_enriquecido = resultado.map(s => ({
        ...s,
        pelicula: db.peliculas.find(p => p.id === s.peliculaId)?.titulo || 'Desconocida',
        sala: db.salas.find(sa => sa.id === s.salaId)?.nombre || 'Desconocida'
    }));

    res.status(200).json({
        total: resultado_enriquecido.length,
        sesiones: resultado_enriquecido
    });
});

// ─────────────────────────────────────────────────────────────────────────────
// GET /sesiones/:id
// Devuelve el detalle completo de una sesión
// ─────────────────────────────────────────────────────────────────────────────
router.get('/:id', (req, res) => {
    const id = parseInt(req.params.id);
    const sesion = db.sesiones.find(s => s.id === id);

    if (!sesion) {
        return res.status(404).json({
            error: 'Not Found',
            message: `No existe ninguna sesión con id ${id}`
        });
    }

    const pelicula = db.peliculas.find(p => p.id === sesion.peliculaId);
    const sala = db.salas.find(sa => sa.id === sesion.salaId);

    res.status(200).json({
        ...sesion,
        pelicula: pelicula || null,
        sala: sala || null
    });
});

// ─────────────────────────────────────────────────────────────────────────────
// POST /sesiones
// Crea una nueva sesión para una película en una sala
// Body requerido: peliculaId, salaId, fecha, hora, precio, idioma, formato
// ─────────────────────────────────────────────────────────────────────────────
router.post('/', (req, res) => {
    const { peliculaId, salaId, fecha, hora, precio, idioma, formato } = req.body;

    // Validación de campos obligatorios
    if (!peliculaId || !salaId || !fecha || !hora || precio === undefined) {
        return res.status(422).json({
            error: 'Unprocessable Entity',
            message: 'Los campos peliculaId, salaId, fecha, hora y precio son obligatorios'
        });
    }

    // Verificar que la película existe
    const pelicula = db.peliculas.find(p => p.id === peliculaId);
    if (!pelicula) {
        return res.status(404).json({
            error: 'Not Found',
            message: `No existe ninguna película con id ${peliculaId}`
        });
    }

    // Verificar que la sala existe y está activa
    const sala = db.salas.find(sa => sa.id === salaId);
    if (!sala) {
        return res.status(404).json({
            error: 'Not Found',
            message: `No existe ninguna sala con id ${salaId}`
        });
    }
    if (!sala.activa) {
        return res.status(409).json({
            error: 'Conflict',
            message: `La sala "${sala.nombre}" no está disponible`
        });
    }

    // Verificar que no hay solapamiento en esa sala/fecha/hora
    const solapamiento = db.sesiones.find(s =>
        s.salaId === salaId && s.fecha === fecha && s.hora === hora
    );
    if (solapamiento) {
        return res.status(409).json({
            error: 'Conflict',
            message: `Ya existe una sesión en esa sala a esa hora el ${fecha}`
        });
    }

    const nueva = {
        id: db.getNextSesionId(),
        peliculaId,
        salaId,
        fecha,
        hora,
        precio,
        asientosDisponibles: sala.capacidad,
        idioma: idioma || 'Español',
        formato: formato || sala.tipo
    };

    db.sesiones.push(nueva);

    res.status(201)
        .location(`/sesiones/${nueva.id}`)
        .json(nueva);
});

// ─────────────────────────────────────────────────────────────────────────────
// PUT /sesiones/:id
// Actualiza completamente una sesión
// ─────────────────────────────────────────────────────────────────────────────
router.put('/:id', (req, res) => {
    const id = parseInt(req.params.id);
    const idx = db.sesiones.findIndex(s => s.id === id);

    if (idx === -1) {
        return res.status(404).json({
            error: 'Not Found',
            message: `No existe ninguna sesión con id ${id}`
        });
    }

    const { peliculaId, salaId, fecha, hora, precio, asientosDisponibles, idioma, formato } = req.body;

    if (!peliculaId || !salaId || !fecha || !hora || precio === undefined) {
        return res.status(422).json({
            error: 'Unprocessable Entity',
            message: 'Los campos peliculaId, salaId, fecha, hora y precio son obligatorios'
        });
    }

    db.sesiones[idx] = {
        id,
        peliculaId,
        salaId,
        fecha,
        hora,
        precio,
        asientosDisponibles: asientosDisponibles ?? db.sesiones[idx].asientosDisponibles,
        idioma: idioma || db.sesiones[idx].idioma,
        formato: formato || db.sesiones[idx].formato
    };

    res.status(200).json(db.sesiones[idx]);
});

// ─────────────────────────────────────────────────────────────────────────────
// PATCH /sesiones/:id
// Actualiza parcialmente una sesión (ej. cambiar precio o asientos disponibles)
// ─────────────────────────────────────────────────────────────────────────────
router.patch('/:id', (req, res) => {
    const id = parseInt(req.params.id);
    const idx = db.sesiones.findIndex(s => s.id === id);

    if (idx === -1) {
        return res.status(404).json({
            error: 'Not Found',
            message: `No existe ninguna sesión con id ${id}`
        });
    }

    db.sesiones[idx] = { ...db.sesiones[idx], ...req.body, id };

    res.status(200).json(db.sesiones[idx]);
});

// ─────────────────────────────────────────────────────────────────────────────
// DELETE /sesiones/:id
// Elimina una sesión
// ─────────────────────────────────────────────────────────────────────────────
router.delete('/:id', (req, res) => {
    const id = parseInt(req.params.id);
    const idx = db.sesiones.findIndex(s => s.id === id);

    if (idx === -1) {
        return res.status(404).json({
            error: 'Not Found',
            message: `No existe ninguna sesión con id ${id}`
        });
    }

    db.sesiones.splice(idx, 1);
    res.status(204).send();
});

module.exports = router;
