/**
 * MarriageCertificatePDF.jsx — v7 Single-Page Adaptive
 *
 * ALL content fits on ONE page for every page size.
 * Layout engine measures available space and adapts row heights,
 * font sizes, and spacing accordingly — no addPage() ever.
 *
 * 10 templates:
 *   classic | royal | midnight | rose | slate | verdant
 *   scroll  | ledger | proclamation | letterhead
 */

import React, { useState } from "react";
import { jsPDF } from "jspdf";
import {
  Button, Menu, MenuItem, ListItemIcon, ListItemText,
  Divider, Box, Dialog, DialogTitle, DialogContent,
  DialogActions, TextField, Typography, IconButton, Grid,
} from "@mui/material";
import PictureAsPdfIcon from "@mui/icons-material/PictureAsPdf";
import ArrowDropDownIcon from "@mui/icons-material/ArrowDropDown";
import CloseIcon  from "@mui/icons-material/Close";
import ChurchIcon from "@mui/icons-material/Church";
import CheckIcon  from "@mui/icons-material/Check";

// ─── PAGE SIZES ───────────────────────────────────────────────────────────────
const PAGE_SIZES = {
  a4portrait:  { label:"A4 Portrait",  jsPDFOpts:{orientation:"portrait", format:"a4"},     w:210, h:297 },
  a4landscape: { label:"A4 Landscape", jsPDFOpts:{orientation:"landscape",format:"a4"},     w:297, h:210 },
  a5:          { label:"A5 Portrait",  jsPDFOpts:{orientation:"portrait", format:"a5"},     w:148, h:210 },
  letter:      { label:"Letter (US)",  jsPDFOpts:{orientation:"portrait", format:"letter"}, w:216, h:279 },
  legal:       { label:"Legal (US)",   jsPDFOpts:{orientation:"portrait", format:"legal"},  w:216, h:356 },
};

// ─── HELPERS ──────────────────────────────────────────────────────────────────
const fmt = (d) => {
  if (!d) return "—";
  try { return new Date(d).toLocaleDateString("en-IN",{day:"2-digit",month:"long",year:"numeric"}); }
  catch { return d; }
};
const val      = (v) => (v && String(v).trim()) ? String(v).trim() : "—";
const todayFmt = ()  => new Date().toLocaleDateString("en-IN",{day:"2-digit",month:"long",year:"numeric"});

const PERSON_ROWS = (p) => [
  ["Official Name",  p?.officialName],
  ["Baptismal Name", p?.baptismalName],
  ["House Name",     p?.houseName],
  ["Father's Name",  p?.fatherName],
  ["Mother's Name",  p?.motherName],
  ["Parish",         p?.parish?.name  || p?.parishName],
  ["Diocese",        p?.diocese?.name || p?.dioceseName],
  ["Date of Birth",  fmt(p?.dob)],
  ["Date of Baptism",fmt(p?.dateOfBaptism)],
  ["Confirmation",   fmt(p?.dateOfConfirmation)],
];

// ─── ADAPTIVE LAYOUT ENGINE ───────────────────────────────────────────────────
/**
 * Compute layout metrics for one-page rendering.
 * Returns an object with row heights, font sizes, and zone heights
 * that guarantee everything fits within h.
 */
function computeLayout(cfg, settings, record) {
  const {w, h} = cfg;
  const lm = settings.marginLeft  ?? 14;
  const rt = settings.marginRight ?? 14;
  const mt = settings.marginTop   ?? 10;
  const cw = (w - rt) - lm;

  // Fixed zones
  const sealH   = 44;  // bottom seal block
  const footerH = 10;  // "Printed on" line
  const available = h - sealH - footerH;

  // Estimate header height
  const hasLogo     = settings.showLogo && settings.logoDataUrl?.startsWith("data:image");
  const logoH       = hasLogo ? 24 : 0;
  const churchLines = [settings.headerLine1||"x", settings.headerLine2, settings.headerLine3, settings.headerLine4].filter(Boolean).length;
  const headerH     = mt + Math.max(logoH, churchLines * 5 + 16) + (settings.showSubtitle!==false ? 10 : 0) + 8;

  // Cert + date/place banner
  const metaH = (settings.showCertNumbers!==false ? 8 : 0) + (settings.showDatePlace!==false ? 13 : 0);

  // Ceremony + witnesses rows
  const witnessCount = (record.witnesses||[]).filter(w=>w?.name).length;
  const ceremonyH    = settings.showCeremony!==false  ? 7 + 2*5.5 + 4  : 0;
  const witnessH     = settings.showWitnesses!==false ? 7 + witnessCount*5.5 + 4 : 0;
  const notesH       = (settings.showNotes!==false && record.notes) ? 7 + 15 : 0;
  const lowerH       = ceremonyH + witnessH + notesH;

  // Space left for person blocks
  const personSpace = available - headerH - metaH - lowerH;

  // Person blocks: always side-by-side (2 columns) to maximise row height
  // 10 rows each + 1 title row (7mm) = 10*RH + 7
  const showGroom = settings.showGroom !== false;
  const showBride = settings.showBride !== false;
  const TITLE_H   = 7;
  const ROWS      = PERSON_ROWS({}).length; // 10
  const blocksH   = ROWS;  // rows per block

  let rowH;
  if (showGroom && showBride) {
    // both blocks same height, side by side — rowH from total space
    rowH = (personSpace - TITLE_H) / ROWS;
  } else if (showGroom || showBride) {
    // one block
    rowH = (personSpace - TITLE_H) / ROWS;
  } else {
    rowH = 5;
  }

  // Clamp: min readable, max comfortable
  rowH = Math.max(4.0, Math.min(rowH, 8.0));

  // Font size scales with row height
  const dataFontSz = rowH >= 5.5 ? 7.5 : rowH >= 4.8 ? 7.0 : 6.5;
  const labelFontSz = dataFontSz - 0.5;

  return { lm, rt, mt, cw, available, headerH, metaH, lowerH, personSpace, rowH, dataFontSz, labelFontSz, sealH, footerH, hasLogo, showGroom, showBride };
}

// ─── SHARED HEADER RENDERER ───────────────────────────────────────────────────
function _drawHeader(doc, record, cfg, settings, P) {
  const {w} = cfg;
  const lm = settings.marginLeft ?? 14, rt = settings.marginRight ?? 14;
  const rm = w - rt, startY = settings.marginTop ?? 10;
  const logoSz = 20;

  const line1 = (settings.headerLine1?.trim()) || record.placeOfMarriage || "Parish Church";
  const line2 = settings.headerLine2 || "";
  const line3 = settings.headerLine3 || "";
  const line4 = settings.headerLine4 || "";

  const logoRaw  = settings.logoDataUrl || "";
  const hasLogo  = settings.showLogo !== false && logoRaw.startsWith("data:image");
  const cx = w / 2;
  let y = startY;

  if (hasLogo) {
    try {
      doc.addImage(logoRaw, logoRaw.startsWith("data:image/png")?"PNG":"JPEG", lm, y, logoSz, logoSz);
    } catch(e) {}
  }

  const logoOffset = hasLogo ? 6 : 0;

  if (settings.showChurchName !== false) {
    const sz = settings.churchNameSize==="small" ? 10 : settings.churchNameSize==="medium" ? 12 : 14;
    doc.setFontSize(sz); doc.setFont("helvetica","bold"); doc.setTextColor(...P.accent1);
    doc.text(line1, cx, y + logoOffset, {align:"center"});
    y += logoOffset + sz * 0.42 + 2;
  }
  [[line2,8,"normal"],[line3,7.5,"normal"],[line4,7.5,"italic"]].forEach(([txt,sz,style]) => {
    if (!txt) return;
    doc.setFontSize(sz); doc.setFont("helvetica",style); doc.setTextColor(...P.muted);
    doc.text(txt, cx, y-2, {align:"center"}); y += sz*0.38 + 1.5;
  });
  if (hasLogo) y = Math.max(y, startY + logoSz + 2);
  if (settings.showSubtitle !== false) {
    doc.setFontSize(7.5); doc.setFont("helvetica","normal"); doc.setTextColor(...P.muted);
    doc.text("Certificate of Marriage — Form D", cx, y, {align:"center"}); y += 5;
  }
  doc.setDrawColor(...P.accent1); doc.setLineWidth(0.7); doc.line(lm, y, rm, y);
  y += 1; doc.setLineWidth(0.2); doc.line(lm, y, rm, y); y += 4;
  return y;
}

// ─── SHARED PERSON BLOCK ─────────────────────────────────────────────────────
function _personBlock(doc, person, title, sx, sy, bw, P, isGroom, rowH, labelSz, dataSz) {
  let py = sy;
  const ac = isGroom ? P.accent1 : P.accent2;
  const bg = isGroom ? P.bg1 : P.bg2;
  const th = 6.5;
  doc.setFillColor(...ac); doc.roundedRect(sx, py, bw, th, 1.2, 1.2, "F");
  doc.setTextColor(255,255,255); doc.setFontSize(7.5); doc.setFont("helvetica","bold");
  doc.text(title, sx+4, py+4.5); py += th + 0.5;
  PERSON_ROWS(person).forEach(([k, v2]) => {
    doc.setFillColor(...bg); doc.rect(sx, py, bw, rowH, "F");
    doc.setDrawColor(200,215,235); doc.setLineWidth(0.1); doc.line(sx, py+rowH, sx+bw, py+rowH);
    doc.setFont("helvetica","bold"); doc.setFontSize(labelSz); doc.setTextColor(...ac);
    doc.text(k, sx+2, py + rowH*0.65);
    doc.setFont("helvetica","normal"); doc.setFontSize(dataSz); doc.setTextColor(...P.text);
    doc.text((doc.splitTextToSize(val(v2), bw-34)[0]||val(v2)), sx+34, py + rowH*0.65);
    py += rowH;
  });
  return py;
}

