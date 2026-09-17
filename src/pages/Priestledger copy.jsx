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
  MenuBook as LedgerIcon, FilterAlt as FilterIcon,
  ExpandMore as ExpandMoreIcon, ExpandLess as ExpandLessIcon,
  CurrencyRupee as RupeeIcon, Person as PersonIcon,
  VolunteerActivism as DonationIcon, AccountBalance as BalanceIcon,
} from "@mui/icons-material";
import { jsPDF } from "jspdf";
import autoTable from "jspdf-autotable";

const Page = styled(Box)(() => ({ backgroundColor: "#f8fafc", minHeight: "100vh", padding: 24 }));
const StyledCard = styled(Card)(() => ({ backgroundColor: "#fff", borderRadius: 16, boxShadow: "0 4px 6px -1px rgba(0,0,0,0.1), 0 2px 4px -1px rgba(0,0,0,0.06)", transition: "all 0.3s ease", "&:hover": { transform: "translateY(-4px)", boxShadow: "0 10px 15px -3px rgba(0,0,0,0.1)" } }));
const Content = styled(CardContent)(({ theme }) => ({ padding: theme.spacing(3) }));
const IconBox = styled(Box)(({ color }) => ({ width: 56, height: 56, borderRadius: 12, display: "flex", alignItems: "center", justifyContent: "center", background: `linear-gradient(135deg, ${color}20, ${color}40)`, color }));
const ChartCard = styled(Card)(({ theme }) => ({ backgroundColor: "#fff", borderRadius: 16, padding: theme.spacing(3), boxShadow: "0 4px 6px -1px rgba(0,0,0,0.1), 0 2px 4px -1px rgba(0,0,0,0.06)" }));
const GradientBtn = styled(Button)(() => ({ background: "linear-gradient(135deg, #1a237e, #0d47a1)", color: "#fff", borderRadius: 12, padding: "10px 24px", fontWeight: 600, textTransform: "none", "&:hover": { background: "linear-gradient(135deg, #0d47a1, #1a237e)" } }));
const Field = styled(TextField)(() => ({ "& .MuiOutlinedInput-root": { borderRadius: 12, "& fieldset": { borderColor: "#E2E8F0" }, "&:hover fieldset": { borderColor: "#0d47a1" }, "&.Mui-focused fieldset": { borderColor: "#1a237e" } } }));
const GradientText = ({ children, variant = "h5", sx = {} }) => (<Typography variant={variant} sx={{ fontWeight: 700, background: "linear-gradient(45deg, #1a237e, #0d47a1)", backgroundClip: "text", WebkitBackgroundClip: "text", color: "transparent", ...sx }}>{children}</Typography>);
const StatBox = styled(Box)(() => ({ padding: "20px 24px", borderRadius: 16, backgroundColor: "#fff", boxShadow: "0 4px 6px -1px rgba(0,0,0,0.1), 0 2px 4px -1px rgba(0,0,0,0.06)", display: "flex", alignItems: "center", gap: 16, flex: 1, minWidth: 180, transition: "all 0.3s ease", "&:hover": { transform: "translateY(-4px)", boxShadow: "0 10px 15px -3px rgba(0,0,0,0.1)" } }));
const StatValue = styled(Typography)(() => ({ fontSize: "1.6rem", fontWeight: 700, lineHeight: 1.2, background: "linear-gradient(45deg, #1a237e, #0d47a1)", backgroundClip: "text", WebkitBackgroundClip: "text", color: "transparent" }));

const fmtINR = (n) => new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR", maximumFractionDigits: 0 }).format(n || 0);
const fmtCurrency = (n, c) => new Intl.NumberFormat("en-US", { style: "currency", currency: c || "USD", maximumFractionDigits: 2 }).format(n || 0);

