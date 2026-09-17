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
  Tabs,
  Tab,
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
  Chip,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Collapse,
  CircularProgress,
  Skeleton
} from '@mui/material';
import { MaterialReactTable } from 'material-react-table';
// import { CircularProgress } from '@mui/material';
import {
  Print as PrintIcon,
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
  FamilyRestroom as FamilyIcon, 
  Receipt as ReceiptIcon,
  Visibility as VisibilityIcon,
  People as PersonAddIcon,
  Add as AddIcon,
  Undo as UndoIcon,
  RestoreFromTrash as RestoreIcon,
  Warning as WarningIcon
} from '@mui/icons-material';
import { ThemeProvider, createTheme,styled } from '@mui/material/styles';
import axiosInstance from '../axiosConfig';
import { alpha } from '@mui/material/styles';
import { useTheme } from '@mui/material/styles';
import FamilyDetailsCard from './FamilyDetailsCard';
import FamilyPrintSystem from './FamilyPrintLayout ';
import { motion } from 'framer-motion';
import Select1 from 'react-select';
import { useFinancialYear } from './FinancialYearContext';
import { getCurrentUser, getCurrentUserId, getCurrentUserName } from '../utils/auth';
// Styled Components
const theme = createTheme({
  palette: {
    primary: {
      main: '#1976d2',
    },
    secondary: {
      main: '#dc004e',
    },
  },
  typography: {
    fontFamily: 'Roboto, sans-serif',
  },
});
const GradientCard = styled(Card)(({ theme }) => ({
  background: 'linear-gradient(145deg, #f0f4f8 0%, #e6eaf0 100%)',
  borderRadius: theme.spacing(2),
  boxShadow: '0 4px 15px rgba(0,0,0,0.1)',
  transition: 'transform 0.3s ease',
  '&:hover': {
    transform: 'scale(1.02)'
  }
}));

const StyledFormControl = styled(FormControl)(({ theme }) => ({
  marginBottom: theme.spacing(2),
  width: '100%'
}));

const ActionButton = styled(Button)(({ theme }) => ({
  borderRadius: theme.spacing(2),
  padding: theme.spacing(1.5),
  textTransform: 'none',
  fontWeight: 600
}));
// Styled Components
const StyledCard = styled(Card)(({ theme }) => ({
  height: '100%',
  borderRadius: theme.shape.borderRadius * 2,
  boxShadow: theme.shadows[2],
}));

const StyledSelect1 = styled(Select1)(({ theme }) => ({
  '& .react-select__control': {
    backgroundColor: theme.palette.background.paper,
    borderColor: theme.palette.divider,
    minHeight: '56px',
    '&:hover': {
      borderColor: theme.palette.primary.main,
    },
  },
  '& .react-select__control--is-focused': {
    borderColor: theme.palette.primary.main,
    boxShadow: `0 0 0 2px ${theme.palette.primary.lighter}`,
  },
  '& .react-select__indicator-separator': {
    backgroundColor: theme.palette.divider,
  },
  '& .react-select__menu': {
    backgroundColor: theme.palette.background.paper,
    zIndex: theme.zIndex.modal,
  },
  '& .react-select__option': {
    '&:hover': {
      backgroundColor: theme.palette.action.hover,
    },
  },
  '& .react-select__option--is-selected': {
    backgroundColor: theme.palette.primary.main,
    color: theme.palette.primary.contrastText,
  },
  '& .react-select__single-value': {
    color: theme.palette.text.primary,
  },
  '& .react-select__placeholder': {
    color: theme.palette.text.secondary,
  },
}));

const StyledButton = styled(Button)(({ theme }) => ({
  margin: theme.spacing(1),
}));

const StyledTableContainer = styled(Paper)(({ theme }) => ({
  marginTop: theme.spacing(3),
  marginBottom: theme.spacing(3),
}));

const FamilyManagement = () => {
  const { selectedYear1, formattedYear, startDate, endDate, updateYear } = useFinancialYear();
  const currentYear = selectedYear1;
   const currentUser = getCurrentUser();
  
  // Add audit tracking state
  const [auditDialogOpen, setAuditDialogOpen] = useState(false);
  const [selectedTransactionForAudit, setSelectedTransactionForAudit] = useState(null);
  const [transactionAuditLogs, setTransactionAuditLogs] = useState([]);
  const [auditLoading, setAuditLoading] = useState(false);
  // State Management
  const [loading, setLoading] = useState(false); 
  const [personalInfoLoading, setPersonalInfoLoading] = useState(false); 
  const [transactionLoading, setTransactionLoading] = useState(false); 
  const [loadingStates, setLoadingStates] = useState({
  familyList: false,
  personalInfo: false,
  transactions: false,
  search: false,
  movingPerson: false,
  updatingStatus: false
});
  const setLoadingState = (key, value) => {
  setLoadingStates(prev => ({ ...prev, [key]: value }));
};
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
  const [oneparishes, setoneParishes] = useState([]);
  const [koottaymas, setKoottaymas] = useState([]);
  const [Dkoottaymas, setDKoottaymas] = useState([]);
  const [selectedParish, setSelectedParish] = useState(null);
  const [selectedKoottayma, setSelectedKoottayma] = useState(null);
  const [persons, setPersons] = useState([]);
  const [transactions, setTransactions] = useState([]);
  const [currentTransactions, setCurrentTransactions] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [activeStatusTab, setActiveStatusTab] = useState('moved_out');
  const [selectedRowId, setSelectedRowId] = useState(null);
  const [searchFamilyNumber, setSearchFamilyNumber] = useState('');
  const [searchLoading, setSearchLoading] = useState(false);
  const [relations, setRelations] = useState([]);
  const [loadingRelations, setLoadingRelations] = useState(false);
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: '',
    severity: 'success',
  });
  const { 
    PrintDialog, 
    openPrintDialog, 
    closePrintDialog, 
    printDialogOpen 
  } = FamilyPrintSystem();
  const [isEditingRow, setIsEditingRow] = useState(false);
  const [validationErrors, setValidationErrors] = useState({});
  const [remarks, setRemarks] = useState('');

  const [showStatusHistoryDialog, setShowStatusHistoryDialog] = useState(false);
  const [statusHistoryData, setStatusHistoryData] = useState([]);
  
  // State for movement tracking
  const [movements, setMovements] = useState([]);
  const [showMovementsDialog, setShowMovementsDialog] = useState(false);
  const [movementsLoading, setMovementsLoading] = useState(false);

  // State for move family dialog
  const [openMoveDialog, setOpenMoveDialog] = useState(false);
  const [destinationParish, setDestinationParish] = useState('');
  const [destinationKoottayma, setDestinationKoottayma] = useState('');
  const [activeTab, setActiveTab] = useState('details');
  const [isKoottaymaLoading, setIsKoottaymaLoading] = useState(false);
const [isUpdatingStatus, setIsUpdatingStatus] = useState(false);
const [showTransactionDialog, setShowTransactionDialog] = useState(false);
const [selectedPersonTransactions, setSelectedPersonTransactions] = useState([]);
const [transactionPerson, setTransactionPerson] = useState(null);
const [expandedRows, setExpandedRows] = useState(new Set());
const [editingTransactionId, setEditingTransactionId] = useState(null);
const [editingAmount, setEditingAmount] = useState('');
const [addingNewTransaction, setAddingNewTransaction] = useState(false);
const [openAddPersonDialog, setOpenAddPersonDialog] = useState(false);
const [openEditFamilyDialog, setOpenEditFamilyDialog] = useState(false);
const [draggedRowIndex, setDraggedRowIndex] = useState(null);
const [dragOverRowIndex, setDragOverRowIndex] = useState(null);
const sortRelationsWithHeadFirst = (relationsList) => {
  const filtered = relationsList.filter(r => r !== 'head');
  filtered.sort();
  return relationsList.includes('head') ? ['head', ...filtered] : filtered;
};
// const KEYBOARD_SHORTCUTS = {
//   // Names (Ctrl + Letter)
//   'ctrl+q': 'Aleyamma',
//   'ctrl+w': 'Wife',
//   'ctrl+o': 'Elizabeth',
//   'ctrl+t': 'Thomas',
//   'ctrl+6': 'Annamma',
//   'ctrl+7': 'Marykutty',
//   'ctrl+4': 'Thrisiyamma',
  
//   // Education (Ctrl + Number)
//   'ctrl+1': 'SSLC',
//   'ctrl+2': 'Plus Two',
//   'ctrl+3': 'Plus One',
//   'ctrl+5': 'Below SSLC',
  
//   // Occupations
//   'ctrl+u': 'Student',
//   'ctrl+i': 'House Wife',
//   'ctrl+a': 'Agriculture',
//   'ctrl+j': 'Business',
//   'ctrl+z': 'Farmer',
  
//   // Relations
//   'ctrl+s': 'Son',
//   'ctrl+d': 'Daughter',
//   'ctrl+g': 'Grandson',
  
//   // Alt combinations for names
//   'alt+k': 'Kurian',
//   'alt+l': 'Alphonsa', // Alt + Shift + L for second Alt+L option
//   'alt+n': 'Philomina',
//   'alt+m': 'Mathew',
//   'alt+j': 'Joseph',
//   'alt+shift+g': 'George', // Alt + Shift + G to avoid conflict
//   'alt+shift+a': 'Antony', // Alt + Shift + A to avoid conflict
//   'alt+shift+d': 'Devasia', // Alt + Shift + D to avoid conflict
//   'alt+e': 'Mariamma'
// };

const [newPersonData, setNewPersonData] = useState({
  name: '',
  baptismName: '',
  relation: '',
  gender: '',
  dob: '',
  occupation: '',
  education: '',
  phone: '',
  email: ''
});
const [editFamilyData, setEditFamilyData] = useState({
  name:'',
  building: '',
  phone: '',
  pincode: ''
  // street: '',
  // city: '',
  // district: ''
});
const [newTransactionData, setNewTransactionData] = useState({
  year: currentYear,
  amount: '',
  date: new Date().toISOString().split('T')[0]
});

  // Effects
  useEffect(() => {
    fetchParishes();
  }, []);

  useEffect(() => {
    if (selectedParish) {
      // Fetch both in parallel
      Promise.all([
        fetchKoottaymas(selectedParish),
        fetchoneParishes(selectedParish)
      ]);
    }
  }, [selectedParish]);

  // Update the loading state in useEffect
useEffect(() => {     
  if (selectedParish && selectedKoottayma) {
    setLoading(true); // Set loading to true before fetching
    setSelectedRowId(null); 
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
 if (!searchFamilyNumber) {
      fetchFamilyDataOptimized(selectedFamily.id);
    }

      //fetchFamilyData(selectedFamily.id);
      // fetchPersons(selectedFamily.id);
      // fetchTransactions(selectedFamily.id);
    }
  }, [selectedFamily]);
  useEffect(() => {
    
    setDestinationFamily(null);
    setDFamilies([]);
  }, [destinationParishForPerson, destinationKoottaymaForPerson]);
  // API Functions
  useEffect(() => {
  fetchDistinctRelations();
}, []);
const DEFAULT_RELATION_ORDER = [
  'head', 'wife', 'husband', 'son', 'daughter', 'father', 
  'mother', 'brother', 'sister', 'son in law', 'daughter in law', 
  'grandson', 'granddaughter'
];

// Function to get relation order priority
const getRelationOrderPriority = (relation) => {
  const index = DEFAULT_RELATION_ORDER.indexOf(relation?.toLowerCase());
  return index === -1 ? 999 : index; // Unknown relations go to the end
};

// Function to sort persons by custom order
const sortPersonsByOrder = (personsList) => {
  console.log('Sorting persons:', personsList.map(p => ({ 
    name: p.name, 
    customOrder: p.customOrder, 
    relation: p.relation 
  })));
  
  return [...personsList].sort((a, b) => {
    // Check if both have valid customOrder (not null, undefined, or NaN)
    const aHasCustomOrder = a.customOrder !== null && 
                           a.customOrder !== undefined && 
                           !isNaN(a.customOrder);
    const bHasCustomOrder = b.customOrder !== null && 
                           b.customOrder !== undefined && 
                           !isNaN(b.customOrder);
    
    // If both have customOrder, sort by customOrder
    if (aHasCustomOrder && bHasCustomOrder) {
      console.log(`Sorting by customOrder: ${a.name}(${a.customOrder}) vs ${b.name}(${b.customOrder})`);
      return a.customOrder - b.customOrder;
    }
    
    // If only one has customOrder, prioritize it
    if (aHasCustomOrder && !bHasCustomOrder) {
      console.log(`${a.name} has customOrder(${a.customOrder}), ${b.name} doesn't`);
      return -1;
    }
    if (!aHasCustomOrder && bHasCustomOrder) {
      console.log(`${b.name} has customOrder(${b.customOrder}), ${a.name} doesn't`);
      return 1;
    }
    
    // If neither has customOrder, fall back to relation-based sorting
    console.log(`Neither ${a.name} nor ${b.name} has customOrder, using relation sorting`);
    const aPriority = getRelationOrderPriority(a.relation);
    const bPriority = getRelationOrderPriority(b.relation);
    
    if (aPriority !== bPriority) {
      return aPriority - bPriority;
    }
    
    // If same relation, sort by name
    return a.name.localeCompare(b.name);
  });
};
// Function to save person order
const savePersonOrder = async (reorderedPersons) => {
  try {
    const updatePromises = reorderedPersons.map((person, index) => 
      axiosInstance.put(`/person/${person._id}`, {
        ...person,
        customOrder: index
      })
    );
    
    await Promise.all(updatePromises);
    console.log('Person order saved successfully');
  } catch (error) {
    console.error('Error saving person order:', error);
    showSnackbar('Failed to save person order', 'error');
  }
};

// Drag and drop handlers
const handleDragStart = (e, index) => {
  setDraggedRowIndex(index);
  e.dataTransfer.effectAllowed = 'move';
  
  // Add some visual feedback
  e.target.style.opacity = '0.5';
};

const handleDragEnd = (e) => {
  e.target.style.opacity = '1';
  setDraggedRowIndex(null);
  setDragOverRowIndex(null);
};

const handleDragOver = (e, index) => {
  e.preventDefault();
  e.dataTransfer.dropEffect = 'move';
  setDragOverRowIndex(index);
};

const handleDragLeave = () => {
  setDragOverRowIndex(null);
};

const handleDrop = async (e, dropIndex) => {
  e.preventDefault();
  
  if (draggedRowIndex === null || draggedRowIndex === dropIndex) {
    return;
  }
  
  const reorderedPersons = [...persons];
  const draggedItem = reorderedPersons[draggedRowIndex];
  
  // Remove the dragged item
  reorderedPersons.splice(draggedRowIndex, 1);
  
  // Insert at new position
  reorderedPersons.splice(dropIndex, 0, draggedItem);
  
  // Update persons state
  setPersons(reorderedPersons);
  
  // Auto-save the new order
  await savePersonOrder(reorderedPersons);
  
  setDraggedRowIndex(null);
  setDragOverRowIndex(null);
  
  showSnackbar('Person order updated successfully', 'success');
};
  const fetchParishes = async () => {
    try {
      setLoading(true);
      
      const { data: parishes } = await axiosInstance.get('/parish', {
        timeout: 10000,
        validateStatus: (status) => status >= 200 && status < 300,
        params: {
          status: 'active',
          sort: 'name'
        }
      });
  
      // const processedParishes = (parishes || []).map(parish => ({
      //   ...parish,
      //   displayName: parish.name,
      //   shortCode: parish.shortCode || parish.code || 'N/A',
      //   isActive: parish.status === 'active'
      // }));
  
      // const sortedParishes = processedParishes.sort((a, b) => 
      //   a.displayName.localeCompare(b.displayName)
      // );
  
      setParishes(parishes);
  
      // console.log('Parishes Fetched:', {
      //   totalParishes: sortedParishes.length,
      //   activeParishes: sortedParishes.filter(p => p.isActive).length
      // });
    } catch (error) {
      const errorMessage = error.response?.data?.message || 'Failed to fetch parishes';
      
      console.error('Error fetching parishes:', {
        message: error.message,
        status: error.response?.status,
        data: error.response?.data
      });
  
      showSnackbar(errorMessage, 'error');
      setParishes([]);
    } finally {
      setLoading(false);
    }
  };
  const fetchDistinctRelations = async () => {
  try {
    setLoadingRelations(true);
    const response = await axiosInstance.get('/person/distinct-relations');
    setRelations(response.data || []);
  } catch (error) {
    console.error('Error fetching relations:', error);
    // Fallback to default relations if API fails
    setRelations(['head', 'husband', 'wife', 'son', 'daughter', 'father', 'mother', 'brother', 'sister', 'son in law', 'daughter in law', 'grandson', 'granddaughter']);
  } finally {
    setLoadingRelations(false);
  }
};
  const handleAddPerson = async () => {
  try {
    if (!newPersonData.name || !newPersonData.baptismName || !newPersonData.relation || 
        !newPersonData.gender || !newPersonData.dob) {
      showSnackbar('Please fill all required fields', 'error');
      return;
    }

    // Check if trying to add as head
    if (newPersonData.relation === 'head') {
      const existingHead = persons.find(person => person.relation === 'head' && person.status === 'active');
      if (existingHead) {
        showSnackbar('Family already has a head. Please choose a different relation.', 'error');
        return;
      }
    }

    // Get parish and forane data
    const parishData = await axiosInstance.get(`/parish/${selectedParish}`);
    const forane = parishData.data.forane;

    const personData = {
      ...newPersonData,
      family: selectedFamily.id,
      parish: selectedParish,
      forane: forane._id,
      status: 'active'
    };

    await axiosInstance.post('/person', personData);

    // Reset form
    setNewPersonData({
      name: '',
      baptismName: '',
      relation: '',
      gender: '',
      dob: '',
      occupation: '',
      education: '',
      phone: '',
      email: ''
    });
    
    setOpenAddPersonDialog(false);
    fetchFamilyData(selectedFamily.id);
    fetchFamilies(selectedParish, selectedKoottayma); // Refresh family list
    showSnackbar('Person added successfully', 'success');
  } catch (error) {
    console.error('Error adding person:', error);
    showSnackbar('Failed to add person', 'error');
  }
};

const handleEditFamily = async () => {
  try {
    if (!editFamilyData.name || !editFamilyData.building || !editFamilyData.phone) {
      showSnackbar('Please fill required fields', 'error');
      return;
    }

    await axiosInstance.put(`/family/${selectedFamily._id}`, editFamilyData);
    
    // Update selected family data
    setSelectedFamily(prev => ({
      ...prev,
      ...editFamilyData
    }));
    
    setOpenEditFamilyDialog(false);
    fetchFamilies(selectedParish, selectedKoottayma); // Refresh family list
    showSnackbar('Family details updated successfully', 'success');
  } catch (error) {
    console.error('Error updating family:', error);
    showSnackbar('Failed to update family details', 'error');
  }
};

  const fetchoneParishes = async () => {
    if (!selectedParish) return;
  
    try {
      const response = await axiosInstance.get(`/parish/${selectedParish}`, {
        timeout: 10000,
        validateStatus: (status) => status >= 200 && status < 300
      });
      setoneParishes(response.data);
    } catch (error) {
      showSnackbar('Failed to fetch parishes', 'error');
      console.error('Error fetching parishes:', error);
    }
  };
  
  const getYearFromDateString = (dateString) => {
  
  try {
    if (typeof dateString === 'string' && dateString.includes('/')) {
      const parts = dateString.split('/');
    
      if (parts.length === 3) {
        const year = parseInt(parts[2]);
       
        return year;
      }
    }
    const fallbackYear = new Date(dateString).getFullYear();
   
    return fallbackYear;
  } catch (error) {
    console.warn('Error getting year from date:', dateString, error);
    return new Date().getFullYear();
  }
};
  const fetchPersonTransactions = async (personId, personName) => {
  try {
    setLoading(true);
    const response = await axiosInstance.get(`/transaction/person/${personId}/all`);
    
    const transactions = response.data.transactions || [];
    
    
    
    setSelectedPersonTransactions(transactions);
    setTransactionPerson({ id: personId, name: personName });
    setShowTransactionDialog(true);
  } catch (error) {
    console.error('Error fetching person transactions:', error);
    showSnackbar('Failed to fetch person transactions', 'error');
    setSelectedPersonTransactions([]);
  } finally {
    setLoading(false);
  }
};
const getTransactionYear = (dateString) => {
  try {
    // Handle DD/MM/YYYY format from your backend
    if (typeof dateString === 'string' && dateString.includes('/')) {
      const parts = dateString.split('/');
      if (parts.length === 3) {
        return parseInt(parts[2]); // Year is the third part
      }
    }
    // Fallback to normal date parsing
    return new Date(dateString).getFullYear();
  } catch (error) {
    console.warn('Error parsing date:', dateString);
    return new Date().getFullYear(); // Default to current year
  }
};

// Then in your table row:

// Function to update transaction amount
const updateTransactionAmount = async (transactionId, newAmount) => {
  try {
    await axiosInstance.put(`/transaction/transactionId/${transactionId}`, {
      amountPaid: parseFloat(newAmount)
    });
    
    // Refresh person transactions
    fetchPersonTransactions(transactionPerson.id, transactionPerson.name);
    // Refresh family data
    //fetchFamilyData(selectedFamily.id);
    updateTransactionAmountInMainTable(transactionPerson.id);
    showSnackbar('Transaction updated successfully', 'success');
    setEditingTransactionId(null);
    setEditingAmount('');
  } catch (error) {
    showSnackbar('Failed to update transaction', 'error');
    console.error('Error updating transaction:', error);
  }
};

// Function to add new transaction
const addNewTransaction = async () => {
  try {
    if (!newTransactionData.amount || !newTransactionData.year) {
      showSnackbar('Please fill all required fields', 'error');
      return;
    }

    const parishData = await axiosInstance.get(`/parish/${selectedParish}`);
    const forane = parishData.data.forane;

    const transactionData = {
      person: transactionPerson.id,
      amountPaid: parseFloat(newTransactionData.amount),
      family: selectedFamily.id,
      parish: selectedParish,
      forane: forane._id,
      date: new Date(newTransactionData.date).toLocaleDateString('en-GB'),
    };

    await axiosInstance.post('/transaction', transactionData);
    
    // Reset form
    setNewTransactionData({
      year: currentYear,
      amount: '',
      date: new Date().toISOString().split('T')[0]
    });
    setAddingNewTransaction(false);
    
    // Refresh data
    fetchPersonTransactions(transactionPerson.id, transactionPerson.name);
    //fetchFamilyData(selectedFamily.id);
    updateTransactionAmountInMainTable(transactionPerson.id);
    showSnackbar('Transaction added successfully', 'success');
  } catch (error) {
    showSnackbar('Failed to add transaction', 'error');
    console.error('Error adding transaction:', error);
  }
};

// Function to delete transaction
const deleteTransaction = async (transactionId) => {
  try {
    await axiosInstance.delete(`/transaction/${transactionId}`);
    
    // Refresh data
    fetchPersonTransactions(transactionPerson.id, transactionPerson.name);
   // fetchFamilyData(selectedFamily.id);
    updateTransactionAmountInMainTable(transactionPerson.id);
    showSnackbar('Transaction deleted successfully', 'success');
  } catch (error) {
    showSnackbar('Failed to delete transaction', 'error');
    console.error('Error deleting transaction:', error);
  }
};
  const fetchKoottaymas = async (parishId) => {
    if (!parishId) {
      showSnackbar('Invalid parish ID', 'warning');
      return;
    }
  
    try {
      setIsKoottaymaLoading(true); // Start loading
  
      const { data: koottaymas } = await axiosInstance.get(`/koottayma/parish/${parishId}`, {
        timeout: 10000,
        validateStatus: (status) => status >= 200 && status < 300,
        params: {
          status: 'active'
        }
      });
  
      setKoottaymas(koottaymas);
  
    } catch (error) {
      const errorMessage = error.response?.data?.message || 'Failed to fetch koottaymas';
      showSnackbar(errorMessage, 'error');
      console.error('Error fetching koottaymas:', error);
      setKoottaymas([]);
    } finally {
      setIsKoottaymaLoading(false); // Stop loading
    }
  };


// Add this new function to search family by number:    jul13
// const searchFamilyByNumber = async () => {
//   if (!searchFamilyNumber.trim()) {
//     showSnackbar('Please enter a family number', 'warning');
//     return;
//   }

//   if (!selectedParish) {
//     showSnackbar('Please select a parish first', 'warning');
//     return;
//   }

//   try {
//     setSearchLoading(true);
    
//     // Search for family by familyNumber within the selected parish
//     const response = await axiosInstance.get(`/family/search/familyNumber/${searchFamilyNumber.trim()}/parish/${selectedParish}`);
    
//     if (response.data) {
//       const foundFamily = response.data;
      
//       // Only set the koottayma based on found family (parish is already selected manually)
//       setSelectedKoottayma(foundFamily.koottayma);
      
//       // Set the selected family and load its data
//       setSelectedFamily({
//         id: foundFamily.id,
//         name: foundFamily.name,
//         building: foundFamily.building || 'N/A',
//         pincode: foundFamily.pincode || 'N/A',
//         phone: foundFamily.phone || 'N/A',
//         familyNumber: foundFamily.familyNumber || 'N/A',
//         koottayma: foundFamily.koottayma,
//         forane: foundFamily.forane,
//         _id: foundFamily._id
//       });
      
//       setSelectedRowId(foundFamily.id);
      
//       // Load family data including persons and transactions
//      // await fetchFamilyData(foundFamily.id)
      
//       // Refresh families list for the selected parish/koottayma
//       // if (selectedParish && foundFamily.koottayma) {
//       //   await fetchFamilies(selectedParish, foundFamily.koottayma);
//       // }
      
//       //showSnackbar('Family found and loaded successfully', 'success');
      
//     } else {
//       showSnackbar('Family not found with this number in selected parish', 'error');
//     }
    
//   } catch (error) {
//     console.error('Error searching family:', error);
//     const errorMessage = error.response?.status === 404 
//       ? 'Family not found with this number in selected parish' 
//       : error.response?.data?.message || 'Failed to search family';
//     showSnackbar(errorMessage, 'error');
//   } finally {
//     setSearchLoading(false);
//   }
// };
const searchFamilyByNumber = async () => {
  if (!searchFamilyNumber.trim()) {
    showSnackbar('Please enter a family number', 'warning');
    return;
  }

  if (!selectedParish) {
    showSnackbar('Please select a parish first', 'warning');
    return;
  }

  try {
    setSearchLoading(true);
    
    // Search for family by familyNumber within the selected parish
    const response = await axiosInstance.get(`/family/search/familyNumber/${searchFamilyNumber.trim()}/parish/${selectedParish}`);
    
    if (response.data) {
      const foundFamily = response.data;
      
      // Set the selected family and koottayma
      setSelectedKoottayma(foundFamily.koottayma);
      setSelectedFamily({
        id: foundFamily.id,
        name: foundFamily.name,
        building: foundFamily.building || 'N/A',
        pincode: foundFamily.pincode || 'N/A',
        phone: foundFamily.phone || 'N/A',
        familyNumber: foundFamily.familyNumber || 'N/A',
        koottayma: foundFamily.koottayma,
        forane: foundFamily.forane,
        _id: foundFamily._id
      });
      
      setSelectedRowId(foundFamily.id);
      
      // IMMEDIATELY load family data for better UX
      await fetchFamilyDataOptimized(foundFamily.id);
      
      showSnackbar('Family found and loaded successfully', 'success');
      
    } else {
      showSnackbar('Family not found with this number in selected parish', 'error');
    }
    
  } catch (error) {
    console.error('Error searching family:', error);
    const errorMessage = error.response?.status === 404 
      ? 'Family not found with this number in selected parish' 
      : error.response?.data?.message || 'Failed to search family';
    showSnackbar(errorMessage, 'error');
  } finally {
    setSearchLoading(false);
  }
};

