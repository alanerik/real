import { getCollection, getEntry } from 'astro:content';

/**
 * Devuelve todas las propiedades, opcionalmente ordenadas por fecha.
 */
export async function getTodasLasPropiedades() {
  const propiedades = await getCollection('propiedades');
  // Opcional: ordenar por fecha de publicación o algún otro criterio
  // propiedades.sort((a, b) => new Date(b.data.pubDate) - new Date(a.data.pubDate));
  return propiedades;
}

/**
 * Devuelve una propiedad específica por su slug.
 */
export async function getPropiedadPorSlug(slug) {
  if (!slug) return null;
  return await getEntry('propiedades', slug);
}

/**
 * Devuelve propiedades filtradas por operación, ciudad, tipo y ambientes.
 */
export async function getPropiedadesFiltradas({ operacion, ciudad, tipoPropiedad, ambientes }) {
  const todasLasPropiedades = await getTodasLasPropiedades();

  return todasLasPropiedades.filter(propiedad => {
    const { data } = propiedad;

    // Filtros básicos - se aplican solo si el parámetro existe
    const matchesOperation = !operacion || data.operation === operacion;
    const matchesCity = !ciudad || data.city === ciudad;
    const matchesType = !tipoPropiedad || data.propertyType === tipoPropiedad;

    // Filtro por ambientes
    let matchesAmbientes = true;
    if (ambientes) {
      if (ambientes === '5+') {
        matchesAmbientes = (data.ambientes || 0) >= 5;
      } else {
        matchesAmbientes = data.ambientes === parseInt(ambientes);
      }
    }

    return matchesOperation && matchesCity && matchesType && matchesAmbientes;
  });
}
