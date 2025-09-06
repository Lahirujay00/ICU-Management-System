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
  Edit,
  X
} from 'lucide-react'
import toast from 'react-hot-toast'

export default function PatientCard({ patient, onStatusUpdate, onSelect, onEdit, onDischarge, onDelete }) {
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

  const getBedStatusColor = (bedNumber) => {
    // Different colors for different bed types
    const bedNum = parseInt(bedNumber?.replace(/\D/g, '') || '0')
    if (bedNum <= 10) return 'bg-blue-500'
    if (bedNum <= 20) return 'bg-green-500'
    if (bedNum <= 30) return 'bg-purple-500'
    return 'bg-orange-500'
  }

  const handleStatusChange = async (newStatus) => {
    if (isUpdatingStatus) return
    
    setIsUpdatingStatus(true)
    try {
      await onStatusUpdate(patient._id, newStatus)
      toast.success(`Status updated to ${newStatus}`)
    } catch (error) {
      console.error('Error updating status:', error)
      toast.error('Failed to update status')
    } finally {
      setIsUpdatingStatus(false)
    }
  }

  return (
    <div className="bg-white rounded-lg shadow-md border border-gray-200 hover:shadow-lg transition-shadow">
      <div className="p-4">
        {/* Header with Bed Slot UI */}
        <div className="flex items-start justify-between mb-3">
          <div className="flex items-center space-x-3">
            {/* Bed Slot Indicator */}
            <div className="relative">
              <div className={`h-10 w-10 ${getBedStatusColor(patient.bedNumber)} rounded-lg flex items-center justify-center`}>
                <Bed className="h-5 w-5 text-white" />
              </div>
              <div className="absolute -top-2 -right-2 bg-white border border-gray-300 rounded-full px-2 py-0.5 text-xs font-bold text-gray-700">
                {patient.bedNumber?.replace(/\D/g, '') || 'N/A'}
              </div>
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
            {/* Action buttons */}
            <div className="flex space-x-1">
              {onEdit && (
                <button 
                  onClick={() => onEdit(patient)}
                  className="p-1 bg-green-50 hover:bg-green-100 rounded transition-colors"
                  title="Edit Patient"
                  disabled={isUpdatingStatus}
                >
                  <Edit className="w-4 h-4 text-green-600" />
                </button>
              )}
              {onDelete && (
                <button 
                  onClick={() => onDelete(patient)}
                  className="p-1 bg-red-50 hover:bg-red-100 rounded transition-colors"
                  title="Delete Patient"
                  disabled={isUpdatingStatus}
                >
                  <X className="w-4 h-4 text-red-600" />
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Discharge Button */}
        <div className="mb-3">
          {onDischarge && (
            <button 
              onClick={() => onDischarge(patient)}
              className="w-full px-3 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors font-medium"
              disabled={isUpdatingStatus}
            >
              {isUpdatingStatus ? 'Processing...' : 'Discharge Patient'}
            </button>
          )}
        </div>

        {/* Bed Information */}
        <div className="mb-4 p-3 bg-gradient-to-r from-blue-50 to-purple-50 rounded-lg border border-blue-200">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Bed className="h-4 w-4 text-blue-600" />
              <span className="text-sm font-medium text-blue-900">Bed {patient.bedNumber}</span>
            </div>
            <div className="flex items-center space-x-2">
              <Clock className="h-4 w-4 text-purple-600" />
              <span className="text-sm text-purple-700">
                {patient.admissionDate ? new Date(patient.admissionDate).toLocaleDateString() : 'Recent'}
              </span>
            </div>
          </div>
        </div>

        {/* Patient Info */}
        <div className="mb-4 space-y-3">
          {/* Basic Information */}
          <div className="p-3 bg-gray-50 rounded-lg">
            <h4 className="text-sm font-semibold text-gray-800 mb-2 flex items-center">
              <User className="w-4 h-4 mr-1" />
              Patient Information
            </h4>
            <div className="text-sm text-gray-600 space-y-1">
              <div className="flex justify-between">
                <span><strong>Age:</strong></span>
                <span>{patient.age} years</span>
              </div>
              <div className="flex justify-between">
                <span><strong>Gender:</strong></span>
                <span className="capitalize">{patient.gender}</span>
              </div>
              <div className="flex justify-between">
                <span><strong>Patient ID:</strong></span>
                <span className="font-mono text-xs">{patient.patientId || 'N/A'}</span>
              </div>
              {patient.contactNumber && (
                <div className="flex justify-between">
                  <span><strong>Contact:</strong></span>
                  <span className="font-mono text-xs">{patient.contactNumber}</span>
                </div>
              )}
            </div>
          </div>

          {/* Medical Information */}
          <div className="p-3 bg-red-50 rounded-lg border border-red-200">
            <h4 className="text-sm font-semibold text-gray-800 mb-2 flex items-center">
              <Stethoscope className="w-4 h-4 mr-1 text-red-600" />
              Medical Details
            </h4>
            <div className="text-sm text-gray-600 space-y-1">
              <div>
                <span className="font-medium">Diagnosis:</span>
                <p className="text-gray-800 mt-1">{patient.diagnosis}</p>
              </div>
              {patient.attendingPhysician && (
                <div className="flex justify-between">
                  <span><strong>Physician:</strong></span>
                  <span>{patient.attendingPhysician}</span>
                </div>
              )}
            </div>
          </div>

          {/* Admission Details */}
          <div className="p-3 bg-green-50 rounded-lg border border-green-200">
            <h4 className="text-sm font-semibold text-gray-800 mb-2 flex items-center">
              <Clock className="w-4 h-4 mr-1 text-green-600" />
              Admission Details
            </h4>
            <div className="text-sm text-gray-600 space-y-1">
              <div className="flex justify-between">
                <span><strong>Admitted:</strong></span>
                <span>{patient.admissionDate ? new Date(patient.admissionDate).toLocaleDateString() : 'Recent'}</span>
              </div>
              <div className="flex justify-between">
                <span><strong>Duration:</strong></span>
                <span>
                  {patient.admissionDate ? 
                    Math.ceil((new Date() - new Date(patient.admissionDate)) / (1000 * 60 * 60 * 24)) + ' days' : 
                    'N/A'
                  }
                </span>
              </div>
              <div className="flex justify-between">
                <span><strong>Last Updated:</strong></span>
                <span>{patient.updatedAt ? new Date(patient.updatedAt).toLocaleDateString() : 'N/A'}</span>
              </div>
            </div>
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
              {isUpdatingStatus && patient.status === 'critical' ? '...' : 'Critical'}
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
              {isUpdatingStatus && patient.status === 'stable' ? '...' : 'Stable'}
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
              {isUpdatingStatus && patient.status === 'improving' ? '...' : 'Improving'}
            </button>
          </div>
        </div>

        {/* View Details Button */}
        
      </div>
    </div>
  )
}