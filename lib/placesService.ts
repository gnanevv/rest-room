import { Restroom } from '@/types/restroom';

// Types for Google Places API responses
interface GooglePlace {
  place_id: string;
  name: string;
  formatted_address: string;
  geometry: {
    location: {
      lat: number;
      lng: number;
    };
  };
  types: string[];
  rating?: number;
  user_ratings_total?: number;
  opening_hours?: {
    open_now: boolean;
  };
  photos?: Array<{
    photo_reference: string;
    height: number;
    width: number;
  }>;
}

interface PlacesSearchResponse {
  results: GooglePlace[];
  status: string;
  next_page_token?: string;
}

interface PlaceDetailsResponse {
  result: {
    place_id: string;
    name: string;
    formatted_address: string;
    geometry: {
      location: {
        lat: number;
        lng: number;
      };
    };
    types: string[];
    rating?: number;
    user_ratings_total?: number;
    opening_hours?: {
      open_now: boolean;
      weekday_text?: string[];
    };
    photos?: Array<{
      photo_reference: string;
      height: number;
      width: number;
    }>;
    website?: string;
    international_phone_number?: string;
    price_level?: number;
    reviews?: Array<{
      author_name: string;
      rating: number;
      text: string;
      time: number;
    }>;
  };
  status: string;
}

class PlacesService {
  private apiKey: string;
  private baseUrl = 'https://maps.googleapis.com/maps/api/place';

  constructor() {
    // Get API key from environment variables
    this.apiKey = process.env.EXPO_PUBLIC_GOOGLE_PLACES_API_KEY || '';

    if (!this.apiKey) {
      console.warn(
        'Google Places API key not found. Set EXPO_PUBLIC_GOOGLE_PLACES_API_KEY in your .env file'
      );
    }
  }

  /**
   * Search for places near a location
   */
  async searchNearby(
    latitude: number,
    longitude: number,
    radius: number = 5000, // 5km default
    types: string[] = [
      'toilet',
      'restaurant',
      'cafe',
      'bar',
      'gas_station',
      'shopping_mall',
    ]
  ): Promise<Restroom[]> {
    if (!this.apiKey) {
      console.warn(
        'No Google Places API key available. Set EXPO_PUBLIC_GOOGLE_PLACES_API_KEY in your .env file'
      );
      console.warn(
        'For now, returning empty results. Check REAL_DATA_SETUP.md for setup instructions.'
      );
      return [];
    }

    // Validate input parameters
    if (!latitude || !longitude || isNaN(latitude) || isNaN(longitude)) {
      console.error('Invalid coordinates provided:', { latitude, longitude });
      return [];
    }

    try {
      const results: Restroom[] = [];

      // Search for each type separately to get better results
      for (const type of types) {
        try {
          console.log(
            `🔍 Searching for ${type} near ${latitude}, ${longitude}`
          );
          const url = `${this.baseUrl}/nearbysearch/json?location=${latitude},${longitude}&radius=${radius}&type=${type}&key=${this.apiKey}`;

          const response = await fetch(url);
          const data: PlacesSearchResponse = await response.json();

          if (data.status === 'OK') {
            console.log(`✅ Found ${data.results.length} ${type} places`);
            // Convert Google Places to our Restroom format and filter out invalid coordinates
            const validPlaces = data.results.filter(
              (place) =>
                place.geometry?.location?.lat &&
                place.geometry?.location?.lng &&
                !isNaN(place.geometry.location.lat) &&
                !isNaN(place.geometry.location.lng)
            );
            console.log(
              `✅ ${validPlaces.length} places have valid coordinates`
            );

            const restrooms = validPlaces.map((place) =>
              this.convertPlaceToRestroom(place, type)
            );
            results.push(...restrooms);
          } else {
            console.warn(`Places API error for type ${type}:`, data.status);
          }
        } catch (error) {
          console.error(`Error searching for type ${type}:`, error);
          // Continue with other types even if one fails
        }
      }

      // Remove duplicates based on place_id
      const uniqueResults = this.removeDuplicates(results);

      console.log(`Found ${uniqueResults.length} unique places`);
      return uniqueResults;
    } catch (error) {
      console.error('Error searching nearby places:', error);
      return [];
    }
  }

  /**
   * Get detailed information about a specific place
   */
  async getPlaceDetails(placeId: string): Promise<Restroom | null> {
    if (!this.apiKey) {
      console.error('No API key available');
      return null;
    }

    try {
      const url = `${this.baseUrl}/details/json?place_id=${placeId}&fields=place_id,name,formatted_address,geometry,types,rating,user_ratings_total,opening_hours,photos,website,international_phone_number,price_level,reviews&key=${this.apiKey}`;

      const response = await fetch(url);
      const data: PlaceDetailsResponse = await response.json();

      if (data.status === 'OK') {
        return this.convertPlaceDetailsToRestroom(data.result);
      } else {
        console.warn('Places API details error:', data.status);
        return null;
      }
    } catch (error) {
      console.error('Error getting place details:', error);
      return null;
    }
  }

