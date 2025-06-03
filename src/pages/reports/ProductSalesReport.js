import React, { useState, useEffect, useMemo, useCallback } from 'react';
import {
  Box,
  Typography,
  Paper,
  Grid,
  Divider,
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
  IconButton,
  Tooltip,
  Card,
  CardContent,

} from '@mui/material';
import {
  ShoppingCart as ShoppingCartIcon,
  AttachMoney as AttachMoneyIcon,
  LocalOffer as LocalOfferIcon,
  GetApp as GetAppIcon,
  Refresh as RefreshIcon,
  TrendingUp as TrendingUpIcon,

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

// Format currency in RWF (Rwandan Francs)
const formatCurrency = (amount) => {
  return `RWF ${Math.round(amount).toLocaleString()}`;
};

const ProductSalesReport = ({
  dateRange: propDateRange,
  isRefreshing: propIsRefreshing,
  onRefresh: propOnRefresh,
  onExport: propOnExport
}) => {
  const [loading, setLoading] = useState(false);
  const [localLoading, setLocalLoading] = useState(false);
  const [reportData, setReportData] = useState(null);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [order, setOrder] = useState('desc');
  const [orderBy, setOrderBy] = useState('totalSales');

  // Handle page change
  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };

  // Handle rows per page change
  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  // Handle sorting
  const handleSort = (property) => {
    const isAsc = orderBy === property && order === 'asc';
    setOrder(isAsc ? 'desc' : 'asc');
    setOrderBy(property);
  };

  // Mock data fetch - replace with actual API call
  const fetchReportData = useCallback(async () => {
    setLoading(true);
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Mock data
      const mockData = {
        totalProducts: 42,
        totalSales: 1250000,
        totalRevenue: 8500000,
        avgOrderValue: 45000,
        products: [
          // Add sample product data here
        ]
      };
      
      setReportData(mockData);
    } catch (error) {
      console.error('Error fetching report data:', error);
    } finally {
      setLoading(false);
    }
  }, []);

  // Initial data fetch
  useEffect(() => {
    fetchReportData();
  }, [fetchReportData]);

  // Handle refresh
  const handleRefresh = () => {
    setLocalLoading(true);
    fetchReportData().finally(() => setLocalLoading(false));
  };

  // Handle export
  const handleExport = () => {
    // Implement export functionality
    console.log('Exporting report data...');
  };

  // Sort data
  const sortedData = useMemo(() => {
    if (!reportData?.products) return [];
    
    return [...reportData.products].sort((a, b) => {
      if (a[orderBy] < b[orderBy]) {
        return order === 'asc' ? -1 : 1;
      }
      if (a[orderBy] > b[orderBy]) {
        return order === 'asc' ? 1 : -1;
      }
      return 0;
    });
  }, [reportData, order, orderBy]);

  // Pagination
  const paginatedData = useMemo(() => {
    const start = page * rowsPerPage;
    return sortedData.slice(start, start + rowsPerPage);
  }, [sortedData, page, rowsPerPage]);

  // Loading state
  if ((loading || localLoading) && !reportData) {
    return (
      <Box sx={{ 
        display: 'flex', 
        justifyContent: 'center', 
        alignItems: 'center', 
        height: '50vh' 
      }}>
        <CircularProgress sx={{ color: COLORS.red }} />
      </Box>
    );
  }

  // Error state
  if (!loading && !reportData) {
    return (
      <Alert severity="error" sx={{ m: 2 }}>
        Failed to load report data. Please try again.
      </Alert>
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
      <Box mb={4}>
        <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
          <Typography variant="h4" component="h1" fontWeight="bold">
            Product Sales Report
          </Typography>
          <Box>
            <Tooltip title="Refresh">
              <IconButton 
                onClick={handleRefresh} 
                disabled={localLoading}
                sx={{ color: COLORS.text }}
              >
                <RefreshIcon />
              </IconButton>
            </Tooltip>
            <Button 
              variant="contained" 
              startIcon={<GetAppIcon />}
              onClick={handleExport}
              sx={{
                ml: 1,
                backgroundColor: COLORS.red,
                '&:hover': {
                  backgroundColor: '#f40612',
                },
              }}
            >
              Export
            </Button>
          </Box>
        </Box>
        <Divider sx={{ borderColor: COLORS.border }} />
      </Box>

      {/* Summary Cards */}
      <Grid container spacing={3} mb={4}>
        <Grid item xs={12} sm={6} md={3}>
          <Card sx={styles.card}>
            <CardContent>
              <Box display="flex" alignItems="center" mb={1}>
                <ShoppingCartIcon sx={{ color: COLORS.red, mr: 1 }} />
                <Typography color="textSecondary" variant="body2">
                  Total Products
                </Typography>
              </Box>
              <Typography variant="h5" fontWeight="bold">
                {reportData?.totalProducts || 0}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        
        <Grid item xs={12} sm={6} md={3}>
          <Card sx={styles.card}>
            <CardContent>
              <Box display="flex" alignItems="center" mb={1}>
                <LocalOfferIcon sx={{ color: COLORS.red, mr: 1 }} />
                <Typography color="textSecondary" variant="body2">
                  Total Sales
                </Typography>
              </Box>
              <Typography variant="h5" fontWeight="bold">
                {reportData?.totalSales?.toLocaleString() || 0}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        
        <Grid item xs={12} sm={6} md={3}>
          <Card sx={styles.card}>
            <CardContent>
              <Box display="flex" alignItems="center" mb={1}>
                <AttachMoneyIcon sx={{ color: COLORS.red, mr: 1 }} />
                <Typography color="textSecondary" variant="body2">
                  Total Revenue
                </Typography>
              </Box>
              <Typography variant="h5" fontWeight="bold">
                {formatCurrency(reportData?.totalRevenue || 0)}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        
        <Grid item xs={12} sm={6} md={3}>
          <Card sx={styles.card}>
            <CardContent>
              <Box display="flex" alignItems="center" mb={1}>
                <TrendingUpIcon sx={{ color: COLORS.red, mr: 1 }} />
                <Typography color="textSecondary" variant="body2">
                  Avg. Order Value
                </Typography>
              </Box>
              <Typography variant="h5" fontWeight="bold">
                {formatCurrency(reportData?.avgOrderValue || 0)}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Products Table */}
      <Paper sx={styles.tablePaper}>
        <TableContainer sx={styles.tableContainer}>
          <Table sx={styles.table}>
            <TableHead>
              <TableRow>
                <TableCell>
                  <TableSortLabel
                    active={orderBy === 'name'}
                    direction={orderBy === 'name' ? order : 'asc'}
                    onClick={() => handleSort('name')}
                    sx={{ color: COLORS.text }}
                  >
                    Product Name
                  </TableSortLabel>
                </TableCell>
                <TableCell align="right">
                  <TableSortLabel
                    active={orderBy === 'price'}
                    direction={orderBy === 'price' ? order : 'asc'}
                    onClick={() => handleSort('price')}
                    sx={{ color: COLORS.text }}
                  >
                    Price
                  </TableSortLabel>
                </TableCell>
                <TableCell align="right">
                  <TableSortLabel
                    active={orderBy === 'quantity'}
                    direction={orderBy === 'quantity' ? order : 'desc'}
                    onClick={() => handleSort('quantity')}
                    sx={{ color: COLORS.text }}
                  >
                    Quantity Sold
                  </TableSortLabel>
                </TableCell>
                <TableCell align="right">
                  <TableSortLabel
                    active={orderBy === 'revenue'}
                    direction={orderBy === 'revenue' ? order : 'desc'}
                    onClick={() => handleSort('revenue')}
                    sx={{ color: COLORS.text }}
                  >
                    Revenue
                  </TableSortLabel>
                </TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {paginatedData.length > 0 ? (
                paginatedData.map((product) => (
                  <TableRow key={product.id}>
                    <TableCell>{product.name}</TableCell>
                    <TableCell align="right">{formatCurrency(product.price)}</TableCell>
                    <TableCell align="right">{product.quantity}</TableCell>
                    <TableCell align="right">{formatCurrency(product.revenue)}</TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={4} align="center" sx={{ py: 4 }}>
                    <Typography color="textSecondary">
                      No products found
                    </Typography>
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
            borderTop: `1px solid ${COLORS.border}`,
            color: COLORS.text,
            '& .MuiTablePagination-selectLabel, & .MuiTablePagination-displayedRows': {
              color: COLORS.text
            },
            '& .MuiSvgIcon-root': {
              color: COLORS.text
            }
          }}
        />
      </Paper>
    </Box>
  );
};

// Component styles
const styles = {
  card: {
    backgroundColor: COLORS.cardBg,
    border: `1px solid ${COLORS.border}`,
    borderRadius: 1,
    height: '100%',
    transition: 'all 0.2s ease-in-out',
    '&:hover': {
      transform: 'translateY(-4px)',
      boxShadow: `0 6px 12px rgba(0, 0, 0, 0.5)`,
    },
  },
  tablePaper: {
    backgroundColor: COLORS.cardBg,
    borderRadius: 1,
    overflow: 'hidden',
    boxShadow: '0 2px 8px rgba(0, 0, 0, 0.2)',
  },
  tableContainer: {
    maxHeight: 'calc(100vh - 400px)',
    '&::-webkit-scrollbar': {
      height: '6px',
      backgroundColor: COLORS.border,
    },
    '&::-webkit-scrollbar-thumb': {
      backgroundColor: COLORS.red,
      borderRadius: '3px',
    },
  },
  table: {
    minWidth: 900,
    '& .MuiTableCell-root': {
      color: COLORS.text,
      borderBottom: `1px solid ${COLORS.border}`,
    },
    '& .MuiTableHead-root': {
      '& .MuiTableCell-root': {
        backgroundColor: 'rgba(0, 0, 0, 0.3)',
        color: COLORS.textSecondary,
        fontWeight: 600,
      },
    },
    '& .MuiTableBody-root': {
      '& tr:hover': {
        backgroundColor: 'rgba(255, 255, 255, 0.05)',
      },
    },
  },
};

export default ProductSalesReport;
