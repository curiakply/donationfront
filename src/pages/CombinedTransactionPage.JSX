import React, { useState, useEffect } from 'react';
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
import { DataGrid } from '@mui/x-data-grid';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import Select from 'react-select';
import { styled } from '@mui/material/styles';
import dayjs from 'dayjs';
import { MonetizationOn as MoneyIcon } from '@mui/icons-material';
import { Form } from 'antd';
import "../assets/styles/responsive.css";
import { useFinancialYear } from './FinancialYearContext';

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
  const columns = [
    { field: 'voucher_no', headerName: 'Voucher No', width: 150 },
    { 
      field: 'date', 
      headerName: 'Date', 
      width: 120,
      valueFormatter: (params) => dayjs(params.value).format('DD/MM/YYYY')
    },
    { field: 'transaction_type', headerName: 'Type', width: 120 },
    { 
      field: 'amount', 
      headerName: 'Amount', 
      width: 120,
      valueFormatter: (params) => `₹${params.value.toLocaleString('en-IN', { minimumFractionDigits: 2 })}`
    },
    { 
      field: 'payment_method', 
      headerName: 'Payment Method', 
      width: 130,
      valueFormatter: (params) => params.value.charAt(0).toUpperCase() + params.value.slice(1)
    },
    { field: 'description', headerName: 'Description', width: 200, flex: 1 },
    { 
      field: 'balance_before', 
      headerName: 'Balance Before', 
      width: 130,
      valueFormatter: (params) => `₹${params.value.toLocaleString('en-IN', { minimumFractionDigits: 2 })}`
    },
    { 
      field: 'balance_after', 
      headerName: 'Balance After', 
      width: 130,
      valueFormatter: (params) => `₹${params.value.toLocaleString('en-IN', { minimumFractionDigits: 2 })}`
    },
    { 
      field: 'status', 
      headerName: 'Status',
      width: 120,
      renderCell: (params) => (
        <div className={`px-2 py-1 rounded-full ${
          params.value === 'completed' 
            ? 'bg-green-100 text-green-800' 
            : 'bg-yellow-100 text-yellow-800'
        }`}>
          {params.value.charAt(0).toUpperCase() + params.value.slice(1)}
        </div>
      )
    }
  ];

  // Fetch transactions for the list view
  const fetchTransactions = async () => {
    setIsLoading(true);
    try {
      const response = await axiosInstance.get('/transactionRoutes/transactions');
      setTransactions(response.data);
    } catch (error) {
      console.error('Error fetching transactions:', error);
      showMessage('Error loading transactions: ' + error.message, 'error');
    } finally {
      setIsLoading(false);
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
        
        const familiesWithHeads = await Promise.all(
          response.data.map(async (family) => {
            try {
              const personsResponse = await axiosInstance.get(`/person/family/${family.id}`);
              const head = personsResponse.data.find((person) => person.relation === "head");
              
              return {
                value: family._id || family.id,
                label: `${family.name} - Head: ${head ? head.name : "No head assigned"}`
              };
            } catch (error) {
              return {
                value: family._id || family.id,
                label: `${family.name} - Head: Error loading head`
              };
            }
          })
        );
  
        setFamilyOptions(familiesWithHeads);
        setFamilies({ ...families, [selectedOption.value]: familiesWithHeads });
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
      setIsLoading(true);
      
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
      borderRadius: 4,
      borderColor: state.isFocused ? '#1976d2' : '#c4c4c4',
      boxShadow: state.isFocused ? '0 0 0 2px rgba(25, 118, 210, 0.2)' : 'none',
      '&:hover': {
        borderColor: '#1976d2'
      }
    }),
    option: (base, { isFocused, isSelected }) => ({
      ...base,
      backgroundColor: isSelected ? '#1976d2' : isFocused ? 'rgba(25, 118, 210, 0.08)' : null,
      color: isSelected ? 'white' : 'black'
    }),
    placeholder: (base) => ({
      ...base,
      color: '#757575'
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
    <Box sx={{ flexGrow: 1 }}>
      <AppBar position="static">
        <Toolbar>
          <Typography variant="h6" sx={{ flexGrow: 1, textAlign: 'center' }}>
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
                        {
                          validator: (_, value) => {
                            if (value && value <= 0) {
                              return Promise.reject('Amount must be greater than 0');
                            }
                            if (value && value > currentBalance) {
                              return Promise.reject('Amount cannot exceed current balance');
                            }
                            return Promise.resolve();
                          }
                        }
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
                          max: currentBalance,
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
          <StyledCard>
            <CardContent>
              <div style={{ height: 600, width: '100%' }}>
                <DataGrid
                  rows={transactions}
                  columns={columns}
                  pageSize={10}
                  rowsPerPageOptions={[10, 25, 50]}
                  checkboxSelection={false}
                  disableSelectionOnClick
                  loading={isLoading}
                  getRowId={(row) => row._id || row.voucher_no}
                  sx={{
                    '& .MuiDataGrid-cell': {
                      borderBottom: '1px solid #f0f0f0',
                    },
                    '& .MuiDataGrid-columnHeaders': {
                      backgroundColor: '#f5f5f5',
                      borderBottom: 'none',
                    },
                    '& .MuiDataGrid-virtualScroller': {
                      backgroundColor: '#ffffff',
                    },
                    '& .MuiDataGrid-footerContainer': {
                      borderTop: '1px solid #f0f0f0',
                      backgroundColor: '#f5f5f5',
                    },
                    '& .MuiDataGrid-row:hover': {
                      backgroundColor: '#f5f5f5',
                    },
                  }}
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
    </Box>
  );
};

export default TransactionPage;