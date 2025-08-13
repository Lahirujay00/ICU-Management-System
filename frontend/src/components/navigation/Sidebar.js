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
  Bell,
  LogOut,
  Menu,
  X
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
  const [notifications, setNotifications] = useState([
    { id: 1, type: 'critical', message: 'Patient in Bed 3 showing critical vitals', time: '2 min ago' },
    { id: 2, type: 'warning', message: 'Low stock alert: Ventilator filters', time: '15 min ago' },
    { id: 3, type: 'info', message: 'Dr. Smith shift starting in 30 min', time: '1 hour ago' }
  ])

  const handleSignOut = () => {
    signOut({ callbackUrl: '/' })
  }

  const getNotificationIcon = (type) => {
    switch (type) {
      case 'critical':
        return '🔴'
      case 'warning':
        return '🟡'
      case 'info':
        return '🔵'
      default:
        return '⚪'
    }
  }

  const getNotificationColor = (type) => {
    switch (type) {
      case 'critical':
        return 'border-red-200 bg-red-50'
      case 'warning':
        return 'border-yellow-200 bg-yellow-50'
      case 'info':
        return 'border-blue-200 bg-blue-50'
      default:
        return 'border-gray-200 bg-gray-50'
    }
  }

  return (
    <div className={`bg-white border-r border-gray-200 flex flex-col transition-all duration-300 ${
      isCollapsed ? 'w-16' : 'w-64'
    }`}>
      {/* Header */}
      <div className="p-4 border-b border-gray-200">
        <div className="flex items-center justify-between">
          {!isCollapsed && (
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
                <Activity className="w-5 h-5 text-white" />
              </div>
              <span className="font-bold text-lg text-gray-900">ICU</span>
            </div>
          )}
          <button
            onClick={() => setIsCollapsed(!isCollapsed)}
            className="p-1 rounded-lg hover:bg-gray-100"
          >
            {isCollapsed ? <Menu className="w-5 h-5" /> : <X className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {/* User Profile */}
      {!isCollapsed && session?.user && (
        <div className="p-4 border-b border-gray-200">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
              <User className="w-5 h-5 text-blue-600" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-gray-900 truncate">
                {session.user.name}
              </p>
              <p className="text-xs text-gray-500 capitalize">
                {session.user.role}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Notifications */}
      {!isCollapsed && (
        <div className="p-4 border-b border-gray-200">
          <div className="flex items-center gap-2 mb-3">
            <Bell className="w-4 h-4 text-gray-600" />
            <span className="text-sm font-medium text-gray-900">Notifications</span>
            <span className="ml-auto bg-red-500 text-white text-xs rounded-full px-2 py-1">
              {notifications.length}
            </span>
          </div>
          <div className="space-y-2 max-h-32 overflow-y-auto">
            {notifications.slice(0, 3).map((notification) => (
              <div
                key={notification.id}
                className={`p-2 rounded-lg border text-xs ${getNotificationColor(notification.type)}`}
              >
                <div className="flex items-start gap-2">
                  <span className="text-lg">{getNotificationIcon(notification.type)}</span>
                  <div className="flex-1 min-w-0">
                    <p className="text-gray-800 font-medium truncate">
                      {notification.message}
                    </p>
                    <p className="text-gray-500 text-xs">{notification.time}</p>
                  </div>
                </div>
              </div>
            ))}
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
              className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-left transition-colors duration-200 ${
                isActive
                  ? 'bg-blue-100 text-blue-700 border border-blue-200'
                  : 'text-gray-700 hover:bg-gray-100 hover:text-gray-900'
              }`}
              title={isCollapsed ? item.description : undefined}
            >
              <Icon className={`w-5 h-5 flex-shrink-0 ${
                isActive ? 'text-blue-600' : 'text-gray-500'
              }`} />
              {!isCollapsed && (
                <span className="font-medium">{item.name}</span>
              )}
            </button>
          )
        })}
      </nav>

      {/* Footer */}
      <div className="p-4 border-t border-gray-200">
        <button
          onClick={handleSignOut}
          className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-left text-gray-700 hover:bg-gray-100 hover:text-gray-900 transition-colors duration-200`}
          title={isCollapsed ? 'Sign out' : undefined}
        >
          <LogOut className="w-5 h-5 text-gray-500" />
          {!isCollapsed && (
            <span className="font-medium">Sign Out</span>
          )}
        </button>
      </div>
    </div>
  )
} 