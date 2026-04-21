# Backend FISEI

Backend NestJS organizado con una arquitectura Clean Onion mínima.

## Capas

- `src/application`: casos de uso y modelos de aplicación.
- `src/oracle`: infraestructura de acceso a Oracle.
- `src/app.controller.ts`: presentación HTTP.

## Flujo

1. El controller recibe la petición.
2. Llama al caso de uso de aplicación.
3. El caso de uso usa el adaptador Oracle cuando necesita datos.

## Variables de entorno

Usa un archivo `.env` basado en `.env.example`:

```bash
PORT=3000
ORACLE_USER=gestionfisei
ORACLE_PASSWORD=gestionfisei
ORACLE_CONNECTION_STRING=localhost/XEPDB1
```

## Scripts

```bash
npm install
npm run start:dev
npm run build
npm test -- --runInBand
```

## Endpoints

- `GET /` - saludo base.
- `GET /health` - estado general de la aplicación.
- `GET /oracle/ping` - comprobación de conexión Oracle.

## Pruebas SQL

Ejecuta [database/pruebas_sql.sql](../database/pruebas_sql.sql) después de crear las tablas para cargar datos de evidencia y validar relaciones.