// ─── SHARED PERSONS SECTION ───────────────────────────────────────────────────
function _personsSection(doc, record, cfg, y, lm, cw, P, L) {
  const {showGroom, showBride, rowH, labelFontSz, dataFontSz} = L;
  if (!showGroom && !showBride) return y;
  // Always side-by-side
  const hw = (cw - 4) / 2;
  let ge = y, be = y;
  if (showGroom) ge = _personBlock(doc, record.groom, "BRIDEGROOM", lm,           y, showBride?hw:cw, P, true,  rowH, labelFontSz, dataFontSz);
  if (showBride) be = _personBlock(doc, record.bride, "BRIDE",       lm+(showGroom?hw+4:0), y, showGroom?hw:cw, P, false, rowH, labelFontSz, dataFontSz);
  return Math.max(ge, be) + 3;
}

// ─── SHARED SECTION HEAD ─────────────────────────────────────────────────────
function _sectionHead(doc, text, y, lm, cw, acRgb) {
  doc.setFillColor(...acRgb); doc.roundedRect(lm, y, cw, 6.5, 1.2, 1.2, "F");
  doc.setTextColor(255,255,255); doc.setFontSize(7.5); doc.setFont("helvetica","bold");
  doc.text(text.toUpperCase(), lm+4, y+4.5); return y + 8;
}

// ─── SHARED LOWER SECTIONS ───────────────────────────────────────────────────
function _certNumbers(doc, record, w, lm, P, y) {
  doc.setFont("helvetica","bold"); doc.setFontSize(7.5); doc.setTextColor(...P.accent1);
  doc.text("Certificate No:", lm, y);
  doc.setFont("helvetica","normal"); doc.setTextColor(...P.text); doc.text(val(record.certificateNo), lm+28, y);
  doc.setFont("helvetica","bold"); doc.setTextColor(...P.accent1); doc.text("Registration No:", w/2+4, y);
  doc.setFont("helvetica","normal"); doc.setTextColor(...P.text); doc.text(val(record.registrationNo), w/2+35, y);
  return y + 7;
}

function _datePlaceBanner(doc, record, y, lm, cw, P, bgRgb, borderRgb) {
  doc.setFillColor(...bgRgb); doc.setDrawColor(...borderRgb); doc.setLineWidth(0.35);
  doc.roundedRect(lm, y-2.5, cw, 9.5, 1.5, 1.5, "FD");
  doc.setFont("helvetica","bold"); doc.setFontSize(8.5); doc.setTextColor(...P.accent1);
  doc.text(record.dateOfMarriage?`Date of Marriage: ${fmt(record.dateOfMarriage)}`:"Date of Marriage: —", lm+3, y+4);
  doc.text(record.placeOfMarriage?`Place of Marriage: ${record.placeOfMarriage}`:"Place of Marriage: —", lm+cw/2+3, y+4);
  return y + 12;
}

function _ceremonyRows(doc, record, y, lm, cw, P, vicarName) {
  const RH = 7;        // row height — tall enough for text not to clip
  const VAL = lm + 42; // value column start — wide enough for "Vicar / Asst."
  const valW = lm + cw - VAL - 2; // available width for value text
  y = _sectionHead(doc, "Ceremony Details", y, lm, cw, P.accent1);
  [["Minister", record.ministerName?`Fr. ${record.ministerName}`:null],
   ["Vicar / Asst.", vicarName||record.vicarName]].forEach(([k,v2],i) => {
    doc.setFillColor(...(i%2===0?P.bg1:P.bg2)); doc.rect(lm, y, cw, RH, "F");
    doc.setFont("helvetica","bold"); doc.setFontSize(7.5); doc.setTextColor(...P.accent1);
    doc.text(k, lm+3, y + RH*0.65);
    doc.setFont("helvetica","normal"); doc.setTextColor(...P.text);
    doc.text((doc.splitTextToSize(val(v2), valW)[0]||val(v2)), VAL-9, y + RH*0.65);
    y += RH;
  }); return y + 3;
}

function _witnessRows(doc, record, y, lm, cw, P) {
  const wits = (record.witnesses||[]).filter(w=>w?.name);
  if (!wits.length) return y;
  const RH  = 7;       // row height
  const VAL = lm + 34; // value column — "Witness 1" fits in 34mm
  const valW = lm + cw - VAL - 2;
  y = _sectionHead(doc, "Witnesses", y, lm, cw, P.accent1);
  wits.forEach((w,i) => {
    doc.setFillColor(...(i%2===0?P.bg1:P.bg2)); doc.rect(lm, y, cw, RH, "F");
    doc.setFont("helvetica","bold"); doc.setFontSize(7.5); doc.setTextColor(...P.accent1);
    doc.text(`Witness ${i+1}`, lm+3, y + RH*0.65);
    doc.setFont("helvetica","normal"); doc.setTextColor(...P.text);
    doc.text((doc.splitTextToSize([w.name,w.address].filter(Boolean).join(", "), valW)[0]||""), VAL, y + RH*0.65);
    y += RH;
  }); return y + 3;
}

function _notesRows(doc, record, y, lm, cw, P) {
  if (!record.notes) return y;
  y = _sectionHead(doc, "Remarks", y, lm, cw, P.accent1);
  doc.setFont("helvetica","normal"); doc.setFontSize(7.5); doc.setTextColor(...P.muted);
  doc.splitTextToSize(record.notes, cw-4).forEach(line => { doc.text(line, lm+2, y); y += 4.5; });
  return y + 3;
}

// ─── CERTIFICATION LINE ──────────────────────────────────────────────────────
// "Certified that the above facts are a true copy of the entry in the
//  Marriage Register kept in the Church"
function _certificationLine(doc, y, lm, cw, P) {
  const text = "Certified that the above facts are a true copy of the entry in the Marriage Register kept in the Church.";
  // Light background band
  doc.setFillColor(...P.bg1);
  doc.roundedRect(lm, y, cw, 9, 1.5, 1.5, "F");
  doc.setDrawColor(...P.accent1); doc.setLineWidth(0.25);
  doc.roundedRect(lm, y, cw, 9, 1.5, 1.5, "S");
  doc.setFont("helvetica","italic"); doc.setFontSize(7); doc.setTextColor(...P.muted);
  // Split to fit width
  const lines = doc.splitTextToSize(text, cw - 6);
  lines.forEach((line, i) => {
    doc.text(line, lm + cw/2, y + 3.5 + i * 4, { align: "center" });
  });
  return y + 11;
}

// ─── SHARED BOTTOM SEAL ───────────────────────────────────────────────────────
// Anchored to h - sealH so it always sits at the bottom of the page
function _bottomSeal(doc, record, cfg, lm, cw, P, vicarName, settings) {
  const {w, h} = cfg;
  const sealH =  44, today = todayFmt();
  const bY = h - sealH;
  const zW = cw/3, mCx = lm+zW+zW/2, sX = lm+zW*2, sWd = cw-zW*2-2;

  if (settings.showDatePlace !== false) {
    doc.setFont("helvetica","bold"); doc.setFontSize(7.5); doc.setTextColor(...P.accent1);
    doc.text((doc.splitTextToSize(record.placeOfMarriage||"Parish Church",zW-2)[0]), lm, bY+20);
    doc.setFont("helvetica","normal"); doc.setFontSize(7); doc.setTextColor(...P.text);
    doc.text(today, lm, bY+25);
    // doc.setDrawColor(...P.accent1); doc.setLineWidth(0.3); doc.line(lm, bY+7.5, lm+zW-4, bY+7.5);
  }
  if (settings.showTextSeal !== false) {
    const sh = Math.min(18, zW/2-2);
    doc.setFont("helvetica","bold"); doc.setFontSize(7.5); doc.setTextColor(...P.accent1);
    doc.text("", mCx, bY, {align:"center"});
    doc.setDrawColor(...P.accent1); doc.setLineWidth(0.3);
    // doc.line(mCx-sh,bY-4,mCx+sh,bY-4); doc.line(mCx-sh,bY+9,mCx+sh,bY+9);
    // doc.line(mCx-sh,bY-4,mCx-sh,bY+9); doc.line(mCx+sh,bY-4,mCx+sh,bY+9);
    doc.setFont("helvetica","italic"); doc.setFontSize(6.5); doc.setTextColor(...P.muted);
    doc.text("(Church Seal)", mCx, bY+25, {align:"center"});
  }
  if (settings.showMinisterSig !== false) {
    const sigY = bY + 2;
    // doc.setDrawColor(...P.accent1); doc.setLineWidth(0.5); doc.line(sX, sigY, sX+sWd, sigY);
    doc.setFont("helvetica","bold"); doc.setFontSize(7); doc.setTextColor(...P.accent1);
    doc.text(vicarName?`Fr. ${vicarName}`:(record.ministerName?`Fr. ${record.ministerName}`:"Minister"), sX+sWd/2, sigY+18, {align:"center"});
    doc.setFont("helvetica","normal"); doc.setFontSize(6.5); doc.setTextColor(...P.muted);
    doc.text("Vicar", sX+sWd/2, sigY+23, {align:"center"});
  }
}

function _footer(doc, w, h, mutedRgb) {
  doc.setFont("helvetica","italic"); doc.setFontSize(6.5); doc.setTextColor(...mutedRgb);
  doc.text(`Printed on ${todayFmt()}`, w/2, h-4, {align:"center"});
}

