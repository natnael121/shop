import React, { useState, useEffect } from 'react';
import { Plus, Edit, Trash2, X, Save, User, Users, MessageSquare, TestTube } from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';
import { firebaseService } from '../../services/firebase';
import { telegramService } from '../../services/telegram';
import { WaiterAssignment } from '../../types';

export const WaiterManagement: React.FC = () => {
  const { user } = useAuth();
  const [assignments, setAssignments] = useState<WaiterAssignment[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddAssignment, setShowAddAssignment] = useState(false);
  const [editingAssignment, setEditingAssignment] = useState<WaiterAssignment | null>(null);

  useEffect(() => {
    if (user) {
      loadAssignments();
    }
  }, [user]);

  const loadAssignments = async () => {
    if (!user) return;
    
    try {
      setLoading(true);
      const waiterAssignments = await firebaseService.getWaiterAssignments(user.id);
      setAssignments(waiterAssignments);
    } catch (error) {
      console.error('Error loading staff assignments:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteAssignment = async (id: string) => {
    if (!confirm('Are you sure you want to delete this staff assignment?')) return;
    
    try {
      await firebaseService.deleteWaiterAssignment(id);
      setAssignments(prev => prev.filter(assignment => assignment.id !== id));
    } catch (error) {
      console.error('Error deleting staff assignment:', error);
      alert('Failed to delete staff assignment');
    }
  };

  const testTelegramConnection = async (chatId: string, staffName: string) => {
    if (!chatId) {
      alert('Please enter a Telegram Chat ID first');
      return;
    }

    try {
      const success = await telegramService.sendTestMessage(chatId);
      if (success) {
        alert(`Test message sent to ${staffName}! Check your Telegram.`);
      } else {
        alert('Failed to send test message. Please check your Chat ID.');
      }
    } catch (error) {
      console.error('Error testing Telegram connection:', error);
      alert('Failed to send test message. Please check your Chat ID.');
    }
  };

  if (loading) {
    return (
      <div className="p-6">
        <div className="animate-pulse space-y-6">
          <div className="h-8 bg-gray-200 rounded w-1/4"></div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="h-32 bg-gray-200 rounded-lg"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Staff Management</h1>
          <p className="text-gray-600">Manage staff assignments for different service areas</p>
        </div>
        <button
          onClick={() => setShowAddAssignment(true)}
          className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors flex items-center space-x-2"
        >
          <Plus className="w-4 h-4" />
          <span>Add Staff Assignment</span>
        </button>
      </div>

      {/* Staff Assignments Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {assignments.map((assignment) => (
          <div key={assignment.id} className="bg-white rounded-lg shadow-sm border p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center space-x-3">
                <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                  <User className="w-6 h-6 text-blue-600" />
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900">{assignment.waiterName}</h3>
                  <p className="text-sm text-gray-500">
                    Areas {assignment.startTable}-{assignment.endTable}
                  </p>
                </div>
              </div>
              <div className="flex space-x-2">
                <button
                  onClick={() => setEditingAssignment(assignment)}
                  className="text-blue-600 hover:text-blue-700 p-1"
                  title="Edit Assignment"
                >
                  <Edit className="w-4 h-4" />
                </button>
                <button
                  onClick={() => handleDeleteAssignment(assignment.id)}
                  className="text-red-600 hover:text-red-700 p-1"
                  title="Delete Assignment"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>

            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Status:</span>
                <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                  assignment.isActive 
                    ? 'bg-green-100 text-green-800' 
                    : 'bg-red-100 text-red-800'
                }`}>
                  {assignment.isActive ? 'Active' : 'Inactive'}
                </span>
              </div>

              {assignment.telegramChatId && (
                <div>
                  <label className="block text-xs font-medium text-gray-500 mb-1">
                    Telegram Chat ID
                  </label>
                  <div className="flex items-center space-x-2">
                    <input
                      type="text"
                      value={assignment.telegramChatId}
                      readOnly
                      className="flex-1 px-2 py-1 text-sm border border-gray-300 rounded bg-gray-50 text-gray-600"
                    />
                    <button
                      onClick={() => testTelegramConnection(assignment.telegramChatId!, assignment.waiterName)}
                      className="px-2 py-1 bg-blue-600 text-white rounded text-xs hover:bg-blue-700 transition-colors flex items-center space-x-1"
                      title="Test Connection"
                    >
                      <TestTube className="w-3 h-3" />
                      <span>Test</span>
                    </button>
                  </div>
                </div>
              )}

              {assignment.shiftStartTime && assignment.shiftEndTime && (
                <div>
                  <label className="block text-xs font-medium text-gray-500 mb-1">
                    Shift Hours
                  </label>
                  <div className="text-sm text-gray-700">
                    {assignment.shiftStartTime} - {assignment.shiftEndTime}
                  </div>
                </div>
              )}

              {assignment.workingDays && assignment.workingDays.length > 0 && (
                <div>
                  <label className="block text-xs font-medium text-gray-500 mb-1">
                    Working Days
                  </label>
                  <div className="text-sm text-gray-700">
                    {assignment.workingDays.map(day => 
                      ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'][day]
                    ).join(', ')}
                  </div>
                </div>
              )}

              <div className="pt-2 border-t">
                <p className="text-xs text-gray-500">
                  Created: {new Date(assignment.created_at).toLocaleDateString()}
                </p>
              </div>
            </div>
          </div>
        ))}

        {assignments.length === 0 && (
          <div className="col-span-full text-center py-12">
            <Users className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No staff assignments yet</h3>
            <p className="text-gray-600 mb-4">Create your first staff assignment to manage service areas</p>
            <button
              onClick={() => setShowAddAssignment(true)}
              className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors"
            >
              Add Staff Assignment
            </button>
          </div>
        )}
      </div>

      {/* Add/Edit Assignment Modal */}
      {(showAddAssignment || editingAssignment) && (
        <AssignmentModal
          assignment={editingAssignment}
          userId={user?.id || ''}
          maxTables={user?.numberOfTables || 10}
          onClose={() => {
            setShowAddAssignment(false);
            setEditingAssignment(null);
          }}
          onSave={(assignment) => {
            if (editingAssignment) {
              setAssignments(prev => prev.map(a => a.id === assignment.id ? assignment : a));
            } else {
              setAssignments(prev => [...prev, assignment]);
            }
            setShowAddAssignment(false);
            setEditingAssignment(null);
          }}
        />
      )}
    </div>
  );
};

// Assignment Modal Component
interface AssignmentModalProps {
  assignment: WaiterAssignment | null;
  userId: string;
  maxTables: number;
  onClose: () => void;
  onSave: (assignment: WaiterAssignment) => void;
}

const AssignmentModal: React.FC<AssignmentModalProps> = ({ 
  assignment, 
  userId, 
  maxTables, 
  onClose, 
  onSave 
}) => {
  const [formData, setFormData] = useState({
    waiterName: assignment?.waiterName || '',
    startTable: assignment?.startTable || 1,
    endTable: assignment?.endTable || 5,
    isActive: assignment?.isActive ?? true,
    telegramChatId: assignment?.telegramChatId || '',
    shiftStartTime: assignment?.shiftStartTime || '09:00',
    shiftEndTime: assignment?.shiftEndTime || '17:00',
    workingDays: assignment?.workingDays || [1, 2, 3, 4, 5], // Mon-Fri default
  });
  const [saving, setSaving] = useState(false);

  const daysOfWeekOptions = [
    { value: 0, label: 'Sunday' },
    { value: 1, label: 'Monday' },
    { value: 2, label: 'Tuesday' },
    { value: 3, label: 'Wednesday' },
    { value: 4, label: 'Thursday' },
    { value: 5, label: 'Friday' },
    { value: 6, label: 'Saturday' },
  ];

  const handleDayToggle = (day: number) => {
    setFormData(prev => ({
      ...prev,
      workingDays: prev.workingDays.includes(day)
        ? prev.workingDays.filter(d => d !== day)
        : [...prev.workingDays, day].sort()
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.waiterName.trim()) {
      alert('Please enter a staff member name');
      return;
    }
    
    if (formData.startTable > formData.endTable) {
      alert('Start area number cannot be greater than end area number');
      return;
    }
    
    if (formData.endTable > maxTables) {
      alert(`End area number cannot exceed ${maxTables}`);
      return;
    }

    setSaving(true);

    try {
      const assignmentData = {
        ...formData,
        waiterName: formData.waiterName.trim(),
        userId,
        created_at: assignment?.created_at || new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };

      if (assignment) {
        await firebaseService.updateWaiterAssignment(assignment.id, assignmentData);
        onSave({ ...assignment, ...assignmentData });
      } else {
        const id = await firebaseService.addWaiterAssignment(assignmentData);
        onSave({ id, ...assignmentData } as WaiterAssignment);
      }
    } catch (error) {
      console.error('Error saving staff assignment:', error);
      alert('Failed to save staff assignment');
    } finally {
      setSaving(false);
    }
  };

  const testConnection = async () => {
    if (!formData.telegramChatId.trim()) {
      alert('Please enter a Telegram Chat ID first');
      return;
    }

    try {
      const success = await telegramService.sendTestMessage(formData.telegramChatId.trim());
      if (success) {
        alert('Test message sent successfully! Check your Telegram.');
      } else {
        alert('Failed to send test message. Please check your Chat ID.');
      }
    } catch (error) {
      console.error('Error testing connection:', error);
      alert('Failed to send test message. Please check your Chat ID.');
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl max-w-md w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6 border-b">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-bold text-gray-900">
              {assignment ? 'Edit Staff Assignment' : 'Add New Staff Assignment'}
            </h2>
            <button onClick={onClose} className="text-gray-500 hover:text-gray-700">
              <X className="w-6 h-6" />
            </button>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Staff Member Name *
            </label>
            <input
              type="text"
              value={formData.waiterName}
              onChange={(e) => setFormData(prev => ({ ...prev, waiterName: e.target.value }))}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
              placeholder="e.g., John Smith"
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Start Area *
              </label>
              <input
                type="number"
                min="1"
                max={maxTables}
                value={formData.startTable}
                onChange={(e) => setFormData(prev => ({ ...prev, startTable: parseInt(e.target.value) || 1 }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                End Area *
              </label>
              <input
                type="number"
                min="1"
                max={maxTables}
                value={formData.endTable}
                onChange={(e) => setFormData(prev => ({ ...prev, endTable: parseInt(e.target.value) || 1 }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                required
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Telegram Chat ID (Optional)
            </label>
            <div className="space-y-2">
              <div className="flex space-x-2">
                <input
                  type="text"
                  value={formData.telegramChatId}
                  onChange={(e) => setFormData(prev => ({ ...prev, telegramChatId: e.target.value }))}
                  className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  placeholder="e.g., 123456789"
                />
                <button
                  type="button"
                  onClick={testConnection}
                  className="px-3 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm"
                >
                  Test
                </button>
              </div>
              <p className="text-xs text-gray-500">
                Personal chat ID for direct notifications to this staff member
              </p>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Shift Start Time
              </label>
              <input
                type="time"
                value={formData.shiftStartTime}
                onChange={(e) => setFormData(prev => ({ ...prev, shiftStartTime: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Shift End Time
              </label>
              <input
                type="time"
                value={formData.shiftEndTime}
                onChange={(e) => setFormData(prev => ({ ...prev, shiftEndTime: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Working Days
            </label>
            <div className="grid grid-cols-2 gap-2">
              {daysOfWeekOptions.map(day => (
                <label key={day.value} className="flex items-center">
                  <input
                    type="checkbox"
                    checked={formData.workingDays.includes(day.value)}
                    onChange={() => handleDayToggle(day.value)}
                    className="h-4 w-4 text-green-600 focus:ring-green-500 border-gray-300 rounded"
                  />
                  <span className="ml-2 text-sm text-gray-700">{day.label}</span>
                </label>
              ))}
            </div>
          </div>

          <div className="flex items-center">
            <input
              type="checkbox"
              id="isActive"
              checked={formData.isActive}
              onChange={(e) => setFormData(prev => ({ ...prev, isActive: e.target.checked }))}
              className="h-4 w-4 text-green-600 focus:ring-green-500 border-gray-300 rounded"
            />
            <label htmlFor="isActive" className="ml-2 block text-sm text-gray-900">
              Assignment is active
            </label>
          </div>

          <div className="bg-blue-50 p-3 rounded-lg">
            <h4 className="font-medium text-blue-900 mb-1">Staff Assignment Info:</h4>
            <ul className="text-xs text-blue-700 space-y-1">
              <li>• Staff will receive notifications for customer calls from their assigned areas</li>
              <li>• If no Telegram Chat ID is provided, calls will go to the cashier department</li>
              <li>• Areas can overlap between staff members for coverage</li>
              <li>• Inactive assignments won't receive notifications</li>
            </ul>
          </div>

          <div className="flex justify-end space-x-4 pt-6 border-t">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={saving}
              className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors disabled:bg-gray-400 flex items-center space-x-2"
            >
              <Save className="w-4 h-4" />
              <span>{saving ? 'Saving...' : 'Save Assignment'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};