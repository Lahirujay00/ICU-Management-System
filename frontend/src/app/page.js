'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { 
  Users, 
  Activity, 
  AlertTriangle, 
  Heart, 
  Thermometer, 
  Droplets,
  TrendingUp,
  Clock,
  Bed,
  Stethoscope
} from 'lucide-react'
import toast from 'react-hot-toast'

export default function Dashboard() {
  const [stats, setStats] = useState({
    totalPatients: 0,
    criticalPatients: 0,
    stablePatients: 0,
    availableBeds: 0,
    totalStaff: 0,
    onDutyStaff: 0,
    equipmentAlerts: 0,
    maintenanceDue: 0
  })

  const [recentAlerts, setRecentAlerts] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // Simulate loading data
    setTimeout(() => {
      setStats({
        totalPatients: 24,
        criticalPatients: 3,
        stablePatients: 18,
        availableBeds: 6,
        totalStaff: 45,
        onDutyStaff: 32,
        equipmentAlerts: 2,
        maintenanceDue: 5
      })
      
      setRecentAlerts([
        {
          id: 1,
          type: 'critical',
          message: 'Patient in Bed 12 showing signs of deterioration',
          time: '2 minutes ago'
        },
        {
          id: 2,
          type: 'warning',
          message: 'Ventilator maintenance due in 3 days',
          time: '15 minutes ago'
        },
        {
          id: 3,
          type: 'info',
          message: 'New patient admitted to Bed 8',
          time: '1 hour ago'
        }
      ])
      
      setLoading(false)
    }, 1000)
  }, [])

  const StatCard = ({ title, value, icon: Icon, color, change }) => (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="card hover:shadow-md transition-shadow duration-200"
    >
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-gray-600">{title}</p>
          <p className="text-2xl font-bold text-gray-900">{value}</p>
          {change && (
            <p className={`text-sm ${change > 0 ? 'text-success-600' : 'text-danger-600'}`}>
              {change > 0 ? '+' : ''}{change} from last hour
            </p>
          )}
        </div>
        <div className={`p-3 rounded-full ${color}`}>
          <Icon className="w-6 h-6 text-white" />
        </div>
      </div>
    </motion.div>
  )

  const AlertCard = ({ alert }) => {
    const getAlertColor = (type) => {
      switch (type) {
        case 'critical': return 'border-l-4 border-danger-500 bg-danger-50'
        case 'warning': return 'border-l-4 border-warning-500 bg-warning-50'
        case 'info': return 'border-l-4 border-primary-500 bg-primary-50'
        default: return 'border-l-4 border-gray-500 bg-gray-50'
      }
    }

    const getAlertIcon = (type) => {
      switch (type) {
        case 'critical': return <AlertTriangle className="w-5 h-5 text-danger-600" />
        case 'warning': return <AlertTriangle className="w-5 h-5 text-warning-600" />
        case 'info': return <Activity className="w-5 h-5 text-primary-600" />
        default: return <Activity className="w-5 h-5 text-gray-600" />
      }
    }

    return (
      <motion.div
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        className={`p-4 rounded-lg ${getAlertColor(alert.type)}`}
      >
        <div className="flex items-start space-x-3">
          {getAlertIcon(alert.type)}
          <div className="flex-1">
            <p className="text-sm font-medium text-gray-900">{alert.message}</p>
            <p className="text-xs text-gray-500 mt-1">{alert.time}</p>
          </div>
        </div>
      </motion.div>
    )
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading ICU Dashboard...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-primary-600 rounded-lg">
                <Stethoscope className="w-6 h-6 text-white" />
              </div>
              <h1 className="text-2xl font-bold text-gray-900">ICU Management System</h1>
            </div>
            <div className="flex items-center space-x-4">
              <span className="text-sm text-gray-500">Last updated: {new Date().toLocaleTimeString()}</span>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <StatCard
            title="Total Patients"
            value={stats.totalPatients}
            icon={Users}
            color="bg-primary-500"
            change={2}
          />
          <StatCard
            title="Critical Patients"
            value={stats.criticalPatients}
            icon={AlertTriangle}
            color="bg-danger-500"
            change={-1}
          />
          <StatCard
            title="Available Beds"
            value={stats.availableBeds}
            icon={Bed}
            color="bg-success-500"
            change={0}
          />
          <StatCard
            title="On Duty Staff"
            value={stats.onDutyStaff}
            icon={Users}
            color="bg-warning-500"
            change={3}
          />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Patient Overview */}
          <div className="lg:col-span-2">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="card"
            >
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-semibold text-gray-900">Patient Overview</h2>
                <button className="btn-primary">View All Patients</button>
              </div>
              
              <div className="space-y-4">
                <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                  <div className="flex items-center space-x-3">
                    <div className="w-3 h-3 bg-success-500 rounded-full"></div>
                    <span className="font-medium">Stable</span>
                  </div>
                  <span className="text-2xl font-bold text-success-600">{stats.stablePatients}</span>
                </div>
                
                <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                  <div className="flex items-center space-x-3">
                    <div className="w-3 h-3 bg-warning-500 rounded-full"></div>
                    <span className="font-medium">Under Observation</span>
                  </div>
                  <span className="text-2xl font-bold text-warning-600">{stats.totalPatients - stats.stablePatients - stats.criticalPatients}</span>
                </div>
                
                <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                  <div className="flex items-center space-x-3">
                    <div className="w-3 h-3 bg-danger-500 rounded-full"></div>
                    <span className="font-medium">Critical</span>
                  </div>
                  <span className="text-2xl font-bold text-danger-600">{stats.criticalPatients}</span>
                </div>
              </div>
            </motion.div>
          </div>

          {/* Recent Alerts */}
          <div>
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="card"
            >
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-semibold text-gray-900">Recent Alerts</h2>
                <button className="text-primary-600 hover:text-primary-700 text-sm font-medium">
                  View All
                </button>
              </div>
              
              <div className="space-y-3">
                {recentAlerts.map((alert) => (
                  <AlertCard key={alert.id} alert={alert} />
                ))}
              </div>
            </motion.div>
          </div>
        </div>

        {/* Quick Actions */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mt-8"
        >
          <div className="card">
            <h2 className="text-xl font-semibold text-gray-900 mb-6">Quick Actions</h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <button className="p-4 bg-primary-50 hover:bg-primary-100 rounded-lg transition-colors duration-200">
                <div className="text-center">
                  <Users className="w-8 h-8 text-primary-600 mx-auto mb-2" />
                  <span className="text-sm font-medium text-primary-700">Add Patient</span>
                </div>
              </button>
              
              <button className="p-4 bg-success-50 hover:bg-success-100 rounded-lg transition-colors duration-200">
                <div className="text-center">
                  <Activity className="w-8 h-8 text-success-600 mx-auto mb-2" />
                  <span className="text-sm font-medium text-success-700">Record Vitals</span>
                </div>
              </button>
              
              <button className="p-4 bg-warning-50 hover:bg-warning-100 rounded-lg transition-colors duration-200">
                <div className="text-center">
                  <Clock className="w-8 h-8 text-warning-600 mx-auto mb-2" />
                  <span className="text-sm font-medium text-warning-700">Schedule Staff</span>
                </div>
              </button>
              
              <button className="p-4 bg-gray-50 hover:bg-gray-100 rounded-lg transition-colors duration-200">
                <div className="text-center">
                  <TrendingUp className="w-8 h-8 text-gray-600 mx-auto mb-2" />
                  <span className="text-sm font-medium text-gray-700">View Reports</span>
                </div>
              </button>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  )
}

