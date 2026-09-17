import React from 'react';
import { Box, AppBar, Toolbar, Typography, Button } from '@mui/material';
import { useHistory } from 'react-router-dom';
import { Add as AddIcon } from '@mui/icons-material';
import TransactionList from '../pages/TransactionList';

const TransactionListPage = () => {
    const history = useHistory();

  return (
    <Box sx={{ flexGrow: 1 }}>
      <AppBar position="static">
        <Toolbar>
          <Typography variant="h6" sx={{ flexGrow: 1, textAlign: 'center' }}>
            Transaction List
          </Typography>
          <Button 
            color="inherit"
            startIcon={<AddIcon />}
            onClick={() => history.push('/transactions/new')}
          >
            New Transaction
          </Button>
        </Toolbar>
      </AppBar>

      <TransactionList />
    </Box>
  );
};

export default TransactionListPage;