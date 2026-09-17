import React, { useState, useEffect, useCallback } from "react";
import {
  Box, Container, Typography, Card, CardContent, Grid, MenuItem, Select,
  FormControl, InputLabel, CircularProgress, Snackbar, Alert, Chip, Avatar,
  LinearProgress,
} from "@mui/material";
import { styled } from "@mui/material/styles";
import {
  Public as PublicIcon,
} from "@mui/icons-material";
import { Church, Building2, Users, Wallet } from "lucide-react";
import axiosInstance from "../axiosConfig";
import {
  XAxis, YAxis, CartesianGrid, Tooltip as ReTooltip,
  ResponsiveContainer, PieChart, Pie, Cell, Area, AreaChart,
} from "recharts";

// ─── Styled (matching Home page) ──────────────────────────────────────────────

const DashboardContainer = styled(Box)(({ theme }) => ({
  backgroundColor: "#f8fafc",
  minHeight: "100vh",
  padding: theme.spacing(3),
}));

const StyledCard = styled(Card)(() => ({
  height: "100%",
  backgroundColor: "#ffffff",
  borderRadius: "16px",
  boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)",
  transition: "all 0.3s ease",
  "&:hover": {
    transform: "translateY(-4px)",
    boxShadow: "0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)",
  },
}));

const StyledCardContent = styled(CardContent)(({ theme }) => ({
  padding: theme.spacing(3),
  position: "relative",
  zIndex: 1,
}));

const StatWrapper = styled(Box)(() => ({
  display: "flex",
  justifyContent: "space-between",
  alignItems: "center",
}));

const IconBox = styled(Box)(({ color }) => ({
  width: 56,
  height: 56,
  borderRadius: "12px",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  background: `linear-gradient(135deg, ${color}20, ${color}40)`,
  color: color,
}));

const StatValue = styled(Typography)(() => ({
  fontSize: "2rem",
  fontWeight: 700,
  marginTop: 8,
  background: "linear-gradient(45deg, #1a237e, #0d47a1)",
  backgroundClip: "text",
  WebkitBackgroundClip: "text",
  color: "transparent",
}));

const ChartCard = styled(Card)(({ theme }) => ({
  height: "100%",
  backgroundColor: "#ffffff",
  borderRadius: "16px",
  padding: theme.spacing(3),
  boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)",
}));

const StyledSelect = styled(FormControl)(() => ({
  minWidth: 200,
  "& .MuiOutlinedInput-root": {
    borderRadius: "12px",
    background: "#ffffff",
    "&:hover fieldset": { borderColor: "#1a237e" },
  },
}));

// ─── Constants ────────────────────────────────────────────────────────────────

const MONTH_LABELS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
const COLORS = ["#1a237e", "#0d47a1", "#4f46e5", "#7c3aed", "#059669", "#ea580c", "#0891B2", "#BE185D", "#D97706", "#DC2626"];

const fmtINR = (n) =>
  new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR", maximumFractionDigits: 0 }).format(n || 0);

const fmtShort = (n) => {
  if (n >= 10000000) return `₹${(n / 10000000).toFixed(1)}Cr`;
  if (n >= 100000) return `₹${(n / 100000).toFixed(1)}L`;
  if (n >= 1000) return `₹${(n / 1000).toFixed(1)}K`;
  return `₹${n}`;
};

// ─── Component ────────────────────────────────────────────────────────────────

