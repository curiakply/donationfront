import React, { useState, useEffect, useCallback } from "react";
import {
  Box, Typography, Card, Grid, MenuItem, Select, FormControl, InputLabel,
  CircularProgress, Snackbar, Alert, CssBaseline, createTheme, ThemeProvider,
  Chip, Avatar, Divider, LinearProgress,
} from "@mui/material";
import { styled } from "@mui/material/styles";
import {
  Person as PersonIcon,
  Business as BusinessIcon,
  VolunteerActivism as DonationIcon,
  CurrencyRupee as RupeeIcon,
  Public as PublicIcon,
  TrendingUp as TrendingUpIcon,
  AccountBalance as BalanceIcon,
  Flight as FlightIcon,
  DoNotDisturb as NilIcon,
} from "@mui/icons-material";
import axiosInstance from "../axiosConfig";
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip as ReTooltip,
  ResponsiveContainer, PieChart, Pie, Cell, LineChart, Line, Legend, Area, AreaChart,
} from "recharts";

// ─── Theme ────────────────────────────────────────────────────────────────────

const theme = createTheme({
  palette: {
    mode: "light",
    primary: { main: "#1E3A5F", light: "#2563EB", dark: "#0F172A" },
    background: { default: "#F1F5F9", paper: "#FFFFFF" },
    text: { primary: "#0F172A", secondary: "#64748B" },
  },
  typography: { fontFamily: "'Georgia', 'Times New Roman', serif" },
});

// ─── Styled ───────────────────────────────────────────────────────────────────

const DashCard = styled(Card)(() => ({
  borderRadius: 16, boxShadow: "0 2px 8px rgba(0,0,0,0.06)", padding: 0, overflow: "hidden",
  transition: "all 0.3s ease",
  "&:hover": { transform: "translateY(-4px)", boxShadow: "0 12px 28px rgba(0,0,0,0.10)" },
}));

const StatCard = styled(Box)(({ gradient }) => ({
  padding: "22px 24px", borderRadius: 16, background: gradient || "#fff",
  display: "flex", alignItems: "center", gap: 16, position: "relative", overflow: "hidden",
  transition: "all 0.3s ease",
  "&:hover": { transform: "translateY(-3px)", boxShadow: "0 8px 20px rgba(0,0,0,0.12)" },
}));

