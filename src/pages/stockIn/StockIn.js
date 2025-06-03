import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Button,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
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
  Tooltip,
  Chip,
  InputAdornment
} from '@mui/material';
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Visibility as VisibilityIcon,
  FilterList as FilterListIcon
} from '@mui/icons-material';
import { 
  getStockIns, 
  createStockIn, 
  updateStockIn, 
  deleteStockIn, 
  getProducts, 
  getSuppliers 
} from '../../utils/api';
import { useFormik } from 'formik';
import * as Yup from 'yup';
import { formatCurrency } from '../../utils/formatters';
import moment from 'moment';

const StockIn = () => {
  const [stockIns, setStockIns] = useState([]);
  const [products, setProducts] = useState([]);
  const [suppliers, setSuppliers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [openDialog, setOpenDialog] = useState(false);
  const [dialogType, setDialogType] = useState('add'); // 'add' or 'edit'
  const [currentStockIn, setCurrentStockIn] = useState(null);
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');
  const [detailsOpen, setDetailsOpen] = useState(false);
  const [filtersOpen, setFiltersOpen] = useState(false);

  // Filter states
  const [filters, setFilters] = useState({
    startDate: moment().subtract(30, 'days').format('YYYY-MM-DD'),
    endDate: moment().format('YYYY-MM-DD'),
    supplier: '',
    product: '',
    paymentStatus: ''
  });

  useEffect(() => {
    fetchData();
  }, []);  // eslint-disable-line react-hooks/exhaustive-deps

  const fetchData = async () => {
    try {
      setLoading(true);
      // Fetch all required data in parallel
      const [stockInResponse, productsResponse, suppliersResponse] = await Promise.all([
        getStockIns(filters),
        getProducts(),
        getSuppliers()
      ]);
      
      setStockIns(stockInResponse.data);
      setProducts(productsResponse.data);
      setSuppliers(suppliersResponse.data);
      setLoading(false);
    } catch (err) {
      console.error('Error fetching data:', err);
      setError('Failed to load data. Please try again later.');
      setLoading(false);
    }
  };

  // Form validation schema
  const validationSchema = Yup.object({
    product: Yup.string().required('Product is required'),
    supplier: Yup.string().required('Supplier is required'),
    quantity: Yup.number().positive('Quantity must be positive').required('Quantity is required'),
    unitPrice: Yup.number().positive('Unit price must be positive').required('Unit price is required'),
    paymentStatus: Yup.string().required('Payment status is required'),
    amountPaid: Yup.number().min(0, 'Amount paid cannot be negative')
      .when('paymentStatus', {
        is: 'Partial',
        then: (schema) => schema.required('Amount paid is required for partial payment')
      }),
    deliveryDate: Yup.date().required('Delivery date is required')
  });

  // Initialize formik
  const formik = useFormik({
    initialValues: {
      product: '',
      supplier: '',
      quantity: '',
      unitPrice: '',
      totalAmount: '',
      paymentStatus: 'Unpaid',
      amountPaid: '0',
      deliveryDate: moment().format('YYYY-MM-DD'),
      notes: ''
    },
    validationSchema,
    onSubmit: async (values) => {
      try {
        // Calculate total amount if not provided
        if (!values.totalAmount) {
          values.totalAmount = values.quantity * values.unitPrice;
        }
        
        // Calculate remaining debt based on payment status
        if (values.paymentStatus === 'Paid') {
          values.amountPaid = values.totalAmount;
          values.remainingDebt = 0;
        } else if (values.paymentStatus === 'Partial') {
          values.remainingDebt = values.totalAmount - values.amountPaid;
        } else {
          // Unpaid
          values.amountPaid = 0;
          values.remainingDebt = values.totalAmount;
        }

        if (dialogType === 'add') {
          await createStockIn(values);
          setSuccessMessage('Stock in record added successfully');
        } else {
          await updateStockIn(currentStockIn._id, values);
          setSuccessMessage('Stock in record updated successfully');
        }
        setOpenDialog(false);
        fetchData();
        formik.resetForm();
        
        // Clear success message after 3 seconds
        setTimeout(() => {
          setSuccessMessage('');
        }, 3000);
      } catch (err) {
        console.error('Error saving stock in record:', err);
        setError(err.response?.data?.message || 'Failed to save stock in record');
      }
    }
  });

  // Watch quantity and unit price to calculate total amount
  useEffect(() => {
    if (formik.values.quantity && formik.values.unitPrice) {
      const total = formik.values.quantity * formik.values.unitPrice;
      formik.setFieldValue('totalAmount', total);
    }
  }, [formik.values.quantity, formik.values.unitPrice, formik]);

  const handleAddClick = () => {
    setDialogType('add');
    formik.resetForm();
    // Set default values
    formik.setValues({
      product: '',
      supplier: '',
      quantity: '',
      unitPrice: '',
      totalAmount: '',
      paymentStatus: 'Unpaid',
      amountPaid: '0',
      deliveryDate: moment().format('YYYY-MM-DD'),
      notes: ''
    });
    setOpenDialog(true);
  };

  const handleEditClick = (stockIn) => {
    setDialogType('edit');
    setCurrentStockIn(stockIn);
    formik.setValues({
      product: stockIn.product._id,
      supplier: stockIn.supplier._id,
      quantity: stockIn.quantity.toString(),
      unitPrice: stockIn.unitPrice.toString(),
      totalAmount: stockIn.totalAmount.toString(),
      paymentStatus: stockIn.paymentStatus,
      amountPaid: stockIn.amountPaid.toString(),
      deliveryDate: moment(stockIn.deliveryDate).format('YYYY-MM-DD'),
      notes: stockIn.notes || ''
    });
    setOpenDialog(true);
  };

  const handleDeleteClick = (stockIn) => {
    setCurrentStockIn(stockIn);
    setDeleteConfirmOpen(true);
  };

  const handleDeleteConfirm = async () => {
    try {
      await deleteStockIn(currentStockIn._id);
      setSuccessMessage('Stock in record deleted successfully');
      fetchData();
      setDeleteConfirmOpen(false);
      
      // Clear success message after 3 seconds
      setTimeout(() => {
        setSuccessMessage('');
      }, 3000);
    } catch (err) {
      console.error('Error deleting stock in record:', err);
      setError(err.response?.data?.message || 'Failed to delete stock in record');
      setDeleteConfirmOpen(false);
    }
  };

  const handleViewDetails = (stockIn) => {
    setCurrentStockIn(stockIn);
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
      startDate: moment().subtract(30, 'days').format('YYYY-MM-DD'),
      endDate: moment().format('YYYY-MM-DD'),
      supplier: '',
      product: '',
      paymentStatus: ''
    });
  };

  const getPaymentStatusColor = (status) => {
    if (status === 'Paid') return 'success';
    if (status === 'Partial') return 'warning';
    return 'error';
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '80vh' }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box sx={{ flexGrow: 1 }}>
      {/* Header */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h4" component="h1">
          Stock In (Product Supply)
        </Typography>
        <Box>
          <Button 
            variant="outlined" 
            startIcon={<FilterListIcon />}
            onClick={() => setFiltersOpen(true)}
            sx={{ mr: 1 }}
          >
            Filters
          </Button>
          <Button 
            variant="contained" 
            startIcon={<AddIcon />}
            onClick={handleAddClick}
          >
            Add Supply
          </Button>
        </Box>
      </Box>

      {/* Success message */}
      {successMessage && (
        <Alert severity="success" sx={{ mb: 2 }}>
          {successMessage}
        </Alert>
      )}

      {/* Error message */}
      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}

      {/* StockIn Table */}
      <TableContainer component={Paper}>
        <Table sx={{ minWidth: 650 }}>
          <TableHead>
            <TableRow>
              <TableCell>Date</TableCell>
              <TableCell>Product</TableCell>
              <TableCell>Supplier</TableCell>
              <TableCell align="right">Quantity</TableCell>
              <TableCell align="right">Unit Price</TableCell>
              <TableCell align="right">Total Amount</TableCell>
              <TableCell>Payment Status</TableCell>
              <TableCell align="center">Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {stockIns.length > 0 ? (
              stockIns.map((stockIn) => (
                <TableRow key={stockIn._id}>
                  <TableCell>{moment(stockIn.deliveryDate).format('MM/DD/YYYY')}</TableCell>
                  <TableCell>{stockIn.product.name}</TableCell>
                  <TableCell>{stockIn.supplier.name}</TableCell>
                  <TableCell align="right">{stockIn.quantity}</TableCell>
                  <TableCell align="right">{formatCurrency(stockIn.unitPrice)}</TableCell>
                  <TableCell align="right">{formatCurrency(stockIn.totalAmount)}</TableCell>
                  <TableCell>
                    <Chip 
                      label={stockIn.paymentStatus} 
                      color={getPaymentStatusColor(stockIn.paymentStatus)}
                      size="small"
                    />
                  </TableCell>
                  <TableCell align="center">
                    <Tooltip title="View Details">
                      <IconButton onClick={() => handleViewDetails(stockIn)} size="small">
                        <VisibilityIcon fontSize="small" />
                      </IconButton>
                    </Tooltip>
                    <Tooltip title="Edit">
                      <IconButton onClick={() => handleEditClick(stockIn)} size="small">
                        <EditIcon fontSize="small" />
                      </IconButton>
                    </Tooltip>
                    <Tooltip title="Delete">
                      <IconButton onClick={() => handleDeleteClick(stockIn)} size="small" color="error">
                        <DeleteIcon fontSize="small" />
                      </IconButton>
                    </Tooltip>
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={8} align="center">
                  No stock in records found. Add your first supply!
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </TableContainer>

      {/* Add/Edit StockIn Dialog */}
      <Dialog open={openDialog} onClose={() => setOpenDialog(false)} maxWidth="md" fullWidth>
        <DialogTitle>{dialogType === 'add' ? 'Add New Supply' : 'Edit Supply'}</DialogTitle>
        <form onSubmit={formik.handleSubmit}>
          <DialogContent>
            <Grid container spacing={2}>
              <Grid item xs={12} md={6}>
                <FormControl fullWidth margin="dense">
                  <InputLabel>Product</InputLabel>
                  <Select
                    id="product"
                    name="product"
                    value={formik.values.product}
                    onChange={formik.handleChange}
                    error={formik.touched.product && Boolean(formik.errors.product)}
                  >
                    {products.map((product) => (
                      <MenuItem key={product._id} value={product._id}>
                        {product.name} - {formatCurrency(product.unitPrice)}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>
              
              <Grid item xs={12} md={6}>
                <FormControl fullWidth margin="dense">
                  <InputLabel>Supplier</InputLabel>
                  <Select
                    id="supplier"
                    name="supplier"
                    value={formik.values.supplier}
                    onChange={formik.handleChange}
                    error={formik.touched.supplier && Boolean(formik.errors.supplier)}
                  >
                    {suppliers.map((supplier) => (
                      <MenuItem key={supplier._id} value={supplier._id}>
                        {supplier.name}
                      </MenuItem>
                    ))}
                  </Select>
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
                  helperText={formik.touched.quantity && formik.errors.quantity}
                  inputProps={{ min: "1" }}
                />
              </Grid>
              
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  margin="dense"
                  id="unitPrice"
                  name="unitPrice"
                  label="Unit Price"
                  type="number"
                  value={formik.values.unitPrice}
                  onChange={formik.handleChange}
                  error={formik.touched.unitPrice && Boolean(formik.errors.unitPrice)}
                  helperText={formik.touched.unitPrice && formik.errors.unitPrice}
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
                <FormControl fullWidth margin="dense">
                  <InputLabel>Payment Status</InputLabel>
                  <Select
                    id="paymentStatus"
                    name="paymentStatus"
                    value={formik.values.paymentStatus}
                    onChange={formik.handleChange}
                    error={formik.touched.paymentStatus && Boolean(formik.errors.paymentStatus)}
                  >
                    <MenuItem value="Paid">Paid</MenuItem>
                    <MenuItem value="Partial">Partial</MenuItem>
                    <MenuItem value="Unpaid">Unpaid</MenuItem>
                  </Select>
                </FormControl>
              </Grid>
              
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  margin="dense"
                  id="amountPaid"
                  name="amountPaid"
                  label="Amount Paid"
                  type="number"
                  value={formik.values.amountPaid}
                  onChange={formik.handleChange}
                  error={formik.touched.amountPaid && Boolean(formik.errors.amountPaid)}
                  helperText={formik.touched.amountPaid && formik.errors.amountPaid}
                  disabled={formik.values.paymentStatus === 'Unpaid' || formik.values.paymentStatus === 'Paid'}
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
                  id="deliveryDate"
                  name="deliveryDate"
                  label="Delivery Date"
                  type="date"
                  value={formik.values.deliveryDate}
                  onChange={formik.handleChange}
                  error={formik.touched.deliveryDate && Boolean(formik.errors.deliveryDate)}
                  helperText={formik.touched.deliveryDate && formik.errors.deliveryDate}
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
            <Button type="submit" variant="contained">
              {dialogType === 'add' ? 'Add' : 'Update'}
            </Button>
          </DialogActions>
        </form>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog open={deleteConfirmOpen} onClose={() => setDeleteConfirmOpen(false)}>
        <DialogTitle>Confirm Delete</DialogTitle>
        <DialogContent>
          <Typography>
            Are you sure you want to delete this supply record? This action cannot be undone.
          </Typography>
          <Typography color="error" sx={{ mt: 2 }}>
            Warning: This will also update the product's stock quantity and may affect the supplier's debt record.
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteConfirmOpen(false)}>Cancel</Button>
          <Button onClick={handleDeleteConfirm} variant="contained" color="error">
            Delete
          </Button>
        </DialogActions>
      </Dialog>

      {/* StockIn Details Dialog */}
      <Dialog open={detailsOpen} onClose={() => setDetailsOpen(false)} maxWidth="md" fullWidth>
        <DialogTitle>Supply Details</DialogTitle>
        <DialogContent>
          {currentStockIn && (
            <Box>
              <Paper sx={{ p: 2, mb: 2 }}>
                <Grid container spacing={2}>
                  <Grid item xs={12} md={6}>
                    <Typography variant="body1" gutterBottom>
                      <strong>Product:</strong> {currentStockIn.product.name}
                    </Typography>
                    <Typography variant="body1" gutterBottom>
                      <strong>Supplier:</strong> {currentStockIn.supplier.name}
                    </Typography>
                    <Typography variant="body1" gutterBottom>
                      <strong>Quantity:</strong> {currentStockIn.quantity}
                    </Typography>
                    <Typography variant="body1" gutterBottom>
                      <strong>Unit Price:</strong> {formatCurrency(currentStockIn.unitPrice)}
                    </Typography>
                  </Grid>
                  <Grid item xs={12} md={6}>
                    <Typography variant="body1" gutterBottom>
                      <strong>Total Amount:</strong> {formatCurrency(currentStockIn.totalAmount)}
                    </Typography>
                    <Typography variant="body1" gutterBottom>
                      <strong>Payment Status:</strong> 
                      <Chip 
                        label={currentStockIn.paymentStatus} 
                        color={getPaymentStatusColor(currentStockIn.paymentStatus)}
                        size="small"
                        sx={{ ml: 1 }}
                      />
                    </Typography>
                    <Typography variant="body1" gutterBottom>
                      <strong>Amount Paid:</strong> {formatCurrency(currentStockIn.amountPaid)}
                    </Typography>
                    <Typography variant="body1" gutterBottom>
                      <strong>Remaining Debt:</strong> {formatCurrency(currentStockIn.remainingDebt)}
                    </Typography>
                  </Grid>
                  <Grid item xs={12}>
                    <Typography variant="body1" gutterBottom>
                      <strong>Delivery Date:</strong> {moment(currentStockIn.deliveryDate).format('MMMM D, YYYY')}
                    </Typography>
                    {currentStockIn.notes && (
                      <Typography variant="body1" gutterBottom>
                        <strong>Notes:</strong> {currentStockIn.notes}
                      </Typography>
                    )}
                    <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                      <strong>Created By:</strong> {currentStockIn.createdBy ? currentStockIn.createdBy.name : 'Unknown'}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      <strong>Created At:</strong> {moment(currentStockIn.createdAt).format('MMMM D, YYYY, h:mm A')}
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
        <DialogTitle>Filter Stock In Records</DialogTitle>
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
                <InputLabel>Supplier</InputLabel>
                <Select
                  id="supplier"
                  name="supplier"
                  value={filters.supplier}
                  onChange={handleFilterChange}
                >
                  <MenuItem value="">All Suppliers</MenuItem>
                  {suppliers.map((supplier) => (
                    <MenuItem key={supplier._id} value={supplier._id}>
                      {supplier.name}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
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
            
            <Grid item xs={12}>
              <FormControl fullWidth margin="dense">
                <InputLabel>Payment Status</InputLabel>
                <Select
                  id="paymentStatus"
                  name="paymentStatus"
                  value={filters.paymentStatus}
                  onChange={handleFilterChange}
                >
                  <MenuItem value="">All Statuses</MenuItem>
                  <MenuItem value="Paid">Paid</MenuItem>
                  <MenuItem value="Partial">Partial</MenuItem>
                  <MenuItem value="Unpaid">Unpaid</MenuItem>
                </Select>
              </FormControl>
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
    </Box>
  );
};

export default StockIn;
