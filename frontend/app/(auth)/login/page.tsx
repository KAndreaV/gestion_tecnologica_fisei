import type { Metadata } from "next";
import { LoginForm } from "@/components/auth/LoginForm";

export const metadata: Metadata = {
  title: "Iniciar sesión | Gestión Tecnológica FISEI",
  description: "Accede al sistema de gestión de laboratorios y equipos tecnológicos de FISEI.",
};

export default function LoginPage() {
  return (
    <main className="auth-wrap">
      <section className="auth-card" aria-label="Pantalla de inicio de sesión">
        {/* Decorative element */}
        <div className="floating-diamond" aria-hidden="true">◆</div>

        {/* Left panel – branding */}
        <aside className="auth-left">
          <div className="brand-row">
            <div className="brand-icon" aria-hidden="true">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" width="22" height="22">
                <path d="M4 8.5 12 4l8 4.5v7L12 20l-8-4.5z" />
                <path d="M12 4v16" />
              </svg>
            </div>
            <div>
              <h2 style={{ fontFamily: "var(--font-cinzel, 'Cinzel', serif)", fontSize: "16px", letterSpacing: "0.8px", color: "var(--gold-300)", margin: 0 }}>
                Gestión FISEI
              </h2>
              <p style={{ fontSize: "11px", color: "#d5ddee", opacity: 0.82, margin: "2px 0 0" }}>
                Sistema web administrativo
              </p>
            </div>
          </div>

          <div className="welcome">
            <h1>Control centralizado de laboratorios, equipos y usuarios</h1>
            <p>
              Accede al sistema para administrar inventario, préstamos, reportes
              y trazabilidad con una interfaz profesional.
            </p>
          </div>

          <div className="highlights">
            <span className="chip">
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ marginRight: "6px" }} aria-hidden="true">
                <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
                <path d="M7 11V7a5 5 0 0 1 10 0v4" />
              </svg>
              Acceso por roles
            </span>
            <span className="chip">
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ marginRight: "6px" }} aria-hidden="true">
                <polyline points="22 12 18 12 15 21 9 3 6 12 2 12" />
              </svg>
              Auditoría y trazabilidad
            </span>
            <span className="chip">
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ marginRight: "6px" }} aria-hidden="true">
                <rect x="3" y="3" width="7" height="7" /><rect x="14" y="3" width="7" height="7" />
                <rect x="14" y="14" width="7" height="7" /><rect x="3" y="14" width="7" height="7" />
              </svg>
              Dashboard ejecutivo
            </span>
          </div>
        </aside>

        {/* Right panel – form */}
        <section className="auth-right" aria-label="Formulario de inicio de sesión">
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