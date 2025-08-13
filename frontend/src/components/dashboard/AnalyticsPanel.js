'use client'

import { useState, useEffect } from 'react'
import { 
  BarChart3, 
  TrendingUp, 
  Users, 
  Activity, 
  Clock,
  Heart,
  Bed,
  Stethoscope
} from 'lucide-react'

export default function AnalyticsPanel() {
  const [isLoading, setIsLoading] = useState(true)
  const [analytics, setAnalytics] = useState({
    patientOutcomes: {
      recovered: 85,
      transferred: 10,
      deceased: 5
    },
    bedUtilization: {
      average: 78,
      peak: 95,
      current: 82
    },
    staffEfficiency: {
      averageResponseTime: 3.2,
      patientSatisfaction: 4.6,
      complianceRate: 92
    },
    equipmentUtilization: {
      ventilators: 75,
      monitors: 88,
      infusionPumps: 92
    }
  })

  useEffect(() => {
    // Simulate loading analytics data
    setTimeout(() => {
      setIsLoading(false)
    }, 1000)
  }, [])

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
          <h2 className="text-2xl font-bold text-gray-900">Analytics Dashboard</h2>
          <p className="text-gray-600">Performance metrics and key insights</p>
        </div>
        <div className="flex gap-2">
          <select className="px-3 py-2 border border-gray-300 rounded-lg text-sm">
            <option>Last 7 days</option>
            <option>Last 30 days</option>
            <option>Last 3 months</option>
            <option>Last year</option>
          </select>
          <button className="btn-primary">Export Report</button>
        </div>
      </div>

      {/* Key Metrics Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="card bg-gradient-to-r from-blue-50 to-blue-100 border-blue-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-blue-600">Bed Utilization</p>
              <p className="text-2xl font-bold text-blue-900">{analytics.bedUtilization.current}%</p>
              <p className="text-xs text-blue-600">Peak: {analytics.bedUtilization.peak}%</p>
            </div>
            <Bed className="w-8 h-8 text-blue-600" />
          </div>
        </div>

        <div className="card bg-gradient-to-r from-green-50 to-green-100 border-green-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-green-600">Recovery Rate</p>
              <p className="text-2xl font-bold text-green-900">{analytics.patientOutcomes.recovered}%</p>
              <p className="text-xs text-green-600">Patient outcomes</p>
            </div>
            <Heart className="w-8 h-8 text-green-600" />
          </div>
        </div>

        <div className="card bg-gradient-to-r from-purple-50 to-purple-100 border-purple-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-purple-600">Response Time</p>
              <p className="text-2xl font-bold text-purple-900">{analytics.staffEfficiency.averageResponseTime}m</p>
              <p className="text-xs text-purple-600">Average</p>
            </div>
            <Clock className="w-8 h-8 text-purple-600" />
          </div>
        </div>

        <div className="card bg-gradient-to-r from-orange-50 to-orange-100 border-orange-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-orange-600">Equipment Use</p>
              <p className="text-2xl font-bold text-orange-900">{analytics.equipmentUtilization.ventilators}%</p>
              <p className="text-xs text-orange-600">Ventilators</p>
            </div>
            <Stethoscope className="w-8 h-8 text-orange-600" />
          </div>
        </div>
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Patient Outcomes Chart */}
        <div className="card">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Patient Outcomes</h3>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                <span className="text-sm font-medium">Recovered</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-32 bg-gray-200 rounded-full h-2">
                  <div 
                    className="bg-green-500 h-2 rounded-full" 
                    style={{ width: `${analytics.patientOutcomes.recovered}%` }}
                  ></div>
                </div>
                <span className="text-sm font-medium text-gray-900">{analytics.patientOutcomes.recovered}%</span>
              </div>
            </div>
            
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
                <span className="text-sm font-medium">Transferred</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-32 bg-gray-200 rounded-full h-2">
                  <div 
                    className="bg-blue-500 h-2 rounded-full" 
                    style={{ width: `${analytics.patientOutcomes.transferred}%` }}
                  ></div>
                </div>
                <span className="text-sm font-medium text-gray-900">{analytics.patientOutcomes.transferred}%</span>
              </div>
            </div>
            
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 bg-red-500 rounded-full"></div>
                <span className="text-sm font-medium">Deceased</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-32 bg-gray-200 rounded-full h-2">
                  <div 
                    className="bg-red-500 h-2 rounded-full" 
                    style={{ width: `${analytics.patientOutcomes.deceased}%` }}
                  ></div>
                </div>
                <span className="text-sm font-medium text-gray-900">{analytics.patientOutcomes.deceased}%</span>
              </div>
            </div>
          </div>
        </div>

        {/* Staff Efficiency Chart */}
        <div className="card">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Staff Efficiency</h3>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">Response Time</span>
              <div className="flex items-center gap-2">
                <div className="w-32 bg-gray-200 rounded-full h-2">
                  <div 
                    className="bg-blue-500 h-2 rounded-full" 
                    style={{ width: `${(5 - analytics.staffEfficiency.averageResponseTime) / 5 * 100}%` }}
                  ></div>
                </div>
                <span className="text-sm font-medium text-gray-900">{analytics.staffEfficiency.averageResponseTime}m</span>
              </div>
            </div>
            
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">Patient Satisfaction</span>
              <div className="flex items-center gap-2">
                <div className="w-32 bg-gray-200 rounded-full h-2">
                  <div 
                    className="bg-green-500 h-2 rounded-full" 
                    style={{ width: `${analytics.staffEfficiency.patientSatisfaction / 5 * 100}%` }}
                  ></div>
                </div>
                <span className="text-sm font-medium text-gray-900">{analytics.staffEfficiency.patientSatisfaction}/5</span>
              </div>
            </div>
            
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">Compliance Rate</span>
              <div className="flex items-center gap-2">
                <div className="w-32 bg-gray-200 rounded-full h-2">
                  <div 
                    className="bg-purple-500 h-2 rounded-full" 
                    style={{ width: `${analytics.staffEfficiency.complianceRate}%` }}
                  ></div>
                </div>
                <span className="text-sm font-medium text-gray-900">{analytics.staffEfficiency.complianceRate}%</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Equipment Utilization */}
      <div className="card">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Equipment Utilization</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="text-center">
            <div className="relative w-24 h-24 mx-auto mb-3">
              <svg className="w-24 h-24 transform -rotate-90" viewBox="0 0 36 36">
                <path
                  d="M18 2.0845
                    a 15.9155 15.9155 0 0 1 0 31.831
                    a 15.9155 15.9155 0 0 1 0 -31.831"
                  fill="none"
                  stroke="#e5e7eb"
                  strokeWidth="3"
                />
                <path
                  d="M18 2.0845
                    a 15.9155 15.9155 0 0 1 0 31.831
                    a 15.9155 15.9155 0 0 1 0 -31.831"
                  fill="none"
                  stroke="#3b82f6"
                  strokeWidth="3"
                  strokeDasharray={`${analytics.equipmentUtilization.ventilators}, 100`}
                />
              </svg>
              <div className="absolute inset-0 flex items-center justify-center">
                <span className="text-lg font-bold text-gray-900">{analytics.equipmentUtilization.ventilators}%</span>
              </div>
            </div>
            <p className="text-sm font-medium text-gray-700">Ventilators</p>
          </div>
          
          <div className="text-center">
            <div className="relative w-24 h-24 mx-auto mb-3">
              <svg className="w-24 h-24 transform -rotate-90" viewBox="0 0 36 36">
                <path
                  d="M18 2.0845
                    a 15.9155 15.9155 0 0 1 0 31.831
                    a 15.9155 15.9155 0 0 1 0 -31.831"
                  fill="none"
                  stroke="#e5e7eb"
                  strokeWidth="3"
                />
                <path
                  d="M18 2.0845
                    a 15.9155 15.9155 0 0 1 0 31.831
                    a 15.9155 15.9155 0 0 1 0 -31.831"
                  fill="none"
                  stroke="#10b981"
                  strokeWidth="3"
                  strokeDasharray={`${analytics.equipmentUtilization.monitors}, 100`}
                />
              </svg>
              <div className="absolute inset-0 flex items-center justify-center">
                <span className="text-lg font-bold text-gray-900">{analytics.equipmentUtilization.monitors}%</span>
              </div>
            </div>
            <p className="text-sm font-medium text-gray-700">Monitors</p>
          </div>
          
          <div className="text-center">
            <div className="relative w-24 h-24 mx-auto mb-3">
              <svg className="w-24 h-24 transform -rotate-90" viewBox="0 0 36 36">
                <path
                  d="M18 2.0845
                    a 15.9155 15.9155 0 0 1 0 31.831
                    a 15.9155 15.9155 0 0 1 0 -31.831"
                  fill="none"
                  stroke="#e5e7eb"
                  strokeWidth="3"
                />
                <path
                  d="M18 2.0845
                    a 15.9155 15.9155 0 0 1 0 31.831
                    a 15.9155 15.9155 0 0 1 0 -31.831"
                  fill="none"
                  stroke="#f59e0b"
                  strokeWidth="3"
                  strokeDasharray={`${analytics.equipmentUtilization.infusionPumps}, 100`}
                />
              </svg>
              <div className="absolute inset-0 flex items-center justify-center">
                <span className="text-lg font-bold text-gray-900">{analytics.equipmentUtilization.infusionPumps}%</span>
              </div>
            </div>
            <p className="text-sm font-medium text-gray-700">Infusion Pumps</p>
          </div>
        </div>
      </div>

      {/* Trends and Insights */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="card">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Recent Trends</h3>
          <div className="space-y-3">
            <div className="flex items-center gap-3">
              <TrendingUp className="w-5 h-5 text-green-600" />
              <div>
                <p className="text-sm font-medium text-gray-900">Patient Recovery Rate</p>
                <p className="text-xs text-gray-500">Increased by 5% this month</p>
              </div>
            </div>
            
            <div className="flex items-center gap-3">
              <Activity className="w-5 h-5 text-blue-600" />
              <div>
                <p className="text-sm font-medium text-gray-900">Bed Utilization</p>
                <p className="text-xs text-gray-500">Stable at 78% average</p>
              </div>
            </div>
            
            <div className="flex items-center gap-3">
              <Users className="w-5 h-5 text-purple-600" />
              <div>
                <p className="text-sm font-medium text-gray-900">Staff Efficiency</p>
                <p className="text-xs text-gray-500">Response time improved by 0.3m</p>
              </div>
            </div>
          </div>
        </div>

        <div className="card">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Recommendations</h3>
          <div className="space-y-3">
            <div className="p-3 bg-blue-50 rounded-lg border border-blue-200">
              <p className="text-sm font-medium text-blue-900">Optimize Bed Management</p>
              <p className="text-xs text-blue-700 mt-1">Consider adding 2 more beds during peak hours</p>
            </div>
            
            <div className="p-3 bg-green-50 rounded-lg border border-green-200">
              <p className="text-sm font-medium text-green-900">Staff Training</p>
              <p className="text-xs text-green-700 mt-1">Schedule additional training for new protocols</p>
            </div>
            
            <div className="p-3 bg-yellow-50 rounded-lg border border-yellow-200">
              <p className="text-sm font-medium text-yellow-900">Equipment Maintenance</p>
              <p className="text-xs text-yellow-700 mt-1">Schedule preventive maintenance for monitors</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
} 