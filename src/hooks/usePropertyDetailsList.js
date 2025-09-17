import React from 'react';

export function usePropertyDetailsList(property) {
  const details = [];

  if (!property) {
    return details;
  }

  const { propertyType, city, bedrooms, bathrooms, orientation } = property;

  if (propertyType) {
    details.push({ label: 'Tipo de Propiedad', value: propertyType });
  }

  if (city) {
    details.push({ label: 'Ciudad', value: city });
  }

  if (bedrooms) {
    details.push({ label: 'Dormitorios', value: bedrooms });
  }

  if (bathrooms) {
    details.push({ label: 'Baños', value: bathrooms });
  }

  // Only show orientation for terrenos
  if (propertyType === 'terreno' && orientation) {
    details.push({ label: 'Orientación', value: orientation });
  }

  return details;
}
