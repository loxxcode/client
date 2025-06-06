import React, { useState, useEffect } from 'react';
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
} from '@mui/material';
import { LocalizationProvider, DatePicker } from '@mui/x-date-pickers';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { subDays } from 'date-fns';
import { Refresh as RefreshIcon, GetApp as DownloadIcon } from '@mui/icons-material';
import axios from 'axios';

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

      console.log('Fetching data with dates:', { formattedStartDate, formattedEndDate });

      const response = await axios.get('http://localhost:5000/api/reports/sales', {
        params: {
          startDate: formattedStartDate,
          endDate: formattedEndDate
        },
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      
      console.log('API Response:', response.data);

      if (response.data) {
        // Check if the response has a data property
        const reportData = response.data.data || response.data;
        
        if (Array.isArray(reportData)) {
          // Log the first few items to check their structure
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
      let errorMessage = 'Failed to fetch data. Please try again later.';
      
      if (err.response) {
        if (err.response.status === 401) {
          errorMessage = 'Session expired. Please login again.';
        } else if (err.response.status === 404) {
          errorMessage = 'Report endpoint not found. Please check the API configuration.';
        } else {
          errorMessage = err.response.data?.message || `Server error: ${err.response.status}`;
        }
      } else if (err.request) {
        errorMessage = 'No response from server. Please check your connection.';
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

      const response = await axios.get('http://localhost:5000/api/reports/sales/export', {
        params: {
          startDate: formattedStartDate,
          endDate: formattedEndDate
        },
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        responseType: 'blob'
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
        errorMessage = 'No response from server. Please check your connection.';
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

  const filteredData = data.filter((item) => {
    const searchTermLower = searchTerm.toLowerCase();
    
    // Safely check each field that might be undefined
    const productName = (item.productName || item.product?.name || '').toLowerCase();
    const date = formatDate(item.date).toLowerCase();
    const status = (item.status || '').toLowerCase();
    const quantity = String(item.quantity || '').toLowerCase();
    const totalAmount = String(item.totalAmount || '').toLowerCase();

    return (
      productName.includes(searchTermLower) ||
      date.includes(searchTermLower) ||
      status.includes(searchTermLower) ||
      quantity.includes(searchTermLower) ||
      totalAmount.includes(searchTermLower)
    );
  });

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
          Detailed Report
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

      <Paper sx={{ backgroundColor: 'transparent', boxShadow: 'none' }}>
        <TextField
          fullWidth
          label="Search"
          variant="outlined"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          placeholder="Search by product, date, status..."
          sx={{ 
            mb: 2,
            '& .MuiOutlinedInput-root': {
              '& fieldset': { borderColor: '#333' },
              '&:hover fieldset': { borderColor: '#e50914' },
            },
            '& .MuiInputLabel-root': { color: '#999' },
            '& .MuiInputBase-input': { color: '#fff' },
          }}
        />

        <TableContainer>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell sx={{ color: '#fff', borderColor: '#333' }}>Date</TableCell>
                <TableCell sx={{ color: '#fff', borderColor: '#333' }}>Product</TableCell>
                <TableCell sx={{ color: '#fff', borderColor: '#333' }}>Quantity</TableCell>
                <TableCell sx={{ color: '#fff', borderColor: '#333' }}>Total Amount</TableCell>
                <TableCell sx={{ color: '#fff', borderColor: '#333' }}>Status</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {filteredData.length > 0 ? (
                filteredData
                  .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                  .map((row) => {
                    console.log('Row data:', row); // Debug log for each row
                    return (
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
                          {row.status || 'Completed'}
                        </TableCell>
                      </TableRow>
                    );
                  })
              ) : (
                <TableRow>
                  <TableCell colSpan={5} sx={{ color: '#fff', borderColor: '#333', textAlign: 'center' }}>
                    {searchTerm ? 'No matching records found' : 'No data available'}
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
          sx={{
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