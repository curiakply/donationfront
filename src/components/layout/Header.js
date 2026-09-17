import React, { useState } from 'react';
import { NavLink } from 'react-router-dom';
import {
  Box,
  Typography,
  IconButton,
  Avatar,
  Menu,
  MenuItem,
  InputBase,
  Badge,
  Stack,
  Breadcrumbs,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  useMediaQuery,
  useTheme,
} from '@mui/material';
import axiosInstance from '../../axiosConfig';
import { styled } from '@mui/material/styles';
import { 
  KeyboardArrowDown as KeyboardArrowDownIcon,
  Menu as MenuIcon,
} from '@mui/icons-material';
import { UserCircle } from 'lucide-react';

// Styled components remain the same
const HeaderWrapper = styled(Box)(({ theme }) => ({
  padding: '20px 0',
  background: 'white',
  boxShadow: '0 1px 2px rgba(0, 0, 0, 0.03), 0 1px 6px -1px rgba(0, 0, 0, 0.02)',
  position: 'sticky',
  top: 0,
  zIndex: 1000,
  backdropFilter: 'blur(8px)',
  borderBottom: '1px solid rgba(0, 0, 0, 0.05)'
}));

const UserAvatar = styled(Avatar)({
  backgroundColor: 'rgb(66, 102, 242)',
  width: 32,
  height: 32,
  cursor: 'pointer',
  '&:hover': {
    opacity: 0.9
  }
});

// Add styled component for the logout link
const StyledLink = styled('a')({
  textDecoration: 'none',
  color: 'inherit',
  display: 'block',
  width: '100%',
});

// Add styled component for the toggle button
const ToggleButton = styled(IconButton)(({ theme }) => ({
  width: 40,
  height: 40,
  borderRadius: 8,
  backgroundColor: '#f3f4f6',
  color: '#6b7280',
  '&:hover': {
    backgroundColor: '#e5e7eb',
    color: '#374151'
  }
}));

const Header = ({ name, subName, onToggleSidebar }) => {
  const [anchorEl, setAnchorEl] = useState(null);
  const [open, setOpen] = useState(false);
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  
  const handleClickOpen = () => {
    setOpen(true);
  };
  
  const handleClose = () => {
    setOpen(false);
  };

  const handleLogout = async () => {
    try {
      // Call backend logout endpoint
      await axiosInstance.post('/auth/logout');
      
      // Clear local storage
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      
      // Reset axios headers
      delete axiosInstance.defaults.headers.common['Authorization'];
      
      // Redirect to login
      window.location.href = '/home';
    } catch (error) {
      console.error('Logout error:', error);
      // Still clear local storage and redirect even if API call fails
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/home';
    }
  };
  
  const handleMenuOpen = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
  };

  return (
    <HeaderWrapper>
      <Dialog
        open={open}
        onClose={handleClose}
        aria-labelledby="alert-dialog-title"
        aria-describedby="alert-dialog-description"
      >
        <DialogTitle id="alert-dialog-title">
          {"Confirm Logout"}
        </DialogTitle>
        <DialogContent>
          <DialogContentText id="alert-dialog-description">
            Are you sure you want to logout?
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleClose} color="primary">
            Cancel
          </Button>
          <Button onClick={handleLogout} color="primary" autoFocus>
            Logout
          </Button>
        </DialogActions>
      </Dialog>
      
      <Box px={3} display="flex" justifyContent="space-between" alignItems="center">
        {/* Left side - Toggle button (only show on desktop) */}
        {!isMobile && (
          <Box display="flex" alignItems="center">
            <ToggleButton onClick={onToggleSidebar}>
              <MenuIcon />
            </ToggleButton>
          </Box>
        )}

        {/* Right side - User menu */}
        <Stack direction="row" spacing={2} alignItems="center" sx={{ marginLeft: isMobile ? 'auto' : 0 }}>
          <Box 
            display="flex" 
            alignItems="center" 
            sx={{ cursor: 'pointer' }}
            onClick={handleMenuOpen}
          >
            <UserAvatar>
              <UserCircle size={20} />
            </UserAvatar>
            <KeyboardArrowDownIcon 
              sx={{ 
                ml: 0.5, 
                fontSize: 20, 
                color: '#6b7280'
              }} 
            />
          </Box>

          <Menu
            anchorEl={anchorEl}
            open={Boolean(anchorEl)}
            onClose={handleMenuClose}
            PaperProps={{
              sx: {
                mt: 1,
                boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
                borderRadius: '8px'
              }
            }}
          >
            <MenuItem onClick={handleMenuClose}>
              <StyledLink onClick={handleClickOpen}>
                Sign out
              </StyledLink>
            </MenuItem>
          </Menu>
        </Stack>
      </Box>
    </HeaderWrapper>
  );
};

export default Header;