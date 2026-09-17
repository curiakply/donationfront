import React, { useState, useEffect, useRef } from "react";
import {
  Box, Typography, Button, Select, MenuItem, FormControl, InputLabel,
  Card, CardContent, CardActionArea, Grid, Chip, CircularProgress,
  Snackbar, Alert, Divider, TextField, InputAdornment, Avatar,
  Stepper, Step, StepLabel, Paper,
} from "@mui/material";
import { styled } from "@mui/material/styles";
import {
  Print as PrintIcon, Search as SearchIcon,
  Description as TemplateIcon, Person as PersonIcon,
  Visibility as PreviewIcon, CheckCircle as CheckIcon,
} from "@mui/icons-material";
import axiosInstance from "../axiosConfig";

// ─── Helpers ──────────────────────────────────────────────────────────────────
const TEMPLATES_SIZES = [
  { label: "A4 Portrait",  value: "a4",     w: 794,  h: 1123 },
  { label: "A4 Landscape", value: "a4l",    w: 1123, h: 794  },
  { label: "US Letter",    value: "letter", w: 816,  h: 1056 },
  { label: "ID Card",      value: "id",     w: 638,  h: 406  },
  { label: "Badge",        value: "badge",  w: 400,  h: 560  },
];

// Replace {{placeholders}} with actual data from record
function fillTemplate(elements, record) {
  const today = new Date();
  const dateStr = today.toLocaleDateString("en-IN", { day:"2-digit", month:"long", year:"numeric" });
  const data = {
    name:       record.name || "",
    phone:      record.phone || "",
    building:   record.building || "",
    city:       record.city || "",
    district:   record.district || "",
    state:      record.state || "",
    pincode:    record.pincode || "",
    date:       dateStr,
    reg_number: record.reg_number || record.regNumber || record._id?.slice(-6).toUpperCase() || "",
    year:       today.getFullYear().toString(),
    // extend with any extra fields on the record
    ...Object.fromEntries(Object.entries(record).map(([k,v])=>[k, String(v||"")])),
  };
  return elements.map(el => {
    if (!el.content || !el.content.includes("{{")) return el;
    const filled = el.content.replace(/\{\{([^}]+)\}\}/g, (_, key) => data[key.trim()] ?? `{{${key}}}`);
    return { ...el, content: filled };
  });
}

// Render elements to HTML string for print
function elementsToHtml(elements, canvasW, canvasH, canvasBg) {
  const sorted = [...elements].sort((a, b) => a.zIndex - b.zIndex);
  const elHtml = sorted.map(el => {
    const s = `position:absolute;left:${el.x}px;top:${el.y}px;width:${el.w}px;height:${el.h}px;z-index:${el.zIndex};opacity:${el.opacity/100};transform:rotate(${el.rotation}deg);`;
    if (el.type === "image")   return `<div style="${s}"><img src="${el.src||""}" style="width:100%;height:100%;object-fit:contain"></div>`;
    if (el.type === "divider") return `<div style="${s}display:flex;align-items:center;"><hr style="width:100%;border:none;border-top:${el.bwidth||2}px solid ${el.bcolor||"#0F766E"}"></div>`;
    if (el.type === "rect")    return `<div style="${s}background:${el.bg||"transparent"};border-radius:${el.radius||0}px;border:${el.bwidth||0}px solid ${el.bcolor||"transparent"};"></div>`;
    if (el.type === "circle")  return `<div style="${s}background:${el.bg||"transparent"};border-radius:50%;border:${el.bwidth||0}px solid ${el.bcolor||"transparent"};"></div>`;
    return `<div style="${s}display:flex;align-items:${el.valign||"center"};justify-content:${el.align||"center"};font-size:${el.fontSize||16}px;font-family:${el.fontFamily||"Georgia,serif"};color:${el.color||"#1a1a1a"};background:${el.bg||"transparent"};font-weight:${el.weight||"400"};font-style:${el.fontStyle||"normal"};letter-spacing:${el.ls||0}px;line-height:${el.lh||1.4};padding:4px;">${el.content||""}</div>`;
  }).join("");
  return `<div style="position:relative;width:${canvasW}px;height:${canvasH}px;background:${canvasBg};overflow:hidden;">${elHtml}</div>`;
}

// ─── Styled ───────────────────────────────────────────────────────────────────
const StepCard = styled(Card)(({ theme, active, done }) => ({
  borderRadius: 12,
  border: `2px solid ${done ? theme.palette.success.light : active ? theme.palette.primary.main : theme.palette.divider}`,
  boxShadow: active ? "0 4px 20px rgba(15,118,110,0.15)" : "0 2px 8px rgba(0,0,0,0.06)",
  transition: "all 0.2s",
}));

