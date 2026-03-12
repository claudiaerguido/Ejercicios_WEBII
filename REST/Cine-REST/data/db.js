// Base de datos en memoria para el cine
// En un proyecto real se usaría una base de datos como MongoDB o PostgreSQL

let peliculas = [
    {
        id: 1,
        titulo: "Dune: Parte Dos",
        director: "Denis Villeneuve",
        genero: "Ciencia Ficción",
        duracion: 166, // minutos
        clasificacion: "PG-13",
        sinopsis: "Paul Atreides se une a los Fremen en su viaje de venganza.",
        anio: 2024,
        poster: "https://example.com/dune2.jpg"
    },
    {
        id: 2,
        titulo: "Oppenheimer",
        director: "Christopher Nolan",
        genero: "Drama Histórico",
        duracion: 180,
        clasificacion: "R",
        sinopsis: "Historia del físico J. Robert Oppenheimer y el desarrollo de la bomba atómica.",
        anio: 2023,
        poster: "https://example.com/oppenheimer.jpg"
    },
    {
        id: 3,
        titulo: "Spider-Man: No Way Home",
        director: "Jon Watts",
        genero: "Acción / Superhéroes",
        duracion: 148,
        clasificacion: "PG-13",
        sinopsis: "Peter Parker pide ayuda al Doctor Strange para restaurar su identidad secreta.",
        anio: 2021,
        poster: "https://example.com/spiderman.jpg"
    }
];

let salas = [
    {
        id: 1,
        nombre: "Sala 1 - IMAX",
        capacidad: 200,
        tipo: "IMAX",
        activa: true
    },
    {
        id: 2,
        nombre: "Sala 2 - 3D",
        capacidad: 120,
        tipo: "3D",
        activa: true
    },
    {
        id: 3,
        nombre: "Sala 3 - Estándar",
        capacidad: 80,
        tipo: "Estándar",
        activa: true
    }
];

let sesiones = [
    {
        id: 1,
        peliculaId: 1,
        salaId: 1,
        fecha: "2026-03-06",
        hora: "16:00",
        precio: 14.00,
        asientosDisponibles: 150,
        idioma: "Español",
        formato: "IMAX"
    },
    {
        id: 2,
        peliculaId: 1,
        salaId: 2,
        fecha: "2026-03-06",
        hora: "19:30",
        precio: 11.50,
        asientosDisponibles: 90,
        idioma: "Versión Original",
        formato: "3D"
    },
    {
        id: 3,
        peliculaId: 2,
        salaId: 3,
        fecha: "2026-03-06",
        hora: "20:00",
        precio: 9.00,
        asientosDisponibles: 60,
        idioma: "Español",
        formato: "Estándar"
    },
    {
        id: 4,
        peliculaId: 3,
        salaId: 2,
        fecha: "2026-03-07",
        hora: "17:00",
        precio: 11.50,
        asientosDisponibles: 110,
        idioma: "Español",
        formato: "3D"
    }
];

let nextPeliculaId = 4;
let nextSesionId = 5;
let nextSalaId = 4;

module.exports = {
    peliculas,
    salas,
    sesiones,
    getNextPeliculaId: () => nextPeliculaId++,
    getNextSesionId: () => nextSesionId++,
    getNextSalaId: () => nextSalaId++
};
