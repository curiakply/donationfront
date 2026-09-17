import React, { useState, useEffect, useRef, useCallback } from "react";
import {
  Box, Typography, Button, IconButton, Tooltip, Slider,
  TextField, Select, MenuItem, FormControl, InputLabel,
  Snackbar, Alert, ToggleButton, ToggleButtonGroup, Chip,
  Dialog, DialogTitle, DialogContent, DialogActions,
  List, ListItem, ListItemText, ListItemSecondaryAction,
  CircularProgress, Divider as MuiDivider,
} from "@mui/material";
import { styled } from "@mui/material/styles";
import {
  GridOn as GridIcon, ZoomIn as ZoomInIcon, ZoomOut as ZoomOutIcon,
  Print as PrintIcon, Delete as DeleteIcon, ContentCopy as DuplicateIcon,
  FormatBold as BoldIcon, FormatItalic as ItalicIcon,
  FormatAlignLeft, FormatAlignCenter, FormatAlignRight,
  Refresh as ResetIcon, Layers as LayersIcon,
  KeyboardArrowUp, KeyboardArrowDown,
  Save as SaveIcon, Close as CloseIcon,
  CloudUpload as CloudUploadIcon, CloudDownload as CloudDownloadIcon,
  DataObject as PlaceholderIcon,
  Description as CertIcon,
} from "@mui/icons-material";
import { Type, Square, Circle, Minus, Image, Heading1 } from "lucide-react";
import axiosInstance from "../axiosConfig";

// ─── Styled helpers ───────────────────────────────────────────────────────────
const SidePanel = styled(Box)(({ theme }) => ({
  width: 240, minWidth: 240,
  background: theme.palette.background.paper,
  borderRight: `1px solid ${theme.palette.divider}`,
  display: "flex", flexDirection: "column", overflow: "hidden",
}));
const PropSection = styled(Box)(({ theme }) => ({
  padding: "10px 12px", borderBottom: `1px solid ${theme.palette.divider}`,
}));
const SectionLabel = styled(Typography)(({ theme }) => ({
  fontSize: 10, fontWeight: 700, letterSpacing: "0.08em",
  textTransform: "uppercase", color: theme.palette.text.secondary, marginBottom: 8,
}));
const CompactInput = styled(TextField)(() => ({
  "& .MuiInputBase-input": { padding: "5px 8px", fontSize: 12 },
  "& .MuiInputLabel-root": { fontSize: 12 },
  "& .MuiOutlinedInput-root": { borderRadius: 6 },
}));
const ElementBtn = styled(Box)(({ theme }) => ({
  display: "flex", alignItems: "center", gap: 8, padding: "7px 10px",
  borderRadius: 8, border: `1px solid ${theme.palette.divider}`,
  background: theme.palette.background.default, cursor: "grab",
  fontSize: 13, color: theme.palette.text.primary, marginBottom: 5,
  userSelect: "none", transition: "all 0.15s",
  "&:hover": { background: theme.palette.primary.light + "15", borderColor: theme.palette.primary.light },
  "&:active": { cursor: "grabbing" },
}));
const PlaceholderBtn = styled(Box)(({ theme }) => ({
  display: "flex", alignItems: "center", gap: 6, padding: "5px 8px",
  borderRadius: 6, border: `1px dashed ${theme.palette.primary.light}`,
  background: theme.palette.primary.light + "10", cursor: "pointer",
  fontSize: 11, color: theme.palette.primary.main, marginBottom: 4,
  userSelect: "none", transition: "all 0.15s", fontFamily: "monospace",
  "&:hover": { background: theme.palette.primary.light + "25" },
}));
const LayerItem = styled(Box)(({ theme, active }) => ({
  display: "flex", alignItems: "center", gap: 7, padding: "5px 12px",
  fontSize: 12, cursor: "pointer", color: theme.palette.text.primary,
  background: active ? theme.palette.primary.main + "15" : "transparent",
  borderLeft: active ? `2px solid ${theme.palette.primary.main}` : "2px solid transparent",
  transition: "all 0.1s", "&:hover": { background: theme.palette.action.hover },
}));
const Toolbar = styled(Box)(({ theme }) => ({
  display: "flex", alignItems: "center", gap: 6, padding: "8px 14px",
  background: theme.palette.background.paper,
  borderBottom: `1px solid ${theme.palette.divider}`,
  flexWrap: "wrap", minHeight: 50,
}));
const TbDivider = () => (
  <Box sx={{ width: "1px", height: 20, background: "rgba(0,0,0,0.1)", mx: 0.5 }} />
);

// ─── Constants ────────────────────────────────────────────────────────────────
let counter = 0;

// ─── Certificate types → API route + field map ────────────────────────────────
// Each entry defines:
//   route   – axiosInstance GET endpoint that returns an array of records
//   placeholders – array of { key, label, field } where `field` is the dot-path
//                  on each record used to fill the placeholder at print time
export const CERTIFICATE_TYPES = [
  { value: "none",     label: "— None (generic) —",  route: null,         placeholders: [] },
  {
    value: "marriage",
    label: "Marriage Certificate",
    route: "/marriage/",
    placeholders: [
      { key: "{{cert_no}}",             label: "Certificate No",          field: "certificateNo" },
      { key: "{{reg_no}}",              label: "Registration No",         field: "registrationNo" },
      { key: "{{groom_official}}",      label: "Groom Official Name",     field: "groom.officialName" },
      { key: "{{groom_baptismal}}",     label: "Groom Baptismal Name",    field: "groom.baptismalName" },
      { key: "{{groom_house}}",         label: "Groom House Name",        field: "groom.houseName" },
      { key: "{{groom_father}}",        label: "Groom Father Name",       field: "groom.fatherName" },
      { key: "{{groom_mother}}",        label: "Groom Mother Name",       field: "groom.motherName" },
      { key: "{{groom_parish}}",        label: "Groom Parish",            field: "groom.parish.name" },
      { key: "{{groom_diocese}}",       label: "Groom Diocese",           field: "groom.diocese.name" },
      { key: "{{groom_dob}}",           label: "Groom Date of Birth",     field: "groom.dob",            format: "date" },
      { key: "{{groom_baptism_date}}", label: "Groom Date of Baptism",   field: "groom.dateOfBaptism",  format: "date" },
      { key: "{{groom_confirm_date}}", label: "Groom Date of Confirm.",  field: "groom.dateOfConfirmation", format: "date" },
      { key: "{{bride_official}}",      label: "Bride Official Name",     field: "bride.officialName" },
      { key: "{{bride_baptismal}}",     label: "Bride Baptismal Name",    field: "bride.baptismalName" },
      { key: "{{bride_house}}",         label: "Bride House Name",        field: "bride.houseName" },
      { key: "{{bride_father}}",        label: "Bride Father Name",       field: "bride.fatherName" },
      { key: "{{bride_mother}}",        label: "Bride Mother Name",       field: "bride.motherName" },
      { key: "{{bride_parish}}",        label: "Bride Parish",            field: "bride.parish.name" },
      { key: "{{bride_diocese}}",       label: "Bride Diocese",           field: "bride.diocese.name" },
      { key: "{{bride_dob}}",           label: "Bride Date of Birth",     field: "bride.dob",            format: "date" },
      { key: "{{bride_baptism_date}}", label: "Bride Date of Baptism",   field: "bride.dateOfBaptism",  format: "date" },
      { key: "{{bride_confirm_date}}", label: "Bride Date of Confirm.",  field: "bride.dateOfConfirmation", format: "date" },
      { key: "{{marriage_date}}",       label: "Date of Marriage",        field: "dateOfMarriage",       format: "date" },
      { key: "{{marriage_place}}",      label: "Place of Marriage",       field: "placeOfMarriage" },
      { key: "{{minister_name}}",       label: "Minister Name",           field: "ministerName" },
      { key: "{{vicar_name}}",          label: "Vicar / Asst. Vicar",     field: "vicarName" },
      { key: "{{witness1_name}}",       label: "Witness 1 Name",          field: "witnesses.0.name" },
      { key: "{{witness1_address}}",    label: "Witness 1 Address",       field: "witnesses.0.address" },
      { key: "{{witness2_name}}",       label: "Witness 2 Name",          field: "witnesses.1.name" },
      { key: "{{witness2_address}}",    label: "Witness 2 Address",       field: "witnesses.1.address" },
      { key: "{{date}}",                label: "Today's Date",            field: "__today__" },
    ],
  },
  // ── Add more certificate types here as the system grows ──────────────────
  // {
  //   value: "baptism",
  //   label: "Baptism Certificate",
  //   route: "/baptism/",
  //   placeholders: [ ... ],
  // },
];

// Generic fallback placeholders (used when certType === "none")
export const GENERIC_PLACEHOLDERS = [
  { key: "{{name}}",       label: "Full Name" },
  { key: "{{phone}}",      label: "Phone" },
  { key: "{{building}}",   label: "Building" },
  { key: "{{city}}",       label: "City" },
  { key: "{{district}}",   label: "District" },
  { key: "{{state}}",      label: "State" },
  { key: "{{pincode}}",    label: "Pincode" },
  { key: "{{date}}",       label: "Today's Date" },
  { key: "{{reg_number}}", label: "Reg Number" },
  { key: "{{year}}",       label: "Year" },
];

