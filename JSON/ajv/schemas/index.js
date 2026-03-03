// La versión por defecto de AJV es draft-07, aquí usamos draft 2020-12
const Ajv2020 = require("ajv/dist/2020");
const ajv = new Ajv2020(); /* https://ajv.js.org/json-schema.html#draft-2020-12 */

// Cargamos los schemas desde sus archivos JSON
const schema_persona = require("./person.schema.json");
const schema_coordenada = require("./coordinate.schema.json");

// addSchema registra el schema en AJV pero no lo compila hasta que se use
// ver https://ajv.js.org/guide/managing-schemas.html#using-ajv-instance-cache
ajv.addSchema(schema_persona, "persona");
ajv.addSchema(schema_coordenada, "coordenada");

module.exports = ajv;
