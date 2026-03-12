# Diseño del Servicio Web REST: Cine

Este documento describe la especificación teórica de la API REST para el sistema de gestión de un cine moderno, permitiendo consultar la cartelera, sesiones y realizar operaciones de gestión.

## 1. Identificación de Recursos

Se han identificado tres recursos principales dentro del dominio del problema:

*   **Películas (`/peliculas`)**: Representa la cartelera del cine. Contiene la información general de las obras audiovisuales.
*   **Salas (`/salas`)**: Representa los espacios físicos donde se proyectan las películas, cada una con su capacidad y características.
*   **Sesiones (`/sesiones`)**: Representa los pases concretos. Es la relación temporal y física entre una Película y una Sala en una fecha y hora determinadas.

---

## 2. Definición de Rutas y Acciones

A continuación se detallan los *endpoints* (rutas), los métodos HTTP, la acción que realizan y los códigos de estado esperados.

### Recurso: Películas (`/peliculas`)

| Método | Ruta | Acción | Código Estado (Éxito) | Posibles Errores |
| :--- | :--- | :--- | :--- | :--- |
| **GET** | `/peliculas` | Listar toda la cartelera. Permite filtros por *query* (ej. `?genero=Acción`). | `200 OK` | - |
| **GET** | `/peliculas/{id}` | Obtener el detalle de una película específica. | `200 OK` | `404 Not Found` (si no existe) |
| **GET** | `/peliculas/{id}/sesiones` | Obtener todas las sesiones disponibles para una película. | `200 OK` | `404 Not Found` |
| **POST** | `/peliculas` | Añadir una nueva película a la cartelera. | `201 Created` | `422 Unprocessable Entity` (faltan campos) |
| **PUT** | `/peliculas/{id}` | Reemplazar completamente la información de una película. | `200 OK` | `404 Not Found`, `422 Unprocessable Entity` |
| **PATCH**| `/peliculas/{id}` | Actualizar parcialmente una película (ej. cambiar solo la sinopsis). | `200 OK` | `404 Not Found` |
| **DELETE**| `/peliculas/{id}` | Eliminar una película de la cartelera. | `204 No Content`| `404 Not Found` |

### Recurso: Salas (`/salas`)

| Método | Ruta | Acción | Código Estado (Éxito) | Posibles Errores |
| :--- | :--- | :--- | :--- | :--- |
| **GET** | `/salas` | Listar todas las salas del cine. | `200 OK` | - |
| **GET** | `/salas/{id}` | Ver detalles y capacidad de una sala. | `200 OK` | `404 Not Found` |
| **GET** | `/salas/{id}/sesiones` | Listar qué proyecciones hay asignadas a esa sala. | `200 OK` | `404 Not Found` |
| **POST** | `/salas` | Registrar una nueva sala tras una ampliación. | `201 Created` | `422 Unprocessable Entity` |
| **PATCH**| `/salas/{id}` | Modificar el estado de la sala (ej. marcarla inactiva por reformas). | `200 OK` | `404 Not Found` |
| **DELETE**| `/salas/{id}` | Eliminar una sala (siempre que no tenga sesiones asociadas). | `204 No Content`| `404 Not Found`, `409 Conflict` (en uso) |

### Recurso: Sesiones (`/sesiones`)

| Método | Ruta | Acción | Código Estado (Éxito) | Posibles Errores |
| :--- | :--- | :--- | :--- | :--- |
| **GET** | `/sesiones` | Listar los pases programados (ej. `?fecha=2026-03-06`). | `200 OK` | - |
| **GET** | `/sesiones/{id}` | Ver detalles de un pase concreto (película, sala, precio, butacas libres). | `200 OK` | `404 Not Found` |
| **POST** | `/sesiones` | Programar una nueva sesión. | `201 Created` | `409 Conflict` (solapamiento), `422` |
| **PUT** | `/sesiones/{id}` | Reprogramar o cambiar completamente la sesión. | `200 OK` | `404 Not Found`, `409 Conflict` |
| **PATCH**| `/sesiones/{id}` | Actualizar parcial (ej. restar `asientosDisponibles` tras una compra). | `200 OK` | `404 Not Found` |
| **DELETE**| `/sesiones/{id}` | Cancelar una sesión. | `204 No Content`| `404 Not Found` |

---

## 3. Ejemplos de Mensajes y Estructura de Datos (JSON)

### 3.1. Crear una Película (POST `/peliculas`)

**Petición (Request Body):**
```json
{
  "titulo": "Dune: Parte Dos",
  "director": "Denis Villeneuve",
  "genero": "Ciencia Ficción",
  "duracion": 166,
  "clasificacion": "PG-13",
  "sinopsis": "Paul Atreides se une a los Fremen en su viaje de venganza.",
  "anio": 2024
}
```

**Respuesta Exitosa (201 Created):**
```json
{
  "id": 1,
  "titulo": "Dune: Parte Dos",
  "director": "Denis Villeneuve",
  "genero": "Ciencia Ficción",
  "duracion": 166,
  "clasificacion": "PG-13",
  "sinopsis": "Paul Atreides se une a los Fremen en su viaje de venganza.",
  "anio": 2024,
  "poster": null
}
```

### 3.2. Programar una Sesión (POST `/sesiones`)

**Petición (Request Body):**
```json
{
  "peliculaId": 1,
  "salaId": 1,
  "fecha": "2026-03-06",
  "hora": "16:00",
  "precio": 14.00,
  "idioma": "Español",
  "formato": "IMAX"
}
```

### 3.3. Ejemplo de Mensaje de Error (422 Unprocessable Entity)

Cuando faltan campos obligatorios al intentar crear un recurso.

**Respuesta de Error:**
```json
{
  "error": "Unprocessable Entity",
  "message": "Los campos titulo, director, genero, duracion y clasificacion son obligatorios"
}
```

---

## 4. Códigos de Estado Considerados

*   **`200 OK`**: La solicitud ha tenido éxito (generalmente en `GET`, `PUT`, `PATCH`).
*   **`201 Created`**: La solicitud ha tenido éxito y se ha creado un nuevo recurso (en `POST`). La cabecera `Location` incluirá la URL del nuevo recurso.
*   **`204 No Content`**: La solicitud se ha completado con éxito pero no hay cuerpo en la respuesta (típico en `DELETE`).
*   **`404 Not Found`**: El recurso solicitado (por un ID concreto) no existe.
*   **`409 Conflict`**: La solicitud no se puede procesar debido a un conflicto con el estado actual del recurso (ej. solapamiento de horario de sesiones o eliminar una sala en uso).
*   **`422 Unprocessable Entity`**: El formato JSON es correcto, pero la entidad es semánticamente errónea (ej. faltan campos obligatorios o el precio es negativo).
*   **`500 Internal Server Error`**: Error genérico e inesperado en la parte del servidor.