const TEMPLATES = [
  { label: "A4 Portrait",  value: "a4",     w: 794,  h: 1123 },
  { label: "A4 Landscape", value: "a4l",    w: 1123, h: 794  },
  { label: "US Letter",    value: "letter", w: 816,  h: 1056 },
  { label: "ID Card",      value: "id",     w: 638,  h: 406  },
  { label: "Badge",        value: "badge",  w: 400,  h: 560  },
];

const FONT_FAMILIES = [
  "Georgia, serif", "Palatino, serif", "Times New Roman, serif",
  "Garamond, serif", "Arial, sans-serif", "Verdana, sans-serif", "Courier New, monospace",
];

// ─── Utility: resolve dot-path on an object ───────────────────────────────────
function resolvePath(obj, path) {
  if (path === "__today__") return new Date().toLocaleDateString("en-IN", { day: "2-digit", month: "long", year: "numeric" });
  return path.split(".").reduce((acc, part) => {
    if (acc == null) return "";
    // handle array index like "witnesses.0.name"
    if (!isNaN(part)) return Array.isArray(acc) ? acc[Number(part)] : "";
    return acc[part];
  }, obj) ?? "";
}

function formatValue(val, format) {
  if (!val) return "";
  if (format === "date") {
    const d = new Date(val);
    return isNaN(d) ? val : d.toLocaleDateString("en-IN", { day: "2-digit", month: "2-digit", year: "numeric" });
  }
  return String(val);
}

// ─── Element factory ──────────────────────────────────────────────────────────
function makeEl(type, x, y) {
  const id = `el_${++counter}`;
  const base = { id, type, x: Math.round(x), y: Math.round(y), opacity: 100, rotation: 0, zIndex: counter };
  const defaults = {
    text:    { w: 220, h: 50,  content: "Text Here",           fontSize: 16, fontFamily: "Georgia, serif",  color: "#1a1a1a", bg: "transparent", align: "center", valign: "center", weight: "400", fontStyle: "normal", ls: 0, lh: 1.4, bwidth: 0, bcolor: "#000000", radius: 0 },
    heading: { w: 380, h: 80,  content: "CERTIFICATE HEADING", fontSize: 34, fontFamily: "Palatino, serif", color: "#0F766E", bg: "transparent", align: "center", valign: "center", weight: "700", fontStyle: "normal", ls: 4, lh: 1.2, bwidth: 0, bcolor: "#000000", radius: 0 },
    rect:    { w: 200, h: 100, content: "", bg: "#0F766E", color: "transparent", radius: 0,  bwidth: 0, bcolor: "#000000" },
    circle:  { w: 100, h: 100, content: "", bg: "#14B8A6", color: "transparent", radius: 50, bwidth: 0, bcolor: "#000000" },
    divider: { w: 420, h: 20,  content: "", bg: "transparent", color: "#0F766E", bwidth: 2, bcolor: "#0F766E" },
    image:   { w: 200, h: 150, src: "",     bg: "transparent", bwidth: 0, bcolor: "#000000", radius: 0 },
  };
  return { ...base, ...(defaults[type] || defaults.text) };
}

function defaultCertElements(cw, ch) {
  counter = 0;
  return [
    { ...makeEl("rect",    0,       0),   w: cw,     h: ch,   bg: "#fffef7", bwidth: 0 },
    { ...makeEl("rect",   20,      20),   w: cw-40,  h: ch-40, bg: "transparent", bwidth: 3, bcolor: "#0F766E", radius: 4 },
    { ...makeEl("rect",   36,      36),   w: cw-72,  h: ch-72, bg: "transparent", bwidth: 1, bcolor: "#14B8A6", radius: 2 },
    { ...makeEl("heading",80,      80),   w: cw-160, h: 90,  content: "CERTIFICATE OF ACHIEVEMENT", fontSize: 30, color: "#0F766E", fontFamily: "Palatino, serif", ls: 4 },
    { ...makeEl("text",  100,     190),   w: cw-200, h: 36,  content: "This is to certify that", fontSize: 15, color: "#666", fontStyle: "italic" },
    { ...makeEl("heading", 60,    235),   w: cw-120, h: 75,  content: "{{name}}", fontSize: 38, color: "#1a1a1a", fontFamily: "Palatino, serif", ls: 1 },
    { ...makeEl("divider", 90,    325),   w: cw-180, h: 20,  bwidth: 1, bcolor: "#0F766E" },
    { ...makeEl("text",   80,     355),   w: cw-160, h: 90,  content: "has successfully completed the program and is hereby awarded this certificate.", fontSize: 14, color: "#444", lh: 1.8 },
    { ...makeEl("text",   80,     750),   w: 200,    h: 40,  content: "{{date}}", fontSize: 13, color: "#555", align: "flex-start" },
    { ...makeEl("text",   cw-295, 750),   w: 215,    h: 40,  content: "Signature: ___________", fontSize: 13, color: "#555", align: "flex-start" },
  ];
}