// ═══════════════════════════════════════════════════════════════════════════════
// COLOUR THEMES 1-6  (shared layout engine, different palettes/borders)
// ═══════════════════════════════════════════════════════════════════════════════

function _renderColorTheme(doc, record, cfg, vicarName, settings, P, topBands, bottomBands) {
  const {w,h} = cfg;
  const lm = settings.marginLeft??14, rt = settings.marginRight??14, rm=w-rt, cw=rm-lm;
  const L = computeLayout(cfg, settings, record);

  // Draw top bands
  topBands(doc, w);

  // Header
  let y = settings.showHeader!==false ? _drawHeader(doc,record,cfg,settings,P) : (settings.marginTop??10);

  // Cert numbers
  if (settings.showCertNumbers!==false) y = _certNumbers(doc,record,w,lm,P,y);

  // Date/place banner
  if (settings.showDatePlace!==false) y = _datePlaceBanner(doc,record,y,lm,cw,P,P.bg1,P.accent1);

  // Person blocks
  y = _personsSection(doc,record,cfg,y,lm,cw,P,L);

  // Lower sections (ceremony, witnesses, notes) — positioned right after persons
  if (settings.showCeremony!==false)  y = _ceremonyRows(doc,record,y,lm,cw,P,vicarName);
  if (settings.showWitnesses!==false) y = _witnessRows(doc,record,y,lm,cw,P);
  if (settings.showNotes!==false)     y = _notesRows(doc,record,y,lm,cw,P);
  y = _certificationLine(doc,y,lm,cw,P);

  // Bottom seal — always anchored to page bottom
  _bottomSeal(doc,record,cfg,lm,cw,P,vicarName,settings);

  // Bottom bands
  bottomBands(doc, w, h);
  if (settings.showPrintDate!==false) _footer(doc,w,h,P.muted);
}

function renderClassic(doc, record, cfg, vicarName, settings={}) {
  const P={accent1:[15,118,110],accent2:[190,24,93],bg1:[240,253,250],bg2:[253,242,248],text:[30,30,30],muted:[100,100,100]};
  _renderColorTheme(doc,record,cfg,vicarName,settings,P,
    (doc,w)=>{ doc.setFillColor(...P.accent1);doc.rect(0,0,w,3,"F"); doc.setFillColor(...P.accent2);doc.rect(0,3,w,1,"F"); },
    (doc,w,h)=>{ doc.setFillColor(...P.accent2);doc.rect(0,h-4,w,1,"F"); doc.setFillColor(...P.accent1);doc.rect(0,h-3,w,3,"F"); }
  );
}

function renderRoyal(doc, record, cfg, vicarName, settings={}) {
  const P={accent1:[120,53,15],accent2:[180,83,9],bg1:[255,251,235],bg2:[254,243,199],text:[30,20,0],muted:[120,90,50]};
  const {w,h}=cfg;
  doc.setFillColor(180,83,9);doc.rect(0,0,w,5,"F");
  doc.setFillColor(255,251,235);doc.rect(0,5,w,1.5,"F");
  doc.setFillColor(180,83,9);doc.rect(0,6.5,w,1,"F");
  _renderColorTheme(doc,record,cfg,vicarName,settings,P,
    ()=>{}, // top bands already drawn
    (doc,w,h)=>{ doc.setFillColor(255,251,235);doc.rect(0,h-6,w,1.5,"F"); doc.setFillColor(180,83,9);doc.rect(0,h-4.5,w,4.5,"F"); }
  );
}

function renderMidnight(doc, record, cfg, vicarName, settings={}) {
  const P={accent1:[30,58,95],accent2:[196,65,12],bg1:[239,246,255],bg2:[255,237,213],text:[15,25,50],muted:[100,116,139]};
  const {w,h}=cfg;
  doc.setFillColor(30,58,95);doc.rect(0,0,w,32,"F");
  doc.setFillColor(196,65,12);doc.rect(0,32,w,2.5,"F");
  const mP={...P,accent1:[255,255,255],muted:[180,210,255]};
  _renderColorTheme(doc,record,cfg,vicarName,{...settings,_headerP:mP},P,
    ()=>{},
    (doc,w,h)=>{ doc.setFillColor(196,65,12);doc.rect(0,h-5,w,2,"F"); doc.setFillColor(30,58,95);doc.rect(0,h-3,w,3,"F"); }
  );
}

function renderRose(doc, record, cfg, vicarName, settings={}) {
  const P={accent1:[157,23,77],accent2:[15,118,110],bg1:[255,241,242],bg2:[240,253,250],text:[50,10,30],muted:[150,80,110]};
  _renderColorTheme(doc,record,cfg,vicarName,settings,P,
    (doc,w)=>{ doc.setFillColor(157,23,77);doc.rect(0,0,w,2,"F"); doc.setFillColor(251,207,232);doc.rect(0,2,w,3,"F"); doc.setFillColor(157,23,77);doc.rect(0,5,w,1,"F"); },
    (doc,w,h)=>{ doc.setFillColor(251,207,232);doc.rect(0,h-5,w,2,"F"); doc.setFillColor(157,23,77);doc.rect(0,h-3,w,3,"F"); }
  );
}

function renderSlate(doc, record, cfg, vicarName, settings={}) {
  const P={accent1:[30,41,59],accent2:[71,85,105],bg1:[248,250,252],bg2:[241,245,249],text:[15,23,42],muted:[100,116,139]};
  _renderColorTheme(doc,record,cfg,vicarName,settings,P,
    (doc,w)=>{ doc.setFillColor(30,41,59);doc.rect(0,0,w,4,"F"); },
    (doc,w,h)=>{ doc.setFillColor(30,41,59);doc.rect(0,h-3,w,3,"F"); }
  );
}

function renderVerdant(doc, record, cfg, vicarName, settings={}) {
  const P={accent1:[20,83,45],accent2:[6,95,70],bg1:[240,253,244],bg2:[209,250,229],text:[5,46,22],muted:[74,120,90]};
  const {w}=cfg;
  doc.setFillColor(20,83,45);doc.rect(0,0,w,30,"F");
  doc.setFillColor(6,95,70);doc.rect(0,30,w,2,"F");
  const vP={...P,accent1:[255,255,255],muted:[167,243,208]};
  _renderColorTheme(doc,record,cfg,vicarName,{...settings,_headerP:vP},P,
    ()=>{},
    (doc,w,h)=>{ doc.setFillColor(6,95,70);doc.rect(0,h-4,w,1.5,"F"); doc.setFillColor(20,83,45);doc.rect(0,h-2.5,w,2.5,"F"); }
  );
}

// NOTE: midnight and verdant use a separate header colour palette (_headerP).
// Patch _drawHeader to support this:
const _drawHeaderOrig = _drawHeader;

// ═══════════════════════════════════════════════════════════════════════════════
// LAYOUT TEMPLATES 7-10  (different structures)
// ═══════════════════════════════════════════════════════════════════════════════

