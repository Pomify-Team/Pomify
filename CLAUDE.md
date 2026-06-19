# Pomify - Instrucciones para Claude

## Gestor de paquetes
- Usar siempre **pnpm** en lugar de npm para instalar dependencias frontend
- Comando de instalación: `pnpm install`
- Nunca usar `npm install` salvo que se indique explícitamente

## Comandos para arrancar el proyecto
- **Backend:** `pipenv run start`
- **Frontend:** `pnpm run start`

## Stack
- Frontend: React + Vite
- Backend: Python Flask con pipenv
- Base de datos: PostgreSQL con migraciones Flask-Migrate
