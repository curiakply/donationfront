import React, { useState, useEffect, useMemo, useCallback } from "react";
import { MaterialReactTable } from "material-react-table";
import axiosInstance from "../axiosConfig";
import {
  Button, TextField, Box, Typography, IconButton, Tooltip, Card, CardContent, Chip,
  CircularProgress, Snackbar, Alert, CssBaseline, MenuItem, Divider, Collapse,
} from "@mui/material";
import { styled } from "@mui/material/styles";
import {
  Refresh as RefreshIcon, FileDownload as FileDownloadIcon,
  Assessment as AssessmentIcon, FilterAlt as FilterIcon,
  ExpandMore as ExpandMoreIcon, ExpandLess as ExpandLessIcon,
  CurrencyRupee as RupeeIcon, Person as PersonIcon,
  Public as PublicIcon, VolunteerActivism as DonationIcon,
} from "@mui/icons-material";
import { jsPDF } from "jspdf";
import autoTable from "jspdf-autotable";
import * as XLSX from "xlsx-js-style";

// ─── Styled ───────────────────────────────────────────────────────────────────
const Page = styled(Box)(() => ({ backgroundColor: "#f8fafc", minHeight: "100vh", padding: 24 }));
const StyledCard = styled(Card)(() => ({ backgroundColor: "#fff", borderRadius: 16, boxShadow: "0 4px 6px -1px rgba(0,0,0,0.1), 0 2px 4px -1px rgba(0,0,0,0.06)", transition: "all 0.3s ease", "&:hover": { transform: "translateY(-4px)", boxShadow: "0 10px 15px -3px rgba(0,0,0,0.1)" } }));
const Content = styled(CardContent)(({ theme }) => ({ padding: theme.spacing(3) }));
const IconBox = styled(Box)(({ color }) => ({ width: 56, height: 56, borderRadius: 12, display: "flex", alignItems: "center", justifyContent: "center", background: `linear-gradient(135deg, ${color}20, ${color}40)`, color }));
const ChartCard = styled(Card)(({ theme }) => ({ backgroundColor: "#fff", borderRadius: 16, padding: theme.spacing(3), boxShadow: "0 4px 6px -1px rgba(0,0,0,0.1), 0 2px 4px -1px rgba(0,0,0,0.06)" }));
const GradientBtn = styled(Button)(() => ({ background: "linear-gradient(135deg, #1a237e, #0d47a1)", color: "#fff", borderRadius: 12, padding: "10px 24px", fontWeight: 600, textTransform: "none", "&:hover": { background: "linear-gradient(135deg, #0d47a1, #1a237e)" } }));
const Field = styled(TextField)(() => ({ "& .MuiOutlinedInput-root": { borderRadius: 12, "& fieldset": { borderColor: "#E2E8F0" }, "&:hover fieldset": { borderColor: "#0d47a1" }, "&.Mui-focused fieldset": { borderColor: "#1a237e" } } }));
const GradientText = ({ children, variant = "h5", sx = {} }) => (<Typography variant={variant} sx={{ fontWeight: 700, background: "linear-gradient(45deg, #1a237e, #0d47a1)", backgroundClip: "text", WebkitBackgroundClip: "text", color: "transparent", ...sx }}>{children}</Typography>);

const StatBox = styled(Box)(() => ({
  padding: "20px 24px", borderRadius: 16, backgroundColor: "#fff",
  boxShadow: "0 4px 6px -1px rgba(0,0,0,0.1), 0 2px 4px -1px rgba(0,0,0,0.06)",
  display: "flex", alignItems: "center", gap: 16, flex: 1, minWidth: 180,
  transition: "all 0.3s ease", "&:hover": { transform: "translateY(-4px)", boxShadow: "0 10px 15px -3px rgba(0,0,0,0.1)" },
}));

const StatValue = styled(Typography)(() => ({
  fontSize: "1.6rem", fontWeight: 700, lineHeight: 1.2,
  background: "linear-gradient(45deg, #1a237e, #0d47a1)",
  backgroundClip: "text", WebkitBackgroundClip: "text", color: "transparent",
}));

