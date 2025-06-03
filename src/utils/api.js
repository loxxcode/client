import axios from './axiosConfig';
// Products API
export const getProducts = async () => {
  const response = await axios.get('/api/products');
  return response.data;
};

export const getProduct = async (id) => {
  const response = await axios.get(`/api/products/${id}`);
  return response.data;
};

export const createProduct = async (productData) => {
  const response = await axios.post('/api/products', productData);
  return response.data;
};

export const updateProduct = async (id, productData) => {
  const response = await axios.put(`/api/products/${id}`, productData);
  return response.data;
};

export const deleteProduct = async (id) => {
  const response = await axios.delete(`/api/products/${id}`);
  return response.data;
};

export const getLowStockProducts = async () => {
  const response = await axios.get('/api/products/low-stock');
  return response.data;
};

// Suppliers API
export const getSuppliers = async () => {
  const response = await axios.get('/api/suppliers');
  return response.data;
};

export const getSupplier = async (id) => {
  const response = await axios.get(`/api/suppliers/${id}`);
  return response.data;
};

export const createSupplier = async (supplierData) => {
  const response = await axios.post('/api/suppliers', supplierData);
  return response.data;
};

export const updateSupplier = async (id, supplierData) => {
  const response = await axios.put(`/api/suppliers/${id}`, supplierData);
  return response.data;
};

export const deleteSupplier = async (id) => {
  const response = await axios.delete(`/api/suppliers/${id}`);
  return response.data;
};

export const getSuppliersWithDebt = async () => {
  const response = await axios.get('/api/suppliers/with-debt');
  return response.data;
};

// Stock In API
export const getStockIns = async (filters = {}) => {
  const queryParams = new URLSearchParams();
  
  if (filters.startDate) queryParams.append('startDate', filters.startDate);
  if (filters.endDate) queryParams.append('endDate', filters.endDate);
  if (filters.supplier) queryParams.append('supplier', filters.supplier);
  if (filters.product) queryParams.append('product', filters.product);
  if (filters.paymentStatus) queryParams.append('paymentStatus', filters.paymentStatus);
  
  const url = `/api/stock-in?${queryParams.toString()}`;
  const response = await axios.get(url);
  return response.data;
};

export const getStockIn = async (id) => {
  const response = await axios.get(`/api/stock-in/${id}`);
  return response.data;
};

export const createStockIn = async (stockInData) => {
  const response = await axios.post('/api/stock-in', stockInData);
  return response.data;
};

export const updateStockIn = async (id, stockInData) => {
  const response = await axios.put(`/api/stock-in/${id}`, stockInData);
  return response.data;
};

export const deleteStockIn = async (id) => {
  const response = await axios.delete(`/api/stock-in/${id}`);
  return response.data;
};

// Stock Out API
export const getStockOuts = async (filters = {}) => {
  const queryParams = new URLSearchParams();
  
  if (filters.startDate) queryParams.append('startDate', filters.startDate);
  if (filters.endDate) queryParams.append('endDate', filters.endDate);
  if (filters.product) queryParams.append('product', filters.product);
  if (filters.customer) queryParams.append('customer', filters.customer);
  
  const url = `/api/stock-out?${queryParams.toString()}`;
  const response = await axios.get(url);
  return response.data;
};

export const getStockOut = async (id) => {
  const response = await axios.get(`/api/stock-out/${id}`);
  return response.data;
};

export const createStockOut = async (stockOutData) => {
  const response = await axios.post('/api/stock-out', stockOutData);
  return response.data;
};

export const updateStockOut = async (id, stockOutData) => {
  const response = await axios.put(`/api/stock-out/${id}`, stockOutData);
  return response.data;
};

export const deleteStockOut = async (id) => {
  const response = await axios.delete(`/api/stock-out/${id}`);
  return response.data;
};

export const getTodaySales = async () => {
  const response = await axios.get('/api/stock-out/today');
  return response.data;
};

