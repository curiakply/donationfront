import React, { useState, useEffect, useMemo, useCallback } from "react";
import { MaterialReactTable } from "material-react-table";
import axiosInstance from "../axiosConfig";
import { MarriagePDFButton } from "./MarriageCertificatePDF";
import MarriagePrintSetup, { DEFAULT_PRINT_SETTINGS } from "./MarriagePrintSetup";
import {
  Button, TextField, Dialog, DialogTitle, DialogContent, DialogActions,
  Grid, Box, Typography, IconButton, Tooltip, Card, Fade, Chip,
  CircularProgress, Snackbar, Alert, CssBaseline, createTheme, ThemeProvider,
  MenuItem, Divider, Paper, Tabs, Tab,
} from "@mui/material";
import { styled } from "@mui/material/styles";
import {
  Refresh as RefreshIcon, Edit as EditIcon, Delete as DeleteIcon,
  Add as AddIcon, Person as PersonIcon, FamilyRestroom as FamilyIcon,
  Church as ChurchIcon, Favorite as FavoriteIcon, Badge as BadgeIcon,
  Groups as WitnessIcon, CalendarMonth as CalendarIcon, Tune as TuneIcon,
} from "@mui/icons-material";
import { jsPDF } from "jspdf";
import autoTable from "jspdf-autotable";

const FONT = "Inter, system-ui, -apple-system, sans-serif";

const theme = createTheme({
  palette: {
    mode: "light",
    primary:    { main: "#0F766E", light: "#14B8A6", dark: "#115E59" },
    secondary:  { main: "#BE185D", light: "#EC4899", dark: "#9D174D" },
    background: { default: "#F0FDFA", paper: "#FFFFFF" },
    text:       { primary: "#134E4A", secondary: "#6B7280" },
  },
  typography: { fontFamily: FONT },
  components: {
    MuiCard: { styleOverrides: { root: { borderRadius: 12, boxShadow: "0 2px 8px rgba(0,0,0,0.07)", transition: "all 0.3s ease", "&:hover": { transform: "translateY(-3px)", boxShadow: "0 8px 24px rgba(0,0,0,0.11)" } } } },
    MuiButton: { styleOverrides: { root: { textTransform: "none", borderRadius: 8, padding: "10px 20px", fontWeight: 600, fontFamily: FONT } } },
    MuiInputBase:  { styleOverrides: { root: { fontFamily: FONT } } },
    MuiInputLabel: { styleOverrides: { root: { fontFamily: FONT } } },
    MuiMenuItem:   { styleOverrides: { root: { fontFamily: FONT } } },
    MuiTab:        { styleOverrides: { root: { fontFamily: FONT } } },
    MuiTableCell:  { styleOverrides: { root: { fontFamily: FONT } } },
    MuiTypography: { styleOverrides: { root: { fontFamily: FONT } } },
  },
});

const StyledCard = styled(Card)(() => ({ borderRadius: 12, boxShadow: "0 2px 8px rgba(0,0,0,0.07)", transition: "all 0.3s ease", "&:hover": { transform: "translateY(-3px)", boxShadow: "0 8px 24px rgba(0,0,0,0.11)" } }));
const GradientButton = styled(Button)(({ theme }) => ({ background: `linear-gradient(to right, ${theme.palette.primary.light}, ${theme.palette.primary.main})`, color: "white", fontFamily: FONT, "&:hover": { background: `linear-gradient(to right, ${theme.palette.primary.main}, ${theme.palette.primary.dark})` } }));
const StyledTextField = styled(TextField)(({ theme }) => ({ "& .MuiOutlinedInput-root": { borderRadius: 8, fontFamily: FONT, "& fieldset": { borderColor: "#CCFBF1" }, "&:hover fieldset": { borderColor: theme.palette.primary.light }, "&.Mui-focused fieldset": { borderColor: theme.palette.primary.main } }, "& .MuiInputLabel-root": { fontFamily: FONT } }));
const SectionPanel = styled(Paper)(({ theme }) => ({ padding: 20, borderRadius: 12, border: `1px solid ${theme.palette.primary.light}44`, marginBottom: 20 }));
const SectionLabel = styled(Typography)(({ color = "#0F766E" }) => ({ fontFamily: FONT, fontWeight: 700, fontSize: "0.75rem", letterSpacing: "0.09em", textTransform: "uppercase", color, marginBottom: 12, display: "flex", alignItems: "center", gap: 6 }));
const PersonHeader = styled(Box)(({ gradient }) => ({ display: "flex", alignItems: "center", gap: 12, padding: "12px 16px", borderRadius: 10, background: gradient || "linear-gradient(135deg, #CCFBF1, #99F6E4)", marginBottom: 16 }));

