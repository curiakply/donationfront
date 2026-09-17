import React from 'react';
import { 
  Grid, 
  Typography, 
  Paper, 
  Stack, 
  Button, 
  Box, 
  Tooltip, 
  IconButton 
} from '@mui/material';
import MoveIcon from '@mui/icons-material/SwapHoriz';
import HistoryIcon from '@mui/icons-material/History';
import SaveIcon from '@mui/icons-material/Save';

const FamilyActionSection = ({ 
  selectedFamily, 
  onMove, 
  onPersonMovements, 
  onFamilyMovements, 
  onStatusHistory, 
  onSaveTransactions 
}) => {
  return (
    <Grid item xs={12}>
      <Paper 
        elevation={3} 
        sx={{ 
          p: 3, 
          borderRadius: 3, 
          background: 'linear-gradient(145deg, #f0f4f8 0%, #e6eaf0 100%)',
          boxShadow: '0 4px 6px rgba(0,0,0,0.1)'
        }}
      >
        <Typography 
          variant="h6" 
          color="primary" 
          gutterBottom 
          sx={{ 
            mb: 2, 
            fontWeight: 'bold', 
            textAlign: 'center' 
          }}
        >
          Family Actions
        </Typography>

        <Stack 
          direction={{ xs: 'column', sm: 'row' }} 
          spacing={2} 
          justifyContent="center"
        >
          <Tooltip title="Move Family">
            <Button
              fullWidth
              variant="contained"
              color="primary"
              startIcon={<MoveIcon />}
              onClick={onMove}
              disabled={!selectedFamily}
              sx={{
                borderRadius: 2,
                textTransform: 'none',
                py: 1.5
              }}
            >
              Move Family
            </Button>
          </Tooltip>

          <Tooltip title="Person Movement History">
            <Button
              fullWidth
              variant="outlined"
              color="secondary"
              startIcon={<HistoryIcon />}
              onClick={onPersonMovements}
              sx={{
                borderRadius: 2,
                textTransform: 'none',
                py: 1.5
              }}
            >
              Person Movements
            </Button>
          </Tooltip>

          <Tooltip title="Family Movement History">
            <Button
              fullWidth
              variant="outlined"
              color="secondary"
              startIcon={<HistoryIcon />}
              onClick={onFamilyMovements}
              sx={{
                borderRadius: 2,
                textTransform: 'none',
                py: 1.5
              }}
            >
              Family Movements
            </Button>
          </Tooltip>

          <Tooltip title="Status History">
            <Button
              fullWidth
              variant="outlined"
              color="secondary"
              startIcon={<HistoryIcon />}
              onClick={onStatusHistory}
              sx={{
                borderRadius: 2,
                textTransform: 'none',
                py: 1.5
              }}
            >
              Status History
            </Button>
          </Tooltip>
        </Stack>

        <Box 
          sx={{ 
            mt: 2, 
            display: 'flex', 
            justifyContent: 'center' 
          }}
        >
          <Tooltip title="Save Current Transactions">
            <Button
              variant="contained"
              color="success"
              startIcon={<SaveIcon />}
              onClick={onSaveTransactions}
              sx={{
                borderRadius: 2,
                textTransform: 'none',
                px: 4
              }}
            >
              Save Transactions
            </Button>
          </Tooltip>
        </Box>
      </Paper>
    </Grid>
  );
};

export default FamilyActionSection;