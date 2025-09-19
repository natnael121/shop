@@ .. @@
 import React, { useState, useEffect } from 'react';
 import { 
   Plus, 
   Edit, 
   Trash2, 
   X, 
   Save, 
   User, 
   Phone, 
   Clock,
   MapPin,
   Calendar,
   CheckCircle,
   XCircle,
   Users
 } from 'lucide-react';
 import { useAuth } from '../../hooks/useAuth';
 import { firebaseService } from '../../services/firebase';
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
-      const assignments = await firebaseService.getWaiterAssignments(user.id);
+      const assignments = await firebaseService.getWaiterAssignments(user.id);
       setAssignments(assignments);
     } catch (error) {
-      console.error('Error loading waiter assignments:', error);
+      console.error('Error loading staff assignments:', error);
     } finally {
       setLoading(false);
     }
   };

   const handleDeleteAssignment = async (id: string) => {
-    if (!confirm('Are you sure you want to delete this waiter assignment?')) return;
+    if (!confirm('Are you sure you want to delete this staff assignment?')) return;
     
     try {
       await firebaseService.deleteWaiterAssignment(id);
       setAssignments(prev => prev.filter(assignment => assignment.id !== id));
     } catch (error) {
-      console.error('Error deleting waiter assignment:', error);
-      alert('Failed to delete waiter assignment');
+      console.error('Error deleting staff assignment:', error);
+      alert('Failed to delete staff assignment');
     }
   };

   const toggleAssignmentStatus = async (assignment: WaiterAssignment) => {
     try {
       await firebaseService.updateWaiterAssignment(assignment.id, { 
         isActive: !assignment.isActive 
       });
       setAssignments(prev => prev.map(a => 
         a.id === assignment.id ? { ...a, isActive: !a.isActive } : a
       ));
     } catch (error) {
       console.error('Error updating assignment status:', error);
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
-          <h1 className="text-2xl font-bold text-gray-900">Waiter Management</h1>
-          <p className="text-gray-600">Manage waiter assignments for tables</p>
+          <h1 className="text-2xl font-bold text-gray-900">Staff Management</h1>
+          <p className="text-gray-600">Manage staff assignments for service areas</p>
         </div>
         <button
           onClick={() => setShowAddAssignment(true)}
           className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors flex items-center space-x-2"
         >
           <Plus className="w-4 h-4" />
-          <span>Add Waiter</span>
+          <span>Add Staff Assignment</span>
         </button>
       </div>

-      {/* Waiter Assignments Grid */}
+      {/* Staff Assignments Grid */}
       <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
         {assignments.map((assignment) => (
           <div key={assignment.id} className="bg-white rounded-lg shadow-sm border p-6">
             <div className="flex items-center justify-between mb-4">
               <div className="flex items-center space-x-3">
                 <div className={`w-12 h-12 rounded-lg flex items-center justify-center ${
                   assignment.isActive ? 'bg-green-100' : 'bg-gray-100'
                 }`}>
                   <User className={`w-6 h-6 ${
                     assignment.isActive ? 'text-green-600' : 'text-gray-400'
                   }`} />
                 </div>
                 <div>
                   <h3 className="font-semibold text-gray-900">{assignment.waiterName}</h3>
                   <p className="text-sm text-gray-500">
-                    Tables {assignment.startTable}-{assignment.endTable}
+                    Areas {assignment.startTable}-{assignment.endTable}
                   </p>
                 </div>
               </div>
               <div className="flex space-x-2">
                 <button
                   onClick={() => toggleAssignmentStatus(assignment)}
                   className={`p-1 ${
                     assignment.isActive 
                       ? 'text-red-600 hover:text-red-700' 
                       : 'text-green-600 hover:text-green-700'
                   }`}
                   title={assignment.isActive ? 'Deactivate' : 'Activate'}
                 >
                   {assignment.isActive ? <XCircle className="w-4 h-4" /> : <CheckCircle className="w-4 h-4" />}
                 </button>
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
               <div className="flex items-center space-x-2 text-sm">
                 <MapPin className="w-4 h-4 text-gray-400" />
-                <span>Tables {assignment.startTable} to {assignment.endTable}</span>
+                <span>Service Areas {assignment.startTable} to {assignment.endTable}</span>
               </div>
               
               {assignment.telegramChatId && (
                 <div className="flex items-center space-x-2 text-sm">
                   <Phone className="w-4 h-4 text-gray-400" />
                   <span>Telegram: {assignment.telegramChatId}</span>
                 </div>
               )}

               {assignment.shiftStartTime && assignment.shiftEndTime && (
                 <div className="flex items-center space-x-2 text-sm">
                   <Clock className="w-4 h-4 text-gray-400" />
                   <span>{assignment.shiftStartTime} - {assignment.shiftEndTime}</span>
                 </div>
               )}

               {assignment.workingDays && assignment.workingDays.length > 0 && (
                 <div className="flex items-center space-x-2 text-sm">
                   <Calendar className="w-4 h-4 text-gray-400" />
                   <span>
                     {assignment.workingDays.map(day => 
                       ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'][day]
                     ).join(', ')}
                   </span>
                 </div>
               )}

               <div className="pt-2 border-t">
                 <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                   assignment.isActive 
                     ? 'bg-green-100 text-green-800' 
                     : 'bg-gray-100 text-gray-800'
                 }`}>
                   {assignment.isActive ? 'Active' : 'Inactive'}
                 </span>
               </div>
             </div>
           </div>
         ))}

         {assignments.length === 0 && (
           <div className="col-span-full text-center py-12">
             <Users className="w-12 h-12 text-gray-400 mx-auto mb-4" />
-            <h3 className="text-lg font-medium text-gray-900 mb-2">No waiter assignments yet</h3>
-            <p className="text-gray-600 mb-4">Assign waiters to specific table ranges</p>
+            <h3 className="text-lg font-medium text-gray-900 mb-2">No staff assignments yet</h3>
+            <p className="text-gray-600 mb-4">Assign staff members to specific service areas</p>
             <button
               onClick={() => setShowAddAssignment(true)}
               className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors"
             >
-              Add Waiter
+              Add Staff Assignment
             </button>
           </div>
         )}
       </div>

       {/* Add/Edit Assignment Modal */}
       {(showAddAssignment || editingAssignment) && (
         <AssignmentModal
           assignment={editingAssignment}
           userId={user?.id || ''}
-          maxTables={user?.numberOfTables || 10}
+          maxTables={user?.numberOfTables || 10}
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
     telegramChatId: assignment?.telegramChatId || '',
     shiftStartTime: assignment?.shiftStartTime || '09:00',
     shiftEndTime: assignment?.shiftEndTime || '17:00',
     workingDays: assignment?.workingDays || [1, 2, 3, 4, 5], // Mon-Fri default
     isActive: assignment?.isActive ?? true,
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
-      alert('Please enter a waiter name');
+      alert('Please enter a staff member name');
       return;
     }
     
     if (formData.startTable > formData.endTable) {
-      alert('Start table must be less than or equal to end table');
+      alert('Start area must be less than or equal to end area');
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
       console.error('Error saving assignment:', error);
       alert('Failed to save assignment');
     } finally {
       setSaving(false);
     }
   };

   return (
     <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
       <div className="bg-white rounded-2xl max-w-md w-full max-h-[90vh] overflow-y-auto">
         <div className="p-6 border-b">
           <div className="flex items-center justify-between">
             <h2 className="text-xl font-bold text-gray-900">
-              {assignment ? 'Edit Waiter Assignment' : 'Add New Waiter'}
+              {assignment ? 'Edit Staff Assignment' : 'Add New Staff Member'}
             </h2>
             <button onClick={onClose} className="text-gray-500 hover:text-gray-700">
               <X className="w-6 h-6" />
             </button>
           </div>
         </div>

         <form onSubmit={handleSubmit} className="p-6 space-y-6">
           <div>
             <label className="block text-sm font-medium text-gray-700 mb-2">
-              Waiter Name *
+              Staff Member Name *
             </label>
             <input
               type="text"
               value={formData.waiterName}
               onChange={(e) => setFormData(prev => ({ ...prev, waiterName: e.target.value }))}
               className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
-              placeholder="Enter waiter name"
+              placeholder="Enter staff member name"
               required
             />
           </div>

           <div className="grid grid-cols-2 gap-4">
             <div>
               <label className="block text-sm font-medium text-gray-700 mb-2">
-                Start Table *
+                Start Area *
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
-                End Table *
+                End Area *
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
             <input
               type="text"
               value={formData.telegramChatId}
               onChange={(e) => setFormData(prev => ({ ...prev, telegramChatId: e.target.value }))}
               className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
               placeholder="e.g., 123456789"
             />
             <p className="text-xs text-gray-500 mt-1">
-              Personal chat ID for direct waiter notifications
+              Personal chat ID for direct staff notifications
             </p>
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
             <h4 className="font-medium text-blue-900 mb-1">Assignment Coverage:</h4>
             <p className="text-sm text-blue-800">
-              This waiter will handle tables {formData.startTable} to {formData.endTable} 
+              This staff member will handle service areas {formData.startTable} to {formData.endTable} 
               ({formData.endTable - formData.startTable + 1} areas total)
             </p>
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