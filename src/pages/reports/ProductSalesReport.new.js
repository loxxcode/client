import React, { useState } from 'react';
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
  Chip
} from '@mui/material';
import {
  ShoppingCart as ShoppingCartIcon,
  AttachMoney as AttachMoneyIcon,
  LocalOffer as LocalOfferIcon,
  GetApp as GetAppIcon, // Preserved for future use
  Refresh as RefreshIcon, // Preserved for future use
  TrendingUp as TrendingUpIcon, // Preserved for future use
  TrendingDown as TrendingDownIcon // Preserved for future use
} from '@mui/icons-material';
import { formatCurrency } from '../../utils/formatters'; // format is removed as it's not used

// Netflix-inspired color scheme
const NETFLIX_RED = '#e50914';
const NETFLIX_DARK_GRAY = '#141414';
const NETFLIX_LIGHT_GRAY = '#e5e5e5';
const NETFLIX_CARD_BG = '#1a1a1a';
const NETFLIX_BORDER = '#333';

const ProductSalesReport = ({
  dateRange: propDateRange,
  isRefreshing: propIsRefreshing, // Preserved for future implementation
  onRefresh: propOnRefresh, // Preserved for future implementation
  onExport: propOnExport // Preserved for future implementation
}) => {
  // State management
  // eslint-disable-next-line no-unused-vars
  const [loading, setLoading] = useState(true); // Preserved for future implementation
  // eslint-disable-next-line no-unused-vars
  const [localLoading, setLocalLoading] = useState(false); // Preserved for future implementation
  // eslint-disable-next-line no-unused-vars
  const [error, setError] = useState(null); // Preserved for future implementation
  // eslint-disable-next-line no-unused-vars
  const [reportData, setReportData] = useState(null); // Preserved for future implementation
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [orderBy, setOrderBy] = useState('revenue');
  const [order, setOrder] = useState('desc');
  // eslint-disable-next-line no-unused-vars
  const [products, setProducts] = useState([]); // Preserved for future implementation
  // eslint-disable-next-line no-unused-vars
  const [dateRange, setDateRange] = useState(propDateRange); // Preserved for future implementation

  // Mock data for demonstration
  const sortedData = reportData?.products || [];
  const paginatedData = sortedData.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage);

  // Handler functions
  const handleExport = () => {
    if (propOnExport) {
      propOnExport();
    }
  };

  const handleRefresh = () => {
    if (propOnRefresh) {
      propOnRefresh();
    }
  };

  const handleSort = (property) => {
    const isAsc = orderBy === property && order === 'asc';
    setOrder(isAsc ? 'desc' : 'asc');
    setOrderBy(property);
  };

  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  // Responsive styles
  const responsiveCard = {
    height: '100%',
    backgroundColor: NETFLIX_CARD_BG,
    border: `1px solid ${NETFLIX_BORDER}`,
    borderRadius: '8px',
    transition: 'all 0.3s ease',
    '&:hover': {
      transform: 'translateY(-5px)',
      boxShadow: '0 10px 20px rgba(0, 0, 0, 0.3)',
      borderColor: NETFLIX_RED
    },
    '@media (max-width: 600px)': {
      margin: '0 -16px',
      width: 'calc(100% + 32px)',
      borderRadius: 0,
      borderLeft: 'none',
      borderRight: 'none'
    }
  };

  const responsiveTableContainer = {
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
  };

  const responsiveTable = {
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
      color: NETFLIX_LIGHT_GRAY,
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
  };

  // Loading state
  if ((loading || localLoading) && !reportData) {
    return (
      <Box sx={{ 
        p: { xs: 2, sm: 3 },
        backgroundColor: NETFLIX_DARK_GRAY, 
        minHeight: '100vh', 
        color: NETFLIX_LIGHT_GRAY,
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center'
      }}>
        <CircularProgress color="inherit" />
      </Box>
    );
  }

  return (
    <Box sx={{ 
      p: { xs: 2, sm: 3 },
      backgroundColor: NETFLIX_DARK_GRAY, 
      minHeight: '100vh', 
      color: NETFLIX_LIGHT_GRAY,
      overflowX: 'hidden',
      '& .MuiButton-root': {
        whiteSpace: 'nowrap',
        minWidth: 'auto',
        '@media (max-width: 600px)': {
          fontSize: '0.75rem',
          padding: '6px 12px'
        }
      },
      '& .MuiChip-root': {
        height: 'auto',
        '@media (max-width: 600px)': {
          height: '24px',
          '& .MuiChip-label': {
            padding: '0 8px',
            fontSize: '0.7rem'
          }
        }
      }
    }}>
      {/* Header */}
      <Box mb={4} sx={{
        p: { xs: 2, sm: 0 },
        '@media (max-width: 600px)': {
          position: 'sticky',
          top: 0,
          zIndex: 10,
          backgroundColor: NETFLIX_DARK_GRAY,
          pt: 2,
          pb: 1,
          borderBottom: `1px solid ${NETFLIX_BORDER}`
        }
      }}>
        <Typography 
          variant="h4" 
          component="h1" 
          sx={{ 
            fontWeight: 700, 
            mb: 1,
            background: 'linear-gradient(45deg, #e50914, #f5f5f1)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            display: 'inline-block',
            fontSize: { xs: '1.75rem', sm: '2rem' },
            lineHeight: 1.2
          }}
        >
          Product Sales Report
        </Typography>
        <Typography variant="body1" color="textSecondary" sx={{
          fontSize: { xs: '0.9375rem', sm: '1rem' },
          '@media (max-width: 600px)': {
            fontSize: '0.875rem'
          }
        }}>
          Track product performance and inventory levels
        </Typography>
      </Box>

      {/* Summary Cards */}
      <Grid container spacing={{ xs: 2, sm: 3 }} sx={{ mb: 4 }}>
        {/* Total Products Card */}
        <Grid item xs={12} sm={6} md={3}>
          <Card sx={responsiveCard}>
            <CardContent sx={{ p: 2.5 }}>
              <Box display="flex" alignItems="center" mb={1.5}>
                <Box sx={{ bgcolor: 'rgba(229, 9, 20, 0.1)', mr: 2, width: 48, height: 48, display: 'flex', alignItems: 'center', justifyContent: 'center', borderRadius: '50%' }}>
                  <ShoppingCartIcon sx={{ color: NETFLIX_RED }} />
                </Box>
                <Box>
                  <Typography color="textSecondary" variant="body2">Total Products</Typography>
                  <Typography variant="h6" sx={{ fontWeight: 700 }}>
                    {reportData?.totalProducts || 0}
                  </Typography>
                </Box>
              </Box>
              <Box display="flex" alignItems="center" justifyContent="space-between">
                <Typography variant="caption" color="textSecondary">
                  {reportData?.newProductsThisMonth || 0} new this month
                </Typography>
                <TrendingUpIcon sx={{ color: '#4caf50', fontSize: 20 }} />
              </Box>
            </CardContent>
          </Card>
        </Grid>

        {/* Total Revenue Card */}
        <Grid item xs={12} sm={6} md={3}>
          <Card sx={responsiveCard}>
            <CardContent sx={{ p: 2.5 }}>
              <Box display="flex" alignItems="center" mb={1.5}>
                <Box sx={{ bgcolor: 'rgba(0, 200, 83, 0.1)', mr: 2, width: 48, height: 48, display: 'flex', alignItems: 'center', justifyContent: 'center', borderRadius: '50%' }}>
                  <AttachMoneyIcon sx={{ color: '#4caf50' }} />
                </Box>
                <Box>
                  <Typography color="textSecondary" variant="body2">Total Revenue</Typography>
                  <Typography variant="h6" sx={{ fontWeight: 700 }}>
                    {formatCurrency(reportData?.totalRevenue || 0)}
                  </Typography>
                </Box>
              </Box>
              <Box display="flex" alignItems="center" justifyContent="space-between">
                <Typography variant="caption" color="textSecondary">
                  {reportData?.revenueChange >= 0 ? '+' : ''}
                  {reportData?.revenueChange || 0}% from last month
                </Typography>
                {reportData?.revenueChange >= 0 ? (
                  <TrendingUpIcon sx={{ color: '#4caf50', fontSize: 20 }} />
                ) : (
                  <TrendingDownIcon sx={{ color: '#f44336', fontSize: 20 }} />
                )}
              </Box>
            </CardContent>
          </Card>
        </Grid>

        {/* Top Selling Product */}
        <Grid item xs={12} sm={6} md={3}>
          <Card sx={responsiveCard}>
            <CardContent sx={{ p: 2.5 }}>
              <Box display="flex" alignItems="center" mb={1.5}>
                <Box sx={{ bgcolor: 'rgba(255, 171, 0, 0.1)', mr: 2, width: 48, height: 48, display: 'flex', alignItems: 'center', justifyContent: 'center', borderRadius: '50%' }}>
                  <LocalOfferIcon sx={{ color: '#ff9800' }} />
                </Box>
                <Box>
                  <Typography color="textSecondary" variant="body2">Top Selling</Typography>
                  <Typography variant="h6" sx={{ fontWeight: 700, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', maxWidth: '150px' }}>
                    {reportData?.topSellingProduct?.name || 'N/A'}
                  </Typography>
                </Box>
              </Box>
              <Box display="flex" alignItems="center" justifyContent="space-between">
                <Typography variant="caption" color="textSecondary">
                  {reportData?.topSellingProduct?.quantity || 0} units sold
                </Typography>
                <Chip 
                  label={reportData?.topSellingProduct?.category || 'N/A'} 
                  size="small" 
                  sx={{ 
                    backgroundColor: 'rgba(255, 255, 255, 0.1)',
                    color: NETFLIX_LIGHT_GRAY,
                    fontWeight: 500,
                    height: 20,
                    '& .MuiChip-label': { px: 1 }
                  }}
                />
              </Box>
            </CardContent>
          </Card>
        </Grid>

        {/* Export Report Card */}
        <Grid item xs={12} sm={6} md={3}>
          <Card sx={{
            ...responsiveCard,
            background: 'linear-gradient(135deg, rgba(229, 9, 20, 0.1) 0%, rgba(229, 9, 20, 0.05) 100%)',
            border: `1px solid ${NETFLIX_RED}33`
          }}>
            <CardContent sx={{ p: 2.5, height: '100%', display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
              <Box textAlign="center">
                <GetAppIcon sx={{ color: NETFLIX_RED, fontSize: 40, mb: 1 }} />
                <Typography variant="subtitle1" sx={{ fontWeight: 600, mb: 1.5 }}>Export Report</Typography>
                <Button
                  variant="contained"
                  color="primary"
                  size="small"
                  startIcon={<GetAppIcon />}
                  onClick={handleExport}
                  sx={{
                    backgroundColor: NETFLIX_RED,
                    '&:hover': {
                      backgroundColor: '#f40612',
                      boxShadow: `0 0 10px ${NETFLIX_RED}80`
                    },
                    textTransform: 'none',
                    fontWeight: 600,
                    px: 3,
                    py: 1
                  }}
                >
                  Download PDF
                </Button>
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Products Table */}
      <Paper sx={responsiveCard}>
        <Box 
          sx={{ 
            p: 2, 
            display: 'flex', 
            flexDirection: { xs: 'column', sm: 'row' },
            alignItems: { xs: 'stretch', sm: 'center' },
            justifyContent: 'space-between',
            borderBottom: `1px solid ${NETFLIX_BORDER}`
          }}
        >
          <Typography variant="h6" component="h2" sx={{ mb: { xs: 2, sm: 0 }, fontWeight: 600 }}>
            Product Performance
          </Typography>
          <Box display="flex" alignItems="center">
            <Button
              variant="outlined"
              size="small"
              startIcon={<RefreshIcon />}
              onClick={handleRefresh}
              disabled={localLoading}
              sx={{
                color: NETFLIX_LIGHT_GRAY,
                borderColor: NETFLIX_BORDER,
                '&:hover': {
                  borderColor: NETFLIX_RED,
                  backgroundColor: 'rgba(229, 9, 20, 0.1)'
                },
                mr: 2,
                textTransform: 'none'
              }}
            >
              {localLoading ? 'Refreshing...' : 'Refresh'}
            </Button>
          </Box>
        </Box>

        <TableContainer sx={responsiveTableContainer}>
          <Table sx={responsiveTable}>
            <TableHead>
              <TableRow sx={{ backgroundColor: 'rgba(0, 0, 0, 0.3)' }}>
                <TableCell>
                  <TableSortLabel
                    active={orderBy === 'name'}
                    direction={orderBy === 'name' ? order : 'asc'}
                    onClick={() => handleSort('name')}
                    sx={{ color: NETFLIX_LIGHT_GRAY, fontWeight: 600 }}
                  >
                    Product Name
                  </TableSortLabel>
                </TableCell>
                <TableCell sx={{ '@media (max-width: 960px)': { display: 'none' } }}>
                  <TableSortLabel
                    active={orderBy === 'category'}
                    direction={orderBy === 'category' ? order : 'asc'}
                    onClick={() => handleSort('category')}
                    sx={{ color: NETFLIX_LIGHT_GRAY, fontWeight: 600 }}
                  >
                    Category
                  </TableSortLabel>
                </TableCell>
                <TableCell align="right">
                  <TableSortLabel
                    active={orderBy === 'quantity'}
                    direction={orderBy === 'quantity' ? order : 'desc'}
                    onClick={() => handleSort('quantity')}
                    sx={{ color: NETFLIX_LIGHT_GRAY, fontWeight: 600 }}
                  >
                    Quantity Sold
                  </TableSortLabel>
                </TableCell>
                <TableCell align="right">
                  <TableSortLabel
                    active={orderBy === 'revenue'}
                    direction={orderBy === 'revenue' ? order : 'desc'}
                    onClick={() => handleSort('revenue')}
                    sx={{ color: NETFLIX_LIGHT_GRAY, fontWeight: 600 }}
                  >
                    Total Revenue
                  </TableSortLabel>
                </TableCell>
                <TableCell align="right">
                  <TableSortLabel
                    active={orderBy === 'averagePrice'}
                    direction={orderBy === 'averagePrice' ? order : 'desc'}
                    onClick={() => handleSort('averagePrice')}
                    sx={{ color: NETFLIX_LIGHT_GRAY, fontWeight: 600 }}
                  >
                    Avg. Price
                  </TableSortLabel>
                </TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={5} align="center" sx={{ py: 4 }}>
                    <CircularProgress size={24} sx={{ color: NETFLIX_RED }} />
                    <Typography variant="body2" sx={{ mt: 1, color: NETFLIX_LIGHT_GRAY }}>
                      Loading product data...
                    </Typography>
                  </TableCell>
                </TableRow>
              ) : error ? (
                <TableRow>
                  <TableCell colSpan={5} align="center" sx={{ py: 4 }}>
                    <Alert severity="error" sx={{ backgroundColor: 'rgba(244, 67, 54, 0.1)' }}>
                      {error.message || 'Failed to load product data'}
                    </Alert>
                    <Button 
                      variant="outlined" 
                      size="small" 
                      onClick={handleRefresh}
                      startIcon={<RefreshIcon />}
                      sx={{ mt: 2 }}
                    >
                      Retry
                    </Button>
                  </TableCell>
                </TableRow>
              ) : paginatedData.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={5} align="center" sx={{ py: 4, color: NETFLIX_LIGHT_GRAY }}>
                    No products found for the selected criteria
                  </TableCell>
                </TableRow>
              ) : (
                paginatedData.map((row) => (
                  <TableRow 
                    key={row.id}
                    hover
                    sx={{ 
                      '&:last-child td, &:last-child th': { border: 0 },
                      '&:hover': {
                        backgroundColor: 'rgba(229, 9, 20, 0.03)'
                      }
                    }}
                  >
                    <TableCell component="th" scope="row" sx={{ color: NETFLIX_LIGHT_GRAY, fontWeight: 500 }}>
                      {row.name}
                    </TableCell>
                    <TableCell sx={{ '@media (max-width: 960px)': { display: 'none' } }}>
                      <Chip 
                        label={row.category} 
                        size="small" 
                        sx={{ 
                          backgroundColor: 'rgba(255, 255, 255, 0.1)',
                          color: NETFLIX_LIGHT_GRAY,
                          fontWeight: 500,
                          height: 20,
                          '& .MuiChip-label': { px: 1 }
                        }}
                      />
                    </TableCell>
                    <TableCell align="right" sx={{ color: NETFLIX_LIGHT_GRAY }}>
                      {row.quantitySold}
                    </TableCell>
                    <TableCell align="right" sx={{ color: NETFLIX_LIGHT_GRAY, fontWeight: 600 }}>
                      {formatCurrency(row.revenue)}
                    </TableCell>
                    <TableCell align="right" sx={{ color: NETFLIX_LIGHT_GRAY }}>
                      {formatCurrency(row.averagePrice)}
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </TableContainer>
        
        <Box sx={{ 
          display: 'flex', 
          flexDirection: { xs: 'column', sm: 'row' },
          alignItems: 'center',
          justifyContent: 'space-between',
          p: 2,
          borderTop: `1px solid ${NETFLIX_BORDER}`
        }}>
          <Box sx={{ 
            color: NETFLIX_LIGHT_GRAY,
            fontSize: '0.875rem',
            mb: { xs: 2, sm: 0 },
            order: { xs: 2, sm: 1 }
          }}>
            Showing {page * rowsPerPage + 1}-{Math.min((page + 1) * rowsPerPage, sortedData.length)} of {sortedData.length} products
          </Box>
          
          <Box sx={{ order: { xs: 1, sm: 2 } }}>
            <TablePagination
              component="div"
              count={sortedData.length}
              page={page}
              onPageChange={handleChangePage}
              onRowsPerPageChange={handleChangeRowsPerPage}
              rowsPerPage={rowsPerPage}
              rowsPerPageOptions={[5, 10, 25]}
              sx={{
                '& .MuiTablePagination-select, & .MuiTablePagination-selectLabel, & .MuiTablePagination-displayedRows': {
                  color: NETFLIX_LIGHT_GRAY,
                  margin: 0,
                  fontSize: '0.875rem'
                },
                '& .MuiSvgIcon-root': {
                  color: NETFLIX_LIGHT_GRAY,
                },
                '& .Mui-disabled': {
                  opacity: 0.5,
                },
                '& .MuiTablePagination-actions': {
                  marginLeft: 0,
                  '& button': {
                    padding: '6px'
                  }
                },
                '& .MuiInputBase-root': {
                  color: NETFLIX_LIGHT_GRAY,
                  '&:before': {
                    borderColor: 'rgba(255, 255, 255, 0.23)'
                  },
                  '&:hover:not(.Mui-disabled):before': {
                    borderColor: NETFLIX_LIGHT_GRAY
                  },
                  '&:after': {
                    borderColor: NETFLIX_RED
                  },
                  '& .MuiSvgIcon-root': {
                    color: NETFLIX_LIGHT_GRAY
                  }
                },
                '& .MuiSelect-select': {
                  padding: '8px 24px 8px 8px',
                  fontSize: '0.875rem'
                }
              }}
            />
          </Box>
        </Box>
      </Paper>

      <Box mt={4} textAlign="center">
        <Typography variant="body2" color="textSecondary">
          Report generated on {new Date().toLocaleDateString()} at {new Date().toLocaleTimeString()}
        </Typography>
      </Box>

      <Box mt={2} textAlign="center" mb={4}>
        <Typography variant="body2" color="textSecondary">
          End of report
        </Typography>
      </Box>
      
    </Box>
  );
};

export default ProductSalesReport;
