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
      <div className="h-[500px] w-full flex items-center justify-center bg-gray-100 text-gray-500 rounded-xl">
        Ubicación no disponible.
      </div>
    );
  }

  // Icono de casa sobre el pin de Leaflet
  const houseIconSvg = `
    <div class="relative flex justify-center items-center w-[50px] h-[50px] bg-white border-4 border-black rounded-full shadow-lg">
     <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="w-6 h-6">
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
          border-radius: 0.75rem;
          overflow: hidden;
        }
        .leaflet-popup-content {
          margin: 0;
          width: 320px !important;
        }
        .leaflet-popup-tip {
          background: white;
        }
      `}</style>

      <MapContainer
        center={position}
        zoom={15}
        className="h-[500px] w-full z-0 rounded-xl overflow-hidden shadow-sm"
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>'
          url="https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png"
        />
        <Marker position={position} icon={houseIcon}>
          <Popup>
            <div className="flex bg-white w-full">
              {imagen && (
                <img
                  src={imagen}
                  alt={titulo}
                  className="w-[120px] h-[140px] object-cover shrink-0"
                />
              )}
              <div className="p-4 flex-1 flex flex-col justify-between">
                <div>
                  {titulo && (
                    <div className="text-sm font-semibold text-gray-800 mb-2 line-clamp-2 leading-snug">
                      {titulo}
                    </div>
                  )}
                  {tipo && (
                    <span className="inline-block bg-gray-200 text-gray-700 px-2.5 py-0.5 rounded-md text-xs font-medium mb-2 w-fit">
                      {tipo}
                    </span>
                  )}
                </div>
                {precio && (
                  <div className="text-lg font-bold text-emerald-500 mt-auto">
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