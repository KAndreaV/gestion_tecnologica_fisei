# Gestión Tecnológica FISEI

Proyecto académico: plantilla inicial para la gestión tecnológica de la facultad.

**Descripción**: Repositorio monorepo con frontend (Next.js) y backend (NestJS). Contiene la estructura base, scripts de arranque y documentación para colaboradores.

**Estado**: Plantilla inicial — lista para configurar base de datos y desarrollar funcionalidades.

**Estructura del repositorio**

```
gestion_tecnologica_fisei/
├── backend/      # API (NestJS)
├── frontend/     # Web (Next.js)
├── README.md
└── .gitignore
```

**Tecnologías principales**

- Frontend: Next.js (TypeScript, App Router, Tailwind opcional)
- Backend: NestJS (TypeScript)
- Control de versiones: Git

**Requisitos**

- Node.js (14+ recomendado)
- npm o yarn
- Git (para comandos listos en Git Bash)

**Instalación rápida (Git Bash)**

1) Clonar/repositorio nuevo y entrar en la carpeta

```bash
mkdir gestion_tecnologica_fisei
cd gestion_tecnologica_fisei
```

2) Inicializar Git y crear archivos/estructuras

```bash
git init
touch README.md
mkdir backend frontend
ls
```

3) Crear frontend (Next.js)

```bash
npx create-next-app@latest frontend
```

Seleccionar: TypeScript → YES, Tailwind → YES, App Router → YES

4) Crear backend (NestJS)

```bash
npm install -g @nestjs/cli
nest new backend
```

Elegir: `npm`

5) Añadir `.gitignore`

```bash
touch .gitignore
```

Ejemplo de contenido:

```
node_modules/
.next/
dist/
.env
```

6) Preparar y grabar commit con fecha personalizada (Git Bash)

```bash
git add .
GIT_AUTHOR_DATE="2026-04-17T12:34:00" GIT_COMMITTER_DATE="2026-04-17T12:34:00" git commit -m "estructura inicial del proyecto gestion tecnologica fisei"
```

7) Subir a GitHub (después de crear el repo remoto)

```bash
git branch -M main
git remote add origin https://github.com/TU-USUARIO/gestion_tecnologica_fisei.git
git push -u origin main
```

**Contribuir**

Lee [CONTRIBUTORS.md](CONTRIBUTORS.md) para normas de contribución y formato de aporte.

**Buenas prácticas**

- No falsificar fechas en commits para proyectos reales; solo para ejercicio académico.
- Crear ramas por característica: `feature/<nombre>` y Pull Requests hacia `main`.

**Siguientes pasos recomendados**

- Diseñar el esquema de base de datos (Oracle) y añadir DDL en `database/`.
- Implementar autenticación básica en `backend` (usuarios y login).

---

Si quieres, puedo generar el script DDL de Oracle o empezar el backend con usuarios y login — dime cuál prefieres.

