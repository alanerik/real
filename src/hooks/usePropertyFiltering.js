// hooks/usePropertyFiltering.js
import { useState, useMemo } from 'react';
import { filterProperties } from '../utils/propertyFilters.js';

export function usePropertyFiltering(initialProperties = []) {
  const [filters, setFilters] = useState({
    operation: '',
    city: '',
    propertyType: '',
    ambientes: '',
    minPrice: '',
    maxPrice: '',
    currency: '',
    search: ''
  });
  
  const filteredProperties = useMemo(() => {
    return filterProperties(initialProperties, filters);
  }, [initialProperties, filters]);
  
  const updateFilter = (key, value) => {
    setFilters(prev => ({ 
      ...prev, 
      [key]: value === '' ? '' : value 
    }));
  };
  
  const updateMultipleFilters = (newFilters) => {
    setFilters(prev => ({ ...prev, ...newFilters }));
  };
  
  const clearFilters = () => {
    setFilters({
      operation: '',
      city: '',
      propertyType: '',
      ambientes: '',
      minPrice: '',
      maxPrice: '',
      currency: '',
      search: ''
    });
  };
  
  const clearFilter = (key) => {
    setFilters(prev => ({ ...prev, [key]: '' }));
  };
  
  const hasActiveFilters = useMemo(() => {
    return Object.values(filters).some(value => value !== '');
  }, [filters]);
  
  const activeFiltersCount = useMemo(() => {
    return Object.values(filters).filter(value => value !== '').length;
  }, [filters]);
  
  const getActiveFilters = () => {
    const active = {};
    Object.entries(filters).forEach(([key, value]) => {
      if (value !== '') {
        active[key] = value;
      }
    });
    return active;
  };
  
  return {
    filters,
    filteredProperties,
    updateFilter,
    updateMultipleFilters,
    clearFilters,
    clearFilter,
    hasActiveFilters,
    activeFiltersCount,
    getActiveFilters
  };
}