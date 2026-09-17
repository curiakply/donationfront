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
import * as XLSX from "xlsx";

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
//
// Checks if any non-active period overlaps with the report date range.
// Two checks:
//   1. CURRENT status: if not active, inactive from priest.statusDate onwards (no end)
//   2. HISTORY entries: each non-active entry ran from entry.date (statusDate)
//      until entry.changedAt (or the next entry's changedAt/date as fallback)
//
// If ANY non-active window overlaps [from, to], priest is excluded.

// const wasActiveDuring = (priest, fromStr, toStr) => {
//   // No date filter → just check current status
//   if (!fromStr && !toStr) {
//     return !priest.status || priest.status === "active";
//   }

//   const from = fromStr ? new Date(fromStr) : new Date("1900-01-01");
//   const to = toStr ? new Date(toStr + "T23:59:59.999Z") : new Date("2099-12-31");

//   // ── Check 1: Current status ──
//   if (priest.status && priest.status !== "active") {
//     const inactiveFrom = priest.statusDate
//       ? new Date(priest.statusDate)
//       : new Date("1900-01-01");
//     // Currently inactive from inactiveFrom until forever — overlaps?
//     if (inactiveFrom <= to) return false;
//   }

//   // ── Check 2: Historical non-active periods ──
//   const history = priest.statusHistory || [];
//   for (let i = 0; i < history.length; i++) {
//     if (history[i].status === "active") continue;

//     // Start of this non-active period = its statusDate
//     const start = history[i].date
//       ? new Date(history[i].date)
//       : new Date("1900-01-01");

//     // End of this non-active period = when they LEFT this status
//     let end;
//     if (history[i].changedAt) {
//       // Best: exact transition timestamp
//       end = new Date(history[i].changedAt);
//     } else if (i + 1 < history.length) {
//       // Fallback: next history entry's changedAt or date
//       end = new Date(history[i + 1].changedAt || history[i + 1].date);
//     } else {
//       // Last entry without changedAt — use start as end (point-in-time check)
//       end = new Date(start);
//     }

//     // Does [start, end] overlap with [from, to]?
//     if (start <= to && end >= from) {
//       return false;
//     }
//   }

//   return true;
// };
// const wasActiveDuring = (priest, fromStr, toStr) => {
//   // No date filter → just check current status
//   if (!fromStr && !toStr) {
//     return !priest.status || priest.status === "active";
//   }

//   // If currently active → always show
//   if (!priest.status || priest.status === "active") return true;

//   // Currently not active — check if they were already inactive before report starts
//   if (!priest.statusDate) return false; // no date = treat as always inactive

//   const inactiveFrom = new Date(priest.statusDate);
//   const from = new Date(fromStr || "1900-01-01");

