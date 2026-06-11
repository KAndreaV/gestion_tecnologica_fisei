import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

export function generateReportPDF(
  reportType: "equipos" | "laboratorios" | "usuarios" | "mantenimientos",
  data: any[],
  authorName: string
) {
  const doc = new jsPDF();
  const today = new Date().toLocaleString("es-EC");

  // Colors & Brand Settings
  const primaryColor: [number, number, number] = [11, 23, 48]; // Dark Slate Blue #0b1730
  const accentColor: [number, number, number] = [212, 175, 55]; // Gold #d4af37

  // Add Brand Header Banner
  doc.setFillColor(primaryColor[0], primaryColor[1], primaryColor[2]);
  doc.rect(0, 0, 210, 32, "F");

  // Accent Line
  doc.setFillColor(accentColor[0], accentColor[1], accentColor[2]);
  doc.rect(0, 32, 210, 2, "F");

  // Title inside Banner
  doc.setTextColor(255, 255, 255);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(14);
  doc.text("UNIVERSIDAD TÉCNICA DE AMBATO", 14, 13);
  doc.setFont("helvetica", "normal");
  doc.setFontSize(10);
  doc.text("Facultad de Ingeniería en Sistemas, Electrónica e Industrial (FISEI)", 14, 20);
  doc.text("Sistema Web de Gestión de Laboratorios y Equipamiento Tecnológico", 14, 26);

  // Metadata block (below header)
  doc.setTextColor(11, 23, 48);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(12);

  let reportTitle = "";
  let headers: string[] = [];
  let rows: any[][] = [];

  if (reportType === "equipos") {
    reportTitle = "INFORME CONSOLIDADO DE INVENTARIO TECNOLÓGICO";
    headers = ["ID", "Nombre Equipo", "Marca", "Modelo", "Nº Serie", "Stock", "Valor", "Categoría"];
    rows = data.map((item) => [
      `#${item.idArt || ""}`,
      item.nomArt || "",
      item.marArt || "—",
      item.modArt || "—",
      item.serArt || "—",
      `${item.canArt || 0} u.`,
      `$${Number(item.valArt || 0).toFixed(2)}`,
      item.idCat === 1 ? "CÓMPUTO" : item.idCat === 2 ? "REDES" : `Cat #${item.idCat}`,
    ]);
  } else if (reportType === "laboratorios") {
    reportTitle = "INFORME DE DISPONIBILIDAD DE LABORATORIOS Y ESPACIOS";
    headers = ["ID", "Nombre Laboratorio", "Descripción / Ubicación", "Departamento"];
    rows = data.map((item) => [
      `#${item.idUbi || ""}`,
      item.nomUbi || "",
      item.desUbi || "—",
      item.idDep === 1 ? "SISTEMAS" : item.idDep === 2 ? "ELECTRÓNICA" : "INVESTIGACIÓN",
    ]);
  } else if (reportType === "usuarios") {
    reportTitle = "INFORME GENERAL DE USUARIOS Y PERFILES DE ACCESO";
    headers = ["ID", "Nombre Completo", "Correo Electrónico", "Nombre de Usuario", "Rol del Sistema", "Estado"];
    rows = data.map((item) => [
      `#${item.idUsr || ""}`,
      `${item.nomUsr || ""} ${item.apeUsr || ""}`,
      item.corUsr || "",
      `@${item.usuLogin || ""}`,
      item.idRol === 1 ? "Administrador" : item.idRol === 2 ? "Docente" : item.idRol === 3 ? "Estudiante" : "Técnico",
      item.estUsr === 1 ? "Activo" : "Inactivo",
    ]);
  } else if (reportType === "mantenimientos") {
    reportTitle = "REPORTE DE MANTENIMIENTOS Y REVISIONES TÉCNICAS";
    headers = ["ID", "Descripción del Mantenimiento", "Tipo", "Nº Equipo (ID)", "Operador ID", "Fecha Inicio", "Observaciones"];
    rows = data.map((item) => [
      `#${item.idMan || ""}`,
      item.desMan || "",
      item.tipMan || "PREVENTIVO",
      `#${item.idArt || ""}`,
      item.idUsr ? `#${item.idUsr}` : "—",
      item.fecIni ? new Date(item.fecIni).toLocaleDateString("es-EC") : "—",
      item.obsMan || "Sin observaciones",
    ]);
  }

  // Draw Title
  doc.text(reportTitle, 14, 46);

  // Metadata lines
  doc.setFont("helvetica", "normal");
  doc.setFontSize(9);
  doc.setTextColor(100, 100, 100);
  doc.text(`Generado por: ${authorName}`, 14, 52);
  doc.text(`Fecha y Hora: ${today}`, 14, 57);
  doc.text("Estado del reporte: Consolidado y Oficial (Firmado Digitalmente)", 14, 62);

  // Divider
  doc.setDrawColor(200, 200, 200);
  doc.line(14, 66, 196, 66);

  // Draw Data Table using autoTable
  autoTable(doc, {
    startY: 70,
    head: [headers],
    body: rows,
    theme: "striped",
    headStyles: {
      fillColor: primaryColor,
      textColor: [255, 255, 255],
      fontSize: 9,
      fontStyle: "bold",
      halign: "left",
    },
    bodyStyles: {
      fontSize: 8,
      textColor: [50, 50, 50],
    },
    alternateRowStyles: {
      fillColor: [245, 247, 250],
    },
    margin: { left: 14, right: 14 },
    didDrawPage: (dataPage: any) => {
      // Footer on every page
      const pageCount = doc.getNumberOfPages();
      doc.setFont("helvetica", "normal");
      doc.setFontSize(8);
      doc.setTextColor(150, 150, 150);
      
      // Confidentiality disclaimer
      doc.text(
        "Este documento contiene información interna de la Universidad Técnica de Ambata (FISEI). Prohibida su divulgación parcial o total.",
        14,
        285
      );
      
      // Page numbering
      doc.text(
        `Página ${dataPage.pageNumber} de ${pageCount}`,
        196,
        285,
        { align: "right" }
      );
    },
  });

  // Save the PDF file
  const filename = `FISEI_${reportType}_report_${new Date().toISOString().split("T")[0]}.pdf`;
  doc.save(filename);
}
