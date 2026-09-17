// components/FamilyDetailsPanel.jsx
import React from 'react';
import {
  Paper,
  Typography,
  Grid,
  Box,
  Card,
  CardContent,
} from '@mui/material';
import { styled } from '@mui/material/styles';

const StyledCard = styled(Card)(({ theme }) => ({
  height: '100%',
  borderRadius: theme.shape.borderRadius * 2,
  boxShadow: theme.shadows[2],
}));

const FamilyDetailsPanel = ({ selectedFamily, transactions }) => {
  const calculateTotalAmount = () => {
    return transactions.reduce((sum, transaction) => sum + (transaction.currentYearAmount || 0), 0);
  };

  return (
    <StyledCard>
      <CardContent>
        <Typography variant="h6" gutterBottom>
          Family Details
        </Typography>
        <Grid container spacing={2}>
          <Grid item xs={12} md={6}>
            <Paper sx={{ p: 2 }}>
              <Typography variant="subtitle1">
                House Name: {selectedFamily.name}
              </Typography>
              <Typography variant="body1">
                Family Number: {selectedFamily.familyNumber}
              </Typography>
              <Typography variant="body1">
                Phone: {selectedFamily.phone}
              </Typography>
              <Typography variant="body1">
                Address: {selectedFamily.building}
              </Typography>
              <Typography variant="body1">
                Pincode: {selectedFamily.pincode}
              </Typography>
            </Paper>
          </Grid>
          <Grid item xs={12} md={6}>
            <Paper sx={{ p: 2 }}>
              <Typography variant="subtitle1">
                Financial Summary
              </Typography>
              <Typography variant="body1">
                Total Contributions: ₹{calculateTotalAmount()}
              </Typography>
            </Paper>
          </Grid>
        </Grid>
      </CardContent>
    </StyledCard>
  );
};

export default FamilyDetailsPanel;