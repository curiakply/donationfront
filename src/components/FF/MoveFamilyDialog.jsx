// dialogs/MoveFamilyDialog.jsx
import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Box,
  Alert,
} from '@mui/material';
import axiosInstance from '../../axiosConfig';

const MoveFamilyDialog = ({
  open,
  onClose,
  selectedFamily,
  onMove,
}) => {
  const [destinationParish, setDestinationParish] = useState('');
  const [destinationKoottayma, setDestinationKoottayma] = useState('');
  const [parishes, setParishes] = useState([]);
  const [koottaymas, setKoottaymas] = useState([]);
  const [error, setError] = useState(null);
  const [isMoving, setIsMoving] = useState(false);

  useEffect(() => {
    if (open) {
      fetchParishes();
    }
  }, [open]);

  useEffect(() => {
    if (destinationParish) {
      fetchKoottaymas(destinationParish);
    }
  }, [destinationParish]);

  const fetchParishes = async () => {
    try {
      const response = await axiosInstance.get('/parish');
      setParishes(response.data || []);
    } catch (error) {
      setError('Failed to fetch parishes');
    }
  };

  const fetchKoottaymas = async (parishId) => {
    try {
      const response = await axiosInstance.get(`/koottayma/parish/${parishId}`);
      setKoottaymas(response.data);
    } catch (error) {
      setError('Failed to fetch koottaymas');
    }
  };

  const handleMove = async () => {
    if (!destinationParish || !destinationKoottayma) {
      setError('Please select both parish and koottayma');
      return;
    }

    setIsMoving(true);
    setError(null);

    try {
      // Get destination forane
      const foraneResponse = await axiosInstance.get(`/parish/getforane/${destinationParish}`);
      const destinationForane = foraneResponse.data.forane;

      // Update family location
      await axiosInstance.put(`/family/${selectedFamily.id}`, {
        parish: destinationParish,
        koottayma: destinationKoottayma,
        forane: destinationForane._id
      });

      // Create movement record
      await axiosInstance.post('/family-movements', {
        family: selectedFamily.id,
        familyName: selectedFamily.name,
        familyNumber: selectedFamily.familyNumber,
        destinationParish,
        destinationKoottayma,
        movedDate: new Date(),
        status: 'completed'
      });

      onMove();
    } catch (error) {
      setError(error.response?.data?.message || 'Failed to move family');
    } finally {
      setIsMoving(false);
    }
  };

  const handleClose = () => {
    setDestinationParish('');
    setDestinationKoottayma('');
    setError(null);
    onClose();
  };

  return (
    <Dialog open={open} onClose={handleClose} maxWidth="sm" fullWidth>
      <DialogTitle>Move Family</DialogTitle>
      <DialogContent>
        <Box sx={{ mt: 2 }}>
          {error && (
            <Alert severity="error" sx={{ mb: 2 }}>
              {error}
            </Alert>
          )}
          
          <FormControl fullWidth sx={{ mb: 2 }}>
            <InputLabel>Destination Parish</InputLabel>
            <Select
              value={destinationParish}
              onChange={(e) => {
                setDestinationParish(e.target.value);
                setDestinationKoottayma('');
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

          <FormControl fullWidth>
            <InputLabel>Destination Koottayma</InputLabel>
            <Select
              value={destinationKoottayma}
              onChange={(e) => setDestinationKoottayma(e.target.value)}
              label="Destination Koottayma"
              disabled={!destinationParish}
            >
              {koottaymas.map((koottayma) => (
                <MenuItem key={koottayma.koottaymaId} value={koottayma.koottaymaId}>
                  {koottayma.name}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </Box>
      </DialogContent>
      <DialogActions>
        <Button onClick={handleClose}>Cancel</Button>
        <Button
          onClick={handleMove}
          variant="contained"
          disabled={!destinationParish || !destinationKoottayma || isMoving}
        >
          {isMoving ? 'Moving...' : 'Move'}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default MoveFamilyDialog;