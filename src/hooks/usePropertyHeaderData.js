import React from 'react';

export function usePropertyHeaderData(property) {
  if (!property) {
    return {};
  }

  const { title, city, price, currency, operation, codigo } = property;

  const formattedPrice = `${currency} ${price.toLocaleString()}`;
  const displayOperation = `Precio de ${operation}`;

  return {
    title,
    city,
    formattedPrice,
    displayOperation,
    codigo,
  };
}
