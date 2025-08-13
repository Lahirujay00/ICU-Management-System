'use client'

import { useState, useEffect } from 'react'
import { 
  Users, 
  User, 
  Bed, 
  Stethoscope, 
  Activity,
  TrendingUp,
  AlertTriangle,
  Heart,
  Brain,
  Clock,
  CheckCircle,
  XCircle,
  BarChart3
} from 'lucide-react'

export default function Overview() {
  const [stats, setStats] = useState({
    totalPatients: 24,
    criticalPatients: 8,
    stablePatients: 12,
    improvingPatients: 4,
    availableBeds: 6,
    totalStaff: 18,
    onDutyStaff: 15,
    equipmentAlerts: 3
  })

  const [recentAlerts, setRecentAlerts] = useState([
    { id: 1, type: 'critical', message: 'Patient in Bed 3 showing critical vitals', time: '2 min ago', patient: 'John Smith' },
    { id: 2, type: 'warning', message: 'Low stock alert: Ventilator filters', time: '15 min ago' },
    { id: 3, type: 'info', message: 'Dr. Smith shift starting in 30 min', time: '1 hour ago' }
  ])

  const [aiInsights, setAiInsights] = useState([
    { id: 1, type: 'risk', message: 'High risk of deterioration detected in Bed 7', confidence: 87, patient: 'Sarah Johnson' },
    { id: 2, type: 'trend', message: 'Improving trend detected in Bed 12', confidence: 92, patient: 'Mike Wilson' },
    { id: 3, type: 'prediction', message: 'Potential discharge candidate in 48h', confidence: 78, patient: 'Emma Davis' }
  ])

  const getAlertIcon = (type) => {
    switch (type) {
      case 'critical':
        return <AlertTriangle className="w-5 h-5 text-red-600" />
      case 'warning':
        return <AlertTriangle className="w-5 h-5 text-yellow-600" />
      case 'info':
        return <Activity className="w-5 h-5 text-blue-600" />
      default:
        return <Activity className="w-5 h-5 text-gray-600" />
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

  const getAiIcon = (type) => {
    switch (type) {
      case 'risk':
        return <AlertTriangle className="w-5 h-5 text-red-600" />
      case 'trend':
        return <TrendingUp className="w-5 h-5 text-green-600" />
      case 'prediction':
        return <Brain className="w-5 h-5 text-purple-600" />
      default:
        return <Brain className="w-5 h-5 text-blue-600" />
    }
  }

  const getAiColor = (type) => {
    switch (type) {
      case 'risk':
        return 'border-red-200 bg-red-50'
      case 'trend':
        return 'border-green-200 bg-green-50'
      case 'prediction':
        return 'border-purple-200 bg-purple-50'
      default:
        return 'border-blue-200 bg-blue-50'
    }
  }

  return (
    <div className="space-y-6">
      {/* Welcome Header */}
      <div className="bg-gradient-to-r from-blue-600 to-blue-700 rounded-2xl p-6 text-white shadow-lg">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold mb-2">Welcome to ICU Management</h1>
            <p className="text-blue-100 text-lg">Real-time monitoring and AI-powered insights for critical care</p>
          </div>
          <div className="hidden md:block">
            <div className="w-20 h-20 bg-white bg-opacity-20 rounded-full flex items-center justify-center">
              <Activity className="w-10 h-10" />
            </div>
          </div>
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white rounded-xl p-6 shadow-lg border border-gray-100">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total Patients</p>
              <p className="text-3xl font-bold text-gray-900">{stats.totalPatients}</p>
            </div>
            <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center">
              <User className="w-6 h-6 text-blue-600" />
            </div>
          </div>
          <div className="mt-4 flex items-center text-sm">
            <span className="text-green-600 font-medium">+2</span>
            <span className="text-gray-500 ml-1">from yesterday</span>
          </div>
        </div>

        <div className="bg-white rounded-xl p-6 shadow-lg border border-gray-100">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Critical Patients</p>
              <p className="text-3xl font-bold text-red-600">{stats.criticalPatients}</p>
            </div>
            <div className="w-12 h-12 bg-red-100 rounded-xl flex items-center justify-center">
              <AlertTriangle className="w-6 h-6 text-red-600" />
            </div>
          </div>
          <div className="mt-4 flex items-center text-sm">
            <span className="text-red-600 font-medium">Requires attention</span>
          </div>
        </div>

        <div className="bg-white rounded-xl p-6 shadow-lg border border-gray-100">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Available Beds</p>
              <p className="text-3xl font-bold text-green-600">{stats.availableBeds}</p>
            </div>
            <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center">
              <Bed className="w-6 h-6 text-green-600" />
            </div>
          </div>
          <div className="mt-4 flex items-center text-sm">
            <span className="text-green-600 font-medium">Ready for admission</span>
          </div>
        </div>

        <div className="bg-white rounded-xl p-6 shadow-lg border border-gray-100">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Staff on Duty</p>
              <p className="text-3xl font-bold text-blue-600">{stats.onDutyStaff}</p>
            </div>
            <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center">
              <Users className="w-6 h-6 text-blue-600" />
            </div>
          </div>
          <div className="mt-4 flex items-center text-sm">
            <span className="text-blue-600 font-medium">/{stats.totalStaff} total</span>
          </div>
        </div>
      </div>

      {/* AI Insights and Alerts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* AI Insights */}
        <div className="bg-white rounded-xl shadow-lg border border-gray-100">
          <div className="p-6 border-b border-gray-200">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-purple-600 rounded-xl flex items-center justify-center">
                <Brain className="w-5 h-5 text-white" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-900">AI Insights</h3>
                <p className="text-sm text-gray-600">Real-time risk analysis and predictions</p>
              </div>
            </div>
          </div>
          <div className="p-6 space-y-4">
            {aiInsights.map((insight) => (
              <div key={insight.id} className={`p-4 rounded-lg border ${getAiColor(insight.type)}`}>
                <div className="flex items-start gap-3">
                  {getAiIcon(insight.type)}
                  <div className="flex-1">
                    <p className="text-sm font-medium text-gray-800 mb-1">
                      {insight.message}
                    </p>
                    {insight.patient && (
                      <p className="text-xs text-gray-600 mb-2">Patient: {insight.patient}</p>
                    )}
                    <div className="flex items-center gap-2">
                      <span className="text-xs text-gray-500">Confidence:</span>
                      <div className="flex-1 bg-gray-200 rounded-full h-2">
                        <div 
                          className="bg-purple-600 h-2 rounded-full transition-all duration-300"
                          style={{ width: `${insight.confidence}%` }}
                        ></div>
                      </div>
                      <span className="text-xs font-medium text-gray-700">{insight.confidence}%</span>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Recent Alerts */}
        <div className="bg-white rounded-xl shadow-lg border border-gray-200">
          <div className="p-6 border-b border-gray-200">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gradient-to-br from-red-500 to-red-600 rounded-xl flex items-center justify-center">
                <AlertTriangle className="w-5 h-5 text-white" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-900">Recent Alerts</h3>
                <p className="text-sm text-gray-600">Critical notifications and warnings</p>
              </div>
            </div>
          </div>
          <div className="p-6 space-y-4">
            {recentAlerts.map((alert) => (
              <div key={alert.id} className={`p-4 rounded-lg border ${getAlertColor(alert.type)}`}>
                <div className="flex items-start gap-3">
                  {getAlertIcon(alert.type)}
                  <div className="flex-1">
                    <p className="text-sm font-medium text-gray-800 mb-1">
                      {alert.message}
                    </p>
                    {alert.patient && (
                      <p className="text-xs text-gray-600 mb-1">Patient: {alert.patient}</p>
                    )}
                    <p className="text-xs text-gray-500">{alert.time}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="bg-white rounded-xl shadow-lg border border-gray-100 p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <button className="p-4 bg-blue-50 hover:bg-blue-100 rounded-xl border border-blue-200 transition-colors group">
            <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center mx-auto mb-3 group-hover:bg-blue-200 transition-colors">
              <User className="w-6 h-6 text-blue-600" />
            </div>
            <p className="text-sm font-medium text-blue-800 text-center">Admit Patient</p>
          </button>
          
          <button className="p-4 bg-green-50 hover:bg-green-100 rounded-xl border border-green-200 transition-colors group">
            <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center mx-auto mb-3 group-hover:bg-green-200 transition-colors">
              <Bed className="w-6 h-6 text-green-600" />
            </div>
            <p className="text-sm font-medium text-green-800 text-center">Manage Beds</p>
          </button>
          
          <button className="p-4 bg-purple-50 hover:bg-purple-100 rounded-xl border border-purple-200 transition-colors group">
            <div className="w-12 h-12 bg-purple-100 rounded-xl flex items-center justify-center mx-auto mb-3 group-hover:bg-purple-200 transition-colors">
              <Brain className="w-6 h-6 text-purple-600" />
            </div>
            <p className="text-sm font-medium text-purple-800 text-center">AI Analysis</p>
          </button>
          
          <button className="p-4 bg-orange-50 hover:bg-orange-100 rounded-xl border border-orange-200 transition-colors group">
            <div className="w-12 h-12 bg-orange-100 rounded-xl flex items-center justify-center mx-auto mb-3 group-hover:bg-orange-200 transition-colors">
              <BarChart3 className="w-6 h-6 text-orange-600" />
            </div>
            <p className="text-sm font-medium text-orange-800 text-center">View Reports</p>
          </button>
        </div>
      </div>
    </div>
  )
} 