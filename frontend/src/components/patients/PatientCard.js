'use client'

import { useState } from 'react'
import { 
  User, 
  Heart, 
  Activity, 
  AlertTriangle, 
  Clock,
  Bed,
  Stethoscope,
  Edit
} from 'lucide-react'

export default function PatientCard({ patient, onClick, onStatusUpdate }) {
  const [isUpdating, setIsUpdating] = useState(false)

  const getStatusColor = (status) => {
    switch (status) {
      case 'critical':
        return 'bg-red-100 text-red-800 border-red-300'
      case 'stable':
        return 'bg-green-100 text-green-800 border-green-300'
      case 'improving':
        return 'bg-yellow-100 text-yellow-800 border-yellow-300'
      case 'deteriorating':
        return 'bg-orange-100 text-orange-800 border-orange-300'
      default:
        return 'bg-gray-100 text-gray-800 border-gray-300'
    }
  }

  const getStatusIcon = (status) => {
    switch (status) {
      case 'critical':
        return <AlertTriangle className="w-5 h-5 text-red-600" />
      case 'stable':
        return <Heart className="w-5 h-5 text-green-600" />
      case 'improving':
        return <Activity className="w-5 h-5 text-yellow-600" />
      case 'deteriorating':
        return <AlertTriangle className="w-5 h-5 text-orange-600" />
      default:
        return <User className="w-5 h-5 text-gray-600" />
    }
  }

  const handleStatusUpdate = async (newStatus) => {
    setIsUpdating(true)
    try {
      // Call API to update patient status
      await onStatusUpdate(patient._id, newStatus)
    } catch (error) {
      console.error('Error updating patient status:', error)
    } finally {
      setIsUpdating(false)
    }
  }

  const getLatestVitals = () => {
    if (!patient.vitalSigns || patient.vitalSigns.length === 0) return null
    return patient.vitalSigns[patient.vitalSigns.length - 1]
  }

  const latestVitals = getLatestVitals()

  return (
    <div 
      className="card cursor-pointer hover:shadow-lg transition-all duration-200"
      onClick={onClick}
    >
      {/* Patient Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
            <User className="w-6 h-6 text-blue-600" />
          </div>
          <div>
            <h3 className="font-semibold text-gray-900">{patient.name}</h3>
            <p className="text-sm text-gray-500">Bed {patient.roomNumber}</p>
          </div>
        </div>
        <span className={`px-2 py-1 rounded-full text-xs font-medium border ${getStatusColor(patient.status)}`}>
          {patient.status}
        </span>
      </div>

      {/* Patient Details */}
      <div className="space-y-3 text-sm mb-4">
        <div className="flex items-center justify-between">
          <span className="text-gray-600">Age:</span>
          <span className="font-medium text-gray-900">{patient.age} years</span>
        </div>
        
        <div className="flex items-center justify-between">
          <span className="text-gray-600">Gender:</span>
          <span className="font-medium text-gray-900 capitalize">{patient.gender}</span>
        </div>

        <div className="flex items-center gap-2">
          <Clock className="w-4 h-4 text-gray-400" />
          <span className="text-gray-600">Admitted: {new Date(patient.admissionDate).toLocaleDateString()}</span>
        </div>

        {patient.diagnosis && (
          <div className="flex items-start gap-2">
            <Stethoscope className="w-4 h-4 text-gray-400 mt-0.5" />
            <span className="text-gray-600 text-xs leading-relaxed">
              <strong>Diagnosis:</strong> {patient.diagnosis}
            </span>
          </div>
        )}
      </div>

      {/* Latest Vital Signs */}
      {latestVitals && (
        <div className="mb-4 p-3 bg-gray-50 rounded-lg">
          <h4 className="text-xs font-medium text-gray-700 mb-2">Latest Vitals</h4>
          <div className="grid grid-cols-2 gap-2 text-xs">
            <div className="flex items-center justify-between">
              <span className="text-gray-600">HR:</span>
              <span className={`font-medium ${
                latestVitals.heartRate > 100 || latestVitals.heartRate < 60 ? 'text-red-600' : 'text-gray-900'
              }`}>
                {latestVitals.heartRate} bpm
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-gray-600">BP:</span>
              <span className={`font-medium ${
                latestVitals.bloodPressure?.systolic > 140 || latestVitals.bloodPressure?.diastolic > 90 ? 'text-red-600' : 'text-gray-900'
              }`}>
                {latestVitals.bloodPressure?.systolic}/{latestVitals.bloodPressure?.diastolic}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-gray-600">O2:</span>
              <span className={`font-medium ${
                latestVitals.oxygenSaturation < 95 ? 'text-red-600' : 'text-gray-900'
              }`}>
                {latestVitals.oxygenSaturation}%
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-gray-600">Temp:</span>
              <span className={`font-medium ${
                latestVitals.temperature > 38 || latestVitals.temperature < 36 ? 'text-red-600' : 'text-gray-900'
              }`}>
                {latestVitals.temperature}°C
              </span>
            </div>
          </div>
        </div>
      )}

      {/* Patient Actions */}
      <div className="pt-4 border-t border-gray-200">
        <div className="flex gap-2">
          <button 
            className="flex-1 px-3 py-2 text-xs bg-blue-100 text-blue-800 rounded hover:bg-blue-200 flex items-center justify-center gap-1"
            onClick={(e) => {
              e.stopPropagation()
              // Handle view details
            }}
          >
            <User className="w-3 h-3" />
            Details
          </button>
          
          <button 
            className="flex-1 px-3 py-2 text-xs bg-green-100 text-green-800 rounded hover:bg-green-200 flex items-center justify-center gap-1"
            onClick={(e) => {
              e.stopPropagation()
              // Handle record vitals
            }}
          >
            <Activity className="w-3 h-3" />
            Vitals
          </button>
          
          <button 
            className="flex-1 px-3 py-2 text-xs bg-yellow-100 text-yellow-800 rounded hover:bg-yellow-200 flex items-center justify-center gap-1"
            onClick={(e) => {
              e.stopPropagation()
              // Handle edit patient
            }}
          >
            <Edit className="w-3 h-3" />
            Edit
          </button>
        </div>

        {/* Quick Status Update */}
        <div className="mt-3">
          <select
            value={patient.status}
            onChange={(e) => handleStatusUpdate(e.target.value)}
            disabled={isUpdating}
            className="w-full px-2 py-1 text-xs border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-500"
            onClick={(e) => e.stopPropagation()}
          >
            <option value="critical">Critical</option>
            <option value="deteriorating">Deteriorating</option>
            <option value="stable">Stable</option>
            <option value="improving">Improving</option>
          </select>
        </div>
      </div>

      {/* Critical Indicators */}
      {patient.status === 'critical' && (
        <div className="mt-3 p-2 bg-red-50 border border-red-200 rounded-lg">
          <div className="flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 text-red-600" />
            <span className="text-xs font-medium text-red-800">Critical Patient - Requires Immediate Attention</span>
          </div>
        </div>
      )}

      {patient.allergies && patient.allergies.length > 0 && (
        <div className="mt-3 p-2 bg-yellow-50 border border-yellow-200 rounded-lg">
          <div className="flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 text-yellow-600" />
            <span className="text-xs font-medium text-yellow-800">
              Allergies: {patient.allergies.join(', ')}
            </span>
          </div>
        </div>
      )}
    </div>
  )
} 