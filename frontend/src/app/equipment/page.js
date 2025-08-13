'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { 
  Search, 
  Plus, 
  Filter, 
  Eye, 
  Edit, 
  AlertTriangle,
  Wrench,
  Calendar,
  MapPin,
  Activity,
  TrendingUp,
  Settings
} from 'lucide-react'
import toast from 'react-hot-toast'

export default function EquipmentPage() {
  const [equipment, setEquipment] = useState([])
  const [filteredEquipment, setFilteredEquipment] = useState([])
  const [searchTerm, setSearchTerm] = useState('')
  const [categoryFilter, setCategoryFilter] = useState('all')
  const [statusFilter, setStatusFilter] = useState('all')
  const [loading, setLoading] = useState(true)
  const [selectedEquipment, setSelectedEquipment] = useState(null)
  const [showMaintenanceModal, setShowMaintenanceModal] = useState(false)

  useEffect(() => {
    // Simulate loading equipment data
    setTimeout(() => {
      const mockEquipment = [
        {
          id: 1,
          equipmentId: 'E001',
          name: 'Ventilator',
          model: 'V60',
          manufacturer: 'Philips Respironics',
          category: 'respiratory',
          status: 'in_use',
          condition: 'excellent',
          location: 'ICU Room 1',
          bedNumber: '12',
          assignedPatient: 'P001',
          lastMaintenanceDate: '2024-01-01',
          nextMaintenanceDate: '2024-07-01',
          daysUntilMaintenance: 180,
          totalUsageHours: 2400,
          dailyUsageHours: 8
        },
        {
          id: 2,
          equipmentId: 'E002',
          name: 'Patient Monitor',
          model: 'IntelliVue MX40',
          manufacturer: 'Philips Healthcare',
          category: 'monitoring',
          status: 'available',
          condition: 'good',
          location: 'ICU Room 2',
          bedNumber: '8',
          assignedPatient: null,
          lastMaintenanceDate: '2024-01-15',
          nextMaintenanceDate: '2024-04-15',
          daysUntilMaintenance: 90,
          totalUsageHours: 1800,
          dailyUsageHours: 6
        },
        {
          id: 3,
          equipmentId: 'E003',
          name: 'Infusion Pump',
          model: 'Alaris PC',
          manufacturer: 'Becton Dickinson',
          category: 'monitoring',
          status: 'maintenance',
          condition: 'fair',
          location: 'ICU Room 3',
          bedNumber: '15',
          assignedPatient: 'P003',
          lastMaintenanceDate: '2024-01-10',
          nextMaintenanceDate: '2024-02-10',
          daysUntilMaintenance: 15,
          totalUsageHours: 3200,
          dailyUsageHours: 10
        },
        {
          id: 4,
          equipmentId: 'E004',
          name: 'ECG Machine',
          model: 'GE MAC 2000',
          manufacturer: 'General Electric',
          category: 'diagnostic',
          status: 'available',
          condition: 'excellent',
          location: 'ICU Storage',
          bedNumber: null,
          assignedPatient: null,
          lastMaintenanceDate: '2024-01-20',
          nextMaintenanceDate: '2024-07-20',
          daysUntilMaintenance: 200,
          totalUsageHours: 1200,
          dailyUsageHours: 4
        }
      ]
      
      setEquipment(mockEquipment)
      setFilteredEquipment(mockEquipment)
      setLoading(false)
    }, 1000)
  }, [])

  useEffect(() => {
    filterEquipment()
  }, [searchTerm, categoryFilter, statusFilter, equipment])

  const filterEquipment = () => {
    let filtered = equipment

    if (searchTerm) {
      filtered = filtered.filter(item => 
        item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.equipmentId.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.model.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.manufacturer.toLowerCase().includes(searchTerm.toLowerCase())
      )
    }

    if (categoryFilter !== 'all') {
      filtered = filtered.filter(item => item.category === categoryFilter)
    }

    if (statusFilter !== 'all') {
      filtered = filtered.filter(item => item.status === statusFilter)
    }

    setFilteredEquipment(filtered)
  }

  const getCategoryColor = (category) => {
    switch (category) {
      case 'monitoring': return 'bg-blue-100 text-blue-800'
      case 'respiratory': return 'bg-green-100 text-green-800'
      case 'cardiac': return 'bg-red-100 text-red-800'
      case 'surgical': return 'bg-purple-100 text-purple-800'
      case 'diagnostic': return 'bg-orange-100 text-orange-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const getStatusColor = (status) => {
    switch (status) {
      case 'available': return 'bg-success-100 text-success-800'
      case 'in_use': return 'bg-primary-100 text-primary-800'
      case 'maintenance': return 'bg-warning-100 text-warning-800'
      case 'out_of_order': return 'bg-danger-100 text-danger-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const getConditionColor = (condition) => {
    switch (condition) {
      case 'excellent': return 'bg-success-100 text-success-800'
      case 'good': return 'bg-blue-100 text-blue-800'
      case 'fair': return 'bg-warning-100 text-warning-800'
      case 'poor': return 'bg-danger-100 text-danger-800'
      case 'critical': return 'bg-red-800 text-white'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const getMaintenanceStatus = (daysUntil) => {
    if (daysUntil <= 7) return 'bg-danger-100 text-danger-800'
    if (daysUntil <= 30) return 'bg-warning-100 text-warning-800'
    if (daysUntil <= 90) return 'bg-blue-100 text-blue-800'
    return 'bg-success-100 text-success-800'
  }

  const getCategoryDisplayName = (category) => {
    switch (category) {
      case 'monitoring': return 'Monitoring'
      case 'respiratory': return 'Respiratory'
      case 'cardiac': return 'Cardiac'
      case 'surgical': return 'Surgical'
      case 'diagnostic': return 'Diagnostic'
      default: return category
    }
  }

  const EquipmentCard = ({ item }) => (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="card hover:shadow-md transition-shadow duration-200"
    >
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <div className="flex items-center space-x-3 mb-3">
            <h3 className="text-lg font-semibold text-gray-900">
              {item.name}
            </h3>
            <span className="text-sm text-gray-500">#{item.equipmentId}</span>
            <span className={`px-2 py-1 rounded-full text-xs font-medium ${getCategoryColor(item.category)}`}>
              {getCategoryDisplayName(item.category)}
            </span>
            <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(item.status)}`}>
              {item.status.replace('_', ' ').charAt(0).toUpperCase() + item.status.replace('_', ' ').slice(1)}
            </span>
          </div>
          
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
            <div className="text-center">
              <div className="text-lg font-semibold text-gray-900 mb-1">
                {item.model}
              </div>
              <span className="text-xs text-gray-500">Model</span>
            </div>
            
            <div className="text-center">
              <div className="text-lg font-semibold text-gray-900 mb-1">
                {item.totalUsageHours}h
              </div>
              <span className="text-xs text-gray-500">Total Usage</span>
            </div>
            
            <div className="text-center">
              <div className={`px-2 py-1 rounded-full text-xs font-medium ${getConditionColor(item.condition)}`}>
                {item.condition.charAt(0).toUpperCase() + item.condition.slice(1)}
              </div>
              <span className="text-xs text-gray-500 mt-1 block">Condition</span>
            </div>
            
            <div className="text-center">
              <div className={`px-2 py-1 rounded-full text-xs font-medium ${getMaintenanceStatus(item.daysUntilMaintenance)}`}>
                {item.daysUntilMaintenance} days
              </div>
              <span className="text-xs text-gray-500 mt-1 block">Until Maintenance</span>
            </div>
          </div>
          
          <div className="flex items-center justify-between text-sm text-gray-600">
            <div className="flex items-center space-x-2">
              <MapPin className="w-4 h-4" />
              <span>{item.location}</span>
              {item.bedNumber && <span>• Bed {item.bedNumber}</span>}
            </div>
            <span>{item.manufacturer}</span>
          </div>
        </div>
        
        <div className="ml-4 flex flex-col items-end space-y-2">
          <div className="flex space-x-2">
            <button
              onClick={() => {
                setSelectedEquipment(item)
                setShowMaintenanceModal(true)
              }}
              className="p-2 bg-warning-50 hover:bg-warning-100 rounded-lg transition-colors duration-200"
              title="Maintenance"
            >
              <Wrench className="w-4 h-4 text-warning-600" />
            </button>
            <button className="p-2 bg-primary-50 hover:bg-primary-100 rounded-lg transition-colors duration-200">
              <Eye className="w-4 h-4 text-primary-600" />
            </button>
            <button className="p-2 bg-gray-50 hover:bg-gray-100 rounded-lg transition-colors duration-200">
              <Edit className="w-4 h-4 text-gray-600" />
            </button>
          </div>
        </div>
      </div>
    </motion.div>
  )

  const MaintenanceModal = () => (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="bg-white rounded-xl p-6 max-w-4xl w-full mx-4 max-h-[90vh] overflow-y-auto"
      >
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold text-gray-900">Equipment Maintenance</h2>
          <button
            onClick={() => setShowMaintenanceModal(false)}
            className="text-gray-400 hover:text-gray-600"
          >
            ✕
          </button>
        </div>
        
        {selectedEquipment && (
          <div className="mb-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              {selectedEquipment.name} - {selectedEquipment.model}
            </h3>
            <p className="text-gray-600">{selectedEquipment.manufacturer}</p>
          </div>
        )}
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Maintenance History */}
          <div className="card">
            <h4 className="font-semibold text-gray-900 mb-4">Maintenance History</h4>
            <div className="space-y-3">
              <div className="p-3 bg-gray-50 rounded-lg">
                <div className="flex items-center justify-between mb-2">
                  <span className="font-medium text-gray-700">Preventive Maintenance</span>
                  <span className="text-sm text-gray-500">Jan 1, 2024</span>
                </div>
                <p className="text-sm text-gray-600">Routine inspection and calibration</p>
                <p className="text-xs text-gray-500 mt-1">Technician: John Smith</p>
              </div>
              
              <div className="p-3 bg-gray-50 rounded-lg">
                <div className="flex items-center justify-between mb-2">
                  <span className="font-medium text-gray-700">Calibration</span>
                  <span className="text-sm text-gray-500">Dec 15, 2023</span>
                </div>
                <p className="text-sm text-gray-600">Annual calibration check</p>
                <p className="text-xs text-gray-500 mt-1">Technician: Sarah Johnson</p>
              </div>
            </div>
          </div>
          
          {/* Maintenance Schedule */}
          <div className="card">
            <h4 className="font-semibold text-gray-900 mb-4">Maintenance Schedule</h4>
            <div className="space-y-4">
              <div className="p-3 bg-blue-50 rounded-lg">
                <div className="flex items-center space-x-2 mb-2">
                  <Calendar className="w-4 h-4 text-blue-600" />
                  <span className="font-medium text-blue-800">Next Maintenance</span>
                </div>
                <p className="text-sm text-blue-700">
                  {selectedEquipment?.nextMaintenanceDate} 
                  ({selectedEquipment?.daysUntilMaintenance} days from now)
                </p>
              </div>
              
              <div className="p-3 bg-green-50 rounded-lg">
                <div className="flex items-center space-x-2 mb-2">
                  <Settings className="w-4 h-4 text-green-600" />
                  <span className="font-medium text-green-800">Maintenance Type</span>
                </div>
                <p className="text-sm text-green-700">Preventive maintenance and calibration</p>
              </div>
              
              <div className="p-3 bg-orange-50 rounded-lg">
                <div className="flex items-center space-x-2 mb-2">
                  <Activity className="w-4 h-4 text-orange-600" />
                  <span className="font-medium text-orange-800">Usage Hours</span>
                </div>
                <p className="text-sm text-orange-700">
                  {selectedEquipment?.totalUsageHours} total hours
                </p>
              </div>
            </div>
          </div>
        </div>
        
        {/* Quick Actions */}
        <div className="mt-6">
          <div className="card">
            <h4 className="font-semibold text-gray-900 mb-4">Quick Actions</h4>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <button className="btn-primary text-sm">
                Schedule Maintenance
              </button>
              <button className="btn-secondary text-sm">
                Request Service
              </button>
              <button className="btn-secondary text-sm">
                View Manual
              </button>
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  )

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading equipment...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <h1 className="text-2xl font-bold text-gray-900">Equipment Management</h1>
            <button className="btn-primary flex items-center space-x-2">
              <Plus className="w-4 h-4" />
              <span>Add Equipment</span>
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Stats Overview */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="card text-center">
            <Settings className="w-8 h-8 text-primary-600 mx-auto mb-2" />
            <div className="text-2xl font-bold text-gray-900">{equipment.length}</div>
            <div className="text-sm text-gray-600">Total Equipment</div>
          </div>
          
          <div className="card text-center">
            <Activity className="w-8 h-8 text-success-600 mx-auto mb-2" />
            <div className="text-2xl font-bold text-gray-900">
              {equipment.filter(e => e.status === 'available').length}
            </div>
            <div className="text-sm text-gray-600">Available</div>
          </div>
          
          <div className="card text-center">
            <AlertTriangle className="w-8 h-8 text-warning-600 mx-auto mb-2" />
            <div className="text-2xl font-bold text-gray-900">
              {equipment.filter(e => e.daysUntilMaintenance <= 30).length}
            </div>
            <div className="text-sm text-gray-600">Maintenance Due</div>
          </div>
          
          <div className="card text-center">
            <Wrench className="w-8 h-8 text-danger-600 mx-auto mb-2" />
            <div className="text-2xl font-bold text-gray-900">
              {equipment.filter(e => e.status === 'maintenance').length}
            </div>
            <div className="text-sm text-gray-600">Under Maintenance</div>
          </div>
        </div>

        {/* Search and Filters */}
        <div className="mb-8">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="text"
                placeholder="Search equipment by name, ID, or model..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="input-field pl-10"
              />
            </div>
            
            <select
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
              className="input-field md:w-40"
            >
              <option value="all">All Categories</option>
              <option value="monitoring">Monitoring</option>
              <option value="respiratory">Respiratory</option>
              <option value="cardiac">Cardiac</option>
              <option value="surgical">Surgical</option>
              <option value="diagnostic">Diagnostic</option>
            </select>
            
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="input-field md:w-40"
            >
              <option value="all">All Statuses</option>
              <option value="available">Available</option>
              <option value="in_use">In Use</option>
              <option value="maintenance">Maintenance</option>
              <option value="out_of_order">Out of Order</option>
            </select>
            
            <button className="btn-secondary flex items-center space-x-2">
              <Filter className="w-4 h-4" />
              <span>More Filters</span>
            </button>
          </div>
        </div>

        {/* Equipment Count */}
        <div className="mb-6">
          <p className="text-gray-600">
            Showing {filteredEquipment.length} of {equipment.length} equipment items
          </p>
        </div>

        {/* Equipment Grid */}
        <div className="space-y-6">
          {filteredEquipment.map((item) => (
            <EquipmentCard key={item.id} item={item} />
          ))}
          
          {filteredEquipment.length === 0 && (
            <div className="text-center py-12">
              <p className="text-gray-500">No equipment found matching your criteria.</p>
            </div>
          )}
        </div>
      </div>

      {showMaintenanceModal && <MaintenanceModal />}
    </div>
  )
}

