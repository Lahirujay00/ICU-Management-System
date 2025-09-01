'use client'

import { 
  Bed,
  User,
  Activity,
  Heart,
  Thermometer,
  Droplets,
  Zap,
  Clock,
  CheckCircle,
  AlertTriangle,
  XCircle,
  Settings
} from 'lucide-react'

export default function BedVisualizer({ bed, className = '', onClick }) {
  const getStatusColor = (status) => {
    switch (status) {
      case 'available':
        return 'text-green-600 bg-green-50 border-green-200'
      case 'occupied':
        return 'text-red-600 bg-red-50 border-red-200'
      case 'cleaning':
        return 'text-yellow-600 bg-yellow-50 border-yellow-200'
      case 'maintenance':
        return 'text-blue-600 bg-blue-50 border-blue-200'
      default:
        return 'text-gray-600 bg-gray-50 border-gray-200'
    }
  }

  const getStatusIcon = (status) => {
    switch (status) {
      case 'available':
        return <CheckCircle className="w-4 h-4" />
      case 'occupied':
        return <User className="w-4 h-4" />
      case 'cleaning':
        return <Clock className="w-4 h-4" />
      case 'maintenance':
        return <Settings className="w-4 h-4" />
      default:
        return <Bed className="w-4 h-4" />
    }
  }

  const getPatientStatusColor = (status) => {
    switch (status) {
      case 'critical':
        return 'text-red-800 bg-red-100 border-red-200'
      case 'stable':
        return 'text-green-800 bg-green-100 border-green-200'
      case 'improving':
        return 'text-blue-800 bg-blue-100 border-blue-200'
      case 'deteriorating':
        return 'text-orange-800 bg-orange-100 border-orange-200'
      default:
        return 'text-gray-800 bg-gray-100 border-gray-200'
    }
  }

  return (
    <div className={`relative ${className}`} onClick={onClick}>
      {/* Bed Frame */}
      <div className={`w-full h-32 border-2 rounded-lg ${getStatusColor(bed.status)} transition-all duration-200`}>
        {/* Bed Header */}
        <div className="flex justify-between items-center p-2 border-b border-current border-opacity-20">
          <div className="flex items-center gap-2">
            <span className="font-semibold text-sm">{bed.number}</span>
            {getStatusIcon(bed.status)}
          </div>
          <span className="text-xs font-medium">{bed.roomNumber}</span>
        </div>

        {/* Bed Content */}
        <div className="p-2 h-20 flex items-center justify-center">
          {bed.patient ? (
            <div className="text-center">
              <div className="flex items-center justify-center gap-1 mb-1">
                <User className="w-4 h-4" />
                <span className="text-xs font-medium truncate max-w-20" title={bed.patient.name}>
                  {bed.patient.name}
                </span>
              </div>
              <span className={`inline-block px-2 py-0.5 rounded text-xs font-medium border ${getPatientStatusColor(bed.patient.status)}`}>
                {bed.patient.status}
              </span>
            </div>
          ) : (
            <div className="text-center text-current opacity-60">
              <Bed className="w-8 h-8 mx-auto mb-1" />
              <span className="text-xs">{bed.status}</span>
            </div>
          )}
        </div>
      </div>

      {/* Equipment Indicators */}
      {bed.features && (
        <div className="absolute -top-1 -right-1 flex gap-1">
          {bed.features.ventilator && (
            <div className="w-5 h-5 bg-blue-600 rounded-full flex items-center justify-center" title="Ventilator">
              <Activity className="w-3 h-3 text-white" />
            </div>
          )}
          {bed.features.monitor && (
            <div className="w-5 h-5 bg-green-600 rounded-full flex items-center justify-center" title="Monitor">
              <Heart className="w-3 h-3 text-white" />
            </div>
          )}
          {bed.features.oxygenSupply && (
            <div className="w-5 h-5 bg-cyan-600 rounded-full flex items-center justify-center" title="Oxygen Supply">
              <Droplets className="w-3 h-3 text-white" />
            </div>
          )}
          {bed.features.suction && (
            <div className="w-5 h-5 bg-purple-600 rounded-full flex items-center justify-center" title="Suction">
              <Zap className="w-3 h-3 text-white" />
            </div>
          )}
        </div>
      )}

      {/* Bed Type Badge */}
      <div className="absolute -bottom-2 left-1/2 transform -translate-x-1/2">
        <span className="bg-gray-800 text-white text-xs px-2 py-0.5 rounded-full">
          {bed.bedType}
        </span>
      </div>

      {/* Ward Label */}
      <div className="absolute -left-2 top-1/2 transform -translate-y-1/2 -rotate-90">
        <span className="text-xs text-gray-500 font-medium whitespace-nowrap">
          {bed.ward}
        </span>
      </div>
    </div>
  )
}
