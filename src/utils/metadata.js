// utils/metadata.js
import { formatNumber } from './formatters.js';

export function generateMetadata(operation, cityName, typeName, filters = {}, pagination = {}) {
  const { totalItems = 0, currentPage = 1, totalPages = 1 } = pagination;
  
  // Título base
  let title = `${operation.charAt(0).toUpperCase() + operation.slice(1)} de ${typeName} en ${cityName}`;
  
  // Descripción base
  let description = totalItems > 0 
    ? `Encuentra ${formatNumber(totalItems)} propiedades en ${operation} de ${typeName} en ${cityName}`
    : `Propiedades en ${operation} de ${typeName} en ${cityName}`;
  
  // Agregar información de filtros al título y descripción
  if (filters.ambientes) {
    const ambientesText = filters.ambientes === '5+' 
      ? '5 o más ambientes' 
      : `${filters.ambientes} ambiente${filters.ambientes === '1' ? '' : 's'}`;
    title += ` con ${ambientesText}`;
    description += ` con ${ambientesText}`;
  }
  
  // Agregar información de paginación
  if (totalPages > 1) {
    title += ` - Página ${currentPage} de ${totalPages}`;
    description += `. Página ${currentPage} de ${totalPages}.`;
  }
  
  return { 
    title, 
    description,
    keywords: generateKeywords(operation, cityName, typeName, filters)
  };
}

export function generateKeywords(operation, cityName, typeName, filters = {}) {
  const keywords = [
    operation,
    typeName,
    cityName,
    `${typeName} en ${cityName}`,
    `${operation} ${typeName}`,
    `propiedades en ${cityName}`,
    'inmobiliaria',
    'bienes raíces'
  ];
  
  // Agregar keywords específicos de filtros
  if (filters.ambientes && filters.ambientes !== '5+') {
    keywords.push(`${filters.ambientes} ambientes`);
  }
  
  if (filters.ambientes === '5+') {
    keywords.push('5 ambientes o más');
  }
  
  return keywords.join(', ');
}

export function generateStructuredData(properties, metadata) {
  if (!Array.isArray(properties) || properties.length === 0) {
    return {
      "@context": "https://schema.org",
      "@type": "CollectionPage",
      "name": metadata.title,
      "description": metadata.description,
      "numberOfItems": 0
    };
  }
  
  return {
    "@context": "https://schema.org",
    "@type": "CollectionPage",
    "name": metadata.title,
    "description": metadata.description,
    "numberOfItems": properties.length,
    "mainEntity": {
      "@type": "ItemList",
      "numberOfItems": properties.length,
      "itemListElement": properties.slice(0, 10).map((property, index) => ({
        "@type": "ListItem",
        "position": index + 1,
        "item": {
          "@type": "RealEstateListing",
          "name": property.data.title,
          "description": property.data.description,
          "url": `/propiedades/${property.slug}`,
          "price": property.data.price ? {
            "@type": "PriceSpecification",
            "value": property.data.price,
            "priceCurrency": property.data.currency || "U$S"
          } : undefined
        }
      }))
    }
  };
}

export function generateOpenGraphData(metadata, imageUrl = null) {
  return {
    title: metadata.title,
    description: metadata.description,
    type: 'website',
    ...(imageUrl && { image: imageUrl }),
    site_name: 'Tu Inmobiliaria'
  };
}

export function generateTwitterCardData(metadata, imageUrl = null) {
  return {
    card: 'summary_large_image',
    title: metadata.title,
    description: metadata.description,
    ...(imageUrl && { image: imageUrl })
  };
}