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

  // Example of another chip based on operation
  // if (operation) {
  //   chips.push({ text: operation === 'venta' ? 'En Venta' : 'En Alquiler', color: "success" });
  // }

  return chips;
}
