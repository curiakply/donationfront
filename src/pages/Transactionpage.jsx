import React, { useState, useEffect,useMemo } from 'react';
import { 
  ThemeProvider, 
  createTheme, 
  CssBaseline 
} from '@mui/material';
import axiosInstance from "../axiosConfig.jsx";
import {
  Box,
  Container,
  Paper,
  Typography,
  TextField,
  RadioGroup,
  Radio,
  FormControlLabel,
  Button,
  Grid,
  FormControl,
  InputAdornment,
  AppBar,
  Toolbar,
  Snackbar,
  Alert,
  Card,
  CardContent,
  Tab,
  Tabs,
} from '@mui/material';
import {  IconButton, Tooltip } from '@mui/material';
import { Delete, Edit, Print } from '@mui/icons-material';
import { MaterialReactTable } from 'material-react-table';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import Select from 'react-select';
import { styled } from '@mui/material/styles';
import dayjs from 'dayjs';
import { MonetizationOn as MoneyIcon } from '@mui/icons-material';
import { Form, Input } from 'antd';
import "../assets/styles/responsive.css";
import { useFinancialYear } from './FinancialYearContext';
const theme = createTheme({
  palette: {
    mode: 'light',
    primary: {
      main: '#2563EB',     // Vibrant Blue
      light: '#3B82F6',
      dark: '#1E40AF'
    },
    secondary: {
      main: '#10B981',     // Emerald Green
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
    fontFamily: [
      'Inter', 
      'system-ui', 
      '-apple-system', 
      'BlinkMacSystemFont', 
      'Segoe UI', 
      'Roboto', 
      'Helvetica Neue', 
      'Arial', 
      'sans-serif'
    ].join(','),
    h6: {
      fontWeight: 600,
      letterSpacing: '0.5px'
    }
  },
  components: {
    MuiCard: {
      styleOverrides: {
        root: {
          borderRadius: 12,
          boxShadow: '0 4px 6px rgba(0,0,0,0.1)',
          transition: 'all 0.3s ease',
          '&:hover': {
            transform: 'translateY(-5px)',
            boxShadow: '0 8px 15px rgba(0,0,0,0.15)'
          }
        }
      }
    },
    MuiButton: {
      styleOverrides: {
        root: {
          textTransform: 'none',
          borderRadius: 8,
          padding: '10px 20px',
          fontWeight: 600
        }
      }
    }
  }
});

// Styled Components
const GradientButton = styled(Button)(({ theme }) => ({
  background: `linear-gradient(to right, ${theme.palette.primary.light}, ${theme.palette.primary.main})`,
  color: 'white',
  '&:hover': {
    background: `linear-gradient(to right, ${theme.palette.primary.main}, ${theme.palette.primary.dark})`
  }
}));

const AnimatedPaper = styled(Paper)(({ theme }) => ({
  borderRadius: 12,
  padding: theme.spacing(3),
  background: `linear-gradient(145deg, ${theme.palette.primary.light}, ${theme.palette.primary.main})`,
  color: theme.palette.primary.contrastText,
  transition: 'transform 0.3s ease',
  '&:hover': {
    transform: 'scale(1.02)'
  }
}));

// Styled components 
const StyledContainer = styled(Container)(({ theme }) => ({
  marginTop: theme.spacing(4),
  marginBottom: theme.spacing(4),
}));

const StyledCard = styled(Card)(({ theme }) => ({
  marginBottom: theme.spacing(3),
}));

const StyledFormControl = styled(FormControl)(({ theme }) => ({
  minWidth: '100%',
}));

const TransactionPage = () => {
  
  // State for tabs
  const [activeTab, setActiveTab] = useState(0);
  const [transactions, setTransactions] = useState([]);
  
  // Transaction Entry States
  const [form] = Form.useForm();
  const [transactionType, setTransactionType] = useState(null);
  const [selectedEntity, setSelectedEntity] = useState(null);
  const [currentBalance, setCurrentBalance] = useState(0);
  const [options, setOptions] = useState([]);
  const [paymentMethod, setPaymentMethod] = useState('cash');
  const [otherProjectType, setOtherProjectType] = useState('parish');
  const [selectedParish, setSelectedParish] = useState(null);
  const [familyOptions, setFamilyOptions] = useState([]);
  const [communities, setCommunities] = useState([]);
  const [projects, setProjects] = useState([]);
  const [parishes, setParishes] = useState([]);
  const [families, setFamilies] = useState({});
  const [voucherNumber, setVoucherNumber] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const { selectedYear1, formattedYear, startDate, endDate, updateYear } = useFinancialYear();
  const currentYear = selectedYear1;
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: '',
    severity: 'success'
  });

  // Tab change handler
  const handleTabChange = (event, newValue) => {
    setActiveTab(newValue);
    if (newValue === 1) {
      fetchTransactions();
    }
  };

  // Transaction list columns configuration
  const columns = useMemo(
    () => [
      {
        accessorKey: 'voucher_no',
        header: 'Voucher No',
      },
      {
        accessorKey: 'date',
        header: 'Date',
        Cell: ({ cell }) => dayjs(cell.getValue()).format('DD/MM/YYYY'),
      },
      {
        accessorKey: 'transaction_type',
        header: 'Type',
      },
      {
        accessorKey: 'amount',
        header: 'Amount',
        Cell: ({ cell }) =>
          `₹${cell
            .getValue()
            .toLocaleString('en-IN', { minimumFractionDigits: 2 })}`,
      },
      {
        accessorKey: 'payment_method',
        header: 'Payment Method',
        Cell: ({ cell }) =>
          cell.getValue().charAt(0).toUpperCase() +
          cell.getValue().slice(1),
      },
      {
        accessorKey: 'description',
        header: 'Description',
      },
      // {
      //   accessorKey: 'balance_before',
      //   header: 'Balance Before',
      //   Cell: ({ cell }) =>
      //     `₹${cell
      //       .getValue()
      //       .toLocaleString('en-IN', { minimumFractionDigits: 2 })}`,
      // },
      // {
      //   accessorKey: 'balance_after',
      //   header: 'Balance After',
      //   Cell: ({ cell }) =>
      //     `₹${cell
      //       .getValue()
      //       .toLocaleString('en-IN', { minimumFractionDigits: 2 })}`,
      // },
      {
        accessorKey: 'status',
        header: 'Status',
        Cell: ({ cell }) => (
          <span
            className={`px-2 py-1 rounded-full ${
              cell.getValue() === 'completed'
                ? 'bg-green-100 text-green-800'
                : 'bg-yellow-100 text-yellow-800'
            }`}
          >
            {cell.getValue().charAt(0).toUpperCase() +
              cell.getValue().slice(1)}
          </span>
        ),
      },
    ],
    []
  );

  const fetchTransactions = async () => {
    setIsLoading(true);
    try {
      const response = await axiosInstance.get('/transactionRoutes/gettransactions');
     
      
      if (response.data && response.data.data && Array.isArray(response.data.data)) {
        setTransactions(response.data.data);
      } else {
        console.error('Invalid API response format');
      }
    } catch (error) {
      console.error('Error fetching transactions:', error);
      showMessage('Error loading transactions: ' + error.message, 'error');
    } finally {
      setIsLoading(false);
    }
  };
  const validateAmount = (_, value) => {
    // Check if this is an update (form has an id field)
    const isUpdate = form.getFieldValue('id');
    
    if (value && value <= 0) {
      return Promise.reject('Amount must be greater than 0');
    }
    
    // Only check balance for new transactions
    if (!isUpdate && value && value > currentBalance) {
      return Promise.reject('Amount cannot exceed current balance');
    }
    
    return Promise.resolve();
  };
  const handleEdit = async (transactionData) => {
    setIsLoading(true);
    try {
      // Switch to transaction entry tab
      setActiveTab(0);
      
      // Set transaction type first
      setTransactionType(transactionData.transaction_type);
      setPaymentMethod(transactionData.payment_method);
      
      // Wait for options to be set based on transaction type
      await new Promise(resolve => setTimeout(resolve, 0));
      
      // Set form values that don't depend on async operations
      form.setFieldsValue({
        id: transactionData._id,
        voucherNo: transactionData.voucher_no,
        date: dayjs(transactionData.date),
        amount: transactionData.amount,
        description: transactionData.description,
        paymentMethod: transactionData.payment_method,
        transactionNumber: transactionData.transaction_number,
        transactionType: transactionData.transaction_type
      });
  
      // Handle different transaction types
      switch (transactionData.transaction_type) {
        case 'community':
          const selectedCommunity = communities.find(c => c.value === transactionData.community_id._id);
          if (selectedCommunity) {
            setSelectedEntity(selectedCommunity);
            form.setFieldsValue({ entity: selectedCommunity });
            const { data: communityData } = await axiosInstance.get(`/balance/community/${selectedCommunity.value}/balance`);
            setCurrentBalance(communityData.balance || 0);
          }
          break;
  
        case 'otherProject':
          const selectedProject = projects.find(p => p.value === transactionData.fund_id._id);
          if (selectedProject) {
            setSelectedEntity(selectedProject);
            form.setFieldsValue({ entity: selectedProject });
            const { data: fundData } = await axiosInstance.get(`/balance/fund/${selectedProject.value}/balance`);
            setCurrentBalance(fundData.balance || 0);
          }
  
          if (transactionData.other_project_type) {
            setOtherProjectType(transactionData.other_project_type);
            form.setFieldsValue({ otherProjectType: transactionData.other_project_type });
  
            if (transactionData.other_project_type === 'parish' && transactionData.parish_id) {
              const selectedParishForProject = parishes.find(p => p.value === transactionData.parish_id._id);
              if (selectedParishForProject) {
                // Load families first
                const familyResponse = await axiosInstance.get(`/family/parish/${selectedParishForProject.value}`);
                const familyOptions = familyResponse.data.map(family => ({
                  value: family._id || family.id,
                  label: `${family.name} - Head: ${family.headname || "No head assigned"}`
                }));
                setFamilyOptions(familyOptions);
  
                // Then set the parish and family values
                await handleParishChange(selectedParishForProject);
                form.setFieldsValue({ 
                  selectedParish: selectedParishForProject,
                  selectedFamily: familyOptions.find(f => f.value === transactionData.family_id._id)
                });
              }
            } else if (transactionData.receiver_name) {
              form.setFieldsValue({ otherReceiverName: transactionData.receiver_name });
            }
          }
          break;
  
        case 'family':
          if (transactionData.parish_id) {
            const selectedParishForFamily = parishes.find(p => p.value === transactionData.parish_id._id);
            if (selectedParishForFamily) {
              // Load families first
              const familyResponse = await axiosInstance.get(`/family/parish/${selectedParishForFamily.value}`);
              const familyOptions = familyResponse.data.map(family => ({
                value: family._id || family.id,
                label: `${family.name} - Head: ${family.headname || "No head assigned"}`
              }));
              setFamilyOptions(familyOptions);
  
              // Set parish and update balance
              setSelectedParish(selectedParishForFamily);
              const { data: parishData } = await axiosInstance.get(`/balance/parish/${selectedParishForFamily.value}/balance`);
              setCurrentBalance(parishData.balance || 0);
  
              // Set form values after families are loaded
              form.setFieldsValue({
                selectedParish: selectedParishForFamily,
                selectedFamily: familyOptions.find(f => f.value === transactionData.family_id._id)
              });
            }
          }
          break;
      }
  
    } catch (error) {
      console.error('Error loading transaction for edit:', error);
      showMessage('Error loading transaction data: ' + error.message, 'error');
    } finally {
      setIsLoading(false);
    }
  };
  // Add this function to handle updates
  const handleUpdate = async (values) => {
    try {
      setIsLoading(true);
      
      const amount = parseFloat(values.amount);
      if (isNaN(amount) || amount <= 0) {
        throw new Error('Invalid amount');
      }
  
      // Create update data
      const updateData = {
        date: values.date.format('YYYY-MM-DD'),
        year: parseInt(currentYear, 10),
        transaction_type: transactionType,
        amount: amount,
        description: values.description,
        payment_method: values.paymentMethod,
        // Remove balance calculations from frontend
        transaction_number: values.paymentMethod === 'bank' ? values.transactionNumber : undefined,
      };
  
      // Add type-specific fields
      switch (transactionType) {
        case 'community':
          updateData.community_id = selectedEntity?.value;
          break;
        case 'otherProject':
          updateData.fund_id = selectedEntity?.value;
          updateData.other_project_type = otherProjectType;
          if (otherProjectType === 'parish') {
            updateData.parish_id = values.selectedParish?.value;
            updateData.family_id = values.selectedFamily?.value;
          } else {
            updateData.receiver_name = values.otherReceiverName;
          }
          break;
        case 'family':
          updateData.parish_id = selectedParish?.value;
          updateData.family_id = values.selectedFamily?.value;
          break;
      }
  
      // Clean undefined values
      Object.keys(updateData).forEach(key => 
        updateData[key] === undefined && delete updateData[key]
      );
  
      const response = await axiosInstance.put(
        `/transactionRoutes/transactions/${values.id}`,
        updateData
      );
  
      if (response.data.success) {
        showMessage('Transaction updated successfully');
        setActiveTab(1);
        await fetchTransactions();
        form.resetFields();
        setTransactionType(null);
        setSelectedEntity(null);
        setSelectedParish(null);
        setFamilyOptions([]);
        setCurrentBalance(0);
        setPaymentMethod('cash');
        setOtherProjectType('parish');
        await fetchInitialData();
      } else {
        throw new Error(response.data.message || 'Failed to update transaction');
      }
    } catch (error) {
      console.error('Error updating transaction:', error);
      showMessage(
        'Error updating transaction: ' + 
        (error.response?.data?.message || error.message),
        'error'
      );
    } finally {
      setIsLoading(false);
    }
  };

