import { useState, useEffect } from 'react'
import { 
  BarChart3, 
  TrendingUp, 
  TrendingDown,
  Users, 
  Activity, 
  Clock,
  Heart,
  Bed,
  Stethoscope,
  AlertTriangle,
  CheckCircle,
  UserX,
  Calendar,
  Target,
  Shield,
  Zap,
  ArrowUp,
  ArrowDown,
  Minus
} from 'lucide-react'
import { apiClient } from '../../lib/api'

export default function AnalyticsPanel() {
  const [isLoading, setIsLoading] = useState(true)
  const [analytics, setAnalytics] = useState(null)
  const [error, setError] = useState(null)

  useEffect(() => {
    const fetchAnalytics = async () => {
      try {
        setIsLoading(true)
        setError(null)
        console.log('📊 Fetching analytics data from API...')
        console.log('🔗 API URL:', process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api')
        
        const data = await apiClient.getAnalytics()
        console.log('📈 Analytics data received:', data)
        
        setAnalytics(data)
      } catch (error) {
        console.error('❌ Failed to fetch analytics:', error)
        console.log('🔄 Using fallback mock data instead')
        setError(`API Connection Failed: ${error.message}`)
        
        // Fallback to mock data if API fails
        setAnalytics({
          patientOutcomes: {
            totalAdmissions: 245,
            recovered: 198,
            transferred: 32,
            deceased: 15,
            mortalityRate: 6.12,
            survivalRate: 93.88,
            recoveryRate: 80.82,
            averageStayLength: 4.2,
            criticalCases: 42,
            stabilized: 38,
            complications: 8
          },
          deathRateAnalysis: {
            currentMonth: 6.12,
            lastMonth: 7.85,
            trend: 'decreasing',
            yearToDate: 6.8,
            byAge: {
              '18-30': 2.1,
              '31-50': 4.8,
              '51-70': 8.2,
              '70+': 15.6
            },
            byCause: {
              'Cardiac Arrest': 35,
              'Respiratory Failure': 28,
              'Multi-organ Failure': 20,
              'Sepsis': 12,
              'Other': 5
            },
            timeToIntervention: 2.8
          },
          bedUtilization: {
            current: 85,
            average: 78,
            peak: 95,
            turnoverRate: 1.2,
            occupancyTrend: 'stable',
            availableBeds: 3,
            totalBeds: 20
          },
          staffEfficiency: {
            averageResponseTime: 2.8,
            patientSatisfaction: 4.7,
            staffUtilization: 87,
            overtimeHours: 38,
            staffToPatientRatio: 0.85,
            shiftCoverage: 98
          },
          equipmentStatus: {
            operational: 92,
            maintenance: 5,
            outOfOrder: 3,
            utilizationRate: 84,
            maintenanceDue: 8,
            criticalEquipment: 96
          },
          qualityMetrics: {
            infectionRate: 1.8,
            readmissionRate: 3.2,
            medicationErrors: 0.4,
            fallIncidents: 0.8,
            patientSafetyScore: 9.2
          }
        })
      } finally {
        setIsLoading(false)
      }
    }

    fetchAnalytics()
  }, [])

  const getTrendIcon = (trend) => {
    if (trend === 'increasing') return <ArrowUp className="w-4 h-4 text-red-600" />
    if (trend === 'decreasing') return <ArrowDown className="w-4 h-4 text-green-600" />
    return <Minus className="w-4 h-4 text-gray-600" />
  }

  const getTrendColor = (trend) => {
    if (trend === 'increasing') return 'text-red-600'
    if (trend === 'decreasing') return 'text-green-600'
    return 'text-gray-600'
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  if (error) {
    console.log('⚠️ API Connection Issue - Using fallback data')
    // Don't return error screen, just continue with fallback data
    // The header will show the error status
  }

  if (!analytics) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <BarChart3 className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-gray-900 mb-2">No Analytics Data</h3>
          <p className="text-gray-600">Analytics data is currently unavailable.</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Analytics Dashboard</h1>
          <div className="flex items-center gap-2">
            <p className="text-gray-600">
              {error ? 'Using Demo Data - ' : ''}
              Comprehensive ICU performance metrics and insights
            </p>
            {error && (
              <span className="inline-flex items-center px-2 py-1 rounded-full text-xs bg-yellow-100 text-yellow-800">
                <AlertTriangle className="w-3 h-3 mr-1" />
                API Offline
              </span>
            )}
          </div>
        </div>
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2 text-sm text-gray-500">
            <Clock className="w-4 h-4" />
            Last updated: {new Date().toLocaleTimeString()}
          </div>
          <button 
            onClick={() => window.location.reload()}
            className="px-3 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm"
          >
            {error ? 'Retry Connection' : 'Refresh Data'}
          </button>
        </div>
      </div>

      {/* Key Performance Indicators */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {/* Survival Rate */}
        <div className="bg-gradient-to-br from-green-50 to-green-100 border border-green-200 rounded-xl p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-green-600">Survival Rate</p>
              <p className="text-3xl font-bold text-green-900">{analytics.patientOutcomes.survivalRate}%</p>
              <div className="flex items-center gap-1 mt-1">
                <TrendingUp className="w-4 h-4 text-green-600" />
                <span className="text-xs text-green-600">+1.76% from last month</span>
              </div>
            </div>
            <div className="bg-green-200 p-3 rounded-full">
              <CheckCircle className="w-8 h-8 text-green-700" />
            </div>
          </div>
        </div>

        {/* Death Rate */}
        <div className="bg-gradient-to-br from-red-50 to-red-100 border border-red-200 rounded-xl p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-red-600">Mortality Rate</p>
              <p className="text-3xl font-bold text-red-900">{analytics.patientOutcomes.mortalityRate}%</p>
              <div className="flex items-center gap-1 mt-1">
                <TrendingDown className="w-4 h-4 text-green-600" />
                <span className="text-xs text-green-600">-1.73% from last month</span>
              </div>
            </div>
            <div className="bg-red-200 p-3 rounded-full">
              <UserX className="w-8 h-8 text-red-700" />
            </div>
          </div>
        </div>

        {/* Bed Occupancy */}
        <div className="bg-gradient-to-br from-blue-50 to-blue-100 border border-blue-200 rounded-xl p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-blue-600">Bed Occupancy</p>
              <p className="text-3xl font-bold text-blue-900">{analytics.bedUtilization.current}%</p>
              <div className="flex items-center gap-1 mt-1">
                {getTrendIcon(analytics.bedUtilization.occupancyTrend)}
                <span className={`text-xs ${getTrendColor(analytics.bedUtilization.occupancyTrend)}`}>
                  {analytics.bedUtilization.occupancyTrend}
                </span>
              </div>
            </div>
            <div className="bg-blue-200 p-3 rounded-full">
              <Bed className="w-8 h-8 text-blue-700" />
            </div>
          </div>
        </div>

        {/* Patient Satisfaction */}
        <div className="bg-gradient-to-br from-purple-50 to-purple-100 border border-purple-200 rounded-xl p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-purple-600">Patient Satisfaction</p>
              <p className="text-3xl font-bold text-purple-900">{analytics.staffEfficiency.patientSatisfaction}/5</p>
              <div className="flex items-center gap-1 mt-1">
                <TrendingUp className="w-4 h-4 text-purple-600" />
                <span className="text-xs text-purple-600">+0.1 from last month</span>
              </div>
            </div>
            <div className="bg-purple-200 p-3 rounded-full">
              <Heart className="w-8 h-8 text-purple-700" />
            </div>
          </div>
        </div>
      </div>

      {/* Detailed Death Rate Analysis */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
            <UserX className="w-5 h-5 text-red-600" />
            Mortality Analysis
          </h3>
          
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">Current Month</span>
              <div className="flex items-center gap-2">
                <span className="font-semibold text-red-900">{analytics.deathRateAnalysis.currentMonth}%</span>
                <TrendingDown className="w-4 h-4 text-green-600" />
              </div>
            </div>

            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">Last Month</span>
              <span className="font-semibold text-gray-900">{analytics.deathRateAnalysis.lastMonth}%</span>
            </div>

            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">Year to Date</span>
              <span className="font-semibold text-gray-900">{analytics.deathRateAnalysis.yearToDate}%</span>
            </div>

            <div className="pt-4 border-t border-gray-200">
              <p className="text-sm font-medium text-gray-900 mb-2">By Age Group</p>
              {Object.entries(analytics.deathRateAnalysis.byAge).map(([age, rate]) => (
                <div key={age} className="flex items-center justify-between text-sm mb-1">
                  <span className="text-gray-600">{age} years</span>
                  <span className="font-medium">{rate}%</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
            <AlertTriangle className="w-5 h-5 text-amber-600" />
            Primary Causes
          </h3>
          
          <div className="space-y-3">
            {Object.entries(analytics.deathRateAnalysis.byCause).map(([cause, percentage]) => (
              <div key={cause} className="flex items-center justify-between">
                <span className="text-sm text-gray-600">{cause}</span>
                <div className="flex items-center gap-2">
                  <div className="w-20 bg-gray-200 rounded-full h-2">
                    <div 
                      className="bg-red-500 h-2 rounded-full" 
                      style={{ width: `${percentage}%` }}
                    ></div>
                  </div>
                  <span className="text-sm font-medium text-gray-900 w-8">{percentage}%</span>
                </div>
              </div>
            ))}
          </div>

          <div className="mt-4 pt-4 border-t border-gray-200">
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">Avg. Time to Intervention</span>
              <span className="font-semibold text-gray-900">{analytics.deathRateAnalysis.timeToIntervention} min</span>
            </div>
          </div>
        </div>
      </div>

      {/* Performance Metrics Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {/* Patient Outcomes */}
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
            <Users className="w-5 h-5 text-blue-600" />
            Patient Outcomes
          </h3>
          
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">Total Admissions</span>
              <span className="font-semibold text-gray-900">{analytics.patientOutcomes.totalAdmissions}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">Recovered</span>
              <span className="font-semibold text-green-600">{analytics.patientOutcomes.recovered}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">Transferred</span>
              <span className="font-semibold text-blue-600">{analytics.patientOutcomes.transferred}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">Deceased</span>
              <span className="font-semibold text-red-600">{analytics.patientOutcomes.deceased}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">Avg. Stay Length</span>
              <span className="font-semibold text-gray-900">{analytics.patientOutcomes.averageStayLength} days</span>
            </div>
          </div>
        </div>

        {/* Bed Management */}
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
            <Bed className="w-5 h-5 text-indigo-600" />
            Bed Management
          </h3>
          
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">Available Beds</span>
              <span className="font-semibold text-green-600">{analytics.bedUtilization.availableBeds}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">Total Beds</span>
              <span className="font-semibold text-gray-900">{analytics.bedUtilization.totalBeds}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">Current Occupancy</span>
              <span className="font-semibold text-blue-600">{analytics.bedUtilization.current}%</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">Average Occupancy</span>
              <span className="font-semibold text-gray-900">{analytics.bedUtilization.average}%</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">Turnover Rate</span>
              <span className="font-semibold text-gray-900">{analytics.bedUtilization.turnoverRate}/day</span>
            </div>
          </div>
        </div>

        {/* Staff Performance */}
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
            <Activity className="w-5 h-5 text-green-600" />
            Staff Performance
          </h3>
          
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">Response Time</span>
              <span className="font-semibold text-gray-900">{analytics.staffEfficiency.averageResponseTime} min</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">Staff Utilization</span>
              <span className="font-semibold text-blue-600">{analytics.staffEfficiency.staffUtilization}%</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">Staff:Patient Ratio</span>
              <span className="font-semibold text-gray-900">{analytics.staffEfficiency.staffToPatientRatio}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">Shift Coverage</span>
              <span className="font-semibold text-green-600">{analytics.staffEfficiency.shiftCoverage}%</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">Overtime Hours</span>
              <span className="font-semibold text-orange-600">{analytics.staffEfficiency.overtimeHours}</span>
            </div>
          </div>
        </div>

        {/* Equipment Status */}
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
            <Stethoscope className="w-5 h-5 text-purple-600" />
            Equipment Status
          </h3>
          
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">Operational</span>
              <span className="font-semibold text-green-600">{analytics.equipmentStatus.operational}%</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">Under Maintenance</span>
              <span className="font-semibold text-orange-600">{analytics.equipmentStatus.maintenance}%</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">Out of Order</span>
              <span className="font-semibold text-red-600">{analytics.equipmentStatus.outOfOrder}%</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">Utilization Rate</span>
              <span className="font-semibold text-blue-600">{analytics.equipmentStatus.utilizationRate}%</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">Critical Equipment</span>
              <span className="font-semibold text-green-600">{analytics.equipmentStatus.criticalEquipment}%</span>
            </div>
          </div>
        </div>

        {/* Quality Metrics */}
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
            <Shield className="w-5 h-5 text-emerald-600" />
            Quality Metrics
          </h3>
          
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">Infection Rate</span>
              <span className="font-semibold text-orange-600">{analytics.qualityMetrics.infectionRate}%</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">Readmission Rate</span>
              <span className="font-semibold text-orange-600">{analytics.qualityMetrics.readmissionRate}%</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">Medication Errors</span>
              <span className="font-semibold text-red-600">{analytics.qualityMetrics.medicationErrors}%</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">Fall Incidents</span>
              <span className="font-semibold text-red-600">{analytics.qualityMetrics.fallIncidents}%</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">Safety Score</span>
              <span className="font-semibold text-green-600">{analytics.qualityMetrics.patientSafetyScore}/10</span>
            </div>
          </div>
        </div>

        {/* Key Insights */}
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
            <Target className="w-5 h-5 text-amber-600" />
            Key Insights
          </h3>
          
          <div className="space-y-3">
            <div className="p-3 bg-green-50 rounded-lg border border-green-200">
              <p className="text-sm font-medium text-green-900">Mortality Decreased</p>
              <p className="text-xs text-green-700 mt-1">1.73% improvement from last month</p>
            </div>
            
            <div className="p-3 bg-blue-50 rounded-lg border border-blue-200">
              <p className="text-sm font-medium text-blue-900">Bed Utilization Optimal</p>
              <p className="text-xs text-blue-700 mt-1">85% occupancy maintains efficiency</p>
            </div>
            
            <div className="p-3 bg-orange-50 rounded-lg border border-orange-200">
              <p className="text-sm font-medium text-orange-900">Equipment Attention Needed</p>
              <p className="text-xs text-orange-700 mt-1">8 devices due for maintenance</p>
            </div>

            <div className="p-3 bg-purple-50 rounded-lg border border-purple-200">
              <p className="text-sm font-medium text-purple-900">Staff Performance Strong</p>
              <p className="text-xs text-purple-700 mt-1">Response time improved by 0.4 min</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}