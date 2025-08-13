'use client'

import { useState, useEffect } from 'react'
import { 
  User, 
  Heart, 
  Activity, 
  AlertTriangle, 
  TrendingUp, 
  Clock,
  Bed,
  Stethoscope
} from 'lucide-react'
import PatientCard from '../patients/PatientCard'
import VitalSignsChart from '../charts/VitalSignsChart'
import RiskAssessmentPanel from '../patients/RiskAssessmentPanel'
import PatientAdmissionModal from '../patients/PatientAdmissionModal'
import { apiClient } from '@/lib/api'

export default function PatientOverview({ detailed = false }) {
  const [patients, setPatients] = useState([])
  const [selectedPatient, setSelectedPatient] = useState(null)
  const [isAdmissionModalOpen, setIsAdmissionModalOpen] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const [filterStatus, setFilterStatus] = useState('all')

  useEffect(() => {
    loadPatients()
  }, [])

  const loadPatients = async () => {
    try {
      // Try to load from API first, fallback to mock data
      const data = await apiClient.getPatients()
      setPatients(data)
    } catch (error) {
      console.log('Using mock data for development')
      // Use mock data for development
      const mockData = apiClient.getMockPatients()
      setPatients(mockData)
    } finally {
      setIsLoading(false)
    }
  }

  const handleAdmitPatient = async (patientData) => {
    try {
      // In development, just add to local state
      const newPatient = {
        ...patientData,
        _id: Date.now().toString(),
        vitalSigns: [],
        notes: []
      }
      setPatients(prev => [...prev, newPatient])
      setIsAdmissionModalOpen(false)
    } catch (error) {
      console.error('Error admitting patient:', error)
    }
  }

  const handleStatusUpdate = async (patientId, newStatus) => {
    try {
      // Update patient status in local state
      setPatients(prev => 
        prev.map(patient => 
          patient._id === patientId 
            ? { ...patient, status: newStatus }
            : patient
        )
      )
    } catch (error) {
      console.error('Error updating patient status:', error)
    }
  }

  const filteredPatients = patients.filter(patient => {
    if (filterStatus === 'all') return true
    return patient.status === filterStatus
  })

  const criticalPatients = patients.filter(p => p.status === 'critical')
  const stablePatients = patients.filter(p => p.status === 'stable')
  const improvingPatients = patients.filter(p => p.status === 'improving')

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header with Quick Actions */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Patient Overview</h2>
          <p className="text-gray-600">Monitor patient status and vital signs in real-time</p>
        </div>
        <button
          onClick={() => setIsAdmissionModalOpen(true)}
          className="btn-primary flex items-center gap-2"
        >
          <User className="w-4 h-4" />
          Admit Patient
        </button>
      </div>

      {/* Status Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="card bg-gradient-to-r from-blue-50 to-blue-100 border-blue-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-blue-600">Total Patients</p>
              <p className="text-2xl font-bold text-blue-900">{patients.length}</p>
            </div>
            <User className="w-8 h-8 text-blue-600" />
          </div>
        </div>

        <div className="card bg-gradient-to-r from-red-50 to-red-100 border-red-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-red-600">Critical</p>
              <p className="text-2xl font-bold text-red-900">{criticalPatients.length}</p>
            </div>
            <AlertTriangle className="w-8 h-8 text-red-600" />
          </div>
        </div>

        <div className="card bg-gradient-to-r from-green-50 to-green-100 border-green-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-green-600">Stable</p>
              <p className="text-2xl font-bold text-green-900">{stablePatients.length}</p>
            </div>
            <Heart className="w-8 h-8 text-green-600" />
          </div>
        </div>

        <div className="card bg-gradient-to-r from-yellow-50 to-yellow-100 border-yellow-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-yellow-600">Improving</p>
              <p className="text-2xl font-bold text-yellow-900">{improvingPatients.length}</p>
            </div>
            <TrendingUp className="w-8 h-8 text-yellow-600" />
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
          All ({patients.length})
        </button>
        <button
          onClick={() => setFilterStatus('critical')}
          className={`px-4 py-2 rounded-lg text-sm font-medium ${
            filterStatus === 'critical' 
              ? 'bg-red-600 text-white' 
              : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
          }`}
        >
          Critical ({criticalPatients.length})
        </button>
        <button
          onClick={() => setFilterStatus('stable')}
          className={`px-4 py-2 rounded-lg text-sm font-medium ${
            filterStatus === 'stable' 
              ? 'bg-green-600 text-white' 
              : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
          }`}
        >
          Stable ({stablePatients.length})
        </button>
        <button
          onClick={() => setFilterStatus('improving')}
          className={`px-4 py-2 rounded-lg text-sm font-medium ${
            filterStatus === 'improving' 
              ? 'bg-yellow-600 text-white' 
              : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
          }`}
        >
          Improving ({improvingPatients.length})
        </button>
      </div>

      {/* Patient Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
        {filteredPatients.map((patient) => (
          <PatientCard
            key={patient._id}
            patient={patient}
            onClick={() => setSelectedPatient(patient)}
            onStatusUpdate={handleStatusUpdate}
          />
        ))}
      </div>

      {/* AI Risk Assessment Panel */}
      {selectedPatient && (
        <RiskAssessmentPanel 
          patient={selectedPatient}
          onClose={() => setSelectedPatient(null)}
        />
      )}

      {/* Patient Admission Modal */}
      <PatientAdmissionModal
        isOpen={isAdmissionModalOpen}
        onClose={() => setIsAdmissionModalOpen(false)}
        onSubmit={handleAdmitPatient}
      />
    </div>
  )
} 