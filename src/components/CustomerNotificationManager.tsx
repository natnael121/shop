import React, { useEffect } from 'react';
import { notificationSystemService } from '../services/notificationSystem';
import { customerNotificationService } from '../services/customerNotifications';

interface CustomerNotificationManagerProps {
  userId: string;
  tableNumber: string;
  sessionId: string;
  language: 'en' | 'am';
}

export const CustomerNotificationManager: React.FC<CustomerNotificationManagerProps> = ({
  userId,
  tableNumber,
  sessionId,
  language
}) => {
  useEffect(() => {
    if (!userId || !tableNumber) return;

    // Listen for live notifications from the shop
    const unsubscribe = notificationSystemService.listenToLiveNotifications(
      userId,
      tableNumber,
      async (notification) => {
        // Check if customer has consented to notifications
        const preferences = await notificationSystemService.getCustomerPreferences(
          userId, 
          tableNumber, 
          sessionId
        );
        
        if (!preferences?.notificationsEnabled || !preferences?.consentGiven) {
          return; // Don't show notifications if not consented
        }

        // Check notification type preferences
        const typeAllowed = checkNotificationTypeAllowed(notification.type, preferences.preferences);
        if (!typeAllowed) {
          return; // Don't show this type of notification
        }

        // Show the notification
        await customerNotificationService.showNotification({
          title: notification.title,
          body: notification.message,
          icon: notification.imageUrl || '/icon-192.png',
          tag: `shop-notification-${notification.id}`,
          data: {
            type: 'shop_notification',
            notificationId: notification.id,
            userId,
            tableNumber,
            actionUrl: notification.actionUrl,
          },
          actions: notification.actionUrl ? [
            { action: 'view', title: notification.actionText || 'View' }
          ] : undefined
        });
      }
    );

    return unsubscribe;
  }, [userId, tableNumber, sessionId]);

  const checkNotificationTypeAllowed = (type: string, preferences: any): boolean => {
    switch (type) {
      case 'promotion':
        return preferences.promotions;
      case 'info':
        return preferences.generalInfo;
      case 'success':
      case 'warning':
        return preferences.orderUpdates;
      case 'error':
        return preferences.emergencyAlerts;
      default:
        return true;
    }
  };

  // This component doesn't render anything visible
  return null;
};