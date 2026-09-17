// utils/exportMarriagePDF.js
//
// Fetches print settings from DB at click time, then generates the PDF.
//
// Usage in MarriagePage actions column:
//   import { exportMarriagePDFFromDB } from "../utils/exportMarriagePDF";
//   <Button onClick={() => exportMarriagePDFFromDB(row.original)}>Print</Button>

import axiosInstance from "../axiosConfig";

// Import themes + page sizes from wherever your MarriageCertificatePDF lives.
// Adjust the path to match your project structure — common locations:
//   "../pages/MarriageCertificatePDF"
//   "../components/MarriageCertificatePDF"
//   "./MarriageCertificatePDF"
import { THEMES, PAGE_SIZES, exportMarriagePDF } from "../pages/MarriageCertificatePDF";

// ── Fetch settings from DB, fall back silently to empty object ────────────────

export async function fetchPrintSettings(collectionName = "marriage") {
  try {
    const res = await axiosInstance.get(`/print-settings/${collectionName}`);
    return res.data || {};
  } catch (err) {
    console.warn("fetchPrintSettings: could not load from DB, using defaults.", err);
    return {};
  }
}

// ── Main export — call this from the Print PDF button ────────────────────────
// vicarName is optional — user can still enter it in the print dialog.
// Settings are always fetched fresh from DB so they reflect the latest saved config.

export async function exportMarriagePDFFromDB(record, { vicarName = "" } = {}) {
  const settings     = await fetchPrintSettings("marriage");
  const finalVicar   = vicarName || settings.vicarName || "";
  const finalTheme   = settings.theme    || "classic";
  const finalSize    = settings.pageSize || "a4portrait";

  exportMarriagePDF(record, {
    pageSize:      finalSize,
    vicarName:     finalVicar,
    theme:         finalTheme,
    printSettings: settings,   // full settings object passed into render functions
  });
}