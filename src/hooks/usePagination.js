// hooks/usePagination.js
import { useState, useMemo, useEffect } from 'react';
import { calculatePagination, generatePaginationInfo, generatePaginationRange } from '../utils/pagination.js';
import { PAGE_SIZE } from '../utils/constants.js';

export function usePagination(items = [], pageSize = PAGE_SIZE, initialPage = 1) {
  const [currentPage, setCurrentPage] = useState(initialPage);
  
  // Resetear página cuando cambien los items
  useEffect(() => {
    if (Array.isArray(items) && items.length > 0) {
      const maxPages = Math.ceil(items.length / pageSize);
      if (currentPage > maxPages) {
        setCurrentPage(1);
      }
    }
  }, [items.length, pageSize, currentPage]);
  
  const pagination = useMemo(() => {
    return calculatePagination(items, pageSize, currentPage);
  }, [items, pageSize, currentPage]);
  
  const paginationInfo = useMemo(() => {
    return generatePaginationInfo(pagination);
  }, [pagination]);
  
  const paginationRange = useMemo(() => {
    return generatePaginationRange(pagination.currentPage, pagination.totalPages);
  }, [pagination.currentPage, pagination.totalPages]);
  
  const goToPage = (page) => {
    const validPage = Math.max(1, Math.min(page, pagination.totalPages || 1));
    setCurrentPage(validPage);
    return validPage;
  };
  
  const goToNext = () => {
    if (pagination.hasNext) {
      return goToPage(currentPage + 1);
    }
    return currentPage;
  };
  
  const goToPrev = () => {
    if (pagination.hasPrev) {
      return goToPage(currentPage - 1);
    }
    return currentPage;
  };
  
  const goToFirst = () => {
    return goToPage(1);
  };
  
  const goToLast = () => {
    return goToPage(pagination.totalPages);
  };
  
  const reset = () => {
    setCurrentPage(1);
  };
  
  return {
    // Datos de paginación
    ...pagination,
    
    // Información formateada
    paginationInfo,
    paginationRange,
    
    // Acciones
    goToPage,
    goToNext,
    goToPrev,
    goToFirst,
    goToLast,
    reset,
    
    // Estado
    canGoNext: pagination.hasNext,
    canGoPrev: pagination.hasPrev
  };
}