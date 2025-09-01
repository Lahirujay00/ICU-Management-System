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

      {/* ICU Bed List - Auto-assigned from Patient Table */}
      <div className="space-y-4">
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
          <div className="px-6 py-4 bg-gray-50 border-b border-gray-200">
            <h3 className="text-lg font-semibold text-gray-900">ICU Bed List</h3>
            <p className="text-sm text-gray-600 mt-1">Patient assignments automatically synchronized from patient records</p>
          </div>
          
          <div className="divide-y divide-gray-200">
            {filteredBeds.map((bed, index) => (
              <div
                key={bed._id}
                className={`flex items-start px-6 py-6 hover:bg-gray-50 transition-colors border-l-4 ${
                  selectedBed?._id === bed._id 
                    ? 'bg-blue-50 border-l-blue-500' 
                    : bed.patient 
                      ? 'border-l-green-500' 
                      : 'border-l-gray-300'
                }`}
                onClick={() => setSelectedBed(bed)}
              >
                {/* Bed Number */}
                <div className="flex-shrink-0 w-16">
                  <div className="flex items-center justify-center w-12 h-12 bg-gray-100 rounded-lg">
                    <Bed className="w-6 h-6 text-gray-600" />
                  </div>
                </div>

                {/* Bed Info */}
                <div className="flex-shrink-0 ml-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="text-xl font-semibold text-gray-900">Bed {bed.number}</h4>
                      <p className="text-sm text-gray-500">ICU Unit</p>
                    </div>
                    <div className="text-right">
                      <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium border ${getBedStatusColor(bed.status)}`}>
                        {bed.status}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Patient Assignment (Auto from Patient Table) */}
                <div className="flex-1 min-w-0 ml-6">
                  {bed.patient ? (
                    <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                      <div className="flex items-center justify-between mb-2">
                        <h5 className="text-lg font-semibold text-gray-900">{bed.patient.name}</h5>
                        <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-semibold ${
                          bed.patient.status === 'critical' ? 'bg-red-100 text-red-800 border border-red-200' :
                          bed.patient.status === 'stable' ? 'bg-green-100 text-green-800 border border-green-200' :
                          bed.patient.status === 'moderate' ? 'bg-yellow-100 text-yellow-800 border border-yellow-200' :
                          'bg-gray-100 text-gray-800 border border-gray-200'
                        }`}>
                          {bed.patient.status}
                        </span>
                      </div>
                      <div className="grid grid-cols-2 gap-4 text-sm">
                        <div>
                          <span className="font-medium text-gray-600">MRN:</span>
                          <span className="ml-2 text-gray-900">{bed.patient.medicalRecordNumber}</span>
                        </div>
                        <div>
                          <span className="font-medium text-gray-600">Age:</span>
                          <span className="ml-2 text-gray-900">{bed.patient.age} years</span>
                        </div>
                        <div>
                          <span className="font-medium text-gray-600">Admitted:</span>
                          <span className="ml-2 text-gray-900">{new Date(bed.patient.admissionDate).toLocaleDateString()}</span>
                        </div>
                        <div>
                          <span className="font-medium text-gray-600">Days:</span>
                          <span className="ml-2 text-gray-900">{Math.ceil((new Date() - new Date(bed.patient.admissionDate)) / (1000 * 60 * 60 * 24))} days</span>
                        </div>
                      </div>
                      <div className="mt-2 pt-2 border-t border-gray-200">
                        <span className="font-medium text-gray-600">Diagnosis:</span>
                        <p className="text-sm text-gray-900 mt-1">{bed.patient.diagnosis}</p>
                      </div>
                    </div>
                  ) : (
                    <div className="bg-gray-50 rounded-lg p-4 border border-gray-200 border-dashed">
                      <div className="text-center">
                        <div className="flex items-center justify-center mb-2">
                          <User className="w-8 h-8 text-gray-400" />
                        </div>
                        <p className="text-gray-500 font-medium">No patient assigned</p>
                        <p className="text-xs text-gray-400 mt-1">Auto-assigned when patient is admitted</p>
                        {bed.status === 'available' && (
                          <button
                            onClick={(e) => {
                              e.stopPropagation()
                              openPatientAssignmentModal(bed)
                            }}
                            className="mt-3 inline-flex items-center px-3 py-1.5 text-xs font-medium text-blue-600 bg-blue-50 border border-blue-200 rounded-md hover:bg-blue-100 transition-colors"
                          >
                            <UserPlus className="w-3 h-3 mr-1" />
                            Assign Patient
                          </button>
                        )}
                      </div>
                    </div>
                  )}
                </div>

                {/* Actions */}
                <div className="flex-shrink-0 ml-6">
                  <div className="flex items-center space-x-2">
                    {bed.patient && bed.status === 'occupied' && (
                      <button
                        onClick={(e) => {
                          e.stopPropagation()
                          handlePatientDischarge(bed._id)
                        }}
                        className="inline-flex items-center px-4 py-2 text-sm font-medium text-orange-700 bg-orange-100 border border-orange-200 rounded-lg hover:bg-orange-200 transition-colors"
                      >
                        <Clock className="w-4 h-4 mr-2" />
                        Discharge & Clean
                      </button>
                    )}
                    {bed.status === 'cleaning' && (
                      <button
                        onClick={(e) => {
                          e.stopPropagation()
                          handleBedStatusChange(bed._id, 'available')
                        }}
                        className="inline-flex items-center px-4 py-2 text-sm font-medium text-green-700 bg-green-100 border border-green-200 rounded-lg hover:bg-green-200 transition-colors"
                      >
                        <CheckCircle className="w-4 h-4 mr-2" />
                        Mark Available
                      </button>
                    )}
                    {bed.status === 'available' && (
                      <button
                        onClick={(e) => {
                          e.stopPropagation()
                          handleBedStatusChange(bed._id, 'maintenance')
                        }}
                        className="inline-flex items-center px-4 py-2 text-sm font-medium text-blue-700 bg-blue-100 border border-blue-200 rounded-lg hover:bg-blue-200 transition-colors"
                      >
                        <Settings className="w-4 h-4 mr-2" />
                        Maintenance
                      </button>
                    )}
                    {bed.status === 'maintenance' && (
                      <button
                        onClick={(e) => {
                          e.stopPropagation()
                          handleBedStatusChange(bed._id, 'available')
                        }}
                        className="inline-flex items-center px-4 py-2 text-sm font-medium text-green-700 bg-green-100 border border-green-200 rounded-lg hover:bg-green-200 transition-colors"
                      >
                        <CheckCircle className="w-4 h-4 mr-2" />
                        Complete
                      </button>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>

          {filteredBeds.length === 0 && (
            <div className="px-6 py-8 text-center">
              <Bed className="mx-auto h-12 w-12 text-gray-400" />
              <h3 className="mt-2 text-sm font-medium text-gray-900">No beds found</h3>
              <p className="mt-1 text-sm text-gray-500">
                {filterStatus === 'all' 
                  ? 'No beds have been set up yet.' 
                  : `No beds with ${filterStatus} status.`}
              </p>
            </div>
          )}
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