import React from 'react';

// --- Sub-components for better structure ---

const Gallery = ({ images }) => (
  <div className="grid grid-cols-2 gap-2">
    <div className="col-span-2">
      <img src={images[0]} alt="Main property view" className="w-full h-auto object-cover rounded-lg" />
    </div>
    {images.slice(1, 4).map((image, index) => (
      <div key={index}>
        <img src={image} alt={`Property view ${index + 2}`} className="w-full h-auto object-cover rounded-lg" />
      </div>
    ))}
  </div>
);

const InfoCard = ({ title, children }) => (
  <div className="bg-white p-6 rounded-lg shadow-md border border-gray-200">
    <h3 className="text-xl font-semibold mb-4">{title}</h3>
    {children}
  </div>
);

// --- Main Component ---

export default function FichaTecnica({ property }) {
  const { title, city, price, currency, operation, description, propertyType, bedrooms, bathrooms, area } = property;
  
  // Dummy gallery for now, as it is not in the frontmatter
  const gallery = [
    '/imgHeroBanner.png',
    '/slider-1.jpg',
    '/maritimo-3-al-100.jpg',
    '/senderos-3-al-200.jpg',
  ];

  return (
    <div className="max-w-4xl mx-auto p-4 font-sans">
      {/* --- Header --- */}
      <div className="flex justify-between items-start mb-4">
        <div>
          <h1 className="text-3xl font-bold">{title}</h1>
          <p className="text-gray-500 opacity-80">{city}</p>
        </div>
        <div className="text-right">
          <p className="text-lg font-semibold text-gray-700">Precio de {operation}</p>
          <p className="text-3xl font-bold text-green-600">{currency} {price.toLocaleString()}</p>
        </div>
      </div>

      {/* --- Gallery --- */}
      <div className="mb-8">
        <Gallery images={gallery} />
      </div>

      {/* --- Cards --- */}
      <div className="space-y-8">
        <InfoCard title="Descripción">
          <p className="text-gray-700">{description}</p>
        </InfoCard>

        <InfoCard title="Detalles de la Propiedad">
          <ul className="list-disc list-inside space-y-2 text-gray-700">
            {propertyType && <li>Tipo de Propiedad: <strong>{propertyType}</strong></li>}
            {bedrooms && <li>Dormitorios: <strong>{bedrooms}</strong></li>}
            {bathrooms && <li>Baños: <strong>{bathrooms}</strong></li>}
          </ul>
        </InfoCard>

        <InfoCard title="Medidas">
          <ul className="list-disc list-inside space-y-2 text-gray-700">
            {area && <li>Superficie: <strong>{area} m²</strong></li>}
          </ul>
        </InfoCard>
      </div>
    </div>
  );
}
