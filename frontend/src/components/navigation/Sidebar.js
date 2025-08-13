'use client'

import { useState } from 'react'
import { 
  LayoutDashboard, 
  Users, 
  User, 
  Bed, 
  Stethoscope, 
  Activity,
  BarChart3,
  Settings,
  LogOut,
  Menu,
  X,
  Brain,
  AlertTriangle
} from 'lucide-react'
import { useSession, signOut } from 'next-auth/react'

const navigationItems = [
  {
    name: 'Overview',
    icon: LayoutDashboard,
    tab: 'overview',
    description: 'Dashboard overview'
  },
  {
    name: 'Patients',
    icon: User,
    tab: 'patients',
    description: 'Patient management'
  },
  {
    name: 'AI Risk Analysis',
    icon: Brain,
    tab: 'ai-risk',
    description: 'AI-powered risk prediction'
  },
  {
    name: 'Staff',
    icon: Users,
    tab: 'staff',
    description: 'Staff scheduling'
  },
  {
    name: 'Equipment',
    icon: Stethoscope,
    tab: 'equipment',
    description: 'Inventory management'
  },
  {
    name: 'Bed Management',
    icon: Bed,
    tab: 'beds',
    description: 'Bed allocation'
  },
  {
    name: 'Analytics',
    icon: BarChart3,
    tab: 'analytics',
    description: 'Performance metrics'
  },
  {
    name: 'Settings',
    icon: Settings,
    tab: 'settings',
    description: 'System configuration'
  }
]

export default function Sidebar({ activeTab, onTabChange }) {
  const { data: session } = useSession()
  const [isCollapsed, setIsCollapsed] = useState(false)

  const handleSignOut = () => {
    signOut({ callbackUrl: '/' })
  }

  return (
    <div className={`bg-gradient-to-b from-white to-gray-50 border-r border-gray-200 flex flex-col transition-all duration-300 shadow-lg ${
      isCollapsed ? 'w-16' : 'w-64'
    }`}>
      {/* Header */}
      <div className="p-4 border-b border-gray-200 bg-white">
        <div className="flex items-center justify-between">
          {!isCollapsed && (
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gradient-to-br from-blue-600 to-blue-700 rounded-xl flex items-center justify-center shadow-lg">
                <Activity className="w-6 h-6 text-white" />
              </div>
              <div>
                <span className="font-bold text-xl text-gray-900">ICU</span>
                <p className="text-xs text-gray-500 -mt-1">Management</p>
              </div>
            </div>
          )}
          <button
            onClick={() => setIsCollapsed(!isCollapsed)}
            className="p-2 rounded-lg hover:bg-gray-100 transition-colors"
          >
            {isCollapsed ? <Menu className="w-5 h-5" /> : <X className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {/* User Profile */}
      {!isCollapsed && session?.user && (
        <div className="p-4 border-b border-gray-200 bg-white">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-gradient-to-br from-blue-100 to-blue-200 rounded-full flex items-center justify-center border-2 border-blue-200">
              <User className="w-6 h-6 text-blue-600" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold text-gray-900 truncate">
                {session.user.name}
              </p>
              <p className="text-xs text-gray-500 capitalize">
                {session.user.role}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Navigation */}
      <nav className="flex-1 p-4 space-y-2">
        {navigationItems.map((item) => {
          const Icon = item.icon
          const isActive = activeTab === item.tab
          
          return (
            <button
              key={item.name}
              onClick={() => onTabChange(item.tab)}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-left transition-all duration-200 ${
                isActive
                  ? 'bg-gradient-to-r from-blue-500 to-blue-600 text-white shadow-lg transform scale-105'
                  : 'text-gray-700 hover:bg-white hover:text-gray-900 hover:shadow-md'
              }`}
              title={isCollapsed ? item.description : undefined}
            >
              <Icon className={`w-5 h-5 flex-shrink-0 ${
                isActive ? 'text-white' : 'text-gray-500'
              }`} />
              {!isCollapsed && (
                <span className="font-medium">{item.name}</span>
              )}
            </button>
          )
        })}
      </nav>

      {/* Footer */}
      <div className="p-4 border-t border-gray-200 bg-white">
        <button
          onClick={handleSignOut}
          className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-left text-gray-700 hover:bg-red-50 hover:text-red-600 transition-all duration-200`}
          title={isCollapsed ? 'Sign out' : undefined}
        >
          <LogOut className="w-5 h-5" />
          {!isCollapsed && (
            <span className="font-medium">Sign Out</span>
          )}
        </button>
      </div>
    </div>
  )
} 