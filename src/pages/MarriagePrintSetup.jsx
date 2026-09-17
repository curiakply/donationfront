/**
 * MarriagePrintSetup.jsx
 *
 * API (matches controller):
 *   GET    /print-settings/marriage          → { collectionName, ...settings }
 *   PUT    /print-settings/marriage          → { message, settings }
 *   DELETE /print-settings/marriage          → { message }  (reset)
 *   POST   /upload/logo/marriage             → { logoUrl }  (file upload)
 */

import React, { useState, useEffect, useRef, useCallback } from "react";
import axiosInstance from "../axiosConfig";
import {
  Dialog, DialogTitle, DialogContent, DialogActions,
  Button, Typography, Box, Grid, TextField, Switch,
  FormControlLabel, Divider, IconButton, Slider, Chip,
  Tabs, Tab, Paper, Tooltip, Alert, CircularProgress,
} from "@mui/material";
import {
  Close as CloseIcon,
  Settings as SettingsIcon,
  RestartAlt as ResetIcon,
  CheckCircle as SavedIcon,
  Image as ImageIcon,
  Delete as DeleteIcon,
  CloudSync as SyncIcon,
  CloudUpload as UploadIcon,
} from "@mui/icons-material";

// ─── API ──────────────────────────────────────────────────────────────────────
const API        = "/print-settings/marriage";
const UPLOAD_API = "/print-settings/logo/marriage";

// ─── Defaults ─────────────────────────────────────────────────────────────────
export const DEFAULT_PRINT_SETTINGS = {
  headerLine1: "", headerLine2: "", headerLine3: "", headerLine4: "",
  churchNameSize: "large",
  showLogo: false, logoUrl: "",          // ← logoUrl (file path), not base64
  showHeader: true, showChurchName: true, showSubtitle: true,
  showCertNumbers: true, showDatePlace: true,
  showGroom: true, showBride: true,
  showCeremony: true, showWitnesses: true, showNotes: true,
  showTextSeal: true, showMinisterSig: true, showPrintDate: true,
  marginTop: 10, marginLeft: 14, marginRight: 14,
  pageSize: "a4portrait", theme: "classic", vicarName: "",
};

// ─── Shared sx ────────────────────────────────────────────────────────────────
const fieldSx = {
  "& .MuiOutlinedInput-root": {
    borderRadius: 2, fontFamily: "Inter, system-ui, sans-serif",
    "& fieldset": { borderColor: "#CCFBF1" },
    "&:hover fieldset": { borderColor: "#14B8A6" },
    "&.Mui-focused fieldset": { borderColor: "#0F766E" },
  },
  "& .MuiInputLabel-root": { fontFamily: "Inter, system-ui, sans-serif" },
};

const switchSx = {
  "& .MuiSwitch-switchBase.Mui-checked": { color: "#0F766E" },
  "& .MuiSwitch-switchBase.Mui-checked + .MuiSwitch-track": { backgroundColor: "#14B8A6" },
};

