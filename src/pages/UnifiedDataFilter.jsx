import React, { useState, useEffect, useMemo } from 'react';
import {
  Box,
  Button,
  TextField,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Chip,
  Paper,
  Typography,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Grid,
  Alert,
  CircularProgress,
  Stack,
  Card,
  CardContent
} from '@mui/material';
import {
  ExpandMore as ExpandMoreIcon,
  FilterList as FilterListIcon,
  Clear as ClearIcon,
  Refresh as RefreshIcon,
  Download as DownloadIcon,
  Search as SearchIcon,
  ContentCopy as CopyIcon
} from '@mui/icons-material';
import { MaterialReactTable } from 'material-react-table';
import axiosInstance from '../axiosConfig';

export default function UnifiedDataFilter() {
  const [filters, setFilters] = useState({});
  const [expandedSections, setExpandedSections] = useState({
    person: true,
    family: false,
    transaction: false,
    location: false
  });
  
  const [dbData, setDbData] = useState({
    foranes: [],
    parishes: [],
    koottaymas: [],
    families: [],
    relations: [],
    loading: true,
    error: null
  });

  const [searchResults, setSearchResults] = useState([]);
  const [searching, setSearching] = useState(false);

  useEffect(() => {
    fetchAllData();
  }, []);

  const fetchAllData = async () => {
    setDbData(prev => ({ ...prev, loading: true, error: null }));
    
    try {
      const [foranes, parishes, koottaymas, relations] = await Promise.all([
        axiosInstance.get('/forane').then(res => res.data),
        axiosInstance.get('/parish').then(res => res.data),
        axiosInstance.get('/koottayma').then(res => res.data),
        axiosInstance.get('/person/distinct-relations').then(res => res.data)
      ]);

      setDbData({
        foranes: foranes || [],
        parishes: parishes || [],
        koottaymas: koottaymas || [],
        families: [],
        relations: relations || [],
        loading: false,
        error: null
      });
    } catch (error) {
      console.error('Error fetching data:', error);
      setDbData(prev => ({ 
        ...prev, 
        loading: false, 
        error: 'Failed to load data. Please check your API connection.' 
      }));
    }
  };

  const fetchFamiliesByParish = async (parishId) => {
    try {
      const response = await axiosInstance.get(`/family/parish/${parishId}`);
      setDbData(prev => ({ ...prev, families: response.data || [] }));
    } catch (error) {
      console.error('Error fetching families:', error);
    }
  };

  const filterSections = {
    person: {
      title: 'Person Filters',
      fields: [
        { name: 'name', label: 'Name', type: 'text' },
        { name: 'baptismName', label: 'Baptism Name', type: 'text' },
        { name: 'gender', label: 'Gender', type: 'select', options: ['male', 'female'] },
        { name: 'relation', label: 'Relation', type: 'select-db', dataKey: 'relations' },
        { name: 'status', label: 'Status', type: 'select', options: ['active', 'inactive', 'moved_out', 'deceased', 'rollback'] },
        { name: 'phone', label: 'Phone', type: 'text' },
        { name: 'email', label: 'Email', type: 'text' },
        { name: 'education', label: 'Education', type: 'text' },
        { name: 'occupation', label: 'Occupation', type: 'text' },
        { name: 'dob', label: 'Date of Birth', type: 'date-range' },
        { name: 'pid', label: 'Person ID', type: 'number' },
        { name: 'customOrder', label: 'Custom Order', type: 'number' }
      ]
    },
    family: {
      title: 'Family Filters',
      fields: [
        { name: 'family.id', label: 'Family ID', type: 'number' },
        { name: 'family.name', label: 'Family Name', type: 'text' },
        { name: 'family.familyNumber', label: 'Family Number', type: 'number' },
        { name: 'family.phone', label: 'Family Phone', type: 'text' },
        { name: 'family.building', label: 'Building', type: 'text' },
        { name: 'family.status', label: 'Family Status', type: 'select', options: ['active', 'inactive'] },
        { name: 'family.verify', label: 'Verified', type: 'select', options: ['YES', 'NO'] }
      ]
    },
    transaction: {
      title: 'Transaction Filters',
      fields: [
        { name: 'transaction.amountPaid', label: 'Amount Paid', type: 'number-range' },
        { name: 'transaction.date', label: 'Transaction Date', type: 'date-range' },
        { name: 'transaction.status', label: 'Transaction Status', type: 'select', options: ['active', 'transferred', 'restored'] },
        { name: 'transaction.isTransferred', label: 'Is Transferred', type: 'select', options: ['true', 'false'] }
      ]
    },
    location: {
      title: 'Location Filters',
      fields: [
        { name: 'forane', label: 'Forane', type: 'select-db', dataKey: 'foranes' },
        { name: 'parish', label: 'Parish', type: 'select-db', dataKey: 'parishes' },
        { name: 'koottayma', label: 'Koottayma', type: 'select-db', dataKey: 'koottaymas' },
        { name: 'family', label: 'Family', type: 'select-db', dataKey: 'families' },
        
{ name: 'street', label: 'Street', type: 'text' },
        { name: 'city', label: 'City', type: 'text' },
        { name: 'district', label: 'District', type: 'text' },
        { name: 'state', label: 'State', type: 'text' },
        { name: 'pincode', label: 'Pincode', type: 'text' }
      ]
    }
  };

  const handleFilterChange = (field, value, operator = 'eq') => {
    if (value === '') {
      removeFilter(field);
      return;
    }

    setFilters(prev => ({
      ...prev,
      [field]: { value, operator }
    }));

    if (field === 'parish' && value) {
      fetchFamiliesByParish(value);
    }
  };

  const handleRangeChange = (field, type, value) => {
    setFilters(prev => {
      const current = prev[field] || {};
      const updated = { ...current, [type]: value };
      
      if (!updated.from && !updated.to) {
        const newFilters = { ...prev };
        delete newFilters[field];
        return newFilters;
      }
      
      return { ...prev, [field]: updated };
    });
  };

  const removeFilter = (field) => {
    setFilters(prev => {
      const newFilters = { ...prev };
      delete newFilters[field];
      return newFilters;
    });
  };

  const clearAllFilters = () => {
    setFilters({});
    setDbData(prev => ({ ...prev, families: [] }));
    setSearchResults([]);
  };

  const getFilteredData = (dataKey) => {
    if (dataKey === 'parishes') {
      const selectedForane = filters.forane?.value;
      if (!selectedForane) return dbData.parishes;
      return dbData.parishes.filter(p => p.forane?._id === selectedForane || p.forane === selectedForane);
    }
    
    if (dataKey === 'koottaymas') {
      const selectedParish = filters.parish?.value;
      if (!selectedParish) return dbData.koottaymas;
      return dbData.koottaymas.filter(k => k.parish?._id === selectedParish || k.parish === selectedParish);
    }
    
    return dbData[dataKey] || [];
  };

  const buildMongoQuery = () => {
    const query = {};
    
    Object.entries(filters).forEach(([field, filterData]) => {
      if (filterData.from || filterData.to) {
        const rangeQuery = {};
        if (filterData.from) rangeQuery.$gte = filterData.from;
        if (filterData.to) rangeQuery.$lte = filterData.to;
        query[field] = rangeQuery;
      } else if (filterData.operator === 'eq') {
        query[field] = filterData.value;
      } else if (filterData.operator === 'contains') {
        query[field] = { $regex: filterData.value, $options: 'i' };
      } else if (filterData.operator === 'gt') {
        query[field] = { $gt: parseFloat(filterData.value) };
      } else if (filterData.operator === 'lt') {
        query[field] = { $lt: parseFloat(filterData.value) };
      } else if (filterData.operator === 'gte') {
        query[field] = { $gte: parseFloat(filterData.value) };
      } else if (filterData.operator === 'lte') {
        query[field] = { $lte: parseFloat(filterData.value) };
      }
    });
    
    return query;
  };
const executeSearch = async () => {
  setSearching(true);
  try {
    const query = buildMongoQuery();
    // Use the correct endpoint
    const response = await axiosInstance.post('/filter/persons', { 
      filter: query,
      page: 1,
      limit: 50
    });
    setSearchResults(response.data.data || []);
  } catch (error) {
    console.error('Error searching:', error);
    setDbData(prev => ({ ...prev, error: 'Search failed. Please try again.' }));
  } finally {
    setSearching(false);
  }
};

  const exportQuery = () => {
    const query = buildMongoQuery();
    const dataStr = JSON.stringify(query, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(dataBlob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `filter-query-${Date.now()}.json`;
    link.click();
  };

  const copyToClipboard = () => {
    const query = buildMongoQuery();
    navigator.clipboard.writeText(JSON.stringify(query, null, 2));
  };

  const renderField = (field) => {
    const { name, type, label } = field;
    const filterData = filters[name] || {};

    if (type === 'date-range' || type === 'number-range') {
      return (
        <Box sx={{ display: 'flex', gap: 1, alignItems: 'center' }}>
          <TextField
            type={type === 'date-range' ? 'date' : 'number'}
            value={filterData.from || ''}
            onChange={(e) => handleRangeChange(name, 'from', e.target.value)}
            label="From"
            size="small"
            fullWidth
            InputLabelProps={{ shrink: true }}
          />
          <Typography>to</Typography>
          <TextField
            type={type === 'date-range' ? 'date' : 'number'}
            value={filterData.to || ''}
            onChange={(e) => handleRangeChange(name, 'to', e.target.value)}
            label="To"
            size="small"
            fullWidth
            InputLabelProps={{ shrink: true }}
          />
        </Box>
      );
    }

    if (type === 'select-db') {
      const options = getFilteredData(field.dataKey);
      const getDisplayName = (opt) => {
        if (field.dataKey === 'relations') return opt;
        if (field.dataKey === 'families') return `${opt.name} (${opt.id || opt.familyNumber})`;
        return opt.name;
      };

      return (
        <FormControl fullWidth size="small">
          <InputLabel>{label}</InputLabel>
          <Select
            value={filterData.value || ''}
            onChange={(e) => handleFilterChange(name, e.target.value)}
            label={label}
            disabled={dbData.loading || (field.dataKey === 'families' && !filters.parish)}
          >
            <MenuItem value="">
              <em>None</em>
            </MenuItem>
            {options.map((opt, idx) => (
              <MenuItem key={opt._id || opt || idx} value={opt._id || opt}>
                {getDisplayName(opt)}
              </MenuItem>
            ))}
          </Select>
        </FormControl>
      );
    }

    if (type === 'text') {
      return (
        <Box sx={{ display: 'flex', gap: 1 }}>
          <FormControl size="small" sx={{ minWidth: 120 }}>
            <InputLabel>Operator</InputLabel>
            <Select
              value={filterData.operator || 'contains'}
              onChange={(e) => {
                const newOp = e.target.value;
                if (filterData.value) {
                  handleFilterChange(name, filterData.value, newOp);
                }
              }}
              label="Operator"
            >
              <MenuItem value="contains">Contains</MenuItem>
              <MenuItem value="eq">Equals</MenuItem>
            </Select>
          </FormControl>
          <TextField
            value={filterData.value || ''}
            onChange={(e) => handleFilterChange(name, e.target.value, filterData.operator || 'contains')}
            label={label}
            size="small"
            fullWidth
          />
        </Box>
      );
    }

    if (type === 'number') {
      return (
        <Box sx={{ display: 'flex', gap: 1 }}>
          <FormControl size="small" sx={{ minWidth: 80 }}>
            <InputLabel>Op</InputLabel>
            <Select
              value={filterData.operator || 'eq'}
              onChange={(e) => {
                const newOp = e.target.value;
                if (filterData.value) {
                  handleFilterChange(name, filterData.value, newOp);
                }
              }}
              label="Op"
            >
              <MenuItem value="eq">=</MenuItem>
              <MenuItem value="gt">&gt;</MenuItem>
              <MenuItem value="lt">&lt;</MenuItem>
              <MenuItem value="gte">≥</MenuItem>
              <MenuItem value="lte">≤</MenuItem>
            </Select>
          </FormControl>
          <TextField
            type="number"
            value={filterData.value || ''}
            onChange={(e) => handleFilterChange(name, e.target.value, filterData.operator || 'eq')}
            label={label}
            size="small"
            fullWidth
          />
        </Box>
      );
    }

    if (type === 'select') {
      return (
        <FormControl fullWidth size="small">
          <InputLabel>{label}</InputLabel>
          <Select
            value={filterData.value || ''}
            onChange={(e) => handleFilterChange(name, e.target.value)}
            label={label}
          >
            <MenuItem value="">
              <em>None</em>
            </MenuItem>
            {field.options.map(opt => (
              <MenuItem key={opt} value={opt}>{opt}</MenuItem>
            ))}
          </Select>
        </FormControl>
      );
    }

    return null;
  };

  const activeFiltersCount = Object.keys(filters).length;
  const mongoQuery = buildMongoQuery();

  // Table columns for search results
  const columns = useMemo(
    () => [
      { accessorKey: 'name', header: 'Name', size: 150 },
      { accessorKey: 'baptismName', header: 'Baptism Name', size: 150 },
      { accessorKey: 'gender', header: 'Gender', size: 100 },
      { accessorKey: 'relation', header: 'Relation', size: 120 },
      { accessorKey: 'status', header: 'Status', size: 120 },
      { accessorKey: 'phone', header: 'Phone', size: 130 },
      { accessorKey: 'email', header: 'Email', size: 200 },
    ],
    []
  );

  return (
    <Box sx={{ p: 3, bgcolor: 'grey.50', minHeight: '100vh' }}>
      <Box sx={{ maxWidth: 1400, mx: 'auto' }}>
        {/* Header */}
        <Paper elevation={3} sx={{ p: 3, mb: 3 }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
              <FilterListIcon sx={{ fontSize: 40, color: 'primary.main' }} />
              <Box>
                <Typography variant="h4" fontWeight="bold">
                  Advanced Data Filter
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Filter persons, families, and transactions
                </Typography>
              </Box>
            </Box>
            <Stack direction="row" spacing={1}>
              <Button
                startIcon={dbData.loading ? <CircularProgress size={20} /> : <RefreshIcon />}
                onClick={fetchAllData}
                disabled={dbData.loading}
                variant="outlined"
              >
                Refresh
              </Button>
              {activeFiltersCount > 0 && (
                <>
                  <Button
                    startIcon={<SearchIcon />}
                    onClick={executeSearch}
                    variant="contained"
                    disabled={searching}
                  >
                    {searching ? 'Searching...' : 'Search'}
                  </Button>
                  <Button
                    startIcon={<DownloadIcon />}
                    onClick={exportQuery}
                    variant="outlined"
                    color="success"
                  >
                    Export
                  </Button>
                  <Button
                    startIcon={<ClearIcon />}
                    onClick={clearAllFilters}
                    variant="outlined"
                    color="error"
                  >
                    Clear ({activeFiltersCount})
                  </Button>
                </>
              )}
            </Stack>
          </Box>

          {dbData.error && (
            <Alert severity="error" sx={{ mb: 2 }}>
              {dbData.error}
            </Alert>
          )}

          {dbData.loading && (
            <Box sx={{ display: 'flex', justifyContent: 'center', py: 2 }}>
              <CircularProgress />
              <Typography sx={{ ml: 2 }}>Loading data...</Typography>
            </Box>
          )}
        </Paper>

        {/* Active Filters */}
        {activeFiltersCount > 0 && (
          <Paper elevation={2} sx={{ p: 2, mb: 3, bgcolor: 'primary.50' }}>
            <Typography variant="subtitle1" fontWeight="bold" sx={{ mb: 1 }}>
              Active Filters:
            </Typography>
            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
              {Object.entries(filters).map(([field, filterData]) => {
                const fieldLabel = Object.values(filterSections)
                  .flatMap(s => s.fields)
                  .find(f => f.name === field)?.label || field;
                
                return (
                  <Chip
                    key={field}
                    label={`${fieldLabel}: ${
                      filterData.from || filterData.to 
                        ? `${filterData.from || '∞'} - ${filterData.to || '∞'}`
                        : `${filterData.operator || 'eq'} ${filterData.value}`
                    }`}
                    onDelete={() => removeFilter(field)}
                    color="primary"
                    variant="outlined"
                  />
                );
              })}
            </Box>
          </Paper>
        )}

        {/* Filter Sections */}
        <Box sx={{ mb: 3 }}>
          {Object.entries(filterSections).map(([sectionKey, section]) => (
            <Accordion 
              key={sectionKey}
              expanded={expandedSections[sectionKey]}
              onChange={() => setExpandedSections(prev => ({ ...prev, [sectionKey]: !prev[sectionKey] }))}
              sx={{ mb: 1 }}
            >
              <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                <Typography variant="h6" fontWeight="bold">
                  {section.title}
                </Typography>
              </AccordionSummary>
              <AccordionDetails>
                <Grid container spacing={2}>
                  {section.fields.map(field => (
                    <Grid item xs={12} sm={6} md={4} key={field.name}>
                      <Box>
                        <Typography variant="caption" color="text.secondary" sx={{ mb: 0.5, display: 'block' }}>
                          {field.label}
                        </Typography>
                        {renderField(field)}
                      </Box>
                    </Grid>
                  ))}
                </Grid>
              </AccordionDetails>
            </Accordion>
          ))}
        </Box>

        {/* Search Results Table */}
        {searchResults.length > 0 && (
          <Paper elevation={3} sx={{ mb: 3 }}>
            <MaterialReactTable
              columns={columns}
              data={searchResults}
              enableColumnResizing
              enableStickyHeader
              enableStickyFooter
              muiTableContainerProps={{ sx: { maxHeight: '600px' } }}
              initialState={{ density: 'compact' }}
            />
          </Paper>
        )}

        {/* Query Output */}
        <Card elevation={3}>
          <CardContent>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
              <Typography variant="h6" fontWeight="bold">
                MongoDB Query Object
              </Typography>
              <Button
                startIcon={<CopyIcon />}
                onClick={copyToClipboard}
                size="small"
                variant="outlined"
              >
                Copy
              </Button>
            </Box>
            <Box
              component="pre"
              sx={{
                bgcolor: 'grey.900',
                color: 'success.light',
                p: 2,
                borderRadius: 1,
                overflow: 'auto',
                fontSize: '0.875rem'
              }}
            >
              {JSON.stringify(mongoQuery, null, 2)}
            </Box>
          </CardContent>
        </Card>

        {/* Usage Example */}
        <Card elevation={3} sx={{ mt: 3 }}>
          <CardContent>
            <Typography variant="h6" fontWeight="bold" sx={{ mb: 2 }}>
              API Usage Example
            </Typography>
            <Box
              component="pre"
              sx={{
                bgcolor: 'grey.100',
                p: 2,
                borderRadius: 1,
                overflow: 'auto',
                fontSize: '0.875rem'
              }}
            >
{`// Example: Fetch filtered persons
const response = await axiosInstance.post('/filter/person/search', {
  filter: ${JSON.stringify(mongoQuery)}
});
const data = response.data;`}
            </Box>
          </CardContent>
        </Card>
      </Box>
    </Box>
  );
}