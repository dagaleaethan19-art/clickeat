import React from 'react';
import { View, Text, Image, TouchableOpacity, StyleSheet, Dimensions } from 'react-native';
import { Clock, Star, MapPin, Package, TriangleAlert as AlertTriangle } from 'lucide-react-native';
import { FoodItem } from '@/types';
import { useTheme } from '@/contexts/ThemeContext';

const { width } = Dimensions.get('window');

interface FoodCardProps {
  item: FoodItem;
  onPress: () => void;
  variant?: 'default' | 'compact' | 'featured';
}

export default function FoodCard({ item, onPress, variant = 'default' }: FoodCardProps) {
  const { colors } = useTheme();

  const getStockStatus = () => {
    if (item.inventory === 0) return 'out-of-stock';
    const stockPercentage = (item.inventory / item.maxInventory) * 100;
    if (stockPercentage <= 20) return 'low-stock';
    return 'in-stock';
  };

  const getStockColor = () => {
    const status = getStockStatus();
    switch (status) {
      case 'out-of-stock': return '#EF4444';
      case 'low-stock': return '#F59E0B';
      default: return colors.primary;
    }
  };

  const getStockText = () => {
    const status = getStockStatus();
    switch (status) {
      case 'out-of-stock': return 'Out of Stock';
      case 'low-stock': return `Only ${item.inventory} left`;
      default: return `${item.inventory} available`;
    }
  };

  if (variant === 'featured') {
    return (
      <TouchableOpacity 
        style={[styles.featuredCard, item.inventory === 0 && styles.disabledCard]} 
        onPress={onPress}
        activeOpacity={item.inventory === 0 ? 1 : 0.9}
        disabled={item.inventory === 0}
      >
        <Image source={{ uri: item.image }} style={styles.featuredImage} />
        <View style={styles.featuredGradient}>
          <View style={styles.featuredContent}>
            <View style={styles.featuredRating}>
              <Star size={14} color="#F59E0B" fill="#F59E0B" />
              <Text style={styles.featuredRatingText}>{item.rating}</Text>
            </View>
            <Text style={styles.featuredName}>{item.name}</Text>
            <Text style={styles.featuredPrice}>₱ {item.price.toFixed(2)}</Text>
            <View style={styles.featuredMeta}>
              <Clock size={12} color="rgba(255,255,255,0.8)" />
              <Text style={styles.featuredTime}>{item.preparationTime}m</Text>
            </View>
            <View style={[styles.featuredStock, { backgroundColor: getStockColor() + '20' }]}>
              <Package size={12} color={getStockColor()} />
              <Text style={[styles.featuredStockText, { color: getStockColor() }]}>
                {getStockText()}
              </Text>
            </View>
          </View>
        </View>
        {item.inventory === 0 && (
          <View style={styles.outOfStockOverlay}>
            <Text style={styles.outOfStockText}>Out of Stock</Text>
          </View>
        )}
      </TouchableOpacity>
    );
  }

  if (variant === 'compact') {
    return (
      <TouchableOpacity 
        style={[
          styles.compactCard, 
          { backgroundColor: colors.surface, borderColor: colors.border },
          item.inventory === 0 && styles.disabledCard
        ]} 
        onPress={onPress}
        activeOpacity={item.inventory === 0 ? 1 : 0.8}
        disabled={item.inventory === 0}
      >
        <Image source={{ uri: item.image }} style={[styles.compactImage, { backgroundColor: colors.background }]} />
        <View style={styles.compactContent}>
          <Text style={[styles.compactName, { color: colors.text }]} numberOfLines={2}>{item.name}</Text>
          <Text style={[styles.compactPrice, { color: colors.primary }]}>₱ {item.price.toFixed(2)}</Text>
          <View style={styles.compactMeta}>
            <Star size={12} color="#F59E0B" fill="#F59E0B" />
            <Text style={[styles.compactRating, { color: colors.textSecondary }]}>{item.rating}</Text>
            <Text style={[styles.compactTime, { color: colors.textSecondary }]}>{item.preparationTime}m</Text>
          </View>
          <View style={[styles.compactStock, { backgroundColor: getStockColor() + '15' }]}>
            <Package size={10} color={getStockColor()} />
            <Text style={[styles.compactStockText, { color: getStockColor() }]}>
              {item.inventory}
            </Text>
          </View>
        </View>
        {item.inventory === 0 && (
          <View style={styles.compactOutOfStockOverlay}>
            <Text style={styles.compactOutOfStockText}>Out of Stock</Text>
          </View>
        )}
      </TouchableOpacity>
    );
  }

  const dynamicStyles = createDynamicStyles(colors);

  return (
    <TouchableOpacity 
      style={[
        dynamicStyles.card, 
        item.inventory === 0 && dynamicStyles.unavailableCard
      ]} 
      onPress={onPress}
      disabled={item.inventory === 0}
      activeOpacity={item.inventory === 0 ? 1 : 0.8}
    >
      <View style={styles.imageContainer}>
        <Image source={{ uri: item.image }} style={[styles.image, { backgroundColor: colors.background }]} />
        {item.inventory === 0 && (
          <View style={styles.unavailableOverlay}>
            <Text style={styles.unavailableText}>Out of Stock</Text>
          </View>
        )}
        <View style={styles.ratingBadge}>
          <Star size={12} color="#F59E0B" fill="#F59E0B" />
          <Text style={[styles.ratingText, { color: colors.text }]}>{item.rating}</Text>
        </View>
        <View style={[styles.categoryBadgeTop, { backgroundColor: colors.primary }]}>
          <Text style={styles.categoryTextTop}>{item.category}</Text>
        </View>
        <View style={[styles.stockBadge, { backgroundColor: getStockColor() }]}>
          <Package size={12} color="#FFFFFF" />
          <Text style={styles.stockBadgeText}>{item.inventory}</Text>
        </View>
      </View>
      
      <View style={styles.content}>
        <View style={styles.header}>
          <Text style={[styles.name, { color: colors.text }]} numberOfLines={1}>{item.name}</Text>
          <Text style={[styles.price, { color: colors.primary }]}>₱ {item.price.toFixed(2)}</Text>
        </View>
        
        <Text style={[styles.description, { color: colors.textSecondary }]} numberOfLines={2}>
          {item.description}
        </Text>
        
        <View style={styles.footer}>
          <View style={styles.sellerContainer}>
            <MapPin size={12} color={colors.textSecondary} />
            <Text style={[styles.seller, { color: colors.textSecondary }]} numberOfLines={1}>{item.sellerName}</Text>
          </View>
          
          <View style={[styles.timeContainer, { backgroundColor: colors.background }]}>
            <Clock size={12} color={colors.secondary} />
            <Text style={[styles.timeText, { color: colors.secondary }]}>{item.preparationTime}m</Text>
          </View>
        </View>

        {/* Stock Status */}
        <View style={styles.stockInfo}>
          <View style={[styles.stockIndicator, { backgroundColor: getStockColor() + '15' }]}>
            {getStockStatus() === 'low-stock' && <AlertTriangle size={14} color={getStockColor()} />}
            {getStockStatus() === 'out-of-stock' && <Package size={14} color={getStockColor()} />}
            {getStockStatus() === 'in-stock' && <Package size={14} color={getStockColor()} />}
            <Text style={[styles.stockText, { color: getStockColor() }]}>
              {getStockText()}
            </Text>
          </View>
        </View>
      </View>
    </TouchableOpacity>
  );
}

