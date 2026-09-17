import { useState, useEffect,useMemo  } from "react";
import { useHistory } from "react-router-dom";
import {  FormControl, InputLabel, MenuItem, Select } from '@mui/material';
import axiosInstance from "../axiosConfig.jsx";
// import { FaChurch } from "react-icons/fa6/FaChurch";
// const FaChurch = React.lazy(() => import('react-icons/fa6/FaChurch'));
import FaChurch from '@mui/icons-material/Church';
import { jsPDF } from "jspdf";
import autoTable from 'jspdf-autotable';
import { 
  Box, 
  Typography,
  Button,
  Grid,
  Card,
  CircularProgress,
  ThemeProvider,
  createTheme,
  CssBaseline,
  Tooltip,
  IconButton,
  Alert,
  Snackbar,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  FormControlLabel,
  Switch,
  Backdrop,
  Stack
} from '@mui/material';

import { 
  FileDownload as FileDownloadIcon, 
  Refresh as RefreshIcon,
  SaveAlt,
  History,
  Warning,
  CheckCircle,
  Settings as SettingsIcon,
  Calculate as CalculateIcon,
  Edit as EditIcon,
  Save as SaveIcon
} from '@mui/icons-material';
import { MaterialReactTable } from "material-react-table";
import { styled } from "@mui/material/styles";
import { Layout, Space, Statistic, Modal, Row, Col, notification } from "antd";
import { SettingOutlined, CalculatorOutlined, EditOutlined } from "@ant-design/icons";
import TotalAmountModal from "../components/TotalAmountModal.jsx";
import SlabsModal from "../components/SlabsModal.jsx";
import "../assets/styles/responsive.css";
import { useFinancialYear } from './FinancialYearContext';

const { Header, Content } = Layout;
const { Title } = Typography;
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
    },
    background: {
      default: '#F3F4F6',
      paper: '#FFFFFF'
    },
    text: {
      primary: '#1F2937',
      secondary: '#6B7280'
    }
  },
  typography: {
    fontFamily: 'Inter, system-ui, -apple-system, sans-serif',
  },
  components: {
    MuiTableHead: {
      styleOverrides: {
        root: {
          backgroundColor: '#2563EB !important', // Tailwind blue-600
        }
      }
    },
    MuiTableCell: {
      styleOverrides: {
        head: {
          color: 'white !important',
          fontWeight: 'bold !important',
          backgroundColor: '#2563EB !important',
        },
        body: {
          backgroundColor: '#F3F4F6', // Tailwind gray-100
          '&:nth-of-type(even)': {
            backgroundColor: '#FFFFFF', // White for alternate rows
          }
        }
      }
    },
    MuiTableRow: {
      styleOverrides: {
        root: {
          '&:hover': {
            backgroundColor: '#E5E7EB !important', // Tailwind gray-200
          }
        }
      }
    },
    MuiTableSortLabel: {
      styleOverrides: {
        root: {
          color: 'white !important',
          '&.Mui-active': {
            color: 'white !important',
          },
          '& .MuiTableSortLabel-icon': {
            color: 'white !important',
          }
        }
      }
    },
    MuiOutlinedInput: {
      styleOverrides: {
        root: {
          '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
            borderColor: '#2563EB !important',
          }
        }
      }
    },
    MuiInputLabel: {
      styleOverrides: {
        root: {
          '&.Mui-focused': {
            color: '#2563EB !important',
          }
        }
      }
    },
    MuiSwitch: {
      styleOverrides: {
        switchBase: {
          '&.Mui-checked': {
            color: '#2563EB !important',
          },
          '&.Mui-checked + .MuiSwitch-track': {
            backgroundColor: '#2563EB !important',
          }
        }
      }
    }
  
  }
});

// Styled Components
const StyledCard = styled(Card)(({ theme }) => ({
  borderRadius: 12,
  boxShadow: '0 4px 6px rgba(0,0,0,0.1)',
  transition: 'all 0.3s ease',
  '&:hover': {
    transform: 'translateY(-5px)',
    boxShadow: '0 8px 15px rgba(0,0,0,0.15)'
  }
}));

const GradientButton = styled(Button)(({ theme }) => ({
  background: `linear-gradient(to right, ${theme.palette.primary.light}, ${theme.palette.primary.main})`,
  color: 'white',
  '&:hover': {
    background: `linear-gradient(to right, ${theme.palette.primary.main}, ${theme.palette.primary.dark})`
  }
}));

const StyledTableCell = styled(TableCell)(({ theme }) => ({
  '&.MuiTableCell-head': {
    backgroundColor: theme.palette.primary.main,
    color: theme.palette.common.white,
    fontWeight: 'bold',
    fontSize: 14,
    padding: theme.spacing(2),
  },
  '&.MuiTableCell-body': {
    fontSize: 14,
    padding: theme.spacing(2),
  },
}));

