# 🍅 Pomify

> Una app de productividad basada en la técnica Pomodoro — construida con React + Flask como proyecto final de 4Geeks Academy.

---

## ¿Qué es Pomify?

Pomify te ayuda a trabajar mejor usando la [Técnica Pomodoro](https://es.wikipedia.org/wiki/T%C3%A9cnica_Pomodoro): sesiones de trabajo concentrado seguidas de descansos cortos. Inicia sesión, activa el temporizador y construye momentum — bloque a bloque.

---

## Stack tecnológico

| Capa | Tecnología |
|---|---|
| Frontend | React 18 · Vite · React Router DOM v6 |
| Animaciones | Motion · Lenis (scroll suave) |
| Backend | Python · Flask · SQLAlchemy |
| Base de datos | PostgreSQL |
| Autenticación | JWT (vía Flask) |
| Almacenamiento | Cloudinary |
| Deploy | Render.com |
| Entorno de desarrollo | GitHub Codespaces · Gitpod |

---

## Funcionalidades

- ⏱ **Temporizador Pomodoro** — ciclos de trabajo y descanso configurables
- 🔐 **Autenticación** — registro, inicio de sesión y sesiones personales
- 📊 **Historial de sesiones** — guarda y revisa tus Pomodoros completados
- 🎨 **UI fluida** — transiciones animadas con Motion y Lenis
- ☁️ **Listo para la nube** — deploy a Render.com en un solo comando

---

## Cómo empezar

### Requisitos previos

- Python 3.10+
- Node.js 20+
- PostgreSQL (o SQLite para desarrollo local)
- Pipenv

### Backend

```bash
# 1. Instalar dependencias de Python
pipenv install

# 2. Crear el archivo de entorno
cp .env.example .env
# → Edita .env y configura DATABASE_URL y las demás variables

# 3. Ejecutar migraciones
pipenv run migrate
pipenv run upgrade

# 4. Iniciar el backend
pipenv run start
```

### Frontend

```bash
# 1. Instalar dependencias de Node
npm install

# 2. Iniciar el servidor de desarrollo
npm run start
```

La app estará disponible en `http://localhost:3000` (frontend) y `http://localhost:3001` (API).

---

## Variables de entorno

| Variable | Descripción |
|---|---|
| `DATABASE_URL` | Cadena de conexión a PostgreSQL |
| `FLASK_APP_KEY` | Clave secreta para las sesiones de Flask |
| `CLOUDINARY_URL` | Credenciales de Cloudinary para subida de archivos |

Consulta `.env.example` para ver la lista completa.

---

## Base de datos — referencia rápida

| Motor | Formato de `DATABASE_URL` |
|---|---|
| SQLite | `sqlite:////test.db` |
| MySQL | `mysql://usuario:contraseña@localhost:puerto/db` |
| PostgreSQL | `postgres://usuario:contraseña@localhost:5432/db` |

Para cargar usuarios de prueba:
```bash
flask insert-test-users 5
```

---

## Deploy

El proyecto está listo para Render.com. Sigue la [guía de deploy de 4Geeks](https://4geeks.com/docs/start/deploy-to-render-com) o usa el `render.yaml` y el `Dockerfile.render` incluidos.

---

## Equipo

Proyecto final desarrollado en [4Geeks Academy](https://4geeksacademy.com) 🎓

| Nombre | Contribuciones |
|---|---|
| **Denn** | Modelo de base de datos · Lógica Pomodoro · Formularios de auth · Welcome page |
| **Juan** | *(rutas API / backend)* |
| **Messen** | *(componentes frontend / UI)* |

---

## Estructura del proyecto

```
pomify/
├── src/
│   ├── api/          # Rutas Flask, modelos, comandos
│   └── front/        # Componentes React, vistas, estilos
├── migrations/       # Migraciones de base de datos (Alembic)
├── public/           # Archivos estáticos
├── .env.example
├── Pipfile
├── package.json
└── render.yaml
```

---

## Licencia

ISC — libre para hacer fork y adaptar.

---

*Hecho con 🍅 y demasiado café por Juan, Messen y Denn.*