// utils/propertyFilters.js
export function filterProperties(properties, filters) {
  if (!Array.isArray(properties)) return [];

  return properties.filter(property => {
    const { data } = property;
    if (!data) return false;

    // Helper to normalize strings for comparison
    const normalize = (str) => str ? str.toLowerCase().trim().replace(/ /g, '-') : '';

    // Filtro por operación
    if (filters.operation && normalize(data.operation) !== normalize(filters.operation)) {
      return false;
    }

    // Filtro por ciudad
    if (filters.city && normalize(data.city) !== normalize(filters.city)) {
      return false;
    }

    // Filtro por tipo de propiedad
    if (filters.propertyType && normalize(data.propertyType) !== normalize(filters.propertyType)) {
      return false;
    }

    // Filtro por ambientes
    if (filters.ambientes) {
      if (filters.ambientes === '5+') {
        if ((data.ambientes || 0) < 5) return false;
      } else {
        const targetAmbientes = parseInt(filters.ambientes, 10);
        if (data.ambientes !== targetAmbientes) return false;
      }
    }

    // Filtro por rango de precios
    if (filters.minPrice && (data.price || 0) < filters.minPrice) {
      return false;
    }

    if (filters.maxPrice && (data.price || 0) > filters.maxPrice) {
      return false;
    }

    // Filtro por moneda
    if (filters.currency && data.currency !== filters.currency) {
      return false;
    }

    // Filtro por texto (búsqueda en título y descripción)
    if (filters.search) {
      const searchTerm = filters.search.toLowerCase();
      const title = (data.title || '').toLowerCase();
      const description = (data.description || '').toLowerCase();

      if (!title.includes(searchTerm) && !description.includes(searchTerm)) {
        return false;
      }
    }

    return true;
  });
}

export function getUniqueFilterValues(properties, field) {
  if (!Array.isArray(properties)) return [];

  const values = properties
    .map(property => property.data?.[field])
    .filter(Boolean)
    .filter((value, index, array) => array.indexOf(value) === index);

  return values.sort();
}

export function getPropertyStats(properties) {
  if (!Array.isArray(properties) || properties.length === 0) {
    return {
      total: 0,
      byOperation: {},
      byCity: {},
      byType: {},
      priceRange: { min: 0, max: 0 },
      averagePrice: 0
    };
  }

  const stats = {
    total: properties.length,
    byOperation: {},
    byCity: {},
    byType: {},
    priceRange: { min: Infinity, max: 0 },
    averagePrice: 0
  };

  let totalPrice = 0;
  let priceCount = 0;

  properties.forEach(property => {
    const { data } = property;
    if (!data) return;

    // Contar por operación
    stats.byOperation[data.operation] = (stats.byOperation[data.operation] || 0) + 1;

    // Contar por ciudad
    if (data.city) {
      stats.byCity[data.city] = (stats.byCity[data.city] || 0) + 1;
    }

    // Contar por tipo
    if (data.propertyType) {
      stats.byType[data.propertyType] = (stats.byType[data.propertyType] || 0) + 1;
    }

    // Calcular rangos de precios
    if (data.price && Number.isFinite(data.price)) {
      stats.priceRange.min = Math.min(stats.priceRange.min, data.price);
      stats.priceRange.max = Math.max(stats.priceRange.max, data.price);
      totalPrice += data.price;
      priceCount++;
    }
  });

  // Calcular precio promedio
  if (priceCount > 0) {
    stats.averagePrice = Math.round(totalPrice / priceCount);
  }

  // Si no hay precios, resetear min
  if (stats.priceRange.min === Infinity) {
    stats.priceRange.min = 0;
  }

  return stats;
}