export function usePropertyDetailsList(property) {
  const details = [];

  if (!property) {
    return details;
  }

  const { propertyType, city, bedrooms, bathrooms, ambientes, orientation } = property;

  if (propertyType) {
    details.push({ label: 'Tipo de Propiedad', value: propertyType });
  }

  if (city) {
    details.push({ label: 'Ciudad', value: city });
  }

  // NUEVO: Mostrar ambientes si está disponible
  if (ambientes) {
    const ambientesText = ambientes === 1 ? '1 ambiente' : `${ambientes} ambientes`;
    details.push({ label: 'Ambientes', value: ambientesText });
  }

  if (bedrooms) {
    details.push({ label: 'Dormitorios', value: bedrooms });
  }

  if (bathrooms) {
    details.push({ label: 'Baños', value: bathrooms });
  }



  // Status translation
  const statusMap = {
    'available': 'Disponible',
    'reserved': 'Reservado',
    'sold': 'Vendido/Alquilado'
  };

  if (property.status && statusMap[property.status]) {
    details.push({ label: 'Estado', value: statusMap[property.status] });
  }

  if (property.garage) {
    details.push({ label: 'Cochera', value: 'Sí' });
  }

  if (property.antiquity !== undefined && property.antiquity !== null) {
    details.push({ label: 'Antigüedad', value: `${property.antiquity} años` });
  }

  if (property.expenses) {
    details.push({ label: 'Expensas', value: `$${property.expenses}` });
  }

  return details;
}

// NUEVO: Función helper para calcular ambientes automáticamente
export function calculateAmbientes(property) {
  // Si ya tiene ambientes definido, usarlo
  if (property.ambientes) {
    return property.ambientes;
  }

  // Cálculo automático basado en el tipo de propiedad
  const { propertyType, bedrooms = 0, bathrooms = 0 } = property;

  switch (propertyType) {
    case 'departamento':
      // Para departamentos: dormitorios + living/cocina integrado
      return Math.max(1, bedrooms + 1);

    case 'casa':
      // Para casas: dormitorios + living + cocina + baños principales
      return bedrooms + 2 + Math.floor(bathrooms / 2);

    case 'terreno':
    case 'campo':
    case 'galpon':
      // Para estos tipos no aplica el concepto de ambientes
      return null;

    default:
      // Estimación general
      return bedrooms ? bedrooms + 1 : null;
  }
}

// NUEVO: Hook que incluye cálculo automático de ambientes
export function usePropertyDetailsListWithCalculatedAmbientes(property) {
  if (!property) {
    return [];
  }

  // Crear una copia de la propiedad con ambientes calculados si es necesario
  const propertyWithAmbientes = {
    ...property,
    ambientes: property.ambientes || calculateAmbientes(property)
  };

  return usePropertyDetailsList(propertyWithAmbientes);
}