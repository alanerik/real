// utils/validation.js
import { VALID_OPERATIONS, VALID_SORT_KEYS } from './constants.js';

export function validatePage(page, totalPages = 1) {
  // Validación más robusta
  if (!page) return 1;
  
  const pageNum = parseInt(String(page), 10);
  
  // Verificar si es un número válido
  if (!Number.isInteger(pageNum) || pageNum < 1) return 1;
  
  // Si totalPages es 0 o undefined, devolver 1
  const maxPages = Math.max(1, totalPages || 1);
  
  return Math.min(pageNum, maxPages);
}

export function validateSortKey(sortKey, allowedSortKeys = []) {
  const validSorts = allowedSortKeys.length > 0 ? allowedSortKeys : VALID_SORT_KEYS;
  
  return validSorts.includes(sortKey) ? sortKey : 'title_asc';
}

export function validatePropertyParams(params) {
  const { operacion, ciudad, tipoPropiedad } = params;
  
  if (!operacion || !ciudad || !tipoPropiedad) {
    return { 
      isValid: false, 
      error: 'Missing required parameters',
      details: { operacion: !!operacion, ciudad: !!ciudad, tipoPropiedad: !!tipoPropiedad }
    };
  }
  
  if (!VALID_OPERATIONS.includes(operacion)) {
    return { 
      isValid: false, 
      error: 'Invalid operation',
      details: { received: operacion, valid: VALID_OPERATIONS }
    };
  }
  
  return { isValid: true };
}

export function validateAmbientes(ambientes) {
  if (!ambientes) return null;
  
  // Permitir "5+" como valor especial
  if (ambientes === '5+') return '5+';
  
  const num = parseInt(ambientes, 10);
  if (!Number.isInteger(num) || num < 0) return null;
  
  return num.toString();
}

export function validatePrice(price) {
  if (!price) return null;
  
  const numPrice = Number(price);
  if (!Number.isFinite(numPrice) || numPrice <= 0) return null;
  
  return numPrice;
}

export function validateCurrency(currency) {
  const validCurrencies = ['USD', 'ARS', 'EUR'];
  return validCurrencies.includes(currency) ? currency : 'USD';
}