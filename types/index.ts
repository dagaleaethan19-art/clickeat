export interface FoodItem {
  id: string;
  name: string;
  description: string;
  price: number;
  category: string;
  image: string;
  available: boolean;
  preparationTime: number;
  rating: number;
  sellerId: string;
  sellerName: string;
  inventory: number; // Available quantity
  maxInventory: number; // Maximum stock capacity
}

export interface Reservation {
  id: string;
  orderCode: string; // Added order code
  foodItemId: string;
  foodItem: FoodItem;
  buyerId: string;
  buyerName: string;
  quantity: number;
  reservationTime: string;
  pickupTime: string;
  status: 'pending' | 'confirmed' | 'ready' | 'completed' | 'cancelled';
  totalAmount: number;
  notes?: string;
}

export interface User {
  id: string;
  name: string;
  email: string;
  phone: string;
  role: 'buyer' | 'seller';
  profileImage?: string;
}

export interface TimeSlot {
  id: string;
  time: string;
  available: boolean;
}