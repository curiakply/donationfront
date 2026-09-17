import React, { useState, useEffect, useMemo } from "react";
import { MaterialReactTable } from 'material-react-table';
import Select from "react-select";
import axiosInstance from "../axiosConfig";
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
    zIndex: 9999,  // High z-index to appear above table
    position: 'absolute'
  },
  '& .select__menu-portal': {
    zIndex: 9999  // Ensure menu portal also has high z-index
  }
}));

const Koottayma = () => {
  const [koottaymas, setKoottaymas] = useState([]);
  const [foranes, setForanes] = useState([]);
  const [parishes, setParishes] = useState([]);
  const [selectedForane, setSelectedForane] = useState(null);
  const [selectedParish, setSelectedParish] = useState(null);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [editingKoottayma, setEditingKoottayma] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({ name: "" });

  useEffect(() => {
    fetchParishes();
  }, []);

  useEffect(() => {
    if (selectedParish) {
      fetchForanes(selectedParish.value);
      fetchKoottaymas(selectedParish.value);
    }
  }, [selectedParish]);

  const fetchParishes = async () => {
    try {
      const response = await axiosInstance.get("/parish/search");
      const parishList = response.data.map(parish => ({
        value: parish._id,
        label: parish.name
      }));
      setParishes(parishList);
      if (parishList.length > 0) {
        setSelectedParish(parishList[0]);
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
    setIsLoading(true);
    try {
      const response = await axiosInstance.get(`/koottayma/parish/${parishId}`);
      setKoottaymas(response.data);
    } catch (error) {
      console.error("Failed to fetch koottaymas:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      if (editingKoottayma) {
        await axiosInstance.put(`/koottayma/${editingKoottayma.koottaymaId}`, formData);
      } else {
        await axiosInstance.post("/koottayma", {
          ...formData,
          forane: selectedForane.value,
          parish: selectedParish.value,
        });
      }
      fetchKoottaymas(selectedParish.value);
      handleCloseModal();
    } catch (error) {
      console.error("Error saving koottayma:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (!id || !window.confirm("Are you sure you want to delete this koottayma?")) return;
    
    try {
      await axiosInstance.delete(`/koottayma/${id}`);
      fetchKoottaymas(selectedParish.value);
    } catch (error) {
      console.error("Error deleting koottayma:", error);
    }
  };

  const handleEdit = (koottayma) => {
    setEditingKoottayma(koottayma);
    setFormData({ name: koottayma.name });
    setIsModalVisible(true);
  };

  const handleCloseModal = () => {
    setEditingKoottayma(null);
    setFormData({ name: "" });
    setIsModalVisible(false);
  };

  const handleExportRows = (rows) => {
    if (!rows.length) return;
    
    const doc = new jsPDF();
    const tableData = rows.map(row => [row.original.name]);
    const tableHeaders = ['Name'];
    
    doc.text('Koottayma Management Report', 14, 15);
    
    autoTable(doc, {
      head: [tableHeaders],
      body: tableData,
      styles: { fontSize: 8 },
      headStyles: { fillColor: [66, 102, 242], textColor: 255 },
      startY: 20,
    });
    
    doc.save('koottaymas.pdf');
  };

  const columns = useMemo(() => [
    {
      accessorKey: 'name',
      header: 'Name',
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
              onClick={() => handleDelete(row.original.koottaymaId)}
              size="small"
            >
              <Trash2 size={18} color="rgb(220, 38, 38)" />
            </IconButton>
          </Tooltip>
        </Box>
      ),
    },
  ], []);

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
                                Koottayma Management
                              </Typography>
                             
                            </Box>
                           
                          </Box>
                        </StyledPaper>
    
        <StyledPaper sx={{ p: 3, mb: 3 }}>
          <Box sx={{ display: 'flex', gap: 2, flexDirection: { xs: 'column', sm: 'row' }, mb: 3 }}>
            <StyledSelect
              options={parishes}
              placeholder="Select Parish"
              onChange={setSelectedParish}
              value={selectedParish}
              className="select"
              styles={{
                container: base => ({
                  ...base,
                  width: '300px'
                }),
                menuPortal: base => ({
                  ...base,
                  zIndex: 9999
                })
              }}
              menuPortalTarget={document.body}
              menuPosition="fixed"
            />
            {selectedParish && (
              <StyledSelect
                value={selectedForane}
                onChange={setSelectedForane}
                options={foranes}
                isDisabled
                className="select"
                styles={{
                  container: base => ({
                    ...base,
                    width: '200px'
                  }),
                  menuPortal: base => ({
                    ...base,
                    zIndex: 9999
                  })
                }}
                menuPortalTarget={document.body}
                menuPosition="fixed"
              />
            )}
            <GradientButton
              startIcon={<Plus size={18} />}
              onClick={() => setIsModalVisible(true)}
              disabled={!selectedParish}
            >
              Add Koottayma
            </GradientButton>
          </Box>

          <MaterialReactTable
            columns={columns}
            data={koottaymas}
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
                    onClick={() => selectedParish && fetchKoottaymas(selectedParish.value)}
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

          <Dialog
            open={isModalVisible}
            onClose={handleCloseModal}
            maxWidth="sm"
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
                {editingKoottayma ? "Edit Koottayma" : "Add Koottayma"}
              </Typography>
              <Typography variant="body2" sx={{ 
                color: theme.palette.text.secondary,
                mt: 1
              }}>
                {editingKoottayma 
                  ? "Update the koottayma information" 
                  : "Create a new koottayma entry"}
              </Typography>
            </DialogTitle>
            <form onSubmit={handleSubmit}>
              <DialogContent sx={{ p: 3 }}>
                <TextField
                  name="name"
                  label="Name"
                  value={formData.name}
                  onChange={(e)  => setFormData({ name: e.target.value })}
                  fullWidth
                  required
                  margin="normal"
                  variant="outlined"
                  sx={{
                    '& .MuiOutlinedInput-root': {
                      borderRadius: 8,
                    }
                  }}
                />
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
                    editingKoottayma ? 'Update' : 'Save'
                  )}
                </GradientButton>
              </DialogActions>
            </form>
          </Dialog>
        </StyledPaper>
      </Box>
    </ThemeProvider>
  );
};

export default Koottayma;