const blankForm = () => ({
  certificateNo: "", registrationNo: "",
  groomHouseName: "", groomBaptismalName: "", groomOfficialName: "", groomFatherName: "", groomMotherName: "", groomParish: "", groomDiocese: "", groomDOB: "", groomDateOfBaptism: "", groomDateOfConfirmation: "",
  brideHouseName: "", brideBaptismalName: "", brideOfficialName: "", brideFatherName: "", brideMotherName: "", brideParish: "", brideDiocese: "", brideDOB: "", brideDateOfBaptism: "", brideDateOfConfirmation: "",
  dateOfMarriage: "", placeOfMarriage: "", minister: "", ministerName: "", vicarName: "", witness1Name: "", witness1Address: "", witness2Name: "", witness2Address: "", notes: "",
});

const TabPanel = ({ children, value, index }) => value === index ? <Box sx={{ pt: 2 }}>{children}</Box> : null;

const PersonSection = ({ prefix, label, data, onChange, parishes, dioceses, gradient, iconColor }) => {
  const f = (key) => `${prefix}${key}`;
  const v = (key) => data[f(key)] || "";
  const upd = (key, val) => onChange({ [f(key)]: val });
  return (
    <>
      <PersonHeader gradient={gradient}>
        <Box sx={{ width: 36, height: 36, borderRadius: "50%", background: iconColor, display: "flex", alignItems: "center", justifyContent: "center" }}>
          <PersonIcon sx={{ color: "white", fontSize: 18 }} />
        </Box>
        <Typography sx={{ fontWeight: 700, fontFamily: FONT, color: "#134E4A", fontSize: "1rem" }}>{label}</Typography>
      </PersonHeader>
      <Grid container spacing={2}>
        {[["HouseName","House Name",true],["BaptismalName","Baptismal Name",true],["OfficialName","Official Name",true],["FatherName","Name of Father",false],["MotherName","Name of Mother",false]].map(([k,l,r]) => (
          <Grid item xs={12} sm={6} key={k}>
            <StyledTextField label={l} value={v(k)} onChange={(e) => upd(k, e.target.value)} fullWidth size="small" required={r} />
          </Grid>
        ))}
        <Grid item xs={12} sm={6}>
          <StyledTextField select label="Parish" value={v("Parish")} onChange={(e) => upd("Parish", e.target.value)} fullWidth size="small">
            {parishes.length === 0 ? <MenuItem disabled>No parishes found</MenuItem> : parishes.map((p) => <MenuItem key={p._id} value={p._id}>{p.name}</MenuItem>)}
          </StyledTextField>
        </Grid>
        <Grid item xs={12} sm={6}>
          <StyledTextField select label="Diocese" value={v("Diocese")} onChange={(e) => upd("Diocese", e.target.value)} fullWidth size="small">
            {dioceses.length === 0 ? <MenuItem disabled>No dioceses found</MenuItem> : dioceses.map((d) => <MenuItem key={d._id} value={d._id}>{d.name}</MenuItem>)}
          </StyledTextField>
        </Grid>
        {[["DOB","Date of Birth"],["DateOfBaptism","Date of Baptism"],["DateOfConfirmation","Date of Confirmation"]].map(([k,l]) => (
          <Grid item xs={12} sm={4} key={k}>
            <StyledTextField label={l} type="date" value={v(k)} onChange={(e) => upd(k, e.target.value)} InputLabelProps={{ shrink: true }} fullWidth size="small" />
          </Grid>
        ))}
      </Grid>
    </>
  );
};

