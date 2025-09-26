// utils/staticPaths.js
import { filterProperties } from './propertyFilters.js';

export async function generatePropertyPaths(ciudades, tiposDePropiedad, tiposDePropiedadAlquiler, allProperties) {
  const paths = [];
  const propertiesCache = new Map();
  
  // Helper para generar rutas por operación
  const generatePathsForOperation = (operation, cities, propertyTypes) => {
    for (const ciudad of cities) {
      for (const tipo of propertyTypes) {
        const routeKey = `${operation}-${ciudad.key}-${tipo.key}`;
        
        // Usar la función de filtrado centralizada
        const filteredProperties = filterProperties(allProperties, {
          operation,
          city: ciudad.key,
          propertyType: tipo.key
        });
        
        propertiesCache.set(routeKey, filteredProperties);
        
        paths.push({
          params: {
            operacion: operation,
            ciudad: ciudad.key,
            tipoPropiedad: tipo.key
          },
          props: {
            totalPropiedades: filteredProperties.length,
            ciudadNombre: ciudad.label,
            tipoNombre: tipo.label,
            routeKey // Para debugging si es necesario
          }
        });
      }
    }
  };
  
  // Generar rutas para venta
  generatePathsForOperation('venta', ciudades, tiposDePropiedad);
  
  // Generar rutas para alquiler
  generatePathsForOperation('alquiler', ciudades, tiposDePropiedadAlquiler);
  
  return { paths, propertiesCache };
}

export async function generateAllPropertyPaths(allProperties) {
  return allProperties.map(property => ({
    params: { slug: property.slug },
    props: {
      property: property.data,
      slug: property.slug
    }
  }));
}

// Helper para pre-computar estadísticas por ruta (opcional, para optimización)
export function computeRouteStats(propertiesCache) {
  const stats = new Map();
  
  propertiesCache.forEach((properties, routeKey) => {
    const [operation, city, propertyType] = routeKey.split('-');
    
    const routeStats = {
      total: properties.length,
      averagePrice: 0,
      priceRange: { min: Infinity, max: 0 },
      ambientesRange: { min: Infinity, max: 0 }
    };
    
    if (properties.length > 0) {
      let totalPrice = 0;
      let priceCount = 0;
      
      properties.forEach(property => {
        const { data } = property;
        
        // Precio
        if (data.price && Number.isFinite(data.price)) {
          totalPrice += data.price;
          priceCount++;
          routeStats.priceRange.min = Math.min(routeStats.priceRange.min, data.price);
          routeStats.priceRange.max = Math.max(routeStats.priceRange.max, data.price);
        }
        
        // Ambientes
        if (data.ambientes && Number.isFinite(data.ambientes)) {
          routeStats.ambientesRange.min = Math.min(routeStats.ambientesRange.min, data.ambientes);
          routeStats.ambientesRange.max = Math.max(routeStats.ambientesRange.max, data.ambientes);
        }
      });
      
      // Precio promedio
      if (priceCount > 0) {
        routeStats.averagePrice = Math.round(totalPrice / priceCount);
      }
      
      // Resetear infinitos si no hay datos
      if (routeStats.priceRange.min === Infinity) {
        routeStats.priceRange.min = 0;
      }
      if (routeStats.ambientesRange.min === Infinity) {
        routeStats.ambientesRange.min = 0;
      }
    }
    
    stats.set(routeKey, routeStats);
  });
  
  return stats;
}