import { useState, useEffect } from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { useTheme, useMediaQuery } from '@mui/material';
import logo from "../../assets/images/diocese-logo-new5.webp";
import {
  Drawer,
  IconButton,
  ListItem,
  ListItemText,
  Typography,
  Box,
  ListSubheader,
  AppBar,
  Toolbar,
  Tooltip,
} from '@mui/material';
import { Menu } from 'lucide-react';
import { styled } from '@mui/material/styles';

const drawerWidth = 280;
const collapsedWidth = 0;

const StyledDrawer = styled(Drawer)(({ theme }) => ({
  width: drawerWidth,
  flexShrink: 0,
  '& .MuiDrawer-paper': {
    width: drawerWidth,
    boxSizing: 'border-box',
    backgroundColor: '#ffffff',
    borderRight: '1px solid rgb(229, 231, 235)',
    transition: 'width 0.3s ease',
    overflowX: 'hidden',
    '&::-webkit-scrollbar': {
      width: '6px',
    },
    '&::-webkit-scrollbar-track': {
      background: '#f8f9fa',
      borderRadius: '3px',
    },
    '&::-webkit-scrollbar-thumb': {
      background: '#d1d5db',
      borderRadius: '3px',
      '&:hover': {
        background: '#9ca3af',
      },
    },
  },
}));

const ScrollableContent = styled(Box)(({ theme }) => ({
  height: 'calc(100vh - 80px)',
  overflowY: 'auto',
  overflowX: 'hidden',
  paddingBottom: '80px',
  scrollBehavior: 'smooth',
  '&::-webkit-scrollbar': {
    width: '6px',
  },
  '&::-webkit-scrollbar-track': {
    background: 'transparent',
  },
  '&::-webkit-scrollbar-thumb': {
    background: '#e5e7eb',
    borderRadius: '3px',
    '&:hover': {
      background: '#d1d5db',
    },
  },
  scrollbarWidth: 'thin',
  scrollbarColor: '#e5e7eb transparent',
}));

const LogoWrapper = styled(Box)(({ collapsed }) => ({
  padding: '16px',
  display: 'flex',
  alignItems: 'center',
  gap: '8px',
  justifyContent: collapsed ? 'center' : 'flex-start',
  borderBottom: '1px solid rgb(229, 231, 235)',
  backgroundColor: '#ffffff',
  position: 'sticky',
  top: 0,
  zIndex: 10,
  '& img': {
    width: collapsed ? '24px' : '32px',
    height: 'auto',
    transition: 'width 0.3s ease',
  },
}));

const StyledNavLink = styled(NavLink)({
  textDecoration: 'none',
  color: 'rgb(71, 84, 103)',
  '&.active': {
    '& .MuiListItem-root': {
      backgroundColor: 'rgb(245, 247, 250)',
      borderLeft: '3px solid rgb(66, 102, 242)',
      '& .MuiListItemText-primary': {
        color: 'rgb(66, 102, 242)',
        fontWeight: 500,
      },
    },
  },
});

const StyledListSubheader = styled(ListSubheader)(({ collapsed }) => ({
  backgroundColor: 'transparent',
  color: 'rgb(156, 163, 175)',
  fontSize: '12px',
  fontWeight: 600,
  lineHeight: '16px',
  textTransform: 'uppercase',
  padding: '24px 16px 8px 16px',
  letterSpacing: '0.05em',
  display: collapsed ? 'none' : 'block',
  position: 'static',
  marginBottom: '4px',
}));

const StyledListItem = styled(ListItem)(({ collapsed }) => ({
  borderRadius: '8px',
  marginBottom: '3px',
  marginLeft: '8px',
  marginRight: '8px',
  minHeight: '44px',
  padding: collapsed ? '0 8px' : '8px 16px',
  justifyContent: collapsed ? 'center' : 'flex-start',
  transition: 'all 0.2s ease',
  '&:hover': {
    backgroundColor: 'rgb(245, 247, 250)',
    transform: 'translateX(2px)',
    boxShadow: '0 2px 4px rgba(0, 0, 0, 0.05)',
  },
}));

const IconWrapper = styled(Box)(({ collapsed }) => ({
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  width: '24px',
  height: '24px',
  marginRight: collapsed ? '0' : '12px',
  fontSize: '18px',
  transition: 'margin-right 0.3s ease',
}));

// Base menu items for all users
const baseMenuItems = [
  {
    type: 'single',
    path: '/',
    label: 'Dashboard',
    icon: '📊',
  },
  {
    type: 'header',
    label: 'MANAGE/CREATE',
  },
  {
    type: 'single',
    path: '/organization',
    label: 'Manage Receivers Details',
    icon: '🏛️',
  },
  {
    type: 'single',
    path: '/narration',
    label: 'Manage Narration',
    icon: '📝',
  },
  
  {
    type: 'single',
    path: '/priest',
    label: 'Manage Priest',
    icon: '👤',
  },
  {
    type: 'header',
    label: 'DONATIONS',
  },
  {
    type: 'single',
    path: '/donationpage',
    label: 'Donation Entry',
    icon: '💰',
  },
  {
    type: 'header',
    label: 'REPORTS',
  },
  {
    type: 'single',
    path: '/donationreport',
    label: 'Donation Report',
    icon: '📈',
  },
  {
    type: 'single',
    path: '/organizationreport',
    label: 'Receivers Report',
    icon: '🏢',
  },
  {
    type: 'single',
    path: '/priestledger',
    label: 'Priest Ledger',
    icon: '📒',
  },
 
 
];

