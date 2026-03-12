const express = require('express');
const app = express();
const PORT = 3000;

// ── Middleware ────────────────────────────────────────────────────────────────
app.use(express.json()); // Parsear body JSON
app.use(express.urlencoded({ extended: true }));

// Cabecera informativa de la API
app.use((req, res, next) => {
    res.setHeader('X-Powered-By', 'Cine REST API');
    next();
});

// ── Rutas ─────────────────────────────────────────────────────────────────────
app.use('/peliculas', require('./routes/peliculas'));
app.use('/sesiones', require('./routes/sesiones'));
app.use('/salas', require('./routes/salas'));

// ── Ruta raíz: índice de la API ───────────────────────────────────────────────
app.get('/', (req, res) => {
    res.status(200).json({
        nombre: 'Cine REST API',
        version: '1.0.0',
        descripcion: 'Servicio web REST para gestión de cartelera y sesiones de un cine',
        recursos: {
            peliculas: {
                descripcion: 'Gestión de la cartelera (películas en emisión)',
                rutas: [
                    { metodo: 'GET', ruta: '/peliculas', descripcion: 'Listar todas las películas (filtros: ?genero=, ?clasificacion=)' },
                    { metodo: 'GET', ruta: '/peliculas/:id', descripcion: 'Obtener datos de una película' },
                    { metodo: 'GET', ruta: '/peliculas/:id/sesiones', descripcion: 'Sesiones disponibles de una película' },
                    { metodo: 'POST', ruta: '/peliculas', descripcion: 'Añadir una nueva película' },
                    { metodo: 'PUT', ruta: '/peliculas/:id', descripcion: 'Actualizar completamente una película' },
                    { metodo: 'PATCH', ruta: '/peliculas/:id', descripcion: 'Actualizar parcialmente una película' },
                    { metodo: 'DELETE', ruta: '/peliculas/:id', descripcion: 'Eliminar una película' }
                ]
            },
            sesiones: {
                descripcion: 'Gestión de sesiones (pases) de cada película',
                rutas: [
                    { metodo: 'GET', ruta: '/sesiones', descripcion: 'Listar sesiones (filtros: ?fecha=, ?peliculaId=, ?salaId=)' },
                    { metodo: 'GET', ruta: '/sesiones/:id', descripcion: 'Obtener detalle de una sesión' },
                    { metodo: 'POST', ruta: '/sesiones', descripcion: 'Crear una nueva sesión' },
                    { metodo: 'PUT', ruta: '/sesiones/:id', descripcion: 'Actualizar completamente una sesión' },
                    { metodo: 'PATCH', ruta: '/sesiones/:id', descripcion: 'Actualizar parcialmente una sesión' },
                    { metodo: 'DELETE', ruta: '/sesiones/:id', descripcion: 'Eliminar una sesión' }
                ]
            },
            salas: {
                descripcion: 'Gestión de las salas del cine',
                rutas: [
                    { metodo: 'GET', ruta: '/salas', descripcion: 'Listar todas las salas (filtros: ?tipo=, ?activa=true/false)' },
                    { metodo: 'GET', ruta: '/salas/:id', descripcion: 'Obtener datos de una sala' },
                    { metodo: 'GET', ruta: '/salas/:id/sesiones', descripcion: 'Sesiones programadas en una sala' },
                    { metodo: 'POST', ruta: '/salas', descripcion: 'Añadir una nueva sala' },
                    { metodo: 'PATCH', ruta: '/salas/:id', descripcion: 'Actualizar parcialmente una sala (ej. desactivarla)' },
                    { metodo: 'DELETE', ruta: '/salas/:id', descripcion: 'Eliminar una sala (solo si no tiene sesiones)' }
                ]
            }
        }
    });
});

// ── Manejo de rutas no encontradas (404) ──────────────────────────────────────
app.use((req, res) => {
    res.status(404).json({
        error: 'Not Found',
        message: `La ruta ${req.method} ${req.path} no existe en esta API`
    });
});

// ── Manejo global de errores (500) ────────────────────────────────────────────
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).json({
        error: 'Internal Server Error',
        message: 'Ha ocurrido un error inesperado en el servidor'
    });
});

// ── Arrancar servidor ─────────────────────────────────────────────────────────
app.listen(PORT, () => {
    console.log(`🎬 Cine REST API corriendo en http://localhost:${PORT}`);
    console.log(`📖 Índice de la API: http://localhost:${PORT}/`);
});
