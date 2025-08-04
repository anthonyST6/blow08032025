import React from 'react';
import { GeoMapProps } from '../types';

// Note: This is a placeholder implementation. 
// For production, integrate with a mapping library like react-leaflet or mapbox-gl
export const GeoMap: React.FC<GeoMapProps> = ({
  data,
  mapType,
  customGeoJson,
  colorScale = {
    min: '#e3f2fd',
    max: '#1565c0',
  },
  markers = [],
  onRegionClick,
  height = 400,
}) => {
  // This is a placeholder visualization
  // In a real implementation, you would:
  // 1. Load GeoJSON data for the selected map type
  // 2. Use a mapping library to render the map
  // 3. Apply choropleth coloring based on data values
  // 4. Add interactive markers
  // 5. Handle click events on regions

  const getMapTitle = () => {
    switch (mapType) {
      case 'world':
        return 'World Map';
      case 'usa':
        return 'United States Map';
      case 'custom':
        return 'Custom Map';
      default:
        return 'Map';
    }
  };

  return (
    <div 
      className="relative bg-gray-100 rounded-lg overflow-hidden"
      style={{ height: `${height}px` }}
    >
      {/* Placeholder map visualization */}
      <div className="absolute inset-0 flex items-center justify-center">
        <div className="text-center">
          <svg
            className="w-24 h-24 mx-auto mb-4 text-gray-400"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={1.5}
              d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
            />
          </svg>
          <h3 className="text-lg font-medium text-gray-700 mb-2">
            {getMapTitle()}
          </h3>
          <p className="text-sm text-gray-500 max-w-md mx-auto">
            Geographic visualization will be displayed here.
            {data.length > 0 && (
              <span className="block mt-2">
                {data.length} regions with data
              </span>
            )}
            {markers.length > 0 && (
              <span className="block">
                {markers.length} markers to display
              </span>
            )}
          </p>
        </div>
      </div>

      {/* Data summary */}
      <div className="absolute bottom-0 left-0 right-0 bg-white bg-opacity-90 p-4">
        <div className="flex items-center justify-between text-sm">
          <div>
            <span className="text-gray-600">Regions: </span>
            <span className="font-medium">{data.length}</span>
          </div>
          <div>
            <span className="text-gray-600">Markers: </span>
            <span className="font-medium">{markers.length}</span>
          </div>
          <div>
            <span className="text-gray-600">Type: </span>
            <span className="font-medium">{mapType}</span>
          </div>
        </div>
      </div>

      {/* Color scale legend */}
      {data.length > 0 && (
        <div className="absolute top-4 right-4 bg-white rounded-lg shadow-lg p-3">
          <div className="text-xs font-medium text-gray-700 mb-2">Value Scale</div>
          <div className="w-32">
            <div 
              className="h-2 rounded"
              style={{
                background: `linear-gradient(to right, ${colorScale.min}, ${colorScale.max})`,
              }}
            />
            <div className="flex justify-between mt-1 text-xs text-gray-600">
              <span>Low</span>
              <span>High</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

// Export a note about implementation requirements
export const GeoMapImplementationNote = `
  To implement a fully functional GeoMap component, you'll need:
  
  1. Install a mapping library:
     - react-leaflet + leaflet for open-source maps
     - mapbox-gl + react-map-gl for Mapbox
     - @react-google-maps/api for Google Maps
  
  2. Obtain necessary API keys (for Mapbox or Google Maps)
  
  3. Load GeoJSON data for regions (countries, states, etc.)
  
  4. Implement choropleth coloring based on data values
  
  5. Add interactive features:
     - Hover tooltips
     - Click handlers
     - Zoom and pan controls
     - Marker clustering for many points
  
  Example with react-leaflet:
  
  import { MapContainer, TileLayer, GeoJSON, Marker, Popup } from 'react-leaflet';
  
  // ... component implementation
`;