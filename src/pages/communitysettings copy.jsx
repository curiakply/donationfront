import React, { useState, useEffect } from "react";
import { MaterialReactTable } from 'material-react-table';
import { FaPeopleRoof } from "react-icons/fa6";
import { InputNumber } from "antd";
import axiosInstance from "../axiosConfig";
import { useFinancialYear } from './FinancialYearContext';
import { jsPDF } from "jspdf";
import autoTable from 'jspdf-autotable';
import { 
  Box, 
  Typography,
  Button,
  Grid,
  Card,
  CircularProgress,
  ThemeProvider,
  createTheme,
  CssBaseline,
  Tooltip,
  IconButton,
  Alert,
  Snackbar,
  Avatar
} from '@mui/material';
import { styled } from '@mui/material/styles';
import { FileDownload as FileDownloadIcon, Refresh as RefreshIcon } from '@mui/icons-material';

const theme = createTheme({
  palette: {
    mode: 'light',
    primary: {
      main: '#2563EB',
      light: '#3B82F6',
      dark: '#1E40AF'
    },
    background: {
      default: '#F3F4F6',
      paper: '#FFFFFF'
    }
  },
  typography: {
    fontFamily: 'Inter, system-ui, -apple-system, sans-serif',
  }
});

const StyledCard = styled(Card)(({ theme }) => ({
  borderRadius: 12,
  boxShadow: '0 4px 6px rgba(0,0,0,0.1)',
  transition: 'all 0.3s ease',
  '&:hover': {
    transform: 'translateY(-5px)',
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

const CommunitySettings = () => {
  const { selectedYear1: currentYear } = useFinancialYear();
  const [communities, setCommunities] = useState([]);
  const [hasChanges, setHasChanges] = useState(false);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState(null);
  const [lastYearData, setLastYearData] = useState({});
  const [originalData, setOriginalData] = useState([]);
  
  const lastYear = currentYear - 1;
  const totalAmount = 5500;

  useEffect(() => {
    fetchInitialData();
  }, [currentYear]);

  const fetchInitialData = async () => {
    try {
      setLoading(true);
      const [communitiesResponse, currentSettingsResponse, lastYearSettingsResponse] = await Promise.all([
        axiosInstance.get("/community/"),
        axiosInstance.get(`/community-settings/year/${currentYear}`),
        axiosInstance.get(`/community-settings/year/${lastYear}`)
      ]);

      const mergedData = communitiesResponse.data.map(community => {
        const currentSetting = currentSettingsResponse.data.settings?.find(s => s.community_id === community._id);
        const lastYearAmount = lastYearSettingsResponse.data.settings?.find(s => s.community_id === community._id)?.allocated_amount || 0;

        return {
          ...community,
          percent: currentSetting?.percentage || 0,
          amountAllocated: currentSetting?.allocated_amount || 0,
          lastYearAmount,
          balanceAfterAllocation: 0
        };
      });

      const communitiesWithBalances = updateBalances(mergedData);
      setOriginalData(JSON.parse(JSON.stringify(communitiesWithBalances)));
      setCommunities(communitiesWithBalances);
      setHasChanges(false);

      setLastYearData({
        totalAmount: lastYearSettingsResponse.data.total_amount || 0,
        totalAllocated: lastYearSettingsResponse.data.settings?.reduce((sum, setting) => sum + (setting.allocated_amount || 0), 0) || 0
      });

      setMessage({ type: 'success', text: 'Data loaded successfully' });
    } catch (error) {
      setMessage({ type: 'error', text: 'Failed to fetch data' });
    } finally {
      setLoading(false);
    }
  };

  const handleExportData = () => {
    const doc = new jsPDF();
    const tableData = communities.map((community) => [
      community.name,
      `${community.percent}%`,
      community.amountAllocated.toFixed(2),
      community.lastYearAmount.toFixed(2),
      community.balanceAfterAllocation.toFixed(2)
    ]);
    
    autoTable(doc, {
      head: [['Community', 'Percentage', 'Allocated', 'Last Year', 'Balance']],
      body: tableData,
      styles: { fontSize: 8 },
      headStyles: { fillColor: [37, 99, 235] },
      startY: 20,
    });
    
    doc.text('Community Settings Report', 14, 15);
    doc.save('community-settings.pdf');
  };

  const updateBalances = (updatedCommunities) => {
    let runningTotal = 0;
    return updatedCommunities.map(community => {
      runningTotal += Number(community.amountAllocated || 0);
      return {
        ...community,
        balanceAfterAllocation: Number((totalAmount - runningTotal).toFixed(2))
      };
    });
  };

  const handlePercentageChange = (index, newPercentage) => {
    if (newPercentage === null) return;

    setCommunities(prev => {
      const updated = prev.map((community, i) => {
        if (i === index) {
          const updatedAmount = Number(((totalAmount * newPercentage) / 100).toFixed(2));
          return {
            ...community,
            percent: newPercentage,
            amountAllocated: updatedAmount
          };
        }
        return community;
      });
      const withBalances = updateBalances(updated);
      setHasChanges(true);
      return withBalances;
    });
  };

  const handleSave = async () => {
    try {
      setLoading(true);
      const formattedData = communities.map(community => ({
        community_id: community._id,
        community_name: community.name,
        percentage: Number(community.percent.toFixed(2)),
        allocated_amount: Number(community.amountAllocated.toFixed(2)),
        year: currentYear
      }));

      await axiosInstance.post("/community-settings/", {
        settings: formattedData,
        total_amount: totalAmount,
        year: currentYear
      });

      setMessage({ type: 'success', text: 'Settings saved successfully' });
      setHasChanges(false);
      await fetchInitialData();
    } catch (error) {
      setMessage({ type: 'error', text: 'Failed to save settings' });
    } finally {
      setLoading(false);
    }
  };

  const columns = [
    {
      accessorKey: 'name',
      header: 'Community',
      size: 200,
      Cell: ({ row }) => (
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          <Avatar sx={{ bgcolor: theme.palette.primary.main }}>
            {row.original.name.charAt(0)}
          </Avatar>
          <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>
            {row.original.name}
          </Typography>
        </Box>
      ),
    },
    {
      accessorKey: 'percent',
      header: 'Percentage (%)',
      size: 150,
      Cell: ({ row, index }) => (
        <InputNumber
          min={0}
          max={100}
          value={row.original.percent}
          onChange={(value) => handlePercentageChange(index, value)}
          precision={2}
          style={{ width: '100%' }}
          addonAfter="%"
        />
      ),
    },
    {
      accessorKey: 'amountAllocated',
      header: 'Allocated Amount',
      size: 150,
      Cell: ({ cell }) => (
        <Typography>
          ₹{cell.getValue().toLocaleString('en-IN', { minimumFractionDigits: 2 })}
        </Typography>
      ),
    },
    {
      accessorKey: 'lastYearAmount',
      header: 'Last Year',
      size: 150,
      Cell: ({ cell }) => (
        <Typography>
          ₹{cell.getValue().toLocaleString('en-IN', { minimumFractionDigits: 2 })}
        </Typography>
      ),
    },
    {
      accessorKey: 'balanceAfterAllocation',
      header: 'Balance',
      size: 150,
      Cell: ({ cell }) => (
        <Typography color={cell.getValue() < 0 ? 'error.main' : 'inherit'}>
          ₹{cell.getValue().toLocaleString('en-IN', { minimumFractionDigits: 2 })}
        </Typography>
      ),
    }
  ];

  const totalAllocated = communities.reduce((sum, community) => sum + Number(community.amountAllocated || 0), 0);
  const totalPercentage = communities.reduce((sum, community) => sum + Number(community.percent || 0), 0);
  const remainingBalance = totalAmount - totalAllocated;

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Box sx={{ 
        p: 3, 
        bgcolor: 'background.default', 
        minHeight: '100vh',
        background: 'linear-gradient(135deg, rgb(255, 255, 255) 0%, rgb(255, 255, 255) 100%)'
      }}>
        <StyledCard sx={{ p: 3, mb: 3 }}>
          <Box sx={{ 
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center'
          }}>
            <Box>
              <Box display="flex" alignItems="center" gap={2} mb={1}>
                <FaPeopleRoof style={{ fontSize: 32, color: theme.palette.primary.main }} />
                <Typography variant="h5" sx={{ fontWeight: 700 }}>
                  Community Settings
                </Typography>
              </Box>
              <Typography variant="body2" color="text.secondary">
                Manage community allocations and budgets
              </Typography>
            </Box>
            <Box sx={{ display: 'flex', gap: 2 }}>
              <Tooltip title="Refresh Data">
                <IconButton
                  onClick={fetchInitialData}
                  sx={{
                    bgcolor: theme.palette.primary.light + '20',
                    '&:hover': { bgcolor: theme.palette.primary.light + '30' }
                  }}
                >
                  <RefreshIcon sx={{ color: theme.palette.primary.main }} />
                </IconButton>
              </Tooltip>
              <Button
                variant="outlined"
                onClick={handleExportData}
                startIcon={<FileDownloadIcon />}
                sx={{ borderRadius: 2 }}
              >
                Export Data
              </Button>
            </Box>
          </Box>
        </StyledCard>

        <Grid container spacing={3} sx={{ mb: 3 }}>
          <Grid item xs={12} md={4}>
            <StyledCard>
              <Box p={3}>
                <Typography variant="h6" color="text.secondary" gutterBottom>
                  Total Available
                </Typography>
                <Typography variant="h4" fontWeight="bold">
                  ₹{totalAmount.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                </Typography>
              </Box>
            </StyledCard>
          </Grid>
          <Grid item xs={12} md={4}>
            <StyledCard>
              <Box p={3}>
                <Typography variant="h6" color="text.secondary" gutterBottom>
                  Remaining Balance
                </Typography>
                <Typography 
                  variant="h4" 
                  fontWeight="bold"
                  color={remainingBalance < 0 ? 'error.main' : 'inherit'}
                >
                  ₹{remainingBalance.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                </Typography>
              </Box>
            </StyledCard>
          </Grid>
          <Grid item xs={12} md={4}>
            <StyledCard>
              <Box p={3}>
                <Typography variant="h6" color="text.secondary" gutterBottom>
                  Total Percentage
                </Typography>
                <Typography 
                  variant="h4" 
                  fontWeight="bold"
                  color={totalPercentage > 100 ? 'error.main' : 'inherit'}
                >
                  {totalPercentage.toFixed(2)}%
                </Typography>
              </Box>
            </StyledCard>
          </Grid>
        </Grid>

        {hasChanges && (
          <Box mb={3}>
            <GradientButton
              fullWidth
              onClick={handleSave}
              disabled={remainingBalance < 0 || totalPercentage > 100}
            >
              Save Changes
            </GradientButton>
          </Box>
        )}

        <StyledCard>
          <MaterialReactTable
            columns={columns}
            data={communities}
            enableColumnFiltering
            enableGlobalFilter
            enableColumnOrdering
            enablePagination
            enableSorting
            state={{ isLoading: loading }}
            muiTablePaperProps={{
              elevation: 0,
              sx: {
                borderRadius: '12px',
                border: 'none',
                backgroundColor: '#ffffff',
              },
            }}
            muiTableProps={{
              sx: {
                '& .MuiTableCell-root': {
                  borderBottom: '1px solid',
                  borderColor: 'divider',
                  backgroundColor: '#ffffff',
                },
              },
            }}
            muiTableBodyProps={{
              sx: {
                '& .MuiTableRow-root': {
                  backgroundColor: '#ffffff',
                },
              },
            }}
            muiTableHeadProps={{
              sx: {
                '& .MuiTableRow-root': {
                  backgroundColor: '#ffffff',
                },
              },
            }}
          />
        </StyledCard>

        <Snackbar
          open={Boolean(message)}
          autoHideDuration={6000}
          onClose={() => setMessage(null)}
          anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
        >
          <Alert 
            onClose={() => setMessage(null)} 
            severity={message?.type || 'info'}
            variant="filled"
            sx={{ 
              borderRadius: '8px',
              backgroundColor: message?.type === 'error' 
                ? theme.palette.error.main 
                : theme.palette.primary.main,
            }}
          >
            {message?.text}
          </Alert>
        </Snackbar>

        {/* Year Over Year Comparison */}
        <Box mt={4}>
          <Typography variant="h6" gutterBottom fontWeight="bold">
            Year Over Year Comparison
          </Typography>
          <StyledCard>
            <MaterialReactTable
              columns={[
                {
                  accessorKey: 'name',
                  header: 'Community',
                  Cell: ({ row }) => (
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                      <Avatar sx={{ bgcolor: theme.palette.primary.main }}>
                        {row.original.name.charAt(0)}
                      </Avatar>
                      <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>
                        {row.original.name}
                      </Typography>
                    </Box>
                  ),
                },
                {
                  accessorFn: row => row.amountAllocated,
                  header: 'Current Year',
                  Cell: ({ cell }) => (
                    <Typography>
                      ₹{cell.getValue().toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                    </Typography>
                  ),
                },
                {
                  accessorFn: row => row.lastYearAmount,
                  header: 'Last Year',
                  Cell: ({ cell }) => (
                    <Typography>
                      ₹{cell.getValue().toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                    </Typography>
                  ),
                },
                {
                  accessorFn: row => row.amountAllocated - row.lastYearAmount,
                  header: 'Difference',
                  Cell: ({ cell }) => (
                    <Typography color={cell.getValue() < 0 ? 'error.main' : 'success.main'}>
                      ₹{cell.getValue().toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                    </Typography>
                  ),
                },
                {
                  accessorFn: row => row.lastYearAmount ? ((row.amountAllocated - row.lastYearAmount) / row.lastYearAmount) * 100 : 0,
                  header: 'Change (%)',
                  Cell: ({ cell }) => (
                    <Typography color={cell.getValue() < 0 ? 'error.main' : 'success.main'}>
                      {cell.getValue().toFixed(2)}%
                    </Typography>
                  ),
                }
              ]}
              data={communities}
              enableColumnFiltering={false}
              enableGlobalFilter={false}
              enableColumnOrdering={false}
              enablePagination={false}
              enableSorting={false}
              muiTablePaperProps={{
                elevation: 0,
                sx: {
                  borderRadius: '12px',
                  border: 'none',
                  backgroundColor: '#ffffff',
                },
              }}
              muiTableProps={{
                sx: {
                  '& .MuiTableCell-root': {
                    borderBottom: '1px solid',
                    borderColor: 'divider',
                    backgroundColor: '#ffffff',
                  },
                },
              }}
              muiTableBodyProps={{
                sx: {
                  '& .MuiTableRow-root': {
                    backgroundColor: '#ffffff',
                  },
                },
              }}
              muiTableHeadProps={{
                sx: {
                  '& .MuiTableRow-root': {
                    backgroundColor: '#ffffff',
                  },
                },
              }}
            />
          </StyledCard>
        </Box>
      </Box>
    </ThemeProvider>
  );
};

export default CommunitySettings;