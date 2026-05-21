const NOMINATIM_BASE_URL = 'https://nominatim.openstreetmap.org';

export interface NominatimResult {
  place_id: number;
  lat: string;
  lon: string;
  display_name: string;
  address: {
    road?: string;
    neighbourhood?: string;
    suburb?: string;
    city?: string;
    municipality?: string;
    county?: string;
    state?: string;
    country?: string;
    postcode?: string;
  };
}

async function fetchWithTimeout(url: string, timeout = 15000): Promise<Response> {
  const controller = new AbortController();
  const id = setTimeout(() => controller.abort(), timeout);
  try {
    const response = await fetch(url, {
      signal: controller.signal,
      headers: {
        'User-Agent': 'FordGuardian/1.0',
        'Accept': 'application/json',
      },
    });
    clearTimeout(id);
    return response;
  } catch (error) {
    clearTimeout(id);
    throw error;
  }
}

export interface DealerLocation {
  name: string;
  address: string;
  lat: number;
  lon: number;
  distance?: number;
}

function calculateDistance(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 6371;
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLon = (lon2 - lon1) * Math.PI / 180;
  const a = 
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * 
    Math.sin(dLon / 2) * Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

export const nominatimApi = {
  async searchAddress(query: string): Promise<NominatimResult[]> {
    const url = `${NOMINATIM_BASE_URL}/search?q=${encodeURIComponent(query)}&format=json&limit=5`;
    const response = await fetchWithTimeout(url);
    if (!response.ok) throw new Error(`Nominatim API error: ${response.status}`);
    return response.json();
  },

  async reverseGeocode(lat: number, lon: number): Promise<NominatimResult | null> {
    const url = `${NOMINATIM_BASE_URL}/reverse?lat=${lat}&lon=${lon}&format=json`;
    const response = await fetchWithTimeout(url);
    if (!response.ok) throw new Error(`Nominatim API error: ${response.status}`);
    const data = await response.json();
    return data.place_id ? data : null;
  },

  async findNearbyDealers(lat: number, lon: number, radiusKm = 20): Promise<DealerLocation[]> {
    const url = `${NOMINATIM_BASE_URL}/search?q=Ford+concessionaria&lat=${lat}&lon=${lon}&radius=${radiusKm * 1000}&format=json&limit=10`;
    const response = await fetchWithTimeout(url);
    if (!response.ok) throw new Error(`Nominatim API error: ${response.status}`);
    const results: NominatimResult[] = await response.json();
    
    return results.map(r => ({
      name: r.display_name.split(',')[0],
      address: r.display_name,
      lat: parseFloat(r.lat),
      lon: parseFloat(r.lon),
      distance: calculateDistance(lat, lon, parseFloat(r.lat), parseFloat(r.lon)),
    })).sort((a, b) => (a.distance || 0) - (b.distance || 0));
  },

  async getDealerCoordinates(address: string): Promise<{ lat: number; lon: number } | null> {
    const results = await this.searchAddress(address + ', São Paulo, Brazil');
    if (results.length > 0) {
      return {
        lat: parseFloat(results[0].lat),
        lon: parseFloat(results[0].lon),
      };
    }
    return null;
  },
};