export interface Restroom {
  id: string;
  name: string;
  address: string;
  city: string;
  coordinates: {
    latitude: number;
    longitude: number;
  };
  distance?: number;
  rating: number;
  cleanliness: number;
  accessibility: boolean;
  isPaid: boolean;
  price?: number;
  businessType: 'restaurant' | 'cafe' | 'bar' | 'public' | 'gas_station' | 'mall';
  isOpen: boolean;
  availability: 'available' | 'occupied' | 'out_of_order';
  amenities: string[];
  reviews: Review[];
  photos: string[];
  lastUpdated: string;
  checkInCount: number;
}

export interface Review {
  id: string;
  userId: string;
  userName: string;
  rating: number;
  cleanliness: number;
  comment: string;
  photos: string[];
  createdAt: string;
  helpful: number;
}

export interface User {
  id: string;
  name: string;
  avatar: string;
  reviewCount: number;
  level: number;
  joinedAt: string;
}