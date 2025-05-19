import React, { useEffect, useState, useCallback } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap, Circle } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import '@/styles/map.css';
import { Search, MapPin, Building2, CreditCard, Info, X, Filter, Layers, Navigation, Clock, Phone, Globe } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { Link } from 'react-router-dom';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from '@/components/ui/command';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { motion, AnimatePresence } from 'framer-motion';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';

// Custom marker icons with water-drop style
const bankIcon = L.divIcon({
  className: 'custom-div-icon',
  html: `<div class="marker-pin bank"></div>`,
  iconSize: [36, 36],
  iconAnchor: [18, 36],
  popupAnchor: [0, -36]
});

const atmIcon = L.divIcon({
  className: 'custom-div-icon',
  html: `<div class="marker-pin atm"></div>`,
  iconSize: [36, 36],
  iconAnchor: [18, 36],
  popupAnchor: [0, -36]
});

const userIcon = L.divIcon({
  className: 'custom-div-icon',
  html: `<div class="marker-pin user"></div>`,
  iconSize: [36, 36],
  iconAnchor: [18, 36],
  popupAnchor: [0, -36]
});

interface Location {
  id: string;
  name: string;
  type: 'bank' | 'atm';
  position: [number, number];
  distance?: number;
}

// Comprehensive list of banks and ATMs with more details
const bankTypes = [
  { name: 'State Bank of India', type: 'Public Sector Bank' },
  { name: 'HDFC Bank', type: 'Private Sector Bank' },
  { name: 'ICICI Bank', type: 'Private Sector Bank' },
  { name: 'Axis Bank', type: 'Private Sector Bank' },
  { name: 'Punjab National Bank', type: 'Public Sector Bank' },
  { name: 'Bank of Baroda', type: 'Public Sector Bank' },
  { name: 'Canara Bank', type: 'Public Sector Bank' },
  { name: 'Union Bank of India', type: 'Public Sector Bank' },
  { name: 'Bank of India', type: 'Public Sector Bank' },
  { name: 'Central Bank of India', type: 'Public Sector Bank' },
  { name: 'Indian Bank', type: 'Public Sector Bank' },
  { name: 'UCO Bank', type: 'Public Sector Bank' },
  { name: 'Punjab & Sind Bank', type: 'Public Sector Bank' },
  { name: 'IDBI Bank', type: 'Public Sector Bank' },
  { name: 'Kotak Mahindra Bank', type: 'Private Sector Bank' },
  { name: 'Yes Bank', type: 'Private Sector Bank' },
  { name: 'Federal Bank', type: 'Private Sector Bank' },
  { name: 'Karnataka Bank', type: 'Private Sector Bank' },
  { name: 'South Indian Bank', type: 'Private Sector Bank' },
  { name: 'City Union Bank', type: 'Private Sector Bank' },
  { name: 'DCB Bank', type: 'Private Sector Bank' },
  { name: 'RBL Bank', type: 'Private Sector Bank' },
  { name: 'Bandhan Bank', type: 'Private Sector Bank' },
  { name: 'IDFC FIRST Bank', type: 'Private Sector Bank' },
  { name: 'AU Small Finance Bank', type: 'Small Finance Bank' },
  { name: 'Ujjivan Small Finance Bank', type: 'Small Finance Bank' },
  { name: 'Equitas Small Finance Bank', type: 'Small Finance Bank' },
  { name: 'Fino Payments Bank', type: 'Payments Bank' },
  { name: 'Airtel Payments Bank', type: 'Payments Bank' },
  { name: 'India Post Payments Bank', type: 'Payments Bank' },
  { name: 'Jio Payments Bank', type: 'Payments Bank' },
  { name: 'Paytm Payments Bank', type: 'Payments Bank' },
  { name: 'Cooperative Bank', type: 'Cooperative Bank' },
  { name: 'Regional Rural Bank', type: 'Regional Rural Bank' }
];

// Function to generate random nearby locations within 7km radius
const generateNearbyLocations = (center: [number, number], count: number): Location[] => {
  const locations: Location[] = [];
  const bankNames = bankTypes.map(bank => bank.name);
  
  for (let i = 0; i < count; i++) {
    const isBank = Math.random() > 0.4; // 60% banks, 40% ATMs
    const latOffset = (Math.random() - 0.5) * 0.07; // ~7km radius
    const lngOffset = (Math.random() - 0.5) * 0.07;
    
    const bankIndex = i % bankNames.length;
    const bankName = bankNames[bankIndex];
    const position: [number, number] = [center[0] + latOffset, center[1] + lngOffset];
    
    // Calculate actual distance
    const distance = calculateDistance(center, position);
    
    locations.push({
      id: `${i + 1}`,
      name: isBank ? bankName : `${bankName} ATM`,
      type: isBank ? 'bank' : 'atm',
      position,
      distance
    });
  }
  
  return locations;
};

