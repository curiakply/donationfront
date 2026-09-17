// components/FamilyActionsPanel.jsx
import React from 'react';
import {
  Paper,
  Button,
  Stack,
} from '@mui/material';
import {
  Print as PrintIcon,
  SwapHoriz as MoveIcon,
  History as HistoryIcon,
} from '@mui/icons-material';
import { styled } from '@mui/material/styles';

const ActionButton = styled(Button)(({ theme }) => ({
  borderRadius: theme.spacing(2),
  padding: theme.spacing(1.5),
  textTransform: 'none',
  fontWeight: 600,
  '&:hover': {
    transform: 'translateY(-2px)',
    boxShadow: '0 4px 8px rgba(0,0,0,0.1)',
  },
  transition: 'all 0.3s ease',
}));

const FamilyActionsPanel = ({
  onMove,
  onShowMovements,
  onPrint,
  onShowHistory
}) => {
  return (
    <Paper 
      elevation={3}
      sx={{
        p: 3,
        my: 2,
        borderRadius: 3,
        background: 'linear-gradient(145deg, #f8f8f8 0%, #f2f4f6 100%)',
      }}
    >
      <Stack
        direction={{ xs: 'column', sm: 'row' }}
        spacing={2}
        justifyContent="center"
        alignItems="stretch"
      >
        <ActionButton
          variant="contained"
          color="primary"
          startIcon={<MoveIcon />}
          onClick={onMove}
          fullWidth
        >
          Move Family
        </ActionButton>

        <ActionButton
          variant="outlined"
          color="secondary"
          startIcon={<HistoryIcon />}
          onClick={onShowMovements}
          fullWidth
        >
          Movement History
        </ActionButton>

        <ActionButton
          variant="outlined"
          color="secondary"
          startIcon={<HistoryIcon />}
          onClick={onShowHistory}
          fullWidth
        >
          Status History
        </ActionButton>

        <ActionButton
          variant="contained"
          color="primary"
          startIcon={<PrintIcon />}
          onClick={onPrint}
          fullWidth
        >
          Print Details
        </ActionButton>
      </Stack>
    </Paper>
  );
};

export default FamilyActionsPanel;