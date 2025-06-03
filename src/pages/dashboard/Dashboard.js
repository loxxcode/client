import React, { useState, useEffect } from 'react';
import { 
  Box, 
  Grid, 
  Paper, 
  Typography, 
  Card, 
  CardContent, 
  List, 
  ListItem, 
  ListItemText,
  Divider,
  CircularProgress,
  alpha,
  Chip,
  LinearProgress,
  Button,
  useTheme,
} from '@mui/material';
import { 
  Inventory as InventoryIcon,
  ShoppingCart as ShoppingCartIcon,
  LocalAtm as LocalAtmIcon,
  TrendingUp as TrendingUpIcon,
  Warning as WarningIcon,
  Refresh as RefreshIcon,
  ArrowUpward as ArrowUpwardIcon,
  ArrowDownward as ArrowDownwardIcon,
} from '@mui/icons-material';

import moment from 'moment';
import { getTodaySales, getLowStockProducts, getStockStatusReport } from '../../utils/api';

import { useResponsive, responsiveStyles } from '../../styles/responsive';
import { formatCurrency } from '../../utils/formatters';

const Dashboard = () => {
  const [todaySales, setTodaySales] = useState(null);
  const [lowStockProducts, setLowStockProducts] = useState(null);
  const [stockStatus, setStockStatus] = useState(null);
  const theme = useTheme();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [refreshing, setRefreshing] = useState(false);
  
  // Enhanced stats for better visualizations
  const [dashboardStats, setDashboardStats] = useState({
    salesTrend: 0, // percentage increase/decrease from yesterday
    revenueTrend: 0,
    topSellingProducts: [],
    inventoryValue: 0,
    monthlyRevenue: 0
  });
  
  // Responsive design hooks
  const { isMobile } = useResponsive();

  const refreshDashboard = async () => {
    try {
      setRefreshing(true);
      
      // Get today's sales
      const salesResponse = await getTodaySales();
      setTodaySales(salesResponse);
      
      // Get low stock products
      const lowStockResponse = await getLowStockProducts();
      setLowStockProducts(lowStockResponse);
      
      // Get stock status
      const stockStatusResponse = await getStockStatusReport();
      setStockStatus(stockStatusResponse);
      
      // Calculate additional stats
      if (salesResponse) {
        // Calculate mock trends (would ideally come from real data)
        const mockSalesTrend = Math.floor(Math.random() * 20) - 5; // between -5% and +15%
        const mockRevenueTrend = Math.floor(Math.random() * 25) - 10; // between -10% and +15%
        
        // Sort products by quantity sold
        const topProducts = [...(salesResponse.data || [])]
          .sort((a, b) => (b.quantity * b.sellingPrice) - (a.quantity * a.sellingPrice))
          .slice(0, 5);
        
        // Calculate inventory value
        const inventoryValue = stockStatusResponse ? 
          stockStatusResponse.totalInventoryValue : 0;
          
        // Calculate monthly revenue (mock data)
        const monthlyRevenue = salesResponse.totalRevenue * 30; // Simplified calculation
        
        setDashboardStats({
          salesTrend: mockSalesTrend,
          revenueTrend: mockRevenueTrend,
          topSellingProducts: topProducts,
          inventoryValue,
          monthlyRevenue
        });
      }
      
      setRefreshing(false);
    } catch (err) {
      console.error("Error fetching dashboard data:", err);
      setError('Failed to load dashboard data');
      setRefreshing(false);
    }
  };
  
  useEffect(() => {
    const fetchDashboardData = async () => {
      setLoading(true);
      await refreshDashboard();
      setLoading(false);
    };
    
    fetchDashboardData();
  }, []);

  // Dashboard data loaded
  
  // Render loading state
  if (loading) {
    return (
      <Box sx={{ display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', height: '80vh' }}>
        <CircularProgress color="primary" size={isMobile ? 40 : 60} thickness={4} />
        <Typography sx={{ mt: 2, color: 'text.secondary' }}>Loading your dashboard...</Typography>
      </Box>
    );
  }
  
  // Render error state
  if (error) {
    return (
      <Box sx={{ p: 3, display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
        <Typography color="error" variant="h6" sx={{ mb: 2 }}>{error}</Typography>
        <Button 
          variant="contained" 
          startIcon={<RefreshIcon />}
          onClick={() => {
            setError(null);
            refreshDashboard();
          }}
          sx={{
            ...responsiveStyles.touchFriendly,
            textTransform: 'none'
          }}
        >
          Try Again
        </Button>
      </Box>
    );
  }

  return (
    <Box sx={{ flexGrow: 1 }}>
      <Box sx={{ p: { xs: 1, sm: 2, md: 3 } }}>
        {/* Header with Refresh Option */}
        <Box sx={{ 
          display: 'flex', 
          flexDirection: { xs: 'column', sm: 'row' },
          justifyContent: 'space-between',
          alignItems: { xs: 'flex-start', sm: 'center' },
          mb: { xs: 2, sm: 3 },
          position: 'relative'
        }}>
          <Box>
            <Typography 
              variant="h4" 
              component="h1" 
              sx={{ 
                fontSize: { xs: '1.5rem', sm: '1.75rem', md: '2rem' },
                fontWeight: 'bold',
                color: 'text.primary',
                mb: 0.5
              }}
            >
              Dashboard Overview
            </Typography>
            <Typography 
              variant="subtitle1" 
              color="text.secondary"
              sx={{ fontSize: { xs: '0.875rem', sm: '1rem' } }}
            >
              {moment().format('MMMM D, YYYY')}
            </Typography>
          </Box>

          <Button
            variant="outlined"
            color="primary"
            startIcon={<RefreshIcon />}
            disabled={refreshing}
            onClick={refreshDashboard}
            sx={{ 
              mt: { xs: 2, sm: 0 },
              ...responsiveStyles.touchFriendly,
              textTransform: 'none',
              minHeight: { xs: '40px', sm: '44px' },
              borderRadius: '8px'
            }}
          >
            {refreshing ? 'Refreshing...' : 'Refresh Data'}
          </Button>

          {refreshing && (
            <LinearProgress 
              sx={{ 
                position: 'absolute',
                bottom: '-8px',
                left: 0,
                right: 0,
                height: '3px',
              }} 
            />
          )}
        </Box>

        <Grid container spacing={{ xs: 1.5, sm: 2, md: 3 }}>
          
          {/* Key Performance Indicators (KPIs) */}
          <Grid item xs={6} sm={6} md={3}>
            <Card sx={{
              ...responsiveStyles.netflixMobileCard,
              height: '100%',
              position: 'relative',
              overflow: 'visible'
            }}>
              <Box sx={{ p: { xs: 1.5, sm: 2 }, height: '100%', position: 'relative' }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 1 }}>
                  <Box sx={{ display: 'flex', flexDirection: 'column' }}>
                    <Typography variant="body2" color="text.secondary" sx={{ mb: 0.5 }}>
                      Today's Sales
                    </Typography>
                    <Typography 
                      variant="h4" 
                      sx={{ 
                        fontWeight: 'bold',
                        fontSize: { xs: '1.5rem', sm: '1.75rem' }
                      }}
                    >
                      {todaySales ? todaySales.count : '0'}
                    </Typography>
                  </Box>
                  <Box sx={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    borderRadius: '50%',
                    width: { xs: 40, sm: 48 },
                    height: { xs: 40, sm: 48 },
                    backgroundColor: alpha(theme.palette.primary.main, 0.1),
                  }}>
                    <ShoppingCartIcon color="primary" sx={{ fontSize: { xs: '1.25rem', sm: '1.5rem' } }} />
                  </Box>
                </Box>
                
                <Box sx={{ display: 'flex', alignItems: 'center', mt: 'auto' }}>
                  {dashboardStats.salesTrend > 0 ? (
                    <Chip 
                      icon={<ArrowUpwardIcon fontSize="small" />}
                      label={`+${dashboardStats.salesTrend}%`}
                      size="small"
                      color="success"
                      sx={{ height: 24, '& .MuiChip-label': { px: 1, fontSize: '0.75rem' } }}
                    />
                  ) : (
                    <Chip 
                      icon={<ArrowDownwardIcon fontSize="small" />}
                      label={`${dashboardStats.salesTrend}%`}
                      size="small"
                      color="error"
                      sx={{ height: 24, '& .MuiChip-label': { px: 1, fontSize: '0.75rem' } }}
                    />
                  )}
                  <Typography variant="caption" color="text.secondary" sx={{ ml: 1 }}>
                    vs Yesterday
                  </Typography>
                </Box>
              </Box>
            </Card>
          </Grid>
          
          <Grid item xs={6} sm={6} md={3}>
            <Card sx={{
              ...responsiveStyles.netflixMobileCard,
              height: '100%'
            }}>
              <Box sx={{ p: { xs: 1.5, sm: 2 }, height: '100%' }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 1 }}>
                  <Box sx={{ display: 'flex', flexDirection: 'column' }}>
                    <Typography variant="body2" color="text.secondary" sx={{ mb: 0.5 }}>
                      Today's Revenue
                    </Typography>
                    <Typography 
                      variant="h4" 
                      sx={{ 
                        fontWeight: 'bold',
                        fontSize: { xs: '1.5rem', sm: '1.75rem' },
                        color: theme.palette.primary.main
                      }}
                    >
                      {formatCurrency(todaySales ? todaySales.totalRevenue : 0)}
                    </Typography>
                  </Box>
                  <Box sx={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    borderRadius: '50%',
                    width: { xs: 40, sm: 48 },
                    height: { xs: 40, sm: 48 },
                    backgroundColor: alpha(theme.palette.primary.main, 0.1),
                  }}>
                    <LocalAtmIcon color="primary" sx={{ fontSize: { xs: '1.25rem', sm: '1.5rem' } }} />
                  </Box>
                </Box>
                
                <Box sx={{ display: 'flex', alignItems: 'center', mt: 'auto' }}>
                  {dashboardStats.revenueTrend > 0 ? (
                    <Chip 
                      icon={<ArrowUpwardIcon fontSize="small" />}
                      label={`+${dashboardStats.revenueTrend}%`}
                      size="small"
                      color="success"
                      sx={{ height: 24, '& .MuiChip-label': { px: 1, fontSize: '0.75rem' } }}
                    />
                  ) : (
                    <Chip 
                      icon={<ArrowDownwardIcon fontSize="small" />}
                      label={`${dashboardStats.revenueTrend}%`}
                      size="small"
                      color="error"
                      sx={{ height: 24, '& .MuiChip-label': { px: 1, fontSize: '0.75rem' } }}
                    />
                  )}
                  <Typography variant="caption" color="text.secondary" sx={{ ml: 1 }}>
                    vs Yesterday
                  </Typography>
                </Box>
              </Box>
            </Card>
          </Grid>
          
          <Grid item xs={6} sm={6} md={3}>
            <Card sx={{
              ...responsiveStyles.netflixMobileCard,
              height: '100%'
            }}>
              <Box sx={{ p: { xs: 1.5, sm: 2 }, height: '100%' }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 1 }}>
                  <Box sx={{ display: 'flex', flexDirection: 'column' }}>
                    <Typography variant="body2" color="text.secondary" sx={{ mb: 0.5 }}>
                      Inventory
                    </Typography>
                    <Typography 
                      variant="h4" 
                      sx={{ 
                        fontWeight: 'bold',
                        fontSize: { xs: '1.5rem', sm: '1.75rem' }
                      }}
                    >
                      {stockStatus ? stockStatus.totalProducts : '0'}
                    </Typography>
                  </Box>
                  <Box sx={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    borderRadius: '50%',
                    width: { xs: 40, sm: 48 },
                    height: { xs: 40, sm: 48 },
                    backgroundColor: alpha(theme.palette.primary.main, 0.1),
                  }}>
                    <InventoryIcon color="primary" sx={{ fontSize: { xs: '1.25rem', sm: '1.5rem' } }} />
                  </Box>
                </Box>
                
                <Box sx={{ display: 'flex', alignItems: 'center', mt: 'auto' }}>
                  <Box sx={{
                    display: 'flex',
                    alignItems: 'center',
                    backgroundColor: alpha(theme.palette.warning.main, 0.1),
                    borderRadius: 1,
                    px: 1,
                    py: 0.5,
                  }}>
                    <WarningIcon color="warning" fontSize="small" sx={{ mr: 0.5, fontSize: '0.875rem' }} />
                    <Typography variant="caption" color="warning.main">
                      {lowStockProducts ? lowStockProducts.count : '0'} Low Stock
                    </Typography>
                  </Box>
                </Box>
              </Box>
            </Card>
          </Grid>
          
          <Grid item xs={6} sm={6} md={3}>
            <Card sx={{
              ...responsiveStyles.netflixMobileCard,
              height: '100%'
            }}>
              <Box sx={{ p: { xs: 1.5, sm: 2 }, height: '100%' }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 1 }}>
                  <Box sx={{ display: 'flex', flexDirection: 'column' }}>
                    <Typography variant="body2" color="text.secondary" sx={{ mb: 0.5 }}>
                      Inventory Value
                    </Typography>
                    <Typography 
                      variant="h4" 
                      sx={{ 
                        fontWeight: 'bold',
                        fontSize: { xs: '1.5rem', sm: '1.75rem' },
                        color: theme.palette.primary.main
                      }}
                    >
                      {formatCurrency(dashboardStats.inventoryValue)}
                    </Typography>
                  </Box>
                  <Box sx={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    borderRadius: '50%',
                    width: { xs: 40, sm: 48 },
                    height: { xs: 40, sm: 48 },
                    backgroundColor: alpha(theme.palette.primary.main, 0.1),
                  }}>
                    <TrendingUpIcon color="primary" sx={{ fontSize: { xs: '1.25rem', sm: '1.5rem' } }} />
                  </Box>
                </Box>
                
                <Box sx={{ display: 'flex', alignItems: 'center', mt: 'auto' }}>
                  <Box sx={{ display: 'flex', alignItems: 'center' }}>
                    <Typography variant="caption" color="text.secondary">
                      Across {stockStatus ? stockStatus.totalProducts : '0'} products
                    </Typography>
                  </Box>
                </Box>
              </Box>
            </Card>
          </Grid>
        
        {/* Sales Overview */}
        <Grid item xs={12} md={8}>
          <Paper elevation={2} sx={{ p: 2 }}>
            <Typography variant="h6" component="h2" gutterBottom>
              Sales Overview
            </Typography>
            {todaySales && todaySales.data.length > 0 ? (
              <Box sx={{ p: 2 }}>
                <Typography variant="body1" sx={{ mb: 2 }}>
                  Total Sales Today: {todaySales.data.reduce((total, sale) => total + sale.totalAmount, 0).toFixed(2)} USD
                </Typography>
                <Typography variant="body1" sx={{ mb: 2 }}>
                  Products Sold: {todaySales.data.reduce((total, sale) => total + sale.quantity, 0)} units
                </Typography>
                <Typography variant="body1">
                  Unique Products: {todaySales.data.length}
                </Typography>
              </Box>
            ) : (
              <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: 300 }}>
                <Typography variant="body1" color="text.secondary">
                  No sales data for today
                </Typography>
              </Box>
            )}
          </Paper>
        </Grid>
        
        <Grid item xs={12} md={4}>
          <Paper elevation={2} sx={{ p: 2, height: '100%' }}>
            <Typography variant="h6" component="h2" gutterBottom>
              Low Stock Alert
            </Typography>
            {lowStockProducts && lowStockProducts.data.length > 0 ? (
              <List>
                {lowStockProducts.data.slice(0, 5).map((product) => (
                  <React.Fragment key={product._id}>
                    <ListItem sx={{ px: 0 }}>
                      <ListItemText
                        primary={product.name}
                        secondary={`Current Stock: ${product.currentStock} | Min: ${product.minStockLevel}`}
                      />
                      {product.currentStock === 0 && (
                        <WarningIcon color="error" fontSize="small" />
                      )}
                    </ListItem>
                    <Divider component="li" />
                  </React.Fragment>
                ))}
                {lowStockProducts.data.length > 5 && (
                  <Typography variant="body2" sx={{ mt: 1, textAlign: 'center' }}>
                    And {lowStockProducts.data.length - 5} more products...
                  </Typography>
                )}
              </List>
            ) : (
              <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: 200 }}>
                <Typography variant="body1" color="text.secondary">
                  No low stock products
                </Typography>
              </Box>
            )}
          </Paper>
        </Grid>
        
        <Grid item xs={12}>
          <Paper elevation={2} sx={{ p: 2 }}>
            <Typography variant="h6" component="h2" gutterBottom>
              Inventory Overview
            </Typography>
            <Grid container spacing={2}>
              <Grid item xs={12} md={4}>
                <Box sx={{ p: 2, bgcolor: 'background.paper', borderRadius: 1, height: '100%' }}>
                  <Typography variant="subtitle1" gutterBottom sx={{ fontWeight: 'medium' }}>
                    Stock Status Summary
                  </Typography>
                  {stockStatus ? (
                    <>
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                        <Typography variant="body2" color="error">
                          Out of Stock:
                        </Typography>
                        <Typography variant="body2" fontWeight="bold">
                          {stockStatus.outOfStockCount} products
                        </Typography>
                      </Box>
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                        <Typography variant="body2" color="warning.main">
                          Low Stock:
                        </Typography>
                        <Typography variant="body2" fontWeight="bold">
                          {stockStatus.lowStockCount} products
                        </Typography>
                      </Box>
                      <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                        <Typography variant="body2" color="success.main">
                          Healthy Stock:
                        </Typography>
                        <Typography variant="body2" fontWeight="bold">
                          {stockStatus.healthyStockCount} products
                        </Typography>
                      </Box>
                    </>
                  ) : (
                    <Typography variant="body1" color="text.secondary">
                      No stock data available
                    </Typography>
                  )}
                </Box>
              </Grid>
              <Grid item xs={12} md={8}>
                <Card sx={{ height: '100%' }}>
                  <CardContent>
                    <Typography variant="h6" component="h3" gutterBottom>
                      Recent Activity
                    </Typography>
                    {todaySales && todaySales.data.length > 0 ? (
                      <List>
                        {todaySales.data.slice(0, 5).map((sale) => (
                          <React.Fragment key={sale._id}>
                            <ListItem sx={{ px: 0 }}>
                              <ListItemText
                                primary={`Sold ${sale.quantity} x ${sale.product.name}`}
                                secondary={`Amount: ${formatCurrency(sale.totalAmount)} | ${moment(sale.saleDate).format('h:mm A')}`}
                              />
                            </ListItem>
                            <Divider component="li" />
                          </React.Fragment>
                        ))}
                      </List>
                    ) : (
                      <Typography variant="body1" color="text.secondary">
                        No recent activity
                      </Typography>
                    )}
                  </CardContent>
                </Card>
              </Grid>
            </Grid>
          </Paper>
        </Grid>
      </Grid>
      </Box>
    </Box>
  );
};

export default Dashboard;