// Update the handleDelete function
const handleDelete = async (transactionData) => {
  try {
    const response = await axiosInstance.delete(
      `/transactionRoutes/transactions/${transactionData._id}`
    );

    if (response.data.success) {
      showMessage('Transaction deleted successfully');
      fetchTransactions();
    } else {
      throw new Error(response.data.message || 'Failed to delete transaction');
    }
  } catch (error) {
    console.error('Error deleting transaction:', error);
    showMessage(
      'Error deleting transaction: ' + 
      (error.response?.data?.message || error.message), 
      'error'
    );
  }
};
  const generateVoucherNumber = () => {
    const today = dayjs();
    const datePart = today.format('YYYYMMDD');
    const lastNumber = localStorage.getItem('lastVoucherNumber') || 0;
    const newNumber = (parseInt(lastNumber) + 1).toString().padStart(3, '0');
    localStorage.setItem('lastVoucherNumber', newNumber);
    return `TR-${datePart}-${newNumber}`;
  };

  useEffect(() => {
    fetchInitialData();
    const newVoucherNumber = generateVoucherNumber();
    setVoucherNumber(newVoucherNumber);
    form.setFieldValue('voucherNo', newVoucherNumber);
  }, []);

  const showMessage = (message, severity = 'success') => {
    setSnackbar({
      open: true,
      message,
      severity
    });
  };

  const fetchInitialData = async () => {
    setIsLoading(true);
    try {
      // Fetch communities
      const { data: communitiesData } = await axiosInstance.get('/community');
      const formattedCommunities = communitiesData.map(comm => ({
        value: comm._id,
        label: comm.name,
        head: comm.head
      }));
      setCommunities(formattedCommunities);

      // Fetch projects (funds)
      const { data: projectsData } = await axiosInstance.get('/fund');
      const formattedProjects = projectsData.map(proj => ({
        value: proj._id,
        label: proj.name,
        balance: proj.balance || 0
      }));
      setProjects(formattedProjects);

      // Fetch parishes
      const { data: parishesData } = await axiosInstance.get('/parish');
      const formattedParishes = parishesData.map(parish => ({
        value: parish._id,
        label: parish.name,
        balance: parish.balance || 0
      }));
      setParishes(formattedParishes);

    } catch (error) {
      console.error('Error fetching data:', error);
      showMessage('Error loading data: ' + error.message, 'error');
    } finally {
      setIsLoading(false);
    }
  };

  const handleTypeChange = (e) => {
    const type = e.target.value;
    setTransactionType(type);
    setSelectedEntity(null);
    setCurrentBalance(0);
    setSelectedParish(null);
    setFamilyOptions([]);
    form.resetFields(['entity', 'selectedParish', 'selectedFamily', 'otherReceiverName']);
    
    switch (type) {
      case 'community':
        setOptions(communities);
        break;
      case 'otherProject':
        setOptions(projects);
        break;
      case 'family':
        setOptions(parishes);
        break;
      default:
        setOptions([]);
    }
  };

  const handleEntityChange = async (selectedOption) => {
    setSelectedEntity(selectedOption);
    if (selectedOption) {
      try {
        let balanceData;
        switch (transactionType) {
          case 'community':
            const { data } = await axiosInstance.get(`/balance/community/${selectedOption.value}/balance`);
            balanceData = data.balance;
            break;
          case 'otherProject':
            const { data: fundData } = await axiosInstance.get(`/balance/fund/${selectedOption.value}/balance`);
            balanceData = fundData.balance;
            break;
        }
        setCurrentBalance(balanceData || 0);
      } catch (error) {
        console.error('Error fetching balance:', error);
        showMessage('Error loading balance', 'error');
        setCurrentBalance(0);
      }
    } else {
      setCurrentBalance(0);
    }
  };

  const handleParishChange = async (selectedOption) => {
    setSelectedParish(selectedOption);
    if (selectedOption) {
      try {
        if (transactionType === 'family') {
          const { data: parishData } = await axiosInstance.get(`/balance/parish/${selectedOption.value}/balance`);
          setCurrentBalance(parishData.balance || 0);
        }
  
        const response = await axiosInstance.get(`/family/parish/${selectedOption.value}`);
        const familyOptions = response.data.map(family => ({
          value: family._id || family.id,
          label: `${family.name} - Head: ${family.headname || "No head assigned"}`
        }));
  
        setFamilyOptions(familyOptions);
        setFamilies({ ...families, [selectedOption.value]: familyOptions });
      } catch (error) {
        console.error('Error fetching parish data:', error);
        showMessage('Error loading parish data: ' + (error.response?.data?.message || error.message), 'error');
        if (transactionType === 'family') {
          setCurrentBalance(0);
        }
        setFamilyOptions([]);
      }
    } else {
      setFamilyOptions([]);
      if (transactionType === 'family') {
        setCurrentBalance(0);
      }
    }
  };

  const handleSubmit = async (values) => {
    try {
      console.log('Form Values:', values);
     setIsLoading(true);
        if (values.id) {
          await handleUpdate(values);
        } else {
      
      
      const amount = parseFloat(values.amount);
      if (isNaN(amount) || amount <= 0) {
        throw new Error('Invalid amount');
      }
      if (amount > currentBalance) {
        throw new Error('Amount exceeds current balance');
      }
  
      const balanceBefore = currentBalance;
      const balanceAfter = currentBalance - amount;
      
      const transactionData = {
        voucher_no: values.voucherNo,
        date: values.date.format('YYYY-MM-DD'),
        year: parseInt(currentYear, 10),
        transaction_type: transactionType,
        amount: amount,
        description: values.description,
        payment_method: values.paymentMethod,
        balance_before: balanceBefore,
        balance_after: balanceAfter,
        status: 'completed'
      };
  
      if (values.paymentMethod === 'bank' && values.transactionNumber) {
        transactionData.transaction_number = values.transactionNumber;
      }
  
      switch (transactionType) {
        case 'community':
          if (!selectedEntity?.value) {
            throw new Error('Community must be selected');
          }
          transactionData.community_id = selectedEntity.value;
          break;
  
        case 'otherProject':
          if (!selectedEntity?.value) {
            throw new Error('Project must be selected');
          }
          transactionData.fund_id = selectedEntity.value;
          transactionData.other_project_type = otherProjectType;
  
          if (otherProjectType === 'parish') {
            if (!values.selectedParish?.value) {
              throw new Error('Parish must be selected');
            }
            if (!values.selectedFamily?.value) {
              throw new Error('Family must be selected');
            }
            transactionData.parish_id = values.selectedParish.value;
            transactionData.family_id = values.selectedFamily.value;
          } else {
            if (!values.otherReceiverName?.trim()) {
              throw new Error('Receiver name is required');
            }
            transactionData.receiver_name = values.otherReceiverName.trim();
          }
          break;
  
        case 'family':
          if (!selectedParish?.value) {
            throw new Error('Parish must be selected');
          }
          if (!values.selectedFamily?.value) {
            throw new Error('Family must be selected');
          }
          transactionData.parish_id = selectedParish.value;
          transactionData.family_id = values.selectedFamily.value;
          break;
  
        default:
          throw new Error('Invalid transaction type');
      }
  
      const requiredFields = [
        'voucher_no',
        'date',
        'year',
        'transaction_type',
        'amount',
        'description',
        'payment_method'
      ];
      
      const missingFields = requiredFields.filter(field => !transactionData[field]);
      if (missingFields.length > 0) {
        throw new Error(`Missing required fields: ${missingFields.join(', ')}`);
      }
  
      if (transactionData.payment_method === 'bank' && !transactionData.transaction_number) {
        throw new Error('Transaction number is required for bank payments');
      }
  
      const cleanData = Object.fromEntries(
        Object.entries(transactionData).filter(([_, v]) => v !== undefined)
      );
  
      const response = await axiosInstance.post('/transactionRoutes/transactions', cleanData);
  
      if (response.data.success) {
        showMessage('Transaction saved successfully');
        
        // Reset form
        const newVoucherNumber = generateVoucherNumber();
        setVoucherNumber(newVoucherNumber);
        
        form.resetFields();
        form.setFieldsValue({
          voucherNo: newVoucherNumber,
          date: dayjs(),
          paymentMethod: 'cash',
          otherProjectType: 'parish'
        });
        
        // Reset states
        setTransactionType(null);
        setSelectedEntity(null);
        setSelectedParish(null);
        setFamilyOptions([]);
        setCurrentBalance(0);
        setPaymentMethod('cash');
        setOtherProjectType('parish');
        
        // Refresh transaction list if we're showing it
        if (activeTab === 1) {
          fetchTransactions();
        }
        
        // Refresh all data
        await fetchInitialData();
      
      } else {
        throw new Error(response.data.message || 'Failed to save transaction');
      }
    }
    } catch (error) {
      console.error('Error submitting transaction:', {
        message: error.message,
        response: error.response?.data,
        data: error.response?.data?.errors,
        year: currentYear
      });
      showMessage(
        'Error saving transaction: ' + 
        (error.response?.data?.message || error.message), 
        'error'
      );
    } finally {
      setIsLoading(false);
    }
  };

  const customSelectStyles = {
    control: (base, state) => ({
      ...base,
      minHeight: 56,
      borderRadius: 8,
      boxShadow: state.isFocused 
        ? `0 0 0 3px ${theme.palette.primary.light}20` 
        : 'none',
      borderColor: state.isFocused 
        ? theme.palette.primary.main 
        : base.borderColor,
      '&:hover': {
        borderColor: theme.palette.primary.main
      }
    }),
    option: (base, { isFocused, isSelected }) => ({
      ...base,
      backgroundColor: isSelected 
        ? theme.palette.primary.main 
        : isFocused 
          ? theme.palette.primary.light + '20' 
          : 'white',
      color: isSelected ? 'white' : theme.palette.text.primary,
      ':active': {
        backgroundColor: theme.palette.primary.light
      }
    })
  };

  const renderFamilySection = () => {
    if (transactionType !== 'family') return null;

    return (
      <>
        <Grid item xs={12}>
          <Form.Item
            name="selectedParish"
            label="Select Parish"
            rules={[{ required: true, message: 'Please select a parish' }]}
          >
            <Select
              options={parishes}
              styles={customSelectStyles}
              placeholder="Select parish"
              isClearable
              onChange={handleParishChange}
              value={selectedParish}
              isDisabled={isLoading}
            />
          </Form.Item>
        </Grid>
        
        <Grid item xs={12}>
          <Form.Item
            name="selectedFamily"
            label="Select Family with Head"
            rules={[{ required: true, message: 'Please select a family' }]}
          >
            <Select
              options={familyOptions}
              styles={customSelectStyles}
              placeholder="Select family"
              isClearable
              isDisabled={!selectedParish || isLoading}
            />
          </Form.Item>
        </Grid>
      </>
    );
  };

  const renderOtherProjectSection = () => {
    if (transactionType !== 'otherProject' || !selectedEntity) return null;

    return (
      <>
        <Grid item xs={12}>
          <Form.Item
            name="otherProjectType"
            label="Receiver Type"
            rules={[{ required: true, message: 'Please select receiver type' }]}
          >
            <RadioGroup
              row
              value={otherProjectType}
              onChange={(e) => setOtherProjectType(e.target.value)}
            >
              <FormControlLabel value="parish" control={<Radio />} label="Parish" />
              <FormControlLabel value="others" control={<Radio />} label="Others" />
            </RadioGroup>
          </Form.Item>
        </Grid>

        {otherProjectType === 'parish' ? (
          <>
            <Grid item xs={12}>
              <Form.Item
                name="selectedParish"
                label="Select Parish"
                rules={[{ required: true, message: 'Please select a parish' }]}
              >
                <Select
                  options={parishes}
                  styles={customSelectStyles}
                  placeholder="Select parish"
                  isClearable
                  onChange={handleParishChange}
                  isDisabled={isLoading}
                />
              </Form.Item>
            </Grid>
            
            <Grid item xs={12}>
              <Form.Item
                name="selectedFamily"
                label="Select Family with Head"
                rules={[{ required: true, message: 'Please select a family' }]}
              >
                <Select
                  options={familyOptions}
                  styles={customSelectStyles}
                  placeholder="Select family"
                  isClearable
                  isDisabled={!selectedParish || isLoading}
                />
              </Form.Item>
            </Grid>
          </>
        ) : (
          <Grid item xs={12}>
            <Form.Item
              name="otherReceiverName"
              label="Receiver Name"
              rules={[{ required: true, message: 'Please enter receiver name' }]}
            >
              <TextField
                fullWidth
                placeholder="Enter receiver name"
                disabled={isLoading}
              />
            </Form.Item>
          </Grid>
        )}
      </>
    );
  };

  // Render the combined transaction form and list
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Box sx={{ 
        flexGrow: 1, 
        background: 'linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%)',
        minHeight: '100vh',
        py: 4
      }}>
        <Container maxWidth="xl">
          <Paper 
            elevation={6} 
            sx={{ 
              borderRadius: 4, 
              overflow: 'hidden',
              boxShadow: '0 10px 25px rgba(0,0,0,0.1)' 
            }}
          >
            <AppBar 
              position="static" 
              color="transparent" 
              sx={{ 
                backdropFilter: 'blur(10px)', 
                backgroundColor: 'rgba(255,255,255,0.7)' 
              }}
            >
              <Toolbar>
               
                <Typography 
                  variant="h6" 
                  sx={{ 
                    flexGrow: 1, 
                    color: theme.palette.text.primary,
                    fontWeight: 700 
                  }}
                >
            Transaction Management
          </Typography>
        </Toolbar>
      </AppBar>

      <Box sx={{ borderBottom: 1, borderColor: 'divider', bgcolor: 'background.paper' }}>
        <Tabs 
          value={activeTab} 
          onChange={handleTabChange} 
          centered
          sx={{ minHeight: 48 }}
        >
          <Tab label="Transaction Entry" />
          <Tab label="Transaction List" />
        </Tabs>
      </Box>

      <Container maxWidth="xl" sx={{ mt: 3 }}>
        {activeTab === 0 ? (
          // Transaction Entry Form
          <StyledCard>
            <CardContent>
              <Form
                form={form}
                layout="vertical"
                onFinish={handleSubmit}
                initialValues={{
                  date: dayjs(),
                  paymentMethod: 'cash',
                  otherProjectType: 'parish'
                }}
              >
                <Grid container spacing={3}>
             
                   
                    <Form.Item 
                      name="id" 
                      hidden={true}
                    >
                      <Input type="hidden" />
                    </Form.Item>
                  <Grid item xs={12} md={6}>
                    <Form.Item
                      name="voucherNo"
                      label="Voucher No"
                      rules={[{ required: true }]}
                    >
                      <TextField
                        fullWidth
                        disabled
                        value={voucherNumber}
                        sx={{
                          '& .MuiInputBase-input.Mui-disabled': {
                            WebkitTextFillColor: '#000000d9',
                          },
                          backgroundColor: '#f5f5f5',
                        }}
                      />
                    </Form.Item>
                  </Grid>

                  <Grid item xs={12} md={6}>
                    <Form.Item
                      name="date"
                      label="Date"
                      rules={[{ required: true, message: 'Please select date' }]}
                    >
                      <LocalizationProvider dateAdapter={AdapterDayjs}>
                        <DatePicker
                          renderInput={(props) => <TextField {...props} fullWidth />}
                          value={form.getFieldValue('date')}
                          onChange={(newValue) => form.setFieldsValue({ date: newValue })}
                          disabled={isLoading}
                        />
                      </LocalizationProvider>
                    </Form.Item>
                  </Grid>

                  <Grid item xs={12}>
                    <Form.Item
                      name="transactionType"
                      label="Transaction Type"
                      rules={[{ required: true, message: 'Please select transaction type' }]}
                    >
                      <FormControl component="fieldset" fullWidth>
                        <RadioGroup
                          row
                          onChange={handleTypeChange}
                          value={transactionType}
                        >
                          <FormControlLabel value="community" control={<Radio />} label="Community" disabled={isLoading} />
                          <FormControlLabel value="otherProject" control={<Radio />} label="Other Project" disabled={isLoading} />
                          <FormControlLabel value="family" control={<Radio />} label="Parish" disabled={isLoading} />
                        </RadioGroup>
                      </FormControl>
                    </Form.Item>
                  </Grid>

                  <Grid item xs={12} md={8}>
                    {transactionType !== 'family' && (
                      <Form.Item
                        name="entity"
                        label={`Select ${
                          transactionType === 'community' ? 'Community' : 
                          transactionType === 'otherProject' ? 'Project' : 'Entity'
                        }`}
                        rules={[{ required: true, message: 'Please select an entity' }]}
                      >
                        <Select
                          value={selectedEntity}
                          onChange={handleEntityChange}
                          options={options}
                          isDisabled={!transactionType || isLoading}
                          placeholder="Select an option"
                          isClearable
                          styles={customSelectStyles}
                        />
                      </Form.Item>
                    )}

                    {renderFamilySection()}
                    {renderOtherProjectSection()}
                  </Grid>

                  <Grid item xs={12} md={4}>
                    <Paper 
                      elevation={3}
                      sx={{ 
                        p: 3, 
                        textAlign: 'center',
                        bgcolor: 'primary.light',
                        color: 'primary.contrastText'
                      }}
                    >
                      <Typography variant="subtitle1" gutterBottom>
                        Current Balance
                      </Typography>
                      <Typography variant="h4">
                        ₹{currentBalance.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                      </Typography>
                    </Paper>
                  </Grid>

                  <Grid item xs={12} md={6}>
                    <Form.Item
                      name="paymentMethod"
                      label="Payment Method"
                      rules={[{ required: true, message: 'Please select payment method' }]}
                    >
                      <FormControl component="fieldset">
                        <RadioGroup
                          row
                          onChange={(e) => setPaymentMethod(e.target.value)}
                          value={paymentMethod}
                        >
                          <FormControlLabel value="cash" control={<Radio />} label="Cash" disabled={isLoading} />
                          <FormControlLabel value="bank" control={<Radio />} label="Bank" disabled={isLoading} />
                        </RadioGroup>
                      </FormControl>
                    </Form.Item>
                  </Grid>

                  {paymentMethod === 'bank' && (
                    <Grid item xs={12} md={6}>
                      <Form.Item
                        name="transactionNumber"
                        label="Transaction Number"
                        rules={[{ required: true, message: 'Please enter transaction number' }]}
                      >
                        <TextField
                          fullWidth
                          placeholder="Enter bank transaction number"
                          disabled={isLoading}
                        />
                      </Form.Item>
                    </Grid>
                  )}

                  <Grid item xs={12}>
                  <Form.Item
  name="amount"
  label="Transaction Amount"
  rules={[
    { required: true, message: 'Please enter amount' },
    { validator: validateAmount }
  ]}
>
  <TextField
    fullWidth
    type="number"
    placeholder="Enter amount"
    InputProps={{
      startAdornment: <InputAdornment position="start">₹</InputAdornment>,
    }}
    inputProps={{
      min: 0,
      step: 'any'
    }}
    disabled={isLoading}
  />
</Form.Item>
                  </Grid>

                  <Grid item xs={12}>
                    <Form.Item
                      name="description"
                      label="Description"
                      rules={[{ required: true, message: 'Please enter description' }]}
                    >
                      <TextField
                        fullWidth
                        multiline
                        rows={4}
                        placeholder="Enter transaction description"
                        inputProps={{
                          maxLength: 500,
                        }}
                        helperText={`${form.getFieldValue('description')?.length || 0}/500`}
                        disabled={isLoading}
                      />
                    </Form.Item>
                  </Grid>

                  <Grid item xs={12}>
                    <Box sx={{ display: 'flex', justifyContent: 'center', gap: 2, mt: 2 }}>
                      <Button
                        type="submit"
                        variant="contained"
                        size="large"
                        startIcon={<MoneyIcon />}
                        sx={{ 
                          minWidth: 200,
                          py: 1.5,
                          fontSize: '1.1rem'
                        }}
                        disabled={isLoading}
                      >
                        Submit Transaction
                      </Button>
                    </Box>
                  </Grid>
                </Grid>
              </Form>
            </CardContent>
          </StyledCard>
        ) : (
          // Transaction List
       // Transaction List
<StyledCard>
  <CardContent>
    <div className="rounded-md border">
   
    <MaterialReactTable
  columns={columns}
  data={transactions}
  enableRowNumbers
  positionToolbarAlertBanner="bottom"
  enableRowActions={true}
  displayColumnDefOptions={{
    'mrt-row-actions': {
      header: 'Actions',
      size: 200,
    },
  }}
  renderRowActions={({ row }) => (
    <Box sx={{ display: 'flex', gap: '8px' }}>
      <Tooltip title="Edit" placement="left">
        <IconButton onClick={() => handleEdit(row.original)} color="primary">
          <Edit />
        </IconButton>
      </Tooltip>
      <Tooltip title="Delete" placement="right">
        <IconButton  color="error" 
        onClick={() => {
            if (window.confirm('Are you sure you want to delete this transaction?')) {
              handleDelete(row.original);
            }
          }}
        >
          <Delete />
        </IconButton>
      </Tooltip>
      <Tooltip title="Print" placement="right">
        <IconButton 
          onClick={() => {
            const printWindow = window.open('', '_blank');
            const printContent = `
            <!DOCTYPE html>
            <html>
            <head>
              <title>Transaction Receipt - ${row.original.voucher_no}</title>
              <style>
                @import url('https://fonts.googleapis.com/css2?family=Roboto:wght@400;500;700&display=swap');
                
                body { 
                  font-family: 'Roboto', sans-serif;
                  margin: 0;
                  padding: 20px;
                  background-color: #ffffff;
                }
                
                .receipt-container {
                  max-width: 800px;
                  margin: 0 auto;
                  border: 2px solid #1a237e;
                  border-radius: 10px;
                  padding: 20px;
                  box-shadow: 0 0 20px rgba(0,0,0,0.1);
                }
                
                .org-header {
                  text-align: center;
                  border-bottom: 2px solid #1a237e;
                  padding-bottom: 20px;
                  margin-bottom: 20px;
                }
                
                .org-name {
                  font-size: 32px;
                  font-weight: 700;
                  color: #1a237e;
                  margin: 0;
                  text-transform: uppercase;
                  letter-spacing: 2px;
                }
                
                .org-subtitle {
                  font-size: 20px;
                  color: #303f9f;
                  margin: 5px 0;
                  font-weight: 500;
                }
                
                .receipt-title {
                  text-align: center;
                  margin: 20px 0;
                  padding: 10px;
                  background-color: #e8eaf6;
                  border-radius: 5px;
                }
                
                .receipt-title h2 {
                  color: #1a237e;
                  margin: 0;
                  font-size: 24px;
                }
                
                .receipt-title h3 {
                  color: #303f9f;
                  margin: 5px 0 0 0;
                  font-size: 18px;
                }
                
                .details {
                  background-color: #ffffff;
                  padding: 20px;
                  border-radius: 5px;
                  border: 1px solid #e0e0e0;
                }
                
                .row {
                  display: flex;
                  margin-bottom: 12px;
                  padding: 8px;
                  border-bottom: 1px solid #e0e0e0;
                }
                
                .row:last-child {
                  border-bottom: none;
                }
                
                .label {
                  font-weight: 500;
                  width: 180px;
                  color: #303f9f;
                }
                
                .value {
                  flex: 1;
                  color: #212121;
                }
                
                .amount-row {
                  background-color: #e8eaf6;
                  font-weight: 500;
                  border-radius: 5px;
                }
                
                .amount-row .value {
                  color: #1a237e;
                  font-weight: bold;
                }
                
                .footer {
                  margin-top: 30px;
                  text-align: center;
                  color: #666;
                  font-size: 14px;
                  border-top: 1px solid #e0e0e0;
                  padding-top: 20px;
                }
                
                @media print {
                  body {
                    -webkit-print-color-adjust: exact;
                    print-color-adjust: exact;
                  }
                  
                  .receipt-container {
                    border: none;
                    box-shadow: none;
                  }
                }
              </style>
            </head>
            <body>
              <div class="receipt-container">
                <div class="org-header">
                  <h1 class="org-name">Jeevan</h1>
                  <p class="org-subtitle">Kanjirapally Diocese</p>
                </div>
                
                <div class="receipt-title">
                  <h2>Transaction Receipt</h2>
                  <h3>Receipt No: ${row.original.voucher_no}</h3>
                </div>
              <div class="details">
                <div class="row">
                  <span class="label">Date:</span>
                  <span class="value">${dayjs(row.original.date).format('DD/MM/YYYY')}</span>
                </div>
                <div class="row">
                  <span class="label">Type:</span>
                  <span class="value">${row.original.transaction_type}</span>
                </div>
                ${row.original.community_id ? `
                  <div class="row">
                    <span class="label">Community:</span>
                    <span class="value">${row.original.community_id.name}</span>
                  </div>
                ` : ''}
                ${row.original.fund_id ? `
                  <div class="row">
                    <span class="label">Project:</span>
                    <span class="value">${row.original.fund_id.name}</span>
                  </div>
                ` : ''}
                ${row.original.parish_id ? `
                  <div class="row">
                    <span class="label">Parish:</span>
                    <span class="value">${row.original.parish_id.name}</span>
                  </div>
                ` : ''}
                ${row.original.family_id ? `
                  <div class="row">
                    <span class="label">Family:</span>
                    <span class="value">${row.original.family_id.name}</span>
                  </div>
                ` : ''}
                ${row.original.receiver_name ? `
                  <div class="row">
                    <span class="label">Receiver:</span>
                    <span class="value">${row.original.receiver_name}</span>
                  </div>
                ` : ''}
                <div class="row">
                  <span class="label">Amount:</span>
                  <span class="value">₹${row.original.amount.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</span>
                </div>
                <div class="row">
                  <span class="label">Payment Method:</span>
                  <span class="value">${row.original.payment_method}</span>
                </div>
                ${row.original.transaction_number ? `
                  <div class="row">
                    <span class="label">Transaction No:</span>
                    <span class="value">${row.original.transaction_number}</span>
                  </div>
                ` : ''}
                <div class="row">
                  <span class="label">Description:</span>
                  <span class="value">${row.original.description}</span>
                </div>
              </div>
              <div class="footer">
                <p>This is a computer-generated receipt.</p>
                <p>Jeevan Kanjirapally Diocese © ${new Date().getFullYear()}</p>
              </div>
            </div>
            </body>
            </html>`;
            printWindow.document.write(printContent);
            printWindow.document.close();
            printWindow.focus();
            printWindow.print();
          }}
          color="primary"
        >
          <Print />
        </IconButton>
      </Tooltip>
    </Box>
  )}
/>
    </div>
  </CardContent>
</StyledCard>
        )}
      </Container>

      {/* Snackbar for notifications */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={6000}
        onClose={() => setSnackbar({ ...snackbar, open: false })}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert
          onClose={() => setSnackbar({ ...snackbar, open: false })}
          severity={snackbar.severity}
          variant="filled"
          sx={{ width: '100%' }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
      </Paper>
        </Container>
      </Box>
    </ThemeProvider>
  );
};

export default TransactionPage;