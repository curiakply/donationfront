// hooks/usePrintSettings.js
// 
// Drop-in hook — loads print settings from DB on mount,
// provides save/reset helpers.
//
// Usage:
//   const { settings, loading, saveSettings, resetSettings, updateField } = usePrintSettings("marriage");

import { useState, useEffect, useCallback } from "react";
import axiosInstance from "../axiosConfig";

const COLLECTION = "marriage";

export function usePrintSettings(collectionName = COLLECTION) {
  const [settings, setSettings] = useState(null);   // null = not yet loaded
  const [loading,  setLoading]  = useState(true);
  const [saving,   setSaving]   = useState(false);
  const [error,    setError]    = useState(null);

  // ── Load from DB on mount ──────────────────────────────────────────────────
  useEffect(() => {
    let cancelled = false;
    setLoading(true);

    axiosInstance
      .get(`/print-settings/${collectionName}`)
      .then((res) => {
        if (!cancelled) setSettings(res.data);
      })
      .catch((err) => {
        console.error("usePrintSettings load:", err);
        if (!cancelled) setError("Could not load print settings.");
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => { cancelled = true; };
  }, [collectionName]);

  // ── Update a single field locally ─────────────────────────────────────────
  const updateField = useCallback((key, value) => {
    setSettings((prev) => ({ ...prev, [key]: value }));
  }, []);

  // ── Patch multiple fields at once ─────────────────────────────────────────
  const patchFields = useCallback((patch) => {
    setSettings((prev) => ({ ...prev, ...patch }));
  }, []);

  // ── Save to DB ────────────────────────────────────────────────────────────
  const saveSettings = useCallback(async (overrideSettings) => {
    setSaving(true);
    try {
      const payload = overrideSettings || settings;
      const res = await axiosInstance.put(
        `/print-settings/${collectionName}`,
        payload
      );
      setSettings(res.data.settings);
      return { success: true };
    } catch (err) {
      console.error("usePrintSettings save:", err);
      return { success: false, error: err };
    } finally {
      setSaving(false);
    }
  }, [settings, collectionName]);

  // ── Reset to defaults ─────────────────────────────────────────────────────
  const resetSettings = useCallback(async () => {
    setSaving(true);
    try {
      await axiosInstance.delete(`/print-settings/${collectionName}`);
      // Reload defaults
      const res = await axiosInstance.get(`/print-settings/${collectionName}`);
      setSettings(res.data);
      return { success: true };
    } catch (err) {
      console.error("usePrintSettings reset:", err);
      return { success: false, error: err };
    } finally {
      setSaving(false);
    }
  }, [collectionName]);

  return { settings, loading, saving, error, updateField, patchFields, saveSettings, resetSettings };
}