const fetchFamilyDataOptimized = async (familyId) => {
  if (!familyId) {
    showSnackbar('Invalid family ID', 'warning');
    return;
  }

  setPersonalInfoLoading(true);

  try {
    // Use a single optimized API call that returns all data at once including previous year
    const familyDataResponse = await axiosInstance.get(`/person/familydata/${familyId}/year/${currentYear}`, {
      timeout: 8000, // Reduced timeout for faster response
      validateStatus: (status) => status >= 200 && status < 300
    });

    const familyData = familyDataResponse.data;

    if (!familyData || familyData.length === 0) {
      setPersons([]);
      setTransactions([]);
      return;
    }

    // Process data efficiently without additional API calls
    const processedPersons = familyData.map(person => ({
      ...person,
      age: calculateAge(person.dob),
      fullName: `${person.name} ${person.baptismName || ''}`.trim(),
      customOrder: person.customOrder
    }));

    // Use both current year and previous year amounts directly from the API response
    const processedTransactions = familyData.map(person => ({
      personId: person._id,
      personName: person.name,
      totalAmount: person.totalAmount || 0,
      currentYearAmount: person.currentYearAmount || 0, // Current year active transactions
      previousYearAmount: person.prevYearAmount || 0, // Previous year active transactions from API
      details: {
        relation: person.relation,
        baptismName: person.baptismName
      }
    }));

    const sortedPersons = sortPersonsByOrder(processedPersons);
        
    setPersons(sortedPersons);
    setTransactions(processedTransactions);

    

  } catch (error) {
    console.error('Error fetching family data:', error);
    showSnackbar(error.response?.data?.message || 'Failed to fetch data', 'error');
    setPersons([]);
    setTransactions([]);
  } finally {
    setPersonalInfoLoading(false);
  }
};
const PersonalInfoSkeleton = () => (
  <Box sx={{ width: '100%', p: 2, textAlign: 'center' }}>
    <CircularProgress size={40} />
    <Typography variant="h6" gutterBottom sx={{ mt: 2 }}>
      Loading Personal Information...
    </Typography>
    <Typography variant="body2" color="text.secondary">
      Please wait while we fetch the family details
    </Typography>
  </Box>
);

