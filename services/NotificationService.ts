import * as Notifications from 'expo-notifications';
import { Platform } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

const NOTIFICATION_PERMISSION_KEY = '@focusmind_notification_permission';
const STREAK_REMINDER_ID = 'streak-reminder';

// Configure notification behavior
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
    shouldShowBanner: true,
    shouldShowList: true,
  } as Notifications.NotificationBehavior),
});

export class NotificationService {
  static async requestPermissions(): Promise<boolean> {
    const { status: existingStatus } = await Notifications.getPermissionsAsync();
    let finalStatus = existingStatus;

    if (existingStatus !== 'granted') {
      const { status } = await Notifications.requestPermissionsAsync();
      finalStatus = status;
    }

    const granted = finalStatus === 'granted';
    await AsyncStorage.setItem(NOTIFICATION_PERMISSION_KEY, granted.toString());
    
    return granted;
  }

  static async hasPermission(): Promise<boolean> {
    const saved = await AsyncStorage.getItem(NOTIFICATION_PERMISSION_KEY);
    if (saved) return saved === 'true';
    
    const { status } = await Notifications.getPermissionsAsync();
    return status === 'granted';
  }

  static async scheduleStreakReminder(hour: number = 21, minute: number = 0): Promise<string | null> {
    const hasPermission = await this.hasPermission();
    if (!hasPermission) return null;

    // Cancel existing reminder
    await this.cancelStreakReminder();

    const trigger: Notifications.CalendarTriggerInput = {
      type: Notifications.SchedulableTriggerInputTypes.CALENDAR,
      hour,
      minute,
      repeats: true,
    };

    const identifier = await Notifications.scheduleNotificationAsync({
      content: {
        title: '🔥 Streak Alert!',
        body: "You haven't focused today. Complete a session to keep your streak alive!",
        data: { type: 'streak_reminder', screen: '/focus' },
        sound: 'default',
      },
      trigger,
      identifier: STREAK_REMINDER_ID,
    });

    return identifier;
  }

  static async cancelStreakReminder(): Promise<void> {
    await Notifications.cancelScheduledNotificationAsync(STREAK_REMINDER_ID);
  }

  static async scheduleWeeklySummary(day: number = 0, hour: number = 10, minute: number = 0): Promise<string | null> {
    const hasPermission = await this.hasPermission();
    if (!hasPermission) return null;

    const identifier = await Notifications.scheduleNotificationAsync({
      content: {
        title: '📊 Your Weekly Focus Summary',
        body: 'See how many hours you focused this week!',
        data: { type: 'weekly_summary', screen: '/stats' },
        sound: 'default',
      },
      trigger: {
        type: Notifications.SchedulableTriggerInputTypes.CALENDAR,
        weekday: day, // 0 = Sunday
        hour,
        minute,
        repeats: true,
      },
    });

    return identifier;
  }

  static async sendImmediateNotification(title: string, body: string, data?: Record<string, unknown>): Promise<string | null> {
    const hasPermission = await this.hasPermission();
    if (!hasPermission) return null;

    const identifier = await Notifications.scheduleNotificationAsync({
      content: {
        title,
        body,
        data: data || {},
        sound: 'default',
      },
      trigger: null, // Immediate
    });

    return identifier;
  }

  static async cancelAllNotifications(): Promise<void> {
    await Notifications.cancelAllScheduledNotificationsAsync();
  }

  static async getScheduledNotifications(): Promise<Notifications.NotificationRequest[]> {
    return await Notifications.getAllScheduledNotificationsAsync();
  }

  // Add notification response listener
  static addNotificationResponseListener(callback: (response: Notifications.NotificationResponse) => void) {
    return Notifications.addNotificationResponseReceivedListener(callback);
  }

  // Add notification received listener
  static addNotificationReceivedListener(callback: (notification: Notifications.Notification) => void) {
    return Notifications.addNotificationReceivedListener(callback);
  }
}