const StyledTableRow = styled(TableRow)(({ theme }) => ({
  '&:nth-of-type(odd)': {
    backgroundColor: theme.palette.action.hover,
  },
  '&:last-child td, &:last-child th': {
    border: 0,
  },
  '&:hover': {
    backgroundColor: theme.palette.action.hover,
  },
}));
const ParishSettings = () => {
  const history = useHistory();

  const StatCard = styled(Box)(({ theme }) => ({
    padding: theme.spacing(3),
    backgroundColor: theme.palette.background.paper,
    borderRadius: theme.shape.borderRadius,
    boxShadow: theme.shadows[1],
    height: '100%',
    display: 'flex',
    flexDirection: 'column',
  }));
  
  const StatTitle = styled(Typography)(({ theme }) => ({
    color: theme.palette.text.secondary,
    marginBottom: theme.spacing(1),
    fontSize: '0.875rem',
  }));
  
  const StatValue = styled(Typography)(({ theme }) => ({
    color: theme.palette.primary.main,
    fontSize: '1.5rem',
    fontWeight: 500,
  }));

  // State declarations
  const [parishData, setParishData] = useState([]);
  const [isLoadingParish, setIsLoadingParish] = useState(true);
  const [hasCollectionChanges, setHasCollectionChanges] = useState(false);
  const [totalPreProportionalShare, setTotalPreProportionalShare] = useState(0);
  const [prePropPercent, setPrePropPercent] = useState(0);
  const [message, setMessage] = useState(null);
  const [totalPrelim, setTotalPrelim] = useState(0);
  const [totalAllocation, setTotalAllocation] = useState(0);
  const [parishAmount, setParishAmount] = useState(0);
  const [modalStates, setModalStates] = useState({
    totalAmount: false,
    changeParish: false,
    slabs: false,
  });
  const [isSaving, setIsSaving] = useState(false);
  const [savedSlabs, setSavedSlabs] = useState([{ maxValue: "0", minValue: 0 }]);
  const [totalBalanceFromDB, setTotalBalanceFromDB] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedForane, setSelectedForane] = useState('all');
  const [foraneList, setForaneList] = useState([]);
  // New balance-related state
  const [yearEndDialog, setYearEndDialog] = useState(false);
  const [yearEndProcessing, setYearEndProcessing] = useState(false);
  const [balanceSheets, setBalanceSheets] = useState({});
  const [totalTransactions, setTotalTransactions] = useState(0);
  const [netBalance, setNetBalance] = useState(0);
  
  const { selectedYear1, formattedYear, startDate, endDate, updateYear } = useFinancialYear();
  const currentYear = selectedYear1;

  // Calculate balance functions
  const calculateCurrentBalance = (allocated, balance) => {
    return (balance?.opening_balance || 0) + 
           (allocated || 0) - 
           (balance?.total_transactions || 0);
  };
// Add this with other utility functions
const calculateTotalAllocation = () => {
  const total = parishData.reduce((acc, parish) => {
    return acc + parseFloat(parish.total || 0);
  }, 0);
  setTotalAllocation(total);
};

