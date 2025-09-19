import React, { useState, useEffect } from 'react';
import { Bell, BellOff, Save, Shield, Check, X } from 'lucide-react';
import { notificationSystemService } from '../services/notificationSystem';
import { CustomerNotificationPreferences } from '../types/notifications';

interface CustomerNotificationSettingsProps {
  tableNumber: string;
  userId?: string;
  language: 'en' | 'am';
}

export const CustomerNotificationSettings: React.FC<CustomerNotificationSettingsProps> = ({
  tableNumber,
  userId,
  language
}) => {
  const [preferences, setPreferences] = useState<CustomerNotificationPreferences | null>(null);
  const [settings, setSettings] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [showConsentModal, setShowConsentModal] = useState(false);

  useEffect(() => {
    if (userId) {
      loadData();
    }
  }, [userId, tableNumber]);

  const loadData = async () => {
    if (!userId) return;
    
    try {
      setLoading(true);
      const [prefsData, settingsData] = await Promise.all([
        notificationSystemService.getCustomerPreferences(userId, tableNumber, getSessionId()),
        notificationSystemService.getNotificationSettings(userId)
      ]);
      
      setPreferences(prefsData);
      setSettings(settingsData);
      
      // Show consent modal if required and not given
      if (settingsData?.requireConsent && (!prefsData || !prefsData.consentGiven)) {
        setShowConsentModal(true);
      }
    } catch (error) {
      console.error('Error loading notification data:', error);
    } finally {
      setLoading(false);
    }
  };

  const getSessionId = () => {
    // Get session ID from localStorage or generate one
    let sessionId = localStorage.getItem('customerSessionId');
    if (!sessionId) {
      sessionId = `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      localStorage.setItem('customerSessionId', sessionId);
    }
    return sessionId;
  };

  const handleConsentResponse = async (granted: boolean) => {
    if (!userId) return;
    
    setSaving(true);
    try {
      const preferencesData: Omit<CustomerNotificationPreferences, 'id'> = {
        tableNumber,
        userId,
        sessionId: getSessionId(),
        notificationsEnabled: granted,
        consentGiven: granted,
        consentTimestamp: new Date().toISOString(),
        preferences: settings?.defaultPreferences || {
          orderUpdates: true,
          promotions: false,
          generalInfo: true,
          emergencyAlerts: true,
        },
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };

      await notificationSystemService.updateCustomerPreferences(preferencesData);
      await loadData();
      setShowConsentModal(false);
      
      if (granted) {
        // Request browser notification permission
        if ('Notification' in window) {
          await Notification.requestPermission();
        }
      }
    } catch (error) {
      console.error('Error saving consent:', error);
      alert('Failed to save preferences');
    } finally {
      setSaving(false);
    }
  };

  const handlePreferenceUpdate = async (preferenceKey: string, value: boolean) => {
    if (!preferences || !userId) return;
    
    setSaving(true);
    try {
      const updatedPreferences = {
        ...preferences,
        preferences: {
          ...preferences.preferences,
          [preferenceKey]: value
        },
        updated_at: new Date().toISOString(),
      };

      await notificationSystemService.updateCustomerPreferences(updatedPreferences);
      setPreferences(updatedPreferences);
    } catch (error) {
      console.error('Error updating preferences:', error);
      alert('Failed to update preferences');
    } finally {
      setSaving(false);
    }
  };

  const handleToggleNotifications = async () => {
    if (!preferences || !userId) return;
    
    setSaving(true);
    try {
      const updatedPreferences = {
        ...preferences,
        notificationsEnabled: !preferences.notificationsEnabled,
        updated_at: new Date().toISOString(),
      };

      await notificationSystemService.updateCustomerPreferences(updatedPreferences);
      setPreferences(updatedPreferences);
      
      if (updatedPreferences.notificationsEnabled && 'Notification' in window) {
        await Notification.requestPermission();
      }
    } catch (error) {
      console.error('Error toggling notifications:', error);
      alert('Failed to update notification settings');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="animate-pulse">
        <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
        <div className="h-3 bg-gray-200 rounded w-1/2"></div>
      </div>
    );
  }

  return (
    <div>
      <label className="flex items-center text-gray-700 font-medium mb-3">
        {preferences?.notificationsEnabled ? (
          <Bell className="w-5 h-5 mr-2 text-green-600" />
        ) : (
          <BellOff className="w-5 h-5 mr-2 text-gray-400" />
        )}
        {language === 'en' ? 'Shop Notifications' : 'የሱቅ ማሳወቂያዎች'}
      </label>
      
      {preferences && (
        <div className="space-y-3">
          <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
            <div>
              <p className="text-sm font-medium text-gray-900">
                {language === 'en' ? 'Enable Notifications' : 'ማሳወቂያዎችን አንቃ'}
              </p>
              <p className="text-xs text-gray-600">
                {language === 'en' 
                  ? 'Receive updates about your orders and shop announcements'
                  : 'ስለ ትዕዛዝዎ እና የሱቅ ማስታወቂያዎች ዝማኔ ይቀበሉ'
                }
              </p>
            </div>
            <button
              onClick={handleToggleNotifications}
              disabled={saving}
              className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                preferences.notificationsEnabled ? 'bg-green-600' : 'bg-gray-200'
              }`}
            >
              <span
                className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                  preferences.notificationsEnabled ? 'translate-x-6' : 'translate-x-1'
                }`}
              />
            </button>
          </div>
          
          {preferences.notificationsEnabled && (
            <div className="space-y-2">
              {[
                { 
                  key: 'orderUpdates', 
                  label: language === 'en' ? 'Order Updates' : 'የትዕዛዝ ዝማኔዎች',
                  description: language === 'en' ? 'Order status and processing updates' : 'የትዕዛዝ ሁኔታ እና ሂደት ዝማኔዎች'
                },
                { 
                  key: 'promotions', 
                  label: language === 'en' ? 'Promotions' : 'ማስታወቂያዎች',
                  description: language === 'en' ? 'Special offers and discounts' : 'ልዩ ቅናሾች እና ቅናሾች'
                },
                { 
                  key: 'generalInfo', 
                  label: language === 'en' ? 'Shop Updates' : 'የሱቅ ዝማኔዎች',
                  description: language === 'en' ? 'Shop announcements and information' : 'የሱቅ ማስታወቂያዎች እና መረጃ'
                },
              ].map((pref) => (
                <div key={pref.key} className="flex items-center justify-between p-2 bg-white rounded border">
                  <div>
                    <p className="text-sm font-medium text-gray-900">{pref.label}</p>
                    <p className="text-xs text-gray-500">{pref.description}</p>
                  </div>
                  <button
                    onClick={() => handlePreferenceUpdate(pref.key, !preferences.preferences[pref.key as keyof typeof preferences.preferences])}
                    disabled={saving}
                    className={`relative inline-flex h-5 w-9 items-center rounded-full transition-colors ${
                      preferences.preferences[pref.key as keyof typeof preferences.preferences] ? 'bg-green-600' : 'bg-gray-200'
                    }`}
                  >
                    <span
                      className={`inline-block h-3 w-3 transform rounded-full bg-white transition-transform ${
                        preferences.preferences[pref.key as keyof typeof preferences.preferences] ? 'translate-x-5' : 'translate-x-1'
                      }`}
                    />
                  </button>
                </div>
              ))}
            </div>
          )}
          
          {preferences.consentGiven && (
            <div className="bg-green-50 p-3 rounded-lg">
              <div className="flex items-center space-x-2">
                <Shield className="w-4 h-4 text-green-600" />
                <p className="text-xs text-green-800">
                  {language === 'en' 
                    ? 'Your notification preferences are saved and will be respected.'
                    : 'የእርስዎ የማሳወቂያ ምርጫዎች ተቀምጠዋል እና ይከበራሉ።'
                  }
                </p>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Consent Modal */}
      {showConsentModal && settings && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl p-6 max-w-md w-full">
            <div className="text-center mb-6">
              <Bell className="w-12 h-12 text-blue-600 mx-auto mb-4" />
              <h2 className="text-xl font-bold text-gray-900 mb-2">
                {language === 'en' ? 'Shop Notifications' : 'የሱቅ ማሳወቂያዎች'}
              </h2>
              <p className="text-gray-600 text-sm">
                {settings.consentMessage || (language === 'en' 
                  ? 'Would you like to receive notifications about your orders and shop updates?'
                  : 'ስለ ትዕዛዝዎ እና የሱቅ ዝማኔዎች ማሳወቂያ መቀበል ይፈልጋሉ?'
                )}
              </p>
            </div>

            <div className="space-y-3 mb-6">
              <div className="bg-blue-50 p-3 rounded-lg">
                <h4 className="font-medium text-blue-900 mb-2">
                  {language === 'en' ? 'You\'ll receive notifications for:' : 'ማሳወቂያ የሚቀበሉት:'}
                </h4>
                <ul className="text-sm text-blue-800 space-y-1">
                  <li>• {language === 'en' ? 'Order status updates' : 'የትዕዛዝ ሁኔታ ዝማኔዎች'}</li>
                  <li>• {language === 'en' ? 'Payment confirmations' : 'የክፍያ ማረጋገጫዎች'}</li>
                  <li>• {language === 'en' ? 'Staff responses' : 'የሰራተኛ ምላሾች'}</li>
                  <li>• {language === 'en' ? 'Important shop announcements' : 'አስፈላጊ የሱቅ ማስታወቂያዎች'}</li>
                </ul>
              </div>

              {settings.privacyPolicy && (
                <div className="bg-gray-50 p-3 rounded-lg">
                  <h4 className="font-medium text-gray-900 mb-1">
                    {language === 'en' ? 'Privacy Policy' : 'የግላዊነት ፖሊሲ'}
                  </h4>
                  <p className="text-xs text-gray-600">{settings.privacyPolicy}</p>
                </div>
              )}
            </div>

            <div className="flex space-x-3">
              <button
                onClick={() => handleConsentResponse(false)}
                disabled={saving}
                className="flex-1 bg-gray-200 text-gray-800 py-3 rounded-lg hover:bg-gray-300 transition-colors disabled:bg-gray-100 flex items-center justify-center space-x-2"
              >
                <X className="w-4 h-4" />
                <span>{language === 'en' ? 'No Thanks' : 'አይ አመሰግናለሁ'}</span>
              </button>
              <button
                onClick={() => handleConsentResponse(true)}
                disabled={saving}
                className="flex-1 bg-green-600 text-white py-3 rounded-lg hover:bg-green-700 transition-colors disabled:bg-gray-400 flex items-center justify-center space-x-2"
              >
                <Check className="w-4 h-4" />
                <span>{language === 'en' ? 'Allow' : 'ፍቀድ'}</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};