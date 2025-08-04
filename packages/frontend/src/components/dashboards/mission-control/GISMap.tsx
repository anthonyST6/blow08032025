import React, { useState, useEffect, useRef } from 'react';
import { Switch } from '@headlessui/react';
import {
  MapIcon,
  MapPinIcon,
  Squares2X2Icon,
  AdjustmentsHorizontalIcon,
  MagnifyingGlassPlusIcon,
  MagnifyingGlassMinusIcon,
  ArrowsPointingOutIcon,
  XMarkIcon,
} from '@heroicons/react/24/outline';

interface GISMapProps {
  leases: any[];
  onLeaseSelect: (lease: any) => void;
  selectedLeaseId?: string;
}

const GISMap: React.FC<GISMapProps> = ({ leases, onLeaseSelect, selectedLeaseId }) => {
  const mapRef = useRef<HTMLDivElement>(null);
  const [mapLayers, setMapLayers] = useState({
    leases: true,
    wells: true,
    pipelines: false,
    boundaries: true,
    terrain: false,
  });
  const [selectedLayer, setSelectedLayer] = useState('satellite');
  const [showLayerPanel, setShowLayerPanel] = useState(false);
  const [zoomLevel, setZoomLevel] = useState(10);

  // Mock lease locations
  const mockLeases = [
    {
      id: '1',
      name: 'Eagle Ford Shale - Block A',
      lat: 28.5383,
      lng: -98.5795,
      status: 'active',
      value: 2500000,
    },
    {
      id: '2',
      name: 'Permian Basin - Section 12',
      lat: 31.9686,
      lng: -102.0779,
      status: 'active',
      value: 3200000,
    },
    {
      id: '3',
      name: 'Bakken Formation - Unit 7',
      lat: 47.8258,
      lng: -103.5220,
      status: 'expiring',
      value: 1800000,
    },
  ];

  const displayLeases = leases.length > 0 ? leases : mockLeases;

  useEffect(() => {
    // In a real implementation, this would initialize a map library like Mapbox or Google Maps
    console.log('Initializing GIS map...');
  }, []);

  const handleZoomIn = () => {
    setZoomLevel(Math.min(zoomLevel + 1, 20));
  };

  const handleZoomOut = () => {
    setZoomLevel(Math.max(zoomLevel - 1, 1));
  };

  const handleFullscreen = () => {
    if (mapRef.current) {
      if (document.fullscreenElement) {
        document.exitFullscreen();
      } else {
        mapRef.current.requestFullscreen();
      }
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active':
        return 'bg-green-500';
      case 'expiring':
        return 'bg-yellow-500';
      case 'expired':
        return 'bg-red-500';
      default:
        return 'bg-gray-500';
    }
  };

  return (
    <div className="relative h-[600px] bg-gray-100 rounded-lg overflow-hidden" ref={mapRef}>
      {/* Map Placeholder */}
      <div className="absolute inset-0 bg-gradient-to-br from-blue-100 to-green-100">
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="text-center">
            <MapIcon className="h-24 w-24 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-500 text-lg">Interactive GIS Map</p>
            <p className="text-gray-400 text-sm mt-2">
              In production, this would display an interactive map with lease boundaries
            </p>
          </div>
        </div>

        {/* Mock Lease Markers */}
        {displayLeases.map((lease, index) => {
          const top = 20 + (index * 30) % 60;
          const left = 20 + (index * 40) % 60;
          return (
            <div
              key={lease.id}
              onClick={() => onLeaseSelect(lease)}
              className={`
                absolute cursor-pointer transform -translate-x-1/2 -translate-y-1/2
                ${selectedLeaseId === lease.id ? 'z-20' : 'z-10'}
              `}
              style={{ top: `${top}%`, left: `${left}%` }}
            >
              <div className="relative group">
                <div className={`
                  w-8 h-8 rounded-full ${getStatusColor(lease.status)} 
                  flex items-center justify-center shadow-lg
                  ${selectedLeaseId === lease.id ? 'ring-4 ring-blue-500 ring-opacity-50' : ''}
                  group-hover:scale-110 transition-transform
                `}>
                  <MapPinIcon className="h-5 w-5 text-white" />
                </div>
                
                {/* Tooltip */}
                <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
                  <div className="bg-gray-900 text-white text-xs rounded py-1 px-2 whitespace-nowrap">
                    {lease.name}
                    <div className="text-gray-300">${(lease.value / 1000000).toFixed(1)}M</div>
                  </div>
                  <div className="absolute top-full left-1/2 transform -translate-x-1/2 -mt-1">
                    <div className="border-4 border-transparent border-t-gray-900"></div>
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Map Controls */}
      <div className="absolute top-4 right-4 flex flex-col gap-2">
        <button
          onClick={handleZoomIn}
          className="bg-white rounded-lg shadow-md p-2 hover:bg-gray-50"
        >
          <MagnifyingGlassPlusIcon className="h-5 w-5 text-gray-600" />
        </button>
        <button
          onClick={handleZoomOut}
          className="bg-white rounded-lg shadow-md p-2 hover:bg-gray-50"
        >
          <MagnifyingGlassMinusIcon className="h-5 w-5 text-gray-600" />
        </button>
        <button
          onClick={handleFullscreen}
          className="bg-white rounded-lg shadow-md p-2 hover:bg-gray-50"
        >
          <ArrowsPointingOutIcon className="h-5 w-5 text-gray-600" />
        </button>
        <button
          onClick={() => setShowLayerPanel(!showLayerPanel)}
          className="bg-white rounded-lg shadow-md p-2 hover:bg-gray-50"
        >
          <AdjustmentsHorizontalIcon className="h-5 w-5 text-gray-600" />
        </button>
      </div>

      {/* Layer Panel */}
      {showLayerPanel && (
        <div className="absolute top-4 left-4 bg-white rounded-lg shadow-lg p-4 w-64">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-medium text-gray-900">Map Layers</h3>
            <button
              onClick={() => setShowLayerPanel(false)}
              className="text-gray-400 hover:text-gray-500"
            >
              <XMarkIcon className="h-5 w-5" />
            </button>
          </div>

          {/* Base Layer Selection */}
          <div className="mb-4">
            <label className="text-sm font-medium text-gray-700 mb-2 block">Base Layer</label>
            <select
              value={selectedLayer}
              onChange={(e) => setSelectedLayer(e.target.value)}
              className="block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm rounded-md"
            >
              <option value="satellite">Satellite</option>
              <option value="terrain">Terrain</option>
              <option value="street">Street</option>
              <option value="hybrid">Hybrid</option>
            </select>
          </div>

          {/* Layer Toggles */}
          <div className="space-y-3">
            <label className="text-sm font-medium text-gray-700 mb-2 block">Overlays</label>
            
            {Object.entries(mapLayers).map(([layer, enabled]) => (
              <div key={layer} className="flex items-center justify-between">
                <span className="text-sm text-gray-700 capitalize">{layer}</span>
                <Switch
                  checked={enabled}
                  onChange={(checked) => setMapLayers({ ...mapLayers, [layer]: checked })}
                  className={`${
                    enabled ? 'bg-blue-600' : 'bg-gray-200'
                  } relative inline-flex h-6 w-11 items-center rounded-full transition-colors`}
                >
                  <span className="sr-only">Enable {layer}</span>
                  <span
                    className={`${
                      enabled ? 'translate-x-6' : 'translate-x-1'
                    } inline-block h-4 w-4 transform rounded-full bg-white transition-transform`}
                  />
                </Switch>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Legend */}
      <div className="absolute bottom-4 left-4 bg-white rounded-lg shadow-md p-3">
        <h4 className="text-sm font-medium text-gray-900 mb-2">Legend</h4>
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 bg-green-500 rounded-full"></div>
            <span className="text-xs text-gray-600">Active Lease</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 bg-yellow-500 rounded-full"></div>
            <span className="text-xs text-gray-600">Expiring Soon</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 bg-red-500 rounded-full"></div>
            <span className="text-xs text-gray-600">Expired</span>
          </div>
        </div>
      </div>

      {/* Selected Lease Info */}
      {selectedLeaseId && (
        <div className="absolute bottom-4 right-4 bg-white rounded-lg shadow-lg p-4 max-w-xs">
          {(() => {
            const lease = displayLeases.find(l => l.id === selectedLeaseId);
            if (!lease) return null;
            return (
              <>
                <h4 className="font-medium text-gray-900 mb-1">{lease.name}</h4>
                <p className="text-sm text-gray-600">
                  Value: ${(lease.value / 1000000).toFixed(1)}M
                </p>
                <p className="text-sm text-gray-600">
                  Status: <span className={`font-medium ${
                    lease.status === 'active' ? 'text-green-600' : 
                    lease.status === 'expiring' ? 'text-yellow-600' : 'text-red-600'
                  }`}>{lease.status}</span>
                </p>
              </>
            );
          })()}
        </div>
      )}
    </div>
  );
};

export default GISMap;