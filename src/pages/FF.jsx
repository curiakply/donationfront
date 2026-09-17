import React, { useState, useEffect, lazy, Suspense } from 'react';
import {
  Container,
  Grid,
  Paper,
  Card,
  CardContent,
  Typography,
  CircularProgress,
  Box
} from '@mui/material';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import axiosInstance from '../axiosConfig';

// Lazy loaded components
const FamilySelectionPanel = lazy(() => import('../components/FF/FamilySelectionPanel'));
const FamilyDetailsPanel = lazy(() => import('../components/FF/FamilyDetailsPanel'));
const FamilyActionsPanel = lazy(() => import('../components/FF/FamilyActionsPanel'));
const PersonalInfoTable = lazy(() => import('../components/FF/PersonalInfoTable'));
const MoveFamilyDialog = lazy(() => import('../components/FF/MoveFamilyDialog'));
// const MovePersonDialog = lazy(() => import('./dialogs/MovePersonDialog'));
// const StatusChangeDialog = lazy(() => import('./dialogs/StatusChangeDialog'));
// const MovementHistoryDialog = lazy(() => import('./dialogs/MovementHistoryDialog'));

// Theme configuration
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

// Loading component
const LoadingComponent = () => (
  <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '200px' }}>
    <CircularProgress />
  </Box>
);

const FamilyManagement = () => {
  // Core state
  const [selectedFamily, setSelectedFamily] = useState(null);
  const [selectedParish, setSelectedParish] = useState(null);
  const [selectedKoottayma, setSelectedKoottayma] = useState(null);
  const [persons, setPersons] = useState([]);
  const [transactions, setTransactions] = useState([]);
  
  // Selected person state for dialogs
  const [selectedPerson, setSelectedPerson] = useState(null);
  const [statusDetails, setStatusDetails] = useState(null);

  // Loading and error states
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  // Dialog states
  const [openMoveDialog, setOpenMoveDialog] = useState(false);
  const [openMovePersonDialog, setOpenMovePersonDialog] = useState(false);
  const [openStatusDialog, setOpenStatusDialog] = useState(false);
  const [showMovementsDialog, setShowMovementsDialog] = useState(false);

  // Data fetching functions
  const fetchPersons = async (familyId) => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await axiosInstance.get(`/person/family/${familyId}`);
      setPersons(response.data);
    } catch (error) {
      setError(error.message || 'Error fetching persons');
      console.error('Error fetching persons:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const fetchTransactions = async (familyId) => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await axiosInstance.get(`/transaction/family/${familyId}`);
      setTransactions(response.data);
    } catch (error) {
      setError(error.message || 'Error fetching transactions');
      console.error('Error fetching transactions:', error);
    } finally {
      setIsLoading(false);
    }
  };

  // Function to refresh all data
  const refreshData = async () => {
    if (selectedFamily) {
      await Promise.all([
        fetchPersons(selectedFamily.id),
        fetchTransactions(selectedFamily.id)
      ]);
    }
  };

  // Effect to fetch data when family is selected
  useEffect(() => {
    if (selectedFamily) {
      fetchPersons(selectedFamily.id);
      fetchTransactions(selectedFamily.id);
    }
  }, [selectedFamily]);

  return (
    <ThemeProvider theme={theme}>
      <Container maxWidth="xl">
        <Card>
          <CardContent>
            <Typography variant="h5" gutterBottom>
              Family Management
            </Typography>

            <Grid container spacing={3}>
              {/* Family Selection Panel */}
              <Grid item xs={12} md={3}>
                <Suspense fallback={<LoadingComponent />}>
                  <FamilySelectionPanel
                    selectedParish={selectedParish}
                    setSelectedParish={setSelectedParish}
                    selectedKoottayma={selectedKoottayma}
                    setSelectedKoottayma={setSelectedKoottayma}
                    selectedFamily={selectedFamily}
                    setSelectedFamily={setSelectedFamily}
                  />
                </Suspense>
              </Grid>

              {/* Main Content Area */}
              <Grid item xs={12} md={9}>
                {selectedFamily && (
                  <>
                    <Suspense fallback={<LoadingComponent />}>
                      <FamilyDetailsPanel
                        selectedFamily={selectedFamily}
                        transactions={transactions}
                      />
                    </Suspense>

                    <Suspense fallback={<LoadingComponent />}>
                      <FamilyActionsPanel
                        onMove={() => setOpenMoveDialog(true)}
                        onShowMovements={() => setShowMovementsDialog(true)}
                      />
                    </Suspense>

                    <Suspense fallback={<LoadingComponent />}>
                      <PersonalInfoTable
                        persons={persons}
                        transactions={transactions}
                        onPersonMove={(person) => {
                          setSelectedPerson(person);
                          setOpenMovePersonDialog(true);
                        }}
                        onStatusChange={(person) => {
                          setStatusDetails(person);
                          setOpenStatusDialog(true);
                        }}
                        onRefreshData={() => {
                          fetchPersons(selectedFamily.id);
                          fetchTransactions(selectedFamily.id);
                        }}
                      />
                    </Suspense>
                  </>
                )}
              </Grid>
            </Grid>
          </CardContent>
        </Card>

        {/* Dialogs */}
        <Suspense fallback={null}>
          <MoveFamilyDialog
            open={openMoveDialog}
            onClose={() => setOpenMoveDialog(false)}
            selectedFamily={selectedFamily}
            onMove={async () => {
              await fetchPersons(selectedFamily.id);
              await fetchTransactions(selectedFamily.id);
              setOpenMoveDialog(false);
            }}
          />
        </Suspense>

                {/* <MovePersonDialog
            open={openMovePersonDialog}
            onClose={() => setOpenMovePersonDialog(false)}
            selectedPerson={selectedPerson}
            selectedFamily={selectedFamily}
            onMove={async () => {
              await fetchPersons(selectedFamily.id);
              await fetchTransactions(selectedFamily.id);
              setOpenMovePersonDialog(false);
            }}
          />

          <StatusChangeDialog
            open={openStatusDialog}
            onClose={() => setOpenStatusDialog(false)}
            statusDetails={statusDetails}
            onStatusChange={async () => {
              await fetchPersons(selectedFamily.id);
              await fetchTransactions(selectedFamily.id);
              setOpenStatusDialog(false);
            }}
          />

          <MovementHistoryDialog
            open={showMovementsDialog}
            onClose={() => setShowMovementsDialog(false)}
            selectedFamily={selectedFamily}
          /> */}
      </Container>
    </ThemeProvider>
  );
};

export default FamilyManagement;