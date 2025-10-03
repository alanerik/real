// utils/constants.js
export const DEFAULT_CURRENCY = 'U$S';
export const LOCALE = 'es-AR';
export const FALLBACK_PRICE_TEXT = 'Consultar precio';
export const PAGE_SIZE = 8;
export const DEFAULT_PAGE = 1;

// Mapeo de monedas comunes en Argentina
export const CURRENCY_SYMBOLS = {
  'U$S': 'US$',
  'ARS': '$',
  'EUR': '€'
};

// Operaciones válidas
export const VALID_OPERATIONS = ['venta', 'alquiler'];

// Opciones de ordenamiento
export const SORT_OPTIONS = [
  { value: 'title_asc', label: 'Título A-Z' },
  { value: 'title_desc', label: 'Título Z-A' },
  { value: 'price_asc', label: 'Precio: menor a mayor' },
  { value: 'price_desc', label: 'Precio: mayor a menor' },
  { value: 'date_desc', label: 'Más recientes' },
  { value: 'date_asc', label: 'Más antiguos' },
  { value: 'ambientes_asc', label: 'Ambientes: menor a mayor' },
  { value: 'ambientes_desc', label: 'Ambientes: mayor a menor' }
];

// Claves de ordenamiento válidas
export const VALID_SORT_KEYS = SORT_OPTIONS.map(option => option.value);