const PriestLedger = () => {
  const [priests, setPriests] = useState([]); const [ledger, setLedger] = useState([]); const [summary, setSummary] = useState(null);
  const [loading, setLoading] = useState(false); const [msg, setMsg] = useState(null); const [filtersOpen, setFiltersOpen] = useState(true);
  const [selectedPriest, setSelectedPriest] = useState(""); const [fromDate, setFromDate] = useState(""); const [toDate, setToDate] = useState("");

  useEffect(() => { (async () => { try { setPriests((await axiosInstance.get("/priest-ledger")).data.priests || []); } catch { setMsg({ type: "error", text: "Failed to load priests" }); } })(); }, []);

  const fetch = useCallback(async () => {
    if (!selectedPriest) { setMsg({ type: "error", text: "Select a priest" }); return; }
    setLoading(true);
    try { const params = { priest: selectedPriest }; if (fromDate) params.from = fromDate; if (toDate) params.to = toDate; const res = await axiosInstance.get("/priest-ledger", { params }); setLedger(res.data.ledger || []); setSummary(res.data.summary || null); }
    catch { setMsg({ type: "error", text: "Failed to generate ledger" }); } finally { setLoading(false); }
  }, [selectedPriest, fromDate, toDate]);

  const clear = () => { setSelectedPriest(""); setFromDate(""); setToDate(""); setLedger([]); setSummary(null); };

  const exportPDF = () => {
    if (!ledger.length || !summary) return; const doc = new jsPDF();
    doc.setFontSize(16); doc.setFont("helvetica", "bold"); doc.text("Priest Donation Ledger", 14, 18);
    doc.setFontSize(10); doc.setFont("helvetica", "normal"); doc.text(`Priest: Fr. ${summary.priest.name}`, 14, 26); doc.text(`House Name: ${summary.priest.hname || "—"}`, 14, 32);
    const currLines = Object.entries(summary.currencyTotals).map(([c, a]) => `${c}: ${fmtCurrency(a, c)}`).join("  |  ");
    doc.setFontSize(9); doc.text(`Totals → ${currLines}  |  INR: ${fmtINR(summary.totalINR)}`, 14, 38);
    autoTable(doc, { startY: 44, head: [["#", "Date", "Receivers", "Purpose", "Currency", "Amount", "INR", "Running Total", "Mode"]], body: ledger.map((r) => [r.slNo, r.date ? new Date(r.date).toLocaleDateString() : "—", r.organization, r.purpose || "—", r.currency, fmtCurrency(r.amount, r.currency), fmtINR(r.inrAmount), fmtINR(r.runningTotal), r.modeOfTransfer || "—"]), styles: { fontSize: 7.5 }, headStyles: { fillColor: [26, 35, 126], textColor: 255 } });
    doc.save(`Priest_Ledger_${summary.priest.name.replace(/\s/g, "_")}.pdf`);
  };

  const columns = useMemo(() => [
    { accessorKey: "slNo", header: "#", size: 60, Cell: ({ row }) => <Typography variant="body2" sx={{ fontWeight: 600, textAlign: "center", color: "#64748B" }}>{row.original.slNo}</Typography> },
    { accessorKey: "date", header: "Date", size: 120, Cell: ({ row }) => <Typography variant="body2" sx={{ fontWeight: 600, color: "#0F172A" }}>{row.original.date ? new Date(row.original.date).toLocaleDateString() : "—"}</Typography> },
    { accessorKey: "organization", header: "Receivers", size: 180, Cell: ({ row }) => <Typography variant="body2" sx={{ fontWeight: 600, color: "#0F172A" }}>{row.original.organization}</Typography> },
    { accessorKey: "purpose", header: "Purpose", size: 160, Cell: ({ row }) => <Typography variant="body2" sx={{ color: "#64748B" }}>{row.original.purpose || "—"}</Typography> },
    { accessorKey: "currency", header: "Currency", size: 100, Cell: ({ row }) => <Chip label={row.original.currency} size="small" sx={{ fontWeight: 700, fontSize: "0.7rem", height: 22, bgcolor: "#E8EAF6", color: "#1a237e" }} /> },
    { accessorKey: "amount", header: "Amount", size: 130, Cell: ({ row }) => <Typography variant="body2" sx={{ fontWeight: 700, textAlign: "right", color: "#4f46e5" }}>{fmtCurrency(row.original.amount, row.original.currency)}</Typography> },
    { accessorKey: "inrAmount", header: "INR Amount", size: 130, Cell: ({ row }) => <Typography variant="body2" sx={{ fontWeight: 700, textAlign: "right", color: "#059669" }}>{fmtINR(row.original.inrAmount)}</Typography> },
    { accessorKey: "runningTotal", header: "Running Total", size: 150, Cell: ({ row }) => (<Box sx={{ display: "inline-flex", alignItems: "center", gap: 0.5, bgcolor: "#E8EAF6", borderRadius: 1.5, px: 1.5, py: 0.3 }}><RupeeIcon sx={{ fontSize: 14, color: "#1a237e" }} /><Typography variant="body2" sx={{ fontWeight: 800, color: "#1a237e" }}>{fmtINR(row.original.runningTotal)}</Typography></Box>) },
    { accessorKey: "modeOfTransfer", header: "Mode", size: 120, Cell: ({ row }) => <Chip label={row.original.modeOfTransfer || "—"} size="small" variant="outlined" sx={{ fontWeight: 600, fontSize: "0.7rem", height: 22, borderColor: "#C5CAE9", color: "#64748B" }} /> },
    { accessorKey: "remarks", header: "Remarks", size: 150, Cell: ({ row }) => <Typography variant="body2" sx={{ color: "#64748B", fontStyle: row.original.remarks ? "normal" : "italic" }}>{row.original.remarks || "—"}</Typography> },
  ], []);

  return (
    <Page><CssBaseline />
      <StyledCard sx={{ mb: 3 }}><Content><Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}><Box sx={{ display: "flex", alignItems: "center", gap: 2 }}><IconBox color="#ea580c"><LedgerIcon sx={{ fontSize: 26 }} /></IconBox><Box><GradientText>Priest Ledger</GradientText><Typography variant="body2" sx={{ color: "#64748B" }}>Chronological donation ledger with running balance</Typography></Box></Box><GradientBtn startIcon={<FileDownloadIcon />} onClick={exportPDF} disabled={!ledger.length}>Export PDF</GradientBtn></Box></Content></StyledCard>

      <StyledCard sx={{ mb: 3, overflow: "visible" }}>
        <Box sx={{ p: 2.5, display: "flex", justifyContent: "space-between", alignItems: "center", cursor: "pointer" }} onClick={() => setFiltersOpen(!filtersOpen)}>
          <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}><FilterIcon sx={{ color: "#1a237e" }} /><Typography variant="subtitle1" sx={{ fontWeight: 700 }}>Filters</Typography>{selectedPriest && <Chip label="Priest Selected" size="small" sx={{ bgcolor: "#D1FAE5", color: "#059669", fontWeight: 700, fontSize: "0.68rem", height: 22 }} />}</Box>
          <IconButton size="small">{filtersOpen ? <ExpandLessIcon /> : <ExpandMoreIcon />}</IconButton>
        </Box>
        <Collapse in={filtersOpen}><Divider sx={{ borderColor: "#E2E8F0" }} /><Box sx={{ p: 2.5, display: "flex", gap: 2, flexWrap: "wrap", alignItems: "flex-end" }}>
          <Field select label="Select Priest" value={selectedPriest} onChange={(e) => setSelectedPriest(e.target.value)} sx={{ minWidth: 250 }}><MenuItem value="">— Select Priest —</MenuItem>{priests.map((p) => <MenuItem key={p._id} value={p._id}>Fr. {p.name} {p.hname ? `(${p.hname})` : ""}</MenuItem>)}</Field>
          <Field label="From Date" type="date" value={fromDate} onChange={(e) => setFromDate(e.target.value)} InputLabelProps={{ shrink: true }} sx={{ minWidth: 180 }} />
          <Field label="To Date" type="date" value={toDate} onChange={(e) => setToDate(e.target.value)} InputLabelProps={{ shrink: true }} sx={{ minWidth: 180 }} />
          <GradientBtn onClick={fetch} disabled={loading || !selectedPriest} startIcon={loading ? <CircularProgress size={16} color="inherit" /> : <LedgerIcon />}>{loading ? "Loading..." : "Generate Ledger"}</GradientBtn>
          <Button variant="outlined" onClick={clear} sx={{ borderRadius: 3, fontWeight: 600, borderColor: "#C5CAE9", color: "#1a237e", textTransform: "none" }}>Clear</Button>
        </Box></Collapse>
      </StyledCard>

      {summary && (
        <>
          <StyledCard sx={{ p: 2.5, mb: 2, background: "linear-gradient(135deg, #f8fafc, #E8EAF6)" }}>
            <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
              <IconBox color="#4f46e5" sx={{ width: 50, height: 50, borderRadius: "50%" }}><PersonIcon sx={{ fontSize: 26 }} /></IconBox>
              <Box><GradientText variant="h6">Fr. {summary.priest.name}</GradientText><Typography variant="body2" sx={{ color: "#64748B" }}>{summary.priest.hname || ""}{summary.priest.workingCountry ? ` · ${summary.priest.workingCountry}` : ""}{summary.priest.phone ? ` · ${summary.priest.phone}` : ""}</Typography></Box>
            </Box>
          </StyledCard>

          <Box sx={{ display: "flex", gap: 2, mb: 3, flexWrap: "wrap" }}>
            <StatBox><IconBox color="#ea580c" sx={{ width: 44, height: 44 }}><DonationIcon sx={{ fontSize: 22 }} /></IconBox><Box><Typography variant="caption" sx={{ color: "#64748B", fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.1em", fontSize: "0.7rem" }}>Total Donations</Typography><StatValue>{summary.totalDonations}</StatValue></Box></StatBox>
            <StatBox><IconBox color="#059669" sx={{ width: 44, height: 44 }}><RupeeIcon sx={{ fontSize: 22 }} /></IconBox><Box><Typography variant="caption" sx={{ color: "#64748B", fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.1em", fontSize: "0.7rem" }}>Grand Total (INR)</Typography><StatValue sx={{ color: "#059669 !important", background: "none !important", WebkitTextFillColor: "#059669" }}>{fmtINR(summary.totalINR)}</StatValue></Box></StatBox>
            {Object.entries(summary.currencyTotals).map(([cur, amt]) => (
              <StatBox key={cur}><IconBox color="#4f46e5" sx={{ width: 44, height: 44 }}><BalanceIcon sx={{ fontSize: 22 }} /></IconBox><Box><Typography variant="caption" sx={{ color: "#64748B", fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.1em", fontSize: "0.7rem" }}>Total ({cur})</Typography><StatValue>{fmtCurrency(amt, cur)}</StatValue></Box></StatBox>
            ))}
          </Box>
        </>
      )}

      <ChartCard>
        <MaterialReactTable columns={columns} data={ledger} enableColumnFiltering enableGlobalFilter enablePagination enableSorting enableColumnResizing state={{ isLoading: loading }}
          renderTopToolbarCustomActions={() => (<Box sx={{ p: 2 }}><IconButton onClick={fetch} disabled={!selectedPriest} sx={{ bgcolor: "#E8EAF6", "&:hover": { bgcolor: "#C5CAE9" } }}><RefreshIcon sx={{ color: "#1a237e" }} /></IconButton></Box>)}
          muiTablePaperProps={{ elevation: 0, sx: { borderRadius: 4, border: "none" } }}
          muiTableProps={{ sx: { "& .MuiTableCell-root": { borderBottom: "1px solid #F1F5F9" } } }}
          initialState={{ density: "comfortable", pagination: { pageSize: 50 } }} />
      </ChartCard>

      {!loading && !ledger.length && selectedPriest && summary === null && (
        <Box sx={{ textAlign: "center", py: 6 }}><LedgerIcon sx={{ fontSize: 48, color: "#C5CAE9", mb: 1 }} /><Typography variant="body1" sx={{ color: "#64748B" }}>Click "Generate Ledger" to view the donation history</Typography></Box>
      )}

      <Snackbar open={Boolean(msg)} autoHideDuration={5000} onClose={() => setMsg(null)} anchorOrigin={{ vertical: "bottom", horizontal: "right" }}><Alert onClose={() => setMsg(null)} severity={msg?.type || "info"} variant="filled" sx={{ borderRadius: 2, bgcolor: msg?.type === "error" ? "#DC2626" : "#1a237e" }}>{msg?.text}</Alert></Snackbar>
    </Page>
  );
};

export default PriestLedger;