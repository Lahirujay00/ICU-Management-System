'use client'

import { useState, useEffect } from 'react'
import { X, Search, User } from 'lucide-react'
import { apiClient } from '@/lib/api'

export default function PatientAssignmentModal({ isOpen, onClose, bed, onPatientAssigned }) {
  const [availablePatients, setAvailablePatients] = useState([])
  const [filteredPatients, setFilteredPatients] = useState([])
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedPatient, setSelectedPatient] = useState(null)
  const [isLoading, setIsLoading] = useState(false)
  const [isLoadingPatients, setIsLoadingPatients] = useState(false)

  useEffect(() => {
    if (isOpen) {
      loadAvailablePatients()
      setSearchTerm('')
      setSelectedPatient(null)
    }
  }, [isOpen])

  useEffect(() => {
    if (searchTerm) {
      const filtered = availablePatients.filter(patient =>
        patient.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        patient.medicalRecordNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
        patient.diagnosis.toLowerCase().includes(searchTerm.toLowerCase())
      )
      setFilteredPatients(filtered)
    } else {
      setFilteredPatients(availablePatients)
    }
  }, [searchTerm, availablePatients])

  const loadAvailablePatients = async () => {
    setIsLoadingPatients(true)
    try {
      // Get all patients and filter those without bed assignments
      const allPatients = await apiClient.getPatients()
      const patientsWithoutBeds = allPatients.filter(patient => 
        !patient.bedNumber && patient.status !== 'discharged'
      )
      setAvailablePatients(patientsWithoutBeds)
      setFilteredPatients(patientsWithoutBeds)
    } catch (error) {
      console.error('Error loading available patients:', error)
    } finally {
      setIsLoadingPatients(false)
    }
  }

  const handleAssignPatient = async () => {
    if (!selectedPatient) return

    setIsLoading(true)
    try {
      await apiClient.assignPatientToBed(bed._id, selectedPatient._id)
      onPatientAssigned()
      onClose()
    } catch (error) {
      console.error('Error assigning patient to bed:', error)
      alert('Failed to assign patient to bed. Please try again.')
    } finally {
      setIsLoading(false)
    }
  }

  const getStatusColor = (status) => {
    switch (status) {
      case 'critical':
        return 'bg-red-100 text-red-800 border-red-200'
      case 'stable':
        return 'bg-green-100 text-green-800 border-green-200'
      case 'moderate':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200'
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200'
    }
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
      style={{ width: '100vw', height: '100vh', margin: 0, padding: 0 }}>
      <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full mx-4 max-h-[80vh] flex flex-col">
        {/* Header */}
        <div className="flex justify-between items-center p-6 border-b border-gray-200">
          <div>
            <h2 className="text-xl font-semibold text-gray-900">Assign Patient to Bed</h2>
            <p className="text-sm text-gray-600 mt-1">
              Bed {bed?.number} - Room {bed?.roomNumber}
            </p>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Search */}
        <div className="p-6 border-b border-gray-200">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <input
              type="text"
              placeholder="Search patients by name, MRN, or diagnosis..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>

        {/* Patient List */}
        <div className="flex-1 overflow-y-auto">
          {isLoadingPatients ? (
            <div className="flex items-center justify-center h-32">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            </div>
          ) : filteredPatients.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-32 text-gray-500">
              <User className="w-12 h-12 mb-2 text-gray-300" />
              {searchTerm ? 'No patients found matching your search' : 'No patients available for assignment'}
            </div>
          ) : (
            <div className="p-6 space-y-3">
              {filteredPatients.map((patient) => (
                <div
                  key={patient._id}
                  className={`p-4 border rounded-lg cursor-pointer transition-all ${
                    selectedPatient?._id === patient._id
                      ? 'border-blue-500 bg-blue-50 ring-2 ring-blue-200'
                      : 'border-gray-200 hover:border-gray-300 hover:shadow-sm'
                  }`}
                  onClick={() => setSelectedPatient(patient)}
                >
                  <div className="flex justify-between items-start mb-2">
                    <div>
                      <h3 className="font-semibold text-gray-900">{patient.name}</h3>
                      <p className="text-sm text-gray-600">
                        MRN: {patient.medicalRecordNumber}
                      </p>
                    </div>
                    <span className={`px-2 py-1 rounded-full text-xs font-medium border ${getStatusColor(patient.status)}`}>
                      {patient.status}
                    </span>
                  </div>
                  
                  <div className="text-sm text-gray-700">
                    <p><strong>Age:</strong> {patient.age}</p>
                    <p><strong>Diagnosis:</strong> {patient.diagnosis}</p>
                    {patient.admissionDate && (
                      <p><strong>Admitted:</strong> {new Date(patient.admissionDate).toLocaleDateString()}</p>
                    )}
                  </div>
                  
                  {patient.emergencyContact && (
                    <div className="mt-2 pt-2 border-t border-gray-100 text-xs text-gray-600">
                      <p><strong>Emergency Contact:</strong> {patient.emergencyContact.name} ({patient.emergencyContact.relationship})</p>
                      <p>{patient.emergencyContact.phone}</p>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-6 border-t border-gray-200 flex gap-3 justify-end">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 border border-gray-300 rounded-md hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-gray-500"
            disabled={isLoading}
          >
            Cancel
          </button>
          <button
            onClick={handleAssignPatient}
            className="px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
            disabled={!selectedPatient || isLoading}
          >
            {isLoading ? 'Assigning...' : 'Assign Patient'}
          </button>
        </div>
      </div>
    </div>
  )
}
