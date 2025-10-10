import { Tabs, Tab, Card, CardBody } from "@heroui/react";
import React from 'react';
import MapaFichaTecnica from "./MapaFichaTecnica";

// A simple icon component
const FeatureIcon = ({ icon }) => (
  <div className="w-12 h-12 bg-gray-200 rounded-full flex items-center justify-center mr-4">
    {/* In a real app, you'd use an SVG icon library here */}
    <span className="text-xl">{icon}</span>
  </div>
);

const FeatureItem = ({ feature }) => (
  <div className="flex items-center p-2">
    <FeatureIcon icon={feature.icon} />
    <span>{feature.name}</span>
  </div>
);

export default function TabsComponent({ features = [], latitud, longitud }) {

  return (
    <div className="flex w-full flex-col">
      <Tabs color="success" aria-label="Options">
        <Tab key="caracteristicas" title="Caracteristicas">
          <Card>
            <CardBody>
              <div className="grid grid-cols-2 gap-4">
                {features.map((feature, index) => (
                  <FeatureItem key={index} feature={feature} />
                ))}
              </div>
            </CardBody>
          </Card>
        </Tab>
        <Tab key="mapa" title="Mapa">
          <Card>
            <CardBody>
              <MapaFichaTecnica latitud={latitud} longitud={longitud} />
            </CardBody>
          </Card>
        </Tab>
        <Tab key="tour 360" title="Tour 360">
          <Card>
            <CardBody>
             
            </CardBody>
          </Card>
        </Tab>
      </Tabs>
    </div>
  );
}
