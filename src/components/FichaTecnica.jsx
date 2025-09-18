import React from 'react';
import Alerta from './Alerta.jsx';
import Chip from './Chip.jsx';
import Formulario from './Formulario.jsx'; // Import Formulario
import { usePropertyChips } from '../hooks/usePropertyChips.js';
import { usePropertyGallery } from '../hooks/usePropertyGallery.js';
import { usePropertyDetailsList } from '../hooks/usePropertyDetailsList.js';
import { usePropertyMeasurementsList } from '../hooks/usePropertyMeasurementsList.js';
import { usePropertyHeaderData } from '../hooks/usePropertyHeaderData.js';

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
  const { description } = property;
  
  const chips = usePropertyChips(property);
  const gallery = usePropertyGallery(property);
  const detailsList = usePropertyDetailsList(property);
  const measurementsList = usePropertyMeasurementsList(property);
  const headerData = usePropertyHeaderData(property);

  return (
    <div className="max-w-7xl mx-auto p-4 font-sans grid grid-cols-1 lg:grid-cols-3 gap-8">
      {/* --- Left Column --- */}
      <div className="lg:col-span-2">
        {/* --- Header --- */}
        <div className="bg-white p-6 rounded-lg shadow-md border border-gray-200 mb-8">
          <div className="flex justify-between items-start">
            <div>
              <h1 className="text-3xl font-bold">{headerData.title}</h1>
              <p className="text-gray-500 opacity-80">{headerData.city}</p>
              <div className="flex gap-2 mt-2">
                {chips.map((chip, index) => (
                  <Chip key={index} text={chip.text} color={chip.color} />
                ))}
              </div>
            </div>
            <div className="text-right">
              <p className="text-lg font-semibold text-gray-700">{headerData.displayOperation}</p>
              <p className="text-3xl font-bold text-green-600">{headerData.formattedPrice}</p>
            </div>
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
              {detailsList.map((item, index) => (
                <li key={index}>{item.label}: <strong>{item.value}</strong></li>
              ))}
            </ul>
          </InfoCard>

          <InfoCard title="Medidas">
            <ul className="list-disc list-inside space-y-2 text-gray-700">
              {measurementsList.map((item, index) => (
                <li key={index}>{item.label}: <strong>{item.value}</strong></li>
              ))}
            </ul>
            <Alerta />
          </InfoCard>
        </div>
      </div>

      {/* --- Right Column (Form) --- */}
      <div className="lg:col-span-1">
        <Formulario />
      </div>
    </div>
  );
}
