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
  // Create a cancel token source at the beginning only if axios and CancelToken exist
  let source;
  let timeoutId;
  
  try {
    if (axios && axios.CancelToken) {
      const CancelToken = axios.CancelToken;
      source = CancelToken.source();
    }
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
    
    // Add a timeout to cancel the request if it takes too long
    // Only set timeout if source exists
    if (source) {
      timeoutId = setTimeout(() => {
        source.cancel('Request took too long');
      }, 30000); // 30 seconds timeout
    }

    const params = {
      startDate: formattedStartDate,
      endDate: formattedEndDate
    };

    const axiosConfig = { params };
    
    // Only add cancel token if source exists
    if (source) {
      axiosConfig.cancelToken = source.token;
    }

    const response = await axios.get('/api/reports/sales', axiosConfig);
    
    // Clear the timeout since the request completed
    if (timeoutId) clearTimeout(timeoutId);
    
    // Process the response data
    const responseData = response.data;
    
    if (!responseData) {
      throw new Error('Empty response from server');
    }

    // Ensure the response has the expected structure
    const result = {
      success: responseData.success,
      message: responseData.message,
      totalSales: responseData.totalSales || 0,
      totalRevenue: responseData.totalRevenue || 0,
      productSales: Array.isArray(responseData.productSales) 
        ? responseData.productSales 
        : [],
      dailySales: Array.isArray(responseData.dailySales) 
        ? responseData.dailySales 
        : [],
      // Add any additional fields from the response
      ...responseData
    };

    console.log('Sales report response:', result);
    return result;
  } catch (error) {
    // Clear timeout if it exists
    if (timeoutId) {
      clearTimeout(timeoutId);
    }
    let errorMessage = 'Failed to fetch sales report';
    let errorDetails = {};

    if (axios.isCancel(error)) {
      errorMessage = 'Request was cancelled';
      errorDetails = { reason: 'cancelled' };
    } else if (error.response) {
      // Server responded with a status code outside 2xx
      const { status, data } = error.response;
      errorMessage = data?.message || `Server responded with status ${status}`;
      errorDetails = {
        status,
        data: data || {},
        headers: error.response.headers
      };
    } else if (error.request) {
      // Request was made but no response received
      errorMessage = 'No response received from server';
      errorDetails = { request: error.request };
    } else {
      // Something happened in setting up the request
      errorMessage = error.message || 'Error setting up request';
      errorDetails = { message: error.message };
    }

    console.error('Error in getSalesReport:', {
      message: errorMessage,
      ...errorDetails,
      config: {
        url: error.config?.url,
        params: error.config?.params,
        method: error.config?.method,
        timeout: error.config?.timeout
      },
      stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
    });

    // Create a new error with our formatted message
    const formattedError = new Error(errorMessage);
    formattedError.isAxiosError = axios.isAxiosError(error);
    formattedError.response = error.response;
    formattedError.request = error.request;
    
    throw formattedError;
  } finally {
    // Always clean up the timeout
    if (timeoutId) {
      clearTimeout(timeoutId);
    }
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
