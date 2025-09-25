const DEFAULT_CURRENCY = 'USD';
const LOCALE = 'es-AR';

export function formatPrice(price, currency = DEFAULT_CURRENCY) {
  if (!price || price <= 0) return 'Consultar precio';

  try {
    return new Intl.NumberFormat(LOCALE, {
      style: 'currency',
      currency,
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(price);
  } catch (error) {
    console.warn(`Error formatting price: ${error}. Price: ${price}, Currency: ${currency}`);
    return `${currency} ${price.toLocaleString(LOCALE)}`;
  }
}

export function validatePage(page, totalPages) {
  const pageNum = parseInt(page || '1', 10);

  if (isNaN(pageNum) || pageNum < 1) return 1;
  if (pageNum > totalPages) return totalPages;

  return pageNum;
}

export function getSortedProperties(properties, sortKey) {
  switch (sortKey) {
    case 'price_asc':
      return properties.sort((a, b) => (a.data?.price || Infinity) - (b.data?.price || Infinity));
    case 'price_desc':
      return properties.sort((a, b) => (b.data?.price || 0) - (a.data?.price || 0));
    case 'date_desc':
      return properties.sort((a, b) => new Date(b.data?.publishDate).getTime() - new Date(a.data?.publishDate).getTime());
    case 'date_asc':
      return properties.sort((a, b) => new Date(a.data?.publishDate).getTime() - new Date(b.data?.publishDate).getTime());
    case 'title_asc':
    default:
      return properties.sort((a, b) => {
        const titleA = a.data?.title || '';
        const titleB = b.data?.title || '';
        return titleA.localeCompare(titleB, LOCALE, { numeric: true });
      });
  }
}
