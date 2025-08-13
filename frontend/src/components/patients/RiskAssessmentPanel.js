'use client'

import { useState, useEffect } from 'react'
import { 
  Brain, 
  AlertTriangle, 
  TrendingUp, 
  Clock, 
  XCircle,
  Activity,
  Heart,
  Thermometer,
  Gauge
} from 'lucide-react'
import { analyzePatientRisk } from '@/lib/openrouter'

export default function RiskAssessmentPanel({ patient, onClose }) {
  const [riskAssessment, setRiskAssessment] = useState(null)
  const [isAnalyzing, setIsAnalyzing] = useState(false)
  const [error, setError] = useState(null)

  useEffect(() => {
    if (patient) {
      performRiskAssessment()
    }
  }, [patient])

  const performRiskAssessment = async () => {
    setIsAnalyzing(true)
    setError(null)
    
    try {
      // Prepare patient data for AI analysis
      const patientData = {
        name: patient.name,
        age: patient.age,
        diagnosis: patient.diagnosis,
        status: patient.status,
        vitalSigns: patient.vitalSigns?.[patient.vitalSigns.length - 1] || {},
        medicalHistory: patient.medicalHistory || [],
        allergies: patient.allergies || [],
        medications: patient.medications || [],
        admissionDate: patient.admissionDate,
        currentStatus: patient.status
      }

      const result = await analyzePatientRisk(patientData)
      
      if (result.success) {
        setRiskAssessment(result.analysis)
      } else {
        setError('Unable to perform AI risk assessment')
      }
    } catch (error) {
      console.error('Risk assessment error:', error)
      setError('Error performing risk assessment')
    } finally {
      setIsAnalyzing(false)
    }
  }

  const getRiskLevelColor = (level) => {
    switch (level?.toLowerCase()) {
      case 'low':
        return 'bg-green-100 text-green-800 border-green-300'
      case 'medium':
        return 'bg-yellow-100 text-yellow-800 border-yellow-300'
      case 'high':
        return 'bg-orange-100 text-orange-800 border-orange-300'
      case 'critical':
        return 'bg-red-100 text-red-800 border-red-300'
      default:
        return 'bg-gray-100 text-gray-800 border-gray-300'
    }
  }

  const getRiskScoreColor = (score) => {
    if (score <= 3) return 'text-green-600'
    if (score <= 6) return 'text-yellow-600'
    if (score <= 8) return 'text-orange-600'
    return 'text-red-600'
  }

  if (!patient) return null

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full mx-4 max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex justify-between items-center p-6 border-b border-gray-200">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-100 rounded-lg">
              <Brain className="w-6 h-6 text-blue-600" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-gray-900">AI Risk Assessment</h2>
              <p className="text-gray-600">Patient: {patient.name} (Bed {patient.roomNumber})</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600"
          >
            <XCircle className="w-6 h-6" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          {/* Current Patient Status */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="card bg-blue-50 border-blue-200">
              <div className="flex items-center gap-2">
                <Activity className="w-5 h-5 text-blue-600" />
                <span className="text-sm font-medium text-blue-600">Current Status</span>
              </div>
              <p className="text-lg font-semibold text-blue-900 mt-1">{patient.status}</p>
            </div>
            
            <div className="card bg-green-50 border-green-200">
              <div className="flex items-center gap-2">
                <Clock className="w-5 h-5 text-green-600" />
                <span className="text-sm font-medium text-green-600">Days in ICU</span>
              </div>
              <p className="text-lg font-semibold text-green-900 mt-1">
                {Math.ceil((new Date() - new Date(patient.admissionDate)) / (1000 * 60 * 60 * 24))}
              </p>
            </div>
            
            <div className="card bg-purple-50 border-purple-200">
              <div className="flex items-center gap-2">
                <Heart className="w-5 h-5 text-purple-600" />
                <span className="text-sm font-medium text-purple-600">Age</span>
              </div>
              <p className="text-lg font-semibold text-purple-900 mt-1">{patient.age} years</p>
            </div>
          </div>

          {/* Latest Vital Signs */}
          {patient.vitalSigns && patient.vitalSigns.length > 0 && (
            <div className="card">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Latest Vital Signs</h3>
              <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                <div className="text-center">
                  <div className="p-3 bg-red-50 rounded-lg">
                    <Thermometer className="w-6 h-6 text-red-600 mx-auto mb-2" />
                    <p className="text-sm text-gray-600">Temperature</p>
                    <p className="text-lg font-semibold text-gray-900">
                      {patient.vitalSigns[patient.vitalSigns.length - 1].temperature}°C
                    </p>
                  </div>
                </div>
                
                <div className="text-center">
                  <div className="p-3 bg-blue-50 rounded-lg">
                    <Heart className="w-6 h-6 text-blue-600 mx-auto mb-2" />
                    <p className="text-sm text-gray-600">Heart Rate</p>
                    <p className="text-lg font-semibold text-gray-900">
                      {patient.vitalSigns[patient.vitalSigns.length - 1].heartRate} bpm
                    </p>
                  </div>
                </div>
                
                <div className="text-center">
                  <div className="p-3 bg-green-50 rounded-lg">
                    <Gauge className="w-6 h-6 text-green-600 mx-auto mb-2" />
                    <p className="text-sm text-gray-600">BP</p>
                    <p className="text-lg font-semibold text-gray-900">
                      {patient.vitalSigns[patient.vitalSigns.length - 1].bloodPressure?.systolic}/
                      {patient.vitalSigns[patient.vitalSigns.length - 1].bloodPressure?.diastolic}
                    </p>
                  </div>
                </div>
                
                <div className="text-center">
                  <div className="p-3 bg-yellow-50 rounded-lg">
                    <Activity className="w-6 h-6 text-yellow-600 mx-auto mb-2" />
                    <p className="text-sm text-gray-600">O2 Sat</p>
                    <p className="text-lg font-semibold text-gray-900">
                      {patient.vitalSigns[patient.vitalSigns.length - 1].oxygenSaturation}%
                    </p>
                  </div>
                </div>
                
                <div className="text-center">
                  <div className="p-3 bg-purple-50 rounded-lg">
                    <TrendingUp className="w-6 h-6 text-purple-600 mx-auto mb-2" />
                    <p className="text-sm text-gray-600">Resp Rate</p>
                    <p className="text-lg font-semibold text-gray-900">
                      {patient.vitalSigns[patient.vitalSigns.length - 1].respiratoryRate} /min
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* AI Risk Assessment Results */}
          <div className="card">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900">AI Risk Assessment Results</h3>
              <button
                onClick={performRiskAssessment}
                disabled={isAnalyzing}
                className="btn-primary flex items-center gap-2"
              >
                {isAnalyzing ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                    Analyzing...
                  </>
                ) : (
                  <>
                    <Brain className="w-4 h-4" />
                    Re-analyze
                  </>
                )}
              </button>
            </div>

            {isAnalyzing && (
              <div className="text-center py-8">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
                <p className="text-gray-600">AI is analyzing patient data...</p>
              </div>
            )}

            {error && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                <div className="flex items-center gap-2">
                  <AlertTriangle className="w-5 h-5 text-red-600" />
                  <p className="text-red-800">{error}</p>
                </div>
              </div>
            )}

            {riskAssessment && !isAnalyzing && (
              <div className="space-y-6">
                {/* Risk Score and Level */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="text-center p-6 bg-gradient-to-br from-blue-50 to-blue-100 rounded-lg border border-blue-200">
                    <h4 className="text-sm font-medium text-blue-600 mb-2">Risk Score</h4>
                    <p className={`text-4xl font-bold ${getRiskScoreColor(riskAssessment.riskScore)}`}>
                      {riskAssessment.riskScore}/10
                    </p>
                    <p className="text-sm text-blue-600 mt-1">Higher score = Higher risk</p>
                  </div>
                  
                  <div className="text-center p-6 bg-gradient-to-br from-orange-50 to-orange-100 rounded-lg border border-orange-200">
                    <h4 className="text-sm font-medium text-orange-600 mb-2">Risk Level</h4>
                    <span className={`inline-block px-4 py-2 rounded-full text-lg font-semibold border ${getRiskLevelColor(riskAssessment.riskLevel)}`}>
                      {riskAssessment.riskLevel}
                    </span>
                  </div>
                </div>

                {/* Risk Factors */}
                <div>
                  <h4 className="text-lg font-semibold text-gray-900 mb-3">Identified Risk Factors</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {riskAssessment.riskFactors?.map((factor, index) => (
                      <div key={index} className="flex items-center gap-2 p-3 bg-red-50 rounded-lg border border-red-200">
                        <AlertTriangle className="w-4 h-4 text-red-600 flex-shrink-0" />
                        <span className="text-red-800 text-sm">{factor}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Recommendations */}
                <div>
                  <h4 className="text-lg font-semibold text-gray-900 mb-3">AI Recommendations</h4>
                  <div className="space-y-2">
                    {riskAssessment.recommendations?.map((recommendation, index) => (
                      <div key={index} className="flex items-start gap-3 p-3 bg-blue-50 rounded-lg border border-blue-200">
                        <div className="w-2 h-2 bg-blue-600 rounded-full mt-2 flex-shrink-0"></div>
                        <span className="text-blue-800 text-sm">{recommendation}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Monitoring Frequency */}
                <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                  <h4 className="text-lg font-semibold text-green-900 mb-2">Recommended Monitoring</h4>
                  <div className="flex items-center gap-2">
                    <Clock className="w-5 h-5 text-green-600" />
                    <span className="text-green-800 font-medium">{riskAssessment.monitoringFrequency}</span>
                  </div>
                </div>

                {/* Confidence Level */}
                <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium text-gray-600">AI Confidence Level</span>
                    <span className="text-sm font-semibold text-gray-900">
                      {Math.round(riskAssessment.confidence * 100)}%
                    </span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2 mt-2">
                    <div 
                      className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                      style={{ width: `${riskAssessment.confidence * 100}%` }}
                    ></div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
} 