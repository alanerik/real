// utils/urlBuilder.js
export function buildPropertyUrl(operation, city, propertyType, params = {}) {
  if (!operation || !city || !propertyType) {
    throw new Error('Missing required parameters for URL building');
  }
  
  const baseUrl = `/propiedades/${operation}/${city}/${propertyType}`;
  const searchParams = new URLSearchParams();
  
  // Agregar parámetros válidos
  Object.entries(params).forEach(([key, value]) => {
    if (value !== null && value !== undefined && value !== '') {
      searchParams.append(key, value.toString());
    }
  });
  
  const queryString = searchParams.toString();
  return baseUrl + (queryString ? `?${queryString}` : '');
}

export function parseUrlFilters(url) {
  try {
    const urlObj = new URL(url);
    const params = {};
    
    // Extraer parámetros comunes
    const commonParams = ['ambientes', 'page', 'sort', 'minPrice', 'maxPrice', 'currency', 'search'];
    
    commonParams.forEach(param => {
      const value = urlObj.searchParams.get(param);
      if (value !== null) {
        params[param] = value;
      }
    });
    
    // Convertir page a número
    if (params.page) {
      params.page = parseInt(params.page, 10) || 1;
    }
    
    // Convertir precios a números
    if (params.minPrice) {
      params.minPrice = parseFloat(params.minPrice) || undefined;
    }
    if (params.maxPrice) {
      params.maxPrice = parseFloat(params.maxPrice) || undefined;
    }
    
    return params;
  } catch (error) {
    console.warn(`Error parsing URL filters: ${error.message}`);
    return {};
  }
}

export function buildSearchUrl(baseUrl, filters = {}) {
  const url = new URL(baseUrl, window.location.origin);
  
  Object.entries(filters).forEach(([key, value]) => {
    if (value !== null && value !== undefined && value !== '') {
      url.searchParams.set(key, value.toString());
    } else {
      url.searchParams.delete(key);
    }
  });
  
  return url.pathname + url.search;
}

export function buildPaginationUrls(baseUrl, currentPage, totalPages, filters = {}) {
  const urls = {
    first: null,
    prev: null,
    next: null,
    last: null
  };
  
  if (totalPages <= 1) return urls;
  
  // Primera página
  if (currentPage > 1) {
    urls.first = buildSearchUrl(baseUrl, { ...filters, page: 1 });
  }
  
  // Página anterior
  if (currentPage > 1) {
    urls.prev = buildSearchUrl(baseUrl, { ...filters, page: currentPage - 1 });
  }
  
  // Página siguiente
  if (currentPage < totalPages) {
    urls.next = buildSearchUrl(baseUrl, { ...filters, page: currentPage + 1 });
  }
  
  // Última página
  if (currentPage < totalPages) {
    urls.last = buildSearchUrl(baseUrl, { ...filters, page: totalPages });
  }
  
  return urls;
}

export function getCanonicalUrl(baseUrl, filters = {}) {
  // Crear URL canónica sin parámetros temporales como 'search'
  const canonicalFilters = { ...filters };
  delete canonicalFilters.search; // Los filtros de búsqueda no van en canonical
  
  return buildSearchUrl(baseUrl, canonicalFilters);
}