// ─── 7. FORMAL SCROLL ─────────────────────────────────────────────────────────
function renderScroll(doc, record, cfg, vicarName, settings={}) {
  const {w,h}=cfg;
  const lm=settings.marginLeft??11, rt=settings.marginRight??11, rm=w-rt, cw=rm-lm;
  const P={accent1:[80,40,10],accent2:[140,80,20],bg1:[255,252,240],bg2:[250,240,210],text:[40,20,0],muted:[120,90,60]};
  const L=computeLayout(cfg,settings,record);
  const cx=w/2;

  // Frame
  doc.setDrawColor(...P.accent1); doc.setLineWidth(1.0); doc.rect(5,5,w-10,h-10);
  doc.setLineWidth(0.3); doc.setDrawColor(...P.accent2); doc.rect(8,8,w-16,h-16);
  [[8,8],[w-8,8],[8,h-8],[w-8,h-8]].forEach(([x,y2])=>{ doc.setFillColor(...P.accent1);doc.circle(x,y2,1.2,"F"); });
  doc.setDrawColor(...P.accent2); doc.setLineWidth(0.2); //doc.line(16,15,w-16,15); doc.line(16,16.2,w-16,16.2);

  let y = settings.marginTop??20;

  // Logo
  const logoRaw=settings.logoDataUrl||"";
  if(settings.showLogo!==false && logoRaw.startsWith("data:image")){
    try{ doc.addImage(logoRaw,logoRaw.startsWith("data:image/png")?"PNG":"JPEG",cx-10,y,20,20); y+=23; }catch(e){}
  }

  // Church name
  if(settings.showChurchName!==false){
    const sz=settings.churchNameSize==="small"?10:settings.churchNameSize==="medium"?12:14;
    doc.setFontSize(sz); doc.setFont("times","bold"); doc.setTextColor(...P.accent1);
    doc.text((settings.headerLine1?.trim())||record.placeOfMarriage||"Parish Church",cx,y,{align:"center"}); y+=sz*0.4+2;
  }
  [settings.headerLine2,settings.headerLine3,settings.headerLine4].forEach(l=>{
    if(!l)return; doc.setFontSize(7); doc.setFont("times","normal"); doc.setTextColor(...P.muted);
    doc.text(l,cx,y,{align:"center"}); y+=4;
  });
  y+=1;
  doc.setDrawColor(...P.accent2); doc.setLineWidth(0.2); doc.line(16,y,cx-20,y); doc.line(cx+20,y,w-16,y); y+=1.5;
  if(settings.showSubtitle!==false){
    doc.setFontSize(8.5); doc.setFont("times","bolditalic"); doc.setTextColor(...P.accent1);
    doc.text("Certificate of Marriage",cx,y+4,{align:"center"}); y+=8;
    doc.setFontSize(7); doc.setFont("times","italic"); doc.setTextColor(...P.muted);
    doc.text("Form D",cx,y,{align:"center"}); y+=5;
  }
  doc.setDrawColor(...P.accent2); doc.setLineWidth(0.2); doc.line(16,y,cx-20,y); doc.line(cx+20,y,w-16,y); y+=3;

  if(settings.showCertNumbers!==false){
    doc.setFontSize(7); doc.setFont("times","normal"); doc.setTextColor(...P.muted);
    doc.text("Cert No: "+val(record.certificateNo),lm+4,y);
    doc.text("Reg No: "+val(record.registrationNo),rm-4,y,{align:"right"}); y+=4;
  }

  if(settings.showDatePlace!==false){
    doc.setFillColor(...P.bg2); doc.roundedRect(lm+3,y-1.5,cw-6,8.5,2,2,"F");
    doc.setDrawColor(...P.accent2); doc.setLineWidth(0.2); doc.roundedRect(lm+3,y-1.5,cw-6,8.5,2,2,"S");
    doc.setFont("times","bolditalic"); doc.setFontSize(8); doc.setTextColor(...P.accent1);
    doc.text("Place of Marriage : "+(record.placeOfMarriage||"—")+"       |      "+"Date of Marriage : "+(record.dateOfMarriage?fmt(record.dateOfMarriage):"—"),cx,y+4,{align:"center"}); y+=10;
  }

  // Person blocks — ruled rows
  const {rowH,labelFontSz,dataFontSz,showGroom,showBride}=L;
  const drawScrollPerson=(person,title,sx,bw)=>{
    let py=y;
    doc.setFillColor(...P.bg1); doc.rect(sx,py,bw,6,"F");
    doc.setDrawColor(...P.accent2); doc.setLineWidth(0.15); doc.rect(sx,py,bw,6,"S");
    doc.setFont("times","bold"); doc.setFontSize(7.5); doc.setTextColor(...P.accent1);
    doc.text(title,sx+bw/2,py+4.2,{align:"center"}); py+=6.5;
    PERSON_ROWS(person).forEach(([k,v2])=>{
      doc.setDrawColor(210,190,150); doc.setLineWidth(0.08); doc.line(sx,py+rowH*0.9,sx+bw,py+rowH*0.9);
      doc.setFont("times","bold"); doc.setFontSize(labelFontSz); doc.setTextColor(...P.muted); doc.text(k,sx+2,py+rowH*0.65);
      doc.setFont("times","normal"); doc.setFontSize(dataFontSz); doc.setTextColor(...P.text);
      doc.text((doc.splitTextToSize(val(v2),bw-32)[0]||val(v2)),sx+32,py+rowH*0.65); py+=rowH;
    }); return py+1;
  };
  const hw=(cw-4)/2;
  if(showGroom&&showBride){ const ge=drawScrollPerson(record.groom,"BRIDEGROOM",lm,hw); const be=drawScrollPerson(record.bride,"BRIDE",lm+hw+4,hw); y=Math.max(ge,be)+3; }
  else if(showGroom){ y=drawScrollPerson(record.groom,"BRIDEGROOM",lm,cw)+3; }
  else if(showBride){ y=drawScrollPerson(record.bride,"BRIDE",lm,cw)+3; }

  // Ceremony
  if(settings.showCeremony!==false){
    doc.setFont("times","bold"); doc.setFontSize(7.5); doc.setTextColor(...P.accent1);

    doc.text("CEREMONY DETAILS",cx-1,y+.5,{align:"center"});
    doc.setDrawColor(...P.accent2); doc.setLineWidth(0.15); doc.line(lm+3,y,cx-18,y); doc.line(cx+15,y,rm-3,y); y+=7;
    [["Minister",record.ministerName?`Fr. ${record.ministerName}`:null],["Vicar / Asst.",vicarName||record.vicarName]].forEach(([k,v2])=>{
      doc.setFont("times","bold"); doc.setFontSize(6.8); doc.setTextColor(...P.muted); doc.text(k+":",lm+6,y);
      doc.setFont("times","normal"); doc.setTextColor(...P.text); doc.text(val(v2),lm+28,y); y+=4.5;
    }); y+=2;
  }
  if(settings.showWitnesses!==false){
    const wits=(record.witnesses||[]).filter(w=>w?.name);
    if(wits.length){
      doc.setFont("times","bold"); doc.setFontSize(7.5); doc.setTextColor(...P.accent1);
      doc.text("WITNESSES",cx,y+.5,{align:"center"});
      doc.setDrawColor(...P.accent2); doc.setLineWidth(0.15); doc.line(lm+3,y,cx-15,y); doc.line(cx+15,y,rm-3,y); y+=7;
      wits.forEach((w,i)=>{
        doc.setFont("times","bold"); doc.setFontSize(6.8); doc.setTextColor(...P.muted); doc.text("Witness "+(i+1)+":",lm+6,y);
        doc.setFont("times","normal"); doc.setTextColor(...P.text);
        doc.text([w.name,w.address].filter(Boolean).join(", "),lm+28,y); y+=4.5;
      });
    }
  }
  // Scroll-style certification line
  y+=2;
  const certText="Certified that the above facts are a true copy of the entry in the Marriage Register kept in the Church.";
  doc.setFillColor(...P.bg2); doc.roundedRect(lm+3,y,cw-6,8,2,2,"F");
  doc.setDrawColor(...P.accent2); doc.setLineWidth(0.2); doc.roundedRect(lm+3,y,cw-6,8,2,2,"S");
  doc.setFont("times","italic"); doc.setFontSize(6.8); doc.setTextColor(...P.muted);
  doc.text(certText,cx,y+4.5,{align:"center",maxWidth:cw-10}); y+=10;

  // Bottom seal — anchored
  const bY=h-44, today=todayFmt();
  const zW=cw/3,mCx=lm+zW+zW/2,sX=lm+zW*2,sWd=cw-zW*2-2;
  if(settings.showDatePlace!==false){
    doc.setFont("times","italic"); doc.setFontSize(7.5); doc.setTextColor(...P.accent1);
    doc.text(record.placeOfMarriage||"—",lm+6,bY+22);
    doc.setFont("times","normal"); doc.setFontSize(7); doc.setTextColor(...P.text); doc.text(today,lm+6,bY+27);
    // doc.setDrawColor(...P.accent2); doc.setLineWidth(0.25); doc.line(lm+4,bY+7,lm+zW-4,bY+7);
  }
  if(settings.showTextSeal!==false){
    const sh=Math.min(16,zW/2-2);
    doc.setFont("times","bold"); doc.setFontSize(7); doc.setTextColor(...P.accent1); doc.text("",mCx,bY+20,{align:"center"});
    // doc.setDrawColor(...P.accent2); doc.setLineWidth(0.25); doc.rect(mCx-sh,bY-4,sh*2,11,"S");
    doc.setFont("times","italic"); doc.setFontSize(6.5); doc.setTextColor(...P.muted); doc.text("(Church Seal)",mCx,bY+26.5,{align:"center"});
  }
  if(settings.showMinisterSig!==false){
    // doc.setDrawColor(...P.accent2); doc.setLineWidth(0.4); doc.line(sX+2,bY+8,sX+sWd-2,bY+8);
    doc.setFont("times","bold"); doc.setFontSize(7); doc.setTextColor(...P.accent1);
    doc.text(vicarName?`Fr. ${vicarName}`:(record.ministerName?`Fr. ${record.ministerName}`:"Minister"),sX+sWd/2,bY+22,{align:"center"});
    doc.setFont("times","normal"); doc.setFontSize(6.5); doc.setTextColor(...P.muted);
    doc.text("Vicar",sX+sWd/2,bY+27,{align:"center"});
  }
  doc.setDrawColor(...P.accent2); doc.setLineWidth(0.2); doc.line(16,h-14,w-16,h-14); doc.line(16,h-15.2,w-16,h-15.2);
  if(settings.showPrintDate!==false){ doc.setFont("times","italic"); doc.setFontSize(6.5); doc.setTextColor(...P.muted); doc.text("Printed on "+todayFmt(),cx,h-11,{align:"center"}); }
}

