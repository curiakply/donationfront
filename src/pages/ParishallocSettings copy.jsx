import { useState, useEffect } from "react";
import { useHistory } from "react-router-dom";
import axiosInstance from "../axiosConfig.jsx";
import {
  Box,
  AppBar,
  Toolbar,
  Typography,
  Container,
  Card,
  CardContent,
  Grid,
  Button,
  Stack,
  Switch,
  FormControlLabel,
  CircularProgress,
  Backdrop
} from "@mui/material";
import { Save as SaveIcon } from "@mui/icons-material";
import {
  Edit as EditIcon,
  Settings as SettingsIcon,
  Calculate as CalculateIcon,
  Refresh as RefreshIcon
} from "@mui/icons-material";
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
  const [totalPrelim, setTotalPrelim] = useState(0);
  const [totalAllocation, setTotalAllocation] = useState(0);
  const [parishAmount, setParishAmount] = useState(0);
  const [modalStates, setModalStates] = useState({
    totalAmount: false,
    changeParish: false,
    slabs: false,
  });
  const [savedSlabs, setSavedSlabs] = useState([{ maxValue: "0", minValue: 0 }]);
  const [totalBalanceFromDB, setTotalBalanceFromDB] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  
  const { selectedYear1, formattedYear, startDate, endDate, updateYear } = useFinancialYear();
  const currentYear = selectedYear1;

  // Fetch parish data with saved allocations check
  const fetchParishData = async () => {
    try {
      setIsLoadingParish(true);
      
      // First try to get saved allocations
      const savedResponse = await axiosInstance.get(`/parish-allocations/parish-allocations/${currentYear}`);
      
      if (savedResponse.data?.length > 0) {
        setParishData(
          savedResponse.data.map(allocation => ({
            name: allocation.name,
            parishId: allocation.parishId,
            collection: allocation.collection,
            fullCollection: allocation.isFullCollection,
            prelim: allocation.prelim,
            pre_prop: allocation.proportionalShare,
            prop: allocation.proportionalShare,
            total: allocation.totalAllocation
          }))
        );
      } else {
        const response = await axiosInstance.get(
          `/transaction/parish/all-with-transactions/year/${currentYear}`
        );

        if (response?.data) {
          setParishData(
            response.data.map(({ name, totalAmount = 0, _id }) => ({
              name,
              parishId: _id,
              collection: totalAmount,
              fullCollection: false,
              prelim: 0,
              pre_prop: 0,
              prop: 0,
              total: 0
            }))
          );
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

  // Check for collection changes
  const checkCollectionChanges = async () => {
    try {
      // Get current transaction totals
      const currentResponse = await axiosInstance.get(
        `/transaction/parish/all-with-transactions/year/${currentYear}`
      );
  
      if (currentResponse.data) {
        const currentTotals = new Map(
          currentResponse.data.map(item => [item.name, parseFloat(item.totalAmount) || 0])
        );
  
        // Check for changes by comparing with current parishData
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
          // Update parishData with new collections
          const updatedParishData = parishData.map(parish => {
            const change = changes.find(c => c.name === parish.name);
            if (change) {
              // // Log the change being applied
              // console.log(`Updating ${parish.name}:`, {
              //   oldCollection: parish.collection,
              //   newCollection: change.newCollection
              // });
              
              return {
                ...parish,
                collection: change.newCollection,
                // If full collection, update total as well
                total: parish.fullCollection ? change.newCollection : parish.total
              };
            }
            return parish;
          });
  
          // Set updated data
          setParishData(updatedParishData);
          setHasCollectionChanges(true);
  
          // Trigger recalculations
          
  
          // Show notification
          notification.warning({
            message: 'Collection Changes Detected',
            description: (
              <div>
                <p>Changes detected in {changes.length} parishes:</p>
                <ul style={{ maxHeight: '200px', overflowY: 'auto' }}>
                  {changes.map((change, index) => (
                    <li key={index}>
                      {change.name}: 
                      ₹{change.oldCollection.toLocaleString()} → 
                      ₹{change.newCollection.toLocaleString()}
                    </li>
                  ))}
                </ul>
                <p>Updates have been applied. Please review the changes.</p>
              </div>
            ),
            duration: 0
          });
        }
      }
    } catch (error) {
      console.error('Error checking collection changes:', error);
      notification.error({
        message: 'Error',
        description: 'Failed to check for collection changes'
      });
    }
  };

  // Columns configuration
  const columns = [
    {
      accessorKey: 'name',
      header: 'Parish',
    },
    {
      accessorKey: 'collection',
      header: 'Collection',
      Cell: ({ cell }) => `₹ ${cell.getValue().toLocaleString()}`,
    },
    {
      accessorKey: 'prelim',
      header: 'Prelim Allocation',
      Cell: ({ cell }) => `₹ ${cell.getValue().toLocaleString()}`,
    },
    {
      accessorKey: 'prop',
      header: 'Proportional Share Amount',
      Cell: ({ cell }) => `₹ ${parseFloat(cell.getValue()).toLocaleString()}`,
    },
    {
      accessorKey: 'total',
      header: 'Total Allocated',
      Cell: ({ cell }) => `₹ ${parseFloat(cell.getValue()).toLocaleString()}`,
    },
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
    },
  ];

  // Event handlers
  const handleFullCollectionToggle = (parishName) => {
    setParishData(prevData => {
      const newData = prevData.map(parish => {
        if (parish.name === parishName) {
          const newFullCollection = !parish.fullCollection;
          return {
            ...parish,
            fullCollection: newFullCollection,
            total: newFullCollection ? parish.collection : 0,
            prelim: 0,
            pre_prop: 0,
            prop: 0
          };
        }
        return parish;
      });
   
      setTimeout(() => {
        let totalPrelimAllocation = 0;
   
        const firstPassData = newData.map((parish) => {
          if (parish.fullCollection) {
            return parish;
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
   
        // Use parish_amount from database
        const amountForProportionate = parishAmount - totalPrelimAllocation;
        console.log(parishAmount);
        console.log(totalPrelimAllocation);
        console.log(amountForProportionate);
        
        let netCollectionForProportion = firstPassData.reduce((acc, parish) => {
          if (!parish.fullCollection && parish.pre_prop > 0) {
            return acc + parish.pre_prop;
          }
          return acc;
        }, 0);
   
        const proportiontatePercentage = (amountForProportionate / netCollectionForProportion) * 100;
        

        const finalData = firstPassData.map((parish) => {
          if (parish.fullCollection) return parish;
       
          const proportionalShare = parish.pre_prop > 0           
            ? parseFloat((parish.pre_prop * proportiontatePercentage / 100).toFixed(2))
            : 0;
   
          const totalAllocation = parseFloat(parish.prelim) + proportionalShare;
   
          return {
            ...parish,
            prop: proportionalShare,
            total: parseFloat(totalAllocation.toFixed(2))
          };
        });
   
        setParishData(finalData);
        setTotalPreProportionalShare(netCollectionForProportion);
        setPrePropPercent(parseFloat(proportiontatePercentage.toFixed(5)));
        setTotalPrelim(totalPrelimAllocation);
        setTotalAllocation(finalData.reduce((acc, p) => acc + p.total, 0));
      }, 0);
   
      return newData;
    });
   };

  // Other functions remain the same
  const calculateTotalAllocation = () => {
    const total = parishData.reduce((acc, parish) => {
      return acc + parseFloat(parish.total || 0);
    }, 0);
    setTotalAllocation(total);
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

  const handleSaveParishData = async () => {
    try {
      // Log the data being sent
      // console.log('Data being sent:', parishData);
      
      // Prepare data for saving
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
  
      // Send data to backend
      const parishResponse  = await axiosInstance.post('/parish-allocations/parish-allocations/save-all', dataToSave, {
        headers: {
          'Content-Type': 'application/json'
        },
        timeout: 10000 // 10 second timeout
      });
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
      console.error('Error details:', {
        message: error.message,
        parishResponse: error.parishResponse?.data,
        status: error.parishResponse?.status,
        config: error.config
      });
  
      let errorMessage = 'Failed to save parish allocations';
      if (error.code === 'ERR_NETWORK') {
        errorMessage = 'Network error. Please check your connection and try again.';
      } else if (error.parishResponse?.data?.message) {
        errorMessage = error.parishResponse.data.message;
      }
  
      notification.error({
        message: 'Error Saving Data',
        description: errorMessage
      });
    }
  };

  // Rest of the functions remain the same
  const handleSaveTotalAmount = (data) => {
    setParishAmount(parseFloat(data.parishAmount));
    setTotalBalanceFromDB(parseFloat(data.balancecommunity));
  };

  const handleSaveSlabs = (slabs) => {
    setSavedSlabs(slabs);
  };

  const assignPrelimAllocation = () => {
    let totalCollection = 0;
    let totalPrelimAllocation = 0;
   
    const firstPassData = parishData.map((parish) => {
      totalCollection += parseFloat(parish.collection || 0);
      
      if (parish.fullCollection) {
        return {
          ...parish,
          prelim: 0,
          pre_prop: 0,
          prop: 0,
          total: parish.collection
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
   
    // Use parish_amount from database
    const amountForProportionate = parishAmount - totalPrelimAllocation;
  
    let netCollectionForProportion = firstPassData.reduce((acc, parish) => {
      if (!parish.fullCollection && parish.pre_prop > 0) {
        return acc + parish.pre_prop;
      }
      return acc;
    }, 0);
   
    const proportiontatePercentage = (amountForProportionate / netCollectionForProportion) * 100;
   
    const finalData = firstPassData.map((parish) => {
      if (parish.fullCollection) return parish;
   
      const proportionalShare = parish.pre_prop > 0 
        ? parseFloat((parish.pre_prop * proportiontatePercentage / 100).toFixed(2))
        : 0;
   
      const totalAllocation = parseFloat(parish.prelim) + proportionalShare;
   
      return {
        ...parish,
        prop: proportionalShare,
        total: parseFloat(totalAllocation.toFixed(2))
      };
    });
   
    setParishData(finalData);
    setTotalPreProportionalShare(netCollectionForProportion);
    setPrePropPercent(parseFloat(proportiontatePercentage.toFixed(5)));
    setTotalPrelim(totalPrelimAllocation);
    setTotalAllocation(finalData.reduce((acc, p) => acc + p.total, 0));
   };

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
    if (parishAmount > 0 && totalPrelim > 0 && totalPreProportionalShare > 0) {
      const percentage = (
        ((parishAmount - totalPrelim) / totalPreProportionalShare) *
        100
      ).toFixed(5);
      setPrePropPercent(percentage);
    } else {
      setPrePropPercent(0);
    }
  };

  // Effects
  useEffect(() => {
    if (currentYear) {
      const checkInterval = setInterval(checkCollectionChanges, 3600000); // Check every hour
      return () => clearInterval(checkInterval);
    }
  }, [currentYear]);

  useEffect(() => {
    const initializeData = async () => {
      setIsLoading(true);
      try {
        await Promise.all([
          fetchParishData(),
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

    if (startDate && endDate) {
      initializeData();
    }

}, [currentYear, startDate, endDate]);

    useEffect(() => {
      assignPrelimAllocation();
    }, [savedSlabs]);
  
    useEffect(() => {
      calTotalPreProp();
      calTotalPrelim();
      calPropPercent();
      calculateTotalAllocation();
    }, [totalPreProportionalShare, parishAmount, totalPrelim, totalBalanceFromDB]);
  
    // Render component
    return (
      <Box sx={{ bgcolor: 'background.default', minHeight: '100vh' }}>
        {/* Loading Overlay */}
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
  
        <AppBar position="static">
          <Toolbar>
            <Typography variant="h6" component="h1" sx={{ flexGrow: 1, textAlign: 'center' }}>
              Parish Settings
            </Typography>
          </Toolbar>
        </AppBar>
  
        <Container maxWidth="xl" sx={{ py: 3 }}>
          <Card sx={{ mb: 3 }}>
            <CardContent>
              <Grid container spacing={3}>
                <Grid item xs={12} md={3}>
                  <StatCard>
                    <StatTitle>Amount Allocated For Parish</StatTitle>
                    <StatValue>
                      {isLoadingParish ? (
                        <CircularProgress size={20} />
                      ) : (
                        `₹ ${parishAmount.toLocaleString()}`
                      )}
                    </StatValue>
                  </StatCard>
                </Grid>
                <Grid item xs={12} md={3}>
                  <StatCard>
                    <StatTitle>Total Pre-Proportional Amount</StatTitle>
                    <StatValue>
                      {isLoadingParish ? (
                        <CircularProgress size={20} />
                      ) : (
                        `₹ ${totalPreProportionalShare.toLocaleString()}`
                      )}
                    </StatValue>
                  </StatCard>
                </Grid>
                <Grid item xs={12} md={3}>
                  <StatCard>
                    <StatTitle>Proportional Share %</StatTitle>
                    <StatValue>
                      {isLoadingParish ? (
                        <CircularProgress size={20} />
                      ) : (
                        `${prePropPercent}%`
                      )}
                    </StatValue>
                  </StatCard>
                </Grid>
                <Grid item xs={12} md={3}>
                  <StatCard>
                    <StatTitle>Total Allocation</StatTitle>
                    <StatValue>
                      {isLoadingParish ? (
                        <CircularProgress size={20} />
                      ) : (
                        `₹ ${totalAllocation.toLocaleString()}`
                      )}
                    </StatValue>
                  </StatCard>
                </Grid>
              </Grid>
            </CardContent>
          </Card>
  
          <Card sx={{ mb: 3 }}>
            <CardContent>
              <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
                <Button
                  variant="contained"
                  startIcon={<RefreshIcon />}
                  onClick={checkCollectionChanges}
                  disabled={isLoadingParish}
                >
                  Check Changes
                </Button>
                <Button
                  variant="contained"
                  startIcon={<EditIcon />}
                  onClick={() => setModalStates({ ...modalStates, totalAmount: true })}
                  disabled={isLoadingParish}
                >
                  Edit Total Amount
                </Button>
                <Button
                  variant="contained"
                  startIcon={<SettingsIcon />}
                  onClick={() => setModalStates({ ...modalStates, slabs: true })}
                  disabled={isLoadingParish}
                >
                  Slab Settings
                </Button>
                <Button
                  variant="contained"
                  startIcon={<CalculateIcon />}
                  onClick={assignPrelimAllocation}
                  disabled={isLoadingParish}
                >
                  Calculate
                </Button>
                <Button
                  variant="contained"
                  startIcon={<SaveIcon />}
                  onClick={handleSaveParishData}
                  disabled={isLoadingParish}
                  color={hasCollectionChanges ? "warning" : "primary"}
                >
                  Save Parish Data
                </Button>
              </Stack>
            </CardContent>
          </Card>
  
          <Card>
            <CardContent>
              <MaterialReactTable
                columns={columns}
                data={parishData}
                state={{ 
                  isLoading: isLoadingParish,
                }}
                enableColumnResizing
                enablePagination={false}
                enableBottomToolbar={false}
                muiTableContainerProps={{
                  sx: { maxHeight: '500px' }
                }}
                muiTableHeadCellProps={{
                  sx: {
                    fontWeight: 'bold',
                    backgroundColor: 'rgba(0, 0, 0, 0.04)'
                  }
                }}
                renderEmptyRowsFallback={() => 
                  isLoadingParish ? (
                    <Box 
                      sx={{ 
                        display: 'flex', 
                        justifyContent: 'center', 
                        alignItems: 'center',
                        height: '300px' 
                      }}
                    >
                      <CircularProgress />
                    </Box>
                  ) : (
                    <Typography 
                      sx={{ 
                        textAlign: 'center', 
                        py: 3 
                      }}
                    >
                      No data found
                    </Typography>
                  )
                }
                renderDetailPanel={({ row }) => (
                  <Box sx={{ p: 2 }}>
                    <Typography variant="subtitle1" fontWeight="bold">
                      Total Prelim: ₹ {totalPrelim.toLocaleString()}
                    </Typography>
                  </Box>
                )}
              />
            </CardContent>
          </Card>
  
          <TotalAmountModal
            open={modalStates.totalAmount}
            onClose={() => setModalStates({ ...modalStates, totalAmount: false })}
            title="Edit Total Amount"
            totalBalance={totalBalanceFromDB}
            onSave={handleSaveTotalAmount}
          />
  
          <Modal
            title="Change Specific Parish"
            open={modalStates.changeParish}
            onCancel={() => setModalStates({ ...modalStates, changeParish: false })}
            footer={null}
          >
            <p>Content for changing specific parish goes here.</p>
          </Modal>
  
          <SlabsModal
            open={modalStates.slabs}
            onClose={() => setModalStates({ ...modalStates, slabs: false })}
            onSave={handleSaveSlabs}
          />
        </Container>
      </Box>
    );
  };
  
  export default ParishSettings;