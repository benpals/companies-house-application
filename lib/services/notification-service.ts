/**
 * Notification Service
 * Manages local push notifications for deadline alerts
 */

import * as Notifications from "expo-notifications";
import type { TimeIntervalTriggerInput, NotificationTriggerInput } from "expo-notifications";
import { Deadline } from "@/lib/types";
import { formatDeadlineType } from "@/lib/deadline-calculator";

// Configure notification handler
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: true,
    shouldShowBanner: true,
    shouldShowList: true,
  }),
});

export class NotificationService {
  /**
   * Request notification permissions
   */
  static async requestPermissions(): Promise<boolean> {
    try {
      const { status } = await Notifications.requestPermissionsAsync();
      return status === "granted";
    } catch (error) {
      console.error("Error requesting notification permissions:", error);
      return false;
    }
  }

  /**
   * Schedule a notification for a deadline
   */
  static async scheduleDeadlineNotification(
    deadline: Deadline,
    daysBeforeDeadline: number
  ): Promise<string | null> {
    try {
      const deadlineDate = new Date(deadline.dueDate);
      const notificationDate = new Date(deadlineDate);
      notificationDate.setDate(notificationDate.getDate() - daysBeforeDeadline);

      // Don't schedule if the notification date is in the past
      if (notificationDate <= new Date()) {
        return null;
      }

      const deadlineType = formatDeadlineType(deadline.type);
      const message =
        daysBeforeDeadline === 7
          ? `Critical: ${deadlineType} due in ${daysBeforeDeadline} days for ${deadline.companyName}`
          : daysBeforeDeadline === 14
            ? `Urgent: ${deadlineType} due in ${daysBeforeDeadline} days for ${deadline.companyName}`
            : `${deadlineType} due in ${daysBeforeDeadline} days for ${deadline.companyName}`;

      const secondsUntilNotification = Math.floor(
        (notificationDate.getTime() - Date.now()) / 1000
      );

      const notificationId = await Notifications.scheduleNotificationAsync({
        content: {
          title: "Companies House Monitor",
          body: message,
          data: {
            companyId: deadline.companyId,
            deadlineType: deadline.type,
          },
        },
        trigger: {
          seconds: Math.max(secondsUntilNotification, 1),
        } as TimeIntervalTriggerInput,
      });

      return notificationId;
    } catch (error) {
      console.error("Error scheduling notification:", error);
      return null;
    }
  }

  /**
   * Schedule all notifications for a deadline
   */
  static async scheduleAllNotifications(
    deadline: Deadline,
    daysArray: number[]
  ): Promise<(string | null)[]> {
    const notificationIds: (string | null)[] = [];

    for (const days of daysArray) {
      const id = await this.scheduleDeadlineNotification(deadline, days);
      notificationIds.push(id);
    }

    return notificationIds;
  }

  /**
   * Cancel a scheduled notification
   */
  static async cancelNotification(notificationId: string): Promise<void> {
    try {
      await Notifications.cancelScheduledNotificationAsync(notificationId);
    } catch (error) {
      console.error("Error canceling notification:", error);
    }
  }

  /**
   * Cancel all scheduled notifications
   */
  static async cancelAllNotifications(): Promise<void> {
    try {
      await Notifications.cancelAllScheduledNotificationsAsync();
    } catch (error) {
      console.error("Error canceling all notifications:", error);
    }
  }

  /**
   * Get all scheduled notifications
   */
  static async getScheduledNotifications(): Promise<Notifications.NotificationRequest[]> {
    try {
      return await Notifications.getAllScheduledNotificationsAsync();
    } catch (error) {
      console.error("Error getting scheduled notifications:", error);
      return [];
    }
  }

  /**
   * Setup notification listener
   */
  static setupNotificationListener(
    onNotificationReceived: (notification: Notifications.Notification) => void
  ): () => void {
    const subscription = Notifications.addNotificationReceivedListener((notification) => {
      onNotificationReceived(notification);
    });

    return () => {
      subscription.remove();
    };
  }
}