// Reports API
export const getSalesReport = async (startDate, endDate) => {
  try {
    if (!startDate || !endDate) {
      throw new Error('Both startDate and endDate are required');
    }

    // Format dates to YYYY-MM-DD
    const formatDate = (date) => {
      try {
        return new Date(date).toISOString().split('T')[0];
      } catch (error) {
        console.error('Error formatting date:', { date, error });
        throw new Error('Invalid date format. Please use valid date objects');
      }
    };

    const formattedStartDate = formatDate(startDate);
    const formattedEndDate = formatDate(endDate);

    console.log('Fetching sales report with:', { 
      startDate: formattedStartDate, 
      endDate: formattedEndDate 
    });

    const response = await axios.get('/api/reports/sales', {
      params: {
        startDate: formattedStartDate,
        endDate: formattedEndDate
      }
    });
    
    // Process the response data
    const responseData = response.data;
    
    if (!responseData) {
      throw new Error('Empty response from server');
    }

    // Ensure the response has the expected structure with default values
    return {
      success: true,
      message: responseData.message || 'Success',
      totalSales: responseData.totalSales || 0,
      totalRevenue: responseData.totalRevenue || 0,
      productSales: Array.isArray(responseData.productSales) 
        ? responseData.productSales.map(product => ({
            id: product.productId || product._id || `temp-${Math.random().toString(36).substr(2, 9)}`,
            productName: product.productName || 'Unknown Product',
            category: product.category || 'Uncategorized',
            totalQuantity: Number(product.totalQuantity) || 0,
            totalAmount: Number(product.totalAmount) || 0
          }))
        : [],
      dailySales: Array.isArray(responseData.dailySales) 
        ? responseData.dailySales.map(sale => ({
            date: sale.date || new Date().toISOString().split('T')[0],
            totalAmount: Number(sale.totalAmount) || 0,
            salesCount: Number(sale.salesCount) || 0
          }))
        : []
    };
  } catch (error) {
    console.error('Error in getSalesReport:', error);
    throw new Error(error.response?.data?.message || error.message || 'Failed to fetch sales report');
  }
};

export const getProductSalesReport = async (startDate, endDate) => {
  const response = await axios.get(`/api/reports/product-sales?startDate=${startDate}&endDate=${endDate}`);
  return response.data;
};

export const getStockStatusReport = async () => {
  const response = await axios.get('/api/reports/stock-status');
  return response.data;
};

export const getSupplierDeliveriesReport = async (startDate, endDate, supplierId = '') => {
  const url = `/api/reports/supplier-deliveries?startDate=${startDate}&endDate=${endDate}${supplierId ? `&supplierId=${supplierId}` : ''}`;
  const response = await axios.get(url);
  return response.data;
};

export const getProfitReport = async (startDate, endDate) => {
  const response = await axios.get(`/api/reports/profit?startDate=${startDate}&endDate=${endDate}`);
  return response.data;
};

export const getOutstandingDebtsReport = async () => {
  const response = await axios.get('/api/reports/outstanding-debts');
  return response.data;
};

export const getActivityReport = async (startDate, endDate) => {
  try {
    const response = await axios.get('/api/reports/activities', {
      params: { startDate, endDate }
    });
    
    // Ensure we have valid data
    const activities = Array.isArray(response.data) ? response.data : [];
    const activityTypes = ['Sale', 'Delivery', 'Stock Update', 'Payment', 'Return'];
    
    // Create activity distribution data
    const activityDistribution = activityTypes.map(type => ({
      activityType: type,
      count: activities.filter(a => a?.activityType === type).length || 0
    }));
    
    // Transform and validate each activity
    const validActivities = activities
      .filter(activity => activity && typeof activity === 'object')
      .map(activity => ({
        _id: activity._id || `temp-${Math.random()}`,
        date: activity.date || new Date().toISOString(),
        activityType: activity.activityType || 'Unknown',
        details: activity.details || 'No details available',
        amount: parseFloat(activity.amount) || 0,
        status: activity.status || 'Completed'
      }));
    
    return {
      totalActivities: validActivities.length,
      totalSales: validActivities
        .filter(a => a.activityType === 'Sale')
        .reduce((sum, a) => sum + a.amount, 0),
      totalDeliveries: validActivities.filter(a => a.activityType === 'Delivery').length,
      activityDistribution,
      data: validActivities
    };
  } catch (error) {
    console.error('Error fetching activity report:', error);
    // Return empty data structure to avoid null errors
    return {
      totalActivities: 0,
      totalSales: 0,
      totalDeliveries: 0,
      activityDistribution: [],
      data: []
    };
  }
};
