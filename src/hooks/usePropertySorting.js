// hooks/usePropertySorting.js
import { useState, useMemo } from 'react';
import { getSortedProperties, validateSortKey, getSortOptions, getSortLabel } from '../utils/sorting.js';

export function usePropertySorting(properties = [], initialSort = 'title_asc') {
  const [sortKey, setSortKey] = useState(validateSortKey(initialSort));
  
  const sortedProperties = useMemo(() => {
    return getSortedProperties(properties, sortKey);
  }, [properties, sortKey]);
  
  const sortOptions = useMemo(() => {
    return getSortOptions();
  }, []);
  
  const currentSortLabel = useMemo(() => {
    return getSortLabel(sortKey);
  }, [sortKey]);
  
  const updateSort = (newSortKey) => {
    const validSortKey = validateSortKey(newSortKey);
    setSortKey(validSortKey);
    return validSortKey;
  };
  
  const toggleSort = (baseSortKey) => {
    // Alternar entre ascendente y descendente
    const currentDirection = sortKey.endsWith('_desc') ? 'desc' : 'asc';
    const newDirection = currentDirection === 'asc' ? 'desc' : 'asc';
    const newSortKey = `${baseSortKey}_${newDirection}`;
    
    return updateSort(newSortKey);
  };
  
  const isCurrentSort = (checkSortKey) => {
    return sortKey === checkSortKey;
  };
  
  const getSortDirection = () => {
    return sortKey.endsWith('_desc') ? 'desc' : 'asc';
  };
  
  const getBaseSortKey = () => {
    return sortKey.replace(/_asc$|_desc$/, '');
  };
  
  return {
    // Propiedades ordenadas
    sortedProperties,
    
    // Estado actual
    currentSort: sortKey,
    currentSortLabel,
    sortDirection: getSortDirection(),
    baseSortKey: getBaseSortKey(),
    
    // Opciones disponibles
    sortOptions,
    
    // Acciones
    updateSort,
    toggleSort,
    
    // Helpers
    isCurrentSort
  };
}