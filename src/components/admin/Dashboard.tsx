import React, { useState, useEffect } from 'react';
import { 
  ShoppingBag, 
  DollarSign, 
  Users, 
  TrendingUp, 
  Clock, 
  AlertTriangle,
  CheckCircle,
  Package,
  Truck,
  CreditCard,
  Eye,
  QrCode,
  FileText,
  Bell,
  Settings
} from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { useAuth } from '../../hooks/useAuth';
import { firebaseService } from '../../services/firebase';
import { telegramService } from '../../services/telegram';
import { QRCodeGenerator } from '../QRCodeGenerator';
import { TableTentPDFGenerator } from '../TableTentPDFGenerator';
import { Order, PendingOrder, PaymentConfirmation, WaiterCall, MenuItem, Category } from '../../types';
import { format } from 'date-fns';

export const Dashboard: React.FC = () => {
  const { user } = useAuth();
  const [pendingOrders, setPendingOrders] = useState<PendingOrder[]>([]);
  const [paymentConfirmations, setPaymentConfirmations] = useState<PaymentConfirmation[]>([]);
  const [waiterCalls, setWaiterCalls] = useState<WaiterCall[]>([]);
  const [recentOrders, setRecentOrders] = useState<Order[]>([]);
  const [menuItems, setMenuItems] = useState<MenuItem[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [showQRGenerator, setShowQRGenerator] = useState(false);
  const [showPDFGenerator, setShowPDFGenerator] = useState(false);
  const [stats, setStats] = useState({
    todayOrders: 0,
    todayRevenue: 0,
    pendingCount: 0,
    activeAreas: 0,
  });

  useEffect(() => {
    if (user) {
      loadDashboardData();
      setupRealtimeListeners();
    }
  }, [user]);

  const loadDashboardData = async () => {
    if (!user) return;
    
    try {
      setLoading(true);
      const [pending, payments, calls, orders, items, cats] = await Promise.all([
        firebaseService.getPendingOrders(user.id),
        firebaseService.getPaymentConfirmations(user.id),
        firebaseService.getWaiterCalls(user.id),
        firebaseService.getOrders(user.id, 10),
        firebaseService.getMenuItems(user.id),
        firebaseService.getCategories(user.id)
      ]);
      
      setPendingOrders(pending);
      setPaymentConfirmations(payments);
      setWaiterCalls(calls.filter(call => call.status === 'pending'));
      setRecentOrders(orders);
      setMenuItems(items);
      setCategories(cats);
      
      // Calculate today's stats
      const today = new Date().toISOString().split('T')[0];
      const todayOrders = orders.filter(order => order.timestamp.startsWith(today));
      const todayRevenue = todayOrders.reduce((sum, order) => sum + order.totalAmount, 0);
      const activeAreas = new Set(orders.map(order => order.tableNumber)).size;
      
      setStats({
        todayOrders: todayOrders.length,
        todayRevenue,
        pendingCount: pending.length + payments.length + calls.filter(c => c.status === 'pending').length,
        activeAreas,
      });
    } catch (error) {
      console.error('Error loading dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  const setupRealtimeListeners = () => {
    if (!user) return;

    const unsubscribers: (() => void)[] = [];

    // Listen for pending orders
    const pendingListener = firebaseService.listenToPendingOrders(user.id, (orders) => {
      setPendingOrders(orders);
    });

    // Listen for payment confirmations
    const paymentsListener = firebaseService.listenToPaymentConfirmations(user.id, (confirmations) => {
      setPaymentConfirmations(confirmations);
    });

    // Listen for waiter calls
    const callsListener = firebaseService.listenToWaiterCalls(user.id, (calls) => {
      setWaiterCalls(calls.filter(call => call.status === 'pending'));
    });

    unsubscribers.push(pendingListener, paymentsListener, callsListener);

    return () => {
      unsubscribers.forEach(unsub => unsub());
    };
  };

  const handleApproveOrder = async (orderId: string) => {
    try {
      const pendingOrder = pendingOrders.find(order => order.id === orderId);
      if (!pendingOrder) return;

      await firebaseService.approvePendingOrder(orderId, pendingOrder);
      await loadDashboardData();
    } catch (error) {
      console.error('Error approving order:', error);
      alert('Failed to approve order');
    }
  };

  const handleRejectOrder = async (orderId: string) => {
    if (!confirm('Are you sure you want to reject this order?')) return;
    
    try {
      await firebaseService.rejectPendingOrder(orderId);
      await loadDashboardData();
    } catch (error) {
      console.error('Error rejecting order:', error);
      alert('Failed to reject order');
    }
  };

  const handleApprovePayment = async (confirmationId: string) => {
    try {
      const confirmation = paymentConfirmations.find(p => p.id === confirmationId);
      if (!confirmation) return;

      await firebaseService.updatePaymentConfirmation(confirmationId, 'approved');
      await firebaseService.markTableBillAsPaid(confirmation.userId, confirmation.tableNumber, confirmationId, confirmation.cafeId);
      await loadDashboardData();
    } catch (error) {
      console.error('Error approving payment:', error);
      alert('Failed to approve payment');
    }
  };

  const handleRejectPayment = async (confirmationId: string) => {
    if (!confirm('Are you sure you want to reject this payment?')) return;
    
    try {
      await firebaseService.updatePaymentConfirmation(confirmationId, 'rejected');
      await loadDashboardData();
    } catch (error) {
      console.error('Error rejecting payment:', error);
      alert('Failed to reject payment');
    }
  };

  const sendTestMessage = async () => {
    try {
      const success = await telegramService.sendTestMessage(user?.telegramChatId || '-1003039447644');
      if (success) {
        alert('Test message sent successfully! Check your Telegram.');
      } else {
        alert('Failed to send test message. Please check your Telegram settings.');
      }
    } catch (error) {
      console.error('Error sending test message:', error);
      alert('Failed to send test message');
    }
  };

  if (loading) {
    return (
      <div className="p-6">
        <div className="animate-pulse space-y-6">
          <div className="h-8 bg-gray-200 rounded w-1/4"></div>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="h-32 bg-gray-200 rounded-lg"></div>
            ))}
          </div>
          <div className="h-80 bg-gray-200 rounded-lg"></div>
        </div>
      </div>
    );
  }

  const chartData = Array.from({ length: 7 }, (_, i) => {
    const date = new Date();
    date.setDate(date.getDate() - (6 - i));
    return {
      date: format(date, 'MMM dd'),
      orders: Math.floor(Math.random() * 20) + 5,
      revenue: Math.floor(Math.random() * 500) + 100,
    };
  });

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Shop Dashboard</h1>
          <p className="text-gray-600">Welcome back, {user?.name}! Here's your shop overview.</p>
        </div>
        <div className="flex items-center space-x-3">
          <button
            onClick={() => setShowQRGenerator(true)}
            className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors flex items-center space-x-2"
          >
            <QrCode className="w-4 h-4" />
            <span>Generate QR Codes</span>
          </button>
          <button
            onClick={() => setShowPDFGenerator(true)}
            className="bg-purple-600 text-white px-4 py-2 rounded-lg hover:bg-purple-700 transition-colors flex items-center space-x-2"
          >
            <FileText className="w-4 h-4" />
            <span>Print Catalog</span>
          </button>
          <button
            onClick={sendTestMessage}
            className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors flex items-center space-x-2"
          >
            <Bell className="w-4 h-4" />
            <span>Test Telegram</span>
          </button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white rounded-lg shadow-sm border p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Today's Orders</p>
              <p className="text-2xl font-bold text-gray-900">{stats.todayOrders}</p>
              <p className="text-xs text-green-600 mt-1">+12% from yesterday</p>
            </div>
            <div className="p-3 rounded-lg bg-blue-50">
              <ShoppingBag className="w-6 h-6 text-blue-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm border p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Today's Revenue</p>
              <p className="text-2xl font-bold text-gray-900">${stats.todayRevenue.toFixed(2)}</p>
              <p className="text-xs text-green-600 mt-1">+8% from yesterday</p>
            </div>
            <div className="p-3 rounded-lg bg-green-50">
              <DollarSign className="w-6 h-6 text-green-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm border p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Pending Actions</p>
              <p className="text-2xl font-bold text-gray-900">{stats.pendingCount}</p>
              <p className="text-xs text-orange-600 mt-1">Requires attention</p>
            </div>
            <div className="p-3 rounded-lg bg-orange-50">
              <Clock className="w-6 h-6 text-orange-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm border p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Active Areas</p>
              <p className="text-2xl font-bold text-gray-900">{stats.activeAreas}</p>
              <p className="text-xs text-blue-600 mt-1">Service areas in use</p>
            </div>
            <div className="p-3 rounded-lg bg-purple-50">
              <Users className="w-6 h-6 text-purple-600" />
            </div>
          </div>
        </div>
      </div>

      {/* Pending Actions */}
      {(pendingOrders.length > 0 || paymentConfirmations.length > 0 || waiterCalls.length > 0) && (
        <div className="bg-white rounded-lg shadow-sm border p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center space-x-2">
            <AlertTriangle className="w-5 h-5 text-orange-500" />
            <span>Pending Actions ({stats.pendingCount})</span>
          </h2>

          <div className="space-y-4">
            {/* Pending Orders */}
            {pendingOrders.map((order) => (
              <div key={order.id} className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="font-medium text-gray-900">
                      New Order - Area {order.tableNumber}
                    </h3>
                    <p className="text-sm text-gray-600">
                      {order.items.length} items • ${order.totalAmount.toFixed(2)} • {format(new Date(order.timestamp), 'HH:mm')}
                    </p>
                    <div className="text-xs text-gray-500 mt-1">
                      Items: {order.items.map(item => `${item.name} x${item.quantity}`).join(', ')}
                    </div>
                  </div>
                  <div className="flex space-x-2">
                    <button
                      onClick={() => handleApproveOrder(order.id)}
                      className="bg-green-600 text-white px-3 py-1 rounded text-sm hover:bg-green-700 transition-colors"
                    >
                      Approve
                    </button>
                    <button
                      onClick={() => handleRejectOrder(order.id)}
                      className="bg-red-600 text-white px-3 py-1 rounded text-sm hover:bg-red-700 transition-colors"
                    >
                      Reject
                    </button>
                  </div>
                </div>
              </div>
            ))}

            {/* Payment Confirmations */}
            {paymentConfirmations.map((confirmation) => (
              <div key={confirmation.id} className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="font-medium text-gray-900">
                      Payment Confirmation - Area {confirmation.tableNumber}
                    </h3>
                    <p className="text-sm text-gray-600">
                      ${confirmation.total.toFixed(2)} • {confirmation.method.replace('_', ' ')} • {format(new Date(confirmation.timestamp), 'HH:mm')}
                    </p>
                    <a 
                      href={confirmation.screenshotUrl} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="text-xs text-blue-600 hover:text-blue-700 underline"
                    >
                      View Payment Screenshot
                    </a>
                  </div>
                  <div className="flex space-x-2">
                    <button
                      onClick={() => handleApprovePayment(confirmation.id)}
                      className="bg-green-600 text-white px-3 py-1 rounded text-sm hover:bg-green-700 transition-colors"
                    >
                      Approve
                    </button>
                    <button
                      onClick={() => handleRejectPayment(confirmation.id)}
                      className="bg-red-600 text-white px-3 py-1 rounded text-sm hover:bg-red-700 transition-colors"
                    >
                      Reject
                    </button>
                  </div>
                </div>
              </div>
            ))}

            {/* Staff Calls */}
            {waiterCalls.map((call) => (
              <div key={call.id} className="bg-purple-50 border border-purple-200 rounded-lg p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="font-medium text-gray-900">
                      Staff Call - Area {call.tableNumber}
                    </h3>
                    <p className="text-sm text-gray-600">
                      Customer needs assistance • {format(new Date(call.timestamp), 'HH:mm')}
                    </p>
                  </div>
                  <div className="flex space-x-2">
                    <button className="bg-purple-600 text-white px-3 py-1 rounded text-sm hover:bg-purple-700 transition-colors">
                      Acknowledge
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Charts and Recent Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Revenue Chart */}
        <div className="bg-white rounded-lg shadow-sm border p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Weekly Performance</h2>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" />
                <YAxis />
                <Tooltip 
                  formatter={(value, name) => [
                    name === 'revenue' ? `$${value}` : value,
                    name === 'revenue' ? 'Revenue' : 'Orders'
                  ]}
                />
                <Line 
                  type="monotone" 
                  dataKey="revenue" 
                  stroke="#10b981" 
                  strokeWidth={2}
                  dot={{ fill: '#10b981' }}
                />
                <Line 
                  type="monotone" 
                  dataKey="orders" 
                  stroke="#3b82f6" 
                  strokeWidth={2}
                  dot={{ fill: '#3b82f6' }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Recent Orders */}
        <div className="bg-white rounded-lg shadow-sm border p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Recent Orders</h2>
          <div className="space-y-4">
            {recentOrders.slice(0, 5).map((order) => (
              <div key={order.id} className="flex items-center justify-between py-3 border-b border-gray-100 last:border-b-0">
                <div className="flex items-center space-x-3">
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                    order.status === 'delivered' ? 'bg-green-100' :
                    order.status === 'preparing' ? 'bg-yellow-100' :
                    'bg-blue-100'
                  }`}>
                    {order.status === 'delivered' ? (
                      <CheckCircle className="w-4 h-4 text-green-600" />
                    ) : order.status === 'preparing' ? (
                      <Clock className="w-4 h-4 text-yellow-600" />
                    ) : (
                      <Package className="w-4 h-4 text-blue-600" />
                    )}
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-900">
                      Area {order.tableNumber} • {order.items.length} items
                    </p>
                    <p className="text-xs text-gray-500">
                      {format(new Date(order.timestamp), 'MMM dd, HH:mm')}
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-sm font-medium text-gray-900">${order.totalAmount.toFixed(2)}</p>
                  <span className={`text-xs px-2 py-1 rounded-full ${
                    order.status === 'delivered' ? 'bg-green-100 text-green-800' :
                    order.status === 'preparing' ? 'bg-yellow-100 text-yellow-800' :
                    'bg-blue-100 text-blue-800'
                  }`}>
                    {order.status}
                  </span>
                </div>
              </div>
            ))}
            
            {recentOrders.length === 0 && (
              <div className="text-center py-8">
                <Package className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-600">No orders yet today</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="bg-white rounded-lg shadow-sm border p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <button
            onClick={() => setShowQRGenerator(true)}
            className="flex flex-col items-center p-4 bg-blue-50 rounded-lg hover:bg-blue-100 transition-colors"
          >
            <QrCode className="w-8 h-8 text-blue-600 mb-2" />
            <span className="text-sm font-medium text-gray-900">QR Codes</span>
          </button>
          
          <button
            onClick={() => setShowPDFGenerator(true)}
            className="flex flex-col items-center p-4 bg-purple-50 rounded-lg hover:bg-purple-100 transition-colors"
          >
            <FileText className="w-8 h-8 text-purple-600 mb-2" />
            <span className="text-sm font-medium text-gray-900">Print Catalog</span>
          </button>
          
          <button
            onClick={sendTestMessage}
            className="flex flex-col items-center p-4 bg-green-50 rounded-lg hover:bg-green-100 transition-colors"
          >
            <Bell className="w-8 h-8 text-green-600 mb-2" />
            <span className="text-sm font-medium text-gray-900">Test Telegram</span>
          </button>
          
          <button
            onClick={() => window.location.href = '/admin/settings'}
            className="flex flex-col items-center p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
          >
            <Settings className="w-8 h-8 text-gray-600 mb-2" />
            <span className="text-sm font-medium text-gray-900">Settings</span>
          </button>
        </div>
      </div>

      {/* Shop Status */}
      <div className="bg-white rounded-lg shadow-sm border p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Shop Status</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="text-center">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-3">
              <Package className="w-8 h-8 text-green-600" />
            </div>
            <h3 className="font-medium text-gray-900">{menuItems.filter(item => item.available).length}</h3>
            <p className="text-sm text-gray-600">Available Products</p>
          </div>
          
          <div className="text-center">
            <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-3">
              <Users className="w-8 h-8 text-blue-600" />
            </div>
            <h3 className="font-medium text-gray-900">{categories.length}</h3>
            <p className="text-sm text-gray-600">Product Categories</p>
          </div>
          
          <div className="text-center">
            <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-3">
              <TrendingUp className="w-8 h-8 text-purple-600" />
            </div>
            <h3 className="font-medium text-gray-900">{user?.numberOfTables || 10}</h3>
            <p className="text-sm text-gray-600">Service Areas</p>
          </div>
        </div>
      </div>

      {/* QR Code Generator Modal */}
      {showQRGenerator && (
        <QRCodeGenerator
          userId={user?.id || ''}
          businessName={user?.businessName || 'Shop'}
          numberOfTables={user?.numberOfTables || 10}
          onClose={() => setShowQRGenerator(false)}
        />
      )}

      {/* PDF Generator Modal */}
      {showPDFGenerator && (
        <TableTentPDFGenerator
          userId={user?.id || ''}
          businessInfo={user!}
          menuItems={menuItems}
          categories={categories}
          onClose={() => setShowPDFGenerator(false)}
        />
      )}
    </div>
  );
};