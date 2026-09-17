import React, { useState, useEffect, useMemo } from "react";
import { MaterialReactTable } from 'material-react-table';
import axiosInstance from "../axiosConfig";
import Select from 'react-select';
import { 
  createTheme, 
  ThemeProvider, 
  CssBaseline,
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
  Paper,
  CircularProgress
} from '@mui/material';
import { styled } from '@mui/material/styles';
import {
  Plus,
  Pencil,
  Trash2,
  FileDown,
  RefreshCw
} from 'lucide-react';
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

// Styled Components
const StyledPaper = styled(Paper)(({ theme }) => ({
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

const StyledSelect = styled(Select)(({ theme }) => ({
  '& .select__control': {
    borderRadius: 8,
    borderColor: theme.palette.divider,
    minHeight: '56px',
    boxShadow: 'none',
    '&:hover': {
      borderColor: theme.palette.primary.main,
    },
    '&.select__control--is-focused': {
      borderColor: theme.palette.primary.main,
      boxShadow: `0 0 0 3px ${theme.palette.primary.light}20`,
    }
  },
  '& .select__menu': {
    borderRadius: 8,
    boxShadow: '0 4px 6px rgba(0,0,0,0.1)',
  }
}));

const Parish = () => {
  const [foranes, setForanes] = useState([]);
  const [parishes, setParishes] = useState([]);
  const [selectedForane, setSelectedForane] = useState(null);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [editingParish, setEditingParish] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
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

  useEffect(() => {
    fetchForanes();
  }, []);

  useEffect(() => {
    if (selectedForane) fetchParishes(selectedForane.value);
  }, [selectedForane]);

  const fetchForanes = async () => {
    try {
      const response = await axiosInstance.get("/forane");
      const foraneOptions = response.data.map(forane => ({
        value: forane._id,
        label: forane.name,
      }));
      setForanes(foraneOptions);
    } catch (err) {
      console.error("Failed to fetch Foranes");
    }
  };

  const fetchParishes = async (foraneId) => {
    setIsLoading(true);
    try {
      const response = await axiosInstance.get(`/parish/forane/${foraneId}`);
      setParishes(response.data || []);
    } catch (err) {
      console.error("Failed to fetch Parishes");
    } finally {
      setIsLoading(false);
    }
  };

  const handleModalOpen = (parish = null) => {
    if (parish) {
      setEditingParish(parish);
      setFormData(parish);
    } else {
      resetForm();
    }
    setIsModalVisible(true);
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
    setEditingParish(null);
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      if (editingParish) {
        await axiosInstance.put(`/parish/${editingParish._id}`, formData);
      } else {
        await axiosInstance.post("/parish", { ...formData, forane: selectedForane.value });
      }
      fetchParishes(selectedForane.value);
      setIsModalVisible(false);
      resetForm();
    } catch (err) {
      console.error("Failed to save Parish");
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async (parishId) => {
    if (window.confirm("Are you sure you want to delete this parish?")) {
      try {
        await axiosInstance.delete(`/parish/${parishId}`);
        fetchParishes(selectedForane.value);
      } catch (error) {
        console.error("Error deleting parish:", error);
      }
    }
  };

  const handleExportRows = (rows) => {
    if (!rows.length) return;
    
    const doc = new jsPDF();
    const tableData = rows.map((row) => [
      row.original.name,
      row.original.phone,
      row.original.building,
      row.original.street,
      row.original.city,
      row.original.district,
      row.original.state,
      row.original.pincode
    ]);
    
    const tableHeaders = [
      'Name',
      'Phone',
      'Building',
      'Street',
      'City',
      'District',
      'State',
      'Pincode'
    ];
    
    autoTable(doc, {
      head: [tableHeaders],
      body: tableData,
      styles: { fontSize: 8 },
      headStyles: { fillColor: [66, 102, 242], textColor: 255 },
      startY: 20,
    });
    
    doc.text('Parish Management Report', 14, 15);
    doc.save('parishes.pdf');
  };

  const columns = useMemo(
    () => [
      {
        accessorKey: 'name',
        header: 'Name',
      },
      {
        accessorKey: 'phone',
        header: 'Phone',
      },
      {
        accessorKey: 'building',
        header: 'Building',
      },
      {
        accessorKey: 'street',
        header: 'Street',
      },
      {
        accessorKey: 'city',
        header: 'City',
      },
      {
        id: 'actions',
        header: 'Actions',
        Cell: ({ row }) => (
          <Box sx={{ display: 'flex', gap: 1 }}>
            <Tooltip title="Edit">
              <IconButton
                sx={{
                  backgroundColor: theme.palette.primary.light + '20',
                  '&:hover': {
                    backgroundColor: theme.palette.primary.light + '30'
                  }
                }}
                onClick={() => handleModalOpen(row.original)}
                size="small"
              >
                <Pencil size={18} color={theme.palette.primary.main} />
              </IconButton>
            </Tooltip>
            <Tooltip title="Delete">
              <IconButton
                sx={{
                  backgroundColor: 'rgb(254, 226, 226)',
                  '&:hover': {
                    backgroundColor: 'rgb(254, 202, 202)'
                  }
                }}
                onClick={() => handleDelete(row.original._id)}
                size="small"
              >
                <Trash2 size={18} color="rgb(220, 38, 38)" />
              </IconButton>
            </Tooltip>
          </Box>
        ),
      },
    ],
    []
  );

  const formFields = [
    { name: 'name', label: 'Parish Name' },
    { name: 'phone', label: 'Phone' },
    { name: 'building', label: 'Building' },
    { name: 'street', label: 'Street' },
    { name: 'city', label: 'City' },
    { name: 'district', label: 'District' },
    { name: 'state', label: 'State' },
    { name: 'pincode', label: 'Pincode' }
  ];

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      
      <Box sx={{ 
        p: 3, 
        bgcolor: 'background.default', 
        minHeight: '100vh',
        background: 'linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%)'
      }}>
        <StyledPaper sx={{ p: 3, mb: 3 }}>
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
                        Parish Management
                      </Typography>
                     
                    </Box>
                   
                  </Box>
                </StyledPaper>
      
        
        <StyledPaper sx={{ p: 3, mb: 3 }}>
          <Box sx={{ mb: 3 }}>
            <StyledSelect
              placeholder="Select a Forane"
              value={selectedForane}
              onChange={setSelectedForane}
              options={foranes}
              isClearable
              className="select"
              styles={{
                container: base => ({
                  ...base,
                  width: '100%'
                }),
                menuPortal: base => ({
                  ...base,
                  zIndex: 9999
                })
              }}
              menuPortalTarget={document.body}
              menuPosition="fixed"
            />
          </Box>

          <Box sx={{ mb: 3, display: 'flex', gap: 2 }}>
            <GradientButton
              startIcon={<Plus size={18} />}
              onClick={() => handleModalOpen()}
              disabled={!selectedForane}
            >
              Add Parish
            </GradientButton>
          </Box>

          <MaterialReactTable
            columns={columns}
            data={parishes}
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
              <Box sx={{ display: 'flex', gap: 2, alignItems: 'center' }}>
                <Tooltip title="Refresh Data">
                  <IconButton 
                    onClick={() => selectedForane && fetchParishes(selectedForane.value)}
                    disabled={!selectedForane}
                    size="small"
                    sx={{
                      backgroundColor: theme.palette.primary.light + '20',
                      '&:hover': {
                        backgroundColor: theme.palette.primary.light + '30'
                      }
                    }}
                  >
                    <RefreshCw size={18} color={theme.palette.primary.main} />
                  </IconButton>
                </Tooltip>
                <Button
                  variant="outlined"
                  onClick={() => {
                    const selectedRows = table.getSelectedRowModel().rows;
                    handleExportRows(selectedRows);
                  }}
                  startIcon={<FileDown size={18} />}
                  disabled={!table.getSelectedRowModel().rows.length}
                  sx={{ 
                    borderRadius: 2,
                    textTransform: 'none',
                    fontWeight: 600
                  }}
                >
                  Export Selected to PDF
                </Button>
              </Box>
            )}
            muiTablePaperProps={{
              elevation: 0,
              sx: {
                borderRadius: 2,
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
        </StyledPaper>

        <Dialog 
          open={isModalVisible}
          onClose={() => {
            setIsModalVisible(false);
            resetForm();
          }}
          maxWidth="md"
          fullWidth
          PaperProps={{
            sx: {
              borderRadius: 2,
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
              {editingParish ? "Edit Parish" : "Add Parish"}
            </Typography>
            <Typography variant="body2" sx={{ 
              color: theme.palette.text.secondary,
              mt: 1
            }}>
              {editingParish 
                ? "Update the parish information below" 
                : "Fill in the details to create a new parish"}
            </Typography>
          </DialogTitle>
          <form onSubmit={handleSubmit}>
            <DialogContent sx={{ p: 3 }}>
              <Grid container spacing={3}>
                {formFields.map((field) => (
                  <Grid item xs={12} sm={6} key={field.name}>
                    <TextField
                      name={field.name}
                      label={field.label}
                      value={formData[field.name]}
                      onChange={handleInputChange}
                      fullWidth
                      required
                      variant="outlined"
                      sx={{
                        '& .MuiOutlinedInput-root': {
                          borderRadius: 8,
                        }
                      }}
                    />
                  </Grid>
                ))}
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
                  editingParish ? 'Update' : 'Save'
                )}
              </GradientButton>
            </DialogActions>
          </form>
        </Dialog>
      </Box>
    </ThemeProvider>
  );
};

export default Parish;