// Add this function to handle Enter key press
const handleSearchKeyPress = (event) => {
  if (event.key === 'Enter') {
    searchFamilyByNumber();
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
  // Add this new function to fetch status history
const fetchStatusHistory = async () => {
  try {
    const response = await axiosInstance.get(`/person/family/${selectedFamily.id}/status-history`);
    setStatusHistoryData(response.data);
  } catch (error) {
    showSnackbar('Failed to fetch status history', 'error');
    console.error('Error fetching status history:', error);
  }
};
const enhancedStatusHistoryColumns = [
  {
    accessorKey: 'name',
    header: 'Name',
    size: 150,
  },
  {
    accessorKey: 'baptismName',
    header: 'Baptism Name',
    size: 150,
  },
  {
    accessorKey: 'relation',
    header: 'Last Relation',
    size: 120,
  },
  {
    accessorKey: 'status',
    header: 'Status',
    size: 100,
    Cell: ({ cell }) => (
      <Box
        component="span"
        sx={{
          backgroundColor: 
            cell.getValue() === 'deceased' 
              ? 'error.lighter' 
              : 'warning.lighter',
          color: 
            cell.getValue() === 'deceased' 
              ? 'error.darker' 
              : 'warning.darker',
          px: 1,
          py: 0.5,
          borderRadius: 1,
          display: 'inline-block'
        }}
      >
        {cell.getValue() === 'deceased' ? 'Deceased' : 'Moved Out'}
      </Box>
    )
  },
  {
    accessorKey: 'moveOutDate',
    header: 'Date',
    size: 120,
    Cell: ({ cell }) => {
      const date = new Date(cell.getValue());
      return date.toLocaleDateString('en-GB', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric'
      });
    }
  },
  {
    accessorKey: 'narration',
    header: 'Remarks',
    size: 200,
  },
  {
    id: 'actions',
    header: 'Actions',
    size: 300,
    Cell: ({ row }) => {
      const person = row.original;

      // Enhanced rollback function that works anytime
     // Enhanced rollback function that properly handles transferred transactions
const handleEnhancedRollback = async () => {
  try {
    // Enhanced confirmation dialog with more details
    const confirmMessage = `Are you sure you want to restore ${person.name} to active status?\n\n` +
      `This will:\n` +
      `• Change status from ${person.status} to active\n` +
      `• Restore their original relation (${person.relation})\n` +
      `• Check for any transferred transactions\n` +
      `• Update family head assignment if needed\n\n` +
      `This action can be performed at any time.`;

    const confirmed = window.confirm(confirmMessage);
    if (!confirmed) return;

    // Get current family data to understand the situation
    const familyResponse = await axiosInstance.get(`/person/family/${selectedFamily.id}`);
    const familyMembers = familyResponse.data;
    const currentHead = familyMembers.find(p => p.relation === 'head' && p.status === 'active');
    
    // Get parish and forane data
    const parishData = await axiosInstance.get(`/parish/${selectedParish}`);
    const forane = parishData.data.forane;

    // Step 1: Handle head role conflicts
    let headChangeRequired = false;
    let newHeadCandidate = null;
    
    if (person.relation === 'head' && currentHead) {
      const shouldReplaceHead = window.confirm(
        `${person.name} was originally the family head, but ${currentHead.name} is currently the head.\n\n` +
        `Do you want to restore ${person.name} as head?\n` +
        `• Yes: ${person.name} becomes head, ${currentHead.name} becomes member\n` +
        `• No: ${person.name} will be restored as member`
      );
      
      if (shouldReplaceHead) {
        headChangeRequired = true;
        newHeadCandidate = currentHead;
      }
    }

    // Step 2: Handle transaction restoration - DETECT AND REMOVE TRANSFERRED TRANSACTIONS
    let transactionRestoreData = null;
    
    console.log('Step 2: Detecting transferred transactions...');
    
    try {
      // Find all transactions where this person was the original person (transferred FROM)
      const transferredTransactionsResponse = await axiosInstance.get(
        `/transaction/transferred-from/${person._id}`
      );
      
      let transferredTransactions = transferredTransactionsResponse.data || [];
      
      // If the API endpoint doesn't exist, use alternative method
      if (transferredTransactionsResponse.status === 404 || !transferredTransactions.length) {
        console.log('Using alternative method to find transferred transactions...');
        
        // Get all transactions for current head person
        const headTransactionsResponse = await axiosInstance.get(
          `/transaction/person/${currentHead._id}/all`
        );
        
        const headTransactions = headTransactionsResponse.data.transactions || [];
        
        // Filter for transactions that have transfer history from this person
        transferredTransactions = headTransactions.filter(tx => {
          return tx.isTransferred === true && 
                 tx.originalPerson && 
                 tx.originalPerson.toString() === person._id.toString();
        });
        
        console.log(`Found ${transferredTransactions.length} transferred transactions using alternative method`);
      }
      
      if (transferredTransactions.length > 0) {
        console.log(`Found ${transferredTransactions.length} transferred transactions from ${person.name}:`, transferredTransactions);
        
        let totalTransferredAmount = 0;
        let deletedTransactions = [];
        
        // Delete each transferred transaction
        for (const transferredTx of transferredTransactions) {
          try {
            console.log(`Processing transferred transaction: ${transferredTx._id} (₹${transferredTx.amountPaid})`);
            
            // Delete the transferred transaction
            await axiosInstance.delete(`/transaction/${transferredTx._id}`);
            
            totalTransferredAmount += transferredTx.amountPaid;
            deletedTransactions.push({
              id: transferredTx._id,
              amount: transferredTx.amountPaid,
              transferDate: transferredTx.transferDate
            });
            
            console.log(`✓ Deleted transferred transaction: ${transferredTx._id} (₹${transferredTx.amountPaid})`);
            
          } catch (deleteError) {
            console.error(`✗ Failed to delete transferred transaction ${transferredTx._id}:`, deleteError);
          }
        }
        
        if (totalTransferredAmount > 0) {
          transactionRestoreData = {
            amount: totalTransferredAmount,
            deletedTransactions: deletedTransactions
          };
          
          console.log(`✓ Successfully removed ₹${totalTransferredAmount} from transferred transactions`);
        }
      } else {
        // Manual input as fallback
        const manualAmount = window.prompt(
          `No automatic transferred transactions found for ${person.name}.\n\n` +
          `Enter the transaction amount to restore manually (or 0 if none):`,
          '0'
        );
        
        const amount = parseFloat(manualAmount) || 0;
        if (amount > 0) {
          transactionRestoreData = {
            amount: amount,
            isManual: true
          };
        }
      }
      
    } catch (transferError) {
      console.error('Error detecting transferred transactions:', transferError);
      
      // Fallback to manual input
      const manualAmount = window.prompt(
        `Error detecting transferred transactions: ${transferError.message}\n\n` +
        `Enter the transaction amount to restore manually (or 0 if none):`,
        '0'
      );
      
      const amount = parseFloat(manualAmount) || 0;
      if (amount > 0) {
        transactionRestoreData = {
          amount: amount,
          isManual: true
        };
      }
    }

    // Step 3: Execute the restoration process
    console.log('Step 3: Starting person status restoration...');

    // 3a: Handle head role changes first
    if (headChangeRequired && newHeadCandidate) {
      await axiosInstance.put(`/person/${newHeadCandidate._id}`, {
        relation: 'member',
        narration: `Changed to member as ${person.name} was restored as head on ${new Date().toLocaleDateString()}`
      });
      console.log(`Changed ${newHeadCandidate.name} from head to member`);
    }

    // 3b: Restore the person's status and relation
    const restoreRelation = headChangeRequired ? 'head' : 
                          (person.relation === 'head' && currentHead) ? 'member' : person.relation;

    await axiosInstance.put(`/person/${person._id}`, {
      status: 'active',
      relation: restoreRelation,
      parish: selectedParish,
      forane: forane._id,
      family: selectedFamily.id,
      narration: `Restored from ${person.status} status on ${new Date().toLocaleDateString()}`
    });
    console.log(`Restored ${person.name} to active status with relation: ${restoreRelation}`);

    // 3c: Restore transaction to original person
    if (transactionRestoreData && transactionRestoreData.amount > 0) {
      console.log(`Step 3c: Restoring ₹${transactionRestoreData.amount} to ${person.name}`);
      
      try {
        const restoredTransactionData = {
          person: person._id,
          amountPaid: transactionRestoreData.amount,
          family: selectedFamily.id,
          parish: selectedParish,
          forane: forane._id,
          date: new Date().toLocaleDateString('en-GB'),
          status: 'active',
          isTransferred: false,
          restoredFromRollback: true,
          originalPersonId: person._id,
          rollbackTimestamp: new Date().toISOString(),
          rollbackDetails: {
            deletedTransactions: transactionRestoreData.deletedTransactions || [],
            isManual: transactionRestoreData.isManual || false,
            rollbackDate: new Date().toISOString()
          }
        };

        const restoredTransaction = await axiosInstance.post('/transaction', restoredTransactionData);
        console.log(`✓ Transaction restored successfully: ₹${transactionRestoreData.amount}`);

      } catch (restoreError) {
        console.error('Error restoring transaction:', restoreError);
        showSnackbar('Person restored but transaction restoration failed. Please check manually.', 'warning');
      }
    }

    // Step 4: Create comprehensive movement record
    const sourceParish = parishes.find(p => p._id === selectedParish);
    const sourceKoottayma = koottaymas.find(k => k.koottaymaId === selectedKoottayma);

    const rollbackMovementData = {
      person: person._id,
      personName: person.name,
      sourceFamily: selectedFamily.id,
      sourceFamilyName: selectedFamily.name,
      sourceParish: sourceParish._id,
      sourceParishName: sourceParish.name,
      sourceKoottayma: sourceKoottayma.koottaymaId,
      sourceKoottaymaName: sourceKoottayma.name,
      destinationFamily: selectedFamily.id,
      destinationFamilyName: selectedFamily.name,
      destinationParish: sourceParish._id,
      destinationParishName: sourceParish.name,
      destinationKoottayma: sourceKoottayma.koottaymaId,
      destinationKoottaymaName: sourceKoottayma.name,
      oldRelation: person.status,
      newRelation: restoreRelation,
      movedDate: new Date(),
      status: 'active',
      remarks: `Enhanced rollback: Status restored from ${person.status} to active${transactionRestoreData ? `. Amount ₹${transactionRestoreData.amount} restored` : ''}${headChangeRequired ? '. Head role restored' : ''}`,
      type: 'enhanced_rollback',
      rollbackDetails: {
        originalStatus: person.status,
        restoredRelation: restoreRelation,
        headRoleChanged: headChangeRequired,
        transactionAmount: transactionRestoreData?.amount || 0,
        deletedTransferredTransactions: transactionRestoreData?.deletedTransactions || [],
        rollbackTimestamp: new Date().toISOString()
      }
    };

    try {
      await axiosInstance.post('/person-movements/person-movements', rollbackMovementData);
      console.log('✓ Rollback movement record created');
    } catch (movementError) {
      console.warn('Could not create rollback movement record:', movementError);
    }

    // Step 5: Refresh all relevant data
    fetchStatusHistory();
    fetchFamilyData(selectedFamily.id);
    
    if (restoreRelation === 'head' || headChangeRequired) {
      fetchFamilies(selectedParish, selectedKoottayma);
    }

    const successMessage = `✅ ${person.name} successfully restored to active status!` +
      (transactionRestoreData ? 
        ` (₹${transactionRestoreData.amount} restored${transactionRestoreData.deletedTransactions ? `, ${transactionRestoreData.deletedTransactions.length} transferred transactions removed` : ''})` : 
        '') +
      (headChangeRequired ? ' (Head role restored)' : '');
    
    showSnackbar(successMessage, 'success');

  } catch (error) {
    console.error('Enhanced rollback failed:', error);
    showSnackbar(error.response?.data?.message || 'Failed to restore person status', 'error');
  }
};
      // Simple retrieve function (alternative to rollback)
      const handleSimpleRetrieve = async () => {
        try {
          const confirmed = window.confirm(
            `Are you sure you want to retrieve ${person.name} back to active status?\n\n` +
            `This will restore them as an active family member with their original relation.`
          );
          
          if (!confirmed) return;

          // Get forane data
          const foraneResponse = await axiosInstance.get(`/parish/getforane/${selectedParish}`);
          const forane = foraneResponse.data.forane;

          // Simple status update
          await axiosInstance.put(`/person/${person._id}`, {
            status: 'active',
            relation: person.relation,
            parish: selectedParish,
            forane: forane._id,
            family: selectedFamily.id,
            narration: `Retrieved from ${person.status} status on ${new Date().toLocaleDateString()}`
          });

          // Refresh data
          fetchStatusHistory();
          fetchFamilyData(selectedFamily.id);
          
          showSnackbar(`${person.name} retrieved successfully`, 'success');

        } catch (error) {
          console.error('Error retrieving person:', error);
          showSnackbar(error.response?.data?.message || 'Failed to retrieve person', 'error');
        }
      };

      return (
        <Box sx={{ display: 'flex', gap: 0.5, justifyContent: 'center' }}>
          {/* Enhanced Rollback Button - Always available */}
          <Tooltip title="Enhanced Rollback (Restore with transaction & head handling)">
            <IconButton
              onClick={handleEnhancedRollback}
              color="primary"
              size="small"
              sx={{
                '&:hover': {
                  backgroundColor: 'primary.lighter',
                  transform: 'scale(1.1)',
                },
                transition: 'all 0.2s ease-in-out',
                border: '2px solid',
                borderColor: 'primary.main'
              }}
            >
              <UndoIcon />
            </IconButton>
          </Tooltip>
          
          {/* Simple Retrieve Button */}
          <Tooltip title="Simple Retrieve (Basic status restore)">
            <IconButton
              onClick={handleSimpleRetrieve}
              color="secondary"
              size="small"
              sx={{
                '&:hover': {
                  backgroundColor: 'secondary.lighter',
                  transform: 'scale(1.1)',
                },
                transition: 'all 0.2s ease-in-out'
              }}
            >
              <RestoreIcon />
            </IconButton>
          </Tooltip>

          {/* View Details Button */}
          <Tooltip title="View Person Details">
            <IconButton
              onClick={() => {
                // Show person details dialog
                alert(`Person Details:\n\nName: ${person.name}\nStatus: ${person.status}\nLast Relation: ${person.relation}\nDate: ${new Date(person.moveOutDate).toLocaleDateString()}\nRemarks: ${person.narration || 'None'}`);
              }}
              color="info"
              size="small"
              sx={{
                '&:hover': {
                  backgroundColor: 'info.lighter',
                  transform: 'scale(1.1)',
                },
                transition: 'all 0.2s ease-in-out'
              }}
            >
              <VisibilityIcon />
            </IconButton>
          </Tooltip>
        </Box>
      );
    }
  }
];


// Status History columns configuration
// Complete Status History columns configuration with enhanced rollback functionality
// const statusHistoryColumns = [
//   {
//     accessorKey: 'name',
//     header: 'Name',
//     size: 150,
//   },
//   {
//     accessorKey: 'baptismName',
//     header: 'Baptism Name',
//     size: 150,
//   },
//   {
//     accessorKey: 'relation',
//     header: 'Last Relation',
//     size: 120,
//   },
//   {
//     accessorKey: 'status',
//     header: 'Status',
//     size: 100,
//     Cell: ({ cell }) => (
//       <Box
//         component="span"
//         sx={{
//           backgroundColor: 
//             cell.getValue() === 'deceased' 
//               ? 'error.lighter' 
//               : 'warning.lighter',
//           color: 
//             cell.getValue() === 'deceased' 
//               ? 'error.darker' 
//               : 'warning.darker',
//           px: 1,
//           py: 0.5,
//           borderRadius: 1,
//           display: 'inline-block'
//         }}
//       >
//         {cell.getValue() === 'deceased' ? 'Deceased' : 'Moved Out'}
//       </Box>
//     )
//   },
//   {
//     accessorKey: 'moveOutDate',
//     header: 'Date',
//     size: 120,
//     Cell: ({ cell }) => {
//       const date = new Date(cell.getValue());
//       return date.toLocaleDateString('en-GB', {
//         day: '2-digit',
//         month: '2-digit',
//         year: 'numeric'
//       });
//     }
//   },
//   {
//     accessorKey: 'narration',
//     header: 'Remarks',
//     size: 200,
//   },
//   {
//     id: 'actions',
//     header: 'Actions',
//     size: 180, // Increased size to accommodate both buttons
//     Cell: ({ row }) => {
//       const person = row.original;
      
//       // Check if this person's status change is eligible for rollback
//       const isEligibleForRollback = () => {
//         if (!previousState || !previousState.timestamp) return false;
        
//         // Check if this is the person from the last status change
//         const isLastChangedPerson = previousState.originalPerson && 
//           previousState.originalPerson._id === person._id;
        
//         // Check if the change was within the last 24 hours
//         const timeLimit = 24 * 60 * 60 * 1000; // 24 hours
//         const timeDiff = new Date() - new Date(previousState.timestamp);
//         const withinTimeLimit = timeDiff < timeLimit;
        
//         return isLastChangedPerson && withinTimeLimit;
//       };

//       const handleRetrieve = async () => {
//         try {
//           // Show confirmation dialog first
//           const confirmed = window.confirm(
//             `Are you sure you want to retrieve ${person.name} back to active status? This will restore them as an active family member.`
//           );
          
//           if (!confirmed) return;

//           // Get the forane of the parish
//           const foraneResponse = await axiosInstance.get(`/parish/getforane/${selectedParish}`);
//           const forane = foraneResponse.data.forane;

//           // Check current family members to determine if we need to handle head assignment
//           const familyMembers = await axiosInstance.get(`/person/family/${selectedFamily.id}`);
//           const currentHead = familyMembers.data.find(p => p.relation === 'head' && p.status === 'active');
          
//           // If person was originally head and no current head exists, restore as head
//           // Otherwise restore with original relation or as member
//           let newRelation = person.relation;
//           if (person.relation === 'head' && !currentHead) {
//             newRelation = 'head';
//           } else if (person.relation === 'head' && currentHead) {
//             // If there's already a head, restore as member unless user decides otherwise
//             const shouldRestoreAsHead = window.confirm(
//               `${person.name} was originally the family head, but ${currentHead.name} is currently the head. Do you want to restore ${person.name} as head? (Clicking 'No' will restore them as a member)`
//             );
            
//             if (shouldRestoreAsHead) {
//               // Change current head to member
//               await axiosInstance.put(`/person/${currentHead._id}`, {
//                 relation: 'member',
//                 narration: `Changed to member as ${person.name} was restored as head`
//               });
//               newRelation = 'head';
//             } else {
//               newRelation = 'member';
//             }
//           }

//           // Check if there are any transaction transfers to reverse
//           let transactionRestoreData = null;
//           const currentYearTransactions = await axiosInstance.get(
//             `/transaction/person/${person._id}/year/${currentYear}`
//           );

//           // If person had transactions transferred, we need to find who received them
//           if (currentYearTransactions.data && currentYearTransactions.data.totalAmount === 0) {
//             // Check if there was a transaction transfer to current head
//             if (currentHead) {
//               const headTransactions = await axiosInstance.get(
//                 `/transaction/person/${currentHead._id}/year/${currentYear}`
//               );
              
//               // Check if head has transactions that might have been transferred from this person
//               if (headTransactions.data && headTransactions.data.totalAmount > 0) {
//                 // Try to get the transferred amount from transaction history/movement records
//                 try {
//                   const movementHistory = await axiosInstance.get(
//                     `/person-movements/person/${person._id}/recent`
//                   );
                  
//                   // Look for transfer amount in movement history or ask user
//                   const lastMovement = movementHistory.data[0];
//                   let transferAmount = 0;
                  
//                   if (lastMovement && lastMovement.transferredAmount) {
//                     transferAmount = lastMovement.transferredAmount;
//                   } else {
//                     // Prompt user for amount to transfer back
//                     const amountString = window.prompt(
//                       `Enter the transaction amount to restore to ${person.name} (or 0 if none):`,
//                       '0'
//                     );
//                     transferAmount = parseFloat(amountString) || 0;
//                   }

//                   if (transferAmount > 0) {
//                     transactionRestoreData = {
//                       fromPerson: currentHead._id,
//                       toPerson: person._id,
//                       amount: transferAmount
//                     };
//                   }
//                 } catch (historyError) {
//                   console.warn('Could not fetch movement history:', historyError);
//                 }
//               }
//             }
//           }

//           // Create movement data for retrieval
//           const movementData = {
//             person: person._id,
//             personName: person.name,
//             sourceFamily: selectedFamily.id,
//             sourceFamilyName: selectedFamily.name,
//             sourceParish: selectedParish,
//             sourceParishName: parishes.find(p => p._id === selectedParish)?.name,
//             sourceKoottayma: selectedKoottayma,
//             sourceKoottaymaName: koottaymas.find(k => k.koottaymaId === selectedKoottayma)?.name,
//             destinationFamily: selectedFamily.id,
//             destinationFamilyName: selectedFamily.name,
//             destinationParish: selectedParish,
//             destinationParishName: parishes.find(p => p._id === selectedParish)?.name,
//             destinationKoottayma: selectedKoottayma,
//             destinationKoottaymaName: koottaymas.find(k => k.koottaymaId === selectedKoottayma)?.name,
//             oldRelation: person.status, // Current status
//             newRelation: newRelation, // New relation
//             movedDate: new Date(),
//             status: 'active',
//             remarks: `Retrieved from ${person.status} status${transactionRestoreData ? ` with ₹${transactionRestoreData.amount} transaction restoration` : ''}`,
//             type: 'retrieve'
//           };

//           // Update person status to active
//           await axiosInstance.put(`/person/${person._id}`, {
//             status: 'active',
//             relation: newRelation,
//             parish: selectedParish,
//             forane: forane._id,
//             family: selectedFamily.id,
//             narration: `Retrieved from ${person.status} status on ${new Date().toLocaleDateString()}`
//           });

//           // Handle transaction restoration if needed
//           if (transactionRestoreData) {
//             const transferData = {
//               ...transactionRestoreData,
//               forane: forane._id,
//               parish: selectedParish,
//               family: selectedFamily.id,
//               status: 'retrieved',
//               reason: `Transaction restored during person retrieval`,
//               date: new Date().toLocaleDateString('en-GB')
//             };
            
//             await axiosInstance.post('/transaction/transfer', transferData);
//           }

//           // Record the movement
//           await axiosInstance.post('/person-movements/person-movements', movementData);

//           // Refresh data
//           fetchStatusHistory();
//           fetchFamilyData(selectedFamily.id);
          
//           const successMessage = transactionRestoreData 
//             ? `${person.name} retrieved successfully with ₹${transactionRestoreData.amount} restored`
//             : `${person.name} retrieved successfully`;
          
//           showSnackbar(successMessage, 'success');

//         } catch (error) {
//           console.error('Error retrieving person:', error);
//           showSnackbar(error.response?.data?.message || 'Failed to retrieve person', 'error');
//         }
//       };

//       const handleRollback = async () => {
//   try {
//     if (!previousState) {
//       showSnackbar('No rollback data available', 'error');
//       return;
//     }

//     // Enhanced confirmation dialog with transaction details
//     const transferAmount = previousState.transferredAmount || 0;
//     const confirmMessage = transferAmount > 0 
//       ? `Are you sure you want to rollback the status change for ${person.name}? This will restore them to their previous state and return ₹${transferAmount} to their account.`
//       : `Are you sure you want to rollback the status change for ${person.name}? This will restore them to their previous state and reverse all related changes.`;

//     const confirmed = window.confirm(confirmMessage);
//     if (!confirmed) return;

//     const { 
//       originalPerson, 
//       originalHead, 
//       newHead, 
//       transferredAmount,
//       headId
//     } = previousState;

//     console.log('Starting simplified rollback with state:', previousState);

//     try {
//       // 1. Restore original person's status and relation FIRST
//       await axiosInstance.put(`/person/${originalPerson._id}`, {
//         status: 'active',
//         relation: originalPerson.originalRelation || originalPerson.relation,
//         narration: `Status rolled back from ${person.status} to active on ${new Date().toLocaleDateString()}`
//       });
//       console.log(`✓ Restored person status: ${originalPerson._id}`);

//       // 2. If there was a head change, restore original head positions
//       if (originalHead && newHead && originalHead._id !== newHead._id) {
//         // Restore original head
//         await axiosInstance.put(`/person/${originalHead._id}`, {
//           relation: 'head',
//           status: 'active',
//           narration: `Head role restored during rollback on ${new Date().toLocaleDateString()}`
//         });
//         console.log(`✓ Restored original head: ${originalHead._id}`);

//         // Revert new head to original relation
//         await axiosInstance.put(`/person/${newHead._id}`, {
//           relation: newHead.originalRelation || 'member',
//           status: 'active',
//           narration: `Role reverted to original during rollback on ${new Date().toLocaleDateString()}`
//         });
//         console.log(`✓ Reverted new head to original role: ${newHead._id}`);
//       }

//       // 3. Handle transaction cleanup using existing APIs
//       if (transferAmount > 0 && headId) {
//         console.log(`Processing transaction rollback: ₹${transferAmount} from head ${headId} to person ${originalPerson._id}`);
        
//         try {
//           // Method 1: Get all transactions for the head person and find transfers
//           console.log('Getting all head transactions...');
//           const headTransactionsResponse = await axiosInstance.get(`/transaction/person/${headId}/all`);
//           const headTransactions = headTransactionsResponse.data.transactions || [];
          
//           console.log(`Found ${headTransactions.length} transactions for head person`);

//           // Find transactions that match our transfer criteria
//           const statusChangeTime = new Date(previousState.timestamp);
//           const potentialTransfers = headTransactions.filter(tx => {
//             const txDate = new Date(tx.createdAt);
//             const isAfterStatusChange = txDate >= statusChangeTime;
//             const matchesAmount = tx.amountPaid === transferAmount;
            
//             console.log(`Transaction ${tx._id}: Amount=${tx.amountPaid}, Date=${txDate}, After=${isAfterStatusChange}, Matches=${matchesAmount}`);
            
//             return isAfterStatusChange && matchesAmount;
//           });

//           console.log(`Found ${potentialTransfers.length} potential transfer transactions:`, potentialTransfers);

//           // Delete the identified transfer transactions
//           let deletedCount = 0;
//           for (const transferTx of potentialTransfers) {
//             try {
//               await axiosInstance.delete(`/transaction/${transferTx._id}`);
//               console.log(`✓ Deleted transfer transaction: ${transferTx._id} (₹${transferTx.amountPaid})`);
//               deletedCount++;
//             } catch (deleteError) {
//               console.error(`✗ Failed to delete transaction ${transferTx._id}:`, deleteError);
//             }
//           }

//           // Method 2: If no transfers found by date, try to find by amount and recent date
//           if (deletedCount === 0) {
//             console.log('No transfers found by date criteria, trying alternative search...');
            
//             // Get current year transactions for head
//             const currentYearResponse = await axiosInstance.get(`/transaction/person/${headId}/year/${currentYear}`);
//             const currentYearTransactions = currentYearResponse.data.transactions || [];
            
//             // Look for transactions with the exact transfer amount
//             const amountMatches = currentYearTransactions.filter(tx => 
//               tx.amountPaid === transferAmount
//             );
            
//             console.log(`Found ${amountMatches.length} current year transactions with matching amount:`, amountMatches);

//             // If we find exactly one transaction with the transfer amount, it's likely the transfer
//             if (amountMatches.length === 1) {
//               try {
//                 await axiosInstance.delete(`/transaction/${amountMatches[0]._id}`);
//                 console.log(`✓ Deleted amount-matched transaction: ${amountMatches[0]._id} (₹${amountMatches[0].amountPaid})`);
//                 deletedCount++;
//               } catch (deleteError) {
//                 console.error(`✗ Failed to delete amount-matched transaction:`, deleteError);
//               }
//             } else if (amountMatches.length > 1) {
//               // Multiple matches - show user and let them choose
//               const transactionList = amountMatches.map((tx, index) => 
//                 `${index + 1}. ID: ${tx._id}, Amount: ₹${tx.amountPaid}, Date: ${new Date(tx.date).toLocaleDateString()}`
//               ).join('\n');
              
//               const userChoice = window.prompt(
//                 `Found multiple transactions with ₹${transferAmount}. Enter the number of the transaction to delete (or 0 to skip):\n\n${transactionList}`,
//                 '1'
//               );
              
//               const choiceIndex = parseInt(userChoice) - 1;
//               if (choiceIndex >= 0 && choiceIndex < amountMatches.length) {
//                 try {
//                   await axiosInstance.delete(`/transaction/${amountMatches[choiceIndex]._id}`);
//                   console.log(`✓ Deleted user-selected transaction: ${amountMatches[choiceIndex]._id}`);
//                   deletedCount++;
//                 } catch (deleteError) {
//                   console.error(`✗ Failed to delete user-selected transaction:`, deleteError);
//                 }
//               }
//             }
//           }

//           // 4. Restore the original person's transaction
//           console.log(`Restoring original transaction: ₹${transferAmount} for person ${originalPerson._id}`);
          
//           // // Get parish and forane data for new transaction
//           // const parishData = await axiosInstance.get(`/parish/${selectedParish}`);
//           // const forane = parishData.data.forane;

//           // // Create the restored transaction
//           // const restoredTransactionData = {
//           //   person: originalPerson._id,
//           //   amountPaid: transferAmount,
//           //   family: selectedFamily.id,
//           //   parish: selectedParish,
//           //   forane: forane._id,
//           //   date: new Date().toLocaleDateString('en-GB'),
//           //   status: 'active',
//           //   isTransferred: false,
//           //   originalPerson: originalPerson._id
//           // };

//           // const restoredTransaction = await axiosInstance.post('/transaction', restoredTransactionData);
//           // console.log('✓ Original transaction restored successfully:', restoredTransaction.data);

//           // if (deletedCount > 0) {
//           //   console.log(`✓ Successfully deleted ${deletedCount} transfer transaction(s)`);
//           // } else {
//           //   console.warn('⚠ No transfer transactions were deleted - you may need to clean up manually');
//           //   showSnackbar('Person restored but transfer transactions may need manual cleanup', 'warning');
//           // }

//         } catch (transactionError) {
//           console.error('Error handling transaction rollback:', transactionError);
//           showSnackbar('Person status restored, but transaction cleanup had issues. Please check manually.', 'warning');
//         }
//       }

//       // 5. Create rollback movement record using existing API
//       const sourceParish = parishes.find(p => p._id === selectedParish);
//       const sourceKoottayma = koottaymas.find(k => k.koottaymaId === selectedKoottayma);

//       const rollbackMovementData = {
//         person: originalPerson._id,
//         personName: originalPerson.name,
//         sourceFamily: selectedFamily.id,
//         sourceFamilyName: selectedFamily.name,
//         sourceParish: sourceParish._id,
//         sourceParishName: sourceParish.name,
//         sourceKoottayma: sourceKoottayma.koottaymaId,
//         sourceKoottaymaName: sourceKoottayma.name,
//         destinationFamily: selectedFamily.id,
//         destinationFamilyName: selectedFamily.name,
//         destinationParish: sourceParish._id,
//         destinationParishName: sourceParish.name,
//         destinationKoottayma: sourceKoottayma.koottaymaId,
//         destinationKoottaymaName: sourceKoottayma.name,
//         oldRelation: person.status,
//         newRelation: originalPerson.originalRelation || originalPerson.relation,
//         movedDate: new Date(),
//         status: 'active',
//         remarks: `Status rolled back from ${person.status} to active${transferAmount > 0 ? `. Amount ₹${transferAmount} restored` : ''}`,
//         type: 'rollback'
//       };

//       try {
//         await axiosInstance.post('/person-movements/person-movements', rollbackMovementData);
//         console.log('✓ Rollback movement record created');
//       } catch (movementError) {
//         console.warn('Could not create rollback movement record:', movementError);
//       }

//       // Clear previous state after successful rollback
//       setPreviousState(null);

//       // Refresh all relevant data
//       fetchStatusHistory();
//       fetchFamilyData(selectedFamily.id);
      
//       if (originalPerson.originalRelation === 'head') {
//         fetchFamilies(selectedParish, selectedKoottayma);
//       }

//       const successMessage = transferAmount > 0 
//         ? `✓ Rollback completed successfully! ${originalPerson.name} restored to active status with ₹${transferAmount} transaction amount restored.`
//         : `✓ Rollback completed successfully! ${originalPerson.name} restored to active status.`;
      
//       showSnackbar(successMessage, 'success');

//     } catch (error) {
//       console.error('Error during rollback process:', error);
//       throw error;
//     }

//   } catch (error) {
//     console.error('Error during rollback:', error);
//     showSnackbar(error.response?.data?.message || 'Failed to rollback status change', 'error');
//   }
// };

// // Manual cleanup function that can be called separately
// const manualTransactionCleanup = async () => {
//   if (!previousState || !previousState.headId || !previousState.transferredAmount) {
//     showSnackbar('No transfer data available for manual cleanup', 'error');
//     return;
//   }

//   try {
//     const { headId, transferredAmount, originalPerson, timestamp } = previousState;
    
//     console.log('Starting manual cleanup...');
    
//     // Get all transactions for the head person
//     const headTransactionsResponse = await axiosInstance.get(`/transaction/person/${headId}/all`);
//     const headTransactions = headTransactionsResponse.data.transactions || [];
    
//     // Filter transactions created after the status change
//     const statusChangeTime = new Date(timestamp);
//     const suspiciousTransactions = headTransactions.filter(tx => {
//       const txDate = new Date(tx.createdAt);
//       return (
//         txDate >= statusChangeTime &&
//         tx.amountPaid === transferredAmount
//       );
//     });

//     if (suspiciousTransactions.length === 0) {
//       showSnackbar('No matching transfer transactions found', 'info');
//       return;
//     }

//     // Show user the found transactions
//     const transactionDetails = suspiciousTransactions.map((tx, index) => 
//       `${index + 1}. ID: ${tx._id}\n   Amount: ₹${tx.amountPaid}\n   Date: ${new Date(tx.createdAt).toLocaleString()}\n   Original Person: ${tx.originalPerson || 'Not set'}`
//     ).join('\n\n');

//     const confirmed = window.confirm(
//       `Found ${suspiciousTransactions.length} potential transfer transaction(s):\n\n${transactionDetails}\n\nDelete these transactions?`
//     );

//     if (confirmed) {
//       let deletedCount = 0;
//       for (const tx of suspiciousTransactions) {
//         try {
//           await axiosInstance.delete(`/transaction/${tx._id}`);
//           console.log(`✓ Manually deleted transaction: ${tx._id}`);
//           deletedCount++;
//         } catch (deleteError) {
//           console.error(`✗ Failed to delete transaction ${tx._id}:`, deleteError);
//         }
//       }
      
//       showSnackbar(`✓ Manually deleted ${deletedCount} of ${suspiciousTransactions.length} transfer transactions`, 'success');
//       fetchFamilyData(selectedFamily.id); // Refresh data
//     }

//   } catch (error) {
//     console.error('Manual cleanup failed:', error);
//     showSnackbar('Manual cleanup failed: ' + error.message, 'error');
//   }
// };

// // Add this button to your UI for manual cleanup if needed
// const ManualCleanupButton = () => (
//   <Button
//     variant="outlined"
//     color="warning"
//     onClick={manualTransactionCleanup}
//     disabled={!previousState || !previousState.transferredAmount}
//     startIcon={<DeleteIcon />}
//     sx={{ ml: 1 }}
//   >
//     Manual Transaction Cleanup
//   </Button>
// );

//       return (
//         <Box sx={{ display: 'flex', gap: 0.5, justifyContent: 'center' }}>
//           {/* Retrieve Button - Always show for moved_out/deceased persons */}
//           {/* <Tooltip title="Retrieve Person to Active Status">
//             <IconButton
//               onClick={handleRetrieve}
//               color="primary"
//               size="small"
//               sx={{
//                 '&:hover': {
//                   backgroundColor: 'primary.lighter',
//                   transform: 'scale(1.1)',
//                 },
//                 transition: 'all 0.2s ease-in-out'
//               }}
//             >
//               <HistoryIcon />
//             </IconButton>
//           </Tooltip> */}
          
//           {/* Rollback Button - Only show for recent changes */}
//           {isEligibleForRollback() && (
//             <Tooltip 
//               title={`Rollback Status Change${previousState.transferredAmount > 0 ? ` (Restore ₹${previousState.transferredAmount})` : ''}`}
//             >
//               <IconButton
//                 onClick={handleRollback}
//                 color="warning"
//                 size="small"
//                 sx={{
//                   animation: 'pulse 2s infinite',
//                   '&:hover': {
//                     backgroundColor: 'warning.lighter',
//                     transform: 'scale(1.1)',
//                   },
//                   '@keyframes pulse': {
//                     '0%': {
//                       boxShadow: '0 0 0 0 rgba(255,152,0,0.7)',
//                     },
//                     '70%': {
//                       boxShadow: '0 0 0 4px rgba(255,152,0,0)',
//                     },
//                     '100%': {
//                       boxShadow: '0 0 0 0 rgba(255,152,0,0)',
//                     },
//                   },
//                   transition: 'all 0.2s ease-in-out'
//                 }}
//               >
//                 <RefreshIcon />
//               </IconButton>
//             </Tooltip>
//           )}
//         </Box>
//       );
//     }
//   }
// ];

// Helper function to check rollback eligibility (add this after state declarations)
const shouldShowRollback = () => {
  if (!previousState || !previousState.timestamp) return false;
  
  // Check if within time limit (24 hours)
  const timeLimit = 24 * 60 * 60 * 1000; // 24 hours
  const timeDiff = new Date() - new Date(previousState.timestamp);
  const withinTimeLimit = timeDiff < timeLimit;
  
  // Check if there's meaningful data to rollback
  const hasRollbackData = previousState.originalPerson || previousState.transferredAmount > 0;
  
  return withinTimeLimit && hasRollbackData;
};

  const handleMovePerson = async () => {
    try {
      if (!selectedPerson || !destinationFamily || !newRelation ||
          !destinationParishForPerson || !destinationKoottaymaForPerson) {
        showSnackbar('Please select all required fields', 'error');
        return;
      }
  
      // Check if trying to set as head
      if (newRelation === 'head') {
        // Check if destination family already has an active head
      
        const destFamilyPersons = await axiosInstance.get(`/person/family/${destinationFamily.id}`);
       
        const existingHead = destFamilyPersons.data.find(
          person => person.relation === 'head' && person.status === 'active'
        );
       
        if (existingHead) {
          showSnackbar('Destination family already has a head. Please choose a different relation.', 'error');
          return;
        }
      }
  
      // If current person is head, check if source family has other members
      if (selectedPerson.relation === 'head') {
        const sourceFamilyPersons = await axiosInstance.get(`/person/family/${selectedFamily.id}`);
        const activeMembers = sourceFamilyPersons.data.filter(
          person => person._id !== selectedPerson._id && person.status === 'active'
        );
        
        if (activeMembers.length > 0) {
          showSnackbar('Cannot move head while family has other active members. Please move other members first.', 'error');
          return;
        }
      }
  
      const destParishResponse = await axiosInstance.get(`/parish/getforane/${destinationParishForPerson}`);
      const destinationForane = destParishResponse.data.forane;
  
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
  
      // Update person with all necessary fields
      await axiosInstance.put(`/person/${selectedPerson._id}`, {
        family: destinationFamily.id,
        relation: newRelation,
        parish: destinationParishForPerson,
        forane: destinationForane._id,
        status: 'active',
        narration: `Moved to family ${destinationFamily.name} from ${selectedFamily.name} on ${new Date().toLocaleDateString()}`
      });
  
      // Record the movement
      await axiosInstance.post('/person-movements/person-movements', movementData);
  
      showSnackbar('Person moved successfully', 'success');
      setOpenMovePersonDialog(false);
      fetchPersons(selectedFamily.id);
      fetchFamilies(selectedParish, selectedKoottayma);
      // Reset state
      setSelectedPerson(null);
      setDestinationFamily(null);
      setDestinationParishForPerson(null);
      setDestinationKoottaymaForPerson(null);
      setNewRelation('');
      setRemarks('');
      
    } catch (error) {
      console.error('Error moving person:', error);
      showSnackbar(error.response?.data?.message || 'Failed to move person', 'error');
    }
  };
// Add these new state variables after the existing state declarations
const [openStatusDialog, setOpenStatusDialog] = useState(false);
const [statusDetails, setStatusDetails] = useState({
  person: null,
  status: '',
  remarks: '',
  date: new Date().toISOString().split('T')[0]
});
const [showUndoDialog, setShowUndoDialog] = useState(false);
const [previousState, setPreviousState] = useState(null);
const [newHeadDialogOpen, setNewHeadDialogOpen] = useState(false);
const [selectedNewHead, setSelectedNewHead] = useState(null);
const [eligibleMembers, setEligibleMembers] = useState([]);

// Add these new handlers before the return statement

// Updated handlers for status changes
const handlePersonStatusChange = async () => {
  // Prevent multiple submissions
  if (isUpdatingStatus) {
    console.log('Status update already in progress, ignoring duplicate request');
    return;
  }

  try {
    setIsUpdatingStatus(true); // Set loading state immediately
    
    const currentPerson = statusDetails.person;
    
    // Store comprehensive current state for rollback
    const stateSnapshot = {
      originalPerson: {
        ...currentPerson,
        originalStatus: currentPerson.status,
        originalRelation: currentPerson.relation
      },
      originalHead: null,
      newHead: null,
      transactionSnapshot: null,
      transferredAmount: 0,
      transferId: null,
      timestamp: new Date()
    };

    // Store transaction state BEFORE any changes
    try {
      const transactionResponse = await axiosInstance.get(`/transaction/person/${currentPerson._id}`);
      stateSnapshot.transactionSnapshot = {
        ...transactionResponse.data,
        originalAmount: transactionResponse.data?.totalAmount || 0
      };
      console.log('Stored transaction snapshot:', stateSnapshot.transactionSnapshot);
    } catch (error) {
      console.warn('Could not fetch transaction snapshot:', error);
      stateSnapshot.transactionSnapshot = { originalAmount: 0 };
    }

    // If person is head, handle head transition
    if (currentPerson.relation === 'head') {
      const familyMembers = await axiosInstance.get(`/person/family/${selectedFamily.id}`);
      const activeMembers = familyMembers.data.filter(
        p => p._id !== currentPerson._id && p.status === 'active'
      );

      if (activeMembers.length > 0) {
        // Store original head info
        stateSnapshot.originalHead = { ...currentPerson };
        
        setEligibleMembers(activeMembers);
        setNewHeadDialogOpen(true);
        setPreviousState(stateSnapshot);
        return; // Don't set loading to false here, will be handled in the new head dialog
      }
    }

    setPreviousState(stateSnapshot);
    await updatePersonAndTransactions();
  } catch (error) {
    console.error('Error updating person status:', error);
    showSnackbar('Failed to update person status', 'error');
  } finally {
    setIsUpdatingStatus(false); // Always reset loading state
  }
};
const createPersonMovementData = (person, statusChange, remarks) => {
  // Get source parish and koottayma details
  const sourceParish = parishes.find(p => p._id === selectedParish);
  const sourceKoottayma = koottaymas.find(k => k.koottaymaId === selectedKoottayma);

  // Map the status values correctly
  const movementData = {
    person: person._id,
    personName: person.name,
    // Source details
    sourceFamily: selectedFamily.id,
    sourceFamilyName: selectedFamily.name,
    sourceParish: sourceParish._id,
    sourceParishName: sourceParish.name,
    sourceKoottayma: sourceKoottayma.koottaymaId,
    sourceKoottaymaName: sourceKoottayma.name,
    // Destination details for moved_out/deceased
    destinationFamily: null,
    destinationFamilyName: statusChange === 'deceased' ? 'Deceased' : 'Moved Out of Diocese',
    destinationParish: null,
    destinationParishName: statusChange === 'deceased' ? 'Deceased' : 'Moved Out',
    destinationKoottayma: null,
    destinationKoottaymaName: statusChange === 'deceased' ? 'Deceased' : 'Moved Out',
    // Status and relation details
    oldRelation: person.relation,
    newRelation: statusChange, // This should match the enum values
    movedDate: new Date(),
    status: statusChange, // Using the exact enum value from schema
    remarks: remarks || '',
    type: statusChange // Using the exact status value
  };

  return movementData;
};

const updatePersonAndTransactions = async (newHead = null) => {
  try {
    if (!['active', 'inactive', 'moved_out', 'deceased'].includes(statusDetails.status)) {
      showSnackbar('Invalid status value', 'error');
      return;
    }

    const currentPerson = statusDetails.person;
    
    // Update previous state with new head info if provided
    if (newHead && previousState) {
      setPreviousState(prev => ({
        ...prev,
        newHead: { ...newHead, originalRelation: newHead.relation },
        originalHead: prev.originalHead || { ...currentPerson }
      }));
    }

    // Validation for head changes
    if (currentPerson.relation === 'head' && 
        ['moved_out', 'deceased'].includes(statusDetails.status)) {
      const familyMembers = await axiosInstance.get(`/person/family/${selectedFamily.id}`);
      const activeMembers = familyMembers.data.filter(
        p => p._id !== currentPerson._id && p.status === 'active'
      );

      if (activeMembers.length > 0 && !newHead) {
        showSnackbar('Please select a new head before changing head status', 'error');
        return;
      }
    }

    const operations = [];

    // 1. Update new head first if exists
    if (newHead) {
      const headUpdateResponse = await axiosInstance.put(`/person/${newHead._id}`, {
        relation: 'head',
        status: 'active',
        narration: `Assigned as new head after previous head ${statusDetails.status} on ${new Date().toLocaleDateString()}`
      });
      operations.push({ 
        type: 'head_update', 
        personId: newHead._id, 
        response: headUpdateResponse,
        originalRelation: newHead.relation
      });
    }

    // 2. Update original person's status
    const personUpdateResponse = await axiosInstance.put(`/person/${currentPerson._id}`, {
      status: statusDetails.status,
      narration: statusDetails.remarks || `Status changed to ${statusDetails.status} on ${new Date().toLocaleDateString()}`
    });
    operations.push({ 
      type: 'person_update', 
      personId: currentPerson._id, 
      response: personUpdateResponse,
      originalStatus: currentPerson.status
    });

    // 3. Handle transaction transfers with enhanced tracking
    if (['moved_out', 'deceased'].includes(statusDetails.status)) {
      const transResponse = await axiosInstance.get(`/transaction/person/${currentPerson._id}`);

      if (transResponse.data && transResponse.data.totalAmount > 0) {
        const transferAmount = transResponse.data.totalAmount;
        const headId = newHead?._id || (await axiosInstance.get(`/person/family/${selectedFamily.id}`))
          .data.find(p => p.relation === 'head' && p.status === 'active')?._id;

        if (headId) {
          // Check if transfer already exists to prevent duplicates
          const existingTransfers = await axiosInstance.get(
            `/transaction/person/${headId}/year/${currentYear}`
          );
          
          const recentTransfers = existingTransfers.data.transactions?.filter(t => {
            const transferDate = new Date(t.createdAt);
            const now = new Date();
            const timeDiff = now - transferDate;
            return timeDiff < 60000 && t.amountPaid === transferAmount; // Within 1 minute with same amount
          }) || [];

          if (recentTransfers.length > 0) {
            console.warn('Recent transfer detected, skipping duplicate transfer');
            showSnackbar('Transaction transfer already processed', 'warning');
          } else {
            const transferData = {
              fromPerson: currentPerson._id,
              toPerson: headId,
              forane: selectedFamily.forane,
              parish: selectedParish,
              family: selectedFamily.id,
              status: statusDetails.status,
              reason: `Transfer due to member ${statusDetails.status}`,
              amount: transferAmount,
              date: new Date().toLocaleDateString('en-GB'),
              originalTransactionId: transResponse.data._id,
              rollbackData: {
                originalPersonId: currentPerson._id,
                originalPersonName: currentPerson.name,
                originalAmount: transferAmount,
                transferReason: statusDetails.status,
                canRollback: true
              }
            };

            const transferResponse = await axiosInstance.post('/transaction/transfer', transferData);
            
            operations.push({ 
              type: 'transaction_transfer', 
              fromPersonId: currentPerson._id, 
              toPersonId: headId,
              response: transferResponse,
              transferData,
              transferAmount,
              transferId: transferResponse.data._id,
              originalTransactionId: transResponse.data._id
            });

            // Update previous state with enhanced transfer details
            setPreviousState(prev => ({
              ...prev,
              transferredAmount: transferAmount,
              transferId: transferResponse.data._id,
              originalTransactionId: transResponse.data._id,
              headId: headId,
              transferData: transferData
            }));
          }
        }
      }
    }

    // 4. Create movement record
    const sourceParish = parishes.find(p => p._id === selectedParish);
    const sourceKoottayma = koottaymas.find(k => k.koottaymaId === selectedKoottayma);

    const movementData = {
      person: currentPerson._id,
      personName: currentPerson.name,
      sourceFamily: selectedFamily.id,
      sourceFamilyName: selectedFamily.name,
      sourceParish: sourceParish._id,
      sourceParishName: sourceParish.name,
      sourceKoottayma: sourceKoottayma.koottaymaId,
      sourceKoottaymaName: sourceKoottayma.name,
      destinationFamily: null,
      destinationFamilyName: statusDetails.status === 'deceased' ? 'Deceased' : 'Moved Out',
      destinationParish: null,
      destinationParishName: statusDetails.status === 'deceased' ? 'Deceased' : 'Moved Out',
      destinationKoottayma: null,
      destinationKoottaymaName: statusDetails.status === 'deceased' ? 'Deceased' : 'Moved Out',
      oldRelation: currentPerson.relation,
      newRelation: statusDetails.status,
      movedDate: new Date(),
      status: statusDetails.status,
      remarks: statusDetails.remarks || `Status changed to ${statusDetails.status}`,
      rollbackData: operations,
      transferredAmount: previousState?.transferredAmount || 0,
      transferId: previousState?.transferId || null
    };

    const movementResponse = await axiosInstance.post('/person-movements/person-movements', movementData);
    operations.push({ 
      type: 'movement_record', 
      response: movementResponse,
      movementId: movementResponse.data._id
    });

    // Update previous state with all operations for rollback
    setPreviousState(prev => ({
      ...prev,
      operations,
      movementId: movementResponse.data._id
    }));

    showSnackbar(`Person marked as ${statusDetails.status}`, 'success');
    
    // Refresh data
    fetchFamilyData(selectedFamily.id);
    
    setOpenStatusDialog(false);
    setNewHeadDialogOpen(false);

    if (currentPerson.relation === 'head') {
      fetchFamilies(selectedParish, selectedKoottayma);
    }

  } catch (error) {
    console.error('Error details:', error.response?.data);
    showSnackbar(error.response?.data?.message || 'Failed to update status', 'error');
    throw error; // Re-throw to trigger finally block in calling function
  } finally {
    setIsUpdatingStatus(false); // Always reset loading state
  }
};

const handleUndoStatusChange = async () => {
  try {
    if (!previousState) {
      showSnackbar('No previous state available to restore', 'error');
      return;
    }

    const { 
      originalPerson, 
      originalHead, 
      newHead, 
      operations, 
      transactionSnapshot,
      transferredAmount,
      transferId,
      headId
    } = previousState;

    console.log('Starting rollback with state:', previousState);

    try {
      // 1. CRITICAL: Handle transaction restoration FIRST before any other changes
      if (transferredAmount > 0 && headId) {
        console.log(`Starting transaction rollback: Remove ₹${transferredAmount} from head ${headId}, restore to person ${originalPerson._id}`);
        
        try {
          // Step 1a: Get current head transactions to find and remove the transferred amount
          const headTransactionsResponse = await axiosInstance.get(`/transaction/person/${headId}/year/${currentYear}`);
          const headTransactions = headTransactionsResponse.data.transactions || [];
          
          console.log(`Found ${headTransactions.length} transactions for head person`);

          // Find transactions that match our transfer criteria
          const statusChangeTime = new Date(previousState.timestamp);
          const timeThreshold = 5 * 60 * 1000; // 5 minutes buffer for finding transferred transactions
          
          const transferredTransactions = headTransactions.filter(tx => {
            const txDate = new Date(tx.createdAt);
            const isAfterStatusChange = Math.abs(txDate - statusChangeTime) < timeThreshold;
            const matchesAmount = Math.abs(tx.amountPaid - transferredAmount) < 0.01; // Small tolerance for floating point
            
            console.log(`Transaction ${tx._id}: Amount=${tx.amountPaid}, Date=${txDate}, TimeDiff=${Math.abs(txDate - statusChangeTime)}ms, Matches=${matchesAmount && isAfterStatusChange}`);
            
            return isAfterStatusChange && matchesAmount;
          });

          console.log(`Found ${transferredTransactions.length} transferred transactions to remove:`, transferredTransactions);

          // Remove transferred transactions from head
          let removedCount = 0;
          for (const transferTx of transferredTransactions) {
            try {
              await axiosInstance.delete(`/transaction/${transferTx._id}`);
              console.log(`✓ Removed transferred transaction from head: ${transferTx._id} (₹${transferTx.amountPaid})`);
              removedCount++;
            } catch (deleteError) {
              console.error(`✗ Failed to delete transaction ${transferTx._id}:`, deleteError);
            }
          }

          // Step 1b: Restore the original person's transaction
          if (removedCount > 0) {
            console.log(`Restoring ₹${transferredAmount} to original person ${originalPerson._id}`);
            
            // Get parish and forane data for new transaction
            const parishData = await axiosInstance.get(`/parish/${selectedParish}`);
            const forane = parishData.data.forane;

            // Create the restored transaction for the original person
            const restoredTransactionData = {
              person: originalPerson._id,
              amountPaid: transferredAmount,
              family: selectedFamily.id,
              parish: selectedParish,
              forane: forane._id,
              date: new Date().toLocaleDateString('en-GB'),
              status: 'active',
              isTransferred: false,
              restoredFromRollback: true,
              originalPersonId: originalPerson._id,
              rollbackTimestamp: new Date().toISOString()
            };

            const restoredTransaction = await axiosInstance.post('/transaction', restoredTransactionData);
            console.log('✓ Original transaction restored successfully:', restoredTransaction.data);
          } else {
            console.warn('⚠ No transferred transactions were found to remove from head');
            
            // If we can't find the exact transferred transaction, try alternative approach
            // Ask user if they want to manually subtract the amount
            const manualSubtract = window.confirm(
              `Could not automatically find the transferred transaction of ₹${transferredAmount} to remove from head.\n\n` +
              `Would you like to manually subtract ₹${transferredAmount} from the head's current year total?\n\n` +
              `This will create a negative adjustment transaction.`
            );

            if (manualSubtract) {
              // Create a negative adjustment transaction for the head
              const parishData = await axiosInstance.get(`/parish/${selectedParish}`);
              const forane = parishData.data.forane;

              const adjustmentTransactionData = {
                person: headId,
                amountPaid: -transferredAmount, // Negative amount to subtract
                family: selectedFamily.id,
                parish: selectedParish,
                forane: forane._id,
                date: new Date().toLocaleDateString('en-GB'),
                status: 'active',
                isAdjustment: true,
                adjustmentReason: `Rollback adjustment: Removed ₹${transferredAmount} transferred from ${originalPerson.name}`,
                rollbackTimestamp: new Date().toISOString()
              };

              await axiosInstance.post('/transaction', adjustmentTransactionData);
              console.log('✓ Created negative adjustment transaction for head');

              // Restore original person's transaction
              const restoredTransactionData = {
                person: originalPerson._id,
                amountPaid: transferredAmount,
                family: selectedFamily.id,
                parish: selectedParish,
                forane: forane._id,
                date: new Date().toLocaleDateString('en-GB'),
                status: 'active',
                isTransferred: false,
                restoredFromRollback: true,
                originalPersonId: originalPerson._id,
                rollbackTimestamp: new Date().toISOString()
              };

              await axiosInstance.post('/transaction', restoredTransactionData);
              console.log('✓ Original transaction restored via adjustment method');
            }
          }

        } catch (transactionError) {
          console.error('Error handling transaction rollback:', transactionError);
          
          // Don't fail the entire rollback, but warn the user
          const continueWithoutTransactionFix = window.confirm(
            `Transaction rollback encountered an error: ${transactionError.message}\n\n` +
            `The person status will still be restored, but you may need to manually adjust the transaction amounts.\n\n` +
            `Continue with rollback?`
          );
          
          if (!continueWithoutTransactionFix) {
            throw new Error('Rollback cancelled by user due to transaction error');
          }
        }
      }

      // 2. Restore original person's status and relation
      await axiosInstance.put(`/person/${originalPerson._id}`, {
        status: 'active',
        relation: originalPerson.originalRelation || originalPerson.relation,
        narration: `Status rolled back from ${statusDetails.status} to active on ${new Date().toLocaleDateString()}`
      });
      console.log(`✓ Restored person status: ${originalPerson._id}`);

      // 3. If there was a head change, restore original head positions
      if (originalHead && newHead && originalHead._id !== newHead._id) {
        // Restore original head
        await axiosInstance.put(`/person/${originalHead._id}`, {
          relation: 'head',
          status: 'active',
          narration: `Head role restored during rollback on ${new Date().toLocaleDateString()}`
        });
        console.log(`✓ Restored original head: ${originalHead._id}`);

        // Revert new head to original relation
        await axiosInstance.put(`/person/${newHead._id}`, {
          relation: newHead.originalRelation || 'member',
          status: 'active',
          narration: `Role reverted to original during rollback on ${new Date().toLocaleDateString()}`
        });
        console.log(`✓ Reverted new head to original role: ${newHead._id}`);
      }

      // 4. Rollback other operations in reverse order
      if (operations && operations.length > 0) {
        await rollbackOperations([...operations].reverse());
      }

      // 5. Create rollback movement record
      const sourceParish = parishes.find(p => p._id === selectedParish);
      const sourceKoottayma = koottaymas.find(k => k.koottaymaId === selectedKoottayma);

      const rollbackMovementData = {
        person: originalPerson._id,
        personName: originalPerson.name,
        sourceFamily: selectedFamily.id,
        sourceFamilyName: selectedFamily.name,
        sourceParish: sourceParish._id,
        sourceParishName: sourceParish.name,
        sourceKoottayma: sourceKoottayma.koottaymaId,
        sourceKoottaymaName: sourceKoottayma.name,
        destinationFamily: selectedFamily.id,
        destinationFamilyName: selectedFamily.name,
        destinationParish: sourceParish._id,
        destinationParishName: sourceParish.name,
        destinationKoottayma: sourceKoottayma.koottaymaId,
        destinationKoottaymaName: sourceKoottayma.name,
        oldRelation: statusDetails.status,
        newRelation: originalPerson.originalRelation || originalPerson.relation,
        movedDate: new Date(),
        status: 'active',
        remarks: `Status rolled back from ${statusDetails.status} to active. Transaction amount ₹${transferredAmount} restored.`,
        type: 'rollback'
      };

      await axiosInstance.post('/person-movements/person-movements', rollbackMovementData);
      
      showSnackbar(`✅ Rollback completed successfully! ${originalPerson.name} restored to active status with ₹${transferredAmount} properly handled.`, 'success');
      
      // Clear previous state after successful rollback
      setPreviousState(null);
      
      // Refresh data
      fetchFamilyData(selectedFamily.id);
      
      setShowUndoDialog(false);

      if (originalPerson.originalRelation === 'head') {
        fetchFamilies(selectedParish, selectedKoottayma);
      }

    } catch (error) {
      console.error('Error in rollback process:', error);
      throw error;
    }

  } catch (error) {
    console.error('Rollback error details:', error.response?.data);
    showSnackbar(error.response?.data?.message || error.message || 'Failed to revert changes', 'error');
  }
};
 
const rollbackOperations = async (operations) => {
  for (const operation of operations) {
    try {
      switch (operation.type) {
        case 'head_update':
          // Revert head assignment to original relation
          await axiosInstance.put(`/person/${operation.personId}`, {
            relation: operation.originalRelation || 'member',
            narration: 'Head assignment rolled back'
          });
          console.log(`Rolled back head assignment for person ${operation.personId}`);
          break;
        
        case 'person_update':
          // Revert person status to original
          await axiosInstance.put(`/person/${operation.personId}`, {
            status: operation.originalStatus || 'active',
            narration: 'Status change rolled back'
          });
          console.log(`Rolled back status for person ${operation.personId}`);
          break;
        
        case 'transaction_transfer':
          // This is now handled in the main rollback function for better precision
          console.log(`Transaction transfer rollback handled in main function`);
          break;
        
        case 'movement_record':
          // Mark movement as rolled back if your API supports this
          try {
            await axiosInstance.put(`/person-movements/${operation.movementId}`, {
              status: 'rolled_back',
              remarks: 'Movement rolled back'
            });
          } catch (movementError) {
            console.warn('Could not update movement record:', movementError);
          }
          break;
          
        default:
          console.warn(`Unknown operation type: ${operation.type}`);
      }
    } catch (rollbackError) {
      console.warn(`Failed to rollback operation ${operation.type}:`, rollbackError);
      // Continue with other rollbacks even if one fails
    }
  }
};

// Enhanced shouldShowRollback with better condition checking


// // Updated component state to show rollback option
// const shouldShowRollback = () => {
//   return previousState && 
//          previousState.timestamp && 
//          (new Date() - previousState.timestamp) < (24 * 60 * 60 * 1000); // 24 hours
// };
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
      setLoading(true);
      
      // Determine the endpoint based on current view
      const endpoint = currentView === 'currentKootayma'
        ? `/family/koottayma/${koottaymaId}`
        : `/family/parish/${parishId}`;
      
      // Single API call that returns all needed data
      const { data: familiesWithPersons } = await axiosInstance.get(endpoint);
      
      setFamilies(familiesWithPersons);
      console.log(familiesWithPersons);
    } catch (error) {
     
      showSnackbar('Failed to fetch families', 'error');
      setFamilies([]);
    } finally {
      setLoading(false);
    }
  };
  // const fetchFamilies = async (parishId, koottaymaId) => {
  //   try {
  //     setLoading(true);
  
  //     // Determine the endpoint based on current view
  //     const endpoint = currentView === 'currentKootayma'
  //       ? `/family/kottayma/${koottaymaId}`
  //       : `/family/parish/${parishId}`;
  
  //     // First fetch families
  //     const { data: families } = await axiosInstance.get(endpoint);
  
  //     // If no families found, set empty and return early
  //     if (!families?.length) {
  //       setFamilies([]);
  //       return;
  //     }
  
  //     const familyIds = families.map(family => family.id);
  
  //     // Fetch persons for all families
  //     const { data: personsData } = await axiosInstance.get(
  //       `/person/persons/families/${familyIds.join(',')}`
  //     );
  
  //     console.log('Persons Data Received:', personsData);
  
  //     // Keep the original working logic for processing persons
  //     const personsByFamily = personsData.personsByFamily ||
  //       (Array.isArray(personsData.persons)
  //         ? personsData.persons.reduce((acc, person) => {
  //             const familyId = person.familyId || person.family;
  //             if (familyId) {
  //               if (!acc[familyId]) {
  //                 acc[familyId] = [];
  //               }
  //               acc[familyId].push(person);
  //             }
  //             return acc;
  //           }, {})
  //         : {});
  
  //     // Process and map families in a single pass
  //     const familiesWithDetails = families.map(family => {
  //       const familyPersons = personsByFamily[family.id] || [];
  //       const head = familyPersons.find(person => person.relation === 'head');
        
  //       return {
  //         id: family.id,
  //         name: family.name,
  //         building: family.building || 'N/A',
  //         pincode: family.pincode || 'N/A',
  //         phone: family.phone || 'N/A',
  //         familyNumber: family.familyNumber || 'N/A',
  //         headname: head?.name || 'No head assigned',
  //         members: familyPersons.map(person => person.name).join(', ') || 'No members found',
  //         kootayma: family.koottayma || 'N/A',
  //         personCount: familyPersons.length,
  //         persons: familyPersons,
  //         forane: family.forane,
  //       };
  //     });
  
  //     // Sort families
  //     const sortedFamilies = familiesWithDetails.sort((a, b) => 
  //       a.name.localeCompare(b.name)
  //     );
  
  //     console.log(sortedFamilies);
  //     setFamilies(sortedFamilies);
  
  //   } catch (error) {
  //     console.error('Error fetching families:', {
  //       message: error.message,
  //       name: error.name,
  //       stack: error.stack,
  //       error: error
  //     });
  //     showSnackbar('Failed to fetch families', 'error');
  //     setFamilies([]);
  //   } finally {
  //     setLoading(false);
  //   }
  // };

  const fetchDFamilies = async (koottaymaId) => {
    
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
  
      // Check if trying to change relation to head
      if (values.relation === 'head' && row.original.relation !== 'head') {
        // Check if family already has an active head
        const familyPersons = await axiosInstance.get(`/person/family/${selectedFamily.id}`);
        const existingHead = familyPersons.data.find(
          person => person.relation === 'head' && 
                   person.status === 'active' && 
                   person._id !== row.original._id
        );
        
        if (existingHead) {
          setValidationErrors({
            ...validationErrors,
            relation: `Family already has a head (${existingHead.name})`
          });
          showSnackbar('Family already has an active head. Please choose a different relation.', 'error');
          return;
        }
      }
  
      // // If person is currently head and trying to change to different relation
      // if (row.original.relation === 'head' && values.relation !== 'head') {
      //   // Check if there are other active family members
      //   const familyPersons = await axiosInstance.get(`/person/family/${selectedFamily.id}`);
      //   const otherActiveMembers = familyPersons.data.filter(
      //     person => person._id !== row.original._id && 
      //              person.status === 'active'
      //   );
        
      //   if (otherActiveMembers.length > 0) {
      //     setValidationErrors({
      //       ...validationErrors,
      //       relation: 'Cannot change head while family has other active members'
      //     });
      //     showSnackbar('Cannot change head while family has other active members. Please move or update other members first.', 'error');
      //     return;
      //   }
      // }
  
     
      
      // Proceed with update if validations pass
      await axiosInstance.put(`/person/${row.original._id}`, {
        ...values,
        status: 'active'  // Ensure status remains active
      });
  
      exitEditingMode();
      setIsEditingRow(false);
      setValidationErrors({});
      
      await fetchPersons(selectedFamily.id);
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
    // Input validation
    if (!familyId) {
      showSnackbar('Invalid family ID', 'warning');
      return;
    }
  
    try {
      // Start loading state
      setLoading(true);
  
      // Fetch persons with comprehensive configuration
      const { data: persons } = await axiosInstance.get(`/person/family/${familyId}`, {
        // Add timeout to prevent long-running requests
        timeout: 10000,
        
        // Validate response status
        validateStatus: (status) => status >= 200 && status < 300
      });
  
      // Process and transform persons data
      const processedPersons = persons.map(person => ({
        ...person,
        age: calculateAge(person.dob),
        fullName: `${person.name} ${person.baptismName || ''}`.trim()
      }));
 
      const sortedPersons=sortPersonsByOrder(processedPersons);
      
      setPersons(sortedPersons);
  
      // Log successful fetch
      console.log('Persons Fetched:', {
        familyId,
        totalPersons: sortedPersons.length,
        headExists: sortedPersons.some(p => p.relation === 'head')
      });
  
    } catch (error) {
      
      const errorMessage = error.response?.data?.message || 'Failed to fetch persons';
      
      showSnackbar(errorMessage, 'error');
      
      console.error('Error fetching persons:', {
        familyId,
        message: error.message,
        status: error.response?.status,
        data: error.response?.data
      });
  
      // Ensure persons are reset on error
      setPersons([]);
    } finally {
      // Always turn off loading state
      setLoading(false);
    }
  };
  // const fetchFamilyData = async (familyId) => {
  //   if (!familyId) {
  //     showSnackbar('Invalid family ID', 'warning');
  //     return;
  //   }
  
  //   setLoading(true);
  
  //   try {
  //     const { data: familyData } = await axiosInstance.get(`/person/familydata/${familyId}/year/${currentYear}`, {
  //       timeout: 10000,
  //       validateStatus: (status) => status >= 200 && status < 300
  //     });
  
  //     // Process persons data
  //     const processedPersons = familyData.map(person => ({
  //       ...person,
  //       age: calculateAge(person.dob),
  //       fullName: `${person.name} ${person.baptismName || ''}`.trim()
  //     }));
  // console.log(familyData);
  //     // Transform transaction data
  //     const processedTransactions = familyData.map(person => ({
  //       personId: person._id,
  //       personName: person.name,
  //       totalAmount: person.totalAmount,
  //       currentYearAmount: person.currentYearAmount,
  //       details: {
  //         relation: person.relation,
  //         baptismName: person.baptismName
  //       }
  //     }));
  
  //     // Update state
  //     setPersons(processedPersons);
  //     setTransactions(processedTransactions);
  
  //     // Log insights (outside critical path)
  //     setTimeout(() => {
  //       console.log('Data Fetch Complete:', {
  //         familyId,
  //         persons: {
  //           total: processedPersons.length,
  //           headExists: processedPersons.some(p => p.relation === 'head')
  //         },
  //         transactions: {
  //           total: processedTransactions.length,
  //           totalAmount: processedTransactions.reduce((sum, t) => sum + t.totalAmount, 0),
  //           currentYearAmount: processedTransactions.reduce((sum, t) => sum + t.currentYearAmount, 0)
  //         }
  //       });
  //     }, 0);
  
  //   } catch (error) {
  //     const errorMessage = error.response?.data?.message || 'Failed to fetch data';
  //     showSnackbar(errorMessage, 'error');
  
  //     console.error('Error fetching family data:', {
  //       familyId,
  //       message: error.message,
  //       status: error.response?.status,
  //       data: error.response?.data
  //     });
  
  //     setPersons([]);
  //     setTransactions([]);
  //   } finally {
  //     setLoading(false);
  //   }
  // };


  //june 20