// ─── 8. REGISTRY LEDGER ───────────────────────────────────────────────────────
function renderLedger(doc, record, cfg, vicarName, settings={}) {
  const {w,h}=cfg;
  const lm=settings.marginLeft??14, rt=settings.marginRight??14, rm=w-rt, cw=rm-lm;
  const P={accent1:[25,50,100],accent2:[180,60,0],bg1:[250,252,255],bg2:[245,248,255],text:[10,20,60],muted:[80,100,140]};
  const L=computeLayout(cfg,settings,record);
  const cx=w/2;
  const RH=L.rowH;

  // Left margin stripes
  doc.setFillColor(220,60,60); doc.rect(0,0,1,h,"F");
  doc.setFillColor(255,200,200); doc.rect(1,0,1,h,"F");

  // Header band
  doc.setFillColor(25,50,100); doc.rect(0,0,w,25,"F");

  const logoRaw=settings.logoDataUrl||"";
  if(settings.showLogo!==false && logoRaw.startsWith("data:image")){
    try{ doc.addImage(logoRaw,logoRaw.startsWith("data:image/png")?"PNG":"JPEG",lm,3,18,18); }catch(e){}
  }
  let hy=settings.marginTop??8;
  if(settings.showChurchName!==false){
    const sz=settings.churchNameSize==="small"?9:settings.churchNameSize==="medium"?11:13;
    doc.setFontSize(sz); doc.setFont("helvetica","bold"); doc.setTextColor(255,255,255);
    doc.text((settings.headerLine1?.trim())||record.placeOfMarriage||"Parish Church",cx,hy,{align:"center"}); hy+=sz*0.4+1.5;
  }
  [settings.headerLine2,settings.headerLine3].forEach(l=>{ if(!l)return; doc.setFontSize(6.8); doc.setFont("helvetica","normal"); doc.setTextColor(180,210,255); doc.text(l,cx,hy,{align:"center"}); hy+=3.5; });
  if(settings.showSubtitle!==false){ doc.setFontSize(6.5); doc.setFont("helvetica","italic"); doc.setTextColor(200,220,255); doc.text("PARISH MARRIAGE REGISTER — FORM D",cx,hy,{align:"center"}); }

  let y=27;
  if(settings.showCertNumbers!==false){
    doc.setFillColor(240,245,255); doc.rect(lm,y,cw,6.5,"F");
    doc.setDrawColor(180,190,220); doc.setLineWidth(0.2); doc.rect(lm,y,cw,6.5,"S");
    doc.setFont("helvetica","bold"); doc.setFontSize(7); doc.setTextColor(...P.accent1);
    doc.text("CERT NO:",lm+2,y+4.5); doc.setFont("helvetica","normal"); doc.setTextColor(...P.text); doc.text(val(record.certificateNo),lm+19,y+4.5);
    doc.setFont("helvetica","bold"); doc.setTextColor(...P.accent1); doc.text("REG NO:",cx+2,y+4.5);
    doc.setFont("helvetica","normal"); doc.setTextColor(...P.text); doc.text(val(record.registrationNo),cx+19,y+4.5); y+=8;
  }
  if(settings.showDatePlace!==false){
    doc.setFillColor(230,240,255); doc.rect(lm,y,cw,6.5,"F");
    doc.setDrawColor(180,190,220); doc.setLineWidth(0.2); doc.rect(lm,y,cw,6.5,"S");
    doc.setFont("helvetica","bold"); doc.setFontSize(7); doc.setTextColor(...P.accent1);
    doc.text("DATE:",lm+2,y+4.5); doc.setFont("helvetica","normal"); doc.setTextColor(...P.text);
    doc.text(record.dateOfMarriage?fmt(record.dateOfMarriage):"—",lm+15,y+4.5);
    doc.setFont("helvetica","bold"); doc.setTextColor(...P.accent1); doc.text("PLACE:",cx+2,y+4.5);
    doc.setFont("helvetica","normal"); doc.setTextColor(...P.text);
    doc.text((doc.splitTextToSize(record.placeOfMarriage||"—",cw/2-12)[0]||"—"),cx+14,y+4.5); y+=8;
  }

  const drawLGPerson=(person,title,sx,bw)=>{
    let py=y;
    doc.setFillColor(...P.accent1); doc.rect(sx,py,bw,5.5,"F");
    doc.setFont("helvetica","bold"); doc.setFontSize(7.5); doc.setTextColor(255,255,255);
    doc.text(title,sx+bw/2,py+4,{align:"center"}); py+=5.5;
    PERSON_ROWS(person).forEach(([k,v2],i)=>{
      doc.setFillColor(i%2===0?250:245,i%2===0?252:249,i%2===0?255:252); doc.rect(sx,py,bw,RH,"F");
      doc.setDrawColor(210,220,240); doc.setLineWidth(0.08); doc.line(sx,py+RH,sx+bw,py+RH);
      doc.setFont("helvetica","bold"); doc.setFontSize(L.labelFontSz); doc.setTextColor(...P.muted); doc.text(k,sx+2,py+RH*0.65);
      doc.setFont("helvetica","normal"); doc.setFontSize(L.dataFontSz); doc.setTextColor(...P.text);
      doc.text((doc.splitTextToSize(val(v2),bw-30)[0]||val(v2)),sx+30,py+RH*0.65); py+=RH;
    });
    doc.setDrawColor(...P.accent1); doc.setLineWidth(0.35); doc.line(sx,py,sx+bw,py); return py+2;
  };
  const hw=(cw-4)/2;
  if(L.showGroom&&L.showBride){ const ge=drawLGPerson(record.groom,"BRIDEGROOM",lm,hw); const be=drawLGPerson(record.bride,"BRIDE",lm+hw+4,hw); y=Math.max(ge,be)+3; }
  else if(L.showGroom){ y=drawLGPerson(record.groom,"BRIDEGROOM",lm,cw)+3; }
  else if(L.showBride){ y=drawLGPerson(record.bride,"BRIDE",lm,cw)+3; }

  const drawLGSection=(title,rows)=>{
    doc.setFillColor(...P.accent1); doc.rect(lm,y,cw,5.5,"F");
    doc.setFont("helvetica","bold"); doc.setFontSize(7.5); doc.setTextColor(255,255,255); doc.text(title,lm+3,y+4); y+=5.5;
    rows.forEach(([k,v2],i)=>{
      doc.setFillColor(i%2===0?250:245,i%2===0?252:249,255); doc.rect(lm,y,cw,RH,"F");
      doc.setDrawColor(210,220,240); doc.setLineWidth(0.08); doc.line(lm,y+RH,rm,y+RH);
      doc.setFont("helvetica","bold"); doc.setFontSize(7); doc.setTextColor(...P.muted); doc.text(k,lm+2,y+RH*0.65);
      doc.setFont("helvetica","normal"); doc.setTextColor(...P.text);
      doc.text((doc.splitTextToSize(val(v2),cw-36)[0]||val(v2)),lm+40,y+RH*0.65); y+=RH;
    }); y+=3;
  };
  if(settings.showCeremony!==false) drawLGSection("CEREMONY DETAILS",[["Minister",record.ministerName?`Fr. ${record.ministerName}`:null],["Vicar / Asst.",vicarName||record.vicarName]]);
  if(settings.showWitnesses!==false){
    const wits=(record.witnesses||[]).filter(w=>w?.name);
    if(wits.length) drawLGSection("WITNESSES",wits.map((w,i)=>["Witness "+(i+1),[w.name,w.address].filter(Boolean).join(", ")]));
  }
  y=_certificationLine(doc,y,lm,cw,P);

  _bottomSeal(doc,record,cfg,lm,cw,P,vicarName,settings);
  doc.setDrawColor(25,50,100); doc.setLineWidth(0.4); doc.line(lm,h-8,rm,h-8);
  if(settings.showPrintDate!==false){ doc.setFont("helvetica","italic"); doc.setFontSize(6.5); doc.setTextColor(...P.muted); doc.text("Printed on "+todayFmt(),cx,h-4,{align:"center"}); }
}

