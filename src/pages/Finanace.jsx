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
  Box,
  Typography,
  IconButton,
  Tooltip,
  Paper,
  Grid,
  MenuItem,
  CircularProgress
} from '@mui/material';
import { styled } from '@mui/material/styles';
import { Download, RefreshCw, Plus, Pencil, Trash2 } from "lucide-react";
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

// Relation Options
const relationOptions = [
  { value: "head", label: "Head" },
  { value: "wife", label: "Wife" },
  { value: "husband", label: "Husband" },
  { value: "son", label: "Son" },
  { value: "daughter", label: "Daughter" },
  { value: "father", label: "Father" },
  { value: "mother", label: "Mother" },
  { value: "brother", label: "Brother" },
  { value: "son in law", label: "Son In Law" },
  { value: "daughter in law", label: "Daughter In Law" },
  { value: "grandson", label: "Grandson" },
  { value: "granddaughter", label: "Granddaughter" }
];

// Styled Components
const StyledPaper = styled(Paper)(({ theme }) => ({
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
    zIndex: 9999
  },
  '& .select__menu-portal': {
    zIndex: 9999
  }
}));


const PersonManagement = () => {
  const [foranes, setForanes] = useState([]);
  const [parishes, setParishes] = useState([]);
  const [koottaymas, setKoottaymas] = useState([]);
  const [families, setFamilies] = useState([]);
  const [persons, setPersons] = useState([]);
  const [selectedForane, setSelectedForane] = useState(null);
  const [selectedParish, setSelectedParish] = useState(null);
  const [selectedKoottayma, setSelectedKoottayma] = useState(null);
  const [selectedFamily, setSelectedFamily] = useState(null);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    baptismName: "",
    phone: "",
    email: "",
    gender: "",
    dob: "",
    relation: "",
    education: "",
    occupation: "",
    status: ""
  });


    const fetchInitialData = async () => {
      try {
        const response = await axiosInstance.get("/forane");
        const foraneOptions = response.data.map(forane => ({
          value: forane._id,
          label: forane.name
        }));
        setForanes(foraneOptions);
      } catch (error) {
        console.error("Error in initial data load:", error);
      }
    };
  
    // Load parish and related data
    const loadParishData = async (foraneId) => {
      if (!foraneId) return;
      
      try {
        const [parishResponse] = await Promise.all([
          axiosInstance.get(`/parish/forane/${foraneId}`)
        ]);
  
        const parishOptions = parishResponse.data.map(parish => ({
          value: parish._id,
          label: parish.name
        }));
  
        setParishes(parishOptions);
        setSelectedParish(null);
        setSelectedKoottayma(null);
        setSelectedFamily(null);
        setPersons([]); // Clear persons when parish changes
      } catch (error) {
        console.error("Error in parish data load:", error);
      }
    };
  
    // Load koottayma and related data
    const loadKoottaymaData = async (parishId) => {
      if (!parishId) return;
      
      try {
        const [koottaymaResponse] = await Promise.all([
          axiosInstance.get(`/koottayma/parish/${parishId}`)
        ]);
  
        const koottaymaOptions = koottaymaResponse.data.map(koottayma => ({
          value: koottayma.koottaymaId,
          label: koottayma.name
        }));
  
        setKoottaymas(koottaymaOptions);
        setSelectedKoottayma(null);
        setSelectedFamily(null);
        setPersons([]); // Clear persons when koottayma changes
      } catch (error) {
        console.error("Error in koottayma data load:", error);
      }
    };
  
    // Load family data
    const loadFamilyData = async (koottaymaId) => {
      if (!koottaymaId) return;
      
      try {
        const [familyResponse] = await Promise.all([
          axiosInstance.get(`/family/kottayma/${koottaymaId}`)
        ]);
  
        const familyOptions = familyResponse.data.map(family => ({
          value: family.id,
          label: family.name
        }));
  
        setFamilies(familyOptions);
        setSelectedFamily(null);
        setPersons([]); // Clear persons when family changes
      } catch (error) {
        console.error("Error in family data load:", error);
      }
    };
  
    // Load person data
    const loadPersonData = async (familyId) => {
      if (!familyId) return;
      
      setIsLoading(true);
      try {
        const [personResponse] = await Promise.all([
          axiosInstance.get(`/person/family/${familyId}`)
        ]);
  
        setPersons(personResponse.data || []);
      } catch (error) {
        console.error("Error in person data load:", error);
      } finally {
        setIsLoading(false);
      }
    };
  
 
  
  // Replace your existing useEffect hooks with these optimized ones
  useEffect(() => {
    fetchInitialData();
  }, []);
  
  useEffect(() => {
    if (selectedForane?.value) {
      loadParishData(selectedForane.value);
    } else {
      setParishes([]);
      setSelectedParish(null);
    }
  }, [selectedForane]);
  
  useEffect(() => {
    if (selectedParish?.value) {
      loadKoottaymaData(selectedParish.value);
    } else {
      setKoottaymas([]);
      setSelectedKoottayma(null);
    }
  }, [selectedParish]);
  
  useEffect(() => {
    if (selectedKoottayma?.value) {
      loadFamilyData(selectedKoottayma.value);
    } else {
      setFamilies([]);
      setSelectedFamily(null);
    }
  }, [selectedKoottayma]);
  
  useEffect(() => {
    if (selectedFamily?.value) {
      loadPersonData(selectedFamily.value);
    } else {
      setPersons([]);
    }
  }, [selectedFamily]);

  const formatDateForInput = (dateString) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    return date.toISOString().split('T')[0];
  };

  const formatDateForSubmit = (dateString) => {
    if (!dateString) return null;
    const parsedDate = new Date(dateString);
    if (isNaN(parsedDate.getTime())) {
      console.error('Invalid date:', dateString);
      return null;
    }
    const day = parsedDate.getDate().toString().padStart(2, '0');
    const month = (parsedDate.getMonth() + 1).toString().padStart(2, '0');
    const year = parsedDate.getFullYear();
    return `${day}/${month}/${year}`;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!selectedForane || !selectedParish || !selectedKoottayma || !selectedFamily) {
      alert('Please select all required fields');
      return;
    }

    setIsLoading(true);
    try {
      const submitData = {
        ...formData,
        dob: formatDateForSubmit(formData.dob),
        family: selectedFamily.value,
        forane: selectedForane.value,
        parish: selectedParish.value,
        koottayma: selectedKoottayma.value
      };

      if (isEditing) {
        await axiosInstance.put(`/person/${formData._id}`, submitData);
      } else {
        await axiosInstance.post("/person/", submitData);
      }
      
      loadPersonData(selectedFamily.value);
      setIsModalVisible(false);
      setFormData({});
      setIsEditing(false);
    } catch (error) {
      console.error("Error saving person:", error);
      alert('Error saving person');
    } finally {
      setIsLoading(false);
    }
  };

  const handleEdit = async (personId) => {
    try {
      const response = await axiosInstance.get(`/person/${personId}`);
      setFormData({
        ...response.data,
        dob: formatDateForInput(response.data.dob)
      });
      setIsEditing(true);
      setIsModalVisible(true);
    } catch (error) {
      console.error("Error fetching person details:", error);
    }
  };

  const handleDelete = async (personId) => {
    if (!window.confirm("Are you sure you want to delete this person?")) return;
    
    try {
      await axiosInstance.delete(`/person/${personId}`);
      loadPersonData(selectedFamily.value);
    } catch (error) {
      console.error("Error deleting person:", error);
    }
  };

  const handleExportRows = (rows) => {
    if (!rows.length) return;
    
    const doc = new jsPDF();
    const tableData = rows.map((row) => [
      row.original.name,
      row.original.relation,
      row.original.gender,
      row.original.dob,
      row.original.education,
      row.original.occupation,
      row.original.phone,
      row.original.email
    ]);
    
    const tableHeaders = [
      'Name',
      'Relation',
      'Gender',
      'Date of Birth',
      'Education',
      'Occupation',
      'Phone',
      'Email'
    ];
    
    doc.text('Person Management Report', 14, 15);
    
    autoTable(doc, {
      head: [tableHeaders],
      body: tableData,
      styles: { fontSize: 8 },
      headStyles: { fillColor: [66, 102, 242], textColor: 255 },
      startY: 20,
      margin: { top: 30 }
    });
    
    doc.save('persons.pdf');
  };

  const columns = useMemo(() => [
    {
      id: 'actions',
      header: 'Actions',
      size: 100,
      Cell: ({ row }) => (
        <Box sx={{ display: 'flex', gap: 1 }}>
          <Tooltip title="Edit">
            <IconButton 
              onClick={() => handleEdit(row.original._id)}
              sx={{ 
                color: 'rgb(71, 84, 103)',
                '&:hover': { color: 'rgb(66, 102, 242)' }
              }}
            >
              <Pencil size={18} />
            </IconButton>
          </Tooltip>
          <Tooltip title="Delete">
            <IconButton 
              onClick={() => handleDelete(row.original._id)}
              sx={{ 
                color: 'rgb(71, 84, 103)',
                '&:hover': { color: 'rgb(239, 68, 68)' }
              }}
            >
              <Trash2 size={18} />
            </IconButton>
          </Tooltip>
        </Box>
      ),
    },
    { accessorKey: 'name', header: 'Name', size: 150 },
    { accessorKey: 'relation', header: 'Relation', size: 120 },
    { accessorKey: 'gender', header: 'Gender', size: 100 },
    { accessorKey: 'dob', header: 'Date of Birth', size: 120 },
    { accessorKey: 'education', header: 'Education', size: 150 },
    { accessorKey: 'occupation', header: 'Occupation', size: 150 },
    { accessorKey: 'phone', header: 'Phone', size: 130 },
    { accessorKey: 'email', header: 'Email', size: 200 }
  ], []);

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
                               Person Management
                             </Typography>
                            
                           </Box>
                          
                         </Box>
                       </StyledPaper>

        <StyledPaper sx={{ mb: 3 }}>
        <Grid container spacing={2}>
          <Grid item xs={12} md={3}>
          <StyledSelect
  options={foranes}
  value={selectedForane}
  onChange={setSelectedForane}
  placeholder="Select Forane"
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
          {selectedForane && (
            <Grid item xs={12} md={3}>
               <StyledSelect
                options={parishes}
                value={selectedParish}
                onChange={setSelectedParish}
                placeholder="Select Parish"
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
            <Grid item xs={12} md={3}>
               <StyledSelect
                options={koottaymas}
                value={selectedKoottayma}
                onChange={setSelectedKoottayma}
                placeholder="Select Koottayma"
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
          {selectedKoottayma && (
            <Grid item xs={12} md={3}>
               <StyledSelect
                options={families}
                value={selectedFamily}
                onChange={setSelectedFamily}
                placeholder="Select Family"
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
        </Grid>
     
     
      {selectedFamily && (
        <>
          <Box sx={{ mb: 2 }}>
            <Button
              variant="contained"
              startIcon={<Plus size={18} />}
              onClick={() => {
                setIsModalVisible(true);
                setIsEditing(false);
                setFormData({});
              }}
              sx={{
                backgroundColor: 'rgb(66, 102, 242)',
                textTransform: 'none',
                borderRadius: '6px',
                marginTop: '10px',
                '&:hover': {
                  backgroundColor: 'rgb(51, 85, 220)'
                }
              }}
            >
              Add Person
            </Button>
          </Box>

          <MaterialReactTable
            columns={columns}
            data={persons}
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
            muiTablePaperProps={{
              elevation: 0,
              sx: { 
                borderRadius: '8px', 
                border: '1px solid rgb(229, 231, 235)',
                '& .MuiTableRow-root': {
                  '&:hover': {
                    backgroundColor: 'rgb(245, 247, 250)'
                  }
                }
              },
            }}
            renderTopToolbarCustomActions={({ table }) => (
              <Box sx={{ display: 'flex', gap: 2, alignItems: 'center' }}>
                <Tooltip title="Refresh Data">
                  <IconButton 
                    onClick={() => selectedFamily && loadPersonData(selectedFamily.value)}
                    sx={{ 
                      color: 'rgb(71, 84, 103)',
                      '&:hover': { color: 'rgb(66, 102, 242)' }
                    }}
                  >
                    <RefreshCw size={18} />
                  </IconButton>
                </Tooltip>
                <Button
                  variant="outlined"
                  onClick={() => handleExportRows(table.getSelectedRowModel().rows)}
                  startIcon={<Download size={18} />}
                  disabled={!table.getSelectedRowModel().rows.length}
                  sx={{
                    textTransform: 'none',
                    borderRadius: '6px',
                    borderColor: 'rgb(229, 231, 235)',
                    color: 'rgb(71, 84, 103)',
                    '&:hover': {
                      borderColor: 'rgb(66, 102, 242)',
                      backgroundColor: 'transparent'
                    }
                  }}
                >
                  Export Selected to PDF
                </Button>
              </Box>
            )}
          />
        </>
      )}
 </StyledPaper>
      <Dialog
        open={isModalVisible}
        onClose={() => {
          setIsModalVisible(false);
          setFormData({});
        }}
        maxWidth="md"
        fullWidth
        PaperProps={{
          sx: {
            borderRadius: '8px'
          }
        }}
      >
        <DialogTitle sx={{ 
          color: 'rgb(17, 24, 39)',
          fontWeight: 500,
          borderBottom: '1px solid rgb(229, 231, 235)',
          padding: '16px 24px'
        }}>
          <Typography variant="h5" sx={{ 
                             fontWeight: 600,
                             color: 'rgb(17, 24, 39)',
                             mb: 1
                           }}>
          {isEditing ? "Edit Person" : "Add Person"}</Typography>
        </DialogTitle>
        <form onSubmit={handleSubmit}>
          <DialogContent sx={{ padding: '24px' }}>
            <Grid container spacing={2}>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  required
                  label="Name"
                  value={formData.name || ''}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  margin="normal"
                   sx={{
                      '& .MuiOutlinedInput-root': {
                        borderRadius: 8,
                      }
                    }}
                />
                <TextField
                  fullWidth
                  required
                  label="Baptism Name"
                  value={formData.baptismName || ''}
                  onChange={(e) => setFormData({ ...formData, baptismName: e.target.value })}
                  margin="normal"
                  sx={{
                    '& .MuiOutlinedInput-root': {
                      borderRadius: 8,
                    }
                  }}
                />
                <TextField
                  fullWidth
                  required
                  label="Phone"
                  value={formData.phone || ''}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  margin="normal"
                   sx={{
                      '& .MuiOutlinedInput-root': {
                        borderRadius: 8,
                      }
                    }}
                />
                <TextField
                  fullWidth
                  required
                  label="Email"
                  type="email"
                  value={formData.email || ''}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  margin="normal"
                   sx={{
                      '& .MuiOutlinedInput-root': {
                        borderRadius: 8,
                      }
                    }}
                />
                <TextField
                  select
                  fullWidth
                  required
                  label="Gender"
                  value={formData.gender || ''}
                  onChange={(e) => setFormData({ ...formData, gender: e.target.value })}
                  margin="normal"
                   sx={{
                      '& .MuiOutlinedInput-root': {
                        borderRadius: 8,
                      }
                    }}
                >
                  <MenuItem value="male">Male</MenuItem>
                  <MenuItem value="female">Female</MenuItem>
                </TextField>
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  required
                  type="date"
                  label="Date of Birth"
                  value={formData.dob || ''}
                  onChange={(e) => setFormData({ ...formData, dob: e.target.value })}
                  margin="normal"
                  InputLabelProps={{ shrink: true }}
                   sx={{
                      '& .MuiOutlinedInput-root': {
                        borderRadius: 8,
                      }
                    }}
                />
                <TextField
                  select
                  fullWidth
                  required
                  label="Relation"
                  value={formData.relation || ''}
                  onChange={(e) => setFormData({ ...formData, relation: e.target.value })}
                  margin="normal"
                   sx={{
                      '& .MuiOutlinedInput-root': {
                        borderRadius: 8,
                      }
                    }}
                >
                  {relationOptions.map(option => (
                    <MenuItem key={option.value} value={option.value}>
                      {option.label}
                    </MenuItem>
                  ))}
                </TextField>
                <TextField
                  fullWidth
                  required
                  label="Education"
                  value={formData.education || ''}
                  onChange={(e) => setFormData({ ...formData, education: e.target.value })}
                  margin="normal"
                   sx={{
                      '& .MuiOutlinedInput-root': {
                        borderRadius: 8,
                      }
                    }}
                />
                <TextField
                  fullWidth
                  required
                  label="Occupation"
                  value={formData.occupation || ''}
                  onChange={(e) => setFormData({ ...formData, occupation: e.target.value })}
                  margin="normal"
                   sx={{
                      '& .MuiOutlinedInput-root': {
                        borderRadius: 8,
                      }
                    }}
                />
                <TextField
                  select
                  fullWidth
                  required
                  label="Status"
                  value={formData.status || ''}
                  onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                  margin="normal"
                   sx={{
                      '& .MuiOutlinedInput-root': {
                        borderRadius: 8,
                      }
                    }}
                >
                  <MenuItem value="active">Active</MenuItem>
                  <MenuItem value="deceased">DeceaseD</MenuItem>
                </TextField>
              </Grid>
            </Grid>
          </DialogContent>
          <DialogActions sx={{ 
            padding: '16px 24px',
            borderTop: '1px solid rgb(229, 231, 235)'
          }}>
            <Button 
              variant="outlined" 
              onClick={() => {
                setIsModalVisible(false);
                setFormData({});
              }}
              sx={{
                textTransform: 'none',
                borderRadius: '6px',
                borderColor: 'rgb(229, 231, 235)',
                color: 'rgb(71, 84, 103)',
                '&:hover': {
                  borderColor: 'rgb(66, 102, 242)',
                  backgroundColor: 'transparent'
                }
              }}
            >
              Cancel
            </Button>
            <Button
              variant="contained"
              type="submit"
              disabled={isLoading}
              sx={{
                textTransform: 'none',
                borderRadius: '6px',
                backgroundColor: 'rgb(66, 102, 242)',
                '&:hover': {
                  backgroundColor: 'rgb(51, 85, 220)'
                }
              }}
            >
              {isLoading ? 'Saving...' : isEditing ? 'Update' : 'Save'}
            </Button>
          </DialogActions>
        </form>
      </Dialog>
      </Box>
      </ThemeProvider>
  );
};

export default PersonManagement;