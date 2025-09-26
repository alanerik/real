// hooks/useUrlParams.js
import { useState, useEffect, useCallback } from 'react';
import { parseUrlFilters, buildSearchUrl } from '../utils/urlBuilder.js';

export function useUrlParams(initialParams = {}) {
  const [params, setParams] = useState(initialParams);
  
  // Sincronizar con URL al montar
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const urlParams = parseUrlFilters(window.location.href);
      setParams(prev => ({ ...prev, ...urlParams }));
    }
  }, []);
  
  const updateUrlParam = useCallback((key, value) => {
    if (typeof window !== 'undefined') {
      const newParams = { ...params, [key]: value };
      
      // Limpiar valores vacíos
      if (!value || value === '') {
        delete newParams[key];
      }
      
      // Construir nueva URL
      const newUrl = buildSearchUrl(window.location.pathname, newParams);
      
      // Actualizar URL sin recargar página
      window.history.pushState({}, '', newUrl);
      
      // Actualizar estado
      setParams(newParams);
    }
  }, [params]);
  
  const updateMultipleParams = useCallback((newParams) => {
    if (typeof window !== 'undefined') {
      const updatedParams = { ...params };
      
      // Aplicar cambios
      Object.entries(newParams).forEach(([key, value]) => {
        if (!value || value === '') {
          delete updatedParams[key];
        } else {
          updatedParams[key] = value;
        }
      });
      
      // Construir nueva URL
      const newUrl = buildSearchUrl(window.location.pathname, updatedParams);
      
      // Actualizar URL sin recargar página
      window.history.pushState({}, '', newUrl);
      
      // Actualizar estado
      setParams(updatedParams);
    }
  }, [params]);
  
  const clearParam = useCallback((key) => {
    updateUrlParam(key, null);
  }, [updateUrlParam]);
  
  const clearAllParams = useCallback(() => {
    if (typeof window !== 'undefined') {
      // Ir a URL limpia
      window.history.pushState({}, '', window.location.pathname);
      setParams({});
    }
  }, []);
  
  const getParam = useCallback((key, defaultValue = null) => {
    return params[key] || defaultValue;
  }, [params]);
  
  const hasParam = useCallback((key) => {
    return key in params && params[key] !== '' && params[key] !== null;
  }, [params]);
  
  const buildUrl = useCallback((overrideParams = {}) => {
    if (typeof window !== 'undefined') {
      const finalParams = { ...params, ...overrideParams };
      return buildSearchUrl(window.location.pathname, finalParams);
    }
    return '';
  }, [params]);
  
  return {
    // Estado
    params,
    
    // Acciones
    updateUrlParam,
    updateMultipleParams,
    clearParam,
    clearAllParams,
    
    // Helpers
    getParam,
    hasParam,
    buildUrl,
    
    // Verificadores comunes
    hasAnyParams: Object.keys(params).length > 0
  };
}