// ─── 9. PROCLAMATION ──────────────────────────────────────────────────────────
function renderProclamation(doc, record, cfg, vicarName, settings={}) {
  const {w,h}=cfg;
  const lm=settings.marginLeft??12, rt=settings.marginRight??12, rm=w-rt, cw=rm-lm;
  const P={accent1:[15,40,80],accent2:[160,20,20],bg1:[245,248,255],bg2:[255,245,245],text:[10,15,50],muted:[90,100,130]};
  const L=computeLayout(cfg,settings,record);
  const cx=w/2;

  doc.setFillColor(15,40,80); doc.rect(0,0,w,3.5,"F");
  doc.setFillColor(160,20,20); doc.rect(0,3.5,w,1.2,"F");

  let y=settings.marginTop??8;
  const logoRaw=settings.logoDataUrl||"";
  if(settings.showLogo!==false && logoRaw.startsWith("data:image")){
    try{ doc.addImage(logoRaw,logoRaw.startsWith("data:image/png")?"PNG":"JPEG",lm,y,18,18); y+=20; }catch(e){}
  }
  if(settings.showChurchName!==false){
    const sz=settings.churchNameSize==="small"?10:settings.churchNameSize==="medium"?12:14;
    doc.setFontSize(sz); doc.setFont("helvetica","bold"); doc.setTextColor(15,40,80);
    doc.text((settings.headerLine1?.trim())||record.placeOfMarriage||"Parish Church",cx,y+3,{align:"center"}); y+=sz*0.4+4;
  }
  [settings.headerLine2,settings.headerLine3].forEach(l=>{ if(!l)return; doc.setFontSize(7); doc.setFont("helvetica","normal"); doc.setTextColor(...P.muted); doc.text(l,cx,y,{align:"center"}); y+=4; });
  doc.setFillColor(15,40,80); doc.rect(lm,y,cw,0.5,"F"); doc.setFillColor(160,20,20); doc.rect(lm,y+0.8,cw,0.2,"F"); y+=3.5;

  if(settings.showSubtitle!==false){
    doc.setFontSize(7.5); doc.setFont("helvetica","italic"); doc.setTextColor(15,40,80);
    doc.text("This is to certify that the undermentioned persons were united in",cx,y,{align:"center"}); y+=4.5;
    doc.setFontSize(11); doc.setFont("helvetica","bold"); doc.setTextColor(160,20,20);
    doc.text("HOLY MATRIMONY",cx,y,{align:"center"}); y+=5;
    doc.setFontSize(7); doc.setFont("helvetica","italic"); doc.setTextColor(15,40,80);
    doc.text("according to the rites and ceremonies of the Catholic Church",cx,y,{align:"center"}); y+=5;
  }
  if(settings.showCertNumbers!==false){
    doc.setFillColor(...P.bg1); doc.roundedRect(lm,y-1.5,cw,7,1.2,1.2,"F");
    doc.setDrawColor(150,170,210); doc.setLineWidth(0.2); doc.roundedRect(lm,y-1.5,cw,7,1.2,1.2,"S");
    doc.setFont("helvetica","bold"); doc.setFontSize(7); doc.setTextColor(...P.accent1);
    doc.text("Certificate No:",lm+3,y+3.5); doc.setFont("helvetica","normal"); doc.setTextColor(...P.text); doc.text(val(record.certificateNo),lm+28,y+3.5);
    doc.setFont("helvetica","bold"); doc.setTextColor(...P.accent1); doc.text("Registration No:",cx+3,y+3.5);
    doc.setFont("helvetica","normal"); doc.setTextColor(...P.text); doc.text(val(record.registrationNo),cx+32,y+3.5); y+=9;
  }

  // Prominent names
  if(L.showGroom||L.showBride){
    doc.setFillColor(15,40,80); doc.rect(lm,y,cw,1.2,"F"); y+=3;
    if(L.showGroom){ doc.setFontSize(11); doc.setFont("helvetica","bold"); doc.setTextColor(15,40,80); doc.text(val(record.groom?.officialName),cx,y,{align:"center"}); y+=4.5; doc.setFontSize(7); doc.setFont("helvetica","italic"); doc.setTextColor(...P.muted); doc.text("Bridegroom",cx,y,{align:"center"}); y+=3; }
    if(L.showGroom&&L.showBride){ doc.setFontSize(9); doc.setFont("helvetica","bold"); doc.setTextColor(160,20,20); doc.text("&",cx,y+2,{align:"center"}); y+=5.5; }
    if(L.showBride){ doc.setFontSize(11); doc.setFont("helvetica","bold"); doc.setTextColor(15,40,80); doc.text(val(record.bride?.officialName),cx,y,{align:"center"}); y+=4.5; doc.setFontSize(7); doc.setFont("helvetica","italic"); doc.setTextColor(...P.muted); doc.text("Bride",cx,y,{align:"center"}); y+=3; }
    doc.setFillColor(160,20,20); doc.rect(lm,y,cw,1.2,"F"); y+=4;
  }
  if(settings.showDatePlace!==false){
    doc.setFont("helvetica","bold"); doc.setFontSize(8.5); doc.setTextColor(15,40,80);
    doc.text("on  "+(record.dateOfMarriage?fmt(record.dateOfMarriage):"—")+"  at  "+(record.placeOfMarriage||"—"),cx,y,{align:"center"}); y+=6;
  }

  // Person ribbon — 2-fields-per-row
  const RH=L.rowH;
  const drawRibbon=(person,title,sx,bw)=>{
    let py=y;
    doc.setFillColor(...P.accent1); doc.rect(sx,py,bw,5.5,"F");
    doc.setFont("helvetica","bold"); doc.setFontSize(7.5); doc.setTextColor(255,255,255); doc.text(title,sx+bw/2,py+4,{align:"center"}); py+=5.5;
    const rows=PERSON_ROWS(person);
    for(let i=0;i<rows.length;i+=2){
      const hw2=bw/2;
      doc.setFillColor(i%4===0?248:244,i%4===0?250:247,255); doc.rect(sx,py,bw,RH,"F");
      doc.setDrawColor(200,210,235); doc.setLineWidth(0.08); doc.line(sx,py+RH,sx+bw,py+RH); doc.line(sx+hw2,py,sx+hw2,py+RH);
      doc.setFont("helvetica","bold"); doc.setFontSize(L.labelFontSz-0.3); doc.setTextColor(...P.muted);
      doc.text(rows[i][0],sx+1.5,py+RH*0.65);
      doc.setFont("helvetica","normal"); doc.setFontSize(L.dataFontSz-0.3); doc.setTextColor(...P.text);
      doc.text((doc.splitTextToSize(val(rows[i][1]),hw2-15)[0]||val(rows[i][1])),sx+15,py+RH*0.65);
      if(i+1<rows.length){
        doc.setFont("helvetica","bold"); doc.setFontSize(L.labelFontSz-0.3); doc.setTextColor(...P.muted);
        doc.text(rows[i+1][0],sx+hw2+1.5,py+RH*0.65);
        doc.setFont("helvetica","normal"); doc.setFontSize(L.dataFontSz-0.3); doc.setTextColor(...P.text);
        doc.text((doc.splitTextToSize(val(rows[i+1][1]),hw2-15)[0]||val(rows[i+1][1])),sx+hw2+15,py+RH*0.65);
      }
      py+=RH;
    } return py+1;
  };
  const hw=(cw-4)/2;
  if(L.showGroom&&L.showBride){ const ge=drawRibbon(record.groom,"BRIDEGROOM DETAILS",lm,hw); const be=drawRibbon(record.bride,"BRIDE DETAILS",lm+hw+4,hw); y=Math.max(ge,be)+3; }
  else if(L.showGroom){ y=drawRibbon(record.groom,"BRIDEGROOM DETAILS",lm,cw)+3; }
  else if(L.showBride){ y=drawRibbon(record.bride,"BRIDE DETAILS",lm,cw)+3; }

  if(settings.showCeremony!==false)  y=_ceremonyRows(doc,record,y,lm,cw,P,vicarName);
  if(settings.showWitnesses!==false) y=_witnessRows(doc,record,y,lm,cw,P);
  y=_certificationLine(doc,y,lm,cw,P);

  _bottomSeal(doc,record,cfg,lm,cw,P,vicarName,settings);
  doc.setFillColor(160,20,20); doc.rect(0,h-5,w,2,"F"); doc.setFillColor(15,40,80); doc.rect(0,h-3,w,3,"F");
  if(settings.showPrintDate!==false) _footer(doc,w,h,P.muted);
}

