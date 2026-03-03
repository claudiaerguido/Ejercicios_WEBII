const express = require("express");
const ajv = require("./schemas");

const app = express();
const PORT = 3000;

// Middleware para parsear JSON
app.use(express.json());

/**
 * POST /validate/person
 * Valida un JSON contra el schema de persona.
 * - 200: JSON válido
 * - 422: JSON inválido o error
 */
app.post("/validate/person", (req, res) => {
    try {
        const json = req.body;
        const validate = ajv.getSchema("person");

        if (validate(json)) {
            return res.status(200).json({ valid: true, message: "JSON válido según el schema Person" });
        } else {
            return res.status(422).json({ valid: false, errors: validate.errors });
        }
    } catch (error) {
        return res.status(422).json({ valid: false, message: "Error al validar", error: error.message });
    }
});

/**
 * POST /validate/coordinate
 * Valida un JSON contra el schema de coordenada geográfica.
 * - 200: JSON válido
 * - 422: JSON inválido o error
 */
app.post("/validate/coordinate", (req, res) => {
    try {
        const json = req.body;
        const validate = ajv.getSchema("coordinate");

        if (validate(json)) {
            return res.status(200).json({ valid: true, message: "JSON válido según el schema Coordinate" });
        } else {
            return res.status(422).json({ valid: false, errors: validate.errors });
        }
    } catch (error) {
        return res.status(422).json({ valid: false, message: "Error al validar", error: error.message });
    }
});

app.listen(PORT, () => {
    console.log(`Servidor escuchando en http://localhost:${PORT}`);
});