const MONTH_LABELS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
const COLORS = ["#2563EB", "#7C3AED", "#059669", "#D97706", "#DC2626", "#0891B2", "#4F46E5", "#BE185D", "#0D9488", "#A855F7"];
const STATUS_COLORS = { active: "#059669", inactive: "#D97706", retired: "#2563EB", died: "#DC2626" };

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

  if (isLoading && !data) {
    return (
      <ThemeProvider theme={theme}>
        <CssBaseline />
        <Box sx={{ display: "flex", justifyContent: "center", alignItems: "center", minHeight: "100vh", background: "#F1F5F9" }}>
          <CircularProgress />
        </Box>
      </ThemeProvider>
    );
  }

  const { counts, totals, months, currencyBreakdown, topOrganizations, topPriests, modeBreakdown, priestStatus, countryWise, recentDonations } = data || {};

  const monthlyData = (months || []).map((m) => ({ name: MONTH_LABELS[m.month - 1], amount: m.totalINR, count: m.count }));
  const currencyData = (currencyBreakdown || []).map((c) => ({ name: c._id, value: c.totalINR, count: c.count }));
  const modeData = (modeBreakdown || []).map((m) => ({ name: m._id, value: m.totalINR, count: m.count }));
  const statusData = (priestStatus || []).map((s) => ({ name: s._id, value: s.count }));
  const orgBarData = (topOrganizations || []).map((o) => ({ name: o.name, amount: o.totalINR, count: o.count }));
  const priestBarData = (topPriests || []).map((p) => ({ name: `Fr. ${p.name}`, amount: p.totalINR, count: p.count }));

  // Max for progress bars
  const maxOrgAmt = Math.max(...(topOrganizations || []).map((o) => o.totalINR), 1);
  const maxPriestAmt = Math.max(...(topPriests || []).map((p) => p.totalINR), 1);

  const years = [];
  const currentYear = new Date().getFullYear();
  for (let y = currentYear; y >= currentYear - 5; y--) years.push(y);

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Box sx={{ p: 3, minHeight: "100vh", background: "#F1F5F9" }}>

        {/* ── Header ── */}
        <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 3 }}>
          <Box>
            <Typography variant="h4" sx={{ fontWeight: 800, fontFamily: "'Georgia', serif", color: "#0F172A" }}>
               Dashboard
            </Typography>
            <Typography variant="body2" sx={{ color: "#64748B", mt: 0.5 }}>
              Donation analytics & priest overview for {year}
            </Typography>
          </Box>
          <FormControl size="small" sx={{ minWidth: 140 }}>
            <InputLabel sx={{ fontFamily: "inherit" }}>Year</InputLabel>
            <Select value={year} label="Year" onChange={(e) => setYear(e.target.value)}
              sx={{ borderRadius: 3, fontFamily: "inherit", fontWeight: 600, bgcolor: "#fff" }}>
              {years.map((y) => <MenuItem key={y} value={y}>{y}</MenuItem>)}
            </Select>
          </FormControl>
        </Box>

        {isLoading && <LinearProgress sx={{ mb: 2, borderRadius: 2 }} />}

        {/* ── Stat Cards Row 1 ── */}
        <Grid container spacing={2.5} sx={{ mb: 3 }}>
          {[
            { label: "Total Donations (INR)", value: fmtINR(totals?.totalINR), sub: `${totals?.totalDonations || 0} transactions`, icon: <RupeeIcon />, gradient: "linear-gradient(135deg, #1E3A5F 0%, #2563EB 100%)", color: "#fff" },
            { label: "Priests", value: counts?.priestCount || 0, sub: `${counts?.activePriests || 0} active`, icon: <PersonIcon />, gradient: "linear-gradient(135deg, #059669 0%, #34D399 100%)", color: "#fff" },
            { label: "Receivers", value: counts?.orgCount || 0, sub: "Registered", icon: <BusinessIcon />, gradient: "linear-gradient(135deg, #7C3AED 0%, #A78BFA 100%)", color: "#fff" },
            { label: "Abroad Priests", value: counts?.abroadPriests || 0, sub: `${counts?.nilCount || 0} NIL contributors`, icon: <FlightIcon />, gradient: "linear-gradient(135deg, #D97706 0%, #FBBF24 100%)", color: "#fff" },
          ].map((s, i) => (
            <Grid item xs={12} sm={6} md={3} key={i}>
              <StatCard gradient={s.gradient}>
                <Box sx={{ width: 52, height: 52, borderRadius: "14px", bgcolor: "rgba(255,255,255,0.2)", display: "flex", alignItems: "center", justifyContent: "center" }}>
                  {React.cloneElement(s.icon, { sx: { color: s.color, fontSize: 26 } })}
                </Box>
                <Box>
                  <Typography variant="caption" sx={{ color: "rgba(255,255,255,0.8)", fontWeight: 600, letterSpacing: "0.04em", textTransform: "uppercase", fontSize: "0.68rem" }}>
                    {s.label}
                  </Typography>
                  <Typography variant="h5" sx={{ fontWeight: 800, color: s.color, fontFamily: "'Georgia', serif", lineHeight: 1.2, mt: 0.3 }}>
                    {s.value}
                  </Typography>
                  <Typography variant="caption" sx={{ color: "rgba(255,255,255,0.7)", fontSize: "0.72rem" }}>
                    {s.sub}
                  </Typography>
                </Box>
              </StatCard>
            </Grid>
          ))}
        </Grid>

        {/* ── Row 2: Monthly Trend + Currency Breakdown ── */}
        <Grid container spacing={2.5} sx={{ mb: 3 }}>
          <Grid item xs={12} md={8}>
            <DashCard sx={{ p: 3 }}>
              <Typography variant="h6" sx={{ fontWeight: 700, fontFamily: "'Georgia', serif", mb: 2 }}>
                Monthly Donation Trend
              </Typography>
              <ResponsiveContainer width="100%" height={300}>
                <AreaChart data={monthlyData}>
                  <defs>
                    <linearGradient id="colorAmt" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#2563EB" stopOpacity={0.3} />
                      <stop offset="95%" stopColor="#2563EB" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#E2E8F0" />
                  <XAxis dataKey="name" tick={{ fontSize: 12, fontFamily: "Georgia" }} />
                  <YAxis tickFormatter={fmtShort} tick={{ fontSize: 11, fontFamily: "Georgia" }} />
                  <ReTooltip formatter={(v) => fmtINR(v)} contentStyle={{ borderRadius: 12, fontFamily: "Georgia" }} />
                  <Area type="monotone" dataKey="amount" stroke="#2563EB" strokeWidth={2.5} fill="url(#colorAmt)" />
                </AreaChart>
              </ResponsiveContainer>
            </DashCard>
          </Grid>

          <Grid item xs={12} md={4}>
            <DashCard sx={{ p: 3, height: "100%" }}>
              <Typography variant="h6" sx={{ fontWeight: 700, fontFamily: "'Georgia', serif", mb: 2 }}>
                Currency Split
              </Typography>
              <ResponsiveContainer width="100%" height={200}>
                <PieChart>
                  <Pie data={currencyData} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={80} innerRadius={45} paddingAngle={3}>
                    {currencyData.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                  </Pie>
                  <ReTooltip formatter={(v) => fmtINR(v)} contentStyle={{ borderRadius: 10, fontFamily: "Georgia" }} />
                </PieChart>
              </ResponsiveContainer>
              <Box sx={{ mt: 1 }}>
                {currencyData.map((c, i) => (
                  <Box key={c.name} sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", py: 0.5 }}>
                    <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                      <Box sx={{ width: 10, height: 10, borderRadius: "50%", bgcolor: COLORS[i % COLORS.length] }} />
                      <Typography variant="body2" sx={{ fontWeight: 600 }}>{c.name}</Typography>
                    </Box>
                    <Typography variant="body2" sx={{ fontWeight: 700, color: "#0F172A" }}>{fmtINR(c.value)}</Typography>
                  </Box>
                ))}
              </Box>
            </DashCard>
          </Grid>
        </Grid>

        {/* ── Row 3: Top Organizations + Top Priests ── */}
        <Grid container spacing={2.5} sx={{ mb: 3 }}>
          <Grid item xs={12} md={6}>
            <DashCard sx={{ p: 3 }}>
              <Typography variant="h6" sx={{ fontWeight: 700, fontFamily: "'Georgia', serif", mb: 2 }}>
                Top Receivers
              </Typography>
              {(topOrganizations || []).map((o, i) => (
                <Box key={i} sx={{ mb: 1.5 }}>
                  <Box sx={{ display: "flex", justifyContent: "space-between", mb: 0.3 }}>
                    <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                      <Avatar sx={{ width: 26, height: 26, bgcolor: COLORS[i % COLORS.length], fontSize: "0.72rem", fontWeight: 700 }}>
                        {i + 1}
                      </Avatar>
                      <Typography variant="body2" sx={{ fontWeight: 600, fontFamily: "'Georgia', serif" }}>{o.name}</Typography>
                    </Box>
                    <Typography variant="body2" sx={{ fontWeight: 700, color: "#059669" }}>{fmtINR(o.totalINR)}</Typography>
                  </Box>
                  <LinearProgress variant="determinate" value={(o.totalINR / maxOrgAmt) * 100}
                    sx={{ height: 6, borderRadius: 3, bgcolor: "#E2E8F0", "& .MuiLinearProgress-bar": { borderRadius: 3, bgcolor: COLORS[i % COLORS.length] } }} />
                </Box>
              ))}
              {(!topOrganizations || !topOrganizations.length) && (
                <Typography variant="body2" sx={{ color: "#94A3B8", fontStyle: "italic" }}>No data for this year</Typography>
              )}
            </DashCard>
          </Grid>

          <Grid item xs={12} md={6}>
            <DashCard sx={{ p: 3 }}>
              <Typography variant="h6" sx={{ fontWeight: 700, fontFamily: "'Georgia', serif", mb: 2 }}>
                Top Contributing Priests
              </Typography>
              {(topPriests || []).map((p, i) => (
                <Box key={i} sx={{ mb: 1.5 }}>
                  <Box sx={{ display: "flex", justifyContent: "space-between", mb: 0.3 }}>
                    <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                      <Avatar sx={{ width: 26, height: 26, bgcolor: COLORS[i % COLORS.length], fontSize: "0.72rem", fontWeight: 700 }}>
                        {i + 1}
                      </Avatar>
                      <Typography variant="body2" sx={{ fontWeight: 600, fontFamily: "'Georgia', serif" }}>Fr. {p.name}</Typography>
                    </Box>
                    <Typography variant="body2" sx={{ fontWeight: 700, color: "#059669" }}>{fmtINR(p.totalINR)}</Typography>
                  </Box>
                  <LinearProgress variant="determinate" value={(p.totalINR / maxPriestAmt) * 100}
                    sx={{ height: 6, borderRadius: 3, bgcolor: "#E2E8F0", "& .MuiLinearProgress-bar": { borderRadius: 3, bgcolor: COLORS[i % COLORS.length] } }} />
                </Box>
              ))}
              {(!topPriests || !topPriests.length) && (
                <Typography variant="body2" sx={{ color: "#94A3B8", fontStyle: "italic" }}>No data for this year</Typography>
              )}
            </DashCard>
          </Grid>
        </Grid>

        {/* ── Row 4: Mode Breakdown + Priest Status + Country ── */}
        {/* <Grid container spacing={2.5} sx={{ mb: 3 }}>
          <Grid item xs={12} md={4}>
            <DashCard sx={{ p: 3, height: "100%" }}>
              <Typography variant="h6" sx={{ fontWeight: 700, fontFamily: "'Georgia', serif", mb: 2 }}>
                Transfer Mode
              </Typography>
              <ResponsiveContainer width="100%" height={200}>
                <PieChart>
                  <Pie data={modeData} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={75} innerRadius={40} paddingAngle={4}>
                    {modeData.map((_, i) => <Cell key={i} fill={COLORS[i + 3]} />)}
                  </Pie>
                  <ReTooltip formatter={(v) => fmtINR(v)} contentStyle={{ borderRadius: 10, fontFamily: "Georgia" }} />
                </PieChart>
              </ResponsiveContainer>
              {modeData.map((m, i) => (
                <Box key={m.name} sx={{ display: "flex", justifyContent: "space-between", py: 0.4 }}>
                  <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                    <Box sx={{ width: 10, height: 10, borderRadius: "50%", bgcolor: COLORS[i + 3] }} />
                    <Typography variant="body2" sx={{ fontWeight: 600 }}>{m.name}</Typography>
                  </Box>
                  <Box sx={{ textAlign: "right" }}>
                    <Typography variant="body2" sx={{ fontWeight: 700 }}>{fmtINR(m.value)}</Typography>
                    <Typography variant="caption" sx={{ color: "#94A3B8" }}>{m.count} txn</Typography>
                  </Box>
                </Box>
              ))}
            </DashCard>
          </Grid> */}

          {/* <Grid item xs={12} md={4}>
            <DashCard sx={{ p: 3, height: "100%" }}>
              <Typography variant="h6" sx={{ fontWeight: 700, fontFamily: "'Georgia', serif", mb: 2 }}>
                Priest Status
              </Typography>
              <ResponsiveContainer width="100%" height={200}>
                <PieChart>
                  <Pie data={statusData} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={75} innerRadius={40} paddingAngle={4}>
                    {statusData.map((s) => <Cell key={s.name} fill={STATUS_COLORS[s.name] || "#94A3B8"} />)}
                  </Pie>
                  <ReTooltip contentStyle={{ borderRadius: 10, fontFamily: "Georgia" }} />
                </PieChart>
              </ResponsiveContainer>
              {statusData.map((s) => (
                <Box key={s.name} sx={{ display: "flex", justifyContent: "space-between", py: 0.4 }}>
                  <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                    <Box sx={{ width: 10, height: 10, borderRadius: "50%", bgcolor: STATUS_COLORS[s.name] || "#94A3B8" }} />
                    <Typography variant="body2" sx={{ fontWeight: 600, textTransform: "capitalize" }}>{s.name}</Typography>
                  </Box>
                  <Chip label={s.value} size="small" sx={{ fontWeight: 700, fontSize: "0.75rem", bgcolor: (STATUS_COLORS[s.name] || "#94A3B8") + "18", color: STATUS_COLORS[s.name] || "#94A3B8" }} />
                </Box>
              ))}
            </DashCard>
          </Grid> */}

          {/* <Grid item xs={12} md={4}>
            <DashCard sx={{ p: 3, height: "100%" }}>
              <Typography variant="h6" sx={{ fontWeight: 700, fontFamily: "'Georgia', serif", mb: 2 }}>
                Priests by Country
              </Typography>
              {(countryWise || []).length > 0 ? (
                (countryWise || []).map((c, i) => (
                  <Box key={c._id} sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", py: 0.6 }}>
                    <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                      <PublicIcon sx={{ fontSize: 16, color: COLORS[i % COLORS.length] }} />
                      <Typography variant="body2" sx={{ fontWeight: 600 }}>{c._id}</Typography>
                    </Box>
                    <Chip label={c.count} size="small" sx={{ fontWeight: 700, fontSize: "0.75rem", bgcolor: COLORS[i % COLORS.length] + "18", color: COLORS[i % COLORS.length] }} />
                  </Box>
                ))
              ) : (
                <Typography variant="body2" sx={{ color: "#94A3B8", fontStyle: "italic" }}>No country data available</Typography>
              )}
            </DashCard>
          </Grid>
        </Grid> */}

        {/* ── Row 5: Recent Donations ── */}
        <DashCard sx={{ p: 3 }}>
          <Typography variant="h6" sx={{ fontWeight: 700, fontFamily: "'Georgia', serif", mb: 2 }}>
            Recent Donations
          </Typography>
          <Box component="table" sx={{
            width: "100%", borderCollapse: "collapse",
            "& th, & td": { p: 1.2, textAlign: "left", fontSize: "0.82rem", borderBottom: "1px solid #E2E8F0" },
            "& th": { fontWeight: 700, color: "#64748B", backgroundColor: "#F8FAFC", fontFamily: "'Georgia', serif", fontSize: "0.75rem", textTransform: "uppercase", letterSpacing: "0.04em" },
            "& tr:hover td": { backgroundColor: "#F8FAFC" },
          }}>
            <thead>
              <tr><th>Date</th><th>Priest</th><th>Organization</th><th>Purpose</th><th>Currency</th><th style={{ textAlign: "right" }}>Amount</th><th style={{ textAlign: "right" }}>INR</th><th>Mode</th></tr>
            </thead>
            <tbody>
              {(recentDonations || []).map((d, i) => (
                <tr key={i}>
                  <td style={{ fontWeight: 600 }}>{d.date ? new Date(d.date).toLocaleDateString() : "—"}</td>
                  <td>
                    <Box sx={{ display: "flex", alignItems: "center", gap: 0.8 }}>
                      <Avatar sx={{ width: 24, height: 24, bgcolor: COLORS[i % COLORS.length], fontSize: "0.65rem" }}>
                        {(d.priest?.name || "?")[0]}
                      </Avatar>
                      <span style={{ fontWeight: 600 }}>Fr. {d.priest?.name || "—"}</span>
                    </Box>
                  </td>
                  <td>{d.organization?.name || "—"}</td>
                  <td>{d.purpose || "—"}</td>
                  <td><Chip label={d.currency} size="small" sx={{ fontWeight: 700, fontSize: "0.68rem", height: 20 }} /></td>
                  <td style={{ textAlign: "right", fontWeight: 600 }}>
                    {new Intl.NumberFormat("en-US", { style: "currency", currency: d.currency || "USD", maximumFractionDigits: 2 }).format(d.amount || 0)}
                  </td>
                  <td style={{ textAlign: "right", fontWeight: 700, color: "#059669" }}>{fmtINR(d.inrAmount)}</td>
                  <td>
                    <Chip label={d.modeOfTransfer || "—"} size="small" variant="outlined"
                      sx={{ fontWeight: 600, fontSize: "0.68rem", height: 20, borderColor: "#D1D5DB", color: "#64748B" }} />
                  </td>
                </tr>
              ))}
              {(!recentDonations || !recentDonations.length) && (
                <tr><td colSpan={8} style={{ textAlign: "center", color: "#94A3B8", fontStyle: "italic", padding: 24 }}>No donations for this year</td></tr>
              )}
            </tbody>
          </Box>
        </DashCard>

        <Snackbar open={Boolean(message)} autoHideDuration={5000} onClose={() => setMessage(null)}
          anchorOrigin={{ vertical: "bottom", horizontal: "right" }}>
          <Alert onClose={() => setMessage(null)} severity={message?.type || "info"} variant="filled" sx={{ borderRadius: "8px" }}>
            {message?.text}
          </Alert>
        </Snackbar>
      </Box>
    </ThemeProvider>
  );
};

export default CuriaDashboard;