import axios from 'axios';

const BASE_URL = 'https://server-az7z.onrender.com/api';

export const reportApi = {
  // 1. Sales Report
  getSalesReport: async (startDate, endDate) => {
    try {
      const response = await axios.get(`${BASE_URL}/reports/sales`, {
        params: { startDate, endDate }
      });
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Failed to fetch sales report');
    }
  },

  // 2. Stock Status Report
  getStockStatusReport: async () => {
    try {
      const response = await axios.get(`${BASE_URL}/reports/stock-status`);
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Failed to fetch stock status report');
    }
  },

  // 3. Supplier Delivery Report
  getSupplierDeliveryReport: async (startDate, endDate, supplierId = null) => {
    try {
      const params = { startDate, endDate };
      if (supplierId) params.supplierId = supplierId;

      const response = await axios.get(`${BASE_URL}/reports/supplier-deliveries`, {
        params
      });
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Failed to fetch supplier delivery report');
    }
  },

  // 4. Profit Report
  getProfitReport: async (startDate, endDate) => {
    try {
      const response = await axios.get(`${BASE_URL}/reports/profit`, {
        params: { startDate, endDate }
      });
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Failed to fetch profit report');
    }
  },

  // 5. Outstanding Debts Report
  getOutstandingDebtsReport: async () => {
    try {
      const response = await axios.get(`${BASE_URL}/reports/outstanding-debts`);
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Failed to fetch outstanding debts report');
    }
  },

  // 6. Product Sales Report
  getProductSalesReport: async (startDate, endDate) => {
    try {
      const response = await axios.get(`${BASE_URL}/reports/product-sales`, {
        params: { startDate, endDate }
      });
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Failed to fetch product sales report');
    }
  }
};