  /**
   * Convert Google Place to our Restroom format
   */
  private convertPlaceToRestroom(
    place: GooglePlace,
    searchType: string
  ): Restroom {
    // Determine business type based on search type and place types
    let businessType:
      | 'restaurant'
      | 'cafe'
      | 'bar'
      | 'public'
      | 'gas_station'
      | 'mall' = 'public';
    let isPaid = false;
    let price: number | undefined;

    if (searchType === 'restaurant' || place.types.includes('restaurant')) {
      businessType = 'restaurant';
      isPaid = true;
    } else if (searchType === 'cafe' || place.types.includes('cafe')) {
      businessType = 'cafe';
      isPaid = true;
    } else if (searchType === 'bar' || place.types.includes('bar')) {
      businessType = 'bar';
      isPaid = true;
    } else if (
      searchType === 'gas_station' ||
      place.types.includes('gas_station')
    ) {
      businessType = 'gas_station';
      isPaid = false;
    } else if (
      searchType === 'shopping_mall' ||
      place.types.includes('shopping_mall')
    ) {
      businessType = 'mall';
      isPaid = false;
    }

    // Determine availability based on opening hours
    let availability: 'available' | 'occupied' | 'out_of_order' = 'available';
    let isOpen = true;

    if (place.opening_hours) {
      isOpen = place.opening_hours.open_now;
      availability = isOpen ? 'available' : 'out_of_order';
    }

    return {
      id: place.place_id,
      name: place.name || 'Unnamed location',
      address: place.formatted_address || 'Address not available',
      city: this.extractCity(place.formatted_address),
      coordinates: {
        latitude: place.geometry?.location?.lat || 0,
        longitude: place.geometry?.location?.lng || 0,
      },
      distance: 0, // Will be calculated later
      rating: place.rating || 0,
      cleanliness: 0, // Not available from Places API
      accessibility: false, // Not available from Places API
      isPaid,
      price,
      businessType,
      isOpen,
      availability,
      amenities: this.getAmenitiesFromTypes(place.types),
      reviews: [], // Will be populated from details if needed
      photos: place.photos
        ? place.photos.map(
            (photo) =>
              `https://maps.googleapis.com/maps/api/place/photo?maxwidth=400&photoreference=${photo.photo_reference}&key=${this.apiKey}`
          )
        : [],
      lastUpdated: new Date().toISOString(),
      checkInCount: 0,
    };
  }

  /**
   * Convert detailed place information to Restroom format
   */
  private convertPlaceDetailsToRestroom(
    place: PlaceDetailsResponse['result']
  ): Restroom {
    const baseRestroom = this.convertPlaceToRestroom(
      place as GooglePlace,
      'toilet'
    );

    // Add additional details - only include properties that exist in Restroom type
    return {
      ...baseRestroom,
      reviews: place.reviews
        ? place.reviews.map((review) => ({
            id: `review_${review.time}`,
            userId: review.author_name,
            userName: review.author_name,
            rating: review.rating,
            cleanliness: review.rating, // Assume cleanliness matches overall rating
            comment: review.text,
            photos: [],
            createdAt: new Date(review.time * 1000).toISOString(),
            helpful: 0,
          }))
        : [],
    };
  }

  /**
   * Extract city from formatted address
   */
  private extractCity(address: string | undefined): string {
    if (!address || typeof address !== 'string') {
      return 'Unknown location';
    }

    try {
      const parts = address.split(',');
      if (parts.length >= 2) {
        return parts[parts.length - 2].trim();
      }
      return address;
    } catch (error) {
      console.warn('Error extracting city from address:', address, error);
      return 'Unknown location';
    }
  }

  /**
   * Get amenities based on place types
   */
  private getAmenitiesFromTypes(types: string[]): string[] {
    const amenities: string[] = [];

    if (types.includes('wheelchair_accessible_entrance')) {
      amenities.push('Wheelchair accessible');
    }

    if (
      types.includes('restaurant') ||
      types.includes('cafe') ||
      types.includes('bar')
    ) {
      amenities.push('Food available');
    }

    if (types.includes('gas_station')) {
      amenities.push('24/7 access');
    }

    if (types.includes('shopping_mall')) {
      amenities.push('Indoor location');
    }

    return amenities;
  }

  /**
   * Remove duplicate places based on place_id
   */
  private removeDuplicates(restrooms: Restroom[]): Restroom[] {
    const seen = new Set();
    return restrooms.filter((restroom) => {
      if (seen.has(restroom.id)) {
        return false;
      }
      seen.add(restroom.id);
      return true;
    });
  }

  /**
   * Calculate distance between two coordinates
   */
  calculateDistance(
    lat1: number,
    lon1: number,
    lat2: number,
    lon2: number
  ): number {
    const R = 6371; // Earth's radius in kilometers
    const dLat = this.deg2rad(lat2 - lat1);
    const dLon = this.deg2rad(lon2 - lon1);
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(this.deg2rad(lat1)) *
        Math.cos(this.deg2rad(lat2)) *
        Math.sin(dLon / 2) *
        Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
  }

  private deg2rad(deg: number): number {
    return deg * (Math.PI / 180);
  }
}

export const placesService = new PlacesService();
