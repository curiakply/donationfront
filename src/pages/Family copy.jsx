import React, { useState, useEffect, useMemo, useCallback } from "react";
import { MaterialReactTable } from 'material-react-table';
import axiosInstance from "../axiosConfig";
import Select from "react-select";
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
  Box,
  Typography,
  IconButton,
  Tooltip,
  Grid,
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
const StyledPaper = styled(Box)(({ theme }) => ({
  backgroundColor: '#ffffff',
  borderRadius: 12,
  boxShadow: '0 4px 6px rgba(0,0,0,0.1)',
  padding: theme.spacing(3),
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

const Family = () => {
  const [families, setFamilies] = useState([]);
  const [foranes, setForanes] = useState([]);
  const [parishes, setParishes] = useState([]);
  const [koottaymas, setKoottaymas] = useState([]);
  const [selectedForane, setSelectedForane] = useState(null);
  const [selectedParish, setSelectedParish] = useState(null);
  const [selectedKoottayma, setSelectedKoottayma] = useState(null);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    building: "",
    phone: "",
    street: "",
    city: "",
    district: "",
    pincode: "",
  });

  useEffect(() => {
    fetchParishes();
  }, []);

  useEffect(() => {
    if (selectedParish) {
      const loadParishData = async () => {
        try {
          // Run both API calls in parallel
          const [foraneResponse, koottaymaResponse] = await Promise.all([
            axiosInstance.get(`/parish/${selectedParish.value}`),
            axiosInstance.get(`/koottayma/parish/${selectedParish.value}`)
          ]);
  
          // Process forane data
          if (foraneResponse.data?.forane) {
            const forane = foraneResponse.data.forane;
            const foraneOption = { value: forane._id, label: forane.name };
            
            // Batch state updates for forane
            setForanes([foraneOption]);
            setSelectedForane(foraneOption);
          }
  
          // Process koottayma data
          setKoottaymas(koottaymaResponse.data || []);
          
          // Reset koottayma selection when parish changes
          setSelectedKoottayma(null);
          
        } catch (error) {
          console.error("Error loading parish data:", error);
        }
      };
  
      loadParishData();
    } else {
      // Reset all dependent states when no parish is selected
      setForanes([]);
      setSelectedForane(null);
      setKoottaymas([]);
      setSelectedKoottayma(null);
    }
  }, [selectedParish]);

  useEffect(() => {
    if (selectedKoottayma) {
      fetchFamilies(selectedKoottayma);
    }
  }, [selectedKoottayma]);

  const fetchParishes = async () => {
    try {
      const response = await axiosInstance.get("/parish/search");
      const parishList = response.data.map(parish => ({
        value: parish._id,
        label: parish.name
      }));
      
      // Batch updates together
      setParishes(parishList);
      if (parishList.length > 0) {
        const defaultParish = parishList[0];
        setSelectedParish(defaultParish);
      }
    } catch (error) {
      console.error("Failed to fetch parishes:", error);
    }
  };

  const fetchForanes = async (parishId) => {
    try {
      const response = await axiosInstance.get(`/parish/${parishId}`);
      if (response.data?.forane) {
        const forane = response.data.forane;
        setForanes([{ value: forane._id, label: forane.name }]);
        setSelectedForane({ value: forane._id, label: forane.name });
      }
    } catch (error) {
      console.error("Error fetching foranes:", error);
    }
  };

  const fetchKoottaymas = async (parishId) => {
    try {
      const response = await axiosInstance.get(`/koottayma/parish/${parishId}`);
      setKoottaymas(response.data || []);
    } catch (error) {
      console.error("Failed to fetch Koottaymas:", error);
    }
  };

  const fetchFamilies = async (koottaymaId) => {
    if (!koottaymaId) return;
    setIsLoading(true);
    try {
      const response = await axiosInstance.get(`/family/kottayma/${koottaymaId}`);
      setFamilies(response.data || []);
    } catch (error) {
      console.error("Failed to fetch families:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      if (isEditing) {
        await axiosInstance.put(`/family/${formData.id}`, formData);
      } else {
        await axiosInstance.post("/family", {
          ...formData,
          forane: selectedForane.value,
          parish: selectedParish.value,
          koottayma: selectedKoottayma
        });
      }
      fetchFamilies(selectedKoottayma);
      handleCloseModal();
    } catch (error) {
      console.error("Error saving family:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleEdit = useCallback((family) => {
    setFormData({
      ...family,
      id: family._id
    });
    setIsEditing(true);
    setIsModalVisible(true);
  }, []);

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this family?")) return;
    try {
      await axiosInstance.delete(`/family/${id}`);
      fetchFamilies(selectedKoottayma);
    } catch (error) {
      console.error("Error deleting family:", error);
    }
  };
//   const handleDelete =useCallback(async (id) => {
//   if (!window.confirm("Are you sure you want to delete this family?")) return;
  
//   try {
//     // Soft delete by updating status to 'deleted'
//     await axiosInstance.put(`/family/${id}`, { 
//       status: 'deleted' 
//     });
    
//     fetchFamilies(selectedKoottayma);
    
//   } catch (error) {
//     console.error("Error deleting family:", error);
//   }
// }, [selectedKoottayma]);

  const handleCloseModal = () => {
    setIsModalVisible(false);
    setIsEditing(false);
    setFormData({
      name: "",
      building: "",
      phone: "",
      street: "",
      city: "",
      district: "",
      pincode: "",
    });
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
      row.original.pincode
    ]);
    
    const tableHeaders = [
      'Name',
      'Phone',
      'Building',
      'Street',
      'City',
      'District',
      'Pincode'
    ];
    
    doc.text('Family Management Report', 14, 15);
    
    autoTable(doc, {
      head: [tableHeaders],
      body: tableData,
      styles: { fontSize: 8 },
      headStyles: { fillColor: [66, 102, 242], textColor: 255 },
      startY: 20,
    });
    
    doc.save('families.pdf');
  };

  const columns = useMemo(() => [
    { accessorKey: 'name', header: 'Name' },
    { accessorKey: 'phone', header: 'Phone' },
    { accessorKey: 'building', header: 'Building' },
    { accessorKey: 'city', header: 'City' },
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
              onClick={() => handleEdit(row.original)}
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
  ], [handleEdit, handleDelete]);

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Box sx={{ 
        p: 3, 
        bgcolor: 'background.default', 
        minHeight: '100vh',
        background: 'linear-gradient(135deg,rgb(255, 255, 255) 0%,rgb(255, 255, 255) 100%)'
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
                               Family Management
                             </Typography>
                            
                           </Box>
                          
                         </Box>
                       </StyledPaper>

        <StyledPaper sx={{ mb: 3 }}>
          <Grid container spacing={2} alignItems="center">
            <Grid item xs={12} sm={3}>
              <StyledSelect
                options={parishes}
                placeholder="Select Parish"
                value={selectedParish}
                onChange={setSelectedParish}
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
            </Grid>
            {selectedParish && (
              <Grid item xs={12} sm={3}>
                <StyledSelect
                  value={selectedForane}
                  options={foranes}
                  isDisabled
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
              </Grid>
            )}
            {selectedParish && (
              <Grid item xs={12} sm={3}>
                <StyledSelect
                  options={koottaymas.map(k => ({ value: k.koottaymaId, label: k.name }))}
                  value={selectedKoottayma ? { value: selectedKoottayma, label: koottaymas.find(k => k.koottaymaId === selectedKoottayma)?.name } : null}
                  onChange={(option) => setSelectedKoottayma(option?.value)}
                  placeholder="Select Koottayma"
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
              </Grid>
            )}
            <Grid item xs={12} sm={3}>
              <GradientButton
                startIcon={<Plus size={18} />}
                onClick={() => setIsModalVisible(true)}
                disabled={!selectedKoottayma}
                fullWidth
              >
                Add Family
              </GradientButton>
            </Grid>
          </Grid>
        </StyledPaper>

        <StyledPaper>
          <MaterialReactTable
            columns={columns}
            data={families}
            enableColumnFiltering
            enableGlobalFilter
            enableColumnOrdering
            enablePagination
            enableSorting
            enableRowSelection
            enableColumnResizing
            positionToolbarAlertBanner="bottom"
            state={{ isLoading }}
            renderTopToolbarCustomActions={({ table }) => (
              <Box sx={{ display: 'flex', gap: 2, alignItems: 'center' }}>
                <Tooltip title="Refresh Data">
                  <IconButton
                    onClick={() => selectedKoottayma && fetchFamilies(selectedKoottayma)}
                    disabled={!selectedKoottayma}
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
                  onClick={() => handleExportRows(table.getSelectedRowModel().rows)}
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
                  borderBottom: `1px solid ${theme.palette.divider}`,backgroundColor: 'white',
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
          onClose={handleCloseModal}
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
              {isEditing ? "Edit Family" : "Add Family"}
            </Typography>
            <Typography variant="body2" sx={{ 
              color: theme.palette.text.secondary,
              mt: 1
            }}>
              {isEditing 
                ? "Update the family information" 
                : "Create a new family entry"}
            </Typography>
          </DialogTitle>
          <form onSubmit={handleSubmit}>
            <DialogContent sx={{ p: 3 }}>
              <Grid container spacing={3}>
                <Grid item xs={12} sm={6}>
                  <TextField
                    name="name"
                    label="Name"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    fullWidth
                    required
                    variant="outlined"
                    sx={{
                      '& .MuiOutlinedInput-root': {
                        borderRadius: 8,
                      }
                    }}
                  />
                  <TextField
                    name="phone"
                    label="Phone"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    fullWidth
                    required
                    variant="outlined"
                    sx={{
                      '& .MuiOutlinedInput-root': {
                        borderRadius: 8,
                      },
                      mt: 2
                    }}
                  />
                  <TextField
                    name="building"
                    label="Building"
                    value={formData.building}
                    onChange={(e) => setFormData({ ...formData, building: e.target.value })}
                    fullWidth
                    required
                    variant="outlined"
                    sx={{
                      '& .MuiOutlinedInput-root': {
                        borderRadius: 8,
                      },
                      mt: 2
                    }}
                  />
                  <TextField
                    name="street"
                    label="Street"
                    value={formData.street}
                    onChange={(e) => setFormData({ ...formData, street: e.target.value })}
                    fullWidth
                    variant="outlined"
                    sx={{
                      '& .MuiOutlinedInput-root': {
                        borderRadius: 8,
                      },
                      mt: 2
                    }}
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    name="city"
                    label="City"
                    value={formData.city}
                    onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                    fullWidth
                    variant="outlined"
                    sx={{
                      '& .MuiOutlinedInput-root': {
                        borderRadius: 8,
                      }
                    }}
                  />
                  <TextField
                    name="district"
                    label="District"
                    value={formData.district}
                    onChange={(e) => setFormData({ ...formData, district: e.target.value })}
                    fullWidth
                    variant="outlined"
                    sx={{
                      '& .MuiOutlinedInput-root': {
                        borderRadius: 8,
                      },
                      mt: 2
                    }}
                  />
                  <TextField
                    name="pincode"
                    label="Pincode"
                    value={formData.pincode}
                    onChange={(e) => setFormData({ ...formData, pincode: e.target.value })}
                    fullWidth
                    variant="outlined"
                    sx={{
                      '& .MuiOutlinedInput-root': {
                        borderRadius: 8,
                      },
                      mt: 2
                    }}
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
                onClick={handleCloseModal}
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
      </Box>
    </ThemeProvider>
  );
};

export default Family;