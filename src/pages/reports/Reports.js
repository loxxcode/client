import React, { useState, useCallback } from 'react';
import { 
  Box, 
  Tabs, 
  Tab, 
  Paper,
  Typography,

  IconButton,
  Tooltip,
  Snackbar,
  Alert,
  TextField
} from '@mui/material';
import { LocalizationProvider, DatePicker } from '@mui/x-date-pickers';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { subDays } from 'date-fns';
import ProductSalesReport from './ProductSalesReport';
import SalesSummaryReport from './SalesSummaryReport';
import { Refresh as RefreshIcon, GetApp as DownloadIcon } from '@mui/icons-material';

const TabPanel = (props) => {
  const { children, value, index, ...other } = props;

  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`report-tabpanel-${index}`}
      aria-labelledby={`report-tab-${index}`}
      {...other}
    >
      {value === index && (
        <Box sx={{ pt: 3 }}>
          {children}
        </Box>
      )}
    </div>
  );
};

const Reports = () => {
  const [tabValue, setTabValue] = useState(0); // Default to Sales Summary tab
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

  const handleTabChange = (event, newValue) => {
    setTabValue(newValue);
  };

  const handleDateRangeChange = (field, value) => {
    setDateRange(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleRefresh = useCallback(() => {
    setIsRefreshing(true);
    // Simulate API call
    setTimeout(() => {
      setIsRefreshing(false);
      showSnackbar('Reports refreshed successfully', 'success');
    }, 1000);
  }, []);

  const handleExport = useCallback(() => {
    // This would trigger export in the active report component
    showSnackbar('Export functionality will be implemented soon', 'info');
  }, []);

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
          Reports
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
              flexDirection: { xs: 'column', sm: 'row', md: 'row', lg: 'row' },
              gap: 2, 
              width: '100%',
              '& > *': {
                width: { xs: '100%', sm: 'auto', md: 'auto', lg: 'auto' }
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
            <Tooltip title="Refresh Reports">
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

      <Paper sx={{ backgroundColor: 'transparent', boxShadow: 'none' }}>
        <Box sx={{ width: '100%', overflowX: 'auto', '&::-webkit-scrollbar': { display: 'none' } }}>
          <Tabs 
            value={tabValue} 
            onChange={handleTabChange}
            textColor="inherit"
            indicatorColor="primary"
            variant="scrollable"
            scrollButtons="auto"
            allowScrollButtonsMobile
            sx={{
              minHeight: 48,
              '& .MuiTabs-scrollButtons': {
                color: '#fff',
                '&.Mui-disabled': { opacity: 0.3 },
                '&:hover': { color: '#e50914' }
              },
              '& .MuiTabs-indicator': { 
                backgroundColor: '#e50914',
                height: 3
              },
              '& .MuiTab-root': { 
                color: '#fff', 
                opacity: 0.7,
                minHeight: 48,
                padding: '6px 16px',
                '&.Mui-selected': { 
                  color: '#fff',
                  opacity: 1
                },
                '&:hover': {
                  color: '#e50914',
                  opacity: 1
                },
                '@media (max-width: 600px)': {
                  minWidth: 'auto',
                  padding: '6px 12px',
                  fontSize: '0.75rem'
                }
              },
              borderBottom: '1px solid #333',
              mb: 3
            }}
          >
            <Tab label="Sales Summary" />
            <Tab label="Product Sales" />
            <Tab label="Inventory" />
            <Tab label="Analytics" />
          </Tabs>
        </Box>

        <TabPanel value={tabValue} index={0}>
          <SalesSummaryReport 
            dateRange={dateRange} 
            isRefreshing={isRefreshing}
            onRefresh={handleRefresh}
          />
        </TabPanel>
        
        <TabPanel value={tabValue} index={1}>
          <ProductSalesReport 
            dateRange={dateRange} 
            isRefreshing={isRefreshing}
            onRefresh={handleRefresh}
          />
        </TabPanel>
        
        <TabPanel value={tabValue} index={2}>
          <Box 
            sx={{ 
              p: 4, 
              textAlign: 'center',
              color: '#999',
              backgroundColor: 'rgba(255, 255, 255, 0.03)',
              borderRadius: '8px',
              border: '1px dashed #333'
            }}
          >
            <Typography variant="h6" gutterBottom>
              Coming Soon
            </Typography>
            <Typography variant="body2">
              Inventory report is under development
            </Typography>
          </Box>
        </TabPanel>
        
        <TabPanel value={tabValue} index={3}>
          <Box 
            sx={{ 
              p: 4, 
              textAlign: 'center',
              color: '#999',
              backgroundColor: 'rgba(255, 255, 255, 0.03)',
              borderRadius: '8px',
              border: '1px dashed #333'
            }}
          >
            <Typography variant="h6" gutterBottom>
              Coming Soon
            </Typography>
            <Typography variant="body2">
              Customer Analytics report is under development
            </Typography>
          </Box>
        </TabPanel>
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
          sx={{ 
            width: '100%',
            bgcolor: '#1a1a1a',
            color: '#fff',
            '& .MuiAlert-icon': { color: snackbar.severity === 'error' ? '#e50914' : '#e50914' },
            '& .MuiAlert-message': { color: '#fff' }
          }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
      
      <style jsx global>{`
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
        .spin {
          animation: spin 1s linear infinite;
        }
      `}</style>
    </Box>
  );
};

export default Reports;
