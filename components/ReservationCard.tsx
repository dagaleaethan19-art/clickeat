import React from 'react';
import { View, Text, Image, StyleSheet, TouchableOpacity } from 'react-native';
import { Clock, Calendar, User, Package, CircleCheck as CheckCircle, Hash } from 'lucide-react-native';
import { useTheme } from '@/contexts/ThemeContext';
import { useAuth } from '@/contexts/AuthContext';

interface OrderItem {
  id: string;
  orderCode: string;
  foodItem: {
    id: string;
    name: string;
    price: number;
    image: string;
    sellerName: string;
  };
  quantity: number;
  pickupTime: string;
  notes?: string;
  totalAmount: number;
  orderTime: string;
  status: 'pending' | 'confirmed' | 'ready' | 'completed' | 'cancelled';
}

interface ReservationCardProps {
  reservation: OrderItem;
  onUpdateStatus?: (orderId: string, status: string) => void;
  onMarkAsPickedUp?: (orderId: string) => void;
  isHighlighted?: boolean;
}

export default function ReservationCard({ 
  reservation, 
  onMarkAsPickedUp, 
  isHighlighted = false 
}: ReservationCardProps) {
  const { user } = useAuth();
  const { colors } = useTheme();
  const isSeller = user?.role === 'seller';

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return colors.warning;
      case 'confirmed': return colors.primary;
      case 'ready': return '#F59E0B';
      case 'completed': return colors.textSecondary;
      case 'cancelled': return colors.error;
      default: return colors.textSecondary;
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'pending': return 'Pending';
      case 'confirmed': return 'Confirmed';
      case 'ready': return 'Ready for Pickup';
      case 'completed': return 'Completed';
      case 'cancelled': return 'Cancelled';
      default: return status;
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-PH', { 
      month: 'short', 
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const handlePickupPress = () => {
    if (onMarkAsPickedUp) {
      onMarkAsPickedUp(reservation.id);
    }
  };

  const styles = createStyles(colors, isHighlighted);

  return (
    <View style={[
      styles.card,
      isHighlighted && styles.highlightedCard
    ]}>
      {/* Ready Badge */}
      {reservation.status === 'ready' && (
        <View style={styles.readyBadge}>
          <Package size={16} color="#FFFFFF" />
          <Text style={styles.readyBadgeText}>READY FOR PICKUP</Text>
        </View>
      )}

      <View style={styles.cardContent}>
        <Image source={{ uri: reservation.foodItem.image }} style={styles.image} />
        <View style={styles.content}>
          <View style={styles.header}>
            <Text style={styles.name}>{reservation.foodItem.name}</Text>
            <View style={[styles.statusBadge, { backgroundColor: getStatusColor(reservation.status) }]}>
              <Text style={styles.statusText}>{getStatusText(reservation.status)}</Text>
            </View>
          </View>
          
          {/* Order Code */}
          <View style={styles.orderCodeContainer}>
            <Hash size={14} color={colors.primary} />
            <Text style={styles.orderCode}>{reservation.orderCode}</Text>
          </View>
          
          <Text style={styles.seller}>{reservation.foodItem.sellerName}</Text>
          
          {/* Show buyer name for sellers */}
          {isSeller && (
            <View style={styles.buyerInfo}>
              <User size={14} color={colors.textSecondary} />
              <Text style={styles.buyerName}>Customer Order</Text>
            </View>
          )}
          
          <View style={styles.details}>
            <View style={styles.detailItem}>
              <Calendar size={16} color={colors.textSecondary} />
              <Text style={styles.detailText}>Ordered: {formatDate(reservation.orderTime)}</Text>
            </View>
            
            <View style={styles.detailItem}>
              <Clock size={16} color={colors.textSecondary} />
              <Text style={styles.detailText}>Pickup: {reservation.pickupTime}</Text>
            </View>
            
            <View style={styles.detailItem}>
              <Text style={styles.quantity}>Qty: {reservation.quantity}</Text>
              <Text style={styles.total}>₱ {reservation.totalAmount.toFixed(2)}</Text>
            </View>
          </View>
          
          {reservation.notes && (
            <View style={styles.notesContainer}>
              <Text style={styles.notes}>Note: {reservation.notes}</Text>
            </View>
          )}

          {/* Pickup Button for Ready Orders - Enhanced Clickability */}
          {reservation.status === 'ready' && onMarkAsPickedUp && !isSeller && (
            <TouchableOpacity
              style={styles.pickupButton}
              onPress={handlePickupPress}
              activeOpacity={0.7}
              hitSlop={{ top: 15, bottom: 15, left: 15, right: 15 }}
            >
              <CheckCircle size={20} color="#FFFFFF" />
              <Text style={styles.pickupButtonText}>Mark as Picked Up</Text>
            </TouchableOpacity>
          )}
        </View>
      </View>
    </View>
  );
}

