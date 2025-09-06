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
        console.log('🔗 API URL:', process.env.NEXT_PUBLIC_API_URL || 'https://icu-management-system.vercel.app/api')
        
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
            totalAdmissions: 45,
            totalPatientsEver: 45,
            recovered: 35,
            transferred: 6,
            deceased: 4,
            mortalityRate: 8.89,
            survivalRate: 91.11,
            recoveryRate: 77.78,
            averageStayLength: 4.2,
            criticalCases: 8,
            stabilized: 12,
            complications: 2
          },
          deathRateAnalysis: {
            currentMonth: 8.89,
            lastMonth: 7.85,
            trend: 'decreasing',
            yearToDate: 8.2,
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
            current: 75,
            average: 68,
            peak: 92,
            turnoverRate: 1.2,
            occupancyTrend: 'stable',
            availableBeds: 3,
            totalBeds: 12,
            occupiedBeds: 9,
            maintenanceBeds: 0
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
            criticalEquipment: 96,
            totalEquipment: 25
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

  const exportAnalyticsData = () => {
    // Create export data
    const exportData = {
      generatedAt: new Date().toISOString(),
      title: 'ICU Analytics Report',
      data: analytics
    }

    // Create CSV content
    const csvContent = [
      'ICU Analytics Report',
      `Generated: ${new Date().toLocaleString()}`,
      '',
      'Patient Outcomes:',
      `Total Admissions,${analytics.patientOutcomes.totalAdmissions}`,
      `Recovered,${analytics.patientOutcomes.recovered}`,
      `Transferred,${analytics.patientOutcomes.transferred}`,
      `Deceased,${analytics.patientOutcomes.deceased}`,
      `Mortality Rate,${analytics.patientOutcomes.mortalityRate}%`,
      `Survival Rate,${analytics.patientOutcomes.survivalRate}%`,
      '',
      'Death Rate Analysis:',
      `Current Month,${analytics.deathRateAnalysis.currentMonth}%`,
      `Last Month,${analytics.deathRateAnalysis.lastMonth}%`,
      `Year to Date,${analytics.deathRateAnalysis.yearToDate}%`,
      '',
      'Bed Utilization:',
      `Current Occupancy,${analytics.bedUtilization.current}%`,
      `Average Occupancy,${analytics.bedUtilization.average}%`,
      `Peak Occupancy,${analytics.bedUtilization.peak}%`,
      `Available Beds,${analytics.bedUtilization.availableBeds}`,
      `Total Beds,${analytics.bedUtilization.totalBeds}`,
      '',
      'Equipment Status:',
      `Operational,${analytics.equipmentStatus.operational}%`,
      `Maintenance,${analytics.equipmentStatus.maintenance}%`,
      `Out of Order,${analytics.equipmentStatus.outOfOrder}%`,
      `Total Equipment,${analytics.equipmentStatus.totalEquipment || 'N/A'}`,
      `Maintenance Due,${analytics.equipmentStatus.maintenanceDue || 0}`,
    ].join('\n')

    // Create and download file
    const blob = new Blob([csvContent], { type: 'text/csv' })
    const url = window.URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = `icu-analytics-${new Date().toISOString().split('T')[0]}.csv`
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    window.URL.revokeObjectURL(url)
  }

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
            onClick={() => exportAnalyticsData()}
            className="px-3 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors text-sm flex items-center gap-2"
          >
            <Target className="w-4 h-4" />
            Export PDF
          </button>
          <button 
            onClick={() => window.location.reload()}
            className="px-3 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm"
          >
            {error ? 'Retry Connection' : 'Refresh Data'}
          </button>
        </div>
      </div>

      {/* Key Performance Indicators */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
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
      </div>

      {/* Analytics Charts and Death Rate Analysis */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
            <BarChart3 className="w-5 h-5 text-blue-600" />
            Patient Status Distribution
          </h3>
          
          {/* Pie Chart Representation */}
          <div className="flex items-center justify-center mb-6">
            <div className="relative w-40 h-40">
              <svg className="w-40 h-40 transform -rotate-90" viewBox="0 0 42 42">
                {/* Background circle */}
                <circle
                  cx="21"
                  cy="21"
                  r="15.915"
                  fill="transparent"
                  stroke="#e5e7eb"
                  strokeWidth="3"
                />
                {/* Recovered segment */}
                <circle
                  cx="21"
                  cy="21"
                  r="15.915"
                  fill="transparent"
                  stroke="#10b981"
                  strokeWidth="3"
                  strokeDasharray={`${(analytics.patientOutcomes.recovered / analytics.patientOutcomes.totalPatientsEver) * 100} ${100 - (analytics.patientOutcomes.recovered / analytics.patientOutcomes.totalPatientsEver) * 100}`}
                  strokeDashoffset="25"
                />
                {/* Transferred segment */}
                <circle
                  cx="21"
                  cy="21"
                  r="15.915"
                  fill="transparent"
                  stroke="#3b82f6"
                  strokeWidth="3"
                  strokeDasharray={`${(analytics.patientOutcomes.transferred / analytics.patientOutcomes.totalPatientsEver) * 100} ${100 - (analytics.patientOutcomes.transferred / analytics.patientOutcomes.totalPatientsEver) * 100}`}
                  strokeDashoffset={`${25 - (analytics.patientOutcomes.recovered / analytics.patientOutcomes.totalPatientsEver) * 100}`}
                />
                {/* Deceased segment */}
                <circle
                  cx="21"
                  cy="21"
                  r="15.915"
                  fill="transparent"
                  stroke="#ef4444"
                  strokeWidth="3"
                  strokeDasharray={`${(analytics.patientOutcomes.deceased / analytics.patientOutcomes.totalPatientsEver) * 100} ${100 - (analytics.patientOutcomes.deceased / analytics.patientOutcomes.totalPatientsEver) * 100}`}
                  strokeDashoffset={`${25 - (analytics.patientOutcomes.recovered / analytics.patientOutcomes.totalPatientsEver) * 100 - (analytics.patientOutcomes.transferred / analytics.patientOutcomes.totalPatientsEver) * 100}`}
                />
              </svg>
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="text-center">
                  <div className="text-2xl font-bold text-gray-900">{analytics.patientOutcomes.totalPatientsEver}</div>
                  <div className="text-xs text-gray-500">Total</div>
                </div>
              </div>
            </div>
          </div>

          {/* Legend */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                <span className="text-sm">Recovered</span>
              </div>
              <span className="font-semibold text-green-600">{analytics.patientOutcomes.recovered}</span>
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
                <span className="text-sm">Transferred</span>
              </div>
              <span className="font-semibold text-blue-600">{analytics.patientOutcomes.transferred}</span>
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 bg-red-500 rounded-full"></div>
                <span className="text-sm">Deceased</span>
              </div>
              <span className="font-semibold text-red-600">{analytics.patientOutcomes.deceased}</span>
            </div>
          </div>
        </div>

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
              <p className="text-sm font-medium text-gray-900 mb-3">Death Rate by Age Group</p>
              {Object.entries(analytics.deathRateAnalysis.byAge).map(([age, rate]) => (
                <div key={age} className="flex items-center justify-between mb-2">
                  <span className="text-sm text-gray-600">{age} years</span>
                  <div className="flex items-center gap-2">
                    <div className="w-20 bg-gray-200 rounded-full h-2">
                      <div 
                        className="bg-red-500 h-2 rounded-full" 
                        style={{ width: `${Math.min(rate * 5, 100)}%` }}
                      ></div>
                    </div>
                    <span className="text-sm font-medium w-8">{rate}%</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Equipment and Bed Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
            <Bed className="w-5 h-5 text-indigo-600" />
            Bed Utilization Chart
          </h3>
          
          {/* Bar Chart for Bed Utilization */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-gray-700">Occupied Beds</span>
              <div className="flex items-center gap-3">
                <div className="w-32 bg-gray-200 rounded-full h-4">
                  <div 
                    className="bg-blue-500 h-4 rounded-full" 
                    style={{ width: `${analytics.bedUtilization.current}%` }}
                  ></div>
                </div>
                <span className="font-semibold text-blue-600 min-w-[4rem]">
                  {analytics.bedUtilization.occupiedBeds || Math.round((analytics.bedUtilization.current / 100) * analytics.bedUtilization.totalBeds)} / {analytics.bedUtilization.totalBeds}
                </span>
              </div>
            </div>

            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-gray-700">Available Beds</span>
              <div className="flex items-center gap-3">
                <div className="w-32 bg-gray-200 rounded-full h-4">
                  <div 
                    className="bg-green-500 h-4 rounded-full" 
                    style={{ width: `${(analytics.bedUtilization.availableBeds / analytics.bedUtilization.totalBeds) * 100}%` }}
                  ></div>
                </div>
                <span className="font-semibold text-green-600 min-w-[4rem]">
                  {analytics.bedUtilization.availableBeds} beds
                </span>
              </div>
            </div>

            {analytics.bedUtilization.maintenanceBeds > 0 && (
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-gray-700">Maintenance</span>
                <div className="flex items-center gap-3">
                  <div className="w-32 bg-gray-200 rounded-full h-4">
                    <div 
                      className="bg-orange-500 h-4 rounded-full" 
                      style={{ width: `${(analytics.bedUtilization.maintenanceBeds / analytics.bedUtilization.totalBeds) * 100}%` }}
                    ></div>
                  </div>
                  <span className="font-semibold text-orange-600 min-w-[4rem]">
                    {analytics.bedUtilization.maintenanceBeds} beds
                  </span>
                </div>
              </div>
            )}

            <div className="pt-4 border-t border-gray-200">
              <div className="grid grid-cols-3 gap-4 text-center">
                <div>
                  <div className="text-lg font-bold text-blue-600">{analytics.bedUtilization.current}%</div>
                  <div className="text-xs text-gray-500">Current</div>
                </div>
                <div>
                  <div className="text-lg font-bold text-gray-600">{analytics.bedUtilization.average}%</div>
                  <div className="text-xs text-gray-500">Average</div>
                </div>
                <div>
                  <div className="text-lg font-bold text-orange-600">{analytics.bedUtilization.peak}%</div>
                  <div className="text-xs text-gray-500">Peak</div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
            <Stethoscope className="w-5 h-5 text-purple-600" />
            Equipment Status Chart
          </h3>
          
          {/* Donut Chart for Equipment */}
          <div className="flex items-center justify-center mb-6">
            <div className="relative w-32 h-32">
              <svg className="w-32 h-32 transform -rotate-90" viewBox="0 0 36 36">
                <path
                  d="M18 2.0845
                    a 15.9155 15.9155 0 0 1 0 31.831
                    a 15.9155 15.9155 0 0 1 0 -31.831"
                  fill="none"
                  stroke="#e5e7eb"
                  strokeWidth="4"
                />
                <path
                  d="M18 2.0845
                    a 15.9155 15.9155 0 0 1 0 31.831
                    a 15.9155 15.9155 0 0 1 0 -31.831"
                  fill="none"
                  stroke="#10b981"
                  strokeWidth="4"
                  strokeDasharray={`${analytics.equipmentStatus.operational}, 100`}
                />
              </svg>
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="text-center">
                  <div className="text-xl font-bold text-green-600">{analytics.equipmentStatus.operational}%</div>
                  <div className="text-xs text-gray-500">Working</div>
                </div>
              </div>
            </div>
          </div>

          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                <span className="text-sm">Operational</span>
              </div>
              <span className="font-semibold text-green-600">{analytics.equipmentStatus.operational}%</span>
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 bg-orange-500 rounded-full"></div>
                <span className="text-sm">Maintenance</span>
              </div>
              <span className="font-semibold text-orange-600">{analytics.equipmentStatus.maintenance}%</span>
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 bg-red-500 rounded-full"></div>
                <span className="text-sm">Out of Order</span>
              </div>
              <span className="font-semibold text-red-600">{analytics.equipmentStatus.outOfOrder}%</span>
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
              <span className="font-semibold text-green-600">{analytics.patientOutcomes.recovered} patients</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">Transferred</span>
              <span className="font-semibold text-blue-600">{analytics.patientOutcomes.transferred} patients</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">Deceased</span>
              <span className="font-semibold text-red-600">{analytics.patientOutcomes.deceased} patients</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">Critical Cases</span>
              <span className="font-semibold text-orange-600">{analytics.patientOutcomes.criticalCases} patients</span>
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
              <span className="font-semibold text-green-600">{analytics.bedUtilization.availableBeds} beds</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">Occupied Beds</span>
              <span className="font-semibold text-blue-600">{analytics.bedUtilization.totalBeds - analytics.bedUtilization.availableBeds} beds</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">Total Beds</span>
              <span className="font-semibold text-gray-900">{analytics.bedUtilization.totalBeds} beds</span>
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
              <span className="text-sm text-gray-600">Peak Occupancy</span>
              <span className="font-semibold text-orange-600">{analytics.bedUtilization.peak}%</span>
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
              <span className="font-semibold text-green-600">{analytics.equipmentStatus.operational}% working</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">Under Maintenance</span>
              <span className="font-semibold text-orange-600">{analytics.equipmentStatus.maintenance}% servicing</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">Out of Order</span>
              <span className="font-semibold text-red-600">{analytics.equipmentStatus.outOfOrder}% broken</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">Utilization Rate</span>
              <span className="font-semibold text-blue-600">{analytics.equipmentStatus.utilizationRate}% in use</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">Maintenance Due</span>
              <span className="font-semibold text-yellow-600">{analytics.equipmentStatus.maintenanceDue} devices</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">Critical Equipment</span>
              <span className="font-semibold text-green-600">{analytics.equipmentStatus.criticalEquipment}% available</span>
            </div>
          </div>
        </div>

        {/* Equipment Utilization Chart */}
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
            <Activity className="w-5 h-5 text-purple-600" />
            Equipment Utilization Chart
          </h3>
          
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-4 h-4 bg-green-500 rounded-full"></div>
                <span className="text-sm font-medium">Operational</span>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-32 bg-gray-200 rounded-full h-3">
                  <div 
                    className="bg-green-500 h-3 rounded-full" 
                    style={{ width: `${analytics.equipmentStatus.operational}%` }}
                  ></div>
                </div>
                <span className="text-sm font-semibold text-gray-900 min-w-[3rem]">{analytics.equipmentStatus.operational}%</span>
              </div>
            </div>
            
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-4 h-4 bg-orange-500 rounded-full"></div>
                <span className="text-sm font-medium">Maintenance</span>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-32 bg-gray-200 rounded-full h-3">
                  <div 
                    className="bg-orange-500 h-3 rounded-full" 
                    style={{ width: `${analytics.equipmentStatus.maintenance}%` }}
                  ></div>
                </div>
                <span className="text-sm font-semibold text-gray-900 min-w-[3rem]">{analytics.equipmentStatus.maintenance}%</span>
              </div>
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-4 h-4 bg-red-500 rounded-full"></div>
                <span className="text-sm font-medium">Out of Order</span>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-32 bg-gray-200 rounded-full h-3">
                  <div 
                    className="bg-red-500 h-3 rounded-full" 
                    style={{ width: `${analytics.equipmentStatus.outOfOrder}%` }}
                  ></div>
                </div>
                <span className="text-sm font-semibold text-gray-900 min-w-[3rem]">{analytics.equipmentStatus.outOfOrder}%</span>
              </div>
            </div>

            <div className="pt-4 border-t border-gray-200">
              <div className="flex justify-between text-sm text-gray-600 mb-2">
                <span>Total Equipment:</span>
                <span className="font-semibold">{analytics.equipmentStatus.totalEquipment || 'N/A'}</span>
              </div>
              <div className="flex justify-between text-sm text-gray-600">
                <span>Maintenance Due:</span>
                <span className="font-semibold text-orange-600">{analytics.equipmentStatus.maintenanceDue || 0}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}