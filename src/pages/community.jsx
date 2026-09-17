import React, { useState, useEffect } from "react";
import { MaterialReactTable } from 'material-react-table';
import { 
  Box, 
  Typography,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Grid,
  Card,
  Avatar,
  IconButton,
  Tooltip,
  CircularProgress,
  ThemeProvider,
  createTheme,
  CssBaseline,
  Snackbar,
  Alert,
} from '@mui/material';
import { styled } from '@mui/material/styles';
import { 
  Edit as EditIcon,
  Delete as DeleteIcon,
  FileDownload as FileDownloadIcon,
  Refresh as RefreshIcon,
  Group as GroupIcon,
} from '@mui/icons-material';
import { Plus } from 'lucide-react';
import axiosInstance from "../axiosConfig";
import { jsPDF } from "jspdf";
import autoTable from 'jspdf-autotable';

const theme = createTheme({
  palette: {
    mode: 'light',
    primary: {
      main: '#2563EB',
      light: '#3B82F6',
      dark: '#1E40AF'
    },
    background: {
      default: '#F3F4F6',
      paper: '#FFFFFF'
    }
  },
  typography: {
    fontFamily: 'Inter, system-ui, -apple-system, sans-serif',
  }
});

const StyledCard = styled(Card)(({ theme }) => ({
  borderRadius: 12,
  boxShadow: '0 4px 6px rgba(0,0,0,0.1)',
  transition: 'all 0.3s ease',
  '&:hover': {
    transform: 'translateY(-5px)',
    boxShadow: '0 8px 15px rgba(0,0,0,0.15)'
  }
}));

const StyledTextField = styled(TextField)(({ theme }) => ({
  '& .MuiOutlinedInput-root': {
    borderRadius: 8,
    '&:hover fieldset': {
      borderColor: theme.palette.primary.main,
    }
  }
}));

const GradientButton = styled(Button)(({ theme }) => ({
  background: `linear-gradient(to right, ${theme.palette.primary.light}, ${theme.palette.primary.main})`,
  color: 'white',
  '&:hover': {
    background: `linear-gradient(to right, ${theme.palette.primary.main}, ${theme.palette.primary.dark})`
  }
}));

