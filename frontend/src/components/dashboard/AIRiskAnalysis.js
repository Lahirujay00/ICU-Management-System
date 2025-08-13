'use client'

import { useState, useEffect } from 'react'
import { 
  Brain, 
  AlertTriangle, 
  TrendingUp, 
  TrendingDown,
  Activity,
  Heart,
  Thermometer,
  Gauge,
  Clock,
  User,
  Shield,
  BarChart3,
  Zap,
  Target,
  CheckCircle,
  XCircle
} from 'lucide-react'
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, AreaChart, Area } from 'recharts'

export default function AIRiskAnalysis() {
  const [selectedPatient, setSelectedPatient] = useState(null)
  const [riskAnalysis, setRiskAnalysis] = useState(null)
  const [isAnalyzing, setIsAnalyzing] = useState(false)
  const [patients, setPatients] = useState([
    {
      id: 1,
      name: 'Sarah Johnson',
      bedNumber: '7',
      status: 'critical',
      riskScore: 87,
      riskLevel: 'high',
      lastUpdate: '2 min ago',
      vitalSigns: {
        heartRate: 125,
        bloodPressure: 180,
        temperature: 38.5,
        oxygenSaturation: 88,
        respiratoryRate: 28
      }
    },
    {
      id: 2,
      name: 'Mike Wilson',
      bedNumber: '12',
      status: 'improving',
      riskScore: 32,
      riskLevel: 'low',
      lastUpdate: '5 min ago',
      vitalSigns: {
        heartRate: 72,
        bloodPressure: 130,
        temperature: 37.2,
        oxygenSaturation: 96,
        respiratoryRate: 16
      }
    },
    {
      id: 3,
      name: 'Emma Davis',
      bedNumber: '15',
      status: 'stable',
      riskScore: 45,
      riskLevel: 'medium',
      lastUpdate: '8 min ago',
      vitalSigns: {
        heartRate: 85,
        bloodPressure: 145,
        temperature: 37.8,
        oxygenSaturation: 94,
        respiratoryRate: 18
      }
    }
  ])

  const [aiPredictions, setAiPredictions] = useState([
    {
      id: 1,
      patientId: 1,
      type: 'deterioration',
      probability: 87,
      timeframe: '2-4 hours',
      factors: ['Elevated heart rate', 'High blood pressure', 'Low oxygen saturation'],
      recommendations: [
        'Increase monitoring frequency to every 15 minutes',
        'Consider arterial line placement for continuous BP monitoring',
        'Prepare for potential intubation if O2 sat continues to drop'
      ]
    },
    {
      id: 2,
      patientId: 2,
      type: 'improvement',
      probability: 92,
      timeframe: '24-48 hours',
      factors: ['Stable vitals', 'Improving trends', 'Good response to treatment'],
      recommendations: [
        'Continue current treatment plan',
        'Consider step-down to intermediate care',
        'Monitor for any signs of regression'
      ]
    },
    {
      id: 3,
      patientId: 3,
      type: 'stable',
      probability: 78,
      timeframe: 'Next 12 hours',
      factors: ['Consistent vitals', 'No concerning trends', 'Adequate response to therapy'],
      recommendations: [
        'Maintain current monitoring schedule',
        'Continue present medication regimen',
        'Reassess in 6 hours'
      ]
    }
  ])

  const generateMockTrendData = (patientId, hours = 24) => {
    const data = []
    const now = new Date()
    
    for (let i = hours; i >= 0; i--) {
      const time = new Date(now.getTime() - i * 60 * 60 * 1000)
      data.push({
        time: time.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }),
        heartRate: Math.floor(Math.random() * 40) + 60,
        bloodPressure: Math.floor(Math.random() * 40) + 110,
        oxygenSaturation: Math.floor(Math.random() * 10) + 90,
        riskScore: Math.floor(Math.random() * 30) + 70
      })
    }
    return data
  }

  const performRiskAnalysis = async (patient) => {
    setIsAnalyzing(true)
    setSelectedPatient(patient)
    
    // Simulate AI analysis
    setTimeout(() => {
      const mockAnalysis = {
        overallRisk: patient.riskScore,
        riskFactors: [
          { factor: 'Elevated heart rate', severity: 'high', impact: 25 },
          { factor: 'High blood pressure', severity: 'medium', impact: 20 },
          { factor: 'Low oxygen saturation', severity: 'critical', impact: 35 },
          { factor: 'Age and comorbidities', severity: 'medium', impact: 15 }
        ],
        trends: generateMockTrendData(patient.id),
        predictions: {
          deterioration: patient.riskScore > 70 ? 85 : 25,
          improvement: patient.riskScore < 40 ? 80 : 20,
          complications: patient.riskScore > 60 ? 70 : 30
        },
        recommendations: [
          'Immediate intervention required for oxygen saturation',
          'Increase monitoring frequency to every 15 minutes',
          'Consider arterial line placement for continuous monitoring',
          'Prepare for potential ICU transfer if condition worsens'
        ]
      }
      setRiskAnalysis(mockAnalysis)
      setIsAnalyzing(false)
    }, 2000)
  }

  const getRiskLevelColor = (level) => {
    switch (level) {
      case 'high':
        return 'text-red-600 bg-red-50 border-red-200'
      case 'medium':
        return 'text-yellow-600 bg-yellow-50 border-yellow-200'
      case 'low':
        return 'text-green-600 bg-green-50 border-green-200'
      default:
        return 'text-gray-600 bg-gray-50 border-gray-200'
    }
  }

  const getRiskLevelIcon = (level) => {
    switch (level) {
      case 'high':
        return <AlertTriangle className="w-5 h-5 text-red-600" />
      case 'medium':
        return <Activity className="w-5 h-5 text-yellow-600" />
      case 'low':
        return <CheckCircle className="w-5 h-5 text-green-600" />
      default:
        return <Activity className="w-5 h-5 text-gray-600" />
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-gradient-to-r from-purple-600 to-purple-700 rounded-2xl p-6 text-white shadow-lg">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold mb-2">AI Risk Analysis</h1>
            <p className="text-purple-100 text-lg">AI-powered predictive analytics for patient risk assessment</p>
          </div>
          <div className="hidden md:block">
            <div className="w-20 h-20 bg-white bg-opacity-20 rounded-full flex items-center justify-center">
              <Brain className="w-10 h-10" />
            </div>
          </div>
        </div>
      </div>

      {/* Patient Selection */}
      <div className="bg-white rounded-xl shadow-lg border border-gray-100 p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Select Patient for AI Analysis</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {patients.map((patient) => (
            <div
              key={patient.id}
              onClick={() => performRiskAnalysis(patient)}
              className={`p-4 rounded-xl border-2 cursor-pointer transition-all duration-200 hover:shadow-lg ${
                selectedPatient?.id === patient.id
                  ? 'border-purple-500 bg-purple-50'
                  : 'border-gray-200 bg-white hover:border-purple-300'
              }`}
            >
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                    <User className="w-5 h-5 text-blue-600" />
                  </div>
                  <div>
                    <p className="font-semibold text-gray-900">{patient.name}</p>
                    <p className="text-sm text-gray-600">Bed {patient.bedNumber}</p>
                  </div>
                </div>
                <div className={`px-3 py-1 rounded-full text-sm font-medium border ${getRiskLevelColor(patient.riskLevel)}`}>
                  {patient.riskLevel}
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-2 text-sm">
                <div className="text-center p-2 bg-red-50 rounded">
                  <div className="text-lg font-semibold text-red-600">{patient.vitalSigns.heartRate}</div>
                  <div className="text-xs text-red-500">BPM</div>
                </div>
                <div className="text-center p-2 bg-blue-50 rounded">
                  <div className="text-lg font-semibold text-blue-600">{patient.vitalSigns.oxygenSaturation}%</div>
                  <div className="text-xs text-blue-500">O2 Sat</div>
                </div>
              </div>
              
              <div className="mt-3 text-center">
                <div className="text-2xl font-bold text-purple-600">{patient.riskScore}</div>
                <div className="text-xs text-gray-500">Risk Score</div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* AI Analysis Results */}
      {selectedPatient && (
        <div className="space-y-6">
          {/* Risk Overview */}
          <div className="bg-white rounded-xl shadow-lg border border-gray-100 p-6">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-purple-600 rounded-xl flex items-center justify-center">
                <Brain className="w-6 h-6 text-white" />
              </div>
              <div>
                <h3 className="text-xl font-semibold text-gray-900">AI Risk Analysis Results</h3>
                <p className="text-gray-600">Patient: {selectedPatient.name} (Bed {selectedPatient.bedNumber})</p>
              </div>
            </div>

            {isAnalyzing ? (
              <div className="text-center py-12">
                <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-purple-600 mx-auto mb-4"></div>
                <p className="text-lg text-gray-600">AI is analyzing patient data...</p>
                <p className="text-sm text-gray-500">This may take a few moments</p>
              </div>
            ) : riskAnalysis ? (
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Overall Risk Score */}
                <div className="text-center p-6 bg-gradient-to-br from-purple-50 to-purple-100 rounded-xl border border-purple-200">
                  <div className="w-24 h-24 bg-gradient-to-br from-purple-500 to-purple-600 rounded-full flex items-center justify-center mx-auto mb-4">
                    <span className="text-3xl font-bold text-white">{riskAnalysis.overallRisk}</span>
                  </div>
                  <p className="text-lg font-semibold text-purple-900">Overall Risk Score</p>
                  <p className="text-sm text-purple-600">Scale: 0-100</p>
                </div>

                {/* Risk Factors */}
                <div className="lg:col-span-2">
                  <h4 className="text-lg font-semibold text-gray-900 mb-4">Identified Risk Factors</h4>
                  <div className="space-y-3">
                    {riskAnalysis.riskFactors.map((factor, index) => (
                      <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                        <div className="flex items-center gap-3">
                          <div className={`w-3 h-3 rounded-full ${
                            factor.severity === 'critical' ? 'bg-red-500' :
                            factor.severity === 'high' ? 'bg-orange-500' :
                            factor.severity === 'medium' ? 'bg-yellow-500' : 'bg-green-500'
                          }`}></div>
                          <span className="font-medium text-gray-900">{factor.factor}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="text-sm text-gray-600 capitalize">{factor.severity}</span>
                          <span className="text-sm font-semibold text-purple-600">{factor.impact}%</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            ) : null}
          </div>

          {/* AI Predictions */}
          {riskAnalysis && (
            <div className="bg-white rounded-xl shadow-lg border border-gray-100 p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">AI Predictions & Outcomes</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="p-4 bg-red-50 rounded-xl border border-red-200">
                  <div className="flex items-center gap-2 mb-2">
                    <TrendingDown className="w-5 h-5 text-red-600" />
                    <span className="font-semibold text-red-800">Deterioration Risk</span>
                  </div>
                  <div className="text-2xl font-bold text-red-600 mb-2">{riskAnalysis.predictions.deterioration}%</div>
                  <p className="text-sm text-red-700">Probability of condition worsening</p>
                </div>

                <div className="p-4 bg-green-50 rounded-xl border border-green-200">
                  <div className="flex items-center gap-2 mb-2">
                    <TrendingUp className="w-5 h-5 text-green-600" />
                    <span className="font-semibold text-green-800">Improvement Chance</span>
                  </div>
                  <div className="text-2xl font-bold text-green-600 mb-2">{riskAnalysis.predictions.improvement}%</div>
                  <p className="text-sm text-green-700">Probability of recovery</p>
                </div>

                <div className="p-4 bg-yellow-50 rounded-xl border border-yellow-200">
                  <div className="flex items-center gap-2 mb-2">
                    <AlertTriangle className="w-5 h-5 text-yellow-600" />
                    <span className="font-semibold text-yellow-800">Complication Risk</span>
                  </div>
                  <div className="text-2xl font-bold text-yellow-600 mb-2">{riskAnalysis.predictions.complications}%</div>
                  <p className="text-sm text-yellow-700">Risk of complications</p>
                </div>
              </div>
            </div>
          )}

          {/* AI Recommendations */}
          {riskAnalysis && (
            <div className="bg-white rounded-xl shadow-lg border border-gray-100 p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">AI Recommendations</h3>
              <div className="space-y-3">
                {riskAnalysis.recommendations.map((recommendation, index) => (
                  <div key={index} className="flex items-start gap-3 p-4 bg-blue-50 rounded-lg border border-blue-200">
                    <div className="w-6 h-6 bg-blue-600 rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                      <span className="text-white text-sm font-bold">{index + 1}</span>
                    </div>
                    <p className="text-blue-800">{recommendation}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Trend Analysis Chart */}
          {riskAnalysis && (
            <div className="bg-white rounded-xl shadow-lg border border-gray-100 p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Risk Trend Analysis (24h)</h3>
              <div className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={riskAnalysis.trends}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="time" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Area 
                      type="monotone" 
                      dataKey="riskScore" 
                      stroke="#8b5cf6" 
                      fill="#8b5cf6" 
                      fillOpacity={0.3}
                      name="Risk Score"
                    />
                    <Line 
                      type="monotone" 
                      dataKey="heartRate" 
                      stroke="#ef4444" 
                      strokeWidth={2}
                      name="Heart Rate"
                    />
                    <Line 
                      type="monotone" 
                      dataKey="oxygenSaturation" 
                      stroke="#3b82f6" 
                      strokeWidth={2}
                      name="O2 Saturation"
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </div>
          )}
        </div>
      )}

      {/* AI Model Information */}
      <div className="bg-white rounded-xl shadow-lg border border-gray-100 p-6">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 bg-gradient-to-br from-green-500 to-green-600 rounded-xl flex items-center justify-center">
            <Shield className="w-5 h-5 text-white" />
          </div>
          <h3 className="text-lg font-semibold text-gray-900">AI Model Information</h3>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <h4 className="font-medium text-gray-900 mb-2">Model Performance</h4>
            <div className="space-y-2 text-sm text-gray-600">
              <div className="flex justify-between">
                <span>Accuracy:</span>
                <span className="font-medium text-green-600">94.2%</span>
              </div>
              <div className="flex justify-between">
                <span>Precision:</span>
                <span className="font-medium text-blue-600">91.8%</span>
              </div>
              <div className="flex justify-between">
                <span>Recall:</span>
                <span className="font-medium text-purple-600">89.5%</span>
              </div>
            </div>
          </div>
          <div>
            <h4 className="font-medium text-gray-900 mb-2">Last Updated</h4>
            <div className="space-y-2 text-sm text-gray-600">
              <div className="flex justify-between">
                <span>Model Version:</span>
                <span className="font-medium">v2.1.4</span>
              </div>
              <div className="flex justify-between">
                <span>Training Data:</span>
                <span className="font-medium">50K+ cases</span>
              </div>
              <div className="flex justify-between">
                <span>Last Training:</span>
                <span className="font-medium">2 days ago</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
} 