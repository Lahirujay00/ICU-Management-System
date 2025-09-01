'use client'

import { useState, useEffect } from 'react'
import { 
  Bed, 
  User, 
  Clock, 
  AlertTriangle, 
  CheckCircle, 
  XCircle,
  Plus,
  Filter,
  UserPlus,
  Settings
} from 'lucide-react'
import { apiClient } from '@/lib/api'
import AddBedModal from '@/components/beds/AddBedModal'
import PatientAssignmentModal from '@/components/beds/PatientAssignmentModal'

export default function BedManagement() {
  const [beds, setBeds] = useState([])
  const [patients, setPatients] = useState([])
  const [isLoading, setIsLoading] = useState(true)
  const [filterStatus, setFilterStatus] = useState('all')
  const [isAddBedModalOpen, setIsAddBedModalOpen] = useState(false)
  const [isAssignPatientModalOpen, setIsAssignPatientModalOpen] = useState(false)
  const [selectedBed, setSelectedBed] = useState(null)
  const [selectedBedForAssignment, setSelectedBedForAssignment] = useState(null)

  useEffect(() => {
    loadBedsAndPatients()
  }, [])

  const loadBedsAndPatients = async () => {
    try {
      const [bedsData, patientsData] = await Promise.all([
        apiClient.getBeds(),
        apiClient.getPatients()
      ])
      setBeds(bedsData)
      setPatients(patientsData)
      setIsLoading(false)
    } catch (error) {
      console.error('Error loading beds and patients:', error)
      setIsLoading(false)
    }
  }

  const handleBedAdded = (newBed) => {
    setBeds(prevBeds => [...prevBeds, newBed])
  }

  const handlePatientAssigned = () => {
    loadBedsAndPatients() // Reload data to get updated bed and patient info
    setIsAssignPatientModalOpen(false)
    setSelectedBedForAssignment(null)
  }

  const openPatientAssignmentModal = (bed) => {
    setSelectedBedForAssignment(bed)
    setIsAssignPatientModalOpen(true)
  }

  const getBedStatusColor = (status) => {
    switch (status) {
      case 'available':
        return 'bg-green-100 border-green-300 text-green-800'
      case 'occupied':
        return 'bg-red-100 border-red-300 text-red-800'
      case 'cleaning':
        return 'bg-yellow-100 border-yellow-300 text-yellow-800'
      case 'maintenance':
        return 'bg-blue-100 border-blue-300 text-blue-800'
      default:
        return 'bg-gray-100 border-gray-300 text-gray-800'
    }
  }

  const getBedStatusIcon = (status) => {
    switch (status) {
      case 'available':
        return <CheckCircle className="w-5 h-5 text-green-600" />
      case 'occupied':
        return <User className="w-5 h-5 text-red-600" />
      case 'cleaning':
        return <Clock className="w-5 h-5 text-yellow-600" />
      case 'maintenance':
        return <AlertTriangle className="w-5 h-5 text-blue-600" />
      default:
        return <Bed className="w-5 h-5 text-gray-600" />
    }
  }

  const handlePatientDischarge = async (bedId) => {
    try {
      await apiClient.dischargePatientFromBed(bedId)
      await loadBedsAndPatients()
    } catch (error) {
      console.error('Error discharging patient from bed:', error)
    }
  }

  const handleBedStatusChange = async (bedId, newStatus) => {
    try {
      await apiClient.updateBedStatus(bedId, newStatus)
      await loadBedsAndPatients()
    } catch (error) {
      console.error('Error updating bed status:', error)
    }
  }

  const filteredBeds = beds.filter(bed => {
    if (filterStatus === 'all') return true
    return bed.status === filterStatus
  })

  const availableBeds = beds.filter(bed => bed.status === 'available')
  const occupiedBeds = beds.filter(bed => bed.status === 'occupied')
  const cleaningBeds = beds.filter(bed => bed.status === 'cleaning')
  const maintenanceBeds = beds.filter(bed => bed.status === 'maintenance')

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
          <h2 className="text-2xl font-bold text-gray-900">ICU Bed Management</h2>
          <p className="text-gray-600">Monitor ICU bed availability and patient assignments</p>
        </div>
        <div className="flex gap-3">
          <button
            onClick={() => setIsAddBedModalOpen(true)}
            className="btn-primary flex items-center gap-2"
          >
            <Plus className="w-4 h-4" />
            Add Bed
          </button>
        </div>
      </div>

      {/* Bed Status Summary */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="card bg-gradient-to-r from-green-50 to-green-100 border-green-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-green-600">Available</p>
              <p className="text-2xl font-bold text-green-900">{availableBeds.length}</p>
            </div>
            <CheckCircle className="w-8 h-8 text-green-600" />
          </div>
        </div>

        <div className="card bg-gradient-to-r from-red-50 to-red-100 border-red-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-red-600">Occupied</p>
              <p className="text-2xl font-bold text-red-900">{occupiedBeds.length}</p>
            </div>
            <User className="w-8 h-8 text-red-600" />
          </div>
        </div>

        <div className="card bg-gradient-to-r from-yellow-50 to-yellow-100 border-yellow-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-yellow-600">Cleaning</p>
              <p className="text-2xl font-bold text-yellow-900">{cleaningBeds.length}</p>
            </div>
            <Clock className="w-8 h-8 text-yellow-600" />
          </div>
        </div>

        <div className="card bg-gradient-to-r from-blue-50 to-blue-100 border-blue-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-blue-600">Maintenance</p>
              <p className="text-2xl font-bold text-blue-900">{maintenanceBeds.length}</p>
            </div>
            <AlertTriangle className="w-8 h-8 text-blue-600" />
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
          All ({beds.length})
        </button>
        <button
          onClick={() => setFilterStatus('available')}
          className={`px-4 py-2 rounded-lg text-sm font-medium ${
            filterStatus === 'available' 
              ? 'bg-green-600 text-white' 
              : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
          }`}
        >
          Available ({availableBeds.length})
        </button>
        <button
          onClick={() => setFilterStatus('occupied')}
          className={`px-4 py-2 rounded-lg text-sm font-medium ${
            filterStatus === 'occupied' 
              ? 'bg-red-600 text-white' 
              : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
          }`}
        >
          Occupied ({occupiedBeds.length})
        </button>
        <button
          onClick={() => setFilterStatus('cleaning')}
          className={`px-4 py-2 rounded-lg text-sm font-medium ${
            filterStatus === 'cleaning' 
              ? 'bg-yellow-600 text-white' 
              : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
          }`}
        >
          Cleaning ({cleaningBeds.length})
        </button>
        <button
          onClick={() => setFilterStatus('maintenance')}
          className={`px-4 py-2 rounded-lg text-sm font-medium ${
            filterStatus === 'maintenance' 
              ? 'bg-blue-600 text-white' 
              : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
          }`}
        >
          Maintenance ({maintenanceBeds.length})
        </button>
      </div>

      {/* Bed Display - Simple List View */}
      <div className="space-y-4">
        {/* Grid Layout */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {filteredBeds.map((bed) => (
            <div
              key={bed._id}
              className={`card cursor-pointer transition-all duration-200 hover:shadow-lg ${
                selectedBed?._id === bed._id ? 'ring-2 ring-blue-500' : ''
              }`}
              onClick={() => setSelectedBed(bed)}
            >
              {/* Bed Header */}
              <div className="flex items-center justify-between mb-3">
                <h3 className="font-semibold text-gray-900">{bed.number}</h3>
                <span className={`px-2 py-1 rounded-full text-xs font-medium border ${getBedStatusColor(bed.status)}`}>
                  {bed.status}
                </span>
              </div>

              {/* Bed Status Icon */}
              <div className="flex justify-center mb-3">
                {getBedStatusIcon(bed.status)}
              </div>

              {/* Patient Information */}
              <div className="space-y-2 text-sm">
                {bed.patient ? (
                  <div className="space-y-1">
                    <p className="font-medium text-gray-900">{bed.patient.name}</p>
                    <p className="text-gray-600">MRN: {bed.patient.medicalRecordNumber}</p>
                    <p className="text-gray-600">Admitted: {new Date(bed.patient.admissionDate).toLocaleDateString()}</p>
                    <span className={`inline-block px-2 py-1 rounded text-xs font-medium ${
                      bed.patient.status === 'critical' ? 'bg-red-100 text-red-800' :
                      bed.patient.status === 'stable' ? 'bg-green-100 text-green-800' :
                      'bg-yellow-100 text-yellow-800'
                    }`}>
                      {bed.patient.status}
                    </span>
                  </div>
                ) : (
                  <div className="text-center text-gray-500">
                    <p>No patient assigned</p>
                    {bed.status === 'available' && (
                      <button
                        onClick={(e) => {
                          e.stopPropagation()
                          openPatientAssignmentModal(bed)
                        }}
                        className="mt-2 text-xs text-blue-600 hover:text-blue-800 underline flex items-center gap-1 mx-auto"
                      >
                        <UserPlus className="w-3 h-3" />
                        Assign Patient
                      </button>
                    )}
                  </div>
                )}
              </div>

              {/* Bed Actions */}
              <div className="mt-3 pt-3 border-t border-gray-200">
                <div className="flex gap-2">
                  {bed.patient && bed.status === 'occupied' && (
                    <button
                      onClick={(e) => {
                        e.stopPropagation()
                        handlePatientDischarge(bed._id)
                      }}
                      className="flex-1 px-2 py-1 text-xs bg-orange-100 text-orange-800 rounded hover:bg-orange-200"
                    >
                      Discharge & Clean
                    </button>
                  )}
                  {bed.status === 'cleaning' && (
                    <button
                      onClick={(e) => {
                        e.stopPropagation()
                        handleBedStatusChange(bed._id, 'available')
                      }}
                      className="flex-1 px-2 py-1 text-xs bg-green-100 text-green-800 rounded hover:bg-green-200"
                    >
                      Mark Available
                    </button>
                  )}
                  {bed.status === 'available' && (
                    <button
                      onClick={(e) => {
                        e.stopPropagation()
                        handleBedStatusChange(bed._id, 'maintenance')
                      }}
                      className="flex-1 px-2 py-1 text-xs bg-blue-100 text-blue-800 rounded hover:bg-blue-200"
                    >
                      Maintenance
                    </button>
                  )}
                  {bed.status === 'maintenance' && (
                    <button
                      onClick={(e) => {
                        e.stopPropagation()
                        handleBedStatusChange(bed._id, 'available')
                      }}
                      className="flex-1 px-2 py-1 text-xs bg-green-100 text-green-800 rounded hover:bg-green-200"
                    >
                      Complete Maintenance
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>      {/* Bed Details Sidebar */}
      {selectedBed && (
        <div className="fixed inset-y-0 right-0 w-96 bg-white shadow-xl border-l border-gray-200 overflow-y-auto">
          <div className="p-6">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold">Bed {selectedBed.number} Details</h3>
              <button
                onClick={() => setSelectedBed(null)}
                className="text-gray-400 hover:text-gray-600"
              >
                <XCircle className="w-5 h-5" />
              </button>
            </div>
            
            {/* Bed Details Content */}
            <div className="space-y-4">
              <div>
                <h4 className="font-medium text-gray-900 mb-2">Status</h4>
                <select
                  value={selectedBed.status}
                  onChange={(e) => handleBedStatusChange(selectedBed._id, e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md"
                >
                  <option value="available">Available</option>
                  <option value="occupied">Occupied</option>
                  <option value="cleaning">Cleaning</option>
                  <option value="maintenance">Maintenance</option>
                </select>
              </div>

              {selectedBed.patient && (
                <div>
                  <h4 className="font-medium text-gray-900 mb-2">Patient Information</h4>
                  <div className="bg-gray-50 p-3 rounded-md">
                    <p><strong>Name:</strong> {selectedBed.patient.name}</p>
                    <p><strong>Age:</strong> {selectedBed.patient.age}</p>
                    <p><strong>Diagnosis:</strong> {selectedBed.patient.diagnosis}</p>
                    <p><strong>Status:</strong> {selectedBed.patient.status}</p>
                    <p><strong>Admitted:</strong> {new Date(selectedBed.patient.admissionDate).toLocaleDateString()}</p>
                  </div>
                </div>
              )}

              <div>
                <h4 className="font-medium text-gray-900 mb-2">Bed History</h4>
                <div className="bg-gray-50 p-3 rounded-md text-sm">
                  <p><strong>Last Updated:</strong> {new Date(selectedBed.updatedAt).toLocaleString()}</p>
                  <p><strong>Room:</strong> {selectedBed.roomNumber}</p>
                  <p><strong>Floor:</strong> {selectedBed.floor}</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Add Bed Modal */}
      <AddBedModal 
        isOpen={isAddBedModalOpen}
        onClose={() => setIsAddBedModalOpen(false)}
        onBedAdded={handleBedAdded}
      />

      {/* Patient Assignment Modal */}
      <PatientAssignmentModal 
        isOpen={isAssignPatientModalOpen}
        onClose={() => {
          setIsAssignPatientModalOpen(false)
          setSelectedBedForAssignment(null)
        }}
        bed={selectedBedForAssignment}
        onPatientAssigned={handlePatientAssigned}
      />
    </div>
  )
} 