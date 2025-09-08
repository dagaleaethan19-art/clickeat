import React, { useState } from 'react';
import { View, Text, ScrollView, StyleSheet, SafeAreaView, TouchableOpacity, Image, Switch, Alert, Dimensions } from 'react-native';
import { User, Mail, Phone, Settings, Bell, CircleHelp as HelpCircle, LogOut, ShoppingCart, Store, CreditCard as Edit, Shield, Globe, Moon, Award, TrendingUp, Calendar } from 'lucide-react-native';
import { useTheme } from '@/contexts/ThemeContext';
import { useOrders } from '@/contexts/OrderContext';
import { useAuth } from '@/contexts/AuthContext';

const { width } = Dimensions.get('window');

export default function ProfileScreen() {
  const { user, signOut } = useAuth();
  const { colors, isDarkMode, toggleTheme } = useTheme();
  const { orders } = useOrders();
  const [notificationsEnabled, setNotificationsEnabled] = useState(true);
  const [locationEnabled, setLocationEnabled] = useState(true);
  const isSeller = user?.role === 'seller';

  if (!user) {
    return null; // This shouldn't happen as the user should be authenticated
  }

  // Calculate user stats
  const userOrders = orders.length;
  const completedOrders = orders.filter(order => order.status === 'completed').length;
  const totalSpent = orders.reduce((sum, order) => sum + order.totalAmount, 0);

  const profileStats = isSeller ? [
    { 
      label: 'Total Sales', 
      value: '₱1,250', 
      icon: TrendingUp,
      color: colors.primary
    },
    { 
      label: 'Orders Served', 
      value: '45', 
      icon: Store,
      color: colors.accent
    },
    { 
      label: 'This Month', 
      value: '₱850', 
      icon: Calendar,
      color: colors.secondary
    },
  ] : [
    { 
      label: 'Total Orders', 
      value: userOrders.toString(), 
      icon: ShoppingCart,
      color: colors.primary
    },
    { 
      label: 'Completed', 
      value: completedOrders.toString(), 
      icon: Award,
      color: colors.accent
    },
    { 
      label: 'Total Spent', 
      value: `₱${totalSpent.toFixed(0)}`, 
      icon: TrendingUp,
      color: colors.secondary
    },
  ];

  const handleEditProfile = () => {
    Alert.alert('Edit Profile', 'Profile editing feature will be available soon!');
  };

  const handleSettings = () => {
    Alert.alert('Settings', 'Advanced settings will be available soon!');
  };

  const handleHelp = () => {
    Alert.alert(
      'Help & Support', 
      'Need help? Contact us:\n\nEmail: support@rshscanteen.ph\nPhone: +639123456789\n\nOffice Hours: 7:00 AM - 5:00 PM'
    );
  };

  const handleLogout = () => {
    Alert.alert(
      'Sign Out',
      'Are you sure you want to sign out of your account?',
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Sign Out', 
          style: 'destructive', 
          onPress: signOut
        }
      ]
    );
  };

  const handleNotificationToggle = (value: boolean) => {
    setNotificationsEnabled(value);
    Alert.alert(
      'Notifications',
      value 
        ? 'Push notifications have been enabled. You will receive updates about your orders.' 
        : 'Push notifications have been disabled. You can re-enable them anytime.'
    );
  };

  const handleLocationToggle = (value: boolean) => {
    setLocationEnabled(value);
    Alert.alert(
      'Location Services',
      value 
        ? 'Location services enabled. This helps us provide better pickup time estimates.' 
        : 'Location services disabled. Some features may be limited.'
    );
  };

  const handlePrivacySecurity = () => {
    Alert.alert(
      'Privacy & Security',
      'Your privacy is important to us. We use industry-standard encryption to protect your data.\n\nData we collect:\n• Order history\n• Profile information\n• Payment details (encrypted)\n\nWe never share your personal information with third parties.'
    );
  };

  const getRoleIcon = () => {
    return isSeller ? Store : ShoppingCart;
  };

  const getRoleColor = () => {
    return isSeller ? colors.accent : colors.primary;
  };

  const menuItems = [
    { 
      icon: Edit, 
      label: 'Edit Profile', 
      action: handleEditProfile,
      showArrow: true,
      description: 'Update your personal information'
    },
    { 
      icon: Bell, 
      label: 'Push Notifications', 
      action: () => {},
      hasToggle: true,
      toggleValue: notificationsEnabled,
      onToggle: handleNotificationToggle,
      description: 'Get notified about order updates'
    },
    { 
      icon: Moon, 
      label: 'Dark Mode', 
      action: () => {},
      hasToggle: true,
      toggleValue: isDarkMode,
      onToggle: toggleTheme,
      description: 'Switch between light and dark themes'
    },
    { 
      icon: Globe, 
      label: 'Location Services', 
      action: () => {},
      hasToggle: true,
      toggleValue: locationEnabled,
      onToggle: handleLocationToggle,
      description: 'Help us provide better service'
    },
    { 
      icon: Shield, 
      label: 'Privacy & Security', 
      action: handlePrivacySecurity,
      showArrow: true,
      description: 'Your data protection and privacy'
    },
    { 
      icon: Settings, 
      label: 'Advanced Settings', 
      action: handleSettings,
      showArrow: true,
      description: 'Additional app configurations'
    },
    { 
      icon: HelpCircle, 
      label: 'Help & Support', 
      action: handleHelp,
      showArrow: true,
      description: 'Get help and contact support'
    },
  ];

  const styles = createStyles(colors);

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView 
        style={styles.scrollView} 
        showsVerticalScrollIndicator={false} 
        contentContainerStyle={styles.scrollContent}
        bounces={true}
      >
        {/* Profile Header with Gradient Background */}
        <View style={styles.profileHeader}>
          <View style={styles.gradientOverlay} />
          <View style={styles.headerContent}>
            <View style={styles.profileImageContainer}>
              <Image 
                source={{ uri: user.profileImage || 'https://images.pexels.com/photos/1043474/pexels-photo-1043474.jpeg?auto=compress&cs=tinysrgb&w=150' }}
                style={styles.profileImage}
              />
              <TouchableOpacity style={styles.editImageButton} onPress={handleEditProfile}>
                <Edit size={16} color="#FFFFFF" />
              </TouchableOpacity>
            </View>
            
            <Text style={styles.userName}>{user.name}</Text>
            <Text style={styles.userEmail}>{user.email}</Text>
            
            {/* Role Display */}
            <View style={[styles.roleDisplay, { backgroundColor: getRoleColor() }]}>
              {React.createElement(getRoleIcon(), { size: 18, color: '#FFFFFF' })}
              <Text style={styles.roleDisplayText}>
                {isSeller ? 'Seller Account' : 'Student Account'}
              </Text>
            </View>
          </View>
        </View>

        {/* Enhanced Stats Cards */}
        <View style={styles.statsContainer}>
          {profileStats.map((stat, index) => (
            <View key={index} style={styles.statCard}>
              <View style={[styles.statIconContainer, { backgroundColor: stat.color + '20' }]}>
                <stat.icon size={24} color={stat.color} />
              </View>
              <Text style={styles.statValue}>{stat.value}</Text>
              <Text style={styles.statLabel}>{stat.label}</Text>
            </View>
          ))}
        </View>

        {/* Quick Actions */}
        <View style={styles.quickActionsContainer}>
          <Text style={styles.sectionTitle}>Quick Actions</Text>
          <View style={styles.quickActions}>
            <TouchableOpacity style={styles.quickActionButton} onPress={handleEditProfile}>
              <Edit size={20} color={colors.primary} />
              <Text style={styles.quickActionText}>Edit Profile</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.quickActionButton} onPress={handleHelp}>
              <HelpCircle size={20} color={colors.primary} />
              <Text style={styles.quickActionText}>Get Help</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.quickActionButton} onPress={handleSettings}>
              <Settings size={20} color={colors.primary} />
              <Text style={styles.quickActionText}>Settings</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Profile Information */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Profile Information</Text>
          
          <View style={styles.infoCard}>
            <View style={styles.infoItem}>
              <View style={styles.infoIconContainer}>
                <User size={20} color={colors.primary} />
              </View>
              <View style={styles.infoContent}>
                <Text style={styles.infoLabel}>Full Name</Text>
                <Text style={styles.infoValue}>{user.name}</Text>
              </View>
            </View>

            <View style={styles.infoItem}>
              <View style={styles.infoIconContainer}>
                <Mail size={20} color={colors.primary} />
              </View>
              <View style={styles.infoContent}>
                <Text style={styles.infoLabel}>Email Address</Text>
                <Text style={styles.infoValue}>{user.email}</Text>
              </View>
            </View>

            <View style={styles.infoItem}>
              <View style={styles.infoIconContainer}>
                <Phone size={20} color={colors.primary} />
              </View>
              <View style={styles.infoContent}>
                <Text style={styles.infoLabel}>Phone Number</Text>
                <Text style={styles.infoValue}>{user.phone}</Text>
              </View>
            </View>

            <View style={styles.infoItem}>
              <View style={styles.infoIconContainer}>
                {React.createElement(getRoleIcon(), { size: 20, color: colors.primary })}
              </View>
              <View style={styles.infoContent}>
                <Text style={styles.infoLabel}>Account Type</Text>
                <Text style={[styles.infoValue, { color: getRoleColor() }]}>
                  {isSeller ? 'Seller Account' : 'Student Account'}
                </Text>
              </View>
            </View>
          </View>
        </View>

        {/* Settings Menu */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Settings & Preferences</Text>
          
          <View style={styles.menuCard}>
            {menuItems.map((item, index) => (
              <TouchableOpacity
                key={index}
                style={[
                  styles.menuItem,
                  index === menuItems.length - 1 && styles.lastMenuItem
                ]}
                onPress={item.action}
                activeOpacity={0.7}
              >
                <View style={styles.menuItemLeft}>
                  <View style={styles.menuIconContainer}>
                    <item.icon size={20} color={colors.primary} />
                  </View>
                  <View style={styles.menuTextContainer}>
                    <Text style={styles.menuItemText}>{item.label}</Text>
                    <Text style={styles.menuItemDescription}>{item.description}</Text>
                  </View>
                </View>
                
                {item.hasToggle ? (
                  <Switch
                    value={item.toggleValue}
                    onValueChange={item.onToggle}
                    trackColor={{ false: colors.border, true: colors.primary + '40' }}
                    thumbColor={item.toggleValue ? colors.primary : colors.textSecondary}
                  />
                ) : item.showArrow ? (
                  <Text style={styles.menuArrow}>›</Text>
                ) : null}
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Logout Button */}
        <TouchableOpacity style={styles.logoutButton} onPress={handleLogout} activeOpacity={0.8}>
          <LogOut size={20} color="#EF4444" />
          <Text style={styles.logoutText}>Sign Out</Text>
        </TouchableOpacity>

        {/* App Info */}
        <View style={styles.appInfo}>
          <Text style={styles.versionText}>RSHS Canteen App</Text>
          <Text style={styles.versionText}>Version 1.0.0</Text>
          <Text style={styles.copyrightText}>© 2024 Regional Science High School</Text>
          <Text style={styles.copyrightText}>Made with ❤️ for RSHS students</Text>
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
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 120,
  },
  profileHeader: {
    position: 'relative',
    backgroundColor: colors.primary,
    paddingVertical: 40,
    paddingHorizontal: 20,
    borderBottomLeftRadius: 32,
    borderBottomRightRadius: 32,
    overflow: 'hidden',
  },
  gradientOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0,0,0,0.1)',
  },
  headerContent: {
    alignItems: 'center',
    zIndex: 1,
  },
  profileImageContainer: {
    position: 'relative',
    marginBottom: 20,
  },
  profileImage: {
    width: 120,
    height: 120,
    borderRadius: 60,
    borderWidth: 4,
    borderColor: '#FFFFFF',
  },
  editImageButton: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    backgroundColor: colors.accent,
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 3,
    borderColor: '#FFFFFF',
  },
  userName: {
    fontSize: 28,
    fontFamily: 'Inter-Bold',
    color: '#FFFFFF',
    marginBottom: 6,
    textAlign: 'center',
  },
  userEmail: {
    fontSize: 16,
    fontFamily: 'Inter-Regular',
    color: 'rgba(255,255,255,0.9)',
    marginBottom: 20,
    textAlign: 'center',
  },
  roleDisplay: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 25,
    gap: 8,
    backgroundColor: 'rgba(255,255,255,0.2)',
  },
  roleDisplayText: {
    fontSize: 14,
    fontFamily: 'Inter-Bold',
    color: '#FFFFFF',
  },
  statsContainer: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    paddingVertical: 24,
    gap: 12,
    marginTop: -20,
    zIndex: 2,
  },
  statCard: {
    flex: 1,
    backgroundColor: colors.surface,
    borderRadius: 20,
    padding: 20,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 6,
    borderWidth: 1,
    borderColor: colors.border,
  },
  statIconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
  },
  statValue: {
    fontSize: 24,
    fontFamily: 'Inter-Bold',
    color: colors.text,
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 12,
    fontFamily: 'Inter-Medium',
    color: colors.textSecondary,
    textAlign: 'center',
  },
  quickActionsContainer: {
    paddingHorizontal: 20,
    marginBottom: 24,
  },
  quickActions: {
    flexDirection: 'row',
    gap: 12,
  },
  quickActionButton: {
    flex: 1,
    backgroundColor: colors.surface,
    borderRadius: 16,
    padding: 16,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: colors.border,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 3,
  },
  quickActionText: {
    fontSize: 12,
    fontFamily: 'Inter-SemiBold',
    color: colors.text,
    marginTop: 8,
    textAlign: 'center',
  },
  section: {
    paddingHorizontal: 20,
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 20,
    fontFamily: 'Inter-Bold',
    color: colors.text,
    marginBottom: 16,
  },
  infoCard: {
    backgroundColor: colors.surface,
    borderRadius: 20,
    padding: 4,
    borderWidth: 1,
    borderColor: colors.border,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 3,
  },
  infoItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: colors.background,
  },
  infoIconContainer: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: colors.primary + '15',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  infoContent: {
    flex: 1,
  },
  infoLabel: {
    fontSize: 14,
    fontFamily: 'Inter-Medium',
    color: colors.textSecondary,
    marginBottom: 4,
  },
  infoValue: {
    fontSize: 16,
    fontFamily: 'Inter-SemiBold',
    color: colors.text,
  },
  menuCard: {
    backgroundColor: colors.surface,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: colors.border,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 3,
    overflow: 'hidden',
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: colors.background,
  },
  lastMenuItem: {
    borderBottomWidth: 0,
  },
  menuItemLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  menuIconContainer: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: colors.primary + '15',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  menuTextContainer: {
    flex: 1,
  },
  menuItemText: {
    fontSize: 16,
    fontFamily: 'Inter-SemiBold',
    color: colors.text,
    marginBottom: 2,
  },
  menuItemDescription: {
    fontSize: 13,
    fontFamily: 'Inter-Regular',
    color: colors.textSecondary,
  },
  menuArrow: {
    fontSize: 24,
    fontFamily: 'Inter-Regular',
    color: colors.textSecondary,
  },
  logoutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FEF2F2',
    marginHorizontal: 20,
    marginBottom: 32,
    paddingVertical: 18,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#FCA5A5',
    shadowColor: '#EF4444',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  logoutText: {
    fontSize: 16,
    fontFamily: 'Inter-Bold',
    color: '#EF4444',
    marginLeft: 8,
  },
  appInfo: {
    alignItems: 'center',
    paddingHorizontal: 20,
    marginBottom: 32,
  },
  versionText: {
    fontSize: 14,
    fontFamily: 'Inter-Medium',
    color: colors.textSecondary,
    textAlign: 'center',
    marginBottom: 4,
  },
  copyrightText: {
    fontSize: 12,
    fontFamily: 'Inter-Regular',
    color: colors.textSecondary,
    textAlign: 'center',
    marginTop: 4,
  },
});