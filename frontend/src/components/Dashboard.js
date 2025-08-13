'use client'

import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import PatientOverview from './dashboard/PatientOverview'
import StaffOverview from './dashboard/StaffOverview'
import EquipmentOverview from './dashboard/EquipmentOverview'
import AlertsPanel from './dashboard/AlertsPanel'
import BedManagement from './dashboard/BedManagement'
import AnalyticsPanel from './dashboard/AnalyticsPanel'
import Sidebar from './navigation/Sidebar'
import Header from './navigation/Header'

export default function Dashboard() {
  const { data: session } = useSession()
  const [activeTab, setActiveTab] = useState('overview')
  const [alerts, setAlerts] = useState([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    // Load initial dashboard data
    loadDashboardData()
  }, [])

  const loadDashboardData = async () => {
    try {
      // Load alerts, patient data, etc.
      setIsLoading(false)
    } catch (error) {
      console.error('Error loading dashboard data:', error)
      setIsLoading(false)
    }
  }

  const renderMainContent = () => {
    switch (activeTab) {
      case 'overview':
        return (
          <div className="space-y-6">
            <PatientOverview />
            <StaffOverview />
            <EquipmentOverview />
          </div>
        )
      case 'patients':
        return <PatientOverview detailed={true} />
      case 'staff':
        return <StaffOverview detailed={true} />
      case 'equipment':
        return <EquipmentOverview detailed={true} />
      case 'beds':
        return <BedManagement />
      case 'analytics':
        return <AnalyticsPanel />
      default:
        return <PatientOverview />
    }
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  return (
    <div className="flex h-screen bg-gray-50">
      {/* Sidebar Navigation */}
      <Sidebar activeTab={activeTab} onTabChange={setActiveTab} />
      
      {/* Main Content Area */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Header */}
        <Header user={session?.user} />
        
        {/* Alerts Panel - Always visible at top */}
        <AlertsPanel alerts={alerts} />
        
        {/* Main Content */}
        <main className="flex-1 overflow-y-auto p-6">
          <div className="max-w-7xl mx-auto">
            {renderMainContent()}
          </div>
        </main>
      </div>
    </div>
  )
} 