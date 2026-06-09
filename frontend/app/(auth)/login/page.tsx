import { LoginForm } from "@/components/auth/LoginForm";

export default function LoginPage() {
  return (
<main className="auth-wrap">
        <section className="auth-card" aria-label="Pantalla de inicio de sesión">
        <div className="floating-diamond"></div>
        <aside className="auth-left">
          <div className="brand">
            <div className="brand-row">
              <div className="brand-icon" aria-hidden="true">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
                  <path d="M4 8.5 12 4l8 4.5v7L12 20l-8-4.5z" />
                  <path d="M12 4v16" />
                </svg>
              </div>
              <div>
                <h2>Gestión de Laboratorios</h2>
                <p>Sistema web administrativo</p>
              </div>
            </div>
          </div>

          <div className="welcome">
            <h1>Control centralizado de laboratorios, equipos y usuarios</h1>
            <p>
              Accede al sistema para administrar inventario, préstamos, reportes y trazabilidad con una interfaz profesional.
            </p>
          </div>

          <div className="highlights">
            <span className="chip">Acceso por roles</span>
            <span className="chip">Auditoría y trazabilidad</span>
            <span className="chip">Dashboard ejecutivo</span>
          </div>
        </aside>

        <section className="auth-right">
          <div>
            <p className="section-kicker">Acceso institucional</p>
            <h2>Iniciar sesión</h2>
            <p>Ingresa tus credenciales para continuar.</p>
          </div>

          <LoginForm />
        </section>
      </section>
    </main>
  );
}