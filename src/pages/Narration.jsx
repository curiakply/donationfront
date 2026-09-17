import React, { useState, useEffect, useMemo } from "react";
import { MaterialReactTable } from "material-react-table";
import axiosInstance from "../axiosConfig";
import {
  Button, TextField, Dialog, DialogTitle, DialogContent, DialogActions,
  Box, Typography, IconButton, Tooltip, Card, CardContent, Fade,
  CircularProgress, Snackbar, Alert, CssBaseline,
} from "@mui/material";
import { styled } from "@mui/material/styles";
import {
  Refresh as RefreshIcon, Edit as EditIcon, Delete as DeleteIcon,
  Description as DescriptionIcon,
} from "@mui/icons-material";
import { Plus } from "lucide-react";

const Page = styled(Box)(() => ({ backgroundColor: "#f8fafc", minHeight: "100vh", padding: 24 }));
const StyledCard = styled(Card)(() => ({ backgroundColor: "#fff", borderRadius: 16, boxShadow: "0 4px 6px -1px rgba(0,0,0,0.1), 0 2px 4px -1px rgba(0,0,0,0.06)", transition: "all 0.3s ease", "&:hover": { transform: "translateY(-4px)", boxShadow: "0 10px 15px -3px rgba(0,0,0,0.1)" } }));
const Content = styled(CardContent)(({ theme }) => ({ padding: theme.spacing(3), position: "relative", zIndex: 1 }));
const IconBox = styled(Box)(({ color }) => ({ width: 56, height: 56, borderRadius: 12, display: "flex", alignItems: "center", justifyContent: "center", background: `linear-gradient(135deg, ${color}20, ${color}40)`, color }));
const ChartCard = styled(Card)(({ theme }) => ({ backgroundColor: "#fff", borderRadius: 16, padding: theme.spacing(3), boxShadow: "0 4px 6px -1px rgba(0,0,0,0.1), 0 2px 4px -1px rgba(0,0,0,0.06)" }));
const GradientBtn = styled(Button)(() => ({ background: "linear-gradient(135deg, #1a237e, #0d47a1)", color: "#fff", borderRadius: 12, padding: "10px 24px", fontWeight: 600, textTransform: "none", "&:hover": { background: "linear-gradient(135deg, #0d47a1, #1a237e)" } }));
const Field = styled(TextField)(() => ({ "& .MuiOutlinedInput-root": { borderRadius: 12, "& fieldset": { borderColor: "#E2E8F0" }, "&:hover fieldset": { borderColor: "#0d47a1" }, "&.Mui-focused fieldset": { borderColor: "#1a237e" } } }));
const GradientText = ({ children, variant = "h5", sx = {} }) => (<Typography variant={variant} sx={{ fontWeight: 700, background: "linear-gradient(45deg, #1a237e, #0d47a1)", backgroundClip: "text", WebkitBackgroundClip: "text", color: "transparent", ...sx }}>{children}</Typography>);

