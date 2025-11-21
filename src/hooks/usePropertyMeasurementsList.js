export function usePropertyMeasurementsList(property) {
  const measurements = [];

  if (!property) {
    return measurements;
  }

  const { area, superficieCubierta, superficieDescubierta, superficieTotal, superficieTerreno } = property;

  // New fields from properties.ts
  if (property.totalArea) {
    measurements.push({ label: 'Superficie Total', value: `${property.totalArea} m²` });
  }

  if (property.coveredArea) {
    measurements.push({ label: 'Superficie Cubierta', value: `${property.coveredArea} m²` });
  }

  if (property.semiCoveredArea) {
    measurements.push({ label: 'Superficie Semicubierta', value: `${property.semiCoveredArea} m²` });
  }

  if (property.landArea) {
    measurements.push({ label: 'Superficie Terreno', value: `${property.landArea} m²` });
  }

  // Legacy fields support (optional, keep if old data exists)
  if (area && !property.totalArea) {
    measurements.push({ label: 'Superficie', value: `${area} m²` });
  }

  return measurements;
}