// const fetchFamilyData = async (familyId) => {
//   if (!familyId) {
//     showSnackbar('Invalid family ID', 'warning');
//     return;
//   }

//   setLoading(true);

//   try {
//     const { data: familyData } = await axiosInstance.get(`/person/familydata/${familyId}/year/${currentYear}`, {
//       timeout: 10000,
//       validateStatus: (status) => status >= 200 && status < 300
//     });
    
//     // Process persons data
//     const processedPersons = familyData.map(person => ({
//       ...person,
//       age: calculateAge(person.dob),
//       fullName: `${person.name} ${person.baptismName || ''}`.trim()
//     }));

//     // Fetch previous year data for each person
//     const previousYearData = await Promise.all(
//       familyData.map(async (person) => {
//         try {
//           const { data: prevYearResponse } = await axiosInstance.get(
//             `/transaction/person/${person._id}/year/${currentYear - 1}`,
//             { validateStatus: (status) => status >= 200 && status < 300 }
//           );
//           return {
//             personId: person._id,
//             previousYearAmount: prevYearResponse?.totalAmount || 0
//           };
//         } catch (error) {
//           return {
//             personId: person._id,
//             previousYearAmount: 0
//           };
//         }
//       })
//     );

//     // Create a map for easy lookup
//     const previousYearAmountMap = previousYearData.reduce((acc, item) => {
//       acc[item.personId] = item.previousYearAmount;
//       return acc;
//     }, {});

//     // Transform transaction data with previous year amounts
//     const processedTransactions = familyData.map(person => ({
//       personId: person._id,
//       personName: person.name,
//       totalAmount: person.totalAmount,
//       currentYearAmount: person.currentYearAmount,
//       previousYearAmount: previousYearAmountMap[person._id] || 0,
//       details: {
//         relation: person.relation,
//         baptismName: person.baptismName
//       }
//     }));

//     // Sort persons with priority to family head
//     const sortedPersons = processedPersons.sort((a, b) => {
//       if (a.relation === 'head') return -1;
//       if (b.relation === 'head') return 1;
//       return a.name.localeCompare(b.name);
//     });
    
//     // Update state with sorted persons
//     setPersons(sortedPersons);
//     setTransactions(processedTransactions);

//     // Log insights (outside critical path)
//     setTimeout(() => {
//       console.log('Data Fetch Complete:', {
//         familyId,
//         persons: {
//           total: processedPersons.length,
//           headExists: processedPersons.some(p => p.relation === 'head')
//         },
//         transactions: {
//           total: processedTransactions.length,
//           totalAmount: processedTransactions.reduce((sum, t) => sum + t.totalAmount, 0),
//           currentYearAmount: processedTransactions.reduce((sum, t) => sum + t.currentYearAmount, 0),
//           previousYearAmount: processedTransactions.reduce((sum, t) => sum + t.previousYearAmount, 0)
//         }
//       });
//     }, 0);

//   } catch (error) {
//     const errorMessage = error.response?.data?.message || 'Failed to fetch data';
//     showSnackbar(errorMessage, 'error');

//     console.error('Error fetching family data:', {
//       familyId,
//       message: error.message,
//       status: error.response?.status,
//       data: error.response?.data
//     });

//     setPersons([]);
//     setTransactions([]);
//   } finally {
//     setLoading(false);
//   }
// };


// const fetchFamilyData = async (familyId) => {
//   if (!familyId) {
//     showSnackbar('Invalid family ID', 'warning');
//     return;
//   }

//   setLoading(true);

//   try {
//     console.log('Fetching family data for familyId:', familyId);
    
//     const [currentYearResponse, previousYearResponse] = await Promise.allSettled([
//       axiosInstance.get(`/person/familydata/${familyId}/year/${currentYear}`, {
//         timeout: 15000,
//         validateStatus: (status) => status >= 200 && status < 300
//       }),
//       axiosInstance.get(`/person/familydata/${familyId}/year/${currentYear - 1}`, {
//         timeout: 15000,
//         validateStatus: (status) => status >= 200 && status < 300
//       })
//     ]);

//     if (currentYearResponse.status === 'rejected') {
//       throw new Error(currentYearResponse.reason?.response?.data?.message || 'Failed to fetch current year data');
//     }

//     const familyData = currentYearResponse.value.data;
//     console.log('Raw family data from API:', familyData);
    
//     const previousYearData = previousYearResponse.status === 'fulfilled' 
//       ? previousYearResponse.value.data 
//       : [];

//     const previousYearAmountMap = new Map();
//     if (previousYearData.length > 0) {
//       previousYearData.forEach(person => {
//         previousYearAmountMap.set(person._id, person.currentYearAmount || 0);
//       });
//     }

//     const processedPersons = [];
//     const processedTransactions = [];
    
//     for (const person of familyData) {
//       // IMPORTANT: Preserve the customOrder field from the database
//       const processedPerson = {
//         ...person,
//         age: calculateAge(person.dob),
//         fullName: `${person.name} ${person.baptismName || ''}`.trim(),
//         customOrder: person.customOrder // Explicitly preserve customOrder
//       };
      
//       console.log(`Person ${person.name} - customOrder: ${person.customOrder}`);
//       processedPersons.push(processedPerson);

//       // Handle transactions...
//       let currentYearAmountExcludingTransferred = 0;
//       try {
//         const detailedTransactionsResponse = await axiosInstance.get(
//           `/transaction/person/${person._id}/year/${currentYear}`
//         );
        
//         const detailedTransactions = detailedTransactionsResponse.data.transactions || [];
        
//         currentYearAmountExcludingTransferred = detailedTransactions
//           .filter(transaction => {
//             return !transaction.isTransferred && 
//                    transaction.status !== 'transferred' &&
//                    transaction.status === 'active';
//           })
//           .reduce((sum, transaction) => sum + (transaction.amountPaid || 0), 0);
//       } catch (error) {
//         console.warn(`Could not fetch detailed transactions for person ${person._id}:`, error);
//         currentYearAmountExcludingTransferred = person.currentYearAmount || 0;
//       }

//       const processedTransaction = {
//         personId: person._id,
//         personName: person.name,
//         totalAmount: person.totalAmount || 0,
//         currentYearAmount: currentYearAmountExcludingTransferred,
//         previousYearAmount: previousYearAmountMap.get(person._id) || 0,
//         details: {
//           relation: person.relation,
//           baptismName: person.baptismName
//         }
//       };
//       processedTransactions.push(processedTransaction);
//     }

//     // Sort persons using the custom sorting function
//     const sortedPersons = sortPersonsByOrder(processedPersons);
    
//     console.log('Sorted persons:', sortedPersons.map(p => ({ 
//       name: p.name, 
//       customOrder: p.customOrder, 
//       relation: p.relation 
//     })));

//     setPersons(sortedPersons);
//     setTransactions(processedTransactions);

//   } catch (error) {
//     const errorMessage = error.response?.data?.message || error.message || 'Failed to fetch data';
//     showSnackbar(errorMessage, 'error');
//     setPersons([]);
//     setTransactions([]);
//   } finally {
//     setLoading(false);
//   }
// };

// jul 12
// const fetchFamilyData = async (familyId) => {
//   if (!familyId) {
//     showSnackbar('Invalid family ID', 'warning');
//     return;
//   }

//   setLoading(true);

//   try {
//     // Use Promise.all for parallel requests instead of sequential
//     const [currentYearResponse, previousYearResponse] = await Promise.all([
//       axiosInstance.get(`/person/familydata/${familyId}/year/${currentYear}`),
//       axiosInstance.get(`/person/familydata/${familyId}/year/${currentYear - 1}`)
//         .catch(() => ({ data: [] })) // Handle gracefully if previous year fails
//     ]);

//     const familyData = currentYearResponse.data;
//     const previousYearData = previousYearResponse.data;

//     // Create lookup map for better performance
//     const previousYearAmountMap = new Map();
//     previousYearData.forEach(person => {
//       previousYearAmountMap.set(person._id, person.currentYearAmount || 0);
//     });

//     // Process data without additional API calls per person
//     const processedPersons = familyData.map(person => ({
//       ...person,
//       age: calculateAge(person.dob),
//       fullName: `${person.name} ${person.baptismName || ''}`.trim(),
//       customOrder: person.customOrder
//     }));

//     const processedTransactions = familyData.map(person => ({
//       personId: person._id,
//       personName: person.name,
//       totalAmount: person.totalAmount || 0,
//       currentYearAmount: person.currentYearAmount || 0, // Use data from main API
//       previousYearAmount: previousYearAmountMap.get(person._id) || 0,
//       details: {
//         relation: person.relation,
//         baptismName: person.baptismName
//       }
//     }));

//     const sortedPersons = sortPersonsByOrder(processedPersons);
    
//     setPersons(sortedPersons);
//     setTransactions(processedTransactions);

//   } catch (error) {
//     console.error('Error fetching family data:', error);
//     showSnackbar(error.response?.data?.message || 'Failed to fetch data', 'error');
//     setPersons([]);
//     setTransactions([]);
//   } finally {
//     setLoading(false);
//   }
// };
// const fetchFamilyData = async (familyId) => {
//   if (!familyId) {
//     showSnackbar('Invalid family ID', 'warning');
//     return;
//   }

//   setLoading(true);

//   try {
//     // Use Promise.all for parallel requests instead of sequential
//     const [currentYearResponse, previousYearResponse] = await Promise.all([
//       axiosInstance.get(`/person/familydata/${familyId}/year/${currentYear}`),
//       axiosInstance.get(`/person/familydata/${familyId}/year/${currentYear - 1}`)
//         .catch(() => ({ data: [] })) // Handle gracefully if previous year fails
//     ]);

//     const familyData = currentYearResponse.data;
//     const previousYearData = previousYearResponse.data;

//     // Create lookup map for better performance
//     const previousYearAmountMap = new Map();
//     previousYearData.forEach(person => {
//       previousYearAmountMap.set(person._id, person.currentYearAmount || 0);
//     });

//     // Process persons data
//     const processedPersons = familyData.map(person => ({
//       ...person,
//       age: calculateAge(person.dob),
//       fullName: `${person.name} ${person.baptismName || ''}`.trim(),
//       customOrder: person.customOrder
//     }));

//     // Process transactions with detailed API calls to get only active amounts
//     const processedTransactions = await Promise.all(
//       familyData.map(async (person) => {
//         let currentYearAmountExcludingTransferred = 0;
        
//         try {
//           const detailedTransactionsResponse = await axiosInstance.get(
//             `/transaction/person/${person._id}/year/${currentYear}`
//           );
          
//           const detailedTransactions = detailedTransactionsResponse.data.transactions || [];
          
//           // Filter for only active transactions (excluding transferred)
//           currentYearAmountExcludingTransferred = detailedTransactions
//             .filter(transaction => {
//               return !transaction.isTransferred && 
//                      transaction.status !== 'transferred' &&
//                      transaction.status === 'active';
//             })
//             .reduce((sum, transaction) => sum + (transaction.amountPaid || 0), 0);
//         } catch (error) {
//           console.warn(`Could not fetch detailed transactions for person ${person._id}:`, error);
//           // Fallback to the main API data if detailed transactions fail
//           currentYearAmountExcludingTransferred = person.currentYearAmount || 0;
//         }

//         return {
//           personId: person._id,
//           personName: person.name,
//           totalAmount: person.totalAmount || 0,
//           currentYearAmount: currentYearAmountExcludingTransferred, // Only active amounts
//           previousYearAmount: previousYearAmountMap.get(person._id) || 0,
//           details: {
//             relation: person.relation,
//             baptismName: person.baptismName
//           }
//         };
//       })
//     );

//     const sortedPersons = sortPersonsByOrder(processedPersons);
    
//     setPersons(sortedPersons);
//     setTransactions(processedTransactions);

//   } catch (error) {
//     console.error('Error fetching family data:', error);
//     showSnackbar(error.response?.data?.message || 'Failed to fetch data', 'error');
//     setPersons([]);
//     setTransactions([]);
//   } finally {
//     setLoading(false);
//   }
// };


