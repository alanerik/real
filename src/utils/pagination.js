// utils/pagination.js
import { PAGE_SIZE, DEFAULT_PAGE } from './constants.js';

export function calculatePagination(items, pageSize = PAGE_SIZE, currentPage = DEFAULT_PAGE) {
  const totalItems = Array.isArray(items) ? items.length : 0;
  const totalPages = Math.ceil(totalItems / pageSize);
  const validCurrentPage = Math.max(DEFAULT_PAGE, Math.min(currentPage, totalPages || DEFAULT_PAGE));
  const startIndex = (validCurrentPage - 1) * pageSize;
  const endIndex = startIndex + pageSize;
  
  return {
    totalPages,
    totalItems,
    currentPage: validCurrentPage,
    pageSize,
    startIndex,
    endIndex,
    items: totalItems > 0 ? items.slice(startIndex, endIndex) : [],
    hasNext: validCurrentPage < totalPages,
    hasPrev: validCurrentPage > 1,
    isFirstPage: validCurrentPage === 1,
    isLastPage: validCurrentPage === totalPages || totalPages === 0
  };
}

export function generatePaginationInfo(pagination) {
  const { currentPage, totalPages, totalItems, startIndex, pageSize } = pagination;
  
  if (totalItems === 0) {
    return {
      showing: 'No se encontraron resultados',
      pages: `Página ${currentPage} de ${Math.max(1, totalPages)}`
    };
  }
  
  const start = startIndex + 1;
  const end = Math.min(startIndex + pageSize, totalItems);
  
  return {
    showing: `Mostrando ${start}-${end} de ${totalItems} resultados`,
    pages: `Página ${currentPage} de ${totalPages}`
  };
}

export function generatePaginationRange(currentPage, totalPages, maxVisible = 5) {
  if (totalPages <= maxVisible) {
    return Array.from({ length: totalPages }, (_, i) => i + 1);
  }
  
  const halfVisible = Math.floor(maxVisible / 2);
  let start = Math.max(1, currentPage - halfVisible);
  let end = Math.min(totalPages, start + maxVisible - 1);
  
  // Ajustar si estamos cerca del final
  if (end - start < maxVisible - 1) {
    start = Math.max(1, end - maxVisible + 1);
  }
  
  return Array.from({ length: end - start + 1 }, (_, i) => start + i);
}