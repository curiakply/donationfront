import React, { useState, useEffect } from 'react';
import {
  Box,
  Container,
  Grid,
  Paper,
  Card,
  CardContent,
  TextField,
  Button,
  Typography,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  RadioGroup,
  Radio,
  FormControlLabel,
  IconButton,
  Stack,
  InputAdornment,
  Divider,
  Tooltip,
  Snackbar,
  Alert,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Autocomplete,
} from '@mui/material';
import { MaterialReactTable } from 'material-react-table';
import {
  Home as HomeIcon,
  SwapHoriz as MoveIcon,
  Delete as DeleteIcon,
  Search as SearchIcon,
  KeyboardDoubleArrowLeft,
  KeyboardArrowLeft,
  KeyboardArrowRight,
  KeyboardDoubleArrowRight,
  Save as SaveIcon,
  History as HistoryIcon,
  Refresh as RefreshIcon,
  FileDownload as FileDownloadIcon,
  Edit as EditIcon,
  Cancel as CancelIcon,
} from '@mui/icons-material';
import { styled, alpha, useTheme } from '@mui/material/styles';
import axiosInstance from '../axiosConfig';

// Styled Components
const StyledCard = styled(Card)(({ theme }) => ({
  height: '100%',
  borderRadius: theme.shape.borderRadius * 2,
  boxShadow: '0 8px 32px rgba(0, 0, 0, 0.08)',
  transition: 'box-shadow 0.3s ease-in-out',
  '&:hover': {
    boxShadow: '0 12px 48px rgba(0, 0, 0, 0.12)',
  },
  background: theme.palette.background.paper,
}));

const StyledFormControl = styled(FormControl)(({ theme }) => ({
  margin: theme.spacing(1),
  minWidth: '100%',
  '& .MuiOutlinedInput-root': {
    borderRadius: theme.shape.borderRadius * 1.5,
    background: theme.palette.background.paper,
    transition: 'all 0.2s ease-in-out',
    '&:hover': {
      background: alpha(theme.palette.primary.main, 0.04),
    },
    '&.Mui-focused': {
      boxShadow: `0 0 0 2px ${alpha(theme.palette.primary.main, 0.2)}`,
    },
  },
  '& .MuiInputLabel-root': {
    color: theme.palette.text.secondary,
  },
}));

const StyledButton = styled(Button)(({ theme }) => ({
  margin: theme.spacing(1),
  borderRadius: theme.shape.borderRadius * 2,
  textTransform: 'none',
  padding: theme.spacing(1.5, 3),
  transition: 'all 0.2s ease-in-out',
  boxShadow: 'none',
  '&:hover': {
    transform: 'translateY(-1px)',
    boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)',
  },
  '&.MuiButton-contained': {
    background: `linear-gradient(45deg, ${theme.palette.primary.main}, ${alpha(theme.palette.primary.light, 0.9)})`,
  },
}));

const StyledPaper = styled(Paper)(({ theme }) => ({
  padding: theme.spacing(2),
  borderRadius: theme.shape.borderRadius * 2,
  boxShadow: '0 4px 20px rgba(0, 0, 0, 0.05)',
  background: alpha(theme.palette.background.paper, 0.8),
  backdropFilter: 'blur(8px)',
  transition: 'all 0.2s ease-in-out',
  '&:hover': {
    boxShadow: '0 6px 24px rgba(0, 0, 0, 0.08)',
  },
}));

const StyledTextField = styled(TextField)(({ theme }) => ({
  '& .MuiOutlinedInput-root': {
    borderRadius: theme.shape.borderRadius * 1.5,
    transition: 'all 0.2s ease-in-out',
    '&:hover': {
      background: alpha(theme.palette.primary.main, 0.04),
    },
    '&.Mui-focused': {
      boxShadow: `0 0 0 2px ${alpha(theme.palette.primary.main, 0.2)}`,
    },
  },
  '& .MuiInputLabel-root': {
    color: theme.palette.text.secondary,
  },
}));

const StyledTableContainer = styled(Box)(({ theme }) => ({
  '& .MuiPaper-root': {
    borderRadius: theme.shape.borderRadius * 2,
    boxShadow: '0 4px 20px rgba(0, 0, 0, 0.05)',
    overflow: 'hidden',
    border: `1px solid ${alpha(theme.palette.divider, 0.1)}`,
  },
  '& .MuiTableHead-root': {
    background: alpha(theme.palette.primary.main, 0.04),
    '& .MuiTableCell-root': {
      color: theme.palette.text.primary,
      fontWeight: 600,
      borderBottom: `2px solid ${alpha(theme.palette.primary.main, 0.1)}`,
    },
  },
  '& .MuiTableBody-root': {
    '& .MuiTableRow-root': {
      transition: 'background-color 0.2s ease-in-out',
      '&:hover': {
        backgroundColor: alpha(theme.palette.primary.main, 0.04),
      },
    },
    '& .MuiTableCell-root': {
      borderBottom: `1px solid ${alpha(theme.palette.divider, 0.1)}`,
    },
  },
}));

const StyledIconButton = styled(IconButton)(({ theme }) => ({
  borderRadius: theme.shape.borderRadius * 1.5,
  padding: theme.spacing(1),
  transition: 'all 0.2s ease-in-out',
  '&:hover': {
    background: alpha(theme.palette.primary.main, 0.08),
    transform: 'scale(1.1)',
  },
}));

const StyledDialogTitle = styled(DialogTitle)(({ theme }) => ({
  background: `linear-gradient(45deg, ${theme.palette.primary.main}, ${alpha(theme.palette.primary.light, 0.9)})`,
  color: theme.palette.primary.contrastText,
  padding: theme.spacing(2),
  '& .MuiTypography-root': {
    fontWeight: 600,
  },
}));

const StyledAlert = styled(Alert)(({ theme }) => ({
  borderRadius: theme.shape.borderRadius * 2,
  boxShadow: '0 4px 20px rgba(0, 0, 0, 0.1)',
  '& .MuiAlert-icon': {
    fontSize: '1.5rem',
  },
}));

const StyledRadioGroup = styled(RadioGroup)(({ theme }) => ({
  '& .MuiFormControlLabel-root': {
    marginRight: theme.spacing(3),
    '& .MuiRadio-root': {
      color: theme.palette.text.secondary,
      '&.Mui-checked': {
        color: theme.palette.primary.main,
      },
    },
    '& .MuiTypography-root': {
      fontWeight: 500,
    },
  },
}));

