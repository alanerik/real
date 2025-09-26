// utils/formatters.js
import { DEFAULT_CURRENCY, LOCALE, FALLBACK_PRICE_TEXT, CURRENCY_SYMBOLS } from './constants.js';

export function formatPrice(price, currency = DEFAULT_CURRENCY) {
  // Validación más estricta
  if (!price || !Number.isFinite(Number(price)) || Number(price) <= 0) {
    return FALLBACK_PRICE_TEXT;
  }

  const numericPrice = Number(price);
  
  try {
    // Para Argentina, usar símbolo personalizado si está disponible
    if (CURRENCY_SYMBOLS[currency]) {
      return `${CURRENCY_SYMBOLS[currency]} ${numericPrice.toLocaleString(LOCALE)}`;
    }
    
    // Fallback a Intl.NumberFormat estándar
    return new Intl.NumberFormat(LOCALE, {
      style: 'currency',
      currency,
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(numericPrice);
    
  } catch (error) {
    console.warn(`Error formatting price: ${error.message}. Price: ${price}, Currency: ${currency}`);
    // Fallback más seguro
    return `${currency} ${numericPrice.toLocaleString(LOCALE)}`;
  }
}

// Versión más flexible para diferentes contextos
export function formatPriceRange(minPrice, maxPrice, currency = DEFAULT_CURRENCY) {
  if (!minPrice && !maxPrice) return FALLBACK_PRICE_TEXT;
  
  if (minPrice && maxPrice && minPrice !== maxPrice) {
    return `${formatPrice(minPrice, currency)} - ${formatPrice(maxPrice, currency)}`;
  }
  
  return formatPrice(minPrice || maxPrice, currency);
}

// Formatear número con separadores de miles
export function formatNumber(number) {
  if (!number || !Number.isFinite(Number(number))) return '0';
  return Number(number).toLocaleString(LOCALE);
}

// Formatear fecha
export function formatDate(date, options = {}) {
  if (!date) return '';
  
  const defaultOptions = {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    ...options
  };
  
  try {
    return new Date(date).toLocaleDateString(LOCALE, defaultOptions);
  } catch (error) {
    console.warn(`Error formatting date: ${error.message}. Date: ${date}`);
    return '';
  }
}