import React, { useState } from 'react';
import { View, Text, ScrollView, StyleSheet, SafeAreaView, TouchableOpacity, Alert } from 'react-native';
import { router } from 'expo-router';
import { Calendar, Clock, CircleCheck as CheckCircle, ShoppingBag, Bell, Package, ArrowLeft } from 'lucide-react-native';
import ReservationCard from '@/components/ReservationCard';
import { useTheme } from '@/contexts/ThemeContext';
import { useOrders } from '@/contexts/OrderContext';
import { useAuth } from '@/contexts/AuthContext';

export default function OrdersScreen() {
  const { user } = useAuth();
  const { colors } = useTheme();
  const { orders, updateOrderStatus } = useOrders();
  const [selectedFilter, setSelectedFilter] = useState('all');
  const isSeller = user?.role === 'seller';

  // Filter orders based on user role
  const userOrders = isSeller 
    ? orders // Sellers see all orders
    : orders; // In real app, filter by buyer ID

  const filters = [
    { key: 'all', label: 'All', count: userOrders.length },
    { key: 'pending', label: 'Pending', count: userOrders.filter(r => r.status === 'pending').length },
    { key: 'confirmed', label: 'Confirmed', count: userOrders.filter(r => r.status === 'confirmed').length },
    { key: 'ready', label: 'Ready', count: userOrders.filter(r => r.status === 'ready').length },
    { key: 'completed', label: 'Completed', count: userOrders.filter(r => r.status === 'completed').length },
  ];

  const filteredOrders = selectedFilter === 'all' 
    ? userOrders 
    : userOrders.filter(r => r.status === selectedFilter);

  const readyOrders = userOrders.filter(r => r.status === 'ready');
  const todaysOrders = filteredOrders.filter(r => {
    const today = new Date().toDateString();
    const orderDate = new Date(r.orderTime).toDateString();
    return today === orderDate;
  });

  const upcomingOrders = filteredOrders.filter(r => {
    const today = new Date().toDateString();
    const orderDate = new Date(r.orderTime).toDateString();
    return today !== orderDate;
  });

  const getScreenTitle = () => {
    return isSeller ? 'Customer Orders' : 'My Orders';
  };

  const getEmptyStateText = () => {
    if (selectedFilter === 'all') {
      return isSeller 
        ? "No customer orders yet" 
        : "You haven't placed any orders yet";
    }
    return `No ${selectedFilter} orders at the moment`;
  };

  const handleMarkAsPickedUp = (orderId: string) => {
    Alert.alert(
      'Confirm Pickup',
      'Mark this order as picked up?',
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Confirm', 
          onPress: () => {
            updateOrderStatus(orderId, 'completed');
            Alert.alert('Success', 'Order marked as completed!');
          }
        }
      ]
    );
  };

  const styles = createStyles(colors);

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerTop}>
          <View style={styles.headerLeft}>
            <TouchableOpacity 
              style={styles.backButton}
              onPress={() => router.back()}
              activeOpacity={0.7}
            >
              <ArrowLeft size={24} color={colors.primary} />
            </TouchableOpacity>
            <ShoppingBag size={28} color={colors.secondary} />
            <Text style={styles.title}>{getScreenTitle()}</Text>
          </View>
          {readyOrders.length > 0 && !isSeller && (
            <View style={styles.notificationBadge}>
              <Bell size={20} color={colors.primary} />
              <Text style={styles.badgeText}>{readyOrders.length}</Text>
            </View>
          )}
        </View>
        <View style={styles.headerStats}>
          <View style={styles.statItem}>
            <Calendar size={16} color={colors.primary} />
            <Text style={styles.statText}>
              {todaysOrders.length} today
            </Text>
          </View>
          <View style={styles.statItem}>
            <Clock size={16} color={colors.accent} />
            <Text style={styles.statText}>
              {userOrders.filter(o => o.status === 'pending').length} pending
            </Text>
          </View>
          {readyOrders.length > 0 && (
            <View style={styles.statItem}>
              <Package size={16} color={colors.warning} />
              <Text style={styles.statText}>
                {readyOrders.length} ready
              </Text>
            </View>
          )}
        </View>
      </View>

      {/* Ready for Pickup Alert - Only for buyers */}
      {!isSeller && readyOrders.length > 0 && (
        <View style={styles.readyAlert}>
          <View style={styles.readyAlertContent}>
            <View style={styles.readyAlertIcon}>
              <Bell size={24} color="#FFFFFF" />
            </View>
            <View style={styles.readyAlertText}>
              <Text style={styles.readyAlertTitle}>
                {readyOrders.length} Order{readyOrders.length > 1 ? 's' : ''} Ready!
              </Text>
              <Text style={styles.readyAlertSubtitle}>
                Your food is ready for pickup at the canteen
              </Text>
            </View>
          </View>
        </View>
      )}

      {/* Filter Tabs - Sticky */}
      <View style={styles.filtersWrapper}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.filtersContainer}>
          <View style={styles.filtersContent}>
            {filters.map((filter) => (
              <TouchableOpacity
                key={filter.key}
                style={[
                  styles.filterTab,
                  selectedFilter === filter.key && styles.selectedFilterTab,
                  filter.key === 'ready' && filter.count > 0 && styles.readyFilterTab
                ]}
                onPress={() => setSelectedFilter(filter.key)}
              >
                <Text style={[
                  styles.filterText,
                  selectedFilter === filter.key && styles.selectedFilterText,
                  filter.key === 'ready' && filter.count > 0 && styles.readyFilterText
                ]}>
                  {filter.label} ({filter.count})
                </Text>
                {filter.key === 'ready' && filter.count > 0 && (
                  <View style={styles.readyIndicator} />
                )}
              </TouchableOpacity>
            ))}
          </View>
        </ScrollView>
      </View>

      {/* Orders List */}
      <ScrollView 
        style={styles.ordersList} 
        showsVerticalScrollIndicator={false} 
        contentContainerStyle={styles.ordersContent}
        bounces={true}
      >
        {filteredOrders.length === 0 ? (
          <View style={styles.emptyState}>
            <CheckCircle size={64} color={colors.textSecondary} />
            <Text style={styles.emptyTitle}>
              {selectedFilter === 'all' ? 'No orders found' : `No ${selectedFilter} orders`}
            </Text>
            <Text style={styles.emptyDescription}>
              {getEmptyStateText()}
            </Text>
          </View>
        ) : (
          <>
            {/* Ready for Pickup Section - Priority display */}
            {selectedFilter === 'all' && readyOrders.length > 0 && (
              <>
                <View style={styles.sectionHeader}>
                  <View style={styles.sectionTitleContainer}>
                    <Bell size={20} color={colors.warning} />
                    <Text style={[styles.sectionTitle, { color: colors.warning }]}>
                      Ready for Pickup ({readyOrders.length})
                    </Text>
                  </View>
                  <Text style={styles.sectionSubtitle}>
                    {isSeller ? 'Orders ready for customer pickup' : 'Your orders are ready!'}
                  </Text>
                </View>
                {readyOrders.map((order) => (
                  <ReservationCard 
                    key={`ready-${order.id}`}
                    reservation={order} 
                    onUpdateStatus={updateOrderStatus}
                    onMarkAsPickedUp={!isSeller ? handleMarkAsPickedUp : undefined}
                    isHighlighted={true}
                  />
                ))}
              </>
            )}

            {/* Today's Orders */}
            {(selectedFilter === 'all' || selectedFilter !== 'ready') && todaysOrders.filter(o => selectedFilter === 'all' ? o.status !== 'ready' : true).length > 0 && (
              <>
                <View style={styles.sectionTitleWrapper}>
                  <Text style={styles.sectionTitle}>
                    {selectedFilter === 'ready' ? "Today's Ready Orders" : "Today's Orders"}
                  </Text>
                </View>
                {todaysOrders.filter(o => selectedFilter === 'all' ? o.status !== 'ready' : true).map((order) => (
                  <ReservationCard 
                    key={order.id} 
                    reservation={order} 
                    onUpdateStatus={updateOrderStatus}
                    onMarkAsPickedUp={!isSeller && order.status === 'ready' ? handleMarkAsPickedUp : undefined}
                    isHighlighted={order.status === 'ready'}
                  />
                ))}
              </>
            )}

            {/* Previous Orders */}
            {(selectedFilter === 'all' || selectedFilter !== 'ready') && upcomingOrders.filter(o => selectedFilter === 'all' ? o.status !== 'ready' : true).length > 0 && (
              <>
                <View style={styles.sectionTitleWrapper}>
                  <Text style={styles.sectionTitle}>Previous Orders</Text>
                </View>
                {upcomingOrders.filter(o => selectedFilter === 'all' ? o.status !== 'ready' : true).map((order) => (
                  <ReservationCard 
                    key={order.id} 
                    reservation={order} 
                    onUpdateStatus={updateOrderStatus}
                    onMarkAsPickedUp={!isSeller && order.status === 'ready' ? handleMarkAsPickedUp : undefined}
                    isHighlighted={order.status === 'ready'}
                  />
                ))}
              </>
            )}

            {/* Ready Orders when filter is specifically 'ready' */}
            {selectedFilter === 'ready' && readyOrders.length > 0 && (
              <>
                <View style={styles.sectionTitleWrapper}>
                  <Text style={styles.sectionTitle}>Ready for Pickup</Text>
                </View>
                {readyOrders.map((order) => (
                  <ReservationCard 
                    key={`filter-ready-${order.id}`}
                    reservation={order} 
                    onUpdateStatus={updateOrderStatus}
                    onMarkAsPickedUp={!isSeller ? handleMarkAsPickedUp : undefined}
                    isHighlighted={true}
                  />
                ))}
              </>
            )}
          </>
        )}
      </ScrollView>
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
    paddingHorizontal: 20,
    paddingVertical: 20,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  headerTop: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  backButton: {
    padding: 8,
    marginRight: 12,
    borderRadius: 8,
    backgroundColor: colors.background,
  },
  title: {
    fontSize: 24,
    fontFamily: 'Inter-Bold',
    color: colors.secondary,
    marginLeft: 12,
  },
  notificationBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.primary + '20',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    gap: 6,
  },
  badgeText: {
    fontSize: 14,
    fontFamily: 'Inter-Bold',
    color: colors.primary,
  },
  headerStats: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 20,
  },
  statItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  statText: {
    fontSize: 14,
    fontFamily: 'Inter-Medium',
    color: colors.textSecondary,
  },
  readyAlert: {
    backgroundColor: colors.warning,
    marginHorizontal: 20,
    marginVertical: 16,
    borderRadius: 16,
    padding: 16,
    shadowColor: colors.warning,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 6,
  },
  readyAlertContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  readyAlertIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: 'rgba(255,255,255,0.2)',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  readyAlertText: {
    flex: 1,
  },
  readyAlertTitle: {
    fontSize: 18,
    fontFamily: 'Inter-Bold',
    color: '#FFFFFF',
    marginBottom: 4,
  },
  readyAlertSubtitle: {
    fontSize: 14,
    fontFamily: 'Inter-Regular',
    color: 'rgba(255,255,255,0.9)',
  },
  filtersWrapper: {
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
  filtersContainer: {
    paddingHorizontal: 20,
  },
  filtersContent: {
    flexDirection: 'row',
    gap: 12,
  },
  filterTab: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: colors.background,
    borderWidth: 1,
    borderColor: colors.border,
    position: 'relative',
  },
  selectedFilterTab: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  readyFilterTab: {
    backgroundColor: colors.warning + '20',
    borderColor: colors.warning,
  },
  filterText: {
    fontSize: 14,
    fontFamily: 'Inter-Medium',
    color: colors.secondary,
    whiteSpace: 'nowrap',
  },
  selectedFilterText: {
    color: '#FFFFFF',
  },
  readyFilterText: {
    color: colors.warning,
    fontFamily: 'Inter-Bold',
  },
  readyIndicator: {
    position: 'absolute',
    top: -4,
    right: -4,
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: colors.warning,
    borderWidth: 2,
    borderColor: colors.surface,
  },
  ordersList: {
    flex: 1,
  },
  ordersContent: {
    paddingTop: 8,
    paddingBottom: 120,
  },
  sectionHeader: {
    paddingHorizontal: 20,
    marginVertical: 16,
  },
  sectionTitleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  sectionTitleWrapper: {
    marginHorizontal: 20,
    marginVertical: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontFamily: 'Inter-SemiBold',
    color: colors.secondary,
    marginLeft: 8,
  },
  sectionSubtitle: {
    fontSize: 14,
    fontFamily: 'Inter-Regular',
    color: colors.textSecondary,
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
});