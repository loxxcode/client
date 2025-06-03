/**
 * Utility functions for formatting values consistently across the application
 */

/**
 * Format a number as Rwandan Francs
 * @param {number} value - The monetary value to format
 * @returns {string} Formatted string with RWF currency
 */
export const formatCurrency = (value) => {
  if (value === null || value === undefined) return 'RWF 0';
  return `RWF ${parseFloat(value).toLocaleString('en-US', {
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  })}`;
};

/**
 * Format a percentage value
 * @param {number} value - The percentage value to format
 * @returns {string} Formatted string with % sign
 */
export const formatPercentage = (value) => {
  if (value === null || value === undefined) return '0%';
  return `${parseFloat(value).toFixed(1)}%`;
};

/**
 * Format a date to localized string
 * @param {Date|string} date - The date to format
 * @returns {string} Formatted date string
 */
export const formatDate = (date) => {
  if (!date) return '';
  const dateObj = new Date(date);
  return dateObj.toLocaleDateString();
};
