import React from 'react';

export function usePropertyGallery(property) {
  // For now, return dummy images. In a real scenario, these would come from property.data.images or similar.
  const dummyGallery = [
    property.image || '/imgHeroBanner.png', // Use the main image from frontmatter if available
    '/slider-1.jpg',
    '/maritimo-3-al-100.jpg',
    '/senderos-3-al-200.jpg',
  ];

  // In a more advanced setup, you might process property.data.gallery array here
  // or fetch additional images based on property ID.

  return dummyGallery;
}