const TemplateCard = styled(Card)(({ theme, selected }) => ({
  borderRadius: 10,
  border: `2px solid ${selected ? theme.palette.primary.main : theme.palette.divider}`,
  cursor: "pointer", transition: "all 0.15s",
  "&:hover": { borderColor: theme.palette.primary.light, boxShadow: "0 4px 16px rgba(15,118,110,0.12)" },
}));

const RecordRow = styled(Box)(({ theme, selected }) => ({
  display: "flex", alignItems: "center", gap: 12, padding: "10px 14px",
  borderRadius: 8, cursor: "pointer", transition: "all 0.1s",
  background: selected ? theme.palette.primary.main + "12" : "transparent",
  border: `1px solid ${selected ? theme.palette.primary.main : "transparent"}`,
  "&:hover": { background: selected ? undefined : theme.palette.action.hover },
}));

// ─── Canvas Preview (scaled) ──────────────────────────────────────────────────
const CanvasPreview = ({ elements, canvasW, canvasH, canvasBg, scale = 0.5 }) => (
  <Box sx={{ position: "relative", width: canvasW * scale, height: canvasH * scale, background: canvasBg, boxShadow: "0 4px 20px rgba(0,0,0,0.15)", overflow: "hidden", flexShrink: 0, borderRadius: 1 }}>
    {[...elements].sort((a, b) => a.zIndex - b.zIndex).map(el => {
      const s = {
        position: "absolute", left: el.x * scale, top: el.y * scale,
        width: el.w * scale, height: el.h * scale,
        zIndex: el.zIndex, opacity: el.opacity / 100,
        transform: `rotate(${el.rotation}deg)`,
      };
      if (el.type === "image") return <Box key={el.id} sx={s}><img src={el.src||""} alt="" style={{width:"100%",height:"100%",objectFit:"contain"}}/></Box>;
      if (el.type === "divider") return <Box key={el.id} sx={{...s,display:"flex",alignItems:"center"}}><hr style={{width:"100%",border:"none",borderTop:`${(el.bwidth||2)*scale}px solid ${el.bcolor||"#0F766E"}`}}/></Box>;
      if (el.type === "rect")   return <Box key={el.id} sx={{...s,background:el.bg||"transparent",borderRadius:`${el.radius||0}px`,border:`${(el.bwidth||0)*scale}px solid ${el.bcolor||"transparent"}`}}/>;
      if (el.type === "circle") return <Box key={el.id} sx={{...s,background:el.bg||"transparent",borderRadius:"50%",border:`${(el.bwidth||0)*scale}px solid ${el.bcolor||"transparent"}`}}/>;
      return (
        <Box key={el.id} sx={{...s,display:"flex",alignItems:el.valign||"center",justifyContent:el.align||"center",
          fontSize:`${(el.fontSize||16)*scale}px`,fontFamily:el.fontFamily||"Georgia,serif",
          color:el.color||"#1a1a1a",background:el.bg||"transparent",
          fontWeight:el.weight||"400",fontStyle:el.fontStyle||"normal",
          letterSpacing:`${(el.ls||0)*scale}px`,lineHeight:el.lh||1.4,padding:"2px",overflow:"hidden"}}>
          {el.content||""}
        </Box>
      );
    })}
  </Box>
);

