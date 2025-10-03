import React from 'react';
import { Card, CardHeader, CardBody, Chip as HeroChip, Divider, Image } from '@heroui/react';
import Alerta from '../Alerta.jsx';
import Formulario from './FormularioFichaTecnica.jsx';
import TabsComponent from './TabsFichaTecnica.jsx';
import SharePropertyButton from './CompartirFichaTecnica.jsx';
import { usePropertyChips } from '../../hooks/usePropertyChips.js';
import { usePropertyGallery } from '../../hooks/usePropertyGallery.js';
import { usePropertyDetailsList } from '../../hooks/usePropertyDetailsList.js';
import { usePropertyMeasurementsList } from '../../hooks/usePropertyMeasurementsList.js';
import { usePropertyHeaderData } from '../../hooks/usePropertyHeaderData.js';

// --- Sub-components for better structure ---

const Gallery = ({ images }) => (
  <div className="grid grid-cols-2 gap-2">
    <div className="col-span-2">
      <Image
        src={images[0]}
        alt="Main property view"
        className="w-full h-auto object-cover rounded-lg"
        loading="lazy"
      />
    </div>
    {images.slice(1, 4).map((image, index) => (
      <div key={index}>
        <Image
          src={image}
          alt={`Property view ${index + 2}`}
          className="w-full h-auto object-cover rounded-lg"
          loading="lazy"
        />
      </div>
    ))}
  </div>
);

const InfoCard = ({ title, children }) => (
  <Card className="w-full">
    {title && (
      <CardHeader className="pb-2">
        <h3 className="text-xl font-semibold">{title}</h3>
      </CardHeader>
    )}
    <CardBody className={title ? "pt-0" : ""}>
      {children}
    </CardBody>
  </Card>
);

const featureIcons = {
  'Aire Acondicionado': '❄️',
  'Piscina': '🏊',
  'Wi-Fi': '📶',
  'Parrilla': '🍖',
  'Estacionamiento': '🚗',
  'Calefacción': '🔥',
  'Gimnasio': '🏋️',
  'Jardín': '🌳',
  'Agua Caliente': '💧',
  'Dormitorio en Suite': '🛏'
};

// --- Main Component ---

export default function FichaTecnica({ property }) {
  const { description, features } = property;
  
  const chips = usePropertyChips(property);
  const gallery = usePropertyGallery(property);
  const detailsList = usePropertyDetailsList(property);
  const measurementsList = usePropertyMeasurementsList(property);
  const headerData = usePropertyHeaderData(property);

  const propertyFeatures = features?.map(name => ({
    name,
    icon: featureIcons[name] || '✔️' // Default icon
  }));

  return (
    <div className="max-w-7xl mx-auto p-4 font-sans grid grid-cols-1 lg:grid-cols-3 gap-8">
      {/* --- Left Column --- */}
      <div className="lg:col-span-2">
      

        {/* --- Gallery Card --- */}
        <Card className="mb-8">
          <CardBody className="p-0">
            <Gallery images={gallery} />
          </CardBody>
        </Card>
  {/* --- Header Card --- */}
        <Card className="mb-8">
          <CardBody className="p-6">
            <div className="flex justify-between items-start">
              <div className="flex-1">
                <h1 className="text-base font-normal mb-2">{headerData.title}</h1>
                
                <div className="flex gap-2 flex-wrap">
                  {chips.map((chip, index) => (
                    <HeroChip 
                      key={index} 
                      size="sm"
                      variant="flat"
                      color={chip.color === 'blue' ? 'primary' : chip.color === 'green' ? 'success' : 'default'}
                    >
                      {chip.text}
                    </HeroChip>
                  ))}
                </div>
              </div>
              <div className="text-right ml-4">
                <p className="text-base font-normal text-default-700 mb-1">
                  {headerData.displayOperation}
                </p>
                <p className="text-xl font-semibold mb-3">
                  {headerData.formattedPrice}
                </p>
                <SharePropertyButton property={property} />
              </div>
            </div>
          </CardBody>
        </Card>
        {/* --- Feature Cards --- */}
        <div className="space-y-6">
          {propertyFeatures && propertyFeatures.length > 0 && (
            <InfoCard>
              <TabsComponent features={propertyFeatures} />
            </InfoCard>
          )}

          <InfoCard title="Descripción">
            <p className="text-default-700 leading-relaxed">{description}</p>
          </InfoCard>

          <InfoCard title="Detalles de la Propiedad">
            <div className="space-y-3">
              {detailsList.map((item, index) => (
                <div key={index} className="flex justify-between items-center">
                  <span className="text-default-600">{item.label}:</span>
                  <HeroChip size="sm" variant="flat" color="default">
                    {item.value}
                  </HeroChip>
                </div>
              ))}
            </div>
          </InfoCard>

          <InfoCard title="Medidas">
            <div className="space-y-3">
              {measurementsList.map((item, index) => (
                <div key={index} className="flex justify-between items-center">
                  <span className="text-default-600">{item.label}:</span>
                  <HeroChip size="sm" variant="flat" color="primary">
                    {item.value}
                  </HeroChip>
                </div>
              ))}
            </div>
            <Divider className="my-4" />
            <Alerta />
          </InfoCard>
        </div>
      </div>

      {/* --- Right Column (Form) --- */}
      <div className="lg:col-span-1">
        <InfoCard title="Contacta a la inmobiliaria">
          <Formulario />
        </InfoCard>
      </div>
    </div>
  );
}
