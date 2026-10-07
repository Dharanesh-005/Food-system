export type UserRole = 'admin' | 'staff' | 'volunteer' | 'beneficiary' | 'customer';

export type FoodStatus = 'sufficient' | 'low' | 'critical' | 'emergency';

export type MealStatusType = 'completed' | 'pending' | 'missed';

export type RequestStatus =
  | 'Requested'
  | 'Reviewed'
  | 'Assigned'
  | 'Accepted'
  | 'Out for Delivery'
  | 'Arrived'
  | 'Delivered'
  | 'Completed';

export type DeliveryStatus = 'Assigned' | 'Accepted' | 'Out for Delivery' | 'Arrived' | 'Delivered' | 'Completed';

export type AreaName =
  | 'Kumbakonam Town'
  | 'Darasuram'
  | 'Swamimalai'
  | 'Thiruvidaimarudur'
  | 'Patteeswaram'
  | 'Nachiyarkoil'
  | 'Valangaiman'
  | 'Koranattukaruppur'
  | 'Ullur'
  | 'Cholapuram';

export interface GeoLocation {
  lat: number;
  lng: number;
}

export interface Beneficiary {
  id: string;
  code: string;
  name: string;
  age: number;
  gender: 'Female' | 'Male' | 'Other';
  area: AreaName;
  address: string;
  phone: string;
  emergencyContact: string;
  emergencyContactRelation: string;
  foodRequirement: string;
  currentStockKg: number;
  requiredStockKg: number;
  stockUnit: string;
  foodStatus: FoodStatus;
  mealStatus: {
    breakfast: MealStatusType;
    lunch: MealStatusType;
    dinner: MealStatusType;
  };
  ambientTemp: number; // in Celsius
  ambientHumidity: number; // percentage
  coords: GeoLocation;
  locationSharingActive: boolean;
  locationLastUpdated: string;
  profilePhotoUrl: string;
  dietaryNotes: string;
  healthNotes: string;
  registeredDate: string;
  assistanceHistory: Array<{
    id: string;
    date: string;
    type: string;
    status: string;
    notes: string;
  }>;
}

export interface FoodRecord {
  id: string;
  beneficiaryId: string;
  beneficiaryName: string;
  area: AreaName;
  foodType: string;
  quantity: number;
  requiredQuantity: number;
  unit: string;
  temp: number;
  humidity: number;
  timestamp: string;
  photoUrl: string;
  status: FoodStatus;
}

export interface AssistanceRequest {
  id: string;
  beneficiaryId: string;
  beneficiaryName: string;
  area: AreaName;
  foodRequired: string;
  quantity: string;
  reason: string;
  priority: 'Normal' | 'Urgent' | 'Emergency';
  status: RequestStatus;
  requestedAt: string;
  assignedVolunteerId?: string;
  assignedVolunteerName?: string;
  coords: GeoLocation;
  deliveryNotes?: string;
}

export interface Volunteer {
  id: string;
  code: string;
  name: string;
  phone: string;
  serviceArea: AreaName;
  availability: 'Available' | 'On Delivery' | 'Offline';
  activeDeliveryId?: string;
  completedDeliveries: number;
  rating: number;
  avatarUrl: string;
  currentCoords: GeoLocation;
  vehicleType?: string;
}

export interface Delivery {
  id: string;
  requestId: string;
  beneficiaryId: string;
  beneficiaryName: string;
  beneficiaryPhone: string;
  volunteerId: string;
  volunteerName: string;
  volunteerPhone: string;
  area: AreaName;
  foodItems: string;
  startCoords: GeoLocation;
  destCoords: GeoLocation;
  currentVolunteerCoords: GeoLocation;
  status: DeliveryStatus;
  startedAt?: string;
  arrivedAt?: string;
  completedAt?: string;
  distanceKm: number;
  etaMinutes: number;
  proofPhotoUrl?: string;
  deliveryTimestamp?: string;
}

export interface EmergencyAlert {
  id: string;
  beneficiaryId: string;
  beneficiaryName: string;
  age: number;
  area: AreaName;
  phone: string;
  time: string;
  status: 'Active' | 'Investigating' | 'Volunteer Assigned' | 'Resolved';
  coords: GeoLocation;
  notes: string;
  assignedVolunteerId?: string;
  assignedVolunteerName?: string;
}

export interface MarketProduct {
  id: string;
  name: string;
  description: string;
  ingredients: string[];
  price: number;
  availableStock: number;
  imageUrl: string;
  prepTime: string;
  category: string;
  isAvailable: boolean;
  socialImpactNote?: string;
}

export interface CartItem {
  product: MarketProduct;
  quantity: number;
}

export interface MarketOrder {
  id: string;
  orderNumber: string;
  customerName: string;
  customerPhone: string;
  deliveryAddress: string;
  deliveryType: 'delivery' | 'pickup';
  paymentMethod: 'UPI / GPay' | 'Cash on Delivery' | 'Card';
  items: Array<{
    productId: string;
    productName: string;
    price: number;
    quantity: number;
  }>;
  totalAmount: number;
  status: 'Confirmed' | 'Preparing' | 'Ready' | 'Delivered' | 'Cancelled';
  createdAt: string;
  impactNote: string;
}

export interface ActivityLog {
  id: string;
  type: 'request' | 'location' | 'delivery' | 'emergency' | 'market' | 'food';
  message: string;
  timestamp: string;
  severity: 'info' | 'warning' | 'danger' | 'success';
}

export interface ToastNotification {
  id: string;
  title: string;
  message: string;
  type: 'info' | 'success' | 'warning' | 'error';
  timestamp: string;
}