// ─── SettingRow ───────────────────────────────────────────────────────────────
const SettingRow = ({ label, hint, children }) => (
  <Box sx={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", py: 1.2, borderBottom: "1px solid #F0FDFA" }}>
    <Box sx={{ flex: 1, pr: 2 }}>
      <Typography sx={{ fontSize: "0.82rem", fontWeight: 600, color: "#134E4A", fontFamily: "Inter, system-ui, sans-serif" }}>{label}</Typography>
      {hint && <Typography sx={{ fontSize: "0.71rem", color: "#64748B", mt: 0.2 }}>{hint}</Typography>}
    </Box>
    <Box sx={{ flexShrink: 0 }}>{children}</Box>
  </Box>
);

// ─── SectionToggle ────────────────────────────────────────────────────────────
const SectionToggle = ({ label, hint, k, settings, upd }) => (
  <SettingRow label={label} hint={hint}>
    <Switch
      checked={!!settings[k]}
      onChange={(e) => upd(k, e.target.checked)}
      size="small" sx={switchSx}
    />
  </SettingRow>
);

// ─── PANEL 0: Header ──────────────────────────────────────────────────────────
const HeaderPanel = ({ settings, upd, fileInputRef, onLogoUpload, logoUploading }) => (
  <Box>
    <Alert severity="info" sx={{ mb: 2, fontSize: "0.78rem", borderRadius: 2 }}>
      <strong>Line 1</strong> defaults to the record's <em>Place of Marriage</em> if left blank.
    </Alert>

    <Grid container spacing={2} sx={{ mb: 2 }}>
      {[
        ["headerLine1", "Line 1 — Church Name",   "e.g. Holy Family Forane Church, Ponkunnam"],
        ["headerLine2", "Line 2 — Diocese / Sub", "e.g. Diocese of Palai"],
        ["headerLine3", "Line 3 — Address",       "e.g. Ponkunnam, Kottayam – 686 506"],
        ["headerLine4", "Line 4 — Contact",       "e.g. Tel: 04828 222 301"],
      ].map(([key, label, ph]) => (
        <Grid item xs={12} sm={6} key={key}>
          <TextField
            label={label} value={settings[key] || ""} fullWidth size="small" placeholder={ph}
            onChange={(e) => upd(key, e.target.value)}
            sx={fieldSx}
          />
        </Grid>
      ))}

      <Grid item xs={12}>
        <Typography sx={{ fontSize: "0.78rem", fontWeight: 600, color: "#134E4A", mb: 1, fontFamily: "Inter, system-ui, sans-serif" }}>
          Church Name Font Size
        </Typography>
        <Box sx={{ display: "flex", gap: 1 }}>
          {["small", "medium", "large"].map((s) => (
            <Chip key={s}
              label={s.charAt(0).toUpperCase() + s.slice(1)}
              onClick={() => upd("churchNameSize", s)}
              variant={settings.churchNameSize === s ? "filled" : "outlined"}
              sx={{ cursor: "pointer", ...(settings.churchNameSize === s ? { backgroundColor: "#0F766E", color: "white" } : { borderColor: "#CCFBF1", color: "#64748B" }) }}
            />
          ))}
        </Box>
      </Grid>
    </Grid>

    <Divider sx={{ borderColor: "#CCFBF1", my: 2 }} />

    <Typography sx={{ fontSize: "0.78rem", fontWeight: 700, color: "#134E4A", mb: 1.5, fontFamily: "Inter, system-ui, sans-serif" }}>
      Church Logo
    </Typography>

    <Box sx={{ display: "flex", gap: 2, alignItems: "flex-start", flexWrap: "wrap" }}>

      {/* Preview box */}
      {settings.logoUrl ? (
        <Box sx={{ position: "relative" }}>
          <Box
            component="img"
            src={`${settings.logoUrl}${settings.logoUrl?.includes("raw.githubusercontent") ? `?v=${Date.now()}` : ""}`}
            sx={{ width: 64, height: 64, objectFit: "contain", borderRadius: 2, border: "1px solid #CCFBF1", display: "block" }}
          />
          <IconButton size="small"
            onClick={() => { upd("logoUrl", ""); upd("showLogo", false); }}
            sx={{ position: "absolute", top: -8, right: -8, backgroundColor: "#FEE2E2", width: 22, height: 22 }}>
            <DeleteIcon sx={{ fontSize: 13, color: "#DC2626" }} />
          </IconButton>
        </Box>
      ) : (
        <Box sx={{ width: 64, height: 64, borderRadius: 2, border: "2px dashed #CCFBF1", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
          {logoUploading
            ? <CircularProgress size={22} sx={{ color: "#14B8A6" }} />
            : <ImageIcon sx={{ color: "#CBD5E1", fontSize: 28 }} />}
        </Box>
      )}

      <Box>
        {/* Hidden file input */}
        <input
          ref={fileInputRef}
          type="file"
          accept="image/png,image/jpeg,image/webp,image/svg+xml"
          style={{ display: "none" }}
          onChange={onLogoUpload}
        />

        <Button
          variant="outlined"
          size="small"
          startIcon={logoUploading ? <CircularProgress size={13} /> : <UploadIcon sx={{ fontSize: 15 }} />}
          onClick={() => fileInputRef.current?.click()}
          disabled={logoUploading}
          sx={{ borderRadius: 8, textTransform: "none", borderColor: "#14B8A6", color: "#0F766E", mb: 1, display: "block" }}
        >
          {logoUploading ? "Uploading…" : settings.logoUrl ? "Replace Logo" : "Upload Logo"}
        </Button>

        <FormControlLabel
          control={
            <Switch
              checked={!!settings.showLogo && !!settings.logoUrl}
              onChange={(e) => upd("showLogo", e.target.checked)}
              disabled={!settings.logoUrl}
              size="small" sx={switchSx}
            />
          }
          label={<Typography sx={{ fontSize: "0.75rem", color: "#64748B" }}>Show logo on PDF</Typography>}
        />
        <Typography sx={{ fontSize: "0.7rem", color: "#94A3B8", mt: 0.5 }}>
          PNG, JPEG, or WebP · max 2 MB · placed top-left
        </Typography>
      </Box>
    </Box>
  </Box>
);

// ─── PANEL 1: Sections ────────────────────────────────────────────────────────
const SectionsPanel = ({ settings, upd }) => (
  <Box>
    <Typography sx={{ fontSize: "0.72rem", fontWeight: 700, color: "#64748B", letterSpacing: "0.07em", textTransform: "uppercase", mb: 1 }}>
      Header &amp; Identity
    </Typography>
    <Paper variant="outlined" sx={{ borderColor: "#CCFBF1", borderRadius: 2, px: 2, mb: 2 }}>
      <SectionToggle label="Show header block"                    k="showHeader"      settings={settings} upd={upd} />
      <SectionToggle label="Show church name"                     k="showChurchName"  settings={settings} upd={upd} />
      <SectionToggle label="Show 'Certificate of Marriage' label" k="showSubtitle"    settings={settings} upd={upd} />
      <SectionToggle label="Show certificate / registration Nos"  k="showCertNumbers" settings={settings} upd={upd} />
      <SectionToggle label="Show date &amp; place banner"         k="showDatePlace"   settings={settings} upd={upd} />
    </Paper>

    <Typography sx={{ fontSize: "0.72rem", fontWeight: 700, color: "#64748B", letterSpacing: "0.07em", textTransform: "uppercase", mb: 1 }}>
      Persons
    </Typography>
    <Paper variant="outlined" sx={{ borderColor: "#CCFBF1", borderRadius: 2, px: 2, mb: 2 }}>
      <SectionToggle label="Show bridegroom section" k="showGroom" settings={settings} upd={upd} />
      <SectionToggle label="Show bride section"      k="showBride" settings={settings} upd={upd} />
    </Paper>

    <Typography sx={{ fontSize: "0.72rem", fontWeight: 700, color: "#64748B", letterSpacing: "0.07em", textTransform: "uppercase", mb: 1 }}>
      Ceremony &amp; Footer
    </Typography>
    <Paper variant="outlined" sx={{ borderColor: "#CCFBF1", borderRadius: 2, px: 2, mb: 2 }}>
      <SectionToggle label="Show ceremony details"        k="showCeremony"    settings={settings} upd={upd} />
      <SectionToggle label="Show witnesses"               k="showWitnesses"   settings={settings} upd={upd} />
      <SectionToggle label="Show notes / remarks"         k="showNotes"       settings={settings} upd={upd} />
      <SectionToggle label="Show place &amp; date (left)" k="showDatePlace"   settings={settings} upd={upd} hint="Bottom-left zone: place name + today's date" />
      <SectionToggle label="Show seal box (middle)"       k="showTextSeal"    settings={settings} upd={upd} hint="Bottom-centre zone: church seal rectangle" />
      <SectionToggle label="Show minister signature line" k="showMinisterSig" settings={settings} upd={upd} />
      <SectionToggle label="Show 'Printed on …' footer"  k="showPrintDate"   settings={settings} upd={upd} />
    </Paper>
  </Box>
);

// ─── PANEL 2: Margins ─────────────────────────────────────────────────────────
const MarginsPanel = ({ settings, upd }) => (
  <Box>
    <Alert severity="info" sx={{ mb: 2, fontSize: "0.78rem", borderRadius: 2 }}>
      All values are in <strong>millimetres</strong>. Standard A4 is 210 × 297 mm.
    </Alert>

    {[["marginTop","Top Margin",5,40],["marginLeft","Left Margin",5,40],["marginRight","Right Margin",5,40]].map(([key, label, min, max]) => (
      <Box key={key} sx={{ mb: 3 }}>
        <Box sx={{ display: "flex", justifyContent: "space-between", mb: 0.5 }}>
          <Typography sx={{ fontSize: "0.82rem", fontWeight: 600, color: "#134E4A", fontFamily: "Inter, system-ui, sans-serif" }}>{label}</Typography>
          <Chip label={`${settings[key]} mm`} size="small" sx={{ backgroundColor: "#CCFBF1", color: "#0F766E", fontWeight: 700 }} />
        </Box>
        <Slider value={settings[key]} min={min} max={max} step={1}
          onChange={(_, v) => upd(key, v)}
          sx={{ color: "#0F766E", "& .MuiSlider-thumb": { width: 16, height: 16 }, "& .MuiSlider-track": { height: 4 }, "& .MuiSlider-rail": { height: 4 } }}
        />
      </Box>
    ))}

    <Divider sx={{ borderColor: "#CCFBF1", my: 2 }} />

    <Typography sx={{ fontSize: "0.82rem", fontWeight: 700, color: "#134E4A", mb: 0.5, fontFamily: "Inter, system-ui, sans-serif" }}>
      Default Vicar / Minister Name
    </Typography>
    <Typography sx={{ fontSize: "0.73rem", color: "#64748B", mb: 1.5 }}>
      Pre-fills the vicar field in the print dialog. Can still be overridden per certificate.
    </Typography>
    <TextField
      label="Default Vicar Name" value={settings.vicarName || ""} fullWidth size="small"
      placeholder="e.g. Fr. Thomas Poovathanikunnel"
      onChange={(e) => upd("vicarName", e.target.value)}
      sx={fieldSx}
    />
  </Box>
);

// ─── Main Component ───────────────────────────────────────────────────────────
const MarriagePrintSetup = ({ open, onClose, onSettingsSaved }) => {
  const [settings,      setSettings]      = useState({ ...DEFAULT_PRINT_SETTINGS });
  const [loading,       setLoading]       = useState(false);
  const [saving,        setSaving]        = useState(false);
  const [logoUploading, setLogoUploading] = useState(false);
  const [saved,         setSaved]         = useState(false);
  const [error,         setError]         = useState("");
  const [tabIndex,      setTabIndex]      = useState(0);
  const fileInputRef = useRef(null);

  // Fetch from DB on open
  useEffect(() => {
    if (!open) return;
    setTabIndex(0); setSaved(false); setError("");
    setLoading(true);
    axiosInstance.get(API)
      .then((res) => {
        const data = res.data || {};
        // Migrate legacy logoDataUrl → logoUrl (if old records exist)
        if (data.logoDataUrl && !data.logoUrl) data.logoUrl = data.logoDataUrl;
        delete data.logoDataUrl;
        setSettings({ ...DEFAULT_PRINT_SETTINGS, ...data });
      })
      .catch((err) => {
        if (err?.response?.status === 404) setSettings({ ...DEFAULT_PRINT_SETTINGS });
        else setError("Could not load print settings from server.");
      })
      .finally(() => setLoading(false));
  }, [open]);

  // Stable single-key updater
  const upd = useCallback((key, value) => {
    setSettings((prev) => ({ ...prev, [key]: value }));
    setSaved(false);
  }, []);

  // ── Logo upload: send file to server, get back a URL ──────────────────────
  const handleLogoUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    e.target.value = "";

    const previewUrl = URL.createObjectURL(file);
    setSettings((prev) => ({ ...prev, logoUrl: previewUrl, showLogo: true }));
    setSaved(false);

    setLogoUploading(true);
    try {
      const formData = new FormData();
      formData.append("logo", file);
      const res = await axiosInstance.post(UPLOAD_API, formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      const serverUrl = res.data?.logoUrl;
      if (serverUrl) {
        // Store clean URL in state (no cache-buster — saved cleanly to DB)
        setSettings((prev) => ({ ...prev, logoUrl: serverUrl, showLogo: true }));
      }
    } catch {
      setError("Logo upload failed. Please try again.");
      setSettings((prev) => ({ ...prev, logoUrl: "", showLogo: false }));
    } finally {
      setLogoUploading(false);
    }
  };

  // ── Save settings ─────────────────────────────────────────────────────────
  const handleSave = async () => {
    setSaving(true); setError("");
    try {
      // Never save base64 or blob URLs to DB
      const payload = { ...settings };
      if (payload.logoUrl?.startsWith("blob:")) delete payload.logoUrl;
      delete payload.logoDataUrl; // remove legacy field if present

      const res = await axiosInstance.put(API, payload);
      const savedData = { ...DEFAULT_PRINT_SETTINGS, ...(res.data?.settings || res.data || payload) };
      setSettings(savedData);
      onSettingsSaved?.(savedData);
      setSaved(true);
      setTimeout(() => setSaved(false), 2500);
    } catch {
      setError("Failed to save settings. Please try again.");
    } finally {
      setSaving(false);
    }
  };

  // ── Reset ─────────────────────────────────────────────────────────────────
  const handleReset = async () => {
    if (!window.confirm("Reset all print settings to defaults?")) return;
    setSaving(true); setError("");
    try {
      await axiosInstance.delete(API);
      const def = { ...DEFAULT_PRINT_SETTINGS };
      setSettings(def);
      onSettingsSaved?.(def);
      setSaved(true);
      setTimeout(() => setSaved(false), 2500);
    } catch {
      setError("Failed to reset settings.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth
      PaperProps={{ elevation: 0, sx: { borderRadius: "16px", border: "1px solid #CCFBF1", boxShadow: "0 16px 48px rgba(15,118,110,0.15)" } }}>

      <DialogTitle sx={{ display: "flex", alignItems: "center", justifyContent: "space-between", background: "linear-gradient(135deg, #F0FDFA, #CCFBF1)", borderBottom: "1px solid #CCFBF1", pb: 1.5 }}>
        <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
          <Box sx={{ width: 38, height: 38, borderRadius: "10px", background: "linear-gradient(135deg, #14B8A6, #0F766E)", display: "flex", alignItems: "center", justifyContent: "center" }}>
            <SettingsIcon sx={{ color: "white", fontSize: 19 }} />
          </Box>
          <Box>
            <Typography sx={{ fontWeight: 700, fontFamily: "Inter, system-ui, sans-serif", color: "#134E4A", fontSize: "0.95rem" }}>
              Print Setup
            </Typography>
            <Typography sx={{ fontSize: "0.71rem", color: "#64748B" }}>
              Settings stored in database — shared across all users
            </Typography>
          </Box>
        </Box>
        <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
          {(loading || logoUploading) && (
            <Tooltip title={logoUploading ? "Uploading logo…" : "Loading…"}>
              <CircularProgress size={16} sx={{ color: "#0F766E" }} />
            </Tooltip>
          )}
          {saved && (
            <Chip icon={<SavedIcon sx={{ fontSize: 14 }} />} label="Saved to DB"
              size="small" sx={{ backgroundColor: "#DCFCE7", color: "#15803D", fontWeight: 700 }} />
          )}
          <IconButton size="small" onClick={onClose}>
            <CloseIcon fontSize="small" sx={{ color: "#64748B" }} />
          </IconButton>
        </Box>
      </DialogTitle>

      <Tabs value={tabIndex} onChange={(_, v) => setTabIndex(v)}
        sx={{ borderBottom: "1px solid #CCFBF1", px: 2, "& .MuiTab-root": { textTransform: "none", fontFamily: "Inter, system-ui, sans-serif", fontWeight: 600, fontSize: "0.82rem", minWidth: 0, px: 2 }, "& .Mui-selected": { color: "#0F766E !important" }, "& .MuiTabs-indicator": { backgroundColor: "#0F766E" } }}>
        <Tab label="🏛  Header" />
        <Tab label="📋  Sections" />
        <Tab label="📐  Margins" />
      </Tabs>

      <DialogContent sx={{ pt: 2.5, pb: 1, maxHeight: "58vh", overflowY: "auto" }}>
        {loading ? (
          <Box sx={{ display: "flex", justifyContent: "center", alignItems: "center", height: 200 }}>
            <CircularProgress sx={{ color: "#0F766E" }} />
          </Box>
        ) : (
          <>
            {error && (
              <Alert severity="error" sx={{ mb: 2, borderRadius: 2, fontSize: "0.78rem" }} onClose={() => setError("")}>{error}</Alert>
            )}
            {tabIndex === 0 && (
              <HeaderPanel
                settings={settings} upd={upd}
                fileInputRef={fileInputRef}
                onLogoUpload={handleLogoUpload}
                logoUploading={logoUploading}
              />
            )}
            {tabIndex === 1 && <SectionsPanel settings={settings} upd={upd} />}
            {tabIndex === 2 && <MarginsPanel  settings={settings} upd={upd} />}
          </>
        )}
      </DialogContent>

      <DialogActions sx={{ px: 3, pb: 2.5, pt: 1.5, gap: 1, borderTop: "1px solid #CCFBF1" }}>
        <Tooltip title="Delete saved settings and reset to defaults">
          <Button variant="outlined" startIcon={<ResetIcon />} onClick={handleReset}
            disabled={saving || loading || logoUploading}
            sx={{ borderRadius: 8, textTransform: "none", fontWeight: 600, borderColor: "#FCA5A5", color: "#DC2626" }}>
            Reset
          </Button>
        </Tooltip>
        <Box sx={{ flex: 1 }} />
        <Button variant="outlined" onClick={onClose} disabled={saving}
          sx={{ borderRadius: 8, textTransform: "none", fontWeight: 600, borderColor: "#CBD5E1", color: "#64748B" }}>
          Close
        </Button>
        <Button variant="contained" onClick={handleSave}
          disabled={saving || loading || logoUploading}
          startIcon={saving ? <CircularProgress size={14} color="inherit" /> : <SyncIcon />}
          sx={{ borderRadius: 8, textTransform: "none", fontWeight: 600, background: "linear-gradient(to right, #14B8A6, #0F766E)", "&:hover": { background: "linear-gradient(to right, #0F766E, #115E59)" } }}>
          {saving ? "Saving…" : "Save to Database"}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default MarriagePrintSetup;