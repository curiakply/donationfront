import React, { useState, useEffect, useMemo } from "react";
import { MaterialReactTable } from 'material-react-table';
import axiosInstance from "../axiosConfig";
import { 
  Button,
  TextField,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Grid,
  Box,
  Typography,
  IconButton,
  Tooltip,
  Card,
  Avatar,
  Fade,
  CircularProgress,
  Snackbar,
  Alert,
  CssBaseline,
  createTheme,
  ThemeProvider
} from '@mui/material';
import { styled } from '@mui/material/styles';
import { 
  FileDownload as FileDownloadIcon,
  Refresh as RefreshIcon,
  LocationOn,
  Phone,
  Business,
  Edit as EditIcon,
  Delete as DeleteIcon,
} from '@mui/icons-material';
import { Plus } from 'lucide-react';
import { jsPDF } from "jspdf";
import autoTable from 'jspdf-autotable';

// Theme configuration
const theme = createTheme({
  palette: {
    mode: 'light',
    primary: {
      main: '#2563EB',     // Vibrant Blue
      light: '#3B82F6',
      dark: '#1E40AF'
    },
    secondary: {
      main: '#10B981',     // Emerald Green
      light: '#34D399',
      dark: '#047857'
    },
    background: {
      default: '#F3F4F6',
      paper: '#FFFFFF'
    },
    text: {
      primary: '#1F2937',
      secondary: '#6B7280'
    }
  },
  typography: {
    fontFamily: [
      'Inter', 
      'system-ui', 
      '-apple-system', 
      'BlinkMacSystemFont', 
      'Segoe UI', 
      'Roboto', 
      'Helvetica Neue', 
      'Arial', 
      'sans-serif'
    ].join(','),
  },
  components: {
    MuiCard: {
      styleOverrides: {
        root: {
          borderRadius: 12,
          boxShadow: '0 4px 6px rgba(0,0,0,0.1)',
          transition: 'all 0.3s ease',
          '&:hover': {
            transform: 'translateY(-5px)',
            boxShadow: '0 8px 15px rgba(0,0,0,0.15)'
          }
        }
      }
    },
    MuiButton: {
      styleOverrides: {
        root: {
          textTransform: 'none',
          borderRadius: 8,
          padding: '10px 20px',
          fontWeight: 600
        }
      }
    }
  }
});

// Styled components
const StyledCard = styled(Card)(({ theme }) => ({
  borderRadius: 12,
  boxShadow: '0 4px 6px rgba(0,0,0,0.1)',
  transition: 'all 0.3s ease',
  '&:hover': {
    transform: 'translateY(-5px)',
    boxShadow: '0 8px 15px rgba(0,0,0,0.15)'
  }
}));

const GradientButton = styled(Button)(({ theme }) => ({
  background: `linear-gradient(to right, ${theme.palette.primary.light}, ${theme.palette.primary.main})`,
  color: 'white',
  '&:hover': {
    background: `linear-gradient(to right, ${theme.palette.primary.main}, ${theme.palette.primary.dark})`
  }
}));

const StyledTextField = styled(TextField)(({ theme }) => ({
  '& .MuiOutlinedInput-root': {
    borderRadius: 8,
    '& fieldset': {
      borderColor: theme.palette.divider,
    },
    '&:hover fieldset': {
      borderColor: theme.palette.primary.main,
    },
    '&.Mui-focused fieldset': {
      borderColor: theme.palette.primary.main,
    },
  },
}));

