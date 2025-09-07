import React, { useState, useEffect } from 'react';
import apiClient from '../../lib/api';
import {
  Stethoscope, 
  Activity, 
  Settings, 
  CheckCircle, 
  Plus, 
  Wrench, 
  AlertTriangle,
  Search,
  Filter,
  FileBarChart,
  Calendar,
  X,
  Save
} from 'lucide-react';

// Equipment Creation Modal
const EquipmentModal = ({ isOpen, onClose, onSave, equipment = null }) => {
  const [formData, setFormData] = useState({
    name: '',
    model: '',
    category: 'monitoring',
    serialNumber: '',
    status: 'available',
    nextMaintenanceDate: '',
    quantity: 1,
    minQuantity: 1
  });

  useEffect(() => {
    if (equipment) {
      setFormData({
        name: equipment.name || '',
        model: equipment.model || '',
        category: equipment.category || 'monitoring',
        serialNumber: equipment.serialNumber || '',
        status: equipment.status || 'available',
        nextMaintenanceDate: equipment.nextMaintenanceDate ? equipment.nextMaintenanceDate.split('T')[0] : '',
        quantity: equipment.quantity || 1,
        minQuantity: equipment.minQuantity || 1
      });
    }
  }, [equipment]);

  const handleSubmit = (e) => {
    e.preventDefault();
    onSave(formData);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center">
      <div className="bg-white rounded-lg p-6 w-full max-w-md mx-4">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-semibold">{equipment ? 'Edit Equipment' : 'Add New Equipment'}</h3>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Equipment Name</label>
            <input
              type="text"
              required
              value={formData.name}
              onChange={(e) => setFormData({...formData, name: e.target.value})}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="e.g. Ventilator Model X"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Model</label>
            <input
              type="text"
              value={formData.model}
              onChange={(e) => setFormData({...formData, model: e.target.value})}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="e.g. VM-2000"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
              <select
                value={formData.category}
                onChange={(e) => setFormData({...formData, category: e.target.value})}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="monitoring">Monitoring</option>
                <option value="respiratory">Respiratory</option>
                <option value="cardiac">Cardiac</option>
                <option value="surgical">Surgical</option>
                <option value="diagnostic">Diagnostic</option>
                <option value="other">Other</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
              <select
                value={formData.status}
                onChange={(e) => setFormData({...formData, status: e.target.value})}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="available">Available</option>
                <option value="in_use">In Use</option>
                <option value="maintenance">Maintenance</option>
                <option value="out_of_order">Out of Order</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Serial Number</label>
            <input
              type="text"
              value={formData.serialNumber}
              onChange={(e) => setFormData({...formData, serialNumber: e.target.value})}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="e.g. SN123456789"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Next Maintenance Date</label>
            <input
              type="date"
              value={formData.nextMaintenanceDate}
              onChange={(e) => setFormData({...formData, nextMaintenanceDate: e.target.value})}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Quantity</label>
              <input
                type="number"
                min="1"
                value={formData.quantity}
                onChange={(e) => setFormData({...formData, quantity: parseInt(e.target.value)})}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Min Quantity</label>
              <input
                type="number"
                min="1"
                value={formData.minQuantity}
                onChange={(e) => setFormData({...formData, minQuantity: parseInt(e.target.value)})}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>

          <div className="flex justify-end space-x-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-md hover:bg-blue-700"
            >
              <Save className="w-4 h-4 mr-2 inline" />
              {equipment ? 'Update' : 'Add'} Equipment
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

// Service Scheduling Modal
const ServiceModal = ({ isOpen, onClose, equipment, onSave }) => {
  const [serviceData, setServiceData] = useState({
    nextMaintenanceDate: '',
    maintenanceType: 'preventive',
    notes: ''
  });

  useEffect(() => {
    if (equipment) {
      setServiceData({
        nextMaintenanceDate: equipment.nextMaintenanceDate ? equipment.nextMaintenanceDate.split('T')[0] : '',
        maintenanceType: 'preventive',
        notes: ''
      });
    }
  }, [equipment]);

  const handleSubmit = (e) => {
    e.preventDefault();
    onSave(equipment._id, serviceData);
    onClose();
  };

  if (!isOpen || !equipment) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center">
      <div className="bg-white rounded-lg p-6 w-full max-w-md mx-4">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-semibold">Schedule Service - {equipment.name}</h3>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Next Maintenance Date</label>
            <input
              type="date"
              required
              value={serviceData.nextMaintenanceDate}
              onChange={(e) => setServiceData({...serviceData, nextMaintenanceDate: e.target.value})}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Maintenance Type</label>
            <select
              value={serviceData.maintenanceType}
              onChange={(e) => setServiceData({...serviceData, maintenanceType: e.target.value})}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="preventive">Preventive</option>
              <option value="corrective">Corrective</option>
              <option value="calibration">Calibration</option>
              <option value="inspection">Inspection</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Notes</label>
            <textarea
              rows="3"
              value={serviceData.notes}
              onChange={(e) => setServiceData({...serviceData, notes: e.target.value})}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Additional maintenance notes..."
            />
          </div>

          <div className="flex justify-end space-x-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-md hover:bg-blue-700"
            >
              <Calendar className="w-4 h-4 mr-2 inline" />
              Schedule Service
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

// Inventory Report Modal
const ReportModal = ({ isOpen, onClose, equipmentData }) => {
  if (!isOpen) return null;

  const statusCounts = equipmentData.reduce((acc, item) => {
    acc[item.status] = (acc[item.status] || 0) + 1;
    return acc;
  }, {});

  const categoryCounts = equipmentData.reduce((acc, item) => {
    acc[item.category] = (acc[item.category] || 0) + 1;
    return acc;
  }, {});

  const lowStockItems = equipmentData.filter(item => 
    item.quantity && item.minQuantity && item.quantity < item.minQuantity
  );

  const maintenanceDue = equipmentData.filter(item => {
    if (!item.nextMaintenanceDate) return false;
    const dueDate = new Date(item.nextMaintenanceDate);
    const today = new Date();
    const daysDiff = Math.ceil((dueDate - today) / (1000 * 60 * 60 * 24));
    return daysDiff <= 30;
  });

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center"
    style={{ width: '100vw', height: '100vh', margin: 0, padding: 0 }}>

      <div className="bg-white rounded-lg p-6 w-full max-w-4xl mx-4 max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-6">
          <h3 className="text-xl font-semibold">Equipment Inventory Report</h3>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
            <X className="w-6 h-6" />
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Status Overview */}
          <div className="bg-gray-50 rounded-lg p-4">
            <h4 className="font-semibold mb-3">Equipment Status</h4>
            <div className="space-y-2">
              {Object.entries(statusCounts).map(([status, count]) => (
                <div key={status} className="flex justify-between">
                  <span className="capitalize">{status.replace('_', ' ')}</span>
                  <span className="font-medium">{count}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Category Overview */}
          <div className="bg-gray-50 rounded-lg p-4">
            <h4 className="font-semibold mb-3">Equipment Categories</h4>
            <div className="space-y-2">
              {Object.entries(categoryCounts).map(([category, count]) => (
                <div key={category} className="flex justify-between">
                  <span className="capitalize">{category}</span>
                  <span className="font-medium">{count}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Low Stock Alert */}
          {lowStockItems.length > 0 && (
            <div className="bg-red-50 rounded-lg p-4">
              <h4 className="font-semibold mb-3 text-red-800">Low Stock Alerts</h4>
              <div className="space-y-2">
                {lowStockItems.map(item => (
                  <div key={item._id} className="flex justify-between text-sm">
                    <span>{item.name}</span>
                    <span className="text-red-600">{item.quantity}/{item.minQuantity}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Maintenance Due */}
          {maintenanceDue.length > 0 && (
            <div className="bg-yellow-50 rounded-lg p-4">
              <h4 className="font-semibold mb-3 text-yellow-800">Maintenance Due (30 days)</h4>
              <div className="space-y-2">
                {maintenanceDue.map(item => (
                  <div key={item._id} className="flex justify-between text-sm">
                    <span>{item.name}</span>
                    <span className="text-yellow-600">
                      {new Date(item.nextMaintenanceDate).toLocaleDateString()}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        <div className="mt-6 flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-md hover:bg-blue-700"
          >
            Close Report
          </button>
        </div>
      </div>
    </div>
  );
};

export default function EquipmentOverview() {
  const [equipmentData, setEquipmentData] = useState([]);
  const [filteredEquipment, setFilteredEquipment] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filterStatus, setFilterStatus] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [showAddModal, setShowAddModal] = useState(false);
  const [showServiceModal, setShowServiceModal] = useState(false);
  const [showReportModal, setShowReportModal] = useState(false);
  const [selectedEquipment, setSelectedEquipment] = useState(null);

  useEffect(() => {
    fetchEquipment();
  }, []);

  useEffect(() => {
    filterEquipment();
  }, [equipmentData, filterStatus, searchTerm]);

  const fetchEquipment = async () => {
    try {
      setLoading(true);
      const response = await apiClient.getEquipment();
      setEquipmentData(response);
    } catch (error) {
      console.error('Error fetching equipment:', error);
      // Use mock data on API failure
      const mockData = apiClient.getMockEquipment();
      setEquipmentData(mockData);
    } finally {
      setLoading(false);
    }
  };

  const filterEquipment = () => {
    let filtered = equipmentData;

    if (filterStatus !== 'all') {
      filtered = filtered.filter(item => item.status === filterStatus);
    }

    if (searchTerm) {
      filtered = filtered.filter(item =>
        item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.category.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (item.model && item.model.toLowerCase().includes(searchTerm.toLowerCase()))
      );
    }

    setFilteredEquipment(filtered);
  };

  const handleEquipmentAction = async (equipmentId, action) => {
    try {
      console.log(`Executing ${action} for equipment ${equipmentId}`);
      
      let updatedStatus;
      let apiEndpoint;
      
      switch (action) {
        case 'checkout':
          updatedStatus = 'in_use';
          apiEndpoint = `/equipment/${equipmentId}/assign`;
          break;
        case 'return':
          updatedStatus = 'available';
          apiEndpoint = `/equipment/${equipmentId}/unassign`;
          break;
        case 'maintenance':
          updatedStatus = 'maintenance';
          apiEndpoint = `/equipment/${equipmentId}/status`;
          break;
        case 'complete':
          updatedStatus = 'available';
          apiEndpoint = `/equipment/${equipmentId}/status`;
          break;
        case 'repair':
          updatedStatus = 'maintenance';
          apiEndpoint = `/equipment/${equipmentId}/status`;
          break;
        case 'schedule_service':
          const equipment = equipmentData.find(item => item._id === equipmentId);
          setSelectedEquipment(equipment);
          setShowServiceModal(true);
          return;
        case 'add':
          setShowAddModal(true);
          return;
        case 'details':
          const detailEquipment = equipmentData.find(item => item._id === equipmentId);
          console.log('Equipment details:', detailEquipment);
          // TODO: Show details modal
          return;
        default:
          return;
      }

      // Try API call first
      try {
        if (apiEndpoint.includes('status')) {
          await apiClient.request(apiEndpoint, {
            method: 'PUT',
            body: JSON.stringify({ status: updatedStatus }),
            headers: { 'Content-Type': 'application/json' }
          });
        } else {
          await apiClient.request(apiEndpoint, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' }
          });
        }
        
        // Refresh equipment data from API
        await fetchEquipment();
      } catch (apiError) {
        console.log('API call failed, using mock update:', apiError.message);
        
        // Update local state as fallback
        setEquipmentData(prev => prev.map(item => {
          if (item._id === equipmentId) {
            return { ...item, status: updatedStatus };
          }
          return item;
        }));
      }
      
      console.log(`Action ${action} completed for equipment ${equipmentId}`);
    } catch (error) {
      console.error(`Error executing ${action}:`, error);
    }
  };

  const handleSaveEquipment = async (formData) => {
    try {
      // Generate a unique ID for new equipment
      const newEquipment = {
        ...formData,
        _id: 'eq_' + Date.now(),
        equipmentId: 'EQ' + Date.now().toString().substr(-6),
        location: 'ICU',
        createdAt: new Date().toISOString()
      };

      try {
        // Try API call first
        await apiClient.createEquipment(newEquipment);
        await fetchEquipment();
      } catch (apiError) {
        console.log('API call failed, using mock update:', apiError.message);
        
        // Add to local state as fallback
        setEquipmentData(prev => [...prev, newEquipment]);
      }
      
      console.log('Equipment added successfully');
    } catch (error) {
      console.error('Error adding equipment:', error);
    }
  };

  const handleScheduleService = async (equipmentId, serviceData) => {
    try {
      const updatedEquipment = {
        nextMaintenanceDate: serviceData.nextMaintenanceDate,
        maintenanceType: serviceData.maintenanceType,
        maintenanceNotes: serviceData.notes
      };

      try {
        // Try API call first
        await apiClient.request(`/equipment/${equipmentId}/maintenance`, {
          method: 'POST',
          body: JSON.stringify(updatedEquipment),
          headers: { 'Content-Type': 'application/json' }
        });
        await fetchEquipment();
      } catch (apiError) {
        console.log('API call failed, using mock update:', apiError.message);
        
        // Update local state as fallback
        setEquipmentData(prev => prev.map(item => {
          if (item._id === equipmentId) {
            return { ...item, ...updatedEquipment };
          }
          return item;
        }));
      }
      
      console.log(`Service scheduled for equipment ${equipmentId}`);
    } catch (error) {
      console.error('Error scheduling service:', error);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Equipment Overview</h2>
          <p className="text-gray-600 mt-1">Monitor and manage medical equipment inventory</p>
        </div>
        <div className="flex items-center space-x-3">
          <button
            onClick={() => setShowReportModal(true)}
            className="inline-flex items-center px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
          >
            <FileBarChart className="w-4 h-4 mr-2" />
            Inventory Report
          </button>
          <button
            onClick={() => handleEquipmentAction('new', 'add')}
            className="inline-flex items-center px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-lg hover:bg-blue-700 transition-colors"
          >
            <Plus className="w-4 h-4 mr-2" />
            Add Equipment
          </button>
        </div>
      </div>

      {/* Filters and Search */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
          <input
            type="text"
            placeholder="Search equipment..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10 pr-4 py-2 w-full border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>
        
        <div className="relative">
          <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="pl-10 pr-8 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent appearance-none bg-white"
          >
            <option value="all">All Status</option>
            <option value="available">Available</option>
            <option value="in_use">In Use</option>
            <option value="maintenance">Maintenance</option>
            <option value="out_of_order">Out of Order</option>
          </select>
        </div>
      </div>

      {/* Equipment List */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
        <div className="px-6 py-4 bg-gradient-to-r from-blue-50 to-indigo-50 border-b border-gray-200">
          <div className="flex items-center space-x-3">
            <div className="flex items-center justify-center w-10 h-10 bg-blue-100 rounded-lg">
              <Stethoscope className="w-5 h-5 text-blue-600" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-gray-900">Equipment Inventory</h3>
              <p className="text-sm text-gray-600 mt-1">Medical equipment tracking and management</p>
            </div>
          </div>
        </div>

        {/* Column Headers */}
        <div className="px-6 py-3 bg-gray-50 border-b border-gray-200">
          <div className="grid grid-cols-12 gap-4 items-center">
            <div className="col-span-4 text-xs font-medium text-gray-500 uppercase tracking-wide">Equipment</div>
            <div className="col-span-2 text-xs font-medium text-gray-500 uppercase tracking-wide">Category</div>
            <div className="col-span-3 text-xs font-medium text-gray-500 uppercase tracking-wide">Status & Service</div>
            <div className="col-span-3 text-xs font-medium text-gray-500 uppercase tracking-wide">Actions</div>
          </div>
        </div>
        
        {/* Equipment Rows */}
        <div className="divide-y divide-gray-100">
          {filteredEquipment.map((item, index) => (
            <div key={item._id} className={`px-6 py-4 hover:bg-gray-50 transition-colors duration-200 ${
              index % 2 === 0 ? 'bg-white' : 'bg-gray-25'
            }`}>
              <div className="grid grid-cols-12 gap-4 items-center">
                
                {/* Equipment Info */}
                <div className="col-span-4 flex items-center gap-3">
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center transition-colors ${
                    item.status === 'available' ? 'bg-gradient-to-br from-green-400 to-green-600' :
                    item.status === 'in_use' ? 'bg-gradient-to-br from-yellow-400 to-yellow-600' :
                    item.status === 'maintenance' ? 'bg-gradient-to-br from-red-400 to-red-600' :
                    item.status === 'out_of_order' ? 'bg-gradient-to-br from-gray-400 to-gray-600' : 'bg-gradient-to-br from-blue-400 to-blue-600'
                  }`}>
                    <Stethoscope className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900 text-sm">{item.name}</h3>
                    <p className="text-xs text-gray-500">Model: {item.model || 'N/A'}</p>
                    <p className="text-xs text-gray-500">Qty: {item.quantity || 1}</p>
                  </div>
                </div>

                {/* Category */}
                <div className="col-span-2">
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800 capitalize">
                    {item.category}
                  </span>
                </div>

                {/* Status & Service */}
                <div className="col-span-3">
                  <div className="flex flex-col gap-2">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium w-fit ${
                      item.status === 'available' ? 'bg-green-100 text-green-800 border border-green-300' :
                      item.status === 'in_use' ? 'bg-yellow-100 text-yellow-800 border border-yellow-300' :
                      item.status === 'maintenance' ? 'bg-red-100 text-red-800 border border-red-300' :
                      item.status === 'out_of_order' ? 'bg-gray-100 text-gray-800 border border-gray-300' :
                      'bg-blue-100 text-blue-800 border border-blue-300'
                    }`}>
                      <div className={`w-2 h-2 rounded-full mr-2 ${
                        item.status === 'available' ? 'bg-green-500' :
                        item.status === 'in_use' ? 'bg-yellow-500' :
                        item.status === 'maintenance' ? 'bg-red-500' :
                        item.status === 'out_of_order' ? 'bg-gray-500' : 'bg-blue-500'
                      }`}></div>
                      {item.status.replace('_', ' ').toUpperCase()}
                    </span>
                    
                    {/* Low Stock Warning */}
                    {item.quantity && item.minQuantity && item.quantity < item.minQuantity && (
                      <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800 border border-red-200 w-fit">
                        <AlertTriangle className="w-3 h-3 mr-1" />
                        Low Stock
                      </span>
                    )}
                    
                    {/* Next Maintenance */}
                    {item.nextMaintenanceDate && (
                      <div className="text-xs">
                        <div className={`flex items-center gap-1 ${
                          new Date(item.nextMaintenanceDate) < new Date() ? 'text-red-600' : 'text-gray-500'
                        }`}>
                          <Wrench className="w-3 h-3" />
                          <span className="font-medium">
                            {new Date(item.nextMaintenanceDate) < new Date() ? 'Overdue' : 'Service Due'}
                          </span>
                        </div>
                        <div className="text-gray-500 text-xs pl-4">
                          {new Date(item.nextMaintenanceDate).toLocaleDateString()}
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                {/* Actions */}
                <div className="col-span-3">
                  <div className="flex items-center gap-1">
                    {item.status === 'available' && (
                      <>
                        <button 
                          onClick={() => handleEquipmentAction(item._id, 'checkout')}
                          className="inline-flex items-center px-2.5 py-1.5 text-xs font-medium text-white bg-blue-600 border border-blue-600 rounded hover:bg-blue-700 transition-colors"
                        >
                          <Activity className="w-3 h-3 mr-1" />
                          Check Out
                        </button>
                        <button 
                          onClick={() => handleEquipmentAction(item._id, 'maintenance')}
                          className="inline-flex items-center p-1.5 text-xs font-medium text-gray-600 bg-gray-100 border border-gray-300 rounded hover:bg-gray-200 transition-colors"
                          title="Maintenance"
                        >
                          <Settings className="w-3 h-3" />
                        </button>
                        <button 
                          onClick={() => handleEquipmentAction(item._id, 'schedule_service')}
                          className="inline-flex items-center p-1.5 text-xs font-medium text-blue-600 bg-blue-100 border border-blue-300 rounded hover:bg-blue-200 transition-colors"
                          title="Schedule Service"
                        >
                          <Calendar className="w-3 h-3" />
                        </button>
                      </>
                    )}
                    
                    {item.status === 'in_use' && (
                      <>
                        <button 
                          onClick={() => handleEquipmentAction(item._id, 'return')}
                          className="inline-flex items-center px-2.5 py-1.5 text-xs font-medium text-white bg-green-600 border border-green-600 rounded hover:bg-green-700 transition-colors"
                        >
                          <CheckCircle className="w-3 h-3 mr-1" />
                          Return
                        </button>
                        <button 
                          onClick={() => handleEquipmentAction(item._id, 'schedule_service')}
                          className="inline-flex items-center p-1.5 text-xs font-medium text-blue-600 bg-blue-100 border border-blue-300 rounded hover:bg-blue-200 transition-colors"
                          title="Schedule Service"
                        >
                          <Calendar className="w-3 h-3" />
                        </button>
                      </>
                    )}
                    
                    {item.status === 'maintenance' && (
                      <>
                        <button 
                          onClick={() => handleEquipmentAction(item._id, 'complete')}
                          className="inline-flex items-center px-2.5 py-1.5 text-xs font-medium text-white bg-yellow-600 border border-yellow-600 rounded hover:bg-yellow-700 transition-colors"
                        >
                          <Wrench className="w-3 h-3 mr-1" />
                          Complete
                        </button>
                        <button 
                          onClick={() => handleEquipmentAction(item._id, 'schedule_service')}
                          className="inline-flex items-center p-1.5 text-xs font-medium text-blue-600 bg-blue-100 border border-blue-300 rounded hover:bg-blue-200 transition-colors"
                          title="Reschedule"
                        >
                          <Calendar className="w-3 h-3" />
                        </button>
                      </>
                    )}

                    {item.status === 'out_of_order' && (
                      <>
                        <button 
                          onClick={() => handleEquipmentAction(item._id, 'repair')}
                          className="inline-flex items-center px-2.5 py-1.5 text-xs font-medium text-white bg-gray-600 border border-gray-600 rounded hover:bg-gray-700 transition-colors"
                        >
                          <Wrench className="w-3 h-3 mr-1" />
                          Repair
                        </button>
                        <button 
                          onClick={() => handleEquipmentAction(item._id, 'schedule_service')}
                          className="inline-flex items-center p-1.5 text-xs font-medium text-blue-600 bg-blue-100 border border-blue-300 rounded hover:bg-blue-200 transition-colors"
                          title="Schedule Service"
                        >
                          <Calendar className="w-3 h-3" />
                        </button>
                      </>
                    )}
                  </div>
                </div>

              </div>
            </div>
          ))}
        </div>

        {/* Empty State */}
        {filteredEquipment.length === 0 && (
          <div className="px-6 py-12 text-center">
            <div className="flex items-center justify-center w-16 h-16 mx-auto bg-gray-100 rounded-full mb-4">
              <Stethoscope className="w-8 h-8 text-gray-400" />
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">No equipment found</h3>
            <p className="text-sm text-gray-500 mb-4">
              {filterStatus === 'all' 
                ? 'No equipment has been added yet.' 
                : `No equipment with ${filterStatus.replace('_', ' ')} status.`}
            </p>
            {filterStatus === 'all' && (
              <button 
                onClick={() => handleEquipmentAction('new', 'add')}
                className="inline-flex items-center px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-blue-600 rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-1 transition-colors"
              >
                <Plus className="w-4 h-4 mr-2" />
                Add Equipment
              </button>
            )}
          </div>
        )}
      </div>

      {/* Modals */}
      <EquipmentModal
        isOpen={showAddModal}
        onClose={() => setShowAddModal(false)}
        onSave={handleSaveEquipment}
      />

      <ServiceModal
        isOpen={showServiceModal}
        onClose={() => {
          setShowServiceModal(false);
          setSelectedEquipment(null);
        }}
        equipment={selectedEquipment}
        onSave={handleScheduleService}
      />

      <ReportModal
        isOpen={showReportModal}
        onClose={() => setShowReportModal(false)}
        equipmentData={equipmentData}
      />
    </div>
  );
}
