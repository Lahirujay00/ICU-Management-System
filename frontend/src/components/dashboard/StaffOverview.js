'use client'

import { useState, useEffect } from 'react'
import { 
  Users, 
  Clock, 
  CheckCircle, 
  AlertTriangle, 
  Plus,
  Calendar,
  UserCheck
} from 'lucide-react'
import { apiClient } from '@/lib/api'

export default function StaffOverview({ detailed = false }) {
  const [staff, setStaff] = useState([])
  const [isLoading, setIsLoading] = useState(true)
  const [filterRole, setFilterRole] = useState('all')

  useEffect(() => {
    loadStaff()
  }, [])

  const loadStaff = async () => {
    try {
      // Try to load from API first, fallback to mock data
      const data = await apiClient.getStaff()
      setStaff(data)
    } catch (error) {
      console.log('Using mock data for development')
      // Use mock data for development
      const mockData = apiClient.getMockStaff()
      setStaff(mockData)
    } finally {
      setIsLoading(false)
    }
  }

  const filteredStaff = staff.filter(member => {
    if (filterRole === 'all') return true
    return member.role === filterRole
  })

  const onDutyStaff = staff.filter(member => member.isOnDuty)
  const offDutyStaff = staff.filter(member => !member.isOnDuty)
  const doctors = staff.filter(member => member.role === 'doctor')
  const nurses = staff.filter(member => member.role === 'nurse')

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Staff Overview</h2>
          <p className="text-gray-600">Monitor staff schedules and availability</p>
        </div>
        <button className="btn-primary flex items-center gap-2">
          <Plus className="w-4 h-4" />
          Add Staff Member
        </button>
      </div>

      {/* Status Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="card bg-gradient-to-r from-blue-50 to-blue-100 border-blue-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-blue-600">Total Staff</p>
              <p className="text-2xl font-bold text-blue-900">{staff.length}</p>
            </div>
            <Users className="w-8 h-8 text-blue-600" />
          </div>
        </div>

        <div className="card bg-gradient-to-r from-green-50 to-green-100 border-green-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-green-600">On Duty</p>
              <p className="text-2xl font-bold text-green-900">{onDutyStaff.length}</p>
            </div>
            <UserCheck className="w-8 h-8 text-green-600" />
          </div>
        </div>

        <div className="card bg-gradient-to-r from-purple-50 to-purple-100 border-purple-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-purple-600">Doctors</p>
              <p className="text-2xl font-bold text-purple-900">{doctors.length}</p>
            </div>
            <Users className="w-8 h-8 text-purple-600" />
          </div>
        </div>

        <div className="card bg-gradient-to-r from-orange-50 to-orange-100 border-orange-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-orange-600">Nurses</p>
              <p className="text-2xl font-bold text-orange-900">{nurses.length}</p>
            </div>
            <Users className="w-8 h-8 text-orange-600" />
          </div>
        </div>
      </div>

      {/* Filter Controls */}
      <div className="flex gap-2">
        <button
          onClick={() => setFilterRole('all')}
          className={`px-4 py-2 rounded-lg text-sm font-medium ${
            filterRole === 'all' 
              ? 'bg-blue-600 text-white' 
              : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
          }`}
        >
          All ({staff.length})
        </button>
        <button
          onClick={() => setFilterRole('doctor')}
          className={`px-4 py-2 rounded-lg text-sm font-medium ${
            filterRole === 'doctor' 
              ? 'bg-purple-600 text-white' 
              : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
          }`}
        >
          Doctors ({doctors.length})
        </button>
        <button
          onClick={() => setFilterRole('nurse')}
          className={`px-4 py-2 rounded-lg text-sm font-medium ${
            filterRole === 'nurse' 
              ? 'bg-orange-600 text-white' 
              : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
          }`}
        >
          Nurses ({nurses.length})
        </button>
        <button
          onClick={() => setFilterRole('admin')}
          className={`px-4 py-2 rounded-lg text-sm font-medium ${
            filterRole === 'admin' 
              ? 'bg-red-600 text-white' 
              : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
          }`}
        >
          Admin ({staff.filter(s => s.role === 'admin').length})
        </button>
      </div>

      {/* Staff Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
        {filteredStaff.map((member) => (
          <div key={member._id} className="card hover:shadow-lg transition-shadow duration-200">
            {/* Staff Header */}
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                  <Users className="w-6 h-6 text-blue-600" />
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900">{member.name}</h3>
                  <p className="text-sm text-gray-500 capitalize">{member.role}</p>
                </div>
              </div>
              <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                member.isOnDuty 
                  ? 'bg-green-100 text-green-800 border border-green-300' 
                  : 'bg-gray-100 text-gray-800 border border-gray-300'
              }`}>
                {member.isOnDuty ? 'On Duty' : 'Off Duty'}
              </span>
            </div>

            {/* Staff Details */}
            <div className="space-y-3 text-sm">
              <div className="flex items-center gap-2">
                <Clock className="w-4 h-4 text-gray-400" />
                <span className="text-gray-600">Department: {member.department}</span>
              </div>
              
              {member.shift && (
                <div className="flex items-center gap-2">
                  <Calendar className="w-4 h-4 text-gray-400" />
                  <span className="text-gray-600">Shift: {member.shift}</span>
                </div>
              )}

              {member.specialization && (
                <div className="flex items-center gap-2">
                  <CheckCircle className="w-4 h-4 text-gray-400" />
                  <span className="text-gray-600">Specialization: {member.specialization}</span>
                </div>
              )}
            </div>

            {/* Staff Actions */}
            <div className="mt-4 pt-4 border-t border-gray-200">
              <div className="flex gap-2">
                <button className="flex-1 px-3 py-2 text-xs bg-blue-100 text-blue-800 rounded hover:bg-blue-200">
                  View Schedule
                </button>
                <button className="flex-1 px-3 py-2 text-xs bg-green-100 text-green-800 rounded hover:bg-green-200">
                  Contact
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Quick Actions */}
      <div className="card bg-gray-50">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <button className="p-4 bg-white rounded-lg border border-gray-200 hover:border-blue-300 hover:shadow-md transition-all duration-200">
            <div className="text-center">
              <Calendar className="w-6 h-6 text-blue-600 mx-auto mb-2" />
              <span className="text-sm font-medium text-gray-700">Schedule Shift</span>
            </div>
          </button>
          
          <button className="p-4 bg-white rounded-lg border border-gray-200 hover:border-green-300 hover:shadow-md transition-all duration-200">
            <div className="text-center">
              <UserCheck className="w-6 h-6 text-green-600 mx-auto mb-2" />
              <span className="text-sm font-medium text-gray-700">Assign Patient</span>
            </div>
          </button>
          
          <button className="p-4 bg-white rounded-lg border border-gray-200 hover:border-purple-300 hover:shadow-md transition-all duration-200">
            <div className="text-center">
              <Clock className="w-6 h-6 text-purple-600 mx-auto mb-2" />
              <span className="text-sm font-medium text-gray-700">Time Off</span>
            </div>
          </button>
          
          <button className="p-4 bg-white rounded-lg border border-gray-200 hover:border-orange-300 hover:shadow-md transition-all duration-200">
            <div className="text-center">
              <AlertTriangle className="w-6 h-6 text-orange-600 mx-auto mb-2" />
              <span className="text-sm font-medium text-gray-700">Emergency Call</span>
            </div>
          </button>
        </div>
      </div>
    </div>
  )
} 