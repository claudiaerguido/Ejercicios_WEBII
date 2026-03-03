// La version por defecto es draft-07, usamos 2020-12
const Ajv2020 = require("ajv/dist/2020");
const ajv = new Ajv2020(); /* https://ajv.js.org/json-schema.html#draft-2020-12 */

const schema_person = require("./person.schema.json");
const schema_coordinate = require("./coordinate.schema.json");

// addSchema valida el schema, pero no lo compila
// ver https://ajv.js.org/guide/managing-schemas.html#using-ajv-instance-cache
ajv.addSchema(schema_person, "person");
ajv.addSchema(schema_coordinate, "coordinate");

module.exports = ajv;
