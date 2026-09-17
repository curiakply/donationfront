
import { useState, useEffect } from "react";
import { FaPeopleCarry } from "react-icons/fa";
import axiosInstance from "../axiosConfig.jsx";
import { InputNumber, message } from "antd";
import {
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Card,
  CardContent,
  Typography,
  Grid,
  Button,
  Box,
  CircularProgress,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField
} from '@mui/material';
import { styled } from '@mui/material/styles';
import { useFinancialYear } from './FinancialYearContext';
// Styled Components
const StyledTableCell = styled(TableCell)(({ theme }) => ({
  '&.MuiTableCell-head': {
    backgroundColor: theme.palette.primary.main,
    color: theme.palette.common.white,
    fontWeight: 'bold',
    fontSize: 16,
    padding: theme.spacing(2),
  },
  '&.MuiTableCell-body': {
    fontSize: 14,
    padding: theme.spacing(2),
  },
}));

const StyledTableRow = styled(TableRow)(({ theme }) => ({
  '&:nth-of-type(odd)': {
    backgroundColor: theme.palette.action.hover,
  },
  '&:last-child td, &:last-child th': {
    border: 0,
  },
  '&:hover': {
    backgroundColor: theme.palette.action.hover,
  },
}));

const StatCard = styled(Card)(({ theme }) => ({
  height: '100%',
  display: 'flex',
  flexDirection: 'column',
  justifyContent: 'center',
  padding: theme.spacing(2),
  transition: 'transform 0.2s ease-in-out',
  '&:hover': {
    transform: 'translateY(-4px)',
  },
}));

