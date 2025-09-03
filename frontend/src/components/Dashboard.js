'use client'

import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import { useSearchParams, useRouter } from 'next/navigation'
import Overview from './dashboard/Overview'
import PatientOverview from './dashboard/PatientOverview'
import StaffOverview from './dashboard/StaffOverview'
import EquipmentOverview from './dashboard/EquipmentOverview'
import BedManagement from './dashboard/BedManagement'
import AnalyticsPanel from './dashboard/AnalyticsPanel'
import SettingsPanel from './dashboard/SettingsPanel'
import Sidebar from './navigation/Sidebar'
import Header from './navigation/Header'

export default function Dashboard() {
  const { data: session } = useSession()
  const searchParams = useSearchParams()
  const router = useRouter()
  const [activeTab, setActiveTab] = useState('overview')
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    // Check for tab parameter in URL
    const tabParam = searchParams.get('tab')
    if (tabParam) {
      setActiveTab(tabParam)
    } else {
      // If no tab param, default to overview and update URL
      setActiveTab('overview')
      router.replace('/?tab=overview', undefined, { shallow: true })
    }
    
    // Load initial dashboard data
    loadDashboardData()
  }, [searchParams])

  const handleTabChange = (newTab) => {
    setActiveTab(newTab)
    // Update URL with new tab parameter
    router.replace(`/?tab=${newTab}`, undefined, { shallow: true })
  }

  const loadDashboardData = async () => {
    try {
      // Load dashboard data
      setIsLoading(false)
    } catch (error) {
      console.error('Error loading dashboard data:', error)
      setIsLoading(false)
    }
  }

  const renderMainContent = () => {
    switch (activeTab) {
      case 'overview':
        return <Overview />
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
      case 'settings':
        return <SettingsPanel />
      default:
        return <Overview />
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
      <Sidebar activeTab={activeTab} onTabChange={handleTabChange} />
      
      {/* Main Content Area */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Header */}
        <Header user={session?.user} />
        
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