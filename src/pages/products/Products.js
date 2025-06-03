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
  MenuItem,
  FormControl,
  InputLabel,
  Select,
  Chip,
  Alert,
  CircularProgress,

  useTheme,
  Grid,
  Card,
  alpha,
  useMediaQuery
} from '@mui/material';
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,

  Visibility as VisibilityIcon
} from '@mui/icons-material';
import { getProducts, createProduct, updateProduct, deleteProduct } from '../../utils/api';
import { useFormik } from 'formik';
import * as Yup from 'yup';
import { formatCurrency } from '../../utils/formatters';
import { useResponsive, responsiveStyles } from '../../styles/responsive';
import ResponsiveTable from '../../components/tables/ResponsiveTable';

const Products = () => {
  const theme = useTheme();
  const { isMobile, isSmallMobile } = useResponsive();
  const fullScreen = useMediaQuery(theme.breakpoints.down('sm'));
  
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [openDialog, setOpenDialog] = useState(false);
  const [dialogType, setDialogType] = useState('add'); // 'add' or 'edit'
  const [currentProduct, setCurrentProduct] = useState(null);
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');
  const [viewDetailsOpen, setViewDetailsOpen] = useState(false);
  const [viewProduct, setViewProduct] = useState(null);
  
  // Stats for dashboard cards
  const [productStats, setProductStats] = useState({
    totalProducts: 0,
    lowStockCount: 0,
    outOfStockCount: 0,
    totalValue: 0
  });

  useEffect(() => {
    fetchProducts();
  }, []);
  
  // Calculate product stats whenever products change
  useEffect(() => {
    if (products.length > 0) {
      const stats = {
        totalProducts: products.length,
        lowStockCount: products.filter(p => p.currentStock > 0 && p.currentStock < p.minStockLevel).length,
        outOfStockCount: products.filter(p => p.currentStock <= 0).length,
        totalValue: products.reduce((sum, product) => sum + (product.unitPrice * product.currentStock), 0)
      };
      setProductStats(stats);
    }
  }, [products]);

  const fetchProducts = async () => {
    try {
      setLoading(true);
      const response = await getProducts();
      setProducts(response.data);
      setLoading(false);
    } catch (err) {
      console.error('Error fetching products:', err);
      setError('Failed to load products. Please try again later.');
      setLoading(false);
    }
  };

  // Define categories for products
  const categories = [
    'Electronics',
    'Clothing',
    'Food',
    'Beverages',
    'Household',
    'Stationery',
    'Other'
  ];

  // Form validation schema
  const validationSchema = Yup.object({
    name: Yup.string().required('Product name is required'),
    category: Yup.string().required('Category is required'),
    unitPrice: Yup.number().positive('Price must be positive').required('Unit price is required'),
    currentStock: Yup.number().min(0, 'Stock cannot be negative').required('Current stock is required'),
    minStockLevel: Yup.number().min(0, 'Minimum stock level cannot be negative').required('Minimum stock level is required')
  });

  // Initialize formik
  const formik = useFormik({
    initialValues: {
      name: '',
      category: '',
      unitPrice: '',
      currentStock: '',
      minStockLevel: '',
      description: ''
    },
    validationSchema,
    onSubmit: async (values) => {
      try {
        if (dialogType === 'add') {
          await createProduct(values);
          setSuccessMessage('Product added successfully');
        } else {
          await updateProduct(currentProduct._id, values);
          setSuccessMessage('Product updated successfully');
        }
        setOpenDialog(false);
        fetchProducts();
        formik.resetForm();
        
        // Clear success message after 3 seconds
        setTimeout(() => {
          setSuccessMessage('');
        }, 3000);
      } catch (err) {
        console.error('Error saving product:', err);
        setError(err.response?.data?.message || 'Failed to save product');
      }
    }
  });

  const handleAddClick = () => {
    setDialogType('add');
    formik.resetForm();
    setOpenDialog(true);
  };

  const handleEditClick = (product) => {
    setDialogType('edit');
    setCurrentProduct(product);
    formik.setValues({
      name: product.name,
      category: product.category,
      unitPrice: product.unitPrice,
      currentStock: product.currentStock,
      minStockLevel: product.minStockLevel,
      description: product.description || ''
    });
    setOpenDialog(true);
  };

  const handleDeleteClick = (product) => {
    setCurrentProduct(product);
    setDeleteConfirmOpen(true);
  };

  const handleDeleteConfirm = async () => {
    try {
      await deleteProduct(currentProduct._id);
      setSuccessMessage('Product deleted successfully');
      fetchProducts();
      setDeleteConfirmOpen(false);
      
      // Clear success message after 3 seconds
      setTimeout(() => {
        setSuccessMessage('');
      }, 3000);
    } catch (err) {
      console.error('Error deleting product:', err);
      setError(err.response?.data?.message || 'Failed to delete product');
      setDeleteConfirmOpen(false);
    }
  };
  
  const handleViewDetails = (product) => {
    setViewProduct(product);
    setViewDetailsOpen(true);
  };

  const getStockStatusColor = (product) => {
    if (product.currentStock <= 0) {
      return 'error';
    } else if (product.currentStock < product.minStockLevel) {
      return 'warning';
    } else {
      return 'success';
    }
  };

  const getStockStatusText = (product) => {
    if (product.currentStock <= 0) {
      return 'Out of Stock';
    } else if (product.currentStock < product.minStockLevel) {
      return 'Low Stock';
    } else {
      return 'In Stock';
    }
  };

  // Prepare table columns and data for the ResponsiveTable component
  const columns = [
    { 
      field: 'name', 
      headerName: 'Name', 
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
          {row.name}
        </Typography>
      )
    },
    { 
      field: 'category', 
      headerName: 'Category',
      hideOnMobile: isSmallMobile
    },
    { 
      field: 'unitPrice', 
      headerName: 'Unit Price', 
      align: 'right',
      renderCell: (row) => formatCurrency(row.unitPrice)
    },
    { 
      field: 'currentStock', 
      headerName: 'Stock', 
      align: 'right',
      renderCell: (row) => (
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end' }}>
          <Typography 
            variant="body2" 
            sx={{ 
              color: row.currentStock <= 0 ? theme.palette.error.main : 
                    row.currentStock < row.minStockLevel ? theme.palette.warning.main : 
                    'inherit'
            }}
          >
            {row.currentStock}
          </Typography>
        </Box>
      )
    },
    { 
      field: 'status', 
      headerName: 'Status',
      renderCell: (row) => (
        <Chip 
          label={getStockStatusText(row)}
          color={getStockStatusColor(row)}
          size="small"
          sx={{
            height: { xs: '24px', sm: '28px' },
            '& .MuiChip-label': {
              px: { xs: 1, sm: 1.5 }
            }
          }}
        />
      )
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
          Products
        </Typography>
        <Button 
          variant="contained" 
          startIcon={<AddIcon />}
          onClick={handleAddClick}
          sx={{
            ...responsiveStyles.touchFriendly,
            textTransform: 'none',
            minHeight: { xs: '40px', sm: '44px' },
            px: { xs: 1.5, sm: 2 }
          }}
        >
          Add Product
        </Button>
      </Box>
      
      {/* Stats Cards - New responsive grid layout */}
      <Grid container spacing={{ xs: 1, sm: 2 }} sx={{ mb: { xs: 2, sm: 3 } }}>
        <Grid item xs={6} sm={6} md={3}>
          <Card sx={responsiveStyles.netflixMobileCard}>
            <Box sx={{ p: { xs: 1.5, sm: 2 } }}>
              <Typography variant="body2" color="text.secondary">
                Total Products
              </Typography>
              <Typography 
                variant="h5" 
                sx={{ 
                  fontWeight: 'bold',
                  fontSize: { xs: '1.25rem', sm: '1.5rem' } 
                }}
              >
                {productStats.totalProducts}
              </Typography>
            </Box>
          </Card>
        </Grid>
        <Grid item xs={6} sm={6} md={3}>
          <Card sx={responsiveStyles.netflixMobileCard}>
            <Box sx={{ p: { xs: 1.5, sm: 2 } }}>
              <Typography variant="body2" color="text.secondary">
                Total Value
              </Typography>
              <Typography 
                variant="h5" 
                sx={{ 
                  fontWeight: 'bold',
                  fontSize: { xs: '1.25rem', sm: '1.5rem' },
                  color: theme.palette.primary.main
                }}
              >
                {formatCurrency(productStats.totalValue)}
              </Typography>
            </Box>
          </Card>
        </Grid>
        <Grid item xs={6} sm={6} md={3}>
          <Card sx={responsiveStyles.netflixMobileCard}>
            <Box sx={{ p: { xs: 1.5, sm: 2 } }}>
              <Typography variant="body2" color="text.secondary">
                Low Stock
              </Typography>
              <Typography 
                variant="h5" 
                sx={{ 
                  fontWeight: 'bold',
                  fontSize: { xs: '1.25rem', sm: '1.5rem' },
                  color: theme.palette.warning.main
                }}
              >
                {productStats.lowStockCount}
              </Typography>
            </Box>
          </Card>
        </Grid>
        <Grid item xs={6} sm={6} md={3}>
          <Card sx={responsiveStyles.netflixMobileCard}>
            <Box sx={{ p: { xs: 1.5, sm: 2 } }}>
              <Typography variant="body2" color="text.secondary">
                Out of Stock
              </Typography>
              <Typography 
                variant="h5" 
                sx={{ 
                  fontWeight: 'bold',
                  fontSize: { xs: '1.25rem', sm: '1.5rem' },
                  color: theme.palette.error.main
                }}
              >
                {productStats.outOfStockCount}
              </Typography>
            </Box>
          </Card>
        </Grid>
      </Grid>

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

      {/* Products Table - Using our new ResponsiveTable component */}
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
          rows={products}
          emptyMessage="No products found. Add your first product!"
          isLoading={loading}
        />
      </Paper>

      {/* Add/Edit Product Dialog - Enhanced for mobile */}
      <Dialog 
        open={openDialog} 
        onClose={() => setOpenDialog(false)} 
        maxWidth="sm" 
        fullWidth
        fullScreen={fullScreen}
        PaperProps={{
          sx: {
            background: alpha('#141414', 0.98), // Netflix-inspired dark background
            backdropFilter: 'blur(10px)',
            borderRadius: fullScreen ? 0 : '8px',
            border: fullScreen ? 'none' : `1px solid ${alpha('#ffffff', 0.1)}`,
            overflow: 'hidden',
            maxHeight: '100%',
            height: fullScreen ? '100%' : 'auto',
            display: 'flex',
            flexDirection: 'column'
          }
        }}
      >
        <DialogTitle sx={{ 
          py: { xs: 1.5, sm: 2 },
          fontSize: { xs: '1.25rem', sm: '1.5rem' },
          borderBottom: `1px solid ${alpha('#ffffff', 0.1)}`
        }}>
          {dialogType === 'add' ? 'Add New Product' : 'Edit Product'}
        </DialogTitle>
        <form onSubmit={formik.handleSubmit} style={{ display: 'flex', flexDirection: 'column', flexGrow: 1 }}>
          <DialogContent sx={{ 
            py: { xs: 1.5, sm: 2 },
            px: { xs: 1.5, sm: 3 },
            display: 'flex',
            flexDirection: 'column',
            gap: { xs: 1.5, sm: 2 },
            flexGrow: 1,
            overflow: 'auto'
          }}>
            <TextField
              fullWidth
              margin="dense"
              id="name"
              name="name"
              label="Product Name"
              value={formik.values.name}
              onChange={formik.handleChange}
              error={formik.touched.name && Boolean(formik.errors.name)}
              helperText={formik.touched.name && formik.errors.name}
              InputProps={{
                sx: { 
                  borderRadius: '8px',
                  minHeight: { xs: '48px', sm: '56px' }
                }
              }}
              sx={{
                '& .MuiFormHelperText-root': {
                  marginLeft: 0
                }
              }}
            />
            
            <FormControl fullWidth margin="dense">
              <InputLabel>Category</InputLabel>
              <Select
                id="category"
                name="category"
                value={formik.values.category}
                onChange={formik.handleChange}
                error={formik.touched.category && Boolean(formik.errors.category)}
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
                {categories.map((category) => (
                  <MenuItem key={category} value={category}>
                    {category}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
            
            <TextField
              fullWidth
              margin="dense"
              id="unitPrice"
              name="unitPrice"
              label="Unit Price (RWF)"
              type="number"
              value={formik.values.unitPrice}
              onChange={formik.handleChange}
              error={formik.touched.unitPrice && Boolean(formik.errors.unitPrice)}
              helperText={formik.touched.unitPrice && formik.errors.unitPrice}
              inputProps={{ step: "1", min: "0" }}
              InputProps={{
                sx: { 
                  borderRadius: '8px',
                  minHeight: { xs: '48px', sm: '56px' }
                }
              }}
              sx={{
                '& .MuiFormHelperText-root': {
                  marginLeft: 0
                }
              }}
            />
            
            <TextField
              fullWidth
              margin="dense"
              id="currentStock"
              name="currentStock"
              label="Current Stock"
              type="number"
              value={formik.values.currentStock}
              onChange={formik.handleChange}
              error={formik.touched.currentStock && Boolean(formik.errors.currentStock)}
              helperText={formik.touched.currentStock && formik.errors.currentStock}
              inputProps={{ min: "0" }}
              InputProps={{
                sx: { 
                  borderRadius: '8px',
                  minHeight: { xs: '48px', sm: '56px' }
                }
              }}
              sx={{
                '& .MuiFormHelperText-root': {
                  marginLeft: 0
                }
              }}
            />
            
            <TextField
              fullWidth
              margin="dense"
              id="minStockLevel"
              name="minStockLevel"
              label="Minimum Stock Level"
              type="number"
              value={formik.values.minStockLevel}
              onChange={formik.handleChange}
              error={formik.touched.minStockLevel && Boolean(formik.errors.minStockLevel)}
              helperText={formik.touched.minStockLevel && formik.errors.minStockLevel}
              inputProps={{ min: "0" }}
              InputProps={{
                sx: { 
                  borderRadius: '8px',
                  minHeight: { xs: '48px', sm: '56px' }
                }
              }}
              sx={{
                '& .MuiFormHelperText-root': {
                  marginLeft: 0
                }
              }}
            />
            
            <TextField
              fullWidth
              margin="dense"
              id="description"
              name="description"
              label="Description (Optional)"
              multiline
              rows={fullScreen ? 4 : 3}
              value={formik.values.description}
              onChange={formik.handleChange}
              InputProps={{
                sx: { 
                  borderRadius: '8px',
                }
              }}
            />
          </DialogContent>
          <DialogActions sx={{ 
            py: { xs: 1.5, sm: 2 },
            px: { xs: 1.5, sm: 3 },
            borderTop: `1px solid ${alpha('#ffffff', 0.1)}`,
            gap: 2,
            justifyContent: fullScreen ? 'space-between' : 'flex-end' 
          }}>
            <Button 
              onClick={() => setOpenDialog(false)}
              sx={{
                ...responsiveStyles.touchFriendly,
                minHeight: { xs: '44px', sm: '44px' },
                minWidth: { xs: '100px', sm: '120px' },
                borderRadius: '8px',
                textTransform: 'none'
              }}
            >
              Cancel
            </Button>
            <Button 
              type="submit" 
              variant="contained"
              sx={{
                ...responsiveStyles.touchFriendly,
                minHeight: { xs: '44px', sm: '44px' },
                minWidth: { xs: '100px', sm: '120px' },
                borderRadius: '8px',
                textTransform: 'none'
              }}
            >
              {dialogType === 'add' ? 'Add' : 'Update'}
            </Button>
          </DialogActions>
        </form>
      </Dialog>

      {/* Delete Confirmation Dialog - Enhanced for mobile */}
      <Dialog 
        open={deleteConfirmOpen} 
        onClose={() => setDeleteConfirmOpen(false)}
        maxWidth="xs"
        fullWidth
        fullScreen={isSmallMobile}
        PaperProps={{
          sx: {
            background: alpha('#141414', 0.98), // Netflix-inspired dark background
            backdropFilter: 'blur(10px)',
            borderRadius: isSmallMobile ? 0 : '8px',
            border: isSmallMobile ? 'none' : `1px solid ${alpha('#ffffff', 0.1)}`,
            overflow: 'hidden'
          }
        }}
      >
        <DialogTitle sx={{ 
          py: { xs: 1.5, sm: 2 },
          fontSize: { xs: '1.25rem', sm: '1.5rem' },
          borderBottom: `1px solid ${alpha('#ffffff', 0.1)}`
        }}>
          Confirm Delete
        </DialogTitle>
        <DialogContent sx={{ py: { xs: 2, sm: 2.5 }, px: { xs: 2, sm: 3 } }}>
          <Typography sx={{ fontSize: { xs: '0.9rem', sm: '1rem' } }}>
            Are you sure you want to delete "{currentProduct?.name}"? This action cannot be undone.
          </Typography>
        </DialogContent>
        <DialogActions sx={{ 
          py: { xs: 1.5, sm: 2 },
          px: { xs: 1.5, sm: 3 },
          borderTop: `1px solid ${alpha('#ffffff', 0.1)}`,
          gap: 2,
          justifyContent: isSmallMobile ? 'space-between' : 'flex-end' 
        }}>
          <Button 
            onClick={() => setDeleteConfirmOpen(false)}
            sx={{
              ...responsiveStyles.touchFriendly,
              minHeight: { xs: '44px', sm: '44px' },
              minWidth: { xs: '100px', sm: '120px' },
              borderRadius: '8px',
              textTransform: 'none'
            }}
          >
            Cancel
          </Button>
          <Button 
            onClick={handleDeleteConfirm} 
            variant="contained" 
            color="error"
            sx={{
              ...responsiveStyles.touchFriendly,
              minHeight: { xs: '44px', sm: '44px' },
              minWidth: { xs: '100px', sm: '120px' },
              borderRadius: '8px',
              textTransform: 'none'
            }}
          >
            Delete
          </Button>
        </DialogActions>
      </Dialog>

      {/* Product Details Dialog */}
      <Dialog
        open={viewDetailsOpen}
        onClose={() => setViewDetailsOpen(false)}
        maxWidth="sm"
        fullWidth
        PaperProps={{
          sx: {
            background: alpha('#141414', 0.98),
            backdropFilter: 'blur(10px)',
            borderRadius: '8px',
            border: `1px solid ${alpha('#ffffff', 0.1)}`,
            overflow: 'hidden'
          }
        }}
      >
        <DialogTitle>
          Product Details
        </DialogTitle>
        <DialogContent dividers>
          {viewProduct && (
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
              <Typography variant="h6">{viewProduct.name}</Typography>
              <Typography variant="body2"><strong>Category:</strong> {viewProduct.category}</Typography>
              <Typography variant="body2"><strong>Unit Price:</strong> {formatCurrency(viewProduct.unitPrice)}</Typography>
              <Typography variant="body2"><strong>Current Stock:</strong> {viewProduct.currentStock}</Typography>
              <Typography variant="body2"><strong>Minimum Stock Level:</strong> {viewProduct.minStockLevel}</Typography>
              {viewProduct.description && (
                <Typography variant="body2"><strong>Description:</strong> {viewProduct.description}</Typography>
              )}
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setViewDetailsOpen(false)}>Close</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default Products;
