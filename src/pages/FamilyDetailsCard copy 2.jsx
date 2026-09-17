import React, { useState } from 'react';
import {
  Box,
  Typography,
  Paper,
  Grid,
  Divider,
  Avatar,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Stack,
  IconButton,
  Chip
} from '@mui/material';
import HomeIcon from '@mui/icons-material/Home';
import PhoneIcon from '@mui/icons-material/Phone';
import LocationOnIcon from '@mui/icons-material/LocationOn';
import AccountBalanceWalletIcon from '@mui/icons-material/AccountBalanceWallet';
import {
  CheckCircle as VerifiedIcon,
  Cancel as UnverifiedIcon,
  VerifiedUser as VerifyIcon,
  Close as CloseIcon,
} from '@mui/icons-material';
import axiosInstance from '../axiosConfig';

const FamilyDetailsCard = ({ selectedFamily, transactions, onFamilyUpdate, showSnackbar }) => {
  const [verificationDialog, setVerificationDialog] = useState({
    open: false,
    family: null,
    currentStatus: false
  });
  const [loading, setLoading] = useState(false);

  const handleFamilyVerification = async (family, newVerificationStatus) => {
    try {
      setLoading(true);
      
      await axiosInstance.put(`/family/${family._id}`, {
        verify: newVerificationStatus ? 'YES' : 'NO'
      });

      // Call parent callback to update family data
      if (onFamilyUpdate) {
        onFamilyUpdate({
          ...family,
          verify: newVerificationStatus ? 'YES' : 'NO'
        });
      }

      if (showSnackbar) {
        showSnackbar(
          `Family ${newVerificationStatus ? 'verified' : 'unverified'} successfully`, 
          'success'
        );
      }
      
      setVerificationDialog({ open: false, family: null, currentStatus: false });
      
    } catch (error) {
      console.error('Error updating family verification:', error);
      if (showSnackbar) {
        showSnackbar('Failed to update family verification', 'error');
      }
    } finally {
      setLoading(false);
    }
  };

  if (!selectedFamily) return null;

  // Calculate total tithe
  const totalTithe = transactions.reduce(
    (total, transaction) => total + (transaction.totalAmount || 0), 
    0
  ).toFixed(2);

  const isVerified = selectedFamily?.verify === 'YES';

  return (
    <>
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
          {/* Family Icon and Name */}
          <Grid item xs={12} sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
            <Box sx={{ display: 'flex', alignItems: 'center' }}>
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
                variant="h6"
                color="primary"
                sx={{ fontWeight: 'bold' }}
              >
                {selectedFamily.name}
              </Typography>
            </Box>

            {/* Verification Status Chip */}
            <Chip
              icon={isVerified ? <VerifiedIcon /> : <UnverifiedIcon />}
              label={isVerified ? "Verified" : "Pending"}
              color={isVerified ? "success" : "warning"}
              variant={isVerified ? "filled" : "outlined"}
              size="small"
              sx={{
                fontWeight: 'bold',
                '& .MuiChip-icon': {
                  color: isVerified ? 'success.contrastText' : 'warning.main'
                }
              }}
            />
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

          {/* Verification Section */}
          <Grid item xs={12}>
            <Divider sx={{ my: 2 }} />
            <Box
              sx={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                bgcolor: isVerified ? 'success.lighter' : 'warning.lighter',
                borderRadius: 2,
                p: 2,
                border: '1px solid',
                borderColor: isVerified ? 'success.main' : 'warning.main'
              }}
            >
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                {isVerified ? (
                  <VerifiedIcon color="success" sx={{ fontSize: 24 }} />
                ) : (
                  <UnverifiedIcon color="warning" sx={{ fontSize: 24 }} />
                )}
                <Box>
                  <Typography 
                    variant="subtitle2" 
                    fontWeight="bold" 
                    color={isVerified ? 'success.dark' : 'warning.dark'}
                  >
                    {isVerified ? 'Family Verified' : 'Verification Pending'}
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    {isVerified ? 'Information confirmed' : 'Requires verification'}
                  </Typography>
                </Box>
              </Box>
              
              <Button
                variant={isVerified ? "outlined" : "contained"}
                color={isVerified ? "warning" : "success"}
                startIcon={isVerified ? <UnverifiedIcon /> : <VerifiedIcon />}
                onClick={() => setVerificationDialog({
                  open: true,
                  family: selectedFamily,
                  currentStatus: isVerified
                })}
                size="small"
                sx={{ 
                  borderRadius: 2,
                  textTransform: 'none',
                  fontWeight: 'bold',
                  minWidth: '100px'
                }}
              >
                {isVerified ? 'Unverify' : 'Verify'}
              </Button>
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

      {/* Verification Dialog */}
      <Dialog
        open={verificationDialog.open}
        onClose={() => setVerificationDialog({ open: false, family: null, currentStatus: false })}
        maxWidth="sm"
        fullWidth
        PaperProps={{
          sx: {
            borderRadius: 3,
            boxShadow: '0 8px 32px rgba(0,0,0,0.12)'
          }
        }}
      >
        <DialogTitle sx={{ 
          pb: 1, 
          display: 'flex', 
          alignItems: 'center', 
          gap: 2,
          bgcolor: verificationDialog.currentStatus ? 'warning.lighter' : 'success.lighter'
        }}>
          <Box sx={{ 
            display: 'flex', 
            alignItems: 'center', 
            gap: 2,
            width: '100%',
            justifyContent: 'space-between'
          }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
              {verificationDialog.currentStatus ? (
                <UnverifiedIcon color="warning" sx={{ fontSize: 28 }} />
              ) : (
                <VerifiedIcon color="success" sx={{ fontSize: 28 }} />
              )}
              <Typography variant="h6" fontWeight="bold">
                {verificationDialog.currentStatus ? 'Unverify' : 'Verify'} Family
              </Typography>
            </Box>
            <IconButton 
              onClick={() => setVerificationDialog({ open: false, family: null, currentStatus: false })}
              size="small"
            >
              <CloseIcon />
            </IconButton>
          </Box>
        </DialogTitle>
        
        <DialogContent sx={{ pt: 3 }}>
          <Stack spacing={2}>
            <Paper 
              elevation={1} 
              sx={{ 
                p: 2, 
                borderRadius: 2, 
                bgcolor: 'grey.50',
                border: '1px solid',
                borderColor: 'divider'
              }}
            >
              <Typography variant="subtitle1" fontWeight="bold" gutterBottom>
                Family Details
              </Typography>
              <Typography variant="body2" color="text.secondary">
                <strong>House Name:</strong> {verificationDialog.family?.name}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                <strong>Family Head:</strong> {verificationDialog.family?.headname}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                <strong>Building:</strong> {verificationDialog.family?.building}
              </Typography>
            </Paper>

            <Box sx={{ 
              display: 'flex', 
              alignItems: 'center', 
              gap: 2, 
              p: 2, 
              borderRadius: 2,
              bgcolor: verificationDialog.currentStatus ? 'warning.lighter' : 'success.lighter'
            }}>
              {verificationDialog.currentStatus ? (
                <UnverifiedIcon color="warning" />
              ) : (
                <VerifiedIcon color="success" />
              )}
              <Typography variant="body1">
                {verificationDialog.currentStatus 
                  ? 'Are you sure you want to mark this family as unverified?' 
                  : 'Are you sure you want to mark this family as verified?'
                }
              </Typography>
            </Box>

            {!verificationDialog.currentStatus && (
              <Box sx={{ 
                p: 2, 
                borderRadius: 2, 
                bgcolor: 'info.lighter',
                border: '1px solid',
                borderColor: 'info.main'
              }}>
                <Typography variant="body2" color="info.dark">
                  <strong>Note:</strong> Verifying a family confirms that all family information has been reviewed and is accurate.
                </Typography>
              </Box>
            )}
          </Stack>
        </DialogContent>
        
        <DialogActions sx={{ p: 3, pt: 1 }}>
          <Button 
            onClick={() => setVerificationDialog({ open: false, family: null, currentStatus: false })}
            variant="outlined"
            sx={{ borderRadius: 2 }}
          >
            Cancel
          </Button>
          <Button
            onClick={() => handleFamilyVerification(
              verificationDialog.family, 
              !verificationDialog.currentStatus
            )}
            variant="contained"
            color={verificationDialog.currentStatus ? 'warning' : 'success'}
            startIcon={verificationDialog.currentStatus ? <UnverifiedIcon /> : <VerifiedIcon />}
            disabled={loading}
            sx={{ 
              borderRadius: 2,
              textTransform: 'none',
              fontWeight: 'bold'
            }}
          >
            {loading ? 'Processing...' : (verificationDialog.currentStatus ? 'Mark Unverified' : 'Mark Verified')}
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
};

export default FamilyDetailsCard;