//   // If they became inactive before or on report start → exclude
//   // If they became inactive after report start → they were active for part of the period → include
//   return inactiveFrom > from;
// };
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
    // start <= fromDate AND end > fromDate (reactivated AFTER that day)
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
    doc.setFontSize(16); doc.setFont("helvetica", "bold"); doc.text("Donation Report", 14, 18);
    doc.setFontSize(9); doc.setFont("helvetica", "normal");
    const parts = [];
    if (fromDate) parts.push(`From: ${new Date(fromDate).toLocaleDateString()}`);
    if (toDate) parts.push(`To: ${new Date(toDate).toLocaleDateString()}`);
    if (country) parts.push(`Country: ${country}`);
    doc.text(parts.length ? parts.join("  |  ") : "All records", 14, 25);
    if (summary) doc.text(`Priests: ${summary.totalPriests}  |  Contributors: ${summary.contributingPriests}  |  NIL: ${summary.nilPriests}  |  Total: ${fmtINR_PDF(summary.grandTotalINR)}`, 14, 31);

    const tableBody = [];
    const priestRowIndices = new Set();

    report.forEach((r, i) => {
      const foreignTotal = r.currencies && r.currencies.length
        ? r.currencies.map((c) => {
            const sum = (r.donations || []).filter((d) => d.currency === c).reduce((s, d) => s + d.amount, 0);
            return fmtCurrency_PDF(sum, c);
          }).join(", ")
        : "-";

      priestRowIndices.add(tableBody.length);
      tableBody.push([
        i + 1, `Fr. ${r.priest.name}`, r.priest.hname || "",
        r.priest.workingCountry || r.priest.workingRegion || "",
        r.donationCount, foreignTotal, fmtINR_PDF(r.totalINR),
        r.isNil ? "NIL" : "Contributed",
      ]);

      if (!r.isNil && r.donations && r.donations.length > 0) {
        r.donations.forEach((d) => {
          tableBody.push([
            "", `    ${d.date ? new Date(d.date).toLocaleDateString() : "-"}`,
            d.purpose || "-", d.modeOfTransfer || "-", d.currency || "",
            fmtCurrency_PDF(d.amount, d.currency), fmtINR_PDF(d.inrAmount),
            d.remarks || "-",
          ]);
        });
      }
    });

    autoTable(doc, {
      startY: 36,
      head: [["#", "Priest / Date", "House Name / Purpose", "Country / Mode", "Count / Currency", "Foreign Amount", "INR Amount", "Status / Remarks"]],
      body: tableBody,
      styles: { fontSize: 8, cellPadding: 3 },
      headStyles: { fillColor: [26, 35, 126], textColor: 255, fontStyle: "bold" },
      willDrawCell: (data) => {
        if (data.section === "body") {
          if (priestRowIndices.has(data.row.index)) {
            data.cell.styles.fontStyle = "bold";
            data.cell.styles.fillColor = [232, 234, 246];
            data.cell.styles.textColor = [15, 23, 42];
          } else {
            data.cell.styles.textColor = [100, 116, 139];
            data.cell.styles.fontSize = 7;
            data.cell.styles.fillColor = [248, 250, 252];
          }
        }
      },
    });
    doc.save(`Donation_Report${fromDate ? `_${fromDate}` : ""}${toDate ? `_to_${toDate}` : ""}.pdf`);
  };

  const exportExcel = () => {
    if (!report.length) return;
    const wb = XLSX.utils.book_new();

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

    const detailHeaders = [
      "Sl No", "Priest Name", "House Name", "Country", "Phone",
      "# Donations", "Total Foreign", "Total INR", "Status",
      "", "Date", "Purpose", "Currency", "Amount", "INR Amount", "Mode", "Remarks",
    ];
    const detailRows = [detailHeaders];
    report.forEach((r, i) => {
      const foreignTotal = r.currencies && r.currencies.length
        ? r.currencies.map((c) => {
            const sum = (r.donations || []).filter((d) => d.currency === c).reduce((s, d) => s + d.amount, 0);
            return `${c} ${Number(sum).toLocaleString("en-US", { minimumFractionDigits: 2 })}`;
          }).join(", ") : "-";
      detailRows.push([
        i + 1, `Fr. ${r.priest.name}`, r.priest.hname || "",
        r.priest.workingCountry || r.priest.workingRegion || "",
        r.priest.phone || "", r.donationCount, foreignTotal,
        r.totalINR || 0, r.isNil ? "NIL" : "Contributed",
        "", "", "", "", "", "", "", "",
      ]);
      if (!r.isNil && r.donations && r.donations.length > 0) {
        r.donations.forEach((d) => {
          detailRows.push([
            "", "", "", "", "", "", "", "", "", "",
            d.date ? new Date(d.date).toLocaleDateString() : "",
            d.purpose || "", d.currency || "", d.amount || 0,
            d.inrAmount || 0, d.modeOfTransfer || "", d.remarks || "",
          ]);
        });
      }
    });
    const wsDetail = XLSX.utils.aoa_to_sheet(detailRows);
    wsDetail["!cols"] = [
      { wch: 6 }, { wch: 22 }, { wch: 18 }, { wch: 14 }, { wch: 14 },
      { wch: 12 }, { wch: 22 }, { wch: 16 }, { wch: 12 }, { wch: 2 },
      { wch: 12 }, { wch: 20 }, { wch: 10 }, { wch: 14 }, { wch: 14 }, { wch: 14 }, { wch: 20 },
    ];
    XLSX.utils.book_append_sheet(wb, wsDetail, "Donation Details");

    const flatHeaders = ["Sl No", "Priest", "House Name", "Country", "Date", "Purpose", "Currency", "Amount", "INR Amount", "Mode", "Remarks"];
    const flatRows = [flatHeaders];
    let slNo = 1;
    report.forEach((r) => {
      if (!r.isNil && r.donations && r.donations.length > 0) {
        r.donations.forEach((d) => {
          flatRows.push([
            slNo++, `Fr. ${r.priest.name}`, r.priest.hname || "",
            r.priest.workingCountry || r.priest.workingRegion || "",
            d.date ? new Date(d.date).toLocaleDateString() : "",
            d.purpose || "", d.currency || "", d.amount || 0,
            d.inrAmount || 0, d.modeOfTransfer || "", d.remarks || "",
          ]);
        });
      }
    });
    const wsFlat = XLSX.utils.aoa_to_sheet(flatRows);
    wsFlat["!cols"] = [
      { wch: 6 }, { wch: 22 }, { wch: 18 }, { wch: 14 }, { wch: 12 },
      { wch: 20 }, { wch: 10 }, { wch: 14 }, { wch: 14 }, { wch: 14 }, { wch: 20 },
    ];
    XLSX.utils.book_append_sheet(wb, wsFlat, "All Donations");
    XLSX.writeFile(wb, `Donation_Report${fromDate ? `_${fromDate}` : ""}${toDate ? `_to_${toDate}` : ""}.xlsx`);
  };

  const columns = useMemo(() => [
    { accessorKey: "priest.name", header: "Priest", size: 220, Cell: ({ row }) => (<Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}><Box sx={{ width: 34, height: 34, borderRadius: 2, flexShrink: 0, background: row.original.isNil ? "linear-gradient(135deg, #FEE2E2, #FECACA)" : "linear-gradient(135deg, #E8EAF6, #C5CAE9)", display: "flex", alignItems: "center", justifyContent: "center" }}><PersonIcon fontSize="small" sx={{ color: row.original.isNil ? "#DC2626" : "#1a237e" }} /></Box><Box><Typography variant="body2" sx={{ fontWeight: 700, color: "#0F172A" }}>Fr. {row.original.priest.name}</Typography><Typography variant="caption" sx={{ color: "#64748B" }}>{row.original.priest.hname || ""}</Typography></Box></Box>) },
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
      <StyledCard sx={{ mb: 3 }}><Content><Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}><Box sx={{ display: "flex", alignItems: "center", gap: 2 }}><IconBox color="#4f46e5"><AssessmentIcon sx={{ fontSize: 26 }} /></IconBox><Box><GradientText>Donation Report</GradientText><Typography variant="body2" sx={{ color: "#64748B" }}>View contributions by priest with date range and country filters</Typography></Box></Box><Box sx={{ display: "flex", gap: 1.5 }}><GradientBtn startIcon={<FileDownloadIcon />} onClick={exportExcel} disabled={!report.length} sx={{ background: "linear-gradient(135deg, #059669, #047857)", "&:hover": { background: "linear-gradient(135deg, #047857, #059669)" } }}>Export Excel</GradientBtn><GradientBtn startIcon={<FileDownloadIcon />} onClick={exportPDF} disabled={!report.length}>Export PDF</GradientBtn></Box></Box></Content></StyledCard>

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