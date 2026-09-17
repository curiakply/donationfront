import React, { useState, useEffect } from 'react';
import { useHistory } from 'react-router-dom';
import axiosInstance from "../axiosConfig";
import { 
  createTheme, 
  ThemeProvider, 
  CssBaseline,
  Button,
  Box,
  Typography,
  Grid,
  Card,
  CardContent,
  Paper,
  Fade,
  IconButton
} from '@mui/material';
import { styled } from '@mui/material/styles';
import { 
  Home, 
  AccountBalance, 
  Assignment,
  TrendingUp,
  ArrowForward 
} from '@mui/icons-material';
import { FaPeopleRoof } from "react-icons/fa6";

// Theme configuration with updated modern colors
const theme = createTheme({
  palette: {
    mode: 'light',
    primary: {
      main: '#2563eb',
      light: '#60a5fa',
      dark: '#1d4ed8'
    },
    secondary: {
      main: '#10b981',
      light: '#34d399',
      dark: '#059669'
    },
    background: {
      default: '#f8fafc',
      paper: '#ffffff'
    },
    text: {
      primary: '#1e293b',
      secondary: '#64748b'
    }
  },
  typography: {
    fontFamily: 'Inter, system-ui, -apple-system, Segoe UI, Roboto, sans-serif',
    h3: {
      fontWeight: 700,
      letterSpacing: '-0.5px'
    },
    h4: {
      fontWeight: 600,
      letterSpacing: '-0.3px'
    }
  },
  shape: {
    borderRadius: 16
  },
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          textTransform: 'none',
          fontWeight: 600,
          borderRadius: 8,
          padding: '10px 20px'
        }
      }
    },
    MuiCard: {
      styleOverrides: {
        root: {
          borderRadius: 16,
          boxShadow: '0 1px 3px rgba(0,0,0,0.1), 0 1px 2px rgba(0,0,0,0.06)'
        }
      }
    }
  }
});

// Styled Components
const StatsCard = styled(Card)(({ theme }) => ({
  height: '100%',
  background: '#ffffff',
  transition: 'transform 0.2s ease, box-shadow 0.2s ease',
  '&:hover': {
    transform: 'translateY(-4px)',
    boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)'
  }
}));

const CategoryCard = styled(Card)(({ theme }) => ({
  height: '100%',
  background: '#ffffff',
  position: 'relative',
  overflow: 'visible',
  transition: 'transform 0.2s ease, box-shadow 0.2s ease',
  '&:hover': {
    transform: 'translateY(-4px)',
    boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)'
  }
}));

const IconWrapper = styled(Box)(({ theme }) => ({
  width: 48,
  height: 48,
  borderRadius: 12,
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  background: theme.palette.primary.main,
  color: '#ffffff'
}));