// Table custom styles configuration
const tableCustomStyles = {
  muiTablePaperProps: {
    elevation: 0,
    sx: {
      borderRadius: '16px',
      border: '1px solid',
      borderColor: 'divider',
    },
  },
  muiSearchTextFieldProps: {
    variant: 'outlined',
    size: 'small',
    sx: {
      borderRadius: '12px',
      minWidth: '300px',
      '& .MuiOutlinedInput-root': {
        borderRadius: '12px',
      },
    },
  },
  muiTableHeadCellProps: {
    sx: {
      fontWeight: 600,
      backgroundColor: (theme) => alpha(theme.palette.primary.main, 0.04),
    },
  },
  muiTableBodyRowProps: {
    sx: {
      '&:hover': {
        backgroundColor: (theme) => alpha(theme.palette.primary.main, 0.04),
      },
    },
  },
  muiTableBodyCellProps: {
    sx: {
      padding: '12px',
    },
  },
};
const FamilyManagement = () => {
  // State Management
  const [openMovePersonDialog, setOpenMovePersonDialog] = useState(false);
  const [selectedPerson, setSelectedPerson] = useState(null);
  const [destinationFamily, setDestinationFamily] = useState(null);
  const [newRelation, setNewRelation] = useState('');
  const [personMovements, setPersonMovements] = useState([]);
  const [showPersonMovementsDialog, setShowPersonMovementsDialog] = useState(false);
  const [allFamilies, setAllFamilies] = useState([]);
  const [destinationParishForPerson, setDestinationParishForPerson] = useState(null);
  const [destinationKoottaymaForPerson, setDestinationKoottaymaForPerson] = useState(null);
  const [destinationParishKoottaymas, setDestinationParishKoottaymas] = useState([]);
  const [currentView, setCurrentView] = useState('currentKootayma');
  const [selectedFamily, setSelectedFamily] = useState(null);
  const [families, setFamilies] = useState([]);
  const [dfamilies, setDFamilies] = useState([]);
  const [parishes, setParishes] = useState([]);
  const [koottaymas, setKoottaymas] = useState([]);
  const [Dkoottaymas, setDKoottaymas] = useState([]);
  const [selectedParish, setSelectedParish] = useState(null);
  const [selectedKoottayma, setSelectedKoottayma] = useState(null);
  const [persons, setPersons] = useState([]);
  const [transactions, setTransactions] = useState([]);
  const [currentTransactions, setCurrentTransactions] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: '',
    severity: 'success',
  });
  const [isEditingRow, setIsEditingRow] = useState(false);
  const [validationErrors, setValidationErrors] = useState({});
  const [remarks, setRemarks] = useState('');
  // Add these handler functions
  
  // State for movement tracking
  const [movements, setMovements] = useState([]);
  const [showMovementsDialog, setShowMovementsDialog] = useState(false);
  const [movementsLoading, setMovementsLoading] = useState(false);

  // State for move family dialog
  const [openMoveDialog, setOpenMoveDialog] = useState(false);
  const [destinationParish, setDestinationParish] = useState('');
  const [destinationKoottayma, setDestinationKoottayma] = useState('');
  const [activeTab, setActiveTab] = useState('details');
  const currentYear = new Date().getFullYear();

  // Effects
  useEffect(() => {
    fetchParishes();
  }, []);

  useEffect(() => {
    if (selectedParish) {
      fetchKoottaymas(selectedParish);
    }
  }, [selectedParish]);

  useEffect(() => {
    if (selectedParish && selectedKoottayma) {
      if (currentView === 'currentKootayma') {
        fetchFamilies(selectedParish, selectedKoottayma);
      } else {
        fetchFamilies(selectedParish, null);
      }
    }
  }, [selectedParish, selectedKoottayma, currentView]);

  useEffect(() => {
    if (destinationParish) {
      fetchDKoottaymas(destinationParish);
    }
  }, [destinationParish]);

  useEffect(() => {
    if (selectedFamily) {
      fetchPersons(selectedFamily.id);
      fetchTransactions(selectedFamily.id);
    }
  }, [selectedFamily]);
  useEffect(() => {
    
    setDestinationFamily(null);
    setDFamilies([]);
  }, [destinationParishForPerson, destinationKoottaymaForPerson]);
  // API Functions
  const fetchParishes = async () => {
    try {
      const response = await axiosInstance.get('/parish');
      setParishes(response.data);
    } catch (error) {
      showSnackbar('Failed to fetch parishes', 'error');
      console.error('Error fetching parishes:', error);
    }
  };
  const handleEditStart = () => {
    setIsEditingRow(true);
  };
  
  const handleEditCancel = () => {
    setIsEditingRow(false);
    setValidationErrors({});
  };
  const theme = useTheme();
  const handleValidation = (values) => {
    const errors = {};
    if (!values.name) errors.name = 'Name is required';
    if (!values.baptismName) errors.baptismName = 'Baptism Name is required';
    if (!values.relation) errors.relation = 'Relation is required';
    if (!values.gender) errors.gender = 'Gender is required';
    if (!values.dob) errors.dob = 'Date of Birth is required';
    return errors;
  };
  const fetchAllFamilies = async () => {
    try {
      const response = await axiosInstance.get('/family/all');
      setAllFamilies(response.data);
    } catch (error) {
      showSnackbar('Failed to fetch families', 'error');
      console.error('Error fetching families:', error);
    }
  };
  const fetchDestinationKoottaymas = async (parishId) => {
    try {
      const response = await axiosInstance.get(`/koottayma/parish/${parishId}`);
      setDestinationParishKoottaymas(response.data);
    } catch (error) {
      showSnackbar('Failed to fetch koottaymas', 'error');
      console.error('Error fetching koottaymas:', error);
    }
  };
  const handleMovePerson = async () => {
    try {
      if (!selectedPerson || !destinationFamily || !newRelation || 
          !destinationParishForPerson || !destinationKoottaymaForPerson) {
        showSnackbar('Please select all required fields', 'error');
        return;
      }
      const destParishResponse = await axiosInstance.get(`/parish/getforane/${destinationParishForPerson}`);
      const destinationForane = destParishResponse.data.forane;
  
      // First update person with all necessary fields
      await axiosInstance.put(`/person/${selectedPerson._id}`, {
        family: destinationFamily.id,
        relation: newRelation,
        parish: destinationParishForPerson, // Update parish
        forane: destinationForane._id,      // Update forane
        status: 'active',
        narration: `Moved to family ${destinationFamily.name} from ${selectedFamily.name} on ${new Date().toLocaleDateString()}`
      });
      // Get source parish and koottayma details
      const sourceParish = parishes.find(p => p._id === selectedParish);
      const sourceKoottayma = koottaymas.find(k => k.koottaymaId === selectedKoottayma);
      const destParish = parishes.find(p => p._id === destinationParishForPerson);
      const destKoottayma = destinationParishKoottaymas.find(
        k => k.koottaymaId === destinationKoottaymaForPerson
      );
  
      // Create movement record
      const movementData = {
        person: selectedPerson._id,
        personName: selectedPerson.name,
        // Source details
        sourceFamily: selectedFamily.id,
        sourceFamilyName: selectedFamily.name,
        sourceParish: sourceParish._id,
        sourceParishName: sourceParish.name,
        sourceKoottayma: sourceKoottayma.koottaymaId,
        sourceKoottaymaName: sourceKoottayma.name,
        // Destination details
        destinationFamily: destinationFamily._id,
        destinationFamilyName: destinationFamily.name,
        destinationParish: destParish._id,
        destinationParishName: destParish.name,
        destinationKoottayma: destKoottayma.koottaymaId,
        destinationKoottaymaName: destKoottayma.name,
        oldRelation: selectedPerson.relation,
        newRelation: newRelation,
        movedDate: new Date(),
        status: 'completed',
        remarks: remarks || ''
      };
  
      console.log('Movement Data being sent:', movementData);
  
      // Update person's family and relation first
      await axiosInstance.put(`/person/${selectedPerson._id}`, {
        family: destinationFamily._id,
        relation: newRelation
      });
  
      // Then record the movement
      const response = await axiosInstance.post('/person-movements/person-movements', movementData);
      console.log('Movement response:', response);
  
      showSnackbar('Person moved successfully', 'success');
      setOpenMovePersonDialog(false);
      fetchPersons(selectedFamily.id);
      
      // Reset state
      setSelectedPerson(null);
      setDestinationFamily(null);
      setDestinationParishForPerson(null);
      setDestinationKoottaymaForPerson(null);
      setNewRelation('');
      setRemarks('');
      
    } catch (error) {
      console.error('Error moving person:', error);
      console.error('Error details:', {
        message: error.response?.data?.message || error.message,
        data: error.response?.data,
        status: error.response?.status
      });
      showSnackbar(error.response?.data?.message || 'Failed to move person', 'error');
    }
  };

  // Function to mark person as moved out
  const handlePersonMoveOut = async (person) => {
    try {
      // Update person status
      await axiosInstance.put(`/person/${person._id}`, {
        status: 'moved_out',
        moveOutDate: new Date()
      });

      // Create movement record
      const movementData = {
        person: person._id,
        personName: person.name,
        sourceFamily: selectedFamily.id,
        sourceFamilyName: selectedFamily.name,
        destinationFamily: null,
        destinationFamilyName: 'Moved Out of Diocese',
        oldRelation: person.relation,
        newRelation: 'moved_out',
        movedDate: new Date(),
        status: 'moved_out'
      };

      await axiosInstance.post('/person-movements/person-movements', movementData);
      
      showSnackbar('Person marked as moved out', 'success');
      fetchPersons(selectedFamily.id);
    } catch (error) {
      showSnackbar('Failed to update person status', 'error');
      console.error('Error updating person status:', error);
    }
  };

  // Fetch person movement history
  const fetchPersonMovements = async () => {
    try {
      const response = await axiosInstance.get('/person-movements/person-movements');
      setPersonMovements(response.data);
    } catch (error) {
      showSnackbar('Failed to fetch movement history', 'error');
      console.error('Error fetching movements:', error);
    }
  };

  
  const fetchKoottaymas = async (parishId) => {
    try {
      const response = await axiosInstance.get(`/koottayma/parish/${parishId}`);
      setKoottaymas(response.data);
    } catch (error) {
      showSnackbar('Failed to fetch koottaymas', 'error');
      console.error('Error fetching koottaymas:', error);
    }
  };

  const fetchDKoottaymas = async (parishId) => {
    try {
      const response = await axiosInstance.get(`/koottayma/parish/${parishId}`);
      setDKoottaymas(response.data);
    } catch (error) {
      showSnackbar('Failed to fetch koottaymas', 'error');
      console.error('Error fetching koottaymas:', error);
    }
  };

  const fetchFamilies = async (parishId, koottaymaId) => {
    try {
      let response;
      if (currentView === 'currentKootayma') {
        response = await axiosInstance.get(`/family/kottayma/${koottaymaId}`);
      } else {
        response = await axiosInstance.get(`/family/parish/${parishId}`);
      }
      const familiesWithDetails = await Promise.all(
        response.data.map(async (family) => {
          const personsResponse = await axiosInstance.get(`/person/family/${family.id}`);
          const head = personsResponse.data.find((person) => person.relation === 'head');
          const members = personsResponse.data.map((person) => person.name).join(', ');

          return {
            id: family.id,
            name: family.name,
            building: family.building,
            pincode: family.pincode,
            phone: family.phone,
            familyNumber: family.familyNumber,
            headname: head ? head.name : 'No head assigned',
            members,
            kootayma: family.koottayma,
          };
        })
      );
      setFamilies(familiesWithDetails);
    } catch (error) {
      showSnackbar('Failed to fetch families', 'error');
      console.error('Error fetching families:', error);
    }
  };


  const fetchDFamilies = async (koottaymaId) => {
    console.log(koottaymaId);
    try {
      const response = await axiosInstance.get(`/family/kottayma/${koottaymaId}`);
      const familiesWithHeads = await Promise.all(
        response.data.map(async (family) => {
          const personsResponse = await axiosInstance.get(`/person/family/${family.id}`);
          const head = personsResponse.data.find((person) => person.relation === "head");
          return {
            id: family.id,
            name: family.name,
            headName: head ? head.name : "No head assigned",
          };
        })
      );
      console.log(familiesWithHeads);
      setDFamilies(familiesWithHeads);
    } catch (error) {
      console.error("Error fetching families:", error);
    }
  };
  const handleSaveRow = async ({ exitEditingMode, row, values }) => {
    try {
      const errors = handleValidation(values);
      if (Object.keys(errors).length > 0) {
        setValidationErrors(errors);
        showSnackbar('Please fill in all required fields', 'error');
        return;
      }
  
      console.log('Updating person with data:', values);
      
      await axiosInstance.put(`/person/${row.original._id}`, values);
      exitEditingMode(); // Exit edit mode
      setIsEditingRow(false);
      setValidationErrors({});
      
      await fetchPersons(selectedFamily.id); // Refresh data
      showSnackbar('Person details updated successfully', 'success');
    } catch (error) {
      console.error('Error updating person:', error);
      showSnackbar('Failed to update person details', 'error');
    }
  };
  
  const fetchMovements = async () => {
    try {
      setMovementsLoading(true);
      const response = await axiosInstance.get('/family-movements');
      setMovements(response.data);
    } catch (error) {
      showSnackbar('Failed to fetch movement history', 'error');
      console.error('Error fetching movements:', error);
    } finally {
      setMovementsLoading(false);
    }
  };

  const fetchPersons = async (familyId) => {
    try {
      const response = await axiosInstance.get(`/person/family/${familyId}`);
      setPersons(response.data);
    } catch (error) {
      showSnackbar('Failed to fetch persons', 'error');
      console.error('Error fetching persons:', error);
    }
  };

  const fetchTransactions = async (familyId) => {
    try {
      const personsResponse = await axiosInstance.get(`/person/family/${familyId}`);
      const transactionsData = await Promise.all(
        personsResponse.data.map(async (person) => {
          const response = await axiosInstance.get(`/transaction/person/${person._id}`);
          const currentYearResponse = await axiosInstance.get(
            `/transaction/person/${person._id}/year/${currentYear}`
          );

          return {
            personId: person._id,
            totalAmount: response.data?.totalAmount || 0,
            currentYearAmount: currentYearResponse.data?.totalAmount || 0,
          };
        })
      );
      setTransactions(transactionsData);
    } catch (error) {
      showSnackbar('Failed to fetch transactions', 'error');
      console.error('Error fetching transactions:', error);
    }
  };

  // Event Handlers
  const handleCurrentAmountChange = (e, personId) => {
    const amount = parseFloat(e.target.value) || 0;

    setTransactions((prev) =>
      prev.map((transaction) =>
        transaction.personId === personId ? { ...transaction, currentYearAmount: amount } : transaction
      )
    );

    setCurrentTransactions((prev) => {
      const existingIndex = prev.findIndex((t) => t.person === personId);
      if (existingIndex > -1) {
        const newTransactions = [...prev];
        newTransactions[existingIndex] = { ...newTransactions[existingIndex], amountPaid: amount };
        return newTransactions;
      }
      return [...prev, { person: personId, amountPaid: amount }];
    });
  };

  const handleSaveCurrentTransactions = async () => {
    try {
      const parishResponse = await axiosInstance.get(`/parish/${selectedParish}`);
      const forane = parishResponse.data.forane;
      const today = new Date();
      const formattedDate = `${String(today.getDate()).padStart(2, '0')}/${String(
        today.getMonth() + 1
      ).padStart(2, '0')}/${today.getFullYear()}`;

      await Promise.all(
        currentTransactions.map(async (transaction) => {
          const yearlyResponse = await axiosInstance.get(
            `/transaction/person/${transaction.person}/year/${currentYear}`
          );

          const transactionData = {
            person: transaction.person,
            amountPaid: Number(transaction.amountPaid),
            family: selectedFamily.familyNumber,
            parish: selectedParish,
            forane: forane._id,
            date: formattedDate,
          };

          if (yearlyResponse.data.transactions.length > 0) {
            const existingTransaction = yearlyResponse.data.transactions[0];
            await axiosInstance.put(
              `/transaction/transactionId/${existingTransaction._id}`,
              transactionData
            );
          } else {
            await axiosInstance.post('/transaction', transactionData);
          }
        })
      );

      showSnackbar(`Transactions for ${currentYear} saved successfully`, 'success');
      await fetchTransactions(selectedFamily.id);
      setCurrentTransactions([]);
    } catch (error) {
      showSnackbar('Failed to save transactions', 'error');
      console.error('Error saving transactions:', error);
    }
  };

  const handleMoveFamily = async () => {
    try {
      if (!selectedFamily || !destinationParish || !destinationKoottayma) {
        showSnackbar('Please select all required fields', 'error');
        return;
      }
  
      // Get source parish and koottayma
      const sourceParish = parishes.find(p => p._id === selectedParish);
      const sourceKoottayma = koottaymas.find(k => k.koottaymaId === selectedKoottayma);
      const destParish = parishes.find(p => p._id === destinationParish);
      const destKoottayma = Dkoottaymas.find(k => k.koottaymaId === destinationKoottayma);
  
      // Get destination forane
      const foraneResponse = await axiosInstance.get(`/parish/getforane/${destinationParish}`);
      const destinationForane = foraneResponse.data.forane;
  
      if (!sourceParish || !sourceKoottayma || !destParish || !destKoottayma || !destinationForane) {
        throw new Error('Missing required parish, koottayma, or forane data');
      }
  
      console.log('Moving family:', {
        familyId: selectedFamily.id,
        from: {
          parish: sourceParish.name,
          koottayma: sourceKoottayma.name
        },
        to: {
          parish: destParish.name,
          koottayma: destKoottayma.name,
          forane: destinationForane.name
        }
      });
  
      // Update family location
      const familyUpdateResponse = await axiosInstance.put(
        `/family/${selectedFamily.id}`,
        {
          parish: destinationParish,
          koottayma: destinationKoottayma,
          forane: destinationForane._id  // Include forane in update
        }
      );
  
      console.log('Family Update Response:', familyUpdateResponse);
  
      // Create movement record
      const movementData = {
        family: selectedFamily.id,
        familyName: selectedFamily.name,
        familyNumber: parseInt(selectedFamily.familyNumber) || 0,
        sourceParish: sourceParish._id,
        sourceParishName: sourceParish.name,
        sourceKoottayma: sourceKoottayma.koottaymaId,
        sourceKoottaymaName: sourceKoottayma.name,
        destinationParish: destParish._id,
        destinationParishName: destParish.name,
        destinationKoottayma: destKoottayma.koottaymaId,
        destinationKoottaymaName: destKoottayma.name,       
        movedDate: new Date(),
        status: 'completed'
      };
  
      await axiosInstance.post('/family-movements', movementData);
        
      showSnackbar('Family moved successfully', 'success');
      setOpenMoveDialog(false);
      fetchFamilies(selectedParish, selectedKoottayma);
      fetchMovements();
        
      // Reset move dialog state
      setDestinationParish('');
      setDestinationKoottayma('');
    } catch (error) {
      console.error('Error moving family:', error);
      console.error('Error details:', {
        response: error.response?.data,
        message: error.message
      });
      
      const errorMessage = error.response?.data?.message || error.message || 'Failed to move family';
      showSnackbar(errorMessage, 'error');
    }
  };

  const showSnackbar = (message, severity = 'success') => {
    setSnackbar({
      open: true,
      message,
      severity,
    });
  };

  // Table Configurations
  const familyColumns = [
    {
      accessorKey: 'name',
      header: 'House Name',
      size: 250,
      enableGlobalFilter: true,
    },
    {
      accessorKey: 'headname',
      header: 'Family Head',
      size: 250,
      enableGlobalFilter: true,
    },
    {
      accessorKey: 'members',
      header: 'Members',
      size: 500,
      enableGlobalFilter: true,
    },
  ];
  const personMovementColumns = [
    {
      accessorKey: 'personName',
      header: 'Person Name',
      size: 150,
    },
    {
      accessorKey: 'sourceFamilyName',
      header: 'From Family',
      size: 150,
    },
    {
      accessorKey: 'sourceParishName',
      header: 'From Parish',
      size: 150,
    },
    {
      accessorKey: 'sourceKoottaymaName',
      header: 'From Koottayma',
      size: 150,
    },
    {
      accessorKey: 'destinationFamilyName',
      header: 'To Family',
      size: 150,
    },
    {
      accessorKey: 'destinationParishName',
      header: 'To Parish',
      size: 150,
    },
    {
      accessorKey: 'destinationKoottaymaName',
      header: 'To Koottayma',
      size: 150,
    },
    {
      accessorKey: 'oldRelation',
      header: 'Old Relation',
      size: 100,
    },
    {
      accessorKey: 'newRelation',
      header: 'New Relation',
      size: 100,
    },
    {
      accessorKey: 'status',
      header: 'Status',
      size: 100,
    },
    {
      accessorKey: 'movedDate',
      header: 'Moved Date',
      size: 150,
      Cell: ({ cell }) => {
        const date = new Date(cell.getValue());
        return date.toLocaleDateString('en-GB', {
          day: '2-digit',
          month: '2-digit',
          year: 'numeric',
          hour: '2-digit',
          minute: '2-digit'
        });
      },
    }
  ];
   const personalInfoColumns = [
    {
      accessorKey: 'baptismName',
      header: 'Baptism',
      size: 70,
      enableEditing: true,
      muiTableBodyCellEditTextFieldProps: ({ cell, table }) => ({
        required: true,
        error: !!validationErrors.baptismName,
        helperText: validationErrors.baptismName,
        onBlur: (event) => {
          const value = event.target.value;
          cell.row.setValue(cell.column.id, value);
          table.setEditingCell(null);
        }
      }),
    },
    {
      accessorKey: 'name',
      header: 'Name',
      size: 70,
      enableEditing: true,
      muiTableBodyCellEditTextFieldProps: ({ cell, table }) => ({
        required: true,
        error: !!validationErrors.name,
        helperText: validationErrors.name,
        onBlur: (event) => {
          const value = event.target.value;
          cell.row.setValue(cell.column.id, value);
          table.setEditingCell(null);
        }
      }),
    },
    {
      accessorKey: 'relation',
      header: 'Rel.',
      size: 60,
      enableEditing: true,
      editVariant: 'select',
      editSelectOptions: ['head', 'wife', 'son', 'daughter', 'other'],
      muiTableBodyCellEditTextFieldProps: ({ cell, table }) => ({
        select: true,
        required: true,
        error: !!validationErrors.relation,
        helperText: validationErrors.relation,
        onChange: (event) => {
          const value = event.target.value;
          cell.row.setValue(cell.column.id, value);
          table.setEditingCell(null);
        }
      }),
    },
    {
      accessorKey: 'gender',
      header: 'Sex',
      size: 45,
      enableEditing: true,
      editVariant: 'select',
      editSelectOptions: ['male', 'female', 'other'],
      muiTableBodyCellEditTextFieldProps: ({ cell, table }) => ({
        select: true,
        required: true,
        error: !!validationErrors.gender,
        helperText: validationErrors.gender,
        onChange: (event) => {
          const value = event.target.value;
          cell.row.setValue(cell.column.id, value);
          table.setEditingCell(null);
        }
      }),
    },
    {
      accessorKey: 'dob',
      header: 'DOB',
      size: 85,
      enableEditing: true,
      muiTableBodyCellEditTextFieldProps: ({ cell, table }) => ({
        type: 'date',
        required: true,
        error: !!validationErrors.dob,
        helperText: validationErrors.dob,
        onBlur: (event) => {
          const value = event.target.value;
          cell.row.setValue(cell.column.id, value);
          table.setEditingCell(null);
        }
      }),
    },
    {
      accessorKey: 'occupation',
      header: 'Occ.',
      size: 60,
      enableEditing: true,
      muiTableBodyCellEditTextFieldProps: ({ cell, table }) => ({
        onBlur: (event) => {
          const value = event.target.value;
          cell.row.setValue(cell.column.id, value);
          table.setEditingCell(null);
        }
      }),
    },
    {
      accessorKey: 'education',
      header: 'Edu.',
      size: 60,
      enableEditing: true,
      muiTableBodyCellEditTextFieldProps: ({ cell, table }) => ({
        onBlur: (event) => {
          const value = event.target.value;
          cell.row.setValue(cell.column.id, value);
          table.setEditingCell(null);
        }
      }),
    },
    {
      id: 'currentAmount',
      header: `Amt - ${currentYear}`,
      size: 70,
      enableEditing: false,
      Cell: ({ row }) => {
        const transaction = transactions.find((t) => t.personId === row.original._id);
        return (
          <TextField
            type="number"
            value={transaction?.currentYearAmount?.toFixed(0) || '0'}
            onChange={(e) => handleCurrentAmountChange(e, row.original._id)}
            variant="outlined"
            size="small"
            fullWidth
            InputProps={{
              startAdornment: <InputAdornment position="start"></InputAdornment>,
              sx: { height: '28px', '& input': { padding: '4px' } }
            }}
          />
        );
      },
    },
    {
      id: 'totalAmount',
      header: 'Total',
      size: 60,
      enableEditing: false,
      Cell: ({ row }) => {
        const transaction = transactions.find((t) => t.personId === row.original._id);
        return `₹${(transaction?.totalAmount || 0).toFixed(0)}`;
      },
    },
    {
      id: 'actions',
      header: 'Actions',
      size: 180,
      enableEditing: false,
      Cell: ({ row, table }) => (
        <Box sx={{ display: 'flex', gap: '4px' }}>
          {table.getState().editingRow?.id === row.id ? (
            <>
              <Tooltip title="Save">
                <IconButton
                  onClick={() => {
                    table.setEditingRow(null);
                    handleSaveRow({
                      exitEditingMode: () => table.setEditingRow(null),
                      row,
                      values: row._valuesCache,
                    });
                  }}
                  color="primary"
                >
                  <SaveIcon />
                </IconButton>
              </Tooltip>
              <Tooltip title="Cancel">
                <IconButton
                  onClick={() => {
                    table.setEditingRow(null);
                    handleEditCancel();
                  }}
                  color="error"
                >
                  <CancelIcon />
                </IconButton>
              </Tooltip>
            </>
          ) : (
            <>
              <Tooltip title="Edit">
                <IconButton
                  onClick={() => {
                    table.setEditingRow(row);
                    handleEditStart();
                  }}
                >
                  <EditIcon />
                </IconButton>
              </Tooltip>
              <Tooltip title="Move to Another Family">
                <IconButton
                  onClick={() => {
                    setSelectedPerson(row.original);
                    setOpenMovePersonDialog(true);
                    //fetchAllFamilies();
                  }}
                >
                  <MoveIcon />
                </IconButton>
              </Tooltip>
              <Tooltip title="Mark as Moved Out">
                <IconButton
                  onClick={() => handlePersonMoveOut(row.original)}
                  color="error"
                >
                  <DeleteIcon />
                </IconButton>
              </Tooltip>
            </>
          )}
        </Box>
      ),
    },
  ];


