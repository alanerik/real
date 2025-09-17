import React from 'react';

export function usePropertyMeasurementsList(property) {
  const measurements = [];

  if (!property) {
    return measurements;
  }

  const { area } = property;

  if (area) {
    measurements.push({ label: 'Superficie', value: `${area} m²` });
  }

  // Add other measurement fields here if they exist in your property schema
  // For example:
  // if (property.coveredArea) {
  //   measurements.push({ label: 'Superficie Cubierta', value: `${property.coveredArea} m²` });
  // }

  return measurements;
}
