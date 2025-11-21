export function usePropertyGallery(property) {
  // Use the main image as the first item, then the gallery images
  const mainImage = property.image || '/imgHeroBanner.webp';
  const galleryImages = property.gallery || [];

  // Combine main image with gallery, filtering out duplicates if necessary
  // (assuming gallery might not contain the main image, or we want it first)
  const combinedGallery = [mainImage, ...galleryImages];

  // Remove duplicates just in case
  const uniqueGallery = [...new Set(combinedGallery)];

  return uniqueGallery;
}
