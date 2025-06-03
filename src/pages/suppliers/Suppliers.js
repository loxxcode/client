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
  Alert,
  CircularProgress,
  Tooltip,
  Chip,
  useMediaQuery,
  useTheme,
  styled,
  Grid,
  Stack
} from '@mui/material';
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Visibility as VisibilityIcon,
  Warning as WarningIcon,
  CheckCircle as CheckCircleIcon
} from '@mui/icons-material';
import { getSuppliers, createSupplier, updateSupplier, deleteSupplier } from '../../utils/api';
import { useFormik } from 'formik';
import * as Yup from 'yup';
import { formatCurrency } from '../../utils/formatters';

// Styled components for better mobile experience
const ResponsiveTableCell = styled(TableCell)(({ theme }) => ({
  [theme.breakpoints.down('sm')]: {
    padding: '8px 4px',
    '&:last-child': {
      paddingRight: 8,
    },
  },
}));

const ActionButton = styled(IconButton)(({ theme }) => ({
  [theme.breakpoints.down('sm')]: {
    padding: 4,
    '& .MuiSvgIcon-root': {
      fontSize: '1rem',
    },
  },
}));

const Suppliers = () => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const [suppliers, setSuppliers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [openDialog, setOpenDialog] = useState(false);
  const [dialogType, setDialogType] = useState('add'); // 'add' or 'edit'
  const [currentSupplier, setCurrentSupplier] = useState(null);
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');
  const [detailsOpen, setDetailsOpen] = useState(false);

  useEffect(() => {
    fetchSuppliers();
  }, []);

  const fetchSuppliers = async () => {
    try {
      setLoading(true);
      const response = await getSuppliers();
      setSuppliers(response.data);
      setLoading(false);
    } catch (err) {
      console.error('Error fetching suppliers:', err);
      setError('Failed to load suppliers. Please try again later.');
      setLoading(false);
    }
  };

  // Form validation schema
  const validationSchema = Yup.object({
    name: Yup.string().required('Supplier name is required'),
    contactPerson: Yup.string(),
    phone: Yup.string(),
    email: Yup.string().email('Invalid email format'),
    address: Yup.string()
  });

  // Initialize formik
  const formik = useFormik({
    initialValues: {
      name: '',
      contactPerson: '',
      phone: '',
      email: '',
      address: ''
    },
    validationSchema,
    onSubmit: async (values) => {
      try {
        if (dialogType === 'add') {
          await createSupplier(values);
          setSuccessMessage('Supplier added successfully');
        } else {
          await updateSupplier(currentSupplier._id, values);
          setSuccessMessage('Supplier updated successfully');
        }
        setOpenDialog(false);
        fetchSuppliers();
        formik.resetForm();
        
        // Clear success message after 3 seconds
        setTimeout(() => {
          setSuccessMessage('');
        }, 3000);
      } catch (err) {
        console.error('Error saving supplier:', err);
        setError(err.response?.data?.message || 'Failed to save supplier');
      }
    }
  });

  const handleAddClick = () => {
    setDialogType('add');
    formik.resetForm();
    setOpenDialog(true);
  };

  const handleEditClick = (supplier) => {
    setDialogType('edit');
    setCurrentSupplier(supplier);
    formik.setValues({
      name: supplier.name,
      contactPerson: supplier.contactPerson || '',
      phone: supplier.phone || '',
      email: supplier.email || '',
      address: supplier.address || ''
    });
    setOpenDialog(true);
  };

  const handleDeleteClick = (supplier) => {
    setCurrentSupplier(supplier);
    setDeleteConfirmOpen(true);
  };

  const handleDeleteConfirm = async () => {
    try {
      await deleteSupplier(currentSupplier._id);
      setSuccessMessage('Supplier deleted successfully');
      fetchSuppliers();
      setDeleteConfirmOpen(false);
      
      // Clear success message after 3 seconds
      setTimeout(() => {
        setSuccessMessage('');
      }, 3000);
    } catch (err) {
      console.error('Error deleting supplier:', err);
      // Get the error message from the response if available
      const errorMessage = err.response?.data?.message || 'Failed to delete supplier';
      setError(errorMessage);
      setDeleteConfirmOpen(false);
      
      // Show the error message in a more visible way
      alert(`Error: ${errorMessage}`);
      
      // Clear error message after 5 seconds
      setTimeout(() => {
        setError('');
      }, 5000);
    }
  };

  const handleViewDetails = (supplier) => {
    setCurrentSupplier(supplier);
    setDetailsOpen(true);
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '80vh' }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box sx={{ flexGrow: 1, p: isMobile ? 1 : 3 }}>
      {/* Header */}
      <Box sx={{ 
        display: 'flex', 
        flexDirection: isMobile ? 'column' : 'row', 
        justifyContent: 'space-between', 
        alignItems: isMobile ? 'stretch' : 'center', 
        mb: 3,
        gap: 2
      }}>
        <Typography variant={isMobile ? 'h5' : 'h4'} component="h1" sx={{ mb: isMobile ? 1 : 0 }}>
          Suppliers
        </Typography>
        <Button 
          variant="contained" 
          startIcon={!isMobile && <AddIcon />}
          onClick={handleAddClick}
          fullWidth={isMobile}
          size={isMobile ? 'medium' : 'large'}
        >
          {isMobile ? <AddIcon /> : 'Add Supplier'}
        </Button>
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

      {/* Suppliers Table */}
      <TableContainer 
        component={Paper} 
        sx={{ 
          maxWidth: '100%',
          overflowX: 'auto',
          WebkitOverflowScrolling: 'touch',
          '&::-webkit-scrollbar': {
            height: '6px',
          },
          '&::-webkit-scrollbar-thumb': {
            backgroundColor: theme.palette.primary.main,
            borderRadius: '3px',
          },
        }}
      >
        <Table sx={{ minWidth: isMobile ? 800 : 650 }}>
          <TableHead>
            <TableRow>
              <ResponsiveTableCell>Name</ResponsiveTableCell>
              {!isMobile && (
                <>
                  <ResponsiveTableCell>Contact Person</ResponsiveTableCell>
                  <ResponsiveTableCell>Phone</ResponsiveTableCell>
                  <ResponsiveTableCell>Email</ResponsiveTableCell>
                </>
              )}
              <ResponsiveTableCell align="right">Debt</ResponsiveTableCell>
              <ResponsiveTableCell align="center">Actions</ResponsiveTableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {suppliers.length > 0 ? (
              suppliers.map((supplier) => (
                <TableRow key={supplier._id}>
                  <ResponsiveTableCell component="th" scope="row">
                    <Box sx={{ fontWeight: 'medium' }}>{supplier.name}</Box>
                    {isMobile && (
                      <Box sx={{ fontSize: '0.75rem', color: 'text.secondary', mt: 0.5 }}>
                        {supplier.contactPerson && <div>{supplier.contactPerson}</div>}
                        {supplier.phone && <div>{supplier.phone}</div>}
                        {supplier.email && <div>{supplier.email}</div>}
                      </Box>
                    )}
                  </ResponsiveTableCell>
                  {!isMobile && (
                    <>
                      <ResponsiveTableCell>{supplier.contactPerson || '-'}</ResponsiveTableCell>
                      <ResponsiveTableCell>{supplier.phone || '-'}</ResponsiveTableCell>
                      <ResponsiveTableCell>{supplier.email || '-'}</ResponsiveTableCell>
                    </>
                  )}
                  <ResponsiveTableCell align="right">
                    {supplier.totalDebt > 0 ? (
                      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end' }}>
                        {!isMobile && <WarningIcon color="warning" sx={{ mr: 1, fontSize: 16 }} />}
                        {formatCurrency(supplier.totalDebt)}
                      </Box>
                    ) : (
                      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end' }}>
                        {!isMobile && <CheckCircleIcon color="success" sx={{ mr: 1, fontSize: 16 }} />}
                        $0.00
                      </Box>
                    )}
                  </ResponsiveTableCell>
                  <ResponsiveTableCell align={isMobile ? 'right' : 'center'}>
                    <Stack direction="row" spacing={isMobile ? 0.5 : 1} justifyContent={isMobile ? 'flex-end' : 'center'}>
                      <Tooltip title="View Details">
                        <ActionButton onClick={() => handleViewDetails(supplier)} size="small">
                          <VisibilityIcon fontSize="inherit" />
                        </ActionButton>
                      </Tooltip>
                      <Tooltip title="Edit">
                        <ActionButton onClick={() => handleEditClick(supplier)} size="small">
                          <EditIcon fontSize="inherit" />
                        </ActionButton>
                      </Tooltip>
                      <Tooltip title="Delete">
                        <ActionButton 
                          onClick={() => handleDeleteClick(supplier)} 
                          size="small" 
                          color="error"
                        >
                          <DeleteIcon fontSize="inherit" />
                        </ActionButton>
                      </Tooltip>
                    </Stack>
                  </ResponsiveTableCell>
                </TableRow>
              ))
              )   : (
              <TableRow>
                <TableCell colSpan={6} align="center">
                  No suppliers found. Add your first supplier!
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </TableContainer>

      {/* Add/Edit Supplier Dialog */}
      <Dialog 
        open={openDialog} 
        onClose={() => setOpenDialog(false)} 
        maxWidth="sm" 
        fullWidth
        fullScreen={isMobile}
      >
        <DialogTitle>{dialogType === 'add' ? 'Add New Supplier' : 'Edit Supplier'}</DialogTitle>
        <form onSubmit={formik.handleSubmit}>
          <DialogContent>
            <Box sx={{ '& > *': { mb: 2 } }}>
              <TextField
                fullWidth
                margin="dense"
                id="name"
                name="name"
                label="Supplier Name"
                value={formik.values.name}
                onChange={formik.handleChange}
                error={formik.touched.name && Boolean(formik.errors.name)}
                helperText={formik.touched.name && formik.errors.name}
                size={isMobile ? 'medium' : 'small'}
              />
              
              <TextField
                fullWidth
                margin="dense"
                id="contactPerson"
                name="contactPerson"
                label="Contact Person"
                value={formik.values.contactPerson}
                onChange={formik.handleChange}
                error={formik.touched.contactPerson && Boolean(formik.errors.contactPerson)}
                helperText={formik.touched.contactPerson && formik.errors.contactPerson}
                size={isMobile ? 'medium' : 'small'}
              />
            
            <TextField
              fullWidth
              margin="dense"
              id="phone"
              name="phone"
              label="Phone"
              value={formik.values.phone}
              onChange={formik.handleChange}
              error={formik.touched.phone && Boolean(formik.errors.phone)}
              helperText={formik.touched.phone && formik.errors.phone}
            />
            
            <TextField
              fullWidth
              margin="dense"
              id="email"
              name="email"
              label="Email"
              type="email"
              value={formik.values.email}
              onChange={formik.handleChange}
              error={formik.touched.email && Boolean(formik.errors.email)}
              helperText={formik.touched.email && formik.errors.email}
            />
            
            <TextField
              fullWidth
              margin="dense"
              id="address"
              name="address"
              label="Address"
              multiline
              rows={2}
              value={formik.values.address}
              onChange={formik.handleChange}
              error={formik.touched.address && Boolean(formik.errors.address)}
              helperText={formik.touched.address && formik.errors.address}
              size={isMobile ? 'medium' : 'small'}
            />
            </Box>
          </DialogContent>
          <DialogActions sx={{ p: 2, gap: 1 }}>
            <Button 
              onClick={() => setOpenDialog(false)}
              size={isMobile ? 'large' : 'medium'}
              fullWidth={isMobile}
            >
              Cancel
            </Button>
            <Button 
              type="submit" 
              variant="contained"
              size={isMobile ? 'large' : 'medium'}
              fullWidth={isMobile}
            >
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
            Are you sure you want to delete "{currentSupplier?.name}"? This action cannot be undone.
          </Typography>
          {currentSupplier?.totalDebt > 0 && (
            <Alert severity="warning" sx={{ mt: 2 }}>
              This supplier has an outstanding debt of {formatCurrency(currentSupplier.totalDebt)}. Deleting this record may cause accounting issues.
            </Alert>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteConfirmOpen(false)}>Cancel</Button>
          <Button onClick={handleDeleteConfirm} variant="contained" color="error">
            Delete
          </Button>
        </DialogActions>
      </Dialog>

      {/* Supplier Details Dialog */}
      <Dialog 
        open={detailsOpen} 
        onClose={() => setDetailsOpen(false)} 
        maxWidth="md" 
        fullWidth
        fullScreen={isMobile}
      >
        <DialogTitle>Supplier Details</DialogTitle>
        <DialogContent>
          {currentSupplier && (
            <Box>
              <Paper sx={{ p: 2, mb: 2 }}>
                <Typography variant="h6" gutterBottom>
                  {currentSupplier.name}
                </Typography>
                <Grid container spacing={2}>
                  <Grid item xs={12} md={6}>
                    <Typography variant="body2" color="text.secondary">
                      <strong>Contact Person:</strong> {currentSupplier.contactPerson || 'N/A'}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      <strong>Phone:</strong> {currentSupplier.phone || 'N/A'}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      <strong>Email:</strong> {currentSupplier.email || 'N/A'}
                    </Typography>
                  </Grid>
                  <Grid item xs={12} md={6}>
                    <Typography variant="body2" color="text.secondary">
                      <strong>Address:</strong> {currentSupplier.address || 'N/A'}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      <strong>Total Debt:</strong> {formatCurrency(currentSupplier.totalDebt)}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      <strong>Relationship Since:</strong> {new Date(currentSupplier.createdAt).toLocaleDateString()}
                    </Typography>
                  </Grid>
                </Grid>
              </Paper>

              <Typography variant="h6" gutterBottom>
                Recent Deliveries
              </Typography>
              {currentSupplier.deliveries && currentSupplier.deliveries.length > 0 ? (
                <TableContainer component={Paper}>
                  <Table size="small">
                    <TableHead>
                      <TableRow>
                        <TableCell>Date</TableCell>
                        <TableCell>Product</TableCell>
                        <TableCell align="right">Quantity</TableCell>
                        <TableCell align="right">Total Amount</TableCell>
                        <TableCell align="right">Payment Status</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {currentSupplier.deliveries.map((delivery) => (
                        <TableRow key={delivery._id}>
                          <TableCell>{new Date(delivery.deliveryDate).toLocaleDateString()}</TableCell>
                          <TableCell>{delivery.product.name}</TableCell>
                          <TableCell align="right">{delivery.quantity}</TableCell>
                          <TableCell align="right">{formatCurrency(delivery.totalAmount)}</TableCell>
                          <TableCell align="right">
                            <Chip 
                              label={delivery.paymentStatus} 
                              color={delivery.paymentStatus === 'Paid' ? 'success' : delivery.paymentStatus === 'Partial' ? 'warning' : 'error'} 
                              size="small" 
                            />
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </TableContainer>
              ) : (
                <Typography variant="body2" color="text.secondary">
                  No delivery records found for this supplier.
                </Typography>
              )}
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDetailsOpen(false)}>Close</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};



export default Suppliers;
