import { useState, useEffect, useMemo } from "react";
import axiosInstance from "../axiosConfig";
import { MaterialReactTable } from 'material-react-table';
import { 
  Box,
  TextField,
  Button,
  Card,
  CardContent,
  Typography,
  Alert,
  CircularProgress,
  Container,
  Stack,
  FormControl,
  InputLabel,
  MenuItem,
  Select
} from '@mui/material';

const MoveFamily = () => {
  const [sourceData, setSourceData] = useState({
    foranes: [],
    parishes: [],
    koottaymas: [],
    persons: []
  });

  const [destinationData, setDestinationData] = useState({
    foranes: [],
    parishes: [],
    koottaymas: []
  });

  const [source, setSource] = useState({
    forane: '',
    parish: '',
    koottayma: '',
    family: ''
  });

  const [destination, setDestination] = useState({
    forane: '',
    parish: '',
    koottayma: ''
  });

  const [loading, setLoading] = useState({
    fetch: false,
    move: false
  });

  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [searchID, setSearchID] = useState("");
  const [displayResults, setDisplayResults] = useState(false);
  const [moved, setMoved] = useState(false);

  // Table Columns Definition
  const columns = useMemo(() => [
    { accessorKey: 'name', header: 'Name' },
    { accessorKey: 'baptismName', header: 'Baptism Name' },
    { accessorKey: 'relation', header: 'Relation' },
    { accessorKey: 'gender', header: 'Gender' },
    { accessorKey: 'occupation', header: 'Occupation' },
    { accessorKey: 'education', header: 'Education' }
  ], []);

  useEffect(() => {
    fetchInitialData();
  }, []);

  useEffect(() => {
    if (destination.forane) {
      fetchDestinationParishes(destination.forane);
    }
  }, [destination.forane]);

  useEffect(() => {
    if (destination.parish) {
      fetchDestinationKoottaymas(destination.parish);
    }
  }, [destination.parish]);

  // Fetch functions remain the same, just updating the response mapping
  const fetchInitialData = async () => {
    setLoading(prev => ({ ...prev, fetch: true }));
    try {
      const response = await axiosInstance.get("/forane");
      const foraneOptions = response.data;
      setSourceData(prev => ({ ...prev, foranes: foraneOptions }));
      setDestinationData(prev => ({ ...prev, foranes: foraneOptions }));
    } catch (error) {
      setError("Error fetching initial data: " + error.message);
    } finally {
      setLoading(prev => ({ ...prev, fetch: false }));
    }
  };

  const fetchDestinationParishes = async (foraneId) => {
    setLoading(prev => ({ ...prev, fetch: true }));
    try {
      const response = await axiosInstance.get(`/parish/forane/${foraneId}`);
      setDestinationData(prev => ({
        ...prev,
        parishes: response.data
      }));
    } catch (error) {
      setError("Error fetching destination parishes: " + error.message);
    } finally {
      setLoading(prev => ({ ...prev, fetch: false }));
    }
  };

  const fetchDestinationKoottaymas = async (parishId) => {
    setLoading(prev => ({ ...prev, fetch: true }));
    try {
      const response = await axiosInstance.get(`/koottayma/parish/${parishId}`);
      setDestinationData(prev => ({
        ...prev,
        koottaymas: response.data
      }));
    } catch (error) {
      setError("Error fetching destination koottaymas: " + error.message);
    } finally {
      setLoading(prev => ({ ...prev, fetch: false }));
    }
  };

  const fetchFamilyDetails = async (familyId) => {
    setLoading(prev => ({ ...prev, fetch: true }));
    try {
      const [personsResponse, familyResponse] = await Promise.all([
        axiosInstance.get(`/person/family/${familyId}`),
        axiosInstance.get(`/family/${familyId}`)
      ]);
      
      const personDetails = await Promise.all(
        personsResponse.data.map(p => axiosInstance.get(`/person/${p._id}`))
      );
      
      setSourceData(prev => ({
        ...prev,
        persons: personDetails.map(r => r.data)
      }));
      
      setDisplayResults(true);
    } catch (error) {
      setError("Error fetching family details: " + error.message);
    } finally {
      setLoading(prev => ({ ...prev, fetch: false }));
    }
  };

  const handleDestinationChange = (field) => (event) => {
    const value = event.target.value;
    setDestination(prev => {
      const newState = { ...prev, [field]: value };
      if (field === 'forane') {
        newState.parish = '';
        newState.koottayma = '';
      } else if (field === 'parish') {
        newState.koottayma = '';
      }
      return newState;
    });
  };

  const handleSearchInputChange = (e) => {
    const value = e.target.value;
    setSearchID(value);
    if (value.length === 6 && !displayResults) {
      fetchFamilyDetails(value);
    } else {
      setDisplayResults(false);
    }
  };

  const handleMove = async () => {
    if (!destination.forane || !destination.parish || !destination.koottayma) {
      setError("Please select all required fields");
      return;
    }

    setLoading(prev => ({ ...prev, move: true }));
    try {
      await axiosInstance.put(`/family/${searchID}`, {
        forane: destination.forane,
        parish: destination.parish,
        koottayma: destination.koottayma
      });
      
      setSuccess("Family moved successfully!");
      setSearchID("");
      setDisplayResults(false);
      setMoved(true);
      setSource({
        forane: '',
        parish: '',
        koottayma: '',
        family: ''
      });
      setDestination({
        forane: '',
        parish: '',
        koottayma: ''
      });
      
      setTimeout(() => window.location.reload(), 2000);
    } catch (error) {
      setError("Error moving family: " + error.message);
    } finally {
      setLoading(prev => ({ ...prev, move: false }));
    }
  };

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Typography variant="h4" component="h1" align="center" gutterBottom>
        Move Family
      </Typography>
      
      {(error || success) && (
        <Alert 
          severity={error ? "error" : "success"} 
          sx={{ mb: 3 }}
        >
          {error || success}
        </Alert>
      )}

      <Card>
        <CardContent>
          <Stack spacing={3}>
            <TextField
              label="Family ID"
              value={searchID}
              onChange={handleSearchInputChange}
              disabled={loading.fetch}
              sx={{ maxWidth: 300 }}
              helperText="Enter Family ID and press SPACE"
            />

            {loading.fetch ? (
              <Box display="flex" justifyContent="center" p={3}>
                <CircularProgress />
              </Box>
            ) : displayResults && sourceData.persons.length > 0 && !moved && (
              <>
                <Typography variant="h6">Family Members</Typography>
                
                <MaterialReactTable
                  columns={columns}
                  data={sourceData.persons}
                  enableTopToolbar={false}
                  enableBottomToolbar={false}
                  enableColumnResizing
                  enableFullScreenToggle={false}
                  enableDensityToggle={false}
                  enableHiding={false}
                />
                
                <Card variant="outlined">
                  <CardContent>
                    <Typography variant="h6" gutterBottom>
                      Destination Location
                    </Typography>
                    
                    <Stack spacing={2}>
                      <FormControl fullWidth>
                        <InputLabel>New Forane</InputLabel>
                        <Select
                          value={destination.forane}
                          onChange={handleDestinationChange('forane')}
                          label="New Forane"
                        >
                          {destinationData.foranes.map((forane) => (
                            <MenuItem key={forane._id} value={forane._id}>
                              {forane.name}
                            </MenuItem>
                          ))}
                        </Select>
                      </FormControl>

                      {destination.forane && (
                        <FormControl fullWidth>
                          <InputLabel>New Parish</InputLabel>
                          <Select
                            value={destination.parish}
                            onChange={handleDestinationChange('parish')}
                            label="New Parish"
                          >
                            {destinationData.parishes.map((parish) => (
                              <MenuItem key={parish._id} value={parish._id}>
                                {parish.name}
                              </MenuItem>
                            ))}
                          </Select>
                        </FormControl>
                      )}

                      {destination.parish && (
                        <FormControl fullWidth>
                          <InputLabel>New Koottayma</InputLabel>
                          <Select
                            value={destination.koottayma}
                            onChange={handleDestinationChange('koottayma')}
                            label="New Koottayma"
                          >
                            {destinationData.koottaymas.map((koottayma) => (
                              <MenuItem key={koottayma._id} value={koottayma.koottaymaId}>
                                {koottayma.name}
                              </MenuItem>
                            ))}
                          </Select>
                        </FormControl>
                      )}
                    </Stack>

                    <Box display="flex" justifyContent="center" mt={3}>
                      <Button
                        variant="contained"
                        onClick={handleMove}
                        disabled={!destination.forane || !destination.parish || !destination.koottayma || loading.move}
                        color="primary"
                      >
                        {loading.move ? <CircularProgress size={24} /> : 'Move Family'}
                      </Button>
                    </Box>
                  </CardContent>
                </Card>
              </>
            )}
          </Stack>
        </CardContent>
      </Card>
    </Container>
  );
};

export default MoveFamily;