import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

interface ClauseData {
  clause_number: string;
  title: string;
  evidenceCount: number;
  documentCount: number;
  status: "compliant" | "gap";
}

interface AuditTrailEntry {
  action_type: string;
  user_email: string | null;
  created_at: string;
  details: Record<string, unknown> | null;
  clause_number?: string;
}

interface ReportData {
  clauses: ClauseData[];
  stats: {
    total: number;
    compliant: number;
    nonCompliant: number;
    percentage: number;
  };
  auditTrail: AuditTrailEntry[];
  risks: {
    open: number;
    high: number;
    mitigating: number;
    closed: number;
  };
  ncs: {
    open: number;
    investigating: number;
    closed: number;
    overdue: number;
  };
  capas: {
    open: number;
    inProgress: number;
    closed: number;
  };
  training: {
    completed: number;
    overdue: number;
    inProgress: number;
  };
}

export function generateCompliancePdf(data: ReportData) {
  const doc = new jsPDF();
  const pageWidth = doc.internal.pageSize.getWidth();
  let y = 20;

  // Title
  doc.setFontSize(22);
  doc.setTextColor(30, 41, 59);
  doc.text("ISO 9001:2015 Compliance Report", pageWidth / 2, y, { align: "center" });
  y += 10;

  doc.setFontSize(10);
  doc.setTextColor(100, 116, 139);
  doc.text(`Generated: ${new Date().toLocaleDateString()} ${new Date().toLocaleTimeString()}`, pageWidth / 2, y, { align: "center" });
  y += 15;

  // Overall Score
  doc.setFontSize(14);
  doc.setTextColor(30, 41, 59);
  doc.text("Overall Compliance Score", 14, y);
  y += 8;

  const scoreColor = data.stats.percentage >= 80 ? [22, 163, 74] : data.stats.percentage >= 50 ? [202, 138, 4] : [220, 38, 38];
  doc.setFontSize(36);
  doc.setTextColor(scoreColor[0], scoreColor[1], scoreColor[2]);
  doc.text(`${data.stats.percentage}%`, 14, y + 10);

  doc.setFontSize(10);
  doc.setTextColor(100, 116, 139);
  doc.text(`${data.stats.compliant} of ${data.stats.total} clauses compliant | ${data.stats.nonCompliant} gaps identified`, 60, y + 5);
  y += 25;

  // Section 1: Clause Coverage
  doc.setFontSize(14);
  doc.setTextColor(30, 41, 59);
  doc.text("1. Clause Coverage Summary", 14, y);
  y += 5;

  const clauseRows = data.clauses.map((c) => [
    c.clause_number,
    c.title,
    c.evidenceCount.toString(),
    c.documentCount.toString(),
    c.status === "compliant" ? "✓ Compliant" : "✗ Gap",
  ]);

  autoTable(doc, {
    startY: y,
    head: [["Clause", "Title", "Evidence", "Documents", "Status"]],
    body: clauseRows,
    styles: { fontSize: 8, cellPadding: 3 },
    headStyles: { fillColor: [51, 65, 85], textColor: 255 },
    columnStyles: {
      0: { cellWidth: 20 },
      4: { cellWidth: 25 },
    },
    didParseCell: (data) => {
      if (data.column.index === 4 && data.section === "body") {
        const val = data.cell.raw as string;
        if (val.includes("Gap")) {
          data.cell.styles.textColor = [220, 38, 38];
          data.cell.styles.fontStyle = "bold";
        } else {
          data.cell.styles.textColor = [22, 163, 74];
        }
      }
    },
  });

  y = (doc as any).lastAutoTable.finalY + 10;

  // Section 2: Gap Analysis
  const gaps = data.clauses.filter((c) => c.status === "gap");
  if (y > 250) { doc.addPage(); y = 20; }

  doc.setFontSize(14);
  doc.setTextColor(30, 41, 59);
  doc.text("2. Gap Analysis", 14, y);
  y += 5;

  if (gaps.length === 0) {
    doc.setFontSize(10);
    doc.setTextColor(22, 163, 74);
    doc.text("No compliance gaps detected. All clauses have supporting evidence.", 14, y + 5);
    y += 15;
  } else {
    autoTable(doc, {
      startY: y,
      head: [["Clause", "Title", "Missing"]],
      body: gaps.map((g) => [
        g.clause_number,
        g.title,
        [
          g.evidenceCount === 0 ? "No evidence files" : "",
          g.documentCount === 0 ? "No linked documents" : "",
        ].filter(Boolean).join(", "),
      ]),
      styles: { fontSize: 8, cellPadding: 3 },
      headStyles: { fillColor: [220, 38, 38], textColor: 255 },
    });
    y = (doc as any).lastAutoTable.finalY + 10;
  }

  // Section 3: Risk & NC Summary
  if (y > 230) { doc.addPage(); y = 20; }

  doc.setFontSize(14);
  doc.setTextColor(30, 41, 59);
  doc.text("3. Risk & Nonconformity Summary", 14, y);
  y += 5;

  autoTable(doc, {
    startY: y,
    head: [["Category", "Open", "In Progress", "Closed", "Notes"]],
    body: [
      ["Risks", data.risks.open.toString(), data.risks.mitigating.toString(), data.risks.closed.toString(), `${data.risks.high} high priority`],
      ["Nonconformities", data.ncs.open.toString(), data.ncs.investigating.toString(), data.ncs.closed.toString(), `${data.ncs.overdue} overdue`],
      ["CAPAs", data.capas.open.toString(), data.capas.inProgress.toString(), data.capas.closed.toString(), ""],
      ["Training", data.training.inProgress.toString(), "", data.training.completed.toString(), `${data.training.overdue} overdue`],
    ],
    styles: { fontSize: 8, cellPadding: 3 },
    headStyles: { fillColor: [51, 65, 85], textColor: 255 },
  });

  y = (doc as any).lastAutoTable.finalY + 10;

  // Section 4: Recent Audit Trail
  if (y > 230) { doc.addPage(); y = 20; }

  doc.setFontSize(14);
  doc.setTextColor(30, 41, 59);
  doc.text("4. Recent Audit Trail", 14, y);
  y += 5;

  const recentTrail = data.auditTrail.slice(0, 30);
  if (recentTrail.length > 0) {
    autoTable(doc, {
      startY: y,
      head: [["Date", "Clause", "Action", "User", "Details"]],
      body: recentTrail.map((entry) => [
        new Date(entry.created_at).toLocaleDateString(),
        entry.clause_number || "-",
        entry.action_type.replace(/_/g, " "),
        entry.user_email || "System",
        entry.details ? (entry.details as any).file_name || (entry.details as any).document_title || "-" : "-",
      ]),
      styles: { fontSize: 7, cellPadding: 2 },
      headStyles: { fillColor: [51, 65, 85], textColor: 255 },
    });
  } else {
    doc.setFontSize(10);
    doc.setTextColor(100, 116, 139);
    doc.text("No audit trail entries found.", 14, y + 5);
  }

  // Footer
  const pageCount = doc.getNumberOfPages();
  for (let i = 1; i <= pageCount; i++) {
    doc.setPage(i);
    doc.setFontSize(8);
    doc.setTextColor(150);
    doc.text(`Page ${i} of ${pageCount}`, pageWidth / 2, doc.internal.pageSize.getHeight() - 10, { align: "center" });
    doc.text("ISO Compliance Management System", 14, doc.internal.pageSize.getHeight() - 10);
  }

  doc.save(`compliance-report-${new Date().toISOString().split("T")[0]}.pdf`);
}