// ─── TextEl — isolated contentEditable so edits never bleed across elements ───
// Uses a ref to set innerHTML only once on mount (or when id changes).
// React NEVER touches the DOM content after that — the browser owns it.
const TextEl = ({ el, isEditing, zoom, onCommit, onDoubleClick }) => {
  const divRef = useRef(null);
  // track whether we are currently in edit mode inside this instance
  const editingRef = useRef(false);

  // On first mount — always set content from store
  useEffect(() => {
    if (divRef.current) {
      divRef.current.textContent = el.content || "";
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // intentionally empty — only on mount

  // When el.content changes from OUTSIDE (undo/redo, placeholder insert)
  // and we are NOT currently editing — sync DOM
  useEffect(() => {
    if (divRef.current && !editingRef.current) {
      divRef.current.textContent = el.content || "";
    }
  }, [el.content]);

  // Enter / exit edit mode
  useEffect(() => {
    editingRef.current = isEditing;
    if (!divRef.current) return;
    if (isEditing) {
      divRef.current.focus();
      // cursor to end
      try {
        const range = document.createRange();
        range.selectNodeContents(divRef.current);
        range.collapse(false);
        const sel = window.getSelection();
        sel.removeAllRanges();
        sel.addRange(range);
      } catch (_) {}
    } else {
      // leaving edit — make sure DOM matches last committed value
      divRef.current.textContent = el.content || "";
    }
  }, [isEditing]);

  const hAlign = el.align === "flex-end" ? "right" : el.align === "center" ? "center" : "left";
  const vAlign = el.valign === "flex-end" ? "bottom" : el.valign === "center" ? "middle" : "top";

  return (
    <div style={{ display: "table", width: "100%", height: "100%", background: el.bg || "transparent" }}>
      <div
        ref={divRef}
        contentEditable={isEditing}
        suppressContentEditableWarning
        onDoubleClick={(e) => { e.stopPropagation(); onDoubleClick(); }}
        onBlur={(e) => {
          if (!editingRef.current) return;
          onCommit(e.currentTarget.textContent);
        }}
        onKeyDown={(e) => {
          if (e.key === "Escape") {
            onCommit(e.currentTarget.textContent);
            e.currentTarget.blur();
          }
          e.stopPropagation();
        }}
        style={{
          display: "table-cell",
          width: "100%",
          height: "100%",
          verticalAlign: vAlign,
          textAlign: hAlign,
          fontSize: `${(el.fontSize || 16) * zoom}px`,
          fontFamily: el.fontFamily || "Georgia,serif",
          color: el.color || "#1a1a1a",
          fontWeight: el.weight || "400",
          fontStyle: el.fontStyle || "normal",
          letterSpacing: `${(el.ls || 0) * zoom}px`,
          lineHeight: el.lh || 1.4,
          padding: "4px",
          overflow: "hidden",
          cursor: isEditing ? "text" : "move",
          outline: isEditing ? "2px dashed #14B8A6" : "none",
          outlineOffset: "2px",
          boxSizing: "border-box",
          whiteSpace: "pre-wrap",
          wordBreak: "break-word",
        }}
      />
    </div>
  );
};

// ─── Component ────────────────────────────────────────────────────────────────
const MAX_HISTORY = 60;

const PrintDesigner = () => {
  // ── History stack for undo/redo ─────────────────────────────────────────
  const historyRef = useRef([defaultCertElements(794, 1123)]);
  const historyIdx = useRef(0);

  const [elements, setElementsRaw] = useState(() => defaultCertElements(794, 1123));
  const [canUndo, setCanUndo]      = useState(false);
  const [canRedo, setCanRedo]      = useState(false);

  // Push a new snapshot — call after any intentional change
  const pushHistory = useCallback((newEls) => {
    historyRef.current = historyRef.current.slice(0, historyIdx.current + 1);
    historyRef.current.push(newEls);
    if (historyRef.current.length > MAX_HISTORY) historyRef.current.shift();
    historyIdx.current = historyRef.current.length - 1;
    setElementsRaw(newEls);
    setCanUndo(historyIdx.current > 0);
    setCanRedo(false);
  }, []);

  // Silent setter for live drag/resize (no history push)
  const setElements = useCallback((updater) => {
    setElementsRaw(updater);
  }, []);

  // Call this on mouseUp after drag/resize to commit the moved position
  const commitHistory = useCallback(() => {
    setElementsRaw(current => {
      historyRef.current = historyRef.current.slice(0, historyIdx.current + 1);
      historyRef.current.push(current);
      if (historyRef.current.length > MAX_HISTORY) historyRef.current.shift();
      historyIdx.current = historyRef.current.length - 1;
      setCanUndo(historyIdx.current > 0);
      setCanRedo(false);
      return current;
    });
  }, []);

  const undo = useCallback(() => {
    if (historyIdx.current <= 0) return;
    historyIdx.current -= 1;
    const els = historyRef.current[historyIdx.current];
    setElementsRaw(els);
    setCanUndo(historyIdx.current > 0);
    setCanRedo(true);
  }, []);

  const redo = useCallback(() => {
    if (historyIdx.current >= historyRef.current.length - 1) return;
    historyIdx.current += 1;
    const els = historyRef.current[historyIdx.current];
    setElementsRaw(els);
    setCanUndo(true);
    setCanRedo(historyIdx.current < historyRef.current.length - 1);
  }, []);

  const [selected, setSelected]     = useState(null);       // primary (last clicked)
  const [multiSel, setMultiSel]     = useState(new Set());  // all selected ids
  const [editingId, setEditingId]   = useState(null);       // null=move, id=text edit
  const [zoom, setZoom]           = useState(0.7);
  const [gridOn, setGridOn]       = useState(false);
  const [canvasW, setCanvasW]     = useState(794);
  const [canvasH, setCanvasH]     = useState(1123);
  const [canvasBg, setCanvasBg]   = useState("#ffffff");
  const [template, setTemplate]   = useState("a4");
  const [message, setMessage]     = useState(null);
  const [dragType, setDragType]   = useState(null);

  // ── Certificate type & dynamic placeholders ───────────────────────────────
  const [certType, setCertType]               = useState("none");
  const [dynamicPlaceholders, setDynamicPlaceholders] = useState(GENERIC_PLACEHOLDERS);
  const [placeholdersLoading, setPlaceholdersLoading] = useState(false);

  const [templateName, setTemplateName]         = useState("");
  const [templateDesc, setTemplateDesc]         = useState("");
  const [savedTemplates, setSavedTemplates]     = useState([]);
  const [saveDialogOpen, setSaveDialogOpen]     = useState(false);
  const [loadDialogOpen, setLoadDialogOpen]     = useState(false);
  const [savingToDb, setSavingToDb]             = useState(false);
  const [loadingTemplates, setLoadingTemplates] = useState(false);
  const [editingTemplateId, setEditingTemplateId] = useState(null);

  const canvasRef   = useRef(null);
  const fileInputRef = useRef(null);
  const bgInputRef  = useRef(null);

  const selectedEl   = elements.find(e => e.id === selected) || null;
  const selectedEls  = elements.filter(e => multiSel.has(e.id));

  // Select one element (clears multi-sel unless shift held)
  const selectOne = (id, shiftKey = false) => {
    if (shiftKey) {
      setMultiSel(prev => {
        const next = new Set(prev);
        if (next.has(id)) { next.delete(id); }
        else              { next.add(id); }
        return next;
      });
      setSelected(id);
    } else {
      setMultiSel(new Set([id]));
      setSelected(id);
    }
    setEditingId(null);
  };

  const clearSelection = () => { setSelected(null); setMultiSel(new Set()); setEditingId(null); };

  // ── When certType changes — load placeholders from DB ────────────────────
  useEffect(() => {
    const certDef = CERTIFICATE_TYPES.find(c => c.value === certType);
    if (!certDef || certType === "none") {
      setDynamicPlaceholders(GENERIC_PLACEHOLDERS);
      return;
    }
    // Use the static placeholder definitions from CERTIFICATE_TYPES
    // (no extra DB call needed — the field map IS the placeholder list)
    setDynamicPlaceholders(certDef.placeholders);
  }, [certType]);

  const updateEl = useCallback((id, patch) => {
    setElementsRaw(prev => {
      const next = prev.map(el => el.id === id ? { ...el, ...patch } : el);
      // push into history
      historyRef.current = historyRef.current.slice(0, historyIdx.current + 1);
      historyRef.current.push(next);
      if (historyRef.current.length > MAX_HISTORY) historyRef.current.shift();
      historyIdx.current = historyRef.current.length - 1;
      setCanUndo(historyIdx.current > 0);
      setCanRedo(false);
      return next;
    });
  }, []);
  const updateSel = useCallback((patch) => {
    if (!selected) return;
    updateEl(selected, patch);
  }, [selected, updateEl]);

  const insertPlaceholder = (key) => {
    if (!selectedEl || (selectedEl.type !== "text" && selectedEl.type !== "heading")) {
      setMessage({ type: "warning", text: "Select a text element first to insert placeholder" });
      return;
    }
    updateSel({ content: (selectedEl.content || "") + key });
  };

  const handleCanvasDrop = (e) => {
    e.preventDefault();
    if (!dragType) return;
    const rect = canvasRef.current.getBoundingClientRect();
    const x = Math.round((e.clientX - rect.left) / zoom) - 110;
    const y = Math.round((e.clientY - rect.top) / zoom) - 40;
    const el = makeEl(dragType, Math.max(0, x), Math.max(0, y));
    pushHistory([...elements, el]);
    setSelected(el.id);
    setDragType(null);
    if (dragType === "image") setTimeout(() => fileInputRef.current?.click(), 50);
  };

  const startDrag = (e, el) => {
    e.stopPropagation();
    if (e.target.dataset.handle) return;

    // Shift+click → toggle multi-selection only, never drag
    if (e.shiftKey) { selectOne(el.id, true); return; }

    // Decide which IDs to drag RIGHT NOW using current state values
    // (don't rely on state after selectOne — it's async)
    const alreadyInMulti = multiSel.has(el.id) && multiSel.size > 1;
    const dragIds = alreadyInMulti ? [...multiSel] : [el.id];

    // Update selection state (won't affect dragIds above)
    if (!alreadyInMulti) {
      setSelected(el.id);
      setMultiSel(new Set([el.id]));
      setEditingId(null);
    }

    const rect = canvasRef.current.getBoundingClientRect();
    // Snapshot starting positions synchronously
    const starts = Object.fromEntries(
      elements.filter(x => dragIds.includes(x.id)).map(x => [x.id, { x: x.x, y: x.y }])
    );
    const startX = (e.clientX - rect.left) / zoom;
    const startY = (e.clientY - rect.top)  / zoom;

    const onMove = (ev) => {
      const r  = canvasRef.current.getBoundingClientRect();
      const dx = Math.round((ev.clientX - r.left) / zoom - startX);
      const dy = Math.round((ev.clientY - r.top)  / zoom - startY);
      setElementsRaw(prev => prev.map(x => {
        if (!dragIds.includes(x.id)) return x;
        return {
          ...x,
          x: Math.max(0, Math.min(starts[x.id].x + dx, canvasW - x.w)),
          y: Math.max(0, Math.min(starts[x.id].y + dy, canvasH - x.h)),
        };
      }));
    };
    const onUp = () => { window.removeEventListener("mousemove", onMove); window.removeEventListener("mouseup", onUp); commitHistory(); };
    window.addEventListener("mousemove", onMove);
    window.addEventListener("mouseup", onUp);
  };

  const startResize = (e, el, dir) => {
    e.preventDefault(); e.stopPropagation();
    const sx = e.clientX, sy = e.clientY, sw = el.w, sh = el.h, selX = el.x, selY = el.y;
    const onMove = (ev) => {
      const dx = (ev.clientX - sx) / zoom, dy = (ev.clientY - sy) / zoom;
      const patch = {};
      if (dir.includes("e")) patch.w = Math.max(20, Math.round(sw + dx));
      if (dir.includes("s")) patch.h = Math.max(10, Math.round(sh + dy));
      if (dir.includes("w")) { patch.w = Math.max(20, Math.round(sw - dx)); patch.x = Math.round(selX + sw - patch.w); }
      if (dir.includes("n")) { patch.h = Math.max(10, Math.round(sh - dy)); patch.y = Math.round(selY + sh - patch.h); }
      updateEl(el.id, patch);
    };
    const onUp = () => { window.removeEventListener("mousemove", onMove); window.removeEventListener("mouseup", onUp); commitHistory(); };
    window.addEventListener("mousemove", onMove);
    window.addEventListener("mouseup", onUp);
  };

  useEffect(() => {
    const onKey = (e) => {
      if (["INPUT","TEXTAREA","SELECT"].includes(e.target.tagName)) return;
      if (e.target.contentEditable === "true") return;
      if (editingId) return;
      if (multiSel.size === 0) return;
      const step = e.shiftKey ? 10 : 1;
      if (e.key === "Delete" || e.key === "Backspace") {
        pushHistory(elements.filter(el => !multiSel.has(el.id)));
        clearSelection(); return;
      }
      if (e.key === "ArrowLeft"  || e.key === "ArrowRight" ||
          e.key === "ArrowUp"    || e.key === "ArrowDown") {
        e.preventDefault();
        const dx = e.key === "ArrowLeft" ? -step : e.key === "ArrowRight" ? step : 0;
        const dy = e.key === "ArrowUp"   ? -step : e.key === "ArrowDown"  ? step : 0;
        const next = elements.map(el => {
          if (!multiSel.has(el.id)) return el;
          return {
            ...el,
            x: Math.max(0, Math.min(el.x + dx, canvasW - el.w)),
            y: Math.max(0, Math.min(el.y + dy, canvasH - el.h)),
          };
        });
        pushHistory(next);
      }
      if ((e.ctrlKey || e.metaKey) && e.key === "d") {
        e.preventDefault();
        const clones = selectedEls.map(el => ({ ...el, id: `el_${++counter}`, x: el.x+20, y: el.y+20, zIndex: counter }));
        const newEls = [...elements, ...clones];
        pushHistory(newEls);
        setMultiSel(new Set(clones.map(c => c.id)));
        setSelected(clones[clones.length-1].id);
      }
      // Escape clears multi-selection
      if (e.key === "Escape") clearSelection();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [selectedEls, multiSel, elements, canvasW, canvasH, editingId]);

  // Undo/redo keyboard shortcuts — separate effect so they always fire
  useEffect(() => {
    const onUndoRedo = (e) => {
      if (["INPUT","TEXTAREA","SELECT"].includes(e.target.tagName)) return;
      if (e.target.contentEditable === "true") return;
      const ctrl = e.ctrlKey || e.metaKey;
      if (ctrl && !e.shiftKey && e.key === "z") { e.preventDefault(); undo(); }
      if (ctrl && (e.key === "y" || (e.shiftKey && e.key === "z"))) { e.preventDefault(); redo(); }
    };
    window.addEventListener("keydown", onUndoRedo);
    return () => window.removeEventListener("keydown", onUndoRedo);
  }, [undo, redo]);

  const deleteEl = (id) => {
    const ids = multiSel.size > 1 ? [...multiSel] : [id];
    pushHistory(elements.filter(e => !ids.includes(e.id)));
    clearSelection();
  };
  const duplicateEl = (el) => {
    const targets = multiSel.size > 1 ? selectedEls : [el];
    const clones  = targets.map(t => ({ ...t, id: `el_${++counter}`, x: t.x+20, y: t.y+20, zIndex: counter }));
    pushHistory([...elements, ...clones]);
    setMultiSel(new Set(clones.map(c => c.id)));
    setSelected(clones[clones.length-1].id);
  };
  const bringFwd = () => {
    if (multiSel.size === 0) return;
    pushHistory(elements.map(el => multiSel.has(el.id) ? { ...el, zIndex: el.zIndex + 1.5 } : el));
  };
  const sendBack = () => {
    if (multiSel.size === 0) return;
    pushHistory(elements.map(el => multiSel.has(el.id) ? { ...el, zIndex: Math.max(0, el.zIndex - 1.5) } : el));
  };

  const applyTemplate = (val) => {
    const t = TEMPLATES.find(t => t.value === val);
    if (!t) return;
    const fresh = defaultCertElements(t.w, t.h);
    setTemplate(val); setCanvasW(t.w); setCanvasH(t.h);
    historyRef.current = [fresh]; historyIdx.current = 0;
    setElementsRaw(fresh); setCanUndo(false); setCanRedo(false); setSelected(null);
  };

  // ── DB: Save ──────────────────────────────────────────────────────────────
  const saveToDb = async () => {
    if (!templateName.trim()) { setMessage({ type: "error", text: "Template name is required" }); return; }
    setSavingToDb(true);
    try {
      const payload = {
        name: templateName.trim(),
        description: templateDesc.trim(),
        pageSize: template,
        canvasW, canvasH, canvasBg,
        elements,
        certType,   // ← save the certificate type alongside the template
      };
      if (editingTemplateId) {
        await axiosInstance.put(`/print-template/${editingTemplateId}`, payload);
        setMessage({ type: "success", text: "Template updated in database" });
      } else {
        await axiosInstance.post("/print-template", payload);
        setMessage({ type: "success", text: "Template saved to database" });
      }
      setSaveDialogOpen(false);
    } catch {
      setMessage({ type: "error", text: "Failed to save template" });
    } finally {
      setSavingToDb(false);
    }
  };

  // ── DB: Load list ─────────────────────────────────────────────────────────
  const openLoadDialog = async () => {
    setLoadDialogOpen(true);
    setLoadingTemplates(true);
    try {
      const res = await axiosInstance.get("/print-template");
      setSavedTemplates(res.data);
    } catch {
      setMessage({ type: "error", text: "Failed to fetch templates" });
    } finally {
      setLoadingTemplates(false);
    }
  };

  const loadFromDb = (tpl) => {
    setCanvasW(tpl.canvasW); setCanvasH(tpl.canvasH);
    setCanvasBg(tpl.canvasBg || "#ffffff");
    historyRef.current = [tpl.elements]; historyIdx.current = 0;
    setElementsRaw(tpl.elements); setCanUndo(false); setCanRedo(false);
    setTemplate(tpl.pageSize || "a4");
    setTemplateName(tpl.name);
    setTemplateDesc(tpl.description || "");
    setEditingTemplateId(tpl._id);
    setCertType(tpl.certType || "none");  // ← restore certType
    setSelected(null);
    setLoadDialogOpen(false);
    setMessage({ type: "success", text: `Loaded: ${tpl.name}` });
  };

  const deleteFromDb = async (id, e) => {
    e.stopPropagation();
    if (!window.confirm("Delete this template from database?")) return;
    try {
      await axiosInstance.delete(`/print-template/${id}`);
      setSavedTemplates(prev => prev.filter(t => t._id !== id));
      setMessage({ type: "success", text: "Template deleted" });
    } catch {
      setMessage({ type: "error", text: "Failed to delete template" });
    }
  };

  const duplicateFromDb = async (tpl, e) => {
    e.stopPropagation();
    try {
      const payload = {
        name:        `${tpl.name} (Copy)`,
        description: tpl.description || "",
        pageSize:    tpl.pageSize,
        canvasW:     tpl.canvasW,
        canvasH:     tpl.canvasH,
        canvasBg:    tpl.canvasBg || "#ffffff",
        elements:    tpl.elements,
        certType:    tpl.certType || "none",
      };
      const res = await axiosInstance.post("/print-template", payload);
      setSavedTemplates(prev => [res.data, ...prev]);
      setMessage({ type: "success", text: `Duplicated as "${payload.name}"` });
    } catch {
      setMessage({ type: "error", text: "Failed to duplicate template" });
    }
  };

  const handleImgUpload = (e) => {
    const file = e.target.files[0]; if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => { if (selectedEl?.type === "image") updateSel({ src: ev.target.result }); };
    reader.readAsDataURL(file);
    e.target.value = "";
  };

  // ── Print — fills placeholders from DB record if certType is set ──────────
  const handlePrint = () => {
    const certDef = CERTIFICATE_TYPES.find(c => c.value === certType);

    // If a certificate type with a DB route is selected → ask which record
    if (certDef && certDef.route) {
      setPrintRecordDialogOpen(true);
    } else {
      doPrint(null, []);
    }
  };

  const doPrint = (record, certPlaceholders) => {
    const sorted = [...elements].sort((a, b) => a.zIndex - b.zIndex);

    const fillContent = (content) => {
      if (!content || !record) return content || "";
      let filled = content;
      certPlaceholders.forEach(({ key, field, format }) => {
        const raw = resolvePath(record, field);
        const val = formatValue(raw, format);
        filled = filled.split(key).join(val);
      });
      return filled;
    };

    const elHtml = sorted.map(el => {
      const content = fillContent(el.content);
      const s = `position:absolute;left:${el.x}px;top:${el.y}px;width:${el.w}px;height:${el.h}px;z-index:${el.zIndex};opacity:${el.opacity/100};transform:rotate(${el.rotation}deg);`;
      if (el.type === "image")   return `<div style="${s}"><img src="${el.src||""}" style="width:100%;height:100%;object-fit:contain"></div>`;
      if (el.type === "divider") return `<div style="${s}display:flex;align-items:center;"><hr style="width:100%;border:none;border-top:${el.bwidth||2}px solid ${el.bcolor||"#0F766E"}"></div>`;
      if (el.type === "rect")    return `<div style="${s}background:${el.bg||"transparent"};border-radius:${el.radius||0}px;border:${el.bwidth||0}px solid ${el.bcolor||"transparent"};"></div>`;
      if (el.type === "circle")  return `<div style="${s}background:${el.bg||"transparent"};border-radius:50%;border:${el.bwidth||0}px solid ${el.bcolor||"transparent"};"></div>`;
      const hAlign = el.align==="flex-end"?"right":el.align==="center"?"center":"left";
      const vAlign = el.valign==="flex-end"?"bottom":el.valign==="center"?"middle":"top";
      return `<div style="${s}display:table-cell;vertical-align:${vAlign};text-align:${hAlign};font-size:${el.fontSize||16}px;font-family:${el.fontFamily||"Georgia,serif"};color:${el.color||"#1a1a1a"};background:${el.bg||"transparent"};font-weight:${el.weight||"400"};font-style:${el.fontStyle||"normal"};letter-spacing:${el.ls||0}px;line-height:${el.lh||1.4};padding:4px;white-space:pre-wrap;word-break:break-word;">${content||""}</div>`;
    }).join("");

    const w = window.open("", "_blank");
    w.document.write(`<!DOCTYPE html><html><head><style>*{margin:0;padding:0;box-sizing:border-box}body{background:#fff}@media print{body{-webkit-print-color-adjust:exact;print-color-adjust:exact}}</style></head><body><div style="position:relative;width:${canvasW}px;height:${canvasH}px;background:${canvasBg};overflow:hidden;">${elHtml}</div></body></html>`);
    w.document.close();
    setTimeout(() => w.print(), 400);
  };

  // ── Print-record picker dialog ────────────────────────────────────────────
  const [printRecordDialogOpen, setPrintRecordDialogOpen] = useState(false);
  const [printRecords, setPrintRecords]                   = useState([]);
  const [printRecordsLoading, setPrintRecordsLoading]     = useState(false);
  const [printSearch, setPrintSearch]                     = useState("");

  useEffect(() => {
    if (!printRecordDialogOpen) return;
    const certDef = CERTIFICATE_TYPES.find(c => c.value === certType);
    if (!certDef?.route) return;
    setPrintRecordsLoading(true);
    axiosInstance.get(certDef.route)
      .then(r => setPrintRecords(r.data))
      .catch(() => setMessage({ type: "error", text: "Failed to load records for printing" }))
      .finally(() => setPrintRecordsLoading(false));
  }, [printRecordDialogOpen, certType]);

  // Label helper for each record in the pick list
  const recordLabel = (rec) => {
    if (certType === "marriage") {
      return `${rec.groom?.officialName || "?"} ✕ ${rec.bride?.officialName || "?"} — ${rec.certificateNo || rec.registrationNo || ""}`;
    }
    return rec.name || rec._id;
  };

  const filteredPrintRecords = printRecords.filter(r =>
    recordLabel(r).toLowerCase().includes(printSearch.toLowerCase())
  );

  const handlePickRecord = (rec) => {
    const certDef = CERTIFICATE_TYPES.find(c => c.value === certType);
    setPrintRecordDialogOpen(false);
    setPrintSearch("");
    doPrint(rec, certDef?.placeholders || []);
  };

  const renderElement = (el) => {
    const isSel = el.id === selected;
    const isPlaceholderEl = (el.content || "").includes("{{");
    const handles = ["nw","n","ne","e","se","s","sw","w"];
    const handlePos = { nw:{top:-5,left:-5},n:{top:-5,left:"calc(50% - 4px)"},ne:{top:-5,right:-5},e:{top:"calc(50% - 4px)",right:-5},se:{bottom:-5,right:-5},s:{bottom:-5,left:"calc(50% - 4px)"},sw:{bottom:-5,left:-5},w:{top:"calc(50% - 4px)",left:-5} };
    const cursorMap = { nw:"nw-resize",n:"n-resize",ne:"ne-resize",e:"e-resize",se:"se-resize",s:"s-resize",sw:"sw-resize",w:"w-resize" };

    let inner = null;
    if (el.type === "image") {
      inner = <img src={el.src || ""} alt="" style={{ width:"100%", height:"100%", objectFit:"contain", display:"block" }} />;
    } else if (el.type === "divider") {
      inner = <Box sx={{width:"100%",height:"100%",display:"flex",alignItems:"center"}}><hr style={{width:"100%",border:"none",borderTop:`${(el.bwidth||2)*zoom}px solid ${el.bcolor||"#0F766E"}`}}/></Box>;
    } else if (el.type === "rect") {
      inner = <Box sx={{width:"100%",height:"100%",background:el.bg||"transparent",borderRadius:`${el.radius||0}px`,border:`${(el.bwidth||0)*zoom}px solid ${el.bcolor||"transparent"}`}}/>;
    } else if (el.type === "circle") {
      inner = <Box sx={{width:"100%",height:"100%",background:el.bg||"transparent",borderRadius:"50%",border:`${(el.bwidth||0)*zoom}px solid ${el.bcolor||"transparent"}`}}/>;
    } else {
      const isEditing = editingId === el.id;
      inner = (
        <TextEl
          key={el.id}
          el={el} isEditing={isEditing} zoom={zoom}
          onCommit={(newContent) => { updateEl(el.id, { content: newContent }); setEditingId(null); }}
          onDoubleClick={() => setEditingId(el.id)}
        />
      );
    }

    // An element is "background-locked" when it's a rect covering the full canvas
    // and is NOT currently selected — it should not block clicks to elements above it
    const isFullBg = el.type === "rect" && el.x === 0 && el.y === 0 && el.w >= canvasW && el.h >= canvasH;
    const isLocked = el.locked || false;
    const blocksMouse = !isSel && !multiSel.has(el.id) && (isFullBg || isLocked);

    return (
      <Box key={el.id}
        onMouseDown={(e) => { if (editingId === el.id) return; if (blocksMouse) { clearSelection(); return; } startDrag(e, el); }}
        onDoubleClick={(e) => { e.stopPropagation(); if (blocksMouse) return; if (el.type === "text" || el.type === "heading") { selectOne(el.id); setEditingId(el.id); } }}
        sx={{ position:"absolute", left:el.x*zoom, top:el.y*zoom, width:el.w*zoom, height:el.h*zoom, zIndex:el.zIndex, opacity:el.opacity/100, transform:`rotate(${el.rotation}deg)`,
          cursor: editingId===el.id ? "text" : blocksMouse ? "default" : "move",
          outline: editingId===el.id ? "none" : multiSel.has(el.id) ? (isSel ? "2px solid #0F766E" : "2px solid #14B8A6") : "none",
          outlineOffset:1,
          "&:hover":{outline:multiSel.has(el.id)||editingId===el.id?undefined:blocksMouse?undefined:"1px dashed #14B8A680"} }}>
        {inner}
        {isSel && handles.map(dir => (
          <Box key={dir} data-handle={dir} onMouseDown={(e) => startResize(e, el, dir)}
            sx={{position:"absolute",width:8,height:8,background:"#0F766E",border:"1.5px solid #fff",borderRadius:"50%",zIndex:100,cursor:cursorMap[dir],...handlePos[dir]}}/>
        ))}
      </Box>
    );
  };

  const isText  = selectedEl && (selectedEl.type === "text" || selectedEl.type === "heading");
  const isShape = selectedEl && (selectedEl.type === "rect" || selectedEl.type === "circle");
  const placeholderCount = elements.filter(el => (el.content || "").includes("{{")).length;
  const currentCertDef = CERTIFICATE_TYPES.find(c => c.value === certType);

  return (
    <>
      <input type="file" ref={fileInputRef} style={{display:"none"}} accept="image/*" onChange={handleImgUpload}/>
      <input type="color" ref={bgInputRef} style={{display:"none"}} onChange={(e) => setCanvasBg(e.target.value)}/>

      <Box sx={{display:"flex", height:"calc(100vh - 64px)", overflow:"hidden", background:"#F0F4F3"}}>

        {/* LEFT SIDEBAR */}
        <SidePanel>
          <Box sx={{p:1.5,borderBottom:"1px solid",borderColor:"divider",display:"flex",alignItems:"center",gap:1}}>
            <Box sx={{width:28,height:28,borderRadius:1.5,background:"linear-gradient(135deg,#0F766E,#14B8A6)",display:"flex",alignItems:"center",justifyContent:"center"}}>
              <PrintIcon sx={{color:"#fff",fontSize:16}}/>
            </Box>
            <Box sx={{flex:1}}>
              <Typography sx={{fontSize:13,fontWeight:700,color:"text.primary",lineHeight:1}}>Print Designer</Typography>
              {editingTemplateId
                ? <Typography sx={{fontSize:10,color:"primary.main",fontWeight:600}}>✏ {templateName}</Typography>
                : <Typography sx={{fontSize:10,color:"text.secondary"}}>Drag elements to canvas</Typography>}
            </Box>
            {multiSel.size > 1 && (
              <Chip label={`${multiSel.size} selected`} size="small" sx={{fontSize:9,height:18,background:"#0F766E",color:"#fff",fontWeight:700}}/>
            )}
            {multiSel.size <= 1 && placeholderCount > 0 && (
              <Chip label={`${placeholderCount} vars`} size="small" sx={{fontSize:9,height:18,background:"#14B8A620",color:"#0F766E",fontWeight:700}}/>
            )}
          </Box>

          {/* ── Certificate Type selector ── */}
          <PropSection>
            <SectionLabel sx={{ display: "flex", alignItems: "center", gap: 0.5 }}>
              <CertIcon sx={{ fontSize: 11 }} /> Certificate Type
            </SectionLabel>
            <FormControl fullWidth size="small">
              <Select
                value={certType}
                onChange={(e) => setCertType(e.target.value)}
                sx={{ fontSize: 12, borderRadius: 1.5, "& .MuiSelect-select": { py: "6px" } }}
              >
                {CERTIFICATE_TYPES.map(ct => (
                  <MenuItem key={ct.value} value={ct.value} sx={{ fontSize: 12 }}>
                    {ct.label}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
            {certType !== "none" && (
              <Box sx={{ mt: 1, px: 1, py: 0.75, borderRadius: 1.5, background: "#f0fdf4", border: "1px solid #86efac" }}>
                <Typography sx={{ fontSize: 10, color: "#15803d", fontWeight: 600 }}>
                  ✓ {dynamicPlaceholders.length} placeholders loaded
                </Typography>
                <Typography sx={{ fontSize: 9.5, color: "#166534", mt: 0.3 }}>
                  Placeholders filled from DB on print
                </Typography>
              </Box>
            )}
          </PropSection>

          {/* Elements palette */}
          <PropSection>
            <SectionLabel>Elements</SectionLabel>
            {[
              {type:"text",    label:"Text",      icon:<Type size={14}/>},
              {type:"heading", label:"Heading",   icon:<Heading1 size={14}/>},
              {type:"rect",    label:"Rectangle", icon:<Square size={14}/>},
              {type:"circle",  label:"Circle",    icon:<Circle size={14}/>},
              {type:"divider", label:"Divider",   icon:<Minus size={14}/>},
              {type:"image",   label:"Image",     icon:<Image size={14}/>},
            ].map(item => (
              <ElementBtn key={item.type} draggable onDragStart={() => setDragType(item.type)}>
                <Box sx={{color:"primary.main",display:"flex"}}>{item.icon}</Box>
                {item.label}
              </ElementBtn>
            ))}
          </PropSection>

          {/* Data Placeholders — dynamic based on certType */}
          <PropSection>
            <SectionLabel>
              <Box component="span" sx={{display:"flex",alignItems:"center",gap:0.5}}>
                <PlaceholderIcon sx={{fontSize:11}}/> Data Placeholders
                {certType !== "none" && (
                  <Chip
                    label={currentCertDef?.label?.replace(" Certificate","") || certType}
                    size="small"
                    sx={{ fontSize: 8, height: 15, ml: 0.5, background: "#CCFBF1", color: "#0F766E", fontWeight: 700 }}
                  />
                )}
              </Box>
            </SectionLabel>
            <Typography sx={{fontSize:10,color:"text.secondary",mb:1,lineHeight:1.4}}>
              Select a text element, then click to insert
            </Typography>
            <Box sx={{maxHeight:180,overflowY:"auto"}}>
              {placeholdersLoading ? (
                <Box sx={{ display: "flex", justifyContent: "center", py: 2 }}>
                  <CircularProgress size={16} />
                </Box>
              ) : dynamicPlaceholders.map(p => (
                <PlaceholderBtn key={p.key} onClick={() => insertPlaceholder(p.key)}>
                  <span style={{flex:1, overflow:"hidden", textOverflow:"ellipsis", whiteSpace:"nowrap"}}>{p.key}</span>
                  <span style={{fontSize:9,opacity:0.6,flexShrink:0,maxWidth:80,overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>{p.label}</span>
                </PlaceholderBtn>
              ))}
            </Box>
          </PropSection>

          {/* Properties */}
          <Box sx={{flex:1,overflowY:"auto"}}>
            {!selectedEl ? (
              <Box sx={{p:2,textAlign:"center"}}>
                <Typography sx={{fontSize:12,color:"text.secondary",mt:1}}>Select an element<br/>to edit its properties</Typography>
              </Box>
            ) : (
              <>
                {isText && (
                  <PropSection>
                    <SectionLabel>Content</SectionLabel>
                    <TextField multiline rows={2} fullWidth size="small"
                      value={selectedEl.content || ""}
                      onChange={(e) => updateSel({content: e.target.value})}
                      InputProps={{sx:{fontSize:12,borderRadius:1.5}}}/>
                    {(selectedEl.content||"").includes("{{") && (
                      <Typography sx={{fontSize:10,color:"primary.main",mt:0.5}}>✓ Contains dynamic placeholder</Typography>
                    )}
                  </PropSection>
                )}
                <PropSection>
                  <SectionLabel>Position & Size</SectionLabel>
                  <Box sx={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:1}}>
                    {[["X","x"],["Y","y"],["W","w"],["H","h"]].map(([label,key]) => (
                      <CompactInput key={key} label={label} type="number" size="small"
                        value={selectedEl[key]||0}
                        onChange={(e) => updateSel({[key]: Math.max(key==="w"?10:key==="h"?5:-9999, parseInt(e.target.value)||0)})}/>
                    ))}
                  </Box>
                </PropSection>
                {isText && (
                  <PropSection>
                    <SectionLabel>Typography</SectionLabel>
                    <Box sx={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:1,mb:1}}>
                      <CompactInput label="Size" type="number" size="small" value={selectedEl.fontSize||16} onChange={(e)=>updateSel({fontSize:parseInt(e.target.value)||16})}/>
                      <CompactInput label="Spacing" type="number" size="small" value={selectedEl.ls||0} onChange={(e)=>updateSel({ls:parseFloat(e.target.value)||0})}/>
                    </Box>
                    <CompactInput label="Line Height" type="number" size="small" fullWidth value={selectedEl.lh||1.4} inputProps={{step:0.1,min:0.8,max:4}} onChange={(e)=>updateSel({lh:parseFloat(e.target.value)||1.4})} sx={{mb:1}}/>
                    <FormControl fullWidth size="small" sx={{mb:1}}>
                      <InputLabel sx={{fontSize:12}}>Font Family</InputLabel>
                      <Select label="Font Family" value={selectedEl.fontFamily||"Georgia, serif"} onChange={(e)=>updateSel({fontFamily:e.target.value})} sx={{fontSize:12,borderRadius:1.5}}>
                        {FONT_FAMILIES.map(f=><MenuItem key={f} value={f} sx={{fontSize:12}}>{f.split(",")[0]}</MenuItem>)}
                      </Select>
                    </FormControl>
                    <Box sx={{display:"flex",gap:1,mb:1}}>
                      <ToggleButton size="small" value="bold" selected={selectedEl.weight==="700"} onChange={()=>updateSel({weight:selectedEl.weight==="700"?"400":"700"})} sx={{flex:1,py:0.5}}><BoldIcon fontSize="small"/></ToggleButton>
                      <ToggleButton size="small" value="italic" selected={selectedEl.fontStyle==="italic"} onChange={()=>updateSel({fontStyle:selectedEl.fontStyle==="italic"?"normal":"italic"})} sx={{flex:1,py:0.5}}><ItalicIcon fontSize="small"/></ToggleButton>
                    </Box>
                    <ToggleButtonGroup exclusive fullWidth size="small" value={selectedEl.align||"center"} onChange={(_,v)=>v&&updateSel({align:v})}>
                      {[["flex-start",<FormatAlignLeft fontSize="small"/>],["center",<FormatAlignCenter fontSize="small"/>],["flex-end",<FormatAlignRight fontSize="small"/>]].map(([v,icon])=>(
                        <ToggleButton key={v} value={v} sx={{flex:1,py:0.5}}>{icon}</ToggleButton>
                      ))}
                    </ToggleButtonGroup>
                  </PropSection>
                )}
                <PropSection>
                  <SectionLabel>Colors</SectionLabel>
                  <Box sx={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:1}}>
                    {isText && (
                      <Box>
                        <Typography sx={{fontSize:10,color:"text.secondary",mb:0.5}}>Text</Typography>
                        <Box sx={{display:"flex",alignItems:"center",gap:1}}>
                          <input type="color" value={selectedEl.color||"#1a1a1a"} onChange={(e)=>updateSel({color:e.target.value})} style={{width:28,height:28,border:"none",borderRadius:6,cursor:"pointer",padding:0}}/>
                          <Typography sx={{fontSize:11,color:"text.secondary"}}>{selectedEl.color}</Typography>
                        </Box>
                      </Box>
                    )}
                    <Box>
                      <Typography sx={{fontSize:10,color:"text.secondary",mb:0.5}}>Fill</Typography>
                      <Box sx={{display:"flex",alignItems:"center",gap:1}}>
                        <input type="color" value={(selectedEl.bg&&selectedEl.bg!=="transparent")?selectedEl.bg:"#ffffff"} onChange={(e)=>updateSel({bg:e.target.value})} style={{width:28,height:28,border:"none",borderRadius:6,cursor:"pointer",padding:0}}/>
                        <Typography sx={{fontSize:11,color:"text.secondary"}}>{selectedEl.bg}</Typography>
                      </Box>
                    </Box>
                  </Box>
                </PropSection>
                {!isText && (
                  <PropSection>
                    <SectionLabel>Border</SectionLabel>
                    <Box sx={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:1,mb:1}}>
                      <CompactInput label="Width" type="number" size="small" value={selectedEl.bwidth||0} inputProps={{min:0,max:20}} onChange={(e)=>updateSel({bwidth:parseInt(e.target.value)||0})}/>
                      {isShape && <CompactInput label="Radius" type="number" size="small" value={selectedEl.radius||0} inputProps={{min:0,max:200}} onChange={(e)=>updateSel({radius:parseInt(e.target.value)||0})}/>}
                    </Box>
                    <Typography sx={{fontSize:10,color:"text.secondary",mb:0.5}}>Border Color</Typography>
                    <input type="color" value={selectedEl.bcolor||"#000000"} onChange={(e)=>updateSel({bcolor:e.target.value})} style={{width:28,height:28,border:"none",borderRadius:6,cursor:"pointer",padding:0}}/>
                  </PropSection>
                )}
                {selectedEl.type === "image" && (
                  <PropSection>
                    <SectionLabel>Image</SectionLabel>
                    <Button size="small" variant="outlined" fullWidth sx={{mb:1,fontSize:12}} onClick={()=>fileInputRef.current?.click()}>Upload from device</Button>
                    <CompactInput label="Or paste URL" size="small" fullWidth value={selectedEl.src||""} onChange={(e)=>updateSel({src:e.target.value})}/>
                  </PropSection>
                )}
                <PropSection>
                  <SectionLabel>Lock / Visibility</SectionLabel>
                  <Button
                    size="small" fullWidth variant="outlined"
                    onClick={() => updateSel({ locked: !selectedEl.locked })}
                    sx={{ fontSize: 11, borderRadius: 2, textTransform: "none",
                      borderColor: selectedEl?.locked ? "#EF4444" : "#CBD5E1",
                      color: selectedEl?.locked ? "#EF4444" : "#64748B",
                    }}
                  >
                    {selectedEl?.locked ? "🔒 Locked — click to unlock" : "🔓 Unlocked — click to lock"}
                  </Button>
                  <Typography sx={{ fontSize: 10, color: "text.secondary", mt: 0.5, lineHeight: 1.4 }}>
                    Locked elements can't be accidentally selected or moved
                  </Typography>
                </PropSection>
                <PropSection>
                  <SectionLabel>Transform</SectionLabel>
                  <Typography sx={{fontSize:10,color:"text.secondary",mb:0.5}}>Opacity ({selectedEl.opacity||100}%)</Typography>
                  <Slider size="small" min={0} max={100} value={selectedEl.opacity||100} onChange={(_,v)=>updateSel({opacity:v})} sx={{color:"primary.main",mb:1}}/>
                  <CompactInput label="Rotation (°)" type="number" size="small" fullWidth value={selectedEl.rotation||0} inputProps={{min:-360,max:360}} onChange={(e)=>updateSel({rotation:parseInt(e.target.value)||0})}/>
                </PropSection>
              </>
            )}
          </Box>

          {/* Layers */}
          <Box sx={{borderTop:"1px solid",borderColor:"divider",maxHeight:160,overflow:"hidden",display:"flex",flexDirection:"column"}}>
            <Box sx={{px:1.5,py:1,display:"flex",alignItems:"center",gap:1}}>
              <LayersIcon sx={{fontSize:14,color:"text.secondary"}}/>
              <SectionLabel sx={{mb:0}}>Layers</SectionLabel>
            </Box>
            <Box sx={{overflowY:"auto",flex:1}}>
              {[...elements].reverse().map(el => (
                <LayerItem key={el.id} active={multiSel.has(el.id)?1:0} onClick={(e)=>selectOne(el.id, e.shiftKey)}>
                  <Box sx={{fontSize:10,color:"text.secondary",minWidth:10}}>
                    {el.type==="text"||el.type==="heading"?"T":el.type==="rect"?"▭":el.type==="circle"?"●":el.type==="image"?"🖼":"—"}
                  </Box>
                  <Typography sx={{flex:1,fontSize:11,overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap",opacity:el.locked?0.45:1}}>
                    {el.content||el.type}
                  </Typography>
                  {el.locked && <Typography sx={{fontSize:10,mr:0.5}}>🔒</Typography>}
                  <IconButton size="small" onClick={(e)=>{e.stopPropagation();deleteEl(el.id);}} sx={{p:0.2,color:"error.main",opacity:0.6,"&:hover":{opacity:1}}}>
                    <CloseIcon sx={{fontSize:12}}/>
                  </IconButton>
                </LayerItem>
              ))}
            </Box>
          </Box>
        </SidePanel>

        {/* MAIN AREA */}
        <Box sx={{flex:1,display:"flex",flexDirection:"column",overflow:"hidden"}}>
          <Toolbar>
            <FormControl size="small" sx={{minWidth:140}}>
              <Select value={template} onChange={(e)=>applyTemplate(e.target.value)} sx={{fontSize:12,"& .MuiSelect-select":{py:"5px"}}}>
                {TEMPLATES.map(t=><MenuItem key={t.value} value={t.value} sx={{fontSize:12}}>{t.label}</MenuItem>)}
              </Select>
            </FormControl>
            <TbDivider/>
            <Tooltip title="Canvas background">
              <Button size="small" variant="outlined" onClick={()=>bgInputRef.current?.click()} sx={{fontSize:11,py:0.5,minWidth:0}}>
                <Box sx={{width:14,height:14,borderRadius:0.5,background:canvasBg,border:"1px solid rgba(0,0,0,0.2)",mr:0.5}}/> BG
              </Button>
            </Tooltip>
            <Tooltip title="Toggle grid">
              <IconButton size="small" onClick={()=>setGridOn(g=>!g)} sx={{color:gridOn?"primary.main":"text.secondary"}}>
                <GridIcon fontSize="small"/>
              </IconButton>
            </Tooltip>
            <TbDivider/>
            <Tooltip title="Duplicate (Ctrl+D)"><span><IconButton size="small" disabled={multiSel.size===0} onClick={()=>selectedEl&&duplicateEl(selectedEl)}><DuplicateIcon fontSize="small"/></IconButton></span></Tooltip>
            <Tooltip title="Bring forward"><span><IconButton size="small" disabled={multiSel.size===0} onClick={bringFwd}><KeyboardArrowUp fontSize="small"/></IconButton></span></Tooltip>
            <Tooltip title="Send backward"><span><IconButton size="small" disabled={multiSel.size===0} onClick={sendBack}><KeyboardArrowDown fontSize="small"/></IconButton></span></Tooltip>
            <Tooltip title="Delete (Del)"><span><IconButton size="small" disabled={multiSel.size===0} onClick={()=>selectedEl&&deleteEl(selectedEl.id)} sx={{color:selectedEl?"error.main":undefined}}><DeleteIcon fontSize="small"/></IconButton></span></Tooltip>
            <TbDivider/>
            <Tooltip title="Undo (Ctrl+Z)">
              <span>
                <IconButton size="small" disabled={!canUndo} onClick={undo}
                  sx={{ color: canUndo ? "text.primary" : "text.disabled" }}>
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M12.5 8c-2.65 0-5.05.99-6.9 2.6L2 7v9h9l-3.62-3.62c1.39-1.16 3.16-1.88 5.12-1.88 3.54 0 6.55 2.31 7.6 5.5l2.37-.78C21.08 11.03 17.15 8 12.5 8z"/>
                  </svg>
                </IconButton>
              </span>
            </Tooltip>
            <Tooltip title="Redo (Ctrl+Y)">
              <span>
                <IconButton size="small" disabled={!canRedo} onClick={redo}
                  sx={{ color: canRedo ? "text.primary" : "text.disabled" }}>
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M18.4 10.6C16.55 8.99 14.15 8 11.5 8c-4.65 0-8.58 3.03-9.96 7.22L3.9 16c1.05-3.19 4.05-5.5 7.6-5.5 1.95 0 3.73.72 5.12 1.88L13 16h9V7l-3.6 3.6z"/>
                  </svg>
                </IconButton>
              </span>
            </Tooltip>
            <TbDivider/>
            <Tooltip title="Zoom out"><IconButton size="small" onClick={()=>setZoom(z=>Math.max(0.2,+(z-0.1).toFixed(1)))}><ZoomOutIcon fontSize="small"/></IconButton></Tooltip>
            <Chip label={`${Math.round(zoom*100)}%`} size="small" sx={{fontSize:11,height:22}}/>
            <Tooltip title="Zoom in"><IconButton size="small" onClick={()=>setZoom(z=>Math.min(2,+(z+0.1).toFixed(1)))}><ZoomInIcon fontSize="small"/></IconButton></Tooltip>
            <TbDivider/>
            <Tooltip title="Reset canvas">
              <IconButton size="small" onClick={()=>{const fr=defaultCertElements(canvasW,canvasH);historyRef.current=[fr];historyIdx.current=0;setElementsRaw(fr);setCanUndo(false);setCanRedo(false);setSelected(null);setEditingTemplateId(null);setTemplateName("");}}><ResetIcon fontSize="small"/></IconButton>
            </Tooltip>
            <TbDivider/>
            <Tooltip title="Load template from database">
              <IconButton size="small" onClick={openLoadDialog} sx={{color:"text.secondary"}}><CloudDownloadIcon fontSize="small"/></IconButton>
            </Tooltip>
            <Button size="small" variant="outlined" startIcon={<CloudUploadIcon/>} onClick={()=>setSaveDialogOpen(true)}
              sx={{fontSize:11,py:0.5,borderColor:"primary.light",color:"primary.main"}}>
              {editingTemplateId?"Update DB":"Save to DB"}
            </Button>
            <Button variant="contained" size="small" startIcon={<PrintIcon/>} onClick={handlePrint}
              sx={{ml:"auto",background:"linear-gradient(to right,#14B8A6,#0F766E)",boxShadow:"none",fontSize:12,py:0.6}}>
              {certType !== "none" ? "Pick Record & Print" : "Print"}
            </Button>
          </Toolbar>

          {/* Canvas */}
          <Box sx={{flex:1,overflow:"auto",display:"flex",alignItems:"flex-start",justifyContent:"center",p:3,background:"#E2E8E7"}}
            onClick={(e)=>{if(e.target===e.currentTarget)clearSelection();}}>
            <Box ref={canvasRef}
              onDragOver={(e)=>e.preventDefault()}
              onDrop={handleCanvasDrop}
              onClick={(e)=>{if(e.target===canvasRef.current){clearSelection();}}}
              sx={{position:"relative",width:canvasW*zoom,height:canvasH*zoom,background:canvasBg,boxShadow:"0 8px 40px rgba(0,0,0,0.2)",overflow:"hidden",flexShrink:0,
                ...(gridOn&&{backgroundImage:"linear-gradient(rgba(15,118,110,.12) 1px,transparent 1px),linear-gradient(90deg,rgba(15,118,110,.12) 1px,transparent 1px)",backgroundSize:`${20*zoom}px ${20*zoom}px`})}}>
              {[...elements].sort((a,b)=>a.zIndex-b.zIndex).map(el=>renderElement(el))}
            </Box>
          </Box>
        </Box>
      </Box>

      {/* ── Save Dialog ── */}
      <Dialog open={saveDialogOpen} onClose={()=>setSaveDialogOpen(false)} maxWidth="xs" fullWidth PaperProps={{sx:{borderRadius:3}}}>
        <DialogTitle sx={{pb:1}}>
          <Typography variant="h6" sx={{fontWeight:700}}>{editingTemplateId?"Update Template":"Save Template to Database"}</Typography>
          <Typography variant="body2" sx={{color:"text.secondary",mt:0.5}}>
            {placeholderCount} dynamic placeholder(s) · {TEMPLATES.find(t=>t.value===template)?.label}
            {certType !== "none" && ` · ${currentCertDef?.label}`}
          </Typography>
        </DialogTitle>
        <DialogContent sx={{pt:1}}>
          <TextField label="Template Name" fullWidth size="small" value={templateName} onChange={(e)=>setTemplateName(e.target.value)} sx={{mb:2,mt:1}} required placeholder="e.g. Marriage Certificate A4"/>
          <TextField label="Description (optional)" fullWidth size="small" multiline rows={2} value={templateDesc} onChange={(e)=>setTemplateDesc(e.target.value)} sx={{mb:2}} placeholder="e.g. Form D marriage certificate"/>
          {placeholderCount > 0 && (
            <Box sx={{p:1.5,borderRadius:2,background:"#f0fdf4",border:"1px solid #86efac"}}>
              <Typography sx={{fontSize:11,color:"#15803d",fontWeight:600}}>Placeholders in this template:</Typography>
              <Typography sx={{fontSize:11,color:"#15803d",fontFamily:"monospace",mt:0.5}}>
                {elements.filter(el=>(el.content||"").includes("{{")).map(el=>(el.content.match(/\{\{[^}]+\}\}/g)||[])).flat().join(", ")}
              </Typography>
            </Box>
          )}
        </DialogContent>
        <DialogActions sx={{px:3,pb:2,gap:1}}>
          <Button onClick={()=>setSaveDialogOpen(false)} variant="outlined" sx={{borderRadius:2}}>Cancel</Button>
          <Button onClick={saveToDb} variant="contained" disabled={savingToDb}
            sx={{borderRadius:2,background:"linear-gradient(to right,#14B8A6,#0F766E)",boxShadow:"none"}}>
            {savingToDb?<><CircularProgress size={14} color="inherit" sx={{mr:1}}/>Saving...</>:editingTemplateId?"Update":"Save"}
          </Button>
        </DialogActions>
      </Dialog>

      {/* ── Load Dialog ── */}
      <Dialog open={loadDialogOpen} onClose={()=>setLoadDialogOpen(false)} maxWidth="sm" fullWidth PaperProps={{sx:{borderRadius:3}}}>
        <DialogTitle sx={{pb:1,display:"flex",justifyContent:"space-between",alignItems:"center"}}>
          <Typography variant="h6" sx={{fontWeight:700}}>Saved Templates</Typography>
          <IconButton size="small" onClick={()=>setLoadDialogOpen(false)}><CloseIcon/></IconButton>
        </DialogTitle>
        <DialogContent sx={{pt:0,px:2}}>
          {loadingTemplates ? (
            <Box sx={{display:"flex",justifyContent:"center",py:4}}><CircularProgress/></Box>
          ) : savedTemplates.length === 0 ? (
            <Box sx={{textAlign:"center",py:4}}>
              <Typography sx={{color:"text.secondary"}}>No saved templates found</Typography>
            </Box>
          ) : (
            <List disablePadding>
              {savedTemplates.map((tpl,i) => (
                <React.Fragment key={tpl._id}>
                  {i > 0 && <MuiDivider/>}
                  <ListItem button onClick={()=>loadFromDb(tpl)} sx={{"&:hover":{background:"#f0fdf4"},borderRadius:1,py:1.5}}>
                    <ListItemText
                      primary={<Typography sx={{fontWeight:600,fontSize:14}}>{tpl.name}</Typography>}
                      secondary={
                        <Box>
                          <Typography sx={{fontSize:12,color:"text.secondary"}}>{tpl.description||"No description"}</Typography>
                          <Box sx={{display:"flex",gap:1,mt:0.5,flexWrap:"wrap"}}>
                            <Chip label={TEMPLATES.find(t=>t.value===tpl.pageSize)?.label||tpl.pageSize} size="small" sx={{fontSize:10,height:18}}/>
                            <Chip label={`${tpl.elements?.length||0} elements`} size="small" sx={{fontSize:10,height:18,background:"#f0fdf4",color:"#166534"}}/>
                            {tpl.certType && tpl.certType !== "none" && (
                              <Chip label={CERTIFICATE_TYPES.find(c=>c.value===tpl.certType)?.label||tpl.certType} size="small" sx={{fontSize:10,height:18,background:"#CCFBF1",color:"#0F766E",fontWeight:600}}/>
                            )}
                            {tpl.elements?.some(el=>(el.content||"").includes("{{")) && (
                              <Chip label="has placeholders" size="small" sx={{fontSize:10,height:18,background:"#eff6ff",color:"#1d4ed8"}}/>
                            )}
                          </Box>
                        </Box>
                      }
                    />
                    <ListItemSecondaryAction sx={{display:"flex",gap:0.5}}>
                      <Tooltip title="Duplicate template">
                        <IconButton size="small" onClick={(e)=>duplicateFromDb(tpl,e)} sx={{color:"#0F766E"}}>
                          <DuplicateIcon fontSize="small"/>
                        </IconButton>
                      </Tooltip>
                      <Tooltip title="Delete template">
                        <IconButton size="small" onClick={(e)=>deleteFromDb(tpl._id,e)} sx={{color:"error.main"}}>
                          <DeleteIcon fontSize="small"/>
                        </IconButton>
                      </Tooltip>
                    </ListItemSecondaryAction>
                  </ListItem>
                </React.Fragment>
              ))}
            </List>
          )}
        </DialogContent>
      </Dialog>

      {/* ── Print: Pick Record Dialog ── */}
      <Dialog
        open={printRecordDialogOpen}
        onClose={() => { setPrintRecordDialogOpen(false); setPrintSearch(""); }}
        maxWidth="sm" fullWidth
        PaperProps={{ sx: { borderRadius: 3 } }}
      >
        <DialogTitle sx={{ pb: 1, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <Box>
            <Typography variant="h6" sx={{ fontWeight: 700 }}>
              Select {currentCertDef?.label || "Record"} to Print
            </Typography>
            <Typography variant="body2" sx={{ color: "text.secondary", mt: 0.3 }}>
              Choose a record — placeholders will be filled automatically
            </Typography>
          </Box>
          <IconButton size="small" onClick={() => { setPrintRecordDialogOpen(false); setPrintSearch(""); }}>
            <CloseIcon />
          </IconButton>
        </DialogTitle>
        <DialogContent sx={{ pt: 1, px: 2 }}>
          <TextField
            fullWidth size="small" placeholder="Search records…"
            value={printSearch}
            onChange={(e) => setPrintSearch(e.target.value)}
            sx={{ mb: 1.5 }}
            InputProps={{ sx: { borderRadius: 2, fontSize: 13 } }}
          />
          {printRecordsLoading ? (
            <Box sx={{ display: "flex", justifyContent: "center", py: 4 }}>
              <CircularProgress />
            </Box>
          ) : filteredPrintRecords.length === 0 ? (
            <Box sx={{ textAlign: "center", py: 4 }}>
              <Typography sx={{ color: "text.secondary" }}>No records found</Typography>
            </Box>
          ) : (
            <List disablePadding sx={{ maxHeight: 380, overflowY: "auto" }}>
              {filteredPrintRecords.map((rec, i) => (
                <React.Fragment key={rec._id}>
                  {i > 0 && <MuiDivider />}
                  <ListItem
                    button
                    onClick={() => handlePickRecord(rec)}
                    sx={{ "&:hover": { background: "#f0fdf4" }, borderRadius: 1, py: 1.2 }}
                  >
                    <Box sx={{
                      width: 32, height: 32, borderRadius: "50%",
                      background: "linear-gradient(135deg,#14B8A6,#0F766E)",
                      display: "flex", alignItems: "center", justifyContent: "center", mr: 1.5, flexShrink: 0,
                    }}>
                      <CertIcon sx={{ color: "white", fontSize: 15 }} />
                    </Box>
                    <ListItemText
                      primary={
                        <Typography sx={{ fontWeight: 600, fontSize: 13 }}>
                          {recordLabel(rec)}
                        </Typography>
                      }
                      secondary={
                        certType === "marriage" ? (
                          <Typography sx={{ fontSize: 11, color: "text.secondary" }}>
                            {rec.dateOfMarriage ? new Date(rec.dateOfMarriage).toLocaleDateString("en-IN") : ""}
                            {rec.placeOfMarriage ? ` · ${rec.placeOfMarriage}` : ""}
                          </Typography>
                        ) : null
                      }
                    />
                    <Chip label="Print" size="small" sx={{ fontSize: 10, height: 20, background: "#CCFBF1", color: "#0F766E", fontWeight: 700, cursor: "pointer" }} />
                  </ListItem>
                </React.Fragment>
              ))}
            </List>
          )}
        </DialogContent>
      </Dialog>

      <Snackbar open={Boolean(message)} autoHideDuration={4000} onClose={()=>setMessage(null)} anchorOrigin={{vertical:"bottom",horizontal:"right"}}>
        <Alert onClose={()=>setMessage(null)} severity={message?.type||"info"} variant="filled" sx={{borderRadius:2,backgroundColor:message?.type==="error"?undefined:"#0F766E"}}>
          {message?.text}
        </Alert>
      </Snackbar>
    </>
  );
};

export default PrintDesigner;