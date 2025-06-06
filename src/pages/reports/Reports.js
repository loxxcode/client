import React, { useState, useEffect, useMemo } from 'react';
import {
  Box,
  Container,
  Paper,
  Typography,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TablePagination,
  TextField,
  CircularProgress,
  Alert,
  Grid,
  Card,
  CardContent,
  IconButton,
  Tooltip,
  Snackbar,
  Button,
  Chip,
  MenuItem,
  Select,
  FormControl,
  InputLabel,
  Stack,
  LinearProgress,
  Divider,
} from '@mui/material';
import { LocalizationProvider, DatePicker } from '@mui/x-date-pickers';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { subDays, format, parseISO } from 'date-fns';
import {
  Refresh as RefreshIcon,
  GetApp as DownloadIcon,
  TrendingUp as TrendingUpIcon,
  TrendingDown as TrendingDownIcon,
  FilterList as FilterListIcon,
  Sort as SortIcon,
} from '@mui/icons-material';
import axios from 'axios';

// Update base URL configuration to use production URL when deployed
const API_BASE_URL = process.env.NODE_ENV === 'production' 
  ? 'https://server-az7z.onrender.com'
  : 'http://localhost:5000';

// Log the API URL being used (this will help debug)
console.log('Environment:', process.env.NODE_ENV);
console.log('API Base URL:', API_BASE_URL);

