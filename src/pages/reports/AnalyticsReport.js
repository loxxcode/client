import React, { useState, useEffect } from 'react';
import { 
  Box, 
  Paper, 
  Typography, 
  CircularProgress, 
  Grid,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow
} from '@mui/material';
import { getAnalyticsReport } from '../../utils/api';

const AnalyticsReport = ({ dateRange, isRefreshing }) => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchData = async () => {
    try {
      setLoading(true);
      setError(null);
      const reportData = await getAnalyticsReport(
        dateRange.startDate.toISOString(),
        dateRange.endDate.toISOString()
      );
      setData(reportData);
    } catch (err) {
      setError(err.message || 'Failed to fetch analytics report');
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
        <Typography>No analytics data available for the selected period</Typography>
      </Box>
    );
  }

  const MetricCard = ({ title, value, subtitle, trend }) => {
    const trendColor = trend > 0 ? '#66bb6a' : trend < 0 ? '#e50914' : '#999';
    const trendSymbol = trend > 0 ? '↑' : trend < 0 ? '↓' : '−';
    
    return (
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
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <Typography variant="body2" sx={{ color: trendColor }}>
            {trendSymbol} {Math.abs(trend)}%
          </Typography>
          {subtitle && (
            <Typography variant="body2" sx={{ color: '#999' }}>
              {subtitle}
            </Typography>
          )}
        </Box>
      </Paper>
    );
  };

  return (
    <Box>
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} sm={6} md={3}>
          <MetricCard
            title="Customer Growth"
            value={data.customerGrowth.total}
            trend={data.customerGrowth.trend}
            subtitle="vs last period"
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <MetricCard
            title="Average Order Value"
            value={`$${data.averageOrderValue.value.toFixed(2)}`}
            trend={data.averageOrderValue.trend}
            subtitle="vs last period"
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <MetricCard
            title="Customer Retention"
            value={`${data.customerRetention.value}%`}
            trend={data.customerRetention.trend}
            subtitle="vs last period"
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <MetricCard
            title="Revenue Growth"
            value={`$${data.revenueGrowth.value.toFixed(2)}`}
            trend={data.revenueGrowth.trend}
            subtitle="vs last period"
          />
        </Grid>
      </Grid>

      <Grid container spacing={3}>
        <Grid item xs={12} md={6}>
          <Paper sx={{
            p: 3,
            backgroundColor: 'rgba(255, 255, 255, 0.03)',
            height: '100%'
          }}>
            <Typography variant="h6" gutterBottom sx={{ color: '#fff' }}>
              Top Customers
            </Typography>
            <TableContainer>
              <Table>
                <TableHead>
                  <TableRow sx={{ 
                    '& .MuiTableCell-head': { 
                      color: '#999',
                      borderColor: 'rgba(255, 255, 255, 0.1)'
                    }
                  }}>
                    <TableCell>Customer</TableCell>
                    <TableCell align="right">Orders</TableCell>
                    <TableCell align="right">Total Spent</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {data.topCustomers.map((customer) => (
                    <TableRow key={customer.id} sx={{
                      '& .MuiTableCell-root': {
                        color: '#fff',
                        borderColor: 'rgba(255, 255, 255, 0.1)'
                      }
                    }}>
                      <TableCell>{customer.name}</TableCell>
                      <TableCell align="right">{customer.orderCount}</TableCell>
                      <TableCell align="right">${customer.totalSpent.toFixed(2)}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          </Paper>
        </Grid>

        <Grid item xs={12} md={6}>
          <Paper sx={{
            p: 3,
            backgroundColor: 'rgba(255, 255, 255, 0.03)',
            height: '100%'
          }}>
            <Typography variant="h6" gutterBottom sx={{ color: '#fff' }}>
              Sales by Category
            </Typography>
            <TableContainer>
              <Table>
                <TableHead>
                  <TableRow sx={{ 
                    '& .MuiTableCell-head': { 
                      color: '#999',
                      borderColor: 'rgba(255, 255, 255, 0.1)'
                    }
                  }}>
                    <TableCell>Category</TableCell>
                    <TableCell align="right">Sales</TableCell>
                    <TableCell align="right">Growth</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {data.categoryAnalytics.map((category) => (
                    <TableRow key={category.id} sx={{
                      '& .MuiTableCell-root': {
                        color: '#fff',
                        borderColor: 'rgba(255, 255, 255, 0.1)'
                      }
                    }}>
                      <TableCell>{category.name}</TableCell>
                      <TableCell align="right">${category.sales.toFixed(2)}</TableCell>
                      <TableCell align="right" sx={{
                        color: category.growth > 0 ? '#66bb6a' : 
                               category.growth < 0 ? '#e50914' : '#999'
                      }}>
                        {category.growth > 0 ? '+' : ''}{category.growth}%
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          </Paper>
        </Grid>
      </Grid>
    </Box>
  );
};

export default AnalyticsReport;
