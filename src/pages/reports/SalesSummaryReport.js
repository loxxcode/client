import React, { useEffect, useState } from 'react';
import { Box, Typography, CircularProgress, Grid, Paper } from '@mui/material';
import axios from 'axios';

const SalesSummaryReport = ({ dateRange, isRefreshing, apiBaseUrl }) => {
  const [summary, setSummary] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchSummary = async () => {
      setLoading(true);
      setError('');
      try {
        const res = await axios.get(
          `${apiBaseUrl}/api/reports/sales-summary`,
          {
            params: {
              startDate: dateRange.startDate.toISOString(),
              endDate: dateRange.endDate.toISOString(),
            },
          }
        );
        setSummary(res.data);
      } catch (err) {
        setError('Failed to load sales summary');
      }
      setLoading(false);
    };
    fetchSummary();
  }, [dateRange, isRefreshing, apiBaseUrl]);

  if (loading) {
    return (
      <Box sx={{ textAlign: 'center', py: 6 }}>
        <CircularProgress color="primary" />
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
          <Typography variant="subtitle2" gutterBottom>Total Sales</Typography>
          <Typography variant="h5" sx={{ fontWeight: 'bold', color: '#e50914' }}>
            {summary.totalSales?.toLocaleString() ?? 0} RWF
          </Typography>
        </Paper>
      </Grid>
      <Grid item xs={12} md={3}>
        <Paper sx={{ p: 3, bgcolor: '#222', color: '#fff', borderRadius: 2 }}>
          <Typography variant="subtitle2" gutterBottom>Orders</Typography>
          <Typography variant="h5" sx={{ fontWeight: 'bold', color: '#e50914' }}>
            {summary.totalOrders ?? 0}
          </Typography>
        </Paper>
      </Grid>
      <Grid item xs={12} md={3}>
        <Paper sx={{ p: 3, bgcolor: '#222', color: '#fff', borderRadius: 2 }}>
          <Typography variant="subtitle2" gutterBottom>Customers</Typography>
          <Typography variant="h5" sx={{ fontWeight: 'bold', color: '#e50914' }}>
            {summary.totalCustomers ?? 0}
          </Typography>
        </Paper>
      </Grid>
      <Grid item xs={12} md={3}>
        <Paper sx={{ p: 3, bgcolor: '#222', color: '#fff', borderRadius: 2 }}>
          <Typography variant="subtitle2" gutterBottom>Top Product</Typography>
          <Typography variant="h6" sx={{ fontWeight: 'bold', color: '#e50914' }}>
            {summary.topProduct?.name ?? 'N/A'}
          </Typography>
        </Paper>
      </Grid>
    </Grid>
  );
};

export default SalesSummaryReport;
