import React, { useState, useEffect } from 'react';
import { MapCoordinates } from '../types';
import { geocodeAddressMultiple } from '../services/mapsService';
import { MapPin, Loader, Check } from 'lucide-react';

interface LocationPreviewProps {
  address: string;
  onLocationSelect: (coordinates: MapCoordinates, formattedAddress: string) => void;
  onCancel: () => void;
  isVisible: boolean;
}

interface LocationOption {
  coordinates: MapCoordinates;
  formattedAddress: string;
  placeId: string;
}

const LocationPreview: React.FC<LocationPreviewProps> = ({
  address,
  onLocationSelect,
  onCancel,
  isVisible
}) => {
  const [locations, setLocations] = useState<LocationOption[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!isVisible || !address.trim()) {
      setLocations([]);
      setError(null);
      return;
    }

    const searchLocations = async () => {
      setIsLoading(true);
      setError(null);
      
      try {
        const results = await geocodeAddressMultiple(address);
        if (results && results.length > 0) {
          setLocations(results);
        } else {
          setError('No locations found for this address');
          setLocations([]);
        }
      } catch (err) {
        setError('Failed to search for locations');
        setLocations([]);
      } finally {
        setIsLoading(false);
      }
    };

    // Debounce the search to avoid too many API calls
    const timeoutId = setTimeout(searchLocations, 500);
    return () => clearTimeout(timeoutId);
  }, [address, isVisible]);

  if (!isVisible) return null;

  return (
    <div className="absolute top-full left-0 right-0 z-50 bg-white border border-gray-300 rounded-md shadow-lg max-h-64 overflow-y-auto">
      <div className="p-3 border-b border-gray-200">
        <h3 className="text-sm font-medium text-gray-900">
          Select a location for "{address}"
        </h3>
      </div>
      
      {isLoading && (
        <div className="p-4 text-center">
          <Loader className="h-5 w-5 animate-spin text-blue-600 mx-auto mb-2" />
          <p className="text-sm text-gray-600">Searching for locations...</p>
        </div>
      )}
      
      {error && (
        <div className="p-4 text-center">
          <p className="text-sm text-red-600">{error}</p>
        </div>
      )}
      
      {!isLoading && !error && locations.length > 0 && (
        <div className="divide-y divide-gray-200">
          {locations.map((location) => (
            <button
              key={location.placeId}
              onClick={() => onLocationSelect(location.coordinates, location.formattedAddress)}
              className="w-full p-3 text-left hover:bg-gray-50 focus:bg-gray-50 focus:outline-none transition-colors"
            >
              <div className="flex items-start space-x-3">
                <div className="flex-shrink-0 mt-0.5">
                  <MapPin className="h-4 w-4 text-gray-400" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-900 truncate">
                    {location.formattedAddress}
                  </p>
                  <p className="text-xs text-gray-500 mt-1">
                    Lat: {location.coordinates.lat.toFixed(4)}, Lng: {location.coordinates.lng.toFixed(4)}
                  </p>
                </div>
                <div className="flex-shrink-0">
                  <Check className="h-4 w-4 text-blue-600 opacity-0 group-hover:opacity-100" />
                </div>
              </div>
            </button>
          ))}
        </div>
      )}
      
      {!isLoading && !error && locations.length === 0 && address.trim() && (
        <div className="p-4 text-center">
          <p className="text-sm text-gray-600">No locations found</p>
        </div>
      )}
      
      <div className="p-2 border-t border-gray-200">
        <button
          onClick={onCancel}
          className="w-full text-sm text-gray-600 hover:text-gray-800 py-1"
        >
          Cancel
        </button>
      </div>
    </div>
  );
};

export default LocationPreview; 