// ─── 10. DIOCESE LETTERHEAD ───────────────────────────────────────────────────
function renderLetterhead(doc, record, cfg, vicarName, settings={}) {
  const {w,h}=cfg;
  const lm=settings.marginLeft??14, rt=settings.marginRight??14, rm=w-rt;
  const P={accent1:[60,20,100],accent2:[200,150,0],bg1:[250,247,255],bg2:[255,252,235],text:[20,10,40],muted:[110,90,140]};
  const barW=8;
  const eLm=lm+barW, eCw=rm-eLm;
  const L=computeLayout({...cfg,w:w-barW},settings,record);

  // Left bar (full page height)
  doc.setFillColor(60,20,100); doc.rect(0,0,barW,h,"F");
  doc.setFillColor(200,150,0); doc.rect(barW,0,2,h,"F");
  // Bottom bars
  doc.setFillColor(200,150,0); doc.rect(0,h-5,w,2,"F");
  doc.setFillColor(60,20,100); doc.rect(0,h-3,w,3,"F");

  let y=settings.marginTop??10;
  const logoRaw=settings.logoDataUrl||"";
  const hasLogo=settings.showLogo!==false && logoRaw.startsWith("data:image");
  if(hasLogo){ try{ doc.addImage(logoRaw,logoRaw.startsWith("data:image/png")?"PNG":"JPEG",eLm,y,18,18); }catch(e){} }
  const tX=hasLogo?eLm+21:eLm+2;
  if(settings.showChurchName!==false){
    const sz=settings.churchNameSize==="small"?10:settings.churchNameSize==="medium"?12:13;
    doc.setFontSize(sz); doc.setFont("helvetica","bold"); doc.setTextColor(60,20,100);
    doc.text((settings.headerLine1?.trim())||record.placeOfMarriage||"Parish Church",tX,y+2); y+=sz*0.4+3;
  }
  [settings.headerLine2,settings.headerLine3,settings.headerLine4].forEach(l=>{ if(!l)return; doc.setFontSize(7); doc.setFont("helvetica","normal"); doc.setTextColor(...P.muted); doc.text(l,tX,y-2); y+=4; });
  if(hasLogo) y=Math.max(y,(settings.marginTop??10)+21);
  y+=1;
  doc.setFillColor(200,150,0); doc.rect(eLm,y,rm-eLm,0.7,"F"); doc.setFillColor(60,20,100); doc.rect(eLm,y+1.2,rm-eLm,0.2,"F"); y+=4;

  if(settings.showCertNumbers!==false){
    doc.setFont("helvetica","bold"); doc.setFontSize(7); doc.setTextColor(...P.muted);
    doc.text("Cert No: "+val(record.certificateNo)+"    Reg No: "+val(record.registrationNo),rm,y,{align:"right"}); y+=5;
  }
  if(settings.showSubtitle!==false){
    doc.setFont("helvetica","bold"); doc.setFontSize(8); doc.setTextColor(60,20,100);
    doc.text("Certificate of Marriage — Form D",eLm,y); y+=4.5;
    doc.setFillColor(200,150,0); doc.rect(eLm,y,rm-eLm,0.3,"F"); y+=3.5;
  }
  if(settings.showDatePlace!==false){
    doc.setFont("helvetica","normal"); doc.setFontSize(7.5); doc.setTextColor(...P.text);
    // doc.text("This is to certify that the sacrament of Holy Matrimony was celebrated on",eLm,y); y+=4.5;
    doc.setFont("helvetica","bold"); doc.setTextColor(60,20,100);
    const dstr=record.dateOfMarriage?fmt(record.dateOfMarriage):"—";
    const pstr=(doc.splitTextToSize(record.placeOfMarriage||"—",rm-eLm-50)[0]||"—");
    doc.text(dstr,eLm,y); doc.setFont("helvetica","normal"); doc.setTextColor(...P.text); doc.text(" at ",eLm+48,y);
    doc.setFont("helvetica","bold"); doc.setTextColor(60,20,100); doc.text(pstr,eLm+55,y); y+=7;
  }

  const drawLHPerson=(person,title,sx,bw)=>{
    let py=y;
    doc.setFillColor(60,20,100); doc.roundedRect(sx,py,bw,5.5,1,1,"F");
    doc.setFont("helvetica","bold"); doc.setFontSize(7.5); doc.setTextColor(255,255,255); doc.text(title,sx+bw/2,py+3.8,{align:"center"}); py+=5.5;
    PERSON_ROWS(person).forEach(([k,v2],i)=>{
      doc.setFillColor(i%2===0?250:246,i%2===0?247:244,i%2===0?255:252); doc.rect(sx,py,bw,L.rowH,"F");
      doc.setDrawColor(200,190,220); doc.setLineWidth(0.08); doc.line(sx,py+L.rowH,sx+bw,py+L.rowH);
      doc.setFillColor(200,150,0); doc.circle(sx+2.5,py+L.rowH*0.5,0.65,"F");
      doc.setFont("helvetica","bold"); doc.setFontSize(L.labelFontSz); doc.setTextColor(...P.muted); doc.text(k,sx+5.5,py+L.rowH*0.65);
      doc.setFont("helvetica","normal"); doc.setFontSize(L.dataFontSz); doc.setTextColor(...P.text);
      doc.text((doc.splitTextToSize(val(v2),bw-34)[0]||val(v2)),sx+28,py+L.rowH*0.65); py+=L.rowH;
    }); return py+2;
  };
  const hw=(eCw-4)/2;
  if(L.showGroom&&L.showBride){ const ge=drawLHPerson(record.groom,"BRIDEGROOM",eLm,hw); const be=drawLHPerson(record.bride,"BRIDE",eLm+hw+4,hw); y=Math.max(ge,be)+3; }
  else if(L.showGroom){ y=drawLHPerson(record.groom,"BRIDEGROOM",eLm,eCw)+3; }
  else if(L.showBride){ y=drawLHPerson(record.bride,"BRIDE",eLm,eCw)+3; }

  if(settings.showCeremony!==false){
    const C_RH=7, C_VAL=eLm+44, C_VW=eLm+eCw-C_VAL-2;
    y=_sectionHead(doc,"Ceremony Details",y,eLm,eCw,P.accent1);
    [["Minister",record.ministerName?`Fr. ${record.ministerName}`:null],["Vicar / Asst.",vicarName||record.vicarName]].forEach(([k,v2],i)=>{
      doc.setFillColor(i%2===0?250:246,i%2===0?247:244,255); doc.rect(eLm,y,eCw,C_RH,"F");
      doc.setFillColor(200,150,0); doc.circle(eLm+2.5,y+C_RH*0.5,0.65,"F");
      doc.setFont("helvetica","bold"); doc.setFontSize(7.5); doc.setTextColor(...P.muted); doc.text(k,eLm+5.5,y+C_RH*0.65);
      doc.setFont("helvetica","normal"); doc.setTextColor(...P.text);
      doc.text((doc.splitTextToSize(val(v2),C_VW)[0]||val(v2)),C_VAL-15,y+C_RH*0.65); y+=C_RH;
    }); y+=3;
  }
  if(settings.showWitnesses!==false){
    const wits=(record.witnesses||[]).filter(w=>w?.name);
    if(wits.length){
      const W_RH=7, W_VAL=eLm+36, W_VW=eLm+eCw-W_VAL-2;
      y=_sectionHead(doc,"Witnesses",y,eLm,eCw,P.accent1);
      wits.forEach((w,i)=>{
        doc.setFillColor(i%2===0?250:246,i%2===0?247:244,255); doc.rect(eLm,y,eCw,W_RH,"F");
        doc.setFillColor(200,150,0); doc.circle(eLm+2.5,y+W_RH*0.5,0.65,"F");
        doc.setFont("helvetica","bold"); doc.setFontSize(7.5); doc.setTextColor(...P.muted); doc.text("Witness "+(i+1),eLm+5.5,y+W_RH*0.65);
        doc.setFont("helvetica","normal"); doc.setTextColor(...P.text);
        doc.text((doc.splitTextToSize([w.name,w.address].filter(Boolean).join(", "),W_VW)[0]||""),W_VAL-6,y+W_RH*0.65); y+=W_RH;
      }); y+=2;
    }
  }
  y=_certificationLine(doc,y,eLm,eCw,P);

  // Bottom seal anchored
  const bY=h-47, today=todayFmt();
  const zW=eCw/3, mCx=eLm+zW+zW/2, sX=eLm+zW*2, sWd=eCw-zW*2-2;
  if(settings.showDatePlace!==false){
    doc.setFont("helvetica","bold"); doc.setFontSize(7.5); doc.setTextColor(60,20,100);
    doc.text((doc.splitTextToSize(record.placeOfMarriage||"—",zW-2)[0]),eLm,bY+20);
    doc.setFont("helvetica","normal"); doc.setFontSize(7); doc.setTextColor(...P.text); doc.text(today,eLm,bY+25);
    // doc.setDrawColor(200,150,0); doc.setLineWidth(0.3); doc.line(eLm,bY+7,eLm+zW-4,bY+7);
  }
  if(settings.showTextSeal!==false){
    const sh=Math.min(17,zW/2-2);
    doc.setFont("helvetica","bold"); doc.setFontSize(7.5); doc.setTextColor(60,20,100); doc.text("",mCx,bY,{align:"center"});
    doc.setDrawColor(200,150,0); doc.setLineWidth(0.3);
    //doc.line(mCx-sh,bY-4,mCx+sh,bY-4); doc.line(mCx-sh,bY+8,mCx+sh,bY+8);
   // doc.line(mCx-sh,bY-4,mCx-sh,bY+8); doc.line(mCx+sh,bY-4,mCx+sh,bY+8);
    doc.setFont("helvetica","italic"); doc.setFontSize(6.5); doc.setTextColor(...P.muted); doc.text("(Church Seal)",mCx,bY+25,{align:"center"});
  }
  if(settings.showMinisterSig!==false){
    // doc.setDrawColor(60,20,100); doc.setLineWidth(0.5); doc.line(sX,bY+3,sX+sWd,bY+3);
    doc.setFont("helvetica","bold"); doc.setFontSize(7); doc.setTextColor(60,20,100);
    doc.text(vicarName?`Fr. ${vicarName}`:(record.ministerName?`Fr. ${record.ministerName}`:"Minister"),sX+sWd/2,bY+20,{align:"center"});
    doc.setFont("helvetica","normal"); doc.setFontSize(6.5); doc.setTextColor(...P.muted);
    doc.text("Vicar",sX+sWd/2,bY+25,{align:"center"});
  }
  if(settings.showPrintDate!==false){ doc.setFont("helvetica","italic"); doc.setFontSize(6.5); doc.setTextColor(180,160,200); doc.text("Printed on "+todayFmt(),w/2,h-6,{align:"center"}); }
}

// ═══════════════════════════════════════════════════════════════════════════════
// THEMES REGISTRY
// ═══════════════════════════════════════════════════════════════════════════════
export const THEMES = {
//   classic:      { label:"Theme 1",       preview:["#0F766E","#BE185D","#F0FDFA"], desc:"",                            render:renderClassic      },
//   royal:        { label:"Theme 2",         preview:["#78350F","#B45309","#FFFBEB"], desc:"",                        render:renderRoyal        },
//   midnight:     { label:"Midnight Navy",      preview:["#1E3A5F","#C2410C","#EFF6FF"], desc:"Full navy header block, orange accent",                      render:renderMidnight     },
//   rose:         { label:"Theme 3",         preview:["#9D174D","#0F766E","#FFF1F2"], desc:"",                                 render:renderRose         },
  slate:        { label:"Theme 1",      preview:["#1E293B","#475569","#F8FAFC"], desc:"",                    render:renderSlate        },
//   verdant:      { label:"Verdant Green",      preview:["#14532D","#065F46","#F0FDF4"], desc:"Forest green full header block",                             render:renderVerdant      },
  scroll:       { label:"Theme 2",      preview:["#503208","#8C5014","#FFFCF0"], desc:"",           render:renderScroll       },
//   ledger:       { label:"Theme 6",    preview:["#193264","#DC3C00","#FAFCFF"], desc:"",          render:renderLedger       },
//   proclamation: { label:"Proclamation",       preview:["#0F2850","#A01414","#F5F8FF"], desc:"Bold names on display, compact 2-field ribbon data",          render:renderProclamation },
  letterhead:   { label:"Theme 3", preview:["#3C1464","#C89600","#FAF7FF"], desc:"",        render:renderLetterhead   },
};