const createDynamicStyles = (colors: any) => StyleSheet.create({
  card: {
    backgroundColor: colors.surface,
    borderRadius: 24,
    marginHorizontal: 16,
    marginVertical: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.1,
    shadowRadius: 16,
    elevation: 8,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: colors.border,
  },
  unavailableCard: {
    opacity: 0.6,
  },
});

const styles = StyleSheet.create({
  // Disabled state
  disabledCard: {
    opacity: 0.6,
  },

  // Featured Card Styles
  featuredCard: {
    width: width * 0.75,
    height: 320,
    borderRadius: 24,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.15,
    shadowRadius: 16,
    elevation: 8,
    marginRight: 16,
    position: 'relative',
  },
  featuredImage: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  featuredGradient: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: '70%',
    backgroundColor: 'rgba(0,0,0,0.6)',
  },
  featuredContent: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    padding: 20,
  },
  featuredRating: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.2)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    alignSelf: 'flex-start',
    marginBottom: 12,
  },
  featuredRatingText: {
    fontSize: 12,
    fontFamily: 'Inter-Bold',
    color: '#FFFFFF',
    marginLeft: 4,
  },
  featuredName: {
    fontSize: 20,
    fontFamily: 'Inter-Bold',
    color: '#FFFFFF',
    marginBottom: 6,
    lineHeight: 26,
    textAlign: 'center',
  },
  featuredPrice: {
    fontSize: 20,
    fontFamily: 'Inter-Bold',
    color: '#10B981',
    marginBottom: 8,
  },
  featuredMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  featuredTime: {
    fontSize: 12,
    fontFamily: 'Inter-Medium',
    color: 'rgba(255,255,255,0.8)',
    marginLeft: 4,
  },
  featuredStock: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    alignSelf: 'flex-start',
  },
  featuredStockText: {
    fontSize: 12,
    fontFamily: 'Inter-Bold',
    marginLeft: 4,
  },
  outOfStockOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.8)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  outOfStockText: {
    fontSize: 18,
    fontFamily: 'Inter-Bold',
    color: '#FFFFFF',
    backgroundColor: '#EF4444',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 24,
  },

  // Compact Card Styles
  compactCard: {
    width: width * 0.45,
    borderRadius: 20,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 6,
    marginRight: 12,
    marginBottom: 12,
    borderWidth: 1,
    position: 'relative',
  },
  compactImage: {
    width: '100%',
    height: 120,
    resizeMode: 'cover',
  },
  compactContent: {
    padding: 12,
  },
  compactName: {
    fontSize: 13,
    fontFamily: 'Inter-SemiBold',
    marginBottom: 6,
    lineHeight: 16,
    textAlign: 'left',
  },
  compactPrice: {
    fontSize: 16,
    fontFamily: 'Inter-Bold',
    marginBottom: 8,
  },
  compactMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginBottom: 6,
  },
  compactRating: {
    fontSize: 11,
    fontFamily: 'Inter-Medium',
  },
  compactTime: {
    fontSize: 11,
    fontFamily: 'Inter-Medium',
    marginLeft: 8,
  },
  compactStock: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 6,
    paddingVertical: 3,
    borderRadius: 8,
    alignSelf: 'flex-start',
  },
  compactStockText: {
    fontSize: 10,
    fontFamily: 'Inter-Bold',
    marginLeft: 3,
  },
  compactOutOfStockOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  compactOutOfStockText: {
    fontSize: 12,
    fontFamily: 'Inter-Bold',
    color: '#FFFFFF',
    backgroundColor: '#EF4444',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
  },

  // Default Card Styles
  imageContainer: {
    position: 'relative',
    width: '100%',
    height: 200,
  },
  image: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  unavailableOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  unavailableText: {
    fontSize: 16,
    fontFamily: 'Inter-Bold',
    color: '#FFFFFF',
    backgroundColor: '#EF4444',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 24,
  },
  ratingBadge: {
    position: 'absolute',
    top: 16,
    right: 16,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.95)',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 16,
    gap: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  ratingText: {
    fontSize: 12,
    fontFamily: 'Inter-Bold',
  },
  categoryBadgeTop: {
    position: 'absolute',
    top: 16,
    left: 16,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
  },
  categoryTextTop: {
    fontSize: 11,
    fontFamily: 'Inter-Bold',
    color: '#FFFFFF',
  },
  stockBadge: {
    position: 'absolute',
    bottom: 16,
    right: 16,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    gap: 4,
  },
  stockBadgeText: {
    fontSize: 12,
    fontFamily: 'Inter-Bold',
    color: '#FFFFFF',
  },
  content: {
    padding: 20,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 10,
  },
  name: {
    fontSize: 18,
    fontFamily: 'Inter-Bold',
    flex: 1,
    marginRight: 12,
    lineHeight: 24,
  },
  price: {
    fontSize: 22,
    fontFamily: 'Inter-Bold',
  },
  description: {
    fontSize: 15,
    fontFamily: 'Inter-Regular',
    marginBottom: 16,
    lineHeight: 22,
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  sellerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    marginRight: 12,
  },
  seller: {
    fontSize: 13,
    fontFamily: 'Inter-Medium',
    marginLeft: 6,
    flex: 1,
  },
  timeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  timeText: {
    fontSize: 12,
    fontFamily: 'Inter-SemiBold',
    marginLeft: 4,
  },
  stockInfo: {
    marginTop: 8,
  },
  stockIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 12,
    alignSelf: 'flex-start',
  },
  stockText: {
    fontSize: 12,
    fontFamily: 'Inter-Bold',
    marginLeft: 6,
  },
});