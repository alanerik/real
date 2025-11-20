import React from 'react';
import { Card, CardHeader, CardBody, Chip as HeroChip, Divider } from '@heroui/react';
import Alerta from '../Alerta.jsx';
import Formulario from './FormularioFichaTecnica.jsx';
import TabsComponent from './TabsFichaTecnica.jsx';
import BotonCompartir from './CompartirFichaTecnica.jsx';
import { usePropertyChips } from '../../hooks/usePropertyChips.js';
import { usePropertyGallery } from '../../hooks/usePropertyGallery.js';
import { usePropertyDetailsList } from '../../hooks/usePropertyDetailsList.js';
import { usePropertyMeasurementsList } from '../../hooks/usePropertyMeasurementsList.js';
import { usePropertyHeaderData } from '../../hooks/usePropertyHeaderData.js';
import GaleriaFichatecnica from './GaleriaFichatecnica.jsx';

// --- Sub-components for better structure ---

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

const Header = ({ property, headerData, chips }) => (
  <Card className="mb-8">
    <CardBody className="p-3">
      <div className="flex flex-col md:flex-row md:justify-between md:items-start">
        {/* Columna Izquierda (Título, Precio y Chips) */}
        <div className="flex-1 mb-4 md:mb-0">
          <h1 className="text-base font-normal mb-2 md:text-xl">{headerData.title}</h1>
          <p className="text-xl font-semibold mb-3 md:hidden">{headerData.formattedPrice}</p>
          <div className="flex gap-2 flex-wrap">
            {chips.map((chip, index) => (
              <HeroChip key={index} size="sm" variant="solid" color={chip.color}>
                {chip.text}
              </HeroChip>
            ))}
          </div>
        </div>

        {/* Columna Derecha (Operación, Precio y Botón de Compartir) */}
        <div className="flex flex-col items-start md:items-end md:ml-4">
          <div className="hidden md:block md:text-right">
            <p className="text-base font-normal text-default-700 mb-1">
              {headerData.displayOperation}
            </p>
            <p className="text-xl font-semibold mb-3">
              {headerData.formattedPrice}
            </p>
          </div>
          <BotonCompartir property={property} />
        </div>
      </div>
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
    <div className="font-sans grid grid-cols-1 lg:grid-cols-3 gap-8">
      {/* --- Left Column --- */}
      <div className="lg:col-span-2">
        {/* --- Gallery --- */}
        <div className="mb-8">
          <GaleriaFichatecnica images={gallery} property={property} />
        </div>

        {/* --- Header Card --- */}
        <Header property={property} headerData={headerData} chips={chips} />

        {/* --- Feature Cards --- */}
        <div className="space-y-6">
          {propertyFeatures && propertyFeatures.length > 0 && (
            <InfoCard>
              <TabsComponent
                features={propertyFeatures}
                latitud={property.latitud}
                longitud={property.longitud}
                property={property}
              />
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
