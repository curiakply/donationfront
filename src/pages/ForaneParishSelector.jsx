import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, Select, MenuItem, FormControl, 
         InputLabel, Button, Typography, Box, Paper, CircularProgress, 
         Alert, Table, TableBody, TableCell, TableContainer, TableHead, 
         TableRow, Divider, IconButton } from '@mui/material';
import { FileText, ArrowLeft } from 'lucide-react';
import axiosInstance from '../axiosConfig';

const tableStyles = {
  border: '1px solid rgba(224, 224, 224, 1)',
  '& .MuiTableCell-root': {
    border: '1px solid rgba(224, 224, 224, 1)',
    padding: '8px',
  },
  '@media print': {
    '& .MuiTableCell-root': {
      border: '1px solid black',
    }
  }
};

const printStyles = `
  @page {
    size: A4;
    margin: 15mm;
  }
  @media print {
    html, body {
      height: auto !important;
      overflow: visible !important;
      -webkit-print-color-adjust: exact !important;
      print-color-adjust: exact !important;
      background-color: white !important;
    }
    
    * {
      overflow: visible !important;
    }
    
    .MuiPaper-root {
      box-shadow: none !important;
      overflow: visible !important;
    }
    
    .print-content {
      position: static !important;
      transform: none !important;
      overflow: visible !important;
      height: auto !important;
    }
    
    .MuiTableContainer-root {
      overflow: visible !important;
      break-inside: auto !important;
    }
    
    .MuiTable-root {
      width: 100% !important;
      break-inside: auto !important;
      page-break-inside: auto !important;
    }
    
    .MuiTableHead-root {
      display: table-header-group !important;
    }
    
    .MuiTableBody-root {
      display: table-row-group !important;
    }
    
    .MuiTableRow-root {
      break-inside: avoid !important;
      page-break-inside: avoid !important;
    }
    
    .MuiTableCell-root {
      border: 1px solid black !important;
      color: black !important;
    }
    
    .MuiTypography-root {
      color: black !important;
    }
    
    .MuiDivider-root {
      margin: 24px 0 !important;
      border-color: black !important;
    }
    
    .no-print {
      display: none !important;
    }
  }
`;


const REPORT_TYPES = {
  OVERVIEW: 'overview',
  OVERVIEW_FORANE: 'overview_forane', 
  OVERVIEWPLAIN: 'overviewplain',
  DETAILED: 'detailed',
  CONSOLIDATED: 'consolidated',
  ALLOCATIONS: 'allocations',
  ALLOCATIONS1: 'allocations1',
  ALLOCATIONS2: 'allocations2',
  ALLOCATIONS3: 'allocations3'

};

const REPORT_NAMES = {
  [REPORT_TYPES.OVERVIEW]: 'Koottayma Family Nos (Parish)',
  [REPORT_TYPES.OVERVIEW_FORANE]: 'Koottayma Family Nos (Forane)', 
  [REPORT_TYPES.OVERVIEWPLAIN]: 'Koottayma Overview',
  [REPORT_TYPES.DETAILED]: 'Detailed Tithe Information',
  [REPORT_TYPES.CONSOLIDATED]: 'Consolidated Totals',
  [REPORT_TYPES.ALLOCATIONS]: 'Consolidated Allocations Report',
  [REPORT_TYPES.ALLOCATIONS1]: 'Community Allocations Report',
  [REPORT_TYPES.ALLOCATIONS2]: 'Parish Allocations Report',
  [REPORT_TYPES.ALLOCATIONS3]: 'Projects Allocations Report'
};