const fetchFamilyData = async (familyId) => {
  if (!familyId) {
    showSnackbar('Invalid family ID', 'warning');
    return;
  }

  setLoading(true);

  try {
    // Single parallel request for all data
    const [familyResponse, previousYearResponse] = await Promise.allSettled([
      axiosInstance.get(`/person/familydata/${familyId}/year/${currentYear}`),
      axiosInstance.get(`/person/familydata/${familyId}/year/${currentYear - 1}`)
    ]);

    // Early return if main family data fails
    if (familyResponse.status === 'rejected') {
      throw new Error(familyResponse.reason?.response?.data?.message || 'Failed to fetch family data');
    }

    const familyData = familyResponse.value.data;
    const personIds = familyData.map(person => person._id);

    // Parallel transaction requests with timeout and error handling
    const transactionResponses = await Promise.allSettled(
      personIds.map(personId =>
        axiosInstance.get(`/transaction/person/${personId}/year/${currentYear}`, {
          timeout: 10000 // 10 second timeout per request
        })
      )
    );

    // Build previous year lookup map efficiently
    const previousYearAmountMap = new Map();
    if (previousYearResponse.status === 'fulfilled') {
      previousYearResponse.value.data.forEach(person => {
        previousYearAmountMap.set(person._id, person.currentYearAmount || 0);
      });
    }

    // Process persons using map instead of for loop
    const processedPersons = familyData.map(person => ({
      ...person,
      age: calculateAge(person.dob),
      fullName: `${person.name} ${person.baptismName || ''}`.trim(),
      customOrder: person.customOrder
    }));

    // Process transactions using map instead of for loop
    const processedTransactions = familyData.map((person, index) => {
      const transactionResponse = transactionResponses[index];
      
      let currentYearAmountExcludingTransferred = 0;
      
      if (transactionResponse.status === 'fulfilled') {
        const transactions = transactionResponse.value.data.transactions;
        
        if (transactions?.length) {
          currentYearAmountExcludingTransferred = transactions.reduce((sum, transaction) => {
            return (!transaction.isTransferred && 
                    transaction.status === 'active' && 
                    transaction.status !== 'transferred') 
              ? sum + (transaction.amountPaid || 0) 
              : sum;
          }, 0);
        }
      } else {
        currentYearAmountExcludingTransferred = person.currentYearAmount || 0;
      }

      return {
        personId: person._id,
        personName: person.name,
        totalAmount: person.totalAmount || 0,
        currentYearAmount: currentYearAmountExcludingTransferred,
        previousYearAmount: previousYearAmountMap.get(person._id) || 0,
        details: {
          relation: person.relation,
          baptismName: person.baptismName
        }
      };
    });

    // Sort and update state
    const sortedPersons = sortPersonsByOrder(processedPersons);
    
    setPersons(sortedPersons);
    setTransactions(processedTransactions);

  } catch (error) {
    console.error('Error fetching family data:', error);
    showSnackbar(error.response?.data?.message || 'Failed to fetch data', 'error');
    setPersons([]);
    setTransactions([]);
  } finally {
    setLoading(false);
  }
};

  // const fetchFamilyData = async (familyId) => {
  //   if (!familyId) {
  //     showSnackbar('Invalid family ID', 'warning');
  //     return;
  //   }
  
  //   setLoading(true);
    
  //   try {
  //     // Fetch persons data
  //     const personsPromise = axiosInstance.get(`/person/family/${familyId}`, {
  //       timeout: 10000,
  //       validateStatus: (status) => status >= 200 && status < 300
  //     });
  
  //     // Process persons data while waiting for the API response
  //     const [{ data: persons }] = await Promise.all([personsPromise]);
      
  //     if (!persons || persons.length === 0) {
  //       setPersons([]);
  //       setTransactions([]);
  //       return;
  //     }
  
  //     // Process persons and create transaction fetch promises simultaneously
  //     const processedPersons = persons.map(person => ({
  //       ...person,
  //       age: calculateAge(person.dob),
  //       fullName: `${person.name} ${person.baptismName || ''}`.trim()
  //     }));
  
  //     // Sort persons (this can happen in parallel with transaction fetching)
  //     const sortedPersons = processedPersons.sort((a, b) => {
  //       if (a.relation === 'head') return -1;
  //       if (b.relation === 'head') return 1;
  //       return a.name.localeCompare(b.name);
  //     });
  
  //     // Create transaction fetch promises for all persons
  //     const transactionPromises = persons.map(person => {
  //       const personId = person._id;
  //       return Promise.all([
  //         axiosInstance.get(`/transaction/person/${personId}`, {
  //           validateStatus: (status) => status >= 200 && status < 300
  //         }).catch(() => ({ data: { totalAmount: 0 } })),
  //         axiosInstance.get(`/transaction/person/${personId}/year/${currentYear}`, {
  //           validateStatus: (status) => status >= 200 && status < 300
  //         }).catch(() => ({ data: { totalAmount: 0 } }))
  //       ]).then(([totalResponse, currentYearResponse]) => ({
  //         personId,
  //         personName: person.name,
  //         totalAmount: totalResponse.data?.totalAmount || 0,
  //         currentYearAmount: currentYearResponse.data?.totalAmount || 0,
  //         details: {
  //           relation: person.relation,
  //           baptismName: person.baptismName
  //         }
  //       }));
  //     });
  
  //     // Execute all transaction fetches in parallel
  //     const transactionsData = await Promise.all(transactionPromises);
  
  //     // Update state with both processed data sets
  //     setPersons(sortedPersons);
  //     setTransactions(transactionsData);
  
  //     // Log insights (moved outside of the critical path)
  //     setTimeout(() => {
  //       console.log('Data Fetch Complete:', {
  //         familyId,
  //         persons: {
  //           total: sortedPersons.length,
  //           headExists: sortedPersons.some(p => p.relation === 'head')
  //         },
  //         transactions: {
  //           total: transactionsData.length,
  //           totalAmount: transactionsData.reduce((sum, t) => sum + t.totalAmount, 0),
  //           currentYearTotal: transactionsData.reduce((sum, t) => sum + t.currentYearAmount, 0)
  //         }
  //       });
  //     }, 0);
  
  //   } catch (error) {
  //     const errorMessage = error.response?.data?.message || 'Failed to fetch data';
  //     showSnackbar(errorMessage, 'error');
      
  //     console.error('Error fetching family data:', {
  //       familyId,
  //       message: error.message,
  //       status: error.response?.status,
  //       data: error.response?.data
  //     });
  
  //     setPersons([]);
  //     setTransactions([]);
  //   } finally {
  //     setLoading(false);
  //   }
  // };
  const calculateAge = (dob) => {
    if (!dob) return null;
    
    const birthDate = new Date(dob);
    const today = new Date();
    
    let age = today.getFullYear() - birthDate.getFullYear();
    const monthDiff = today.getMonth() - birthDate.getMonth();
    
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
      age--;
    }
    
    return age;
  };

  const fetchTransactions = async (familyId) => {
  // Input validation
  if (!familyId) {
    showSnackbar('Invalid family ID', 'warning');
    return;
  }

  try {
    // Start loading state
    setLoading(true);

    // Fetch persons with comprehensive configuration
    const { data: persons } = await axiosInstance.get(`/person/family/${familyId}`, {
      timeout: 10000,
      validateStatus: (status) => status >= 200 && status < 300
    });

    // If no persons found, set empty transactions and return
    if (!persons || persons.length === 0) {
      setTransactions([]);
      return;
    }

    // Fetch transactions for all persons in parallel with error handling
    const transactionsData = await Promise.all(
      persons.map(async (person) => {
        try {
          // Concurrent API calls for total, current year, and previous year transactions
          const [totalResponse, currentYearResponse, previousYearResponse] = await Promise.all([
            axiosInstance.get(`/transaction/person/${person._id}`, {
              validateStatus: (status) => status >= 200 && status < 300
            }),
            axiosInstance.get(`/transaction/person/${person._id}/year/${currentYear}`, {
              validateStatus: (status) => status >= 200 && status < 300
            }),
            axiosInstance.get(`/transaction/person/${person._id}/year/${currentYear-1}`, {
              validateStatus: (status) => status >= 200 && status < 300
            })
          ]);

          // Calculate current year amount excluding transferred transactions
          let currentYearAmountExcludingTransferred = 0;
          
          // Get detailed transactions for current year to filter out transferred ones
          const detailedCurrentYearTransactions = currentYearResponse.data?.transactions || [];
          
          if (detailedCurrentYearTransactions.length > 0) {
            // Filter out transferred transactions and sum the rest
            currentYearAmountExcludingTransferred = detailedCurrentYearTransactions
              .filter(transaction => {
                // Exclude transactions that are marked as transferred
                // Adjust these conditions based on how your backend marks transferred transactions
                return !transaction.isTransferred && 
                       transaction.status !== 'transferred' &&
                       transaction.status === 'active';
              })
              .reduce((sum, transaction) => sum + (transaction.amountPaid || 0), 0);
          } else {
            // Fallback to totalAmount if no detailed transactions
            currentYearAmountExcludingTransferred = currentYearResponse.data?.totalAmount || 0;
          }

          return {
            personId: person._id,
            personName: person.name,
            totalAmount: totalResponse.data?.totalAmount || 0,
            currentYearAmount: currentYearAmountExcludingTransferred, // Use filtered amount
            previousYearAmount: previousYearResponse.data?.totalAmount || 0,
            // Optional: Add more person details if needed
            details: {
              relation: person.relation,
              baptismName: person.baptismName
            }
          };
        } catch (personTransactionError) {
          // Handle individual person transaction fetch error
          console.warn(`Error fetching transactions for person ${person._id}:`, {
            message: personTransactionError.message,
            personName: person.name
          });

          return {
            personId: person._id,
            personName: person.name,
            totalAmount: 0,
            currentYearAmount: 0,
            previousYearAmount: 0,
            error: true
          };
        }
      })
    );

    // Process and aggregate transactions
    const processedTransactions = transactionsData.map(transaction => ({
      ...transaction,
      // Add any additional processing logic
      hasMissingData: transaction.error || false
    }));

    // Set transactions with processed data
    setTransactions(processedTransactions);

    // Logging for insights
    console.log('Transactions Fetched (Excluding Transferred):', {
      familyId,
      totalPersons: persons.length,
      transactionsProcessed: processedTransactions.length,
      totalAmount: processedTransactions.reduce((sum, t) => sum + t.totalAmount, 0),
      currentYearTotal: processedTransactions.reduce((sum, t) => sum + t.currentYearAmount, 0),
      currentYearExcludingTransferred: true
    });

  } catch (error) {
    // Comprehensive error handling
    const errorMessage = error.response?.data?.message || 'Failed to fetch transactions';
    
    showSnackbar(errorMessage, 'error');
    
    console.error('Error fetching transactions:', {
      familyId,
      message: error.message,
      status: error.response?.status,
      data: error.response?.data
    });

    // Ensure transactions are reset on error
    setTransactions([]);
  } finally {
    // Always turn off loading state
    setLoading(false);
  }
};
  const updateTransactionAmountInMainTable = async (personId) => {
  try {
    // Only update the transaction amount for this specific person
    const [totalResponse, currentYearResponse, previousYearResponse] = await Promise.all([
      axiosInstance.get(`/transaction/person/${personId}`),
      axiosInstance.get(`/transaction/person/${personId}/year/${currentYear}`),
      axiosInstance.get(`/transaction/person/${personId}/year/${currentYear - 1}`)
        .catch(() => ({ data: { totalAmount: 0 } })) // Fallback if no previous year data
    ]);

    // Update only the transaction data in the state
    setTransactions(prevTransactions => 
      prevTransactions.map(transaction => 
        transaction.personId === personId 
          ? {
              ...transaction,
              totalAmount: totalResponse.data?.totalAmount || 0,
              currentYearAmount: currentYearResponse.data?.totalAmount || 0,
              previousYearAmount: previousYearResponse.data?.totalAmount || 0
            }
          : transaction
      )
    );
  } catch (error) {
    console.error('Error updating transaction amount in main table:', error);
  }
};

  // Event Handlers
  const handleCurrentAmountChange = (e, personId) => {
    // Safely parse the input amount
    const amount = Math.max(0, parseFloat(e.target.value) || 0);
  
    // Update transactions with functional update for predictability
    setTransactions(prevTransactions => 
      prevTransactions.map(transaction => 
        transaction.personId === personId 
          ? { ...transaction, currentYearAmount: amount } 
          : transaction
      )
    );
  
    // Update current transactions with more robust logic
    setCurrentTransactions(prevCurrentTransactions => {
      // Find the index of existing transaction for this person
      const existingTransactionIndex = prevCurrentTransactions.findIndex(
        transaction => transaction.person === personId
      );
  
      // If transaction exists, update it
      if (existingTransactionIndex !== -1) {
        const updatedTransactions = [...prevCurrentTransactions];
        updatedTransactions[existingTransactionIndex] = {
          ...updatedTransactions[existingTransactionIndex],
          amountPaid: amount
        };
        return updatedTransactions;
      }
  
      // If no existing transaction, add a new one
      return [
        ...prevCurrentTransactions, 
        { person: personId, amountPaid: amount }
      ];
    });
  };

  // const handleSaveCurrentTransactions = async () => {
  //   // Validate inputs before proceeding
  //   if (!selectedParish || !selectedFamily?.id || currentTransactions.length === 0) {
  //     showSnackbar('Missing required information', 'warning');
  //     return;
  //   }
  
  //   try {
  //     // Start loading state
  //       setTransactionLoading(true);
  
  //     // Fetch parish and forane information
  //     const { data: parishData } = await axiosInstance.get(`/parish/${selectedParish}`);
  //     const forane = parishData.forane;
  
  //     // Prepare current date
  //     const today = new Date();
  //     const formattedDate = today.toLocaleDateString('en-GB', {
  //       day: '2-digit',
  //       month: '2-digit',
  //       year: 'numeric'
  //     }).replace(/\//g, '/');
  
  //     // Process transactions with comprehensive error handling
  //     const transactionResults = await Promise.allSettled(
  //       currentTransactions.map(async (transaction) => {
  //         try {
  //           // Validate transaction data
  //           if (!transaction.person || !transaction.amountPaid) {
  //             throw new Error('Invalid transaction data');
  //           }
  
  //           // Fetch existing yearly transactions
  //           const { data: yearlyData } = await axiosInstance.get(
  //             `/transaction/person/${transaction.person}/year/${currentYear}`
  //           );
  
  //           // Prepare transaction data
  //           const transactionData = {
  //             person: transaction.person,
  //             amountPaid: Number(transaction.amountPaid),
  //             family: selectedFamily.id,
  //             parish: selectedParish,
  //             forane: forane._id,
  //             date: formattedDate,
  //           };
            
  //           // Update or create transaction
  //           if (yearlyData.transactions && yearlyData.transactions.length > 0) {
  //             const existingTransaction = yearlyData.transactions[0];
  //             await axiosInstance.put(
  //               `/transaction/transactionId/${existingTransaction._id}`,
  //               transactionData
  //             );
  //           } else {
  //             await axiosInstance.post('/transaction', transactionData);
  //           }
  
  //           return { 
  //             personId: transaction.person, 
  //             status: 'success' 
  //           };
  //         } catch (transactionError) {
  //           console.warn(`Transaction failed for person ${transaction.person}:`, transactionError);
  //           return { 
  //             personId: transaction.person, 
  //             status: 'failed',
  //             error: transactionError.message 
  //           };
  //         }
  //       })
  //     );
  
  //     // Analyze transaction results
  //     const successfulTransactions = transactionResults.filter(
  //       result => result.status === 'fulfilled' && result.value.status === 'success'
  //     );
  //     const failedTransactions = transactionResults.filter(
  //       result => result.status === 'rejected' || 
  //                (result.status === 'fulfilled' && result.value.status === 'failed')
  //     );
  
  //     // Provide detailed feedback
  //     if (successfulTransactions.length > 0) {
  //       showSnackbar(
  //         `Transactions for ${currentYear} saved successfully. ${successfulTransactions.length} of ${currentTransactions.length} processed.`, 
  //         'success'
  //       );
  //     }
  
  //     if (failedTransactions.length > 0) {
  //       showSnackbar(
  //         `Failed to save ${failedTransactions.length} transactions`, 
  //         'warning'
  //       );
  //     }
  
  //     // Refresh transactions and reset current transactions
  //     await fetchTransactions(selectedFamily.id);
      
  //     setCurrentTransactions([]);
  
  //     // Log transaction summary
  //     console.log('Transaction Processing Summary:', {
  //       total: currentTransactions.length,
  //       successful: successfulTransactions.length,
  //       failed: failedTransactions.length
  //     });
  
  //   } catch (error) {
  //     // Comprehensive error handling
  //     console.error('Critical error in saving transactions:', {
  //       message: error.message,
  //       name: error.name,
  //       stack: error.stack,
  //       selectedParish,
  //       selectedFamily: selectedFamily?.id
  //     });
  
  //     showSnackbar('Failed to save transactions', 'error');
  //   } finally {
  //     // Ensure loading state is always turned off
  //       setTransactionLoading(false);
  //   }
  // };
