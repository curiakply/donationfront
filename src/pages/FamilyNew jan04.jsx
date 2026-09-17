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
} from '@mui/material';
import { MaterialReactTable } from 'material-react-table';
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
} from '@mui/icons-material';
import { ThemeProvider, createTheme,styled } from '@mui/material/styles';
import axiosInstance from '../axiosConfig';
import { alpha } from '@mui/material/styles';
import { useTheme } from '@mui/material/styles';
import FamilyDetailsCard from './FamilyDetailsCard ';
import FamilyPrintSystem from './FamilyPrintLayout ';
import { motion } from 'framer-motion';
import Select1 from 'react-select';
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
  const currentYear = new Date().getFullYear();

  // Effects
  useEffect(() => {
    fetchParishes();
  }, []);

  useEffect(() => {
    if (selectedParish) {
      fetchKoottaymas(selectedParish);
      fetchoneParishes(selectedParish)
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
      setParishes(response.data || []);
    } catch (error) {
      console.error("Error fetching parishes:", error);
    }
  };
  const fetchoneParishes = async () => {
    try {
      const response = await axiosInstance.get(`/parish/${selectedParish}`);
      setoneParishes(response.data);
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

// Status History columns configuration
const statusHistoryColumns = [
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
  }
];

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
  try {
    // Store current state for potential rollback
    const currentState = {
      person: { ...statusDetails.person },
      transactions: await axiosInstance.get(`/transaction/person/${statusDetails.person._id}`).data
    };
    setPreviousState(currentState);

    // If person is head, handle new head selection
    if (statusDetails.person.relation === 'head') {
      const familyMembers = await axiosInstance.get(`/person/family/${selectedFamily.id}`);
      const activeMembers = familyMembers.data.filter(
        p => p._id !== statusDetails.person._id && p.status === 'active'
      );

      if (activeMembers.length > 0) {
        setEligibleMembers(activeMembers);
        setNewHeadDialogOpen(true);
        return;
      }
    }

    await updatePersonAndTransactions();
  } catch (error) {
    console.error('Error updating person status:', error);
    showSnackbar('Failed to update person status', 'error');
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
    // Validate status value
    if (!['active', 'inactive', 'moved_out', 'deceased'].includes(statusDetails.status)) {
      showSnackbar('Invalid status value', 'error');
      return;
    }

    // Store current state for potential rollback
    const currentState = {
      person: { ...statusDetails.person },
      status: statusDetails.status,
      head: newHead
    };

    // Check head status change
    if (statusDetails.person.relation === 'head' && 
        ['moved_out', 'deceased'].includes(statusDetails.status)) {
      const familyMembers = await axiosInstance.get(`/person/family/${selectedFamily.id}`);
      const activeMembers = familyMembers.data.filter(
        p => p._id !== statusDetails.person._id && p.status === 'active'
      );

      if (activeMembers.length > 0 && !newHead) {
        showSnackbar('Please select a new head before changing head status', 'error');
        return;
      }
    }

    // Update steps in sequence
    try {
      // 1. Update new head first if exists
      if (newHead) {
        await axiosInstance.put(`/person/${newHead._id}`, {
          relation: 'head',
          status: 'active',
          narration: `Assigned as new head after previous head ${statusDetails.status}`
        });
      }

      // 2. Update person's status
      await axiosInstance.put(`/person/${statusDetails.person._id}`, {
        status: statusDetails.status,
        narration: statusDetails.remarks || `Marked as ${statusDetails.status}`
      });

      // 3. Handle transactions
      if (['moved_out', 'deceased'].includes(statusDetails.status)) {
        const currentYear = new Date().getFullYear();
        const transResponse = await axiosInstance.get(
          `/transaction/person/${statusDetails.person._id}/year/${currentYear}`
        );

        if (transResponse.data && transResponse.data.totalAmount > 0) {
          const headId = newHead?._id || (await axiosInstance.get(`/person/family/${selectedFamily.id}`))
            .data.find(p => p.relation === 'head' && p.status === 'active')?._id;

          if (headId) {
            // Transfer the transaction
            const transferData = {
              fromPerson: statusDetails.person._id,
              toPerson: headId,
              forane: selectedFamily.forane,
              parish: selectedParish,
              family: selectedFamily.id,
              status: statusDetails.status,
              reason: `Transfer due to member ${statusDetails.status}`,
              amount: transResponse.data.totalAmount,
              date: new Date().toLocaleDateString('en-GB')
            };

            await axiosInstance.post('/transaction/transfer', transferData);
          }
        }
      }

      // 4. Create movement record
      const sourceParish = parishes.find(p => p._id === selectedParish);
      const sourceKoottayma = koottaymas.find(k => k.koottaymaId === selectedKoottayma);

      const movementData = {
        person: statusDetails.person._id,
        personName: statusDetails.person.name,
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
        oldRelation: statusDetails.person.relation,
        newRelation: statusDetails.status,
        movedDate: new Date(),
        status: statusDetails.status,
        remarks: statusDetails.remarks || `Status changed to ${statusDetails.status}`
      };

      await axiosInstance.post('/person-movements/person-movements', movementData);

      showSnackbar(`Person marked as ${statusDetails.status}`, 'success');
      
      // Refresh data
      fetchPersons(selectedFamily.id);
      fetchTransactions(selectedFamily.id);
      
      setOpenStatusDialog(false);
      setNewHeadDialogOpen(false);

      if (statusDetails.person.relation === 'head') {
        fetchFamilies(selectedParish, selectedKoottayma);
      }

    } catch (error) {
      // Rollback changes if any step fails
      if (newHead) {
        await axiosInstance.put(`/person/${newHead._id}`, {
          relation: currentState.head?.relation || 'member',
          status: 'active'
        });
      }

      await axiosInstance.put(`/person/${statusDetails.person._id}`, {
        status: 'active',
        relation: currentState.person.relation,
        narration: 'Status change rolled back due to error'
      });

      throw error;
    }
  } catch (error) {
    console.error('Error details:', error.response?.data);
    showSnackbar(error.response?.data?.message || 'Failed to update status', 'error');
  }
};

// const handleUndoStatusChange = async () => {
//   try {
//     if (!previousState) {
//       showSnackbar('No previous state available to restore', 'error');
//       return;
//     }

//     const originalStatus = previousState.person.status;

//     try {
//       // 1. Restore person state
//       await axiosInstance.put(`/person/${previousState.person._id}`, {
//         ...previousState.person,
//         _id: undefined,
//         status: 'active'
//       });

//       // 2. Handle transaction restoration
//       const currentYear = new Date().getFullYear();
//       const transResponse = await axiosInstance.get(
//         `/transaction/person/${previousState.person._id}/year/${currentYear}`
//       );

//       if (transResponse.data && transResponse.data.totalAmount > 0) {
//         const transferData = {
//           fromPerson: previousState.headId,  // Current head
//           toPerson: previousState.person._id, // Original person
//           status: 'undo',
//           reason: 'Status change undone',
//           date: new Date().toLocaleDateString('en-GB')
//         };

//         await axiosInstance.post('/transaction/transfer', transferData);
//       }

//       // 3. Create movement record
//       const sourceParish = parishes.find(p => p._id === selectedParish);
//       const sourceKoottayma = koottaymas.find(k => k.koottaymaId === selectedKoottayma);

//       const movementData = {
//         person: previousState.person._id,
//         personName: previousState.person.name,
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
//         oldRelation: previousState.person.relation,
//         newRelation: previousState.person.relation,
//         movedDate: new Date(),
//         status: 'active',
//         remarks: `Status changed from ${originalStatus} back to active`,
//         type: 'undo'
//       };

//       await axiosInstance.post('/person-movements/person-movements', movementData);
      
//       showSnackbar('Successfully reverted changes', 'success');
      
//       // Refresh data
//       fetchPersons(selectedFamily.id);
//       fetchTransactions(selectedFamily.id);
      
//       setPreviousState(null);
//       setShowUndoDialog(false);

//       if (previousState.person.relation === 'head') {
//         fetchFamilies(selectedParish, selectedKoottayma);
//       }

//     } catch (error) {
//       throw error;
//     }
//   } catch (error) {
//     console.error('Error details:', error.response?.data);
//     showSnackbar(error.response?.data?.message || 'Failed to revert changes', 'error');
//   }
// };
  // Function to mark person as moved out
 

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
            family: selectedFamily.id,
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
  
   
  
      // Update family location
      const familyUpdateResponse = await axiosInstance.put(
        `/family/${selectedFamily.id}`,
        {
          parish: destinationParish,
          koottayma: destinationKoottayma,
          forane: destinationForane._id  // Include forane in update
        }
      );
  
    
  
      // Create movement record
      const movementData = {
        family: selectedFamily.id,
        familyName: selectedFamily.name,
        familyNumber: parseInt(selectedFamily.id) || 0,
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
      header: `₹ ${currentYear}`,
      size: 130,
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
              sx: { height: '28px', '& input': { padding: '1px' } }
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
  <Container maxWidth="xl">
    {/* Status Change Dialog */}
    
{/* Status Change Dialog */}
<Dialog
  open={openStatusDialog}
  onClose={() => setOpenStatusDialog(false)}
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
        >
          <MenuItem value="moved_out">Moved Out of Diocese</MenuItem>
          <MenuItem value="deceased">Deceased</MenuItem>
          {/* <MenuItem value="inactive">Inactive</MenuItem> */}
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
      />
    </Stack>
  </DialogContent>
  <DialogActions>
    <Button onClick={() => setOpenStatusDialog(false)}>Cancel</Button>
    <Button 
      variant="contained" 
      onClick={handlePersonStatusChange}
      disabled={!statusDetails.status}
    >
      Update Status
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
<Dialog
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

{/* Undo/Rollback Dialog
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
</Dialog> */}
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

      {/* New Relation Selection */}
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
          <MenuItem value="other">Other</MenuItem>
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
    <StyledCard>
      <CardContent>
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
                  value={selectedKoottayma ? { value: selectedKoottayma, label: koottaymas.find(k => k.koottaymaId === selectedKoottayma)?.name } : null}
                  onChange={(selectedOption) => setSelectedKoottayma(selectedOption?.value || '')}
                  options={koottaymas.map(koottayma => ({ value: koottayma.koottaymaId, label: koottayma.name }))}
                  placeholder="Select Kootayma..."
                  noOptionsMessage={() => "No kootaymas found"}
                  isClearable
                  isSearchable
                  isDisabled={!selectedParish}
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
    </Stack>
  </Stack>
</Paper>
         
            <ThemeProvider theme={theme}>
      <MaterialReactTable
        columns={familyColumns}
        data={families}
        enableColumnResizing
        enableRowSelection={false}
        enableGlobalFilter={true}
        initialState={{
          showGlobalFilter: true,
          pagination: {
            pageSize: 5,
            pageIndex: 0,
          },
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
        getRowId={(row) => row.id}
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
              backgroundColor: 'rgba(25, 118, 210, 0.08)',
            },
            '&:nth-of-type(odd)': {
              backgroundColor: 'rgba(25, 118, 210, 0.04)',
            },
          },
        })}
        filterFns={{
          fuzzy: (row, columnId, filterValue) => {
            const value = row.getValue(columnId);
            return value?.toString().toLowerCase().includes(filterValue.toLowerCase());
          },
        }}
        globalFilterFn="fuzzy"
        muiTablePaginationProps={{
          rowsPerPageOptions: [5, 10, 20, 30, 50, 100],
          sx: {
            '& .MuiTablePagination-selectLabel': {
              fontWeight: 'bold',
            },
            '& .MuiTablePagination-select': {
              color: theme.palette.primary.main,
            },
            '& .MuiTablePagination-actions': {
              '& .MuiIconButton-root': {
                color: theme.palette.primary.main,
                '&:hover': {
                  backgroundColor: 'rgba(25, 118, 210, 0.08)',
                },
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
            padding: '16px',
            borderBottom: `1px solid ${theme.palette.divider}`,
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
            p: 3, 
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
              startIcon={<SaveIcon />}
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
              Save Current Transactions
            </Button>
          </Stack>

          <Box sx={{ 
            width: '100%', 
            overflow: 'auto',
            borderRadius: 2,
            border: '1px solid',
            borderColor: 'divider'
          }}>
            <MaterialReactTable
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
            />
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
    <Dialog 
      open={openMoveDialog} 
      onClose={() => {
        setOpenMoveDialog(false);
        setDestinationParish(null);
        setDestinationKoottayma(null);
      }}
    >
      <DialogTitle>Move Family</DialogTitle>
      <DialogContent>
        <FormControl fullWidth margin="normal">
          <InputLabel>Destination Parish</InputLabel>
          <Select
            value={destinationParish}
            onChange={(e) => {
              setDestinationParish(e.target.value);
              setDestinationKoottayma(null);
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
        <FormControl fullWidth margin="normal">
          <InputLabel>Destination Kootayma</InputLabel>
          <Select
            value={destinationKoottayma}
            onChange={(e) => setDestinationKoottayma(e.target.value)}
            label="Destination Kootayma"
            disabled={!destinationParish}
          >
            {Dkoottaymas.map((koottayma) => (
              <MenuItem key={koottayma.koottaymaId} value={koottayma.koottaymaId}>
                {koottayma.name}
              </MenuItem>
            ))}
          </Select>
        </FormControl>
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
          Move
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