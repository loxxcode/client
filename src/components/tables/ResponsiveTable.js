import React from 'react';
import {
  Box,
  Card,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Typography,
  useTheme,
  alpha,
  Divider
} from '@mui/material';
import { useResponsive, responsiveStyles } from '../../styles/responsive';
import { formatCurrency } from '../../utils/formatters';

/**
 * A responsive table component that switches to a card list view on mobile devices
 * @param {Object} props Component props
 * @param {Array} props.columns Table column definitions with 'field', 'headerName', 'align', 'renderCell' props
 * @param {Array} props.rows Data rows to display
 * @param {string} props.emptyMessage Message to display when no data is available
 * @param {boolean} props.isLoading Whether the data is loading
 */
const ResponsiveTable = ({ columns, rows, emptyMessage = 'No data available', isLoading = false }) => {
  const theme = useTheme();
  const { isMobile } = useResponsive();
  
  // If loading, render a placeholder
  if (isLoading) {
    return (
      <Paper
        elevation={0}
        sx={{
          background: alpha('#141414', 0.6), // Netflix-inspired dark background
          p: 2,
          textAlign: 'center',
          borderRadius: { xs: 1, sm: 2 }
        }}
      >
        <Typography color="text.secondary">Loading data...</Typography>
      </Paper>
    );
  }
  
  // If no data, show empty message
  if (!rows || rows.length === 0) {
    return (
      <Paper
        elevation={0}
        sx={{
          background: alpha('#141414', 0.6), // Netflix-inspired dark background
          p: 2,
          textAlign: 'center',
          borderRadius: { xs: 1, sm: 2 }
        }}
      >
        <Typography color="text.secondary">{emptyMessage}</Typography>
      </Paper>
    );
  }
  
  // Helper to format cell value based on field type
  const formatCellValue = (value, field) => {
    if (value === undefined || value === null) return '-';
    
    // Format currency fields (detect by field name)
    if (field.includes('price') || field.includes('amount') || field.includes('total') || field.includes('debt') || field.includes('revenue')) {
      return formatCurrency(value);
    }
    
    // Format dates
    if (field.includes('date') && value) {
      return new Date(value).toLocaleDateString();
    }
    
    return value;
  };
  
  // Standard table view for tablets and desktops
  const tableView = (
    <TableContainer 
      component={Paper} 
      elevation={0}
      sx={{
        ...responsiveStyles.tableContainer,
        background: alpha('#141414', 0.6), // Netflix-inspired dark background
        borderRadius: { xs: 1, sm: 2 },
        border: `1px solid ${alpha('#ffffff', 0.1)}`,
      }}
    >
      <Table size={isMobile ? "small" : "medium"} sx={responsiveStyles.mobileTable}>
        <TableHead>
          <TableRow>
            {columns.map((column) => (
              <TableCell 
                key={column.field}
                align={column.align || 'left'}
                sx={{ 
                  fontWeight: 'bold',
                  whiteSpace: 'nowrap',
                  color: theme.palette.text.secondary,
                  borderBottom: `1px solid ${alpha('#ffffff', 0.1)}`,
                  backgroundColor: alpha('#0A0A0A', 0.8), // Darker header for Netflix-inspired look
                  py: { xs: 1.5, sm: 2 }
                }}
              >
                {column.headerName}
              </TableCell>
            ))}
          </TableRow>
        </TableHead>
        <TableBody>
          {rows.map((row, index) => (
            <TableRow 
              key={row.id || index}
              sx={{ 
                '&:hover': { 
                  backgroundColor: alpha(theme.palette.primary.main, 0.05) // Subtle red hover for Netflix feel
                },
                '&:last-child td, &:last-child th': { 
                  borderBottom: 0 
                }
              }}
            >
              {columns.map((column) => (
                <TableCell 
                  key={`${row.id || index}-${column.field}`}
                  align={column.align || 'left'}
                  sx={{ 
                    borderBottom: `1px solid ${alpha('#ffffff', 0.05)}`,
                    py: { xs: 1, sm: 1.5 }
                  }}
                >
                  {column.renderCell ? column.renderCell(row) : formatCellValue(row[column.field], column.field)}
                </TableCell>
              ))}
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </TableContainer>
  );
  
  // Card list view for mobile devices - a more touch-friendly alternative
  const cardListView = (
    <Box sx={responsiveStyles.mobileCardList}>
      {rows.map((row, rowIndex) => (
        <Card 
          key={row.id || rowIndex}
          sx={{
            ...responsiveStyles.netflixMobileCard,
            p: { xs: 1.5, sm: 2 },
          }}
        >
          {columns.map((column, colIndex) => {
            // Skip certain fields that might not be relevant in mobile view
            if (column.hideOnMobile) return null;
            
            // Render divider between items except for the last one
            const needsDivider = colIndex < columns.length - 1 && !columns[colIndex + 1]?.hideOnMobile;
            
            // Format value for display
            const displayValue = column.renderCell 
              ? column.renderCell(row) 
              : formatCellValue(row[column.field], column.field);
            
            return (
              <React.Fragment key={`${row.id || rowIndex}-${column.field}`}>
                <Box sx={{ 
                  display: 'flex', 
                  justifyContent: 'space-between', 
                  alignItems: 'center',
                  py: 0.75
                }}>
                  <Typography 
                    variant="body2" 
                    color="text.secondary"
                    sx={{ fontWeight: 'medium' }}
                  >
                    {column.headerName}:
                  </Typography>
                  
                  <Box sx={{ 
                    textAlign: column.align || 'left',
                    maxWidth: '60%',
                    ...(column.align === 'right' && { ml: 'auto' })
                  }}>
                    {typeof displayValue === 'object' 
                      ? displayValue 
                      : (
                        <Typography 
                          variant="body2"
                          sx={{
                            ...(column.field === 'name' || column.primary ? { fontWeight: 'bold' } : {}),
                            ...(column.field.includes('amount') || column.field.includes('price') 
                              ? { color: theme.palette.primary.main } : {})
                          }}
                        >
                          {displayValue}
                        </Typography>
                      )
                    }
                  </Box>
                </Box>
                {needsDivider && <Divider sx={{ backgroundColor: alpha('#ffffff', 0.1) }} />}
              </React.Fragment>
            );
          })}
        </Card>
      ))}
    </Box>
  );
  
  // Return the appropriate view based on screen size
  return (
    <>
      {/* For mobile devices (below 'md' breakpoint) */}
      <Box sx={{ display: { xs: 'block', md: 'none' } }}>
        {cardListView}
      </Box>
      
      {/* For tablets and desktops (md and above) */}
      <Box sx={{ display: { xs: 'none', md: 'block' } }}>
        {tableView}
      </Box>
    </>
  );
};

export default ResponsiveTable;
