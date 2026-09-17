import React, { useState, useEffect } from 'react';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  Legend, 
  PieChart, 
  Pie, 
  Cell, 
  LineChart, 
  Line,
  ResponsiveContainer
} from 'recharts';
import { 
  createTheme, 
  ThemeProvider, 
  CssBaseline,
  Button,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Box,
  Typography,
  Paper,
  CircularProgress,
  Alert,
  Card,
  CardContent,
  Grid,
  Chip,
  TextField
} from '@mui/material';
import { styled } from '@mui/material/styles';
import {
  Description as FileTextIcon,
  People as UsersIcon,
  Business as BuildingIcon,
  PieChart as PieChartIcon,
  BarChart as BarChart3Icon,
  TrendingUp as TrendingUpIcon,
  LocationOn as MapPinIcon,
  Home as HomeIcon,
  AttachMoney as DollarSignIcon,
  CalendarToday as CalendarIcon,
  Download as DownloadIcon,
  Refresh as RefreshIcon,
  Print as PrinterIcon,
  Search as SearchIcon,
  FilterList as FilterListIcon,
  FilterListOff as FilterXIcon
} from '@mui/icons-material';
import axiosInstance from '../axiosConfig';
import { useFinancialYear } from './FinancialYearContext';
// Theme configuration from first document
const theme = createTheme({
  palette: {
    mode: 'light',
    primary: {
      main: '#2563EB',
      light: '#3B82F6',
      dark: '#1E40AF'
    },
    secondary: {
      main: '#10B981',
      light: '#34D399',
      dark: '#047857'
    },
    background: {
      default: '#F3F4F6',
      paper: '#FFFFFF'
    },
    text: {
      primary: '#1F2937',
      secondary: '#6B7280'
    }
  },
  typography: {
    fontFamily: [
      'Inter', 
      'system-ui', 
      '-apple-system', 
      'BlinkMacSystemFont', 
      'Segoe UI', 
      'Roboto', 
      'Helvetica Neue', 
      'Arial', 
      'sans-serif'
    ].join(','),
  },
  components: {
    MuiCard: {
      styleOverrides: {
        root: {
          borderRadius: 12,
          boxShadow: '0 4px 6px rgba(0,0,0,0.1)',
          transition: 'all 0.3s ease',
          '&:hover': {
            transform: 'translateY(-5px)',
            boxShadow: '0 8px 15px rgba(0,0,0,0.15)'
          }
        }
      }
    },
    MuiButton: {
      styleOverrides: {
        root: {
          textTransform: 'none',
          borderRadius: 8,
          padding: '10px 20px',
          fontWeight: 600
        }
      }
    }
  }
});

// Styled Components from first document
const StyledPaper = styled(Paper)(({ theme }) => ({
  borderRadius: 12,
  boxShadow: '0 4px 6px rgba(0,0,0,0.1)',
  transition: 'all 0.3s ease',
  '&:hover': {
    transform: 'translateY(-2px)',
    boxShadow: '0 8px 15px rgba(0,0,0,0.15)'
  }
}));

const GradientButton = styled(Button)(({ theme }) => ({
  background: `linear-gradient(to right, ${theme.palette.primary.light}, ${theme.palette.primary.main})`,
  color: 'white',
  '&:hover': {
    background: `linear-gradient(to right, ${theme.palette.primary.main}, ${theme.palette.primary.dark})`
  }
}));