const ForaneParishSelector = () => {
  const [foranes, setForanes] = useState([]);
  const [parishes, setParishes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedForane, setSelectedForane] = useState('');
  const [selectedParish, setSelectedParish] = useState(null);
  const [showReport, setShowReport] = useState(false);
  const [selectedReportType, setSelectedReportType] = useState('');
  const [reportData, setReportData] = useState(null);


  
  useEffect(() => {
    fetchForanes();
  }, []);

  const fetchForanes = async () => {
    try {
      const response = await axiosInstance.get('/forane');
      setForanes(response.data);
      setLoading(false);
    } catch (err) {
      setError(err.response?.data?.message || 'Error fetching data');
      setLoading(false);
    }
  };

  const fetchParishes = async (foraneId) => {
    try {
      const response = await axiosInstance.get(`/parish/forane/${foraneId}`);
      setParishes(response.data);
    } catch (err) {
      setError(err.response?.data?.message || 'Error fetching parishes');
    }
  };
  const handlePrint = () => {
    // Create print styles
    const style = document.createElement('style');
    style.innerHTML = printStyles;
    document.head.appendChild(style);
  
    // Force layout recalculation
    const printContent = document.querySelector('.print-content');
    if (printContent) {
      printContent.style.display = 'block';
      printContent.style.position = 'static';
      printContent.style.overflow = 'visible';
    }
  
    // Short delay to ensure styles are applied
    setTimeout(() => {
      window.print();
      
      // Cleanup
      document.head.removeChild(style);
    }, 250);
  };
  const fetchReportData = async () => {
    setLoading(true);
    try {
      let specificData;
      let parishResponse;
      const currentYear = new Date().getFullYear() - 1;
      switch (selectedReportType) {
        case REPORT_TYPES.OVERVIEW_FORANE:
        if (!selectedForane) throw new Error('Forane not selected');
        const foraneParishesRes = await axiosInstance.get(`/parish/forane/${selectedForane}`);
        const foraneDetails = foranes.find(f => f._id === selectedForane);
        
        // Fetch koottayma data for all parishes in the forane
        const parishKoottaymaData = await Promise.all(
          foraneParishesRes.data.map(async (parish) => {
            const koottaymaRes = await axiosInstance.get(`/koottayma/parish/${parish._id}`);
            return {
              parish: parish,
              koottaymas: koottaymaRes.data
            };
          })
        );

        specificData = {
          forane: foraneDetails,
          parishData: parishKoottaymaData
        };
        break;
        case REPORT_TYPES.OVERVIEW:
          if (!selectedParish?._id) throw new Error('Parish not selected');
          parishResponse = await axiosInstance.get(`/parish/${selectedParish._id}`);
          const [koottaymaRes, consolidatedRes] = await Promise.all([
            axiosInstance.get(`/koottayma/parish/${selectedParish._id}`),
            axiosInstance.get(`/transaction/consolidated-tithe/${selectedParish._id}`)
          ]);
          specificData = {
            parish: parishResponse.data,
            koottaymas: koottaymaRes.data,
            consolidated: consolidatedRes.data
          };
          break;
        case REPORT_TYPES.OVERVIEWPLAIN:
          if (!selectedParish?._id) throw new Error('Parish not selected');
          parishResponse = await axiosInstance.get(`/parish/${selectedParish._id}`);
          const [koottaymaRes1, consolidatedRes1] = await Promise.all([
            axiosInstance.get(`/koottayma/parish/${selectedParish._id}`),
            axiosInstance.get(`/transaction/consolidated-tithe/${selectedParish._id}`)
          ]);
          specificData = {
            parish: parishResponse.data,
            koottaymas: koottaymaRes1.data,
            consolidated: consolidatedRes1.data
          };
        break;

        case REPORT_TYPES.DETAILED:
          if (!selectedParish?._id) throw new Error('Parish not selected');
          parishResponse = await axiosInstance.get(`/parish/${selectedParish._id}`);
          const titheRes = await axiosInstance.get(`/transaction/tithe-info/${selectedParish._id}`);
          specificData = {
            parish: parishResponse.data,
            titheData: titheRes.data
          };
          break;

        case REPORT_TYPES.ALLOCATIONS:
          
          const [communityRes, projectRes, parishAllocRes] = await Promise.all([
            axiosInstance.get(`/community-settings/year/${currentYear}`),
            axiosInstance.get(`/project-settings/year/${currentYear}`),
            axiosInstance.get(`/parish-allocations/parish-allocations/${currentYear}`)
          ]);
          specificData = {
            year: currentYear,
            communitySettings: communityRes.data,
            projectSettings: projectRes.data,
            parishAllocations: parishAllocRes.data
          };
          break;
        case REPORT_TYPES.ALLOCATIONS1:
            
            const [communityRes1, projectRes1, parishAllocRes1] = await Promise.all([
              axiosInstance.get(`/community-settings/year/${currentYear}`),
              axiosInstance.get(`/project-settings/year/${currentYear}`),
              axiosInstance.get(`/parish-allocations/parish-allocations/${currentYear}`)
            ]);
            specificData = {
              year: currentYear,
              communitySettings: communityRes1.data,
              projectSettings: projectRes1.data,
              parishAllocations: parishAllocRes1.data
            };
            break;
          case REPORT_TYPES.ALLOCATIONS2:
              
              const [communityRes2, projectRes2, parishAllocRes2] = await Promise.all([
                axiosInstance.get(`/community-settings/year/${currentYear}`),
                axiosInstance.get(`/project-settings/year/${currentYear}`),
                axiosInstance.get(`/parish-allocations/parish-allocations/${currentYear}`)
              ]);
              specificData = {
                year: currentYear,
                communitySettings: communityRes2.data,
                projectSettings: projectRes2.data,
                parishAllocations: parishAllocRes2.data
              };
              break;
            case REPORT_TYPES.ALLOCATIONS3:
              
                const [communityRes3, projectRes3, parishAllocRes3] = await Promise.all([
                  axiosInstance.get(`/community-settings/year/${currentYear}`),
                  axiosInstance.get(`/project-settings/year/${currentYear}`),
                  axiosInstance.get(`/parish-allocations/parish-allocations/${currentYear}`)
                ]);
                specificData = {
                  year: currentYear,
                  communitySettings: communityRes3.data,
                  projectSettings: projectRes3.data,
                  parishAllocations: parishAllocRes3.data
                };
                break;
        case REPORT_TYPES.CONSOLIDATED:
          if (!selectedParish?._id) throw new Error('Parish not selected');
          parishResponse = await axiosInstance.get(`/parish/${selectedParish._id}`);
          const consolidatedResponse = await axiosInstance.get(`/transaction/consolidated-tithe/${selectedParish._id}`);
          specificData = {
            parish: parishResponse.data,
            consolidated: consolidatedResponse.data
          };
          break;

        default:
          throw new Error('Invalid report type');
      }

      setReportData(specificData);
      setShowReport(true);
      setLoading(false);
    } catch (err) {
      console.error('Error in fetchReportData:', err);
      setError(err.message || err.response?.data?.message || 'Error fetching report data');
      setLoading(false);
    }
  };

  const handleForaneChange = async (event) => {
    const foraneId = event.target.value;
    setSelectedForane(foraneId);
    setSelectedParish(null);
    setShowReport(false);
    setReportData(null);
    if (foraneId) {
      await fetchParishes(foraneId);
    } else {
      setParishes([]);
    }
  };

  const handleParishChange = (event) => {
    const parishId = event.target.value;
    const selectedParishData = parishes.find(parish => parish._id === parishId);
    setSelectedParish(selectedParishData);
    setShowReport(false);
    setReportData(null);
  };

  const handleReportTypeChange = (event) => {
    setSelectedReportType(event.target.value);
  };

  const handleBack = () => {
    setShowReport(false);
    setReportData(null);
    setSelectedReportType('');
  };

  const renderReport = () => {
    if (!reportData) return null;

    switch (selectedReportType) {
      case REPORT_TYPES.OVERVIEW_FORANE:
  return (
    <Paper elevation={2}>
      <Box p={3}>
        <Box textAlign="center" mb={3}>
          <Typography variant="h5" gutterBottom>
            Forane-wise Koottayma Family Numbers
          </Typography>
          <Typography variant="subtitle1" color="primary" gutterBottom>
            Forane: {reportData.forane?.name}
          </Typography>
        </Box>
        {reportData.parishData.map((parishInfo, pIndex) => (
          <Box key={pIndex} mb={4}>
            <Typography variant="h6" gutterBottom>
              Parish: {parishInfo.parish.name}
            </Typography>
            <TableContainer>
              <Table sx={tableStyles}>
                <TableHead>
                  <TableRow>
                    <TableCell>KOOTTAYMA NAME</TableCell>
                    <TableCell align="right">NUMBER OF FAMILIES</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {parishInfo.koottaymas.map((item, index) => (
                    <TableRow key={index} hover>
                      <TableCell>{item.name}</TableCell>
                      <TableCell align="right">{item.familyCount}</TableCell>
                    </TableRow>
                  ))}
                  <TableRow>
                    <TableCell><strong>Total</strong></TableCell>
                    <TableCell align="right">
                      <strong>
                        {parishInfo.koottaymas.reduce((sum, item) => sum + item.familyCount, 0)}
                      </strong>
                    </TableCell>
                  </TableRow>
                </TableBody>
              </Table>
            </TableContainer>
            {pIndex < reportData.parishData.length - 1 && (
              <Divider sx={{ my: 3 }} />
            )}
          </Box>
        ))}
        <Box textAlign="right" mt={3}>
          <Typography variant="h6">
            Total Families in Forane: {
              reportData.parishData.reduce((sum, parish) => 
                sum + parish.koottaymas.reduce((pSum, k) => pSum + k.familyCount, 0), 0
              )
            }
          </Typography>
        </Box>
      </Box>
    </Paper>
  );
      case REPORT_TYPES.OVERVIEW:
        return (
          <Paper elevation={2}>
            <Box p={3}>
              <Box textAlign="center" mb={3}>
                <Typography variant="h5" gutterBottom>
                 No Of Families in Koottayma Wise
                </Typography>
                <Typography variant="subtitle1" color="primary" gutterBottom>
                  Forane: {foranes.find(f => f._id === selectedForane)?.name}
                </Typography>
                <Typography variant="subtitle1" color="primary">
                  Parish: {reportData.parish?.name}
                </Typography>
              </Box>
              <TableContainer>
                <Table sx={tableStyles}>
                  <TableHead>
                    <TableRow>
                      <TableCell>KOOTTAYMA NAME</TableCell>
                      
                      <TableCell align="right">NUMBER OF FAMILIES</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {/* {reportData.koottaymas.map((item, index) => (
                      <TableRow key={index} hover>
                        <TableCell>{item.name}</TableCell>
                        
                        <TableCell align="right">{item.familyCount}</TableCell>
                      </TableRow>
                    ))} */}
                     {reportData.koottaymas
    .filter(item => {
      const name = (item.name || '').trim().toLowerCase();
      const invalid = ['(no kootayma)', 'unknown', 'no koottayma', 'none', 'n/a', ''];
      return !invalid.includes(name);
    })
    .map((item, index) => (
      <TableRow key={index} hover>
        <TableCell>{item.name}</TableCell>
        <TableCell align="right">{item.familyCount}</TableCell>
      </TableRow>
    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            </Box>
          </Paper>
        );
        case REPORT_TYPES.OVERVIEWPLAIN:
          return (
            <Paper elevation={2}>
              <Box p={3}>
                <Box textAlign="center" mb={3}>
                  <Typography variant="h5" gutterBottom>
                    KOOTTAYMA OVERVIEW
                  </Typography>
                  <Typography variant="subtitle1" color="primary" gutterBottom>
                    Forane: {foranes.find(f => f._id === selectedForane)?.name}
                  </Typography>
                  <Typography variant="subtitle1" color="primary">
                    Parish: {reportData.parish?.name}
                  </Typography>
                </Box>
                <TableContainer>
                  <Table sx={tableStyles}>
                    <TableHead>
                      <TableRow>
                        <TableCell>KOOTTAYMA NAME</TableCell>
                        <TableCell align="right">AMOUNT</TableCell>
                        <TableCell align="right">NUMBER OF FAMILIES</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {/* {reportData.koottaymas.map((item, index) => (
                        <TableRow key={index} hover>
                          <TableCell>{item.name}</TableCell>
                          <TableCell></TableCell>
                          <TableCell align="right"></TableCell>
                        </TableRow>
                      ))} */}
                       {reportData.koottaymas
    .filter(item => {
      const name = (item.name || '').trim().toLowerCase();
      const invalid = ['(no kootayma)', 'unknown', 'no koottayma', 'none', 'n/a', ''];
      return !invalid.includes(name);
    })
    .map((item, index) => (
      <TableRow key={index} hover>
        <TableCell>{item.name}</TableCell>
        <TableCell></TableCell>
        <TableCell align="right"></TableCell>
      </TableRow>
    ))}
                    </TableBody>
                  </Table>
                </TableContainer>
              </Box>
            </Paper>
          );
      case REPORT_TYPES.DETAILED:
        return (
          <Paper elevation={2}>
            <Box p={3}>
              <Box textAlign="center" mb={3}>
                <Typography variant="h5" gutterBottom>
                  KOOTAYMA WISE TITHE INFORMATION
                </Typography>
                <Typography variant="subtitle1" color="primary" gutterBottom>
                  Forane: {foranes.find(f => f._id === selectedForane)?.name}
                </Typography>
                <Typography variant="subtitle1" color="primary" gutterBottom>
                  Parish: {reportData.parish?.name}
                </Typography>
              </Box>
              {reportData.titheData.map((koottayma, index) => (
                <Box key={index} mb={4}>
                  <Typography variant="subtitle1" fontWeight="bold" gutterBottom>
                    KOOTAYMA - {koottayma.name}
                  </Typography>
                  <TableContainer>
                    <Table sx={tableStyles}>
                      <TableHead>
                        <TableRow>
                          <TableCell>HOUSE NAME</TableCell>
                          <TableCell>HEAD NAME</TableCell>
                          <TableCell>TEL NO</TableCell>
                          <TableCell align="right">TITHE AMOUNT</TableCell>
                        </TableRow>
                      </TableHead>
                      <TableBody>
                        {koottayma.families.map((family, fIndex) => (
                          <TableRow key={fIndex} hover>
                            <TableCell>{family.houseName}</TableCell>
                            <TableCell>{family.headName}</TableCell>
                            <TableCell>{family.phone}</TableCell>
                            <TableCell align="right">{family.totalAmount}</TableCell>
                          </TableRow>
                        ))}
                        <TableRow>
                          <TableCell colSpan={3} align="right">Total:</TableCell>
                          <TableCell align="right">{koottayma.totalAmount}</TableCell>
                        </TableRow>
                      </TableBody>
                    </Table>
                  </TableContainer>
                </Box>
              ))}
            </Box>
          </Paper>
        );

      case REPORT_TYPES.ALLOCATIONS:
        return (
          <Paper elevation={2}>
            <Box p={3}>
              <Typography variant="h5" align="center" gutterBottom>
                YEARLY ALLOCATIONS REPORT
              </Typography>
              <Typography variant="h6" align="center" gutterBottom>
                Year: {reportData.year}
              </Typography>
              <Typography variant="h6" align="center" gutterBottom>
                    Total Collection: {reportData.communitySettings.total_amount}
               </Typography>
              <Box mb={4}>
                <Typography variant="h6" gutterBottom>Community Allocations</Typography>
                <Box mb={2}>
                 
                  <Typography>
                  Total Community Allocation: {reportData.communitySettings.total_allocated}
                  </Typography>
                </Box>
                <TableContainer>
                  <Table sx={tableStyles}>
                    <TableHead>
                      <TableRow>
                        <TableCell>Community Name</TableCell>
                        <TableCell align="right">Percentage</TableCell>
                        <TableCell align="right">Amount</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {reportData.communitySettings.settings.map((item, index) => (
                        <TableRow key={index} hover>
                          <TableCell>{item.community_name}</TableCell>
                          <TableCell align="right">{item.percentage}%</TableCell>
                          <TableCell align="right">{item.allocated_amount}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </TableContainer>
                
              </Box>

              <Divider sx={{ my: 4 }} />

              <Box mb={4}>
                <Typography variant="h6" gutterBottom>Parish Allocations</Typography>
                <Box mb={2}>
                  <Typography>
                    Total Amount: {reportData.communitySettings.parish_amount}
                  </Typography>
                  <Typography>
                    Percentage: {reportData.communitySettings.parish_percentage}%
                  </Typography>
                </Box>
                <TableContainer>
                  <Table sx={tableStyles}>
                    <TableHead>
                      <TableRow>
                        <TableCell>Parish Name</TableCell>
                        <TableCell align="right">Collection</TableCell>
                        <TableCell align="right">Preliminary</TableCell>
                        <TableCell align="right">ProportionalShare</TableCell>
                        <TableCell align="right">Allocation</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {reportData.parishAllocations.map((item, index) => (
                        <TableRow key={index} hover>
                          <TableCell>{item.name}</TableCell>
                          <TableCell align="right">{item.collection}</TableCell>
                          <TableCell align="right">{item.prelim}</TableCell>
                          <TableCell align="right">{item.proportionalShare}</TableCell>
                          <TableCell align="right">{item.totalAllocation}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </TableContainer>
              </Box>

              <Divider sx={{ my: 4 }} />

              <Box>
                <Typography variant="h6" gutterBottom>Project Allocations</Typography>
                <Box mb={2}>
                  <Typography>
                    Other Projects Amount: {reportData.communitySettings.other_projects_amount}
                  </Typography>
                  <Typography>
                    Percentage: {reportData.communitySettings.other_projects_percentage}%
                  </Typography>
                </Box>
                <TableContainer>
                  <Table sx={tableStyles}>
                    <TableHead>
                      <TableRow>
                        <TableCell>Project Name</TableCell>
                        <TableCell align="right">Percentage</TableCell>
                        <TableCell align="right">Amount</TableCell>                       
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {reportData.projectSettings.settings.map((item, index) => (
                        <TableRow key={index} hover>
                          <TableCell>{item.project_name}</TableCell>
                          <TableCell align="right">{item.percentage}%</TableCell>
                          <TableCell align="right">{item.allocated_amount}</TableCell>                         
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </TableContainer>
              </Box>
            </Box>
          </Paper>
        );
        case REPORT_TYPES.ALLOCATIONS1:
          return (
            <Paper elevation={2}>
              <Box p={3}>
                <Typography variant="h5" align="center" gutterBottom>
                  COMMUNITY ALLOCATIONS REPORT
                </Typography>
                <Typography variant="h6" align="center" gutterBottom>
                  Year: {reportData.year}
                </Typography>
                <Typography variant="h6" align="center" gutterBottom>
                      Total Collection: {reportData.communitySettings.total_amount}
                 </Typography>
                <Box mb={4}>
                  <Typography variant="h6" gutterBottom>Community Allocations</Typography>
                  <Box mb={2}>
                   
                    <Typography>
                    Total Community Allocation: {reportData.communitySettings.total_allocated}
                    </Typography>
                  </Box>
                  <TableContainer>
                    <Table sx={tableStyles}>
                      <TableHead>
                        <TableRow>
                          <TableCell>Community Name</TableCell>
                          <TableCell align="right">Percentage</TableCell>
                          <TableCell align="right">Amount</TableCell>
                        </TableRow>
                      </TableHead>
                      <TableBody>
                        {reportData.communitySettings.settings.map((item, index) => (
                          <TableRow key={index} hover>
                            <TableCell>{item.community_name}</TableCell>
                            <TableCell align="right">{item.percentage}%</TableCell>
                            <TableCell align="right">{item.allocated_amount}</TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </TableContainer>
                  
                </Box>
  
                
  
                
              </Box>
            </Paper>
          );
          case REPORT_TYPES.ALLOCATIONS2:
            return (
              <Paper elevation={2}>
                <Box p={3}>
                  <Typography variant="h5" align="center" gutterBottom>
                    PARISH ALLOCATIONS REPORT
                  </Typography>
                  <Typography variant="h6" align="center" gutterBottom>
                    Year: {reportData.year}
                  </Typography>
                  <Typography variant="h6" align="center" gutterBottom>
                        Total Collection: {reportData.communitySettings.total_amount}
                   </Typography>
                
    
                  <Divider sx={{ my: 4 }} />
    
                  <Box mb={4}>
                    <Typography variant="h6" gutterBottom>Parish Allocations</Typography>
                    <Box mb={2}>
                      <Typography>
                        Total Amount: {reportData.communitySettings.parish_amount}
                      </Typography>
                      <Typography>
                        Percentage: {reportData.communitySettings.parish_percentage}%
                      </Typography>
                    </Box>
                    <TableContainer>
                      <Table sx={tableStyles}>
                        <TableHead>
                          <TableRow>
                            <TableCell>Parish Name</TableCell>
                            <TableCell align="right">Collection</TableCell>
                            <TableCell align="right">Preliminary</TableCell>
                            <TableCell align="right">ProportionalShare</TableCell>
                            <TableCell align="right">Allocation</TableCell>
                          </TableRow>
                        </TableHead>
                        <TableBody>
                          {reportData.parishAllocations.map((item, index) => (
                            <TableRow key={index} hover>
                              <TableCell>{item.name}</TableCell>
                              <TableCell align="right">{item.collection}</TableCell>
                              <TableCell align="right">{item.prelim}</TableCell>
                              <TableCell align="right">{item.proportionalShare}</TableCell>
                              <TableCell align="right">{item.totalAllocation}</TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </TableContainer>
                  </Box>
    
                  
                </Box>
              </Paper>
            );
            case REPORT_TYPES.ALLOCATIONS3:
              return (
                <Paper elevation={2}>
                  <Box p={3}>
                    <Typography variant="h5" align="center" gutterBottom>
                      PROJECT ALLOCATIONS REPORT
                    </Typography>
                    <Typography variant="h6" align="center" gutterBottom>
                      Year: {reportData.year}
                    </Typography>
                    <Typography variant="h6" align="center" gutterBottom>
                          Total Collection: {reportData.communitySettings.total_amount}
                     </Typography>
                   
      
                    <Divider sx={{ my: 4 }} />
      
                    <Box>
                      <Typography variant="h6" gutterBottom>Project Allocations</Typography>
                      <Box mb={2}>
                        <Typography>
                          Other Projects Amount: {reportData.communitySettings.other_projects_amount}
                        </Typography>
                        <Typography>
                          Percentage: {reportData.communitySettings.other_projects_percentage}%
                        </Typography>
                      </Box>
                      <TableContainer>
                        <Table sx={tableStyles}>
                          <TableHead>
                            <TableRow>
                              <TableCell>Project Name</TableCell>
                              <TableCell align="right">Percentage</TableCell>
                              <TableCell align="right">Amount</TableCell>                       
                            </TableRow>
                          </TableHead>
                          <TableBody>
                            {reportData.projectSettings.settings.map((item, index) => (
                              <TableRow key={index} hover>
                                <TableCell>{item.project_name}</TableCell>
                                <TableCell align="right">{item.percentage}%</TableCell>
                                <TableCell align="right">{item.allocated_amount}</TableCell>                         
                              </TableRow>
                            ))}
                          </TableBody>
                        </Table>
                      </TableContainer>
                    </Box>
                  </Box>
                </Paper>
              );

      case REPORT_TYPES.CONSOLIDATED:
        return (
          <Paper elevation={2}>
            <Box p={3}>
              <Box textAlign="center" mb={3}>
                <Typography variant="h5" gutterBottom>
                  KOOTAYMAWISE TITHE TOTAL
                </Typography>
                <Typography variant="subtitle1" color="primary" gutterBottom>
                  Forane: {foranes.find(f => f._id === selectedForane)?.name}
                </Typography>
                <Typography variant="subtitle1" color="primary" gutterBottom>
                  Parish: {reportData.parish?.name}
                </Typography>
              </Box>
              <TableContainer>
                <Table sx={tableStyles}>
                  <TableHead>
                    <TableRow>
                      <TableCell>KOOTAYMA NAME</TableCell>
                      <TableCell align="right">AMOUNT</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {reportData.consolidated.map((item, index) => (
                      <TableRow key={index} hover>
                        <TableCell>{item.name}</TableCell>
                        <TableCell align="right">{item.amount}</TableCell>
                      </TableRow>
                    ))}
                    <TableRow>
                      <TableCell>Total</TableCell>
                      <TableCell align="right">
                        {reportData.consolidated.reduce((sum, item) => sum + item.amount, 0)}
                      </TableCell>
                    </TableRow>
                  </TableBody>
                </Table>
              </TableContainer>
            </Box>
          </Paper>
        );
    }
  };

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight={200}>
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight={200}>
        <Alert severity="error">{error}</Alert>
      </Box>
    );
  }

  if (showReport) {
    return (
      <Box sx={{ 
        width: '100%', 
        overflow: 'visible'
      }}>
        <Box mb={2} className="no-print">
          <Button
            variant="outlined"
            startIcon={<ArrowLeft />}
            onClick={handleBack}
          >
            Back to Selection
          </Button>
          <Button
            variant="contained"
            onClick={handlePrint}
            sx={{ ml: 2 }}
          >
            Print Report
          </Button>
        </Box>
        <Box className="print-content" sx={{ 
          overflow: 'visible',
          breakInside: 'auto',
          pageBreakInside: 'auto'
        }}>
          {renderReport()}
        </Box>
      </Box>
    );
  }

  return (
    <Card sx={{ maxWidth: 800, mx: 'auto' }}>
      <CardHeader
        title={
          <Typography variant="h5" align="center">
            Select Parish and Report Type
          </Typography>
        }
      />
      <CardContent>
        <Box component="form" noValidate autoComplete="off" sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
          <FormControl fullWidth>
            <InputLabel id="report-type-label">Select Report Type</InputLabel>
            <Select
              labelId="report-type-label"
              value={selectedReportType}
              label="Select Report Type"
              onChange={handleReportTypeChange}
            >
              <MenuItem value="">
                <em>Select Report Type</em>
              </MenuItem>
              {Object.entries(REPORT_NAMES).map(([value, name]) => (
                <MenuItem key={value} value={value}>
                  {name}
                </MenuItem>
              ))}
            </Select>
          </FormControl>

          {selectedReportType && selectedReportType !== REPORT_TYPES.ALLOCATIONS && 
     selectedReportType !== REPORT_TYPES.ALLOCATIONS1 && selectedReportType !== REPORT_TYPES.ALLOCATIONS2 && 
     selectedReportType !== REPORT_TYPES.ALLOCATIONS3 && (
      <>
        <FormControl fullWidth>
          <InputLabel id="forane-select-label">Select Forane</InputLabel>
          <Select
            labelId="forane-select-label"
            value={selectedForane}
            label="Select Forane"
            onChange={handleForaneChange}
          >
            <MenuItem value="">
              <em>Select a Forane</em>
            </MenuItem>
            {foranes.map((forane) => (
              <MenuItem key={forane._id} value={forane._id}>
                {forane.name}
              </MenuItem>
            ))}
          </Select>
        </FormControl>

        {/* Only show parish selection for reports that need it */}
        {selectedReportType !== REPORT_TYPES.OVERVIEW_FORANE && (
          <FormControl fullWidth disabled={!selectedForane}>
            <InputLabel id="parish-select-label">Select Parish</InputLabel>
            <Select
              labelId="parish-select-label"
              value={selectedParish?._id || ''}
              label="Select Parish"
              onChange={handleParishChange}
            >
              <MenuItem value="">
                <em>Select a Parish</em>
              </MenuItem>
              {parishes.map((parish) => (
                <MenuItem key={parish._id} value={parish._id}>
                  {parish.name}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        )}
      </>
    )}

    <Box display="flex" justifyContent="center" mt={2}>
      <Button
        variant="contained"
        size="large"
        startIcon={<FileText />}
        onClick={fetchReportData}
        disabled={
          (!selectedParish && selectedReportType !== REPORT_TYPES.ALLOCATIONS && 
           selectedReportType !== REPORT_TYPES.ALLOCATIONS1 && selectedReportType !== REPORT_TYPES.ALLOCATIONS2 && 
           selectedReportType !== REPORT_TYPES.ALLOCATIONS3 && selectedReportType !== REPORT_TYPES.OVERVIEW_FORANE) || 
          !selectedReportType || 
          (selectedReportType === REPORT_TYPES.OVERVIEW_FORANE && !selectedForane)
        }
      >
        Generate Report
      </Button>
    </Box>
        </Box>
      </CardContent>
    </Card>
  );
};
export default ForaneParishSelector;