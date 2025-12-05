'use client'

import { useEffect } from 'react'
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet'
import 'leaflet/dist/leaflet.css'
import L from 'leaflet'

// Fix for default markers in Next.js/Leaflet
// This is necessary because Leaflet's default icon paths break in some bundlers
const fixLeafletIcons = () => {
  delete (L.Icon.Default.prototype as any)._getIconUrl
  L.Icon.Default.mergeOptions({
    iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
    iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
    shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
  })
}

// Run fix immediately (client side only)
if (typeof window !== 'undefined') {
    fixLeafletIcons()
}

// Component to recenter map when center prop changes
function RecenterAutomatically({ lat, lng }: { lat: number, lng: number }) {
  const map = useMap();
  useEffect(() => {
    map.flyTo([lat, lng], 13, {
        animate: true,
        duration: 1.5
    });
  }, [lat, lng, map]);
  return null;
}

interface Lawyer {
  id: number | string
  full_name: string
  office_address?: string
  latitude?: number
  longitude?: number
  city?: string
}

interface LawyerMapProps {
  lawyers: Lawyer[]
  center: [number, number]
}

export default function LawyerMap({ lawyers, center }: LawyerMapProps) {
  useEffect(() => {
    fixLeafletIcons()
  }, [])

  return (
    <div className="h-[450px] w-full rounded-2xl overflow-hidden border-4 border-white shadow-xl relative z-0">
      <MapContainer 
        center={center} 
        zoom={13} 
        scrollWheelZoom={false} 
        style={{ height: '100%', width: '100%' }}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        <RecenterAutomatically lat={center[0]} lng={center[1]} />
        
        {/* User Marker (Red) */}
        <Marker position={center} icon={new L.Icon({
             iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-red.png',
             shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
             iconSize: [25, 41],
             iconAnchor: [12, 41],
             popupAnchor: [1, -34],
             shadowSize: [41, 41]
        })}>
           <Popup>
             <div className="font-bold text-center">Your Location</div>
           </Popup>
        </Marker>

        {/* Lawyer Markers (Blue) */}
        {lawyers.map((lawyer) => (
          lawyer.latitude && lawyer.longitude ? (
            <Marker 
                key={lawyer.id} 
                position={[lawyer.latitude, lawyer.longitude]}
            >
              <Popup>
                <div className="text-center min-w-[150px]">
                  <h3 className="font-bold text-blue-800 text-sm mb-1">{lawyer.full_name}</h3>
                  <p className="text-xs text-gray-600">{lawyer.office_address || lawyer.city}</p>
                </div>
              </Popup>
            </Marker>
          ) : null
        ))}
      </MapContainer>
    </div>
  )
}
