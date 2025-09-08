import React, { useState } from 'react';
import { View, Text, ScrollView, StyleSheet, SafeAreaView, TouchableOpacity, Modal, Image, TextInput, Dimensions, Alert } from 'react-native';
import { Search, Filter, X, Plus, Minus, MapPin, Clock, TrendingUp, Flame, Star, Package, TriangleAlert as AlertTriangle, Heart, History, Users, Timer, ShoppingCart } from 'lucide-react-native';
import FoodCard from '@/components/FoodCard';
import { mockUser, timeSlots } from '@/data/mockData';
import { FoodItem, TimeSlot } from '@/types';
import { useTheme } from '@/contexts/ThemeContext';
import { useOrders } from '@/contexts/OrderContext';
import { useInventory } from '@/contexts/InventoryContext';
import { router } from 'expo-router';

const { width } = Dimensions.get('window');

// Service charge constant
const SERVICE_CHARGE = 2.00;

export default function HomeScreen() {
  const { colors } = useTheme();
  const { addOrder } = useOrders();
  const { foodItems } = useInventory();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [selectedFood, setSelectedFood] = useState<FoodItem | null>(null);
  const [quantity, setQuantity] = useState(1);
  const [selectedTimeSlot, setSelectedTimeSlot] = useState<string>('');
  const [notes, setNotes] = useState('');

  // Get user role
  const isStudent = mockUser.role === 'buyer';

  // Mock favorites and history data
  const [favorites, setFavorites] = useState<string[]>(['1', '4', '7']); // Food item IDs
  const [mealHistory] = useState([
    { id: '1', name: 'Chicken Adobo with Rice', lastOrdered: '2024-01-14', frequency: 5 },
    { id: '4', name: 'Fried Chicken (1 piece)', lastOrdered: '2024-01-13', frequency: 3 },
    { id: '7', name: 'Pancit Canton', lastOrdered: '2024-01-12', frequency: 2 },
  ]);

  // Real-time queue status (mock data)
  const [queueStatus] = useState({
    currentServing: 'RC045',
    queueLength: 8,
    estimatedWait: 12,
    isActive: true
  });

  const categories = ['All', 'Meals', 'Snacks', 'Beverages', 'Sides'];

  const filteredFoodItems = foodItems.filter(item => {
    const matchesSearch = searchQuery === '' || 
      item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.sellerName.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = selectedCategory === 'All' || item.category === selectedCategory;
    return matchesSearch && matchesCategory && item.available;
  });

  const availableItems = filteredFoodItems.filter(item => item.available && item.inventory > 0);
  const outOfStockItems = filteredFoodItems.filter(item => item.inventory === 0);
  const lowStockItems = availableItems.filter(item => {
    const stockPercentage = (item.inventory / item.maxInventory) * 100;
    return stockPercentage <= 20;
  });
  const popularItems = availableItems.filter(item => item.rating >= 4.7);
  const quickItems = availableItems.filter(item => item.preparationTime <= 5);

  const handleReservation = () => {
    if (!selectedFood || !selectedTimeSlot) return;

    // Check if there's enough inventory
    if (selectedFood.inventory < quantity) {
      Alert.alert(
        'Insufficient Stock',
        `Sorry, only ${selectedFood.inventory} ${selectedFood.name} available. Please reduce your quantity.`,
        [{ text: 'OK', style: 'default' }]
      );
      return;
    }

    const subtotal = selectedFood.price * quantity;
    const totalWithCharge = subtotal + SERVICE_CHARGE;

    const orderData = {
      foodItem: selectedFood,
      quantity,
      pickupTime: selectedTimeSlot,
      notes,
      totalAmount: totalWithCharge
    };

    const success = addOrder(orderData);
    
    if (success) {
      Alert.alert(
        'Order Placed Successfully!',
        `Your order for ${selectedFood.name} has been placed.\nOrder Total: ₱${totalWithCharge.toFixed(2)}\nPickup time: ${selectedTimeSlot}`,
        [{ text: 'OK', style: 'default' }]
      );
      
      setSelectedFood(null);
      setQuantity(1);
      setSelectedTimeSlot('');
      setNotes('');
    } else {
      Alert.alert(
        'Order Failed',
        'Unable to place order. Please try again.',
        [{ text: 'OK', style: 'default' }]
      );
    }
  };

  const handleQuickReorder = (historyItem: any) => {
    const foodItem = foodItems.find(item => item.id === historyItem.id);
    if (!foodItem) {
      Alert.alert('Item Not Available', 'This item is no longer available.');
      return;
    }
    
    if (foodItem.inventory === 0) {
      Alert.alert('Out of Stock', 'This item is currently out of stock.');
      return;
    }
    
    // Set up the order with default values
    setSelectedFood(foodItem);
    setQuantity(1);
    setSelectedTimeSlot('');
    setNotes('');
  };

  const handleFavoritesAccess = () => {
    if (favoriteItems.length === 0) {
      Alert.alert('No Favorites', 'You haven\'t added any items to favorites yet. Browse the menu and tap the heart icon to add favorites!');
      return;
    }
    // Scroll to favorites section (in a real app, you might navigate to a dedicated screen)
    Alert.alert('Favorites', `You have ${favoriteItems.length} favorite items. Scroll down to see your "Your Favorites" section!`);
  };

  const handleQuickOrderAccess = () => {
    if (mealHistory.length === 0) {
      Alert.alert('No Order History', 'You haven\'t placed any orders yet. Order some delicious food first!');
      return;
    }
    Alert.alert('Quick Order', 'Scroll down to see your "Order Again" section for quick reordering!');
  };
  const getUserRoleDisplay = () => {
    return mockUser.role === 'seller' ? 'Seller' : 'Student';
  };

  const getUserGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good morning';
    if (hour < 17) return 'Good afternoon';
    return 'Good evening';
  };

  const getMaxQuantity = () => {
    if (!selectedFood) return 1;
    return Math.min(selectedFood.inventory, 10); // Max 10 or available inventory
  };

  const toggleFavorite = (foodId: string) => {
    setFavorites(prev => 
      prev.includes(foodId) 
        ? prev.filter(id => id !== foodId)
        : [...prev, foodId]
    );
  };

  const favoriteItems = foodItems.filter(item => favorites.includes(item.id));

  const calculateTotal = () => {
    if (!selectedFood) return 0;
    const subtotal = selectedFood.price * quantity;
    return subtotal + SERVICE_CHARGE;
  };

  const styles = createStyles(colors);

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView 
        style={styles.scrollView} 
        showsVerticalScrollIndicator={false} 
        contentContainerStyle={styles.scrollContent}
        bounces={true}
        scrollEventThrottle={16}
      >
        {/* Header */}
        <View style={styles.header}>
          <View style={styles.headerContent}>
            <View style={styles.logoContainer}>
              <Image 
                source={require('@/assets/images/image.png')} 
                style={styles.logo}
                resizeMode="contain"
              />
              <View style={styles.schoolInfo}>
                <Text style={styles.schoolName}>RSHS Canteen</Text>
                <View style={styles.locationContainer}>
                  <MapPin size={14} color={colors.primary} />
                  <Text style={styles.locationText}>Regional Science High School</Text>
                </View>
              </View>
            </View>
            <View style={styles.userGreeting}>
              <Text style={styles.greeting}>{getUserGreeting()},</Text>
              <View style={styles.userInfo}>
                <Text style={styles.username}>{mockUser.name}</Text>
                <View style={styles.roleBadge}>
                  <Text style={styles.roleText}>{getUserRoleDisplay()}</Text>
                </View>
              </View>
            </View>
          </View>
          <TouchableOpacity style={styles.filterButton}>
            <Filter size={24} color={colors.textSecondary} />
          </TouchableOpacity>
        </View>

        {/* Search Bar */}
        <View style={styles.searchContainer}>
          <Search size={20} color={colors.textSecondary} style={styles.searchIcon} />
          <TextInput
            style={styles.searchInput}
            placeholder="Search for delicious Filipino food..."
            value={searchQuery}
            onChangeText={setSearchQuery}
            placeholderTextColor={colors.textSecondary}
          />
        </View>

        {/* Real-Time Queue Status */}
        {queueStatus.isActive && (
          <View style={styles.queueStatusContainer}>
            <View style={styles.queueHeader}>
              <View style={styles.queueTitleContainer}>
                <Timer size={20} color={colors.primary} />
                <Text style={styles.queueTitle}>Live Queue Status</Text>
                <View style={styles.liveDot} />
              </View>
              <Text style={styles.queueSubtitle}>Real-time canteen updates</Text>
            </View>
            
            <View style={styles.queueContent}>
              <View style={styles.queueItem}>
                <Text style={styles.queueLabel}>Now Serving</Text>
                <Text style={styles.queueValue}>{queueStatus.currentServing}</Text>
              </View>
              <View style={styles.queueDivider} />
              <View style={styles.queueItem}>
                <Users size={16} color={colors.textSecondary} />
                <Text style={styles.queueCount}>{queueStatus.queueLength} in queue</Text>
              </View>
              <View style={styles.queueDivider} />
              <View style={styles.queueItem}>
                <Clock size={16} color={colors.accent} />
                <Text style={styles.queueWait}>~{queueStatus.estimatedWait}min wait</Text>
              </View>
            </View>
          </View>
        )}

        {/* Categories - Sticky */}
        <View style={styles.categoriesWrapper}>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.categoriesContainer}>
            <View style={styles.categoriesContent}>
              {categories.map((category) => (
                <TouchableOpacity
                  key={category}
                  style={[
                    styles.categoryButton,
                    selectedCategory === category && styles.selectedCategoryButton
                  ]}
                  onPress={() => setSelectedCategory(category)}
                >
                  <Text style={[
                    styles.categoryText,
                    selectedCategory === category && styles.selectedCategoryText
                  ]}>
                    {category}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </ScrollView>
        </View>

        {/* Enhanced Stats */}
        <View style={styles.statsContainer}>
          <View style={styles.statItem}>
            <Package size={16} color={colors.primary} />
            <Text style={styles.statNumber}>{availableItems.length}</Text>
            <Text style={styles.statLabel}>Available</Text>
          </View>
          <View style={styles.statDivider} />
          <View style={styles.statItem}>
            <AlertTriangle size={16} color="#F59E0B" />
            <Text style={[styles.statNumber, { color: '#F59E0B' }]}>{lowStockItems.length}</Text>
            <Text style={styles.statLabel}>Low Stock</Text>
          </View>
          <View style={styles.statDivider} />
          <View style={styles.statItem}>
            <Clock size={16} color={colors.primary} />
            <Text style={styles.statLabel}>5 min avg</Text>
          </View>
        </View>

        {/* Quick Access Section */}
        <View style={styles.quickAccessContainer}>
          <ScrollView 
            horizontal 
            showsHorizontalScrollIndicator={false} 
            style={styles.quickAccessScroll}
            contentContainerStyle={styles.quickAccessContent}
          >
            {/* Favorites Shortcut */}
            <TouchableOpacity 
              style={styles.quickAccessCard} 
              activeOpacity={0.8}
              onPress={handleFavoritesAccess}
            >
              <View style={[styles.quickAccessIcon, { backgroundColor: colors.error + '15' }]}>
                <Heart size={24} color={colors.error} />
              </View>
              <Text style={styles.quickAccessTitle}>Favorites</Text>
              <Text style={styles.quickAccessSubtitle}>{favorites.length} items</Text>
            </TouchableOpacity>

            {/* Meal History */}
            <TouchableOpacity 
              style={styles.quickAccessCard} 
              activeOpacity={0.8}
              onPress={handleQuickOrderAccess}
            >
              <View style={[styles.quickAccessIcon, { backgroundColor: colors.accent + '15' }]}>
                <History size={24} color={colors.accent} />
              </View>
              <Text style={styles.quickAccessTitle}>History</Text>
              <Text style={styles.quickAccessSubtitle}>{mealHistory.length} recent</Text>
            </TouchableOpacity>

            {/* Quick Reorder */}
            <TouchableOpacity 
              style={styles.quickAccessCard} 
              activeOpacity={0.8}
              onPress={handleQuickOrderAccess}
            >
              <View style={[styles.quickAccessIcon, { backgroundColor: colors.primary + '15' }]}>
                <Clock size={24} color={colors.primary} />
              </View>
              <Text style={styles.quickAccessTitle}>Quick Order</Text>
              <Text style={styles.quickAccessSubtitle}>Reorder fast</Text>
            </TouchableOpacity>
          </ScrollView>
        </View>

        {/* Food Items */}
        <View style={styles.foodContent}>
          {/* Favorite Meals Section */}
          {favoriteItems.length > 0 && (
            <>
              <View style={styles.sectionHeader}>
                <View style={styles.sectionTitleContainer}>
                  <Heart size={20} color={colors.error} />
                  <Text style={styles.sectionTitle}>Your Favorites</Text>
                </View>
                <Text style={styles.sectionSubtitle}>Your most loved meals</Text>
              </View>
              
              <ScrollView 
                horizontal 
                showsHorizontalScrollIndicator={false} 
                style={styles.favoritesContainer}
                contentContainerStyle={styles.favoritesContent}
              >
                {favoriteItems.map((item) => (
                  <View key={`favorite-${item.id}`} style={styles.favoriteItemContainer}>
                    <FoodCard
                      item={item}
                      onPress={() => setSelectedFood(item)}
                      variant="compact"
                    />
                    <TouchableOpacity 
                      style={styles.favoriteButton}
                      onPress={() => toggleFavorite(item.id)}
                    >
                      <Heart size={16} color={colors.error} fill={colors.error} />
                    </TouchableOpacity>
                  </View>
                ))}
              </ScrollView>
            </>
          )}

          {/* Recent Orders Section */}
          {mealHistory.length > 0 && (
            <>
              <View style={styles.sectionHeader}>
                <View style={styles.sectionTitleContainer}>
                  <History size={20} color={colors.accent} />
                  <Text style={styles.sectionTitle}>Order Again</Text>
                </View>
                <Text style={styles.sectionSubtitle}>Your recent favorites</Text>
              </View>
              
              <View style={styles.historyListContainer}>
                {mealHistory.map((historyItem) => {
                  const foodItem = foodItems.find(item => item.id === historyItem.id);
                  if (!foodItem) return null;
                  
                  return (
                    <TouchableOpacity 
                      key={`history-${historyItem.id}`}
                      style={styles.historyListItem}
                      onPress={() => setSelectedFood(foodItem)}
                      activeOpacity={0.8}
                    >
                      <Image source={{ uri: foodItem.image }} style={styles.historyListImage} />
                      <View style={styles.historyListContent}>
                        <Text style={[
                          styles.historyListName,
                          { fontSize: historyItem.name.length > 25 ? 14 : historyItem.name.length > 20 ? 15 : 16 }
                        ]}>{historyItem.name}</Text>
                        <Text style={styles.historyListDetails}>
                          Last ordered: {historyItem.lastOrdered} • {historyItem.frequency}x ordered
                        </Text>
                        <View style={styles.historyListFooter}>
                          <Text style={styles.historyListPrice}>₱ {foodItem.price.toFixed(2)}</Text>
                          <View style={styles.historyListMeta}>
                            <Star size={12} color="#F59E0B" fill="#F59E0B" />
                            <Text style={styles.historyListRating}>{foodItem.rating}</Text>
                            <Clock size={12} color={colors.textSecondary} />
                            <Text style={styles.historyListTime}>{foodItem.preparationTime}m</Text>
                          </View>
                        </View>
                      </View>
                      <View style={styles.historyListActions}>
                        <TouchableOpacity 
                        style={styles.historyReorderButton}
                        onPress={(e) => {
                          e.stopPropagation();
                          handleQuickReorder(historyItem);
                        }}
                        >
                          <Plus size={16} color={colors.primary} />
                          <Text style={styles.reorderButtonText}>Reorder</Text>
                        </TouchableOpacity>
                      </View>
                    </TouchableOpacity>
                  );
                })}
              </View>
            </>
          )}

          {/* Low Stock Alert */}
          {lowStockItems.length > 0 && (
            <>
              <View style={styles.alertSection}>
                <View style={styles.alertHeader}>
                  <AlertTriangle size={20} color="#F59E0B" />
                  <Text style={styles.alertTitle}>Limited Stock Alert</Text>
                </View>
                <Text style={styles.alertSubtitle}>Order now before they run out!</Text>
              </View>
              
              <ScrollView 
                horizontal 
                showsHorizontalScrollIndicator={false} 
                style={styles.alertContainer}
                contentContainerStyle={styles.alertContent}
              >
                {lowStockItems.slice(0, 4).map((item) => (
                  <FoodCard
                    key={`low-stock-${item.id}`}
                    item={item}
                    onPress={() => setSelectedFood(item)}
                    variant="compact"
                  />
                ))}
              </ScrollView>
            </>
          )}

          {/* Featured Items */}
          {popularItems.length > 0 && (
            <>
              <View style={styles.sectionHeader}>
                <View style={styles.sectionTitleContainer}>
                  <Flame size={20} color={colors.primary} />
                  <Text style={styles.sectionTitle}>Popular Today</Text>
                </View>
                <Text style={styles.sectionSubtitle}>Most loved Filipino dishes</Text>
              </View>
              
              <ScrollView 
                horizontal 
                showsHorizontalScrollIndicator={false} 
                style={styles.featuredContainer}
                contentContainerStyle={styles.featuredContent}
              >
                {popularItems.slice(0, 4).map((item) => (
                  <FoodCard
                    key={`featured-${item.id}`}
                    item={item}
                    onPress={() => setSelectedFood(item)}
                    variant="featured"
                  />
                ))}
              </ScrollView>
            </>
          )}

          {/* Quick Bites */}
          {quickItems.length > 0 && (
            <>
              <View style={styles.sectionHeader}>
                <View style={styles.sectionTitleContainer}>
                  <Clock size={20} color={colors.accent} />
                  <Text style={styles.sectionTitle}>Quick Bites</Text>
                </View>
                <Text style={styles.sectionSubtitle}>Ready in 5 minutes or less</Text>
              </View>
              
              <ScrollView 
                horizontal 
                showsHorizontalScrollIndicator={false} 
                style={styles.compactContainer}
                contentContainerStyle={styles.compactContent}
              >
                {quickItems.slice(0, 6).map((item) => (
                  <FoodCard
                    key={`quick-${item.id}`}
                    item={item}
                    onPress={() => setSelectedFood(item)}
                    variant="compact"
                  />
                ))}
              </ScrollView>
            </>
          )}

          {/* All Available Items */}
          {availableItems.length > 0 && (
            <>
              <View style={styles.sectionHeader}>
                <View style={styles.sectionTitleContainer}>
                  <TrendingUp size={20} color={colors.secondary} />
                  <Text style={styles.sectionTitle}>
                    {selectedCategory === 'All' ? 'All Available' : selectedCategory}
                  </Text>
                </View>
                <Text style={styles.sectionSubtitle}>Fresh and ready to order</Text>
              </View>
              
              <View style={styles.allItemsContainer}>
                {filteredFoodItems.map((item) => (
                  <FoodCard
                    key={item.id}
                    item={item}
                    onPress={() => setSelectedFood(item)}
                  />
                ))}
              </View>
            </>
          )}

          {/* Out of Stock Items */}
          {outOfStockItems.length > 0 && selectedCategory === 'All' && searchQuery === '' && (
            <>
              <View style={styles.sectionHeader}>
                <Text style={styles.sectionTitle}>Currently Out of Stock</Text>
                <Text style={styles.sectionSubtitle}>Check back later</Text>
              </View>
              {outOfStockItems.map((item) => (
                <FoodCard
                  key={item.id}
                  item={item}
                  onPress={() => {}}
                />
              ))}
            </>
          )}
        </View>
      </ScrollView>

      {/* Order Modal */}
      <Modal
        visible={selectedFood !== null}
        transparent={true}
        animationType="slide"
        onRequestClose={() => setSelectedFood(null)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Place Order</Text>
              <TouchableOpacity 
                onPress={() => setSelectedFood(null)}
                style={styles.closeButton}
              >
                <X size={24} color={colors.textSecondary} />
              </TouchableOpacity>
            </View>

            {selectedFood && (
              <ScrollView style={styles.modalBody} showsVerticalScrollIndicator={false}>
                <Image source={{ uri: selectedFood.image }} style={styles.modalImage} />
                
                <View style={styles.modalFoodInfo}>
                  <Text style={styles.modalFoodName}>{selectedFood.name}</Text>
                  <Text style={styles.modalFoodPrice}>₱ {selectedFood.price.toFixed(2)}</Text>
                  <Text style={styles.modalFoodSeller}>{selectedFood.sellerName}</Text>
                  <Text style={styles.modalFoodDescription}>{selectedFood.description}</Text>
                  
                  {/* Stock Information */}
                  <View style={styles.modalActions}>
                    <TouchableOpacity 
                      style={styles.favoriteToggle}
                      onPress={() => toggleFavorite(selectedFood.id)}
                    >
                      <Heart 
                        size={20} 
                        color={favorites.includes(selectedFood.id) ? colors.error : colors.textSecondary}
                        fill={favorites.includes(selectedFood.id) ? colors.error : 'transparent'}
                      />
                      <Text style={[
                        styles.favoriteToggleText,
                        { color: favorites.includes(selectedFood.id) ? colors.error : colors.textSecondary }
                      ]}>
                        {favorites.includes(selectedFood.id) ? 'Remove from Favorites' : 'Add to Favorites'}
                      </Text>
                    </TouchableOpacity>
                  </View>

                  <View style={styles.stockInfoModal}>
                    <Package size={16} color={selectedFood.inventory <= 5 ? '#F59E0B' : colors.primary} />
                    <Text style={[
                      styles.stockInfoText,
                      { color: selectedFood.inventory <= 5 ? '#F59E0B' : colors.primary }
                    ]}>
                      {selectedFood.inventory} available
                      {selectedFood.inventory <= 5 && ' (Limited stock!)'}
                    </Text>
                  </View>
                </View>

                {/* Quantity Selector */}
                <View style={styles.quantitySection}>
                  <Text style={styles.sectionLabel}>Quantity</Text>
                  <View style={styles.quantityControls}>
                    <TouchableOpacity 
                      style={styles.quantityButton}
                      onPress={() => setQuantity(Math.max(1, quantity - 1))}
                    >
                      <Minus size={20} color={colors.primary} />
                    </TouchableOpacity>
                    <Text style={styles.quantityText}>{quantity}</Text>
                    <TouchableOpacity 
                      style={styles.quantityButton}
                      onPress={() => setQuantity(Math.min(getMaxQuantity(), quantity + 1))}
                    >
                      <Plus size={20} color={colors.primary} />
                    </TouchableOpacity>
                  </View>
                  <Text style={styles.maxQuantityText}>
                    Max: {getMaxQuantity()} (Available: {selectedFood.inventory})
                  </Text>
                </View>

                {/* Time Slot Selection */}
                <View style={styles.timeSection}>
                  <Text style={styles.sectionLabel}>Pickup Time</Text>
                  <View style={styles.timeSlots}>
                    {timeSlots.map((slot) => (
                      <TouchableOpacity
                        key={slot.id}
                        style={[
                          styles.timeSlot,
                          selectedTimeSlot === slot.time && styles.selectedTimeSlot,
                          !slot.available && styles.disabledTimeSlot
                        ]}
                        onPress={() => slot.available && setSelectedTimeSlot(slot.time)}
                        disabled={!slot.available}
                      >
                        <Text style={[
                          styles.timeSlotText,
                          selectedTimeSlot === slot.time && styles.selectedTimeSlotText,
                          !slot.available && styles.disabledTimeSlotText
                        ]}>
                          {slot.time}
                        </Text>
                      </TouchableOpacity>
                    ))}
                  </View>
                </View>

                {/* Notes */}
                <View style={styles.notesSection}>
                  <Text style={styles.sectionLabel}>Special Instructions (Optional)</Text>
                  <TextInput
                    style={styles.notesInput}
                    placeholder="Any special requests..."
                    value={notes}
                    onChangeText={setNotes}
                    multiline
                    numberOfLines={3}
                    placeholderTextColor={colors.textSecondary}
                  />
                </View>

                {/* Total */}
                <View style={styles.totalSection}>
                  <View style={styles.totalRow}>
                    <Text style={styles.totalLabel}>Subtotal</Text>
                    <Text style={styles.totalValue}>₱ {(selectedFood.price * quantity).toFixed(2)}</Text>
                  </View>
                  <View style={styles.totalRow}>
                    <Text style={styles.totalLabel}>Service Charge</Text>
                    <Text style={styles.totalValue}>₱ {SERVICE_CHARGE.toFixed(2)}</Text>
                  </View>
                  <View style={styles.totalRow}>
                    <Text style={styles.totalLabelFinal}>Total Amount</Text>
                    <Text style={styles.totalAmount}>₱ {calculateTotal().toFixed(2)}</Text>
                  </View>
                </View>

                <TouchableOpacity
                  style={[
                    styles.reserveButton,
                    (!selectedTimeSlot || selectedFood.inventory < quantity) && styles.disabledButton
                  ]}
                  onPress={handleReservation}
                  disabled={!selectedTimeSlot || selectedFood.inventory < quantity}
                >
                  <Text style={styles.reserveButtonText}>
                    {selectedFood.inventory < quantity ? 'Insufficient Stock' : 'Place Order'}
                  </Text>
                </TouchableOpacity>
              </ScrollView>
            )}
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

const createStyles = (colors: any) => StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 120,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 20,
    backgroundColor: colors.surface,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  headerContent: {
    flex: 1,
  },
  logoContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  logo: {
    width: 50,
    height: 50,
    marginRight: 12,
  },
  schoolInfo: {
    flex: 1,
  },
  schoolName: {
    fontSize: 18,
    fontFamily: 'Inter-Bold',
    color: colors.secondary,
    marginBottom: 4,
  },
  locationContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  locationText: {
    fontSize: 12,
    fontFamily: 'Inter-Medium',
    color: colors.primary,
    marginLeft: 4,
  },
  userGreeting: {
    marginTop: 8,
  },
  greeting: {
    fontSize: 14,
    fontFamily: 'Inter-Regular',
    color: colors.textSecondary,
  },
  userInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 2,
  },
  username: {
    fontSize: 20,
    fontFamily: 'Inter-Bold',
    color: colors.text,
    marginRight: 12,
  },
  roleBadge: {
    backgroundColor: colors.primary,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  roleText: {
    fontSize: 12,
    fontFamily: 'Inter-Bold',
    color: '#FFFFFF',
  },
  filterButton: {
    padding: 12,
    borderRadius: 12,
    backgroundColor: colors.background,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surface,
    marginHorizontal: Math.max(16, width * 0.04),
    marginVertical: 16,
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderRadius: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 8,
    elevation: 2,
    borderWidth: 1,
    borderColor: colors.border,
  },
  searchIcon: {
    marginRight: 12,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    fontFamily: 'Inter-Regular',
    color: colors.text,
  },
  categoriesWrapper: {
    backgroundColor: colors.surface,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
    paddingVertical: 16,
    position: 'sticky',
    top: 0,
    zIndex: 10,
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
  },
  categoriesContainer: {
    paddingHorizontal: Math.max(16, width * 0.04),
  },
  categoriesContent: {
    flexDirection: 'row',
    gap: 12,
  },
  categoryButton: {
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 24,
    backgroundColor: colors.background,
    borderWidth: 1,
    borderColor: colors.border,
  },
  selectedCategoryButton: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  categoryText: {
    fontSize: 14,
    fontFamily: 'Inter-SemiBold',
    color: colors.secondary,
  },
  selectedCategoryText: {
    color: '#FFFFFF',
  },
  statsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surface,
    marginHorizontal: Math.max(16, width * 0.04),
    marginBottom: 20,
    paddingVertical: 16,
    paddingHorizontal: 20,
    borderRadius: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 8,
    elevation: 2,
    borderWidth: 1,
    borderColor: colors.border,
  },
  statItem: {
    flex: 1,
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 4,
  },
  statNumber: {
    fontSize: 18,
    fontFamily: 'Inter-Bold',
    color: colors.primary,
  },
  statLabel: {
    fontSize: 12,
    fontFamily: 'Inter-Medium',
    color: colors.textSecondary,
  },
  statDivider: {
    width: 1,
    height: 24,
    backgroundColor: colors.border,
    marginHorizontal: 16,
  },
  queueStatusContainer: {
    backgroundColor: colors.surface,
    marginHorizontal: Math.max(16, width * 0.04),
    marginBottom: 20,
    borderRadius: 20,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 6,
    borderWidth: 1,
    borderColor: colors.border,
  },
  queueHeader: {
    marginBottom: 16,
  },
  queueTitleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  queueTitle: {
    fontSize: 18,
    fontFamily: 'Inter-Bold',
    color: colors.text,
    marginLeft: 8,
  },
  liveDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#10B981',
    marginLeft: 8,
  },
  queueSubtitle: {
    fontSize: 14,
    fontFamily: 'Inter-Regular',
    color: colors.textSecondary,
  },
  queueContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  queueItem: {
    flex: 1,
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 4,
  },
  queueLabel: {
    fontSize: 12,
    fontFamily: 'Inter-Medium',
    color: colors.textSecondary,
    marginBottom: 4,
  },
  queueValue: {
    fontSize: 16,
    fontFamily: 'Inter-Bold',
    color: colors.primary,
  },
  queueCount: {
    fontSize: 14,
    fontFamily: 'Inter-SemiBold',
    color: colors.text,
  },
  queueWait: {
    fontSize: 14,
    fontFamily: 'Inter-SemiBold',
    color: colors.accent,
  },
  queueDivider: {
    width: 1,
    height: 24,
    backgroundColor: colors.border,
    marginHorizontal: 12,
  },
  quickAccessContainer: {
    marginBottom: 20,
  },
  quickAccessScroll: {
    paddingHorizontal: Math.max(16, width * 0.04),
  },
  quickAccessContent: {
    gap: 16,
  },
  quickAccessCard: {
    backgroundColor: colors.surface,
    borderRadius: 16,
    padding: 16,
    alignItems: 'center',
    minWidth: 100,
    borderWidth: 1,
    borderColor: colors.border,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 3,
  },
  quickAccessIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
  },
  quickAccessTitle: {
    fontSize: 14,
    fontFamily: 'Inter-SemiBold',
    color: colors.text,
    marginBottom: 2,
  },
  quickAccessSubtitle: {
    fontSize: 12,
    fontFamily: 'Inter-Regular',
    color: colors.textSecondary,
  },
  foodContent: {
    flex: 1,
  },
  favoritesContainer: {
    marginBottom: 32,
  },
  favoritesContent: {
    paddingHorizontal: Math.max(16, width * 0.04),
  },
  favoriteItemContainer: {
    position: 'relative',
    marginRight: 12,
  },
  favoriteButton: {
    position: 'absolute',
    top: 8,
    right: 8,
    backgroundColor: colors.surface,
    borderRadius: 16,
    padding: 6,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  historyListContainer: {
    paddingHorizontal: Math.max(16, width * 0.04),
    marginBottom: 32,
  },
  historyListItem: {
    flexDirection: 'row',
    backgroundColor: colors.surface,
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 3,
    borderWidth: 1,
    borderColor: colors.border,
  },
  historyListImage: {
    width: 80,
    height: 80,
    borderRadius: 12,
    backgroundColor: colors.background,
    marginRight: 16,
    resizeMode: 'cover',
  },
  historyListContent: {
    flex: 1,
  },
  historyListName: {
    fontSize: 16,
    fontFamily: 'Inter-SemiBold',
    color: colors.text,
    marginBottom: 4,
  },
  historyListDetails: {
    fontSize: 12,
    fontFamily: 'Inter-Regular',
    color: colors.textSecondary,
    marginBottom: 8,
  },
  historyListFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  historyListPrice: {
    fontSize: 16,
    fontFamily: 'Inter-Bold',
    color: colors.primary,
  },
  historyListMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  historyListRating: {
    fontSize: 12,
    fontFamily: 'Inter-Medium',
    color: colors.textSecondary,
    marginRight: 8,
  },
  historyListTime: {
    fontSize: 12,
    fontFamily: 'Inter-Medium',
    color: colors.textSecondary,
    marginLeft: 4,
  },
  historyListActions: {
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: 12,
  },
  historyReorderButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.primary + '15',
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 8,
    gap: 4,
  },
  reorderButtonText: {
    fontSize: 12,
    fontFamily: 'Inter-SemiBold',
    color: colors.primary,
  },
  alertSection: {
    backgroundColor: '#F59E0B' + '15',
    marginHorizontal: 20,
    marginBottom: 16,
    padding: 16,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#F59E0B' + '30',
  },
  alertHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  alertTitle: {
    fontSize: 16,
    fontFamily: 'Inter-Bold',
    color: '#F59E0B',
    marginLeft: 8,
  },
  alertSubtitle: {
    fontSize: 14,
    fontFamily: 'Inter-Regular',
    color: colors.textSecondary,
  },
  alertContainer: {
    marginBottom: 32,
  },
  alertContent: {
    paddingHorizontal: Math.max(16, width * 0.04),
  },
  sectionHeader: {
    paddingHorizontal: Math.max(16, width * 0.04),
    marginBottom: 16,
    marginTop: 8,
  },
  sectionTitleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  sectionTitle: {
    fontSize: 22,
    fontFamily: 'Inter-Bold',
    color: colors.text,
    marginLeft: 8,
  },
  sectionSubtitle: {
    fontSize: 14,
    fontFamily: 'Inter-Regular',
    color: colors.textSecondary,
  },
  featuredContainer: {
    marginBottom: 32,
  },
  featuredContent: {
    paddingHorizontal: Math.max(16, width * 0.04),
  },
  compactContainer: {
    marginBottom: 32,
  },
  compactContent: {
    paddingHorizontal: 20,
  },
  allItemsContainer: {
    paddingHorizontal: Math.max(8, width * 0.02),
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: colors.surface,
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    maxHeight: '92%',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  modalTitle: {
    fontSize: 20,
    fontFamily: 'Inter-Bold',
    color: colors.text,
  },
  closeButton: {
    padding: 8,
    borderRadius: 12,
    backgroundColor: colors.background,
  },
  modalBody: {
    padding: 20,
  },
  modalImage: {
    width: '100%',
    height: 240,
    borderRadius: 20,
    marginBottom: 20,
    backgroundColor: colors.background,
    resizeMode: 'cover',
  },
  modalFoodInfo: {
    marginBottom: 28,
  },
  modalFoodName: {
    fontSize: 26,
    fontFamily: 'Inter-Bold',
    color: colors.text,
    marginBottom: 6,
  },
  modalFoodPrice: {
    fontSize: 22,
    fontFamily: 'Inter-Bold',
    color: colors.primary,
    marginBottom: 4,
  },
  modalFoodSeller: {
    fontSize: 14,
    fontFamily: 'Inter-Medium',
    color: colors.textSecondary,
    marginBottom: 12,
  },
  modalFoodDescription: {
    fontSize: 16,
    fontFamily: 'Inter-Regular',
    color: colors.textSecondary,
    lineHeight: 24,
    marginBottom: 12,
  },
  modalActions: {
    marginBottom: 16,
  },
  favoriteToggle: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.background,
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.border,
  },
  favoriteToggleText: {
    fontSize: 14,
    fontFamily: 'Inter-Medium',
    marginLeft: 8,
  },
  stockInfoModal: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.background,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 12,
    alignSelf: 'flex-start',
  },
  stockInfoText: {
    fontSize: 14,
    fontFamily: 'Inter-Bold',
    marginLeft: 6,
  },
  quantitySection: {
    marginBottom: 28,
  },
  sectionLabel: {
    fontSize: 18,
    fontFamily: 'Inter-SemiBold',
    color: colors.text,
    marginBottom: 16,
  },
  quantityControls: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 32,
    marginBottom: 8,
  },
  quantityButton: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: colors.background,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: colors.border,
  },
  quantityText: {
    fontSize: 24,
    fontFamily: 'Inter-Bold',
    color: colors.text,
    minWidth: 40,
    textAlign: 'center',
  },
  maxQuantityText: {
    fontSize: 12,
    fontFamily: 'Inter-Regular',
    color: colors.textSecondary,
    textAlign: 'center',
  },
  timeSection: {
    marginBottom: 28,
  },
  timeSlots: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  timeSlot: {
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 24,
    backgroundColor: colors.background,
    borderWidth: 2,
    borderColor: colors.border,
  },
  selectedTimeSlot: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  disabledTimeSlot: {
    backgroundColor: colors.background,
    opacity: 0.5,
  },
  timeSlotText: {
    fontSize: 14,
    fontFamily: 'Inter-SemiBold',
    color: colors.secondary,
  },
  selectedTimeSlotText: {
    color: '#FFFFFF',
  },
  disabledTimeSlotText: {
    color: colors.textSecondary,
  },
  notesSection: {
    marginBottom: 28,
  },
  notesInput: {
    backgroundColor: colors.background,
    borderRadius: 16,
    padding: 16,
    fontSize: 16,
    fontFamily: 'Inter-Regular',
    color: colors.text,
    textAlignVertical: 'top',
    minHeight: 100,
    borderWidth: 1,
    borderColor: colors.border,
  },
  totalSection: {
    backgroundColor: colors.background,
    borderRadius: 16,
    padding: 20,
    marginBottom: 24,
    borderWidth: 1,
    borderColor: colors.border,
  },
  totalRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  totalLabel: {
    fontSize: 16,
    fontFamily: 'Inter-Regular',
    color: colors.textSecondary,
  },
  totalValue: {
    fontSize: 16,
    fontFamily: 'Inter-SemiBold',
    color: colors.text,
  },
  totalLabelFinal: {
    fontSize: 18,
    fontFamily: 'Inter-Bold',
    color: colors.text,
  },
  totalAmount: {
    fontSize: 24,
    fontFamily: 'Inter-Bold',
    color: colors.primary,
  },
  reserveButton: {
    backgroundColor: colors.primary,
    paddingVertical: 18,
    borderRadius: 16,
    alignItems: 'center',
    marginBottom: 20,
    shadowColor: colors.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 6,
  },
  disabledButton: {
    backgroundColor: colors.textSecondary,
    shadowOpacity: 0,
  },
  reserveButtonText: {
    fontSize: 18,
    fontFamily: 'Inter-Bold',
    color: '#FFFFFF',
  },
});