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
} from "@mui/material";
import { Save as SaveIcon } from "@mui/icons-material";
import {
  Edit as EditIcon,
  Settings as SettingsIcon,
  Calculate as CalculateIcon,
} from "@mui/icons-material";
import { MaterialReactTable } from "material-react-table";
import { styled } from "@mui/material/styles";
import {
  Layout,
  Space,
  Statistic,
  Modal,
  Row,
  Col
} from "antd";
import { SettingOutlined, CalculatorOutlined, EditOutlined } from "@ant-design/icons";
import TotalAmountModal from "../components/TotalAmountModal.jsx";
import SlabsModal from "../components/SlabsModal.jsx";
import parishSettingsData from "../assets/parishSettings.js";
import "../assets/styles/responsive.css";
import { useFinancialYear } from './FinancialYearContext.jsx';
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

  // Initialize state with fullCollection flag
  const [parishData, setParishData] = useState(
    parishSettingsData.map(parish => ({
      ...parish,
      fullCollection: false,
      prelim: 0,
      pre_prop: 0,
      prop: 0,
      total: 0
    }))
  );

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
            />
          }
          label=""
        />
      ),
    },
  ];

  const handleFullCollectionToggle = (parishName) => {
    setParishData(prevData =>
      prevData.map(parish => {
        if (parish.name === parishName) {
          const newFullCollection = !parish.fullCollection;
          return {
            ...parish,
            fullCollection: newFullCollection,
            // If turning on full collection, set total to collection amount
            total: newFullCollection ? parish.collection : 0,
            // Reset other values if turning on full collection
            prelim: 0,
            pre_prop: 0,
            prop: 0
          };
        }
        return parish;
      })
    );
    
    // Recalculate after toggle
    setTimeout(() => {
      calTotalPreProp();
      calTotalPrelim();
      calPropPercent();
      calculateTotalAllocation();
    }, 0);
  };

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
      setIsLoading(false);
    } catch (error) {
      console.error('Error fetching slabs:', error);
      setIsLoading(false);
    }
  };

  const fetchTotalBalance = async () => {
    try {
      setIsLoading(true);
      const response = await axiosInstance.get(`/community-settings/year/${currentYear}`);
      if (response.data) {
        const amount = response.data.parish_amount || 0;
        const amount1 = response.data.balance_after_community || 0;
        setTotalBalanceFromDB(amount1);
        setParishAmount(amount);
      }
      setIsLoading(false);
    } catch (error) {
      console.error('Error fetching total balance:', error);
      setIsLoading(false);
    }
  };

  const handleSaveParishData = async () => {
    try {
      const response = await axiosInstance.post('/parishdata/save-data', { parishData });
      console.log('Parish data saved successfully');
    } catch (error) {
      console.error('Error saving parish data:', error);
    }
  };

  const handleSaveTotalAmount = (data) => {
    const totalAmount = parseFloat(data.parishAmount);
    const totalAmount1 = parseFloat(data.balancecommunity);
    setParishAmount(totalAmount);
    setTotalBalanceFromDB(totalAmount1);
  };

  const handleSaveSlabs = (slabs) => {
    setSavedSlabs(slabs);
  };

  const assignPrelimAllocation = () => {
    const updatedParishData = parishData.map((parish) => {
      // For full collection parishes, return collection as total
      if (parish.fullCollection) {
        return {
          ...parish,
          prelim: 0,
          pre_prop: 0,
          prop: 0,
          total: parish.collection
        };
      }

      // Skip calculation for zero collection
      if (parish.collection === 0) {
        return { ...parish, prelim: 0, pre_prop: 0, prop: 0, total: 0 };
      }

      const matchingSlab = savedSlabs.find(
        (slab) =>
          slab.minValue <= parish.collection &&
          parish.collection <= slab.maxValue
      );

      const maxOfBiggestSlab = Math.max(
        ...savedSlabs.map((slab) => slab.maxValue)
      );

      let prelim = parish.prelim;
      if (matchingSlab) {
        prelim = matchingSlab.maxValue;
      } else if (parish.collection > maxOfBiggestSlab) {
        prelim = maxOfBiggestSlab;
      }

      const pre_prop = prelim > 0 && parish.collection - prelim > 0
        ? (parish.collection - prelim).toFixed(0)
        : 0;

      const propValue = prePropPercent > 0
        ? (parseFloat(pre_prop) * (prePropPercent / 100)).toFixed(2)
        : 0;

      const totalValue = parseFloat(prelim) + parseFloat(propValue);

      return {
        ...parish,
        prelim,
        pre_prop,
        prop: propValue,
        total: totalValue.toFixed(2)
      };
    });
    
    setParishData(updatedParishData);
    calTotalPreProp();
    calTotalPrelim();
    calPropPercent();
    calculateTotalAllocation();
  };

  const calTotalPreProp = () => {
    const total = parishData.reduce((acc, parish) => {
      // Skip full collection parishes
      if (parish.fullCollection) return acc;
      
      const value = parseFloat(parish.pre_prop);
      return !isNaN(value) && value > 0 ? acc + value : acc;
    }, 0);
    setTotalPreProportionalShare(total);
  };

  const calTotalPrelim = () => {
    const total = parishData.reduce((acc, parish) => {
      // Skip full collection parishes
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

  useEffect(() => {
    fetchTotalBalance();
    fetchSlabs();
    calTotalPreProp();
    calPropPercent();
    calculateTotalAllocation();
  }, []);

  useEffect(() => {
    assignPrelimAllocation();
  }, [savedSlabs]);

  useEffect(() => {
    calTotalPreProp();
    calTotalPrelim();
    calPropPercent();
    calculateTotalAllocation();
  }, [totalPreProportionalShare, parishAmount, totalPrelim, totalBalanceFromDB]);

  return (
    <Box sx={{ bgcolor: 'background.default', minHeight: '100vh' }}>
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
                  <StatValue>₹ {parishAmount.toLocaleString()}</StatValue>
                </StatCard>
              </Grid>
              <Grid item xs={12} md={3}>
                <StatCard>
                  <StatTitle>Total Pre-Proportional Amount</StatTitle>
                  <StatValue>₹ {totalPreProportionalShare.toLocaleString()}</StatValue>
                </StatCard>
              </Grid>
              <Grid item xs={12} md={3}>
                <StatCard>
                  <StatTitle>Proportional Share %</StatTitle>
                  <StatValue>{prePropPercent}%</StatValue>
                </StatCard>
              </Grid>
              <Grid item xs={12} md={3}>
                <StatCard>
                  <StatTitle>Total Allocation</StatTitle>
                  <StatValue>₹ {totalAllocation.toLocaleString()}</StatValue>
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
                startIcon={<EditIcon />}
                onClick={() => setModalStates({ ...modalStates, totalAmount: true })}
              >
                Edit Total Amount
              </Button>
            
              <Button
                variant="contained"
                startIcon={<SettingsIcon />}
                onClick={() => setModalStates({ ...modalStates, slabs: true })}
              >
                Slab Settings
              </Button>
              <Button
                variant="contained"
                startIcon={<CalculateIcon />}
                onClick={assignPrelimAllocation}
              >
                Calculate
              </Button>
              <Button
                variant="contained"
                startIcon={<SaveIcon />}
                onClick={handleSaveParishData}
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