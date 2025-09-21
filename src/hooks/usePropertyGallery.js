import React from 'react';

export function usePropertyGallery(property) {
  // For now, return dummy images. In a real scenario, these would come from property.data.images or similar.
  const dummyGallery = [
    property.image || '/imgHeroBanner.webp', // Use the main image from frontmatter if available
    '/slider-1.webp',
    '/maritimo-3-al-100.webp',
    '/senderos-3-al-200.webp',
  ];

  // In a more advanced setup, you might process property.data.gallery array here
  // or fetch additional images based on property ID.

  return dummyGallery;
}