const createStyles = (colors: any, isHighlighted: boolean) => StyleSheet.create({
  card: {
    backgroundColor: colors.surface,
    borderRadius: 16,
    marginHorizontal: 16,
    marginVertical: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
    overflow: 'hidden',
    borderWidth: isHighlighted ? 2 : 1,
    borderColor: isHighlighted ? '#F59E0B' : colors.border,
  },
  highlightedCard: {
    shadowColor: '#F59E0B',
    shadowOpacity: 0.2,
    elevation: 8,
  },
  readyBadge: {
    backgroundColor: '#F59E0B',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 8,
    gap: 6,
  },
  readyBadgeText: {
    fontSize: 12,
    fontFamily: 'Inter-Bold',
    color: '#FFFFFF',
    letterSpacing: 0.5,
  },
  cardContent: {
    flexDirection: 'row',
  },
  image: {
    width: 80,
    height: 80,
    backgroundColor: colors.background,
    margin: 16,
    borderRadius: 12,
    resizeMode: 'cover',
  },
  content: {
    flex: 1,
    padding: 16,
    paddingLeft: 0,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 4,
  },
  name: {
    fontSize: 15,
    fontFamily: 'Inter-SemiBold',
    color: colors.secondary,
    flex: 1,
    marginRight: 8,
    lineHeight: 20,
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  statusText: {
    fontSize: 12,
    fontFamily: 'Inter-Medium',
    color: '#FFFFFF',
  },
  orderCodeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  orderCode: {
    fontSize: 14,
    fontFamily: 'Inter-Bold',
    color: colors.primary,
    marginLeft: 4,
  },
  seller: {
    fontSize: 14,
    fontFamily: 'Inter-Regular',
    color: colors.textSecondary,
    marginBottom: 8,
  },
  buyerInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  buyerName: {
    fontSize: 13,
    fontFamily: 'Inter-Medium',
    color: colors.secondary,
    marginLeft: 6,
  },
  details: {
    gap: 6,
  },
  detailItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  detailText: {
    fontSize: 13,
    fontFamily: 'Inter-Regular',
    color: colors.text,
    marginLeft: 8,
    flex: 1,
  },
  quantity: {
    fontSize: 14,
    fontFamily: 'Inter-Medium',
    color: colors.text,
  },
  total: {
    fontSize: 16,
    fontFamily: 'Inter-Bold',
    color: colors.primary,
  },
  notesContainer: {
    backgroundColor: colors.background,
    padding: 8,
    borderRadius: 8,
    marginTop: 8,
  },
  notes: {
    fontSize: 12,
    fontFamily: 'Inter-Regular',
    color: colors.secondary,
    fontStyle: 'italic',
  },
  pickupButton: {
    backgroundColor: '#10B981',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    paddingHorizontal: 24,
    borderRadius: 12,
    marginTop: 12,
    gap: 8,
    shadowColor: '#10B981',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 6,
    minHeight: 52, // Increased minimum touch target size
  },
  pickupButtonText: {
    fontSize: 16,
    fontFamily: 'Inter-Bold',
    color: '#FFFFFF',
  },
});