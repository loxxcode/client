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
import { format } from 'date-fns';

// Netflix-inspired color scheme
const NETFLIX_RED = '#e50914';
const NETFLIX_DARK_GRAY = '#141414';
const NETFLIX_LIGHT_GRAY = '#e5e5e5';
const NETFLIX_CARD_BG = '#1a1a1a';
const NETFLIX_BORDER = '#333';

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
  const [dateRange, setDateRange] = useState(propDateRange);
  const [stats, setStats] = useState({
    totalProducts: 0,
    totalSold: 0,
    totalRevenue: 0,
    avgPrice: 0,
    revenueChange: 0
  });

  // Fetch current product data
  const fetchProducts = useCallback(async () => {
    try {
      const response = await getProducts();
      let productsData = [];

      if (Array.isArray(response)) {
        productsData = response;
      } else if (response && Array.isArray(response.data)) {
        productsData = response.data;
      } else if (response && response.products && Array.isArray(response.products)) {
        productsData = response.products;
      } else if (response && response.data?.products && Array.isArray(response.data.products)) {
        productsData = response.data.products;
      }

      setProducts(productsData);
      return productsData;
    } catch (error) {
      console.error('Error in fetchProducts:', error);
      return [];
    }
  }, []);

  // Fetch report data - memoized with useCallback
  const fetchReportData = useCallback(async (isExternalRefresh = false) => {
    try {
      if (isExternalRefresh) {
        setLocalLoading(true);
      } else {
        setLoading(true);
      }
      setError(null);
      
      const formattedStartDate = format(dateRange.startDate, 'yyyy-MM-dd');
      const formattedEndDate = format(dateRange.endDate, 'yyyy-MM-dd');
      
      console.log('Fetching report data with dates:', { formattedStartDate, formattedEndDate });
      
      // Fetch data in parallel
      const [salesData, productsData] = await Promise.all([
        getProductSalesReport(formattedStartDate, formattedEndDate).catch(err => {
          console.error('Error in getProductSalesReport:', err);
          throw new Error(`Failed to fetch sales data: ${err.message}`);
        }),
        fetchProducts().catch(err => {
          console.error('Error in fetchProducts:', err);
          throw new Error(`Failed to fetch product data: ${err.message}`);
        })
      ]);
      
      console.log('API Response - Sales Data:', salesData);
      console.log('API Response - Products Data:', productsData);
      
      if (!salesData || !salesData.products) {
        throw new Error('Invalid sales data format received from server');
      }
      
      // Ensure productsData is an array and handle potential mismatches in ID fields
      const productsArray = Array.isArray(productsData) ? productsData : [];
      console.log('Products array for matching:', productsArray);
      
      // Enrich sales data with current stock from products
      const enrichedProducts = (salesData.products || []).map(product => {
        if (!product) return null;
        
        let matchingProduct = null;
        
        // Safely get product ID and name
        const productId = product?.id || product?._id;
        const productName = product?.productName || '';
        
        // Try matching by _id first, then by id if _id doesn't match
        if (productId) {
          matchingProduct = productsArray.find(p => 
            (p?._id && p._id === productId) || 
            (p?.id && p.id === productId)
          );
        }
        
        // If no match found by ID, try matching by product name as a fallback
        if (!matchingProduct && productName) {
          matchingProduct = productsArray.find(p => 
            p?.name && p.name.toLowerCase() === productName.toLowerCase()
          );
        }
        
        console.log(`Matching product for ${productName || productId || 'unknown'}:`, matchingProduct);
        
        return {
          ...product,
          id: productId || `temp-${Math.random().toString(36).substr(2, 9)}`,
          currentStock: matchingProduct?.quantityInStock || 0,
          // Ensure all required fields have default values
          productName: productName || 'Unknown Product',
          category: product?.category || 'Uncategorized',
          quantitySold: product?.quantitySold || 0,
          totalRevenue: product?.totalRevenue || 0,
          averagePrice: product?.averagePrice || 0
        };
      }).filter(Boolean); // Remove any null entries
      
      console.log('Enriched Products:', enrichedProducts);
      
      // Calculate stats from the API response
      const totalSold = enrichedProducts.reduce((sum, p) => sum + (p.quantitySold || 0), 0);
      const totalRevenue = enrichedProducts.reduce((sum, p) => sum + (p.totalRevenue || 0), 0);
      const avgPrice = totalSold > 0 ? totalRevenue / totalSold : 0;
      
      // Set the stats for the summary cards
      setStats({
        totalProducts: enrichedProducts.length,
        totalSold,
        totalRevenue,
        avgPrice,
        revenueChange: salesData.revenueChange || 0
      });
      
      // Set the report data for the table
      setReportData({
        ...salesData,
        products: enrichedProducts
      });
      
      console.log('Report data successfully processed');
    } catch (err) {
      console.error('Error in fetchReportData:', {
        message: err.message,
        stack: err.stack,
        dateRange: {
          start: dateRange.startDate,
          end: dateRange.endDate
        }
      });
      setError(`Failed to load report data: ${err.message}`);
    } finally {
      if (isExternalRefresh) {
        setLocalLoading(false);
        if (propOnRefresh) {
          propOnRefresh();
        }
      } else {
        setLoading(false);
      }
    }
  }, [dateRange.startDate, dateRange.endDate, propOnRefresh]);
  
  // Refresh stock data when the component mounts or when explicitly refreshed
  useEffect(() => {
    if (reportData?.products?.length) {
      fetchProducts().then(productsData => {
        if (productsData.length) {
          const updatedProducts = reportData.products.map(product => ({
            ...product,
            currentStock: productsData.find(p => p._id === product.id)?.quantityInStock || 0
          }));
          
          setReportData(prev => ({
            ...prev,
            products: updatedProducts
          }));
        }
      });
    }
  }, [propIsRefreshing]); // Refresh when parent triggers a refresh

  // Initial data load
  useEffect(() => {
    fetchReportData();
    // We're intentionally omitting fetchReportData from the dependency array
    // to prevent infinite loops, and using the eslint-disable comment
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [dateRange.startDate, dateRange.endDate]);

  // Handle refresh from parent
  useEffect(() => {
    if (propIsRefreshing) {
      fetchReportData(true);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [propIsRefreshing]);

  // Sync date range when props change
  useEffect(() => {
    setDateRange(propDateRange);
  }, [propDateRange]);

  // Handle date range change - now handled by parent component
  // This is just a placeholder to avoid errors in case any code references it
  const handleDateRangeChange = () => {};

  // Handle sort
  const handleRequestSort = (property) => {
    const isAsc = orderBy === property && order === 'asc';
    setOrder(isAsc ? 'desc' : 'asc');
    setOrderBy(property);
  };

  // Handle page change
  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };

  // Handle rows per page change
  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  // Apply sorting to data
  const getSortedData = () => {
    if (!reportData?.products) return [];
    
    return [...reportData.products].sort((a, b) => {
      let comparison = 0;
      
      if (orderBy === 'productName' || orderBy === 'category') {
        comparison = a[orderBy].localeCompare(b[orderBy]);
      } else {
        comparison = a[orderBy] > b[orderBy] ? 1 : -1;
      }
      
      return order === 'desc' ? -comparison : comparison;
    });
  };

  // Netflix-inspired color scheme
  const netflixRed = '#e50914';
  const netflixDarkGray = '#141414';
  const netflixLightGray = '#e5e5e5';
  const netflixCardBg = '#1a1a1a';
  const netflixBorder = '#333';
  
  // Responsive styles
  const responsiveCard = {
    height: '100%',
    backgroundColor: netflixCardBg,
    border: `1px solid ${netflixBorder}`,
    borderRadius: '8px',
    transition: 'all 0.3s ease',
    '&:hover': {
      transform: 'translateY(-5px)',
      boxShadow: '0 10px 20px rgba(0, 0, 0, 0.3)',
      borderColor: netflixRed
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
      color: netflixLightGray,
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
  
  // Responsive styles
  const responsiveCard = {
    height: '100%',
    backgroundColor: netflixCardBg,
    border: `1px solid ${netflixBorder}`,
    borderRadius: '8px',
    transition: 'all 0.3s ease',
    '&:hover': {
      transform: 'translateY(-5px)',
      boxShadow: '0 10px 20px rgba(0, 0, 0, 0.3)',
      borderColor: netflixRed
    }
  };
  
  const responsiveTableContainer = {
    width: '100%',
    overflowX: 'auto',
    '&::-webkit-scrollbar': { 
      height: '6px',
      backgroundColor: '#333'
    },
    '&::-webkit-scrollbar-thumb': {
      backgroundColor: '#666',
      borderRadius: '3px'
    },
    '@media (max-width: 600px)': {
      '&': {
        marginLeft: '-16px',
        marginRight: '-16px',
        width: 'calc(100% + 32px)'
      }
    }
  };
  
  const responsiveTable = {
    minWidth: 900, // Ensure table has a minimum width
    '& .MuiTableCell-root': {
      whiteSpace: 'nowrap',
      padding: '12px 16px',
      '@media (max-width: 600px)': {
        padding: '8px 12px',
        fontSize: '0.75rem'
      }
    },
    '& .MuiTableCell-head': {
      backgroundColor: 'rgba(0, 0, 0, 0.3)',
      color: netflixLightGray,
      fontWeight: 600,
      fontSize: '0.875rem',
      '@media (max-width: 600px)': {
        fontSize: '0.75rem',
        padding: '8px 6px',
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

  // Get sorted data
  const sortedData = getSortedData();
  
  // Pagination
  const paginatedData = sortedData.slice(
    page * rowsPerPage,
    page * rowsPerPage + rowsPerPage
  );

  // Loading state
  if ((loading || localLoading) && !reportData) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="60vh">
        <CircularProgress color="primary" />
      </Box>
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
    color: netflixLightGray,
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
  
// Responsive styles
const responsiveCard = {
  height: '100%',
  backgroundColor: netflixCardBg,
  border: `1px solid ${netflixBorder}`,
  borderRadius: '8px',
  transition: 'all 0.3s ease',
  '&:hover': {
    transform: 'translateY(-5px)',
    boxShadow: '0 10px 20px rgba(0, 0, 0, 0.3)',
    borderColor: netflixRed
  }
};
  
const responsiveTableContainer = {
  width: '100%',
  overflowX: 'auto',
  '&::-webkit-scrollbar': { 
    height: '6px',
    backgroundColor: '#333'
  },
  '&::-webkit-scrollbar-thumb': {
    backgroundColor: '#666',
    borderRadius: '3px'
  },
  '@media (max-width: 600px)': {
    '&': {
      marginLeft: '-16px',
      marginRight: '-16px',
      width: 'calc(100% + 32px)'
    }
  }
};
  
const responsiveTable = {
  minWidth: 900, // Ensure table has a minimum width
  '& .MuiTableCell-root': {
    whiteSpace: 'nowrap',
    padding: '12px 16px',
    '@media (max-width: 600px)': {
      padding: '8px 12px',
      fontSize: '0.75rem'
    }
  },
  '& .MuiTableCell-head': {
    backgroundColor: 'rgba(0, 0, 0, 0.3)',
    color: netflixLightGray,
    fontWeight: 600,
    fontSize: '0.875rem',
    '@media (max-width: 600px)': {
      fontSize: '0.75rem',
      padding: '8px 6px',
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

// Get sorted data
const sortedData = getSortedData();
  
// Pagination
const paginatedData = sortedData.slice(
  page * rowsPerPage,
  page * rowsPerPage + rowsPerPage
);

  // Loading state
  if ((loading || localLoading) && !reportData) {
    return (
      <Box sx={{ 
        p: { xs: 2, sm: 3 },
        backgroundColor: netflixDarkGray, 
        minHeight: '100vh', 
        color: netflixLightGray,
        overflowX: 'hidden',
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
      backgroundColor: netflixDarkGray, 
      minHeight: '100vh', 
      color: netflixLightGray,
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
          backgroundColor: netflixDarkGray,
          pt: 2,
          pb: 1,
          borderBottom: `1px solid ${netflixBorder}`
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
      
      {/* Loading and error states */}
      {error && (
        <Alert 
          severity="error" 
          sx={{ 
            mb: 4,
            backgroundColor: 'rgba(229, 9, 20, 0.1)',
            borderLeft: `4px solid ${netflixRed}`,
            '& .MuiAlert-icon': {
              color: netflixRed
            }
          }}
        >
          {error}
        </Alert>
      )}
      
      {localLoading && (
        <Box display="flex" justifyContent="center" my={4}>
          <CircularProgress size={24} sx={{ color: netflixRed }} />
          <Typography variant="body2" color="textSecondary" ml={2}>
            Updating report data...
          </Typography>
        </Box>
      )}

      {/* Summary Cards */}
      <Grid container spacing={{ xs: 2, sm: 3 }} sx={{ mb: 4 }}>
        {/* Total Products Card */}
        <Grid item xs={12} sm={6} md={3}>
          <Card 
            sx={{ 
              height: '100%', 
              backgroundColor: netflixCardBg,
              border: `1px solid ${netflixBorder}`,
              borderRadius: '8px',
              transition: 'all 0.3s ease',
              '&:hover': {
                transform: 'translateY(-5px)',
                boxShadow: `0 10px 20px rgba(0, 0, 0, 0.3)`,
                borderColor: netflixRed
              }
            }}
          >
            <CardContent>
              <Box display="flex" alignItems="center" mb={2}>
                <Box 
                  sx={{
                    backgroundColor: 'rgba(229, 9, 20, 0.1)',
                    borderRadius: '50%',
                    width: 48,
                    height: 48,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    mr: 2
                  }}
                >
                  <ShoppingCartIcon sx={{ color: netflixRed }} />
                </Box>
                <Box>
                  <Typography variant="subtitle2" color="textSecondary">
                    Total Products
                  </Typography>
                  <Typography variant="h5" sx={{ fontWeight: 700, color: netflixLightGray }}>
                    {stats.totalProducts.toLocaleString()}
                  </Typography>
                </Box>
              </Box>
              <Box display="flex" alignItems="center">
                <TrendingUpIcon sx={{ color: '#00a862', fontSize: 18, mr: 0.5 }} />
                <Typography variant="caption" sx={{ color: '#00a862', fontWeight: 600 }}>
                  +5.2% from last month
                </Typography>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        {/* Total Sold Card */}
        <Grid item xs={12} sm={6} md={3}>
          <Card 
            sx={{ 
              height: '100%', 
              backgroundColor: netflixCardBg,
              border: `1px solid ${netflixBorder}`,
              borderRadius: '8px',
              transition: 'all 0.3s ease',
              '&:hover': {
                transform: 'translateY(-5px)',
                boxShadow: `0 10px 20px rgba(0, 0, 0, 0.3)`,
                borderColor: netflixRed
              }
            }}
          >
            <CardContent>
              <Box display="flex" alignItems="center" mb={2}>
                <Box 
                  sx={{
                    backgroundColor: 'rgba(0, 168, 98, 0.1)',
                    borderRadius: '50%',
                    width: 48,
                    height: 48,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    mr: 2
                  }}
                >
                  <ShoppingCartIcon sx={{ color: '#00a862' }} />
                </Box>
                <Box>
                  <Typography variant="subtitle2" color="textSecondary">
                    Total Sold
                  </Typography>
                  <Typography variant="h5" sx={{ fontWeight: 700, color: netflixLightGray }}>
                    {stats.totalSold.toLocaleString()}
                  </Typography>
                </Box>
              </Box>
              <Box display="flex" alignItems="center">
                <TrendingUpIcon sx={{ color: '#00a862', fontSize: 18, mr: 0.5 }} />
                <Typography variant="caption" sx={{ color: '#00a862', fontWeight: 600 }}>
                  +12.5% from last month
                </Typography>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        {/* Total Revenue Card */}
        <Grid item xs={12} sm={6} md={3}>
          <Card 
            sx={{ 
              height: '100%', 
              backgroundColor: netflixCardBg,
              border: `1px solid ${netflixBorder}`,
              borderRadius: '8px',
              transition: 'all 0.3s ease',
              '&:hover': {
                transform: 'translateY(-5px)',
                boxShadow: `0 10px 20px rgba(0, 0, 0, 0.3)`,
                borderColor: netflixRed
              }
            }}
          >
            <CardContent>
              <Box display="flex" alignItems="center" mb={2}>
                <Box 
                  sx={{
                    backgroundColor: 'rgba(0, 113, 206, 0.1)',
                    borderRadius: '50%',
                    width: 48,
                    height: 48,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    mr: 2
                  }}
                >
                  <AttachMoneyIcon sx={{ color: '#1e90ff' }} />
                </Box>
                <Box>
                  <Typography variant="subtitle2" color="textSecondary">
                    Total Revenue
                  </Typography>
                  <Typography variant="h5" sx={{ fontWeight: 700, color: netflixLightGray }}>
                    {formatCurrency(stats.totalRevenue)}
                  </Typography>
                </Box>
              </Box>
              <Box display="flex" alignItems="center">
                <TrendingUpIcon sx={{ color: '#00a862', fontSize: 18, mr: 0.5 }} />
                <Typography variant="caption" sx={{ color: '#00a862', fontWeight: 600 }}>
                  +8.3% from last month
                </Typography>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        {/* Average Price Card */}
        <Grid item xs={12} sm={6} md={3}>
          <Card 
            sx={{ 
              height: '100%', 
              backgroundColor: netflixCardBg,
              border: `1px solid ${netflixBorder}`,
              borderRadius: '8px',
              transition: 'all 0.3s ease',
              '&:hover': {
                transform: 'translateY(-5px)',
                boxShadow: `0 10px 20px rgba(0, 0, 0, 0.3)`,
                borderColor: netflixRed
              }
            }}
          >
            <CardContent>
              <Box display="flex" alignItems="center" mb={2}>
                <Box 
                  sx={{
                    backgroundColor: 'rgba(255, 165, 0, 0.1)',
                    borderRadius: '50%',
                    width: 48,
                    height: 48,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    mr: 2
                  }}
                >
                  <LocalOfferIcon sx={{ color: '#ffa500' }} />
                </Box>
                <Box>
                  <Typography variant="subtitle2" color="textSecondary">
                    Avg. Price
                  </Typography>
                  <Typography variant="h5" sx={{ fontWeight: 700, color: netflixLightGray }}>
                    {formatCurrency(stats.avgPrice)}
                  </Typography>
                </Box>
              </Box>
              <Box display="flex" alignItems="center">
                <TrendingDownIcon sx={{ color: '#e50914', fontSize: 18, mr: 0.5 }} />
                <Typography variant="caption" sx={{ color: '#e50914', fontWeight: 600 }}>
                  -2.1% from last month
                </Typography>
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
            justifyContent: 'space-between',
            alignItems: 'center',
            borderBottom: `1px solid ${netflixBorder}`
          }}
        >
          <Typography variant="h6" sx={{ color: netflixLightGray }}>
            Product Sales
          </Typography>
          <Box display="flex" gap={1}>
            <Button 
              variant="outlined" 
              size="small"
              startIcon={<GetAppIcon />}
              sx={{
                color: netflixLightGray,
                borderColor: netflixBorder,
                '&:hover': {
                  borderColor: netflixLightGray,
                  backgroundColor: 'rgba(255, 255, 255, 0.05)'
                }
              }}
            >
              Export
            </Button>
          </Box>
        </Box>
        
        <TableContainer sx={responsiveTableContainer}>
          <Table sx={responsiveTable}>
            <TableHead>
              <TableRow sx={{ backgroundColor: 'rgba(0, 0, 0, 0.3)' }}>
                <TableCell>
                  <TableSortLabel
                    active={orderBy === 'productName'}
                    direction={orderBy === 'productName' ? order : 'asc'}
                    onClick={() => handleRequestSort('productName')}
                    sx={{
                      color: netflixLightGray,
                      '&:hover': { color: netflixRed },
                      '&.Mui-active': { color: netflixRed }
                    }}
                  >
                    Product
                  </TableSortLabel>
                </TableCell>
                <TableCell>
                  <TableSortLabel
                    active={orderBy === 'category'}
                    direction={orderBy === 'category' ? order : 'asc'}
                    onClick={() => handleRequestSort('category')}
                    sx={{
                      color: netflixLightGray,
                      '&:hover': { color: netflixRed },
                      '&.Mui-active': { color: netflixRed }
                    }}
                  >
                    Category
                  </TableSortLabel>
                </TableCell>
                <TableCell align="right">
                  <TableSortLabel
                    active={orderBy === 'quantitySold'}
                    direction={orderBy === 'quantitySold' ? order : 'desc'}
                    onClick={() => handleRequestSort('quantitySold')}
                    sx={{
                      color: netflixLightGray,
                      '&:hover': { color: netflixRed },
                      '&.Mui-active': { color: netflixRed }
                    }}
                  >
                    Qty Sold
                  </TableSortLabel>
                </TableCell>
                <TableCell align="right">
                  <TableSortLabel
                    active={orderBy === 'currentStock'}
                    direction={orderBy === 'currentStock' ? order : 'desc'}
                    onClick={() => handleRequestSort('currentStock')}
                    sx={{
                      color: netflixLightGray,
                      '&:hover': { color: netflixRed },
                      '&.Mui-active': { color: netflixRed }
                    }}
                  >
                    In Stock
                  </TableSortLabel>
                </TableCell>
                <TableCell align="right">
                  <TableSortLabel
                    active={orderBy === 'totalRevenue'}
                    direction={orderBy === 'totalRevenue' ? order : 'desc'}
                    onClick={() => handleRequestSort('totalRevenue')}
                    sx={{
                      color: netflixLightGray,
                      '&:hover': { color: netflixRed },
                      '&.Mui-active': { color: netflixRed }
                    }}
                  >
                    Total Revenue
                  </TableSortLabel>
                </TableCell>
                <TableCell align="right">
                  <TableSortLabel
                    active={orderBy === 'averagePrice'}
                    direction={orderBy === 'averagePrice' ? order : 'desc'}
                    onClick={() => handleRequestSort('averagePrice')}
                    sx={{
                      color: netflixLightGray,
                      '&:hover': { color: netflixRed },
                      '&.Mui-active': { color: netflixRed }
                    }}
                  >
                    Avg. Price
                  </TableSortLabel>
                </TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={6} align="center" sx={{ py: 4 }}>
                    <CircularProgress size={24} sx={{ color: netflixRed }} />
                    <Typography variant="body2" sx={{ mt: 1, color: netflixLightGray }}>
                      Loading products...
                    </Typography>
                  </TableCell>
                </TableRow>
              ) : paginatedData.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} align="center" sx={{ py: 4, color: netflixLightGray }}>
                    No products found matching your criteria
                  </TableCell>
                </TableRow>
              ) : (
                paginatedData.map((row) => (
                  <TableRow 
                    key={row.id}
                    sx={{ 
                      '&:nth-of-type(odd)': {
                        backgroundColor: 'rgba(255, 255, 255, 0.02)'
                      },
                      '&:hover': {
                        backgroundColor: 'rgba(229, 9, 20, 0.05)'
                      }
                    }}
                  >
                    <TableCell sx={{ 
                    color: netflixLightGray,
                    minWidth: '150px',
                    '@media (max-width: 600px)': {
                      minWidth: '120px',
                      paddingLeft: '16px'
                    }
                  }}>
                    <Box sx={{ 
                      display: 'flex',
                      flexDirection: 'column',
                      '& .product-name': {
                        whiteSpace: 'normal',
                        wordBreak: 'break-word',
                        lineHeight: 1.3
                      },
                      '& .product-category': {
                        display: 'none',
                        '@media (max-width: 960px)': {
                          display: 'block',
                          fontSize: '0.75rem',
                          opacity: 0.8,
                          mt: 0.5
                        }
                      }
                    }}>
                      <span className="product-name">{row.productName}</span>
                      <span className="product-category">{row.category}</span>
                    </Box>
                  </TableCell>
                    <TableCell sx={{ '@media (max-width: 960px)': { display: 'none' } }}>
                      <Chip 
                        label={row.category} 
                        size="small" 
                        sx={{
                          backgroundColor: 'rgba(255, 255, 255, 0.1)',
                          color: netflixLightGray,
                          fontWeight: 500,
                          maxWidth: '120px',
                          textOverflow: 'ellipsis',
                          overflow: 'hidden',
                          whiteSpace: 'nowrap',
                          display: 'block'
                        }}
                      />
                    </TableCell>
                    <TableCell align="right" sx={{ 
                      color: netflixLightGray,
                      '@media (max-width: 600px)': {
                        paddingRight: '16px'
                      }
                    }}>
                      <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end' }}>
                        <span>{row.quantitySold.toLocaleString()}</span>
                        <span style={{ 
                          fontSize: '0.7rem',
                          opacity: 0.8,
                          display: 'none',
                          '@media (max-width: 600px)': {
                            display: 'block'
                          }
                        }}>
                          sold
                        </span>
                      </Box>
                    </TableCell>
                    <TableCell align="right" sx={{ 
                      '@media (max-width: 600px)': {
                        display: 'none'
                      }
                    }}>
                      <Tooltip title={`${row.currentStock || 0} items remaining`} arrow>
                        <Box 
                          sx={{
                            display: 'inline-flex',
                            alignItems: 'center',
                            bgcolor: (row.currentStock || 0) < 10 
                              ? 'rgba(229, 9, 20, 0.15)' 
                              : (row.currentStock || 0) < 50 
                                ? 'rgba(255, 165, 0, 0.15)' 
                                : 'rgba(0, 168, 98, 0.15)',
                            color: (row.currentStock || 0) < 10 
                              ? netflixRed 
                              : (row.currentStock || 0) < 50 
                                ? '#ffa500' 
                                : '#00a862',
                            px: 1.5,
                            py: 0.5,
                            borderRadius: 1,
                            fontWeight: 600,
                            fontSize: '0.8125rem',
                            minWidth: 60,
                            justifyContent: 'center',
                            borderLeft: `3px solid ${(row.currentStock || 0) < 10 
                              ? netflixRed 
                              : (row.currentStock || 0) < 50 
                                ? '#ffa500' 
                                : '#00a862'}`
                          }}
                        >
                          {row.currentStock || 0}
                        </Box>
                      </Tooltip>
                    </TableCell>
                    <TableCell align="right" sx={{ 
                      color: netflixLightGray,
                      fontWeight: 600
                    }}>
                      {formatCurrency(row.totalRevenue)}
                    </TableCell>
                    <TableCell align="right" sx={{ color: netflixLightGray }}>
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
          mt: 2,
          gap: 2
        }}>
          <Box sx={{ 
            display: 'flex', 
            alignItems: 'center',
            color: netflixLightGray,
            fontSize: '0.875rem',
            order: { xs: 2, sm: 1 }
          }}>
            Showing {page * rowsPerPage + 1}-{Math.min((page + 1) * rowsPerPage, sortedData.length)} of {sortedData.length} items
          </Box>
          <Box sx={{ 
            order: { xs: 1, sm: 2 },
            width: '100%',
            maxWidth: { xs: '100%', sm: 'auto' },
            '& .MuiTablePagination-root': {
              width: '100%',
              margin: 0,
              padding: 0,
              '& .MuiTablePagination-toolbar': {
                padding: 0,
                flexWrap: 'wrap',
                justifyContent: 'center',
                gap: 1
              },
              '& .MuiTablePagination-selectRoot': {
                margin: 0
              },
              '& .MuiTablePagination-displayedRows': {
                margin: 0
              }
            }
          }}>
            <TablePagination
              rowsPerPageOptions={[5, 10, 25]}
              component="div"
              count={sortedData.length}
              rowsPerPage={rowsPerPage}
              page={page}
              onPageChange={handleChangePage}
              onRowsPerPageChange={handleChangeRowsPerPage}
              sx={{
                color: netflixLightGray,
                '& .MuiTablePagination-select, & .MuiTablePagination-selectLabel, & .MuiTablePagination-displayedRows': {
                  color: netflixLightGray,
                  margin: 0,
                  fontSize: { xs: '0.75rem', sm: '0.875rem' }
                },
                '& .MuiSvgIcon-root': {
                  color: netflixLightGray,
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
                  color: netflixLightGray,
                  '&:before': {
                    borderColor: 'rgba(255, 255, 255, 0.23)'
                  },
                  '&:hover:not(.Mui-disabled):before': {
                    borderColor: netflixLightGray
                  },
                  '&:after': {
                    borderColor: netflixRed
                  },
                  '& .MuiSvgIcon-root': {
                    color: netflixLightGray
                  }
                },
                '& .MuiSelect-select': {
                  padding: '8px 24px 8px 8px',
    </Box>
  </Tooltip>
</TableCell>
<TableCell align="right" sx={{ 
  color: netflixLightGray,
  fontWeight: 600
}}>
  {formatCurrency(row.totalRevenue)}
</TableCell>
<TableCell align="right" sx={{ color: netflixLightGray }}>
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
  mt: 2,
  gap: 2
}}>
  <Box sx={{ 
    display: 'flex', 
    alignItems: 'center',
    color: netflixLightGray,
    fontSize: '0.875rem',
    order: { xs: 2, sm: 1 }
  }}>
    Showing {page * rowsPerPage + 1}-{Math.min((page + 1) * rowsPerPage, sortedData.length)} of {sortedData.length} items
  </Box>
  <Box sx={{ 
    order: { xs: 1, sm: 2 },
    width: '100%',
    maxWidth: { xs: '100%', sm: 'auto' },
    '& .MuiTablePagination-root': {
      width: '100%',
      margin: 0,
      padding: 0,
      '& .MuiTablePagination-toolbar': {
        padding: 0,
        flexWrap: 'wrap',
        justifyContent: 'center',
        gap: 1
      },
      '& .MuiTablePagination-selectRoot': {
        margin: 0
      },
      '& .MuiTablePagination-displayedRows': {
        margin: 0
      }
    }
  }}>
    <TablePagination
      rowsPerPageOptions={[5, 10, 25]}
      component="div"
      count={sortedData.length}
      rowsPerPage={rowsPerPage}
      page={page}
      onPageChange={handleChangePage}
      onRowsPerPageChange={handleChangeRowsPerPage}
      sx={{
        color: netflixLightGray,
        '& .MuiTablePagination-select, & .MuiTablePagination-selectLabel, & .MuiTablePagination-displayedRows': {
          color: netflixLightGray,
          margin: 0,
          fontSize: { xs: '0.75rem', sm: '0.875rem' }
        },
        '& .MuiSvgIcon-root': {
          color: netflixLightGray,
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
          color: netflixLightGray,
          '&:before': {
            borderColor: 'rgba(255, 255, 255, 0.23)'
          },
          '&:hover:not(.Mui-disabled):before': {
            borderColor: netflixLightGray
          },
          '&:after': {
            borderColor: netflixRed
          },
          '& .MuiSvgIcon-root': {
            color: netflixLightGray
          }
        },
        '& .MuiSelect-select': {
          padding: '8px 24px 8px 8px',
          fontSize: { xs: '0.75rem', sm: '0.875rem' }
        }
      }}
    />
  </Box>
</Box>
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