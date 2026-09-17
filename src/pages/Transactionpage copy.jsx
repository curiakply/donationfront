import React, { useState, useEffect } from 'react';
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
  InputLabel,
  Select as MuiSelect,
  MenuItem,
  InputAdornment,
  FormLabel,
  AppBar,
  Toolbar,
  Snackbar,
  Alert,
  Card,
  CardContent,
} from '@mui/material';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import Select from 'react-select';
import { styled } from '@mui/material/styles';
import dayjs from 'dayjs';
import { MonetizationOn as MoneyIcon } from '@mui/icons-material';
import { Form } from 'antd';
import "../assets/styles/responsive.css";

// Styled components
const StyledContainer = styled(Container)(({ theme }) => ({
  marginTop: theme.spacing(4),
  marginBottom: theme.spacing(4),
}));

const StyledPaper = styled(Paper)(({ theme }) => ({
  padding: theme.spacing(3),
  marginBottom: theme.spacing(3),
}));

const StyledCard = styled(Card)(({ theme }) => ({
  marginBottom: theme.spacing(3),
}));

const StyledFormControl = styled(FormControl)(({ theme }) => ({
  minWidth: '100%',
}));

const TransactionPage = () => {
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
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: '',
    severity: 'success'
  });

  const [allData, setAllData] = useState({
    community: [
      { value: 1, label: 'SMYM', balance: 50000, head: 'Fr. ' },
      { value: 2, label: 'AKCC', balance: 75000, head: 'Fr. ' }
    ],
    otherProject: [
      { value: 1, label: 'Bishop Fund', balance: 100000 },
      { value: 2, label: 'Education Fund', balance: 150000 }
    ],
    parishes: [
      { 
        value: 1, 
        label: 'Ponkunnam',
        balance: 200000,
        families: [
          { value: 'f1', label: 'VATTAKATTU - Head: Thomas' },
          { value: 'f2', label: 'PULLOLICKEL Family - Head: Varghese ' }
        ]
      },
      { 
        value: 2, 
        label: 'Kanjirapally',
        balance: 250000,
        families: [
          { value: 'f3', label: 'PUTHUPARAMBIL - Head: James' },
          { value: 'f4', label: 'PUTHENPURACKAL - Head: Annamma' }
        ]
      }
    ]
  });

  const generateVoucherNumber = () => {
    const today = dayjs();
    const datePart = today.format('YYYYMMDD');
    const lastNumber = localStorage.getItem('lastVoucherNumber') || 0;
    const newNumber = (parseInt(lastNumber) + 1).toString().padStart(3, '0');
    localStorage.setItem('lastVoucherNumber', newNumber);
    return `TR-${datePart}-${newNumber}`;
  };

  useEffect(() => {
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
// Add this function with your other handlers, before the return statement


  const updateBalance = (transaction) => {
    const amount = parseFloat(transaction.amount);
    if (isNaN(amount) || amount <= 0) {
      showMessage('Please enter a valid amount', 'error');
      return false;
    }

    const newData = { ...allData };

    try {
      switch (transaction.transactionType) {
        case 'community':
          newData.community = newData.community.map(comm => {
            if (comm.value === transaction.entity.value) {
              const newBalance = comm.balance - amount;
              if (newBalance < 0) throw new Error('Insufficient balance');
              return { ...comm, balance: newBalance };
            }
            return comm;
          });
          break;

        case 'otherProject':
          newData.otherProject = newData.otherProject.map(proj => {
            if (proj.value === transaction.entity.value) {
              const newBalance = proj.balance - amount;
              if (newBalance < 0) throw new Error('Insufficient balance');
              return { ...proj, balance: newBalance };
            }
            return proj;
          });

          if (transaction.otherProjectType === 'parish' && transaction.selectedParish) {
            newData.parishes = newData.parishes.map(parish => {
              if (parish.value === transaction.selectedParish.value) {
                const newBalance = parish.balance - amount;
                if (newBalance < 0) throw new Error('Insufficient balance');
                return { ...parish, balance: newBalance };
              }
              return parish;
            });
          }
          break;

        case 'family':
          if (transaction.selectedParish) {
            newData.parishes = newData.parishes.map(parish => {
              if (parish.value === transaction.selectedParish.value) {
                const newBalance = parish.balance - amount;
                if (newBalance < 0) throw new Error('Insufficient balance');
                return { ...parish, balance: newBalance };
              }
              return parish;
            });
          }
          break;

        default:
          throw new Error('Invalid transaction type');
      }

      setAllData(newData);
      if (transaction.transactionType !== 'family') {
        setOptions(newData[transaction.transactionType]);
      }
      setCurrentBalance(prev => prev - amount);
      return true;
    } catch (error) {
      showMessage(error.message, 'error');
      return false;
    }
  };
  const fetchInitialData = async () => {
    try {
      // Fetch communities
      const communitiesResponse = await fetch('/api/communities');
      const communitiesData = await communitiesResponse.json();
      setCommunities(communitiesData.map(comm => ({
        value: comm.id,
        label: comm.name,
        balance: comm.balance,
        head: comm.head
      })));

      // Fetch projects
      const projectsResponse = await fetch('/api/projects');
      const projectsData = await projectsResponse.json();
      setProjects(projectsData.map(proj => ({
        value: proj.id,
        label: proj.name,
        balance: proj.balance
      })));

      // Fetch parishes
      const parishesResponse = await fetch('/api/parishes');
      const parishesData = await parishesResponse.json();
      setParishes(parishesData.map(parish => ({
        value: parish.id,
        label: parish.name,
        balance: parish.balance
      })));

    } catch (error) {
      showMessage('Error loading initial data: ' + error.message, 'error');
    }
  };

  // Fetch families for a specific parish
  const fetchFamilies = async (parishId) => {
    try {
      const response = await fetch(`/api/parishes/${parishId}/families`);
      const familiesData = await response.json();
      const formattedFamilies = familiesData.map(family => ({
        value: family.id,
        label: `${family.name} - Head: ${family.head}`
      }));
      setFamilies({ ...families, [parishId]: formattedFamilies });
      return formattedFamilies;
    } catch (error) {
      showMessage('Error loading families: ' + error.message, 'error');
      return [];
    }
  };

  const handleParishChange = async (selectedOption) => {
    setSelectedParish(selectedOption);
    if (selectedOption) {
      const parish = parishes.find(p => p.value === selectedOption.value);
      setCurrentBalance(parish?.balance || 0);
      
      // Fetch families if not already cached
      if (!families[selectedOption.value]) {
        const familyOptions = await fetchFamilies(selectedOption.value);
        setFamilyOptions(familyOptions);
      } else {
        setFamilyOptions(families[selectedOption.value]);
      }
    } else {
      setFamilyOptions([]);
      setCurrentBalance(0);
    }
  };

  const fetchOptions = (type) => {
    switch (type) {
      case 'community':
        setOptions(allData.community);
        break;
      case 'otherProject':
        setOptions(allData.otherProject);
        break;
      case 'family':
        setOptions(allData.parishes);
        break;
      default:
        setOptions([]);
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
    fetchOptions(type);
  };

  const handleEntityChange = (selectedOption) => {
    setSelectedEntity(selectedOption);
    if (selectedOption) {
      const type = transactionType === 'community' ? 'community' : 'otherProject';
      const entity = allData[type].find(e => e.value === selectedOption.value);
      setCurrentBalance(entity?.balance || 0);
    }
  };

  const handleParishChange = (selectedOption) => {
    setSelectedParish(selectedOption);
    if (selectedOption) {
      const parish = allData.parishes.find(p => p.value === selectedOption.value);
      setFamilyOptions(parish?.families || []);
      setCurrentBalance(parish?.balance || 0);
    } else {
      setFamilyOptions([]);
      setCurrentBalance(0);
    }
  };

  const handleSubmit = (values) => {
    const formattedValues = {
      ...values,
      date: values.date.format('YYYY-MM-DD'),
      entity: selectedEntity,
      selectedParish: selectedParish,
      transactionType,
      otherProjectType
    };

    if (updateBalance(formattedValues)) {
      showMessage('Transaction saved successfully');
      const newVoucherNumber = generateVoucherNumber();
      setVoucherNumber(newVoucherNumber);
      
      form.resetFields();
      form.setFieldsValue({
        voucherNo: newVoucherNumber,
        date: dayjs(),
        paymentMethod: 'cash',
        otherProjectType: 'parish'
      });
      
      setTransactionType(null);
      setSelectedEntity(null);
      setSelectedParish(null);
      setFamilyOptions([]);
      setCurrentBalance(0);
      setPaymentMethod('cash');
      setOtherProjectType('parish');
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
              options={allData.parishes}
              styles={customSelectStyles}
              placeholder="Select parish"
              isClearable
              onChange={handleParishChange}
              value={selectedParish}
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
              isDisabled={!selectedParish}
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
                  options={allData.parishes}
                  styles={customSelectStyles}
                  placeholder="Select parish"
                  isClearable
                  onChange={handleParishChange}
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
                  isDisabled={!selectedParish}
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
              />
            </Form.Item>
          </Grid>
        )}
      </>
    );
  };

  return (
    <Box sx={{ flexGrow: 1 }}>
      <AppBar position="static">
        <Toolbar>
          <Typography variant="h6" sx={{ flexGrow: 1, textAlign: 'center' }}>
            Transaction Entry
          </Typography>
        </Toolbar>
      </AppBar>

      <StyledContainer maxWidth="lg">
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
                        <FormControlLabel value="community" control={<Radio />} label="Community" />
                        <FormControlLabel value="otherProject" control={<Radio />} label="Other Project" />
                        <FormControlLabel value="family" control={<Radio />} label="Parish" />
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
                        isDisabled={!transactionType}
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
                        <FormControlLabel value="cash" control={<Radio />} label="Cash" />
                        <FormControlLabel value="bank" control={<Radio />} label="Bank" />
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
                    />
                  </Form.Item>
                </Grid>

                <Grid item xs={12}>
                  <Box sx={{ display: 'flex', justifyContent: 'center', mt: 2 }}>
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
                    >
                      Submit Transaction
                    </Button>
                    <Button
                      type="button"
                      variant="contained"
                      size="large"
                      sx={{ 
                        minWidth: 200,
                        py: 1.5,
                        fontSize: '1.1rem'
                      }}
                    >
                     Print Receipt
                    </Button>
                  </Box>
                </Grid>
              </Grid>
            </Form>
          </CardContent>
        </StyledCard>
      </StyledContainer>

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

                          
                          