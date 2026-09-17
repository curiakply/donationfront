import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Button,
  Card,
  CircularProgress,
  ThemeProvider,
  createTheme,
  CssBaseline,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Alert,
  Snackbar,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Tab,
  Tabs
} from '@mui/material';
import { styled } from '@mui/material/styles';
import { AccountBalance, SwapHoriz } from '@mui/icons-material';
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

const YearEndTransfer = () => {
  const [activeTab, setActiveTab] = useState(0);
  const [entities, setEntities] = useState([]);
  const [loading, setLoading] = useState(true);
  const [transferring, setTransferring] = useState(false);
  const [message, setMessage] = useState(null);
  const [confirmDialog, setConfirmDialog] = useState(false);
  const { selectedYear1: currentYear } = useFinancialYear();
  const nextYear = currentYear + 1;

  const entityTypes = ['community', 'parish', 'project'];

  useEffect(() => {
    fetchData();
  }, [activeTab, currentYear]);

  const fetchData = async () => {
    try {
      setLoading(true);
      const entityType = entityTypes[activeTab];
      const entityEndpoint = entityType === 'project' ? 'fund' : entityType;
      
      const [currentYearRes, entitiesRes] = await Promise.all([
        axiosInstance.get(`/balance/${entityType}/all/${currentYear}`),
        axiosInstance.get(`/${entityEndpoint}/`)
      ]);

      const mergedData = entitiesRes.data.map(entity => {
        const currentYearBalance = currentYearRes.data.find(
          balance => balance.entity_id === entity._id
        ) || {
          opening_balance: 0,
          allocated_amount: 0,
          total_transactions: 0
        };

        const closingBalance = 
          currentYearBalance.opening_balance + 
          currentYearBalance.allocated_amount - 
          currentYearBalance.total_transactions;

        return {
          _id: entity._id,
          name: entity.name,
          opening_balance: currentYearBalance.opening_balance,
          allocated_amount: currentYearBalance.allocated_amount,
          total_transactions: currentYearBalance.total_transactions,
          closing_balance: closingBalance
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

  const handleTransfer = async () => {
    try {
      setTransferring(true);
      const entityType = entityTypes[activeTab];

      const updates = entities.map(entity => ({
        entity_type: entityType,
        entity_id: entity._id,
        year: nextYear,
        opening_balance: entity.closing_balance,
        allocated_amount: 0,
        total_transactions: 0
      }));

      await axiosInstance.post('/balance/batch-update', {
        balances: updates
      });

      setMessage({ type: 'success', text: 'Balances transferred successfully' });
      setConfirmDialog(false);
      await fetchData();
    } catch (error) {
      setMessage({ type: 'error', text: 'Failed to transfer balances' });
    } finally {
      setTransferring(false);
    }
  };

  const totalClosingBalance = entities.reduce((sum, e) => sum + e.closing_balance, 0);

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Box sx={{ p: 3, bgcolor: 'background.default', minHeight: '100vh' }}>
        <StyledCard sx={{ p: 3 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 3 }}>
            <AccountBalance sx={{ fontSize: 32, color: 'primary.main' }} />
            <Typography variant="h5" fontWeight="bold">
              Year End Balance Transfer
            </Typography>
          </Box>

          <Box sx={{ mb: 3 }}>
            <Typography variant="h6" gutterBottom>
              Transfer closing balances from {currentYear} to {nextYear} opening balances
            </Typography>
            
            <Tabs 
              value={activeTab} 
              onChange={(_, newValue) => setActiveTab(newValue)}
              sx={{ mb: 3 }}
            >
              <Tab label="Communities" />
              <Tab label="Parishes" />
              <Tab label="Other Projects" />
            </Tabs>

            <Button
              variant="contained"
              color="primary"
              startIcon={<SwapHoriz />}
              onClick={() => setConfirmDialog(true)}
              sx={{ mb: 2 }}
            >
              Transfer Balances to Next Year
            </Button>
          </Box>

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
                    <StyledTableCell align="right">Current Opening Balance</StyledTableCell>
                    <StyledTableCell align="right">Allocated Amount</StyledTableCell>
                    <StyledTableCell align="right">Total Transactions</StyledTableCell>
                    <StyledTableCell align="right">Closing Balance (Transfer Amount)</StyledTableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {entities.map((entity) => (
                    <StyledTableRow key={entity._id}>
                      <TableCell>{entity.name}</TableCell>
                      <TableCell align="right">
                        ₹{entity.opening_balance.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                      </TableCell>
                      <TableCell align="right">
                        ₹{entity.allocated_amount.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                      </TableCell>
                      <TableCell align="right">
                        ₹{entity.total_transactions.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                      </TableCell>
                      <TableCell 
                        align="right"
                        sx={{ color: entity.closing_balance < 0 ? 'error.main' : 'success.main' }}
                      >
                        ₹{entity.closing_balance.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                      </TableCell>
                    </StyledTableRow>
                  ))}
                  <TableRow sx={{ backgroundColor: theme.palette.primary.light + '10' }}>
                    <TableCell>
                      <Typography fontWeight="bold" color="primary">
                        Total ({entities.length} items)
                      </Typography>
                    </TableCell>
                    <TableCell align="right">
                      <Typography fontWeight="bold" color="primary">
                        ₹{entities.reduce((sum, e) => sum + e.opening_balance, 0)
                            .toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                      </Typography>
                    </TableCell>
                    <TableCell align="right">
                      <Typography fontWeight="bold" color="primary">
                        ₹{entities.reduce((sum, e) => sum + e.allocated_amount, 0)
                            .toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                      </Typography>
                    </TableCell>
                    <TableCell align="right">
                      <Typography fontWeight="bold" color="primary">
                        ₹{entities.reduce((sum, e) => sum + e.total_transactions, 0)
                            .toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                      </Typography>
                    </TableCell>
                    <TableCell align="right">
                      <Typography 
                        fontWeight="bold" 
                        color={totalClosingBalance < 0 ? 'error.main' : 'success.main'}
                      >
                        ₹{totalClosingBalance.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                      </Typography>
                    </TableCell>
                  </TableRow>
                </TableBody>
              </Table>
            </TableContainer>
          )}
        </StyledCard>

        <Dialog
          open={confirmDialog}
          onClose={() => setConfirmDialog(false)}
          maxWidth="sm"
          fullWidth
        >
          <DialogTitle>
            Confirm Year End Transfer
          </DialogTitle>
          <DialogContent>
            <Typography>
              Are you sure you want to transfer the closing balances from {currentYear} to {nextYear}?
              This will:
            </Typography>
            <Box component="ul" sx={{ mt: 2 }}>
              <li>Set the opening balances for {nextYear}</li>
              <li>Initialize allocated amounts and transactions to 0</li>
              <li>This action cannot be undone</li>
            </Box>
          </DialogContent>
          <DialogActions>
            <Button 
              onClick={() => setConfirmDialog(false)}
              disabled={transferring}
            >
              Cancel
            </Button>
            <Button 
              onClick={handleTransfer}
              variant="contained"
              color="primary"
              disabled={transferring}
              startIcon={transferring ? <CircularProgress size={20} /> : <SwapHoriz />}
            >
              {transferring ? 'Transferring...' : 'Confirm Transfer'}
            </Button>
          </DialogActions>
        </Dialog>

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

export default YearEndTransfer;