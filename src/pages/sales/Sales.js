import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Button,
  Paper,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Grid,
  Alert,
  CircularProgress,
  InputAdornment,
  Card,
  Chip,
  useTheme,
  alpha,
  Collapse,
  FormHelperText
} from '@mui/material';
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Visibility as VisibilityIcon,
  FilterList as FilterListIcon,
  ShoppingCart as ShoppingCartIcon,
  CalendarToday as CalendarTodayIcon
} from '@mui/icons-material';
import { useResponsive, responsiveStyles } from '../../styles/responsive';
import ResponsiveTable from '../../components/tables/ResponsiveTable';
import { 
  getStockOuts, 
  createStockOut, 
  updateStockOut, 
  deleteStockOut, 
  getProducts,
  getTodaySales
} from '../../utils/api';
import { useFormik } from 'formik';
import * as Yup from 'yup';
import { formatCurrency } from '../../utils/formatters';
import moment from 'moment';

const Sales = () => {
  const theme = useTheme();
  const { isMobile, isSmallMobile } = useResponsive();
  const [stockOuts, setStockOuts] = useState([]);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [openDialog, setOpenDialog] = useState(false);
  const [dialogType, setDialogType] = useState('add'); // 'add' or 'edit'
  const [currentStockOut, setCurrentStockOut] = useState(null);
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');
  const [detailsOpen, setDetailsOpen] = useState(false);
  const [filtersOpen, setFiltersOpen] = useState(false);
  const [todaySalesSummary, setTodaySalesSummary] = useState(null);
  
  // Sales stats for dashboard
  const [salesStats, setSalesStats] = useState({
    todayCount: 0,
    todayTotal: 0,
    monthlyCount: 0,
    monthlyTotal: 0,
  });

  // Filter states
  const [filters, setFilters] = useState({
    startDate: moment().format('YYYY-MM-DD'),
    endDate: moment().format('YYYY-MM-DD'),
    product: '',
    customer: ''
  });

  useEffect(() => {
    fetchData();
  }, []);  // eslint-disable-line react-hooks/exhaustive-deps
  
  // Update sales stats whenever stockOuts change
  useEffect(() => {
    if (stockOuts.length > 0) {
      // Get today's date in YYYY-MM-DD format
      const today = moment().format('YYYY-MM-DD');
      const currentMonth = moment().format('YYYY-MM');
      
      const todaySales = stockOuts.filter(sale => 
        moment(sale.date).format('YYYY-MM-DD') === today
      );
      
      const monthlySales = stockOuts.filter(sale => 
        moment(sale.date).format('YYYY-MM') === currentMonth
      );
      
      const stats = {
        todayCount: todaySales.length,
        todayTotal: todaySales.reduce((sum, sale) => sum + (sale.sellingPrice * sale.quantity), 0),
        monthlyCount: monthlySales.length,
        monthlyTotal: monthlySales.reduce((sum, sale) => sum + (sale.sellingPrice * sale.quantity), 0)
      };
      
      setSalesStats(stats);
    }
  }, [stockOuts]);

  const fetchData = async () => {
    try {
      setLoading(true);
      // Fetch all required data in parallel
      const [stockOutResponse, productsResponse, todaySalesResponse] = await Promise.all([
        getStockOuts(filters),
        getProducts(),
        getTodaySales()
      ]);
      
      setStockOuts(stockOutResponse.data);
      setProducts(productsResponse.data);
      setTodaySalesSummary(todaySalesResponse);
      setLoading(false);
    } catch (err) {
      console.error('Error fetching data:', err);
      setError('Failed to load data. Please try again later.');
      setLoading(false);
    }
  };

  // Form validation schema
  const validationSchema = Yup.object({
    product: Yup.string()
      .required('Product is required')
      .test('valid-product', 'Please select a valid product', function(value) {
        // Check if product exists in products array
        return products.some(p => p._id === value);
      })
      .test('in-stock', 'This product is out of stock', function(value) {
        if (dialogType === 'add') {
          const product = products.find(p => p._id === value);
          return product ? product.currentStock > 0 : false;
        }
        return true;
      }),
    quantity: Yup.number().positive('Quantity must be positive').required('Quantity is required'),
    salePrice: Yup.number().positive('Sale price must be positive').required('Sale price is required'),
    customer: Yup.string(),
    saleDate: Yup.date().required('Sale date is required')
  });

  // Initialize formik
  const formik = useFormik({
    initialValues: {
      product: '',
      quantity: '',
      salePrice: '',
      totalAmount: '',
      customer: '',
      saleDate: moment().format('YYYY-MM-DD'),
      notes: ''
    },
    validationSchema,
    onSubmit: async (values) => {
      try {
        // Calculate total amount if not provided
        if (!values.totalAmount) {
          values.totalAmount = values.quantity * values.salePrice;
        }

        if (dialogType === 'add') {
          await createStockOut(values);
          setSuccessMessage('Sale record added successfully');
        } else {
          await updateStockOut(currentStockOut._id, values);
          setSuccessMessage('Sale record updated successfully');
        }
        setOpenDialog(false);
        fetchData();
        formik.resetForm();
        
        // Clear success message after 3 seconds
        setTimeout(() => {
          setSuccessMessage('');
        }, 3000);
      } catch (err) {
        console.error('Error saving sale record:', err);
        setError(err.response?.data?.message || 'Failed to save sale record');
      }
    }
  });

  // Watch quantity and sale price to calculate total amount
  useEffect(() => {
    if (formik.values.quantity && formik.values.salePrice) {
      const total = formik.values.quantity * formik.values.salePrice;
      formik.setFieldValue('totalAmount', total);
    }
  }, [formik.values.quantity, formik.values.salePrice, formik]);

  // Set product's default sale price when product is selected
  useEffect(() => {
    if (formik.values.product && products.length > 0) {
      const selectedProduct = products.find(p => p._id === formik.values.product);
      if (selectedProduct && !formik.values.salePrice) {
        formik.setFieldValue('salePrice', selectedProduct.unitPrice);
      }
    }
  }, [formik.values.product, products, formik]);

  const handleAddClick = () => {
    setDialogType('add');
    formik.resetForm();
    // Set default values
    formik.setValues({
      product: '',
      quantity: '',
      salePrice: '',
      totalAmount: '',
      customer: '',
      saleDate: moment().format('YYYY-MM-DD'),
      notes: ''
    });
    setOpenDialog(true);
  };

  const handleEditClick = (stockOut) => {
    setDialogType('edit');
    setCurrentStockOut(stockOut);
    formik.setValues({
      product: stockOut.product._id,
      quantity: stockOut.quantity.toString(),
      salePrice: stockOut.salePrice.toString(),
      totalAmount: stockOut.totalAmount.toString(),
      customer: stockOut.customer || '',
      saleDate: moment(stockOut.saleDate).format('YYYY-MM-DD'),
      notes: stockOut.notes || ''
    });
    setOpenDialog(true);
  };

  const handleDeleteClick = (stockOut) => {
    setCurrentStockOut(stockOut);
    setDeleteConfirmOpen(true);
  };

  const handleDeleteConfirm = async () => {
    try {
      await deleteStockOut(currentStockOut._id);
      setSuccessMessage('Sale record deleted successfully');
      fetchData();
      setDeleteConfirmOpen(false);
      
      // Clear success message after 3 seconds
      setTimeout(() => {
        setSuccessMessage('');
      }, 3000);
    } catch (err) {
      console.error('Error deleting sale record:', err);
      setError(err.response?.data?.message || 'Failed to delete sale record');
      setDeleteConfirmOpen(false);
    }
  };

  const handleViewDetails = (stockOut) => {
    setCurrentStockOut(stockOut);
    setDetailsOpen(true);
  };

  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters({
      ...filters,
      [name]: value
    });
  };

  const applyFilters = () => {
    fetchData();
    setFiltersOpen(false);
  };

  const resetFilters = () => {
    setFilters({
      startDate: moment().format('YYYY-MM-DD'),
      endDate: moment().format('YYYY-MM-DD'),
      product: '',
      customer: ''
    });
  };

  const findProductStock = (productId) => {
    const product = products.find(p => p._id === productId);
    return product ? product.currentStock : 0;
  };

  // Prepare table columns and data for the ResponsiveTable component
  const columns = [
    { 
      field: 'date', 
      headerName: 'Date', 
      renderCell: (row) => (
        <Typography variant="body2">
          {moment(row.date).format('DD/MM/YYYY')}
        </Typography>
      )
    },
    { 
      field: 'product', 
      headerName: 'Product', 
      primary: true,
      renderCell: (row) => (
        <Typography 
          variant="body2" 
          sx={{
            fontWeight: 'medium',
            whiteSpace: 'nowrap',
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            maxWidth: { xs: '120px', sm: '200px', md: 'none' }
          }}
        >
          {row.product.name} {/* Changed from row.productName to row.product.name */}
        </Typography>
      )
    },
    { 
      field: 'quantity', 
      headerName: 'Qty', 
      align: 'right',
      renderCell: (row) => row.quantity
    },
    { 
      field: 'salePrice', 
      headerName: 'Price', 
      align: 'right',
      renderCell: (row) => formatCurrency(row.salePrice) /* Changed from row.sellingPrice to row.salePrice */
    },
    { 
      field: 'totalAmount', 
      headerName: 'Total', 
      align: 'right',
      renderCell: (row) => formatCurrency(row.totalAmount) /* Changed to use row.totalAmount directly */
    },
    { 
      field: 'customer', 
      headerName: 'Customer',
      hideOnMobile: isSmallMobile,
      renderCell: (row) => row.customer || 'Walk-in'
    },
    { 
      field: 'actions', 
      headerName: 'Actions', 
      align: 'center',
      renderCell: (row) => (
        <Box sx={{ display: 'flex', gap: '4px', justifyContent: 'center' }}>
          <IconButton 
            onClick={() => handleViewDetails(row)} 
            size="small"
            sx={{
              ...responsiveStyles.touchFriendly,
              minWidth: { xs: '36px', sm: '40px' },
              minHeight: { xs: '36px', sm: '40px' },
              p: { xs: 0.5, sm: 1 }
            }}
          >
            <VisibilityIcon fontSize="small" />
          </IconButton>
          <IconButton 
            onClick={() => handleEditClick(row)} 
            size="small"
            sx={{
              ...responsiveStyles.touchFriendly,
              minWidth: { xs: '36px', sm: '40px' },
              minHeight: { xs: '36px', sm: '40px' },
              p: { xs: 0.5, sm: 1 }
            }}
          >
            <EditIcon fontSize="small" />
          </IconButton>
          <IconButton 
            onClick={() => handleDeleteClick(row)} 
            size="small" 
            color="error"
            sx={{
              ...responsiveStyles.touchFriendly,
              minWidth: { xs: '36px', sm: '40px' },
              minHeight: { xs: '36px', sm: '40px' },
              p: { xs: 0.5, sm: 1 }
            }}
          >
            <DeleteIcon fontSize="small" />
          </IconButton>
        </Box>
      )
    }
  ];

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '80vh' }}>
        <CircularProgress color="primary" size={isMobile ? 40 : 60} thickness={4} />
      </Box>
    );
  }

  return (
    <Box sx={{ flexGrow: 1 }}>
      {/* Header - More responsive with better spacing for mobile */}
      <Box sx={{ 
        display: 'flex', 
        flexDirection: { xs: 'column', sm: 'row' },
        justifyContent: 'space-between', 
        alignItems: { xs: 'flex-start', sm: 'center' }, 
        gap: { xs: 1, sm: 0 },
        mb: { xs: 2, sm: 3 } 
      }}>
        <Typography 
          variant="h4" 
          component="h1"
          sx={{ 
            fontSize: { xs: '1.5rem', sm: '1.75rem', md: '2rem' },
            mb: { xs: 0.5, sm: 0 }
          }}
        >
          Sales
        </Typography>
        <Box sx={{
          display: 'flex',
          gap: { xs: 1, sm: 2 },
          width: { xs: '100%', sm: 'auto' },
          flexWrap: 'wrap',
          justifyContent: { xs: 'space-between', sm: 'flex-end' },
        }}>
          <Button 
            variant="outlined" 
            startIcon={<FilterListIcon />}
            onClick={() => setFiltersOpen(!filtersOpen)}
            sx={{
              ...responsiveStyles.touchFriendly,
              textTransform: 'none',
              minHeight: { xs: '40px', sm: '44px' },
              flex: { xs: '1 1 0', sm: '0 0 auto' },
              px: { xs: 1, sm: 1.5 }
            }}
          >
            Filters
          </Button>
          <Button 
            variant="contained" 
            startIcon={<AddIcon />}
            onClick={handleAddClick}
            sx={{
              ...responsiveStyles.touchFriendly,
              textTransform: 'none',
              minHeight: { xs: '40px', sm: '44px' },
              flex: { xs: '1 1 0', sm: '0 0 auto' },
              px: { xs: 1, sm: 1.5 }
            }}
          >
            Add Sale
          </Button>
        </Box>
      </Box>
      
      {/* Sales Dashboard Cards - New responsive grid layout */}
      <Grid container spacing={{ xs: 1, sm: 2 }} sx={{ mb: { xs: 2, sm: 3 } }}>
        <Grid item xs={6} sm={6}>
          <Card sx={responsiveStyles.netflixMobileCard}>
            <Box sx={{ p: { xs: 1.5, sm: 2 }, display: 'flex', alignItems: 'center' }}>
              <ShoppingCartIcon sx={{ color: theme.palette.primary.main, mr: 1.5, fontSize: { xs: '1.5rem', sm: '2rem' } }} />
              <Box>
                <Typography variant="body2" color="text.secondary" sx={{ mb: 0.5 }}>
                  Today's Sales
                </Typography>
                <Typography 
                  variant="h5" 
                  sx={{ 
                    fontWeight: 'bold',
                    fontSize: { xs: '1.25rem', sm: '1.5rem' }
                  }}
                >
                  {salesStats.todayCount}
                </Typography>
              </Box>
            </Box>
          </Card>
        </Grid>
        <Grid item xs={6} sm={6}>
          <Card sx={responsiveStyles.netflixMobileCard}>
            <Box sx={{ p: { xs: 1.5, sm: 2 }, display: 'flex', alignItems: 'center' }}>
              <CalendarTodayIcon sx={{ color: theme.palette.primary.main, mr: 1.5, fontSize: { xs: '1.5rem', sm: '2rem' } }} />
              <Box>
                <Typography variant="body2" color="text.secondary" sx={{ mb: 0.5 }}>
                  Monthly Sales
                </Typography>
                <Typography 
                  variant="h5" 
                  sx={{ 
                    fontWeight: 'bold',
                    fontSize: { xs: '1.25rem', sm: '1.5rem' }
                  }}
                >
                  {salesStats.monthlyCount}
                </Typography>
              </Box>
            </Box>
          </Card>
        </Grid>
      </Grid>

      {/* Today's Sales Summary */}
      {todaySalesSummary && (
        <Paper sx={{ p: 2, mb: 3 }}>
          <Grid container spacing={2}>
            <Grid item xs={12} md={4}>
              <Typography variant="h6" gutterBottom>
                Today's Sales
              </Typography>
              <Typography variant="h4" sx={{ fontWeight: 'medium', color: 'primary.main' }}>
                {formatCurrency(todaySalesSummary.totalRevenue)}
              </Typography>
            </Grid>
            <Grid item xs={12} md={4}>
              <Typography variant="h6" gutterBottom>
                Items Sold
              </Typography>
              <Typography variant="h4" sx={{ fontWeight: 'medium' }}>
                {todaySalesSummary.count}
              </Typography>
            </Grid>
            <Grid item xs={12} md={4}>
              <Typography variant="h6" gutterBottom>
                Date
              </Typography>
              <Typography variant="h6">
                {moment().format('MMMM D, YYYY')}
              </Typography>
            </Grid>
          </Grid>
        </Paper>
      )}

      {/* Success message */}
      {successMessage && (
        <Alert 
          severity="success" 
          sx={{ 
            mb: 2,
            '& .MuiAlert-message': {
              fontSize: { xs: '0.875rem', sm: '1rem' }
            }
          }}
        >
          {successMessage}
        </Alert>
      )}

      {/* Error message */}
      {error && (
        <Alert 
          severity="error" 
          sx={{ 
            mb: 2,
            '& .MuiAlert-message': {
              fontSize: { xs: '0.875rem', sm: '1rem' }
            }
          }}
        >
          {error}
        </Alert>
      )}

      {/* Sales Table - Using our responsive table component */}
      <Paper
        elevation={0}
        sx={{
          background: alpha(theme.palette.background.paper, 0.4),
          p: { xs: 1, sm: 2 },
          borderRadius: { xs: 1, sm: 2 }
        }}
      >
        <ResponsiveTable 
          columns={columns}
          rows={stockOuts}
          emptyMessage="No sales found. Add your first sale!"
          isLoading={loading}
        />
      </Paper>

      {/* Add/Edit Sale Dialog */}
      <Dialog open={openDialog} onClose={() => setOpenDialog(false)} maxWidth="md" fullWidth>
        <DialogTitle>{dialogType === 'add' ? 'Record New Sale' : 'Edit Sale Record'}</DialogTitle>
        <form onSubmit={formik.handleSubmit}>
          <DialogContent>
            <Grid container spacing={2}>
              <Grid item xs={12} md={6}>
                <FormControl fullWidth margin="dense" error={formik.touched.product && Boolean(formik.errors.product)}>
                  <InputLabel>Product</InputLabel>
                  <Select
                    id="product"
                    name="product"
                    value={formik.values.product}
                    onChange={formik.handleChange}
                    onBlur={formik.handleBlur}
                  >
                    {products.map((product) => (
                      <MenuItem 
                        key={product._id} 
                        value={product._id} 
                        disabled={product.currentStock <= 0 && dialogType === 'add'}
                        sx={{
                          display: 'flex',
                          justifyContent: 'space-between',
                          gap: 1
                        }}
                      >
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                          <Typography>{product.name}</Typography>
                          <Typography variant="body2" color="text.secondary">
                            {formatCurrency(product.unitPrice)}
                          </Typography>
                        </Box>
                        <Chip 
                          size="small"
                          label={`Stock: ${product.currentStock}`}
                          color={product.currentStock <= 0 ? 'error' : 
                                 product.currentStock <= product.minStockLevel ? 'warning' : 'success'}
                        />
                      </MenuItem>
                    ))}
                  </Select>
                  {formik.touched.product && formik.errors.product && (
                    <FormHelperText error>{formik.errors.product}</FormHelperText>
                  )}
                </FormControl>
              </Grid>
              
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  margin="dense"
                  id="quantity"
                  name="quantity"
                  label="Quantity"
                  type="number"
                  value={formik.values.quantity}
                  onChange={formik.handleChange}
                  error={formik.touched.quantity && Boolean(formik.errors.quantity)}
                  helperText={
                    (formik.touched.quantity && formik.errors.quantity) ||
                    (formik.values.product && dialogType === 'add' 
                      ? `Available: ${findProductStock(formik.values.product)}` 
                      : '')
                  }
                  inputProps={{ 
                    min: "1", 
                    max: dialogType === 'add' && formik.values.product ? findProductStock(formik.values.product) : undefined 
                  }}
                />
              </Grid>
              
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  margin="dense"
                  id="salePrice"
                  name="salePrice"
                  label="Sale Price"
                  type="number"
                  value={formik.values.salePrice}
                  onChange={formik.handleChange}
                  error={formik.touched.salePrice && Boolean(formik.errors.salePrice)}
                  helperText={formik.touched.salePrice && formik.errors.salePrice}
                  InputProps={{
                    startAdornment: <InputAdornment position="start">$</InputAdornment>,
                    inputProps: { step: "0.01", min: "0" }
                  }}
                />
              </Grid>
              
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  margin="dense"
                  id="totalAmount"
                  name="totalAmount"
                  label="Total Amount"
                  type="number"
                  value={formik.values.totalAmount}
                  InputProps={{
                    readOnly: true,
                    startAdornment: <InputAdornment position="start">$</InputAdornment>
                  }}
                />
              </Grid>
              
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  margin="dense"
                  id="customer"
                  name="customer"
                  label="Customer (Optional)"
                  value={formik.values.customer}
                  onChange={formik.handleChange}
                  error={formik.touched.customer && Boolean(formik.errors.customer)}
                  helperText={formik.touched.customer && formik.errors.customer}
                />
              </Grid>
              
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  margin="dense"
                  id="saleDate"
                  name="saleDate"
                  label="Sale Date"
                  type="date"
                  value={formik.values.saleDate}
                  onChange={formik.handleChange}
                  error={formik.touched.saleDate && Boolean(formik.errors.saleDate)}
                  helperText={formik.touched.saleDate && formik.errors.saleDate}
                  InputLabelProps={{
                    shrink: true,
                  }}
                />
              </Grid>
              
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  margin="dense"
                  id="notes"
                  name="notes"
                  label="Notes (Optional)"
                  multiline
                  rows={2}
                  value={formik.values.notes}
                  onChange={formik.handleChange}
                />
              </Grid>
            </Grid>
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setOpenDialog(false)}>Cancel</Button>
            <Button 
              type="submit" 
              variant="contained"
              disabled={dialogType === 'add' && formik.values.product && 
                formik.values.quantity > findProductStock(formik.values.product)}
            >
              {dialogType === 'add' ? 'Record Sale' : 'Update'}
            </Button>
          </DialogActions>
        </form>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog open={deleteConfirmOpen} onClose={() => setDeleteConfirmOpen(false)}>
        <DialogTitle>Confirm Delete</DialogTitle>
        <DialogContent>
          <Typography>
            Are you sure you want to delete this sale record? This action cannot be undone.
          </Typography>
          <Typography color="error" sx={{ mt: 2 }}>
            Warning: This will also update the product's stock quantity.
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteConfirmOpen(false)}>Cancel</Button>
          <Button onClick={handleDeleteConfirm} variant="contained" color="error">
            Delete
          </Button>
        </DialogActions>
      </Dialog>

      {/* Sale Details Dialog */}
      <Dialog open={detailsOpen} onClose={() => setDetailsOpen(false)} maxWidth="md" fullWidth>
        <DialogTitle>Sale Details</DialogTitle>
        <DialogContent>
          {currentStockOut && (
            <Box>
              <Paper sx={{ p: 2, mb: 2 }}>
                <Grid container spacing={2}>
                  <Grid item xs={12} md={6}>
                    <Typography variant="body1" gutterBottom>
                      <strong>Product:</strong> {currentStockOut.product.name}
                    </Typography>
                    <Typography variant="body1" gutterBottom>
                      <strong>Quantity:</strong> {currentStockOut.quantity}
                    </Typography>
                    <Typography variant="body1" gutterBottom>
                      <strong>Sale Price:</strong> {formatCurrency(currentStockOut.salePrice)}
                    </Typography>
                    <Typography variant="body1" gutterBottom>
                      <strong>Total Amount:</strong> {formatCurrency(currentStockOut.totalAmount)}
                    </Typography>
                  </Grid>
                  <Grid item xs={12} md={6}>
                    <Typography variant="body1" gutterBottom>
                      <strong>Customer:</strong> {currentStockOut.customer || 'Not specified'}
                    </Typography>
                    <Typography variant="body1" gutterBottom>
                      <strong>Sale Date:</strong> {moment(currentStockOut.saleDate).format('MMMM D, YYYY, h:mm A')}
                    </Typography>
                    {currentStockOut.notes && (
                      <Typography variant="body1" gutterBottom>
                        <strong>Notes:</strong> {currentStockOut.notes}
                      </Typography>
                    )}
                  </Grid>
                  <Grid item xs={12}>
                    <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                      <strong>Created By:</strong> {currentStockOut.createdBy ? currentStockOut.createdBy.name : 'Unknown'}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      <strong>Created At:</strong> {moment(currentStockOut.createdAt).format('MMMM D, YYYY, h:mm A')}
                    </Typography>
                  </Grid>
                </Grid>
              </Paper>
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDetailsOpen(false)}>Close</Button>
        </DialogActions>
      </Dialog>

      {/* Filters Dialog */}
      <Dialog open={filtersOpen} onClose={() => setFiltersOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Filter Sales Records</DialogTitle>
        <DialogContent>
          <Grid container spacing={2}>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                margin="dense"
                id="startDate"
                name="startDate"
                label="Start Date"
                type="date"
                value={filters.startDate}
                onChange={handleFilterChange}
                InputLabelProps={{
                  shrink: true,
                }}
              />
            </Grid>
            
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                margin="dense"
                id="endDate"
                name="endDate"
                label="End Date"
                type="date"
                value={filters.endDate}
                onChange={handleFilterChange}
                InputLabelProps={{
                  shrink: true,
                }}
              />
            </Grid>
            
            <Grid item xs={12} md={6}>
              <FormControl fullWidth margin="dense">
                <InputLabel>Product</InputLabel>
                <Select
                  id="product"
                  name="product"
                  value={filters.product}
                  onChange={handleFilterChange}
                >
                  <MenuItem value="">All Products</MenuItem>
                  {products.map((product) => (
                    <MenuItem key={product._id} value={product._id}>
                      {product.name}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                margin="dense"
                id="customer"
                name="customer"
                label="Customer"
                value={filters.customer}
                onChange={handleFilterChange}
                placeholder="Enter customer name"
              />
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={resetFilters}>Reset</Button>
          <Button onClick={() => setFiltersOpen(false)}>Cancel</Button>
          <Button onClick={applyFilters} variant="contained">
            Apply Filters
          </Button>
        </DialogActions>
      </Dialog>

      {/* Filters - Enhanced for mobile */}
      <Collapse in={filtersOpen}>
        <Paper 
          sx={{ 
            p: { xs: 1.5, sm: 2 }, 
            mb: { xs: 2, sm: 3 },
            borderRadius: { xs: 1, sm: 2 },
            background: alpha(theme.palette.background.paper, 0.4),
          }}
        >
          <Grid container spacing={2}>
            <Grid item xs={12} sm={6} md={3}>
              <TextField
                fullWidth
                label="Start Date"
                type="date"
                value={filters.startDate}
                onChange={e => setFilters({...filters, startDate: e.target.value})}
                InputLabelProps={{ shrink: true }}
                InputProps={{
                  sx: { 
                    borderRadius: '8px',
                    minHeight: { xs: '48px', sm: '56px' }
                  }
                }}
              />
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <TextField
                fullWidth
                label="End Date"
                type="date"
                value={filters.endDate}
                onChange={e => setFilters({...filters, endDate: e.target.value})}
                InputLabelProps={{ shrink: true }}
                InputProps={{
                  sx: { 
                    borderRadius: '8px',
                    minHeight: { xs: '48px', sm: '56px' }
                  }
                }}
              />
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <FormControl fullWidth>
                <InputLabel>Product</InputLabel>
                <Select
                  value={filters.product}
                  onChange={e => setFilters({...filters, product: e.target.value})}
                  sx={{ 
                    borderRadius: '8px',
                    minHeight: { xs: '48px', sm: '56px' }
                  }}
                  MenuProps={{
                    PaperProps: {
                      sx: {
                        background: alpha('#1a1a1a', 0.95),
                        backdropFilter: 'blur(10px)',
                        border: `1px solid ${alpha('#ffffff', 0.1)}`,
                        borderRadius: '8px',
                        boxShadow: '0 8px 20px rgba(0,0,0,0.5)',
                        maxHeight: { xs: '300px', sm: '400px' },
                        '& .MuiMenuItem-root': {
                          minHeight: '44px', // Touch-friendly height
                          '&:hover': {
                            backgroundColor: alpha('#ffffff', 0.1)
                          }
                        }
                      }
                    }
                  }}
                >
                  <MenuItem value="">All Products</MenuItem>
                  {products.map(product => (
                    <MenuItem key={product._id} value={product._id}>
                      {product.name}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <TextField
                fullWidth
                label="Customer"
                value={filters.customer}
                onChange={e => setFilters({...filters, customer: e.target.value})}
                InputProps={{
                  sx: { 
                    borderRadius: '8px',
                    minHeight: { xs: '48px', sm: '56px' }
                  }
                }}
              />
            </Grid>
            <Grid item xs={12} sx={{ mt: { xs: 1, sm: 2 } }}>
              <Button 
                variant="contained" 
                onClick={fetchData} 
                sx={{ 
                  mr: { xs: 1, sm: 2 },
                  ...responsiveStyles.touchFriendly,
                  textTransform: 'none',
                  minHeight: { xs: '40px', sm: '44px' },
                  px: { xs: 2, sm: 3 },
                  borderRadius: '8px',
                }}
              >
                Apply Filters
              </Button>
              <Button 
                variant="outlined" 
                onClick={() => {
                  setFilters({
                    startDate: moment().format('YYYY-MM-DD'),
                    endDate: moment().format('YYYY-MM-DD'),
                    product: '',
                    customer: ''
                  });
                  fetchData();
                }}
                sx={{ 
                  ...responsiveStyles.touchFriendly,
                  textTransform: 'none',
                  minHeight: { xs: '40px', sm: '44px' },
                  px: { xs: 2, sm: 3 },
                  borderRadius: '8px',
                }}
              >
                Reset
              </Button>
            </Grid>
          </Grid>
        </Paper>
      </Collapse>
    </Box>
  );
};

export default Sales;
