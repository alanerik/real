import React, { useState, useEffect } from 'react';
import { MapContainer, TileLayer, Marker, useMapEvents } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';

// Fix for default marker icon in Leaflet with React
import icon from 'leaflet/dist/images/marker-icon.png';
import iconShadow from 'leaflet/dist/images/marker-shadow.png';

let DefaultIcon = L.icon({
    iconUrl: icon.src,
    shadowUrl: iconShadow.src,
    iconSize: [25, 41],
    iconAnchor: [12, 41]
});

L.Marker.prototype.options.icon = DefaultIcon;

interface LocationPickerProps {
    latitud?: number;
    longitud?: number;
    onLocationSelect: (lat: number, lng: number) => void;
}

function LocationMarker({ position, setPosition, onLocationSelect }: any) {
    const map = useMapEvents({
        click(e) {
            setPosition(e.latlng);
            onLocationSelect(e.latlng.lat, e.latlng.lng);
            map.flyTo(e.latlng, map.getZoom());
        },
    });

    return position === null ? null : (
        <Marker position={position}></Marker>
    );
}

export default function LocationPicker({ latitud, longitud, onLocationSelect }: LocationPickerProps) {
    const [position, setPosition] = useState<L.LatLng | null>(null);
    const [isMounted, setIsMounted] = useState(false);

    // Pinamar coordinates as default center
    const defaultCenter = { lat: -37.108, lng: -56.859 };

    useEffect(() => {
        setIsMounted(true);
        if (latitud && longitud) {
            setPosition(new L.LatLng(latitud, longitud));
        }
    }, [latitud, longitud]);

    if (!isMounted) {
        return <div className="h-[300px] w-full bg-gray-100 flex items-center justify-center rounded-lg">Cargando mapa...</div>;
    }

    return (
        <div className="h-[300px] w-full rounded-lg overflow-hidden border border-gray-300 z-0">
            <MapContainer
                center={position || defaultCenter}
                zoom={13}
                style={{ height: '100%', width: '100%' }}
            >
                <TileLayer
                    attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                    url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                />
                <LocationMarker
                    position={position}
                    setPosition={setPosition}
                    onLocationSelect={onLocationSelect}
                />
            </MapContainer>
        </div>
    );
}