const COLORS = ['#2563EB', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6', '#06B6D4', '#84CC16', '#F97316'];

const ComprehensiveReportsDashboard = () => {
  // State management
  const [foranes, setForanes] = useState([]);
  const [parishes, setParishes] = useState([]);
  const [selectedForane, setSelectedForane] = useState('');
  const [selectedParish, setSelectedParish] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  // Filter states
  const [nameFilter, setNameFilter] = useState('');
  const [selectedKoottaymaFilter, setSelectedKoottaymaFilter] = useState('');
  const [houseNameFilter, setHouseNameFilter] = useState('');
  const [headNameFilter, setHeadNameFilter] = useState('');
  const [familyOldNoFilter, setFamilyOldNoFilter] = useState('');
  const [familyIdNoFilter, setFamilyIdNoFilter] = useState('');
  const [sortField, setSortField] = useState('name');
  const [sortDirection, setSortDirection] = useState('asc');
  
  // Data states
  const [parishData, setParishData] = useState(null);
  const [koottaymaData, setKoottaymaData] = useState([]);
  const [titheData, setTitheData] = useState([]);
  const [consolidatedData, setConsolidatedData] = useState([]);
  const [allocationData, setAllocationData] = useState(null);
  const [foraneOverviewData, setForaneOverviewData] = useState([]);
  const { selectedYear1, formattedYear, startDate, endDate, updateYear } = useFinancialYear();
  // Fetch initial data
  useEffect(() => {
    fetchForanes();
  }, []);

  useEffect(() => {
    if (selectedForane) {
      fetchParishes(selectedForane);
    }
  }, [selectedForane]);

  useEffect(() => {
    if (selectedParish) {
      fetchAllReportData(selectedParish);
    }
  }, [selectedParish]);

  const fetchForanes = async () => {
    try {
      const response = await axiosInstance.get('/forane');
      setForanes(response.data);
      if (response.data.length > 0) {
        setSelectedForane(response.data[0]._id);
      }
      setLoading(false);
    } catch (err) {
      setError('Error fetching foranes');
      setLoading(false);
    }
  };

  const fetchParishes = async (foraneId) => {
    try {
      const response = await axiosInstance.get(`/parish`);
      setParishes(response.data);
      if (response.data.length > 0) {
        setSelectedParish(response.data[0]._id);
      }
    } catch (err) {
      setError('Error fetching parishes');
    }
  };

  const fetchAllReportData = async (parishId) => {
    setLoading(true);
    try {
      // Fetch all data in parallel
      const [
        parishResponse,
        koottaymaResponse,
        titheResponse,
        consolidatedResponse,
        allocationResponse
      ] = await Promise.all([
        axiosInstance.get(`/parish/${parishId}`),
        axiosInstance.get(`/koottayma/parish/${parishId}`),
        axiosInstance.get(`/transaction/tithe-info/${parishId}`),
        axiosInstance.get(`/transaction/consolidated-tithe/${parishId}`),
        //fetchAllocationData()
      ]);
console.log(consolidatedResponse.data);
      setParishData(parishResponse.data);
      setKoottaymaData(koottaymaResponse.data);
      setTitheData(titheResponse.data);
      setConsolidatedData(consolidatedResponse.data);
   //   setAllocationData(allocationResponse);

      // Fetch forane overview if needed
      if (selectedForane) {
        fetchForaneOverview(selectedForane);
      }

      setLoading(false);
    } catch (error) {
      console.error('Error fetching report data:', error);
      setError('Error fetching report data');
      setLoading(false);
    }
  };

  const fetchAllocationData = async () => {
    try {
      const currentYear = selectedYear1;
      const [communityRes, projectRes, parishAllocRes] = await Promise.all([
        axiosInstance.get(`/community-settings/year/${currentYear}`),
        axiosInstance.get(`/project-settings/year/${currentYear}`),
        axiosInstance.get(`/parish-allocations/parish-allocations/${currentYear}`)
      ]);

      return {
        year: currentYear,
        communitySettings: communityRes.data,
        projectSettings: projectRes.data,
        parishAllocations: parishAllocRes.data
      };
    } catch (error) {
      console.error('Error fetching allocation data:', error);
      return null;
    }
  };

  const fetchForaneOverview = async (foraneId) => {
    try {
      const foraneParishesRes = await axiosInstance.get(`/parish/forane/${foraneId}`);
      const parishKoottaymaData = await Promise.all(
        foraneParishesRes.data.map(async (parish) => {
          const koottaymaRes = await axiosInstance.get(`/koottayma/parish/${parish._id}`);
          const consolidatedRes = await axiosInstance.get(`/transaction/consolidated-tithe/${parish._id}`);
          return {
            parish: parish,
            koottaymas: koottaymaRes.data,
            consolidated: consolidatedRes.data,
            totalFamilies: koottaymaRes.data.reduce((sum, k) => sum + k.familyCount, 0),
            totalAmount: consolidatedRes.data.reduce((sum, c) => sum + c.amount, 0)
          };
        })
      );
      setForaneOverviewData(parishKoottaymaData);
    } catch (error) {
      console.error('Error fetching forane overview:', error);
    }
  };

  const handleRefresh = () => {
    if (selectedParish) {
      fetchAllReportData(selectedParish);
    }
    // Reset filters
    setNameFilter('');
    setSelectedKoottaymaFilter('');
    setHouseNameFilter('');
    setHeadNameFilter('');
    setFamilyOldNoFilter('');
    setFamilyIdNoFilter('');
  };

  // Print functions for different sections
  const handlePrintParishOverview = () => {
    const filteredAndSortedData = getFilteredAndSortedKoottaymaData();
    const safeConsolidatedData = consolidatedData || [];
    
    const printContent = `
      <!DOCTYPE html>
      <html>
      <head>
        <title>Parish Family Overview Report</title>
        <style>
          body { font-family: Arial, sans-serif; margin: 20px; }
          .header { text-align: center; margin-bottom: 30px; border-bottom: 2px solid #333; padding-bottom: 15px; }
          .parish-info { margin-bottom: 20px; background: #f5f5f5; padding: 15px; border-radius: 5px; }
          .stats { display: flex; justify-content: space-around; margin-bottom: 30px; }
          .stat-box { text-align: center; padding: 10px; border: 1px solid #ddd; border-radius: 5px; }
          table { width: 100%; border-collapse: collapse; margin-top: 20px; }
          th, td { border: 1px solid #ddd; padding: 12px; text-align: left; }
          th { background-color: #f2f2f2; font-weight: bold; }
          .number { text-align: right; }
          .footer { margin-top: 30px; text-align: center; font-size: 12px; color: #666; }
          @media print {
            body { margin: 0; }
            .no-print { display: none; }
          }
        </style>
      </head>
      <body>
        <div class="header">
          <h1>Parish Family Overview Report</h1>
          <p>Generated on: ${new Date().toLocaleDateString()} at ${new Date().toLocaleTimeString()}</p>
        </div>
        
        <div class="parish-info">
          <h2>Parish Information</h2>
          <p><strong>Parish Name:</strong> ${parishData?.name || 'N/A'}</p>
          <p><strong>Report Date:</strong> ${new Date().toLocaleDateString()}</p>
        </div>

        <div class="stats">
          <div class="stat-box">
            <h3>${safeKoottaymaData.reduce((sum, k) => sum + (k?.familyCount || 0), 0)}</h3>
            <p>Total Families</p>
          </div>
          <div class="stat-box">
            <h3>₹${safeConsolidatedData.reduce((sum, c) => sum + (c?.amount || 0), 0).toLocaleString()}</h3>
            <p>Total Collection</p>
          </div>
          <div class="stat-box">
            <h3>${safeKoottaymaData.length}</h3>
            <p>Active Koottaymas</p>
          </div>
        </div>

        <h2>Koottayma Breakdown</h2>
        <table>
          <thead>
            <tr>
              <th>Koottayma Name</th>
              <th class="number">Total Families</th>
              <th class="number">Families Participated</th>
              <th class="number">Amount Collected</th>
            </tr>
          </thead>
          <tbody>
            ${filteredAndSortedData.map(item => {
              const consolidated = safeConsolidatedData.find(c => c?._id === item?._id);
              return `
                <tr>
                  <td>${item?.name || 'Unknown'}</td>
                  <td class="number">${item?.familyCount || 0}</td>
                  <td class="number">${consolidated?.totalFamiliesParticipated || 0}</td>
                  <td class="number">₹${consolidated?.amount?.toLocaleString() || '0'}</td>
                </tr>
              `;
            }).join('')}
          </tbody>
        </table>

        <div class="footer">
          <p>This report was generated automatically from the Jeevan Management System</p>
        </div>
      </body>
      </html>
    `;

    const printWindow = window.open('', '_blank');
    printWindow.document.write(printContent);
    printWindow.document.close();
    printWindow.focus();
    printWindow.print();
  };

  const handlePrintTitheDetails = () => {
    const filteredData = getFilteredTitheData();
    
    const printContent = `
      <!DOCTYPE html>
      <html>
      <head>
        <title>Detailed Tithe Information Report</title>
        <style>
          body { font-family: Arial, sans-serif; margin: 20px; font-size: 12px; }
          .header { text-align: center; margin-bottom: 30px; border-bottom: 2px solid #333; padding-bottom: 15px; }
          .parish-info { margin-bottom: 20px; background: #f5f5f5; padding: 15px; border-radius: 5px; }
          .koottayma-section { margin-bottom: 30px; page-break-inside: avoid; }
          .koottayma-header { background: #e3f2fd; padding: 10px; margin-bottom: 10px; border-radius: 5px; }
          table { width: 100%; border-collapse: collapse; margin-bottom: 20px; }
          th, td { border: 1px solid #ddd; padding: 8px; text-align: left; font-size: 11px; }
          th { background-color: #f2f2f2; font-weight: bold; }
          .number { text-align: right; }
          .center { text-align: center; }
          .total-row { background-color: #f0f0f0; font-weight: bold; }
          .footer { margin-top: 30px; text-align: center; font-size: 10px; color: #666; }
          @media print {
            body { margin: 0; }
            .no-print { display: none; }
            .koottayma-section { page-break-inside: avoid; }
          }
        </style>
      </head>
      <body>
        <div class="header">
          <h1>Detailed Tithe Information Report</h1>
          <p>Generated on: ${new Date().toLocaleDateString()} at ${new Date().toLocaleTimeString()}</p>
        </div>
        
        <div class="parish-info">
          <h2>Parish Information</h2>
          <p><strong>Parish Name:</strong> ${parishData?.name || 'N/A'}</p>
          <p><strong>Report Date:</strong> ${new Date().toLocaleDateString()}</p>
          <p><strong>Total Koottaymas:</strong> ${filteredData.length}</p>
        </div>

        ${filteredData.map(koottayma => `
          <div class="koottayma-section">
            <div class="koottayma-header">
              <h3>KOOTTAYMA - ${koottayma?.name || 'Unknown'} (${(koottayma?.families || []).length} families)</h3>
            </div>
            <table>
              <thead>
                <tr>
                  <th>House Name</th>
                  <th>Head Name</th>
               
                  <th class="number">Amount</th>
                </tr>
              </thead>
              <tbody>
                ${(koottayma?.families || []).map(family => `
                  <tr>
                    <td>${family?.houseName || 'N/A'}</td>
                    <td>${family?.headName || 'N/A'}</td>
                  
                    <td class="number">₹${family?.totalAmount?.toLocaleString() || '0'}</td>
                  </tr>
                `).join('')}
                <tr class="total-row">
                  <td colspan="2" class="number"><strong>Total:</strong></td>
                  <td class="number"><strong>₹${koottayma?.totalAmount?.toLocaleString() || '0'}</strong></td>
                </tr>
              </tbody>
            </table>
          </div>
        `).join('')}

        <div class="footer">
          <p>This report was generated automatically from the Jeevan Management System</p>
          <p>Total Amount Collected: ₹${filteredData.reduce((sum, k) => sum + (k?.totalAmount || 0), 0).toLocaleString()}</p>
        </div>
      </body>
      </html>
    `;

    const printWindow = window.open('', '_blank');
    printWindow.document.write(printContent);
    printWindow.document.close();
    printWindow.focus();
    printWindow.print();
  };

  // Filter functions with null checks
 const getFilteredAndSortedKoottaymaData = () => {
  // First apply filters
  const filtered = koottaymaData.filter(item => 
    (item?.name || '').toLowerCase().includes((nameFilter || '').toLowerCase()) &&
    (selectedKoottaymaFilter === '' || item?._id === selectedKoottaymaFilter)
  );

  // Then apply sorting
  return filtered.sort((a, b) => {
    let aValue, bValue;
    
    switch (sortField) {
      case 'name':
        aValue = (a?.name || '').toLowerCase();
        bValue = (b?.name || '').toLowerCase();
        break;
      case 'familyCount':
        aValue = a?.familyCount || 0;
        bValue = b?.familyCount || 0;
        break;
      case 'amount':
        const aAmount = (consolidatedData || []).find(c => c?._id === a?._id)?.amount || 0;
        const bAmount = (consolidatedData || []).find(c => c?._id === b?._id)?.amount || 0;
        aValue = aAmount;
        bValue = bAmount;
        break;
      default:
        aValue = (a?.name || '').toLowerCase();
        bValue = (b?.name || '').toLowerCase();
    }

    if (sortDirection === 'asc') {
      return aValue < bValue ? -1 : aValue > bValue ? 1 : 0;
    } else {
      return aValue > bValue ? -1 : aValue < bValue ? 1 : 0;
    }
  });
};

const handleSort = (field) => {
  if (sortField === field) {
    setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
  } else {
    setSortField(field);
    setSortDirection('asc');
  }
};

const getSortIcon = (field) => {
  if (sortField !== field) {
    return <span style={{ fontSize: '12px', opacity: 0.5, marginLeft: '4px' }}>↕</span>;
  }
  return sortDirection === 'asc' ? 
    <span style={{ fontSize: '12px', marginLeft: '4px' }}>↑</span> : 
    <span style={{ fontSize: '12px', marginLeft: '4px' }}>↓</span>;
};

const filteredAndSortedKoottaymaData = getFilteredAndSortedKoottaymaData();

  const getFilteredTitheData = () => {
    return titheData.map(koottayma => ({
      ...koottayma,
      families: (koottayma?.families || []).filter(family =>
        (family?.houseName || '').toLowerCase().includes((houseNameFilter || '').toLowerCase()) &&
        (family?.headName || '').toLowerCase().includes((headNameFilter || '').toLowerCase()) &&
        (family?.familyOldNo || '').toString().toLowerCase().includes((familyOldNoFilter || '').toLowerCase()) &&
        (family?.familyIdNo || '').toString().toLowerCase().includes((familyIdNoFilter || '').toLowerCase())
      )
    })).filter(koottayma => 
      (koottayma?.name || '').toLowerCase().includes((nameFilter || '').toLowerCase()) &&
      (selectedKoottaymaFilter === '' || koottayma?._id === selectedKoottaymaFilter) &&
      (koottayma?.families || []).length > 0
    );
  };

  const getFilteredConsolidatedData = () => {
    return consolidatedData.filter(item =>
      (item?.name || '').toLowerCase().includes((nameFilter || '').toLowerCase()) &&
      (selectedKoottaymaFilter === '' || item?._id === selectedKoottaymaFilter)
    );
  };

  const StatsCard = ({ title, value, icon: Icon, color, change, onClick }) => (
    <Card 
      sx={{ 
        cursor: onClick ? 'pointer' : 'default',
        '&:hover': onClick ? { transform: 'translateY(-2px)' } : {}
      }}
      onClick={onClick}
    >
      <CardContent>
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <Box>
            <Typography color="textSecondary" gutterBottom variant="body2">
              {title}
            </Typography>
            <Typography variant="h4" component="div" sx={{ fontWeight: 700 }}>
              {value}
            </Typography>
            {change && (
              <Box sx={{ display: 'flex', alignItems: 'center', mt: 1 }}>
                <TrendingUpIcon sx={{ fontSize: 16, color: theme.palette.success.main, mr: 0.5 }} />
                <Typography variant="body2" color="success.main">
                  {change}
                </Typography>
              </Box>
            )}
          </Box>
          <Box sx={{ 
            p: 2, 
            borderRadius: 2, 
            bgcolor: color,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}>
            <Icon sx={{ fontSize: 24, color: 'white' }} />
          </Box>
        </Box>
      </CardContent>
    </Card>
  );

  if (loading) {
    return (
      <ThemeProvider theme={theme}>
        <CssBaseline />
        <Box sx={{ 
          display: 'flex', 
          justifyContent: 'center', 
          alignItems: 'center', 
          minHeight: '100vh',
          bgcolor: 'background.default'
        }}>
          <CircularProgress size={60} />
        </Box>
      </ThemeProvider>
    );
  }

  if (error) {
    return (
      <ThemeProvider theme={theme}>
        <CssBaseline />
        <Box sx={{ 
          display: 'flex', 
          justifyContent: 'center', 
          alignItems: 'center', 
          minHeight: '100vh',
          bgcolor: 'background.default',
          p: 3
        }}>
          <Alert severity="error" sx={{ maxWidth: 400 }}>
            {error}
          </Alert>
        </Box>
      </ThemeProvider>
    );
  }

  // Get filtered data for display with null checks
  const filteredTitheData = getFilteredTitheData();
  const filteredConsolidatedData = getFilteredConsolidatedData();

  // Safe calculations with null checks
  const safeKoottaymaData = koottaymaData || [];
  const safeConsolidatedData = consolidatedData || [];
  const totalFamilies = safeKoottaymaData.reduce((sum, k) => sum + (k?.familyCount || 0), 0);
  const totalCollection = safeConsolidatedData.reduce((sum, c) => sum + (c?.amount || 0), 0);
  const activeKoottaymas = safeKoottaymaData.length;

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Box sx={{ 
        minHeight: '100vh',
        bgcolor: 'background.default',
        background: 'linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%)',
        p: 3
      }}>
        {/* Header */}
        <StyledPaper sx={{ p: 3, mb: 3 }}>
          <Box sx={{ 
            display: 'flex',
            flexDirection: { xs: 'column', md: 'row' },
            justifyContent: 'space-between',
            alignItems: { xs: 'flex-start', md: 'center' },
            gap: 2
          }}>
            <Box>
              <Typography variant="h4" sx={{ 
                fontWeight: 700,
                color: 'text.primary',
                mb: 1
              }}>
                Kootaymas Reports Dashboard
              </Typography>
              
            </Box>
            <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
              <GradientButton
                startIcon={<RefreshIcon />}
                onClick={handleRefresh}
              >
                Refresh
              </GradientButton>
            </Box>
          </Box>
        </StyledPaper>

        {/* Selection Controls */}
        <StyledPaper sx={{ p: 3, mb: 3 }}>
          <Grid container spacing={3} alignItems="center">
           
            <Grid item xs={12} sm={6} md={3}>
              <FormControl fullWidth>
                <InputLabel>Parish</InputLabel>
                <Select
                  value={selectedParish}
                  label="Parish"
                  onChange={(e) => setSelectedParish(e.target.value)}
                >
                  {parishes.map((parish) => (
                    <MenuItem key={parish._id} value={parish._id}>
                      {parish.name}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} md={6}>
              <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                
                <Chip 
                  label={`Parish: ${parishData?.name || ''}`}
                  color="secondary"
                  variant="outlined"
                />
              </Box>
            </Grid>
          </Grid>
        </StyledPaper>

        {/* Stats Overview */}
        <Grid container spacing={3} sx={{ mb: 3 }}>
          <Grid item xs={12} sm={6} md={3}>
            <StatsCard
              title="Total Families"
              value={totalFamilies.toLocaleString()}
              icon={UsersIcon}
              color={theme.palette.primary.main}
              change="+5.2%"
            />
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <StatsCard
              title="Total Collection"
              value={`₹${totalCollection.toLocaleString()}`}
              icon={DollarSignIcon}
              color={theme.palette.secondary.main}
              change="+12.5%"
            />
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <StatsCard
              title="Active Koottaymas"
              value={activeKoottaymas.toString()}
              icon={BuildingIcon}
              color={theme.palette.warning.main}
            />
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <StatsCard
              title="Current Year"
              value={selectedYear1}
              icon={CalendarIcon}
              color={theme.palette.info.main}
            />
          </Grid>
        </Grid>

        {/* Parish Family Overview Section */}
        <StyledPaper sx={{ p: 3, mb: 3 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 3 }}>
            <Box sx={{ display: 'flex', alignItems: 'center' }}>
              <UsersIcon sx={{ fontSize: 24, color: theme.palette.primary.main, mr: 2 }} />
              <Typography variant="h5" sx={{ fontWeight: 700 }}>
                Parish Family Overview
              </Typography>
            </Box>
            <Button
              variant="contained"
              startIcon={<PrinterIcon />}
              onClick={handlePrintParishOverview}
              sx={{ 
                bgcolor: theme.palette.primary.main,
                '&:hover': { bgcolor: theme.palette.primary.dark }
              }}
            >
              Print Overview
            </Button>
             <Button
              variant="contained"
              startIcon={<PrinterIcon />}
              onClick={handlePrintTitheDetails}
              sx={{ 
                bgcolor: theme.palette.warning.main,
                '&:hover': { bgcolor: theme.palette.warning.dark }
              }}
            >
              Print Details
            </Button>
          </Box>

          {/* Filters for Parish Overview */}
          <Box sx={{ mb: 3, p: 2, bgcolor: 'grey.50', borderRadius: 2 }}>
            <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <FilterListIcon sx={{ fontSize: 20 }} />
              Filters
            </Typography>
            <Grid container spacing={2}>
              <Grid item xs={12} sm={6} md={4}>
                <TextField
                  fullWidth
                  label="Search by Name"
                  value={nameFilter}
                  onChange={(e) => setNameFilter(e.target.value)}
                  size="small"
                  InputProps={{
                    startAdornment: <SearchIcon sx={{ fontSize: 20, mr: 1, color: theme.palette.text.secondary }} />
                  }}
                />
              </Grid>
              <Grid item xs={12} sm={6} md={4}>
                <FormControl fullWidth size="small">
                  <InputLabel>Filter by Koottayma</InputLabel>
                  <Select
                    value={selectedKoottaymaFilter}
                    label="Filter by Koottayma"
                    onChange={(e) => setSelectedKoottaymaFilter(e.target.value)}
                  >
                    <MenuItem value="">
                      <em>All Koottaymas</em>
                    </MenuItem>
                    {(safeKoottaymaData || []).map((koottayma) => (
                      <MenuItem key={koottayma?._id || Math.random()} value={koottayma?._id || ''}>
                        {koottayma?.name || 'Unknown'}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>
              <Grid item xs={12} sm={6} md={4}>
                <Button
                  variant="outlined"
                  fullWidth
                  onClick={() => {
                    setNameFilter('');
                    setSelectedKoottaymaFilter('');
                    setHouseNameFilter('');
                    setHeadNameFilter('');
                    setFamilyOldNoFilter('');
                    setFamilyIdNoFilter('');
                  }}
                  startIcon={<FilterXIcon />}
                  size="small"
                >
                  Clear Filters
                </Button>
              </Grid>
            </Grid>
          </Box>

          {/* Detailed Table */}
          <Box sx={{ mt: 4 }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
              <Typography variant="h6">
                Detailed Breakdown
              </Typography>
              <Chip 
                label={`Showing ${filteredAndSortedKoottaymaData?.length || 0} of ${safeKoottaymaData?.length || 0} Koottaymas`}
                color="primary"
                variant="outlined"
              />
            </Box>
            <Box sx={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                <thead>
                  <tr style={{ backgroundColor: theme.palette.grey[100] }}>
                    <th style={{ padding: '12px', textAlign: 'left', border: '1px solid #ddd' }}>Koottayma</th>              
                    <th style={{ padding: '12px', textAlign: 'right', border: '1px solid #ddd' }}>Families</th>
                     <th style={{ padding: '12px', textAlign: 'right', border: '1px solid #ddd' }}>FamiliesParticipated</th>
                    <th style={{ padding: '12px', textAlign: 'right', border: '1px solid #ddd' }}>Amount</th>
                  </tr>
                </thead>
                <tbody>
                  {(filteredAndSortedKoottaymaData || []).map((item, index) => {
                    const consolidated = (consolidatedData || []).find(c => c?._id === item?._id);
                    return (
                      <tr key={index} style={{ '&:hover': { backgroundColor: theme.palette.grey[50] } }}>
                        <td style={{ padding: '12px', border: '1px solid #ddd' }}>{item?.name || 'Unknown'}</td>
                        <td style={{ padding: '12px', textAlign: 'right', border: '1px solid #ddd' }}>{item?.familyCount || 0}</td>
                        <td style={{ padding: '12px', textAlign: 'right', border: '1px solid #ddd' }}>{consolidated?.totalFamiliesParticipated || 0}</td>
                        <td style={{ padding: '12px', textAlign: 'right', border: '1px solid #ddd' }}>
                          ₹{consolidated?.amount?.toLocaleString() || '0'}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </Box>
          </Box>
        </StyledPaper>

        {/* Detailed Tithe Information */}
        <StyledPaper sx={{ p: 3, mb: 3 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 3 }}>
            <Box sx={{ display: 'flex', alignItems: 'center' }}>
              <FileTextIcon sx={{ fontSize: 24, color: theme.palette.warning.main, mr: 2 }} />
              <Typography variant="h5" sx={{ fontWeight: 700 }}>
                Detailed Tithe Information
              </Typography>
            </Box>
           
          </Box>

          {/* Filters for Tithe Information */}
          <Box sx={{ mb: 3, p: 2, bgcolor: 'grey.50', borderRadius: 2 }}>
            <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <FilterListIcon sx={{ fontSize: 20 }} />
              Family Filters
            </Typography>
            <Grid container spacing={2}>
              <Grid item xs={12} sm={6} md={3}>
                <TextField
                  fullWidth
                  label="Search House Name"
                  value={houseNameFilter}
                  onChange={(e) => setHouseNameFilter(e.target.value)}
                  size="small"
                  InputProps={{
                    startAdornment: <SearchIcon sx={{ fontSize: 20, mr: 1, color: theme.palette.text.secondary }} />
                  }}
                />
              </Grid>
              <Grid item xs={12} sm={6} md={3}>
                <TextField
                  fullWidth
                  label="Search Head Name"
                  value={headNameFilter}
                  onChange={(e) => setHeadNameFilter(e.target.value)}
                  size="small"
                  InputProps={{
                    startAdornment: <SearchIcon sx={{ fontSize: 20, mr: 1, color: theme.palette.text.secondary }} />
                  }}
                />
              </Grid>
              <Grid item xs={12} sm={6} md={2}>
                <TextField
                  fullWidth
                  label="Family Old No"
                  value={familyOldNoFilter}
                  onChange={(e) => setFamilyOldNoFilter(e.target.value)}
                  size="small"
                  InputProps={{
                    startAdornment: <SearchIcon sx={{ fontSize: 20, mr: 1, color: theme.palette.text.secondary }} />
                  }}
                />
              </Grid>
              <Grid item xs={12} sm={6} md={2}>
                <TextField
                  fullWidth
                  label="Family ID No"
                  value={familyIdNoFilter}
                  onChange={(e) => setFamilyIdNoFilter(e.target.value)}
                  size="small"
                  InputProps={{
                    startAdornment: <SearchIcon sx={{ fontSize: 20, mr: 1, color: theme.palette.text.secondary }} />
                  }}
                />
              </Grid>
              <Grid item xs={12} sm={6} md={2}>
                <Button
                  variant="outlined"
                  fullWidth
                  onClick={() => {
                    setHouseNameFilter('');
                    setHeadNameFilter('');
                    setSelectedKoottaymaFilter('');
                    setNameFilter('');
                    setFamilyOldNoFilter('');
                    setFamilyIdNoFilter('');
                  }}
                  startIcon={<FilterXIcon />}
                  size="small"
                >
                  Clear Filters
                </Button>
              </Grid>
            </Grid>
          </Box>

          {(filteredTitheData || []).map((koottayma, index) => (
            <Box key={index} sx={{ mb: 4 }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                <Typography variant="h6" sx={{ fontWeight: 600 }}>
                  KOOTTAYMA - {koottayma?.name || 'Unknown'}
                </Typography>
                <Chip 
                  label={`${(koottayma?.families || []).length} families`}
                  color="secondary"
                  size="small"
                />
              </Box>
              <Box sx={{ overflowX: 'auto' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                  <thead>
                    <tr style={{ backgroundColor: theme.palette.grey[100] }}>
                      <th style={{ padding: '12px', textAlign: 'left', border: '1px solid #ddd' }}>House Name</th>
                      <th style={{ padding: '12px', textAlign: 'left', border: '1px solid #ddd' }}>Head Name</th>
                      <th style={{ padding: '12px', textAlign: 'center', border: '1px solid #ddd' }}>Family Old No</th>
                      <th style={{ padding: '12px', textAlign: 'center', border: '1px solid #ddd' }}>Family ID No</th>
                      <th style={{ padding: '12px', textAlign: 'right', border: '1px solid #ddd' }}>Amount</th>
                    </tr>
                  </thead>
                  <tbody>
                    {(koottayma?.families || []).map((family, fIndex) => (
                      <tr key={fIndex}>
                        <td style={{ padding: '12px', border: '1px solid #ddd' }}>{family?.houseName || 'N/A'}</td>
                        <td style={{ padding: '12px', border: '1px solid #ddd' }}>{family?.headName || 'N/A'}</td>
                        <td style={{ padding: '12px', textAlign: 'center', border: '1px solid #ddd' }}>{family?.familyNumber || 'N/A'}</td>
                        <td style={{ padding: '12px', textAlign: 'center', border: '1px solid #ddd' }}>{family?.familyId || 'N/A'}</td>
                        <td style={{ padding: '12px', textAlign: 'right', border: '1px solid #ddd' }}>
                          ₹{family?.totalAmount?.toLocaleString() || '0'}
                        </td>
                      </tr>
                    ))}
                    <tr style={{ backgroundColor: theme.palette.grey[100], fontWeight: 600 }}>
                      <td colSpan={4} style={{ padding: '12px', textAlign: 'right', border: '1px solid #ddd' }}>Total:</td>
                      <td style={{ padding: '12px', textAlign: 'right', border: '1px solid #ddd' }}>
                        ₹{koottayma?.totalAmount?.toLocaleString() || '0'}
                      </td>
                    </tr>
                  </tbody>
                </table>
              </Box>
            </Box>
          ))}

          {(filteredTitheData || []).length === 0 && (
            <Box sx={{ textAlign: 'center', py: 4 }}>
              <Typography variant="h6" color="text.secondary">
                No families found matching the current filters
              </Typography>
              <Button
                variant="outlined"
                onClick={() => {
                  setHouseNameFilter('');
                  setHeadNameFilter('');
                  setSelectedKoottaymaFilter('');
                  setFamilyOldNoFilter('');
                  setFamilyIdNoFilter('');
                }}
                sx={{ mt: 2 }}
              >
                Clear Filters
              </Button>
            </Box>
          )}
        </StyledPaper>
      </Box>
    </ThemeProvider>
  );
};

export default ComprehensiveReportsDashboard;