const Forane = () => {
  const [foranes, setForanes] = useState([]);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [selectedForane, setSelectedForane] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState(null);
  const [formData, setFormData] = useState({
    name: "",
    phone: "",
    building: "",
    street: "",
    city: "",
    district: "",
    state: "",
    pincode: ""
  });

  const handleExportRows = (rows) => {
    if (!rows.length) return;
    
    const doc = new jsPDF();
    const tableData = rows.map((row) => [
      row.original.name,
      row.original.phone,
      row.original.building,
      row.original.city,
      row.original.district,
      row.original.state,
      row.original.pincode
    ]);
    
    const tableHeaders = [
      'Name', 'Phone', 'Building', 'City', 'District', 'State', 'Pincode'
    ];
    
    autoTable(doc, {
      head: [tableHeaders],
      body: tableData,
      styles: { fontSize: 8 },
      headStyles: { fillColor: [66, 102, 242], textColor: 255 },
      startY: 20,
    });
    
    doc.text('Forane Management Report', 14, 15);
    doc.save('foranes.pdf');
  };

  useEffect(() => {
    fetchForanes();
  }, []);

  const fetchForanes = async () => {
    setIsLoading(true);
    try {
      const response = await axiosInstance.get("/forane/");
      setForanes(response.data);
      setMessage({
        type: 'success',
        text: 'Foranes fetched successfully'
      });
    } catch (error) {
      console.error("Error fetching foranes:", error);
      setMessage({
        type: 'error',
        text: 'Failed to fetch foranes'
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleEdit = (record) => {
    setIsModalVisible(true);
    setIsEditing(true);
    setSelectedForane(record);
    setFormData(record);
  };

  const handleDelete = async (id) => {
    if (window.confirm("Are you sure you want to delete this forane?")) {
      try {
        await axiosInstance.delete(`/forane/${id}`);
        fetchForanes();
        setMessage({
          type: 'success',
          text: 'Forane deleted successfully'
        });
      } catch (error) {
        console.error("Error deleting forane:", error);
        setMessage({
          type: 'error',
          text: 'Failed to delete forane'
        });
      }
    }
  };

  const handleFormSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      if (isEditing) {
        await axiosInstance.put(`/forane/${selectedForane._id}`, formData);
        setMessage({
          type: 'success',
          text: 'Forane updated successfully'
        });
      } else {
        await axiosInstance.post("/forane", formData);
        setMessage({
          type: 'success',
          text: 'Forane created successfully'
        });
      }
      fetchForanes();
      setIsModalVisible(false);
      resetForm();
    } catch (error) {
      console.error("Error saving forane:", error);
      setMessage({
        type: 'error',
        text: `Failed to ${isEditing ? 'update' : 'create'} forane`
      });
    } finally {
      setIsLoading(false);
    }
  };

  const resetForm = () => {
    setFormData({
      name: "",
      phone: "",
      building: "",
      street: "",
      city: "",
      district: "",
      state: "",
      pincode: ""
    });
    setIsEditing(false);
    setSelectedForane(null);
  };

  const columns = useMemo(
    () => [
      {
        accessorKey: 'name',
        header: 'Name',
        size: 200,
        Cell: ({ row }) => (
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            <Avatar
              sx={{
                bgcolor: theme.palette.primary.main,
                width: 40,
                height: 40,
              }}
            >
              {row.original.name.charAt(0)}
            </Avatar>
            <Box>
              <Typography variant="subtitle2" sx={{ 
                fontWeight: 600,
                color: theme.palette.text.primary,
              }}>
                {row.original.name}
              </Typography>
              <Typography variant="caption" sx={{ color: theme.palette.text.secondary }}>
                {row.original.city}, {row.original.state}
              </Typography>
            </Box>
          </Box>
        ),
      },
      {
        accessorKey: 'phone',
        header: 'Contact',
        size: 200,
        Cell: ({ row }) => (
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <Phone fontSize="small" sx={{ color: theme.palette.text.secondary }} />
            <Typography variant="body2" sx={{ color: theme.palette.text.primary }}>
              {row.original.phone}
            </Typography>
          </Box>
        ),
      },
      {
        accessorKey: 'location',
        header: 'Address',
        size: 250,
        Cell: ({ row }) => (
          <Box>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 0.5 }}>
              <Business fontSize="small" sx={{ color: theme.palette.text.secondary }} />
              <Typography variant="body2" sx={{ color: theme.palette.text.primary }}>
                {row.original.building}
              </Typography>
            </Box>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <LocationOn fontSize="small" sx={{ color: theme.palette.text.secondary }} />
              <Typography variant="body2" sx={{ color: theme.palette.text.secondary }}>
                {row.original.city}, {row.original.pincode}
              </Typography>
            </Box>
          </Box>
        ),
      },
      {
        id: 'actions',
        header: 'Actions',
        size: 120,
        Cell: ({ row }) => (
          <Box sx={{ display: 'flex', gap: 1 }}>
            <Tooltip title="Edit">
              <IconButton
                size="small"
                onClick={() => handleEdit(row.original)}
                sx={{
                  backgroundColor: theme.palette.primary.light + '20',
                  '&:hover': {
                    backgroundColor: theme.palette.primary.light + '30'
                  }
                }}
              >
                <EditIcon fontSize="small" sx={{ color: theme.palette.primary.main }} />
              </IconButton>
            </Tooltip>
            <Tooltip title="Delete">
              <IconButton
                size="small"
                onClick={() => handleDelete(row.original._id)}
                sx={{
                  backgroundColor: 'rgb(254, 226, 226)',
                  '&:hover': {
                    backgroundColor: 'rgb(254, 202, 202)'
                  }
                }}
              >
                <DeleteIcon fontSize="small" sx={{ color: 'rgb(220, 38, 38)' }} />
              </IconButton>
            </Tooltip>
          </Box>
        ),
      },
    ],
    []
  );

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Box sx={{ 
        p: 3, 
        bgcolor: 'background.default', 
        minHeight: '100vh',
        background: 'linear-gradient(135deg,rgb(255, 255, 255) 0%,rgb(255, 255, 255) 100%)'
      }}>
        <StyledCard sx={{ p: 3, mb: 3 }}>
          <Box sx={{ 
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center'
          }}>
            <Box>
              <Typography variant="h5" sx={{ 
                fontWeight: 700,
                color: theme.palette.text.primary,
                mb: 1
              }}>
                Forane Management
              </Typography>
              <Typography variant="body2" sx={{ color: theme.palette.text.secondary }}>
                Manage and organize all forane details in one place
              </Typography>
            </Box>
            <GradientButton
              startIcon={<Plus size={20} />}
              onClick={() => {
                setIsModalVisible(true);
                resetForm();
              }}
            >
              Add New Forane
            </GradientButton>
          </Box>
        </StyledCard>

        <StyledCard>
          <MaterialReactTable
            columns={columns}
            data={foranes}
            enableColumnFiltering
            enableGlobalFilter
            enableColumnOrdering
            enablePagination
            enableSorting
            enableRowSelection
            enableColumnResizing
            enableFullScreenToggle
            enableDensityToggle
            enableHiding
            positionToolbarAlertBanner="bottom"
            state={{ isLoading }}
            renderTopToolbarCustomActions={({ table }) => (
              <Box sx={{ display: 'flex', gap: 2, p: 2 }}>
                <IconButton 
                  onClick={fetchForanes}
                  sx={{
                    backgroundColor: theme.palette.primary.light + '20',
                    '&:hover': {
                      backgroundColor: theme.palette.primary.light + '30'
                    }
                  }}
                >
                  <RefreshIcon sx={{ color: theme.palette.primary.main }} />
                </IconButton>
                <Button
                  variant="outlined"
                  onClick={() => handleExportRows(table.getSelectedRowModel().rows)}
                  startIcon={<FileDownloadIcon />}
                  disabled={!table.getSelectedRowModel().rows.length}
                  sx={{ 
                    borderRadius: 8,
                    textTransform: 'none',
                    fontWeight: 600
                  }}
                >
                  Export Selected
                </Button>
              </Box>
            )}
            muiTablePaperProps={{
              elevation: 0,
              sx: {
                borderRadius: '12px',
                border: 'none',
                backgroundColor: 'white',
              },
            }}
            muiTableProps={{
              sx: {
                '& .MuiTableCell-root': {
                  borderBottom: `1px solid ${theme.palette.divider}`,
                  backgroundColor: 'white',
                },
              },
            }}
                          initialState={{
              density: 'comfortable',
              pagination: { pageSize: 10 }
            }}
          />
        </StyledCard>

        <Dialog 
          open={isModalVisible}
          onClose={() => {
            setIsModalVisible(false);
            resetForm();
          }}
          maxWidth="md"
          fullWidth
          TransitionComponent={Fade}
          PaperProps={{
            elevation: 0,
            sx: {
              borderRadius: '12px',
              bgcolor: '#ffffff',
              boxShadow: '0 10px 25px rgba(0,0,0,0.1)'
            }
          }}
        >
          <DialogTitle sx={{ 
            p: 3,
            borderBottom: `1px solid ${theme.palette.divider}`
          }}>
            <Typography variant="h6" sx={{ 
              fontWeight: 700,
              color: theme.palette.text.primary
            }}>
              {isEditing ? "Edit Forane Details" : "Add New Forane"}
            </Typography>
            <Typography variant="body2" sx={{ 
              color: theme.palette.text.secondary,
              mt: 1
            }}>
              {isEditing ? "Update the forane information below" : "Fill in the details to create a new forane"}
            </Typography>
          </DialogTitle>
          <form onSubmit={handleFormSubmit}>
            <DialogContent sx={{ p: 3 }}>
              <Grid container spacing={3}>
                <Grid item xs={12} sm={6}>
                  <StyledTextField
                    name="name"
                    label="Forane Name"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    fullWidth
                    required
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <StyledTextField
                    name="phone"
                    label="Phone Number"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    fullWidth
                    required
                  />
                </Grid>
                <Grid item xs={12}>
                  <StyledTextField
                    name="building"
                    label="Building Name"
                    value={formData.building}
                    onChange={(e) => setFormData({ ...formData, building: e.target.value })}
                    fullWidth
                    required
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <StyledTextField
                    name="street"
                    label="Street"
                    value={formData.street}
                    onChange={(e) => setFormData({ ...formData, street: e.target.value })}
                    fullWidth
                    required
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <StyledTextField
                    name="city"
                    label="City"
                    value={formData.city}
                    onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                    fullWidth
                    required
                  />
                </Grid>
                <Grid item xs={12} sm={4}>
                  <StyledTextField
                    name="district"
                    label="District"
                    value={formData.district}
                    onChange={(e) => setFormData({ ...formData, district: e.target.value })}
                    fullWidth
                    required
                  />
                </Grid>
                <Grid item xs={12} sm={4}>
                  <StyledTextField
                    name="state"
                    label="State"
                    value={formData.state}
                    onChange={(e) => setFormData({ ...formData, state: e.target.value })}
                    fullWidth
                    required
                  />
                </Grid>
                <Grid item xs={12} sm={4}>
                  <StyledTextField
                    name="pincode"
                    label="Pincode"
                    value={formData.pincode}
                    onChange={(e) => setFormData({ ...formData, pincode: e.target.value })}
                    fullWidth
                    required
                  />
                </Grid>
              </Grid>
            </DialogContent>
            <DialogActions sx={{ 
              p: 3, 
              borderTop: `1px solid ${theme.palette.divider}`,
              gap: 2
            }}>
              <Button
                variant="outlined"
                onClick={() => {
                  setIsModalVisible(false);
                  resetForm();
                }}
                sx={{ 
                  borderRadius: 8,
                  textTransform: 'none',
                  fontWeight: 600
                }}
              >
                Cancel
              </Button>
              <GradientButton
                type="submit"
                disabled={isLoading}
              >
                {isLoading ? (
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <CircularProgress size={20} color="inherit" />
                    <span>Saving...</span>
                  </Box>
                ) : (
                  isEditing ? 'Update' : 'Save'
                )}
              </GradientButton>
            </DialogActions>
          </form>
        </Dialog>

        <Snackbar
          open={Boolean(message)}
          autoHideDuration={6000}
          onClose={() => setMessage(null)}
          anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
        >
          <Alert 
            onClose={() => setMessage(null)} 
            severity={message?.type || 'info'}
            variant="filled"
            sx={{ 
              borderRadius: '8px',
              backgroundColor: message?.type === 'error' 
                ? theme.palette.error.main 
                : theme.palette.primary.main,
            }}
          >
            {message?.text}
          </Alert>
        </Snackbar>
      </Box>
    </ThemeProvider>
  );
};

export default Forane;