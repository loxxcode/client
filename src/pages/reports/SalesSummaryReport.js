import React, { useState, useEffect, useCallback } from 'react';
import {
  Box,
  Grid,
  Paper,
  Typography,
  CircularProgress,
  Alert,
  IconButton,
  Tooltip,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow
} from '@mui/material';
import { format } from 'date-fns';
import {
  AttachMoney as MoneyIcon,
  Receipt as ReceiptIcon,
  ShoppingCart as CartIcon,
  Refresh as RefreshIcon
} from '@mui/icons-material';
import { getSalesReport } from '../../utils/api';
import { formatCurrency } from '../../utils/formatters';

const SalesSummaryReport = ({ 
  dateRange, 
  isRefreshing: propIsRefreshing,
  onRefresh: propOnRefresh 
}) => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [reportData, setReportData] = useState({
    totalSales: 0,
    totalRevenue: 0,
    productSales: [],
    dailySales: []
  });
  const [localLoading, setLocalLoading] = useState(false);

  // Fetch report data
  const fetchReportData = useCallback(async () => {
    let isMounted = true;
    
    try {
      setLocalLoading(true);
      setError(null);
      
      // Validate date range
      if (!dateRange?.startDate || !dateRange?.endDate) {
        throw new Error('Please select a valid date range');
      }
      
      // Ensure end date is not before start date
      if (dateRange.endDate < dateRange.startDate) {
        throw new Error('End date cannot be before start date');
      }
      
      const formattedStartDate = format(dateRange.startDate, 'yyyy-MM-dd');
      const formattedEndDate = format(dateRange.endDate, 'yyyy-MM-dd');
      
      const response = await getSalesReport(formattedStartDate, formattedEndDate);
      
      if (!isMounted) return;
      
      if (response && response.success) {
        setReportData({
          totalSales: response.totalSales || 0,
          totalRevenue: response.totalRevenue || 0,
          productSales: Array.isArray(response.productSales) ? response.productSales : [],
          dailySales: Array.isArray(response.dailySales) ? response.dailySales : []
        });
      } else {
        throw new Error(response?.message || 'Failed to load report data: Invalid response format');
      }
    } catch (err) {
      console.error('Error fetching report data:', err);
      setError(err.message || 'Failed to load report data');
    } finally {
      setLocalLoading(false);
      if (propOnRefresh) {
        propOnRefresh();
      }
    }
  }, [dateRange, propOnRefresh]);

  // Initial data load
  useEffect(() => {
    fetchReportData();
  }, [fetchReportData]);

  // Handle refresh from parent
  useEffect(() => {
    if (propIsRefreshing) {
      fetchReportData();
    }
  }, [propIsRefreshing, fetchReportData]);

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="200px">
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Alert severity="error" sx={{ mb: 3, bgcolor: 'rgba(229, 9, 20, 0.1)', color: '#fff' }}>
        {error}
      </Alert>
    );
  }

  const { totalSales, totalRevenue, productSales } = reportData;
  const averageOrderValue = totalSales > 0 ? totalRevenue / totalSales : 0;

  const StatCard = ({ 
    title, 
    value, 
    icon: Icon,
    isCurrency = false,
    description = ''
  }) => (
    <Paper 
      sx={{ 
        p: 3, 
        height: '100%',
        background: 'rgba(0, 0, 0, 0.5)',
        backdropFilter: 'blur(10px)',
        border: '1px solid rgba(255, 255, 255, 0.1)',
        borderRadius: 2,
        transition: 'all 0.3s ease',
        '&:hover': {
          transform: 'translateY(-4px)',
          boxShadow: '0 4px 20px rgba(0, 0, 0, 0.2)'
        }
      }}
    >
      <Box display="flex" justifyContent="space-between" alignItems="flex-start">
        <Box>
          <Typography 
            variant="subtitle2" 
            color="text.secondary"
            sx={{ mb: 0.5, fontSize: '0.875rem' }}
          >
            {title}
          </Typography>
          <Typography 
            variant="h5" 
            sx={{ 
              fontWeight: 'bold',
              color: '#fff',
              mb: 0.5
            }}
          >
            {isCurrency ? formatCurrency(value) : value.toLocaleString()}
          </Typography>
          {description && (
            <Typography variant="caption" color="text.secondary">
              {description}
            </Typography>
          )}
        </Box>
        <Box
          sx={{
            p: 1.5,
            bgcolor: 'rgba(229, 9, 20, 0.1)',
            borderRadius: '50%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}
        >
          <Icon sx={{ color: '#e50914', fontSize: '1.5rem' }} />
        </Box>
      </Box>
    </Paper>
  );

  return (
    <Box>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <Typography variant="h5" fontWeight="bold" sx={{ color: '#fff' }}>
          Sales Summary
        </Typography>
        <Box>
          <Tooltip title="Refresh data">
            <IconButton 
              onClick={fetchReportData} 
              disabled={localLoading}
              sx={{
                color: '#fff',
                '&:hover': {
                  bgcolor: 'rgba(255, 255, 255, 0.1)'
                }
              }}
            >
              <RefreshIcon className={localLoading ? 'spin' : ''} />
            </IconButton>
          </Tooltip>
        </Box>
      </Box>

      {/* Summary Cards */}
      <Grid container spacing={3} mb={3}>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard 
            title="Total Revenue" 
            value={totalRevenue} 
            icon={MoneyIcon}
            isCurrency
            description={`${totalSales} sales`}
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard 
            title="Total Sales" 
            value={totalSales}
            icon={ReceiptIcon}
            description={`${formatCurrency(totalRevenue)} revenue`}
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard 
            title="Avg. Order Value" 
            value={averageOrderValue}
            icon={CartIcon}
            isCurrency
            description={totalSales > 0 ? `Based on ${totalSales} orders` : 'No orders'}
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard 
            title="Top Products" 
            value={productSales.length}
            icon={CartIcon}
            description={productSales.length > 0 ? `${productSales[0]?.productName || 'N/A'} is top seller` : 'No product data'}
          />
        </Grid>
      </Grid>

      {/* Product Sales Table */}
      <Paper sx={{ 
        p: 3,
        background: 'rgba(0, 0, 0, 0.5)',
        backdropFilter: 'blur(10px)',
        border: '1px solid rgba(255, 255, 255, 0.1)',
        borderRadius: 2
      }}>
        <TableContainer>
          <Table size="small">
            <TableHead>
              <TableRow>
                <TableCell sx={{ color: '#999', borderColor: '#333' }}>Product</TableCell>
                <TableCell align="right" sx={{ color: '#999', borderColor: '#333' }}>Quantity</TableCell>
                <TableCell align="right" sx={{ color: '#999', borderColor: '#333' }}>Total Revenue</TableCell>
                <TableCell align="right" sx={{ color: '#999', borderColor: '#333' }}>Avg. Price</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {productSales && productSales.length > 0 ? (
                productSales.map((product = {}) => {
                  const safeProduct = {
                    productId: product.id || product._id || `temp-${Math.random().toString(36).substr(2, 9)}`,
                    productName: product.productName || 'Unknown Product',
                    category: product.category || 'Uncategorized',
                    totalQuantity: Number(product.totalQuantity) || 0,
                    totalAmount: Number(product.totalAmount) || 0
                  };
                  
                  return (
                    <TableRow key={safeProduct.productId} hover>
                      <TableCell sx={{ color: '#fff', borderColor: '#333' }}>
                        <Box>
                          <Typography variant="body2">{safeProduct.productName}</Typography>
                          <Typography variant="caption" color="text.secondary">
                            {safeProduct.category}
                          </Typography>
                        </Box>
                      </TableCell>
                      <TableCell align="right" sx={{ color: '#fff', borderColor: '#333' }}>
                        {safeProduct.totalQuantity.toLocaleString()}
                      </TableCell>
                      <TableCell align="right" sx={{ color: '#fff', borderColor: '#333' }}>
                        {formatCurrency(safeProduct.totalAmount)}
                      </TableCell>
                      <TableCell align="right" sx={{ color: '#fff', borderColor: '#333' }}>
                        {safeProduct.totalQuantity > 0 
                          ? formatCurrency(safeProduct.totalAmount / safeProduct.totalQuantity)
                          : formatCurrency(0)}
                      </TableCell>
                    </TableRow>
                  );
                })
              ) : (
                <TableRow>
                  <TableCell colSpan={4} align="center" sx={{ color: '#999', borderColor: '#333' }}>
                    {loading ? 'Loading product data...' : 'No product sales data available'}
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </TableContainer>
      </Paper>
    </Box>
  );
};

export default SalesSummaryReport;