const Narration = () => {
  const [rows, setRows] = useState([]);
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState(false);
  const [selected, setSelected] = useState(null);
  const [loading, setLoading] = useState(false);
  const [name, setName] = useState("");
  const [msg, setMsg] = useState(null);

  useEffect(() => { load(); }, []);

  const load = async () => { setLoading(true); try { setRows((await axiosInstance.get("/narration/")).data); } catch { setMsg({ type: "error", text: "Failed to fetch" }); } finally { setLoading(false); } };
  const edit = (r) => { setEditing(true); setSelected(r); setName(r.name); setOpen(true); };
  const del = async (id) => { if (!window.confirm("Delete this narration?")) return; try { await axiosInstance.delete(`/narration/${id}`); load(); setMsg({ type: "success", text: "Deleted" }); } catch { setMsg({ type: "error", text: "Failed" }); } };
  const submit = async (e) => { e.preventDefault(); if (!name.trim()) return; setLoading(true); try { if (editing) await axiosInstance.put(`/narration/${selected._id}`, { name: name.trim() }); else await axiosInstance.post("/narration", { name: name.trim() }); load(); setOpen(false); reset(); setMsg({ type: "success", text: editing ? "Updated" : "Created" }); } catch { setMsg({ type: "error", text: "Failed" }); } finally { setLoading(false); } };
  const reset = () => { setName(""); setEditing(false); setSelected(null); };

  const columns = useMemo(() => [
    { accessorKey: "name", header: "Narration", size: 350, Cell: ({ row }) => (<Box sx={{ display: "flex", alignItems: "center", gap: 2 }}><Box sx={{ width: 36, height: 36, borderRadius: 2, flexShrink: 0, background: "linear-gradient(135deg, #E8EAF620, #E8EAF660)", display: "flex", alignItems: "center", justifyContent: "center" }}><DescriptionIcon fontSize="small" sx={{ color: "#1a237e" }} /></Box><Typography variant="body1" sx={{ fontWeight: 600, color: "#0F172A" }}>{row.original.name}</Typography></Box>) },
    { accessorKey: "createdAt", header: "Created", size: 150, Cell: ({ row }) => <Typography variant="body2" sx={{ color: "#64748B" }}>{row.original.createdAt ? new Date(row.original.createdAt).toLocaleDateString() : "—"}</Typography> },
    { id: "actions", header: "Actions", size: 110, Cell: ({ row }) => (<Box sx={{ display: "flex", gap: 1 }}><Tooltip title="Edit"><IconButton size="small" onClick={() => edit(row.original)} sx={{ bgcolor: "#E8EAF6", "&:hover": { bgcolor: "#C5CAE9" } }}><EditIcon fontSize="small" sx={{ color: "#1a237e" }} /></IconButton></Tooltip><Tooltip title="Delete"><IconButton size="small" onClick={() => del(row.original._id)} sx={{ bgcolor: "#FEE2E2", "&:hover": { bgcolor: "#FECACA" } }}><DeleteIcon fontSize="small" sx={{ color: "#DC2626" }} /></IconButton></Tooltip></Box>) },
  ], []);

  return (
    <Page><CssBaseline />
      <StyledCard sx={{ mb: 3 }}><Content><Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}><Box sx={{ display: "flex", alignItems: "center", gap: 2 }}><IconBox color="#7c3aed"><DescriptionIcon sx={{ fontSize: 26 }} /></IconBox><Box><GradientText>Narration Master</GradientText><Typography variant="body2" sx={{ color: "#64748B" }}>Manage narration entries</Typography></Box></Box><GradientBtn startIcon={<Plus size={18} />} onClick={() => { setOpen(true); reset(); }}>Add New</GradientBtn></Box></Content></StyledCard>

      <ChartCard>
        <MaterialReactTable columns={columns} data={rows} enableColumnFiltering enableGlobalFilter enablePagination enableSorting state={{ isLoading: loading }}
          renderTopToolbarCustomActions={() => (<Box sx={{ p: 2 }}><IconButton onClick={load} sx={{ bgcolor: "#E8EAF6", "&:hover": { bgcolor: "#C5CAE9" } }}><RefreshIcon sx={{ color: "#1a237e" }} /></IconButton></Box>)}
          muiTablePaperProps={{ elevation: 0, sx: { borderRadius: 4, border: "none" } }}
          muiTableProps={{ sx: { "& .MuiTableCell-root": { borderBottom: "1px solid #F1F5F9" } } }}
          initialState={{ density: "comfortable", pagination: { pageSize: 15 } }} />
      </ChartCard>

      <Dialog open={open} onClose={() => { setOpen(false); reset(); }} maxWidth="sm" fullWidth TransitionComponent={Fade} PaperProps={{ elevation: 0, sx: { borderRadius: 4, boxShadow: "0 20px 50px rgba(0,0,0,0.15)" } }}>
        <Box sx={{ p: 3, borderBottom: "1px solid #E2E8F0", background: "linear-gradient(135deg, #f8fafc, #E8EAF6)" }}>
          <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}><IconBox color="#7c3aed" sx={{ width: 40, height: 40 }}><DescriptionIcon sx={{ fontSize: 20 }} /></IconBox><Box><GradientText variant="h6">{editing ? "Edit Narration" : "Add New Narration"}</GradientText><Typography variant="body2" sx={{ color: "#64748B" }}>{editing ? "Update the narration" : "Enter narration name"}</Typography></Box></Box>
        </Box>
        <form onSubmit={submit}>
          <Box sx={{ p: 3 }}><Field label="Narration" value={name} onChange={(e) => setName(e.target.value)} placeholder="Enter narration" fullWidth required autoFocus /></Box>
          <Box sx={{ p: 3, pt: 0, display: "flex", gap: 1.5 }}>
            <Button variant="outlined" onClick={() => { setOpen(false); reset(); }} sx={{ flex: 1, borderRadius: 3, fontWeight: 600, borderColor: "#C5CAE9", color: "#1a237e", textTransform: "none" }}>Cancel</Button>
            <GradientBtn type="submit" disabled={loading} sx={{ flex: 1 }}>{loading ? <CircularProgress size={16} color="inherit" /> : editing ? "Update" : "Save"}</GradientBtn>
          </Box>
        </form>
      </Dialog>

      <Snackbar open={Boolean(msg)} autoHideDuration={5000} onClose={() => setMsg(null)} anchorOrigin={{ vertical: "bottom", horizontal: "right" }}>
        <Alert onClose={() => setMsg(null)} severity={msg?.type || "info"} variant="filled" sx={{ borderRadius: 2, bgcolor: msg?.type === "error" ? "#DC2626" : "#1a237e" }}>{msg?.text}</Alert>
      </Snackbar>
    </Page>
  );
};

export default Narration;