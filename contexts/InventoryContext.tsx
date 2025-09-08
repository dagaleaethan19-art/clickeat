import React, { createContext, useContext, useState, ReactNode } from 'react';
import { FoodItem } from '@/types';
import { mockFoodItems } from '@/data/mockData';

interface InventoryContextType {
  foodItems: FoodItem[];
  updateInventory: (foodId: string, quantityUsed: number) => void;
  restockItem: (foodId: string, quantity: number) => void;
  updateItemPrice: (foodId: string, newPrice: number) => void;
  toggleItemAvailability: (foodId: string) => void;
  getLowStockItems: () => FoodItem[];
  getOutOfStockItems: () => FoodItem[];
}

const InventoryContext = createContext<InventoryContextType | undefined>(undefined);

export function InventoryProvider({ children }: { children: ReactNode }) {
  const [foodItems, setFoodItems] = useState<FoodItem[]>(mockFoodItems);

  const updateInventory = (foodId: string, quantityUsed: number) => {
    setFoodItems(prevItems =>
      prevItems.map(item => {
        if (item.id === foodId) {
          const newInventory = Math.max(0, item.inventory - quantityUsed);
          return {
            ...item,
            inventory: newInventory,
            available: newInventory > 0 && item.available
          };
        }
        return item;
      })
    );
  };

  const restockItem = (foodId: string, quantity: number) => {
    setFoodItems(prevItems =>
      prevItems.map(item => {
        if (item.id === foodId) {
          const newInventory = Math.min(item.maxInventory, item.inventory + quantity);
          return {
            ...item,
            inventory: newInventory,
            available: newInventory > 0
          };
        }
        return item;
      })
    );
  };

  const updateItemPrice = (foodId: string, newPrice: number) => {
    setFoodItems(prevItems =>
      prevItems.map(item =>
        item.id === foodId ? { ...item, price: newPrice } : item
      )
    );
  };

  const toggleItemAvailability = (foodId: string) => {
    setFoodItems(prevItems =>
      prevItems.map(item => {
        if (item.id === foodId) {
          // Can only make available if there's inventory
          const canBeAvailable = item.inventory > 0;
          return {
            ...item,
            available: canBeAvailable ? !item.available : false
          };
        }
        return item;
      })
    );
  };

  const getLowStockItems = () => {
    return foodItems.filter(item => {
      const stockPercentage = (item.inventory / item.maxInventory) * 100;
      return stockPercentage <= 20 && stockPercentage > 0; // 20% or less but not zero
    });
  };

  const getOutOfStockItems = () => {
    return foodItems.filter(item => item.inventory === 0);
  };

  const value: InventoryContextType = {
    foodItems,
    updateInventory,
    restockItem,
    updateItemPrice,
    toggleItemAvailability,
    getLowStockItems,
    getOutOfStockItems,
  };

  return (
    <InventoryContext.Provider value={value}>
      {children}
    </InventoryContext.Provider>
  );
}

export function useInventory() {
  const context = useContext(InventoryContext);
  if (context === undefined) {
    throw new Error('useInventory must be used within an InventoryProvider');
  }
  return context;
}