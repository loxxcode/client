import React, { useEffect, useState } from 'react';
import { Box, Typography, CircularProgress, Grid, Paper } from '@mui/material';
import axios from 'axios';

// Format currency in RWF (Rwandan Francs)
const formatCurrency = (amount) => {
  return `RWF ${Math.round(amount || 0).toLocaleString()}`;
};

const SalesSummaryReport = ({ dateRange, isRefreshing, apiBaseUrl }) => {
  const [summary, setSummary] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchSummary = async () => {
      setLoading(true);
      setError('');
      try {
        console.log('Fetching sales summary with params:', {
          startDate: dateRange.startDate,
          endDate: dateRange.endDate,
          apiBaseUrl,
        });

        const res = await axios.get(
          `${apiBaseUrl}/api/reports/sales-summary`,
          {
            params: {
              startDate: dateRange.startDate.toISOString(),
              endDate: dateRange.endDate.toISOString(),
            },
          }
        );

        console.log('Sales summary API response:', res.data);

        // Validate and transform the data
        const data = res.data || {};
        setSummary({
          totalSales: data.totalSales || 0,
          totalOrders: data.totalOrders || 0,
          totalCustomers: data.totalCustomers || 0,
          topProduct: data.topProduct || { name: 'N/A' },
        });
      } catch (err) {
        console.error('Error fetching sales summary:', err);
        setError(err.response?.data?.message || 'Failed to load sales summary');
      } finally {
        setLoading(false);
      }
    };
    fetchSummary();
  }, [dateRange, isRefreshing, apiBaseUrl]);

  if (loading) {
    return (
      <Box sx={{ textAlign: 'center', py: 6 }}>
        <CircularProgress sx={{ color: '#e50914' }} />
      </Box>
    );
  }

  if (error) {
    return (
      <Box sx={{ textAlign: 'center', py: 6, color: 'error.main' }}>
        <Typography>{error}</Typography>
      </Box>
    );
  }

  if (!summary) {
    return (
      <Box sx={{ textAlign: 'center', py: 6, color: '#999' }}>
        <Typography>No data available for the selected period.</Typography>
      </Box>
    );
  }

  return (
    <Grid container spacing={3}>
      <Grid item xs={12} md={3}>
        <Paper sx={{ p: 3, bgcolor: '#222', color: '#fff', borderRadius: 2 }}>
          <Typography variant="subtitle2" gutterBottom>
            Total Sales
          </Typography>
          <Typography
            variant="h5"
            sx={{ fontWeight: 'bold', color: '#e50914' }}
          >
            {formatCurrency(summary.totalSales)}
          </Typography>
        </Paper>
      </Grid>
      <Grid item xs={12} md={3}>
        <Paper sx={{ p: 3, bgcolor: '#222', color: '#fff', borderRadius: 2 }}>
          <Typography variant="subtitle2" gutterBottom>
            Orders
          </Typography>
          <Typography
            variant="h5"
            sx={{ fontWeight: 'bold', color: '#e50914' }}
          >
            {summary.totalOrders.toLocaleString()}
          </Typography>
        </Paper>
      </Grid>
      <Grid item xs={12} md={3}>
        <Paper sx={{ p: 3, bgcolor: '#222', color: '#fff', borderRadius: 2 }}>
          <Typography variant="subtitle2" gutterBottom>
            Customers
          </Typography>
          <Typography
            variant="h5"
            sx={{ fontWeight: 'bold', color: '#e50914' }}
          >
            {summary.totalCustomers.toLocaleString()}
          </Typography>
        </Paper>
      </Grid>
      <Grid item xs={12} md={3}>
        <Paper sx={{ p: 3, bgcolor: '#222', color: '#fff', borderRadius: 2 }}>
          <Typography variant="subtitle2" gutterBottom>
            Top Product
          </Typography>
          <Typography
            variant="h6"
            sx={{ fontWeight: 'bold', color: '#e50914' }}
          >
            {summary.topProduct?.name || 'N/A'}
          </Typography>
        </Paper>
      </Grid>
    </Grid>
  );
};

export default SalesSummaryReport;
