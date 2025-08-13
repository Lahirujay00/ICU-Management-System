'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { 
  Search, 
  Plus, 
  Filter, 
  Eye, 
  Edit, 
  Calendar,
  Clock,
  Users,
  UserCheck,
  UserX,
  TrendingUp,
  MapPin
} from 'lucide-react'
import toast from 'react-hot-toast'

export default function StaffPage() {
  const [staff, setStaff] = useState([])
  const [filteredStaff, setFilteredStaff] = useState([])
  const [searchTerm, setSearchTerm] = useState('')
  const [roleFilter, setRoleFilter] = useState('all')
  const [statusFilter, setStatusFilter] = useState('all')
  const [loading, setLoading] = useState(true)
  const [selectedStaff, setSelectedStaff] = useState(null)
  const [showScheduleModal, setShowScheduleModal] = useState(false)

  useEffect(() => {
    // Simulate loading staff data
    setTimeout(() => {
      const mockStaff = [
        {
          id: 1,
          employeeId: 'S001',
          firstName: 'Dr. Emily',
          lastName: 'Chen',
          role: 'doctor',
          specialization: 'Critical Care Medicine',
          status: 'active',
          currentShift: 'morning',
          assignedPatients: 3,
          performanceRating: 5,
          department: 'ICU',
          hireDate: '2020-03-15',
          yearsOfService: 4
        },
        {
          id: 2,
          employeeId: 'S002',
          firstName: 'Nurse',
          lastName: 'Robert Wilson',
          role: 'nurse',
          specialization: 'ICU Nursing',
          status: 'active',
          currentShift: 'night',
          assignedPatients: 4,
          performanceRating: 4,
          department: 'ICU',
          hireDate: '2018-07-22',
          yearsOfService: 6
        },
        {
          id: 3,
          employeeId: 'S003',
          firstName: 'Dr. James',
          lastName: 'Martinez',
          role: 'doctor',
          specialization: 'Pulmonary Critical Care',
          status: 'active',
          currentShift: 'afternoon',
          assignedPatients: 2,
          performanceRating: 5,
          department: 'ICU',
          hireDate: '2019-11-08',
          yearsOfService: 5
        },
        {
          id: 4,
          employeeId: 'S004',
          firstName: 'Nurse',
          lastName: 'Lisa Thompson',
          role: 'nurse',
          specialization: 'Critical Care',
          status: 'on_leave',
          currentShift: 'off',
          assignedPatients: 0,
          performanceRating: 4,
          department: 'ICU',
          hireDate: '2017-05-12',
          yearsOfService: 7
        }
      ]
      
      setStaff(mockStaff)
      setFilteredStaff(mockStaff)
      setLoading(false)
    }, 1000)
  }, [])

  useEffect(() => {
    filterStaff()
  }, [searchTerm, roleFilter, statusFilter, staff])

  const filterStaff = () => {
    let filtered = staff

    if (searchTerm) {
      filtered = filtered.filter(member => 
        member.firstName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        member.lastName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        member.employeeId.toLowerCase().includes(searchTerm.toLowerCase()) ||
        member.specialization.toLowerCase().includes(searchTerm.toLowerCase())
      )
    }

    if (roleFilter !== 'all') {
      filtered = filtered.filter(member => member.role === roleFilter)
    }

    if (statusFilter !== 'all') {
      filtered = filtered.filter(member => member.status === statusFilter)
    }

    setFilteredStaff(filtered)
  }

  const getRoleColor = (role) => {
    switch (role) {
      case 'doctor': return 'bg-blue-100 text-blue-800'
      case 'nurse': return 'bg-green-100 text-green-800'
      case 'respiratory_therapist': return 'bg-purple-100 text-purple-800'
      case 'pharmacist': return 'bg-orange-100 text-orange-800'
      case 'technician': return 'bg-gray-100 text-gray-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const getStatusColor = (status) => {
    switch (status) {
      case 'active': return 'bg-success-100 text-success-800'
      case 'on_leave': return 'bg-warning-100 text-warning-800'
      case 'terminated': return 'bg-danger-100 text-danger-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const getShiftColor = (shift) => {
    switch (shift) {
      case 'morning': return 'bg-blue-100 text-blue-800'
      case 'afternoon': return 'bg-green-100 text-green-800'
      case 'night': return 'bg-purple-100 text-purple-800'
      case 'off': return 'bg-gray-100 text-gray-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const getRoleDisplayName = (role) => {
    switch (role) {
      case 'doctor': return 'Doctor'
      case 'nurse': return 'Nurse'
      case 'respiratory_therapist': return 'Respiratory Therapist'
      case 'pharmacist': return 'Pharmacist'
      case 'technician': return 'Technician'
      default: return role
    }
  }

  const StaffCard = ({ member }) => (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="card hover:shadow-md transition-shadow duration-200"
    >
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <div className="flex items-center space-x-3 mb-3">
            <h3 className="text-lg font-semibold text-gray-900">
              {member.firstName} {member.lastName}
            </h3>
            <span className="text-sm text-gray-500">#{member.employeeId}</span>
            <span className={`px-2 py-1 rounded-full text-xs font-medium ${getRoleColor(member.role)}`}>
              {getRoleDisplayName(member.role)}
            </span>
            <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(member.status)}`}>
              {member.status.replace('_', ' ').charAt(0).toUpperCase() + member.status.replace('_', ' ').slice(1)}
            </span>
          </div>
          
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
            <div className="text-center">
              <div className="text-lg font-semibold text-gray-900 mb-1">
                {member.assignedPatients}
              </div>
              <span className="text-xs text-gray-500">Patients</span>
            </div>
            
            <div className="text-center">
              <div className="text-lg font-semibold text-gray-900 mb-1">
                {member.performanceRating}/5
              </div>
              <span className="text-xs text-gray-500">Rating</span>
            </div>
            
            <div className="text-center">
              <div className="text-lg font-semibold text-gray-900 mb-1">
                {member.yearsOfService}
              </div>
              <span className="text-xs text-gray-500">Years</span>
            </div>
            
            <div className="text-center">
              <div className={`px-2 py-1 rounded-full text-xs font-medium ${getShiftColor(member.currentShift)}`}>
                {member.currentShift.charAt(0).toUpperCase() + member.currentShift.slice(1)}
              </div>
              <span className="text-xs text-gray-500 mt-1 block">Current Shift</span>
            </div>
          </div>
          
          <div className="flex items-center justify-between text-sm text-gray-600">
            <span>{member.specialization}</span>
            <span>{member.department}</span>
          </div>
        </div>
        
        <div className="ml-4 flex flex-col items-end space-y-2">
          <div className="flex space-x-2">
            <button
              onClick={() => {
                setSelectedStaff(member)
                setShowScheduleModal(true)
              }}
              className="p-2 bg-primary-50 hover:bg-primary-100 rounded-lg transition-colors duration-200"
              title="View Schedule"
            >
              <Calendar className="w-4 h-4 text-primary-600" />
            </button>
            <button className="p-2 bg-gray-50 hover:bg-gray-100 rounded-lg transition-colors duration-200">
              <Eye className="w-4 h-4 text-gray-600" />
            </button>
            <button className="p-2 bg-gray-50 hover:bg-gray-100 rounded-lg transition-colors duration-200">
              <Edit className="w-4 h-4 text-gray-600" />
            </button>
          </div>
        </div>
      </div>
    </motion.div>
  )

  const ScheduleModal = () => (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="bg-white rounded-xl p-6 max-w-4xl w-full mx-4 max-h-[90vh] overflow-y-auto"
      >
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold text-gray-900">Staff Schedule</h2>
          <button
            onClick={() => setShowScheduleModal(false)}
            className="text-gray-400 hover:text-gray-600"
          >
            ✕
          </button>
        </div>
        
        {selectedStaff && (
          <div className="mb-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              {selectedStaff.firstName} {selectedStaff.lastName} - {getRoleDisplayName(selectedStaff.role)}
            </h3>
            <p className="text-gray-600">{selectedStaff.specialization}</p>
          </div>
        )}
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Current Week Schedule */}
          <div className="card">
            <h4 className="font-semibold text-gray-900 mb-4">This Week</h4>
            <div className="space-y-3">
              {['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'].map((day, index) => (
                <div key={day} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <span className="font-medium text-gray-700">{day}</span>
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                    index < 5 ? 'bg-blue-100 text-blue-800' : 'bg-gray-100 text-gray-600'
                  }`}>
                    {index < 5 ? 'Morning' : 'Off'}
                  </span>
                </div>
              ))}
            </div>
          </div>
          
          {/* Shift Details */}
          <div className="card">
            <h4 className="font-semibold text-gray-900 mb-4">Shift Details</h4>
            <div className="space-y-4">
              <div className="p-3 bg-blue-50 rounded-lg">
                <div className="flex items-center space-x-2 mb-2">
                  <Clock className="w-4 h-4 text-blue-600" />
                  <span className="font-medium text-blue-800">Morning Shift</span>
                </div>
                <p className="text-sm text-blue-700">6:00 AM - 2:00 PM</p>
              </div>
              
              <div className="p-3 bg-green-50 rounded-lg">
                <div className="flex items-center space-x-2 mb-2">
                  <Clock className="w-4 h-4 text-green-600" />
                  <span className="font-medium text-green-800">Afternoon Shift</span>
                </div>
                <p className="text-sm text-green-700">2:00 PM - 10:00 PM</p>
              </div>
              
              <div className="p-3 bg-purple-50 rounded-lg">
                <div className="flex items-center space-x-2 mb-2">
                  <Clock className="w-4 h-4 text-purple-600" />
                  <span className="font-medium text-purple-800">Night Shift</span>
                </div>
                <p className="text-sm text-purple-700">10:00 PM - 6:00 AM</p>
              </div>
            </div>
          </div>
          
          {/* Quick Actions */}
          <div className="card">
            <h4 className="font-semibold text-gray-900 mb-4">Quick Actions</h4>
            <div className="space-y-3">
              <button className="w-full btn-primary text-sm">
                Request Shift Change
              </button>
              <button className="w-full btn-secondary text-sm">
                View Full Schedule
              </button>
              <button className="w-full btn-secondary text-sm">
                Request Time Off
              </button>
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  )

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading staff...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <h1 className="text-2xl font-bold text-gray-900">Staff Management</h1>
            <button className="btn-primary flex items-center space-x-2">
              <Plus className="w-4 h-4" />
              <span>Add Staff</span>
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Stats Overview */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="card text-center">
            <Users className="w-8 h-8 text-primary-600 mx-auto mb-2" />
            <div className="text-2xl font-bold text-gray-900">{staff.length}</div>
            <div className="text-sm text-gray-600">Total Staff</div>
          </div>
          
          <div className="card text-center">
            <UserCheck className="w-8 h-8 text-success-600 mx-auto mb-2" />
            <div className="text-2xl font-bold text-gray-900">
              {staff.filter(s => s.status === 'active').length}
            </div>
            <div className="text-sm text-gray-600">Active Staff</div>
          </div>
          
          <div className="card text-center">
            <Clock className="w-8 h-8 text-warning-600 mx-auto mb-2" />
            <div className="text-2xl font-bold text-gray-900">
              {staff.filter(s => s.currentShift !== 'off').length}
            </div>
            <div className="text-sm text-gray-600">On Duty</div>
          </div>
          
          <div className="card text-center">
            <TrendingUp className="w-8 h-8 text-blue-600 mx-auto mb-2" />
            <div className="text-2xl font-bold text-gray-900">
              {(staff.reduce((acc, s) => acc + s.performanceRating, 0) / staff.length).toFixed(1)}
            </div>
            <div className="text-sm text-gray-600">Avg Rating</div>
          </div>
        </div>

        {/* Search and Filters */}
        <div className="mb-8">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="text"
                placeholder="Search staff by name, ID, or specialization..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="input-field pl-10"
              />
            </div>
            
            <select
              value={roleFilter}
              onChange={(e) => setRoleFilter(e.target.value)}
              className="input-field md:w-40"
            >
              <option value="all">All Roles</option>
              <option value="doctor">Doctors</option>
              <option value="nurse">Nurses</option>
              <option value="respiratory_therapist">Respiratory Therapists</option>
              <option value="pharmacist">Pharmacists</option>
              <option value="technician">Technicians</option>
            </select>
            
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="input-field md:w-40"
            >
              <option value="all">All Statuses</option>
              <option value="active">Active</option>
              <option value="on_leave">On Leave</option>
              <option value="terminated">Terminated</option>
            </select>
            
            <button className="btn-secondary flex items-center space-x-2">
              <Filter className="w-4 h-4" />
              <span>More Filters</span>
            </button>
          </div>
        </div>

        {/* Staff Count */}
        <div className="mb-6">
          <p className="text-gray-600">
            Showing {filteredStaff.length} of {staff.length} staff members
          </p>
        </div>

        {/* Staff Grid */}
        <div className="space-y-6">
          {filteredStaff.map((member) => (
            <StaffCard key={member.id} member={member} />
          ))}
          
          {filteredStaff.length === 0 && (
            <div className="text-center py-12">
              <p className="text-gray-500">No staff members found matching your criteria.</p>
            </div>
          )}
        </div>
      </div>

      {showScheduleModal && <ScheduleModal />}
    </div>
  )
}

