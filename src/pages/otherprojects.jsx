import React, { useState, useEffect } from "react";
import { MaterialReactTable } from 'material-react-table';
import { NumericFormat } from 'react-number-format';
import axiosInstance from "../axiosConfig";
import { jsPDF } from "jspdf";
import autoTable from 'jspdf-autotable';
import { 
  Box, 
  Typography,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  IconButton,
  Card,
  Avatar,
  ThemeProvider,
  createTheme,
  CssBaseline,
  Tooltip,
  Snackbar,
  Alert,
  Stack
} from '@mui/material';
import { styled } from '@mui/material/styles';
import { 
  Edit as EditIcon,
  Delete as DeleteIcon,
  FileDownload as FileDownloadIcon,
  Refresh as RefreshIcon,
  FolderOpen as ProjectIcon,
} from '@mui/icons-material';
import { Plus } from 'lucide-react';

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

const GradientButton = styled(Button)(({ theme }) => ({
  background: `linear-gradient(to right, ${theme.palette.primary.light}, ${theme.palette.primary.main})`,
  color: 'white',
  '&:hover': {
    background: `linear-gradient(to right, ${theme.palette.primary.main}, ${theme.palette.primary.dark})`
  }
}));

const ProjectManagement = () => {
  const [projects, setProjects] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingProject, setEditingProject] = useState(null);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    allocatedAmount: 0,
    currentBalance: 0
  });

  const currentYear = new Date().getFullYear();

  useEffect(() => {
    fetchProjects();
  }, []);

  const fetchProjects = async () => {
    try {
      setLoading(true);
      const { data } = await axiosInstance.get('/fund');
      setProjects(data);
      setMessage({ type: 'success', text: 'Projects loaded successfully' });
    } catch (err) {
      setMessage({ 
        type: 'error', 
        text: err.response?.data?.message || 'Failed to load projects'
      });
    } finally {
      setLoading(false);
    }
  };

  const handleExportData = () => {
    const doc = new jsPDF();
    const tableData = projects.map((project) => [
      project.name,
      project.finance?.[0]?.allocatedAmount || 0,
      project.finance?.[0]?.currentBalance || 0
    ]);
    
    autoTable(doc, {
      head: [['Project', 'Allocated Amount', 'Current Balance']],
      body: tableData,
      styles: { fontSize: 8 },
      headStyles: { fillColor: [37, 99, 235] },
      startY: 20,
    });
    
    doc.text('Projects Report', 14, 15);
    doc.save('projects.pdf');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      setLoading(true);
      const projectData = {
        name: formData.name,
        finance: [{
          year: currentYear,
          allocatedAmount: Number(formData.allocatedAmount) || 0,
          currentBalance: Number(formData.currentBalance) || 0
        }]
      };

      if (editingProject) {
        await axiosInstance.put(`/fund/${editingProject._id}`, projectData);
        setMessage({ type: 'success', text: 'Project updated successfully' });
      } else {
        await axiosInstance.post("/fund/", projectData);
        setMessage({ type: 'success', text: 'Project added successfully' });
      }
      handleCloseModal();
      fetchProjects();
    } catch (error) {
      setMessage({ type: 'error', text: 'Operation failed' });
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    try {
      await axiosInstance.delete(`/fund/${id}`);
      setMessage({ type: 'success', text: 'Project deleted successfully' });
      fetchProjects();
    } catch (error) {
      setMessage({ type: 'error', text: 'Failed to delete project' });
    }
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setEditingProject(null);
    setFormData({
      name: '',
      allocatedAmount: 0,
      currentBalance: 0
    });
  };

  const columns = [
    {
      accessorKey: 'name',
      header: 'Project Name',
      size: 200,
      Cell: ({ row }) => (
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          <Avatar sx={{ bgcolor: theme.palette.primary.main }}>
            {row.original.name.charAt(0)}
          </Avatar>
          <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>
            {row.original.name}
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
                const currentFinance = row.original.finance?.find(f => f?.year === currentYear) || {};
                setEditingProject(row.original);
                setFormData({
                  name: row.original.name,
                  allocatedAmount: currentFinance.allocatedAmount || 0,
                  currentBalance: currentFinance.currentBalance || 0
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
          {/* <Tooltip title="Delete">
            <IconButton
              size="small"
              onClick={() => {
                if (window.confirm('Delete this project?')) {
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
          </Tooltip> */}
        </Box>
      ),
    }
  ];

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
                <ProjectIcon sx={{ fontSize: 32, color: theme.palette.primary.main }} />
                <Typography variant="h5" sx={{ fontWeight: 700 }}>
                  Project Management
                </Typography>
              </Box>
              <Typography variant="body2" color="text.secondary">
                Manage and organize project information
              </Typography>
            </Box>
            <Box sx={{ display: 'flex', gap: 2 }}>
              <Tooltip title="Refresh Data">
                <IconButton
                  onClick={fetchProjects}
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
              <GradientButton
                startIcon={<Plus size={20} />}
                onClick={() => setIsModalOpen(true)}
              >
                Add Project
              </GradientButton>
            </Box>
          </Box>
        </StyledCard>

        <StyledCard>
          <MaterialReactTable
            columns={columns}
            data={projects}
            enableColumnFiltering
            enableGlobalFilter
            enableColumnOrdering
            enablePagination
            enableSorting
            enableRowSelection
            state={{ isLoading: loading }}
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
          maxWidth="sm"
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
              {editingProject ? "Edit Project" : "Add New Project"}
            </Typography>
          </DialogTitle>
          <form onSubmit={handleSubmit}>
            <DialogContent sx={{ p: 3 }}>
              <Stack spacing={3}>
                <TextField
                  label="Project Name"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  fullWidth
                  required
                  sx={{
                    '& .MuiOutlinedInput-root': {
                      borderRadius: 2,
                    }
                  }}
                />
                {/* <NumericFormat
                  customInput={TextField}
                  label="Allocated Amount"
                  value={formData.allocatedAmount}
                  onValueChange={(values) => setFormData({
                    ...formData,
                    allocatedAmount: values.value
                  })}
                  thousandSeparator
                  prefix="₹ "
                  fullWidth
                  required
                  sx={{
                    '& .MuiOutlinedInput-root': {
                      borderRadius: 2,
                    }
                  }}
                />
                <NumericFormat
                  customInput={TextField}
                  label="Current Balance"
                  value={formData.currentBalance}
                  onValueChange={(values) => setFormData({
                    ...formData,
                    currentBalance: values.value
                  })}
                  thousandSeparator
                  prefix="₹ "
                  fullWidth
                  sx={{
                    '& .MuiOutlinedInput-root': {
                      borderRadius: 2,
                    }
                  }}
                /> */}
              </Stack>
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
                {loading ? 'Saving...' : (editingProject ? 'Update' : 'Save')}
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

export default ProjectManagement;