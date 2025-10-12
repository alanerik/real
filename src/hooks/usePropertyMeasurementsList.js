import React from 'react';

export function usePropertyMeasurementsList(property) {
  const measurements = [];

  if (!property) {
    return measurements;
  }

  const { area, superficieCubierta, superficieDescubierta, superficieTotal, superficieTerreno } = property;

  if (area) {
    measurements.push({ label: 'Superficie', value: `${area} m²` });
  }

  if (superficieCubierta) {
    measurements.push({ label: 'Superficie Cubierta', value: `${superficieCubierta} m²` });
  }

  if (superficieDescubierta) {
    measurements.push({ label: 'Superficie Descubierta', value: `${superficieDescubierta} m²` });
  }

  if (superficieTotal) {
    measurements.push({ label: 'Superficie Total', value: `${superficieTotal} m²` });
  }

  if (superficieTerreno) {
    measurements.push({ label: 'Superficie Terreno', value: `${superficieTerreno} m²` });
  }

  return measurements;
}
