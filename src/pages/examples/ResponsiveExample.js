import React from 'react';
import {
  Box,
  Typography,
  Button,
  Grid,
  Card,
  alpha,
  Paper,
  useTheme
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import ResponsiveTable from '../../components/tables/ResponsiveTable';
import { useResponsive, responsiveStyles } from '../../styles/responsive';
import { formatCurrency } from '../../utils/formatters';

const ResponsiveExample = () => {
  const theme = useTheme();
  const { isSmallMobile } = useResponsive();
  
  // Sample data for the table
  const sampleProducts = [
    { id: 1, name: 'Product A', price: 5000, quantity: 25, category: 'Electronics' },
    { id: 2, name: 'Product B', price: 3000, quantity: 15, category: 'Clothing' },
    { id: 3, name: 'Product C', price: 10000, quantity: 5, category: 'Electronics' },
    { id: 4, name: 'Product D', price: 2500, quantity: 30, category: 'Food' },
    { id: 5, name: 'Product E', price: 8000, quantity: 12, category: 'Electronics' },
  ];
  
  // Column definitions for the table
  const columns = [
    { field: 'name', headerName: 'Product Name', primary: true },
    { field: 'price', headerName: 'Price', align: 'right', 
      renderCell: (row) => formatCurrency(row.price)
    },
    { field: 'quantity', headerName: 'Quantity', align: 'right' },
    { field: 'category', headerName: 'Category', hideOnMobile: isSmallMobile },
    { 
      field: 'actions', 
      headerName: 'Actions', 
      align: 'center',
      renderCell: (row) => (
        <Button 
          size="small" 
          variant="outlined" 
          color="primary"
          sx={{
            ...responsiveStyles.touchFriendly,
            minWidth: { xs: '40px', sm: '60px' },
            minHeight: { xs: '36px', sm: '40px' },
          }}
        >
          View
        </Button>
      ) 
    },
  ];

  return (
    <Box>
      {/* Page header with responsive sizing */}
      <Box sx={{ mb: { xs: 2, sm: 3 } }}>
        <Typography 
          variant="h4" 
          component="h1" 
          sx={{ 
            fontSize: { xs: '1.5rem', sm: '1.75rem', md: '2rem' },
            mb: { xs: 1, sm: 2 }
          }}
        >
          Products
        </Typography>
        
        <Box sx={responsiveStyles.flexRow}>
          <Button
            variant="contained"
            color="primary"
            startIcon={<AddIcon />}
            sx={{
              ...responsiveStyles.touchFriendly,
              minHeight: { xs: '40px', sm: '44px' },
              px: { xs: 1.5, sm: 2 },
              textTransform: 'none',
              mr: 'auto'
            }}
          >
            Add Product
          </Button>
        </Box>
      </Box>
      
      {/* Stats Cards with responsive grid */}
      <Grid container spacing={{ xs: 1, sm: 2, md: 3 }} sx={{ mb: { xs: 2, sm: 3 } }}>
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
                57
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
                {formatCurrency(1250000)}
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
                  fontSize: { xs: '1.25rem', sm: '1.5rem' } 
                }}
              >
                12
              </Typography>
            </Box>
          </Card>
        </Grid>
        <Grid item xs={6} sm={6} md={3}>
          <Card sx={responsiveStyles.netflixMobileCard}>
            <Box sx={{ p: { xs: 1.5, sm: 2 } }}>
              <Typography variant="body2" color="text.secondary">
                Categories
              </Typography>
              <Typography 
                variant="h5" 
                sx={{ 
                  fontWeight: 'bold',
                  fontSize: { xs: '1.25rem', sm: '1.5rem' } 
                }}
              >
                8
              </Typography>
            </Box>
          </Card>
        </Grid>
      </Grid>
      
      {/* Responsive Table component that shows cards on mobile */}
      <Paper
        elevation={0}
        sx={{
          background: alpha(theme.palette.background.paper, 0.4),
          p: { xs: 1, sm: 2 },
          borderRadius: { xs: 1, sm: 2 }
        }}
      >
        <Box sx={{ mb: 2 }}>
          <Typography variant="h6" sx={{ fontSize: { xs: '1.1rem', sm: '1.25rem' } }}>
            Product List
          </Typography>
        </Box>
        
        <ResponsiveTable 
          columns={columns} 
          rows={sampleProducts} 
          emptyMessage="No products found"
        />
      </Paper>
    </Box>
  );
};

export default ResponsiveExample;
