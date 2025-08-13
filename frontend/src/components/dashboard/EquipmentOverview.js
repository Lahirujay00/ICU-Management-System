'use client'

import { useState, useEffect } from 'react'
import { 
  Stethoscope, 
  AlertTriangle, 
  CheckCircle, 
  Clock, 
  Plus,
  Wrench,
  Battery,
  Activity
} from 'lucide-react'
import { apiClient } from '@/lib/api'

export default function EquipmentOverview({ detailed = false }) {
  const [equipment, setEquipment] = useState([])
  const [isLoading, setIsLoading] = useState(true)
  const [filterStatus, setFilterStatus] = useState('all')

  useEffect(() => {
    loadEquipment()
  }, [])

  const loadEquipment = async () => {
    try {
      const data = await apiClient.getEquipment()
      setEquipment(data)
      setIsLoading(false)
    } catch (error) {
      console.error('Error loading equipment:', error)
      setIsLoading(false)
    }
  }

  const filteredEquipment = equipment.filter(item => {
    if (filterStatus === 'all') return true
    return item.status === filterStatus
  })

  const availableEquipment = equipment.filter(item => item.status === 'available')
  const inUseEquipment = equipment.filter(item => item.status === 'in_use')
  const maintenanceEquipment = equipment.filter(item => item.status === 'maintenance')
  const lowStockEquipment = equipment.filter(item => item.quantity < item.minQuantity)

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Equipment Overview</h2>
          <p className="text-gray-600">Monitor medical equipment and inventory status</p>
        </div>
        <button className="btn-primary flex items-center gap-2">
          <Plus className="w-4 h-4" />
          Add Equipment
        </button>
      </div>

      {/* Status Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="card bg-gradient-to-r from-blue-50 to-blue-100 border-blue-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-blue-600">Total Equipment</p>
              <p className="text-2xl font-bold text-blue-900">{equipment.length}</p>
            </div>
            <Stethoscope className="w-8 h-8 text-blue-600" />
          </div>
        </div>

        <div className="card bg-gradient-to-r from-green-50 to-green-100 border-green-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-green-600">Available</p>
              <p className="text-2xl font-bold text-green-900">{availableEquipment.length}</p>
            </div>
            <CheckCircle className="w-8 h-8 text-green-600" />
          </div>
        </div>

        <div className="card bg-gradient-to-r from-yellow-50 to-yellow-100 border-yellow-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-yellow-600">In Use</p>
              <p className="text-2xl font-bold text-yellow-900">{inUseEquipment.length}</p>
            </div>
            <Activity className="w-8 h-8 text-yellow-600" />
          </div>
        </div>

        <div className="card bg-gradient-to-r from-red-50 to-red-100 border-red-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-red-600">Maintenance</p>
              <p className="text-2xl font-bold text-red-900">{maintenanceEquipment.length}</p>
            </div>
            <Wrench className="w-8 h-8 text-red-600" />
          </div>
        </div>
      </div>

      {/* Filter Controls */}
      <div className="flex gap-2">
        <button
          onClick={() => setFilterStatus('all')}
          className={`px-4 py-2 rounded-lg text-sm font-medium ${
            filterStatus === 'all' 
              ? 'bg-blue-600 text-white' 
              : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
          }`}
        >
          All ({equipment.length})
        </button>
        <button
          onClick={() => setFilterStatus('available')}
          className={`px-4 py-2 rounded-lg text-sm font-medium ${
            filterStatus === 'available' 
              ? 'bg-green-600 text-white' 
              : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
          }`}
        >
          Available ({availableEquipment.length})
        </button>
        <button
          onClick={() => setFilterStatus('in_use')}
          className={`px-4 py-2 rounded-lg text-sm font-medium ${
            filterStatus === 'in_use' 
              ? 'bg-yellow-600 text-white' 
              : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
          }`}
        >
          In Use ({inUseEquipment.length})
        </button>
        <button
          onClick={() => setFilterStatus('maintenance')}
          className={`px-4 py-2 rounded-lg text-sm font-medium ${
            filterStatus === 'maintenance' 
              ? 'bg-red-600 text-white' 
              : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
          }`}
        >
          Maintenance ({maintenanceEquipment.length})
        </button>
      </div>

      {/* Equipment Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
        {filteredEquipment.map((item) => (
          <div key={item._id} className="card hover:shadow-lg transition-shadow duration-200">
            {/* Equipment Header */}
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                  <Stethoscope className="w-6 h-6 text-blue-600" />
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900">{item.name}</h3>
                  <p className="text-sm text-gray-500">{item.category}</p>
                </div>
              </div>
              <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                item.status === 'available' ? 'bg-green-100 text-green-800 border border-green-300' :
                item.status === 'in_use' ? 'bg-yellow-100 text-yellow-800 border border-yellow-300' :
                item.status === 'maintenance' ? 'bg-red-100 text-red-800 border border-red-300' :
                'bg-gray-100 text-gray-800 border border-gray-300'
              }`}>
                {item.status.replace('_', ' ')}
              </span>
            </div>

            {/* Equipment Details */}
            <div className="space-y-3 text-sm">
              <div className="flex items-center justify-between">
                <span className="text-gray-600">Quantity:</span>
                <span className={`font-medium ${
                  item.quantity < item.minQuantity ? 'text-red-600' : 'text-gray-900'
                }`}>
                  {item.quantity} / {item.maxQuantity}
                </span>
              </div>
              
              <div className="flex items-center justify-between">
                <span className="text-gray-600">Location:</span>
                <span className="font-medium text-gray-900">{item.location}</span>
              </div>

              {item.lastMaintenance && (
                <div className="flex items-center gap-2">
                  <Wrench className="w-4 h-4 text-gray-400" />
                  <span className="text-gray-600">Last Maintenance: {new Date(item.lastMaintenance).toLocaleDateString()}</span>
                </div>
              )}

              {item.nextMaintenance && (
                <div className="flex items-center gap-2">
                  <Clock className="w-4 h-4 text-gray-400" />
                  <span className="text-gray-600">Next Maintenance: {new Date(item.nextMaintenance).toLocaleDateString()}</span>
                </div>
              )}

              {item.batteryLevel && (
                <div className="flex items-center gap-2">
                  <Battery className="w-4 h-4 text-gray-400" />
                  <span className="text-gray-600">Battery: {item.batteryLevel}%</span>
                </div>
              )}
            </div>

            {/* Equipment Actions */}
            <div className="mt-4 pt-4 border-t border-gray-200">
              <div className="flex gap-2">
                {item.status === 'available' && (
                  <button className="flex-1 px-3 py-2 text-xs bg-blue-100 text-blue-800 rounded hover:bg-blue-200">
                    Check Out
                  </button>
                )}
                {item.status === 'in_use' && (
                  <button className="flex-1 px-3 py-2 text-xs bg-green-100 text-green-800 rounded hover:bg-green-200">
                    Return
                  </button>
                )}
                {item.status === 'maintenance' && (
                  <button className="flex-1 px-3 py-2 text-xs bg-yellow-100 text-yellow-800 rounded hover:bg-yellow-200">
                    Complete
                  </button>
                )}
                <button className="flex-1 px-3 py-2 text-xs bg-gray-100 text-gray-800 rounded hover:bg-gray-200">
                  Details
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Low Stock Alerts */}
      {lowStockEquipment.length > 0 && (
        <div className="card bg-red-50 border border-red-200">
          <div className="flex items-center gap-3 mb-4">
            <AlertTriangle className="w-6 h-6 text-red-600" />
            <h3 className="text-lg font-semibold text-red-900">Low Stock Alerts</h3>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {lowStockEquipment.map((item) => (
              <div key={item._id} className="bg-white p-3 rounded-lg border border-red-200">
                <div className="flex items-center justify-between">
                  <span className="font-medium text-red-900">{item.name}</span>
                  <span className="text-sm text-red-600">
                    {item.quantity} remaining
                  </span>
                </div>
                <p className="text-xs text-red-600 mt-1">
                  Min quantity: {item.minQuantity}
                </p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Quick Actions */}
      <div className="card bg-gray-50">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <button className="p-4 bg-white rounded-lg border border-gray-200 hover:border-blue-300 hover:shadow-md transition-all duration-200">
            <div className="text-center">
              <Plus className="w-6 h-6 text-blue-600 mx-auto mb-2" />
              <span className="text-sm font-medium text-gray-700">Add Equipment</span>
            </div>
          </button>
          
          <button className="p-4 bg-white rounded-lg border border-gray-200 hover:border-green-300 hover:shadow-md transition-all duration-200">
            <div className="text-center">
              <Wrench className="w-6 h-6 text-green-600 mx-auto mb-2" />
              <span className="text-sm font-medium text-gray-700">Schedule Maintenance</span>
            </div>
          </button>
          
          <button className="p-4 bg-white rounded-lg border border-gray-200 hover:border-yellow-300 hover:shadow-md transition-all duration-200">
            <div className="text-center">
              <Activity className="w-6 h-6 text-yellow-600 mx-auto mb-2" />
              <span className="text-sm font-medium text-gray-700">Check Out</span>
            </div>
          </button>
          
          <button className="p-4 bg-white rounded-lg border border-gray-200 hover:border-purple-300 hover:shadow-md transition-all duration-200">
            <div className="text-center">
              <CheckCircle className="w-6 h-6 text-purple-600 mx-auto mb-2" />
              <span className="text-sm font-medium text-gray-700">Inventory Report</span>
            </div>
          </button>
        </div>
      </div>
    </div>
  )
} 