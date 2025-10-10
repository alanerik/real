import React from 'react';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';

// Leaflet's icon setup can sometimes break with SSR/build tools.
// This ensures the default icons work correctly.
import L from 'leaflet';
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon-2x.png',
  iconUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-shadow.png',
});


const MapaFichaTecnica = ({ latitud, longitud }) => {
  // Don't render the map on the server or if coordinates are missing.
  if (typeof window === 'undefined' || !latitud || !longitud) {
    return <div style={{ height: '400px', width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', backgroundColor: '#f3f4f6' }}>Ubicación no disponible.</div>;
  }

  const position = [latitud, longitud];

  return (
    <MapContainer center={position} zoom={15} style={{ height: '400px', width: '100%' }}>
      <TileLayer
  attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>'
  url="https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png"
/>
      <Marker position={position}>
        <Popup>
          Ubicación aproximada de la propiedad.
        </Popup>
      </Marker>
    </MapContainer>
  );
};

export default MapaFichaTecnica;