// ─── Main Component ───────────────────────────────────────────────────────────
const PrintPage = () => {
  const [step, setStep] = useState(0); // 0=template, 1=record, 2=preview

  // Templates
  const [templates, setTemplates]         = useState([]);
  const [loadingTemplates, setLoadingTemplates] = useState(false);
  const [selectedTemplate, setSelectedTemplate] = useState(null);
  const [sizeFilter, setSizeFilter]       = useState("all");

  // Records (congregations)
  const [records, setRecords]             = useState([]);
  const [loadingRecords, setLoadingRecords] = useState(false);
  const [selectedRecord, setSelectedRecord] = useState(null);
  const [search, setSearch]               = useState("");

  // Preview
  const [filledElements, setFilledElements] = useState([]);
  const [printing, setPrinting]           = useState(false);
  const [message, setMessage]             = useState(null);

  // Load templates on mount
  useEffect(() => {
    const fetchTemplates = async () => {
      setLoadingTemplates(true);
      try {
        const res = await axiosInstance.get("/print-template");
        setTemplates(res.data);
      } catch {
        setMessage({ type: "error", text: "Failed to load templates" });
      } finally {
        setLoadingTemplates(false);
      }
    };
    fetchTemplates();
  }, []);

  // Load records when moving to step 1
  useEffect(() => {
    if (step !== 1) return;
    const fetchRecords = async () => {
      setLoadingRecords(true);
      try {
        const res = await axiosInstance.get("/congregation/");
        setRecords(res.data);
      } catch {
        setMessage({ type: "error", text: "Failed to load records" });
      } finally {
        setLoadingRecords(false);
      }
    };
    fetchRecords();
  }, [step]);

  // Build preview when both are selected
  useEffect(() => {
    if (!selectedTemplate || !selectedRecord) return;
    const filled = fillTemplate(selectedTemplate.elements, selectedRecord);
    setFilledElements(filled);
  }, [selectedTemplate, selectedRecord]);

  const handleSelectTemplate = (tpl) => {
    setSelectedTemplate(tpl);
    setSelectedRecord(null);
    setFilledElements([]);
    setStep(1);
  };

  const handleSelectRecord = (rec) => {
    setSelectedRecord(rec);
    const filled = fillTemplate(selectedTemplate.elements, rec);
    setFilledElements(filled);
    setStep(2);
  };

  const handlePrint = () => {
    if (!selectedTemplate || !filledElements.length) return;
    setPrinting(true);
    const { canvasW, canvasH, canvasBg } = selectedTemplate;
    const html = elementsToHtml(filledElements, canvasW, canvasH, canvasBg || "#ffffff");
    const w = window.open("", "_blank");
    w.document.write(`<!DOCTYPE html><html><head><style>*{margin:0;padding:0;box-sizing:border-box}body{background:#fff}@media print{body{-webkit-print-color-adjust:exact;print-color-adjust:exact}}</style></head><body>${html}</body></html>`);
    w.document.close();
    setTimeout(() => { w.print(); setPrinting(false); }, 400);
  };

  const filteredTemplates = sizeFilter === "all" ? templates : templates.filter(t => t.pageSize === sizeFilter);
  const filteredRecords   = records.filter(r =>
    r.name?.toLowerCase().includes(search.toLowerCase()) ||
    r.city?.toLowerCase().includes(search.toLowerCase()) ||
    r.phone?.includes(search)
  );

  const tplSize = selectedTemplate ? TEMPLATES_SIZES.find(t => t.value === selectedTemplate.pageSize) : null;
  const previewScale = tplSize ? Math.min(0.45, 380 / tplSize.w) : 0.45;

  const stepLabels = ["Choose Template", "Select Record", "Preview & Print"];

  return (
    <Box sx={{ p: 3, minHeight: "calc(100vh - 64px)", background: "#F8FAFC" }}>

      {/* Header */}
      <Box sx={{ mb: 3 }}>
        <Typography variant="h5" sx={{ fontWeight: 700, color: "text.primary" }}>Print Center</Typography>
        <Typography variant="body2" sx={{ color: "text.secondary", mt: 0.5 }}>
          Select a template, choose a record, and print with live data
        </Typography>
      </Box>

      {/* Stepper */}
      <Paper sx={{ p: 2, mb: 3, borderRadius: 2, boxShadow: "0 2px 8px rgba(0,0,0,0.06)" }}>
        <Stepper activeStep={step} alternativeLabel>
          {stepLabels.map((label, i) => (
            <Step key={label} completed={step > i}>
              <StepLabel
                StepIconProps={{ sx: { color: step > i ? "success.main" : step === i ? "primary.main" : "text.disabled" } }}
                onClick={() => { if (i < step) setStep(i); }}
                sx={{ cursor: i < step ? "pointer" : "default" }}>
                {label}
              </StepLabel>
            </Step>
          ))}
        </Stepper>
      </Paper>

      <Grid container spacing={3}>

        {/* ── STEP 0: Template selection ── */}
        <Grid item xs={12} md={step === 2 ? 5 : 12}>
          <StepCard active={step === 0 ? 1 : 0} done={step > 0 ? 1 : 0}>
            <CardContent>
              <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between", mb: 2 }}>
                <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                  <TemplateIcon sx={{ color: "primary.main" }} />
                  <Typography sx={{ fontWeight: 700, fontSize: 15 }}>1. Choose Template</Typography>
                  {selectedTemplate && <Chip label={selectedTemplate.name} size="small" color="primary" sx={{ ml: 1 }}/>}
                </Box>
                {/* Size filter */}
                <FormControl size="small" sx={{ minWidth: 130 }}>
                  <Select value={sizeFilter} onChange={(e) => setSizeFilter(e.target.value)} sx={{ fontSize: 12 }}>
                    <MenuItem value="all" sx={{ fontSize: 12 }}>All sizes</MenuItem>
                    {TEMPLATES_SIZES.map(t => <MenuItem key={t.value} value={t.value} sx={{ fontSize: 12 }}>{t.label}</MenuItem>)}
                  </Select>
                </FormControl>
              </Box>

              {loadingTemplates ? (
                <Box sx={{ display: "flex", justifyContent: "center", py: 4 }}><CircularProgress/></Box>
              ) : filteredTemplates.length === 0 ? (
                <Box sx={{ textAlign: "center", py: 4 }}>
                  <Typography sx={{ color: "text.secondary" }}>No templates found. Create one in Print Designer.</Typography>
                </Box>
              ) : (
                <Grid container spacing={2}>
                  {filteredTemplates.map(tpl => {
                    const sz = TEMPLATES_SIZES.find(t => t.value === tpl.pageSize);
                    const isSelected = selectedTemplate?._id === tpl._id;
                    return (
                      <Grid item xs={12} sm={6} md={step === 2 ? 6 : 3} key={tpl._id}>
                        <TemplateCard selected={isSelected ? 1 : 0} onClick={() => handleSelectTemplate(tpl)}>
                          {/* Mini canvas preview */}
                          <Box sx={{ p: 1.5, background: "#F8FAFC", display: "flex", justifyContent: "center", position: "relative", minHeight: 120, alignItems: "center", overflow: "hidden" }}>
                            {sz && (
                              <Box sx={{ transform: `scale(${Math.min(0.18, 140 / sz.w)})`, transformOrigin: "center center" }}>
                                <CanvasPreview elements={tpl.elements} canvasW={sz.w} canvasH={sz.h} canvasBg={tpl.canvasBg||"#fff"} scale={1}/>
                              </Box>
                            )}
                            {isSelected && (
                              <CheckIcon sx={{ position: "absolute", top: 8, right: 8, color: "primary.main", fontSize: 20 }}/>
                            )}
                          </Box>
                          <Box sx={{ p: 1.5 }}>
                            <Typography sx={{ fontWeight: 700, fontSize: 13, mb: 0.5, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{tpl.name}</Typography>
                            <Box sx={{ display: "flex", gap: 0.5, flexWrap: "wrap" }}>
                              <Chip label={sz?.label || tpl.pageSize} size="small" sx={{ fontSize: 10, height: 18 }}/>
                              {tpl.elements?.some(el => (el.content||"").includes("{{")) && (
                                <Chip label="dynamic" size="small" sx={{ fontSize: 10, height: 18, background: "#eff6ff", color: "#1d4ed8" }}/>
                              )}
                            </Box>
                          </Box>
                        </TemplateCard>
                      </Grid>
                    );
                  })}
                </Grid>
              )}
            </CardContent>
          </StepCard>
        </Grid>

        {/* ── STEP 1: Record selection ── */}
        {step >= 1 && (
          <Grid item xs={12} md={step === 2 ? 4 : 6}>
            <StepCard active={step === 1 ? 1 : 0} done={step > 1 ? 1 : 0} sx={{ height: "100%" }}>
              <CardContent>
                <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 2 }}>
                  <PersonIcon sx={{ color: "primary.main" }}/>
                  <Typography sx={{ fontWeight: 700, fontSize: 15 }}>2. Select Record</Typography>
                  {selectedRecord && <Chip label={selectedRecord.name} size="small" color="primary" sx={{ ml: 1 }}/>}
                </Box>

                <TextField fullWidth size="small" placeholder="Search by name, city, phone..." value={search} onChange={(e) => setSearch(e.target.value)}
                  InputProps={{ startAdornment: <InputAdornment position="start"><SearchIcon sx={{ fontSize: 18, color: "text.secondary" }}/></InputAdornment> }}
                  sx={{ mb: 2, "& .MuiOutlinedInput-root": { borderRadius: 2 } }}/>

                {loadingRecords ? (
                  <Box sx={{ display: "flex", justifyContent: "center", py: 4 }}><CircularProgress/></Box>
                ) : (
                  <Box sx={{ maxHeight: 380, overflowY: "auto", display: "flex", flexDirection: "column", gap: 0.5 }}>
                    {filteredRecords.map(rec => {
                      const isSelected = selectedRecord?._id === rec._id;
                      return (
                        <RecordRow key={rec._id} selected={isSelected ? 1 : 0} onClick={() => handleSelectRecord(rec)}>
                          <Avatar sx={{ width: 34, height: 34, bgcolor: "primary.main", fontSize: 14, flexShrink: 0 }}>
                            {rec.name?.charAt(0) || "?"}
                          </Avatar>
                          <Box sx={{ flex: 1, minWidth: 0 }}>
                            <Typography sx={{ fontWeight: 600, fontSize: 13, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{rec.name}</Typography>
                            <Typography sx={{ fontSize: 11, color: "text.secondary" }}>{rec.city}{rec.district ? `, ${rec.district}` : ""} · {rec.phone}</Typography>
                          </Box>
                          {isSelected && <CheckIcon sx={{ color: "primary.main", fontSize: 18 }}/>}
                        </RecordRow>
                      );
                    })}
                    {filteredRecords.length === 0 && (
                      <Typography sx={{ textAlign: "center", py: 3, color: "text.secondary", fontSize: 13 }}>No records found</Typography>
                    )}
                  </Box>
                )}
              </CardContent>
            </StepCard>
          </Grid>
        )}

        {/* ── STEP 2: Preview & Print ── */}
        {step === 2 && selectedTemplate && selectedRecord && (
          <Grid item xs={12} md={3}>
            <StepCard active={1} sx={{ height: "100%" }}>
              <CardContent sx={{ display: "flex", flexDirection: "column", height: "100%" }}>
                <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 2 }}>
                  <PreviewIcon sx={{ color: "primary.main" }}/>
                  <Typography sx={{ fontWeight: 700, fontSize: 15 }}>3. Preview & Print</Typography>
                </Box>

                {/* Preview */}
                <Box sx={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", gap: 2 }}>
                  <Box sx={{ background: "#E2E8E7", borderRadius: 2, p: 2, display: "flex", justifyContent: "center", width: "100%" }}>
                    <CanvasPreview
                      elements={filledElements}
                      canvasW={selectedTemplate.canvasW}
                      canvasH={selectedTemplate.canvasH}
                      canvasBg={selectedTemplate.canvasBg || "#fff"}
                      scale={previewScale}
                    />
                  </Box>

                  {/* Data summary */}
                  <Box sx={{ width: "100%", p: 1.5, borderRadius: 2, background: "#F8FAFC", border: "1px solid", borderColor: "divider" }}>
                    <Typography sx={{ fontSize: 11, fontWeight: 700, color: "text.secondary", mb: 1, textTransform: "uppercase", letterSpacing: "0.06em" }}>Data being printed</Typography>
                    {[
                      ["Name",     selectedRecord.name],
                      ["Phone",    selectedRecord.phone],
                      ["City",     selectedRecord.city],
                      ["District", selectedRecord.district],
                      ["State",    selectedRecord.state],
                    ].filter(([,v])=>v).map(([label, val]) => (
                      <Box key={label} sx={{ display: "flex", gap: 1, mb: 0.3 }}>
                        <Typography sx={{ fontSize: 11, color: "text.secondary", minWidth: 55 }}>{label}:</Typography>
                        <Typography sx={{ fontSize: 11, fontWeight: 600 }}>{val}</Typography>
                      </Box>
                    ))}
                  </Box>
                </Box>

                <Divider sx={{ my: 2 }}/>

                <Button variant="contained" fullWidth size="large" startIcon={printing ? <CircularProgress size={18} color="inherit"/> : <PrintIcon/>}
                  onClick={handlePrint} disabled={printing}
                  sx={{ background: "linear-gradient(to right,#14B8A6,#0F766E)", boxShadow: "none", borderRadius: 2, fontWeight: 700, py: 1.2 }}>
                  {printing ? "Opening print dialog..." : "Print Now"}
                </Button>
                <Button variant="outlined" fullWidth sx={{ mt: 1, borderRadius: 2 }} onClick={() => { setStep(0); setSelectedRecord(null); setSelectedTemplate(null); setFilledElements([]); }}>
                  Start Over
                </Button>
              </CardContent>
            </StepCard>
          </Grid>
        )}
      </Grid>

      <Snackbar open={Boolean(message)} autoHideDuration={4000} onClose={() => setMessage(null)} anchorOrigin={{ vertical: "bottom", horizontal: "right" }}>
        <Alert onClose={() => setMessage(null)} severity={message?.type || "info"} variant="filled" sx={{ borderRadius: 2, backgroundColor: message?.type === "error" ? undefined : "#0F766E" }}>
          {message?.text}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default PrintPage;