// Function to calculate distance between two points in kilometers
const calculateDistance = (point1: [number, number], point2: [number, number]): number => {
  const R = 6371; // Earth's radius in km
  const dLat = (point2[0] - point1[0]) * Math.PI / 180;
  const dLon = (point2[1] - point1[1]) * Math.PI / 180;
  const a = 
    Math.sin(dLat/2) * Math.sin(dLat/2) +
    Math.cos(point1[0] * Math.PI / 180) * Math.cos(point2[0] * Math.PI / 180) * 
    Math.sin(dLon/2) * Math.sin(dLon/2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
  return R * c;
};

const LocationTracker = () => {
  const map = useMap();
  const [userLocation, setUserLocation] = useState<[number, number] | null>(null);
  const [nearbyLocations, setNearbyLocations] = useState<Location[]>([]);
  const [showStats, setShowStats] = useState(true);
  const [radius, setRadius] = useState(7); // 7km radius
  const [showRadius, setShowRadius] = useState(true);
  const [selectedFilters, setSelectedFilters] = useState({
    banks: true,
    atms: true
  });

  useEffect(() => {
    if ('geolocation' in navigator) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const { latitude, longitude } = position.coords;
          const location: [number, number] = [latitude, longitude];
          setUserLocation(location);
          map.setView(location, 12);
          
          const locations = generateNearbyLocations(location, 30);
          setNearbyLocations(locations);
        },
        (error) => {
          console.error('Error getting location:', error);
          const defaultLocation: [number, number] = [19.0760, 72.8777];
          setUserLocation(defaultLocation);
          map.setView(defaultLocation, 12);
          
          const locations = generateNearbyLocations(defaultLocation, 30);
          setNearbyLocations(locations);
        }
      );
    }
  }, [map]);

  const handleFilterChange = (type: 'banks' | 'atms') => {
    setSelectedFilters(prev => ({
      ...prev,
      [type]: !prev[type]
    }));
  };

  const filteredLocations = nearbyLocations.filter(location => 
    selectedFilters[location.type === 'bank' ? 'banks' : 'atms']
  );

  const stats = {
    totalBanks: nearbyLocations.filter(loc => loc.type === 'bank').length,
    totalATMs: nearbyLocations.filter(loc => loc.type === 'atm').length,
    nearestBank: nearbyLocations
      .filter(loc => loc.type === 'bank')
      .sort((a, b) => (a.distance || 0) - (b.distance || 0))[0],
    nearestATM: nearbyLocations
      .filter(loc => loc.type === 'atm')
      .sort((a, b) => (a.distance || 0) - (b.distance || 0))[0]
  };

  return (
    <>
      {userLocation && (
        <>
          <Marker position={userLocation} icon={userIcon}>
            <Popup>
              <div className="p-2">
                <h3 className="font-medium">Your Location</h3>
                <p className="text-sm text-muted-foreground">
                  {userLocation[0].toFixed(6)}, {userLocation[1].toFixed(6)}
                </p>
              </div>
            </Popup>
          </Marker>
          {showRadius && (
            <Circle
              center={userLocation}
              radius={radius * 1000}
              pathOptions={{
                color: '#4F46E5',
                fillColor: '#4F46E5',
                fillOpacity: 0.1,
                weight: 2
              }}
            />
          )}
        </>
      )}
      {filteredLocations.map((location) => (
        <Marker
          key={location.id}
          position={location.position}
          icon={location.type === 'bank' ? bankIcon : atmIcon}
        >
          <Popup>
            <div className="p-2">
              <div className="flex items-center gap-2 mb-2">
                {location.type === 'bank' ? (
                  <Building2 className="w-4 h-4 text-primary" />
                ) : (
                  <CreditCard className="w-4 h-4 text-primary" />
                )}
                <h3 className="font-medium">{location.name}</h3>
              </div>
              {location.distance && (
                <p className="text-sm text-primary mt-1 flex items-center gap-1">
                  <MapPin className="w-3 h-3" />
                  {location.distance.toFixed(1)} km away
                </p>
              )}
              <Button
                variant="outline"
                size="sm"
                className="w-full mt-2"
                onClick={() => {
                  const url = `https://www.google.com/maps/dir/?api=1&destination=${location.position[0]},${location.position[1]}`;
                  window.open(url, '_blank');
                }}
              >
                <Navigation className="w-4 h-4 mr-2" />
                Open in Google Maps
              </Button>
            </div>
          </Popup>
        </Marker>
      ))}

      <AnimatePresence>
        {showStats && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
            className="absolute top-4 right-4 z-[1000] w-80"
          >
            <Card className="bg-background/80 backdrop-blur-sm border-white/10">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Nearby Locations</CardTitle>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8"
                  onClick={() => setShowStats(false)}
                >
                  <X className="h-4 w-4" />
                </Button>
              </CardHeader>
              <CardContent>
                <Tabs defaultValue="filters" className="w-full">
                  <TabsList className="grid w-full grid-cols-2">
                    <TabsTrigger value="filters">Filters</TabsTrigger>
                    <TabsTrigger value="stats">Stats</TabsTrigger>
                  </TabsList>
                  <TabsContent value="filters" className="space-y-4">
                    <div className="flex items-center justify-between">
                      <Label htmlFor="banks">Show Banks</Label>
                      <Switch
                        id="banks"
                        checked={selectedFilters.banks}
                        onCheckedChange={() => handleFilterChange('banks')}
                      />
                    </div>
                    <div className="flex items-center justify-between">
                      <Label htmlFor="atms">Show ATMs</Label>
                      <Switch
                        id="atms"
                        checked={selectedFilters.atms}
                        onCheckedChange={() => handleFilterChange('atms')}
                      />
                    </div>
                    <div className="flex items-center justify-between">
                      <Label htmlFor="radius">Show Radius</Label>
                      <Switch
                        id="radius"
                        checked={showRadius}
                        onCheckedChange={setShowRadius}
                      />
                    </div>
                  </TabsContent>
                  <TabsContent value="stats">
                    <div className="grid gap-4">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <Building2 className="w-4 h-4 text-primary" />
                          <span className="text-sm">Banks</span>
                        </div>
                        <Badge variant="secondary">{stats.totalBanks}</Badge>
                      </div>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <CreditCard className="w-4 h-4 text-primary" />
                          <span className="text-sm">ATMs</span>
                        </div>
                        <Badge variant="secondary">{stats.totalATMs}</Badge>
                      </div>
                      {stats.nearestBank && (
                        <div className="text-sm">
                          <p className="text-muted-foreground">Nearest Bank:</p>
                          <p className="font-medium">{stats.nearestBank.name}</p>
                          <p className="text-primary text-xs">
                            {stats.nearestBank.distance?.toFixed(1)} km away
                          </p>
                        </div>
                      )}
                      {stats.nearestATM && (
                        <div className="text-sm">
                          <p className="text-muted-foreground">Nearest ATM:</p>
                          <p className="font-medium">{stats.nearestATM.name}</p>
                          <p className="text-primary text-xs">
                            {stats.nearestATM.distance?.toFixed(1)} km away
                          </p>
                        </div>
                      )}
                    </div>
                  </TabsContent>
                </Tabs>
              </CardContent>
            </Card>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};

const MapComponent = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();
  const [filteredLocations, setFilteredLocations] = useState<Location[]>([]);
  const [open, setOpen] = useState(false);

  const handleSearch = useCallback((query: string) => {
    if (!query.trim()) {
      setFilteredLocations([]);
      return;
    }

    setLoading(true);
    try {
      const searchResults = generateNearbyLocations([19.0760, 72.8777], 30)
        .filter(location =>
          location.name.toLowerCase().includes(query.toLowerCase()) ||
          location.address.toLowerCase().includes(query.toLowerCase())
        )
        .slice(0, 5);
      setFilteredLocations(searchResults);
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to search locations',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  }, [toast]);

  return (
    <div className="relative h-[calc(100vh-4rem)] rounded-xl overflow-hidden border border-white/10">
      <div className="absolute top-4 left-4 z-[1000] w-96">
        <div className="relative">
          <Input
            placeholder="Search for banks or ATMs..."
            value={searchQuery}
            onChange={(e) => {
              setSearchQuery(e.target.value);
              handleSearch(e.target.value);
            }}
            className="w-full bg-background/80 backdrop-blur-sm hover:bg-background/90 transition-colors pr-10"
          />
          <Search className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        </div>
        {filteredLocations.length > 0 && (
          <Card className="mt-2 bg-background/80 backdrop-blur-sm border-white/10">
            <ScrollArea className="h-[200px]">
              {filteredLocations.map((location) => (
                <div
                  key={location.id}
                  className="p-3 hover:bg-white/5 cursor-pointer transition-colors"
                  onClick={() => {
                    setSearchQuery(location.name);
                    setFilteredLocations([]);
                  }}
                >
                  <div className="flex items-center gap-2">
                    {location.type === 'bank' ? (
                      <Building2 className="w-4 h-4 text-primary" />
                    ) : (
                      <CreditCard className="w-4 h-4 text-primary" />
                    )}
                    <div className="flex flex-col">
                      <span className="font-medium">{location.name}</span>
                      <span className="text-sm text-muted-foreground">
                        {location.distance?.toFixed(1)} km away
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </ScrollArea>
          </Card>
        )}
      </div>

      <MapContainer
        center={[19.0760, 72.8777]}
        zoom={12}
        style={{ height: '100%', width: '100%' }}
        className="map-container"
      >
        <TileLayer
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        />
        <LocationTracker />
      </MapContainer>
    </div>
  );
};

const ATMLocator = () => {
  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <main className="container mx-auto px-4 py-6">
        <div className="mb-6">
          <h1 className="text-3xl font-bold mb-2">ATM & Bank Locator</h1>
          <p className="text-muted-foreground">
            Find the nearest banks and ATMs around you. Works offline too!
          </p>
        </div>
        <MapComponent />
      </main>
      <Footer />
    </div>
  );
};

export default ATMLocator;
