"use client";

import React from "react";

export default function NosotrosPage() {
  return (
    <div style={{ maxWidth: "1200px", margin: "0 auto", padding: "12px 0 24px" }}>
      {/* Hero Section */}
      <section className="hero-banner" style={{ backgroundImage: "url('/images/laboratorio-bg.png')" }}>
        <div className="hero-banner-content">
          <p className="section-kicker" style={{ color: "#60a5fa", fontWeight: 800, marginBottom: "4px" }}>Facultad de Ingeniería en Sistemas, Electrónica e Industrial</p>
          <h1>Sobre Nosotros</h1>
          <p>Misión, visión y estructura organizativa de la Gestión de Inventarios de la FISEI.</p>
        </div>
      </section>

      {/* Grid: Mision & Vision */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "20px", marginBottom: "24px" }}>
        <article className="surface" style={{ padding: "28px" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "12px", marginBottom: "16px" }}>
            <div style={{
              width: "40px",
              height: "40px",
              borderRadius: "10px",
              backgroundColor: "#eff6ff",
              display: "grid",
              placeItems: "center",
              color: "#1e40af"
            }}>
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ width: "20px", height: "20px" }}>
                <path d="M12 22c5.523 0 10-4.477 10-10S17.523 2 12 2 2 6.477 2 12s4.477 10 10 10z" />
                <path d="M12 6v6l4 2" />
              </svg>
            </div>
            <h2 style={{ fontSize: "20px", fontWeight: 800, color: "#1e3a8a", margin: 0 }}>Nuestra Misión</h2>
          </div>
          <p style={{ color: "#475569", lineHeight: "1.7", fontSize: "14.5px" }}>
            Garantizar la administración eficiente, transparente y oportuna de los activos tecnológicos de la FISEI,
            facilitando el acceso a herramientas de vanguardia para docentes, estudiantes e investigadores. Nos comprometemos
            a mantener los laboratorios en óptimas condiciones operativas para potenciar el desarrollo académico y la
            innovación técnica de la facultad.
          </p>
        </article>

        <article className="surface" style={{ padding: "28px" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "12px", marginBottom: "16px" }}>
            <div style={{
              width: "40px",
              height: "40px",
              borderRadius: "10px",
              backgroundColor: "#eff6ff",
              display: "grid",
              placeItems: "center",
              color: "#1e40af"
            }}>
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ width: "20px", height: "20px" }}>
                <path d="M2 12h20M12 2v20" />
                <circle cx="12" cy="12" r="10" />
              </svg>
            </div>
            <h2 style={{ fontSize: "20px", fontWeight: 800, color: "#1e3a8a", margin: 0 }}>Nuestra Visión</h2>
          </div>
          <p style={{ color: "#475569", lineHeight: "1.7", fontSize: "14.5px" }}>
            Ser reconocidos como un modelo de gestión y control tecnológico dentro de la Universidad Técnica de Ambato,
            caracterizado por la digitalización integral de procesos, sustentabilidad y vinculación activa con la industria.
            Buscamos proveer un ecosistema de hardware y software altamente escalable y adaptado a las demandas del futuro profesional.
          </p>
        </article>
      </div>

      {/* Organigrama / Structure & Contacts */}
      <div style={{ display: "grid", gridTemplateColumns: "2fr 1fr", gap: "20px" }}>
        {/* Organigrama */}
        <article className="surface" style={{ padding: "28px" }}>
          <h2 style={{ fontSize: "20px", fontWeight: 800, color: "#1e3a8a", marginBottom: "20px" }}>Estructura Organizativa</h2>
          <div style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            gap: "16px",
            background: "#f8fafc",
            padding: "24px",
            borderRadius: "12px",
            border: "1px solid #e2e8f0"
          }}>
            {/* Level 1 */}
            <div style={{
              background: "#1e40af",
              color: "#ffffff",
              padding: "10px 20px",
              borderRadius: "8px",
              fontWeight: 700,
              fontSize: "14px",
              boxShadow: "0 4px 6px rgba(30, 64, 175, 0.2)",
              textAlign: "center",
              width: "240px"
            }}>
              Decanato FISEI
            </div>

            {/* Link Line */}
            <div style={{ width: "2px", height: "20px", background: "#cbd5e1" }}></div>

            {/* Level 2 */}
            <div style={{
              background: "#0f172a",
              color: "#ffffff",
              padding: "10px 20px",
              borderRadius: "8px",
              fontWeight: 700,
              fontSize: "14px",
              boxShadow: "0 4px 6px rgba(15, 23, 42, 0.2)",
              textAlign: "center",
              width: "240px"
            }}>
              Coordinación de Laboratorios
            </div>

            {/* Link Line */}
            <div style={{ width: "2px", height: "20px", background: "#cbd5e1" }}></div>

            {/* Level 3: Children */}
            <div style={{ display: "flex", gap: "20px", width: "100%", justifyContent: "center" }}>
              <div style={{
                background: "#ffffff",
                border: "1px solid #cbd5e1",
                color: "#1e293b",
                padding: "8px 16px",
                borderRadius: "8px",
                fontWeight: 600,
                fontSize: "13px",
                textAlign: "center",
                flex: 1
              }}>
                Administración de Inventarios
              </div>
              <div style={{
                background: "#ffffff",
                border: "1px solid #cbd5e1",
                color: "#1e293b",
                padding: "8px 16px",
                borderRadius: "8px",
                fontWeight: 600,
                fontSize: "13px",
                textAlign: "center",
                flex: 1
              }}>
                Soporte Técnico & Mantenimiento
              </div>
            </div>
          </div>
        </article>

        {/* Contact info */}
        <article className="surface" style={{ padding: "28px" }}>
          <h2 style={{ fontSize: "20px", fontWeight: 800, color: "#1e3a8a", marginBottom: "20px" }}>Contacto Técnico</h2>
          <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
            <div style={{ display: "flex", gap: "12px" }}>
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ width: "20px", height: "20px", color: "#1e40af", flexShrink: 0 }}>
                <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" />
                <polyline points="22,6 12,13 2,6" />
              </svg>
              <div>
                <strong style={{ display: "block", fontSize: "14px", color: "#0f172a" }}>Correo de Soporte</strong>
                <span style={{ fontSize: "13.5px", color: "#475569" }}>soporte.fisei@uta.edu.ec</span>
              </div>
            </div>

            <div style={{ display: "flex", gap: "12px" }}>
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ width: "20px", height: "20px", color: "#1e40af", flexShrink: 0 }}>
                <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z" />
              </svg>
              <div>
                <strong style={{ display: "block", fontSize: "14px", color: "#0f172a" }}>Teléfono Interno</strong>
                <span style={{ fontSize: "13.5px", color: "#475569" }}>(03) 2411540 Ext. 102</span>
              </div>
            </div>

            <div style={{ display: "flex", gap: "12px" }}>
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ width: "20px", height: "20px", color: "#1e40af", flexShrink: 0 }}>
                <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
                <circle cx="12" cy="10" r="3" />
              </svg>
              <div>
                <strong style={{ display: "block", fontSize: "14px", color: "#0f172a" }}>Ubicación</strong>
                <span style={{ fontSize: "13.5px", color: "#475569" }}>Campus Huachi, Bloque Académico 2</span>
              </div>
            </div>
          </div>
        </article>
      </div>
    </div>
  );
}
