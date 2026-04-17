# Contribuidores

Este archivo recoge a las personas que han contribuido al proyecto. Mantén el formato consistente y añade entradas mediante Pull Request.

Formato recomendado por contribuidor:

- Nombre completo — @usuarioGitHub — Rol(s) — correo opcional

Ejemplo:

- Juan Pérez — @juanperez — Desarrollador backend, DB — juan.perez@email.com

Cómo añadirte

1. Crea una rama nueva: `git checkout -b feature/add-contributor-<tu-nombre>`
2. Edita `CONTRIBUTORS.md` y añade tu entrada siguiendo el formato.
3. Haz commit y push:

```bash
git add CONTRIBUTORS.md
git commit -m "docs: añadir contribuidor Nombre Apellido"
git push origin feature/add-contributor-<tu-nombre>
```

4. Abre un Pull Request hacia `main` describiendo tu aportación.

Notas y normas

- Mantén la información profesional y verifica ortografía.
- No añadas datos personales sensibles (evita DNI, números privados).
- Si tu contribución es un código mínimo o parche, indica la PR/issue relacionada entre paréntesis.

Commit con fecha personalizada (solo para ejercicios académicos)

Si necesitas usar la fecha personalizada de commit en Git Bash (ej. para evidencias académicas), usa:

```bash
GIT_AUTHOR_DATE="2026-04-17T12:34:00" GIT_COMMITTER_DATE="2026-04-17T12:34:00" git commit -m "mensaje del commit"
```

Responsable del repositorio: equipo FISEI — coordinar cambios grandes vía issues.