const handleSaveCurrentTransactions = async () => {
    // Validate inputs before proceeding
    if (!selectedParish || !selectedFamily?.id || currentTransactions.length === 0) {
      showSnackbar('Missing required information', 'warning');
      return;
    }

    // Check if user is authenticated
    if (!currentUser) {
      showSnackbar('User not authenticated', 'error');
      return;
    }

    try {
      // Start loading state
      setTransactionLoading(true);

      // Fetch parish and forane information
      const { data: parishData } = await axiosInstance.get(`/parish/${selectedParish}`);
      const forane = parishData.forane;

      // Prepare current date
      const today = new Date();
      const formattedDate = today.toLocaleDateString('en-GB', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric'
      }).replace(/\//g, '/');

      // Process transactions with comprehensive error handling
      const transactionResults = await Promise.allSettled(
        currentTransactions.map(async (transaction) => {
          try {
            // Validate transaction data
            if (!transaction.person || !transaction.amountPaid) {
              throw new Error('Invalid transaction data');
            }

            // Fetch existing yearly transactions
            const { data: yearlyData } = await axiosInstance.get(
              `/transaction/person/${transaction.person}/year/${currentYear}`
            );

            // Prepare transaction data with user context
            const transactionData = {
              person: transaction.person,
              amountPaid: Number(transaction.amountPaid),
              family: selectedFamily.id,
              parish: selectedParish,
              forane: forane._id,
              date: formattedDate,
              // Add audit metadata
              createdBy: currentUser.id,
              createdByName: currentUser.name,
              createdByEmail: currentUser.email
            };
            
            // Update or create transaction
            let result;
            if (yearlyData.transactions && yearlyData.transactions.length > 0) {
              const existingTransaction = yearlyData.transactions[0];
              result = await axiosInstance.put(
                `/transaction/transactionId/${existingTransaction._id}`,
                transactionData
              );
            } else {
              result = await axiosInstance.post('/transaction', transactionData);
            }

            return { 
              personId: transaction.person, 
              status: 'success',
              transactionId: result.data.transactionId || result.data._id,
              action: yearlyData.transactions && yearlyData.transactions.length > 0 ? 'UPDATE' : 'CREATE'
            };
          } catch (transactionError) {
            console.warn(`Transaction failed for person ${transaction.person}:`, transactionError);
            return { 
              personId: transaction.person, 
              status: 'failed',
              error: transactionError.message 
            };
          }
        })
      );

      // Analyze transaction results
      const successfulTransactions = transactionResults.filter(
        result => result.status === 'fulfilled' && result.value.status === 'success'
      );
      const failedTransactions = transactionResults.filter(
        result => result.status === 'rejected' || 
                 (result.status === 'fulfilled' && result.value.status === 'failed')
      );

      // Provide detailed feedback
      if (successfulTransactions.length > 0) {
        showSnackbar(
          `Transactions for ${currentYear} saved successfully. ${successfulTransactions.length} of ${currentTransactions.length} processed.`, 
          'success'
        );

        // Log successful operations in console for debugging
        console.log('Successful transaction saves:', {
          user: currentUser.name,
          email: currentUser.email,
          parish: parishes.find(p => p._id === selectedParish)?.name,
          family: selectedFamily.name,
          transactionCount: successfulTransactions.length,
          timestamp: new Date().toISOString()
        });
      }

      if (failedTransactions.length > 0) {
        showSnackbar(
          `Failed to save ${failedTransactions.length} transactions`, 
          'warning'
        );
      }

      // Refresh transactions and reset current transactions
      await fetchTransactions(selectedFamily.id);
      
      setCurrentTransactions([]);

      // Log transaction summary
      console.log('Transaction Processing Summary:', {
        user: currentUser,
        total: currentTransactions.length,
        successful: successfulTransactions.length,
        failed: failedTransactions.length,
        family: selectedFamily.name,
        parish: parishes.find(p => p._id === selectedParish)?.name
      });

    } catch (error) {
      // Comprehensive error handling
      console.error('Critical error in saving transactions:', {
        message: error.message,
        name: error.name,
        stack: error.stack,
        user: currentUser,
        selectedParish,
        selectedFamily: selectedFamily?.id
      });

      showSnackbar('Failed to save transactions', 'error');
    } finally {
      // Ensure loading state is always turned off
      setTransactionLoading(false);
    }
  };


  
  // const handleMoveFamily = async () => {
  //   try {
  //     if (!selectedFamily || !destinationParish || !destinationKoottayma) {
  //       showSnackbar('Please select all required fields', 'error');
  //       return;
  //     }
  
  //     // Get source parish and koottayma
  //     const sourceParish = parishes.find(p => p._id === selectedParish);
  //     const sourceKoottayma = koottaymas.find(k => k.koottaymaId === selectedKoottayma);
  //     const destParish = parishes.find(p => p._id === destinationParish);
  //     const destKoottayma = Dkoottaymas.find(k => k.koottaymaId === destinationKoottayma);
  
  //     // Get destination forane
  //     const foraneResponse = await axiosInstance.get(`/parish/getforane/${destinationParish}`);
  //     const destinationForane = foraneResponse.data.forane;
  
  //     if (!sourceParish || !sourceKoottayma || !destParish || !destKoottayma || !destinationForane) {
  //       throw new Error('Missing required parish, koottayma, or forane data');
  //     }
  
   
  
  //     // Update family location
  //     const familyUpdateResponse = await axiosInstance.put(
  //       `/family/${selectedFamily._id}`,
  //       {
  //         parish: destinationParish,
  //         koottayma: destinationKoottayma,
  //         forane: destinationForane._id  // Include forane in update
  //       }
  //     );
  
    
  
  //     // Create movement record
  //     const movementData = {
  //       family: selectedFamily.id,
  //       familyName: selectedFamily.name,
  //       familyNumber: parseInt(selectedFamily.id) || 0,
  //       sourceParish: sourceParish._id,
  //       sourceParishName: sourceParish.name,
  //       sourceKoottayma: sourceKoottayma.koottaymaId,
  //       sourceKoottaymaName: sourceKoottayma.name,
  //       destinationParish: destParish._id,
  //       destinationParishName: destParish.name,
  //       destinationKoottayma: destKoottayma.koottaymaId,
  //       destinationKoottaymaName: destKoottayma.name,       
  //       movedDate: new Date(),
  //       status: 'completed'
  //     };
  
  //     await axiosInstance.post('/family-movements', movementData);
        
  //     showSnackbar('Family moved successfully', 'success');
  //     setOpenMoveDialog(false);
  //     fetchFamilies(selectedParish, selectedKoottayma);
  //     fetchMovements();
        
  //     // Reset move dialog state
  //     setDestinationParish(null);
  //     setDestinationKoottayma(null);
  //   } catch (error) {
  //     console.error('Error moving family:', error);
  //     console.error('Error details:', {
  //       response: error.response?.data,
  //       message: error.message
  //     });
      
  //     const errorMessage = error.response?.data?.message || error.message || 'Failed to move family';
  //     showSnackbar(errorMessage, 'error');
  //   }
  // };

  const showSnackbar = (message, severity = 'success') => {
    setSnackbar({
      open: true,
      message,
      severity,
    });
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

    // Get the new family number for the destination parish
    const newFamilyNumberResponse = await axiosInstance.get(`/family/next-family-number/${destinationParish}`);
    const newFamilyNumber = newFamilyNumberResponse.data.familyNumber;

    // Update family location with new family number
    const familyUpdateResponse = await axiosInstance.put(
      `/family/${selectedFamily._id}`,
      {
        parish: destinationParish,
        koottayma: destinationKoottayma,
        forane: destinationForane._id,
        familyNumber: newFamilyNumber  // Add the new family number
      }
    );

    // Create movement record
    const movementData = {
      family: selectedFamily.id,
      familyName: selectedFamily.name,
      familyNumber: parseInt(selectedFamily.id) || 0,
      oldFamilyNumber: selectedFamily.familyNumber, // Store old family number
      newFamilyNumber: newFamilyNumber, // Store new family number
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
      
    showSnackbar(`Family moved successfully. New family number: ${newFamilyNumber}`, 'success');
    setOpenMoveDialog(false);
    fetchFamilies(selectedParish, selectedKoottayma);
    fetchMovements();
      
    // Reset move dialog state
    setDestinationParish(null);
    setDestinationKoottayma(null);
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
      size: 700,
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
    accessorKey: 'serialNumber',
    header: 'S.No',
    size: 50,
    enableEditing: false,
    enableSorting: false,
    Cell: ({ row }) => (
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
        <Typography variant="body2" fontWeight="medium">
          {row.index + 1}
        </Typography>
      </Box>
    ),
  },
    {
      accessorKey: 'baptismName',
      header: 'Baptism',
      size: 90,
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
      size: 90,
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
  size: 90,
  enableEditing: true,
  editVariant: 'select',
  editSelectOptions: relations, // Use the base relations
  muiEditTextFieldProps: ({ cell, table, row }) => ({
    select: true,
    required: true,
    error: !!validationErrors.relation,
    helperText: validationErrors.relation,
    children: [
      ...relations.map((relation) => (
        <MenuItem key={relation} value={relation}>
          {relation.charAt(0).toLowerCase() + relation.slice(1)}
        </MenuItem>
      )),
      <MenuItem key="add-new" value="add-new" sx={{ fontStyle: 'italic', color: 'primary.main' }}>
        + Add New Relation
      </MenuItem>
    ],
    onFocus: (event) => {
      // Store original value in case user cancels
      event.target.dataset.originalValue = row.original.relation;
    },
   onChange: (event) => {       
  const value = event.target.value;              
  if (value === 'add-new') {         
    // Handle adding new relation         
    const newRelation = prompt('Enter new relation:');         
    if (newRelation && newRelation.trim()) {           
      const trimmedRelation = newRelation.trim().toLowerCase();                      
      if (!relations.some(r => r.toLowerCase() === trimmedRelation)) {             
        setRelations(prev => sortRelationsWithHeadFirst([...prev, trimmedRelation]));
        event.target.value = trimmedRelation;             
        showSnackbar(`New relation "${trimmedRelation}" added successfully`, 'success');           
      } else {             
        event.target.value = trimmedRelation;             
        showSnackbar('Relation already exists', 'warning');           
      }         
    } else {           
      // Restore original value if user cancels           
      event.target.value = event.target.dataset.originalValue || '';         
    }       
  }     
}
  }),
},
    {
      accessorKey: 'gender',
      header: 'Sex',
      size: 60,
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
      size: 90,
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
      size: 90,
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
      size: 90,
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
    id: 'previousYearAmount',
    header: `₹ ${currentYear - 1}`,
    size: 60,
    enableEditing: false,
    Cell: ({ row }) => {
      const transaction = transactions.find((t) => t.personId === row.original._id);
      // Get previous year amount from transaction data
      const previousYearAmount = transaction?.previousYearAmount || 0;
      return (
        <Typography 
          variant="body2" 
          sx={{ 
            fontWeight: 500,
            color: 'text.secondary'
          }}
        >
          ₹{previousYearAmount.toFixed(0)}
        </Typography>
      );
    },
  },
   
{
  id: 'currentAmount',
  header: `₹ ${currentYear}`,
  size: 70,
  enableEditing: false,
  Cell: ({ row, table }) => {
    const transaction = transactions.find((t) => t.personId === row.original._id);
    
    // Calculate current year amount excluding transferred transactions
    const getCurrentYearAmountExcludingTransferred = () => {
      if (!transaction) return 0;
      return transaction.currentYearAmount || 0;
    };
    
    const currentYearAmount = getCurrentYearAmountExcludingTransferred();
    
    // Create unique input id for each row
    const inputId = `amount-input-${row.index}`;
    
    const handleKeyPress = (e) => {
      if (e.key === 'Enter') {
        e.preventDefault();
        
        // Get all amount input fields
        const allInputs = document.querySelectorAll('[id^="amount-input-"]');
        const currentIndex = Array.from(allInputs).findIndex(input => input.id === inputId);
        
        if (currentIndex < allInputs.length - 1) {
          // Move to next input
          const nextInput = allInputs[currentIndex + 1];
          nextInput.focus();
          nextInput.select();
        } else {
          // This is the last input, focus on save button
          const saveButton = document.querySelector('[data-testid="save-transactions-button"]');
          if (saveButton) {
            saveButton.focus();
            // Optionally auto-save
            handleSaveCurrentTransactions();
          }
        }
      }
    };
    
    return (
      <TextField
        id={inputId}
        type="number"
        value={currentYearAmount.toFixed(0)}
        onChange={(e) => handleCurrentAmountChange(e, row.original._id)}
        onKeyPress={handleKeyPress}
        variant="outlined"
        size="small"
        fullWidth
        InputProps={{
          startAdornment: <InputAdornment position="start"></InputAdornment>,
          sx: { height: '28px', '& input': { padding: '1px' } }
        }}
        // Auto-focus on first input when component mounts
        autoFocus={row.index === 0}
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
    id: 'transactionDetails',
    header: 'Details',
    size: 80,
    enableEditing: false,
    Cell: ({ row }) => (
      <Tooltip title="View Transaction Details">
        <IconButton
          onClick={() => fetchPersonTransactions(row.original._id, row.original.name)}
          color="primary"
          size="small"
        >
          <ReceiptIcon />
        </IconButton>
      </Tooltip>
    ),
  },
//     {
//       id: 'actions',
//       header: 'Actions',
//       size: 180,
//       enableEditing: false,
//       Cell: ({ row, table }) => (
//         <Box sx={{ display: 'flex', gap: '4px' }}>
//           {table.getState().editingRow?.id === row.id ? (
//             <>
//               <Tooltip title="Save">
//                 <IconButton
//                   onClick={() => {
//                     table.setEditingRow(null);
//                     handleSaveRow({
//                       exitEditingMode: () => table.setEditingRow(null),
//                       row,
//                       values: row._valuesCache,
//                     });
//                   }}
//                   color="primary"
//                 >
//                   <SaveIcon />
//                 </IconButton>
//               </Tooltip>
//               <Tooltip title="Cancel">
//                 <IconButton
//                   onClick={() => {
//                     table.setEditingRow(null);
//                     handleEditCancel();
//                   }}
//                   color="error"
//                 >
//                   <CancelIcon />
//                 </IconButton>
//               </Tooltip>
//             </>
//           ) : (
//             <>
//               {/* <Tooltip title="Edit">
//                 <IconButton
//                   onClick={() => {
//                     table.setEditingRow(row);
//                     handleEditStart();
//                   }}
//                 >
//                   <EditIcon />
//                 </IconButton>
//               </Tooltip> */}
//               <Tooltip title="Move to Another Family">
//                 <IconButton
//                   onClick={() => {
//                     setSelectedPerson(row.original);
//                     setOpenMovePersonDialog(true);
//                     //fetchAllFamilies();
//                   }}
//                 >
//                   <MoveIcon />
//                 </IconButton>
//               </Tooltip>
//               <Tooltip title="Change Status">
//   <IconButton
//     onClick={() => {
//       setStatusDetails({
//         person: row.original,
//         status: '',
//         remarks: '',
//         date: new Date().toISOString().split('T')[0]
//       });
//       setOpenStatusDialog(true);
//     }}
//     color="error"
//   >
//     <DeleteIcon />
//   </IconButton>
// </Tooltip>
// {/* {row.original.status !== 'active' && (
//   <Tooltip title="Undo Status Change">
//     <IconButton
//       onClick={() => setShowUndoDialog(true)}
//       color="warning"
//     >
//       <HistoryIcon />
//     </IconButton>
//   </Tooltip>
// )} */}
//             </>
//           )}
//         </Box>
//       ),
//     },
  ];

const enhancedFetchFamilyData = async (familyId) => {
  // Early validation
  if (!familyId) {
    showSnackbar('Invalid family ID', 'warning');
    return;
  }

  setLoading(true);

  try {
    // Create concurrent requests for current and previous year data
    const [currentYearResponse, previousYearResponse] = await Promise.allSettled([
      axiosInstance.get(`/person/familydata/${familyId}/year/${currentYear}`, {
        timeout: 15000,
        validateStatus: (status) => status >= 200 && status < 300
      }),
      axiosInstance.get(`/person/familydata/${familyId}/year/${currentYear - 1}`, {
        timeout: 15000,
        validateStatus: (status) => status >= 200 && status < 300
      })
    ]);

    if (currentYearResponse.status === 'rejected') {
      throw new Error(currentYearResponse.reason?.response?.data?.message || 'Failed to fetch current year data');
    }

    const familyData = currentYearResponse.value.data;
    const previousYearData = previousYearResponse.status === 'fulfilled' 
      ? previousYearResponse.value.data 
      : [];

    const previousYearAmountMap = new Map();
    if (previousYearData.length > 0) {
      previousYearData.forEach(person => {
        previousYearAmountMap.set(person._id, person.currentYearAmount || 0);
      });
    }

    const processedPersons = [];
    const processedTransactions = [];
    
    for (const person of familyData) {
      const processedPerson = {
        ...person,
        age: calculateAge(person.dob),
        fullName: `${person.name} ${person.baptismName || ''}`.trim(),
      };
      processedPersons.push(processedPerson);

      let currentYearAmountExcludingTransferred = 0;
      try {
        const detailedTransactionsResponse = await axiosInstance.get(
          `/transaction/person/${person._id}/year/${currentYear}`
        );
        
        const detailedTransactions = detailedTransactionsResponse.data.transactions || [];
        
        currentYearAmountExcludingTransferred = detailedTransactions
          .filter(transaction => {
            return !transaction.isTransferred && 
                   transaction.status !== 'transferred' &&
                   transaction.status === 'active';
          })
          .reduce((sum, transaction) => sum + (transaction.amountPaid || 0), 0);
      } catch (error) {
        console.warn(`Could not fetch detailed transactions for person ${person._id}:`, error);
        currentYearAmountExcludingTransferred = person.currentYearAmount || 0;
      }

      const processedTransaction = {
        personId: person._id,
        personName: person.name,
        totalAmount: person.totalAmount || 0,
        currentYearAmount: currentYearAmountExcludingTransferred,
        previousYearAmount: previousYearAmountMap.get(person._id) || 0,
        details: {
          relation: person.relation,
          baptismName: person.baptismName
        }
      };
      processedTransactions.push(processedTransaction);
    }

    // Sort persons using the custom sorting function
    const sortedPersons = sortPersonsByOrder(processedPersons);

    setPersons(sortedPersons);
    setTransactions(processedTransactions);

  } catch (error) {
    const errorMessage = error.response?.data?.message || error.message || 'Failed to fetch data';
    showSnackbar(errorMessage, 'error');
    setPersons([]);
    setTransactions([]);
  } finally {
    setLoading(false);
  }
};
// Enhanced MaterialReactTable with complete cell selection fix
const enhancedMaterialReactTableProps = {
  columns: personalInfoColumns,
  data: persons,
  enableRowActions: true,
  enableEditing: true,
  editDisplayMode: "cell", // Change to cell editing instead of row editing
  onEditingRowSave: handleSaveRow,
  onEditingRowCancel: handleEditCancel,
  onEditingRowStart: handleEditStart,
  
  // Disable keyboard shortcuts that interfere with text editing
  enableKeyboardShortcuts: false,
  
  // Disable cell selection
  enableCellSelection: false,
  enableMultiRowSelection: false,
  enableRowSelection: false,
  
  state: {
    validationErrors,
    isEditing: isEditingRow,
  },
  
  muiTableBodyRowProps: ({ row, table }) => ({
    draggable: !table.getState().editingCell, // Only allow drag when not editing
    onDragStart: (e) => {
      if (!table.getState().editingCell) {
        handleDragStart(e, row.index);
      }
    },
    onDragEnd: handleDragEnd,
    onDragOver: (e) => handleDragOver(e, row.index),
    onDragLeave: handleDragLeave,
    onDrop: (e) => handleDrop(e, row.index),
    sx: {
      cursor: table.getState().editingCell ? 'default' : 'grab',
      backgroundColor: dragOverRowIndex === row.index 
        ? 'rgba(25, 118, 210, 0.1)' 
        : 'inherit',
      borderTop: dragOverRowIndex === row.index 
        ? '2px solid #1976d2' 
        : 'inherit',
      transition: 'all 0.2s ease',
      '&:active': {
        cursor: table.getState().editingCell ? 'default' : 'grabbing',
      },
      '&:hover': {
        backgroundColor: table.getState().editingCell
          ? 'inherit'
          : 'rgba(0, 0, 0, 0.04)',
      }
    }
  }),
  
  muiTableBodyCellProps: ({ cell, row, table }) => ({
    // Add data attribute to identify editing cells
    'data-editing': table.getState().editingCell?.id === cell.id ? 'true' : 'false',
    
    sx: {
      backgroundColor: table.getState().editingCell?.id === cell.id
        ? 'rgba(25, 118, 210, 0.08) !important'
        : 'inherit',
      border: table.getState().editingCell?.id === cell.id
        ? '2px solid #1976d2 !important'
        : 'inherit',
      
      // Disable cell selection styling
      '&:focus': {
        outline: 'none !important',
        boxShadow: 'none !important',
        backgroundColor: 'inherit !important'
      },
      
      '&.Mui-selected': {
        backgroundColor: 'transparent !important'
      },
      
      // Prevent focus events when editing
      '&:focus-within': {
        outline: 'none !important',
        boxShadow: 'none !important'
      }
    },
    
    // Prevent table cell events when editing
    onFocus: (e) => {
      if (table.getState().editingCell) {
        e.stopPropagation();
      }
    },
    
    onClick: (e) => {
      if (table.getState().editingCell && e.target.tagName === 'INPUT') {
        e.stopPropagation();
      }
    },
    
    onKeyDown: (e) => {
      // Prevent table navigation when editing
      if (table.getState().editingCell && 
          ['ArrowLeft', 'ArrowRight', 'ArrowUp', 'ArrowDown', 'Tab'].includes(e.key)) {
        e.stopPropagation();
        e.stopImmediatePropagation();
      }
    }
  }),
  
  muiTableProps: {
    sx: {
      tableLayout: 'fixed',
      minWidth: '1400px',
      borderRadius: 1,
      
      // Disable table-level keyboard navigation
      '&:focus': {
        outline: 'none !important'
      },
      
      // Disable cell selection highlighting
      '& .MuiTableCell-root:focus': {
        outline: 'none !important',
        boxShadow: 'none !important'
      },
      
      '& .MuiTableCell-root.Mui-selected': {
        backgroundColor: 'transparent !important'
      }
    },
  },
  
  renderRowActions: ({ row, table }) => (
    <Stack direction="row" spacing={-1.5} alignItems="left">
      {table.getState().editingRow?.id === row.id ? (
        // Only show Cancel and Save buttons when editing
        <>
          <Tooltip title="Cancel">
            <IconButton
              color="error"
              onClick={() => {
                table.setEditingRow(null);
                handleEditCancel();
              }}
              sx={{ 
                backgroundColor: 'error.lighter',
                '&:hover': { backgroundColor: 'error.light' }
              }}
            >
              <CancelIcon />
            </IconButton>
          </Tooltip>
          <Tooltip title="Save Changes">
            <IconButton
              color="primary"
              onClick={() => {
                table.setEditingRow(null);
                handleSaveRow({
                  exitEditingMode: () => table.setEditingRow(null),
                  row,
                  values: row._valuesCache,
                });
              }}
              sx={{ 
                backgroundColor: 'primary.lighter',
                '&:hover': { backgroundColor: 'primary.light' }
              }}
            >
              <SaveIcon />
            </IconButton>
          </Tooltip>
        </>
      ) : (
        // Show all action buttons when not editing
        <>
          <Tooltip title="Edit Row">
            <IconButton
              color="primary"
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
              }}
            >
              <MoveIcon />
            </IconButton>
          </Tooltip>
          <Tooltip title="Change Status">
            <IconButton
              onClick={() => {
                setStatusDetails({
                  person: row.original,
                  status: '',
                  remarks: '',
                  date: new Date().toISOString().split('T')[0]
                });
                setOpenStatusDialog(true);
              }}
              color="error"
            >
              <DeleteIcon />
            </IconButton>
          </Tooltip>
        </>
      )}
    </Stack>
  ),
  
  positionActionsColumn: "last"
};
// Enhanced MaterialReactTable with drag and drop
// const enhancedMaterialReactTableProps = {
//   columns: personalInfoColumns,
//   data: persons,
//   enableRowActions: true,
//   enableEditing: true,
//   editDisplayMode: "row",
//   onEditingRowSave: handleSaveRow,
//   onEditingRowCancel: handleEditCancel,
//   onEditingRowStart: handleEditStart,
//   state: {
//     validationErrors,
//     isEditing: isEditingRow,
//   },
//   muiTableBodyRowProps: ({ row, table }) => ({
//     draggable: true,
//     onDragStart: (e) => handleDragStart(e, row.index),
//     onDragEnd: handleDragEnd,
//     onDragOver: (e) => handleDragOver(e, row.index),
//     onDragLeave: handleDragLeave,
//     onDrop: (e) => handleDrop(e, row.index),
//     sx: {
//       cursor: table.getState().editingRow?.id === row.id ? 'default' : 'grab',
//       backgroundColor: dragOverRowIndex === row.index 
//         ? 'rgba(25, 118, 210, 0.1)' 
//         : 'inherit',
//       borderTop: dragOverRowIndex === row.index 
//         ? '2px solid #1976d2' 
//         : 'inherit',
//       transition: 'all 0.2s ease',
//       '&:active': {
//         cursor: 'grabbing',
//       },
//       '&:hover': {
//         backgroundColor: table.getState().editingRow?.id === row.id 
//           ? 'rgba(25, 118, 210, 0.05)'
//           : 'rgba(0, 0, 0, 0.04)',
//       }
//     }
//   }),
//   muiTableProps: {
//     sx: {
//       tableLayout: 'fixed',
//       minWidth: '1400px',
//       borderRadius: 1,
//     },
//   },
//   renderRowActions: ({ row, table }) => (
//     <Stack direction="row" spacing={-1.5} alignItems="left">
//       {table.getState().editingRow?.id === row.id ? (
//         <>
//           <Tooltip title="Save Changes">
//             <IconButton
//               color="primary"
//               onClick={() => {
//                 table.setEditingRow(null);
//                 handleSaveRow({
//                   exitEditingMode: () => table.setEditingRow(null),
//                   row,
//                   values: row._valuesCache,
//                 });
//               }}
//             >
//               <SaveIcon />
//             </IconButton>
//           </Tooltip>
//           <Tooltip title="Cancel">
//             <IconButton
//               color="error"
//               onClick={() => {
//                 table.setEditingRow(null);
//                 handleEditCancel();
//               }}
//             >
//               <CancelIcon />
//             </IconButton>
//           </Tooltip>
//         </>
//       ) : (
//         <Tooltip title="Edit Row">
//           <IconButton
//             color="primary"
//             onClick={() => {
//               table.setEditingRow(row);
//               handleEditStart();
//             }}
//           >
//             <EditIcon />
//           </IconButton>
//         </Tooltip>
//       )}
//       <Tooltip title="Move to Another Family">
//         <IconButton
//           onClick={() => {
//             setSelectedPerson(row.original);
//             setOpenMovePersonDialog(true);
//           }}
//         >
//           <MoveIcon />
//         </IconButton>
//       </Tooltip>
//       <Tooltip title="Change Status">
//         <IconButton
//           onClick={() => {
//             setStatusDetails({
//               person: row.original,
//               status: '',
//               remarks: '',
//               date: new Date().toISOString().split('T')[0]
//             });
//             setOpenStatusDialog(true);
//           }}
//           color="error"
//         >
//           <DeleteIcon />
//         </IconButton>
//       </Tooltip>
//     </Stack>
//   ),
//   positionActionsColumn: "last",
//   muiTableBodyCellProps: ({ cell, row, table }) => ({
//     sx: {
//       backgroundColor:
//         table.getState().editingRow?.id === row.id
//           ? alpha(theme.palette.primary.light, 0.1)
//           : 'inherit',
//     },
//   }),
// };
// Movement history columns
const movementColumns = [
  {
    accessorKey: 'familyNumber',
    header: 'Family ID',
    size: 120,
  },
  {
    accessorKey: 'familyName',
    header: 'Family Name',
    size: 200,
  },
  {
    accessorKey: 'oldFamilyNumber',
    header: 'Old Number',
    size: 100,
    Cell: ({ row }) => {
      return row.original.oldFamilyNumber || 'N/A';
    }
  },
  {
    accessorKey: 'newFamilyNumber',
    header: 'New Number',
    size: 100,
    Cell: ({ row }) => {
      return (
        <Box
          component="span"
          sx={{
            backgroundColor: 'success.lighter',
            color: 'success.darker',
            px: 1,
            py: 0.5,
            borderRadius: 1,
            display: 'inline-block',
            fontWeight: 'bold'
          }}
        >
          {row.original.newFamilyNumber || 'N/A'}
        </Box>
      );
    }
  },
  {
    accessorKey: 'sourceParishName',
    header: 'From Parish',
    size: 180,
  },
  {
    accessorKey: 'sourceKoottaymaName',
    header: 'From Koottayma',
    size: 180,
  },
  {
    accessorKey: 'destinationParishName',
    header: 'To Parish',
    size: 180,
  },
  {
    accessorKey: 'destinationKoottaymaName',
    header: 'To Koottayma',
    size: 180,
  },
  {
    accessorKey: 'movedDate',
    header: 'Moved Date',
    size: 160,
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
  <Container paddingRight={0} elevation={1} 
  maxWidth={false}
  sx={{ 
    p: 2,
    borderRadius: 3, 
    pb: 0,
    pt: 0,
    paddingRight: 0,
    width: '100%',
    marginRight:0}}>
    {/* Status Change Dialog */}
    
{/* Status Change Dialog */}
<Dialog
  open={openStatusDialog}
  onClose={() => !isUpdatingStatus && setOpenStatusDialog(false)} // Prevent closing during update
  maxWidth="sm"
  fullWidth
>
  <DialogTitle>Update Person Status</DialogTitle>
  <DialogContent>
    <Stack spacing={2} sx={{ mt: 2 }}>
      <Typography variant="body1">
        Updating status for: {statusDetails.person?.name}
        {statusDetails.person?.relation === 'head' && (
          <Typography color="warning.main" variant="body2">
            Note: Changing head status requires selecting a new head if there are other active members
          </Typography>
        )}
      </Typography>
      
      <FormControl fullWidth>
        <InputLabel>New Status</InputLabel>
        <Select
          value={statusDetails.status}
          onChange={(e) => setStatusDetails({
            ...statusDetails,
            status: e.target.value
          })}
          label="New Status"
          disabled={isUpdatingStatus} // Disable during update
        >
          <MenuItem value="moved_out">Moved Out of Diocese</MenuItem>
          <MenuItem value="deceased">Deceased</MenuItem>
        </Select>
      </FormControl>

      <TextField
        fullWidth
        label="Remarks"
        multiline
        rows={3}
        value={statusDetails.remarks}
        onChange={(e) => setStatusDetails({
          ...statusDetails,
          remarks: e.target.value
        })}
        helperText="Enter reason or additional information"
        disabled={isUpdatingStatus} // Disable during update
      />

      {/* Loading indicator */}
      {isUpdatingStatus && (
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mt: 2 }}>
          <CircularProgress size={20} />
          <Typography variant="body2" color="text.secondary">
            Processing status change and transferring transactions...
          </Typography>
        </Box>
      )}
    </Stack>
  </DialogContent>
  <DialogActions>
    <Button 
      onClick={() => setOpenStatusDialog(false)}
      disabled={isUpdatingStatus} // Disable during update
    >
      Cancel
    </Button>
    <Button 
      variant="contained" 
      onClick={handlePersonStatusChange}
      disabled={!statusDetails.status || isUpdatingStatus} // Disable if no status or updating
      startIcon={isUpdatingStatus ? <CircularProgress size={16} /> : null}
    >
      {isUpdatingStatus ? 'Updating...' : 'Update Status'}
    </Button>
  </DialogActions>
</Dialog>

{/* // Add Person Dialog */}
<Dialog
  open={openAddPersonDialog}
  onClose={() => setOpenAddPersonDialog(false)}
  maxWidth="md"
  fullWidth
>
  <DialogTitle>Add New Person to Family</DialogTitle>
  <DialogContent>
    <Grid container spacing={2} sx={{ mt: 1 }}>
      <Grid item xs={12} sm={6}>
        <TextField
          fullWidth
          label="Name *"
          value={newPersonData.name}
          onChange={(e) => setNewPersonData({ ...newPersonData, name: e.target.value })}
        />
      </Grid>
      <Grid item xs={12} sm={6}>
        <TextField
          fullWidth
          label="Baptism Name *"
          value={newPersonData.baptismName}
          onChange={(e) => setNewPersonData({ ...newPersonData, baptismName: e.target.value })}
        />
      </Grid>
      {/* <Grid item xs={12} sm={6}>
        <FormControl fullWidth>
          <InputLabel>Relation *</InputLabel>
          <Select
            value={newPersonData.relation}
            onChange={(e) => setNewPersonData({ ...newPersonData, relation: e.target.value })}
            label="Relation *"
          >
          head,wife,husband,son,daughter,father,mother,brother,son in law,daughter in law,grandson,granddaughter
            <MenuItem value="head">Head</MenuItem>
            <MenuItem value="wife">Wife</MenuItem>
            <MenuItem value="husband">Husband</MenuItem>
            <MenuItem value="son">Son</MenuItem>
            <MenuItem value="daughter">Daughter</MenuItem>
            <MenuItem value="father">Father</MenuItem>
            <MenuItem value="mother">Mother</MenuItem>
            <MenuItem value="brother">Brother</MenuItem>
            <MenuItem value="sister">Sister</MenuItem>
            <MenuItem value="son in law">Son in law</MenuItem>
            <MenuItem value="daughter in law">Daughter in law</MenuItem>
            <MenuItem value="grandson">Grandson</MenuItem>
            <MenuItem value="granddaughter">Granddaughter</MenuItem>
          </Select>
        </FormControl>
      </Grid> */}
      <Grid item xs={12} sm={6}>
        <FormControl fullWidth>
  <InputLabel>Relation *</InputLabel>
  <Select
    value={newPersonData.relation}
    onChange={(e) => {
      if (e.target.value === 'add-new') {
        const newRelation = prompt('Enter new relation:');
        if (newRelation && newRelation.trim()) {
          const trimmedRelation = newRelation.trim().toLowerCase();
          
          if (!relations.some(r => r.toLowerCase() === trimmedRelation)) {
            setRelations(prev => sortRelationsWithHeadFirst([...prev, trimmedRelation]));
            setNewPersonData({ ...newPersonData, relation: trimmedRelation });
            showSnackbar(`New relation "${trimmedRelation}" added successfully`, 'success');
          } else {
            setNewPersonData({ ...newPersonData, relation: trimmedRelation });
            showSnackbar('Relation already exists', 'warning');
          }
        }
      } else {
        setNewPersonData({ ...newPersonData, relation: e.target.value });
      }
    }}
    label="Relation *"
  >
    {relations.map((relation) => (
      <MenuItem key={relation} value={relation}>
        {relation.charAt(0).toLowerCase() + relation.slice(1)}
      </MenuItem>
    ))}
    <MenuItem value="add-new" sx={{ fontStyle: 'italic', color: 'primary.main' }}>
      + Add New Relation
    </MenuItem>
  </Select>
</FormControl>
      </Grid>
      <Grid item xs={12} sm={6}>
        <FormControl fullWidth>
          <InputLabel>Gender *</InputLabel>
          <Select
            value={newPersonData.gender}
            onChange={(e) => setNewPersonData({ ...newPersonData, gender: e.target.value })}
            label="Gender *"
          >
            <MenuItem value="male">Male</MenuItem>
            <MenuItem value="female">Female</MenuItem>
            <MenuItem value="other">Other</MenuItem>
          </Select>
        </FormControl>
      </Grid>
      <Grid item xs={12} sm={6}>
        <TextField
          fullWidth
          label="Date of Birth *"
          type="date"
          value={newPersonData.dob}
          onChange={(e) => setNewPersonData({ ...newPersonData, dob: e.target.value })}
          InputLabelProps={{ shrink: true }}
        />
      </Grid>
      <Grid item xs={12} sm={6}>
        <TextField
          fullWidth
          label="Occupation"
          value={newPersonData.occupation}
          onChange={(e) => setNewPersonData({ ...newPersonData, occupation: e.target.value })}
        />
      </Grid>
      <Grid item xs={12} sm={6}>
        <TextField
          fullWidth
          label="Education"
          value={newPersonData.education}
          onChange={(e) => setNewPersonData({ ...newPersonData, education: e.target.value })}
        />
      </Grid>
      <Grid item xs={12} sm={6}>
        <TextField
          fullWidth
          label="Phone"
          value={newPersonData.phone}
          onChange={(e) => setNewPersonData({ ...newPersonData, phone: e.target.value })}
        />
      </Grid>
      <Grid item xs={12}>
        <TextField
          fullWidth
          label="Email"
          type="email"
          value={newPersonData.email}
          onChange={(e) => setNewPersonData({ ...newPersonData, email: e.target.value })}
        />
      </Grid>
    </Grid>
  </DialogContent>
  <DialogActions>
    <Button onClick={() => setOpenAddPersonDialog(false)}>Cancel</Button>
    <Button
      variant="contained"
      onClick={handleAddPerson}
      disabled={!newPersonData.name || !newPersonData.baptismName || !newPersonData.relation || 
               !newPersonData.gender || !newPersonData.dob}
    >
      Add Person
    </Button>
  </DialogActions>
</Dialog>

{/* // Edit Family Dialog */}
<Dialog
  open={openEditFamilyDialog}
  onClose={() => setOpenEditFamilyDialog(false)}
  maxWidth="sm"
  fullWidth
>
  <DialogTitle>Edit Family Details</DialogTitle>
  <DialogContent>
    <Stack spacing={2} sx={{ mt: 2 }}>
      {/* <TextField
        fullWidth
        label="Family Name"
        value={selectedFamily?.name || ''}
        disabled
        helperText="Family name cannot be changed"
      /> */}
      <TextField
        fullWidth
        label="Family Name *"
        value={editFamilyData.name}
        onChange={(e) => setEditFamilyData({ ...editFamilyData, name: e.target.value })}
        helperText="Enter the family/house name"
      />
      <TextField
        fullWidth
        label="Building/House Name *"
        value={editFamilyData.building}
        onChange={(e) => setEditFamilyData({ ...editFamilyData, building: e.target.value })}
      />
      <TextField
        fullWidth
        label="Phone *"
        value={editFamilyData.phone}
        onChange={(e) => setEditFamilyData({ ...editFamilyData, phone: e.target.value })}
      />
      <TextField
        fullWidth
        label="Pincode"
        value={editFamilyData.pincode}
        onChange={(e) => setEditFamilyData({ ...editFamilyData, pincode: e.target.value })}
      />
      {/* <TextField
        fullWidth
        label="Street"
        hidden
        value={editFamilyData.street}
        onChange={(e) => setEditFamilyData({ ...editFamilyData, street: e.target.value })}
      />
      <TextField
        fullWidth
        label="City" 
        hidden
        value={editFamilyData.city}
        onChange={(e) => setEditFamilyData({ ...editFamilyData, city: e.target.value })}
      />
      <TextField
        fullWidth
        label="District" 
        hidden
        value={editFamilyData.district}
        onChange={(e) => setEditFamilyData({ ...editFamilyData, district: e.target.value })}
      /> */}
    </Stack>
  </DialogContent>
  <DialogActions>
    <Button onClick={() => setOpenEditFamilyDialog(false)}>Cancel</Button>
    <Button
      variant="contained"
      onClick={handleEditFamily}
      disabled={!editFamilyData.building || !editFamilyData.phone}
    >
      Update Family
    </Button>
  </DialogActions>
</Dialog>
{/* New Head Selection Dialog */}
<Dialog
  open={newHeadDialogOpen}
  onClose={() => !isUpdatingStatus && setNewHeadDialogOpen(false)} // Prevent closing during update
  maxWidth="sm"
  fullWidth