const FinanceSettings = () => {
  const history = useHistory();
  const currentYear = new Date().getFullYear() - 1;
  const [isLoading, setIsLoading] = useState(false);
  const [totalBalanceFromDB, setTotalBalanceFromDB] = useState(0);
  const [community, setcommunity] = useState(0);
  const [parishAmount, setParishAmount] = useState(0);
  const [otherproject, setoproject] = useState(0);
  const [totalCollectionAmount, setTotalCollectionAmount] = useState(0);
  // const fetchTotalBalance = async () => {
  //   try {
  //     setIsLoading(true);
  //     const [settingsResponse, collectionResponse] = await Promise.all([
  //       axiosInstance.get(`/community-settings/year/${currentYear}`),
  //       axiosInstance.get(`/transaction/yearlyData/${currentYear}`)  // New endpoint to get year's total
  //     ]);
       
  //     if (settingsResponse.data) {
  //       setcommunity(settingsResponse.data.total_allocated || 0);
  //       setParishAmount(settingsResponse.data.parish_amount || 0);
  //       setoproject(settingsResponse.data.other_projects_amount || 0);
  //     }

  //     setTotalCollectionAmount(collectionResponse.data.totalAmount || 0);
  //   } catch (error) {
  //     console.error('Error fetching data:', error);
  //   } finally {
  //     setIsLoading(false);
  //   }
  // };
  const fetchTotalBalance = async () => {
    try {
      setIsLoading(true);
      
      const response = await axiosInstance.get(`/transaction/yearlysumData/${currentYear}`);
      const data = response.data;
  
      // Set transaction-related states
      setTotalCollectionAmount(data.collectedAmount || 0);
      
    
      setcommunity(data.total_allocated || 0);
      setParishAmount(data.parish_amount || 0);
      setoproject(data.other_projects_amount || 0);
  
      
  
    } catch (error) {
      console.error('Error fetching data:', error);
      
    } finally {
      setIsLoading(false);
    }
  };
  useEffect(() => {
    fetchTotalBalance();
  }, [currentYear]);
  const categories = [
    { 
      name: 'Communities',
      amount: community,
      icon: <Home />,
      path: '/communitysettings',
      trend: '+12.5%'
    },
    { 
      name: 'Parishes',
      amount: parishAmount,
      icon: <AccountBalance />,
      path: '/parishallocsettings',
      trend: '+8.3%'
    },
    { 
      name: 'Other Projects',
      amount: otherproject,
      icon: <Assignment />,
      path: '/otherprojectsettings',
      trend: '+15.2%'
    }
  ];

  const totalCollection = categories.reduce((sum, category) => sum + category.amount, 0);

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Box sx={{ 
        minHeight: '100vh', 
        background: 'linear-gradient(145deg, #f8fafc 0%, #f1f5f9 100%)',
        py: { xs: 3, sm: 4, md: 5 },
        px: { xs: 2, sm: 3, md: 4 }
      }}>
        {/* Header Section */}
        <Fade in={true} timeout={1000}>
          <Box sx={{ maxWidth: '5xl', mx: 'auto', mb: 6 }}>
            <Box display="flex" alignItems="center" mb={2}>
              <FaPeopleRoof style={{ 
                fontSize: '2.5rem',
                color: theme.palette.primary.main,
                marginRight: '1rem'
              }} />
              <Typography 
                variant="h3" 
                sx={{ 
                  color: theme.palette.text.primary,
                  fontSize: { xs: '1.875rem', md: '2.25rem' }
                }}
              >
                Finance Allocation Settings
              </Typography>
            </Box>
            <Typography variant="h6" color="text.secondary">
              Monitor and manage financial allocations across departments
            </Typography>
          </Box>
        </Fade>

        {/* Stats Overview */}
        <Grid container spacing={3} sx={{ mb: 4 }}>
          <Grid item xs={12} md={4}>
            <StatsCard>
              <CardContent sx={{ p: 3 }}>
                <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
                  <IconWrapper>
                    <TrendingUp />
                  </IconWrapper>
                  <Typography 
                    variant="subtitle2" 
                    sx={{ 
                      color: 'secondary.main',
                      display: 'flex',
                      alignItems: 'center',
                      gap: 0.5
                    }}
                  >
                    {/* <TrendingUp fontSize="small" /> */}
                  </Typography>
                </Box>
                <Typography variant="body1" color="text.secondary" gutterBottom>
                  Total Collection
                </Typography>
                <Typography variant="h4" color="text.primary">
                  ₹{totalCollectionAmount.toLocaleString()}
                </Typography>
              </CardContent>
            </StatsCard>
          </Grid>

          <Grid item xs={12} md={4}>
            <StatsCard>
              <CardContent sx={{ p: 3 }}>
                <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
                  <IconWrapper sx={{ bgcolor: 'secondary.main' }}>
                    <Assignment />
                  </IconWrapper>
                  <Typography 
                    variant="subtitle2" 
                    sx={{ 
                      color: 'secondary.main',
                      display: 'flex',
                      alignItems: 'center',
                      gap: 0.5
                    }}
                  >
                   {/* <TrendingUp fontSize="small" /> */}
                  </Typography>
                </Box>
                <Typography variant="body1" color="text.secondary" gutterBottom>
                  Allocated Amount
                </Typography>
                <Typography variant="h4" color="text.primary">
                  ₹{(totalCollection).toLocaleString()}
                </Typography>
              </CardContent>
            </StatsCard>
          </Grid>

          <Grid item xs={12} md={4}>
            <StatsCard>
              <CardContent sx={{ p: 3 }}>
                <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
                  <IconWrapper sx={{ bgcolor: 'error.main' }}>
                    <AccountBalance />
                  </IconWrapper>
                </Box>
                <Typography variant="body1" color="text.secondary" gutterBottom>
                  Remaining Balance
                </Typography>
                <Typography variant="h4" color="text.primary">
                  ₹{(totalCollectionAmount-totalCollection).toLocaleString()}
                </Typography>
              </CardContent>
            </StatsCard>
          </Grid>
        </Grid>

        {/* Category Cards */}
        <Grid container spacing={3} sx={{ mb: 4 }}>
          {categories.map((category) => (
            <Grid item xs={12} md={4} key={category.name}>
              <CategoryCard>
                <CardContent sx={{ p: 3 }}>
                  <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
                    <IconWrapper>
                      {category.icon}
                    </IconWrapper>
                    <Typography 
                      variant="subtitle2" 
                      sx={{ 
                        color: 'secondary.main',
                        display: 'flex',
                        alignItems: 'center',
                        gap: 0.5
                      }}
                    >
                     {/* <TrendingUp fontSize="small" /> */}
                    </Typography>
                  </Box>
                  <Typography variant="h6" gutterBottom>
                    {category.name}
                  </Typography>
                  <Typography 
                    variant="h4" 
                    color="text.primary"
                    sx={{ mb: 3 }}
                  >
                    ₹{category.amount.toLocaleString()}
                  </Typography>
                  <Button
                    fullWidth
                    variant="contained"
                    onClick={() => history.push(category.path)}
                    endIcon={<ArrowForward />}
                    sx={{
                      bgcolor: 'primary.main',
                      '&:hover': {
                        bgcolor: 'primary.dark'
                      }
                    }}
                  >
                    Manage {category.name}
                  </Button>
                </CardContent>
              </CategoryCard>
            </Grid>
          ))}
        </Grid>

        {/* Summary Table */}
        <Paper 
          elevation={0} 
          sx={{ 
            p: 3,
            borderRadius: 3,
            bgcolor: 'white',
            border: '1px solid',
            borderColor: 'grey.100'
          }}
        >
          <Typography variant="h6" gutterBottom sx={{ mb: 3 }}>
            Allocation Summary
          </Typography>
          <Grid container spacing={2}>
            {categories.map((category) => (
              <Grid item xs={12} key={`summary-${category.name}`}>
                <Box 
                  sx={{ 
                    display: 'flex', 
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    p: 2,
                    borderRadius: 2,
                    bgcolor: 'grey.50',
                    transition: 'all 0.2s ease',
                    '&:hover': {
                      bgcolor: 'grey.100'
                    }
                  }}
                >
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                    <IconWrapper sx={{ width: 40, height: 40 }}>
                      {category.icon}
                    </IconWrapper>
                    <Box>
                      <Typography variant="subtitle1" fontWeight="600">
                        {category.name}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        
                      </Typography>
                    </Box>
                  </Box>
                  <Typography variant="h6" color="text.primary" fontWeight="600">
                    ₹{category.amount.toLocaleString()}
                  </Typography>
                </Box>
              </Grid>
            ))}
          </Grid>
        </Paper>
      </Box>
    </ThemeProvider>
  );
};

export default FinanceSettings;