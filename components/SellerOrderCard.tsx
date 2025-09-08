import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Clock, User, MessageCircle, Package, Hash } from 'lucide-react-native';
import { useTheme } from '@/contexts/ThemeContext';

interface OrderItem {
  id: string;
  orderCode: string;
  foodItem: {
    id: string;
    name: string;
    price: number;
    sellerName: string;
  };
  quantity: number;
  pickupTime: string;
  notes?: string;
  totalAmount: number;
  orderTime: string;
  status: 'pending' | 'confirmed' | 'ready' | 'completed' | 'cancelled';
}

interface SellerOrderCardProps {
  reservation: OrderItem;
  onUpdateStatus: (reservationId: string, status: string) => void;
  isHighlighted?: boolean;
}

export default function SellerOrderCard({ 
  reservation, 
  onUpdateStatus, 
  isHighlighted = false 
}: SellerOrderCardProps) {
  const { colors } = useTheme();

  const getNextStatus = (currentStatus: string) => {
    switch (currentStatus) {
      case 'pending': return 'confirmed';
      case 'confirmed': return 'ready';
      case 'ready': return 'completed';
      default: return null;
    }
  };

  const getStatusAction = (status: string) => {
    switch (status) {
      case 'pending': return 'Confirm Order';
      case 'confirmed': return 'Mark as Ready';
      case 'ready': return 'Mark as Completed';
      default: return null;
    }
  };

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

  const nextStatus = getNextStatus(reservation.status);
  const statusAction = getStatusAction(reservation.status);

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
        <View style={styles.header}>
          <View style={styles.orderInfo}>
            <View style={styles.orderCodeContainer}>
              <Hash size={16} color={colors.primary} />
              <Text style={styles.orderCode}>{reservation.orderCode}</Text>
            </View>
            <View style={[styles.statusBadge, { backgroundColor: getStatusColor(reservation.status) }]}>
              <Text style={styles.statusText}>{reservation.status.toUpperCase()}</Text>
            </View>
          </View>
          <View style={styles.timeInfo}>
            <Clock size={16} color={colors.textSecondary} />
            <Text style={styles.timeText}>Pickup: {reservation.pickupTime}</Text>
          </View>
        </View>

        <View style={styles.content}>
          <View style={styles.customerInfo}>
            <User size={16} color={colors.textSecondary} />
            <Text style={styles.customerName}>Customer Order</Text>
          </View>

          <View style={styles.orderDetails}>
            <Text style={styles.foodName}>{reservation.foodItem.name}</Text>
            <View style={styles.quantityPrice}>
              <Text style={styles.quantity}>Qty: {reservation.quantity}</Text>
              <Text style={styles.price}>₱ {reservation.totalAmount.toFixed(2)}</Text>
            </View>
          </View>

          {reservation.notes && (
            <View style={styles.notesContainer}>
              <MessageCircle size={16} color={colors.textSecondary} />
              <Text style={styles.notes}>"{reservation.notes}"</Text>
            </View>
          )}
        </View>

        <View style={styles.actions}>
          {nextStatus && statusAction && (
            <TouchableOpacity
              style={[styles.actionButton, { backgroundColor: getStatusColor(nextStatus) }]}
              onPress={() => onUpdateStatus(reservation.id, nextStatus)}
            >
              <Text style={styles.actionButtonText}>{statusAction}</Text>
            </TouchableOpacity>
          )}
          
          {reservation.status === 'pending' && (
            <TouchableOpacity
              style={[styles.actionButton, styles.cancelButton]}
              onPress={() => onUpdateStatus(reservation.id, 'cancelled')}
            >
              <Text style={styles.cancelButtonText}>Cancel</Text>
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
    flex: 1,
  },
  header: {
    padding: 16,
    backgroundColor: colors.background,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  orderInfo: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  orderCodeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  orderCode: {
    fontSize: 16,
    fontFamily: 'Inter-Bold',
    color: colors.primary,
    marginLeft: 4,
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  statusText: {
    fontSize: 12,
    fontFamily: 'Inter-Bold',
    color: '#FFFFFF',
  },
  timeInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  timeText: {
    fontSize: 14,
    fontFamily: 'Inter-Regular',
    color: colors.textSecondary,
    marginLeft: 6,
  },
  content: {
    padding: 16,
  },
  customerInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  customerName: {
    fontSize: 14,
    fontFamily: 'Inter-Medium',
    color: colors.text,
    marginLeft: 8,
  },
  orderDetails: {
    marginBottom: 12,
  },
  foodName: {
    fontSize: 16,
    fontFamily: 'Inter-SemiBold',
    color: colors.secondary,
    marginBottom: 4,
    lineHeight: 22,
  },
  quantityPrice: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  quantity: {
    fontSize: 14,
    fontFamily: 'Inter-Medium',
    color: colors.textSecondary,
  },
  price: {
    fontSize: 18,
    fontFamily: 'Inter-Bold',
    color: colors.primary,
  },
  notesContainer: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    backgroundColor: colors.background,
    padding: 12,
    borderRadius: 8,
  },
  notes: {
    fontSize: 14,
    fontFamily: 'Inter-Regular',
    color: colors.secondary,
    marginLeft: 8,
    flex: 1,
    fontStyle: 'italic',
  },
  actions: {
    flexDirection: 'row',
    padding: 16,
    gap: 12,
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
  actionButton: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  actionButtonText: {
    fontSize: 14,
    fontFamily: 'Inter-SemiBold',
    color: '#FFFFFF',
  },
  cancelButton: {
    backgroundColor: '#FEF2F2',
    borderWidth: 1,
    borderColor: '#FCA5A5',
  },
  cancelButtonText: {
    fontSize: 14,
    fontFamily: 'Inter-SemiBold',
    color: '#DC2626',
  },
});