const MarriagePage = () => {
  const [marriages, setMarriages] = useState([]);
  const [parishes,  setParishes]  = useState([]);
  const [dioceses,  setDioceses]  = useState([]);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [isEditing,      setIsEditing]      = useState(false);
  const [selectedDoc,    setSelectedDoc]    = useState(null);
  const [isLoading,      setIsLoading]      = useState(false);
  const [message,        setMessage]        = useState(null);
  const [tabIndex,       setTabIndex]       = useState(0);
  const [formData,       setFormData]       = useState(blankForm());

  const [setupOpen,     setSetupOpen]     = useState(false);
  const [printSettings, setPrintSettings] = useState({ ...DEFAULT_PRINT_SETTINGS });

  useEffect(() => {
    axiosInstance.get("/print-settings/marriage")
      .then((res) => { if (res.data) setPrintSettings({ ...DEFAULT_PRINT_SETTINGS, ...res.data }); })
      .catch(() => {});
  }, []);

  useEffect(() => {
    fetchMarriages();
    axiosInstance.get("/parish/").then((r) => setParishes(r.data)).catch(() => {});
    axiosInstance.get("/diocese/").then((r) => setDioceses(r.data)).catch(() => {});
  }, []);

  const fetchMarriages = async () => {
    setIsLoading(true);
    try { const res = await axiosInstance.get("/marriage/"); setMarriages(res.data); }
    catch { setMessage({ type: "error", text: "Failed to fetch marriage records" }); }
    finally { setIsLoading(false); }
  };

  const handleChange = useCallback((patch) => setFormData((prev) => ({ ...prev, ...patch })), []);
  const resetForm = () => { setFormData(blankForm()); setIsEditing(false); setSelectedDoc(null); setTabIndex(0); };
  const openNew = () => { resetForm(); setIsModalVisible(true); };

  const handleEdit = (doc) => {
    setIsEditing(true); setSelectedDoc(doc);
    const s = (v) => v ? v.substring(0, 10) : "";
    setFormData({
      certificateNo: doc.certificateNo || "", registrationNo: doc.registrationNo || "",
      groomHouseName: doc.groom?.houseName || "", groomBaptismalName: doc.groom?.baptismalName || "", groomOfficialName: doc.groom?.officialName || "",
      groomFatherName: doc.groom?.fatherName || "", groomMotherName: doc.groom?.motherName || "",
      groomParish: doc.groom?.parish?._id || doc.groom?.parish || "", groomDiocese: doc.groom?.diocese?._id || doc.groom?.diocese || "",
      groomDOB: s(doc.groom?.dob), groomDateOfBaptism: s(doc.groom?.dateOfBaptism), groomDateOfConfirmation: s(doc.groom?.dateOfConfirmation),
      brideHouseName: doc.bride?.houseName || "", brideBaptismalName: doc.bride?.baptismalName || "", brideOfficialName: doc.bride?.officialName || "",
      brideFatherName: doc.bride?.fatherName || "", brideMotherName: doc.bride?.motherName || "",
      brideParish: doc.bride?.parish?._id || doc.bride?.parish || "", brideDiocese: doc.bride?.diocese?._id || doc.bride?.diocese || "",
      brideDOB: s(doc.bride?.dob), brideDateOfBaptism: s(doc.bride?.dateOfBaptism), brideDateOfConfirmation: s(doc.bride?.dateOfConfirmation),
      dateOfMarriage: s(doc.dateOfMarriage), placeOfMarriage: doc.placeOfMarriage || "",
      minister: doc.minister?._id || doc.minister || "", ministerName: doc.ministerName || "", vicarName: doc.vicarName || "",
      witness1Name: doc.witnesses?.[0]?.name || "", witness1Address: doc.witnesses?.[0]?.address || "",
      witness2Name: doc.witnesses?.[1]?.name || "", witness2Address: doc.witnesses?.[1]?.address || "",
      notes: doc.notes || "",
    });
    setTabIndex(0); setIsModalVisible(true);
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Delete this marriage record?")) return;
    try { await axiosInstance.delete(`/marriage/${id}`); fetchMarriages(); setMessage({ type: "success", text: "Marriage record deleted" }); }
    catch { setMessage({ type: "error", text: "Failed to delete marriage record" }); }
  };

  const handleFormSubmit = async (e) => {
    e.preventDefault(); setIsLoading(true);
    const payload = {
      certificateNo: formData.certificateNo, registrationNo: formData.registrationNo,
      groom: { houseName: formData.groomHouseName, baptismalName: formData.groomBaptismalName, officialName: formData.groomOfficialName, fatherName: formData.groomFatherName, motherName: formData.groomMotherName, parish: formData.groomParish || null, diocese: formData.groomDiocese || null, dob: formData.groomDOB || null, dateOfBaptism: formData.groomDateOfBaptism || null, dateOfConfirmation: formData.groomDateOfConfirmation || null },
      bride: { houseName: formData.brideHouseName, baptismalName: formData.brideBaptismalName, officialName: formData.brideOfficialName, fatherName: formData.brideFatherName, motherName: formData.brideMotherName, parish: formData.brideParish || null, diocese: formData.brideDiocese || null, dob: formData.brideDOB || null, dateOfBaptism: formData.brideDateOfBaptism || null, dateOfConfirmation: formData.brideDateOfConfirmation || null },
      dateOfMarriage: formData.dateOfMarriage || null, placeOfMarriage: formData.placeOfMarriage,
      minister: formData.minister || null, ministerName: formData.ministerName || "", vicarName: formData.vicarName || "",
      witnesses: [{ name: formData.witness1Name, address: formData.witness1Address }, { name: formData.witness2Name, address: formData.witness2Address }].filter((w) => w.name),
      notes: formData.notes,
    };
    try {
      if (isEditing) await axiosInstance.put(`/marriage/${selectedDoc._id}`, payload);
      else await axiosInstance.post("/marriage/", payload);
      setMessage({ type: "success", text: `Marriage record ${isEditing ? "updated" : "saved"} successfully` });
      fetchMarriages(); setIsModalVisible(false); resetForm();
    } catch { setMessage({ type: "error", text: "Failed to save marriage record" }); }
    finally { setIsLoading(false); }
  };

  const handleExportRows = (rows) => {
    if (!rows.length) return;
    const doc = new jsPDF();
    doc.text("Marriage Register", 14, 15);
    autoTable(doc, {
      head: [["Cert No", "Reg No", "Bridegroom", "Bride", "Date", "Place", "Minister"]],
      body: rows.map((r) => { const m = r.original; return [m.certificateNo || "", m.registrationNo || "", m.groom?.officialName || "", m.bride?.officialName || "", m.dateOfMarriage ? new Date(m.dateOfMarriage).toLocaleDateString("en-IN") : "", m.placeOfMarriage || "", m.ministerName ? `Fr. ${m.ministerName}` : ""]; }),
      styles: { fontSize: 8 }, headStyles: { fillColor: [15, 118, 110], textColor: 255 }, startY: 22,
    });
    doc.save("marriage_register.pdf");
  };

  const columns = useMemo(() => [
    { accessorKey: "certificateNo", header: "Cert No", size: 100, Cell: ({ cell }) => <Chip label={cell.getValue() || "—"} size="small" sx={{ backgroundColor: "#CCFBF1", color: "#0F766E", fontWeight: 700, fontSize: "0.75rem", fontFamily: FONT }} /> },
    { accessorKey: "registrationNo", header: "Reg No", size: 110, Cell: ({ cell }) => <Typography variant="caption" sx={{ color: "#64748B", fontWeight: 600, fontFamily: FONT }}>{cell.getValue() || "—"}</Typography> },
    { id: "groom", header: "Bridegroom", size: 200, Cell: ({ row }) => (
      <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
        <Box sx={{ width: 34, height: 34, borderRadius: "50%", background: "linear-gradient(135deg, #14B8A6, #0F766E)", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}><PersonIcon sx={{ color: "white", fontSize: 16 }} /></Box>
        <Box><Typography variant="subtitle2" sx={{ fontWeight: 700, fontFamily: FONT, color: "#134E4A" }}>{row.original.groom?.officialName || "—"}</Typography><Typography variant="caption" sx={{ color: "#64748B", fontFamily: FONT }}>{row.original.groom?.houseName || ""}</Typography></Box>
      </Box>
    )},
    { id: "bride", header: "Bride", size: 200, Cell: ({ row }) => (
      <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
        <Box sx={{ width: 34, height: 34, borderRadius: "50%", background: "linear-gradient(135deg, #EC4899, #BE185D)", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}><PersonIcon sx={{ color: "white", fontSize: 16 }} /></Box>
        <Box><Typography variant="subtitle2" sx={{ fontWeight: 700, fontFamily: FONT, color: "#134E4A" }}>{row.original.bride?.officialName || "—"}</Typography><Typography variant="caption" sx={{ color: "#64748B", fontFamily: FONT }}>{row.original.bride?.houseName || ""}</Typography></Box>
      </Box>
    )},
    { accessorKey: "dateOfMarriage", header: "Date of Marriage", size: 160, Cell: ({ cell }) => (
      <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}><CalendarIcon sx={{ fontSize: 15, color: "#0F766E" }} /><Typography variant="body2" sx={{ fontWeight: 600, color: "#134E4A", fontFamily: FONT }}>{cell.getValue() ? new Date(cell.getValue()).toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" }) : "—"}</Typography></Box>
    )},
    { accessorKey: "placeOfMarriage", header: "Place", size: 200, Cell: ({ cell }) => (
      <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}><ChurchIcon sx={{ fontSize: 15, color: "#0F766E" }} /><Typography variant="body2" sx={{ color: "#134E4A", fontFamily: FONT }}>{cell.getValue() || "—"}</Typography></Box>
    )},
    { id: "minister", header: "Minister", size: 160, Cell: ({ row }) => <Typography variant="body2" sx={{ color: "#134E4A", fontFamily: FONT }}>{row.original.ministerName ? `Fr. ${row.original.ministerName}` : "—"}</Typography> },
    {
      id: "actions", header: "Actions", size: 190,
      Cell: ({ row }) => (
        <Box sx={{ display: "flex", gap: 1, alignItems: "center" }}>
          <MarriagePDFButton record={row.original} printSettings={printSettings} />
          <Tooltip title="Edit"><IconButton size="small" onClick={() => handleEdit(row.original)} sx={{ backgroundColor: "#CCFBF1", "&:hover": { backgroundColor: "#99F6E4" } }}><EditIcon fontSize="small" sx={{ color: "#0F766E" }} /></IconButton></Tooltip>
          <Tooltip title="Delete"><IconButton size="small" onClick={() => handleDelete(row.original._id)} sx={{ backgroundColor: "rgb(254,226,226)", "&:hover": { backgroundColor: "rgb(254,202,202)" } }}><DeleteIcon fontSize="small" sx={{ color: "rgb(220,38,38)" }} /></IconButton></Tooltip>
        </Box>
      ),
    },
  ], [printSettings]);

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Box sx={{ p: 3, minHeight: "100vh", background: "#F0FDFA" }}>

        <StyledCard sx={{ p: 3, mb: 3 }}>
          <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 2 }}>
            <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
              <Box sx={{ width: 48, height: 48, borderRadius: "12px", background: "linear-gradient(135deg, #14B8A6, #0F766E)", display: "flex", alignItems: "center", justifyContent: "center" }}><FavoriteIcon sx={{ color: "white", fontSize: 24 }} /></Box>
              <Box>
                <Typography variant="h5" sx={{ fontWeight: 700, fontFamily: FONT, color: "#134E4A", mb: 0.3 }}>Marriage Register</Typography>
                <Typography variant="body2" sx={{ color: "#64748B", fontFamily: FONT }}>Certificate of Marriage — Form D records</Typography>
              </Box>
            </Box>
            <Box sx={{ display: "flex", gap: 1.5, alignItems: "center", flexWrap: "wrap" }}>
              <Tooltip title="Configure PDF header, logo, margins and sections (saved to database)">
                <Button variant="outlined" startIcon={<TuneIcon />} onClick={() => setSetupOpen(true)}
                  sx={{ borderRadius: 8, textTransform: "none", fontWeight: 600, fontSize: "0.82rem", fontFamily: FONT, borderColor: "#14B8A6", color: "#0F766E", "&:hover": { borderColor: "#0F766E", backgroundColor: "#F0FDFA" } }}>
                  Print Setup
                </Button>
              </Tooltip>
              <GradientButton startIcon={<AddIcon />} onClick={openNew}>New Marriage Record</GradientButton>
            </Box>
          </Box>
        </StyledCard>

        <StyledCard>
          <MaterialReactTable
            columns={columns} data={marriages}
            enableColumnFiltering enableGlobalFilter enablePagination enableSorting enableRowSelection enableFullScreenToggle enableDensityToggle
            positionToolbarAlertBanner="bottom" state={{ isLoading }}
            renderTopToolbarCustomActions={({ table }) => (
              <Box sx={{ display: "flex", gap: 2, p: 2 }}>
                <IconButton onClick={fetchMarriages} sx={{ backgroundColor: "#CCFBF1" }}><RefreshIcon sx={{ color: "#0F766E" }} /></IconButton>
                <Button variant="outlined" onClick={() => handleExportRows(table.getSelectedRowModel().rows)} startIcon={<FavoriteIcon />}
                  disabled={!table.getSelectedRowModel().rows.length}
                  sx={{ borderRadius: 8, textTransform: "none", fontWeight: 600, fontFamily: FONT, borderColor: "#14B8A6", color: "#0F766E" }}>
                  Export Selected
                </Button>
              </Box>
            )}
            muiTablePaperProps={{ elevation: 0, sx: { borderRadius: "12px", border: "none", backgroundColor: "white" } }}
            muiTableProps={{ sx: { "& .MuiTableCell-root": { borderBottom: "1px solid #F3F4F6", backgroundColor: "white", verticalAlign: "top", fontFamily: FONT } } }}
            initialState={{ density: "comfortable", pagination: { pageSize: 10 } }}
          />
        </StyledCard>

        <Dialog open={isModalVisible} onClose={() => { setIsModalVisible(false); resetForm(); }} maxWidth="md" fullWidth TransitionComponent={Fade}
          PaperProps={{ elevation: 0, sx: { borderRadius: "16px", bgcolor: "#FFFFFF", boxShadow: "0 20px 60px rgba(15,118,110,0.15)" } }}>
          <DialogTitle sx={{ p: 3, borderBottom: "1px solid #CCFBF1", background: "linear-gradient(135deg, #F0FDFA, #CCFBF1)" }}>
            <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
              <Box sx={{ width: 42, height: 42, borderRadius: "11px", background: "linear-gradient(135deg, #14B8A6, #0F766E)", display: "flex", alignItems: "center", justifyContent: "center" }}><FavoriteIcon sx={{ color: "white", fontSize: 22 }} /></Box>
              <Box>
                <Typography variant="h6" sx={{ fontWeight: 700, fontFamily: FONT, color: "#134E4A" }}>{isEditing ? "Edit Marriage Record" : "New Marriage Record"}</Typography>
                <Typography variant="body2" sx={{ color: "#64748B", mt: 0.2, fontFamily: FONT }}>Certificate of Marriage — Form D</Typography>
              </Box>
            </Box>
          </DialogTitle>
          <form onSubmit={handleFormSubmit}>
            <DialogContent sx={{ p: 0, maxHeight: "75vh", overflowY: "auto" }}>
              <Tabs value={tabIndex} onChange={(_, v) => setTabIndex(v)} variant="fullWidth"
                sx={{ borderBottom: "1px solid #CCFBF1", "& .MuiTab-root": { textTransform: "none", fontFamily: FONT, fontWeight: 600, fontSize: "0.85rem" }, "& .Mui-selected": { color: "#0F766E !important" }, "& .MuiTabs-indicator": { backgroundColor: "#0F766E" }, px: 2 }}>
                <Tab label="📋 Certificate" /><Tab label="👤 Bridegroom" /><Tab label="👰 Bride" /><Tab label="⛪ Marriage Details" />
              </Tabs>
              <Box sx={{ p: 3 }}>
                <TabPanel value={tabIndex} index={0}>
                  <SectionPanel elevation={0}>
                    <SectionLabel><BadgeIcon sx={{ fontSize: 13 }} /> Certificate Information</SectionLabel>
                    <Grid container spacing={2}>
                      <Grid item xs={12} sm={6}><StyledTextField label="Certificate No" value={formData.certificateNo} onChange={(e) => handleChange({ certificateNo: e.target.value })} fullWidth size="small" placeholder="e.g. 8430" /></Grid>
                      <Grid item xs={12} sm={6}><StyledTextField label="Registration No" value={formData.registrationNo} onChange={(e) => handleChange({ registrationNo: e.target.value })} fullWidth size="small" placeholder="e.g. 10/2026" /></Grid>
                    </Grid>
                  </SectionPanel>
                  {(formData.groomOfficialName || formData.brideOfficialName) && (
                    <Box sx={{ display: "flex", gap: 2, flexWrap: "wrap", mt: 1 }}>
                      {formData.groomOfficialName && <Chip icon={<PersonIcon sx={{ color: "#0F766E !important", fontSize: 16 }} />} label={`Groom: ${formData.groomOfficialName}`} sx={{ backgroundColor: "#CCFBF1", color: "#134E4A", fontWeight: 600, fontFamily: FONT }} />}
                      {formData.brideOfficialName && <Chip icon={<PersonIcon sx={{ color: "#BE185D !important", fontSize: 16 }} />} label={`Bride: ${formData.brideOfficialName}`} sx={{ backgroundColor: "#FCE7F3", color: "#9D174D", fontWeight: 600, fontFamily: FONT }} />}
                      {formData.dateOfMarriage && <Chip icon={<CalendarIcon sx={{ fontSize: 16 }} />} label={new Date(formData.dateOfMarriage).toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" })} sx={{ backgroundColor: "#F0FDFA", color: "#0F766E", fontWeight: 600, fontFamily: FONT }} />}
                    </Box>
                  )}
                </TabPanel>
                <TabPanel value={tabIndex} index={1}>
                  <SectionPanel elevation={0}><PersonSection prefix="groom" label="Bridegroom Details" data={formData} onChange={handleChange} parishes={parishes} dioceses={dioceses} gradient="linear-gradient(135deg, #CCFBF1, #99F6E4)" iconColor="linear-gradient(135deg, #14B8A6, #0F766E)" /></SectionPanel>
                </TabPanel>
                <TabPanel value={tabIndex} index={2}>
                  <SectionPanel elevation={0}><PersonSection prefix="bride" label="Bride Details" data={formData} onChange={handleChange} parishes={parishes} dioceses={dioceses} gradient="linear-gradient(135deg, #FCE7F3, #FBCFE8)" iconColor="linear-gradient(135deg, #EC4899, #BE185D)" /></SectionPanel>
                </TabPanel>
                <TabPanel value={tabIndex} index={3}>
                  <SectionPanel elevation={0}>
                    <SectionLabel><ChurchIcon sx={{ fontSize: 13 }} /> Marriage Details</SectionLabel>
                    <Grid container spacing={2}>
                      <Grid item xs={12} sm={6}><StyledTextField label="Date of Marriage" type="date" value={formData.dateOfMarriage} onChange={(e) => handleChange({ dateOfMarriage: e.target.value })} InputLabelProps={{ shrink: true }} fullWidth size="small" required /></Grid>
                      <Grid item xs={12} sm={6}><StyledTextField label="Place of Marriage" value={formData.placeOfMarriage} onChange={(e) => handleChange({ placeOfMarriage: e.target.value })} fullWidth size="small" required placeholder="e.g. Holy Family Forane Church, Ponkunnam" /></Grid>
                      <Grid item xs={12} sm={6}><StyledTextField label="Minister Name" value={formData.ministerName} onChange={(e) => handleChange({ ministerName: e.target.value })} fullWidth size="small" placeholder="e.g. Fr. Thomas Poovathanikunnel" /></Grid>
                      <Grid item xs={12} sm={6}><StyledTextField label="Vicar / Asst. Vicar Name" value={formData.vicarName} onChange={(e) => handleChange({ vicarName: e.target.value })} fullWidth size="small" placeholder="e.g. Fr. Thomas Poovathanikunnel, Vicar" /></Grid>
                    </Grid>
                  </SectionPanel>
                  <SectionPanel elevation={0}>
                    <SectionLabel color="#BE185D"><WitnessIcon sx={{ fontSize: 13 }} /> Witnesses</SectionLabel>
                    <Grid container spacing={2}>
                      <Grid item xs={12}><Typography variant="caption" sx={{ fontWeight: 700, color: "#0F766E", mb: 0.5, display: "block", fontFamily: FONT }}>Witness 1</Typography></Grid>
                      <Grid item xs={12} sm={6}><StyledTextField label="Name" value={formData.witness1Name} onChange={(e) => handleChange({ witness1Name: e.target.value })} fullWidth size="small" /></Grid>
                      <Grid item xs={12} sm={6}><StyledTextField label="Address" value={formData.witness1Address} onChange={(e) => handleChange({ witness1Address: e.target.value })} fullWidth size="small" placeholder="e.g. Plackattu, Ponkunnam" /></Grid>
                      <Grid item xs={12}><Divider sx={{ borderColor: "#CCFBF1" }} /><Typography variant="caption" sx={{ fontWeight: 700, color: "#0F766E", mt: 1.5, mb: 0.5, display: "block", fontFamily: FONT }}>Witness 2</Typography></Grid>
                      <Grid item xs={12} sm={6}><StyledTextField label="Name" value={formData.witness2Name} onChange={(e) => handleChange({ witness2Name: e.target.value })} fullWidth size="small" /></Grid>
                      <Grid item xs={12} sm={6}><StyledTextField label="Address" value={formData.witness2Address} onChange={(e) => handleChange({ witness2Address: e.target.value })} fullWidth size="small" placeholder="e.g. Uthirakulathu, Aruvikuzhy" /></Grid>
                    </Grid>
                  </SectionPanel>
                  <SectionPanel elevation={0}>
                    <SectionLabel><FamilyIcon sx={{ fontSize: 13 }} /> Additional Notes</SectionLabel>
                    <StyledTextField label="Notes (optional)" value={formData.notes} onChange={(e) => handleChange({ notes: e.target.value })} fullWidth multiline rows={3} size="small" placeholder="Any remarks or additional information..." />
                  </SectionPanel>
                </TabPanel>
              </Box>
            </DialogContent>
            <DialogActions sx={{ p: 3, borderTop: "1px solid #CCFBF1", gap: 1.5, flexWrap: "wrap" }}>
              <Button variant="outlined" onClick={() => { setIsModalVisible(false); resetForm(); }} sx={{ borderRadius: 8, textTransform: "none", fontWeight: 600, fontFamily: FONT, borderColor: "#CBD5E1", color: "#64748B" }}>Cancel</Button>
              {tabIndex > 0 && <Button variant="outlined" onClick={() => setTabIndex((t) => t - 1)} sx={{ borderRadius: 8, textTransform: "none", fontWeight: 600, fontFamily: FONT, borderColor: "#14B8A6", color: "#0F766E" }}>← Previous</Button>}
              {tabIndex < 3 && <Button variant="contained" onClick={() => setTabIndex((t) => t + 1)} sx={{ borderRadius: 8, textTransform: "none", fontWeight: 600, fontFamily: FONT, backgroundColor: "#0F766E" }}>Next →</Button>}
              {tabIndex === 3 && (
                <GradientButton type="submit" disabled={isLoading} sx={{ flex: 1, minWidth: 160 }}>
                  {isLoading ? <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}><CircularProgress size={18} color="inherit" /><span>Saving…</span></Box> : isEditing ? "Update Record" : "Save Marriage Record"}
                </GradientButton>
              )}
            </DialogActions>
          </form>
        </Dialog>

        <MarriagePrintSetup
          open={setupOpen}
          onClose={() => setSetupOpen(false)}
          onSettingsSaved={(s) => setPrintSettings(s)}
        />

        <Snackbar open={Boolean(message)} autoHideDuration={6000} onClose={() => setMessage(null)} anchorOrigin={{ vertical: "bottom", horizontal: "right" }}>
          <Alert onClose={() => setMessage(null)} severity={message?.type || "info"} variant="filled" sx={{ borderRadius: "8px", fontFamily: FONT, backgroundColor: message?.type === "error" ? "#DC2626" : "#0F766E" }}>
            {message?.text}
          </Alert>
        </Snackbar>
      </Box>
    </ThemeProvider>
  );
};

export default MarriagePage;