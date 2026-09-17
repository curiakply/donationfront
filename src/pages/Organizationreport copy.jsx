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
  CurrencyRupee as RupeeIcon, Business as BusinessIcon,
  VolunteerActivism as DonationIcon, Person as PersonIcon,
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

const OrganizationReport = () => {
  const [report, setReport] = useState([]); const [orgList, setOrgList] = useState([]); const [summary, setSummary] = useState(null);
  const [loading, setLoading] = useState(false); const [msg, setMsg] = useState(null); const [filtersOpen, setFiltersOpen] = useState(true);
  const [fromDate, setFromDate] = useState(""); const [toDate, setToDate] = useState(""); const [selectedOrg, setSelectedOrg] = useState("");

  useEffect(() => { fetch(); }, []);

  const fetch = useCallback(async () => {
    setLoading(true);
    try { const params = {}; if (fromDate) params.from = fromDate; if (toDate) params.to = toDate; if (selectedOrg) params.organization = selectedOrg; const res = await axiosInstance.get("/organization-report", { params }); setReport(res.data.report || []); setOrgList(res.data.organizations || []); setSummary(res.data.summary || null); }
    catch { setMsg({ type: "error", text: "Failed to generate report" }); } finally { setLoading(false); }
  }, [fromDate, toDate, selectedOrg]);

  const exportPDF = () => {
    if (!report.length) return; const doc = new jsPDF({ orientation: "landscape" });
    doc.setFontSize(16); doc.setFont("helvetica", "bold"); doc.text("Organization-wise Donation Report", 14, 18);
    autoTable(doc, { startY: 28, head: [["#", "Organization", "Priests", "Donations", "Total (INR)", "Status"]], body: report.map((r, i) => [i + 1, r.organization.name, r.priestCount, r.donationCount, fmtINR(r.totalINR), r.isNil ? "NIL" : "Active"]), styles: { fontSize: 8 }, headStyles: { fillColor: [26, 35, 126], textColor: 255 } });
    doc.save(`Receivers_Report.pdf`);
  };

  const columns = useMemo(() => [
    { accessorKey: "organization.name", header: "Receivers", size: 250, Cell: ({ row }) => (<Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}><Box sx={{ width: 34, height: 34, borderRadius: 2, flexShrink: 0, background: row.original.isNil ? "linear-gradient(135deg, #FEE2E2, #FECACA)" : "linear-gradient(135deg, #E8EAF6, #C5CAE9)", display: "flex", alignItems: "center", justifyContent: "center" }}><BusinessIcon fontSize="small" sx={{ color: row.original.isNil ? "#DC2626" : "#1a237e" }} /></Box><Typography variant="body2" sx={{ fontWeight: 700, color: "#0F172A" }}>{row.original.organization.name}</Typography></Box>) },
    { accessorKey: "priestCount", header: "Priests", size: 100, Cell: ({ row }) => (<Box sx={{ display: "flex", alignItems: "center", gap: 0.5, justifyContent: "center" }}><PersonIcon fontSize="small" sx={{ color: "#64748B", fontSize: 16 }} /><Typography variant="body2" sx={{ fontWeight: 600 }}>{row.original.priestCount}</Typography></Box>) },
    { accessorKey: "donationCount", header: "Donations", size: 110, Cell: ({ row }) => (<Typography variant="body2" sx={{ fontWeight: 700, textAlign: "center", color: row.original.donationCount > 0 ? "#1a237e" : "#DC2626" }}>{row.original.donationCount}</Typography>) },
    { accessorKey: "totalINR", header: "Total (INR)", size: 160, Cell: ({ row }) => (<Typography variant="body2" sx={{ fontWeight: 700, color: row.original.totalINR > 0 ? "#059669" : "#DC2626" }}>{fmtINR(row.original.totalINR)}</Typography>) },
    { accessorKey: "currencies", header: "Currencies", size: 160, Cell: ({ row }) => row.original.currencies.length ? (<Box sx={{ display: "flex", gap: 0.5, flexWrap: "wrap" }}>{row.original.currencies.map((c) => (<Chip key={c} label={c} size="small" sx={{ fontWeight: 600, fontSize: "0.68rem", height: 22, bgcolor: "#E8EAF6", color: "#1a237e" }} />))}</Box>) : <Typography variant="body2" sx={{ color: "#9CA3AF" }}>—</Typography> },
    { accessorKey: "isNil", header: "Status", size: 120, Cell: ({ row }) => (<Chip label={row.original.isNil ? "NIL" : "Active"} size="small" sx={{ fontWeight: 700, fontSize: "0.72rem", backgroundColor: row.original.isNil ? "#FEE2E2" : "#D1FAE5", color: row.original.isNil ? "#DC2626" : "#059669" }} />) },
  ], []);

  const stats = summary ? [
    { title: "Receivers", value: summary.totalOrganizations, icon: <BusinessIcon />, color: "#4f46e5" },
    { title: "Active", value: summary.activeOrganizations, icon: <DonationIcon />, color: "#059669" },
    { title: "NIL", value: summary.nilOrganizations, icon: <BusinessIcon />, color: "#DC2626" },
    { title: "Grand Total (INR)", value: fmtINR(summary.grandTotalINR), icon: <RupeeIcon />, color: "#ea580c" }, 
  ] : [];

  return (
    <Page><CssBaseline />
      <StyledCard sx={{ mb: 3 }}><Content><Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}><Box sx={{ display: "flex", alignItems: "center", gap: 2 }}><IconBox color="#7c3aed"><BusinessIcon sx={{ fontSize: 26 }} /></IconBox><Box><GradientText>Receivers Report</GradientText><Typography variant="body2" sx={{ color: "#64748B" }}>Donation summary grouped by Receivers</Typography></Box></Box><GradientBtn startIcon={<FileDownloadIcon />} onClick={exportPDF} disabled={!report.length}>Export PDF</GradientBtn></Box></Content></StyledCard>

      <StyledCard sx={{ mb: 3, overflow: "visible" }}>
        <Box sx={{ p: 2.5, display: "flex", justifyContent: "space-between", alignItems: "center", cursor: "pointer" }} onClick={() => setFiltersOpen(!filtersOpen)}>
          <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}><FilterIcon sx={{ color: "#1a237e" }} /><Typography variant="subtitle1" sx={{ fontWeight: 700 }}>Filters</Typography>{(fromDate || toDate || selectedOrg) && <Chip label="Active" size="small" sx={{ bgcolor: "#D1FAE5", color: "#059669", fontWeight: 700, fontSize: "0.68rem", height: 22 }} />}</Box>
          <IconButton size="small">{filtersOpen ? <ExpandLessIcon /> : <ExpandMoreIcon />}</IconButton>
        </Box>
        <Collapse in={filtersOpen}><Divider sx={{ borderColor: "#E2E8F0" }} /><Box sx={{ p: 2.5, display: "flex", gap: 2, flexWrap: "wrap", alignItems: "flex-end" }}>
          <Field label="From Date" type="date" value={fromDate} onChange={(e) => setFromDate(e.target.value)} InputLabelProps={{ shrink: true }} sx={{ minWidth: 180 }} />
          <Field label="To Date" type="date" value={toDate} onChange={(e) => setToDate(e.target.value)} InputLabelProps={{ shrink: true }} sx={{ minWidth: 180 }} />
          <Field select label="Receivers" value={selectedOrg} onChange={(e) => setSelectedOrg(e.target.value)} sx={{ minWidth: 220 }}><MenuItem value="">All Receivers</MenuItem>{orgList.map((o) => <MenuItem key={o._id} value={o._id}>{o.name}</MenuItem>)}</Field>
          <GradientBtn onClick={fetch} disabled={loading} startIcon={loading ? <CircularProgress size={16} color="inherit" /> : <AssessmentIcon />}>{loading ? "Generating..." : "Generate Report"}</GradientBtn>
          <Button variant="outlined" onClick={() => { setFromDate(""); setToDate(""); setSelectedOrg(""); }} sx={{ borderRadius: 3, fontWeight: 600, borderColor: "#C5CAE9", color: "#1a237e", textTransform: "none" }}>Clear</Button>
        </Box></Collapse>
      </StyledCard>

      {stats.length > 0 && (<Box sx={{ display: "flex", gap: 2, mb: 3, flexWrap: "wrap" }}>{stats.map((s, i) => (<StatBox key={i}><IconBox color={s.color} sx={{ width: 44, height: 44 }}>{React.cloneElement(s.icon, { sx: { fontSize: 22 } })}</IconBox><Box><Typography variant="caption" sx={{ color: "#64748B", fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.1em", fontSize: "0.7rem" }}>{s.title}</Typography><StatValue>{s.value}</StatValue></Box></StatBox>))}</Box>)}

      <ChartCard>
        <MaterialReactTable columns={columns} data={report} enableColumnFiltering enableGlobalFilter enablePagination enableSorting enableRowSelection state={{ isLoading: loading }}
          renderTopToolbarCustomActions={() => (<Box sx={{ p: 2 }}><IconButton onClick={fetch} sx={{ bgcolor: "#E8EAF6", "&:hover": { bgcolor: "#C5CAE9" } }}><RefreshIcon sx={{ color: "#1a237e" }} /></IconButton></Box>)}
          muiTablePaperProps={{ elevation: 0, sx: { borderRadius: 4, border: "none" } }}
          muiTableProps={{ sx: { "& .MuiTableCell-root": { borderBottom: "1px solid #F1F5F9" } } }}
          initialState={{ density: "comfortable", pagination: { pageSize: 15 } }}
          renderDetailPanel={({ row }) => {
            if (row.original.isNil) return <Box sx={{ p: 2, bgcolor: "#FEF2F2", borderRadius: 2 }}><Typography variant="body2" sx={{ color: "#DC2626", fontStyle: "italic" }}>No donations for this period.</Typography></Box>;
            return (<Box sx={{ p: 2 }}><Typography variant="subtitle2" sx={{ fontWeight: 700, mb: 1 }}>Donation Details</Typography><Box component="table" sx={{ width: "100%", borderCollapse: "collapse", "& th, & td": { p: 1, textAlign: "left", fontSize: "0.82rem", borderBottom: "1px solid #E2E8F0" }, "& th": { fontWeight: 700, color: "#64748B", bgcolor: "#f8fafc" } }}><thead><tr><th>Date</th><th>Priest</th><th>Purpose</th><th>Currency</th><th style={{ textAlign: "right" }}>Amount</th><th style={{ textAlign: "right" }}>INR</th><th>Mode</th></tr></thead><tbody>{row.original.donations.map((d, idx) => (<tr key={idx}><td>{d.date ? new Date(d.date).toLocaleDateString() : "—"}</td><td style={{ fontWeight: 600 }}>Fr. {d.priestName}</td><td>{d.purpose || "—"}</td><td><Chip label={d.currency} size="small" sx={{ fontWeight: 600, fontSize: "0.7rem", height: 22, bgcolor: "#E8EAF6", color: "#1a237e" }} /></td><td style={{ textAlign: "right", fontWeight: 600 }}>{fmtCurrency(d.amount, d.currency)}</td><td style={{ textAlign: "right", fontWeight: 600, color: "#059669" }}>{fmtINR(d.inrAmount)}</td><td>{d.modeOfTransfer || "—"}</td></tr>))}</tbody></Box></Box>);
          }} />
      </ChartCard>

      <Snackbar open={Boolean(msg)} autoHideDuration={5000} onClose={() => setMsg(null)} anchorOrigin={{ vertical: "bottom", horizontal: "right" }}><Alert onClose={() => setMsg(null)} severity={msg?.type || "info"} variant="filled" sx={{ borderRadius: 2, bgcolor: msg?.type === "error" ? "#DC2626" : "#1a237e" }}>{msg?.text}</Alert></Snackbar>
    </Page>
  );
};

export default OrganizationReport;