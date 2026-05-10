# 🍅 Pomify

> A Pomodoro-based productivity web app — built with React + Flask as a final project for 4Geeks Academy.

---

## What is Pomify?

Pomify helps you work smarter using the [Pomodoro Technique](https://en.wikipedia.org/wiki/Pomodoro_Technique): focused work sessions followed by short breaks. Log in, start a timer, and build momentum — session by session.

---

## Tech Stack

| Layer | Tech |
|---|---|
| Frontend | React 18 · Vite · React Router DOM v6 |
| Animations | Motion · Lenis (smooth scroll) |
| Backend | Python · Flask · SQLAlchemy |
| Database | PostgreSQL |
| Auth | JWT (via Flask) |
| Storage | Cloudinary |
| Deploy | Render.com |
| Dev Env | GitHub Codespaces · Gitpod |

---

## Features

- ⏱ **Pomodoro timer** — configurable work/break cycles
- 🔐 **Authentication** — register, log in, and keep your sessions personal
- 📊 **Session tracking** — save and review your Pomodoro history
- 🎨 **Smooth UI** — animated transitions with Motion and Lenis
- ☁️ **Cloud-ready** — one-command deploy to Render.com

---

## Getting Started

### Prerequisites

- Python 3.10+
- Node.js 20+
- PostgreSQL (or use SQLite for local dev)
- Pipenv

### Backend

```bash
# 1. Install Python dependencies
pipenv install

# 2. Create your environment file
cp .env.example .env
# → Edit .env and set DATABASE_URL and other variables

# 3. Run migrations
pipenv run migrate
pipenv run upgrade

# 4. Start the backend
pipenv run start
```

### Frontend

```bash
# 1. Install Node dependencies
npm install

# 2. Start the dev server
npm run start
```

The app will be available at `http://localhost:3000` (frontend) and `http://localhost:3001` (API).

---

## Environment Variables

| Variable | Description |
|---|---|
| `DATABASE_URL` | PostgreSQL connection string |
| `FLASK_APP_KEY` | Secret key for Flask sessions |
| `CLOUDINARY_URL` | Cloudinary credentials for media uploads |

See `.env.example` for the full list.

---

## Database Quick Reference

| Engine | `DATABASE_URL` format |
|---|---|
| SQLite | `sqlite:////test.db` |
| MySQL | `mysql://user:pass@localhost:port/db` |
| PostgreSQL | `postgres://user:pass@localhost:5432/db` |

To seed test users:
```bash
flask insert-test-users 5
```

---

## Deployment

This project is Render.com-ready. Follow the [4Geeks deploy guide](https://4geeks.com/docs/start/deploy-to-render-com) or use the included `render.yaml` and `Dockerfile.render` for a one-click setup.

---

## Team

Built as a Final Project at [4Geeks Academy](https://4geeksacademy.com) 🎓

| Name | Contributions |
|---|---|
| **Denn** | Database model · Pomodoro logic · Auth forms · Welcome page |
| **Juan** | *(backend / API routes)* |
| **Messen** | *(frontend components / UI)* |

---

## Project Structure

```
pomify/
├── src/
│   ├── api/          # Flask routes, models, commands
│   └── front/        # React components, views, styles
├── migrations/       # Alembic DB migrations
├── public/           # Static assets
├── .env.example
├── Pipfile
├── package.json
└── render.yaml
```

---

## License

ISC — feel free to fork and adapt.

---

*Made with 🍅 and too much coffee by Juan, Messen, Denn*