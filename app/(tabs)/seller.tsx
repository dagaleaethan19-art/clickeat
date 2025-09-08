import React, { useState, useMemo } from 'react';
import { View, Text, ScrollView, StyleSheet, SafeAreaView, TouchableOpacity, Switch, TextInput, Modal, Alert, Dimensions } from 'react-native';
import { Package, Clock, TrendingUp, Eye, EyeOff, CreditCard as Edit, Save, X, Bell, Plus, TriangleAlert as AlertTriangle, DollarSign, Target, Calendar, Users, Zap, ChartBar as BarChart3, ChartPie as PieChart, Activity } from 'lucide-react-native';
import SellerOrderCard from '@/components/SellerOrderCard';
import { useTheme } from '@/contexts/ThemeContext';
import { useOrders } from '@/contexts/OrderContext';
import { useInventory } from '@/contexts/InventoryContext';
import { useAuth } from '@/contexts/AuthContext';

const { width } = Dimensions.get('window');

export default function SellerScreen() {
  const { user } = useAuth();
  const { colors } = useTheme();
  const { orders, updateOrderStatus } = useOrders();
  const { foodItems, updateItemPrice, toggleItemAvailability, restockItem, getLowStockItems, getOutOfStockItems } = useInventory();
  
  // Create styles early to avoid undefined errors
  const styles = createStyles(colors);
  
  // Redirect if not a seller
  if (!user || user.role !== 'seller') {
    return (
      <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
        <View style={styles.accessDeniedContainer}>
          <AlertTriangle size={64} color={colors.error} />
          <Text style={[styles.accessDeniedTitle, { color: colors.text }]}>Access Denied</Text>
          <Text style={[styles.accessDeniedMessage, { color: colors.textSecondary }]}>
            This section is only available for seller accounts.
          </Text>
        </View>
      </SafeAreaView>
    );
  }
  
  const [selectedTab, setSelectedTab] = useState('dashboard');
  const [editingItem, setEditingItem] = useState<any>(null);
  const [editPrice, setEditPrice] = useState('');
  const [restockingItem, setRestockingItem] = useState<any>(null);
  const [restockQuantity, setRestockQuantity] = useState('');

  // Real-time calculations
  const analytics = useMemo(() => {
    const todaysOrders = orders.filter(order => {
      const today = new Date().toDateString();
      const orderDate = new Date(order.orderTime).toDateString();
      return today === orderDate;
    });

    const pendingOrders = todaysOrders.filter(order => order.status === 'pending');
    const confirmedOrders = todaysOrders.filter(order => order.status === 'confirmed');
    const readyOrders = todaysOrders.filter(order => order.status === 'ready');
    const completedOrders = todaysOrders.filter(order => order.status === 'completed');

    // Revenue calculations
    const todaysRevenue = completedOrders.reduce((sum, order) => sum + order.totalAmount, 0);
    const pendingRevenue = [...pendingOrders, ...confirmedOrders, ...readyOrders].reduce((sum, order) => sum + order.totalAmount, 0);
    
    // Cost calculations (assuming 60% cost ratio)
    const costRatio = 0.6;
    const todaysProfit = todaysRevenue * (1 - costRatio);
    
    // Average order value
    const avgOrderValue = todaysOrders.length > 0 ? todaysRevenue / completedOrders.length : 0;
    
    // Stock analytics
    const lowStockItems = getLowStockItems();
    const outOfStockItems = getOutOfStockItems();
    const totalInventoryValue = foodItems.reduce((sum, item) => {
      return sum + (item.price * item.inventory);
    }, 0);
    
    // Performance metrics
    const orderFulfillmentRate = todaysOrders.length > 0 ? (completedOrders.length / todaysOrders.length) * 100 : 0;
    const popularItems = foodItems.filter(item => item.rating >= 4.7).length;

    return {
      todaysOrders,
      pendingOrders,
      confirmedOrders,
      readyOrders,
      completedOrders,
      todaysRevenue,
      pendingRevenue,
      todaysProfit,
      avgOrderValue,
      lowStockItems,
      outOfStockItems,
      totalInventoryValue,
      orderFulfillmentRate,
      popularItems
    };
  }, [orders, foodItems, getLowStockItems, getOutOfStockItems]);

  const handleUpdateOrderStatus = (orderId: string, newStatus: string) => {
    updateOrderStatus(orderId, newStatus as any);
    
    if (newStatus === 'ready') {
      Alert.alert(
        'Order Ready!', 
        'Customer has been notified that their order is ready for pickup.',
        [{ text: 'OK', style: 'default' }]
      );
    } else if (newStatus === 'confirmed') {
      Alert.alert(
        'Order Confirmed!', 
        'Customer has been notified that their order is confirmed and being prepared.',
        [{ text: 'OK', style: 'default' }]
      );
    } else if (newStatus === 'completed') {
      Alert.alert(
        'Order Completed!', 
        'Order has been marked as completed successfully.',
        [{ text: 'OK', style: 'default' }]
      );
    }
  };

  const handleToggleAvailability = (foodId: string) => {
    const item = foodItems.find(f => f.id === foodId);
    if (item && item.inventory === 0) {
      Alert.alert(
        'Cannot Make Available',
        'This item is out of stock. Please restock before making it available.',
        [{ text: 'OK', style: 'default' }]
      );
      return;
    }
    
    toggleItemAvailability(foodId);
    
    const updatedItem = foodItems.find(f => f.id === foodId);
    if (updatedItem) {
      Alert.alert(
        'Availability Updated',
        `${updatedItem.name} is now ${updatedItem.available ? 'available' : 'unavailable'} for students.`,
        [{ text: 'OK', style: 'default' }]
      );
    }
  };

  const handleEditPrice = (item: any) => {
    setEditingItem(item);
    setEditPrice(item.price.toString());
  };

  const handleSavePrice = () => {
    if (!editingItem) return;
    
    const newPrice = parseFloat(editPrice);
    if (isNaN(newPrice) || newPrice <= 0) {
      Alert.alert('Invalid Price', 'Please enter a valid price greater than 0');
      return;
    }

    updateItemPrice(editingItem.id, newPrice);
    Alert.alert('Price Updated', `${editingItem.name} price updated to ₱${newPrice.toFixed(2)}`);
    setEditingItem(null);
    setEditPrice('');
  };

  const handleRestockItem = (item: any) => {
    setRestockingItem(item);
    setRestockQuantity('');
  };

  const handleSaveRestock = () => {
    if (!restockingItem) return;
    
    const quantity = parseInt(restockQuantity);
    if (isNaN(quantity) || quantity <= 0) {
      Alert.alert('Invalid Quantity', 'Please enter a valid quantity greater than 0');
      return;
    }

    const maxPossible = restockingItem.maxInventory - restockingItem.inventory;
    if (quantity > maxPossible) {
      Alert.alert(
        'Exceeds Maximum Capacity',
        `You can only add ${maxPossible} more items. Current: ${restockingItem.inventory}/${restockingItem.maxInventory}`,
        [{ text: 'OK', style: 'default' }]
      );
      return;
    }

    restockItem(restockingItem.id, quantity);
    Alert.alert('Stock Updated', `${restockingItem.name} restocked with ${quantity} items`);
    setRestockingItem(null);
    setRestockQuantity('');
  };

  // Dashboard metrics data
  const dashboardMetrics = [
    {
      icon: DollarSign,
      title: 'Today\'s Revenue',
      value: `₱${analytics.todaysRevenue.toFixed(2)}`,
      subtitle: `${analytics.completedOrders.length} completed orders`,
      color: colors.primary,
      trend: '+12%',
      isPositive: true
    },
    {
      icon: TrendingUp,
      title: 'Profit Margin',
      value: `₱${analytics.todaysProfit.toFixed(2)}`,
      subtitle: '40% margin',
      color: '#10B981',
      trend: '+8%',
      isPositive: true
    },
    {
      icon: Target,
      title: 'Pending Revenue',
      value: `₱${analytics.pendingRevenue.toFixed(2)}`,
      subtitle: `${analytics.pendingOrders.length + analytics.confirmedOrders.length + analytics.readyOrders.length} pending`,
      color: '#F59E0B',
      trend: analytics.pendingRevenue > 0 ? 'Active' : 'None'
    },
    {
      icon: BarChart3,
      title: 'Avg Order Value',
      value: `₱${analytics.avgOrderValue.toFixed(2)}`,
      subtitle: 'Per completed order',
      color: '#8B5CF6',
      trend: '+5%',
      isPositive: true
    }
  ];

  // Quick stats for header
  const quickStats = [
    {
      icon: Package,
      value: analytics.todaysOrders.length,
      label: 'Total Orders',
      color: colors.primary,
      onPress: () => setSelectedTab('orders')
    },
    {
      icon: Clock,
      value: analytics.pendingOrders.length,
      label: 'Pending',
      color: colors.warning,
      isAlert: analytics.pendingOrders.length > 0,
      onPress: () => setSelectedTab('orders')
    },
    {
      icon: Bell,
      value: analytics.readyOrders.length,
      label: 'Ready',
      color: '#F59E0B',
      isAlert: analytics.readyOrders.length > 0,
      onPress: () => setSelectedTab('orders')
    },
    {
      icon: AlertTriangle,
      value: analytics.lowStockItems.length + analytics.outOfStockItems.length,
      label: 'Stock Alert',
      color: '#EF4444',
      isAlert: (analytics.lowStockItems.length + analytics.outOfStockItems.length) > 0,
      onPress: () => setSelectedTab('inventory')
    }
  ];

  const tabs = [
    { key: 'dashboard', label: 'Dashboard', icon: BarChart3 },
    { key: 'orders', label: 'Orders', icon: Package, count: analytics.todaysOrders.length },
    { key: 'menu', label: 'Menu', icon: Edit, count: foodItems.length },
    { key: 'inventory', label: 'Inventory', icon: AlertTriangle, count: analytics.lowStockItems.length + analytics.outOfStockItems.length },
  ];

  return (
    <SafeAreaView style={styles.container}>
      {/* Enhanced Header */}
      <View style={styles.header}>
        <View style={styles.headerContent}>
          <View style={styles.headerTop}>
            <View style={styles.titleSection}>
              <Text style={styles.title}>Seller Dashboard</Text>
              <Text style={styles.subtitle}>Real-time business analytics</Text>
            </View>
            {analytics.readyOrders.length > 0 && (
              <View style={styles.notificationBadge}>
                <Bell size={20} color="#F59E0B" />
                <Text style={styles.badgeText}>{analytics.readyOrders.length}</Text>
              </View>
            )}
          </View>
          
          {/* Quick Stats Row */}
          <ScrollView
            horizontal 
            showsHorizontalScrollIndicator={false} 
            style={styles.quickStatsContainer}
            contentContainerStyle={styles.quickStatsContent}
          >
            {quickStats.map((stat, index) => (
              <TouchableOpacity
                key={index}
                style={[
                  styles.quickStatCard,
                  stat.isAlert && styles.alertQuickStatCard
                ]}
                onPress={stat.onPress}
                activeOpacity={0.8}
              >
                <stat.icon size={18} color={stat.color} />
                <Text style={[styles.quickStatValue, stat.isAlert && { color: stat.color }]}>
                  {stat.value}
                </Text>
                <Text style={[styles.quickStatLabel, stat.isAlert && { color: stat.color }]}>
                  {stat.label}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>
      </View>

      {/* Enhanced Tab Navigation */}
      <View style={styles.tabWrapper}>
        <ScrollView 
          horizontal 
          showsHorizontalScrollIndicator={false} 
          style={styles.tabContainer}
          contentContainerStyle={styles.tabContent}
          bounces={true}
        >
          {tabs.map((tab) => (
            <TouchableOpacity
              key={tab.key}
              style={[
                styles.tab,
                selectedTab === tab.key && styles.selectedTab
              ]}
              onPress={() => setSelectedTab(tab.key)}
              activeOpacity={0.7}
            >
              <tab.icon size={18} color={selectedTab === tab.key ? '#FFFFFF' : colors.textSecondary} />
              <Text style={[
                styles.tabText,
                selectedTab === tab.key && styles.selectedTabText
              ]}>
                {tab.label}
                {tab.count !== undefined && ` (${tab.count})`}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      {/* Main Content - Now Scrollable */}
      <ScrollView 
        style={styles.scrollView} 
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
        bounces={true}
        scrollEventThrottle={16}
      >
          {selectedTab === 'dashboard' ? (
            <>
              {/* Revenue Analytics */}
              <View style={styles.sectionHeader}>
                <Text style={styles.sectionTitle}>Revenue Analytics</Text>
                <Text style={styles.sectionSubtitle}>Real-time financial performance</Text>
              </View>
              
              <View style={styles.metricsGrid}>
                {dashboardMetrics.map((metric, index) => (
                  <View key={index} style={styles.metricCard}>
                    <View style={styles.metricHeader}>
                      <View style={[styles.metricIconContainer, { backgroundColor: metric.color + '15' }]}>
                        <metric.icon size={24} color={metric.color} />
                      </View>
                      {metric.trend && (
                        <View style={[
                          styles.trendBadge,
                          { backgroundColor: metric.isPositive ? '#10B981' + '15' : '#F59E0B' + '15' }
                        ]}>
                          <Text style={[
                            styles.trendText,
                            { color: metric.isPositive ? '#10B981' : '#F59E0B' }
                          ]}>
                            {metric.trend}
                          </Text>
                        </View>
                      )}
                    </View>
                    <Text style={styles.metricValue}>{metric.value}</Text>
                    <Text style={styles.metricTitle}>{metric.title}</Text>
                    <Text style={styles.metricSubtitle}>{metric.subtitle}</Text>
                  </View>
                ))}
              </View>

              {/* Performance Insights */}
              <View style={styles.sectionHeader}>
                <Text style={styles.sectionTitle}>Performance Insights</Text>
                <Text style={styles.sectionSubtitle}>Key business metrics</Text>
              </View>

              <View style={styles.insightsContainer}>
                <View style={styles.insightCard}>
                  <View style={styles.insightHeader}>
                    <Activity size={20} color={colors.primary} />
                    <Text style={styles.insightTitle}>Order Fulfillment</Text>
                  </View>
                  <Text style={styles.insightValue}>{analytics.orderFulfillmentRate.toFixed(1)}%</Text>
                  <Text style={styles.insightSubtitle}>Completion rate today</Text>
                </View>

                <View style={styles.insightCard}>
                  <View style={styles.insightHeader}>
                    <PieChart size={20} color={colors.accent} />
                    <Text style={styles.insightTitle}>Inventory Value</Text>
                  </View>
                  <Text style={styles.insightValue}>₱{analytics.totalInventoryValue.toFixed(0)}</Text>
                  <Text style={styles.insightSubtitle}>Current stock value</Text>
                </View>

                <View style={styles.insightCard}>
                  <View style={styles.insightHeader}>
                    <Users size={20} color="#8B5CF6" />
                    <Text style={styles.insightTitle}>Popular Items</Text>
                  </View>
                  <Text style={styles.insightValue}>{analytics.popularItems}</Text>
                  <Text style={styles.insightSubtitle}>High-rated products</Text>
                </View>
              </View>

              {/* Quick Actions */}
              <View style={styles.sectionHeader}>
                <Text style={styles.sectionTitle}>Quick Actions</Text>
                <Text style={styles.sectionSubtitle}>Manage your business efficiently</Text>
              </View>

              <View style={styles.quickActionsGrid}>
                <TouchableOpacity 
                  style={styles.quickActionCard}
                  onPress={() => setSelectedTab('orders')}
                  activeOpacity={0.8}
                >
                  <Package size={24} color={colors.primary} />
                  <Text style={styles.quickActionTitle}>View Orders</Text>
                  <Text style={styles.quickActionSubtitle}>{analytics.pendingOrders.length} pending</Text>
                </TouchableOpacity>

                <TouchableOpacity 
                  style={styles.quickActionCard}
                  onPress={() => setSelectedTab('inventory')}
                  activeOpacity={0.8}
                >
                  <AlertTriangle size={24} color="#EF4444" />
                  <Text style={styles.quickActionTitle}>Stock Alerts</Text>
                  <Text style={styles.quickActionSubtitle}>{analytics.lowStockItems.length + analytics.outOfStockItems.length} items</Text>
                </TouchableOpacity>

                <TouchableOpacity 
                  style={styles.quickActionCard}
                  onPress={() => setSelectedTab('menu')}
                  activeOpacity={0.8}
                >
                  <Edit size={24} color={colors.accent} />
                  <Text style={styles.quickActionTitle}>Update Menu</Text>
                  <Text style={styles.quickActionSubtitle}>{foodItems.length} items</Text>
                </TouchableOpacity>

                <TouchableOpacity 
                  style={styles.quickActionCard}
                  activeOpacity={0.8}
                >
                  <BarChart3 size={24} color="#8B5CF6" />
                  <Text style={styles.quickActionTitle}>Analytics</Text>
                  <Text style={styles.quickActionSubtitle}>View reports</Text>
                </TouchableOpacity>
              </View>
            </>
          ) : selectedTab === 'orders' ? (
            <>
              {analytics.todaysOrders.length === 0 ? (
                <View style={styles.emptyState}>
                  <Package size={64} color={colors.textSecondary} />
                  <Text style={styles.emptyTitle}>No orders today</Text>
                  <Text style={styles.emptyDescription}>
                    Orders will appear here when customers make reservations.
                  </Text>
                </View>
              ) : (
                <>
                  {analytics.readyOrders.length > 0 && (
                    <>
                      <View style={styles.prioritySection}>
                        <View style={styles.prioritySectionHeader}>
                          <Bell size={20} color="#F59E0B" />
                          <Text style={styles.prioritySectionTitle}>
                            Ready for Pickup ({analytics.readyOrders.length})
                          </Text>
                        </View>
                        <Text style={styles.prioritySectionSubtitle}>
                          Customers have been notified
                        </Text>
                      </View>
                      {analytics.readyOrders.map((order) => (
                        <SellerOrderCard 
                          key={`ready-${order.id}`}
                          reservation={order} 
                          onUpdateStatus={handleUpdateOrderStatus}
                          isHighlighted={true}
                        />
                      ))}
                    </>
                  )}

                  {analytics.pendingOrders.length > 0 && (
                    <>
                      <View style={styles.sectionTitleWrapper}>
                        <Text style={styles.sectionTitle}>Pending Orders ({analytics.pendingOrders.length})</Text>
                      </View>
                      {analytics.pendingOrders.map((order) => (
                        <SellerOrderCard 
                          key={order.id} 
                          reservation={order} 
                          onUpdateStatus={handleUpdateOrderStatus}
                        />
                      ))}
                    </>
                  )}

                  {analytics.todaysOrders.filter(o => o.status !== 'pending' && o.status !== 'ready').length > 0 && (
                    <>
                      <View style={styles.sectionTitleWrapper}>
                        <Text style={styles.sectionTitle}>All Orders</Text>
                      </View>
                      {analytics.todaysOrders.filter(o => o.status !== 'pending' && o.status !== 'ready').map((order) => (
                        <SellerOrderCard 
                          key={order.id} 
                          reservation={order} 
                          onUpdateStatus={handleUpdateOrderStatus}
                        />
                      ))}
                    </>
                  )}
                </>
              )}
            </>
          ) : selectedTab === 'menu' ? (
            <>
              <View style={styles.sectionTitleWrapper}>
                <Text style={styles.sectionTitle}>Menu Management</Text>
              </View>
              {foodItems.map((item) => (
                <View key={item.id} style={styles.menuCard}>
                  <View style={styles.menuContent}>
                    <View style={styles.menuInfo}>
                      <Text style={styles.menuName}>{item.name}</Text>
                      <View style={styles.priceContainer}>
                        <Text style={styles.menuPrice}>₱ {item.price.toFixed(2)}</Text>
                        <TouchableOpacity 
                          style={styles.editPriceButton}
                          onPress={() => handleEditPrice(item)}
                        >
                          <Edit size={16} color={colors.primary} />
                        </TouchableOpacity>
                      </View>
                      <Text style={styles.menuCategory}>{item.category}</Text>
                      <View style={styles.stockInfo}>
                        <Package size={14} color={item.inventory <= 5 ? '#EF4444' : colors.primary} />
                        <Text style={[
                          styles.stockText,
                          { color: item.inventory <= 5 ? '#EF4444' : colors.primary }
                        ]}>
                          {item.inventory}/{item.maxInventory} in stock
                        </Text>
                      </View>
                    </View>
                    
                    <View style={styles.menuControls}>
                      <View style={styles.availabilityToggle}>
                        <Text style={[
                          styles.availabilityLabel,
                          { color: item.available ? colors.primary : colors.textSecondary }
                        ]}>
                          {item.available ? 'Available' : 'Unavailable'}
                        </Text>
                        <Switch
                          value={item.available}
                          onValueChange={() => handleToggleAvailability(item.id)}
                          trackColor={{ false: colors.border, true: colors.primary + '40' }}
                          thumbColor={item.available ? colors.primary : colors.textSecondary}
                        />
                      </View>
                      
                      <TouchableOpacity 
                        style={styles.restockButton}
                        onPress={() => handleRestockItem(item)}
                      >
                        <Plus size={16} color={colors.primary} />
                        <Text style={styles.restockButtonText}>Restock</Text>
                      </TouchableOpacity>
                      
                      <View style={styles.menuStatus}>
                        {item.available && item.inventory > 0 ? (
                          <Eye size={20} color={colors.primary} />
                        ) : (
                          <EyeOff size={20} color={colors.textSecondary} />
                        )}
                      </View>
                    </View>
                  </View>
                </View>
              ))}
            </>
          ) : (
            <>
              <View style={styles.sectionTitleWrapper}>
                <Text style={styles.sectionTitle}>Inventory Management</Text>
              </View>
              
              {/* Out of Stock Alert */}
              {analytics.outOfStockItems.length > 0 && (
                <>
                  <View style={styles.alertSection}>
                    <View style={styles.alertHeader}>
                      <AlertTriangle size={20} color="#EF4444" />
                      <Text style={[styles.alertTitle, { color: '#EF4444' }]}>
                        Out of Stock ({analytics.outOfStockItems.length})
                      </Text>
                    </View>
                    <Text style={styles.alertSubtitle}>These items need immediate restocking</Text>
                  </View>
                  {analytics.outOfStockItems.map((item) => (
                    <View key={`out-${item.id}`} style={[styles.inventoryCard, styles.outOfStockCard]}>
                      <View style={styles.inventoryInfo}>
                        <Text style={styles.inventoryName}>{item.name}</Text>
                        <Text style={styles.outOfStockText}>OUT OF STOCK</Text>
                        <Text style={styles.inventoryCategory}>{item.category}</Text>
                      </View>
                      <TouchableOpacity 
                        style={styles.urgentRestockButton}
                        onPress={() => handleRestockItem(item)}
                      >
                        <Plus size={16} color="#FFFFFF" />
                        <Text style={styles.urgentRestockButtonText}>Restock Now</Text>
                      </TouchableOpacity>
                    </View>
                  ))}
                </>
              )}

              {/* Low Stock Alert */}
              {analytics.lowStockItems.length > 0 && (
                <>
                  <View style={styles.alertSection}>
                    <View style={styles.alertHeader}>
                      <AlertTriangle size={20} color="#F59E0B" />
                      <Text style={[styles.alertTitle, { color: '#F59E0B' }]}>
                        Low Stock ({analytics.lowStockItems.length})
                      </Text>
                    </View>
                    <Text style={styles.alertSubtitle}>Consider restocking these items soon</Text>
                  </View>
                  {analytics.lowStockItems.map((item) => (
                    <View key={`low-${item.id}`} style={[styles.inventoryCard, styles.lowStockCard]}>
                      <View style={styles.inventoryInfo}>
                        <Text style={styles.inventoryName}>{item.name}</Text>
                        <Text style={styles.lowStockText}>
                          {item.inventory}/{item.maxInventory} remaining
                        </Text>
                        <Text style={styles.inventoryCategory}>{item.category}</Text>
                      </View>
                      <TouchableOpacity 
                        style={styles.warningRestockButton}
                        onPress={() => handleRestockItem(item)}
                      >
                        <Plus size={16} color="#F59E0B" />
                        <Text style={styles.warningRestockButtonText}>Restock</Text>
                      </TouchableOpacity>
                    </View>
                  ))}
                </>
              )}

              {/* All Items Inventory */}
              <View style={styles.sectionTitleWrapper}>
                <Text style={styles.sectionTitle}>All Items</Text>
              </View>
              {foodItems.map((item) => (
                <View key={`all-${item.id}`} style={styles.inventoryCard}>
                  <View style={styles.inventoryInfo}>
                    <Text style={styles.inventoryName}>{item.name}</Text>
                    <View style={styles.stockProgressContainer}>
                      <View style={styles.stockProgressBar}>
                        <View 
                          style={[
                            styles.stockProgressFill,
                            { 
                              width: `${(item.inventory / item.maxInventory) * 100}%`,
                              backgroundColor: item.inventory <= 5 ? '#EF4444' : item.inventory <= item.maxInventory * 0.2 ? '#F59E0B' : colors.primary
                            }
                          ]}
                        />
                      </View>
                      <Text style={styles.stockProgressText}>
                        {item.inventory}/{item.maxInventory}
                      </Text>
                    </View>
                    <Text style={styles.inventoryCategory}>{item.category}</Text>
                  </View>
                  <TouchableOpacity 
                    style={styles.normalRestockButton}
                    onPress={() => handleRestockItem(item)}
                  >
                    <Plus size={16} color={colors.primary} />
                    <Text style={styles.normalRestockButtonText}>Restock</Text>
                  </TouchableOpacity>
                </View>
              ))}
            </>
          )}
      </ScrollView>

      {/* Price Edit Modal */}
      <Modal
        visible={editingItem !== null}
        transparent={true}
        animationType="slide"
        onRequestClose={() => setEditingItem(null)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Edit Price</Text>
              <TouchableOpacity 
                onPress={() => setEditingItem(null)}
                style={styles.closeButton}
              >
                <X size={24} color={colors.textSecondary} />
              </TouchableOpacity>
            </View>

            {editingItem && (
              <View style={styles.modalBody}>
                <Text style={styles.itemName}>{editingItem.name}</Text>
                <Text style={styles.currentPrice}>Current Price: ₱{editingItem.price.toFixed(2)}</Text>
                
                <View style={styles.priceInputContainer}>
                  <Text style={styles.inputLabel}>New Price (₱)</Text>
                  <TextInput
                    style={styles.priceInput}
                    value={editPrice}
                    onChangeText={setEditPrice}
                    keyboardType="numeric"
                    placeholder="Enter new price"
                    placeholderTextColor={colors.textSecondary}
                  />
                </View>

                <View style={styles.modalActions}>
                  <TouchableOpacity
                    style={[styles.actionButton, styles.cancelButton]}
                    onPress={() => setEditingItem(null)}
                  >
                    <Text style={styles.cancelButtonText}>Cancel</Text>
                  </TouchableOpacity>
                  
                  <TouchableOpacity
                    style={[styles.actionButton, styles.saveButton]}
                    onPress={handleSavePrice}
                  >
                    <Save size={16} color="#FFFFFF" />
                    <Text style={styles.saveButtonText}>Save Price</Text>
                  </TouchableOpacity>
                </View>
              </View>
            )}
          </View>
        </View>
      </Modal>

      {/* Restock Modal */}
      <Modal
        visible={restockingItem !== null}
        transparent={true}
        animationType="slide"
        onRequestClose={() => setRestockingItem(null)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Restock Item</Text>
              <TouchableOpacity 
                onPress={() => setRestockingItem(null)}
                style={styles.closeButton}
              >
                <X size={24} color={colors.textSecondary} />
              </TouchableOpacity>
            </View>

            {restockingItem && (
              <View style={styles.modalBody}>
                <Text style={styles.itemName}>{restockingItem.name}</Text>
                <Text style={styles.currentStock}>
                  Current Stock: {restockingItem.inventory}/{restockingItem.maxInventory}
                </Text>
                
                <View style={styles.restockInputContainer}>
                  <Text style={styles.inputLabel}>Quantity to Add</Text>
                  <TextInput
                    style={styles.restockInput}
                    value={restockQuantity}
                    onChangeText={setRestockQuantity}
                    keyboardType="numeric"
                    placeholder="Enter quantity"
                    placeholderTextColor={colors.textSecondary}
                  />
                  <Text style={styles.maxStockText}>
                    Max capacity: {restockingItem.maxInventory} | Available space: {restockingItem.maxInventory - restockingItem.inventory}
                  </Text>
                </View>

                <View style={styles.modalActions}>
                  <TouchableOpacity
                    style={[styles.actionButton, styles.cancelButton]}
                    onPress={() => setRestockingItem(null)}
                  >
                    <Text style={styles.cancelButtonText}>Cancel</Text>
                  </TouchableOpacity>
                  
                  <TouchableOpacity
                    style={[styles.actionButton, styles.saveButton]}
                    onPress={handleSaveRestock}
                  >
                    <Plus size={16} color="#FFFFFF" />
                    <Text style={styles.saveButtonText}>Add Stock</Text>
                  </TouchableOpacity>
                </View>
              </View>
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
  header: {
    backgroundColor: colors.surface,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 3,
  },
  headerContent: {
    paddingHorizontal: 20,
    paddingVertical: 20,
  },
  headerTop: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  titleSection: {
    flex: 1,
  },
  title: {
    fontSize: 28,
    fontFamily: 'Inter-Bold',
    color: colors.secondary,
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 16,
    fontFamily: 'Inter-Regular',
    color: colors.textSecondary,
  },
  notificationBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F59E0B' + '20',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 20,
    gap: 6,
  },
  badgeText: {
    fontSize: 14,
    fontFamily: 'Inter-Bold',
    color: '#F59E0B',
  },
  quickStatsContainer: {
    marginTop: 8,
  },
  quickStatsContent: {
    gap: 12,
  },
  quickStatCard: {
    backgroundColor: colors.background,
    borderRadius: 16,
    padding: 16,
    alignItems: 'center',
    minWidth: 90,
    borderWidth: 1,
    borderColor: colors.border,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  alertQuickStatCard: {
    borderColor: '#F59E0B',
    backgroundColor: '#F59E0B' + '05',
  },
  quickStatValue: {
    fontSize: 20,
    fontFamily: 'Inter-Bold',
    color: colors.secondary,
    marginTop: 8,
    marginBottom: 4,
  },
  quickStatLabel: {
    fontSize: 11,
    fontFamily: 'Inter-Medium',
    color: colors.textSecondary,
    textAlign: 'center',
  },
  tabWrapper: {
    backgroundColor: colors.surface,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  tabContainer: {
    paddingVertical: 12,
  },
  tabContent: {
    paddingHorizontal: 20,
    gap: 12,
  },
  tab: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 24,
    backgroundColor: colors.background,
    borderWidth: 1,
    borderColor: colors.border,
    minWidth: 120,
    gap: 8,
  },
  selectedTab: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  tabText: {
    fontSize: 14,
    fontFamily: 'Inter-Medium',
    color: colors.textSecondary,
  },
  selectedTabText: {
    color: '#FFFFFF',
    fontFamily: 'Inter-SemiBold',
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingTop: 8,
    paddingBottom: 120,
  },
  sectionHeader: {
    paddingHorizontal: 20,
    marginVertical: 20,
  },
  sectionTitle: {
    fontSize: 22,
    fontFamily: 'Inter-Bold',
    color: colors.secondary,
    marginBottom: 4,
  },
  sectionSubtitle: {
    fontSize: 14,
    fontFamily: 'Inter-Regular',
    color: colors.textSecondary,
  },
  metricsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    paddingHorizontal: 20,
    gap: 16,
  },
  metricCard: {
    backgroundColor: colors.surface,
    borderRadius: 20,
    padding: 20,
    width: (width - 56) / 2,
    borderWidth: 1,
    borderColor: colors.border,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 6,
  },
  metricHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  metricIconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
  },
  trendBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  trendText: {
    fontSize: 12,
    fontFamily: 'Inter-Bold',
  },
  metricValue: {
    fontSize: 24,
    fontFamily: 'Inter-Bold',
    color: colors.secondary,
    marginBottom: 4,
  },
  metricTitle: {
    fontSize: 14,
    fontFamily: 'Inter-SemiBold',
    color: colors.text,
    marginBottom: 4,
  },
  metricSubtitle: {
    fontSize: 12,
    fontFamily: 'Inter-Regular',
    color: colors.textSecondary,
  },
  insightsContainer: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    gap: 12,
  },
  insightCard: {
    flex: 1,
    backgroundColor: colors.surface,
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: colors.border,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 3,
  },
  insightHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
    gap: 8,
  },
  insightTitle: {
    fontSize: 12,
    fontFamily: 'Inter-SemiBold',
    color: colors.text,
  },
  insightValue: {
    fontSize: 20,
    fontFamily: 'Inter-Bold',
    color: colors.secondary,
    marginBottom: 4,
  },
  insightSubtitle: {
    fontSize: 11,
    fontFamily: 'Inter-Regular',
    color: colors.textSecondary,
  },
  quickActionsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    paddingHorizontal: 20,
    gap: 16,
  },
  quickActionCard: {
    backgroundColor: colors.surface,
    borderRadius: 16,
    padding: 20,
    width: (width - 56) / 2,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: colors.border,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 3,
  },
  quickActionTitle: {
    fontSize: 14,
    fontFamily: 'Inter-SemiBold',
    color: colors.text,
    marginTop: 12,
    marginBottom: 4,
    textAlign: 'center',
  },
  quickActionSubtitle: {
    fontSize: 12,
    fontFamily: 'Inter-Regular',
    color: colors.textSecondary,
    textAlign: 'center',
  },
  prioritySection: {
    backgroundColor: '#F59E0B' + '10',
    marginHorizontal: 16,
    marginVertical: 8,
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#F59E0B' + '30',
  },
  prioritySectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  prioritySectionTitle: {
    fontSize: 16,
    fontFamily: 'Inter-Bold',
    color: '#F59E0B',
    marginLeft: 8,
  },
  prioritySectionSubtitle: {
    fontSize: 14,
    fontFamily: 'Inter-Regular',
    color: colors.textSecondary,
  },
  sectionTitleWrapper: {
    marginHorizontal: 16,
    marginVertical: 16,
  },
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 32,
    paddingVertical: 64,
    minHeight: 400,
  },
  emptyTitle: {
    fontSize: 20,
    fontFamily: 'Inter-SemiBold',
    color: colors.text,
    marginTop: 16,
    marginBottom: 8,
  },
  emptyDescription: {
    fontSize: 16,
    fontFamily: 'Inter-Regular',
    color: colors.textSecondary,
    textAlign: 'center',
    lineHeight: 24,
  },
  menuCard: {
    backgroundColor: colors.surface,
    borderRadius: 16,
    marginHorizontal: 16,
    marginVertical: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
    borderWidth: 1,
    borderColor: colors.border,
  },
  menuContent: {
    padding: 16,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  menuInfo: {
    flex: 1,
  },
  menuName: {
    fontSize: 16,
    fontFamily: 'Inter-SemiBold',
    color: colors.secondary,
    marginBottom: 4,
  },
  priceContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  menuPrice: {
    fontSize: 18,
    fontFamily: 'Inter-Bold',
    color: colors.primary,
    marginRight: 8,
  },
  editPriceButton: {
    padding: 4,
    borderRadius: 8,
    backgroundColor: colors.background,
  },
  menuCategory: {
    fontSize: 14,
    fontFamily: 'Inter-Regular',
    color: colors.textSecondary,
    marginBottom: 4,
  },
  stockInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  stockText: {
    fontSize: 12,
    fontFamily: 'Inter-Medium',
    marginLeft: 4,
  },
  menuControls: {
    alignItems: 'flex-end',
  },
  availabilityToggle: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  availabilityLabel: {
    fontSize: 14,
    fontFamily: 'Inter-Medium',
    marginRight: 8,
  },
  restockButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.background,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
    marginBottom: 8,
  },
  restockButtonText: {
    fontSize: 12,
    fontFamily: 'Inter-Medium',
    color: colors.primary,
    marginLeft: 4,
  },
  menuStatus: {
    padding: 4,
  },
  alertSection: {
    backgroundColor: colors.background,
    marginHorizontal: 16,
    marginVertical: 8,
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.border,
  },
  alertHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  alertTitle: {
    fontSize: 16,
    fontFamily: 'Inter-Bold',
    marginLeft: 8,
  },
  alertSubtitle: {
    fontSize: 14,
    fontFamily: 'Inter-Regular',
    color: colors.textSecondary,
  },
  inventoryCard: {
    backgroundColor: colors.surface,
    borderRadius: 16,
    marginHorizontal: 16,
    marginVertical: 8,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
    borderWidth: 1,
    borderColor: colors.border,
  },
  outOfStockCard: {
    borderColor: '#EF4444',
    backgroundColor: '#EF4444' + '05',
  },
  lowStockCard: {
    borderColor: '#F59E0B',
    backgroundColor: '#F59E0B' + '05',
  },
  inventoryInfo: {
    flex: 1,
  },
  inventoryName: {
    fontSize: 16,
    fontFamily: 'Inter-SemiBold',
    color: colors.secondary,
    marginBottom: 4,
  },
  outOfStockText: {
    fontSize: 14,
    fontFamily: 'Inter-Bold',
    color: '#EF4444',
    marginBottom: 4,
  },
  lowStockText: {
    fontSize: 14,
    fontFamily: 'Inter-Bold',
    color: '#F59E0B',
    marginBottom: 4,
  },
  inventoryCategory: {
    fontSize: 12,
    fontFamily: 'Inter-Regular',
    color: colors.textSecondary,
  },
  stockProgressContainer: {
    marginBottom: 4,
  },
  stockProgressBar: {
    height: 6,
    backgroundColor: colors.background,
    borderRadius: 3,
    marginBottom: 4,
  },
  stockProgressFill: {
    height: '100%',
    borderRadius: 3,
  },
  stockProgressText: {
    fontSize: 12,
    fontFamily: 'Inter-Medium',
    color: colors.textSecondary,
  },
  urgentRestockButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#EF4444',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
  },
  urgentRestockButtonText: {
    fontSize: 12,
    fontFamily: 'Inter-Bold',
    color: '#FFFFFF',
    marginLeft: 4,
  },
  warningRestockButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F59E0B' + '20',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#F59E0B',
  },
  warningRestockButtonText: {
    fontSize: 12,
    fontFamily: 'Inter-Bold',
    color: '#F59E0B',
    marginLeft: 4,
  },
  normalRestockButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.background,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: colors.border,
  },
  normalRestockButtonText: {
    fontSize: 12,
    fontFamily: 'Inter-Medium',
    color: colors.primary,
    marginLeft: 4,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    backgroundColor: colors.surface,
    borderRadius: 20,
    width: '90%',
    maxWidth: 400,
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
  itemName: {
    fontSize: 18,
    fontFamily: 'Inter-SemiBold',
    color: colors.text,
    marginBottom: 8,
  },
  currentPrice: {
    fontSize: 16,
    fontFamily: 'Inter-Regular',
    color: colors.textSecondary,
    marginBottom: 20,
  },
  currentStock: {
    fontSize: 16,
    fontFamily: 'Inter-Regular',
    color: colors.textSecondary,
    marginBottom: 20,
  },
  priceInputContainer: {
    marginBottom: 24,
  },
  restockInputContainer: {
    marginBottom: 24,
  },
  inputLabel: {
    fontSize: 16,
    fontFamily: 'Inter-SemiBold',
    color: colors.text,
    marginBottom: 8,
  },
  priceInput: {
    backgroundColor: colors.background,
    borderRadius: 12,
    padding: 16,
    fontSize: 18,
    fontFamily: 'Inter-Regular',
    color: colors.text,
    borderWidth: 1,
    borderColor: colors.border,
  },
  restockInput: {
    backgroundColor: colors.background,
    borderRadius: 12,
    padding: 16,
    fontSize: 18,
    fontFamily: 'Inter-Regular',
    color: colors.text,
    borderWidth: 1,
    borderColor: colors.border,
    marginBottom: 8,
  },
  maxStockText: {
    fontSize: 12,
    fontFamily: 'Inter-Regular',
    color: colors.textSecondary,
  },
  modalActions: {
    flexDirection: 'row',
    gap: 12,
  },
  actionButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 14,
    borderRadius: 12,
    gap: 8,
  },
  cancelButton: {
    backgroundColor: colors.background,
    borderWidth: 1,
    borderColor: colors.border,
  },
  saveButton: {
    backgroundColor: colors.primary,
  },
  cancelButtonText: {
    fontSize: 16,
    fontFamily: 'Inter-SemiBold',
    color: colors.text,
  },
  saveButtonText: {
    fontSize: 16,
    fontFamily: 'Inter-SemiBold',
    color: '#FFFFFF',
  },
  accessDeniedContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 32,
  },
  accessDeniedTitle: {
    fontSize: 24,
    fontFamily: 'Inter-Bold',
    marginTop: 20,
    marginBottom: 12,
  },
  accessDeniedMessage: {
    fontSize: 16,
    fontFamily: 'Inter-Regular',
    textAlign: 'center',
    lineHeight: 24,
  },
});