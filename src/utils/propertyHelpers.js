// utils/propertyHelpers.js
import { formatPrice } from './formatters.js';
import { FALLBACK_PRICE_TEXT } from './constants.js';

export function getPropertyDisplayPrice(property) {
  if (!property?.data) return FALLBACK_PRICE_TEXT;
  
  const { price, currency, operation } = property.data;
  
  if (!price || price <= 0) return FALLBACK_PRICE_TEXT;
  
  const formattedPrice = formatPrice(price, currency);
  
  // Agregar contexto según la operación
  if (operation === 'alquiler') {
    return `${formattedPrice}/mes`;
  }
  
  return formattedPrice;
}

export function getPropertySummary(property) {
  if (!property?.data) return null;
  
  const { 
    title, 
    operation, 
    city, 
    propertyType, 
    ambientes, 
    price, 
    currency,
    description,
    image,
    publishDate
  } = property.data;
  
  return {
    title: title || 'Sin título',
    operation: operation || 'venta',
    location: city || 'Sin ubicación',
    type: propertyType || 'propiedad',
    rooms: ambientes || 0,
    displayPrice: getPropertyDisplayPrice(property),
    numericPrice: Number(price) || 0,
    currency: currency || 'USD',
    description: description || '',
    image: image || null,
    publishDate: publishDate || null,
    slug: property.slug
  };
}

export function getPropertyFeatures(property) {
  if (!property?.data) return [];
  
  const features = [];
  const data = property.data;
  
  // Ambientes
  if (data.ambientes) {
    features.push({
      key: 'ambientes',
      label: 'Ambientes',
      value: data.ambientes,
      display: `${data.ambientes} ambiente${data.ambientes === 1 ? '' : 's'}`
    });
  }
  
  // Dormitorios
  if (data.dormitorios) {
    features.push({
      key: 'dormitorios',
      label: 'Dormitorios',
      value: data.dormitorios,
      display: `${data.dormitorios} dormitorio${data.dormitorios === 1 ? '' : 's'}`
    });
  }
  
  // Baños
  if (data.banos) {
    features.push({
      key: 'banos',
      label: 'Baños',
      value: data.banos,
      display: `${data.banos} baño${data.banos === 1 ? '' : 's'}`
    });
  }
  
  // Superficie
  if (data.superficie) {
    features.push({
      key: 'superficie',
      label: 'Superficie',
      value: data.superficie,
      display: `${data.superficie} m²`
    });
  }
  
  // Cochera
  if (data.cochera) {
    features.push({
      key: 'cochera',
      label: 'Cochera',
      value: data.cochera,
      display: data.cochera === true ? 'Sí' : 'No'
    });
  }
  
  // Pileta
  if (data.pileta) {
    features.push({
      key: 'pileta',
      label: 'Pileta',
      value: data.pileta,
      display: data.pileta === true ? 'Sí' : 'No'
    });
  }
  
  return features;
}

export function isPropertyFeatured(property) {
  return property?.data?.destacado === true;
}

export function isPropertyAvailable(property) {
  if (!property?.data) return false;
  
  const status = property.data.status || 'disponible';
  return status === 'disponible';
}

export function getPropertyUrl(property) {
  if (!property?.slug) return '#';
  return `/propiedades/${property.slug}`;
}

export function getPropertyImageUrl(property, size = 'medium') {
  if (!property?.data?.image) return null;
  
  const image = property.data.image;
  
  // Si es un string, asumir que es la URL
  if (typeof image === 'string') return image;
  
  // Si es un objeto con diferentes tamaños
  if (typeof image === 'object') {
    return image[size] || image.medium || image.large || image.small || null;
  }
  
  return null;
}