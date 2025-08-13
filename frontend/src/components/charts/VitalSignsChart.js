'use client'

import { useState, useEffect } from 'react'
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts'

export default function VitalSignsChart({ patientId, timeRange = '24h' }) {
  const [vitalSigns, setVitalSigns] = useState([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    // Mock data for development
    const mockData = generateMockVitalSigns(timeRange)
    setVitalSigns(mockData)
    setIsLoading(false)
  }, [patientId, timeRange])

  const generateMockVitalSigns = (range) => {
    const data = []
    const now = new Date()
    let hours = range === '24h' ? 24 : 6

    for (let i = hours; i >= 0; i--) {
      const time = new Date(now.getTime() - i * 60 * 60 * 1000)
      data.push({
        time: time.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }),
        heartRate: Math.floor(Math.random() * 40) + 60, // 60-100 bpm
        bloodPressure: Math.floor(Math.random() * 40) + 110, // 110-150 mmHg
        temperature: (Math.random() * 2 + 36.5).toFixed(1), // 36.5-38.5°C
        oxygenSaturation: Math.floor(Math.random() * 10) + 90, // 90-100%
        respiratoryRate: Math.floor(Math.random() * 10) + 12, // 12-22 breaths/min
      })
    }
    return data
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  return (
    <div className="bg-white rounded-lg shadow p-6">
      <div className="mb-4">
        <h3 className="text-lg font-semibold text-gray-900">Vital Signs Trend</h3>
        <p className="text-sm text-gray-600">Real-time monitoring of patient vital signs</p>
      </div>
      
      <div className="h-80">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={vitalSigns}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="time" />
            <YAxis />
            <Tooltip />
            <Legend />
            <Line 
              type="monotone" 
              dataKey="heartRate" 
              stroke="#ef4444" 
              strokeWidth={2}
              name="Heart Rate (bpm)"
            />
            <Line 
              type="monotone" 
              dataKey="bloodPressure" 
              stroke="#3b82f6" 
              strokeWidth={2}
              name="Blood Pressure (mmHg)"
            />
            <Line 
              type="monotone" 
              dataKey="temperature" 
              stroke="#f59e0b" 
              strokeWidth={2}
              name="Temperature (°C)"
            />
            <Line 
              type="monotone" 
              dataKey="oxygenSaturation" 
              stroke="#10b981" 
              strokeWidth={2}
              name="O2 Saturation (%)"
            />
            <Line 
              type="monotone" 
              dataKey="respiratoryRate" 
              stroke="#8b5cf6" 
              strokeWidth={2}
              name="Respiratory Rate"
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
      
      <div className="mt-4 grid grid-cols-2 md:grid-cols-5 gap-4">
        <div className="text-center">
          <div className="text-2xl font-bold text-red-500">
            {vitalSigns[vitalSigns.length - 1]?.heartRate || '--'}
          </div>
          <div className="text-sm text-gray-600">Heart Rate</div>
        </div>
        <div className="text-center">
          <div className="text-2xl font-bold text-blue-500">
            {vitalSigns[vitalSigns.length - 1]?.bloodPressure || '--'}
          </div>
          <div className="text-sm text-gray-600">BP (mmHg)</div>
        </div>
        <div className="text-center">
          <div className="text-2xl font-bold text-yellow-500">
            {vitalSigns[vitalSigns.length - 1]?.temperature || '--'}°C
          </div>
          <div className="text-sm text-gray-600">Temperature</div>
        </div>
        <div className="text-center">
          <div className="text-2xl font-bold text-green-500">
            {vitalSigns[vitalSigns.length - 1]?.oxygenSaturation || '--'}%
          </div>
          <div className="text-sm text-gray-600">O2 Sat</div>
        </div>
        <div className="text-center">
          <div className="text-2xl font-bold text-purple-500">
            {vitalSigns[vitalSigns.length - 1]?.respiratoryRate || '--'}
          </div>
          <div className="text-sm text-gray-600">Resp Rate</div>
        </div>
      </div>
    </div>
  )
} 