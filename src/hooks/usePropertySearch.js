// hooks/usePropertySearch.js - Hook combinado para búsqueda completa
import { useMemo } from 'react';
import { usePropertyFiltering } from './usePropertyFiltering.js';
import { usePropertySorting } from './usePropertySorting.js';
import { usePagination } from './usePagination.js';
import { useUrlParams } from './useUrlParams.js';
import { getPropertyStats } from '../utils/propertyFilters.js';

export function usePropertySearch(initialProperties = [], options = {}) {
  const {
    pageSize = 8,
    initialSort = 'title_asc',
    syncWithUrl = true
  } = options;
  
  // Manejo de parámetros URL (opcional)
  const urlParams = useUrlParams();
  
  // Filtrado de propiedades
  const filtering = usePropertyFiltering(initialProperties);
  
  // Aplicar filtros desde URL si está habilitado
  if (syncWithUrl && urlParams.hasAnyParams) {
    const urlFilters = {
      operation: urlParams.getParam('operation'),
      city: urlParams.getParam('city'),
      propertyType: urlParams.getParam('propertyType'),
      ambientes: urlParams.getParam('ambientes'),
      minPrice: urlParams.getParam('minPrice'),
      maxPrice: urlParams.getParam('maxPrice'),
      search: urlParams.getParam('search')
    };
    
    // Solo actualizar si los filtros son diferentes
    const currentFilters = filtering.getActiveFilters();
    const hasChanges = Object.entries(urlFilters).some(([key, value]) => {
      return value && currentFilters[key] !== value;
    });
    
    if (hasChanges) {
      filtering.updateMultipleFilters(urlFilters);
    }
  }
  
  // Ordenamiento
  const initialSortFromUrl = syncWithUrl ? urlParams.getParam('sort', initialSort) : initialSort;
  const sorting = usePropertySorting(filtering.filteredProperties, initialSortFromUrl);
  
  // Paginación
  const initialPageFromUrl = syncWithUrl ? parseInt(urlParams.getParam('page', '1'), 10) : 1;
  const pagination = usePagination(sorting.sortedProperties, pageSize, initialPageFromUrl);
  
  // Estadísticas de propiedades
  const stats = useMemo(() => {
    return getPropertyStats(filtering.filteredProperties);
  }, [filtering.filteredProperties]);
  
  // Sincronizar cambios con URL
  const syncFiltersWithUrl = (newFilters) => {
    if (syncWithUrl) {
      urlParams.updateMultipleParams({
        ...newFilters,
        page: 1 // Reset page when filters change
      });
    }
    filtering.updateMultipleFilters(newFilters);
    pagination.reset();
  };
  
  const syncSortWithUrl = (newSort) => {
    if (syncWithUrl) {
      urlParams.updateUrlParam('sort', newSort);
    }
    sorting.updateSort(newSort);
  };
  
  const syncPageWithUrl = (newPage) => {
    if (syncWithUrl) {
      urlParams.updateUrlParam('page', newPage.toString());
    }
    pagination.goToPage(newPage);
  };
  
  // Reset completo
  const resetSearch = () => {
    filtering.clearFilters();
    sorting.updateSort(initialSort);
    pagination.reset();
    
    if (syncWithUrl) {
      urlParams.clearAllParams();
    }
  };
  
  return {
    // Datos procesados
    properties: pagination.items,
    allFilteredProperties: filtering.filteredProperties,
    totalResults: filtering.filteredProperties.length,
    
    // Estados
    filters: filtering.filters,
    currentSort: sorting.currentSort,
    currentPage: pagination.currentPage,
    totalPages: pagination.totalPages,
    
    // Estadísticas
    stats,
    
    // Info de paginación
    paginationInfo: pagination.paginationInfo,
    paginationRange: pagination.paginationRange,
    
    // Acciones de filtrado
    updateFilter: filtering.updateFilter,
    updateFilters: syncFiltersWithUrl,
    clearFilters: filtering.clearFilters,
    clearFilter: filtering.clearFilter,
    
    // Acciones de ordenamiento
    updateSort: syncSortWithUrl,
    sortOptions: sorting.sortOptions,
    
    // Acciones de paginación
    goToPage: syncPageWithUrl,
    goToNext: pagination.goToNext,
    goToPrev: pagination.goToPrev,
    goToFirst: pagination.goToFirst,
    goToLast: pagination.goToLast,
    
    // Estados de navegación
    canGoNext: pagination.canGoNext,
    canGoPrev: pagination.canGoPrev,
    
    // Utilidades
    hasActiveFilters: filtering.hasActiveFilters,
    activeFiltersCount: filtering.activeFiltersCount,
    resetSearch,
    
    // URL helpers (si syncWithUrl está habilitado)
    ...(syncWithUrl && {
      buildUrl: urlParams.buildUrl,
      urlParams: urlParams.params
    })
  };
}