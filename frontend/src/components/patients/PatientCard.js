'use client'

import { useState } from 'react'
import { 
  User, 
  Heart, 
  Activity, 
  AlertTriangle, 
  Bed,
  Clock,
  Stethoscope,
  Edit
} from 'lucide-react'

export default function PatientCard({ patient, onStatusUpdate, onSelect }) {
  const [isExpanded, setIsExpanded] = useState(false)
  const [isUpdatingStatus, setIsUpdatingStatus] = useState(false)

  const getStatusColor = (status) => {
    switch (status) {
      case 'critical':
        return 'bg-red-100 text-red-800 border-red-200'
      case 'stable':
        return 'bg-green-100 text-green-800 border-green-200'
      case 'improving':
        return 'bg-blue-100 text-blue-800 border-blue-200'
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200'
    }
  }

  const getStatusIcon = (status) => {
    switch (status) {
      case 'critical':
        return <AlertTriangle className="h-4 w-4" />
      case 'stable':
        return <Heart className="h-4 w-4" />
      case 'improving':
        return <Activity className="h-4 w-4" />
      default:
        return <User className="h-4 w-4" />
    }
  }

  const handleStatusChange = async (newStatus) => {
    if (isUpdatingStatus) return
    
    setIsUpdatingStatus(true)
    try {
      await onStatusUpdate(patient._id, newStatus)
    } catch (error) {
      console.error('Error updating status:', error)
    } finally {
      setIsUpdatingStatus(false)
    }
  }

  return (
    <div className="bg-white rounded-lg shadow-md border border-gray-200 hover:shadow-lg transition-shadow">
      <div className="p-4">
        {/* Header */}
        <div className="flex items-start justify-between mb-3">
          <div className="flex items-center space-x-3">
            <div className="h-10 w-10 bg-blue-100 rounded-full flex items-center justify-center">
              <User className="h-5 w-5 text-blue-600" />
            </div>
            <div>
              <h3 className="font-semibold text-gray-900">{patient.name}</h3>
              <p className="text-sm text-gray-600">ID: {patient.patientId}</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <div className={`px-2 py-1 rounded-full text-xs font-medium border ${getStatusColor(patient.status)} flex items-center space-x-1`}>
              {getStatusIcon(patient.status)}
              <span>{patient.status}</span>
            </div>
            <button
              onClick={() => setIsExpanded(!isExpanded)}
              className="p-1 text-gray-400 hover:text-gray-600 transition-colors"
              title="Toggle details"
            >
              <Edit className="h-4 w-4" />
            </button>
          </div>
        </div>

        {/* Basic Info */}
        <div className="grid grid-cols-2 gap-3 mb-3">
          <div className="flex items-center space-x-2 text-sm text-gray-600">
            <Bed className="h-4 w-4" />
            <span>Bed {patient.bedNumber}</span>
          </div>
          <div className="flex items-center space-x-2 text-sm text-gray-600">
            <Clock className="h-4 w-4" />
            <span>{patient.admissionDate}</span>
          </div>
        </div>

        {/* Vital Signs Summary */}
        <div className="grid grid-cols-3 gap-2 mb-3">
          <div className="text-center p-2 bg-red-50 rounded">
            <div className="text-lg font-semibold text-red-600">{patient.vitalSigns?.heartRate || '--'}</div>
            <div className="text-xs text-red-500">BPM</div>
          </div>
          <div className="text-center p-2 bg-blue-50 rounded">
            <div className="text-lg font-semibold text-blue-600">{patient.vitalSigns?.bloodPressure || '--'}</div>
            <div className="text-xs text-blue-500">BP</div>
          </div>
          <div className="text-center p-2 bg-green-50 rounded">
            <div className="text-lg font-semibold text-green-600">{patient.vitalSigns?.oxygenSaturation || '--'}%</div>
            <div className="text-xs text-green-500">O2</div>
          </div>
        </div>

        {/* Status Update Section */}
        <div className="mb-3">
          <label className="block text-xs font-medium text-gray-700 mb-2">Update Status:</label>
          <div className="grid grid-cols-3 gap-2">
            <button
              onClick={() => handleStatusChange('critical')}
              disabled={isUpdatingStatus || patient.status === 'critical'}
              className={`px-2 py-1 text-xs rounded border transition-colors ${
                patient.status === 'critical'
                  ? 'bg-red-100 text-red-800 border-red-300 cursor-not-allowed'
                  : 'bg-white text-red-600 border-red-300 hover:bg-red-50'
              }`}
            >
              Critical
            </button>
            <button
              onClick={() => handleStatusChange('stable')}
              disabled={isUpdatingStatus || patient.status === 'stable'}
              className={`px-2 py-1 text-xs rounded border transition-colors ${
                patient.status === 'stable'
                  ? 'bg-green-100 text-green-800 border-green-300 cursor-not-allowed'
                  : 'bg-white text-green-600 border-green-300 hover:bg-green-50'
              }`}
            >
              Stable
            </button>
            <button
              onClick={() => handleStatusChange('improving')}
              disabled={isUpdatingStatus || patient.status === 'improving'}
              className={`px-2 py-1 text-xs rounded border transition-colors ${
                patient.status === 'improving'
                  ? 'bg-blue-100 text-blue-800 border-blue-300 cursor-not-allowed'
                  : 'bg-white text-blue-600 border-blue-300 hover:bg-blue-50'
              }`}
            >
              Improving
            </button>
          </div>
        </div>

        {/* Actions */}
        <div className="flex space-x-2">
          <button
            onClick={() => onSelect(patient)}
            className="flex-1 bg-blue-600 text-white px-3 py-2 rounded-md text-sm font-medium hover:bg-blue-700 transition-colors"
          >
            View Details
          </button>
          <button
            onClick={() => setIsExpanded(!isExpanded)}
            className="px-3 py-2 text-gray-600 hover:text-gray-800 transition-colors"
          >
            {isExpanded ? 'Less' : 'More'}
          </button>
        </div>

        {/* Expanded Content */}
        {isExpanded && (
          <div className="mt-4 pt-4 border-t border-gray-200">
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-600">Age:</span>
                <span className="font-medium">{patient.age} years</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Gender:</span>
                <span className="font-medium">{patient.gender}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Diagnosis:</span>
                <span className="font-medium">{patient.diagnosis}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Attending:</span>
                <span className="font-medium">{patient.attendingPhysician}</span>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
} 