>
  <DialogTitle>Select New Family Head</DialogTitle>
  <DialogContent>
    <Typography color="warning.main" sx={{ mb: 2 }}>
      Current head is being marked as {statusDetails.status}. 
      Please select a new head for the family.
    </Typography>
    <FormControl fullWidth>
      <InputLabel>New Head</InputLabel>
      <Select
        value={selectedNewHead}
        onChange={(e) => setSelectedNewHead(e.target.value)}
        label="New Head"
        disabled={isUpdatingStatus} // Disable during update
      >
        {eligibleMembers.map((member) => (
          <MenuItem key={member._id} value={member}>
            {member.name} ({member.relation})
          </MenuItem>
        ))}
      </Select>
    </FormControl>
    
    {/* Loading indicator for new head dialog */}
    {isUpdatingStatus && (
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mt: 2 }}>
        <CircularProgress size={20} />
        <Typography variant="body2" color="text.secondary">
          Updating head assignment and processing transactions...
        </Typography>
      </Box>
    )}
  </DialogContent>
  <DialogActions>
    <Button 
      onClick={() => setNewHeadDialogOpen(false)}
      disabled={isUpdatingStatus} // Disable during update
    >
      Cancel
    </Button>
    <Button
      variant="contained"
      onClick={async () => {
        if (!isUpdatingStatus) {
          setIsUpdatingStatus(true);
          try {
            await updatePersonAndTransactions(selectedNewHead);
          } finally {
            setIsUpdatingStatus(false);
          }
        }
      }}
      disabled={!selectedNewHead || isUpdatingStatus}
      startIcon={isUpdatingStatus ? <CircularProgress size={16} /> : null}
    >
      {isUpdatingStatus ? 'Processing...' : 'Confirm New Head'}
    </Button>
  </DialogActions>
</Dialog>
{/* <Dialog
    open={showStatusHistoryDialog}
    onClose={() => setShowStatusHistoryDialog(false)}
    maxWidth="xl"
    fullWidth
  >
    <DialogTitle>
      <Stack direction="row" justifyContent="space-between" alignItems="center">
        <Typography variant="h6">Moved Out & Deceased Members History</Typography>
        <Stack direction="row" spacing={1}>
          <IconButton onClick={fetchStatusHistory}>
            <RefreshIcon />
          </IconButton>
          <IconButton
            onClick={() => {
              const exportData = statusHistoryData.map(person => ({
                'Name': person.name,
                'Baptism Name': person.baptismName,
                'Last Relation': person.relation,
                'Status': person.status === 'deceased' ? 'Deceased' : 'Moved Out',
                'Date': new Date(person.moveOutDate).toLocaleDateString(),
                'Remarks': person.narration || ''
              }));
              
              const csvContent = "data:text/csv;charset=utf-8," 
                + Object.keys(exportData[0]).join(",") + "\n"
                + exportData.map(row => Object.values(row).join(",")).join("\n");
                
              const encodedUri = encodeURI(csvContent);
              const link = document.createElement("a");
              link.setAttribute("href", encodedUri);
              link.setAttribute("download", "status_history.csv");
              document.body.appendChild(link);
              link.click();
            }}
          >
            <FileDownloadIcon />
          </IconButton>
        </Stack>
      </Stack>
    </DialogTitle>
    <DialogContent>
      <Tabs
        value={activeStatusTab}
        onChange={(e, newValue) => setActiveStatusTab(newValue)}
        sx={{ mb: 2 }}
      >
        <Tab label="Moved Out" value="moved_out" />
        <Tab label="Deceased" value="deceased" />
      </Tabs>

      <MaterialReactTable
        columns={statusHistoryColumns}
        data={statusHistoryData.filter(person => person.status === activeStatusTab)}
        enableColumnResizing
        enablePagination={true}
        enableColumnFilters={true}
        enableGlobalFilter={true}
        initialState={{
          pagination: { pageSize: 10 },
          sorting: [{ id: 'moveOutDate', desc: true }],
          density: 'compact'
        }}
        renderTopToolbarCustomActions={() => (
          <Typography color="text.secondary" variant="body2">
            {`Showing ${activeStatusTab === 'deceased' ? 'deceased' : 'moved out'} members`}
          </Typography>
        )}
      />
    </DialogContent>
    <DialogActions>
      <Button onClick={() => setShowStatusHistoryDialog(false)}>Close</Button>
    </DialogActions>
  </Dialog> */}
<Dialog
  open={showStatusHistoryDialog}
  onClose={() => setShowStatusHistoryDialog(false)}
  maxWidth="xl"
  fullWidth
>
  <DialogTitle>
    <Stack direction="row" justifyContent="space-between" alignItems="center">
      <Typography variant="h6">
        Status History & Rollback Management
      </Typography>
      <Stack direction="row" spacing={1}>
        <Chip 
          icon={<WarningIcon />}
          label="Rollback Available Anytime" 
          color="success" 
          variant="outlined"
        />
        <IconButton onClick={fetchStatusHistory}>
          <RefreshIcon />
        </IconButton>
        <IconButton
          onClick={() => {
            const exportData = statusHistoryData.map(person => ({
              'Name': person.name,
              'Baptism Name': person.baptismName,
              'Last Relation': person.relation,
              'Status': person.status === 'deceased' ? 'Deceased' : 'Moved Out',
              'Date': new Date(person.moveOutDate).toLocaleDateString(),
              'Remarks': person.narration || ''
            }));
            
            const csvContent = "data:text/csv;charset=utf-8," 
              + Object.keys(exportData[0]).join(",") + "\n"
              + exportData.map(row => Object.values(row).join(",")).join("\n");
              
            const encodedUri = encodeURI(csvContent);
            const link = document.createElement("a");
            link.setAttribute("href", encodedUri);
            link.setAttribute("download", "enhanced_status_history.csv");
            document.body.appendChild(link);
            link.click();
          }}
        >
          <FileDownloadIcon />
        </IconButton>
      </Stack>
    </Stack>
  </DialogTitle>
  <DialogContent>
    {/* Enhanced Information Panel */}
    <Paper elevation={2} sx={{ p: 2, mb: 2, bgcolor: 'info.lighter' }}>
      <Typography variant="h6" gutterBottom color="info.darker">
         Rollback Features
      </Typography>
      <Grid container spacing={2}>
        <Grid item xs={12} md={4}>
          <Typography variant="body2" color="info.darker">
            ✅ <strong>Anytime Rollback:</strong> Restore members at any time, no time limits
          </Typography>
        </Grid>
        {/* <Grid item xs={12} md={4}>
          <Typography variant="body2" color="info.darker">
            ✅ <strong>Smart Head Management:</strong> Automatically handle head role conflicts
          </Typography>
        </Grid> */}
        <Grid item xs={12} md={4}>
          <Typography variant="body2" color="info.darker">
            ✅ <strong>Transaction Recovery:</strong> Restore transferred transaction amounts
          </Typography>
        </Grid>
      </Grid>
    </Paper>

    <Tabs
      value={activeStatusTab}
      onChange={(e, newValue) => setActiveStatusTab(newValue)}
      sx={{ mb: 2 }}
    >
      <Tab 
        label={`Moved Out (${statusHistoryData.filter(p => p.status === 'moved_out').length})`} 
        value="moved_out" 
      />
      <Tab 
        label={`Deceased (${statusHistoryData.filter(p => p.status === 'deceased').length})`} 
        value="deceased" 
      />
    </Tabs>

    <MaterialReactTable
      columns={enhancedStatusHistoryColumns}
      data={statusHistoryData.filter(person => person.status === activeStatusTab)}
      enableColumnResizing
      enablePagination={true}
      enableColumnFilters={true}
      enableGlobalFilter={true}
      initialState={{
        pagination: { pageSize: 10 },
        sorting: [{ id: 'moveOutDate', desc: true }],
        density: 'compact'
      }}
      renderTopToolbarCustomActions={() => (
        <Stack direction="row" spacing={2} alignItems="center">
          <Typography color="text.secondary" variant="body2">
            {`Showing ${activeStatusTab === 'deceased' ? 'deceased' : 'moved out'} members`}
          </Typography>
          <Chip 
            label={`${statusHistoryData.filter(person => person.status === activeStatusTab).length} Total`}
            color="primary"
            size="small"
          />
        </Stack>
      )}
    />
  </DialogContent>
  <DialogActions>
    <Button onClick={() => setShowStatusHistoryDialog(false)}>Close</Button>
    <Button 
      variant="contained" 
      onClick={fetchStatusHistory}
      startIcon={<RefreshIcon />}
    >
      Refresh Data
    </Button>
  </DialogActions>
  </Dialog>

{/* New Head Selection Dialog */}
<Dialog
  open={newHeadDialogOpen}
  onClose={() => setNewHeadDialogOpen(false)}
  maxWidth="sm"
  fullWidth
>
  <DialogTitle>Select New Family Head</DialogTitle>
  <DialogContent>
    <Typography color="warning.main" sx={{ mb: 2 }}>
      Current head is being marked as {statusDetails.status}. 
      Please select a new head for the family.
    </Typography>
    <FormControl fullWidth>
      <InputLabel>New Head</InputLabel>
      <Select
        value={selectedNewHead}
        onChange={(e) => setSelectedNewHead(e.target.value)}
        label="New Head"
      >
        {eligibleMembers.map((member) => (
          <MenuItem key={member._id} value={member}>
            {member.name} ({member.relation})
          </MenuItem>
        ))}
      </Select>
    </FormControl>
  </DialogContent>
  <DialogActions>
    <Button onClick={() => setNewHeadDialogOpen(false)}>Cancel</Button>
    <Button
      variant="contained"
      onClick={() => updatePersonAndTransactions(selectedNewHead)}
      disabled={!selectedNewHead}
    >
      Confirm New Head
    </Button>
  </DialogActions>
</Dialog>

{/*  Undo/Rollback Dialog */}
<Dialog
  open={showUndoDialog}
  onClose={() => setShowUndoDialog(false)}
>
  <DialogTitle>Undo Status Change?</DialogTitle>
  <DialogContent>
    <Typography>
      This will revert all changes including transaction transfers.
      Are you sure you want to proceed?
    </Typography>
  </DialogContent>
  <DialogActions>
    <Button onClick={() => setShowUndoDialog(false)}>Cancel</Button>
    <Button
      variant="contained"
      color="warning"
      onClick={handleUndoStatusChange}
    >
      Undo Changes
    </Button>
  </DialogActions>
</Dialog> 
    <Dialog
  open={showPersonMovementsDialog}
  onClose={() => setShowPersonMovementsDialog(false)}
  maxWidth="xl"
  fullWidth