const Report = () => {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [searchTerm, setSearchTerm] = useState('');
  const [dateRange, setDateRange] = useState({
    startDate: subDays(new Date(), 30),
    endDate: new Date()
  });
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: '',
    severity: 'success'
  });
  const [sortConfig, setSortConfig] = useState({
    key: 'date',
    direction: 'desc'
  });
  const [filterStatus, setFilterStatus] = useState('all');
  const [summary, setSummary] = useState({
    totalSales: 0,
    totalQuantity: 0,
    averageOrderValue: 0,
    topProducts: []
  });

  useEffect(() => {
    fetchData();
  }, [dateRange]);

  const fetchData = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      
      if (!token) {
        setError('Please login to access reports');
        setLoading(false);
        return;
      }

      const formattedStartDate = dateRange.startDate.toISOString().split('T')[0];
      const formattedEndDate = dateRange.endDate.toISOString().split('T')[0];

      const apiUrl = `${API_BASE_URL}/api/reports/sales`;
      console.log('Attempting to fetch from:', apiUrl);

      const response = await axios.get(apiUrl, {
        params: {
          startDate: formattedStartDate,
          endDate: formattedEndDate
        },
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        // Add timeout and validate status
        timeout: 10000, // 10 seconds timeout
        validateStatus: function (status) {
          return status >= 200 && status < 500; // Accept all responses to handle them properly
        }
      });
      
      console.log('API Response Status:', response.status);
      console.log('API Response Headers:', response.headers);
      console.log('API Response Data:', response.data);

      if (response.data) {
        // Check if the response has a data property
        const reportData = response.data.data || response.data;
        
        if (Array.isArray(reportData)) {
          console.log('First few items in report data:', reportData.slice(0, 3));
          setData(reportData);
          setError(null);
        } else if (typeof reportData === 'object') {
          // If it's an object with sales data
          const salesData = reportData.sales || reportData;
          if (Array.isArray(salesData)) {
            console.log('First few items in sales data:', salesData.slice(0, 3));
            setData(salesData);
      setError(null);
          } else {
            setData([]);
            setError('Invalid data format received from server');
          }
        } else {
          setData([]);
          setError('No data available for the selected date range');
        }
      } else {
        setData([]);
        setError('No data available for the selected date range');
      }
    } catch (err) {
      console.error('Error fetching report data:', err);
      console.error('Error details:', {
        message: err.message,
        code: err.code,
        response: err.response,
        request: err.request
      });

      let errorMessage = 'Failed to fetch data. Please try again later.';
      
      if (err.response) {
        // The request was made and the server responded with a status code
        // that falls out of the range of 2xx
        if (err.response.status === 401) {
          errorMessage = 'Session expired. Please login again.';
        } else if (err.response.status === 404) {
          errorMessage = 'Report endpoint not found. Please check the API configuration.';
        } else {
          errorMessage = err.response.data?.message || `Server error: ${err.response.status}`;
        }
      } else if (err.request) {
        // The request was made but no response was received
        if (err.code === 'ECONNABORTED') {
          errorMessage = 'Request timed out. Please try again.';
        } else if (err.code === 'ERR_NETWORK') {
          errorMessage = 'Network error. Please check your internet connection and ensure the API server is running.';
        } else {
          errorMessage = `Connection error: ${err.message}. Please check your connection and ensure the API is accessible.`;
        }
      } else {
        // Something happened in setting up the request that triggered an Error
        errorMessage = `Error: ${err.message}`;
      }
      
      setError(errorMessage);
      setData([]);
    } finally {
      setLoading(false);
    }
  };

  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  const handleDateRangeChange = (field, value) => {
    setDateRange(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleRefresh = () => {
    setIsRefreshing(true);
    fetchData().finally(() => {
      setIsRefreshing(false);
      showSnackbar('Report refreshed successfully', 'success');
    });
  };

  const handleExport = async () => {
    try {
      const token = localStorage.getItem('token');
      
      if (!token) {
        showSnackbar('Please login to export reports', 'error');
        return;
      }

      const formattedStartDate = dateRange.startDate.toISOString().split('T')[0];
      const formattedEndDate = dateRange.endDate.toISOString().split('T')[0];

      const apiUrl = `${API_BASE_URL}/api/reports/sales/export`;
      console.log('Attempting to export from:', apiUrl);

      const response = await axios.get(apiUrl, {
        params: {
          startDate: formattedStartDate,
          endDate: formattedEndDate
        },
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        responseType: 'blob',
        timeout: 30000, // 30 seconds timeout for export
        validateStatus: function (status) {
          return status >= 200 && status < 500;
        }
      });

      // Create a download link
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `sales-report-${formattedStartDate}-to-${formattedEndDate}.xlsx`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      
      showSnackbar('Report exported successfully', 'success');
    } catch (err) {
      console.error('Error exporting report:', err);
      console.error('Export error details:', {
        message: err.message,
        code: err.code,
        response: err.response,
        request: err.request
      });

      let errorMessage = 'Failed to export report';
      
      if (err.response) {
        if (err.response.status === 401) {
          errorMessage = 'Session expired. Please login again.';
        } else if (err.response.status === 404) {
          errorMessage = 'Export endpoint not found. Please check the API configuration.';
        } else {
          errorMessage = err.response.data?.message || `Export failed: ${err.response.status}`;
        }
      } else if (err.request) {
        if (err.code === 'ECONNABORTED') {
          errorMessage = 'Export request timed out. Please try again.';
        } else if (err.code === 'ERR_NETWORK') {
          errorMessage = 'Network error. Please check your internet connection and ensure the API server is running.';
        } else {
          errorMessage = `Connection error: ${err.message}. Please check your connection and ensure the API is accessible.`;
        }
      } else {
        errorMessage = `Error: ${err.message}`;
      }
      
      showSnackbar(errorMessage, 'error');
    }
  };

  const showSnackbar = (message, severity = 'info') => {
    setSnackbar({
      open: true,
      message,
      severity
    });
  };

  const handleCloseSnackbar = () => {
    setSnackbar(prev => ({ ...prev, open: false }));
  };

  const formatDate = (dateString) => {
    console.log('Raw date value:', dateString); // Debug log
    
    if (!dateString) {
      console.log('Date is null or undefined');
      return 'N/A';
    }

    try {
      // Check if the date is in ISO format (YYYY-MM-DD)
      if (typeof dateString === 'string' && dateString.match(/^\d{4}-\d{2}-\d{2}/)) {
        const [year, month, day] = dateString.split('-');
        const date = new Date(year, month - 1, day);
        return date.toLocaleDateString('en-US', {
          year: 'numeric',
          month: 'short',
          day: 'numeric'
        });
      }

      // Try parsing as a regular date
      const date = new Date(dateString);
      if (isNaN(date.getTime())) {
        console.log('Invalid date value:', dateString);
        return 'Invalid Date';
      }
      
      return date.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric'
      });
    } catch (error) {
      console.error('Error formatting date:', error, 'Date value:', dateString);
      return 'Invalid Date';
    }
  };

  const calculateSummary = useMemo(() => {
    if (!data.length) return;

    const totalSales = data.reduce((sum, item) => sum + (item.totalAmount || 0), 0);
    const totalQuantity = data.reduce((sum, item) => sum + (item.quantity || 0), 0);
    const averageOrderValue = totalSales / data.length;

    // Calculate top products
    const productSales = data.reduce((acc, item) => {
      const productName = item.productName || item.product?.name || 'Unknown';
      acc[productName] = (acc[productName] || 0) + (item.totalAmount || 0);
      return acc;
    }, {});

    const topProducts = Object.entries(productSales)
      .sort(([, a], [, b]) => b - a)
      .slice(0, 5)
      .map(([name, amount]) => ({ name, amount }));

    setSummary({
      totalSales,
      totalQuantity,
      averageOrderValue,
      topProducts
    });
  }, [data]);

  const handleSort = (key) => {
    setSortConfig(prev => ({
      key,
      direction: prev.key === key && prev.direction === 'asc' ? 'desc' : 'asc'
    }));
  };

  const getSortedData = () => {
    const sortedData = [...data];
    if (sortConfig.key) {
      sortedData.sort((a, b) => {
        let aValue = a[sortConfig.key];
        let bValue = b[sortConfig.key];

        if (sortConfig.key === 'date') {
          aValue = new Date(a.date || a.saleDate);
          bValue = new Date(b.date || b.saleDate);
        }

        if (aValue < bValue) return sortConfig.direction === 'asc' ? -1 : 1;
        if (aValue > bValue) return sortConfig.direction === 'asc' ? 1 : -1;
        return 0;
      });
    }
    return sortedData;
  };

  const filteredData = data.filter((item) => {
    const searchTermLower = searchTerm.toLowerCase();
    const productName = (item.productName || item.product?.name || '').toLowerCase();
    const date = formatDate(item.date || item.saleDate).toLowerCase();
    const status = (item.status || 'Completed').toLowerCase();
    const quantity = String(item.quantity || '').toLowerCase();
    const totalAmount = String(item.totalAmount || '').toLowerCase();

    const matchesSearch = 
      productName.includes(searchTermLower) ||
      date.includes(searchTermLower) ||
      status.includes(searchTermLower) ||
      quantity.includes(searchTermLower) ||
      totalAmount.includes(searchTermLower);

    const matchesStatus = filterStatus === 'all' || 
      (item.status || 'Completed').toLowerCase() === filterStatus.toLowerCase();

    return matchesSearch && matchesStatus;
  });

  const renderSummaryCards = () => (
    <Grid container spacing={2} sx={{ mb: 3 }}>
      <Grid item xs={12} sm={6} md={3}>
        <Card sx={{ 
          bgcolor: 'rgba(255, 255, 255, 0.05)',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center'
        }}>
          <CardContent>
            <Typography variant="h6" color="text.secondary" gutterBottom>
              Total Sales
            </Typography>
            <Typography variant="h4" color="primary" sx={{ mb: 1 }}>
              ${summary.totalSales.toFixed(2)}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Last 30 days
            </Typography>
          </CardContent>
        </Card>
      </Grid>
      <Grid item xs={12} sm={6} md={3}>
        <Card sx={{ 
          bgcolor: 'rgba(255, 255, 255, 0.05)',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center'
        }}>
          <CardContent>
            <Typography variant="h6" color="text.secondary" gutterBottom>
              Total Quantity
            </Typography>
            <Typography variant="h4" color="primary" sx={{ mb: 1 }}>
              {summary.totalQuantity}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Units sold
            </Typography>
          </CardContent>
        </Card>
      </Grid>
      <Grid item xs={12} sm={6} md={3}>
        <Card sx={{ 
          bgcolor: 'rgba(255, 255, 255, 0.05)',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center'
        }}>
          <CardContent>
            <Typography variant="h6" color="text.secondary" gutterBottom>
              Average Order
            </Typography>
            <Typography variant="h4" color="primary" sx={{ mb: 1 }}>
              ${summary.averageOrderValue.toFixed(2)}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Per transaction
            </Typography>
          </CardContent>
        </Card>
      </Grid>
      <Grid item xs={12} sm={6} md={3}>
        <Card sx={{ 
          bgcolor: 'rgba(255, 255, 255, 0.05)',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center'
        }}>
          <CardContent>
            <Typography variant="h6" color="text.secondary" gutterBottom>
              Top Product
            </Typography>
            <Typography variant="h4" color="primary" sx={{ mb: 1 }}>
              {summary.topProducts[0]?.name || 'N/A'}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              ${summary.topProducts[0]?.amount.toFixed(2) || '0.00'}
            </Typography>
          </CardContent>
        </Card>
      </Grid>
    </Grid>
  );

  if (loading && !isRefreshing) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="80vh">
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box sx={{ p: 3, backgroundColor: '#141414', minHeight: '100vh' }}>
      <Box sx={{ 
        display: 'flex', 
        justifyContent: 'space-between', 
        alignItems: 'flex-start',
        flexDirection: { xs: 'column', sm: 'row' },
        mb: 3, 
        gap: 2 
      }}>
        <Typography variant="h4" sx={{ color: '#fff', fontWeight: 'bold' }}>
          Sales Analytics Dashboard
        </Typography>
        
        <Box sx={{ 
          display: 'flex', 
          flexDirection: { xs: 'column', sm: 'row' },
          gap: 2, 
          width: '100%',
          '& > *': {
            width: { xs: '100%', sm: 'auto' }
          }
        }}>
          <LocalizationProvider dateAdapter={AdapterDateFns}>
            <Box sx={{ 
              display: 'flex', 
              flexDirection: { xs: 'column', sm: 'row' },
              gap: 2, 
              width: '100%',
              '& > *': {
                width: { xs: '100%', sm: 'auto' }
              }
            }}>
              <DatePicker
                label="Start Date"
                value={dateRange.startDate}
                maxDate={dateRange.endDate}
                onChange={(date) => handleDateRangeChange('startDate', date)}
                renderInput={(params) => (
                  <TextField
                    {...params}
                    size="small"
                    sx={{
                      width: 150,
                      '& .MuiOutlinedInput-root': {
                        '& fieldset': { borderColor: '#333' },
                        '&:hover fieldset': { borderColor: '#e50914' },
                      },
                      '& .MuiInputLabel-root': { color: '#999' },
                      '& .MuiInputBase-input': { color: '#fff' },
                    }}
                  />
                )}
              />
              <DatePicker
                label="End Date"
                value={dateRange.endDate}
                minDate={dateRange.startDate}
                onChange={(date) => handleDateRangeChange('endDate', date)}
                renderInput={(params) => (
                  <TextField
                    {...params}
                    size="small"
                    sx={{
                      width: 150,
                      '& .MuiOutlinedInput-root': {
                        '& fieldset': { borderColor: '#333' },
                        '&:hover fieldset': { borderColor: '#e50914' },
                      },
                      '& .MuiInputLabel-root': { color: '#999' },
                      '& .MuiInputBase-input': { color: '#fff' },
                    }}
                  />
                )}
              />
            </Box>
          </LocalizationProvider>
          
          <Box sx={{ 
            display: 'flex', 
            gap: 1,
            width: { xs: '100%', sm: 'auto' },
            justifyContent: { xs: 'space-between', sm: 'flex-end' },
            '& > *': {
              flex: { xs: 1, sm: 'none' }
            }
          }}>
            <Tooltip title="Refresh Report">
              <IconButton 
                onClick={handleRefresh}
                disabled={isRefreshing}
                sx={{
                  color: '#fff',
                  bgcolor: 'rgba(255, 255, 255, 0.1)',
                  '&:hover': { bgcolor: 'rgba(229, 9, 20, 0.7)' },
                  '&.Mui-disabled': { color: '#666' }
                }}
              >
                <RefreshIcon className={isRefreshing ? 'spin' : ''} />
              </IconButton>
            </Tooltip>
            
            <Tooltip title="Export Report">
              <IconButton 
                onClick={handleExport}
                sx={{
                  color: '#fff',
                  bgcolor: 'rgba(255, 255, 255, 0.1)',
                  '&:hover': { bgcolor: 'rgba(229, 9, 20, 0.7)' }
                }}
              >
                <DownloadIcon />
              </IconButton>
            </Tooltip>
          </Box>
        </Box>
      </Box>

      {error && (
        <Alert 
          severity="error" 
          sx={{ 
            mb: 2,
            '& .MuiAlert-icon': { color: '#e50914' },
            '& .MuiAlert-message': { color: '#fff' }
          }}
          action={
            <Button 
              color="inherit" 
              size="small" 
              onClick={fetchData}
              sx={{ color: '#fff' }}
            >
              Retry
            </Button>
          }
        >
          {error}
        </Alert>
      )}

      {renderSummaryCards()}

      <Paper sx={{ backgroundColor: 'transparent', boxShadow: 'none' }}>
        <Box sx={{ mb: 2, display: 'flex', gap: 2, flexWrap: 'wrap' }}>
        <TextField
          fullWidth
          label="Search"
          variant="outlined"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search by product, date, status..."
          sx={{ 
              flex: 1,
            '& .MuiOutlinedInput-root': {
              '& fieldset': { borderColor: '#333' },
              '&:hover fieldset': { borderColor: '#e50914' },
            },
            '& .MuiInputLabel-root': { color: '#999' },
            '& .MuiInputBase-input': { color: '#fff' },
          }}
        />

          <FormControl sx={{ minWidth: 120 }}>
            <InputLabel id="status-filter-label" sx={{ color: '#999' }}>Status</InputLabel>
            <Select
              labelId="status-filter-label"
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              label="Status"
              sx={{
                color: '#fff',
                '& .MuiOutlinedInput-notchedOutline': { borderColor: '#333' },
                '&:hover .MuiOutlinedInput-notchedOutline': { borderColor: '#e50914' },
                '& .MuiSelect-icon': { color: '#fff' },
              }}
            >
              <MenuItem value="all">All Status</MenuItem>
              <MenuItem value="completed">Completed</MenuItem>
              <MenuItem value="pending">Pending</MenuItem>
              <MenuItem value="cancelled">Cancelled</MenuItem>
            </Select>
          </FormControl>
        </Box>

        <TableContainer>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell 
                  sx={{ color: '#fff', borderColor: '#333', cursor: 'pointer' }}
                  onClick={() => handleSort('date')}
                >
                  Date {sortConfig.key === 'date' && (sortConfig.direction === 'asc' ? '↑' : '↓')}
                </TableCell>
                <TableCell 
                  sx={{ color: '#fff', borderColor: '#333', cursor: 'pointer' }}
                  onClick={() => handleSort('productName')}
                >
                  Product {sortConfig.key === 'productName' && (sortConfig.direction === 'asc' ? '↑' : '↓')}
                </TableCell>
                <TableCell 
                  sx={{ color: '#fff', borderColor: '#333', cursor: 'pointer' }}
                  onClick={() => handleSort('quantity')}
                >
                  Quantity {sortConfig.key === 'quantity' && (sortConfig.direction === 'asc' ? '↑' : '↓')}
                </TableCell>
                <TableCell 
                  sx={{ color: '#fff', borderColor: '#333', cursor: 'pointer' }}
                  onClick={() => handleSort('totalAmount')}
                >
                  Total Amount {sortConfig.key === 'totalAmount' && (sortConfig.direction === 'asc' ? '↑' : '↓')}
                </TableCell>
                <TableCell 
                  sx={{ color: '#fff', borderColor: '#333', cursor: 'pointer' }}
                  onClick={() => handleSort('status')}
                >
                  Status {sortConfig.key === 'status' && (sortConfig.direction === 'asc' ? '↑' : '↓')}
                </TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {getSortedData().length > 0 ? (
                getSortedData()
                .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                .map((row) => (
                    <TableRow key={row._id || row.id || Math.random()}>
                      <TableCell sx={{ color: '#fff', borderColor: '#333' }}>
                        {formatDate(row.date || row.saleDate)}
                      </TableCell>
                      <TableCell sx={{ color: '#fff', borderColor: '#333' }}>
                        {row.productName || row.product?.name || 'N/A'}
                      </TableCell>
                      <TableCell sx={{ color: '#fff', borderColor: '#333' }}>
                        {row.quantity || 0}
                      </TableCell>
                      <TableCell sx={{ color: '#fff', borderColor: '#333' }}>
                        ${(row.totalAmount || 0).toFixed(2)}
                      </TableCell>
                      <TableCell sx={{ color: '#fff', borderColor: '#333' }}>
                        <Chip
                          label={row.status || 'Completed'}
                          color={
                            (row.status || 'Completed').toLowerCase() === 'completed' ? 'success' :
                            (row.status || 'Completed').toLowerCase() === 'pending' ? 'warning' :
                            (row.status || 'Completed').toLowerCase() === 'cancelled' ? 'error' : 'default'
                          }
                          size="small"
                        />
                      </TableCell>
                    </TableRow>
                  ))
              ) : (
                <TableRow>
                  <TableCell colSpan={5} sx={{ color: '#fff', borderColor: '#333', textAlign: 'center' }}>
                    {searchTerm || filterStatus !== 'all' ? 'No matching records found' : 'No data available'}
                  </TableCell>
                  </TableRow>
              )}
            </TableBody>
          </Table>
        </TableContainer>

        <TablePagination
          rowsPerPageOptions={[5, 10, 25]}
          component="div"
          count={filteredData.length}
          rowsPerPage={rowsPerPage}
          page={page}
          onPageChange={handleChangePage}
          onRowsPerPageChange={handleChangeRowsPerPage}
          sx={
            {
            color: '#fff',
            '& .MuiTablePagination-select': { color: '#fff' },
            '& .MuiTablePagination-selectIcon': { color: '#fff' },
            '& .MuiIconButton-root': { color: '#fff' },
            '& .MuiIconButton-root.Mui-disabled': { color: '#666' },
          }}
        />
      </Paper>

      <Snackbar
        open={snackbar.open}
        autoHideDuration={6000}
        onClose={handleCloseSnackbar}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
      >
        <Alert 
          onClose={handleCloseSnackbar} 
          severity={snackbar.severity}
          sx={{ width: '100%' }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default Report; 