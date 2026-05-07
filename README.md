# 🧠 Sistema de Gestión de Inventario Tecnológico FISEI

Sistema web para la gestión de inventario, préstamos y mantenimiento de equipos tecnológicos de la FISEI, implementado con arquitectura Onion, backend en NestJS, frontend en Next.js y base de datos Oracle.

---

## 🚀 Descripción del Proyecto

Este sistema permite administrar equipos tecnológicos de laboratorios, aulas y oficinas dentro de la FISEI. Incluye funcionalidades como:

- Registro de equipos tecnológicos
- Gestión de usuarios y roles
- Control de préstamos y devoluciones
- Registro de mantenimientos preventivos y correctivos
- Trazabilidad y auditoría de acciones
- Notificaciones de préstamos y eventos

---

## 🧱 Arquitectura

El proyecto está dividido en dos módulos principales:
📁 proyecto/
├── backend/ (NestJS + Oracle)
├── frontend/ (Next.js)


---

## 🧅 Backend (Arquitectura Onion)

### 📁 Estructura del proyecto

```bash
src/
│
├── domain/                # Núcleo del negocio
│   ├── entities/
│   ├── value-objects/
│   ├── interfaces/
│   └── enums/
│
├── application/           # Casos de uso
│   ├── use-cases/
│   ├── dtos/
│   └── services/
│
├── infrastructure/        # Base de datos Oracle + repositorios
│   ├── database/
│   ├── repositories/
│   ├── orm/
│   ├── security/
│   └── external-services/
│
├── presentation/          # API REST (Controllers)
│   ├── controllers/
│   ├── modules/
│   ├── guards/
│   └── interceptors/
│
├── shared/                # Utilidades comunes
│   ├── exceptions/
│   ├── utils/
│   └── constants/
│
├── app.module.ts
└── main.ts
```
---

# 🛠️ Tecnologías utilizadas

## Backend
- NestJS
- TypeScript
- Oracle Database
- oracledb
- JWT Authentication
- Class Validator

## Frontend
- Next.js
- React
- TypeScript
- Tailwind CSS

---

# ⚙️ Variables de entorno (Backend)

Crear archivo `.env` dentro de `/backend`:
 PORT=3000

ORACLE_USER=example
ORACLE_PASSWORD=example

ORACLE_CLIENT_LIB_DIR=C:\instantclient_23_0

ORACLE_CONNECTION_STRING=localhost:1521/xe


---

# 📦 Instalación del Proyecto

## 1. Clonar repositorio

git clone https://github.com/tu-usuario/tu-repo.git
cd proyecto


## 2. Backend (NestJS)
cd backend
npm install
npm run start:dev

Servidor backend:
http://localhost:3000

## 3. Frontend (Next.js)
cd frontendnpm installnpm run dev
Frontend:
http://localhost:3001

## 4. Base de datos (Oracle)
## Requisitos:
Oracle XE instalado
Oracle Instant Client configurado


## Autenticación
El sistema usa JWT:

Login de usuarios

## Roles:
Administrador
Docente
Estudiante

## Protección de endpoints

## 📡 API Backend (Ejemplos)
GET    /itemsPOST   /itemsGET    /usersPOST   /auth/loginGET    /loans

## 🧪 Estado del Proyecto
🚧 Proyecto en desarrollo
## Módulos actuales:
Inventario (Items)
Usuarios
Préstamos
Mantenimientos
Seguridad JWT
Conexión Oracle


## 📌 Funcionalidades principales


Gestión de inventario tecnológico
Control de préstamos de equipos
Registro de mantenimientos
Administración de usuarios
Auditoría de acciones
Reportes del sistema


## 👨‍💻 Autor
Proyecto académico: Andrea Vásquez
Universidad Técnica de Ambato - FISEI
Ingeniería en Software

## 📄 Licencia
Uso académico y educativo.
