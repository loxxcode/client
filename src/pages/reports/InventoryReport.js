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
  TableRow,
  LinearProgress
} from '@mui/material';
import { getInventoryReport } from '../../utils/api';

const InventoryReport = ({ dateRange, isRefreshing }) => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchData = async () => {
    try {
      setLoading(true);
      setError(null);
      const reportData = await getInventoryReport(
        dateRange.startDate.toISOString(),
        dateRange.endDate.toISOString()
      );
      setData(reportData);
    } catch (err) {
      setError(err.message || 'Failed to fetch inventory report');
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
        <Typography>No inventory data available</Typography>
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
    <Box>
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            title="Total Stock Value"
            value={`$${data.totalStockValue.toFixed(2)}`}
            subtitle={`${data.totalItems} items`}
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            title="Low Stock Items"
            value={data.lowStockCount}
            subtitle="need attention"
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            title="Out of Stock"
            value={data.outOfStockCount}
            subtitle="items"
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            title="Stock Turnover Rate"
            value={`${data.stockTurnoverRate.toFixed(1)}x`}
            subtitle="per year"
          />
        </Grid>
      </Grid>

      <TableContainer component={Paper} sx={{ 
        backgroundColor: 'rgba(255, 255, 255, 0.03)',
        '& .MuiTableCell-root': {
          color: '#fff',
          borderColor: 'rgba(255, 255, 255, 0.1)'
        }
      }}>
        <Table>
          <TableHead>
            <TableRow sx={{ 
              '& .MuiTableCell-head': { 
                backgroundColor: 'rgba(255, 255, 255, 0.05)',
                fontWeight: 'bold'
              }
            }}>
              <TableCell>Product Name</TableCell>
              <TableCell align="right">Current Stock</TableCell>
              <TableCell align="right">Minimum Stock</TableCell>
              <TableCell align="right">Stock Value</TableCell>
              <TableCell>Stock Status</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {data.items.map((item) => {
              const stockLevel = (item.currentStock / item.minimumStock) * 100;
              const getStockColor = (level) => {
                if (level === 0) return '#e50914';
                if (level <= 50) return '#ffa726';
                return '#66bb6a';
              };

              return (
                <TableRow key={item.id} sx={{
                  '&:hover': {
                    backgroundColor: 'rgba(255, 255, 255, 0.05)'
                  }
                }}>
                  <TableCell>{item.name}</TableCell>
                  <TableCell align="right">{item.currentStock}</TableCell>
                  <TableCell align="right">{item.minimumStock}</TableCell>
                  <TableCell align="right">${item.stockValue.toFixed(2)}</TableCell>
                  <TableCell>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <LinearProgress
                        variant="determinate"
                        value={Math.min(stockLevel, 100)}
                        sx={{
                          width: 100,
                          height: 8,
                          borderRadius: 4,
                          backgroundColor: 'rgba(255, 255, 255, 0.1)',
                          '& .MuiLinearProgress-bar': {
                            backgroundColor: getStockColor(stockLevel)
                          }
                        }}
                      />
                      <Typography variant="body2" sx={{ 
                        color: getStockColor(stockLevel),
                        minWidth: 60 
                      }}>
                        {stockLevel === 0 ? 'Out' : `${Math.round(stockLevel)}%`}
                      </Typography>
                    </Box>
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </TableContainer>
    </Box>
  );
};

export default InventoryReport;