// Movement history columns
const movementColumns = [
  {
    accessorKey: 'familyNumber',
    header: 'Family Number',
    size: 150,
  },
  {
    accessorKey: 'familyName',
    header: 'Family Name',
    size: 200,
  },
  {
    accessorKey: 'sourceParishName',
    header: 'From Parish',
    size: 200,
  },
  {
    accessorKey: 'sourceKoottaymaName',
    header: 'From Koottayma',
    size: 200,
  },
  {
    accessorKey: 'destinationParishName',
    header: 'To Parish',
    size: 200,
  },
  {
    accessorKey: 'destinationKoottaymaName',
    header: 'To Koottayma',
    size: 200,
  },
  {
    accessorKey: 'movedDate',
    header: 'Moved Date',
    size: 200,
    Cell: ({ cell }) => {
      const date = new Date(cell.getValue());
      return date.toLocaleDateString('en-GB', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
    },
  }
];

return (
  <Container maxWidth="xl" sx={{ py: 4 }}>
    <StyledCard>
      <CardContent>
        <Typography 
          variant="h4" 
          gutterBottom 
          sx={{ 
            fontWeight: 600, 
            color: (theme) => theme.palette.primary.main,
            mb: 4,
            borderBottom: (theme) => `2px solid ${alpha(theme.palette.primary.main, 0.1)}`,
            pb: 2
          }}
        >
          Family Management
        </Typography>

        <Grid container spacing={3}>
          {/* Left Sidebar */}
          <Grid item xs={12} md={3}>
            <Stack spacing={3}>
              <StyledFormControl>
                <InputLabel>Church</InputLabel>
                <Select
                  value={selectedParish || ''}
                  onChange={(e) => setSelectedParish(e.target.value)}
                  label="Church"
                >
                  {parishes.map((parish) => (
                    <MenuItem key={parish._id} value={parish._id}>
                      {parish.name}
                    </MenuItem>
                  ))}
                </Select>
              </StyledFormControl>

              <StyledFormControl>
                <InputLabel>Kootayma</InputLabel>
                <Select
                  value={selectedKoottayma || ''}
                  onChange={(e) => setSelectedKoottayma(e.target.value)}
                  label="Kootayma"
                  disabled={!selectedParish}
                >
                  {koottaymas.map((koottayma) => (
                    <MenuItem key={koottayma.koottaymaId} value={koottayma.koottaymaId}>
                      {koottayma.name}
                    </MenuItem>
                  ))}
                </Select>
              </StyledFormControl>

              {selectedFamily && (
                <StyledPaper>
                  <Stack spacing={2}>
                    <Typography variant="h6" color="primary" sx={{ fontWeight: 600 }}>
                      Family Details
                    </Typography>
                    
                    <StyledTextField
                      fullWidth
                      label="House"
                      value={selectedFamily.name}
                      variant="outlined"
                    />

                    <StyledTextField
                      fullWidth
                      label="Address"
                      value={selectedFamily.building}
                      variant="outlined"
                      multiline
                      rows={2}
                    />

                    <StyledTextField
                      fullWidth
                      label="Tel"
                      value={selectedFamily.phone}
                      variant="outlined"
                    />

                    <StyledTextField
                      fullWidth
                      label="PIN"
                      value={selectedFamily.pincode}
                      variant="outlined"
                    />

                    <StyledTextField
                      label="Tithe Total"
                      value={transactions.reduce((total, transaction) => 
                        total + (transaction.totalAmount || 0), 0).toFixed(2)}
                      variant="outlined"
                      InputProps={{
                        readOnly: true,
                        startAdornment: <InputAdornment position="start">₹</InputAdornment>,
                      }}
                    />
                  </Stack>
                </StyledPaper>
              )}
            </Stack>
          </Grid>

          {/* Main Content Area */}
          <Grid item xs={12} md={9}>
            <StyledPaper sx={{ mb: 3 }}>
              <Stack 
                direction="row" 
                spacing={2} 
                alignItems="center" 
                justifyContent="space-between"
              >
                <StyledRadioGroup
                  row
                  value={currentView}
                  onChange={(e) => setCurrentView(e.target.value)}
                >
                  <FormControlLabel
                    value="currentKootayma"
                    control={<Radio />}
                    label="Current Kootayma"
                  />
                  <FormControlLabel
                    value="allKootayma"
                    control={<Radio />}
                    label="All Kootayma"
                  />
                </StyledRadioGroup>

                {selectedFamily && (
                  <StyledTextField
                    label="Family Number"
                    value={selectedFamily.familyNumber}
                    variant="outlined"
                    size="small"
                    InputProps={{
                      startAdornment: (
                        <InputAdornment position="start">NEW</InputAdornment>
                      ),
                    }}
                  />
                )}
              </Stack>
            </StyledPaper>

            <StyledTableContainer>
              <MaterialReactTable
                columns={familyColumns}
                data={families}
                enableColumnResizing
                enableRowSelection={false}
                enableGlobalFilter={true}
                {...tableCustomStyles}
                muiTableBodyRowProps={({ row }) => ({
                  onClick: () => {
                    setSelectedFamily(row.original);
                    setSelectedKoottayma(row.original.kootayma);
                    fetchPersons(row.original.id);
                    fetchTransactions(row.original.id);
                  },
                  sx: {
                    cursor: 'pointer',
                    '&:hover': {
                      backgroundColor: (theme) => alpha(theme.palette.primary.main, 0.04),
                    },
                  },
                })}
              />
            </StyledTableContainer>

            {/* Action Buttons */}
            {selectedFamily && (
              <>
                <Stack direction="row" spacing={2} sx={{ mt: 3 }}>
                  <StyledButton
                    variant="contained"
                    startIcon={<MoveIcon />}
                    onClick={() => setOpenMoveDialog(true)}
                    disabled={!selectedFamily}
                    fullWidth
                  >
                    Move
                  </StyledButton>

                  <StyledButton
                    variant="outlined"
                    startIcon={<HistoryIcon />}
                    onClick={() => {
                      setShowPersonMovementsDialog(true);
                      fetchPersonMovements();
                    }}
                    fullWidth
                  >
                    Person Movement History
                  </StyledButton>

                  <StyledButton
                    variant="outlined"
                    startIcon={<HistoryIcon />}
                    onClick={() => {
                      setShowMovementsDialog(true);
                      fetchMovements();
                    }}
                    fullWidth
                  >
                    Family Movement History
                  </StyledButton>
                </Stack>

                {/* Personal Information Table */}
                <Box sx={{ mt: 4 }}>
                  <Typography variant="h6" gutterBottom sx={{ 
                    fontWeight: 600,
                    color: (theme) => theme.palette.primary.main,
                    mb: 3 
                  }}>
                    Personal and Tithe Information
                  </Typography>
                  <StyledTableContainer>
                    <MaterialReactTable
                      columns={personalInfoColumns}
                      data={persons}
                      enableRowActions
                      enableEditing
                      editDisplayMode="row"
                      onEditingRowSave={handleSaveRow}
                      onEditingRowCancel={handleEditCancel}
                      onEditingRowStart={handleEditStart}
                      {...tableCustomStyles}
                      state={{
                        validationErrors,
                        isEditing: isEditingRow,
                      }}
                      renderBottomToolbarCustomActions={() => (
                        <StyledButton
                          variant="contained"
                          onClick={handleSaveCurrentTransactions}
                          startIcon={<SaveIcon />}
                          sx={{ m: 1 }}
                        >
                          Save Current Transactions
                        </StyledButton>
                      )}
                    />
                  </StyledTableContainer>
                </Box>
              </>
            )}
          </Grid>
        </Grid>
      </CardContent>
    </StyledCard>

    {/* Dialogs */}
    {/* Move Person Dialog */}
    <Dialog
      open={openMovePersonDialog}
      onClose={() => setOpenMovePersonDialog(false)}
      maxWidth="sm"
      fullWidth
      PaperProps={{
        sx: {
          borderRadius: '16px',
          boxShadow: '0 8px 32px rgba(0, 0, 0, 0.12)',
        },
      }}
    >
      <StyledDialogTitle>
        <Typography variant="h6">Move Person to Another Family</Typography>
      </StyledDialogTitle>
      <DialogContent sx={{ p: 3 }}>
        <Stack spacing={3} sx={{ mt: 1 }}>
          <Typography variant="subtitle1" sx={{ 
            color: (theme) => theme.palette.primary.main,
            fontWeight: 600 
          }}>
            Moving: {selectedPerson?.name}
          </Typography>

          <StyledFormControl>
            <InputLabel>Destination Parish</InputLabel>
            <Select
              value={destinationParishForPerson || ''}
              onChange={(e) => {
                setDestinationParishForPerson(e.target.value);
                setDestinationKoottaymaForPerson(null);
                fetchDestinationKoottaymas(e.target.value);
              }}
              label="Destination Parish"
            >
              {parishes.map((parish) => (
                <MenuItem key={parish._id} value={parish._id}>
                  {parish.name}
                </MenuItem>
              ))}
            </Select>
          </StyledFormControl>

          <StyledFormControl>
            <InputLabel>Destination Koottayma</InputLabel>
            <Select
              value={destinationKoottaymaForPerson || ''}
              onChange={(e) => {
                setDestinationKoottaymaForPerson(e.value);
                fetchDFamilies(e.target.value);
              }}
              label="Destination Koottayma"
              disabled={!destinationParishForPerson}
            >
              {destinationParishKoottaymas.map((koottayma) => (
                <MenuItem key={koottayma.koottaymaId} value={koottayma.koottaymaId}>
                  {koottayma.name}
                </MenuItem>
              ))}
            </Select>
          </StyledFormControl>

          <Autocomplete
            options={dfamilies}
            getOptionLabel={(option) => `${option.name} (${option.headName})`}
            value={destinationFamily}
            onChange={(event, newValue) => setDestinationFamily(newValue)}
            renderInput={(params) => (
              <StyledTextField
                {...params}
                label="Select Destination Family"
                error={!destinationFamily && dfamilies.length === 0}
                helperText={!destinationFamily && dfamilies.length === 0 ? "No families found" : ""}
              />
            )}
            disabled={!destinationParishForPerson || !destinationKoottaymaForPerson}
            isOptionEqualToValue={(option, value) => option.id === value?.id}
          />

          <StyledFormControl>
            <InputLabel>New Relation</InputLabel>
            <Select
              value={newRelation}
              onChange={(e) => setNewRelation(e.target.value)}
              label="New Relation"
            >
              <MenuItem value="head">Head</MenuItem>
              <MenuItem value="wife">Wife</MenuItem>
              <MenuItem value="son">Son</MenuItem>
              <MenuItem value="daughter">Daughter</MenuItem>
              <MenuItem value="other">Other</MenuItem>
            </Select>
          </StyledFormControl>

          <StyledTextField
            fullWidth
            label="Remarks"
            multiline
            rows={2}
            value={remarks}
            onChange={(e) => setRemarks(e.target.value)}
          />
        </Stack>
      </DialogContent>
      <DialogActions sx={{ p: 3 }}>
        <StyledButton
          onClick={() => setOpenMovePersonDialog(false)}
          variant="outlined"
        >
          Cancel
        </StyledButton>
        <StyledButton
          onClick={handleMovePerson}
          variant="contained"
          disabled={!destinationFamily || !newRelation || 
                   !destinationParishForPerson || !destinationKoottaymaForPerson}
        >
          Move Person
        </StyledButton>
      </DialogActions>
    </Dialog>

    {/* Movement History Dialog */}
    <Dialog
      open={showMovementsDialog}
      onClose={() => setShowMovementsDialog(false)}
      maxWidth="xl"
      fullWidth
      PaperProps={{
        sx: {
          borderRadius: '16px',
          boxShadow: '0 8px 32px rgba(0, 0, 0, 0.12)',
        },
      }}
    >
      <StyledDialogTitle>
        <Stack direction="row" justifyContent="space-between" alignItems="center">
          <Typography variant="h6">Family Movement History</Typography>
          <StyledIconButton onClick={fetchMovements} disabled={movementsLoading}>
            <RefreshIcon />
          </StyledIconButton>
        </Stack>
      </StyledDialogTitle>
      <DialogContent sx={{ p: 3 }}>
        <StyledTableContainer>
          <MaterialReactTable
            columns={movementColumns}
            data={movements}
            enableColumnResizing
            enablePagination={true}
            enableColumnFilters={true}
            enableGlobalFilter={true}
            state={{ isLoading: movementsLoading }}
            {...tableCustomStyles}
            renderTopToolbarCustomActions={() => (
              <StyledButton
                variant="contained"
                onClick={() => {
                  const exportData = movements.map(m => ({
                    'Family Number': m.familyNumber,
                    'Family Name': m.familyName,
                    'From Parish': m.sourceParishName,
                    'From Koottayma': m.sourceKoottaymaName,
                    'To Parish': m.destinationParishName,
                    'To Koottayma': m.destinationKoottaymaName,
                    'Moved Date': new Date(m.movedDate).toLocaleString(),
                  }));
                  
                  const csvContent = "data:text/csv;charset=utf-8,"
                    + Object.keys(exportData[0]).join(",") + "\n"
                    + exportData.map(row => Object.values(row).join(",")).join("\n");
                  
                  const encodedUri = encodeURI(csvContent);
                  const link = document.createElement("a");
                  link.setAttribute("href", encodedUri);
                  link.setAttribute("download", "family_movements.csv");
                  document.body.appendChild(link);
                  link.click();
                }}
                startIcon={<FileDownloadIcon />}
              >
                Export to CSV
              </StyledButton>
            )}
          />
        </StyledTableContainer>
      </DialogContent>
      <DialogActions sx={{ p: 3 }}>
        <StyledButton onClick={() => setShowMovementsDialog(false)}>
          Close
        </StyledButton>
      </DialogActions>
    </Dialog>

    {/* Person Movements Dialog */}
    <Dialog
      open={showPersonMovementsDialog}
      onClose={() => setShowPersonMovementsDialog(false)}
      maxWidth="xl"
      fullWidth
      PaperProps={{
        sx: {
          borderRadius: '16px',
          boxShadow: '0 8px 32px rgba(0, 0, 0, 0.12)',
        },
      }}
    >
      <StyledDialogTitle>
        <Stack direction="row" justifyContent="space-between" alignItems="center">
          <Typography variant="h6">Person Movement History</Typography>
          <StyledIconButton onClick={fetchPersonMovements}>
            <RefreshIcon />
          </StyledIconButton>
        </Stack>
      </StyledDialogTitle>
      <DialogContent sx={{ p: 3 }}>
        <StyledTableContainer>
          <MaterialReactTable
            columns={personMovementColumns}
            data={personMovements}
            enableColumnResizing
            enablePagination={true}
            enableColumnFilters={true}
            enableGlobalFilter={true}
            {...tableCustomStyles}
            renderTopToolbarCustomActions={() => (
              <StyledButton
                variant="contained"
                startIcon={<FileDownloadIcon />}
                onClick={() => {
                  const exportData = personMovements.map(m => ({
                    'Person Name': m.personName,
                    'From Family': m.sourceFamilyName,
                    'To Family': m.destinationFamilyName,
                    'Old Relation': m.oldRelation,
                    'New Relation': m.newRelation,
                    'Status': m.status,
                    'Remarks': m.remarks,
                    'Moved Date': new Date(m.movedDate).toLocaleString(),
                  }));
                  
                  const csvContent = "data:text/csv;charset=utf-8,"
                    + Object.keys(exportData[0]).join(",") + "\n"
                    + exportData.map(row => Object.values(row).join(",")).join("\n");
                  
                  const encodedUri = encodeURI(csvContent);
                  const link = document.createElement("a");
                  link.setAttribute("href", encodedUri);
                  link.setAttribute("download", "person_movements.csv");
                  document.body.appendChild(link);
                  link.click();
                }}
              >
                Export to CSV
              </StyledButton>
            )}
          />
        </StyledTableContainer>
      </DialogContent>
      <DialogActions sx={{ p: 3 }}>
        <StyledButton onClick={() => setShowPersonMovementsDialog(false)}>
          Close
        </StyledButton>
      </DialogActions>
    </Dialog>

    {/* Snackbar */}
    <Snackbar
      open={snackbar.open}
      autoHideDuration={6000}
      onClose={() => setSnackbar({ ...snackbar, open: false })}
      anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
    >
      <StyledAlert
        onClose={() => setSnackbar({ ...snackbar, open: false })}
        severity={snackbar.severity}
        variant="filled"
      >
        {snackbar.message}
      </StyledAlert>
    </Snackbar>
  </Container>
);
};

export default FamilyManagement;