>
  <DialogTitle>
    <Stack direction="row" justifyContent="space-between" alignItems="center">
      <Typography variant="h6">Person Movement History</Typography>
      <IconButton onClick={fetchPersonMovements}>
        <RefreshIcon />
      </IconButton>
    </Stack>
  </DialogTitle>
  <DialogContent>
    <MaterialReactTable
      columns={personMovementColumns}
      data={personMovements}
      enableColumnResizing
      enablePagination={true}
      enableColumnFilters={true}
      enableGlobalFilter={true}
      initialState={{
        pagination: { pageSize: 10 },
        sorting: [{ id: 'movedDate', desc: true }],
        density: 'compact'
      }}
      renderTopToolbarCustomActions={() => (
        <Button
          variant="contained"
          startIcon={<FileDownloadIcon />}
          onClick={() => {
            // Export functionality
            const exportData = personMovements.map(m => ({
              'Person Name': m.personName,
              'From Family': m.sourceFamilyName,
              'To Family': m.destinationFamilyName,
              'Old Relation': m.oldRelation,
              'New Relation': m.newRelation,
              'Status': m.status,
              'Remarks': m.remarks,
              'Moved Date': new Date(m.movedDate).toLocaleString()
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
        </Button>
      )}
    />
  </DialogContent>
  <DialogActions>
    <Button onClick={() => setShowPersonMovementsDialog(false)}>Close</Button>
  </DialogActions>
</Dialog>
   {/* Move Person Dialog */}
   
<Dialog
  open={openMovePersonDialog}
  onClose={() => setOpenMovePersonDialog(false)}
  maxWidth="sm"
  fullWidth
>
  <DialogTitle>Move Person to Another Family</DialogTitle>
  <DialogContent>
    <Stack spacing={2} sx={{ mt: 2 }}>
      <Typography variant="body1">
        Moving: {selectedPerson?.name}
        {selectedPerson?.relation === 'head' && (
          <Typography color="warning.main" variant="body2">
           {/* Warning: Moving a family head will require moving all other members first */}
          </Typography>
        )}
      </Typography>
      
      {/* Destination Parish Selection */}
      <FormControl fullWidth>
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
      </FormControl>

      {/* Destination Koottayma Selection */}
      <FormControl fullWidth>
        <InputLabel>Destination Koottayma</InputLabel>
        <Select
          value={destinationKoottaymaForPerson || ''}
          onChange={(e) => {
            setDestinationKoottaymaForPerson(e.target.value);
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
      </FormControl>

      {/* Destination Family Selection */}
      <Autocomplete
        options={dfamilies}
        getOptionLabel={(option) => `${option.name} (${option.headName})`}
        value={destinationFamily}
        onChange={(event, newValue) => {
         
          setDestinationFamily(newValue);
        }}
        renderInput={(params) => (
          <TextField
            {...params}
            label="Select Destination Family"
            error={!destinationFamily && dfamilies.length === 0}
            helperText={!destinationFamily && dfamilies.length === 0 ? "No families found" : ""}
          />
        )}
        disabled={!destinationParishForPerson || !destinationKoottaymaForPerson}
        isOptionEqualToValue={(option, value) => option.id === value?.id}
      />

      {/* New Relation Selection
      <FormControl fullWidth>
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
          <MenuItem value="husband">Husband</MenuItem>
          <MenuItem value="father">Father</MenuItem>
          <MenuItem value="mother">Mother</MenuItem>
          <MenuItem value="brother">Brother</MenuItem>
          <MenuItem value="sister">Sister</MenuItem>
          <MenuItem value="son in law">Son in law</MenuItem>
          <MenuItem value="daughter in law">Daughter in law</MenuItem>
          <MenuItem value="grandson">Grandson</MenuItem>
          <MenuItem value="granddaughter">Granddaughter</MenuItem>


        </Select>
      </FormControl> */}
      <FormControl fullWidth>
  <InputLabel>New Relation</InputLabel>
  <Select
    value={newRelation}
    onChange={(e) => {
      if (e.target.value === 'add-new') {
        const newRelationValue = prompt('Enter new relation:');
        if (newRelationValue && newRelationValue.trim()) {
          const trimmedRelation = newRelationValue.trim().toLowerCase();
          
          if (!relations.some(r => r.toLowerCase() === trimmedRelation)) {
            setRelations(prev => sortRelationsWithHeadFirst([...prev, trimmedRelation]));
            setNewRelation(trimmedRelation);
            showSnackbar(`New relation "${trimmedRelation}" added successfully`, 'success');
          } else {
            setNewRelation(trimmedRelation);
            showSnackbar('Relation already exists', 'warning');
          }
        }
      } else {
        setNewRelation(e.target.value);
      }
    }}
    label="New Relation"
  >
    {relations.map((relation) => (
      <MenuItem key={relation} value={relation}>
        {relation.charAt(0).toLowerCase() + relation.slice(1)}
      </MenuItem>
    ))}
    <MenuItem value="add-new" sx={{ fontStyle: 'italic', color: 'primary.main' }}>
      + Add New Relation
    </MenuItem>
  </Select>
</FormControl>

      {/* Remarks Field */}
      <TextField
        fullWidth
        label="Remarks"
        multiline
        rows={2}
        value={remarks}
        onChange={(e) => setRemarks(e.target.value)}
      />
    </Stack>
  </DialogContent>
  <DialogActions>
    <Button onClick={() => setOpenMovePersonDialog(false)}>Cancel</Button>
    <Button
      onClick={handleMovePerson}
      variant="contained"
      disabled={!destinationFamily || !newRelation ||
               !destinationParishForPerson || !destinationKoottaymaForPerson}
    >
      Move Person
    </Button>
  </DialogActions>
</Dialog>
<Dialog
      open={showTransactionDialog}
      onClose={() => setShowTransactionDialog(false)}
      maxWidth="lg"
      fullWidth
    >
      <DialogTitle>
        <Stack direction="row" justifyContent="space-between" alignItems="center">
          <Typography variant="h6">
            Transaction History - {transactionPerson?.name}
          </Typography>
          <Stack direction="row" spacing={1}>
            <Button
              variant="outlined"
              startIcon={<AddIcon />}
              onClick={() => setAddingNewTransaction(true)}
              size="small"
            >
              Add Transaction
            </Button>
            <IconButton
              onClick={() => fetchPersonTransactions(transactionPerson?.id, transactionPerson?.name)}
            >
              <RefreshIcon />
            </IconButton>
          </Stack>
        </Stack>
      </DialogTitle>
      <DialogContent>
        {/* Add New Transaction Section */}
        {addingNewTransaction && (
          <Paper elevation={2} sx={{ p: 2, mb: 2, bgcolor: 'grey.50' }}>
            <Typography variant="subtitle1" gutterBottom>
              Add New Transaction
            </Typography>
            <Grid container spacing={2} alignItems="center">
              <Grid item xs={12} sm={3}>
                <TextField
                  fullWidth
                  label="Year"
                  type="number"
                  value={newTransactionData.year}
                  onChange={(e) => setNewTransactionData({
                    ...newTransactionData,
                    year: parseInt(e.target.value)
                  })}
                  size="small"
                />
              </Grid>
              <Grid item xs={12} sm={3}>
                <TextField
                  fullWidth
                  label="Amount"
                  type="number"
                  value={newTransactionData.amount}
                  onChange={(e) => setNewTransactionData({
                    ...newTransactionData,
                    amount: e.target.value
                  })}
                  size="small"
                  InputProps={{
                    startAdornment: <InputAdornment position="start">₹</InputAdornment>
                  }}
                />
              </Grid>
              <Grid item xs={12} sm={3}>
                <TextField
                  fullWidth
                  label="Date"
                  type="date"
                  value={newTransactionData.date}
                  onChange={(e) => setNewTransactionData({
                    ...newTransactionData,
                    date: e.target.value
                  })}
                  size="small"
                  InputLabelProps={{ shrink: true }}
                />
              </Grid>
              <Grid item xs={12} sm={3}>
                <Stack direction="row" spacing={1}>
                  <Button
                    variant="contained"
                    onClick={addNewTransaction}
                    size="small"
                    startIcon={<SaveIcon />}
                  >
                    Save
                  </Button>
                  <Button
                    variant="outlined"
                    onClick={() => {
                      setAddingNewTransaction(false);
                      setNewTransactionData({
                        year: currentYear,
                        amount: '',
                        date: new Date().toISOString().split('T')[0]
                      });
                    }}
                    size="small"
                  >
                    Cancel
                  </Button>
                </Stack>
              </Grid>
            </Grid>
          </Paper>
        )}

        {/* Transactions Table */}
        <TableContainer component={Paper} elevation={1}>
          <Table size="small">
            <TableHead>
              <TableRow sx={{ bgcolor: 'primary.main' }}>
                <TableCell sx={{ color: 'white', fontWeight: 'bold' }}>Year</TableCell>
                <TableCell sx={{ color: 'white', fontWeight: 'bold' }}>Amount (₹)</TableCell>
                <TableCell sx={{ color: 'white', fontWeight: 'bold' }}>Date</TableCell>
                <TableCell sx={{ color: 'white', fontWeight: 'bold' }}>Status</TableCell>
                <TableCell sx={{ color: 'white', fontWeight: 'bold' }}>Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {selectedPersonTransactions.map((transaction) => {
                const transactionYear = getTransactionYear(transaction.date);
                //const transactionYear = new Date(transaction.date).getFullYear();
                const isEditing = editingTransactionId === transaction._id;
                
                return (
                  <TableRow 
                    key={transaction._id}
                    sx={{ 
                      '&:nth-of-type(odd)': { bgcolor: 'action.hover' },
                      '&:hover': { bgcolor: 'action.selected' }
                    }}
                  >
                    <TableCell>
                      <Chip 
                        label={transactionYear}
                        color={transactionYear === currentYear ? 'primary' : 'default'}
                        variant={transactionYear === currentYear ? 'filled' : 'outlined'}
                        size="small"
                      />
                    </TableCell>
                    <TableCell>
                      {isEditing ? (
                        <TextField
                          type="number"
                          value={editingAmount}
                          onChange={(e) => setEditingAmount(e.target.value)}
                          size="small"
                          autoFocus
                          InputProps={{
                            startAdornment: <InputAdornment position="start">₹</InputAdornment>
                          }}
                          sx={{ width: 120 }}
                        />
                      ) : (
                        <Typography fontWeight="medium">
                          ₹{transaction.amountPaid?.toFixed(0) || '0'}
                        </Typography>
                      )}
                    </TableCell>
                    <TableCell>
                      {transaction.date}
                    </TableCell>
                    <TableCell>
                      <Chip 
                        label={transaction.status}
                        color={transaction.status === 'active' ? 'success' : 'default'}
                        size="small"
                      />
                    </TableCell>
                    <TableCell>
                      <Stack direction="row" spacing={0.5}>
                        {isEditing ? (
                          <>
                            <Tooltip title="Save">
                              <IconButton
                                size="small"
                                color="primary"
                                onClick={() => updateTransactionAmount(transaction._id, editingAmount)}
                              >
                                <SaveIcon fontSize="small" />
                              </IconButton>
                            </Tooltip>
                            <Tooltip title="Cancel">
                              <IconButton
                                size="small"
                                onClick={() => {
                                  setEditingTransactionId(null);
                                  setEditingAmount('');
                                }}
                              >
                                <CancelIcon fontSize="small" />
                              </IconButton>
                            </Tooltip>
                          </>
                        ) : (
                          <>
                            <Tooltip title="Edit Amount">
                              <IconButton
                                size="small"
                                onClick={() => {
                                  setEditingTransactionId(transaction._id);
                                  setEditingAmount(transaction.amountPaid?.toString() || '0');
                                }}
                              >
                                <EditIcon fontSize="small" />
                              </IconButton>
                            </Tooltip>
                            <Tooltip title="Delete Transaction">
                              <IconButton
                                size="small"
                                color="error"
                                onClick={() => {
                                  if (window.confirm('Are you sure you want to delete this transaction?')) {
                                    deleteTransaction(transaction._id);
                                  }
                                }}
                              >
                                <DeleteIcon fontSize="small" />
                              </IconButton>
                            </Tooltip>
                          </>
                        )}
                      </Stack>
                    </TableCell>
                  </TableRow>
                );
              })}
              {selectedPersonTransactions.length === 0 && (
                <TableRow>
                  <TableCell colSpan={5} align="center" sx={{ py: 3 }}>
                    <Typography color="text.secondary">
                      No transactions found for this person
                    </Typography>
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </TableContainer>

        {/* Transaction Summary */}
        {selectedPersonTransactions.length > 0 && (
          <Paper elevation={1} sx={{ mt: 2, p: 2, bgcolor: 'grey.50' }}>
            <Typography variant="subtitle1" gutterBottom>
              Transaction Summary
            </Typography>
            <Grid container spacing={2}>
              <Grid item xs={6} sm={3}>
                <Typography variant="body2" color="text.secondary">
                  Total Transactions
                </Typography>
                <Typography variant="h6">
                  {selectedPersonTransactions.length}
                </Typography>
              </Grid>
              <Grid item xs={6} sm={3}>
                <Typography variant="body2" color="text.secondary">
                  Total Amount
                </Typography>
                <Typography variant="h6" color="primary">
                  ₹{selectedPersonTransactions.reduce((sum, t) => sum + (t.amountPaid || 0), 0).toFixed(0)}
                </Typography>
              </Grid>
              <Grid item xs={6} sm={3}>
                <Typography variant="body2" color="text.secondary">
                  Current Year ({currentYear})
                </Typography>
                <Typography variant="h6" color="secondary">
                {(() => {
                
                  
                  // Debug each transaction
                  selectedPersonTransactions.forEach((t, index) => {
                    const transactionYear = getYearFromDateString(t.date);
                    const matches = transactionYear === currentYear;
              
                  });
                  
                  const currentYearTransactions = selectedPersonTransactions.filter(t => {
                    const transactionYear = getYearFromDateString(t.date);
                    return transactionYear === currentYear;
                  });
                  
                  const amount = currentYearTransactions.reduce((sum, t) => sum + (t.amountPaid || 0), 0);
                  
               
                  
                  return `₹${amount.toFixed(0)}`;
                })()}
                </Typography>
              </Grid>
              <Grid item xs={6} sm={3}>
                <Typography variant="body2" color="text.secondary">
                  Years Active
                </Typography>
                <Typography variant="h6">
                  {new Set(selectedPersonTransactions.map(t => new Date(t.date).getFullYear())).size}
                </Typography>
              </Grid>
            </Grid>
          </Paper>
        )}
      </DialogContent>
      <DialogActions>
        <Button onClick={() => setShowTransactionDialog(false)}>Close</Button>
        {/* <Button
          variant="contained"
          startIcon={<FileDownloadIcon />}
          onClick={() => {
            const exportData = selectedPersonTransactions.map(t => ({
              'Person': transactionPerson?.name,
              'Year': new Date(t.date).getFullYear(),
              'Amount': t.amountPaid || 0,
              'Date': new Date(t.date).toLocaleDateString('en-GB'),
              'Status': t.status
            }));
            
            const csvContent = "data:text/csv;charset=utf-8," 
              + Object.keys(exportData[0]).join(",") + "\n"
              + exportData.map(row => Object.values(row).join(",")).join("\n");
              
            const encodedUri = encodeURI(csvContent);
            const link = document.createElement("a");
            link.setAttribute("href", encodedUri);
            link.setAttribute("download", `${transactionPerson?.name}_transactions.csv`);
            document.body.appendChild(link);
            link.click();
          }}
        >
          Export CSV
        </Button> */}
      </DialogActions>
    </Dialog>
   <StyledCard
  elevation={1} 
  sx={{ 
    borderRadius: 3, 
    pb: 1,       
    pt: 1,       
    px: 1,       
    m: 0        
  }}
>
      <CardContent >
        {/* Title Section */}
        <Typography variant="h5" gutterBottom>
          Family Management
        </Typography>

        <Grid container spacing={3}>
          {/* Selection Section */}
          <Grid item xs={12} md={3}>
          <StyledFormControl>
               
                <Select1
                  value={selectedParish ? { value: selectedParish, label: parishes.find(p => p._id === selectedParish)?.name } : null}
                  onChange={(selectedOption) => setSelectedParish(selectedOption?.value || '')}
                  options={parishes.map(parish => ({ value: parish._id, label: parish.name }))}
                  placeholder="Select Church..."
                  noOptionsMessage={() => "No churches found"}
                  isClearable
                  isSearchable
                />
              </StyledFormControl>

              <StyledFormControl>
              
               <Select1
                value={selectedKoottayma ? { 
                  value: selectedKoottayma, 
                  label: koottaymas.find(k => k.koottaymaId === selectedKoottayma)?.name 
                } : null}
                onChange={(selectedOption) => setSelectedKoottayma(selectedOption?.value || '')}
                options={koottaymas.map(koottayma => ({ 
                  value: koottayma.koottaymaId, 
                  label: koottayma.name 
                }))}
                placeholder="Select Kootayma..."
                noOptionsMessage={() => "No kootaymas found"}
                isClearable
                isSearchable
                isDisabled={!selectedParish}
                isLoading={isKoottaymaLoading} // Add this line
                loadingMessage={() => "Loading koottaymas..."} // Add this line
              />
              </StyledFormControl>
            {selectedFamily && (
  <FamilyDetailsCard 
    selectedFamily={selectedFamily} 
    transactions={transactions} 
  />
)}
          </Grid>

         

          {/* Search Section */}
          <Grid item xs={12} md={9}>
         
<Paper
  sx={{
    p: 2,
    backgroundColor: '#fff',
    borderRadius: '12px',
    boxShadow: '0px 4px 12px rgba(0, 0, 0, 0.1)',
    border: '1px solid #e0e0e0',
  }}
>
  <Stack direction="column" spacing={3}>
    {/* Search by Family Number Section */}
    <Paper 
      elevation={2} 
      sx={{ 
        p: 2, 
        backgroundColor: '#f8f9fa', 
        borderRadius: '8px',
        border: '1px solid #e3f2fd'
      }}
    >
      <Typography variant="subtitle1" gutterBottom sx={{ fontWeight: 'bold', color: '#1976d2' }}>
        Search Family by Old Number (Select Parish First)
      </Typography>
      <Stack direction="row" spacing={2} alignItems="center">
        <TextField
          label="Enter Family Old Number"
          value={searchFamilyNumber}
          onChange={(e) => setSearchFamilyNumber(e.target.value)}
          onKeyPress={handleSearchKeyPress}
          variant="outlined"
          disabled={searchLoading}
          size="small"
          sx={{
            minWidth: '200px',
            '& .MuiOutlinedInput-root': {
              borderRadius: '8px',
              '& fieldset': {
                borderColor: '#1976d2',
              },
              '&:hover fieldset': {
                borderColor: '#1565c0',
              },
              '&.Mui-focused fieldset': {
                borderColor: '#1976d2',
                borderWidth: '2px',
              },
            },
          }}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <SearchIcon color="primary" />
              </InputAdornment>
            ),
          }}
        />
        <Button
          variant="contained"
          onClick={searchFamilyByNumber}
          disabled={searchLoading || !searchFamilyNumber.trim() || !selectedParish}
          startIcon={searchLoading ? <CircularProgress size={16} /> : <SearchIcon />}
          sx={{
            borderRadius: '8px',
            textTransform: 'none',
            fontWeight: 'bold',
            px: 3,
            py: 1,
          }}
        >
          {searchLoading ? 'Searching...' : 'Search'}
        </Button>
        {searchFamilyNumber && (
          <Button
            variant="outlined"
            onClick={() => {
              setSearchFamilyNumber('');
              setSelectedFamily(null);
              setPersons([]);
              setTransactions([]);
              setSelectedRowId(null);
            }}
            sx={{
              borderRadius: '8px',
              textTransform: 'none',
            }}
          >
            Clear
          </Button>
        )}
      </Stack>
    </Paper>

    {/* Existing Radio Group and Family Info Section */}
    <Stack direction="row" spacing={3} alignItems="center">
      <RadioGroup
        row
        value={currentView}
        onChange={(e) => setCurrentView(e.target.value)}
        sx={{
          '& .MuiFormControlLabel-root': {
            marginRight: '24px',
            '& .MuiTypography-root': {
              fontWeight: 'bold',
              color: '#333',
            },
          },
        }}
      >
        <FormControlLabel
          value="currentKootayma"
          control={
            <Radio
              sx={{
                color: '#1976d2',
                '&.Mui-checked': {
                  color: '#1976d2',
                },
                '& .MuiSvgIcon-root': {
                  fontSize: '24px',
                },
              }}
            />
          }
          label={<Typography variant="subtitle1">Current Kootayma</Typography>}
        />
        <FormControlLabel
          value="allKootayma"
          control={
            <Radio
              sx={{
                color: '#1976d2',
                '&.Mui-checked': {
                  color: '#1976d2',
                },
                '& .MuiSvgIcon-root': {
                  fontSize: '24px',
                },
              }}
            />
          }
          label={<Typography variant="subtitle1">All Kootayma</Typography>}
        />
      </RadioGroup>
      
       {selectedFamily && (
        <>
          <Stack direction="row" spacing={2} alignItems="center">
            <Paper 
              elevation={1} 
              sx={{ 
                p: 2, 
                borderRadius: '8px', 
                backgroundColor: '#f8f9fa',
                border: '1px solid #e3f2fd'
              }}
            >
              <Typography variant="subtitle2" sx={{ color: '#666', fontWeight: 'bold', mb: 0.5 }}>
                Family Number
              </Typography>
              <Typography variant="h6" sx={{ color: '#1976d2', fontWeight: 'bold' }}>
                {oneparishes?.shortCode || ''}---{selectedFamily.id}
              </Typography>
            </Paper>
            
            {/* <IconButton
              sx={{
                backgroundColor: '#1976d2',
                color: '#fff',
                '&:hover': {
                  backgroundColor: '#1565c0',
                },
                '& .MuiSvgIcon-root': {
                  fontSize: '32px',
                },
                padding: '12px',
                borderRadius: '50%',
                boxShadow: '0px 2px 4px rgba(0, 0, 0, 0.2)',
              }}
            >
              <KeyboardDoubleArrowRight />
            </IconButton> */}
            
            <Paper 
              elevation={1} 
              sx={{ 
                p: 2, 
                borderRadius: '8px', 
                backgroundColor: '#f8f9fa',
                border: '1px solid #e3f2fd'
              }}
            >
              <Typography variant="subtitle2" sx={{ color: '#666', fontWeight: 'bold', mb: 0.5 }}>
                Old Number
              </Typography>
              <Typography variant="h6" sx={{ color: '#2e7d32', fontWeight: 'bold' }}>
                {selectedFamily?.familyNumber || 'N/A'}
              </Typography>
            </Paper>
          </Stack>
        </>
      )}
    </Stack>
  </Stack>
</Paper>

         {/* //June 19 */}
          {/* <Paper
  sx={{
    p: 2,
    backgroundColor: '#fff',
    borderRadius: '12px',
    boxShadow: '0px 4px 12px rgba(0, 0, 0, 0.1)',
    border: '1px solid #e0e0e0',
  }}
>
  <Stack direction="row" spacing={3} alignItems="center">
    <RadioGroup
      row
      value={currentView}
      onChange={(e) => setCurrentView(e.target.value)}
      sx={{
        '& .MuiFormControlLabel-root': {
          marginRight: '24px',
          '& .MuiTypography-root': {
            fontWeight: 'bold',
            color: '#333',
          },
        },
      }}
    >
      <FormControlLabel
        value="currentKootayma"
        control={
          <Radio
            sx={{
              color: '#1976d2',
              '&.Mui-checked': {
                color: '#1976d2',
              },
              '& .MuiSvgIcon-root': {
                fontSize: '24px',
              },
            }}
          />
        }
        label={<Typography variant="subtitle1">Current Kootayma</Typography>}
      />
      <FormControlLabel
        value="allKootayma"
        control={
          <Radio
            sx={{
              color: '#1976d2',
              '&.Mui-checked': {
                color: '#1976d2',
              },
              '& .MuiSvgIcon-root': {
                fontSize: '24px',
              },
            }}
          />
        }
        label={<Typography variant="subtitle1">All Kootayma</Typography>}
      />
    </RadioGroup>
    {selectedFamily && (
      <TextField
        label={<Typography variant="subtitle1" sx={{ color: '#333', fontWeight: 'bold' }}>Family Number</Typography>}
        value={selectedFamily.id}
        variant="outlined"
        margin="normal"
        sx={{
          '& .MuiOutlinedInput-root': {
            borderRadius: '8px',
            '& fieldset': {
              borderColor: '#ccc',
            },
            '&:hover fieldset': {
              borderColor: '#aaa',
            },
            '&.Mui-focused fieldset': {
              borderColor: '#1976d2',
              borderWidth: '2px',
            },
          },
        }}
        InputProps={{
          startAdornment: (
            <InputAdornment position="start">
              <Typography variant="subtitle1" sx={{ color: '#555', fontWeight: 'bold' }}>
                {oneparishes.shortCode}
              </Typography>
            </InputAdornment>
          ),
        }}
      />
    )}
    <Stack direction="row" spacing={1} justifyContent="center">
      <IconButton
        sx={{
          backgroundColor: '#1976d2',
          color: '#fff',
          '&:hover': {
            backgroundColor: '#1565c0',
          },
          '& .MuiSvgIcon-root': {
            fontSize: '32px',
          },
          padding: '12px',
          borderRadius: '50%',
          boxShadow: '0px 2px 4px rgba(0, 0, 0, 0.2)',
        }}
      >
        <KeyboardDoubleArrowRight />
      </IconButton>
      <TextField
  label={<Typography variant="subtitle1" sx={{ color: '#333', fontWeight: 'bold' }}>Old Number</Typography>}
  value={selectedFamily?.familyNumber || ''} 
  variant="outlined"
  margin="normal"
  disabled 
  sx={{
    '& .MuiOutlinedInput-root': {
      borderRadius: '8px',
      '& fieldset': {
        borderColor: '#ccc',
      },
      '&:hover fieldset': {
        borderColor: '#aaa',
      },
      '&.Mui-focused fieldset': {
        borderColor: '#1976d2',
        borderWidth: '2px',
      },
      '&.Mui-disabled': {
        backgroundColor: '#f5f5f5', 
      },
    },
    '& .MuiInputBase-input.Mui-disabled': {
      WebkitTextFillColor: '#333',
    },
  }}
  InputProps={{
    readOnly: true, 
  }}
/>
    </Stack>
  </Stack>
</Paper> */}
         
            <ThemeProvider theme={theme}>
            <MaterialReactTable
  columns={familyColumns}
  data={families}
  enableColumnResizing
  enableRowSelection={false}
  enableGlobalFilter={true}
  enableColumnFilters={true}
  enableDensityToggle={false}
  enableFullScreenToggle={false}
  enableHiding={false}
  state={{ 
    isLoading: loading,
    showSkeletons: loading,
  }}
  muiLinearProgressProps={({ isTopToolbar }) => ({
    sx: {
      display: 'none'
    }
  })}
  // Modified row props to include highlighting
  muiTableBodyRowProps={({ row }) => ({
    onClick: () => {
      setSelectedRowId(row.original.id); // Set the selected row ID
      setSelectedFamily(row.original);
      setSelectedKoottayma(row.original.koottayma);
      fetchFamilyDataOptimized(row.original.id);
      // fetchFamilyData(row.original.id);
             
    },
    sx: {
      cursor: 'pointer',
      backgroundColor: row.original.id === selectedRowId 
        ? 'rgba(25, 118, 210, 0.12) !important' // Selected row color
        : row.index % 2 === 0 
          ? 'inherit'
          : 'rgba(25, 118, 210, 0.04)',
      '&:hover': {
        backgroundColor: row.original.id === selectedRowId 
          ? 'rgba(25, 118, 210, 0.18) !important'
          : 'rgba(25, 118, 210, 0.08)',
      },
      // Add a left border to indicate selection
      borderLeft: row.original.id === selectedRowId 
        ? `4px solid ${theme.palette.primary.main}`
        : '4px solid transparent',
      // Add transition for smooth effect
      transition: 'all 0.2s ease-in-out',
    }
  })}
  // Rest of your existing props remain the same
  muiSkeletonProps={{
    animation: "wave",
    sx: {
      height: '45px',
      borderRadius: '4px',
      backgroundColor: 'rgba(0, 0, 0, 0.08)'
    }
  }}
  initialState={{
    showGlobalFilter: true,
    pagination: {
      pageSize: 5,
      pageIndex: 0,
    },
    density: 'compact',
  }}
  muiSearchTextFieldProps={{
    placeholder: 'Search Houses...',
    variant: 'outlined',
    size: 'small',
    sx: {
      minWidth: '300px',
      '& .MuiOutlinedInput-root': {
        borderRadius: '20px',
        '& fieldset': {
          borderColor: theme.palette.primary.main,
        },
        '&:hover fieldset': {
          borderColor: theme.palette.primary.dark,
        },
        '&.Mui-focused fieldset': {
          borderColor: theme.palette.primary.main,
        },
      },
    },
  }}
  muiTableHeadCellProps={{
    sx: {
      backgroundColor: theme.palette.primary.main,
      color: theme.palette.primary.contrastText,
      fontWeight: 'bold',
      borderBottom: `2px solid ${theme.palette.primary.dark}`,
    },
  }}
  sx={{
    '& .MuiTableContainer-root': {
      marginTop: '24px',
      boxShadow: '0px 4px 20px rgba(0, 0, 0, 0.1)',
      borderRadius: '8px',
      overflow: 'hidden',
    },
    '& .MuiTable-root': {
      borderCollapse: 'separate',
      borderSpacing: '0',
    },
    '& .MuiTableCell-root': {
      padding: '12px 16px',
      borderBottom: `1px solid ${theme.palette.divider}`,
    },
    '@keyframes wave': {
      '0%': {
        opacity: 0.6,
      },
      '50%': {
        opacity: 0.8,
      },
      '100%': {
        opacity: 0.6,
      },
    },
  }}
/>
    </ThemeProvider>
          </Grid>

          {/* Selected Family Details Section - Same as before */}
          {selectedFamily && (
  <>
    {/* Actions Section */}
   <Grid item xs={12}>
  <Paper
    elevation={3}
    sx={{
      borderRadius: 3,
      p: 3,
      background: 'linear-gradient(145deg, #f8f8f8 0%, #f2f4f6 100%)',
      boxShadow: '0 12px 24px rgba(0,0,0,0.1)',
    }}
  >
    <Stack
      direction={{ xs: 'column', sm: 'row' }}
      spacing={2}
      justifyContent="center"
      alignItems="stretch"
    >
      {[
        {
          icon: <PersonAddIcon />,
          label: 'Add Person',
          action: () => {
            setNewPersonData({
              name: '',
              baptismName: '',
              relation: '',
              gender: '',
              dob: '',
              occupation: '',
              education: '',
              phone: '',
              email: ''
            });
            setOpenAddPersonDialog(true);
          },
          variant: 'contained',
          color: 'success',
        },
        {
          icon: <EditIcon />,
          label: 'Edit Family',
          action: () => {
            setEditFamilyData({
              name: selectedFamily.name || '',
              building: selectedFamily.building || '',
              phone: selectedFamily.phone || '',
              pincode: selectedFamily.pincode || '',
              street: selectedFamily.street || '',
              city: selectedFamily.city || '',
              district: selectedFamily.district || ''
            });
            setOpenEditFamilyDialog(true);
          },
          variant: 'contained',
          color: 'info',
        },
        {
          icon: <MoveIcon />,
          label: 'Move',
          action: () => setOpenMoveDialog(true),
          variant: 'contained',
          color: 'primary',
        },
        {
          icon: <HistoryIcon />,
          label: 'Person Movement',
          action: () => {
            setShowPersonMovementsDialog(true);
            fetchPersonMovements();
          },
          variant: 'outlined',
          color: 'secondary',
        },
        {
          icon: <HistoryIcon />,
          label: 'Family Movement',
          action: () => {
            setShowMovementsDialog(true);
            fetchMovements();
          },
          variant: 'outlined',
          color: 'secondary',
        },
        {
          icon: <HistoryIcon />,
          label: 'Status History',
          action: () => {
            setShowStatusHistoryDialog(true);
            fetchStatusHistory();
          },
          variant: 'outlined',
          color: 'secondary',
        },
      ].map((button, index) => (
        <Button
          key={index}
          fullWidth
          variant={button.variant}
          color={button.color}
          startIcon={button.icon}
          onClick={button.action}
          sx={{
            borderRadius: 2,
            textTransform: 'none',
            py: 1.5,
            px: 3,
            fontWeight: 'bold',
            fontSize: '1rem',
            transition: 'all 0.3s ease',
            '&:hover': {
              transform: 'translateY(-3px)',
              boxShadow: '0 6px 12px rgba(0,0,0,0.1)',
            },
          }}
        >
          {button.label}
        </Button>
      ))}
    </Stack>
  </Paper>
</Grid>
    
    {/* Personal Information Table */}
    <Grid item xs={12}>
      <Box sx={{ mt: 1 }}>
        <Paper 
          elevation={1} 
          sx={{ 
            borderRadius: 3, 
            pb: 3,
            pt: 3,
            px: 0, 
            background: 'linear-gradient(to right, #ffffff 0%, #f9fafe 100%)',
            boxShadow: '0 8px 20px rgba(0,0,0,0.05)',
            position: 'relative',
            overflow: 'hidden',
            '&::before': {
              content: '""',
              position: 'absolute',
              top: 0,
              left: 0,
              width: '100%',
              height: '5px',
              background: 'linear-gradient(to right, #6a11cb 0%, #2575fc 100%)'
            }
          }}
        >
          <Stack 
            direction={{ xs: 'column', sm: 'row' }}
            justifyContent="space-between" 
            alignItems="center" 
            sx={{ mb: 3 }}
          >
            <Typography 
              variant="h5" 
              color="primary" 
              sx={{ 
                fontWeight: 600,
                display: 'flex',
                alignItems: 'center',
                gap: 2
              }}
            >
              
              Personal and Tithe Information
            </Typography>
            <Button
                          
                          variant="contained"
                          startIcon={<PrintIcon />}
                          onClick={openPrintDialog}
                          disabled={personalInfoLoading}
                          sx={{ 
                            borderRadius: 2,
                            textTransform: 'none',
                            px: 3,
                            py: 1.5,
                            transition: 'all 0.3s ease',
                            '&:hover': {
                              transform: 'translateY(-3px)',
                              boxShadow: '0 4px 10px rgba(0,0,0,0.2)'
                            }
                          }}
                        >
                          Print Family Details
                        </Button>
        <Button
  variant="contained"
  color="primary"
  onClick={handleSaveCurrentTransactions}
  startIcon={transactionLoading ? <CircularProgress size={16} /> : <SaveIcon />}
  disabled={transactionLoading || currentTransactions.length === 0}
  data-testid="save-transactions-button" // Add this line for targeting
  sx={{ 
    borderRadius: 2,
    textTransform: 'none',
    px: 3,
    py: 1.5,
    transition: 'all 0.3s ease',
    '&:hover': {
      transform: 'translateY(-3px)',
      boxShadow: '0 4px 10px rgba(0,0,0,0.2)'
    }
  }}
>
  {transactionLoading  ? 'Saving...' : 'Save Transactions'}
</Button>
          </Stack>
<Paper 
        elevation={2} 
        sx={{ 
          mt: 2, 
          mx: 3, // Add horizontal margin to align with table
          p: 2, 
          backgroundColor: '#f8f9fa',
          borderRadius: 2,
          border: '2px solid #e3f2fd'
        }}
      >
        <Typography variant="h6" sx={{ mb: 2, color: 'primary.main', fontWeight: 'bold' }}>
          Transaction Summary
        </Typography>
        <Grid container spacing={3}>
          <Grid item xs={12} sm={3}>
            <Paper elevation={1} sx={{ p: 2, textAlign: 'center', backgroundColor: '#fff3e0' }}>
              <Typography variant="subtitle2" color="text.secondary">
                Previous Year ({currentYear - 1})
              </Typography>
              <Typography variant="h4" sx={{ color: '#f57c00', fontWeight: 'bold' }}>
                ₹{transactions.reduce((sum, transaction) => sum + (transaction.previousYearAmount || 0), 0).toFixed(0)}
              </Typography>
            </Paper>
          </Grid>
          <Grid item xs={12} sm={3}>
            <Paper elevation={1} sx={{ p: 2, textAlign: 'center', backgroundColor: '#e8f5e8' }}>
              <Typography variant="subtitle2" color="text.secondary">
                Current Year ({currentYear})
              </Typography>
              <Typography variant="h4" sx={{ color: '#2e7d32', fontWeight: 'bold' }}>
                ₹{transactions.reduce((sum, transaction) => sum + (transaction.currentYearAmount || 0), 0).toFixed(0)}
              </Typography>
            </Paper>
          </Grid>
          <Grid item xs={12} sm={3}>
            <Paper elevation={1} sx={{ p: 2, textAlign: 'center', backgroundColor: '#e3f2fd' }}>
              <Typography variant="subtitle2" color="text.secondary">
                Total Amount
              </Typography>
              <Typography variant="h4" sx={{ color: '#1976d2', fontWeight: 'bold' }}>
                ₹{transactions.reduce((sum, transaction) => sum + (transaction.totalAmount || 0), 0).toFixed(0)}
              </Typography>
            </Paper>
          </Grid>
          <Grid item xs={12} sm={3}>
            <Paper elevation={1} sx={{ p: 2, textAlign: 'center', backgroundColor: '#fce4ec' }}>
              <Typography variant="subtitle2" color="text.secondary">
                Active Members
              </Typography>
              <Typography variant="h4" sx={{ color: '#c2185b', fontWeight: 'bold' }}>
                {persons.filter(person => person.status === 'active').length}
              </Typography>
            </Paper>
          </Grid>
        </Grid>
      </Paper>
          <Box sx={{ 
            width: '100%', 
            overflow: 'auto',
            borderRadius: 2,
            border: '1px solid',
            borderColor: 'divider'
          }}>
            {/* <MaterialReactTable
              columns={personalInfoColumns}
              data={persons}
              enableRowActions
              enableEditing
              editDisplayMode="row"
              onEditingRowSave={handleSaveRow}
              onEditingRowCancel={handleEditCancel}
              onEditingRowStart={handleEditStart}
              state={{
                validationErrors,
                isEditing: isEditingRow,
              }}
              muiTableProps={{
                lg: {
                  tableLayout: 'fixed',
                  minWidth: '1400px',
                  borderRadius: 1,
                  '& .MuiTableRow-root:hover': {
                    backgroundColor: 'rgba(0,0,0,0.04)'
                  }
                },
              }}
              renderRowActions={({ row, table }) => (
                <Stack 
                  direction="row" 
                  spacing={-1.5} 
                  alignItems="left"
                >
                  {table.getState().editingRow?.id === row.id ? (
                    <>
                      <Tooltip title="Save Changes">
                        <IconButton
                          color="primary"
                          onClick={() => {
                            table.setEditingRow(null);
                            handleSaveRow({
                              exitEditingMode: () => table.setEditingRow(null),
                              row,
                              values: row._valuesCache,
                            });
                          }}
                        >
                          <SaveIcon />
                        </IconButton>
                      </Tooltip>
                      <Tooltip title="Cancel">
                        <IconButton
                          color="error"
                          onClick={() => {
                            table.setEditingRow(null);
                            handleEditCancel();
                          }}
                        >
                          <CancelIcon />
                        </IconButton>
                      </Tooltip>
                    </>
                  ) : (
                    <Tooltip title="Edit Row">
                      <IconButton
                        color="primary"
                        onClick={() => {
                          table.setEditingRow(row);
                          handleEditStart();
                        }}
                      >
                        <EditIcon />
                      </IconButton>
                    </Tooltip>
                  )}
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
              <Tooltip title="Change Status">
  <IconButton
    onClick={() => {
      setStatusDetails({
        person: row.original,
        status: '',
        remarks: '',
        date: new Date().toISOString().split('T')[0]
      });
      setOpenStatusDialog(true);
    }}
    color="error"
  >
    <DeleteIcon />
  </IconButton>
</Tooltip>
                </Stack>
              )}
              positionActionsColumn="last"
              muiTableBodyCellProps={({ cell, row, table }) => ({
                sx: {
                  backgroundColor:
                    table.getState().editingRow?.id === row.id
                      ? alpha(theme.palette.primary.light, 0.1)
                      : 'inherit',
                },
              })}
            /> */}
            {personalInfoLoading  ? (
          // Show skeleton when loading
          <PersonalInfoSkeleton />
        ) : (
          // Show actual table when data is loaded
          <MaterialReactTable {...enhancedMaterialReactTableProps} />
        )}
          </Box>
 

        </Paper>
      </Box>
    </Grid>
  </>
)}
        </Grid>
      </CardContent>
    </StyledCard>

    {/* Move Family Dialog */}
    {/* Move Family Dialog */}
<Dialog 
  open={openMoveDialog} 
  onClose={() => {
    setOpenMoveDialog(false);
    setDestinationParish(null);
    setDestinationKoottayma(null);
  }}
  maxWidth="sm"
  fullWidth
>
  <DialogTitle>Move Family</DialogTitle>
  <DialogContent>
    <Stack spacing={3} sx={{ mt: 2 }}>
      {/* Destination Parish Selection */}
      <StyledFormControl>
        <Select1
          value={destinationParish ? { 
            value: destinationParish, 
            label: parishes.find(p => p._id === destinationParish)?.name 
          } : null}
          onChange={(selectedOption) => {
            setDestinationParish(selectedOption?.value || '');
            setDestinationKoottayma(null); // Reset koottayma when parish changes
          }}
          options={parishes.map(parish => ({ 
            value: parish._id, 
            label: parish.name 
          }))}
          placeholder="Select Destination Parish..."
          noOptionsMessage={() => "No parishes found"}
          isClearable
          isSearchable
        />
      </StyledFormControl>

      {/* Destination Koottayma Selection */}
      <StyledFormControl>
        <Select1
          value={destinationKoottayma ? { 
            value: destinationKoottayma, 
            label: Dkoottaymas.find(k => k.koottaymaId === destinationKoottayma)?.name 
          } : null}
          onChange={(selectedOption) => {
            setDestinationKoottayma(selectedOption?.value || '');
          }}
          options={Dkoottaymas.map(koottayma => ({ 
            value: koottayma.koottaymaId, 
            label: koottayma.name 
          }))}
          placeholder="Select Destination Koottayma..."
          noOptionsMessage={() => "No koottaymas found"}
          isClearable
          isSearchable
          isDisabled={!destinationParish}
          loadingMessage={() => "Loading koottaymas..."}
        />
      </StyledFormControl>

      {/* Optional: Display current family info */}
      {selectedFamily && (
        <Paper 
          elevation={1} 
          sx={{ 
            p: 2, 
            backgroundColor: '#f5f5f5',
            borderRadius: 2,
            border: '1px solid #e0e0e0'
          }}
        >
          <Typography variant="subtitle2" color="text.secondary" gutterBottom>
            Moving Family:
          </Typography>
          <Typography variant="h6" color="primary">
            {selectedFamily.name}
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Current Parish: {parishes.find(p => p._id === selectedParish)?.name}
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Current Koottayma: {koottaymas.find(k => k.koottaymaId === selectedKoottayma)?.name}
          </Typography>
        </Paper>
      )}
    </Stack>
  </DialogContent>
  <DialogActions>
    <Button 
      onClick={() => {
        setOpenMoveDialog(false);
        setDestinationParish(null);
        setDestinationKoottayma(null);
      }}
    >
      Cancel
    </Button>
    <Button 
      onClick={handleMoveFamily} 
      variant="contained"
      disabled={!destinationParish || !destinationKoottayma}
    >
      Move Family
    </Button>
  </DialogActions>
</Dialog>

    {/* Movement History Dialog */}
    <Dialog
      open={showMovementsDialog}
      onClose={() => setShowMovementsDialog(false)}
      maxWidth="xl"
      fullWidth
    >
      <DialogTitle>
        <Stack direction="row" justifyContent="space-between" alignItems="center">
          <Typography variant="h6">Family Movement History</Typography>
          <IconButton onClick={fetchMovements} disabled={movementsLoading}>
            <RefreshIcon />
          </IconButton>
        </Stack>
      </DialogTitle>
      <DialogContent>
        <MaterialReactTable
          columns={movementColumns}
          data={movements}
          enableColumnResizing
          enablePagination={true}
          enableColumnFilters={true}
          enableGlobalFilter={true}
          state={{ isLoading: movementsLoading }}
          initialState={{
            pagination: { pageSize: 10 },
            sorting: [{ id: 'movedDate', desc: true }],
            density: 'compact'
          }}
          renderTopToolbarCustomActions={() => (
            <Box sx={{ display: 'flex', gap: 1 }}>
              <Button
                variant="contained"
                onClick={() => {
                  // Export functionality
                  const exportData = movements.map(m => ({
                    'Family Number': m.id,
                    'Family Name': m.familyName,
                    'From Parish': m.sourceParishName,
                    'From Koottayma': m.sourceKoottaymaName,
                    'To Parish': m.destinationParishName,
                    'To Koottayma': m.destinationKoottaymaName,
                    'Moved Date': new Date(m.movedDate).toLocaleString()
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
              </Button>
            </Box>
          )}
        />
      </DialogContent>
      <DialogActions>
        <Button onClick={() => setShowMovementsDialog(false)}>Close</Button>
      </DialogActions>
    </Dialog>
    <PrintDialog
          open={printDialogOpen}
          onClose={closePrintDialog}
          familyData={selectedFamily}
          parishInfo={oneparishes}
          koottaymaInfo={koottaymas.find(k => k.koottaymaId === selectedKoottayma)}
          transactions={transactions}
          persons={persons}
          currentYear={currentYear}
        />
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
  </Container>
  
);

};

export default FamilyManagement;