const fetchInitialData = async () => {
  setIsLoading(true);
  try {
    await Promise.all([
      fetchParishData(),
      fetchBalanceData(),
      fetchTotalBalance(),
      fetchSlabs()
    ]);
    
    calTotalPreProp();
    calPropPercent();
    calculateTotalAllocation();
  } catch (error) {
    console.error('Error initializing data:', error);
  } finally {
    setIsLoading(false);
  }
};
  const updateBalanceTotals = (data) => {
    const totalTx = data.reduce((sum, parish) => sum + (parish.totalTransactions || 0), 0);
    const netBal = data.reduce((sum, parish) => sum + (parish.currentBalance || 0), 0);
    setTotalTransactions(totalTx);
    setNetBalance(netBal);
  };

  // Fetch balance data
  const fetchBalanceData = async () => {
    try {
      const balanceSheetsResponse = await axiosInstance.get(`/balance/parish/all/${currentYear}`);
      const balanceMap = balanceSheetsResponse.data.reduce((acc, sheet) => {
        acc[sheet.entity_id] = sheet;
        return acc;
      }, {});
      setBalanceSheets(balanceMap);
      
      setParishData(prevData => {
        const updatedData = prevData.map(parish => ({
          ...parish,
          openingBalance: balanceMap[parish.parishId]?.opening_balance || 0,
          totalTransactions: balanceMap[parish.parishId]?.total_transactions || 0,
          currentBalance: calculateCurrentBalance(parish.total, balanceMap[parish.parishId])
        }));
        updateBalanceTotals(updatedData);
        return updatedData;
      });
    } catch (error) {
      console.error('Error fetching balance data:', error);
    }
  };

  // Fetch parish data
  const fetchParishData = async () => {
    try {
      setIsLoadingParish(true);
      
      const savedResponse = await axiosInstance.get(`/parish-allocations/parish-allocations/${currentYear}`);
      
      if (savedResponse.data?.length > 0) {
        const updatedData = savedResponse.data.map(allocation => ({
          name: allocation.name,
          parishId: allocation.parishId,
          collection: allocation.collection,
          fullCollection: allocation.isFullCollection,
          prelim: allocation.prelim,
          pre_prop: allocation.proportionalShare,
          prop: allocation.proportionalShare,
          total: allocation.totalAllocation,
          openingBalance: 0,
          totalTransactions: 0,
          currentBalance: 0
        }));
        
        const totalAllocResponse = await axiosInstance.get(`/totlalloc/parish-allocations/${currentYear}`);
      
        if (totalAllocResponse.data?.success && totalAllocResponse.data?.data) {
          const {
            parishAmount,
            totalPreProportional,
            proportionalSharePercentage,
            totalParishAllocation
          } = totalAllocResponse.data.data;
  
          // Set the saved values from the nested data object
          setParishAmount(parishAmount || 0);
          setPrePropPercent(proportionalSharePercentage || 0);
          setTotalPreProportionalShare(totalPreProportional || 0);
          setTotalAllocation(totalParishAllocation || 0);
        }
        
        setParishData(updatedData);
      } else {
        const response = await axiosInstance.get(
          `/transaction/parish/all-with-transactions/year/${currentYear}`
        );
  
        if (response?.data) {
          const updatedData = response.data.map(({ name, totalAmount = 0, _id }) => ({
            name,
            parishId: _id,
            collection: totalAmount,
            fullCollection: false,
            prelim: 0,
            pre_prop: 0,
            prop: 0,
            total: 0,
            openingBalance: 0,
            totalTransactions: 0,
            currentBalance: 0
          }));
          setParishData(updatedData);
        }
      }
    } catch (error) {
      console.error('Error fetching parish data:', error);
      notification.error({
        message: 'Error',
        description: 'Failed to fetch parish data'
      });
    } finally {
      setIsLoadingParish(false);
    }
  };

  // Collection changes check
  const checkCollectionChanges = async () => {
    try {
      const currentResponse = await axiosInstance.get(
        `/transaction/parish/all-with-transactions/year/${currentYear}`
      );
  
      if (currentResponse.data) {
        const currentTotals = new Map(
          currentResponse.data.map(item => [item.name, parseFloat(item.totalAmount) || 0])
        );
  
        const changes = parishData.map(parish => {
          const newAmount = currentTotals.get(parish.name);
          if (newAmount !== undefined && newAmount !== parish.collection) {
            return {
              name: parish.name,
              oldCollection: parish.collection,
              newCollection: newAmount,
              difference: newAmount - parish.collection
            };
          }
          return null;
        }).filter(Boolean);
  
        if (changes.length > 0) {
          const updatedParishData = parishData.map(parish => {
            const change = changes.find(c => c.name === parish.name);
            if (change) {
              const newTotal = parish.fullCollection ? change.newCollection : parish.total;
              return {
                ...parish,
                collection: change.newCollection,
                total: newTotal,
                currentBalance: calculateCurrentBalance(newTotal, {
                  opening_balance: parish.openingBalance,
                  total_transactions: parish.totalTransactions
                })
              };
            }
            return parish;
          });
  
          setParishData(updatedParishData);
          updateBalanceTotals(updatedParishData);
          setHasCollectionChanges(true);
          setMessage({ 
            type: 'warning', 
            text: `Changes detected in ${changes.length} parishes. Updates have been applied.` 
          });
        } else {
          setMessage({ type: 'info', text: 'No changes detected' });
        }
      }
    } catch (error) {
      console.error('Error checking collection changes:', error);
      setMessage({ type: 'error', text: 'Failed to check for collection changes' });
    }
  };

  // Year end process handler
  const handleYearEnd = async () => {
    try {
      setYearEndProcessing(true);
      await axiosInstance.post(`/balance/year-end/${currentYear}/parish`);
      notification.success({
        message: 'Success',
        description: 'Year-end process completed successfully'
      });
      setYearEndDialog(false);
      await fetchInitialData();
    } catch (error) {
      console.error('Error processing year end:', error);
      notification.error({
        message: 'Error',
        description: 'Failed to process year end'
      });
    } finally {
      setYearEndProcessing(false);
    }
  };
  const fetchForaneData = async () => {
    try {
      const response = await axiosInstance.get('/forane');
      if (response.data) {
        setForaneList(response.data);
      }
    } catch (error) {
      console.error('Error fetching forane data:', error);
      notification.error({
        message: 'Error',
        description: 'Failed to fetch forane data'
      });
    }
  };
  const filteredData = useMemo(() => {
    if (selectedForane === 'all') return parishData;
    return parishData.filter(parish => parish.forane === selectedForane);
  }, [parishData, selectedForane]);
  // Column configuration
  

  // Event handlers
  // const handleFullCollectionToggle = async (parishName) => {
  //   try {
  //     // First update the toggle state and get the updated data
  //     const updatedData = parishData.map(parish => {
  //       if (parish.name === parishName) {
  //         const newFullCollection = !parish.fullCollection;
  //         const newTotal = newFullCollection ? parish.collection : 0;
  //         const newPrelim = newFullCollection ? parish.collection : 0;
  //         return {
  //           ...parish,
  //           fullCollection: newFullCollection,
  //           total: newTotal,
  //           prelim: newPrelim,
  //           pre_prop: 0,
  //           prop: 0,
  //           currentBalance: calculateCurrentBalance(newTotal, {
  //             opening_balance: parish.openingBalance,
  //             total_transactions: parish.totalTransactions
  //           })
  //         };
  //       }
  //       return parish;
  //     });
  
  //     // Set the updated data
  //     await setParishData(updatedData);
      
  //     // Set changes flag
  //     setHasCollectionChanges(true);
  
  //     // Calculate preliminary allocations with the updated data
  //     let totalCollection = 0;
  //     let totalPrelimAllocation = 0;
  
  //     const firstPassData = updatedData.map((parish) => {
  //       totalCollection += parseFloat(parish.collection || 0);
  
  //       if (parish.fullCollection) {
  //         totalPrelimAllocation += parseFloat(parish.prelim || 0);
  //         return {
  //           ...parish,
  //           pre_prop: 0,
  //           prop: 0,
  //           total: parish.prelim,
  //           currentBalance: calculateCurrentBalance(parish.prelim, {
  //             opening_balance: parish.openingBalance,
  //             total_transactions: parish.totalTransactions
  //           })
  //         };
  //       }
  
  //       const matchingSlab = savedSlabs.find(
  //         (slab) =>
  //           slab.minValue <= parish.collection &&
  //           parish.collection <= slab.maxValue
  //       );
  
  //       const maxOfBiggestSlab = Math.max(
  //         ...savedSlabs.map((slab) => slab.maxValue)
  //       );
  
  //       let prelim = 0;
  //       if (matchingSlab) {
  //         prelim = matchingSlab.maxValue;
  //       } else if (parish.collection > maxOfBiggestSlab) {
  //         prelim = maxOfBiggestSlab;
  //       }
  
  //       totalPrelimAllocation += prelim;
  
  //       return {
  //         ...parish,
  //         prelim,
  //         pre_prop: parish.collection - prelim
  //       };
  //     });
  
  //     const amountForProportionate = parishAmount - totalPrelimAllocation;
  
  //     let netCollectionForProportion = firstPassData.reduce((acc, parish) => {
  //       if (!parish.fullCollection && parish.pre_prop > 0) {
  //         return acc + parish.pre_prop;
  //       }
  //       return acc;
  //     }, 0);
  
  //     const proportiontatePercentage = netCollectionForProportion > 0
  //       ? (amountForProportionate / netCollectionForProportion) * 100
  //       : 0;
  
  //     const finalData = firstPassData.map((parish) => {
  //       if (parish.fullCollection) return parish;
  
  //       const proportionalShare = parish.pre_prop > 0
  //         ? parseFloat((parish.pre_prop * proportiontatePercentage / 100).toFixed(2))
  //         : 0;
  
  //       const totalAllocation = parseFloat(parish.prelim) + proportionalShare;
  
  //       return {
  //         ...parish,
  //         prop: proportionalShare,
  //         total: parseFloat(totalAllocation.toFixed(2)),
  //         currentBalance: calculateCurrentBalance(totalAllocation, {
  //           opening_balance: parish.openingBalance,
  //           total_transactions: parish.totalTransactions
  //         })
  //       };
  //     });
  
  //     // Update all states with the final calculated data
  //     setParishData(finalData);
  //     updateBalanceTotals(finalData);
  //     setTotalPreProportionalShare(netCollectionForProportion);
  //     setPrePropPercent(parseFloat(proportiontatePercentage.toFixed(2)));
  //     setTotalPrelim(totalPrelimAllocation);
  //     setTotalAllocation(finalData.reduce((acc, p) => acc + p.total, 0));
  
  //   } catch (error) {
  //     console.error('Error in handleFullCollectionToggle:', error);
  //     notification.error({
  //       message: 'Error',
  //       description: 'Failed to update parish collection status'
  //     });
  //   }
  // };
  const handleFullCollectionToggle = async (parishName) => {
    try {
      // Create a Map for O(1) slab lookup instead of using find()
      const slabMap = new Map();
      const maxOfBiggestSlab = Math.max(...savedSlabs.map(slab => slab.maxValue));
      savedSlabs.forEach(slab => {
        for (let value = slab.minValue; value <= slab.maxValue; value++) {
          slabMap.set(value, slab.maxValue);
        }
      });
  
      // Single pass through the data to calculate everything
      let totalCollection = 0;
      let totalPrelimAllocation = 0;
      let netCollectionForProportion = 0;
      
      const updatedData = parishData.map(parish => {
        if (parish.name === parishName) {
          parish.fullCollection = !parish.fullCollection;
        }
  
        totalCollection += parseFloat(parish.collection || 0);
  
        if (parish.fullCollection) {
          const newTotal = parish.collection;
          totalPrelimAllocation += newTotal;
          
          return {
            ...parish,
            prelim: newTotal,
            pre_prop: 0,
            prop: 0,
            total: newTotal,
            currentBalance: calculateCurrentBalance(newTotal, {
              opening_balance: parish.openingBalance,
              total_transactions: parish.totalTransactions
            })
          };
        }
  
        // Fast slab lookup using Map
        let prelim = 0;
        if (parish.collection <= maxOfBiggestSlab) {
          prelim = slabMap.get(Math.floor(parish.collection)) || 0;
        } else {
          prelim = maxOfBiggestSlab;
        }
  
        totalPrelimAllocation += prelim;
        const pre_prop = parish.collection - prelim;
        
        if (pre_prop > 0) {
          netCollectionForProportion += pre_prop;
        }
  
        return {
          ...parish,
          prelim,
          pre_prop,
          prop: 0, // Will be calculated in the final step
          total: 0  // Will be calculated in the final step
        };
      });
  
      // Calculate proportionate distribution
      const amountForProportionate = parishAmount - totalPrelimAllocation;
      const proportiontatePercentage = netCollectionForProportion > 0
        ? (amountForProportionate / netCollectionForProportion) * 100
        : 0;
  
      // Final pass to calculate proportionate shares and totals
      let totalAllocation = 0;
      const finalData = updatedData.map(parish => {
        if (parish.fullCollection) {
          totalAllocation += parish.total;
          return parish;
        }
  
        const proportionalShare = parish.pre_prop > 0
          ? parseFloat((parish.pre_prop * proportiontatePercentage / 100).toFixed(2))
          : 0;
  
        const totalAllocationParish = parseFloat((parish.prelim + proportionalShare).toFixed(2));
        totalAllocation += totalAllocationParish;
  
        return {
          ...parish,
          prop: proportionalShare,
          total: totalAllocationParish,
          currentBalance: calculateCurrentBalance(totalAllocationParish, {
            opening_balance: parish.openingBalance,
            total_transactions: parish.totalTransactions
          })
        };
      });
  
      // Batch update all states at once
      setParishData(finalData);
      setHasCollectionChanges(true);
      setTotalPreProportionalShare(netCollectionForProportion);
      setPrePropPercent(parseFloat(proportiontatePercentage.toFixed(2)));
      setTotalPrelim(totalPrelimAllocation);
      setTotalAllocation(totalAllocation);
      updateBalanceTotals(finalData);
  
    } catch (error) {
      console.error('Error in handleFullCollectionToggle:', error);
      notification.error({
        message: 'Error',
        description: 'Failed to update parish collection status'
      });
    }
  };
  const fetchSlabs = async () => {
    try {
      setIsLoading(true);
      const response = await axiosInstance.get(`/slabs/${currentYear}`);
      if (response.data && response.data.length > 0) {
        setSavedSlabs(response.data);
      }
    } catch (error) {
      console.error('Error fetching slabs:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const fetchTotalBalance = async () => {
    try {
      setIsLoading(true);
      const response = await axiosInstance.get(`/community-settings/year/${currentYear}`);
      if (response.data) {
        setTotalBalanceFromDB(response.data.balance_after_community || 0);
        setParishAmount(response.data.parish_amount || 0);
      }
    } catch (error) {
      console.error('Error fetching total balance:', error);
    } finally {
      setIsLoading(false);
    }
  };
  const columns = useMemo(() => [
    {
      accessorKey: 'name',
      header: 'Parish Name',
      size: 100,
    },
    {
      accessorKey: 'collection',
      header: 'Collection (₹)',
      type: 'number',
      size: 100,
      Cell: ({ cell }) => (
        <Typography>
          {cell.getValue().toLocaleString('en-IN', { minimumFractionDigits: 2 })}
        </Typography>
      ),
      // Right-align numbers
      muiTableBodyCellProps: {
        align: 'right',
      },
    },
    {
      accessorKey: 'openingBalance',
      header: 'Opening Balance (₹)',
      type: 'number',
      size: 70,
      Cell: ({ cell }) => (
        <Typography>
          {cell.getValue().toLocaleString('en-IN', { minimumFractionDigits: 2 })}
        </Typography>
      ),
      muiTableBodyCellProps: {
        align: 'right',
      },
    },
    {
      accessorKey: 'prelim',
      header: 'Prelim (₹)',
      type: 'number',
      size: 60,
      Cell: ({ cell }) => (
        <Typography>
          {cell.getValue().toLocaleString('en-IN', { minimumFractionDigits: 2 })}
        </Typography>
      ),
      muiTableBodyCellProps: {
        align: 'right',
      },
    },
    {
      accessorKey: 'prop',
      header: 'Proportional (₹)',
      type: 'number',
      size: 80,
      Cell: ({ cell }) => (
        <Typography>
          {cell.getValue().toLocaleString('en-IN', { minimumFractionDigits: 2 })}
        </Typography>
      ),
      muiTableBodyCellProps: {
        align: 'right',
      },
    },
    {
      accessorKey: 'total',
      header: 'Total Allocated (₹)',
      type: 'number',
      Cell: ({ cell }) => (
        <Typography>
          {cell.getValue().toLocaleString('en-IN', { minimumFractionDigits: 2 })}
        </Typography>
      ),
      muiTableBodyCellProps: {
        align: 'right',
      },
    },
    // {
    //   accessorKey: 'totalTransactions',
    //   header: 'Total Transactions (₹)',
    //   type: 'number',
    //   Cell: ({ cell }) => (
    //     <Typography>
    //       {cell.getValue().toLocaleString('en-IN', { minimumFractionDigits: 2 })}
    //     </Typography>
    //   ),
    //   muiTableBodyCellProps: {
    //     align: 'right',
    //   },
    // },
    // {
    //   accessorKey: 'currentBalance',
    //   header: 'Current Balance (₹)',
    //   type: 'number',
    //   Cell: ({ cell }) => {
    //     const value = cell.getValue();
    //     return (
    //       <Typography 
    //         color={value < 0 ? 'error.main' : 'success.main'}
    //       >
    //         {value.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
    //       </Typography>
    //     );
    //   },
    //   muiTableBodyCellProps: {
    //     align: 'right',
    //   },
    // },
    {
      accessorKey: 'fullCollection',
      header: 'Full Collection',
      Cell: ({ row }) => (
        <FormControlLabel
          control={
            <Switch
              checked={row.original.fullCollection}
              onChange={() => handleFullCollectionToggle(row.original.name)}
              disabled={isLoadingParish}
            />
          }
          label=""
        />
      ),
      muiTableBodyCellProps: {
        align: 'center',
      },
    }
  ], [handleFullCollectionToggle, isLoadingParish]);
  // Save handlers
  const handleSaveParishData = async () => {
    setIsSaving(true);
    try {
      const dataToSave = {
        year: currentYear,
        allocations: parishData.map(parish => ({
          parishId: parish.parishId,
          name: parish.name,
          collection: parseFloat(parish.collection) || 0,
          prelim: parseFloat(parish.prelim) || 0,
          proportionalShare: parseFloat(parish.prop) || 0,
          totalAllocation: parseFloat(parish.total) || 0,
          isFullCollection: Boolean(parish.fullCollection)
        }))
      };

      // Save allocations
      const parishResponse = await axiosInstance.post('/parish-allocations/parish-allocations/save-all', dataToSave, {
        headers: {
          'Content-Type': 'application/json'
        },
        timeout: 10000
      });

      // Save balance sheets
      const balanceUpdates = parishData.map(parish => ({
        year: currentYear,
        entity_type: 'parish',
        entity_id: parish.parishId,
        opening_balance: parish.openingBalance,
        allocated_amount: parish.total,
        total_transactions: parish.totalTransactions
      }));

      await axiosInstance.post('/balance/batch-update', {
        balances: balanceUpdates
      });

      // Save total allocations
      const totalAmountResponse = await axiosInstance.put(
        `/totlalloc/parish-allocations/${currentYear}`,
        {
          total_pre_proportional: totalPreProportionalShare,
          proportional_share_percentage: prePropPercent,
          total_parish_allocation: totalAllocation
        }
      );

      if (parishResponse.data.success && totalAmountResponse.data.success) {
        notification.success({
          message: 'Success',
          description: `Successfully saved allocations for ${parishData.length} parishes`
        });
        setHasCollectionChanges(false);
      } else {
        throw new Error(parishResponse.data.message || 'Failed to save all allocations');
      }
    } catch (error) {
      console.error('Error details:', error);
      notification.error({
        message: 'Error Saving Data',
        description: error.message || 'Failed to save parish data'
      });
    } finally {
      setIsSaving(false);
    }
  };

  const handleSaveTotalAmount = (data) => {
    setParishAmount(parseFloat(data.parishAmount));
    setTotalBalanceFromDB(parseFloat(data.balancecommunity));
  };

  const handleSaveSlabs = (slabs) => {
    setSavedSlabs(slabs);
  };

  const assignPrelimAllocation = () => {
    if (!parishData || !Array.isArray(parishData)) return;
  
    let totalCollection = 0;
    let totalPrelimAllocation = 0;
  
    const firstPassData = parishData.map((parish) => {
      totalCollection += parseFloat(parish.collection || 0);
  
      if (parish.fullCollection) {
        totalPrelimAllocation += parseFloat(parish.prelim || 0);
        return {
          ...parish,
          pre_prop: 0,
          prop: 0,
          total: parish.prelim,
          currentBalance: calculateCurrentBalance(parish.prelim, {
            opening_balance: parish.openingBalance,
            total_transactions: parish.totalTransactions
          })
        };
      }
  
      const matchingSlab = savedSlabs.find(
        (slab) =>
          slab.minValue <= parish.collection &&
          parish.collection <= slab.maxValue
      );
  
      const maxOfBiggestSlab = Math.max(
        ...savedSlabs.map((slab) => slab.maxValue)
      );
  
      let prelim = 0;
      if (matchingSlab) {
        prelim = matchingSlab.maxValue;
      } else if (parish.collection > maxOfBiggestSlab) {
        prelim = maxOfBiggestSlab;
      }
  
      totalPrelimAllocation += prelim;
  
      return {
        ...parish,
        prelim,
        pre_prop: parish.collection - prelim
      };
    });
  
    // Rest of your function remains the same
    const amountForProportionate = parishAmount - totalPrelimAllocation;

  let netCollectionForProportion = firstPassData.reduce((acc, parish) => {
    if (!parish.fullCollection && parish.pre_prop > 0) {
      return acc + parish.pre_prop;
    }
    return acc;
  }, 0);

  const proportiontatePercentage = netCollectionForProportion > 0
    ? (amountForProportionate / netCollectionForProportion) * 100
    : 0;

  const finalData = firstPassData.map((parish) => {
    if (parish.fullCollection) return parish;

    const proportionalShare = parish.pre_prop > 0
      ? parseFloat((parish.pre_prop * proportiontatePercentage / 100).toFixed(2))
      : 0;

    const totalAllocation = parseFloat(parish.prelim) + proportionalShare;

    return {
      ...parish,
      prop: proportionalShare,
      total: parseFloat(totalAllocation.toFixed(2)),
      currentBalance: calculateCurrentBalance(totalAllocation, {
        opening_balance: parish.openingBalance,
        total_transactions: parish.totalTransactions
      })
    };
  });

  setParishData(finalData);
  updateBalanceTotals(finalData);
  setTotalPreProportionalShare(netCollectionForProportion);
  setPrePropPercent(parseFloat(proportiontatePercentage.toFixed(2)));
  setTotalPrelim(totalPrelimAllocation);
  setTotalAllocation(finalData.reduce((acc, p) => acc + p.total, 0));
  // setHasCollectionChanges(true);
  };

  // Other utility functions
  const calTotalPreProp = () => {
    const total = parishData.reduce((acc, parish) => {
      if (parish.fullCollection) return acc;
      const value = parseFloat(parish.pre_prop);
      return !isNaN(value) && value > 0 ? acc + value : acc;
    }, 0);
    setTotalPreProportionalShare(total);
  };

  const calTotalPrelim = () => {
    const total = parishData.reduce((acc, parish) => {
      if (parish.fullCollection) return acc;
      return acc + (parish.prelim || 0);
    }, 0);
    setTotalPrelim(total);
  };

  const calPropPercent = () => {
    if (parishAmount > 0 && totalPrelim > 0) {
      const amountForProportionate = parishAmount - totalPrelim;
      const netCollectionForProportion = parishData.reduce((acc, parish) => {
        if (!parish.fullCollection && parish.pre_prop > 0) {
          return acc + parish.pre_prop;
        }
        return acc;
      }, 0);
  
      const percentage = netCollectionForProportion > 0
        ? ((amountForProportionate / netCollectionForProportion) * 100).toFixed(5)
        : 0;
  
      setPrePropPercent(percentage);
    } else {
      setPrePropPercent(0);
    }
  };

  // Effects
  // useEffect(() => {
  //   const initializeData = async () => {
  //     setIsLoading(true);
  //     try {
  //       await Promise.all([
  //         fetchParishData(),
  //         fetchBalanceData(),
  //         fetchTotalBalance(),
  //         fetchSlabs(),
  //         fetchForaneData()
  //       ]);
  //     } catch (error) {
  //       console.error('Error initializing data:', error);
  //     } finally {
  //       setIsLoading(false);
  //     }
  //   };

  //   if (startDate && endDate) {
  //     initializeData();
  //   }
  // }, [currentYear, startDate, endDate]);

  // Main useEffect for data initialization
useEffect(() => {
  if (!startDate || !endDate) return;

  const initializeData = async () => {
    setIsLoading(true);
    try {
      // Fetch all data in parallel
      const [
        parishAllocations,
        totalAllocations,
        transactions,
        balanceSheets,
        totalBalance,
        slabs,
        foraneData
      ] = await Promise.all([
        axiosInstance.get(`/parish-allocations/parish-allocations/${currentYear}`)
          .catch(() => ({ data: [] })),
        axiosInstance.get(`/totlalloc/parish-allocations/${currentYear}`)
          .catch(() => ({ data: { success: false, data: null } })),
        axiosInstance.get(`/transaction/parish/all-with-transactions/year/${currentYear}`)
          .catch(() => ({ data: [] })),
        axiosInstance.get(`/balance/parish/all/${currentYear}`)
          .catch(() => ({ data: [] })),
        axiosInstance.get(`/community-settings/year/${currentYear}`)
          .catch(() => ({ data: {} })),
        axiosInstance.get(`/slabs/${currentYear}`)
          .catch(() => ({ data: [] })),
        axiosInstance.get('/forane')
          .catch(() => ({ data: [] }))
      ]);

      // Process parish data
      let updatedParishData;
      if (parishAllocations.data?.length > 0) {
        updatedParishData = parishAllocations.data.map(allocation => ({
          name: allocation.name,
          parishId: allocation.parishId,
          collection: allocation.collection,
          fullCollection: allocation.isFullCollection,
          prelim: allocation.prelim,
          pre_prop: allocation.proportionalShare,
          prop: allocation.proportionalShare,
          total: allocation.totalAllocation,
          openingBalance: 0,
          totalTransactions: 0,
          currentBalance: 0
        }));

        // Set total allocation data if available
        if (totalAllocations.data?.success && totalAllocations.data?.data) {
          const {
            parishAmount,
            totalPreProportional,
            proportionalSharePercentage,
            totalParishAllocation
          } = totalAllocations.data.data;

          setParishAmount(parishAmount || 0);
          setPrePropPercent(proportionalSharePercentage || 0);
          setTotalPreProportionalShare(totalPreProportional || 0);
          setTotalAllocation(totalParishAllocation || 0);
        }
      } else {
        updatedParishData = transactions.data?.map(({ name, totalAmount = 0, _id }) => ({
          name,
          parishId: _id,
          collection: totalAmount,
          fullCollection: false,
          prelim: 0,
          pre_prop: 0,
          prop: 0,
          total: 0,
          openingBalance: 0,
          totalTransactions: 0,
          currentBalance: 0
        })) || [];
      }

      // Process balance sheets
      const balanceMap = balanceSheets.data.reduce((acc, sheet) => {
        acc[sheet.entity_id] = sheet;
        return acc;
      }, {});

      // Update parish data with balance information
      const finalParishData = updatedParishData.map(parish => ({
        ...parish,
        openingBalance: balanceMap[parish.parishId]?.opening_balance || 0,
        totalTransactions: balanceMap[parish.parishId]?.total_transactions || 0,
        currentBalance: calculateCurrentBalance(parish.total, balanceMap[parish.parishId])
      }));

      // Batch state updates
      setParishData(finalParishData);
      setBalanceSheets(balanceMap);
      updateBalanceTotals(finalParishData);
      setTotalBalanceFromDB(totalBalance.data.balance_after_community || 0);
      setParishAmount(totalBalance.data.parish_amount || 0);
      setSavedSlabs(slabs.data.length > 0 ? slabs.data : []);
      setForaneList(foraneData.data || []);

    } catch (error) {
      console.error('Error initializing data:', error);
      notification.error({
        message: 'Error',
        description: 'Failed to fetch data'
      });
    } finally {
      setIsLoading(false);
      setIsLoadingParish(false);
    }
  };

  initializeData();
}, [currentYear, startDate, endDate]);

  useEffect(() => {
    if (currentYear) {
      const checkInterval = setInterval(checkCollectionChanges, 3600000); // Check every hour
      return () => clearInterval(checkInterval);
    }
  }, [currentYear]);

  useEffect(() => {
    assignPrelimAllocation();
  }, [savedSlabs]);

  // useEffect(() => {
  //   calTotalPreProp();
  //   calTotalPrelim();
  //   calPropPercent();
  //   calculateTotalAllocation();
  // }, [totalPreProportionalShare, parishAmount, totalPrelim, totalBalanceFromDB]);
  useEffect(() => {
    calTotalPreProp();
    calTotalPrelim();
    calculateTotalAllocation();
  }, [totalPreProportionalShare, parishAmount, totalPrelim, totalBalanceFromDB, prePropPercent]);
const totals = useMemo(() => {
    return {
      collection: parishData.reduce((sum, p) => sum + p.collection, 0),
      openingBalance: parishData.reduce((sum, p) => sum + p.openingBalance, 0),
      prelim: totalPrelim,
      prop: parishData.reduce((sum, p) => sum + p.prop, 0),
      total: totalAllocation,
      totalTransactions: totalTransactions,
      currentBalance: netBalance
    };
  }, [parishData, totalPrelim, totalAllocation, totalTransactions, netBalance]);
  // Render component
  const ForaneFilter = () => (
    <FormControl sx={{ minWidth: 200, mb: 2 }}>
      <InputLabel>Filter by Forane</InputLabel>
      <Select
        value={selectedForane}
        onChange={(e) => setSelectedForane(e.target.value)}
        label="Filter by Forane"
      >
        <MenuItem value="all">All Foranes</MenuItem>
        {foraneList.map((forane) => (
          <MenuItem key={forane._id} value={forane.name}>
            {forane.name}
          </MenuItem>
        ))}
      </Select>
    </FormControl>
  );
  // Render component
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Box sx={{ 
        p: 3, 
        bgcolor: 'background.default', 
        minHeight: '100vh',
        background: 'linear-gradient(135deg, rgb(255, 255, 255) 0%, rgb(255, 255, 255) 100%)'
      }}>
        <Backdrop
          sx={{ 
            color: '#fff', 
            zIndex: (theme) => theme.zIndex.drawer + 1,
            backgroundColor: 'rgba(0, 0, 0, 0.7)' 
          }}
          open={isLoadingParish}
        >
          <CircularProgress color="inherit" />
        </Backdrop>
        <Backdrop
          sx={{ 
            color: '#fff', 
            zIndex: (theme) => theme.zIndex.drawer + 1,
            backgroundColor: 'rgba(0, 0, 0, 0.7)',
            display: 'flex',
            flexDirection: 'column',
            gap: 2
          }}
          open={isSaving}
        >
          <CircularProgress color="inherit" />
          <Typography variant="h6">
            Saving Parish Data...
          </Typography>
        </Backdrop>
        <StyledCard sx={{ p: 3, mb: 3 }}>
          <Box sx={{ 
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center'
          }}>
            <Box>
              <Box display="flex" alignItems="center" gap={2} mb={1}>
                <FaChurch style={{ fontSize: 32, color: theme.palette.primary.main }} />
                <Typography variant="h5" sx={{ fontWeight: 700 }}>
                  Parish Settings
                </Typography>
              </Box>
              <Typography variant="body2" color="text.secondary">
                Manage parish allocations and budgets
              </Typography>
            </Box>
            <Box sx={{ display: 'flex', gap: 2 }}>
              <Tooltip title="Refresh Data">
                <IconButton
                  onClick={fetchInitialData}
                  sx={{
                    bgcolor: theme.palette.primary.light + '20',
                    '&:hover': { bgcolor: theme.palette.primary.light + '30' }
                  }}
                >
                  <RefreshIcon sx={{ color: theme.palette.primary.main }} />
                </IconButton>
              </Tooltip>
              <Button
                variant="contained"
                startIcon={<RefreshIcon />}
                onClick={checkCollectionChanges}
                disabled={isLoadingParish}
                color="warning"
                sx={{ borderRadius: 2 }}
              >
                Check Changes
              </Button>
              <Button
                variant="contained"
                startIcon={<EditIcon />}
                onClick={() => setModalStates({ ...modalStates, totalAmount: true })}
                disabled={isLoadingParish}
                sx={{ borderRadius: 2 }}
              >
                Edit Total Amount
              </Button>
              <Button
                variant="contained"
                startIcon={<SettingsIcon />}
                onClick={() => setModalStates({ ...modalStates, slabs: true })}
                disabled={isLoadingParish}
                sx={{ borderRadius: 2 }}
              >
                Slab Settings
              </Button>
              <Button
                variant="contained"
                startIcon={<CalculateIcon />}
                onClick={assignPrelimAllocation}
                disabled={isLoadingParish}
                color="info"
                sx={{ borderRadius: 2 }}
              >
                Calculate
              </Button>
            </Box>
          </Box>
        </StyledCard>

        <Grid container spacing={4} sx={{ mb: 4 }}>
          {[
            { title: 'Amount Allocated For Parish', value: parishAmount },
            { title: 'Proportional Share %', value: prePropPercent, isPercentage: true },
            { title: 'Total Allocation', value: totalAllocation },
            // { title: 'Total Transactions', value: totalTransactions },
            // { title: 'Net Balance', value: netBalance, isBalance: true }
          ].map((item, index) => (
            <Grid item xs={12} md={item.isPercentage ? 4 : 4} key={index}>
              <StyledCard>
                <Box p={3}>
                  <Typography variant="h6" color="text.secondary" gutterBottom>
                    {item.title}
                  </Typography>
                  <Typography 
                    variant="h4" 
                    fontWeight="bold"
                    color={item.isBalance && item.value < 0 ? 'error.main' : 'inherit'}
                  >
                    {isLoadingParish ? (
                      <CircularProgress size={20} />
                    ) : (
                      item.isPercentage 
                        ? `${item.value}%`
                        : `₹${item.value.toLocaleString()}`
                    )}
                  </Typography>
                </Box>
              </StyledCard>
            </Grid>
          ))}
        </Grid>

        {hasCollectionChanges && (
          <Box mb={3}>
            <GradientButton
              fullWidth
              onClick={handleSaveParishData}
              startIcon={<SaveAlt />}
              disabled={isLoadingParish}
            >
              Save Changes
            </GradientButton>
          </Box>
        )}

        <StyledCard>
        {/* <Box sx={{ p: 2 }}>
            <ForaneFilter />
          </Box> */}
        <MaterialReactTable
      columns={columns}
      data={parishData}
      state={{ isLoading }}
      enableBottomToolbar={true}
      enablePagination={true}
      enableColumnFilterModes={false}
      enableColumnOrdering={false}
      enableColumnPinning={false}
      enableDensityToggle={false}
      enableFullScreenToggle={false}
      enableHiding={false}
      enableSorting={true}
      enableColumnActions={false}
      positionPagination="bottom"
      renderTopToolbarCustomActions={() => (
        <Box sx={{ 
          width: '100%', 
          display: 'flex', 
          justifyContent: 'flex-end', 
          p: 2 
        }}>
          <Box sx={{ 
            width: '100%', 
            display: 'flex', 
            justifyContent: 'space-between' 
          }}>
            <Typography fontWeight="bold" color="primary">Total</Typography>
            <Box sx={{ display: 'flex', gap: 2, justifyContent: 'flex-end' }}>
              {Object.keys(totals).map((key) => {
                if (key === 'currentBalance') {
                  return (
                    <Typography
                      key={key}
                      fontWeight="bold"
                      color={totals[key] < 0 ? 'error.main' : 'success.main'}
                    >
                      ₹{totals[key].toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                    </Typography>
                  );
                }
                return (
                  <Typography key={key} fontWeight="bold" color="primary">
                    ₹{totals[key].toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                  </Typography>
                );
              })}
            </Box>
          </Box>
        </Box>
      )}
      muiTablePaginationProps={{
        rowsPerPageOptions: [10, 25, 50, 100],
      }}
      initialState={{
        pagination: {
          pageSize: 10,
        },
      }}
    />
  
        </StyledCard>

        {/* Modals */}
        <TotalAmountModal
          open={modalStates.totalAmount}
          onClose={() => setModalStates({ ...modalStates, totalAmount: false })}
          title="Edit Total Amount"
          totalBalance={totalBalanceFromDB}
          onSave={handleSaveTotalAmount}
        />

        <SlabsModal
          open={modalStates.slabs}
          onClose={() => setModalStates({ ...modalStates, slabs: false })}
          onSave={handleSaveSlabs}
        />

        <Dialog
          open={yearEndDialog}
          onClose={() => setYearEndDialog(false)}
          maxWidth="sm"
          fullWidth
        >
          <DialogTitle sx={{ bgcolor: 'primary.main', color: 'white', p: 2 }}>
            Process Year End
          </DialogTitle>
          <DialogContent sx={{ mt: 2, p: 3 }}>
            <Typography>
              Are you sure you want to process year end? This will:
              <ul>
                <li>Transfer all current balances to next year's opening balances</li>
                <li>Close all transactions for the current year</li>
                <li>Reset allocations for the new year</li>
              </ul>
            </Typography>
          </DialogContent>
          <DialogActions sx={{ p: 3 }}>
            <Button onClick={() => setYearEndDialog(false)}>
              Cancel
            </Button>
            <Button 
              onClick={handleYearEnd}
              color="primary"
              variant="contained"
              disabled={yearEndProcessing}
              sx={{ 
                ml: 2,
                bgcolor: 'secondary.main',
                '&:hover': { bgcolor: 'secondary.dark' }
              }}
            >
              {yearEndProcessing ? <CircularProgress size={24} /> : 'Confirm'}
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
            sx={{ 
              borderRadius: '8px',
              backgroundColor: message?.type === 'error' 
                ? theme.palette.error.main 
                : theme.palette.primary.main,
            }}
          >
            {message?.text}
          </Alert>
        </Snackbar>
      </Box>
    </ThemeProvider>
  );
};

export default ParishSettings;