const fmtINR = (n) => new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR", maximumFractionDigits: 0 }).format(n || 0);
const fmtCurrency = (n, c) => new Intl.NumberFormat("en-US", { style: "currency", currency: c || "USD", maximumFractionDigits: 2 }).format(n || 0);
const fmtINR_PDF = (n) => "INR " + Number(n || 0).toLocaleString("en-IN", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
const fmtCurrency_PDF = (n, c) => (c || "USD") + " " + Number(n || 0).toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 });

// ─── Status History Helper ────────────────────────────────────────────────────
const wasActiveDuring = (priest, fromStr, toStr) => {
  // No date filter → just check current status
  if (!fromStr && !toStr) {
    return !priest.status || priest.status === "active";
  }

  const fromDate = fromStr ? fromStr.substring(0, 10) : "1900-01-01";

  // ── Check 1: Current status ──
  if (priest.status && priest.status !== "active") {
    const inactiveFrom = priest.statusDate
      ? priest.statusDate.substring(0, 10)
      : "1900-01-01";
    // Currently inactive from this date onwards (no end)
    if (inactiveFrom <= fromDate) return false;
  }

  // ── Check 2: Past inactive periods from history ──
  const history = priest.statusHistory || [];
  for (const entry of history) {
    if (entry.status === "active") continue;

    const start = entry.date
      ? new Date(entry.date).toISOString().substring(0, 10)
      : "1900-01-01";
    const end = entry.changedAt
      ? new Date(entry.changedAt).toISOString().substring(0, 10)
      : start;

    // Was inactive on the report's from-date?
    if (start <= fromDate && end > fromDate) {
      return false;
    }
  }

  return true;
};
// ─── Component ────────────────────────────────────────────────────────────────

