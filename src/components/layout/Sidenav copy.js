import { useState } from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { useTheme, useMediaQuery } from '@mui/material';
import logo from "../../assets/images/diocese-logo-new3.png";
import {
  Drawer,
  IconButton,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Typography,
  Divider,
  Box,
  ListSubheader,
  AppBar,
  Toolbar,
} from '@mui/material';
import {
  Dashboard as DashboardIcon,
  AccountTree as ForaneIcon,
  Church as ParishIcon,
  Groups as KoottaymaIcon,
  Family as FamilyIcon,
  Person as PersonIcon,
  AccountBalance as FinanceIcon,
  Payment as TransactionIcon,
  Transform as MoveIcon,
  Assignment as ProjectIcon,
  People as CommunityIcon,
  Settings as SettingsIcon,
  Print as PrintIcon,
  Menu as MenuIcon,
} from '@mui/icons-material';
import { styled } from '@mui/material/styles';

const StyledDrawer = styled(Drawer)(({ theme }) => ({
  width: 280,
  flexShrink: 0,
  '& .MuiDrawer-paper': {
    width: 280,
    boxSizing: 'border-box',
    backgroundColor: theme.palette.background.paper,
  },
}));

const LogoWrapper = styled(Box)(({ theme }) => ({
  padding: theme.spacing(2),
  display: 'flex',
  justifyContent: 'center',
  alignItems: 'center',
  '& img': {
    maxWidth: '100%',
    height: 'auto',
  },
}));

const StyledNavLink = styled(NavLink)(({ theme }) => ({
  textDecoration: 'none',
  color: theme.palette.text.primary,
  width: '100%',
  '&.active': {
    '& .MuiListItem-root': {
      backgroundColor: theme.palette.primary.light,
      '& .MuiListItemIcon-root': {
        color: theme.palette.primary.main,
      },
      '& .MuiListItemText-primary': {
        color: theme.palette.primary.main,
        fontWeight: 600,
      },
    },
  },
}));

const StyledListSubheader = styled(ListSubheader)(({ theme }) => ({
  backgroundColor: theme.palette.grey[100],
  color: theme.palette.primary.main,
  fontWeight: 600,
  lineHeight: '48px',
}));

const menuItems = [
  {
    type: 'single',
    path: '/dashboard',
    label: 'Dashboard',
    icon: <DashboardIcon />,
  },
  {
    type: 'header',
    label: 'Manage/Create',
  },
  {
    type: 'single',
    path: '/forane',
    label: 'Manage Forane',
    icon: <ForaneIcon />,
  },
  {
    type: 'single',
    path: '/Parish',
    label: 'Manage Parish',
    icon: <ParishIcon />,
  },
  {
    type: 'single',
    path: '/koottayma',
    label: 'Manage Koottayma',
    icon: <KoottaymaIcon />,
  },
  {
    type: 'single',
    path: '/Family',
    label: 'Manage Family',
    icon: <PersonIcon />,
  },
  {
    type: 'single',
    path: '/PersonManagement',
    label: 'Manage Person',
    icon: <PersonIcon />,
  },
  {
    type: 'header',
    label: 'Accounts',
  },
  {
    type: 'single',
    path: '/FamilyFinance',
    label: 'Family Finance',
    icon: <FinanceIcon />,
  },
  {
    type: 'single',
    path: '/Transactionpage',
    label: 'Transaction',
    icon: <TransactionIcon />,
  },
  {
    type: 'header',
    label: 'Finance Settings',
  },
  {
    type: 'single',
    path: '/project',
    label: 'Manage Other Project',
    icon: <ProjectIcon />,
  },
  {
    type: 'single',
    path: '/community',
    label: 'Manage Communities',
    icon: <CommunityIcon />,
  },
  {
    type: 'single',
    path: '/FinanceSettings',
    label: 'Finance Settings',
    icon: <SettingsIcon />,
  },
];

const Sidenav = ({ color }) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const [mobileOpen, setMobileOpen] = useState(false);
  const { pathname } = useLocation();

  const handleDrawerToggle = () => {
    setMobileOpen(!mobileOpen);
  };

  const drawer = (
    <>
      <LogoWrapper>
        <img src={logo} alt="Diocese Logo" />
      </LogoWrapper>
      <Divider />
      <List>
        {menuItems.map((item, index) => (
          item.type === 'header' ? (
            <StyledListSubheader key={`header-${index}`}>
              {item.label}
            </StyledListSubheader>
          ) : (
            <StyledNavLink
              key={item.path}
              to={item.path}
              onClick={isMobile ? handleDrawerToggle : undefined}
            >
              <ListItem
                button
                sx={{
                  borderRadius: 1,
                  mb: 0.5,
                  height: 48,
                }}
              >
                <ListItemIcon>{item.icon}</ListItemIcon>
                <ListItemText
                  primary={item.label}
                  primaryTypographyProps={{
                    fontSize: '0.875rem',
                  }}
                />
              </ListItem>
            </StyledNavLink>
          )
        ))}
      </List>
    </>
  );

  return (
    <>
      {isMobile && (
        <AppBar 
          position="fixed" 
          sx={{ 
            zIndex: theme.zIndex.drawer + 2,
            backgroundColor: theme.palette.background.paper,
            boxShadow: 'none',
            borderBottom: `1px solid ${theme.palette.divider}`
          }}
        >
          <Toolbar>
            <IconButton
              color="inherit"
              edge="start"
              onClick={handleDrawerToggle}
              sx={{ color: theme.palette.text.primary }}
            >
              <MenuIcon />
            </IconButton>
          </Toolbar>
        </AppBar>
      )}
      
      {isMobile ? (
        <Drawer
          variant="temporary"
          anchor="left"
          open={mobileOpen}
          onClose={handleDrawerToggle}
          ModalProps={{
            keepMounted: true, // Better mobile performance
          }}
          sx={{
            display: { xs: 'block', md: 'none' },
            '& .MuiDrawer-paper': { 
              width: 280,
              boxSizing: 'border-box',
            },
          }}
        >
          {drawer}
        </Drawer>
      ) : (
        <StyledDrawer 
          variant="permanent"
          sx={{
            display: { xs: 'none', md: 'block' },
          }}
        >
          {drawer}
        </StyledDrawer>
      )}
      {isMobile && <Toolbar />} {/* Add spacing for AppBar */}
    </>
  );
};

export default Sidenav;