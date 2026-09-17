import React from 'react';
import { 
  Box, 
  Typography, 
  Paper, 
  Grid, 
  Divider, 
  Avatar 
} from '@mui/material';
import HomeIcon from '@mui/icons-material/Home';
import PhoneIcon from '@mui/icons-material/Phone';
import LocationOnIcon from '@mui/icons-material/LocationOn';
import AccountBalanceWalletIcon from '@mui/icons-material/AccountBalanceWallet';

const FamilyDetailsCard = ({ selectedFamily, transactions }) => {
  if (!selectedFamily) return null;

  // Calculate total tithe
  const totalTithe = transactions.reduce(
    (total, transaction) => total + (transaction.totalAmount || 0), 
    0
  ).toFixed(2);

  return (
    <Paper 
      elevation={3} 
      sx={{ 
        borderRadius: 3, 
        padding: 3, 
        background: 'linear-gradient(145deg, #f0f4f8 0%, #e6eaf0 100%)',
        boxShadow: '0 4px 6px rgba(0,0,0,0.1)'
      }}
    >
      <Grid container spacing={2} alignItems="center">
        {/* Family Icon */}
        <Grid item xs={12} sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
          <Avatar 
            sx={{ 
              bgcolor: 'primary.main', 
              mr: 2, 
              width: 40, 
              height: 40 
            }}
          >
            <HomeIcon fontSize="medium" />
          </Avatar>
          <Typography 
            variant="h7" 
            color="primary" 
            sx={{ fontWeight: 'bold' }}
          >
            {selectedFamily.name}
          </Typography>
        </Grid>

        {/* Contact Details */}
        <Grid item xs={12}>
          <Box 
            sx={{ 
              display: 'flex', 
              alignItems: 'center', 
              mb: 1,
              color: 'text.secondary'
            }}
          >
            <LocationOnIcon sx={{ mr: 2, color: 'primary.main' }} />
            <Typography variant="body1">
              {selectedFamily.building}
            </Typography>
          </Box>

          <Box 
            sx={{ 
              display: 'flex', 
              alignItems: 'center', 
              mb: 1,
              color: 'text.secondary'
            }}
          >
            <PhoneIcon sx={{ mr: 2, color: 'primary.main' }} />
            <Typography variant="body1">
              {selectedFamily.phone || 'No phone number'}
            </Typography>
          </Box>

          <Box 
            sx={{ 
              display: 'flex', 
              alignItems: 'center',
              color: 'text.secondary'
            }}
          >
            <LocationOnIcon sx={{ mr: 2, color: 'primary.main' }} />
            <Typography variant="body1">
              PIN: {selectedFamily.pincode || 'Not available'}
            </Typography>
          </Box>
        </Grid>

        {/* Tithe Details */}
        <Grid item xs={12}>
          <Divider sx={{ my: 2 }} />
          <Box 
            sx={{ 
              display: 'flex', 
              alignItems: 'center', 
              bgcolor: 'primary.light', 
              borderRadius: 2, 
              p: 2
            }}
          >
            <AccountBalanceWalletIcon 
              sx={{ 
                mr: 2, 
                color: '#fff', 
                fontSize: 32 
              }} 
            />
            <Typography 
              variant="h6" 
              color="#fff" 
              sx={{ fontWeight: 'bold' }}
            >
              Total Tithe: ₹{totalTithe}
            </Typography>
          </Box>
        </Grid>
      </Grid>
    </Paper>
  );
};

export default FamilyDetailsCard;