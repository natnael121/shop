import React, { useState, useEffect } from 'react';
import { 
  Save, 
  Upload, 
  X, 
  Building, 
  Phone, 
  Mail, 
  MapPin, 
  Globe, 
  Palette, 
  DollarSign,
  Clock,
  Users,
  Shield,
  Bell,
  TestTube,
  ExternalLink,
  Camera,
  Check
} from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';
import { firebaseService } from '../../services/firebase';
import { telegramService } from '../../services/telegram';
import { imgbbService } from '../../services/imgbb';
import { User } from '../../types';

export const Settings: React.FC = () => {
  const { user } = useAuth();
  const [formData, setFormData] = useState<Partial<User>>({});
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [activeTab, setActiveTab] = useState<'general' | 'business' | 'telegram' | 'appearance'>('general');
  const [logoFile, setLogoFile] = useState<File | null>(null);
  const [logoPreview, setLogoPreview] = useState<string>('');

  useEffect(() => {
    if (user) {
      setFormData(user);
      setLogoPreview(user.logo || '');
    }
  }, [user]);

  const handleInputChange = (field: string, value: any) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleNestedInputChange = (parent: string, field: string, value: any) => {
    setFormData(prev => ({
      ...prev,
      [parent]: {
        ...prev[parent as keyof User],
        [field]: value
      }
    }));
  };

  const handleLogoChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setLogoFile(file);
    setUploading(true);

    try {
      const url = await imgbbService.uploadImage(file, `${user?.id}_logo_${Date.now()}`);
      setLogoPreview(url);
      setFormData(prev => ({ ...prev, logo: url }));
    } catch (error) {
      console.error('Error uploading logo:', error);
      alert('Failed to upload logo');
    } finally {
      setUploading(false);
    }
  };

  const handleSave = async () => {
    if (!user) return;
    
    setLoading(true);
    try {
      await firebaseService.updateUserProfile(user.id, formData);
      alert('Settings saved successfully!');
    } catch (error) {
      console.error('Error saving settings:', error);
      alert('Failed to save settings');
    } finally {
      setLoading(false);
    }
  };

  const testTelegramConnection = async () => {
    try {
      const success = await telegramService.sendTestMessage(user?.telegramChatId || '-1003039447644');
      if (success) {
        alert('Test message sent successfully! Check your Telegram.');
      } else {
        alert('Failed to send test message. Please check your Telegram settings.');
      }
    } catch (error) {
      console.error('Error testing Telegram connection:', error);
      alert('Failed to send test message');
    }
  };

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Shop Settings</h1>
          <p className="text-gray-600">Manage your shop configuration and preferences</p>
        </div>
        <button
          onClick={handleSave}
          disabled={loading}
          className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors disabled:bg-gray-400 flex items-center space-x-2"
        >
          <Save className="w-4 h-4" />
          <span>{loading ? 'Saving...' : 'Save Changes'}</span>
        </button>
      </div>

      {/* Tab Navigation */}
      <div className="border-b border-gray-200">
        <nav className="-mb-px flex space-x-8">
          {[
            { id: 'general', label: 'General', icon: Building },
            { id: 'business', label: 'Business Info', icon: MapPin },
            { id: 'telegram', label: 'Telegram', icon: Bell },
            { id: 'appearance', label: 'Appearance', icon: Palette },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`flex items-center space-x-2 py-2 px-1 border-b-2 font-medium text-sm ${
                activeTab === tab.id
                  ? 'border-green-500 text-green-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              <tab.icon className="w-4 h-4" />
              <span>{tab.label}</span>
            </button>
          ))}
        </nav>
      </div>

      {/* General Tab */}
      {activeTab === 'general' && (
        <div className="space-y-6">
          <div className="bg-white rounded-lg shadow-sm border p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Basic Information</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Shop Owner Name
                </label>
                <input
                  type="text"
                  value={formData.name || ''}
                  onChange={(e) => handleInputChange('name', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  placeholder="Enter your full name"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Shop Name
                </label>
                <input
                  type="text"
                  value={formData.businessName || ''}
                  onChange={(e) => handleInputChange('businessName', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  placeholder="Enter your shop name"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Email Address
                </label>
                <input
                  type="email"
                  value={formData.email || ''}
                  onChange={(e) => handleInputChange('email', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent bg-gray-50"
                  disabled
                />
                <p className="text-xs text-gray-500 mt-1">Email cannot be changed</p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Phone Number
                </label>
                <input
                  type="tel"
                  value={formData.phone || ''}
                  onChange={(e) => handleInputChange('phone', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  placeholder="Enter your phone number"
                />
              </div>

              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Shop Address
                </label>
                <textarea
                  value={formData.address || ''}
                  onChange={(e) => handleInputChange('address', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  rows={3}
                  placeholder="Enter your shop address"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Number of Service Areas
                </label>
                <input
                  type="number"
                  min="1"
                  max="100"
                  value={formData.numberOfTables || 10}
                  onChange={(e) => handleInputChange('numberOfTables', parseInt(e.target.value) || 10)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                />
                <p className="text-xs text-gray-500 mt-1">Number of service areas/counters in your shop</p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Currency
                </label>
                <select
                  value={formData.settings?.currency || 'USD'}
                  onChange={(e) => handleNestedInputChange('settings', 'currency', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                >
                  <option value="USD">USD ($)</option>
                  <option value="EUR">EUR (€)</option>
                  <option value="GBP">GBP (£)</option>
                  <option value="ETB">ETB (Br)</option>
                </select>
              </div>
            </div>
          </div>

          {/* Logo Upload */}
          <div className="bg-white rounded-lg shadow-sm border p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Shop Logo</h2>
            
            <div className="flex items-center space-x-6">
              <div className="w-24 h-24 bg-gray-100 rounded-lg flex items-center justify-center overflow-hidden">
                {logoPreview ? (
                  <img 
                    src={logoPreview} 
                    alt="Shop logo"
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <Building className="w-8 h-8 text-gray-400" />
                )}
              </div>
              
              <div className="flex-1">
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleLogoChange}
                  className="hidden"
                  id="logo-upload"
                />
                <label
                  htmlFor="logo-upload"
                  className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors cursor-pointer flex items-center space-x-2 inline-flex"
                >
                  <Upload className="w-4 h-4" />
                  <span>{uploading ? 'Uploading...' : 'Upload Logo'}</span>
                </label>
                <p className="text-xs text-gray-500 mt-2">
                  Recommended: 200x200px, PNG or JPG, max 5MB
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Business Info Tab */}
      {activeTab === 'business' && (
        <div className="space-y-6">
          <div className="bg-white rounded-lg shadow-sm border p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">About Your Shop</h2>
            
            <div className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Shop Description
                </label>
                <textarea
                  value={formData.aboutUs?.description || ''}
                  onChange={(e) => handleNestedInputChange('aboutUs', 'description', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  rows={4}
                  placeholder="Tell customers about your shop, products, and services..."
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Business Phone
                  </label>
                  <input
                    type="tel"
                    value={formData.aboutUs?.phone || ''}
                    onChange={(e) => handleNestedInputChange('aboutUs', 'phone', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                    placeholder="Business phone number"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Business Email
                  </label>
                  <input
                    type="email"
                    value={formData.aboutUs?.email || ''}
                    onChange={(e) => handleNestedInputChange('aboutUs', 'email', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                    placeholder="Business email address"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Website
                  </label>
                  <input
                    type="url"
                    value={formData.aboutUs?.website || ''}
                    onChange={(e) => handleNestedInputChange('aboutUs', 'website', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                    placeholder="https://yourshop.com"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Business Address
                  </label>
                  <input
                    type="text"
                    value={formData.aboutUs?.address || ''}
                    onChange={(e) => handleNestedInputChange('aboutUs', 'address', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                    placeholder="Shop address for customers"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Operating Hours */}
          <div className="bg-white rounded-lg shadow-sm border p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Operating Hours</h2>
            
            <div className="space-y-4">
              {[
                { key: 'monday', label: 'Monday' },
                { key: 'tuesday', label: 'Tuesday' },
                { key: 'wednesday', label: 'Wednesday' },
                { key: 'thursday', label: 'Thursday' },
                { key: 'friday', label: 'Friday' },
                { key: 'saturday', label: 'Saturday' },
                { key: 'sunday', label: 'Sunday' },
              ].map((day) => (
                <div key={day.key} className="flex items-center space-x-4">
                  <div className="w-20 text-sm font-medium text-gray-700">
                    {day.label}
                  </div>
                  <input
                    type="text"
                    value={formData.aboutUs?.operatingHours?.[day.key] || ''}
                    onChange={(e) => {
                      const currentHours = formData.aboutUs?.operatingHours || {};
                      handleNestedInputChange('aboutUs', 'operatingHours', {
                        ...currentHours,
                        [day.key]: e.target.value
                      });
                    }}
                    className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                    placeholder="e.g., 9:00 AM - 6:00 PM or Closed"
                  />
                </div>
              ))}
            </div>
          </div>

          {/* Social Media */}
          <div className="bg-white rounded-lg shadow-sm border p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Social Media</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {[
                { key: 'facebook', label: 'Facebook', placeholder: 'https://facebook.com/yourshop' },
                { key: 'instagram', label: 'Instagram', placeholder: 'https://instagram.com/yourshop' },
                { key: 'twitter', label: 'Twitter', placeholder: 'https://twitter.com/yourshop' },
                { key: 'tiktok', label: 'TikTok', placeholder: 'https://tiktok.com/@yourshop' },
                { key: 'youtube', label: 'YouTube', placeholder: 'https://youtube.com/yourshop' },
                { key: 'whatsapp', label: 'WhatsApp', placeholder: '+1234567890' },
              ].map((social) => (
                <div key={social.key}>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    {social.label}
                  </label>
                  <input
                    type="text"
                    value={formData.aboutUs?.socialMedia?.[social.key] || ''}
                    onChange={(e) => {
                      const currentSocial = formData.aboutUs?.socialMedia || {};
                      handleNestedInputChange('aboutUs', 'socialMedia', {
                        ...currentSocial,
                        [social.key]: e.target.value
                      });
                    }}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                    placeholder={social.placeholder}
                  />
                </div>
              ))}
            </div>
          </div>

          {/* Shop Features */}
          <div className="bg-white rounded-lg shadow-sm border p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Shop Features</h2>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Features (one per line)
              </label>
              <textarea
                value={formData.aboutUs?.features?.join('\n') || ''}
                onChange={(e) => {
                  const features = e.target.value.split('\n').filter(f => f.trim());
                  handleNestedInputChange('aboutUs', 'features', features);
                }}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                rows={4}
                placeholder="Quality Products&#10;Fast Service&#10;Competitive Prices&#10;Customer Support"
              />
              <p className="text-xs text-gray-500 mt-1">Enter each feature on a new line</p>
            </div>
          </div>

          {/* Special Message */}
          <div className="bg-white rounded-lg shadow-sm border p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Special Message</h2>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Welcome Message for Customers
              </label>
              <textarea
                value={formData.aboutUs?.specialMessage || ''}
                onChange={(e) => handleNestedInputChange('aboutUs', 'specialMessage', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                rows={3}
                placeholder="Thank you for choosing our shop! We hope you find exactly what you're looking for."
              />
            </div>
          </div>
        </div>
      )}

      {/* Business Info Tab */}
      {activeTab === 'business' && (
        <div className="space-y-6">
          <div className="bg-white rounded-lg shadow-sm border p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Business Configuration</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Default Language
                </label>
                <select
                  value={formData.settings?.language || 'en'}
                  onChange={(e) => handleNestedInputChange('settings', 'language', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                >
                  <option value="en">English</option>
                  <option value="am">አማርኛ (Amharic)</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Theme
                </label>
                <select
                  value={formData.settings?.theme || 'light'}
                  onChange={(e) => handleNestedInputChange('settings', 'theme', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                >
                  <option value="light">Light</option>
                  <option value="dark">Dark</option>
                  <option value="auto">Auto</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Product Catalog Theme
                </label>
                <select
                  value={formData.settings?.menuTheme || 'modern'}
                  onChange={(e) => handleNestedInputChange('settings', 'menuTheme', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                >
                  <option value="classic">Classic</option>
                  <option value="modern">Modern</option>
                  <option value="elegant">Elegant</option>
                  <option value="minimal">Minimal</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Subscription Plan
                </label>
                <div className="flex items-center space-x-3">
                  <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                    formData.subscription === 'premium' 
                      ? 'bg-green-100 text-green-800' 
                      : 'bg-gray-100 text-gray-800'
                  }`}>
                    {formData.subscription === 'premium' ? 'Premium' : 'Free'}
                  </span>
                  {formData.subscription !== 'premium' && (
                    <button className="text-blue-600 hover:text-blue-700 text-sm font-medium">
                      Upgrade to Premium
                    </button>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Notifications */}
          <div className="bg-white rounded-lg shadow-sm border p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Notification Preferences</h2>
            
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-base font-medium text-gray-900">Enable Notifications</h3>
                  <p className="text-sm text-gray-600">Receive browser notifications for orders and payments</p>
                </div>
                <button
                  onClick={() => handleNestedInputChange('settings', 'notifications', !formData.settings?.notifications)}
                  className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                    formData.settings?.notifications ? 'bg-green-600' : 'bg-gray-200'
                  }`}
                >
                  <span
                    className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                      formData.settings?.notifications ? 'translate-x-6' : 'translate-x-1'
                    }`}
                  />
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Telegram Tab */}
      {activeTab === 'telegram' && (
        <div className="space-y-6">
          <div className="bg-white rounded-lg shadow-sm border p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-gray-900">Telegram Integration</h2>
              <button
                onClick={testTelegramConnection}
                className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors flex items-center space-x-2"
              >
                <TestTube className="w-4 h-4" />
                <span>Test Connection</span>
              </button>
            </div>
            
            <div className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Main Telegram Chat ID
                </label>
                <input
                  type="text"
                  value={formData.telegramChatId || ''}
                  onChange={(e) => handleInputChange('telegramChatId', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  placeholder="-1003039447644"
                />
                <p className="text-xs text-gray-500 mt-1">
                  Main chat for receiving general notifications
                </p>
              </div>

              <div className="bg-blue-50 p-4 rounded-lg">
                <h4 className="font-medium text-blue-900 mb-2">How to get Telegram Chat ID:</h4>
                <ol className="text-sm text-blue-800 space-y-1 list-decimal list-inside">
                  <li>Create a Telegram group for your shop</li>
                  <li>Add @userinfobot to the group</li>
                  <li>Send /start command in the group</li>
                  <li>Copy the Chat ID (starts with minus sign)</li>
                  <li>Remove the bot from the group</li>
                </ol>
              </div>

              <div className="bg-green-50 p-4 rounded-lg">
                <h4 className="font-medium text-green-900 mb-2">Current Telegram Groups:</h4>
                <div className="text-sm text-green-800 space-y-1">
                  <div>• Shop Admin: -1003039447644 (Reports & admin notifications)</div>
                  <div>• Cashier: -1003056784484 (Payments & order approvals)</div>
                  <div>• Delivery: -1003074405493 (Shipping & delivery orders)</div>
                </div>
              </div>
            </div>
          </div>

          {/* Bot Configuration */}
          <div className="bg-white rounded-lg shadow-sm border p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Bot Configuration</h2>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Telegram Bot Username
                </label>
                <input
                  type="text"
                  value={formData.settings?.telegramBotUsername || ''}
                  onChange={(e) => handleNestedInputChange('settings', 'telegramBotUsername', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  placeholder="@yourshopbot"
                />
                <p className="text-xs text-gray-500 mt-1">
                  Bot username for customer login (without @)
                </p>
              </div>

              <div className="bg-yellow-50 p-4 rounded-lg">
                <h4 className="font-medium text-yellow-900 mb-2">Current Bot Token:</h4>
                <div className="text-sm text-yellow-800 font-mono">
                  7141155447:AAGU2K74kX3ICzSIPB566tly3LUDo423JrU
                </div>
                <p className="text-xs text-yellow-700 mt-1">
                  Bot token is configured in the system. Contact support to change.
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Appearance Tab */}
      {activeTab === 'appearance' && (
        <div className="space-y-6">
          <div className="bg-white rounded-lg shadow-sm border p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Shop Appearance</h2>
            
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Primary Color
                  </label>
                  <div className="flex items-center space-x-3">
                    <input
                      type="color"
                      value="#16a34a"
                      className="w-12 h-10 border border-gray-300 rounded cursor-pointer"
                    />
                    <input
                      type="text"
                      value="#16a34a"
                      className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                      placeholder="#16a34a"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Secondary Color
                  </label>
                  <div className="flex items-center space-x-3">
                    <input
                      type="color"
                      value="#eab308"
                      className="w-12 h-10 border border-gray-300 rounded cursor-pointer"
                    />
                    <input
                      type="text"
                      value="#eab308"
                      className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                      placeholder="#eab308"
                    />
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Customer Catalog Theme
                </label>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {[
                    { id: 'classic', name: 'Classic', description: 'Traditional shop layout with clean design' },
                    { id: 'modern', name: 'Modern', description: 'Contemporary design with bold colors and images' },
                    { id: 'elegant', name: 'Elegant', description: 'Sophisticated layout for premium shops' },
                    { id: 'minimal', name: 'Minimal', description: 'Clean, simple design with focus on products' },
                  ].map((theme) => (
                    <div
                      key={theme.id}
                      className={`border-2 rounded-lg p-4 cursor-pointer transition-all ${
                        formData.settings?.menuTheme === theme.id
                          ? 'border-green-500 bg-green-50'
                          : 'border-gray-200 hover:border-gray-300'
                      }`}
                      onClick={() => handleNestedInputChange('settings', 'menuTheme', theme.id)}
                    >
                      <div className="flex items-center justify-between mb-2">
                        <h4 className="font-semibold text-gray-900">{theme.name}</h4>
                        <div className={`w-4 h-4 rounded-full border-2 ${
                          formData.settings?.menuTheme === theme.id
                            ? 'border-green-500 bg-green-500'
                            : 'border-gray-300'
                        }`}>
                          {formData.settings?.menuTheme === theme.id && (
                            <Check className="w-2 h-2 text-white m-0.5" />
                          )}
                        </div>
                      </div>
                      <p className="text-sm text-gray-600">{theme.description}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Logo Preview */}
          <div className="bg-white rounded-lg shadow-sm border p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Logo Preview</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h3 className="text-sm font-medium text-gray-700 mb-2">Current Logo</h3>
                <div className="w-32 h-32 bg-gray-100 rounded-lg flex items-center justify-center overflow-hidden">
                  {logoPreview ? (
                    <img 
                      src={logoPreview} 
                      alt="Shop logo"
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="text-center">
                      <Building className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                      <span className="text-xs text-gray-500">No logo</span>
                    </div>
                  )}
                </div>
              </div>

              <div>
                <h3 className="text-sm font-medium text-gray-700 mb-2">Logo Guidelines</h3>
                <ul className="text-sm text-gray-600 space-y-1">
                  <li>• Recommended size: 200x200px</li>
                  <li>• Format: PNG or JPG</li>
                  <li>• Max file size: 5MB</li>
                  <li>• Square aspect ratio works best</li>
                  <li>• High contrast for visibility</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Save Button (Fixed at bottom) */}
      <div className="fixed bottom-6 right-6 z-10">
        <button
          onClick={handleSave}
          disabled={loading}
          className="bg-green-600 text-white px-6 py-3 rounded-full shadow-lg hover:bg-green-700 transition-colors disabled:bg-gray-400 flex items-center space-x-2"
        >
          <Save className="w-5 h-5" />
          <span>{loading ? 'Saving...' : 'Save All Changes'}</span>
        </button>
      </div>
    </div>
  );
};