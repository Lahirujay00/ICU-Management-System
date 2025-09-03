'use client'

import { useState, useEffect } from 'react'
import { 
  Settings, 
  User, 
  Shield, 
  Bell, 
  Database, 
  Monitor, 
  Wifi,
  Lock,
  Globe,
  Palette,
  Moon,
  Sun,
  Volume2,
  VolumeX,
  Smartphone,
  Mail,
  Save,
  RotateCcw,
  Download,
  Upload,
  HardDrive,
  Calendar,
  Clock,
  Languages,
  Accessibility,
  Eye,
  EyeOff,
  FileText
} from 'lucide-react'

export default function SettingsPanel() {
  const [isLoading, setIsLoading] = useState(true)
  const [activeSection, setActiveSection] = useState('general')
  const [settings, setSettings] = useState({
    general: {
      hospitalName: 'City General Hospital',
      timezone: 'America/New_York',
      language: 'en',
      dateFormat: 'MM/DD/YYYY',
      currency: 'USD'
    },
    notifications: {
      emailAlerts: true,
      pushNotifications: true,
      smsAlerts: false,
      criticalAlerts: true,
      maintenanceReminders: true,
      soundEnabled: true,
      alertVolume: 75
    },
    security: {
      twoFactorAuth: false,
      sessionTimeout: 30,
      passwordExpiry: 90,
      failedLoginLockout: 5,
      auditLogging: true,
      dataEncryption: true
    },
    display: {
      theme: 'light',
      fontSize: 'medium',
      highContrast: false,
      colorBlind: false,
      animations: true,
      sidebar: 'expanded'
    },
    system: {
      autoBackup: true,
      backupFrequency: 'daily',
      maintenanceMode: false,
      debugMode: false,
      systemLogs: true,
      performanceMonitoring: true
    }
  })

  const [hasChanges, setHasChanges] = useState(false)

  useEffect(() => {
    // Simulate loading settings
    setTimeout(() => {
      setIsLoading(false)
    }, 500)
  }, [])

  const updateSetting = (section, key, value) => {
    setSettings(prev => ({
      ...prev,
      [section]: {
        ...prev[section],
        [key]: value
      }
    }))
    setHasChanges(true)
  }

  const saveSettings = async () => {
    // Simulate saving settings
    setIsLoading(true)
    await new Promise(resolve => setTimeout(resolve, 1000))
    setHasChanges(false)
    setIsLoading(false)
    // Show success message
    alert('Settings saved successfully!')
  }

  const resetToDefaults = () => {
    if (confirm('Are you sure you want to reset all settings to default values?')) {
      // Reset settings logic here
      setHasChanges(true)
    }
  }

  const exportSettings = () => {
    const dataStr = JSON.stringify(settings, null, 2)
    const dataBlob = new Blob([dataStr], { type: 'application/json' })
    const url = URL.createObjectURL(dataBlob)
    const link = document.createElement('a')
    link.href = url
    link.download = 'icu-settings.json'
    link.click()
  }

  const settingsSections = [
    { id: 'general', name: 'General', icon: Settings },
    { id: 'notifications', name: 'Notifications', icon: Bell },
    { id: 'security', name: 'Security', icon: Shield },
    { id: 'display', name: 'Display', icon: Monitor },
    { id: 'system', name: 'System', icon: Database }
  ]

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  const renderGeneralSettings = () => (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Hospital Name</label>
          <input
            type="text"
            value={settings.general.hospitalName}
            onChange={(e) => updateSetting('general', 'hospitalName', e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Timezone</label>
          <select
            value={settings.general.timezone}
            onChange={(e) => updateSetting('general', 'timezone', e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="America/New_York">Eastern Time</option>
            <option value="America/Chicago">Central Time</option>
            <option value="America/Denver">Mountain Time</option>
            <option value="America/Los_Angeles">Pacific Time</option>
            <option value="UTC">UTC</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Language</label>
          <select
            value={settings.general.language}
            onChange={(e) => updateSetting('general', 'language', e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="en">English</option>
            <option value="es">Spanish</option>
            <option value="fr">French</option>
            <option value="de">German</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Date Format</label>
          <select
            value={settings.general.dateFormat}
            onChange={(e) => updateSetting('general', 'dateFormat', e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="MM/DD/YYYY">MM/DD/YYYY</option>
            <option value="DD/MM/YYYY">DD/MM/YYYY</option>
            <option value="YYYY-MM-DD">YYYY-MM-DD</option>
          </select>
        </div>
      </div>
    </div>
  )

  const renderNotificationSettings = () => (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-4">
          <h3 className="text-lg font-medium text-gray-900">Alert Types</h3>
          
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Mail className="w-5 h-5 text-gray-500" />
              <span className="text-sm font-medium text-gray-700">Email Alerts</span>
            </div>
            <input
              type="checkbox"
              checked={settings.notifications.emailAlerts}
              onChange={(e) => updateSetting('notifications', 'emailAlerts', e.target.checked)}
              className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
            />
          </div>

          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Smartphone className="w-5 h-5 text-gray-500" />
              <span className="text-sm font-medium text-gray-700">Push Notifications</span>
            </div>
            <input
              type="checkbox"
              checked={settings.notifications.pushNotifications}
              onChange={(e) => updateSetting('notifications', 'pushNotifications', e.target.checked)}
              className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
            />
          </div>

          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Bell className="w-5 h-5 text-gray-500" />
              <span className="text-sm font-medium text-gray-700">Critical Alerts</span>
            </div>
            <input
              type="checkbox"
              checked={settings.notifications.criticalAlerts}
              onChange={(e) => updateSetting('notifications', 'criticalAlerts', e.target.checked)}
              className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
            />
          </div>
        </div>

        <div className="space-y-4">
          <h3 className="text-lg font-medium text-gray-900">Sound Settings</h3>
          
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              {settings.notifications.soundEnabled ? <Volume2 className="w-5 h-5 text-gray-500" /> : <VolumeX className="w-5 h-5 text-gray-500" />}
              <span className="text-sm font-medium text-gray-700">Sound Enabled</span>
            </div>
            <input
              type="checkbox"
              checked={settings.notifications.soundEnabled}
              onChange={(e) => updateSetting('notifications', 'soundEnabled', e.target.checked)}
              className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Alert Volume</label>
            <input
              type="range"
              min="0"
              max="100"
              value={settings.notifications.alertVolume}
              onChange={(e) => updateSetting('notifications', 'alertVolume', parseInt(e.target.value))}
              className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
            />
            <div className="flex justify-between text-xs text-gray-500 mt-1">
              <span>0%</span>
              <span>{settings.notifications.alertVolume}%</span>
              <span>100%</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  )

  const renderSecuritySettings = () => (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-4">
          <h3 className="text-lg font-medium text-gray-900">Authentication</h3>
          
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Shield className="w-5 h-5 text-gray-500" />
              <span className="text-sm font-medium text-gray-700">Two-Factor Authentication</span>
            </div>
            <input
              type="checkbox"
              checked={settings.security.twoFactorAuth}
              onChange={(e) => updateSetting('security', 'twoFactorAuth', e.target.checked)}
              className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Session Timeout (minutes)</label>
            <input
              type="number"
              min="5"
              max="120"
              value={settings.security.sessionTimeout}
              onChange={(e) => updateSetting('security', 'sessionTimeout', parseInt(e.target.value))}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>

        <div className="space-y-4">
          <h3 className="text-lg font-medium text-gray-900">Data Protection</h3>
          
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Lock className="w-5 h-5 text-gray-500" />
              <span className="text-sm font-medium text-gray-700">Data Encryption</span>
            </div>
            <input
              type="checkbox"
              checked={settings.security.dataEncryption}
              onChange={(e) => updateSetting('security', 'dataEncryption', e.target.checked)}
              className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
            />
          </div>

          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <FileText className="w-5 h-5 text-gray-500" />
              <span className="text-sm font-medium text-gray-700">Audit Logging</span>
            </div>
            <input
              type="checkbox"
              checked={settings.security.auditLogging}
              onChange={(e) => updateSetting('security', 'auditLogging', e.target.checked)}
              className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
            />
          </div>
        </div>
      </div>
    </div>
  )

  const renderDisplaySettings = () => (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-4">
          <h3 className="text-lg font-medium text-gray-900">Appearance</h3>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Theme</label>
            <div className="flex gap-3">
              <button
                onClick={() => updateSetting('display', 'theme', 'light')}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg border ${settings.display.theme === 'light' ? 'border-blue-500 bg-blue-50' : 'border-gray-300'}`}
              >
                <Sun className="w-4 h-4" />
                Light
              </button>
              <button
                onClick={() => updateSetting('display', 'theme', 'dark')}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg border ${settings.display.theme === 'dark' ? 'border-blue-500 bg-blue-50' : 'border-gray-300'}`}
              >
                <Moon className="w-4 h-4" />
                Dark
              </button>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Font Size</label>
            <select
              value={settings.display.fontSize}
              onChange={(e) => updateSetting('display', 'fontSize', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="small">Small</option>
              <option value="medium">Medium</option>
              <option value="large">Large</option>
            </select>
          </div>
        </div>

        <div className="space-y-4">
          <h3 className="text-lg font-medium text-gray-900">Accessibility</h3>
          
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Accessibility className="w-5 h-5 text-gray-500" />
              <span className="text-sm font-medium text-gray-700">High Contrast</span>
            </div>
            <input
              type="checkbox"
              checked={settings.display.highContrast}
              onChange={(e) => updateSetting('display', 'highContrast', e.target.checked)}
              className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
            />
          </div>

          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Palette className="w-5 h-5 text-gray-500" />
              <span className="text-sm font-medium text-gray-700">Color Blind Support</span>
            </div>
            <input
              type="checkbox"
              checked={settings.display.colorBlind}
              onChange={(e) => updateSetting('display', 'colorBlind', e.target.checked)}
              className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
            />
          </div>
        </div>
      </div>
    </div>
  )

  const renderSystemSettings = () => (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-4">
          <h3 className="text-lg font-medium text-gray-900">Backup & Maintenance</h3>
          
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <HardDrive className="w-5 h-5 text-gray-500" />
              <span className="text-sm font-medium text-gray-700">Auto Backup</span>
            </div>
            <input
              type="checkbox"
              checked={settings.system.autoBackup}
              onChange={(e) => updateSetting('system', 'autoBackup', e.target.checked)}
              className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Backup Frequency</label>
            <select
              value={settings.system.backupFrequency}
              onChange={(e) => updateSetting('system', 'backupFrequency', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="hourly">Hourly</option>
              <option value="daily">Daily</option>
              <option value="weekly">Weekly</option>
            </select>
          </div>
        </div>

        <div className="space-y-4">
          <h3 className="text-lg font-medium text-gray-900">System Monitoring</h3>
          
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Monitor className="w-5 h-5 text-gray-500" />
              <span className="text-sm font-medium text-gray-700">Performance Monitoring</span>
            </div>
            <input
              type="checkbox"
              checked={settings.system.performanceMonitoring}
              onChange={(e) => updateSetting('system', 'performanceMonitoring', e.target.checked)}
              className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
            />
          </div>

          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <FileText className="w-5 h-5 text-gray-500" />
              <span className="text-sm font-medium text-gray-700">System Logs</span>
            </div>
            <input
              type="checkbox"
              checked={settings.system.systemLogs}
              onChange={(e) => updateSetting('system', 'systemLogs', e.target.checked)}
              className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
            />
          </div>
        </div>
      </div>
    </div>
  )

  const renderContent = () => {
    switch (activeSection) {
      case 'general':
        return renderGeneralSettings()
      case 'notifications':
        return renderNotificationSettings()
      case 'security':
        return renderSecuritySettings()
      case 'display':
        return renderDisplaySettings()
      case 'system':
        return renderSystemSettings()
      default:
        return renderGeneralSettings()
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Settings</h1>
          <p className="text-gray-600">Configure your ICU management system</p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={exportSettings}
            className="flex items-center gap-2 px-4 py-2 text-sm text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50"
          >
            <Download className="w-4 h-4" />
            Export
          </button>
          <button
            onClick={resetToDefaults}
            className="flex items-center gap-2 px-4 py-2 text-sm text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50"
          >
            <RotateCcw className="w-4 h-4" />
            Reset
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Settings Navigation */}
        <div className="lg:col-span-1">
          <div className="bg-white rounded-lg border border-gray-200 p-4 space-y-2">
            {settingsSections.map((section) => {
              const Icon = section.icon
              return (
                <button
                  key={section.id}
                  onClick={() => setActiveSection(section.id)}
                  className={`w-full flex items-center gap-3 px-3 py-2 text-left rounded-lg transition-colors ${
                    activeSection === section.id
                      ? 'bg-blue-50 text-blue-700 border border-blue-200'
                      : 'text-gray-700 hover:bg-gray-50'
                  }`}
                >
                  <Icon className="w-5 h-5" />
                  <span className="font-medium">{section.name}</span>
                </button>
              )
            })}
          </div>
        </div>

        {/* Settings Content */}
        <div className="lg:col-span-3">
          <div className="bg-white rounded-lg border border-gray-200 p-6">
            {renderContent()}
            
            {/* Save/Cancel Actions */}
            {hasChanges && (
              <div className="flex items-center justify-end gap-3 pt-6 mt-6 border-t border-gray-200">
                <button
                  onClick={() => setHasChanges(false)}
                  className="px-4 py-2 text-sm text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  onClick={saveSettings}
                  className="flex items-center gap-2 px-4 py-2 text-sm text-white bg-blue-600 rounded-lg hover:bg-blue-700"
                >
                  <Save className="w-4 h-4" />
                  Save Changes
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