const CommunityManagement = () => {
  const [communities, setCommunities] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingCommunity, setEditingCommunity] = useState(null);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    headOfCommunity: {
      fullName: '',
      email: '',
      phoneNumber: ''
    }
  });

  useEffect(() => {
    fetchCommunities();
  }, []);

  const fetchCommunities = async () => {
    try {
      setLoading(true);
      const { data } = await axiosInstance.get('/community');
      setCommunities(data);
      setMessage({ type: 'success', text: 'Communities loaded successfully' });

      // setLoading(true);
      // const { data: ids } = await axiosInstance.get("/community");
      // const details = await Promise.all(
      //   ids.map((id) => axiosInstance.get(`/community/${id._id}`))
      // );
      // setCommunities(details.map((res) => res.data));
      // setMessage({ type: 'success', text: 'Communities loaded successfully' });
    } catch (err) {
      setMessage({ type: 'error', text: 'Failed to fetch communities' });
    } finally {
      setLoading(false);
    }
  };

  const handleExportData = () => {
    const doc = new jsPDF();
    const tableData = communities.map((community) => [
      community.name,
      community.phone,
      community.headOfCommunity?.fullName,
      community.headOfCommunity?.email,
      community.headOfCommunity?.phoneNumber
    ]);
    
    autoTable(doc, {
      head: [['Name', 'Phone', 'Head Name', 'Head Email', 'Head Phone']],
      body: tableData,
      styles: { fontSize: 8 },
      headStyles: { fillColor: [37, 99, 235] },
      startY: 20,
    });
    
    doc.text('Communities Report', 14, 15);
    doc.save('communities.pdf');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      if (editingCommunity) {
        await axiosInstance.put(`/community/${editingCommunity._id}`, formData);
        setMessage({ type: 'success', text: 'Community updated successfully' });
      } else {
        await axiosInstance.post("/community/", formData);
        setMessage({ type: 'success', text: 'Community added successfully' });
      }
      handleCloseModal();
      fetchCommunities();
    } catch (error) {
      setMessage({ 
        type: 'error', 
        text: error.response?.data?.message || 'Operation failed' 
      });
    } finally {
      setLoading(false);
    }
  };

  const columns = [
    {
      accessorKey: 'name',
      header: 'Community',
      size: 200,
      Cell: ({ row }) => (
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          <Avatar sx={{ bgcolor: theme.palette.primary.main }}>
            {row.original.name.charAt(0)}
          </Avatar>
          <Box>
            <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>
              {row.original.name}
            </Typography>
            <Typography variant="caption" color="text.secondary">
              {row.original.phone}
            </Typography>
          </Box>
        </Box>
      ),
    },
    {
      accessorFn: (row) => row.headOfCommunity?.fullName,
      header: 'Head Name',
      size: 200,
    },
    {
      accessorFn: (row) => row.headOfCommunity?.email,
      header: 'Contact',
      size: 200,
      Cell: ({ row }) => (
        <Box>
          <Typography variant="body2">{row.original.headOfCommunity?.email}</Typography>
          <Typography variant="caption" color="text.secondary">
            {row.original.headOfCommunity?.phoneNumber}
          </Typography>
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
              onClick={() => {
                setEditingCommunity(row.original);
                setFormData({
                  name: row.original.name,
                  phone: row.original.phone,
                  headOfCommunity: row.original.headOfCommunity
                });
                setIsModalOpen(true);
              }}
              sx={{
                bgcolor: theme.palette.primary.light + '20',
                '&:hover': { bgcolor: theme.palette.primary.light + '30' }
              }}
            >
              <EditIcon fontSize="small" sx={{ color: theme.palette.primary.main }} />
            </IconButton>
          </Tooltip>
          <Tooltip title="Delete">
            <IconButton
              size="small"
              onClick={() => {
                if (window.confirm('Delete this community?')) {
                  handleDelete(row.original._id);
                }
              }}
              sx={{
                bgcolor: 'rgb(254, 226, 226)',
                '&:hover': { bgcolor: 'rgb(254, 202, 202)' }
              }}
            >
              <DeleteIcon fontSize="small" sx={{ color: 'rgb(220, 38, 38)' }} />
            </IconButton>
          </Tooltip>
        </Box>
      ),
    },
  ];

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setEditingCommunity(null);
    setFormData({
      name: '',
      phone: '',
      headOfCommunity: { fullName: '', email: '', phoneNumber: '' }
    });
  };

  const handleDelete = async (id) => {
    try {
      await axiosInstance.delete(`/community/${id}`);
      setMessage({ type: 'success', text: 'Community deleted successfully' });
      fetchCommunities();
    } catch (error) {
      setMessage({ type: 'error', text: 'Failed to delete community' });
    }
  };

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Box sx={{ 
        p: 3, 
        bgcolor: 'background.default', 
        minHeight: '100vh',
        background: 'linear-gradient(135deg, rgb(255, 255, 255) 0%, rgb(255, 255, 255) 100%)'
      }}>
        <StyledCard sx={{ p: 3, mb: 3 }}>
          <Box sx={{ 
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center'
          }}>
            <Box>
              <Box display="flex" alignItems="center" gap={2} mb={1}>
                <GroupIcon sx={{ fontSize: 32, color: theme.palette.primary.main }} />
                <Typography variant="h5" sx={{ fontWeight: 700 }}>
                  Community Management
                </Typography>
              </Box>
              <Typography variant="body2" color="text.secondary">
                Manage and organize community information
              </Typography>
            </Box>
            <GradientButton
              startIcon={<Plus size={20} />}
              onClick={() => setIsModalOpen(true)}
            >
              Add New Community
            </GradientButton>
          </Box>
        </StyledCard>

        <StyledCard>
          <MaterialReactTable
            columns={columns}
            data={communities}
            enableColumnFiltering
            enableGlobalFilter
            enableColumnOrdering
            enablePagination
            enableSorting
            enableRowSelection
            state={{ isLoading: loading }}
            renderTopToolbarCustomActions={() => (
              <Box sx={{ display: 'flex', gap: 2, p: 2 }}>
                <Tooltip title="Refresh Data">
                  <IconButton
                    onClick={fetchCommunities}
                    sx={{
                      bgcolor: theme.palette.primary.light + '20',
                      '&:hover': { bgcolor: theme.palette.primary.light + '30' }
                    }}
                  >
                    <RefreshIcon sx={{ color: theme.palette.primary.main }} />
                  </IconButton>
                </Tooltip>
                <Button
                  variant="outlined"
                  onClick={handleExportData}
                  startIcon={<FileDownloadIcon />}
                  sx={{ borderRadius: 2 }}
                >
                  Export Data
                </Button>
              </Box>
            )}
            muiTablePaperProps={{
              elevation: 0,
              sx: {
                borderRadius: '12px',
                border: 'none',
                backgroundColor: '#ffffff',
              },
            }}
            muiTableProps={{
              sx: {
                '& .MuiTableCell-root': {
                  borderBottom: '1px solid',
                  borderColor: 'divider',
                  backgroundColor: '#ffffff',
                },
              },
            }}
            muiTableBodyProps={{
              sx: {
                '& .MuiTableRow-root': {
                  backgroundColor: '#ffffff',
                },
              },
            }}
            muiTableHeadProps={{
              sx: {
                '& .MuiTableRow-root': {
                  backgroundColor: '#ffffff',
                },
              },
            }}
          />
        </StyledCard>

        <Dialog 
          open={isModalOpen}
          onClose={handleCloseModal}
          maxWidth="md"
          fullWidth
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
            borderBottom: '1px solid',
            borderColor: 'divider'
          }}>
            <Typography variant="h6" sx={{ fontWeight: 700 }}>
              {editingCommunity ? "Edit Community" : "Add New Community"}
            </Typography>
          </DialogTitle>
          <form onSubmit={handleSubmit}>
            <DialogContent sx={{ p: 3 }}>
              <Grid container spacing={3}>
                <Grid item xs={12} sm={6}>
                  <StyledTextField
                    label="Community Name"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    fullWidth
                    required
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <StyledTextField
                    label="Community Phone"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    fullWidth
                    required
                  />
                </Grid>
                <Grid item xs={12}>
                  <Typography variant="subtitle1" sx={{ fontWeight: 600, mb: 2 }}>
                    Head of Community Details
                  </Typography>
                </Grid>
                <Grid item xs={12} sm={6}>
                  <StyledTextField
                    label="Head Name"
                    value={formData.headOfCommunity.fullName}
                    onChange={(e) => setFormData({
                      ...formData,
                      headOfCommunity: {
                        ...formData.headOfCommunity,
                        fullName: e.target.value
                      }
                    })}
                    fullWidth
                    required
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <StyledTextField
                    label="Head Phone"
                    value={formData.headOfCommunity.phoneNumber}
                    onChange={(e) => setFormData({
                      ...formData,
                      headOfCommunity: {
                        ...formData.headOfCommunity,
                        phoneNumber: e.target.value
                      }
                    })}
                    fullWidth
                    required
                  />
                </Grid>
                <Grid item xs={12}>
                  <StyledTextField
                    label="Head Email"
                    type="email"
                    value={formData.headOfCommunity.email}
                    onChange={(e) => setFormData({
                      ...formData,
                      headOfCommunity: {
                        ...formData.headOfCommunity,
                        email: e.target.value
                      }
                    })}
                    fullWidth
                    required
                  />
                </Grid>
              </Grid>
            </DialogContent>
            <DialogActions sx={{ 
              p: 3, 
              borderTop: '1px solid',
              borderColor: 'divider'
            }}>
              <Button
                variant="outlined"
                onClick={handleCloseModal}
                sx={{ borderRadius: 2 }}
              >
                Cancel
              </Button>
              <GradientButton
                type="submit"
                disabled={loading}
              >
                {loading ? (
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <CircularProgress size={20} color="inherit" />
                    <span>Saving...</span>
                  </Box>
                ) : (
                  editingCommunity ? 'Update' : 'Save'
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

export default CommunityManagement;