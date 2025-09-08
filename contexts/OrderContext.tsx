import React, { createContext, useContext, useState, ReactNode } from 'react';
import { FoodItem } from '@/types';
import { useInventory } from './InventoryContext';
import { Platform, Alert } from 'react-native';

interface OrderItem {
  id: string;
  orderCode: string;
  foodItem: FoodItem;
  quantity: number;
  pickupTime: string;
  notes?: string;
  totalAmount: number;
  orderTime: string;
  status: 'pending' | 'confirmed' | 'ready' | 'completed' | 'cancelled';
}

interface OrderContextType {
  orders: OrderItem[];
  addOrder: (order: Omit<OrderItem, 'id' | 'orderTime' | 'status' | 'orderCode'>) => boolean;
  updateOrderStatus: (orderId: string, status: OrderItem['status']) => void;
  getOrdersByStatus: (status: OrderItem['status']) => OrderItem[];
  getTodaysOrders: () => OrderItem[];
}

const OrderContext = createContext<OrderContextType | undefined>(undefined);

// Service charge per order
const SERVICE_CHARGE = 2.00;

// Generate order code
const generateOrderCode = (): string => {
  const prefix = 'RC';
  const number = Math.floor(Math.random() * 9999) + 1;
  return `${prefix}${number.toString().padStart(3, '0')}`;
};

// Play notification sound (web-compatible)
const playNotificationSound = () => {
  if (Platform.OS === 'web') {
    try {
      // Create a simple beep sound using Web Audio API
      const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
      const oscillator = audioContext.createOscillator();
      const gainNode = audioContext.createGain();
      
      oscillator.connect(gainNode);
      gainNode.connect(audioContext.destination);
      
      oscillator.frequency.value = 800;
      oscillator.type = 'sine';
      
      gainNode.gain.setValueAtTime(0.3, audioContext.currentTime);
      gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.5);
      
      oscillator.start(audioContext.currentTime);
      oscillator.stop(audioContext.currentTime + 0.5);
    } catch (error) {
      console.log('Audio not supported');
    }
  }
};

export function OrderProvider({ children }: { children: ReactNode }) {
  const [orders, setOrders] = useState<OrderItem[]>([]);
  const { updateInventory } = useInventory();

  const addOrder = (orderData: Omit<OrderItem, 'id' | 'orderTime' | 'status' | 'orderCode'>): boolean => {
    // Check if there's enough inventory
    if (orderData.foodItem.inventory < orderData.quantity) {
      return false; // Not enough inventory
    }

    // Calculate total with service charge
    const subtotal = orderData.foodItem.price * orderData.quantity;
    const totalWithCharge = subtotal + SERVICE_CHARGE;

    const newOrder: OrderItem = {
      ...orderData,
      id: `order_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      orderCode: generateOrderCode(),
      orderTime: new Date().toISOString(),
      status: 'pending',
      totalAmount: totalWithCharge,
    };

    // Update inventory when order is placed
    updateInventory(orderData.foodItem.id, orderData.quantity);

    setOrders(prevOrders => [newOrder, ...prevOrders]);
    
    // Play notification sound
    playNotificationSound();
    
    return true; // Order placed successfully
  };

  const updateOrderStatus = (orderId: string, status: OrderItem['status']) => {
    setOrders(prevOrders =>
      prevOrders.map(order =>
        order.id === orderId ? { ...order, status } : order
      )
    );
    
    // Play notification sound and show alerts for status updates
    if (status === 'ready') {
      playNotificationSound();
      // Show notification for ready orders
      setTimeout(() => {
        Alert.alert(
          '🔔 Order Ready!',
          'Your order is ready for pickup at the canteen counter. Please collect it within 15 minutes.',
          [
            { text: 'OK', style: 'default' }
          ]
        );
      }, 500);
    } else if (status === 'confirmed') {
      playNotificationSound();
      // Show notification for confirmed orders
      setTimeout(() => {
        Alert.alert(
          '✅ Order Confirmed!',
          'Your order has been confirmed and is now being prepared. You will be notified when it\'s ready.',
          [
            { text: 'OK', style: 'default' }
          ]
        );
      }, 500);
    } else if (status === 'completed') {
      // Show completion notification
      setTimeout(() => {
        Alert.alert(
          '🎉 Order Completed!',
          'Thank you for your order! We hope you enjoyed your meal.',
          [
            { text: 'OK', style: 'default' }
          ]
        );
      }, 500);
    }
  };

  const getOrdersByStatus = (status: OrderItem['status']) => {
    return orders.filter(order => order.status === status);
  };

  const getTodaysOrders = () => {
    const today = new Date().toDateString();
    return orders.filter(order => {
      const orderDate = new Date(order.orderTime).toDateString();
      return orderDate === today;
    });
  };

  const value: OrderContextType = {
    orders,
    addOrder,
    updateOrderStatus,
    getOrdersByStatus,
    getTodaysOrders,
  };

  return (
    <OrderContext.Provider value={value}>
      {children}
    </OrderContext.Provider>
  );
}

export function useOrders() {
  const context = useContext(OrderContext);
  if (context === undefined) {
    throw new Error('useOrders must be used within an OrderProvider');
  }
  return context;
}