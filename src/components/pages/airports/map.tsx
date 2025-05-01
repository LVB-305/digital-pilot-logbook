"use client";

import { useEffect, useRef } from "react";

interface AirportMapProps {
  lat: number;
  lon: number;
  name: string;
}

export function AirportMap({ lat, lon, name }: AirportMapProps) {
  const mapRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!mapRef.current) return;

    // Since we don't have an actual map API key, we'll use a fallback
    // In a real application, you would use your map provider API

    // Fallback to a static map representation
    if (mapRef.current) {
      mapRef.current.innerHTML = `
        <div class="h-full w-full flex items-center justify-center bg-gray-100 relative">
          <div class="absolute inset-0 overflow-hidden">
            <div class="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
              <div class="h-12 w-12 rounded-full bg-blue-500 bg-opacity-30 flex items-center justify-center">
                <div class="h-6 w-6 rounded-full bg-blue-500 animate-pulse"></div>
              </div>
            </div>
            <div class="grid grid-cols-4 grid-rows-4 h-full w-full">
              ${Array(16)
                .fill(0)
                .map(
                  () =>
                    `<div class="border border-gray-200 border-opacity-20"></div>`
                )
                .join("")}
            </div>
          </div>
          <div class="absolute bottom-2 right-2 bg-white bg-opacity-80 rounded px-2 py-1 text-xs">
            Lat: ${lat.toFixed(4)}, Lon: ${lon.toFixed(4)}
          </div>
          <div class="z-10 bg-white rounded-lg shadow-lg p-3">
            <div class="flex items-center gap-2">
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" class="text-blue-500">
                <path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z"></path>
                <circle cx="12" cy="10" r="3"></circle>
              </svg>
              <div>
                <div class="font-medium">${name}</div>
                <div class="text-xs text-gray-500">Map view unavailable</div>
              </div>
            </div>
          </div>
        </div>
      `;
    }
  }, [lat, lon, name]);

  return <div ref={mapRef} className="w-full h-full" />;
}
