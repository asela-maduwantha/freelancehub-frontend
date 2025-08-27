"use client";
import { useState, useEffect, useRef } from 'react';
import { ChevronDown, Search, MapPin, Check } from 'lucide-react';
import { clsx } from 'clsx';

interface Country {
  code: string;
  name: string;
  phoneCode: string;
  flag: string;
}

interface City {
  name: string;
  country: string;
  region?: string;
}

interface LocationSelectorProps {
  value?: { country: string; city: string };
  onChange: (location: { country: string; city: string }) => void;
  error?: string;
  disabled?: boolean;
  placeholder?: string;
  className?: string;
}

// Mock data - In real app, this would come from your API
const mockCountries: Country[] = [
  { code: 'US', name: 'United States', phoneCode: '+1', flag: '🇺🇸' },
  { code: 'GB', name: 'United Kingdom', phoneCode: '+44', flag: '🇬🇧' },
  { code: 'CA', name: 'Canada', phoneCode: '+1', flag: '🇨🇦' },
  { code: 'AU', name: 'Australia', phoneCode: '+61', flag: '🇦🇺' },
  { code: 'DE', name: 'Germany', phoneCode: '+49', flag: '🇩🇪' },
  { code: 'FR', name: 'France', phoneCode: '+33', flag: '🇫🇷' },
  { code: 'IN', name: 'India', phoneCode: '+91', flag: '🇮🇳' },
  { code: 'SG', name: 'Singapore', phoneCode: '+65', flag: '🇸🇬' },
];

const mockCities: Record<string, City[]> = {
  US: [
    { name: 'New York', country: 'US', region: 'New York' },
    { name: 'Los Angeles', country: 'US', region: 'California' },
    { name: 'Chicago', country: 'US', region: 'Illinois' },
    { name: 'Houston', country: 'US', region: 'Texas' },
    { name: 'Phoenix', country: 'US', region: 'Arizona' },
  ],
  GB: [
    { name: 'London', country: 'GB', region: 'England' },
    { name: 'Manchester', country: 'GB', region: 'England' },
    { name: 'Birmingham', country: 'GB', region: 'England' },
    { name: 'Edinburgh', country: 'GB', region: 'Scotland' },
  ],
  CA: [
    { name: 'Toronto', country: 'CA', region: 'Ontario' },
    { name: 'Vancouver', country: 'CA', region: 'British Columbia' },
    { name: 'Montreal', country: 'CA', region: 'Quebec' },
    { name: 'Calgary', country: 'CA', region: 'Alberta' },
  ],
  // Add more countries and cities as needed
};

