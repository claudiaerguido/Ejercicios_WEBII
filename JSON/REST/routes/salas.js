const express = require('express');
const router = express.Router();
const db = require('../data/db');

// ─────────────────────────────────────────────────────────────────────────────
// GET /salas
// Devuelve la lista de todas las salas del cine
// ─────────────────────────────────────────────────────────────────────────────
router.get('/', (req, res) => {
    let resultado = [...db.salas];

    if (req.query.tipo) {
        resultado = resultado.filter(s =>
            s.tipo.toLowerCase() === req.query.tipo.toLowerCase()
        );
    }
    if (req.query.activa !== undefined) {
        const activa = req.query.activa === 'true';
        resultado = resultado.filter(s => s.activa === activa);
    }

    res.status(200).json({
        total: resultado.length,
        salas: resultado
    });
});

// ─────────────────────────────────────────────────────────────────────────────
// GET /salas/:id
// Devuelve los detalles de una sala concreta
// ─────────────────────────────────────────────────────────────────────────────
router.get('/:id', (req, res) => {
    const id = parseInt(req.params.id);
    const sala = db.salas.find(s => s.id === id);

    if (!sala) {
        return res.status(404).json({
            error: 'Not Found',
            message: `No existe ninguna sala con id ${id}`
        });
    }

    res.status(200).json(sala);
});

// ─────────────────────────────────────────────────────────────────────────────
// GET /salas/:id/sesiones
// Devuelve las sesiones programadas en una sala concreta
// ─────────────────────────────────────────────────────────────────────────────
router.get('/:id/sesiones', (req, res) => {
    const id = parseInt(req.params.id);
    const sala = db.salas.find(s => s.id === id);

    if (!sala) {
        return res.status(404).json({
            error: 'Not Found',
            message: `No existe ninguna sala con id ${id}`
        });
    }

    const sesiones = db.sesiones.filter(s => s.salaId === id);

    res.status(200).json({
        sala: { id: sala.id, nombre: sala.nombre },
        total: sesiones.length,
        sesiones
    });
});

// ─────────────────────────────────────────────────────────────────────────────
// POST /salas
// Añade una nueva sala al cine
// Body requerido: nombre, capacidad, tipo
// ─────────────────────────────────────────────────────────────────────────────
router.post('/', (req, res) => {
    const { nombre, capacidad, tipo } = req.body;

    if (!nombre || !capacidad || !tipo) {
        return res.status(422).json({
            error: 'Unprocessable Entity',
            message: 'Los campos nombre, capacidad y tipo son obligatorios'
        });
    }

    if (typeof capacidad !== 'number' || capacidad <= 0) {
        return res.status(422).json({
            error: 'Unprocessable Entity',
            message: 'El campo capacidad debe ser un número entero positivo'
        });
    }

    const nueva = {
        id: db.getNextSalaId(),
        nombre,
        capacidad,
        tipo,
        activa: true
    };

    db.salas.push(nueva);

    res.status(201)
        .location(`/salas/${nueva.id}`)
        .json(nueva);
});

// ─────────────────────────────────────────────────────────────────────────────
// PATCH /salas/:id
// Actualiza parcialmente una sala (ej. desactivarla)
// ─────────────────────────────────────────────────────────────────────────────
router.patch('/:id', (req, res) => {
    const id = parseInt(req.params.id);
    const idx = db.salas.findIndex(s => s.id === id);

    if (idx === -1) {
        return res.status(404).json({
            error: 'Not Found',
            message: `No existe ninguna sala con id ${id}`
        });
    }

    db.salas[idx] = { ...db.salas[idx], ...req.body, id };

    res.status(200).json(db.salas[idx]);
});

// ─────────────────────────────────────────────────────────────────────────────
// DELETE /salas/:id
// Elimina una sala (solo si no tiene sesiones asociadas)
// ─────────────────────────────────────────────────────────────────────────────
router.delete('/:id', (req, res) => {
    const id = parseInt(req.params.id);
    const idx = db.salas.findIndex(s => s.id === id);

    if (idx === -1) {
        return res.status(404).json({
            error: 'Not Found',
            message: `No existe ninguna sala con id ${id}`
        });
    }

    // Verificar que no tiene sesiones asociadas
    const tieneSesiones = db.sesiones.some(s => s.salaId === id);
    if (tieneSesiones) {
        return res.status(409).json({
            error: 'Conflict',
            message: 'No se puede eliminar la sala porque tiene sesiones asociadas. Elimine primero las sesiones.'
        });
    }

    db.salas.splice(idx, 1);
    res.status(204).send();
});

module.exports = router;
