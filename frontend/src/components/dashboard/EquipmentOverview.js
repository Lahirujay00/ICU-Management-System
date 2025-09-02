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
  Activity,
  Settings
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
      // Use mock data if API fails
      const mockData = apiClient.getMockEquipment()
      setEquipment(mockData)
      setIsLoading(false)
    }
  }

  const handleEquipmentAction = async (equipmentId, action) => {
    try {
      console.log(`Performing ${action} on equipment ${equipmentId}`)
      
      // Handle special actions first
      if (action === 'add') {
        console.log('Opening add equipment modal...')
        // Here you would open a modal to add new equipment
        return
      }
      
      if (action === 'details') {
        console.log(`Opening details for equipment ${equipmentId}`)
        // Here you would open a modal with equipment details
        return
      }
      
      // Update equipment status locally for immediate feedback
      setEquipment(prevEquipment => 
        prevEquipment.map(item => {
          if (item._id === equipmentId) {
            switch (action) {
              case 'checkout':
                console.log(`Checking out ${item.name}...`)
                return { ...item, status: 'in_use' }
              case 'return':
                console.log(`Returning ${item.name}...`)
                return { ...item, status: 'available' }
              case 'maintenance':
                console.log(`Sending ${item.name} for maintenance...`)
                return { ...item, status: 'maintenance' }
              case 'complete':
                console.log(`Completing maintenance for ${item.name}...`)
                return { ...item, status: 'available' }
              case 'repair':
                console.log(`Scheduling repair for ${item.name}...`)
                return { ...item, status: 'maintenance' }
              case 'reorder':
                console.log(`Requesting reorder for ${item.name}...`)
                // Don't change status for reorder
                return item
              default:
                return item
            }
          }
          return item
        })
      )

      // Here you would normally make API calls to update the equipment status
      // await apiClient.updateEquipmentStatus(equipmentId, newStatus)
      
      // Show success message (you could add toast notifications here)
      const actionMessages = {
        checkout: 'Equipment checked out successfully',
        return: 'Equipment returned successfully',
        maintenance: 'Equipment sent for maintenance',
        complete: 'Maintenance completed successfully',
        repair: 'Repair scheduled successfully',
        reorder: 'Reorder request submitted'
      }
      
      console.log(actionMessages[action] || 'Action completed')
      
    } catch (error) {
      console.error('Error performing equipment action:', error)
      // Revert the local change if API call fails
      loadEquipment()
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

      {/* Equipment List - Clean Professional Layout */}
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
            <div className="col-span-2 text-xs font-medium text-gray-500 uppercase tracking-wide">Status</div>
            <div className="col-span-2 text-xs font-medium text-gray-500 uppercase tracking-wide">Location</div>
            <div className="col-span-2 text-xs font-medium text-gray-500 uppercase tracking-wide">Actions</div>
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

                {/* Status & Maintenance */}
                <div className="col-span-2">
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
                    {item.nextMaintenance && (
                      <div className="text-xs">
                        <div className={`flex items-center gap-1 ${
                          new Date(item.nextMaintenance) < new Date() ? 'text-red-600' : 'text-gray-500'
                        }`}>
                          <Wrench className="w-3 h-3" />
                          <span className="font-medium">
                            {new Date(item.nextMaintenance) < new Date() ? 'Overdue' : 'Next Service'}
                          </span>
                        </div>
                        <div className="text-gray-500 text-xs pl-4">
                          {new Date(item.nextMaintenance).toLocaleDateString()}
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                {/* Location */}
                <div className="col-span-2">
                  <div className="space-y-1">
                    <p className="text-sm font-medium text-gray-900">{item.location}</p>
                  </div>
                </div>

                {/* Actions */}
                <div className="col-span-2">
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
                          onClick={() => handleEquipmentAction(item._id, 'details')}
                          className="inline-flex items-center p-1.5 text-xs font-medium text-gray-600 bg-gray-100 border border-gray-300 rounded hover:bg-gray-200 transition-colors"
                          title="Details"
                        >
                          <Plus className="w-3 h-3" />
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
                          onClick={() => handleEquipmentAction(item._id, 'details')}
                          className="inline-flex items-center p-1.5 text-xs font-medium text-gray-600 bg-gray-100 border border-gray-300 rounded hover:bg-gray-200 transition-colors"
                          title="Details"
                        >
                          <Plus className="w-3 h-3" />
                        </button>
                      </>
                    )}

                    {item.status === 'out_of_order' && (
                      <button 
                        onClick={() => handleEquipmentAction(item._id, 'repair')}
                        className="inline-flex items-center px-2.5 py-1.5 text-xs font-medium text-white bg-gray-600 border border-gray-600 rounded hover:bg-gray-700 transition-colors"
                      >
                        <Wrench className="w-3 h-3 mr-1" />
                        Repair
                      </button>
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

      {/* Low Stock Alerts - Enhanced */}
      {lowStockEquipment.length > 0 && (
        <div className="bg-gradient-to-r from-red-50 to-orange-50 border border-red-200 rounded-xl p-6 shadow-sm">
          <div className="flex items-center mb-4">
            <div className="flex items-center justify-center w-10 h-10 bg-red-100 rounded-lg mr-3">
              <AlertTriangle className="w-6 h-6 text-red-600" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-red-900">Critical Stock Alerts</h3>
              <p className="text-sm text-red-600">Equipment requiring immediate attention</p>
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {lowStockEquipment.map((item) => (
              <div key={item._id} className="bg-white p-4 rounded-lg border border-red-200 hover:shadow-md transition-shadow">
                <div className="flex items-center justify-between mb-2">
                  <span className="font-semibold text-red-900">{item.name}</span>
                  <span className="text-sm font-bold text-red-600 bg-red-100 px-2 py-1 rounded-full">
                    {item.quantity} left
                  </span>
                </div>
                <p className="text-xs text-red-600 mb-3">
                  Minimum required: {item.minQuantity}
                </p>
                <button 
                  onClick={() => handleEquipmentAction(item._id, 'reorder')}
                  className="w-full inline-flex items-center justify-center px-3 py-2 text-xs font-medium text-white bg-red-600 rounded-lg hover:bg-red-700 transition-colors"
                >
                  <Plus className="w-3 h-3 mr-2" />
                  Request Reorder
                </button>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
} 