const LocationSelector = ({ 
  value, 
  onChange, 
  error, 
  disabled = false, 
  placeholder = "Select your location",
  className 
}: LocationSelectorProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCountry, setSelectedCountry] = useState<Country | null>(null);
  const [cities, setCities] = useState<City[]>([]);
  const [loadingCities, setLoadingCities] = useState(false);
  
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Get selected country from value
  useEffect(() => {
    if (value?.country) {
      const country = mockCountries.find(c => c.code === value.country);
      setSelectedCountry(country || null);
      
      if (country) {
        loadCities(country.code);
      }
    }
  }, [value?.country]);

  // Load cities for selected country
  const loadCities = async (countryCode: string) => {
    setLoadingCities(true);
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 300));
      setCities(mockCities[countryCode] || []);
    } catch (error) {
      console.error('Failed to load cities:', error);
      setCities([]);
    } finally {
      setLoadingCities(false);
    }
  };

  // Filter countries and cities based on search
  const filteredCountries = mockCountries.filter(country =>
    country.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const filteredCities = cities.filter(city =>
    city.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Handle country selection
  const handleCountrySelect = (country: Country) => {
    setSelectedCountry(country);
    loadCities(country.code);
    setSearchTerm('');
    onChange({ country: country.code, city: '' });
  };

  // Handle city selection
  const handleCitySelect = (city: City) => {
    onChange({ 
      country: selectedCountry?.code || '', 
      city: city.name 
    });
    setIsOpen(false);
    setSearchTerm('');
  };

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
        setSearchTerm('');
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const displayValue = value?.country && value?.city 
    ? `${value.city}, ${mockCountries.find(c => c.code === value.country)?.name}`
    : value?.country 
    ? mockCountries.find(c => c.code === value.country)?.name
    : '';

  return (
    <div className={clsx('relative', className)} ref={dropdownRef}>
      <button
        type="button"
        onClick={() => !disabled && setIsOpen(!isOpen)}
        disabled={disabled}
        className={clsx(
          'w-full px-4 py-3 text-left border rounded-lg transition-all duration-200 focus:outline-none focus:ring-2 flex items-center justify-between',
          {
            'border-gray-300 focus:border-blue-500 focus:ring-blue-500/20': !error,
            'border-red-500 focus:border-red-500 focus:ring-red-500/20': error,
            'bg-gray-50 cursor-not-allowed': disabled,
            'bg-white cursor-pointer hover:border-gray-400': !disabled,
          }
        )}
      >
        <div className="flex items-center space-x-2">
          <MapPin className="w-4 h-4 text-gray-400" />
          <span className={displayValue ? 'text-gray-900' : 'text-gray-500'}>
            {displayValue || placeholder}
          </span>
        </div>
        <ChevronDown 
          className={clsx(
            'w-4 h-4 text-gray-400 transition-transform duration-200',
            { 'rotate-180': isOpen }
          )} 
        />
      </button>

      {isOpen && (
        <div className="absolute z-50 w-full mt-1 bg-white border border-gray-300 rounded-lg shadow-lg max-h-80 overflow-hidden">
          {/* Search */}
          <div className="p-3 border-b border-gray-200">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="text"
                placeholder={selectedCountry ? "Search cities..." : "Search countries..."}
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
          </div>

          <div className="max-h-60 overflow-y-auto">
            {!selectedCountry ? (
              // Show countries
              <div className="py-2">
                {filteredCountries.length > 0 ? (
                  filteredCountries.map((country) => (
                    <button
                      key={country.code}
                      onClick={() => handleCountrySelect(country)}
                      className="w-full px-4 py-2 text-left hover:bg-blue-50 flex items-center space-x-3 transition-colors"
                    >
                      <span className="text-xl">{country.flag}</span>
                      <span className="text-gray-900">{country.name}</span>
                      <span className="text-gray-500 text-sm">{country.phoneCode}</span>
                    </button>
                  ))
                ) : (
                  <div className="px-4 py-6 text-center text-gray-500">
                    No countries found
                  </div>
                )}
              </div>
            ) : (
              // Show cities
              <div className="py-2">
                {/* Back to countries */}
                <button
                  onClick={() => {
                    setSelectedCountry(null);
                    setSearchTerm('');
                  }}
                  className="w-full px-4 py-2 text-left hover:bg-gray-50 text-blue-600 border-b border-gray-200 flex items-center space-x-2"
                >
                  <span>←</span>
                  <span>Back to countries</span>
                </button>

                {loadingCities ? (
                  <div className="px-4 py-6 text-center text-gray-500">
                    Loading cities...
                  </div>
                ) : filteredCities.length > 0 ? (
                  filteredCities.map((city, index) => (
                    <button
                      key={index}
                      onClick={() => handleCitySelect(city)}
                      className="w-full px-4 py-2 text-left hover:bg-blue-50 flex items-center justify-between transition-colors"
                    >
                      <div>
                        <div className="text-gray-900">{city.name}</div>
                        {city.region && (
                          <div className="text-sm text-gray-500">{city.region}</div>
                        )}
                      </div>
                      {value?.city === city.name && (
                        <Check className="w-4 h-4 text-blue-500" />
                      )}
                    </button>
                  ))
                ) : (
                  <div className="px-4 py-6 text-center text-gray-500">
                    No cities found
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      )}

      {error && (
        <p className="mt-1 text-sm text-red-600">{error}</p>
      )}
    </div>
  );
};

export default LocationSelector;
