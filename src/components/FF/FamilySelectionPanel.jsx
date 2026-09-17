// components/FamilySelectionPanel.jsx
import React, { useState, useEffect } from 'react';
import {
  Paper,
  FormControl,
  Typography,
  Box,
  RadioGroup,
  Radio,
  FormControlLabel,
} from '@mui/material';
import Select from 'react-select';
import { styled } from '@mui/material/styles';
import axiosInstance from '../../axiosConfig';
import FamilyDetailsCard from '../../pages/FamilyDetailsCard';

const StyledFormControl = styled(FormControl)(({ theme }) => ({
  marginBottom: theme.spacing(2),
  width: '100%'
}));

const FamilySelectionPanel = ({
  selectedParish,
  setSelectedParish,
  selectedKoottayma,
  setSelectedKoottayma,
  selectedFamily,
  setSelectedFamily
}) => {
  const [parishes, setParishes] = useState([]);
  const [koottaymas, setKoottaymas] = useState([]);
  const [currentView, setCurrentView] = useState('currentKootayma');
  const [families, setFamilies] = useState([]);

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
      fetchFamilies();
    }
  }, [selectedParish, selectedKoottayma, currentView]);

  const fetchParishes = async () => {
    try {
      const response = await axiosInstance.get('/parish');
      setParishes(response.data || []);
    } catch (error) {
      console.error('Error fetching parishes:', error);
    }
  };

  const fetchKoottaymas = async (parishId) => {
    try {
      const response = await axiosInstance.get(`/koottayma/parish/${parishId}`);
      setKoottaymas(response.data);
    } catch (error) {
      console.error('Error fetching koottaymas:', error);
    }
  };

  const fetchFamilies = async () => {
    try {
      let response;
      console.error(selectedKoottayma);
      if (currentView === 'currentKootayma') {
        response = await axiosInstance.get(`/family/kottayma/${selectedKoottayma}`);
      } else {
        response = await axiosInstance.get(`/family/parish/${selectedParish}`);
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
      console.error(familiesWithDetails);
      setFamilies(familiesWithDetails);
    } catch (error) {      
      console.error('Error fetching families:', error);
    }
  };

  return (
    <Box>
      <Paper sx={{ p: 2, mb: 2 }}>
        <StyledFormControl>
          <Select
            value={selectedParish ? { value: selectedParish, label: parishes.find(p => p._id === selectedParish)?.name } : null}
            onChange={(selectedOption) => setSelectedParish(selectedOption?.value || '')}
            options={parishes.map(parish => ({ value: parish._id, label: parish.name }))}
            placeholder="Select Church..."
            isClearable
            isSearchable
          />
        </StyledFormControl>

        <StyledFormControl>
          <Select
            value={selectedKoottayma ? { value: selectedKoottayma, label: koottaymas.find(k => k.koottaymaId === selectedKoottayma)?.name } : null}
            onChange={(selectedOption) => setSelectedKoottayma(selectedOption?.value || '')}
            options={koottaymas.map(koottayma => ({ value: koottayma.koottaymaId, label: koottayma.name }))}
            placeholder="Select Kootayma..."
            isClearable
            isSearchable
            isDisabled={!selectedParish}
          />
        </StyledFormControl>

        <RadioGroup
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
        </RadioGroup>
      </Paper>

      {selectedFamily && (
        <FamilyDetailsCard
          selectedFamily={selectedFamily}
        />
      )}
    </Box>
  );
};

export default FamilySelectionPanel;