// Super admin only menu items
const superAdminMenuItems = [
  {
    type: 'header',
    label: 'SUPER ADMIN',
    superAdminOnly: true,
  },  
  // {
  //   type: 'single',
  //   path: '/parishAnalytics',
  //   label: 'Parish Analytics',
  //   icon: '⛪',
  //   superAdminOnly: true,
  // },
  {
    type: 'single',
    path: '/mgm',
    label: 'Admin Management',
    icon: '👥',
    superAdminOnly: true,
  },
  //   {
  //   type: 'single',
  //   path: '/database-backup',
  //   label: 'Database Backup',
  //   icon: '💾',
  //   superAdminOnly: true,
  // }
];

const Sidenav = ({ color, collapsed = false }) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const [mobileOpen, setMobileOpen] = useState(false);
  const [isSuperAdmin, setIsSuperAdmin] = useState(false);
  const { pathname } = useLocation();

  useEffect(() => {
    // Check if user is super admin
    const user = JSON.parse(localStorage.getItem('user') || '{}');
    setIsSuperAdmin(user.role === 'superadmin');
  }, []);

  const handleDrawerToggle = () => {
    setMobileOpen(!mobileOpen);
  };

  // Combine menu items based on user role
  const menuItems = isSuperAdmin 
    ? [...superAdminMenuItems, ...baseMenuItems]
    : baseMenuItems;

  const drawer = (
    <>
      <LogoWrapper collapsed={collapsed}>
        <img 
          src={logo} 
          style={{ width: collapsed ? '24px' : '100%' }} 
          alt="Diocese Logo" 
        />
        {!collapsed && (
          <Typography
            variant="subtitle1"
            sx={{
              fontSize: '16px',
              fontWeight: 500,
              color: 'rgb(17, 24, 39)',
            }}
          >
            {/* Diocese Management */}
          </Typography>
        )}
      </LogoWrapper>
      
      <ScrollableContent>
        {menuItems.map((item, index) => (
          item.type === 'header' ? (
            <StyledListSubheader 
              key={`header-${index}`} 
              disableSticky={true}
              collapsed={collapsed}
            >
              {item.label}
            </StyledListSubheader>
          ) : (
            <Tooltip 
              key={item.path}
              title={collapsed ? item.label : ''}
              placement="right"
              arrow
            >
              <StyledNavLink
                to={item.path}
                onClick={isMobile ? handleDrawerToggle : undefined}
              >
                <StyledListItem collapsed={collapsed}>
                  <IconWrapper collapsed={collapsed}>
                    {item.icon}
                  </IconWrapper>
                  {!collapsed && (
                    <ListItemText
                      primary={item.label}
                      primaryTypographyProps={{
                        fontSize: '14px',
                        fontWeight: pathname === item.path ? 500 : 400,
                        lineHeight: '1.4',
                      }}
                    />
                  )}
                </StyledListItem>
              </StyledNavLink>
            </Tooltip>
          )
        ))}
      </ScrollableContent>
      
      {/* Footer - only show when not collapsed */}
      {!collapsed && (
        <Box sx={{ 
          position: 'fixed', 
          bottom: 0, 
          left: 0, 
          width: drawerWidth, 
          borderTop: '1px solid rgb(229, 231, 235)',
          padding: '12px 16px',
          backgroundColor: '#fff',
          fontSize: '12px',
          color: 'rgb(156, 163, 175)',
          zIndex: 5,
        }}>
          Diocese Management System v1.0
        </Box>
      )}
    </>
  );

  return (
    <>
      {isMobile && (
        <AppBar 
          position="fixed" 
          sx={{ 
            zIndex: theme.zIndex.drawer + 2,
            backgroundColor: '#ffffff',
            boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)',
            borderBottom: '1px solid rgb(229, 231, 235)'
          }}
        >
          <Toolbar>
            <IconButton
              edge="start"
              onClick={handleDrawerToggle}
              sx={{ color: 'rgb(17, 24, 39)' }}
            >
              <Menu size={24} />
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
            keepMounted: true,
          }}
          sx={{
            display: { xs: 'block', md: 'none' },
            '& .MuiDrawer-paper': { 
              width: drawerWidth,
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
            '& .MuiDrawer-paper': {
              width: collapsed ? collapsedWidth : drawerWidth,
              overflow: 'visible',
            },
          }}
        >
          {!collapsed && drawer}
        </StyledDrawer>
      )}
      {isMobile && <Toolbar />}
    </>
  );
};

export default Sidenav;