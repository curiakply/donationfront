import React, { useState, useEffect } from 'react';
import { InputNumber } from "antd";
import {
  Box,
  Typography,
  Button,
  Card,
  CircularProgress,
  ThemeProvider,
  createTheme,
  CssBaseline,
  Tabs,
  Tab,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Alert,
  Snackbar,
  TextField,
  InputAdornment,
} from '@mui/material';
import { styled } from '@mui/material/styles';
import { SaveAlt, AccountBalance, Search } from '@mui/icons-material';
import { useFinancialYear } from './FinancialYearContext';
import axiosInstance from "../axiosConfig";

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
    }
  }
});

const StyledCard = styled(Card)(({ theme }) => ({
  borderRadius: 12,
  boxShadow: '0 4px 6px rgba(0,0,0,0.1)',
  marginBottom: theme.spacing(3)
}));

const StyledTableCell = styled(TableCell)(({ theme }) => ({
  '&.MuiTableCell-head': {
    backgroundColor: theme.palette.primary.main,
    color: theme.palette.common.white,
    fontWeight: 'bold'
  }
}));

const StyledTableRow = styled(TableRow)(({ theme }) => ({
  '&:nth-of-type(odd)': {
    backgroundColor: theme.palette.action.hover,
  }
}));

const OpeningBalance = () => {
  const [activeTab, setActiveTab] = useState(0);
  const [entities, setEntities] = useState([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState(null);
  const [hasChanges, setHasChanges] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const { selectedYear1: currentYear } = useFinancialYear();
  const lastYear = currentYear - 1;

  const entityTypes = ['community', 'parish', 'project'];

  useEffect(() => {
    fetchData();
  }, [activeTab, currentYear]);

  const fetchData = async () => {
    try {
      setLoading(true);
      const entityType = entityTypes[activeTab];
      const entityEndpoint = entityType === 'project' ? 'fund' : entityType;
      
      const [currentYearRes, lastYearRes, entitiesRes] = await Promise.all([
        axiosInstance.get(`/balance/${entityType}/all/${currentYear}`),
        axiosInstance.get(`/balance/${entityType}/all/${lastYear}`),
        axiosInstance.get(`/${entityEndpoint}/`)
      ]);

      const lastYearBalances = new Map(
        lastYearRes.data.map(balance => [
          balance.entity_id,
          balance
        ])
      );

      const mergedData = entitiesRes.data.map(entity => {
        const currentYearBalance = currentYearRes.data.find(
          balance => balance.entity_id === entity._id
        ) || {
          opening_balance: 0,
          allocated_amount: 0,
          total_transactions: 0
        };

        const lastYearBalance = lastYearBalances.get(entity._id) || {
          opening_balance: 0,
          allocated_amount: 0,
          total_transactions: 0
        };

        const lastYearClosingBalance = 
          lastYearBalance.opening_balance + 
          lastYearBalance.allocated_amount - 
          lastYearBalance.total_transactions;

        return {
          _id: entity._id,
          name: entity.name,
          opening_balance: currentYearBalance.opening_balance,
          last_year_closing: lastYearClosingBalance,
          allocated_amount: currentYearBalance.allocated_amount,
          total_transactions: currentYearBalance.total_transactions
        };
      });

      setEntities(mergedData);
    } catch (error) {
      console.error("Error fetching data:", error);
      setMessage({ type: 'error', text: 'Failed to fetch data' });
    } finally {
      setLoading(false);
    }
  };

  const handleOpeningBalanceChange = (id, newValue) => {
    if (newValue === null) return;
    
    setEntities(prev => {
      const updated = prev.map(entity => {
        if (entity._id === id) {
          return {
            ...entity,
            opening_balance: newValue
          };
        }
        return entity;
      });
      return updated;
    });
    setHasChanges(true);
  };

  const handleSave = async () => {
    try {
      setLoading(true);
      const entityType = entityTypes[activeTab];

      const updates = entities.map(entity => ({
        entity_type: entityType,
        entity_id: entity._id,
        year: currentYear,
        opening_balance: entity.opening_balance,
        allocated_amount: entity.allocated_amount,
        total_transactions: entity.total_transactions
      }));

      await axiosInstance.post('/balance/batch-update', {
        balances: updates
      });

      setMessage({ type: 'success', text: 'Opening balances updated successfully' });
      setHasChanges(false);
      await fetchData();
    } catch (error) {
      setMessage({ type: 'error', text: 'Failed to update opening balances' });
    } finally {
      setLoading(false);
    }
  };

  const filteredEntities = entities.filter(entity =>
    entity.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const totalOpeningBalance = filteredEntities.reduce((sum, e) => sum + e.opening_balance, 0);
  const totalLastYearClosing = filteredEntities.reduce((sum, e) => sum + e.last_year_closing, 0);

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Box sx={{ p: 3, bgcolor: 'background.default', minHeight: '100vh' }}>
        <StyledCard sx={{ p: 3 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 3 }}>
            <AccountBalance sx={{ fontSize: 32, color: 'primary.main' }} />
            <Typography variant="h5" fontWeight="bold">
              Opening Balance Management
            </Typography>
          </Box>

          <Box sx={{ mb: 3 }}>
            <Tabs 
              value={activeTab} 
              onChange={(_, newValue) => setActiveTab(newValue)}
              sx={{ mb: 2 }}
            >
              <Tab label="Communities" />
              <Tab label="Parishes" />
              <Tab label="Other Projects" />
            </Tabs>

            <TextField
              fullWidth
              variant="outlined"
              placeholder="Search by name..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <Search />
                  </InputAdornment>
                ),
              }}
              size="small"
              sx={{ mb: 2 }}
            />
          </Box>

          {hasChanges && (
            <Button
              fullWidth
              variant="contained"
              onClick={handleSave}
              startIcon={<SaveAlt />}
              sx={{ mb: 3 }}
            >
              Save Changes
            </Button>
          )}

          {loading ? (
            <Box display="flex" justifyContent="center" p={4}>
              <CircularProgress />
            </Box>
          ) : (
            <TableContainer>
              <Table>
                <TableHead>
                  <TableRow>
                    <StyledTableCell>Name</StyledTableCell>
                    <StyledTableCell align="right">Previous Year Closing Balance</StyledTableCell>
                    <StyledTableCell align="right">Opening Balance</StyledTableCell>
                    <StyledTableCell align="right">Allocated Amount</StyledTableCell>
                    <StyledTableCell align="right">Total Transactions</StyledTableCell>
                    <StyledTableCell align="right">Current Balance</StyledTableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {filteredEntities.map((entity) => {
                    const currentBalance = 
                      entity.opening_balance + 
                      entity.allocated_amount - 
                      entity.total_transactions;

                    return (
                      <StyledTableRow key={entity._id}>
                        <TableCell>{entity.name}</TableCell>
                        <TableCell align="right">
                          ₹{entity.last_year_closing.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                        </TableCell>
                        <TableCell align="right">
                          <InputNumber
                            value={entity.opening_balance}
                            onChange={(value) => handleOpeningBalanceChange(entity._id, value)}
                            style={{ width: '100%' }}
                            formatter={(value) => `₹ ${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
                            precision={2}
                          />
                        </TableCell>
                        <TableCell align="right">
                          ₹{entity.allocated_amount.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                        </TableCell>
                        <TableCell align="right">
                          ₹{entity.total_transactions.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                        </TableCell>
                        <TableCell 
                          align="right"
                          sx={{ color: currentBalance < 0 ? 'error.main' : 'success.main' }}
                        >
                          ₹{currentBalance.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                        </TableCell>
                      </StyledTableRow>
                    );
                  })}
                  <TableRow sx={{ backgroundColor: theme.palette.primary.light + '10' }}>
                    <TableCell>
                      <Typography fontWeight="bold" color="primary">
                        Total ({filteredEntities.length} items)
                      </Typography>
                    </TableCell>
                    <TableCell align="right">
                      <Typography fontWeight="bold" color="primary">
                        ₹{totalLastYearClosing.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                      </Typography>
                    </TableCell>
                    <TableCell align="right">
                      <Typography fontWeight="bold" color="primary">
                        ₹{totalOpeningBalance.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                      </Typography>
                    </TableCell>
                    <TableCell align="right">
                      <Typography fontWeight="bold" color="primary">
                        ₹{filteredEntities.reduce((sum, e) => sum + e.allocated_amount, 0).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                      </Typography>
                    </TableCell>
                    <TableCell align="right">
                      <Typography fontWeight="bold" color="primary">
                        ₹{filteredEntities.reduce((sum, e) => sum + e.total_transactions, 0).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                      </Typography>
                    </TableCell>
                    <TableCell align="right">
                      <Typography fontWeight="bold" color="primary">
                        ₹{filteredEntities.reduce((sum, e) => sum + (e.opening_balance + e.allocated_amount - e.total_transactions), 0)
                            .toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                      </Typography>
                    </TableCell>
                  </TableRow>
                </TableBody>
              </Table>
            </TableContainer>
          )}
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
          >
            {message?.text}
          </Alert>
        </Snackbar>
      </Box>
    </ThemeProvider>
  );
};

export default OpeningBalance;