const CuriaDashboard = () => {
  const [year, setYear] = useState(new Date().getFullYear());
  const [data, setData] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState(null);

  const fetchDashboard = useCallback(async () => {
    setIsLoading(true);
    try {
      const res = await axiosInstance.get("/curia-dashboard", { params: { year } });
      setData(res.data);
    } catch {
      setMessage({ type: "error", text: "Failed to load dashboard" });
    } finally {
      setIsLoading(false);
    }
  }, [year]);

  useEffect(() => { fetchDashboard(); }, [fetchDashboard]);

  const { counts, totals, months, currencyBreakdown, topOrganizations, topPriests, modeBreakdown, recentDonations } = data || {};

  const monthlyData = (months || []).map((m) => ({ name: MONTH_LABELS[m.month - 1], amount: m.totalINR, count: m.count }));
  const currencyData = (currencyBreakdown || []).map((c) => ({ name: c._id, value: c.totalINR, count: c.count }));
  const modeData = (modeBreakdown || []).map((m) => ({ name: m._id, value: m.totalINR, count: m.count }));

  const maxOrgAmt = Math.max(...(topOrganizations || []).map((o) => o.totalINR), 1);
  const maxPriestAmt = Math.max(...(topPriests || []).map((p) => p.totalINR), 1);

  const years = [];
  const currentYear = new Date().getFullYear();
  for (let y = currentYear; y >= currentYear - 5; y--) years.push(y);

  const statisticsCards = [
    { title: "Total Donations", value: fmtINR(totals?.totalINR), icon: <Wallet size={24} />, color: "#ea580c" },
    { title: "Priests", value: counts?.priestCount || 0, icon: <Users size={24} />, color: "#059669" },
    { title: "Receivers", value: counts?.orgCount || 0, icon: <Building2 size={24} />, color: "#7c3aed" },
    { title: "Abroad / NIL", value: `${counts?.abroadPriests || 0} / ${counts?.nilCount || 0}`, icon: <Church size={24} />, color: "#4f46e5" },
  ];

  if (isLoading && !data) {
    return (
      <DashboardContainer>
        <Box sx={{ display: "flex", justifyContent: "center", alignItems: "center", minHeight: "60vh" }}>
          <CircularProgress sx={{ color: "#1a237e" }} />
        </Box>
      </DashboardContainer>
    );
  }

  return (
    <DashboardContainer>
      <Container maxWidth="xl">
        <Grid container spacing={3}>

          {/* ── Header ── */}
          <Grid item xs={12}>
            <Box sx={{ mb: 4, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <Typography variant="h4" sx={{
                fontWeight: 700,
                background: "linear-gradient(45deg, #1a237e, #0d47a1)",
                backgroundClip: "text",
                WebkitBackgroundClip: "text",
                color: "transparent",
              }}>
                Dashboard Overview
              </Typography>
              <StyledSelect>
                <InputLabel>Select Year</InputLabel>
                <Select value={year} label="Select Year" onChange={(e) => setYear(e.target.value)}>
                  {years.map((y) => <MenuItem key={y} value={y}>{y}</MenuItem>)}
                </Select>
              </StyledSelect>
            </Box>
          </Grid>

          {isLoading && (
            <Grid item xs={12}>
              <LinearProgress sx={{ mb: 1, borderRadius: 2, "& .MuiLinearProgress-bar": { background: "linear-gradient(45deg, #1a237e, #0d47a1)" } }} />
            </Grid>
          )}

          {/* ── Stat Cards ── */}
          {statisticsCards.map((stat, index) => (
            <Grid item xs={12} sm={6} md={3} key={index}>
              <StyledCard>
                <StyledCardContent>
                  <StatWrapper>
                    <Box>
                      <Typography variant="subtitle1" sx={{
                        color: "text.secondary", fontSize: "0.875rem", fontWeight: 600,
                        textTransform: "uppercase", letterSpacing: "0.1em",
                      }}>
                        {stat.title}
                      </Typography>
                      <StatValue>{stat.value}</StatValue>
                    </Box>
                    <IconBox color={stat.color}>{stat.icon}</IconBox>
                  </StatWrapper>
                </StyledCardContent>
              </StyledCard>
            </Grid>
          ))}

          {/* ── Monthly Trend ── */}
          <Grid item xs={12} md={8}>
            <ChartCard>
              <Typography variant="h6" gutterBottom sx={{ fontWeight: 600, color: "text.primary", mb: 3 }}>
                Monthly Donation Trend
              </Typography>
              <ResponsiveContainer width="100%" height={300}>
                <AreaChart data={monthlyData}>
                  <defs>
                    <linearGradient id="colorAmt" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#1a237e" stopOpacity={0.3} />
                      <stop offset="95%" stopColor="#1a237e" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#E2E8F0" />
                  <XAxis dataKey="name" tick={{ fontSize: 12 }} />
                  <YAxis tickFormatter={fmtShort} tick={{ fontSize: 11 }} />
                  <ReTooltip formatter={(v) => fmtINR(v)} contentStyle={{ borderRadius: 12 }} />
                  <Area type="monotone" dataKey="amount" stroke="#1a237e" strokeWidth={2.5} fill="url(#colorAmt)" />
                </AreaChart>
              </ResponsiveContainer>
            </ChartCard>
          </Grid>

          {/* ── Currency Split ── */}
          <Grid item xs={12} md={4}>
            <ChartCard sx={{ height: "100%" }}>
              <Typography variant="h6" gutterBottom sx={{ fontWeight: 600, color: "text.primary", mb: 3 }}>
                Currency Split
              </Typography>
              <ResponsiveContainer width="100%" height={200}>
                <PieChart>
                  <Pie data={currencyData} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={80} innerRadius={45} paddingAngle={3}>
                    {currencyData.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                  </Pie>
                  <ReTooltip formatter={(v) => fmtINR(v)} contentStyle={{ borderRadius: 10 }} />
                </PieChart>
              </ResponsiveContainer>
              <Box sx={{ mt: 1 }}>
                {currencyData.map((c, i) => (
                  <Box key={c.name} sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", py: 0.5 }}>
                    <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                      <Box sx={{ width: 10, height: 10, borderRadius: "50%", bgcolor: COLORS[i % COLORS.length] }} />
                      <Typography variant="body2" sx={{ fontWeight: 600, color: "text.primary" }}>{c.name}</Typography>
                    </Box>
                    <Typography variant="body2" sx={{
                      fontWeight: 700,
                      background: "linear-gradient(45deg, #1a237e, #0d47a1)",
                      backgroundClip: "text", WebkitBackgroundClip: "text", color: "transparent",
                    }}>
                      {fmtINR(c.value)}
                    </Typography>
                  </Box>
                ))}
              </Box>
            </ChartCard>
          </Grid>

          {/* ── Top Organizations ── */}
          <Grid item xs={12} md={6}>
            <ChartCard>
              <Typography variant="h6" gutterBottom sx={{ fontWeight: 600, color: "text.primary", mb: 3 }}>
                Top Receivers
              </Typography>
              {(topOrganizations || []).map((o, i) => (
                <Box key={i} sx={{ mb: 1.8 }}>
                  <Box sx={{ display: "flex", justifyContent: "space-between", mb: 0.4 }}>
                    <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                      <Avatar sx={{ width: 26, height: 26, bgcolor: COLORS[i % COLORS.length], fontSize: "0.72rem", fontWeight: 700 }}>
                        {i + 1}
                      </Avatar>
                      <Typography variant="body2" sx={{ fontWeight: 600, color: "text.primary" }}>{o.name}</Typography>
                    </Box>
                    <Typography variant="body2" sx={{ fontWeight: 700, color: "#059669" }}>{fmtINR(o.totalINR)}</Typography>
                  </Box>
                  <LinearProgress variant="determinate" value={(o.totalINR / maxOrgAmt) * 100}
                    sx={{ height: 6, borderRadius: 3, bgcolor: "#E2E8F0", "& .MuiLinearProgress-bar": { borderRadius: 3, bgcolor: COLORS[i % COLORS.length] } }} />
                </Box>
              ))}
              {(!topOrganizations || !topOrganizations.length) && (
                <Typography variant="body2" sx={{ color: "text.secondary", fontStyle: "italic" }}>No data for this year</Typography>
              )}
            </ChartCard>
          </Grid>

          {/* ── Top Priests ── */}
          <Grid item xs={12} md={6}>
            <ChartCard>
              <Typography variant="h6" gutterBottom sx={{ fontWeight: 600, color: "text.primary", mb: 3 }}>
                Top Contributing Priests
              </Typography>
              {(topPriests || []).map((p, i) => (
                <Box key={i} sx={{ mb: 1.8 }}>
                  <Box sx={{ display: "flex", justifyContent: "space-between", mb: 0.4 }}>
                    <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                      <Avatar sx={{ width: 26, height: 26, bgcolor: COLORS[i % COLORS.length], fontSize: "0.72rem", fontWeight: 700 }}>
                        {i + 1}
                      </Avatar>
                      <Typography variant="body2" sx={{ fontWeight: 600, color: "text.primary" }}>Fr. {p.name}</Typography>
                    </Box>
                    <Typography variant="body2" sx={{ fontWeight: 700, color: "#059669" }}>{fmtINR(p.totalINR)}</Typography>
                  </Box>
                  <LinearProgress variant="determinate" value={(p.totalINR / maxPriestAmt) * 100}
                    sx={{ height: 6, borderRadius: 3, bgcolor: "#E2E8F0", "& .MuiLinearProgress-bar": { borderRadius: 3, bgcolor: COLORS[i % COLORS.length] } }} />
                </Box>
              ))}
              {(!topPriests || !topPriests.length) && (
                <Typography variant="body2" sx={{ color: "text.secondary", fontStyle: "italic" }}>No data for this year</Typography>
              )}
            </ChartCard>
          </Grid>

          {/* ── Transfer Mode + Country ── */}
          {/* <Grid item xs={12} md={6}>
            <ChartCard sx={{ height: "100%" }}>
              <Typography variant="h6" gutterBottom sx={{ fontWeight: 600, color: "text.primary", mb: 3 }}>
                Transfer Mode
              </Typography>
              <ResponsiveContainer width="100%" height={200}>
                <PieChart>
                  <Pie data={modeData} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={75} innerRadius={40} paddingAngle={4}>
                    {modeData.map((_, i) => <Cell key={i} fill={COLORS[(i + 3) % COLORS.length]} />)}
                  </Pie>
                  <ReTooltip formatter={(v) => fmtINR(v)} contentStyle={{ borderRadius: 10 }} />
                </PieChart>
              </ResponsiveContainer>
              {modeData.map((m, i) => (
                <Box key={m.name} sx={{ display: "flex", justifyContent: "space-between", py: 0.5 }}>
                  <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                    <Box sx={{ width: 10, height: 10, borderRadius: "50%", bgcolor: COLORS[(i + 3) % COLORS.length] }} />
                    <Typography variant="body2" sx={{ fontWeight: 600, color: "text.primary" }}>{m.name}</Typography>
                  </Box>
                  <Box sx={{ textAlign: "right" }}>
                    <Typography variant="body2" sx={{ fontWeight: 700, color: "text.primary" }}>{fmtINR(m.value)}</Typography>
                    <Typography variant="caption" sx={{ color: "text.secondary" }}>{m.count} txn</Typography>
                  </Box>
                </Box>
              ))}
            </ChartCard>
          </Grid> */}

          {/* <Grid item xs={12} md={6}>
            <ChartCard sx={{ height: "100%" }}>
              <Typography variant="h6" gutterBottom sx={{ fontWeight: 600, color: "text.primary", mb: 3 }}>
                Priests by Country
              </Typography>
              {(data?.countryWise || []).length > 0 ? (
                data.countryWise.map((c, i) => (
                  <Box key={c._id} sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", py: 0.8 }}>
                    <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
                      <PublicIcon sx={{ fontSize: 18, color: COLORS[i % COLORS.length] }} />
                      <Typography variant="body2" sx={{ fontWeight: 600, color: "text.primary" }}>{c._id}</Typography>
                    </Box>
                    <Chip label={c.count} size="small"
                      sx={{ fontWeight: 700, fontSize: "0.78rem", bgcolor: COLORS[i % COLORS.length] + "18", color: COLORS[i % COLORS.length] }} />
                  </Box>
                ))
              ) : (
                <Typography variant="body2" sx={{ color: "text.secondary", fontStyle: "italic" }}>No country data available</Typography>
              )}
            </ChartCard>
          </Grid> */}

          {/* ── Recent Donations ── */}
          <Grid item xs={12}>
            <ChartCard>
              <Typography variant="h6" gutterBottom sx={{ fontWeight: 600, color: "text.primary", mb: 3 }}>
                Recent Donations
              </Typography>
              <Box component="table" sx={{
                width: "100%", borderCollapse: "collapse",
                "& th, & td": { p: 1.5, textAlign: "left", fontSize: "0.85rem", borderBottom: "1px solid #E2E8F0" },
                "& th": {
                  fontWeight: 600, color: "text.secondary", backgroundColor: "#f8fafc",
                  fontSize: "0.78rem", textTransform: "uppercase", letterSpacing: "0.1em",
                },
                "& tr:hover td": { backgroundColor: "#f8fafc" },
              }}>
                <thead>
                  <tr><th>Date</th><th>Priest</th><th>Organization</th><th>Purpose</th><th>Currency</th><th style={{ textAlign: "right" }}>Amount</th><th style={{ textAlign: "right" }}>INR</th><th>Mode</th></tr>
                </thead>
                <tbody>
                  {(recentDonations || []).map((d, i) => (
                    <tr key={i}>
                      <td style={{ fontWeight: 600, color: "#0F172A" }}>{d.date ? new Date(d.date).toLocaleDateString() : "—"}</td>
                      <td>
                        <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                          <Avatar sx={{ width: 24, height: 24, bgcolor: COLORS[i % COLORS.length], fontSize: "0.65rem" }}>
                            {(d.priest?.name || "?")[0]}
                          </Avatar>
                          <span style={{ fontWeight: 600, color: "#0F172A" }}>Fr. {d.priest?.name || "—"}</span>
                        </Box>
                      </td>
                      <td style={{ color: "#0F172A" }}>{d.organization?.name || "—"}</td>
                      <td style={{ color: "#64748B" }}>{d.purpose || "—"}</td>
                      <td>
                        <Chip label={d.currency} size="small"
                          sx={{ fontWeight: 700, fontSize: "0.7rem", height: 22, bgcolor: "#1a237e18", color: "#1a237e" }} />
                      </td>
                      <td style={{ textAlign: "right", fontWeight: 600, color: "#0F172A" }}>
                        {new Intl.NumberFormat("en-US", { style: "currency", currency: d.currency || "USD", maximumFractionDigits: 2 }).format(d.amount || 0)}
                      </td>
                      <td style={{ textAlign: "right", fontWeight: 700, color: "#059669" }}>{fmtINR(d.inrAmount)}</td>
                      <td>
                        <Chip label={d.modeOfTransfer || "—"} size="small" variant="outlined"
                          sx={{ fontWeight: 600, fontSize: "0.7rem", height: 22, borderColor: "#CBD5E1", color: "#64748B" }} />
                      </td>
                    </tr>
                  ))}
                  {(!recentDonations || !recentDonations.length) && (
                    <tr><td colSpan={8} style={{ textAlign: "center", color: "#94A3B8", fontStyle: "italic", padding: 32 }}>No donations for this year</td></tr>
                  )}
                </tbody>
              </Box>
            </ChartCard>
          </Grid>

        </Grid>
      </Container>

      <Snackbar open={Boolean(message)} autoHideDuration={5000} onClose={() => setMessage(null)}
        anchorOrigin={{ vertical: "bottom", horizontal: "right" }}>
        <Alert onClose={() => setMessage(null)} severity={message?.type || "info"} variant="filled" sx={{ borderRadius: "8px" }}>
          {message?.text}
        </Alert>
      </Snackbar>
    </DashboardContainer>
  );
};

export default CuriaDashboard;