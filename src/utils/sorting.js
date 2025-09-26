// utils/sorting.js
import { LOCALE, SORT_OPTIONS } from './constants.js';

// Funciones de comparación más específicas
const compareFunctions = {
  price_asc: (a, b) => {
    const priceA = Number(a.data?.price) || Infinity;
    const priceB = Number(b.data?.price) || Infinity;
    return priceA - priceB;
  },
  
  price_desc: (a, b) => {
    const priceA = Number(a.data?.price) || 0;
    const priceB = Number(b.data?.price) || 0;
    return priceB - priceA;
  },
  
  date_desc: (a, b) => {
    const dateA = new Date(a.data?.publishDate || a.data?.createdAt || '1970-01-01');
    const dateB = new Date(b.data?.publishDate || b.data?.createdAt || '1970-01-01');
    return dateB.getTime() - dateA.getTime();
  },
  
  date_asc: (a, b) => {
    const dateA = new Date(a.data?.publishDate || a.data?.createdAt || '1970-01-01');
    const dateB = new Date(b.data?.publishDate || b.data?.createdAt || '1970-01-01');
    return dateA.getTime() - dateB.getTime();
  },
  
  title_asc: (a, b) => {
    const titleA = a.data?.title || '';
    const titleB = b.data?.title || '';
    return titleA.localeCompare(titleB, LOCALE, { 
      numeric: true, 
      sensitivity: 'base' 
    });
  },
  
  title_desc: (a, b) => {
    const titleA = a.data?.title || '';
    const titleB = b.data?.title || '';
    return titleB.localeCompare(titleA, LOCALE, { 
      numeric: true, 
      sensitivity: 'base' 
    });
  },
  
  ambientes_asc: (a, b) => {
    const ambientesA = Number(a.data?.ambientes) || 0;
    const ambientesB = Number(b.data?.ambientes) || 0;
    return ambientesA - ambientesB;
  },
  
  ambientes_desc: (a, b) => {
    const ambientesA = Number(a.data?.ambientes) || 0;
    const ambientesB = Number(b.data?.ambientes) || 0;
    return ambientesB - ambientesA;
  }
};

export function getSortedProperties(properties, sortKey = 'title_asc') {
  if (!Array.isArray(properties) || properties.length === 0) {
    return [];
  }
  
  const compareFunction = compareFunctions[sortKey] || compareFunctions.title_asc;
  
  // Crear una copia para no mutar el array original
  return [...properties].sort(compareFunction);
}

// Función helper para obtener opciones de ordenamiento disponibles
export function getSortOptions() {
  return SORT_OPTIONS;
}

// Obtener label para una clave de ordenamiento
export function getSortLabel(sortKey) {
  const option = SORT_OPTIONS.find(opt => opt.value === sortKey);
  return option?.label || 'Título A-Z';
}