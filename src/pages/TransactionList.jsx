import React, { useState, useEffect } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TablePagination,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions,
  FormControl,
  RadioGroup,
  Radio,
  FormControlLabel,
} from '@mui/material';
import { Delete as DeleteIcon, Print as PrintIcon } from '@mui/icons-material';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import axiosInstance from '../axiosConfig';
import dayjs from 'dayjs';

const TransactionList = () => {
  // State for transactions and pagination
  const [transactions, setTransactions] = useState([]);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(false);

  // State for delete confirmation dialog
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [selectedTransaction, setSelectedTransaction] = useState(null);

  // Filters state
  const [filters, setFilters] = useState({
    type: '',
    startDate: null,
    endDate: null
  });

  // Fetch transactions
  const fetchTransactions = async () => {
    try {
      setLoading(true);
  
      // Prepare request body
      const requestData = {
        page: page + 1,
        limit: rowsPerPage,
        ...(filters.type && { type: filters.type }),
        ...(filters.startDate && { startDate: dayjs(filters.startDate).format('YYYY-MM-DD') }),
        ...(filters.endDate && { endDate: dayjs(filters.endDate).format('YYYY-MM-DD') })
      };
  
      const response = await axiosInstance.get('/transactionRoutes/gettransactions', { params: requestData });
  
      if (response.data.success) {
        setTransactions(response.data.data || []);
        setTotal(response.data.pagination?.total || 0);
      } else {
        console.error('Failed to fetch transactions:', response.data.message);
      }
    } catch (error) {
      console.error('Fetch error:', error);
    } finally {
      setLoading(false);
    }
  };

  // UseEffect to fetch transactions
  useEffect(() => {
    fetchTransactions();
  }, [page, rowsPerPage, filters]);

  // Handle transaction deletion
  const handleDeleteTransaction = async () => {
    if (!selectedTransaction) return;

    try {
      const response = await axiosInstance.delete(`/transactionRoutes/transactions/${selectedTransaction._id}`);
      
      if (response.data.success) {
        // Remove the deleted transaction from the list
        setTransactions(prevTransactions => 
          prevTransactions.filter(t => t._id !== selectedTransaction._id)
        );
        
        // Close delete dialog
        setDeleteDialogOpen(false);
        
        // Optional: Show success message
        // You might want to add a snackbar or toast notification
      } else {
        console.error('Failed to delete transaction:', response.data.message);
        // Optional: Show error message
      }
    } catch (error) {
      console.error('Error deleting transaction:', error);
      // Optional: Show error message
    }
  };

  // Handle print transaction
  const handlePrintTransaction = (transaction) => {
    // Implement print logic
    // This could open a print-friendly view or generate a PDF
    console.log('Printing transaction:', transaction);
    
    // Example: You might want to use window.print() or a PDF generation library
    // Or open a new window with a printable version of the transaction
    const printWindow = window.open('', '_blank');
    printWindow.document.write(`
      <html>
        <head>
          <title>Transaction Details</title>
          <style>
            body { font-family: Arial, sans-serif; }
            .transaction-details { max-width: 600px; margin: 0 auto; }
          </style>
        </head>
        <body>
          <div class="transaction-details">
            <h2>Transaction Details</h2>
            <p><strong>Voucher No:</strong> ${transaction.voucher_no}</p>
            <p><strong>Date:</strong> ${dayjs(transaction.date).format('DD/MM/YYYY')}</p>
            <p><strong>Type:</strong> ${transaction.transaction_type}</p>
            <p><strong>Amount:</strong> ₹${transaction.amount.toLocaleString('en-IN')}</p>
            <p><strong>Description:</strong> ${transaction.description}</p>
          </div>
          <script>
            window.onload = function() { 
              window.print(); 
              window.close();  
            }
          </script>
        </body>
      </html>
    `);
    printWindow.document.close();
  };

  return (
    <Box sx={{ p: 3 }}>
      <Card>
        <CardContent>
          <Typography variant="h5" gutterBottom>
            Transactions
          </Typography>

          {/* Filters */}
          <Box sx={{ mb: 3, display: 'flex', gap: 2, alignItems: 'center' }}>
            <FormControl>
              <RadioGroup
                row
                value={filters.type}
                // onChange={handleTypeFilterChange}
              >
                <FormControlLabel value="" control={<Radio />} label="All" />
                <FormControlLabel value="community" control={<Radio />} label="Community" />
                <FormControlLabel value="otherProject" control={<Radio />} label="Other Project" />
                <FormControlLabel value="family" control={<Radio />} label="Family" />
              </RadioGroup>
            </FormControl>

            <LocalizationProvider dateAdapter={AdapterDayjs}>
              <DatePicker
                label="Start Date"
                value={filters.startDate}
                // onChange={handleStartDateChange}
                slotProps={{ textField: { variant: 'outlined', size: 'small' } }}
              />
              <DatePicker
                label="End Date"
                value={filters.endDate}
                // onChange={handleEndDateChange}
                slotProps={{ textField: { variant: 'outlined', size: 'small' } }}
              />
            </LocalizationProvider>
          </Box>

          {/* Transactions Table */}
          <TableContainer>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Date</TableCell>
                  <TableCell>Voucher No</TableCell>
                  <TableCell>Type</TableCell>
                  <TableCell>Description</TableCell>
                  <TableCell>Amount</TableCell>
                  <TableCell>Payment Method</TableCell>
                  <TableCell>Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {transactions.map((transaction) => (
                  <TableRow key={transaction._id}>
                    <TableCell>{dayjs(transaction.date).format('DD/MM/YYYY')}</TableCell>
                    <TableCell>{transaction.voucher_no}</TableCell>
                    <TableCell>{transaction.transaction_type}</TableCell>
                    <TableCell>{transaction.description}</TableCell>
                    <TableCell>₹{transaction.amount.toLocaleString('en-IN')}</TableCell>
                    <TableCell>{transaction.payment_method}</TableCell>
                    <TableCell>
                      <Box sx={{ display: 'flex', gap: 1 }}>
                        <Button
                          color="error"
                          startIcon={<DeleteIcon />}
                          onClick={() => {
                            setSelectedTransaction(transaction);
                            setDeleteDialogOpen(true);
                          }}
                        >
                          Delete
                        </Button>
                        <Button
                          color="primary"
                          startIcon={<PrintIcon />}
                          onClick={() => handlePrintTransaction(transaction)}
                        >
                          Print
                        </Button>
                      </Box>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>

          <TablePagination
            component="div"
            count={total}
            page={page}
            onPageChange={(e, newPage) => setPage(newPage)}
            rowsPerPage={rowsPerPage}
            onRowsPerPageChange={(e) => {
              setRowsPerPage(parseInt(e.target.value, 10));
              setPage(0);
            }}
          />
        </CardContent>
      </Card>

      {/* Delete Confirmation Dialog */}
      <Dialog
        open={deleteDialogOpen}
        onClose={() => setDeleteDialogOpen(false)}
      >
        <DialogTitle>Confirm Deletion</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Are you sure you want to delete this transaction? 
            This action cannot be undone.
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteDialogOpen(false)} color="primary">
            Cancel
          </Button>
          <Button onClick={handleDeleteTransaction} color="error" autoFocus>
            Delete
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default TransactionList;