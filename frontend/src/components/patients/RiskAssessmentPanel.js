'use client'

import { useState } from 'react'
import { AlertTriangle, Shield, TrendingUp, Activity } from 'lucide-react'

export default function RiskAssessmentPanel({ patient }) {
  const [isExpanded, setIsExpanded] = useState(false)

  const calculateRiskScore = () => {
    if (!patient) return 0
    
    let score = 0
    if (patient.status === 'critical') score += 30
    if (patient.age > 65) score += 15
    if (patient.vitalSigns?.heartRate > 100 || patient.vitalSigns?.heartRate < 60) score += 20
    if (patient.vitalSigns?.oxygenSaturation < 95) score += 25
    if (patient.vitalSigns?.bloodPressure > 140) score += 15
    
    return Math.min(score, 100)
  }

  const getRiskLevel = (score) => {
    if (score >= 70) return { level: 'High', color: 'text-red-600', bg: 'bg-red-50', border: 'border-red-200' }
    if (score >= 40) return { level: 'Medium', color: 'text-yellow-600', bg: 'bg-yellow-50', border: 'border-yellow-200' }
    return { level: 'Low', color: 'text-green-600', bg: 'bg-green-50', border: 'border-green-200' }
  }

  const riskScore = calculateRiskScore()
  const riskLevel = getRiskLevel(riskScore)

  if (!patient) {
    return (
      <div className="bg-white rounded-lg shadow p-6">
        <div className="text-center text-gray-500">
          <Shield className="h-12 w-12 mx-auto text-gray-400 mb-2" />
          <p>Select a patient to view risk assessment</p>
        </div>
      </div>
    )
  }

  return (
    <div className="bg-white rounded-lg shadow p-6">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center space-x-2">
          <Shield className="h-5 w-5 text-blue-600" />
          <h3 className="text-lg font-semibold text-gray-900">Risk Assessment</h3>
        </div>
        <button
          onClick={() => setIsExpanded(!isExpanded)}
          className="text-sm text-blue-600 hover:text-blue-800"
        >
          {isExpanded ? 'Show Less' : 'Show More'}
        </button>
      </div>

      {/* Risk Score Display */}
      <div className="mb-6">
        <div className="text-center">
          <div className={`inline-flex items-center justify-center w-20 h-20 rounded-full ${riskLevel.bg} ${riskLevel.border} border-2`}>
            <span className={`text-2xl font-bold ${riskLevel.color}`}>{riskScore}</span>
          </div>
          <div className="mt-2">
            <span className={`text-lg font-semibold ${riskLevel.color}`}>{riskLevel.level} Risk</span>
          </div>
          <p className="text-sm text-gray-600">Risk Score: {riskScore}/100</p>
        </div>
      </div>

      {/* Risk Factors */}
      <div className="space-y-3">
        <h4 className="font-medium text-gray-900">Risk Factors</h4>
        
        <div className="space-y-2">
          {patient.status === 'critical' && (
            <div className="flex items-center space-x-2 text-sm">
              <AlertTriangle className="h-4 w-4 text-red-500" />
              <span className="text-red-700">Critical patient status</span>
            </div>
          )}
          
          {patient.age > 65 && (
            <div className="flex items-center space-x-2 text-sm">
              <TrendingUp className="h-4 w-4 text-yellow-500" />
              <span className="text-yellow-700">Advanced age ({patient.age} years)</span>
            </div>
          )}
          
          {patient.vitalSigns?.heartRate > 100 && (
            <div className="flex items-center space-x-2 text-sm">
              <Activity className="h-4 w-4 text-red-500" />
              <span className="text-red-700">Elevated heart rate ({patient.vitalSigns.heartRate} bpm)</span>
            </div>
          )}
          
          {patient.vitalSigns?.heartRate < 60 && (
            <div className="flex items-center space-x-2 text-sm">
              <Activity className="h-4 w-4 text-red-500" />
              <span className="text-red-700">Low heart rate ({patient.vitalSigns.heartRate} bpm)</span>
            </div>
          )}
          
          {patient.vitalSigns?.oxygenSaturation < 95 && (
            <div className="flex items-center space-x-2 text-sm">
              <Activity className="h-4 w-4 text-red-500" />
              <span className="text-red-700">Low oxygen saturation ({patient.vitalSigns.oxygenSaturation}%)</span>
            </div>
          )}
          
          {patient.vitalSigns?.bloodPressure > 140 && (
            <div className="flex items-center space-x-2 text-sm">
              <Activity className="h-4 w-4 text-yellow-500" />
              <span className="text-yellow-700">Elevated blood pressure ({patient.vitalSigns.bloodPressure} mmHg)</span>
            </div>
          )}
        </div>
      </div>

      {/* Recommendations */}
      {isExpanded && (
        <div className="mt-6 pt-4 border-t border-gray-200">
          <h4 className="font-medium text-gray-900 mb-3">Recommendations</h4>
          <div className="space-y-2 text-sm text-gray-700">
            {riskScore >= 70 && (
              <>
                <p>• Increase monitoring frequency to every 15 minutes</p>
                <p>• Consider transfer to higher acuity unit</p>
                <p>• Notify attending physician immediately</p>
              </>
            )}
            {riskScore >= 40 && riskScore < 70 && (
              <>
                <p>• Monitor vital signs every 30 minutes</p>
                <p>• Review medication dosages</p>
                <p>• Schedule follow-up assessment in 2 hours</p>
              </>
            )}
            {riskScore < 40 && (
              <>
                <p>• Continue standard monitoring protocols</p>
                <p>• Reassess in 4 hours</p>
                <p>• Maintain current treatment plan</p>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  )
} 