const DonationReport = () => {
  const [report, setReport] = useState([]);
  const [countries, setCountries] = useState([]);
  const [summary, setSummary] = useState(null);
  const [loading, setLoading] = useState(false);
  const [msg, setMsg] = useState(null);
  const [filtersOpen, setFiltersOpen] = useState(true);
  const [fromDate, setFromDate] = useState("");
  const [toDate, setToDate] = useState("");
  const [country, setCountry] = useState("");

  useEffect(() => { fetch(); }, []);

  const fetch = useCallback(async () => {
    setLoading(true);
    try {
      const params = {};
      if (fromDate) params.from = fromDate;
      if (toDate) params.to = toDate;
      if (country) params.country = country;
      const res = await axiosInstance.get("/donation-report", { params });

      // ── Filter: only priests who were active during the entire report period ──
      const filtered = (res.data.report || []).filter((r) =>
        wasActiveDuring(r.priest, fromDate, toDate)
      );
      setReport(filtered);
      setCountries(res.data.countries || []);

      const contributingPriests = filtered.filter((r) => !r.isNil).length;
      setSummary({
        totalPriests: filtered.length,
        contributingPriests,
        nilPriests: filtered.filter((r) => r.isNil).length,
        grandTotalINR: filtered.reduce((s, r) => s + (r.totalINR || 0), 0),
        grandTotalDonations: filtered.reduce((s, r) => s + (r.donationCount || 0), 0),
      });
    } catch { setMsg({ type: "error", text: "Failed to generate report" }); }
    finally { setLoading(false); }
  }, [fromDate, toDate, country]);

  const exportPDF = () => {
    if (!report.length) return;
    const doc = new jsPDF({ orientation: "landscape" });
    const pageW = doc.internal.pageSize.getWidth();
    const margin = 14;
    const tableW = pageW - margin * 2;

    // Header
    doc.setFontSize(16); doc.setFont("helvetica", "bold"); doc.text("Donation Report", margin, 18);
    doc.setFontSize(9); doc.setFont("helvetica", "normal");
    const parts = [];
    if (fromDate) parts.push(`From: ${new Date(fromDate).toLocaleDateString()}`);
    if (toDate) parts.push(`To: ${new Date(toDate).toLocaleDateString()}`);
    if (country) parts.push(`Country: ${country}`);
    doc.text(parts.length ? parts.join("  |  ") : "All records", margin, 25);
    if (summary) doc.text(`Priests: ${summary.totalPriests}  |  Contributors: ${summary.contributingPriests}  |  NIL: ${summary.nilPriests}  |  Total: ${fmtINR_PDF(summary.grandTotalINR)}`, margin, 31);

    // Column widths (proportions of tableW)
    const colRatios = [0.06, 0.18, 0.12, 0.24, 0.1, 0.12, 0.18];
    const colW = colRatios.map((r) => r * tableW);
    const rowH = 8;
    const pad = 3;
    let curY = 36;

    const drawCell = (x, y, w, h, text, opts = {}) => {
      doc.setDrawColor(0, 0, 0);
      doc.setLineWidth(0.2);
      doc.rect(x, y, w, h);
      if (text) {
        doc.setFontSize(opts.fontSize || 8);
        doc.setFont("helvetica", opts.bold ? "bold" : "normal");
        doc.setTextColor(opts.textColor || 0);
        const textY = y + h / 2 + 3;
        if (opts.align === "center") {
          doc.text(String(text), x + w / 2, textY, { align: "center" });
        } else if (opts.align === "right") {
          doc.text(String(text), x + w - pad, textY, { align: "right" });
        } else {
          doc.text(String(text), x + pad, textY);
        }
      }
    };

    const drawHeaderRow = () => {
      const headers = ["Sl No", "Priest Name", "Date", "Purpose", "Currency", "Amount", "Total"];
      let x = margin;
      headers.forEach((h, ci) => {
        doc.setFillColor(26, 35, 126);
        doc.rect(x, curY, colW[ci], rowH, "F");
        doc.setDrawColor(0); doc.setLineWidth(0.2);
        doc.rect(x, curY, colW[ci], rowH);
        doc.setFontSize(8); doc.setFont("helvetica", "bold"); doc.setTextColor(255);
        doc.text(h, x + pad, curY + rowH / 2 + 3);
        x += colW[ci];
      });
      curY += rowH;
    };

    const checkPageBreak = (neededH) => {
      const pageH = doc.internal.pageSize.getHeight();
      if (curY + neededH > pageH - 10) {
        doc.addPage();
        curY = 14;
        drawHeaderRow();
      }
    };

    // Draw table header
    drawHeaderRow();
    doc.setTextColor(0);

    // Draw rows per priest with merged Sl No, Priest Name, Total
    report.forEach((r, i) => {
      const donations = (!r.isNil && r.donations && r.donations.length > 0) ? r.donations : [];
      const rowCount = Math.max(donations.length, 1);

      // Compute total string
      const totalParts = [];
      if (r.currencies && r.currencies.length) {
        r.currencies.forEach((c) => {
          const sum = donations.filter((d) => d.currency === c).reduce((s, d) => s + d.amount, 0);
          if (sum > 0) totalParts.push(`${c} ${Number(sum).toLocaleString("en-IN", { minimumFractionDigits: 0, maximumFractionDigits: 2 })}`);
        });
      }
      const totalStr = totalParts.length ? totalParts.join(", ") : (r.isNil ? "NIL" : "—");

      const groupH = rowCount * rowH;
      checkPageBreak(groupH);
      const groupStartY = curY;

      // Draw individual donation rows (columns 2-5: Date, Purpose, Currency, Amount)
      if (donations.length === 0) {
        // NIL priest — draw empty middle cells
        let x = margin + colW[0] + colW[1];
        for (let ci = 2; ci <= 5; ci++) {
          drawCell(x, curY, colW[ci], rowH, "");
          x += colW[ci];
        }
        curY += rowH;
      } else {
        donations.forEach((d) => {
          let x = margin + colW[0] + colW[1];
          const vals = [
            d.date ? new Date(d.date).toLocaleDateString("en-GB") : "",
            d.purpose || "",
            d.currency || "",
            d.amount ? Number(d.amount).toLocaleString("en-IN") : "",
          ];
          const aligns = ["left", "left", "center", "right"];
          vals.forEach((v, vi) => {
            drawCell(x, curY, colW[vi + 2], rowH, v, { align: aligns[vi] });
            x += colW[vi + 2];
          });
          curY += rowH;
        });
      }

      // Draw merged cells: Sl No (col 0), Priest Name (col 1), Total (col 6)
      const mergedCols = [
        { ci: 0, text: String(i + 1), align: "center", bold: true },
        { ci: 1, text: `Fr. ${r.priest.name}`, align: "left", bold: true },
        { ci: 6, text: totalStr, align: "left", bold: true },
      ];
      mergedCols.forEach(({ ci, text, align, bold }) => {
        let x = margin;
        for (let c = 0; c < ci; c++) x += colW[c];
        drawCell(x, groupStartY, colW[ci], groupH, text, { align, bold });
      });
    });

    doc.save(`Donation_Report${fromDate ? `_${fromDate}` : ""}${toDate ? `_to_${toDate}` : ""}.pdf`);
  };

  const exportWord = () => {
    if (!report.length) return;
    const filterParts = [];
    if (fromDate) filterParts.push(`From: ${new Date(fromDate).toLocaleDateString()}`);
    if (toDate) filterParts.push(`To: ${new Date(toDate).toLocaleDateString()}`);
    if (country) filterParts.push(`Country: ${country}`);

    let html = `<html xmlns:o="urn:schemas-microsoft-com:office:office" xmlns:w="urn:schemas-microsoft-com:office:word" xmlns="http://www.w3.org/TR/REC-html40">
<head><meta charset="utf-8"><title>Donation Report</title>
<style>
  body { font-family: Calibri, Arial, sans-serif; margin: 40px; }
  h1 { font-size: 18pt; color: #1a237e; margin-bottom: 4px; }
  .subtitle { font-size: 10pt; color: #666; margin-bottom: 16px; }
  table { border-collapse: collapse; width: 100%; margin-top: 12px; }
  th { background-color: #1a237e; color: #fff; font-size: 10pt; padding: 8px 10px; text-align: left; }
  td { border: 1px solid #ccc; font-size: 10pt; padding: 6px 10px; vertical-align: top; }
  .priest-name { font-weight: bold; }
  .total-cell { font-weight: bold; }
  .summary-table { margin-bottom: 16px; }
  .summary-table td { border: none; padding: 2px 12px 2px 0; font-size: 10pt; }
  .summary-table td.label { font-weight: bold; color: #1a237e; }
</style></head><body>
<h1>Donation Report</h1>
<div class="subtitle">${filterParts.length ? filterParts.join(" &nbsp;|&nbsp; ") : "All records"}</div>`;

    if (summary) {
      html += `<table class="summary-table"><tr><td class="label">Total Priests:</td><td>${summary.totalPriests}</td><td class="label">Contributors:</td><td>${summary.contributingPriests}</td><td class="label">NIL:</td><td>${summary.nilPriests}</td><td class="label">Grand Total:</td><td>${fmtINR_PDF(summary.grandTotalINR)}</td></tr></table>`;
    }

    html += `<table><tr><th>Sl No</th><th>Priest Name</th><th>Date</th><th>Purpose</th><th>Currency</th><th>Amount</th><th>Total</th></tr>`;

    report.forEach((r, i) => {
      const donations = (!r.isNil && r.donations && r.donations.length > 0) ? r.donations : [];
      const totalParts = [];
      if (r.currencies && r.currencies.length) {
        r.currencies.forEach((c) => {
          const sum = donations.filter((d) => d.currency === c).reduce((s, d) => s + d.amount, 0);
          if (sum > 0) totalParts.push(`${c} ${Number(sum).toLocaleString("en-IN", { minimumFractionDigits: 0, maximumFractionDigits: 2 })}`);
        });
      }
      const totalStr = totalParts.length ? totalParts.join(", ") : (r.isNil ? "NIL" : "—");
      const span = Math.max(donations.length, 1);

      if (donations.length === 0) {
        html += `<tr><td class="priest-name" style="text-align:center">${i + 1}</td><td class="priest-name">Fr. ${r.priest.name}</td><td></td><td></td><td></td><td></td><td class="total-cell">${totalStr}</td></tr>`;
      } else {
        donations.forEach((d, di) => {
          html += `<tr>`;
          if (di === 0) {
            html += `<td class="priest-name" style="text-align:center; vertical-align:middle" rowspan="${span}">${i + 1}</td>`;
            html += `<td class="priest-name" style="vertical-align:middle" rowspan="${span}">Fr. ${r.priest.name}</td>`;
          }
          html += `<td>${d.date ? new Date(d.date).toLocaleDateString("en-GB") : ""}</td>`;
          html += `<td>${d.purpose || ""}</td>`;
          html += `<td style="text-align:center">${d.currency || ""}</td>`;
          html += `<td style="text-align:right">${d.amount ? Number(d.amount).toLocaleString("en-IN") : ""}</td>`;
          if (di === 0) {
            html += `<td class="total-cell" style="vertical-align:middle" rowspan="${span}">${totalStr}</td>`;
          }
          html += `</tr>`;
        });
      }
    });

    html += `</table></body></html>`;

    const blob = new Blob([html], { type: "application/msword" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `Donation_Report${fromDate ? `_${fromDate}` : ""}${toDate ? `_to_${toDate}` : ""}.doc`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const exportExcel = () => {
    if (!report.length) return;
    const wb = XLSX.utils.book_new();

    // ── Build rows matching PDF/Word format: Sl No | Priest Name | Date | Purpose | Currency | Amount | Total ──
    const headers = ["Sl No", "Priest Name", "Date", "Purpose", "Currency", "Amount", "Total"];
    const rows = [];
    const merges = [];
    let rowIdx = 0; // 0-based data row index (excluding header)

    report.forEach((r, i) => {
      const donations = (!r.isNil && r.donations && r.donations.length > 0) ? r.donations : [];
      const rowCount = Math.max(donations.length, 1);

      // Compute total string (same as PDF/Word)
      const totalParts = [];
      if (r.currencies && r.currencies.length) {
        r.currencies.forEach((c) => {
          const sum = donations.filter((d) => d.currency === c).reduce((s, d) => s + d.amount, 0);
          if (sum > 0) totalParts.push(`${c} ${Number(sum).toLocaleString("en-IN", { minimumFractionDigits: 0, maximumFractionDigits: 2 })}`);
        });
      }
      const totalStr = totalParts.length ? totalParts.join(", ") : (r.isNil ? "NIL" : "—");

      if (donations.length === 0) {
        // NIL priest — single row
        rows.push([i + 1, `Fr. ${r.priest.name}`, "", "", "", "", totalStr]);
        rowIdx++;
      } else {
        donations.forEach((d, di) => {
          rows.push([
            di === 0 ? i + 1 : "",
            di === 0 ? `Fr. ${r.priest.name}` : "",
            d.date ? new Date(d.date).toLocaleDateString("en-GB") : "",
            d.purpose || "",
            d.currency || "",
            d.amount ? Number(d.amount) : "",
            di === 0 ? totalStr : "",
          ]);
          rowIdx++;
        });

        // Add merges for Sl No (col 0), Priest Name (col 1), Total (col 6) when multiple donations
        if (rowCount > 1) {
          const startRow = rowIdx - rowCount + 1; // +1 because header is row 0 in sheet
          const endRow = rowIdx;
          merges.push({ s: { r: startRow, c: 0 }, e: { r: endRow, c: 0 } }); // Sl No
          merges.push({ s: { r: startRow, c: 1 }, e: { r: endRow, c: 1 } }); // Priest Name
          merges.push({ s: { r: startRow, c: 6 }, e: { r: endRow, c: 6 } }); // Total
        }
      }
    });

    // Create sheet with header + data
    const sheetData = [headers, ...rows];
    const ws = XLSX.utils.aoa_to_sheet(sheetData);

    // Apply merges
    ws["!merges"] = merges;

    // Column widths
    ws["!cols"] = [
      { wch: 8 },   // Sl No
      { wch: 24 },  // Priest Name
      { wch: 14 },  // Date
      { wch: 28 },  // Purpose
      { wch: 12 },  // Currency
      { wch: 14 },  // Amount
      { wch: 24 },  // Total
    ];

    // ── Apply borders and styles to all cells ──
    const border = {
      top: { style: "thin", color: { rgb: "000000" } },
      bottom: { style: "thin", color: { rgb: "000000" } },
      left: { style: "thin", color: { rgb: "000000" } },
      right: { style: "thin", color: { rgb: "000000" } },
    };
    const totalRows = sheetData.length;
    const totalCols = headers.length;
    for (let R = 0; R < totalRows; R++) {
      for (let C = 0; C < totalCols; C++) {
        const cellRef = XLSX.utils.encode_cell({ r: R, c: C });
        if (!ws[cellRef]) ws[cellRef] = { v: "", t: "s" };
        if (R === 0) {
          // Header row styling
          ws[cellRef].s = {
            font: { bold: true, color: { rgb: "FFFFFF" }, sz: 11 },
            fill: { fgColor: { rgb: "1A237E" } },
            alignment: { horizontal: "center", vertical: "center" },
            border,
          };
        } else {
          // Data rows
          ws[cellRef].s = {
            font: { sz: 10 },
            alignment: { vertical: "center", wrapText: true },
            border,
          };
        }
      }
    }
    // Bold the Sl No, Priest Name, Total columns in data rows
    for (let R = 1; R < totalRows; R++) {
      for (const C of [0, 1, 6]) {
        const cellRef = XLSX.utils.encode_cell({ r: R, c: C });
        if (ws[cellRef]) {
          ws[cellRef].s = { ...ws[cellRef].s, font: { bold: true, sz: 10 } };
        }
      }
    }

    XLSX.utils.book_append_sheet(wb, ws, "Donation Report");

    // ── Summary sheet ──
    const summaryRows = [
      ["Donation Report"], [],
      ["Filter", "Value"],
      ["From Date", fromDate ? new Date(fromDate).toLocaleDateString() : "All"],
      ["To Date", toDate ? new Date(toDate).toLocaleDateString() : "All"],
      ["Country", country || "All"], [],
    ];
    if (summary) {
      summaryRows.push(
        ["Summary", ""],
        ["Total Priests", summary.totalPriests],
        ["Contributing Priests", summary.contributingPriests],
        ["NIL Priests", summary.nilPriests],
        ["Total Donations", summary.grandTotalDonations],
        ["Grand Total (INR)", summary.grandTotalINR],
      );
    }
    const wsSummary = XLSX.utils.aoa_to_sheet(summaryRows);
    wsSummary["!cols"] = [{ wch: 22 }, { wch: 20 }];
    XLSX.utils.book_append_sheet(wb, wsSummary, "Summary");

    XLSX.writeFile(wb, `Donation_Report${fromDate ? `_${fromDate}` : ""}${toDate ? `_to_${toDate}` : ""}.xlsx`);
  };

  const columns = useMemo(() => [
    { accessorKey: "priest.name", header: "Priest", size: 220, Cell: ({ row }) => (<Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}><Box sx={{ width: 34, height: 34, borderRadius: 2, flexShrink: 0, background: row.original.isNil ? "linear-gradient(135deg, #FEE2E2, #FECACA)" : "linear-gradient(135deg, #E8EAF6, #C5CAE9)", display: "flex", alignItems: "center", justifyContent: "center" }}><PersonIcon fontSize="small" sx={{ color: row.original.isNil ? "#DC2626" : "#1a237e" }} /></Box><Box><Typography variant="body2" sx={{ fontWeight: 700, color: "#0F172A" }}>Fr. {row.original.priest.name}</Typography></Box></Box>) },
    { accessorKey: "priest.workingCountry", header: "Country", size: 140, Cell: ({ row }) => (<Box sx={{ display: "flex", alignItems: "center", gap: 1 }}><PublicIcon fontSize="small" sx={{ color: "#64748B" }} /><Typography variant="body2">{row.original.priest.workingCountry || row.original.priest.workingRegion || "—"}</Typography></Box>) },
    { accessorKey: "donationCount", header: "# Donations", size: 120, Cell: ({ row }) => (<Typography variant="body2" sx={{ fontWeight: 700, color: row.original.donationCount > 0 ? "#1a237e" : "#DC2626", textAlign: "center" }}>{row.original.donationCount}</Typography>) },
    { accessorKey: "totalAmount", header: "Total (Foreign)", size: 180, Cell: ({ row }) => { if (row.original.isNil) return <Typography variant="body2" sx={{ color: "#9CA3AF" }}>—</Typography>; return (<Box>{row.original.currencies.map((c) => { const sum = row.original.donations.filter((d) => d.currency === c).reduce((s, d) => s + d.amount, 0); return <Typography key={c} variant="body2" sx={{ fontWeight: 600 }}>{fmtCurrency(sum, c)}</Typography>; })}</Box>); } },
    { accessorKey: "totalINR", header: "Total (INR)", size: 150, Cell: ({ row }) => (<Typography variant="body2" sx={{ fontWeight: 700, color: row.original.totalINR > 0 ? "#059669" : "#DC2626" }}>{fmtINR(row.original.totalINR)}</Typography>) },
    { accessorKey: "isNil", header: "Status", size: 130, Cell: ({ row }) => (<Chip label={row.original.isNil ? "NIL" : "Contributed"} size="small" sx={{ fontWeight: 700, fontSize: "0.72rem", backgroundColor: row.original.isNil ? "#FEE2E2" : "#D1FAE5", color: row.original.isNil ? "#DC2626" : "#059669" }} />) },
    { accessorKey: "priest.phone", header: "Phone", size: 130, Cell: ({ row }) => <Typography variant="body2" sx={{ color: "#64748B" }}>{row.original.priest.phone || "—"}</Typography> },
  ], []);

  const stats = summary ? [
    { title: "Total Priests", value: summary.totalPriests, icon: <PersonIcon />, color: "#4f46e5" },
    { title: "Contributors", value: summary.contributingPriests, icon: <DonationIcon />, color: "#059669" },
    { title: "NIL", value: summary.nilPriests, icon: <PersonIcon />, color: "#DC2626" },
    { title: "Grand Total (INR)", value: fmtINR(summary.grandTotalINR), icon: <RupeeIcon />, color: "#ea580c" },
    { title: "Total Donations", value: summary.grandTotalDonations, icon: <DonationIcon />, color: "#7c3aed" },
  ] : [];

  return (
    <Page><CssBaseline />
      <StyledCard sx={{ mb: 3 }}><Content><Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}><Box sx={{ display: "flex", alignItems: "center", gap: 2 }}><IconBox color="#4f46e5"><AssessmentIcon sx={{ fontSize: 26 }} /></IconBox><Box><GradientText>Donation Report</GradientText><Typography variant="body2" sx={{ color: "#64748B" }}>View contributions by priest with date range and country filters</Typography></Box></Box><Box sx={{ display: "flex", gap: 1.5 }}><GradientBtn startIcon={<FileDownloadIcon />} onClick={exportExcel} disabled={!report.length} sx={{ background: "linear-gradient(135deg, #059669, #047857)", "&:hover": { background: "linear-gradient(135deg, #047857, #059669)" } }}>Export Excel</GradientBtn><GradientBtn startIcon={<FileDownloadIcon />} onClick={exportPDF} disabled={!report.length}>Export PDF</GradientBtn><GradientBtn startIcon={<FileDownloadIcon />} onClick={exportWord} disabled={!report.length} sx={{ background: "linear-gradient(135deg, #7c3aed, #6d28d9)", "&:hover": { background: "linear-gradient(135deg, #6d28d9, #7c3aed)" } }}>Export Word</GradientBtn></Box></Box></Content></StyledCard>

      <StyledCard sx={{ mb: 3, overflow: "visible" }}>
        <Box sx={{ p: 2.5, display: "flex", justifyContent: "space-between", alignItems: "center", cursor: "pointer" }} onClick={() => setFiltersOpen(!filtersOpen)}>
          <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}><FilterIcon sx={{ color: "#1a237e" }} /><Typography variant="subtitle1" sx={{ fontWeight: 700 }}>Filters</Typography>{(fromDate || toDate || country) && <Chip label="Active" size="small" sx={{ bgcolor: "#D1FAE5", color: "#059669", fontWeight: 700, fontSize: "0.68rem", height: 22 }} />}</Box>
          <IconButton size="small">{filtersOpen ? <ExpandLessIcon /> : <ExpandMoreIcon />}</IconButton>
        </Box>
        <Collapse in={filtersOpen}><Divider sx={{ borderColor: "#E2E8F0" }} />
          <Box sx={{ p: 2.5, display: "flex", gap: 2, flexWrap: "wrap", alignItems: "flex-end" }}>
            <Field label="From Date" type="date" value={fromDate} onChange={(e) => setFromDate(e.target.value)} InputLabelProps={{ shrink: true }} sx={{ minWidth: 180 }} />
            <Field label="To Date" type="date" value={toDate} onChange={(e) => setToDate(e.target.value)} InputLabelProps={{ shrink: true }} sx={{ minWidth: 180 }} />
            <Field select label="Country" value={country} onChange={(e) => setCountry(e.target.value)} sx={{ minWidth: 180 }}><MenuItem value="">All Countries</MenuItem>{countries.map((c) => <MenuItem key={c} value={c}>{c}</MenuItem>)}</Field>
            <GradientBtn onClick={fetch} disabled={loading} startIcon={loading ? <CircularProgress size={16} color="inherit" /> : <AssessmentIcon />}>{loading ? "Generating..." : "Generate Report"}</GradientBtn>
            <Button variant="outlined" onClick={() => { setFromDate(""); setToDate(""); setCountry(""); }} sx={{ borderRadius: 3, fontWeight: 600, borderColor: "#C5CAE9", color: "#1a237e", textTransform: "none" }}>Clear</Button>
          </Box>
        </Collapse>
      </StyledCard>

      {stats.length > 0 && (
        <Box sx={{ display: "flex", gap: 2, mb: 3, flexWrap: "wrap" }}>
          {stats.map((s, i) => (
            <StatBox key={i}><IconBox color={s.color} sx={{ width: 44, height: 44 }}>{React.cloneElement(s.icon, { sx: { fontSize: 22 } })}</IconBox>
              <Box><Typography variant="caption" sx={{ color: "#64748B", fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.1em", fontSize: "0.7rem" }}>{s.title}</Typography><StatValue>{s.value}</StatValue></Box>
            </StatBox>
          ))}
        </Box>
      )}

      <ChartCard>
        <MaterialReactTable columns={columns} data={report} enableColumnFiltering enableGlobalFilter enablePagination enableSorting enableRowSelection state={{ isLoading: loading }}
          renderTopToolbarCustomActions={() => (<Box sx={{ p: 2 }}><IconButton onClick={fetch} sx={{ bgcolor: "#E8EAF6", "&:hover": { bgcolor: "#C5CAE9" } }}><RefreshIcon sx={{ color: "#1a237e" }} /></IconButton></Box>)}
          muiTablePaperProps={{ elevation: 0, sx: { borderRadius: 4, border: "none" } }}
          muiTableProps={{ sx: { "& .MuiTableCell-root": { borderBottom: "1px solid #F1F5F9" } } }}
          initialState={{ density: "comfortable", pagination: { pageSize: 25 }, sorting: [{ id: "priest.name", desc: false }] }}
          renderDetailPanel={({ row }) => {
            if (row.original.isNil) return <Box sx={{ p: 2, bgcolor: "#FEF2F2", borderRadius: 2 }}><Typography variant="body2" sx={{ color: "#DC2626", fontStyle: "italic" }}>No donations for this period.</Typography></Box>;
            return (<Box sx={{ p: 2 }}><Typography variant="subtitle2" sx={{ fontWeight: 700, mb: 1 }}>Donation Details</Typography><Box component="table" sx={{ width: "100%", borderCollapse: "collapse", "& th, & td": { p: 1, textAlign: "left", fontSize: "0.82rem", borderBottom: "1px solid #E2E8F0" }, "& th": { fontWeight: 700, color: "#64748B", bgcolor: "#f8fafc" } }}><thead><tr><th>Date</th><th>Purpose</th><th>Currency</th><th style={{ textAlign: "right" }}>Amount</th><th style={{ textAlign: "right" }}>INR</th><th>Mode</th><th>Remarks</th></tr></thead><tbody>{row.original.donations.map((d, idx) => (<tr key={idx}><td>{d.date ? new Date(d.date).toLocaleDateString() : "—"}</td><td>{d.purpose || "—"}</td><td><Chip label={d.currency} size="small" sx={{ fontWeight: 600, fontSize: "0.7rem", height: 22, bgcolor: "#E8EAF6", color: "#1a237e" }} /></td><td style={{ textAlign: "right", fontWeight: 600 }}>{fmtCurrency(d.amount, d.currency)}</td><td style={{ textAlign: "right", fontWeight: 600, color: "#059669" }}>{fmtINR(d.inrAmount)}</td><td>{d.modeOfTransfer || "—"}</td><td style={{ color: "#64748B" }}>{d.remarks || "—"}</td></tr>))}</tbody></Box></Box>);
          }} />
      </ChartCard>

      <Snackbar open={Boolean(msg)} autoHideDuration={5000} onClose={() => setMsg(null)} anchorOrigin={{ vertical: "bottom", horizontal: "right" }}><Alert onClose={() => setMsg(null)} severity={msg?.type || "info"} variant="filled" sx={{ borderRadius: 2, bgcolor: msg?.type === "error" ? "#DC2626" : "#1a237e" }}>{msg?.text}</Alert></Snackbar>
    </Page>
  );
};

export default DonationReport;