// ─── FETCH LOGO AS BASE64 (works with GitHub raw URLs) ───────────────────────
const fetchImageAsBase64 = async (url) => {
  if (!url) return null;
  if (url.startsWith("data:")) return url; // already base64, use as-is
  try {
    const res  = await fetch(url);
    const blob = await res.blob();
    return await new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload  = () => resolve(reader.result);
      reader.onerror = reject;
      reader.readAsDataURL(blob);
    });
  } catch { return null; }
};
// ─── EXPORT FUNCTION ──────────────────────────────────────────────────────────
// export const exportMarriagePDF = (record, {
//   pageSize="", vicarName="", theme="", printSettings={},
// }={}) => {
//   const finalPageSize = pageSize      || printSettings.pageSize  || "a4portrait";
//   const finalTheme    = theme         || printSettings.theme     || "classic";
//   const finalVicar    = vicarName     || printSettings.vicarName || "";
//   const effectiveSettings = { ...printSettings, pageSize:finalPageSize, theme:finalTheme, vicarName:finalVicar };
//   const cfg    = PAGE_SIZES[finalPageSize] || PAGE_SIZES.a4portrait;
export const exportMarriagePDF = async (record, {
  pageSize="", vicarName="", theme="", printSettings={},
}={}) => {
  const finalPageSize = pageSize      || printSettings.pageSize  || "a4portrait";
  const finalTheme    = theme         || printSettings.theme     || "classic";
  const finalVicar    = vicarName     || printSettings.vicarName || "";
  const effectiveSettings = { ...printSettings, pageSize:finalPageSize, theme:finalTheme, vicarName:finalVicar };

  // Fetch logo from GitHub URL → base64 so jsPDF can embed it
  if (effectiveSettings.showLogo && effectiveSettings.logoUrl && !effectiveSettings.logoDataUrl) {
    const base64 = await fetchImageAsBase64(effectiveSettings.logoUrl);
    if (base64) effectiveSettings.logoDataUrl = base64;
  }

  const cfg    = PAGE_SIZES[finalPageSize] || PAGE_SIZES.a4portrait;
  const doc    = new jsPDF({ ...cfg.jsPDFOpts, unit:"mm" });
  const render = THEMES[finalTheme]?.render || renderClassic;
  render(doc, record, cfg, finalVicar, effectiveSettings);
  const gn = record.groom?.officialName?.replace(/\s+/g,"_")||"groom";
  const bn = record.bride?.officialName?.replace(/\s+/g,"_")||"bride";
  doc.save(`Marriage_${gn}_${bn}_${finalTheme}_${finalPageSize}.pdf`);
};

// ─── BUTTON COMPONENT ─────────────────────────────────────────────────────────
export const MarriagePDFButton = ({ record, printSettings={} }) => {
  const [anchor,      setAnchor]     = useState(null);
  const [dialogOpen,  setDialogOpen] = useState(false);
  const [pendingSize, setPendingSize]= useState(null);
  const [vicarInput,  setVicarInput] = useState("");
  const [selTheme,    setSelTheme]   = useState(printSettings.theme||"classic");

  const pageSizeOptions = [
    {key:"a4portrait", label:"A4 Portrait",  icon:"📄"},
    {key:"a4landscape",label:"A4 Landscape", icon:"📃"},
    {key:"a5",         label:"A5 Portrait",  icon:"📋"},
    {key:"letter",     label:"Letter (US)",  icon:"📝"},
    {key:"legal",      label:"Legal (US)",   icon:"⚖️"},
  ];

  const handleSelectSize=(key)=>{ setAnchor(null); setPendingSize(key); setVicarInput(record.vicarName||printSettings.vicarName||""); setSelTheme(printSettings.theme||"classic"); setDialogOpen(true); };
//   const handleGenerate=()=>{ setDialogOpen(false); exportMarriagePDF(record,{pageSize:pendingSize,theme:selTheme,vicarName:vicarInput.trim(),printSettings}); };
  const handleGenerate= async ()=>{ setDialogOpen(false); await exportMarriagePDF(record,{pageSize:pendingSize,theme:selTheme,vicarName:vicarInput.trim(),printSettings}); };

  return (
    <>
      <Button variant="outlined" size="small" startIcon={<PictureAsPdfIcon/>} endIcon={<ArrowDropDownIcon/>}
        onClick={e=>setAnchor(e.currentTarget)}
        sx={{borderRadius:8,textTransform:"none",fontWeight:600,fontSize:"0.78rem",borderColor:"#14B8A6",color:"#0F766E","&:hover":{borderColor:"#0F766E",backgroundColor:"#F0FDFA"}}}>
        Print PDF
      </Button>

      <Menu anchorEl={anchor} open={Boolean(anchor)} onClose={()=>setAnchor(null)}
        PaperProps={{elevation:3,sx:{borderRadius:3,mt:1,minWidth:185,border:"1px solid #CCFBF1","& .MuiMenuItem-root":{fontSize:"0.82rem",fontFamily:"'Georgia',serif",py:1}}}}>
        <Box sx={{px:2,pt:1,pb:0.5}}><Typography sx={{fontSize:"0.7rem",fontWeight:700,color:"#64748B",letterSpacing:"0.07em",textTransform:"uppercase"}}>Select Page Size</Typography></Box>
        <Divider sx={{borderColor:"#CCFBF1",mb:0.5}}/>
        {pageSizeOptions.map(o=>(
          <MenuItem key={o.key} onClick={()=>handleSelectSize(o.key)}>
            <ListItemIcon sx={{minWidth:28,fontSize:"1rem"}}>{o.icon}</ListItemIcon>
            <ListItemText primary={o.label}/>
          </MenuItem>
        ))}
      </Menu>

      <Dialog open={dialogOpen} onClose={()=>setDialogOpen(false)} maxWidth="sm" fullWidth
        PaperProps={{elevation:0,sx:{borderRadius:"16px",border:"1px solid #CCFBF1",boxShadow:"0 12px 40px rgba(15,118,110,0.15)"}}}>
        <DialogTitle sx={{display:"flex",alignItems:"center",justifyContent:"space-between",background:"linear-gradient(135deg,#F0FDFA,#CCFBF1)",borderBottom:"1px solid #CCFBF1",pb:1.5}}>
          <Box sx={{display:"flex",alignItems:"center",gap:1.5}}>
            <Box sx={{width:36,height:36,borderRadius:"9px",background:"linear-gradient(135deg,#14B8A6,#0F766E)",display:"flex",alignItems:"center",justifyContent:"center"}}><ChurchIcon sx={{color:"white",fontSize:18}}/></Box>
            <Box>
              <Typography sx={{fontWeight:700,fontFamily:"'Georgia',serif",color:"#134E4A",fontSize:"0.95rem"}}>Print Certificate</Typography>
              <Typography sx={{fontSize:"0.72rem",color:"#64748B"}}>{pageSizeOptions.find(o=>o.key===pendingSize)?.label}</Typography>
            </Box>
          </Box>
          <IconButton size="small" onClick={()=>setDialogOpen(false)}><CloseIcon fontSize="small" sx={{color:"#64748B"}}/></IconButton>
        </DialogTitle>
        <DialogContent sx={{pt:2.5,pb:1}}>
          <Typography sx={{fontSize:"0.72rem",fontWeight:700,color:"#64748B",letterSpacing:"0.07em",textTransform:"uppercase",mb:1.5}}>Choose Template</Typography>
          <Grid container spacing={1} sx={{mb:2.5}}>
            {Object.entries(THEMES).map(([key,t])=>{
              const selected=selTheme===key;
              return (
                <Grid item xs={6} sm={4} key={key}>
                  <Box onClick={()=>setSelTheme(key)} sx={{border:selected?"2px solid #0F766E":"1.5px solid #E2E8F0",borderRadius:"10px",p:1.2,cursor:"pointer",position:"relative",background:selected?"#F0FDFA":"white",transition:"all 0.15s","&:hover":{borderColor:"#14B8A6",background:"#F0FDFA"}}}>
                    <Box sx={{display:"flex",gap:0.5,mb:0.8}}>{t.preview.map((c,i)=><Box key={i} sx={{width:14,height:14,borderRadius:"3px",backgroundColor:c,border:"1px solid #00000011"}}/>)}</Box>
                    <Typography sx={{fontSize:"0.72rem",fontWeight:700,color:"#1E293B",lineHeight:1.2}}>{t.label}</Typography>
                    <Typography sx={{fontSize:"0.62rem",color:"#64748B",mt:0.3,lineHeight:1.3}}>{t.desc}</Typography>
                    {selected&&<Box sx={{position:"absolute",top:6,right:6,width:16,height:16,borderRadius:"50%",background:"#0F766E",display:"flex",alignItems:"center",justifyContent:"center"}}><CheckIcon sx={{fontSize:11,color:"white"}}/></Box>}
                  </Box>
                </Grid>
              );
            })}
          </Grid>
          <Divider sx={{borderColor:"#CCFBF1",mb:2}}/>
          <Typography sx={{fontSize:"0.72rem",fontWeight:700,color:"#64748B",letterSpacing:"0.07em",textTransform:"uppercase",mb:1}}>Vicar / Asst. Vicar Name</Typography>
          <Typography sx={{fontSize:"0.78rem",color:"#64748B",mb:1.5}}>Appears on the signature line. Defaults to record vicar or Print Setup value.</Typography>
          <TextField value={vicarInput} onChange={e=>setVicarInput(e.target.value)} onKeyDown={e=>e.key==="Enter"&&handleGenerate()}
            fullWidth size="small" placeholder="e.g. Fr. Thomas Poovathanikunnel" autoFocus
            sx={{"& .MuiOutlinedInput-root":{borderRadius:2,fontFamily:"'Georgia',serif","& fieldset":{borderColor:"#CCFBF1"},"&:hover fieldset":{borderColor:"#14B8A6"},"&.Mui-focused fieldset":{borderColor:"#0F766E"}}}}/>
        </DialogContent>
        <DialogActions sx={{px:3,pb:2.5,pt:1.5,gap:1}}>
          <Button variant="outlined" onClick={()=>setDialogOpen(false)} sx={{borderRadius:8,textTransform:"none",fontWeight:600,borderColor:"#CBD5E1",color:"#64748B"}}>Cancel</Button>
          <Button variant="contained" onClick={handleGenerate} startIcon={<PictureAsPdfIcon/>}
            sx={{borderRadius:8,textTransform:"none",fontWeight:600,flex:1,background:"linear-gradient(to right,#14B8A6,#0F766E)","&:hover":{background:"linear-gradient(to right,#0F766E,#115E59)"}}}>
            Generate PDF
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
};

export default MarriagePDFButton;