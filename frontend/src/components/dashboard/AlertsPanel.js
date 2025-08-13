'use client'

import { useState, useEffect } from 'react'
import { 
  AlertTriangle, 
  XCircle, 
  CheckCircle, 
  Info, 
  Clock,
  Bell,
  X
} from 'lucide-react'

export default function AlertsPanel({ alerts = [] }) {
  const [isExpanded, setIsExpanded] = useState(false)
  const [dismissedAlerts, setDismissedAlerts] = useState(new Set())

  // Sample alerts if none provided
  const defaultAlerts = [
    {
      id: 1,
      type: 'critical',
      title: 'Critical Patient Alert',
      message: 'Patient in Bed 3 showing critical vital signs - Heart rate: 140 bpm, BP: 85/45',
      timestamp: new Date(Date.now() - 2 * 60 * 1000), // 2 minutes ago
      priority: 'high'
    },
    {
      id: 2,
      type: 'warning',
      title: 'Low Stock Alert',
      message: 'Ventilator filters running low - Only 5 units remaining',
      timestamp: new Date(Date.now() - 15 * 60 * 1000), // 15 minutes ago
      priority: 'medium'
    },
    {
      id: 3,
      type: 'info',
      title: 'Staff Schedule Reminder',
      message: 'Dr. Smith shift starting in 30 minutes',
      timestamp: new Date(Date.now() - 30 * 60 * 1000), // 30 minutes ago
      priority: 'low'
    },
    {
      id: 4,
      type: 'critical',
      title: 'Equipment Failure',
      message: 'Ventilator in Bed 7 showing error codes - Requires immediate attention',
      timestamp: new Date(Date.now() - 5 * 60 * 1000), // 5 minutes ago
      priority: 'high'
    }
  ]

  const activeAlerts = (alerts.length > 0 ? alerts : defaultAlerts)
    .filter(alert => !dismissedAlerts.has(alert.id))

  const criticalAlerts = activeAlerts.filter(alert => alert.type === 'critical')
  const warningAlerts = activeAlerts.filter(alert => alert.type === 'warning')
  const infoAlerts = activeAlerts.filter(alert => alert.type === 'info')

  const dismissAlert = (alertId) => {
    setDismissedAlerts(prev => new Set([...prev, alertId]))
  }

  const getAlertIcon = (type) => {
    switch (type) {
      case 'critical':
        return <AlertTriangle className="w-5 h-5 text-red-600" />
      case 'warning':
        return <AlertTriangle className="w-5 h-5 text-yellow-600" />
      case 'info':
        return <Info className="w-5 h-5 text-blue-600" />
      default:
        return <Info className="w-5 h-5 text-gray-600" />
    }
  }

  const getAlertColor = (type) => {
    switch (type) {
      case 'critical':
        return 'border-red-200 bg-red-50'
      case 'warning':
        return 'border-yellow-200 bg-yellow-50'
      case 'info':
        return 'border-blue-200 bg-blue-50'
      default:
        return 'border-gray-200 bg-gray-50'
    }
  }

  const getAlertTextColor = (type) => {
    switch (type) {
      case 'critical':
        return 'text-red-800'
      case 'warning':
        return 'text-yellow-800'
      case 'info':
        return 'text-blue-800'
      default:
        return 'text-gray-800'
    }
  }

  const formatTimeAgo = (timestamp) => {
    const now = new Date()
    const diffInMinutes = Math.floor((now - timestamp) / (1000 * 60))
    
    if (diffInMinutes < 1) return 'Just now'
    if (diffInMinutes < 60) return `${diffInMinutes} min ago`
    
    const diffInHours = Math.floor(diffInMinutes / 60)
    if (diffInHours < 24) return `${diffInHours} hour${diffInHours > 1 ? 's' : ''} ago`
    
    const diffInDays = Math.floor(diffInHours / 24)
    return `${diffInDays} day${diffInDays > 1 ? 's' : ''} ago`
  }

  if (activeAlerts.length === 0) {
    return null
  }

  return (
    <div className="bg-white border-b border-gray-200">
      {/* Alerts Header */}
      <div className="px-6 py-3 bg-gradient-to-r from-red-50 to-orange-50 border-b border-red-200">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Bell className="w-5 h-5 text-red-600" />
            <div>
              <h3 className="text-sm font-semibold text-red-800">Active Alerts</h3>
              <p className="text-xs text-red-600">
                {criticalAlerts.length} critical, {warningAlerts.length} warnings, {infoAlerts.length} info
              </p>
            </div>
          </div>
          
          <button
            onClick={() => setIsExpanded(!isExpanded)}
            className="text-red-600 hover:text-red-800 text-sm font-medium"
          >
            {isExpanded ? 'Collapse' : 'Expand'}
          </button>
        </div>
      </div>

      {/* Alerts List */}
      {isExpanded && (
        <div className="max-h-96 overflow-y-auto">
          <div className="p-4 space-y-3">
            {/* Critical Alerts First */}
            {criticalAlerts.map((alert) => (
              <div
                key={alert.id}
                className={`flex items-start gap-3 p-3 rounded-lg border ${getAlertColor(alert.type)}`}
              >
                <div className="flex-shrink-0 mt-0.5">
                  {getAlertIcon(alert.type)}
                </div>
                
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <h4 className={`text-sm font-semibold ${getAlertTextColor(alert.type)}`}>
                        {alert.title}
                      </h4>
                      <p className={`text-sm mt-1 ${getAlertTextColor(alert.type)} opacity-90`}>
                        {alert.message}
                      </p>
                      <div className="flex items-center gap-2 mt-2">
                        <Clock className="w-3 h-3 text-gray-500" />
                        <span className="text-xs text-gray-500">
                          {formatTimeAgo(alert.timestamp)}
                        </span>
                        {alert.priority === 'high' && (
                          <span className="px-2 py-1 bg-red-100 text-red-800 text-xs rounded-full font-medium">
                            High Priority
                          </span>
                        )}
                      </div>
                    </div>
                    
                    <button
                      onClick={() => dismissAlert(alert.id)}
                      className="flex-shrink-0 p-1 hover:bg-red-100 rounded transition-colors duration-200"
                    >
                      <X className="w-4 h-4 text-red-600" />
                    </button>
                  </div>
                </div>
              </div>
            ))}

            {/* Warning Alerts */}
            {warningAlerts.map((alert) => (
              <div
                key={alert.id}
                className={`flex items-start gap-3 p-3 rounded-lg border ${getAlertColor(alert.type)}`}
              >
                <div className="flex-shrink-0 mt-0.5">
                  {getAlertIcon(alert.type)}
                </div>
                
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <h4 className={`text-sm font-semibold ${getAlertTextColor(alert.type)}`}>
                        {alert.title}
                      </h4>
                      <p className={`text-sm mt-1 ${getAlertTextColor(alert.type)} opacity-90`}>
                        {alert.message}
                      </p>
                      <div className="flex items-center gap-2 mt-2">
                        <Clock className="w-3 h-3 text-gray-500" />
                        <span className="text-xs text-gray-500">
                          {formatTimeAgo(alert.timestamp)}
                        </span>
                      </div>
                    </div>
                    
                    <button
                      onClick={() => dismissAlert(alert.id)}
                      className="flex-shrink-0 p-1 hover:bg-yellow-100 rounded transition-colors duration-200"
                    >
                      <X className="w-4 h-4 text-yellow-600" />
                    </button>
                  </div>
                </div>
              </div>
            ))}

            {/* Info Alerts */}
            {infoAlerts.map((alert) => (
              <div
                key={alert.id}
                className={`flex items-start gap-3 p-3 rounded-lg border ${getAlertColor(alert.type)}`}
              >
                <div className="flex-shrink-0 mt-0.5">
                  {getAlertIcon(alert.type)}
                </div>
                
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <h4 className={`text-sm font-semibold ${getAlertTextColor(alert.type)}`}>
                        {alert.title}
                      </h4>
                      <p className={`text-sm mt-1 ${getAlertTextColor(alert.type)} opacity-90`}>
                        {alert.message}
                      </p>
                      <div className="flex items-center gap-2 mt-2">
                        <Clock className="w-3 h-3 text-gray-500" />
                        <span className="text-xs text-gray-500">
                          {formatTimeAgo(alert.timestamp)}
                        </span>
                      </div>
                    </div>
                    
                    <button
                      onClick={() => dismissAlert(alert.id)}
                      className="flex-shrink-0 p-1 hover:bg-blue-100 rounded transition-colors duration-200"
                    >
                      <X className="w-4 h-4 text-blue-600" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Quick Actions */}
      {isExpanded && (
        <div className="px-4 py-3 bg-gray-50 border-t border-gray-200">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4 text-sm">
              <button className="text-blue-600 hover:text-blue-800 font-medium">
                View All Alerts
              </button>
              <button className="text-gray-600 hover:text-gray-800">
                Alert Settings
              </button>
            </div>
            
            <div className="flex items-center gap-2">
              <span className="text-xs text-gray-500">
                {activeAlerts.length} active alerts
              </span>
              <button
                onClick={() => setDismissedAlerts(new Set())}
                className="text-xs text-gray-600 hover:text-gray-800 underline"
              >
                Dismiss All
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
} 