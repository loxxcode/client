import React, { useState, useEffect } from 'react';
import { Box, Grid, Paper, Typography, CircularProgress } from '@mui/material';
import { getSalesSummaryReport } from '../../utils/api';

const SalesSummaryReport = ({ dateRange, isRefreshing }) => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchData = async () => {
    try {
      setLoading(true);
      setError(null);
      const reportData = await getSalesSummaryReport(
        dateRange.startDate.toISOString(),
        dateRange.endDate.toISOString()
      );
      setData(reportData);
    } catch (err) {
      setError(err.message || 'Failed to fetch sales summary report');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [dateRange, isRefreshing]);

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', p: 3 }}>
        <CircularProgress sx={{ color: '#e50914' }} />
      </Box>
    );
  }

  if (error) {
    return (
      <Box sx={{
        p: 3,
        textAlign: 'center',
        color: '#e50914',
        backgroundColor: 'rgba(229, 9, 20, 0.1)',
        borderRadius: '8px'
      }}>
        <Typography>{error}</Typography>
      </Box>
    );
  }

  if (!data) {
    return (
      <Box sx={{
        p: 4,
        textAlign: 'center',
        color: '#999',
        backgroundColor: 'rgba(255, 255, 255, 0.03)',
        borderRadius: '8px',
        border: '1px dashed #333'
      }}>
        <Typography>No sales data available for the selected period</Typography>
      </Box>
    );
  }

  const StatCard = ({ title, value, subtitle }) => (
    <Paper sx={{
      p: 3,
      height: '100%',
      backgroundColor: 'rgba(255, 255, 255, 0.03)',
      color: '#fff',
      '&:hover': {
        backgroundColor: 'rgba(255, 255, 255, 0.05)',
      }
    }}>
      <Typography variant="h6" gutterBottom sx={{ color: '#999' }}>
        {title}
      </Typography>
      <Typography variant="h4" sx={{ color: '#e50914', mb: 1 }}>
        {value}
      </Typography>
      {subtitle && (
        <Typography variant="body2" sx={{ color: '#999' }}>
          {subtitle}
        </Typography>
      )}
    </Paper>
  );

  return (
    <Grid container spacing={3}>
      <Grid item xs={12} sm={6} md={3}>
        <StatCard
          title="Total Revenue"
          value={`$${data.totalRevenue.toFixed(2)}`}
          subtitle={`${data.orderCount} orders`}
        />
      </Grid>
      <Grid item xs={12} sm={6} md={3}>
        <StatCard
          title="Average Order Value"
          value={`$${data.averageOrderValue.toFixed(2)}`}
          subtitle="per order"
        />
      </Grid>
      <Grid item xs={12} sm={6} md={3}>
        <StatCard
          title="Products Sold"
          value={data.totalProductsSold}
          subtitle="units"
        />
      </Grid>
      <Grid item xs={12} sm={6} md={3}>
        <StatCard
          title="Profit Margin"
          value={`${(data.profitMargin * 100).toFixed(1)}%`}
          subtitle={`$${data.totalProfit.toFixed(2)} profit`}
        />
      </Grid>

      {data.topProducts && data.topProducts.length > 0 && (
        <Grid item xs={12}>
          <Paper sx={{
            p: 3,
            mt: 3,
            backgroundColor: 'rgba(255, 255, 255, 0.03)',
            color: '#fff'
          }}>
            <Typography variant="h6" gutterBottom>
              Top Selling Products
            </Typography>
            <Grid container spacing={2}>
              {data.topProducts.map((product, index) => (
                <Grid item xs={12} sm={6} md={4} key={product.id}>
                  <Paper sx={{
                    p: 2,
                    backgroundColor: 'rgba(255, 255, 255, 0.02)',
                    '&:hover': {
                      backgroundColor: 'rgba(255, 255, 255, 0.04)',
                    }
                  }}>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <Typography variant="subtitle1">
                        {product.name}
                      </Typography>
                      <Typography variant="subtitle1" sx={{ color: '#e50914' }}>
                        ${product.revenue.toFixed(2)}
                      </Typography>
                    </Box>
                    <Typography variant="body2" sx={{ color: '#999', mt: 1 }}>
                      {product.unitsSold} units sold
                    </Typography>
                  </Paper>
                </Grid>
              ))}
            </Grid>
          </Paper>
        </Grid>
      )}
    </Grid>
  );
};

export default SalesSummaryReport;
