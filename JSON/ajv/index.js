const express = require("express");
const ajv = require("./schemas");

const app = express();
const PUERTO = 3000;

// Middleware para que Express pueda leer el cuerpo de las peticiones como JSON
app.use(express.json());

/**
 * POST /validar/persona
 * Valida un JSON contra el schema de persona.
 * - 200: el JSON es válido
 * - 422: el JSON no es válido o ha ocurrido algún error
 */
app.post("/validar/persona", (req, res) => {
    try {
        const json = req.body;
        const validar = ajv.getSchema("persona");

        if (validar(json)) {
            return res.status(200).json({ valido: true, mensaje: "El JSON es válido según el schema Persona" });
        } else {
            return res.status(422).json({ valido: false, errores: validar.errors });
        }
    } catch (error) {
        return res.status(422).json({ valido: false, mensaje: "Error al validar el JSON", error: error.message });
    }
});

/**
 * POST /validar/coordenada
 * Valida un JSON contra el schema de coordenada geográfica.
 * - 200: el JSON es válido
 * - 422: el JSON no es válido o ha ocurrido algún error
 */
app.post("/validar/coordenada", (req, res) => {
    try {
        const json = req.body;
        const validar = ajv.getSchema("coordenada");

        if (validar(json)) {
            return res.status(200).json({ valido: true, mensaje: "El JSON es válido según el schema Coordenada" });
        } else {
            return res.status(422).json({ valido: false, errores: validar.errors });
        }
    } catch (error) {
        return res.status(422).json({ valido: false, mensaje: "Error al validar el JSON", error: error.message });
    }
});

app.listen(PUERTO, () => {
    console.log(`Servidor escuchando en http://localhost:${PUERTO}`);
});
