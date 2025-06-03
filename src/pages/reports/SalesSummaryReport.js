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
  TableRow,
  Tabs,
  Tab
} from '@mui/material';
import { format } from 'date-fns';
import {
  AttachMoney as MoneyIcon,
  Receipt as ReceiptIcon,
  ShoppingCart as CartIcon,
  Refresh as RefreshIcon,
  ShowChart as ChartIcon,
  BarChart as BarChartIcon,
  PieChart as PieChartIcon
} from '@mui/icons-material';
import { getSalesReport } from '../../utils/api';
import { formatCurrency } from '../../utils/formatters';
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip as RechartsTooltip,
  Legend,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell
} from 'recharts';

const COLORS = ['#e50914', '#b81d24', '#e87c03', '#f5c518', '#46d369', '#1a9850', '#66bd63', '#a6d96a'];

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
  const [activeTab, setActiveTab] = useState('daily'); // 'daily' or 'products'

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
      
      console.log('Fetching report data for dates:', { 
        startDate: formattedStartDate, 
        endDate: formattedEndDate 
      });
      
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
      if (!isMounted) return;
      
      console.error('Error in fetchReportData:', {
        error: err,
        message: err.message,
        response: err.response?.data,
        status: err.response?.status
      });
      
      let errorMessage = 'Failed to load report data. Please try again.';
      
      if (err.response) {
        // Handle HTTP error statuses
        switch (err.response.status) {
          case 400:
            errorMessage = err.response.data?.message || 'Invalid request. Please check your date range and try again.';
            break;
          case 401:
            errorMessage = 'Session expired. Please log in again.';
            break;
          case 403:
            errorMessage = 'You do not have permission to view this report.';
            break;
          case 404:
            errorMessage = 'Report data not found for the selected date range.';
            break;
          case 500:
            errorMessage = 'Server error. Please try again later or contact support.';
            break;
          default:
            errorMessage = err.response.data?.message || `Error: ${err.response.status}`;
        }
      } else if (err.request) {
        errorMessage = 'Unable to connect to the server. Please check your internet connection.';
      } else if (err.message) {
        errorMessage = err.message;
      }
      
      setError(errorMessage);
      
      // Set empty data on error
      setReportData({
        totalSales: 0,
        totalRevenue: 0,
        productSales: [],
        dailySales: []
      });
    } finally {
      if (isMounted) {
        setLoading(false);
        setLocalLoading(false);
        if (propOnRefresh) {
          propOnRefresh();
        }
      }
    }
    
    return () => {
      isMounted = false;
    };
  }, [dateRange?.startDate, dateRange?.endDate, propOnRefresh]);

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

  // Format chart data
  const formatDailySalesData = (dailySales = []) => {
    return (dailySales || []).map(item => ({
      date: item?.date ? new Date(item.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }) : 'N/A',
      sales: item?.totalAmount || 0,
      transactions: item?.salesCount || 0
    }));
  };

  const formatProductSalesData = (productSales = []) => {
    return (productSales || [])
      .filter(item => item && (item.productName || item._id || item.id)) // Filter out invalid items
      .map(item => ({
        ...item,
        // Ensure all required fields have values
        productName: item.productName || 'Unknown Product',
        totalAmount: Number(item.totalAmount) || 0,
        totalQuantity: Number(item.totalQuantity) || 0,
        category: item.category || 'Uncategorized',
        // Generate a unique ID if none exists
        id: item.id || item._id || `temp-${Math.random().toString(36).substr(2, 9)}`
      }))
      .sort((a, b) => (b.totalAmount || 0) - (a.totalAmount || 0))
      .slice(0, 5)
      .map((item, index) => ({
        ...item,
        name: item.productName,
        value: item.totalAmount,
        color: COLORS[index % COLORS.length]
      }));
  };

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

  const { totalSales, totalRevenue, productSales, dailySales } = reportData;
  const averageOrderValue = totalSales > 0 ? totalRevenue / totalSales : 0;
  
  // Prepare chart data
  const dailyChartData = formatDailySalesData(dailySales);
  const topProductsData = formatProductSalesData(productSales);

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
  
  const ChartContainer = ({ children, title, icon: Icon }) => (
    <Paper 
      sx={{ 
        p: 3, 
        mb: 3,
        background: 'rgba(0, 0, 0, 0.5)',
        backdropFilter: 'blur(10px)',
        border: '1px solid rgba(255, 255, 255, 0.1)',
        borderRadius: 2,
      }}
    >
      <Box display="flex" alignItems="center" mb={3}>
        <Icon sx={{ color: '#e50914', mr: 1 }} />
        <Typography variant="h6" sx={{ color: '#fff' }}>{title}</Typography>
      </Box>
      {children}
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
      <Grid container spacing={3} mb={4}>
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
            icon={PieChartIcon}
            description={productSales.length > 0 ? `${productSales[0].productName} is top seller` : 'No product data'}
          />
        </Grid>
      </Grid>

      {/* Tabs for different chart views */}
      <Box mb={3}>
        <Tabs 
          value={activeTab} 
          onChange={(e, newValue) => setActiveTab(newValue)}
          textColor="inherit"
          indicatorColor="primary"
          sx={{
            '& .MuiTabs-indicator': { backgroundColor: '#e50914' },
            '& .MuiTab-root': { 
              color: '#999',
              '&.Mui-selected': { 
                color: '#fff',
              },
              '&:hover': {
                color: '#e50914',
              }
            },
            mb: 2
          }}
        >
          <Tab label="Daily Sales" value="daily" />
          <Tab label="Top Products" value="products" />
        </Tabs>
      </Box>

      {/* Charts */}
      {activeTab === 'daily' ? (
        <ChartContainer title="Daily Sales Trend" icon={ChartIcon}>
          <Box height={400}>
            <ResponsiveContainer width="100%" height="100%">
              <LineChart
                data={dailyChartData}
                margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
              >
                <CartesianGrid strokeDasharray="3 3" stroke="#333" />
                <XAxis 
                  dataKey="date" 
                  stroke="#999" 
                  tick={{ fill: '#999' }}
                />
                <YAxis 
                  stroke="#999" 
                  tick={{ fill: '#999' }}
                  tickFormatter={(value) => formatCurrency(value, true)}
                />
                <RechartsTooltip 
                  contentStyle={{
                    backgroundColor: '#1a1a1a',
                    border: '1px solid #333',
                    borderRadius: '4px',
                    color: '#fff'
                  }}
                  formatter={(value) => [formatCurrency(value), 'Amount']}
                  labelFormatter={(label) => `Date: ${label}`}
                />
                <Legend />
                <Line
                  type="monotone"
                  dataKey="sales"
                  name="Sales Amount"
                  stroke="#e50914"
                  strokeWidth={2}
                  dot={{ r: 4 }}
                  activeDot={{ r: 6, stroke: '#fff', strokeWidth: 2 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </Box>
        </ChartContainer>
      ) : (
        <>
          <ChartContainer title="Top Selling Products" icon={BarChartIcon}>
            <Box height={400}>
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={productSales.slice(0, 5)}
                  layout="vertical"
                  margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                >
                  <CartesianGrid strokeDasharray="3 3" stroke="#333" />
                  <XAxis 
                    type="number" 
                    stroke="#999" 
                    tick={{ fill: '#999' }}
                    tickFormatter={(value) => formatCurrency(value, true)}
                  />
                  <YAxis 
                    dataKey="productName" 
                    type="category" 
                    width={150}
                    stroke="#999" 
                    tick={{ fill: '#999' }}
                  />
                  <RechartsTooltip 
                    contentStyle={{
                      backgroundColor: '#1a1a1a',
                      border: '1px solid #333',
                      borderRadius: '4px',
                      color: '#fff'
                    }}
                    formatter={(value) => [formatCurrency(value), 'Revenue']}
                    labelFormatter={(label) => `Product: ${label}`}
                  />
                  <Legend />
                  <Bar 
                    dataKey="totalAmount" 
                    name="Revenue" 
                    fill="#e50914"
                    radius={[0, 4, 4, 0]}
                  >
                    {productSales.slice(0, 5).map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </Box>
          </ChartContainer>

          <ChartContainer title="Revenue by Product" icon={PieChartIcon}>
            <Box height={400}>
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={topProductsData}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    outerRadius={120}
                    fill="#8884d8"
                    dataKey="value"
                    nameKey="name"
                    label={({ name, percent }) => 
                      `${name}: ${(percent * 100).toFixed(0)}%`
                    }
                  >
                    {topProductsData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <RechartsTooltip 
                    contentStyle={{
                      backgroundColor: '#1a1a1a',
                      border: '1px solid #333',
                      borderRadius: '4px',
                      color: '#fff'
                    }}
                    formatter={(value) => [formatCurrency(value), 'Revenue']}
                  />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            </Box>
          </ChartContainer>
        </>
      )}

      {/* Product Sales Table */}
      <ChartContainer title="Product Sales Details" icon={ReceiptIcon}>
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
                  // Ensure product has all required fields with defaults
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
      </ChartContainer>
    </Box>
  );
};

export default SalesSummaryReport;
