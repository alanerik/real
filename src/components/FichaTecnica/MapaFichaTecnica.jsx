import React from 'react';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';

const MapaFichaTecnica = ({ 
  latitud, 
  longitud, 
  titulo = '',
  tipo = '',
  precio = '',
  moneda = '',
  imagen = ''
}) => {
  // Don't render the map on the server or if coordinates are missing.
  if (typeof window === 'undefined' || !latitud || !longitud) {
    return (
      <div style={{ 
        height: '400px', 
        width: '100%', 
        display: 'flex', 
        alignItems: 'center', 
        justifyContent: 'center', 
        backgroundColor: '#f3f4f6' 
      }}>
        Ubicación no disponible.
      </div>
    );
  }

  // Icono de casa sobre el pin de Leaflet
  const houseIconSvg = `
    <div style="position: relative; display:flex; justify-content:center; align-items:center; width: 50px; height: 50px; background:white; border:4px solid black; ; border-radius:9999px;">
     <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="size-6">
  <path stroke-linecap="round" stroke-linejoin="round" d="M8.25 21v-4.875c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125V21m0 0h4.5V3.545M12.75 21h7.5V10.75M2.25 21h1.5m18 0h-18M2.25 9l4.5-1.636M18.75 3l-1.5.545m0 6.205 3 1m1.5.5-1.5-.5M6.75 7.364V3h-3v18m3-13.636 10.5-3.819" />
</svg>

    </div>
  `;

  // Crear icono personalizado con el SVG
  const houseIcon = L.divIcon({
    html: houseIconSvg,
    className: 'custom-house-icon',
    iconSize: [25, 41],
    iconAnchor: [12, 41],
    popupAnchor: [1, -34]
  });

  const position = [latitud, longitud];

  return (
    <>
      <style>{`
        .custom-house-icon {
          background: transparent;
          border: none;
        }
        .leaflet-popup-content-wrapper {
          padding: 0;
          border-radius: 12px;
          overflow: hidden;
        }
        .leaflet-popup-content {
          margin: 0;
          width: 320px !important;
        }
        .leaflet-popup-tip {
          background: white;
        }
        .property-popup-container {
          display: flex;
          flex-direction: row;
          background: white;
        }
        .property-popup-image {
          width: 120px;
          height: 140px;
          object-fit: cover;
          flex-shrink: 0;
        }
        .property-popup-content {
          padding: 16px;
          flex: 1;
          display: flex;
          flex-direction: column;
          justify-content: space-between;
        }
        .property-popup-title {
          font-size: 14px;
          font-weight: 600;
          color: #1f2937;
          margin-bottom: 8px;
          line-height: 1.3;
          display: -webkit-box;
          -webkit-line-clamp: 2;
          -webkit-box-orient: vertical;
          overflow: hidden;
        }
        .property-popup-type {
          display: inline-block;
          background: #e5e7eb;
          color: #374151;
          padding: 3px 10px;
          border-radius: 6px;
          font-size: 12px;
          font-weight: 500;
          margin-bottom: 8px;
          width: fit-content;
        }
        .property-popup-price {
          font-size: 18px;
          font-weight: 700;
          color: #10b981;
          margin-top: auto;
        }
      `}</style>
      
      <MapContainer 
        center={position} 
        zoom={15} 
        style={{ height: '400px', width: '100%' }}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>'
          url="https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png"
        />
        <Marker position={position} icon={houseIcon}>
          <Popup>
            <div className="property-popup-container">
              {imagen && (
                <img 
                  src={imagen} 
                  alt={titulo}
                  className="property-popup-image"
                />
              )}
              <div className="property-popup-content">
                <div>
                  {titulo && (
                    <div className="property-popup-title">
                      {titulo}
                    </div>
                  )}
                  {tipo && (
                    <span className="property-popup-type">
                      {tipo}
                    </span>
                  )}
                </div>
                {precio && (
                  <div className="property-popup-price">
                    {moneda} {Number(precio).toLocaleString()}
                  </div>
                )}
              </div>
            </div>
          </Popup>
        </Marker>
      </MapContainer>
    </>
  );
};

export default MapaFichaTecnica;