const ProjectSettings = () => {
  // State Management
  const [projects, setProjects] = useState([]);
  const [showSaveButton, setShowSaveButton] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [deleteProjectId, setDeleteProjectId] = useState(null);
  const [totalAmount, setTotalAmount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const { selectedYear1, formattedYear, startDate, endDate, updateYear } = useFinancialYear();
    const currentYear = selectedYear1;
  const [newProject, setNewProject] = useState({
    name: "",
    head: "",
    percentage: 0,
    allocated_amount: 0
  });

  // Initial Data Fetch
  useEffect(() => {
    fetchData();
  }, []);

  // Data Fetching Functions
  const fetchData = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const totalAmountData = await fetchTotalAmount();
      console.log(totalAmountData);
      if (!totalAmountData) return;

      const projectsData = await fetchProjectsList();
      if (!projectsData) return;

      await fetchAllocations(projectsData, totalAmountData);
    } catch (error) {
      setError("Failed to load project settings. Please try again later.");
      message.error("Error loading project settings");
    } finally {
      setLoading(false);
    }
  };

  const fetchTotalAmount = async () => {
    try {
      const response = await axiosInstance.get(`/community-settings/year/${currentYear}`);
      const amount = response.data.other_projects_amount;
      setTotalAmount(amount);
      return amount;
    } catch (error) {
      console.error("Error fetching total amount:", error);
      message.error("Failed to fetch total amount");
      return null;
    }
  };

  const fetchProjectsList = async () => {
    try {
      const response = await axiosInstance.get("/fund");
      return response.data;
    } catch (error) {
      console.error("Error fetching projects list:", error);
      message.error("Failed to fetch projects list");
      return null;
    }
  };

  const fetchAllocations = async (fundsList, totalAmountValue) => {
    try {
      let allocationsResponse;
      try {
        allocationsResponse = await axiosInstance.get(`/project-settings/year/${currentYear}`);
      } catch (error) {
        if (error.response?.status === 404) {
          allocationsResponse = { data: { settings: [] } };
        } else {
          throw error;
        }
      }
      
      // Get current year allocations
      const allocationsMap = new Map(
        allocationsResponse.data.settings?.map(setting => [setting.project_id, setting]) || []
      );

      // Fetch last year's data
      const lastYear = currentYear - 1;
      let lastYearData = new Map();
      try {
        const lastYearResponse = await axiosInstance.get(`/project-settings/year/${lastYear}`);
        if (lastYearResponse.data && lastYearResponse.data.settings) {
          lastYearData = new Map(
            lastYearResponse.data.settings.map(setting => [setting.project_id, setting])
          );
        }
      } catch (error) {
        console.error("Error fetching last year's data:", error);
      }
      
      const combinedProjects = fundsList.map(project => ({
        _id: project._id,
        project_name: project.name,
        project_head: project.head,
        percentage: allocationsMap.get(project._id)?.percentage || 0,
        allocated_amount: allocationsMap.get(project._id)?.allocated_amount || 0,
        balance_after_allocation: allocationsMap.get(project._id)?.balance_after_allocation || totalAmountValue,
        last_year_amount: lastYearData.get(project._id)?.allocated_amount || 0,
        year: currentYear
      }));

      setProjects(combinedProjects);
    } catch (error) {
      console.error("Error fetching allocations:", error);
      message.error("Failed to fetch allocations");
    }
  };

  // Helper Functions
  const updateBalances = (updatedProjects) => {
    let runningTotalAllocated = 0;
    const result = updatedProjects.map((project) => {
      runningTotalAllocated += Number(project.allocated_amount || 0);
      return {
        ...project,
        balance_after_allocation: totalAmount - runningTotalAllocated,
      };
    });
    setShowSaveButton(true);
    return result;
  };

  const validateTotalAllocations = (projectsToValidate) => {
    const totalPercentage = projectsToValidate.reduce((sum, project) => 
      sum + Number(project.percentage || 0), 0);
    const totalAllocated = projectsToValidate.reduce((sum, project) => 
      sum + Number(project.allocated_amount || 0), 0);

    if (totalPercentage > 100) {
      message.error("Total percentage cannot exceed 100%");
      return false;
    }

    if (totalAllocated > totalAmount) {
      message.error("Total allocated amount cannot exceed available funds");
      return false;
    }

    return true;
  };

  // Event Handlers
  const handlePercentageChange = (index, newPercentage) => {
    if (newPercentage === null) return;
    
    setProjects((prevProjects) => {
      const updatedProjects = prevProjects.map((project, i) => {
        if (i === index) {
          const updatedAmount = (totalAmount * newPercentage) / 100;
          return {
            ...project,
            percentage: newPercentage,
            allocated_amount: Number(updatedAmount.toFixed(2)),
          };
        }
        return project;
      });
      return updateBalances(updatedProjects);
    });
  };

  const handleAllocatedAmountChange = (index, newAmount) => {
    if (newAmount === null) return;
    
    setProjects((prevProjects) => {
      const updatedProjects = prevProjects.map((project, i) => {
        if (i === index) {
          const updatedPercentage = (newAmount / totalAmount) * 100;
          return {
            ...project,
            allocated_amount: Number(newAmount),
            percentage: Number(updatedPercentage.toFixed(2)),
          };
        }
        return project;
      });
      return updateBalances(updatedProjects);
    });
  };

  const handleSave = async () => {
    try {
      if (!validateTotalAllocations(projects)) {
        return;
      }

      const projectData = projects.map(project => ({
        year: currentYear,
        project_id: project._id,
        project_name: project.project_name,
        percentage: Number(project.percentage),
        allocated_amount: Number(project.allocated_amount),
        balance_after_allocation: Number(project.balance_after_allocation)
      }));

      // Save project settings
      await axiosInstance.post('/project-settings/bulk', {
        settings: projectData,
        total_amount: totalAmount,
        year: currentYear
      });

      // Update fund information
      const fundUpdates = projects.map(project => ({
        _id: project._id,
        name: project.project_name,
        head: project.project_head,
        year: currentYear,
        finance: [{
          year: currentYear,
          percentage: project.percentage,
          allocated_amount: project.allocated_amount
        }]
      }));

      await Promise.all(fundUpdates.map(fund => 
        axiosInstance.put(`/fund/${fund._id}`, fund)
      ));

      message.success("Projects and allocations saved successfully!");
      setShowSaveButton(false);
      await fetchData();
    } catch (error) {
      console.error("Error saving projects:", error);
      message.error(error.response?.data?.message || "Failed to save projects");
    }
  };

  // Calculations
  const remainingBalance = totalAmount - projects.reduce((sum, project) => 
    sum + Number(project.allocated_amount || 0), 0);
  const totalPercentage = projects.reduce((sum, project) => 
    sum + Number(project.percentage || 0), 0);

  return (
    <Box sx={{ p: { xs: 2, sm: 4, md: 6 }, width: '100%' }}>
      {error && (
        <Box mb={4}>
          <Typography color="error" variant="h6" align="center">
            {error}
          </Typography>
        </Box>
      )}

      {/* Header */}
      <Box display="flex" flexDirection="column" alignItems="center" mb={4}>
        <FaPeopleCarry style={{ fontSize: '4rem', marginBottom: '1rem', color: '#1976d2' }} />
        <Typography variant="h3" fontWeight="bold" gutterBottom align="center">
          Project Settings
        </Typography>
      </Box>

      {loading ? (
        <Box display="flex" justifyContent="center" alignItems="center" minHeight="50vh">
          <CircularProgress size={60} />
        </Box>
      ) : (
        <>
          {/* Stats Cards */}
          <Grid container spacing={3} sx={{ mb: 4 }}>
            <Grid item xs={12} md={4}>
              <StatCard elevation={3}>
                <CardContent>
                  <Typography variant="h6" color="text.secondary" gutterBottom>
                    Total Available Amount
                  </Typography>
                  <Typography variant="h4">
                    ₹{totalAmount.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                  </Typography>
                </CardContent>
              </StatCard>
            </Grid>
            <Grid item xs={12} md={4}>
              <StatCard elevation={3}>
                <CardContent>
                  <Typography variant="h6" color="text.secondary" gutterBottom>
                    Remaining Balance
                  </Typography>
                  <Typography variant="h4" color={remainingBalance < 0 ? 'error.main' : 'inherit'}>
                    ₹{remainingBalance.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                  </Typography>
                </CardContent>
              </StatCard>
            </Grid>
            <Grid item xs={12} md={4}>
              <StatCard elevation={3}>
                <CardContent>
                  <Typography variant="h6" color="text.secondary" gutterBottom>
                    Total Percentage Allocated
                  </Typography>
                  <Typography variant="h4" color={totalPercentage > 100 ? 'error.main' : 'inherit'}>
                    {totalPercentage.toFixed(2)}%
                  </Typography>
                </CardContent>
              </StatCard>
            </Grid>
          </Grid>

          {/* Save Button */}
          {showSaveButton && (
            <Box mb={3}>
              <Button
                variant="contained"
                color="success"
                onClick={handleSave}
                disabled={remainingBalance < 0 || totalPercentage > 100}
                size="large"
              >
                Save Changes
              </Button>
            </Box>
          )}

          {/* Main Project Table */}
          <TableContainer component={Paper} elevation={3}>
            <Table>
              <TableHead>
                <TableRow>
                  <StyledTableCell>Project</StyledTableCell>
                  <StyledTableCell align="right">Percentage (%)</StyledTableCell>
                  <StyledTableCell align="right">Allocated Amount (₹)</StyledTableCell>
                  <StyledTableCell align="right">Balance after Allocation (₹)</StyledTableCell>
                  <StyledTableCell align="right">Last Year Amount (₹)</StyledTableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {projects.map((project, index) => (
                  <StyledTableRow key={project._id}>
                    <StyledTableCell>{project.project_name}</StyledTableCell>
                    <StyledTableCell align="right">
                      <InputNumber
                        min={0}
                        max={100}
                        value={project.percentage}
                        onChange={(value) => handlePercentageChange(index, value)}
                        precision={2}
                        style={{ width: '100%' }}
                        addonAfter="%"
                      />
                    </StyledTableCell>
                    <StyledTableCell align="right">
                      <InputNumber
                        min={0}
                        max={totalAmount}
                        value={project.allocated_amount}
                        onChange={(value) => handleAllocatedAmountChange(index, value)}
                        precision={2}
                        style={{ width: '100%' }}
                      />
                    </StyledTableCell>
                    <StyledTableCell align="right">
                      {project.balance_after_allocation?.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                    </StyledTableCell>
                    <StyledTableCell align="right">
                      {project.last_year_amount?.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                    </StyledTableCell>
                  </StyledTableRow>
                ))}
                {/* Total Row */}
                <TableRow>
                  <StyledTableCell>
                    <Typography fontWeight="bold">Total</Typography>
                  </StyledTableCell>
                  <StyledTableCell align="right">
                    <Typography fontWeight="bold">
                      {totalPercentage.toFixed(2)}%
                    </Typography>
                  </StyledTableCell>
                  <StyledTableCell align="right">
                    <Typography fontWeight="bold">
                      ₹{projects.reduce((sum, project) => sum + Number(project.allocated_amount || 0), 0)
                        .toLocaleString('en-US', { minimumFractionDigits: 2 })}
                    </Typography>
                  </StyledTableCell>
                  <StyledTableCell align="right">
                    <Typography fontWeight="bold">
                      ₹{remainingBalance.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                    </Typography>
                  </StyledTableCell>
                  <StyledTableCell align="right">
                    <Typography fontWeight="bold">
                      ₹{projects.reduce((sum, project) => sum + Number(project.last_year_amount || 0), 0)
                        .toLocaleString('en-US', { minimumFractionDigits: 2 })}
                    </Typography>
                  </StyledTableCell>
                </TableRow>
              </TableBody>
            </Table>
          </TableContainer>

          {/* Year Over Year Comparison */}
          <Box mt={4}>
            <Typography variant="h6" gutterBottom>
              Project Year Over Year Comparison
            </Typography>
            <TableContainer component={Paper} elevation={3}>
              <Table>
                <TableHead>
                  <TableRow>
                    <StyledTableCell>Project</StyledTableCell>
                    <StyledTableCell align="right">Current Year Amount (₹)</StyledTableCell>
                    <StyledTableCell align="right">Last Year Amount (₹)</StyledTableCell>
                    <StyledTableCell align="right">Difference (₹)</StyledTableCell>
                    <StyledTableCell align="right">Change (%)</StyledTableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {projects.map((project) => {
                    const difference = project.allocated_amount - project.last_year_amount;
                    const percentageChange = project.last_year_amount 
                      ? (difference / project.last_year_amount) * 100 
                      : 100;

                    return (
                      <StyledTableRow key={`comparison-${project._id}`}>
                        <StyledTableCell>{project.project_name}</StyledTableCell>
                        <StyledTableCell align="right">
                          {project.allocated_amount.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                        </StyledTableCell>
                        <StyledTableCell align="right">
                          {project.last_year_amount.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                        </StyledTableCell>
                        <StyledTableCell 
                          align="right"
                          sx={{ 
                            color: difference < 0 ? 'error.main' : 'success.main'
                          }}
                        >
                          {difference.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                        </StyledTableCell>
                        <StyledTableCell 
                          align="right"
                          sx={{ 
                            color: percentageChange < 0 ? 'error.main' : 'success.main'
                          }}
                        >
                          {percentageChange.toFixed(2)}%
                        </StyledTableCell>
                      </StyledTableRow>
                    );
                  })}
                  
                  {/* Total Row for Comparison */}
                  <TableRow>
                    <StyledTableCell>
                      <Typography fontWeight="bold">Total</Typography>
                    </StyledTableCell>
                    <StyledTableCell align="right">
                      <Typography fontWeight="bold">
                        ₹{projects.reduce((sum, project) => sum + Number(project.allocated_amount || 0), 0)
                          .toLocaleString('en-US', { minimumFractionDigits: 2 })}
                      </Typography>
                    </StyledTableCell>
                    <StyledTableCell align="right">
                      <Typography fontWeight="bold">
                        ₹{projects.reduce((sum, project) => sum + Number(project.last_year_amount || 0), 0)
                          .toLocaleString('en-US', { minimumFractionDigits: 2 })}
                      </Typography>
                    </StyledTableCell>
                    <StyledTableCell align="right">
                      <Typography fontWeight="bold">
                        ₹{(projects.reduce((sum, project) => 
                          sum + (Number(project.allocated_amount || 0) - Number(project.last_year_amount || 0)), 0))
                          .toLocaleString('en-US', { minimumFractionDigits: 2 })}
                      </Typography>
                    </StyledTableCell>
                    <StyledTableCell align="right">
                      <Typography fontWeight="bold">
                        {((projects.reduce((sum, project) => sum + Number(project.allocated_amount || 0), 0) /
                          projects.reduce((sum, project) => sum + Number(project.last_year_amount || 0), 0) - 1) * 100)
                          .toFixed(2)}%
                      </Typography>
                    </StyledTableCell>
                  </TableRow>
                </TableBody>
              </Table>
            </TableContainer>
          </Box>
        </>
      )}
    </Box>
  );
};

export default ProjectSettings;