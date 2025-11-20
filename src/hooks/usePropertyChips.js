import React from 'react';

export function usePropertyChips(property) {
  const chips = [];

  if (!property) {
    return chips;
  }

  const { propertyType, city, operation } = property;

  if (propertyType) {
    chips.push({ text: propertyType, color: "secondary" });
  }

  if (city) {
    chips.push({ text: city, color: "primary" });
  }

  if (operation) {
    chips.push({ text: operation.toLowerCase() === 'venta' ? 'En Venta' : 'En Alquiler', color: "success" });
  }

  if (property.destacado) {
    chips.push({ text: 'Destacado', color: 'warning' });
  }

  if (property.retasado) {
    chips.push({ text: 'Retasado', color: 'danger' });
  }

  if (property.isBrandNew) {
    chips.push({ text: 'A Estrenar', color: 'success', variant: "shadow" });
  }

  return chips;
}
