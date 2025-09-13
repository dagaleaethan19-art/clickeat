import React, { useState, useMemo } from 'react';
import { View, Text, ScrollView, StyleSheet, SafeAreaView, TouchableOpacity, Dimensions } from 'react-native';
import { ChartBar as BarChart3, TrendingUp, ShoppingBag, Clock, Star, Calendar, DollarSign, Target, Award, Activity, Users, Package } from 'lucide-react-native';
import { useTheme } from '@/contexts/ThemeContext';
import { useOrders } from '@/contexts/OrderContext';
import { useAuth } from '@/contexts/AuthContext';
import { useInventory } from '@/contexts/InventoryContext';

const { width } = Dimensions.get('window');

export default function DashboardScreen() {
  const { user } = useAuth();
  const { colors } = useTheme();
  const { orders } = useOrders();
  const { foodItems } = useInventory();
  const [selectedPeriod, setSelectedPeriod] = useState('week');

  // Calculate user analytics
  const analytics = useMemo(() => {
    const userOrders = orders; // In real app, filter by user ID
    const completedOrders = userOrders.filter(order => order.status === 'completed');
    const pendingOrders = userOrders.filter(order => order.status === 'pending');
    const readyOrders = userOrders.filter(order => order.status === 'ready');
    
    // Calculate totals
    const totalSpent = completedOrders.reduce((sum, order) => sum + order.totalAmount, 0);
    const totalOrders = userOrders.length;
    const avgOrderValue = totalOrders > 0 ? totalSpent / completedOrders.length : 0;
    
    // Calculate this week's data
    const oneWeekAgo = new Date();
    oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);
    
    const thisWeekOrders = userOrders.filter(order => 
      new Date(order.orderTime) >= oneWeekAgo
    );
    const thisWeekSpent = thisWeekOrders
      .filter(order => order.status === 'completed')
      .reduce((sum, order) => sum + order.totalAmount, 0);
    
    // Favorite foods (most ordered)
    const foodFrequency: { [key: string]: { count: number; item: any } } = {};
    userOrders.forEach(order => {
      const foodId = order.foodItem.id;
      if (!foodFrequency[foodId]) {
        foodFrequency[foodId] = { count: 0, item: order.foodItem };
      }
      foodFrequency[foodId].count += order.quantity;
    });
    
    const favoriteFood = Object.values(foodFrequency)
      .sort((a, b) => b.count - a.count)[0];
    
    // Calculate savings (mock data)
    const estimatedSavings = totalSpent * 0.15; // Assume 15% savings vs outside food
    
    return {
      totalOrders,
      completedOrders: completedOrders.length,
      pendingOrders: pendingOrders.length,
      readyOrders: readyOrders.length,
      totalSpent,
      thisWeekSpent,
      avgOrderValue,
      favoriteFood,
      estimatedSavings,
      thisWeekOrders: thisWeekOrders.length
    };
  }, [orders]);

  // Dashboard metrics
  const dashboardMetrics = [
    {
      icon: ShoppingBag,
      title: 'Total Orders',
      value: analytics.totalOrders.toString(),
      subtitle: `${analytics.completedOrders} completed`,
      color: colors.primary,
      trend: '+2 this week',
      isPositive: true
    },
    {
      icon: DollarSign,
      title: 'Total Spent',
      value: `₱${analytics.totalSpent.toFixed(0)}`,
      subtitle: `₱${analytics.thisWeekSpent.toFixed(0)} this week`,
      color: '#8B5CF6',
      trend: analytics.thisWeekSpent > 0 ? `+₱${analytics.thisWeekSpent.toFixed(0)}` : 'No orders',
      isPositive: analytics.thisWeekSpent > 0
    },
    {
      icon: Target,
      title: 'Average Order',
      value: `₱${analytics.avgOrderValue.toFixed(0)}`,
      subtitle: 'Per completed order',
      color: colors.accent,
      trend: 'Consistent',
      isPositive: true
    },
    {
      icon: Award,
      title: 'Savings',
      value: `₱${analytics.estimatedSavings.toFixed(0)}`,
      subtitle: 'vs outside food',
      color: '#10B981',
      trend: '15% saved',
      isPositive: true
    }
  ];

  // Quick stats
  const quickStats = [
    {
      icon: Clock,
      value: analytics.pendingOrders,
      label: 'Pending',
      color: colors.warning,
      isAlert: analytics.pendingOrders > 0
    },
    {
      icon: Package,
      value: analytics.readyOrders,
      label: 'Ready',
      color: '#F59E0B',
      isAlert: analytics.readyOrders > 0
    },
    {
      icon: Calendar,
      value: analytics.thisWeekOrders,
      label: 'This Week',
      color: colors.primary
    },
    {
      icon: Star,
      value: analytics.favoriteFood ? '1' : '0',
      label: 'Favorite',
      color: colors.accent
    }
  ];

  const periods = [
    { key: 'week', label: 'This Week' },
    { key: 'month', label: 'This Month' },
    { key: 'all', label: 'All Time' }
  ];

  const styles = createStyles(colors);

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <ScrollView 
        style={styles.scrollView} 
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
        bounces={true}
      >
        {/* Header */}
        <View style={styles.header}>
          <View style={styles.headerContent}>
            <View style={styles.headerTop}>
              <View style={styles.titleSection}>
                <Text style={styles.title}>My Dashboard</Text>
                <Text style={styles.subtitle}>Track your food ordering journey</Text>
              </View>
              {analytics.readyOrders > 0 && (
                <View style={styles.notificationBadge}>
                  <Package size={20} color="#F59E0B" />
                  <Text style={styles.badgeText}>{analytics.readyOrders}</Text>
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
                <View
                  key={index}
                  style={[
                    styles.quickStatCard,
                    stat.isAlert && styles.alertQuickStatCard
                  ]}
                >
                  <stat.icon size={18} color={stat.color} />
                  <Text style={[styles.quickStatValue, stat.isAlert && { color: stat.color }]}>
                    {stat.value}
                  </Text>
                  <Text style={[styles.quickStatLabel, stat.isAlert && { color: stat.color }]}>
                    {stat.label}
                  </Text>
                </View>
              ))}
            </ScrollView>
          </View>
        </View>

        {/* Period Filter */}
        <View style={styles.periodWrapper}>
          <ScrollView 
            horizontal 
            showsHorizontalScrollIndicator={false} 
            style={styles.periodContainer}
            contentContainerStyle={styles.periodContent}
          >
            {periods.map((period) => (
              <TouchableOpacity
                key={period.key}
                style={[
                  styles.periodButton,
                  selectedPeriod === period.key && styles.selectedPeriodButton
                ]}
                onPress={() => setSelectedPeriod(period.key)}
                activeOpacity={0.7}
              >
                <Text style={[
                  styles.periodText,
                  selectedPeriod === period.key && styles.selectedPeriodText
                ]}>
                  {period.label}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>

        {/* Analytics Cards */}
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Your Food Journey</Text>
          <Text style={styles.sectionSubtitle}>Track your ordering habits and savings</Text>
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

        {/* Favorite Food Section */}
        {analytics.favoriteFood && (
          <>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>Your Favorite</Text>
              <Text style={styles.sectionSubtitle}>Most ordered dish</Text>
            </View>
            
            <View style={styles.favoriteCard}>
              <View style={styles.favoriteHeader}>
                <Star size={24} color="#F59E0B" fill="#F59E0B" />
                <Text style={styles.favoriteTitle}>Top Choice</Text>
              </View>
              <Text style={styles.favoriteName}>{analytics.favoriteFood.item.name}</Text>
              <Text style={styles.favoriteCount}>
                Ordered {analytics.favoriteFood.count} times
              </Text>
              <Text style={styles.favoritePrice}>
                ₱{analytics.favoriteFood.item.price.toFixed(2)} each
              </Text>
            </View>
          </>
        )}

        {/* Insights Section */}
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Smart Insights</Text>
          <Text style={styles.sectionSubtitle}>Personalized recommendations</Text>
        </View>

        <View style={styles.insightsContainer}>
          <View style={styles.insightCard}>
            <View style={styles.insightHeader}>
              <Activity size={20} color={colors.primary} />
              <Text style={styles.insightTitle}>Order Frequency</Text>
            </View>
            <Text style={styles.insightValue}>
              {analytics.thisWeekOrders > 0 ? `${analytics.thisWeekOrders} orders` : 'No orders'}
            </Text>
            <Text style={styles.insightSubtitle}>This week</Text>
          </View>

          <View style={styles.insightCard}>
            <View style={styles.insightHeader}>
              <TrendingUp size={20} color={colors.accent} />
              <Text style={styles.insightTitle}>Spending Trend</Text>
            </View>
            <Text style={styles.insightValue}>
              {analytics.thisWeekSpent > 0 ? '↗️ Active' : '→ Stable'}
            </Text>
            <Text style={styles.insightSubtitle}>Weekly pattern</Text>
          </View>

          <View style={styles.insightCard}>
            <View style={styles.insightHeader}>
              <Users size={20} color="#8B5CF6" />
              <Text style={styles.insightTitle}>Completion Rate</Text>
            </View>
            <Text style={styles.insightValue}>
              {analytics.totalOrders > 0 ? Math.round((analytics.completedOrders / analytics.totalOrders) * 100) : 0}%
            </Text>
            <Text style={styles.insightSubtitle}>Orders completed</Text>
          </View>
        </View>

        {/* Tips Section */}
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Smart Tips</Text>
          <Text style={styles.sectionSubtitle}>Save more on your orders</Text>
        </View>

        <View style={styles.tipsContainer}>
          <View style={styles.tipCard}>
            <Text style={styles.tipIcon}>💡</Text>
            <View style={styles.tipContent}>
              <Text style={styles.tipTitle}>Order in Advance</Text>
              <Text style={styles.tipDescription}>
                Pre-order your meals to avoid waiting and ensure availability
              </Text>
            </View>
          </View>

          <View style={styles.tipCard}>
            <Text style={styles.tipIcon}>🍽️</Text>
            <View style={styles.tipContent}>
              <Text style={styles.tipTitle}>Try New Dishes</Text>
              <Text style={styles.tipDescription}>
                Explore different Filipino dishes to discover new favorites
              </Text>
            </View>
          </View>

          <View style={styles.tipCard}>
            <Text style={styles.tipIcon}>⏰</Text>
            <View style={styles.tipContent}>
              <Text style={styles.tipTitle}>Peak Hours</Text>
              <Text style={styles.tipDescription}>
                Order before 12:00 PM to avoid lunch rush and get faster service
              </Text>
            </View>
          </View>
        </View>
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
  periodWrapper: {
    backgroundColor: colors.surface,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  periodContainer: {
    paddingVertical: 12,
  },
  periodContent: {
    paddingHorizontal: 20,
    gap: 12,
  },
  periodButton: {
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 20,
    backgroundColor: colors.background,
    borderWidth: 1,
    borderColor: colors.border,
  },
  selectedPeriodButton: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  periodText: {
    fontSize: 14,
    fontFamily: 'Inter-Medium',
    color: colors.textSecondary,
  },
  selectedPeriodText: {
    color: '#FFFFFF',
    fontFamily: 'Inter-SemiBold',
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
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
  favoriteCard: {
    backgroundColor: colors.surface,
    borderRadius: 20,
    padding: 20,
    marginHorizontal: 20,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: colors.border,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 6,
  },
  favoriteHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  favoriteTitle: {
    fontSize: 16,
    fontFamily: 'Inter-SemiBold',
    color: colors.text,
    marginLeft: 8,
  },
  favoriteName: {
    fontSize: 20,
    fontFamily: 'Inter-Bold',
    color: colors.secondary,
    marginBottom: 4,
  },
  favoriteCount: {
    fontSize: 14,
    fontFamily: 'Inter-Medium',
    color: colors.textSecondary,
    marginBottom: 4,
  },
  favoritePrice: {
    fontSize: 16,
    fontFamily: 'Inter-Bold',
    color: colors.primary,
  },
  insightsContainer: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    gap: 12,
    marginBottom: 20,
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
    fontSize: 18,
    fontFamily: 'Inter-Bold',
    color: colors.secondary,
    marginBottom: 4,
  },
  insightSubtitle: {
    fontSize: 11,
    fontFamily: 'Inter-Regular',
    color: colors.textSecondary,
  },
  tipsContainer: {
    paddingHorizontal: 20,
    gap: 12,
  },
  tipCard: {
    backgroundColor: colors.surface,
    borderRadius: 16,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'flex-start',
    borderWidth: 1,
    borderColor: colors.border,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 3,
  },
  tipIcon: {
    fontSize: 24,
    marginRight: 16,
    marginTop: 2,
  },
  tipContent: {
    flex: 1,
  },
  tipTitle: {
    fontSize: 16,
    fontFamily: 'Inter-SemiBold',
    color: colors.text,
    marginBottom: 4,
  },
  tipDescription: {
    fontSize: 14,
    fontFamily: 'Inter-Regular',
    color: colors.textSecondary,
    lineHeight: 20,
  },
});