import React, { useState, useEffect, useMemo } from 'react';
import {
  Box,
  Typography,
  Paper,
  Grid,

  CircularProgress,
  Alert,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TablePagination,
  TableSortLabel,
  Button,

  Card,
  CardContent,
  Avatar,
  Chip
} from '@mui/material';
import {
  ShoppingCart as ShoppingCartIcon,
  AttachMoney as AttachMoneyIcon,
  LocalOffer as LocalOfferIcon,
  GetApp as GetAppIcon,
  Refresh as RefreshIcon,
  TrendingUp as TrendingUpIcon,
  TrendingDown as TrendingDownIcon
} from '@mui/icons-material';


// Netflix-inspired color scheme
const COLORS = {
  red: '#e50914',
  darkGray: '#141414',
  lightGray: '#e5e5e5',
  cardBg: '#1a1a1a',
  border: '#333',
  text: '#fff',
  textSecondary: '#b3b3b3'
};

const ProductSalesReport = ({
  dateRange: propDateRange,
  isRefreshing: propIsRefreshing,
  onRefresh: propOnRefresh,
  onExport: propOnExport
}) => {
  // State management
  const [loading, setLoading] = useState(true);
  const [localLoading, setLocalLoading] = useState(false);
  const [error, setError] = useState(null);
  const [reportData, setReportData] = useState(null);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [orderBy, setOrderBy] = useState('revenue');
  const [order, setOrder] = useState('desc');
  const [products, setProducts] = useState([]);
  // These state variables are defined for future implementation
  // eslint-disable-next-line no-unused-vars
  const [dateRange, setDateRange] = useState(propDateRange);
  // eslint-disable-next-line no-unused-vars
  const [stats, setStats] = useState({
    totalProducts: 0,
    totalSold: 0,
    totalRevenue: 0,
    avgOrderValue: 0,
    revenueChange: 0
  });

  // Mock data for demonstration
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        // Simulate API call
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        const mockData = {
          totalProducts: 42,
          newProductsThisMonth: 5,
          totalRevenue: 12500.75,
          revenueChange: 8.5,
          topSellingProduct: {
            name: 'Premium Subscription',
            quantity: 128,
            category: 'Subscription'
          },
          products: Array.from({ length: 25 }, (_, i) => ({
            id: i + 1,
            name: `Product ${i + 1}`,
            category: ['Subscription', 'Movie', 'TV Show', 'Documentary'][i % 4],
            quantitySold: Math.floor(Math.random() * 1000) + 100,
            revenue: Math.floor(Math.random() * 10000) + 1000,
            averagePrice: Math.floor(Math.random() * 100) + 10
          }))
        };
        
        setReportData(mockData);
        setProducts(mockData.products);
        setError(null);
      } catch (err) {
        setError(err);
      } finally {
        setLoading(false);
        setLocalLoading(false);
      }
    };

    fetchData();
  }, []);

  // Handle sort
  const handleSort = (property) => {
    const isAsc = orderBy === property && order === 'asc';
    setOrder(isAsc ? 'desc' : 'asc');
    setOrderBy(property);
  };

  // Handle change page
  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };

  // Handle change rows per page
  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  // Handle refresh
  const handleRefresh = async () => {
    setLocalLoading(true);
    try {
      // Simulate refresh
      await new Promise(resolve => setTimeout(resolve, 1000));
      setLocalLoading(false);
    } catch (err) {
      setError(err);
      setLocalLoading(false);
    }
  };

  // Handle export
  const handleExport = () => {
    if (propOnExport) {
      propOnExport();
    } else {
      console.log('Exporting data...');
    }
  };

  // Sort data
  const sortedData = useMemo(() => {
    if (!products || products.length === 0) return [];
    
    return [...products].sort((a, b) => {
      if (a[orderBy] < b[orderBy]) {
        return order === 'asc' ? -1 : 1;
      }
      if (a[orderBy] > b[orderBy]) {
        return order === 'asc' ? 1 : -1;
      }
      return 0;
    });
  }, [products, orderBy, order]);

  // Pagination
  const paginatedData = useMemo(() => {
    return sortedData.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage);
  }, [sortedData, page, rowsPerPage]);

  // Responsive styles
  const styles = {
    card: {
      height: '100%',
      backgroundColor: COLORS.cardBg,
      border: `1px solid ${COLORS.border}`,
      borderRadius: '8px',
      transition: 'all 0.3s ease',
      '&:hover': {
        transform: 'translateY(-5px)',
        boxShadow: '0 10px 20px rgba(0, 0, 0, 0.3)',
        borderColor: COLORS.red
      },
      '@media (max-width: 600px)': {
        margin: '0 -16px',
        width: 'calc(100% + 32px)',
        borderRadius: 0,
        borderLeft: 'none',
        borderRight: 'none'
      }
    },
    tableContainer: {
      width: '100%',
      overflowX: 'auto',
      WebkitOverflowScrolling: 'touch',
      '&::-webkit-scrollbar': {
        height: '6px',
        backgroundColor: '#333',
        '@media (max-width: 600px)': {
          height: '4px'
        }
      },
      '&::-webkit-scrollbar-thumb': {
        backgroundColor: '#666',
        borderRadius: '3px'
      },
      '@media (max-width: 600px)': {
        '&': {
          margin: '0 -16px',
          width: 'calc(100% + 32px)'
        }
      }
    },
    table: {
      minWidth: 900,
      '& .MuiTableCell-root': {
        whiteSpace: 'nowrap',
        padding: '12px 16px',
        '@media (max-width: 600px)': {
          padding: '8px 10px',
          fontSize: '0.8125rem'
        }
      },
      '& .MuiTableCell-head': {
        backgroundColor: 'rgba(0, 0, 0, 0.3)',
        color: COLORS.lightGray,
        fontWeight: 600,
        fontSize: '0.875rem',
        whiteSpace: 'nowrap',
        '@media (max-width: 600px)': {
          fontSize: '0.8125rem',
          padding: '10px',
          '&:first-of-type': {
            paddingLeft: '16px'
          },
          '&:last-child': {
            paddingRight: '16px'
          }
        }
      },
      '& .MuiTableRow-root': {
        '&:nth-of-type(odd)': {
          backgroundColor: 'rgba(255, 255, 255, 0.02)'
        },
        '&:hover': {
          backgroundColor: 'rgba(229, 9, 20, 0.05)'
        }
      }
    }
  };

  // Format currency helper for RWF (Rwandan Francs)
  const formatCurrency = (value) => {
    return `RWF ${value.toLocaleString('en-RW')}`;
  };

  // Loading state
  if ((loading || localLoading) && !reportData) {
    return (
      <Box sx={{ 
        p: { xs: 2, sm: 3 },
        backgroundColor: COLORS.darkGray, 
        minHeight: '100vh', 
        color: COLORS.lightGray,
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center'
      }}>
        <CircularProgress color="inherit" />
      </Box>
    );
  }

  // Error state
  if (error) {
    return (
      <Box sx={{ 
        p: { xs: 2, sm: 3 },
        backgroundColor: COLORS.darkGray,
        minHeight: '100vh',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center'
      }}>
        <Alert severity="error" sx={{ maxWidth: 600, width: '100%' }}>
          <Typography variant="h6" gutterBottom>
            Error Loading Data
          </Typography>
          <Typography variant="body2">
            {error.message || 'An error occurred while loading the report data.'}
          </Typography>
          <Button 
            variant="contained" 
            color="primary" 
            onClick={handleRefresh}
            startIcon={<RefreshIcon />}
            sx={{ mt: 2 }}
          >
            Retry
          </Button>
        </Alert>
      </Box>
    );
  }

  return (
    <Box sx={{ 
      p: { xs: 2, sm: 3 },
      backgroundColor: COLORS.darkGray,
      minHeight: '100vh',
      color: COLORS.text
    }}>
      {/* Header */}
      <Box sx={{ 
        display: 'flex', 
        justifyContent: 'space-between', 
        alignItems: 'center',
        mb: 3,
        flexWrap: 'wrap',
        gap: 2
      }}>
        <Typography variant="h4" component="h1" sx={{ 
          color: COLORS.text,
          fontWeight: 700,
          fontSize: { xs: '1.5rem', sm: '2rem' }
        }}>
          Product Sales Report
        </Typography>
        <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
          <Button
            variant="contained"
            color="primary"
            startIcon={<GetAppIcon />}
            onClick={handleExport}
            disabled={loading || localLoading}
            sx={{
              backgroundColor: COLORS.red,
              '&:hover': {
                backgroundColor: '#f40612',
                boxShadow: '0 0 10px rgba(229, 9, 20, 0.5)'
              }
            }}
          >
            Export
          </Button>
          <Button
            variant="outlined"
            startIcon={<RefreshIcon />}
            onClick={handleRefresh}
            disabled={loading || localLoading}
            sx={{
              color: COLORS.text,
              borderColor: COLORS.textSecondary,
              '&:hover': {
                borderColor: COLORS.text,
                backgroundColor: 'rgba(255, 255, 255, 0.08)'
              }
            }}
          >
            Refresh
          </Button>
        </Box>
      </Box>

      {/* Stats Cards */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        {/* Total Products */}
        <Grid item xs={12} sm={6} md={3}>
          <Card sx={styles.card}>
            <CardContent>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <Box>
                  <Typography color="textSecondary" gutterBottom>
                    Total Products
                  </Typography>
                  <Typography variant="h5" component="div">
                    {reportData?.totalProducts?.toLocaleString() || '0'}
                  </Typography>
                </Box>
                <Avatar sx={{ bgcolor: 'rgba(229, 9, 20, 0.1)', color: COLORS.red }}>
                  <LocalOfferIcon />
                </Avatar>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        {/* New This Month */}
        <Grid item xs={12} sm={6} md={3}>
          <Card sx={styles.card}>
            <CardContent>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <Box>
                  <Typography color="textSecondary" gutterBottom>
                    New This Month
                  </Typography>
                  <Typography variant="h5" component="div">
                    {reportData?.newProductsThisMonth?.toLocaleString() || '0'}
                  </Typography>
                </Box>
                <Avatar sx={{ bgcolor: 'rgba(0, 184, 148, 0.1)', color: '#00b894' }}>
                  <TrendingUpIcon />
                </Avatar>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        {/* Total Revenue */}
        <Grid item xs={12} sm={6} md={3}>
          <Card sx={styles.card}>
            <CardContent>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <Box>
                  <Typography color="textSecondary" gutterBottom>
                    Total Revenue
                  </Typography>
                  <Typography variant="h5" component="div">
                    {formatCurrency(reportData?.totalRevenue || 0)}
                  </Typography>
                  <Box sx={{ display: 'flex', alignItems: 'center', mt: 0.5 }}>
                    {reportData?.revenueChange >= 0 ? (
                      <TrendingUpIcon color="success" fontSize="small" />
                    ) : (
                      <TrendingDownIcon color="error" fontSize="small" />
                    )}
                    <Typography 
                      variant="caption" 
                      sx={{ 
                        ml: 0.5,
                        color: reportData?.revenueChange >= 0 ? 'success.main' : 'error.main'
                      }}
                    >
                      {Math.abs(reportData?.revenueChange || 0)}% {reportData?.revenueChange >= 0 ? 'increase' : 'decrease'} from last month
                    </Typography>
                  </Box>
                </Box>
                <Avatar sx={{ bgcolor: 'rgba(9, 132, 227, 0.1)', color: '#0984e3' }}>
                  <AttachMoneyIcon />
                </Avatar>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        {/* Top Selling Product */}
        <Grid item xs={12} sm={6} md={3}>
          <Card sx={styles.card}>
            <CardContent>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <Box>
                  <Typography color="textSecondary" gutterBottom>
                    Top Selling Product
                  </Typography>
                  <Typography variant="h6" component="div" noWrap>
                    {reportData?.topSellingProduct?.name || 'N/A'}
                  </Typography>
                  <Typography variant="body2" color="textSecondary">
                    {reportData?.topSellingProduct?.quantity?.toLocaleString() || '0'} sold
                  </Typography>
                </Box>
                <Avatar sx={{ bgcolor: 'rgba(255, 71, 87, 0.1)', color: '#ff4757' }}>
                  <ShoppingCartIcon />
                </Avatar>
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Products Table */}
      <Paper sx={styles.card}>
        <Box sx={{ p: 2, borderBottom: `1px solid ${COLORS.border}` }}>
          <Typography variant="h6" sx={{ color: COLORS.text }}>
            Products
          </Typography>
        </Box>
        
        <TableContainer sx={styles.tableContainer}>
          <Table sx={styles.table}>
            <TableHead>
              <TableRow>
                <TableCell>
                  <TableSortLabel
                    active={orderBy === 'name'}
                    direction={orderBy === 'name' ? order : 'asc'}
                    onClick={() => handleSort('name')}
                  >
                    Product Name
                  </TableSortLabel>
                </TableCell>
                <TableCell align="right">
                  <TableSortLabel
                    active={orderBy === 'category'}
                    direction={orderBy === 'category' ? order : 'asc'}
                    onClick={() => handleSort('category')}
                  >
                    Category
                  </TableSortLabel>
                </TableCell>
                <TableCell align="right">
                  <TableSortLabel
                    active={orderBy === 'quantitySold'}
                    direction={orderBy === 'quantitySold' ? order : 'desc'}
                    onClick={() => handleSort('quantitySold')}
                  >
                    Quantity Sold
                  </TableSortLabel>
                </TableCell>
                <TableCell align="right">
                  <TableSortLabel
                    active={orderBy === 'revenue'}
                    direction={orderBy === 'revenue' ? order : 'desc'}
                    onClick={() => handleSort('revenue')}
                  >
                    Total Revenue
                  </TableSortLabel>
                </TableCell>
                <TableCell align="right">
                  <TableSortLabel
                    active={orderBy === 'averagePrice'}
                    direction={orderBy === 'averagePrice' ? order : 'desc'}
                    onClick={() => handleSort('averagePrice')}
                  >
                    Avg. Price
                  </TableSortLabel>
                </TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {paginatedData.length > 0 ? (
                paginatedData.map((row) => (
                  <TableRow key={row.id}>
                    <TableCell component="th" scope="row">
                      <Typography variant="body2" sx={{ color: COLORS.text }}>
                        {row.name}
                      </Typography>
                    </TableCell>
                    <TableCell align="right">
                      <Chip 
                        label={row.category} 
                        size="small" 
                        sx={{ 
                          backgroundColor: 'rgba(255, 255, 255, 0.1)',
                          color: COLORS.text,
                          fontSize: '0.75rem',
                          height: 24
                        }} 
                      />
                    </TableCell>
                    <TableCell align="right">
                      <Typography variant="body2" sx={{ color: COLORS.text }}>
                        {row.quantitySold?.toLocaleString() || '0'}
                      </Typography>
                    </TableCell>
                    <TableCell align="right">
                      <Typography variant="body2" sx={{ color: COLORS.text, fontWeight: 600 }}>
                        {formatCurrency(row.revenue || 0)}
                      </Typography>
                    </TableCell>
                    <TableCell align="right">
                      <Typography variant="body2" sx={{ color: COLORS.textSecondary }}>
                        {formatCurrency(row.averagePrice || 0)}
                      </Typography>
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={5} align="center" sx={{ py: 4, color: COLORS.textSecondary }}>
                    No products found
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </TableContainer>

        <TablePagination
          rowsPerPageOptions={[5, 10, 25]}
          component="div"
          count={sortedData.length}
          rowsPerPage={rowsPerPage}
          page={page}
          onPageChange={handleChangePage}
          onRowsPerPageChange={handleChangeRowsPerPage}
          sx={{
            color: COLORS.textSecondary,
            borderTop: `1px solid ${COLORS.border}`,
            '& .MuiTablePagination-selectIcon': {
              color: COLORS.text
            },
            '& .MuiTablePagination-actions button': {
              color: COLORS.text
            },
            '& .MuiTablePagination-displayedRows': {
              color: COLORS.text
            }
          }}
        />
      </Paper>
    </Box>
  );
};

export default ProductSalesReport;
