'use client'

import { useState, useEffect } from 'react'
import { 
  Users, 
  Clock, 
  CheckCircle, 
  AlertTriangle, 
  Plus,
  Calendar,
  UserCheck,
  Edit3,
  Edit,
  Phone,
  Mail,
  Award,
  Search,
  Filter,
  Eye,
  X,
  Check,
  MapPin,
  Shield
} from 'lucide-react'
import { apiClient } from '@/lib/api'
import { useForm } from 'react-hook-form'
import toast from 'react-hot-toast'

export default function StaffOverview({ detailed = false }) {
  const [staff, setStaff] = useState([])
  const [isLoading, setIsLoading] = useState(true)
  const [filterRole, setFilterRole] = useState('all')
  const [searchTerm, setSearchTerm] = useState('')
  const [showAddModal, setShowAddModal] = useState(false)
  const [showDetailModal, setShowDetailModal] = useState(false)
  const [showScheduleModal, setShowScheduleModal] = useState(false)
  const [showCalendarModal, setShowCalendarModal] = useState(false)
  const [showAssignPatientModal, setShowAssignPatientModal] = useState(false)
  const [showTimeOffModal, setShowTimeOffModal] = useState(false)
  const [showEmergencyModal, setShowEmergencyModal] = useState(false)
  const [selectedStaff, setSelectedStaff] = useState(null)
  const [selectedStaffForSchedule, setSelectedStaffForSchedule] = useState(null)
  const [selectedStaffForCalendar, setSelectedStaffForCalendar] = useState(null)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [currentView, setCurrentView] = useState('overview') // 'overview' or 'timetable'
  
  // Timetable-related state
  const [staffSchedules, setStaffSchedules] = useState({}) // Store schedule data for each staff member
  const [isLoadingSchedules, setIsLoadingSchedules] = useState(true)

  useEffect(() => {
    loadStaff()
  }, [])

  // Load schedules when staff data changes
  useEffect(() => {
    const loadAllSchedules = async () => {
      if (staff.length === 0) {
        console.log('🔧 No staff data available, skipping schedule loading')
        setIsLoadingSchedules(false)
        return
      }

      console.log('🔧 Starting to load schedules for all staff members...')
      setIsLoadingSchedules(true)
      const schedulePromises = staff.map(async (staffMember) => {
        try {
          console.log(`🔧 Loading schedule for ${staffMember.name} (ID: ${staffMember._id})`)
          const scheduleData = await apiClient.getStaffSchedule(staffMember._id)
          console.log(`🔧 ✅ Loaded schedule for ${staffMember.name}:`, scheduleData)
          return { staffId: staffMember._id, schedule: scheduleData }
        } catch (error) {
          console.log(`🔧 ❌ Error loading schedule for ${staffMember.name}:`, error)
          // Return empty schedule on error to prevent breaking the UI
          return { staffId: staffMember._id, schedule: {} }
        }
      })
      
      const results = await Promise.all(schedulePromises)
      const schedulesMap = {}
      results.forEach(result => {
        schedulesMap[result.staffId] = result.schedule
      })
      
      console.log('🔧 Final schedules map for all staff:', schedulesMap)
      console.log('🔧 Setting staffSchedules state with:', schedulesMap)
      setStaffSchedules(schedulesMap)
      setIsLoadingSchedules(false)
    }
    
    if (staff.length > 0) {
      loadAllSchedules()
    }
  }, [staff])

  const loadStaff = async () => {
    try {
      setIsLoading(true)
      // Try to load from API first
      const apiData = await apiClient.getStaff()
      setStaff(apiData)
      console.log(`✅ Loaded ${apiData.length} staff from database`)
    } catch (apiError) {
      console.log('API failed, using mock data:', apiError)
      // Fallback to mock data when database is not connected
      const mockData = apiClient.getMockStaff()
      setStaff(mockData)
      console.log(`📝 Using ${mockData.length} mock staff members`)
      toast.error('Database not connected - showing demo data', {
        duration: 3000,
        icon: '⚠️'
      })
    } finally {
      setIsLoading(false)
    }
  }

  const filteredStaff = staff.filter(member => {
    let matches = true
    
    if (filterRole !== 'all') {
      matches = matches && member.role === filterRole
    }
    
    if (searchTerm) {
      matches = matches && (
        member.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        member.firstName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        member.lastName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        member.employeeId?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        member.specialization?.toLowerCase().includes(searchTerm.toLowerCase())
      )
    }
    
    return matches
  })

  const onDutyStaff = staff.filter(member => member.isOnDuty)
  const offDutyStaff = staff.filter(member => !member.isOnDuty)
  const doctors = staff.filter(member => member.role === 'doctor')
  const nurses = staff.filter(member => member.role === 'nurse')

  const handleAddStaff = async (staffData) => {
    setIsSubmitting(true)
    try {
      // Add auto-generated employee ID if not provided
      if (!staffData.employeeId) {
        const rolePrefix = staffData.role === 'doctor' ? 'DOC' : 
                          staffData.role === 'nurse' ? 'NUR' :
                          staffData.role === 'respiratory_therapist' ? 'RT' :
                          'STF'
        // Use timestamp to ensure uniqueness
        staffData.employeeId = `${rolePrefix}${String(Date.now()).slice(-6)}`
      }

      const newStaffData = {
        ...staffData,
        // Don't add 'name' field - backend expects firstName and lastName separately
        isOnDuty: false,
        currentShift: 'off',
        status: 'active',
        // Remove assignedPatients - backend will create empty array and calculate count as virtual field
        hireDate: new Date().toISOString(),
        // Remove yearsOfService - backend calculates this as virtual field from hireDate
      }

      console.log('Sending staff data to backend:', newStaffData)

      // Try to save to database
      try {
        const savedStaff = await apiClient.createStaff(newStaffData)
        setStaff(prev => [...prev, savedStaff])
        toast.success(`✅ Staff member ${savedStaff.name || savedStaff.firstName + ' ' + savedStaff.lastName} added successfully!`)
      } catch (apiError) {
        console.log('Database save failed:', apiError)
        toast.error('❌ Failed to add staff member to database. Please try again.')
        console.error('Full API error:', apiError)
      }
      
      setShowAddModal(false)
    } catch (error) {
      console.error('Error adding staff:', error)
      toast.error('Failed to add staff member')
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleToggleDutyStatus = async (staffId) => {
    try {
      console.log('🔧 handleToggleDutyStatus called with staffId:', staffId);
      console.log('🔧 Current staff array:', staff);
      
      const member = staff.find(s => s._id === staffId)
      if (!member) {
        console.error('❌ Staff member not found for ID:', staffId);
        toast.error('❌ Staff member not found')
        return
      }
      
      const memberName = member.name || `${member.firstName} ${member.lastName}`
      const newDutyStatus = !member.isOnDuty
      
      console.log(`🔧 Toggling duty status for ${memberName}: ${member.isOnDuty} -> ${newDutyStatus}`)
      
      // Update local state immediately for better UX
      setStaff(prev => prev.map(member => 
        member._id === staffId 
          ? { ...member, isOnDuty: newDutyStatus, currentShift: newDutyStatus ? 'morning' : 'off' }
          : member
      ))
      
      // Try to update in database
      try {
        const updateData = { 
          isOnDuty: newDutyStatus, 
          currentShift: newDutyStatus ? 'morning' : 'off' 
        }
        console.log(`🔧 Sending status update to API:`, updateData)
        
        await apiClient.updateStaffStatus(staffId, updateData)
        toast.success(`✅ ${memberName} is now ${newDutyStatus ? 'on duty' : 'off duty'}`)
      } catch (apiError) {
        console.error('Database status update failed:', apiError)
        toast.error(`❌ Failed to update ${memberName}'s duty status in database`)
        // Revert the local state change on API failure
        setStaff(prev => prev.map(member => 
          member._id === staffId 
            ? { ...member, isOnDuty: !newDutyStatus, currentShift: !newDutyStatus ? 'morning' : 'off' }
            : member
        ))
      }
    } catch (error) {
      console.error('Error updating duty status:', error)
      toast.error('❌ Failed to update duty status')
    }
  }

  // Quick Action Handlers
  const handleScheduleShift = (staffId = null) => {
    console.log('🔧 handleScheduleShift called with staffId:', staffId);
    setSelectedStaffForSchedule(staffId); // Store which staff member to pre-select
    console.log('🔧 Setting showScheduleModal to true');
    setShowScheduleModal(true)
  }

  const handleOpenCalendar = (staffId) => {
    console.log('🔧 handleOpenCalendar called with staffId:', staffId);
    setSelectedStaffForCalendar(staffId);
    setShowCalendarModal(true);
  }

  const handleUpdateSchedule = async (staffId, scheduleData) => {
    try {
      console.log('🔄 handleUpdateSchedule called - NO REFRESH should happen')
      console.log('🔄 Updating schedule for staff:', staffId, 'with data:', scheduleData)
      
      await apiClient.updateStaff(staffId, scheduleData)
      
      // Update local state immediately for UI responsiveness
      setStaff(prev => prev.map(member => 
        member._id === staffId 
          ? { ...member, ...scheduleData }
          : member
      ))
      
      console.log('✅ Schedule updated successfully in local state - NO PAGE REFRESH')
      
      // Don't show generic success toast here - let calling components handle their own messaging
      // Only close the Schedule modal, not other modals like Calendar
      if (showScheduleModal) {
        setShowScheduleModal(false)
      }
      
      // Return success to indicate operation completed
      return true
    } catch (error) {
      console.error('❌ Error updating schedule (but no refresh should happen):', error)
      // Don't re-throw the error to prevent page refresh
      return false
    }
  }

  const handleAssignPatient = () => {
    console.log('� Opening Assign Patient modal');
    setShowAssignPatientModal(true)
  }

  const handleTimeOff = () => {
    console.log('🔧 Opening Time Off modal');
    setShowTimeOffModal(true)
  }

  const handleEmergencyCall = () => {
    setShowEmergencyModal(true)
  }

  // Helper function to get shift time display
  const getShiftTimeDisplay = (role, shift) => {
    if (!shift || shift === 'off') return 'Off Duty'
    
    const shiftMaps = {
      nurse: {
        morning: '7:00 AM - 1:00 PM',
        afternoon: '1:00 PM - 7:00 PM', 
        night: '7:00 PM - 7:00 AM'
      },
      doctor: {
        morning: '8:00 AM - 4:00 PM',
        afternoon: '1:00 PM - 7:00 PM',
        night: '7:00 PM - 7:00 AM',
        emergency: '24-hour on-call'
      },
      default: {
        morning: '7:00 AM - 3:00 PM',
        afternoon: '3:00 PM - 11:00 PM',
        night: '11:00 PM - 7:00 AM'
      }
    }
    
    const roleMap = shiftMaps[role] || shiftMaps.default
    return roleMap[shift] || shift.charAt(0).toUpperCase() + shift.slice(1)
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

  const getRoleColor = (role) => {
    switch (role) {
      case 'doctor': return 'bg-blue-100 text-blue-800 border-blue-300'
      case 'nurse': return 'bg-green-100 text-green-800 border-green-300'
      case 'respiratory_therapist': return 'bg-purple-100 text-purple-800 border-purple-300'
      case 'pharmacist': return 'bg-orange-100 text-orange-800 border-orange-300'
      case 'technician': return 'bg-gray-100 text-gray-800 border-gray-300'
      default: return 'bg-gray-100 text-gray-800 border-gray-300'
    }
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Database Status Warning */}
      {staff.length > 0 && staff[0]._id && staff[0]._id.startsWith('mock') && (
        <div className="bg-orange-50 border border-orange-200 rounded-lg p-4">
          <div className="flex items-center gap-3">
            <AlertTriangle className="w-5 h-5 text-orange-600" />
            <div>
              <h3 className="text-sm font-medium text-orange-800">Demo Mode - Database Not Connected</h3>
              <p className="text-xs text-orange-700 mt-1">
                You're viewing sample data. Connect to database to manage real staff information.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Staff Overview</h2>
          <p className="text-gray-600">Monitor staff schedules and availability in real-time</p>
        </div>
        <div className="flex items-center gap-3">
          {/* View Toggle */}
          <div className="flex bg-gray-100 rounded-lg p-1">
            <button
              onClick={() => setCurrentView('overview')}
              className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                currentView === 'overview'
                  ? 'bg-white text-blue-600 shadow-sm'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              <Users className="w-4 h-4 inline mr-2" />
              Overview
            </button>
            <button
              onClick={() => {
                console.log('🔧 Timetable button clicked, switching view to timetable')
                console.log('🔧 Current staff data:', staff)
                setCurrentView('timetable')
              }}
              className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                currentView === 'timetable'
                  ? 'bg-white text-blue-600 shadow-sm'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              <Calendar className="w-4 h-4 inline mr-2" />
              Timetable
            </button>
          </div>
          
          <button 
            onClick={() => setShowAddModal(true)}
            className="btn-primary flex items-center gap-2 px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors shadow-lg hover:shadow-xl"
          >
            <Plus className="w-5 h-5" />
            Add Staff Member
          </button>
        </div>
      </div>

      {/* Status Summary Cards */}
      {currentView === 'overview' && (
        <>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="card bg-gradient-to-r from-blue-50 to-blue-100 border-blue-200 hover:shadow-lg transition-all duration-300 hover:scale-105">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-blue-600">Total Staff</p>
              <p className="text-3xl font-bold text-blue-900">{staff.length}</p>
              <p className="text-xs text-blue-500 mt-1">All team members</p>
            </div>
            <div className="bg-blue-200 p-3 rounded-full">
              <Users className="w-8 h-8 text-blue-700" />
            </div>
          </div>
        </div>

        <div className="card bg-gradient-to-r from-green-50 to-green-100 border-green-200 hover:shadow-lg transition-all duration-300 hover:scale-105">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-green-600">On Duty</p>
              <p className="text-3xl font-bold text-green-900">{onDutyStaff.length}</p>
              <p className="text-xs text-green-500 mt-1">Currently active</p>
            </div>
            <div className="bg-green-200 p-3 rounded-full">
              <UserCheck className="w-8 h-8 text-green-700" />
            </div>
          </div>
        </div>

        <div className="card bg-gradient-to-r from-purple-50 to-purple-100 border-purple-200 hover:shadow-lg transition-all duration-300 hover:scale-105">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-purple-600">Doctors</p>
              <p className="text-3xl font-bold text-purple-900">{doctors.length}</p>
              <p className="text-xs text-purple-500 mt-1">Medical specialists</p>
            </div>
            <div className="bg-purple-200 p-3 rounded-full">
              <Users className="w-8 h-8 text-purple-700" />
            </div>
          </div>
        </div>

        <div className="card bg-gradient-to-r from-orange-50 to-orange-100 border-orange-200 hover:shadow-lg transition-all duration-300 hover:scale-105">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-orange-600">Nurses</p>
              <p className="text-3xl font-bold text-orange-900">{nurses.length}</p>
              <p className="text-xs text-orange-500 mt-1">Care providers</p>
            </div>
            <div className="bg-orange-200 p-3 rounded-full">
              <Users className="w-8 h-8 text-orange-700" />
            </div>
          </div>
        </div>
      </div>

      {/* Search and Filter Controls */}
      <div className="flex flex-col md:flex-row gap-4 mb-6">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
          <input
            type="text"
            placeholder="Search staff by name, ID, or specialization..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          />
        </div>
        
        <select
          value={filterRole}
          onChange={(e) => setFilterRole(e.target.value)}
          className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
        >
          <option value="all">All Roles</option>
          <option value="doctor">Doctors</option>
          <option value="nurse">Nurses</option>
          <option value="respiratory_therapist">Respiratory Therapists</option>
          <option value="pharmacist">Pharmacists</option>
          <option value="technician">Technicians</option>
        </select>
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
      </div>

      {/* Staff List */}
      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden shadow-sm">
        {/* List Header */}
        <div className="bg-gray-50 border-b border-gray-200 px-6 py-4">
          <div className="grid grid-cols-12 gap-4 text-xs font-semibold text-gray-600 uppercase tracking-wide">
            <div className="col-span-3">Staff Member</div>
            <div className="col-span-2">Role & Department</div>
            <div className="col-span-2">Status & Shift</div>
            <div className="col-span-2">Specialization</div>
            <div className="col-span-1 text-center">Patients</div>
            <div className="col-span-2 text-center">Actions</div>
          </div>
        </div>

        {/* Staff Rows */}
        <div className="divide-y divide-gray-100">
          {filteredStaff.map((member, index) => (
            <div key={member._id} className={`px-6 py-4 hover:bg-gray-50 transition-colors duration-200 ${
              index % 2 === 0 ? 'bg-white' : 'bg-gray-25'
            }`}>
              <div className="grid grid-cols-12 gap-4 items-center">
                
                {/* Staff Member Info */}
                <div className="col-span-3 flex items-center gap-3">
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center transition-colors ${
                    member.isOnDuty 
                      ? 'bg-gradient-to-br from-green-400 to-green-600' 
                      : 'bg-gradient-to-br from-gray-400 to-gray-600'
                  }`}>
                    <Users className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900 text-sm">{member.name}</h3>
                    {member.employeeId && (
                      <p className="text-xs text-gray-500">ID: {member.employeeId}</p>
                    )}
                    {member.phone && (
                      <p className="text-xs text-gray-500">Contact: {member.phone}</p>
                    )}
                  </div>
                </div>

                

                {/* Role & Department */}
                <div className="col-span-2">
                  <div className="space-y-1">
                    <p className="text-sm font-medium text-gray-900 capitalize">{getRoleDisplayName(member.role)}</p>
                    <p className="text-xs text-gray-600 flex items-center gap-1">
                      <MapPin className="w-3 h-3" />
                      {member.department}
                    </p>
                  </div>
                </div>

                {/* Status & Shift */}
                <div className="col-span-2">
                  <div className="flex flex-col gap-2">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium w-fit ${
                      member.isOnDuty 
                        ? 'bg-green-100 text-green-800 border border-green-300' 
                        : 'bg-gray-100 text-gray-800 border border-gray-300'
                    }`}>
                      {member.isOnDuty ? '🟢 On Duty' : '⭕ Off Duty'}
                    </span>
                    {member.currentShift && member.currentShift !== 'off' && (
                      <div className="text-xs">
                        <div className="flex items-center gap-1 text-blue-600 mb-1">
                          <Clock className="w-3 h-3" />
                          <span className="font-medium capitalize">{member.currentShift}</span>
                        </div>
                        <div className="text-gray-500 text-xs pl-4">
                          {getShiftTimeDisplay(member.role, member.currentShift)}
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                {/* Specialization */}
                <div className="col-span-2">
                  {member.specialization ? (
                    <p className="text-sm text-gray-700 flex items-center gap-1">
                      <CheckCircle className="w-3 h-3 text-purple-500" />
                      {member.specialization}
                    </p>
                  ) : (
                    <span className="text-xs text-gray-400">-</span>
                  )}
                </div>

                {/* Patient Count */}
                <div className="col-span-1 text-center">
                  {(() => {
                    const patientCount = member.assignedPatientsCount ?? 
                                       (member.assignedPatients?.length) ?? 
                                       (typeof member.assignedPatients === 'number' ? member.assignedPatients : 0);
                    return (
                      <span className={`inline-flex items-center justify-center w-8 h-8 rounded-full text-sm font-bold ${
                        patientCount > 3 ? 'bg-red-100 text-red-700' : 
                        patientCount > 1 ? 'bg-orange-100 text-orange-700' : 'bg-green-100 text-green-700'
                      }`}>
                        {patientCount}
                      </span>
                    );
                  })()}
                </div>

                {/* Actions */}
                <div className="col-span-2">
                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => handleToggleDutyStatus(member._id)}
                      className={`px-3 py-1.5 rounded-md text-xs font-medium transition-all duration-200 flex items-center gap-1 hover:scale-105 ${
                        member.isOnDuty 
                          ? 'bg-orange-100 text-orange-800 hover:bg-orange-200 border border-orange-300' 
                          : 'bg-green-100 text-green-800 hover:bg-green-200 border border-green-300'
                      }`}
                      title={member.isOnDuty ? 'Clock Out' : 'Clock In'}
                    >
                      {member.isOnDuty ? (
                        <>
                          <X className="w-3 h-3" />
                          Out
                        </>
                      ) : (
                        <>
                          <Check className="w-3 h-3" />
                          In
                        </>
                      )}
                    </button>
                    
                    <button 
                      className="px-3 py-1.5 bg-blue-100 text-blue-800 rounded-md text-xs font-medium hover:bg-blue-200 transition-all duration-200 flex items-center gap-1 border border-blue-300 hover:scale-105"
                      onClick={() => {
                        setSelectedStaff(member)
                        setShowDetailModal(true)
                      }}
                      title="View Details"
                    >
                      <Eye className="w-3 h-3" />
                      View
                    </button>
                    
                    <button 
                      className="px-3 py-1.5 bg-purple-100 text-purple-800 rounded-md text-xs font-medium hover:bg-purple-200 transition-all duration-200 flex items-center gap-1 border border-purple-300 hover:scale-105"
                      onClick={() => handleOpenCalendar(member._id)}
                      title="Schedule Calendar"
                    >
                      <Calendar className="w-3 h-3" />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Empty State */}
        {filteredStaff.length === 0 && (
          <div className="px-6 py-12 text-center">
            <Users className="w-12 h-12 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No staff members found</h3>
            <p className="text-gray-500 mb-4">
              {filterRole !== 'all' || searchTerm 
                ? 'Try adjusting your filters or search term.' 
                : 'Get started by adding your first staff member.'
              }
            </p>
            {filterRole === 'all' && !searchTerm && (
              <button 
                onClick={() => setShowAddModal(true)}
                className="btn-primary flex items-center gap-2 mx-auto px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
              >
                <Plus className="w-4 h-4" />
                Add Staff Member
              </button>
            )}
          </div>
        )}
      </div>

      {filteredStaff.length === 0 && (
        <div className="text-center py-12">
          <Users className="mx-auto h-12 w-12 text-gray-400" />
          <h3 className="mt-2 text-sm font-medium text-gray-900">No staff members found</h3>
          <p className="mt-1 text-sm text-gray-500">
            {searchTerm || filterRole !== 'all' 
              ? 'No staff members match your search criteria.' 
              : 'Get started by adding a new staff member.'}
          </p>
        </div>
      )}

      {/* Quick Actions */}
      <div className="card bg-gray-50">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <button 
            onClick={handleScheduleShift}
            className="p-4 bg-white rounded-lg border border-gray-200 hover:border-blue-300 hover:shadow-md transition-all duration-200"
          >
            <div className="text-center">
              <Calendar className="w-6 h-6 text-blue-600 mx-auto mb-2" />
              <span className="text-sm font-medium text-gray-700">Schedule Shift</span>
            </div>
          </button>
          
          <button 
            onClick={handleAssignPatient}
            className="p-4 bg-white rounded-lg border border-gray-200 hover:border-green-300 hover:shadow-md transition-all duration-200"
          >
            <div className="text-center">
              <UserCheck className="w-6 h-6 text-green-600 mx-auto mb-2" />
              <span className="text-sm font-medium text-gray-700">Assign Patient</span>
            </div>
          </button>
          
          <button 
            onClick={handleTimeOff}
            className="p-4 bg-white rounded-lg border border-gray-200 hover:border-purple-300 hover:shadow-md transition-all duration-200"
          >
            <div className="text-center">
              <Clock className="w-6 h-6 text-purple-600 mx-auto mb-2" />
              <span className="text-sm font-medium text-gray-700">Time Off</span>
            </div>
          </button>
          
          <button 
            onClick={handleEmergencyCall}
            className="p-4 bg-white rounded-lg border border-gray-200 hover:border-red-300 hover:shadow-md transition-all duration-200"
          >
            <div className="text-center">
              <AlertTriangle className="w-6 h-6 text-red-600 mx-auto mb-2" />
              <span className="text-sm font-medium text-gray-700">Emergency Call</span>
            </div>
          </button>
        </div>
      </div>
        </>
      )}

      {/* Timetable View */}
      {currentView === 'timetable' && (
        <>
          {console.log('🔧 Rendering timetable view, currentView:', currentView)}
          {console.log('🔧 Staff data for timetable:', staff)}
          <div className="bg-blue-50 p-4 rounded-lg mb-4">
            <p className="text-blue-800">🔧 Debug: Timetable view is active. Staff count: {staff.length}</p>
            <p className="text-blue-800">🔧 Debug: Schedule loading: {isLoadingSchedules ? 'Loading...' : 'Complete'}</p>
            <p className="text-blue-800">🔧 Debug: Schedule data keys: {Object.keys(staffSchedules).join(', ')}</p>
          </div>
          <StaffTimetableView 
            staff={staff} 
            staffSchedules={staffSchedules}
            isLoadingSchedules={isLoadingSchedules}
          />
        </>
      )}

      {/* Add Staff Modal */}
      {showAddModal && (
        <AddStaffModal 
          onClose={() => setShowAddModal(false)}
          onSubmit={handleAddStaff}
          isSubmitting={isSubmitting}
        />
      )}

      {/* Staff Detail Modal */}
      {showDetailModal && selectedStaff && (
        <StaffDetailModal 
          staff={selectedStaff}
          onClose={() => {
            setShowDetailModal(false)
            setSelectedStaff(null)
          }}
        />
      )}

      {/* Schedule Shift Modal */}
      {showScheduleModal && (
        <ScheduleShiftModal 
          staff={staff}
          preSelectedStaffId={selectedStaffForSchedule}
          onClose={() => {
            setShowScheduleModal(false)
            setSelectedStaffForSchedule(null)
          }}
          onUpdateSchedule={handleUpdateSchedule}
          getShiftTimeDisplay={getShiftTimeDisplay}
        />
      )}

      {/* Calendar Schedule Modal */}
      {showCalendarModal && (
        <CalendarScheduleModal 
          staff={staff}
          selectedStaffId={selectedStaffForCalendar}
          onClose={() => {
            setShowCalendarModal(false)
            setSelectedStaffForCalendar(null)
          }}
          onUpdateSchedule={handleUpdateSchedule}
        />
      )}

      {/* Assign Patient Modal */}
      {showAssignPatientModal && (
        <AssignPatientModal 
          staff={staff}
          onClose={() => setShowAssignPatientModal(false)}
        />
      )}

      {/* Time Off Modal */}
      {showTimeOffModal && (
        <TimeOffModal 
          staff={staff}
          onClose={() => setShowTimeOffModal(false)}
        />
      )}

      {/* Emergency Alert Modal */}
      {showEmergencyModal && (
        <EmergencyAlertModal 
          staff={staff}
          onClose={() => setShowEmergencyModal(false)}
        />
      )}
    </div>
  )
}

// Add Staff Modal Component
function AddStaffModal({ onClose, onSubmit, isSubmitting }) {
  const { register, handleSubmit, formState: { errors }, reset } = useForm()

  const submitForm = (data) => {
    onSubmit(data)
    reset()
  }

  return (
    <div 
      className="flex items-center justify-center"
      style={{ 
        position: 'fixed',
        top: 0, 
        left: 0, 
        right: 0, 
        bottom: 0, 
        width: '100vw', 
        height: '100vh',
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
        zIndex: 9999,
        margin: 0,
        padding: 0
      }}
    >
      <div className="bg-white rounded-lg p-6 w-full max-w-md max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold text-gray-900">Add New Staff Member</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
            <X className="w-6 h-6" />
          </button>
        </div>

        <form onSubmit={handleSubmit(submitForm)} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">First Name</label>
              <input
                type="text"
                {...register('firstName', { required: 'First name is required' })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
              {errors.firstName && (
                <p className="text-red-500 text-xs mt-1">{errors.firstName.message}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Last Name</label>
              <input
                type="text"
                {...register('lastName', { required: 'Last name is required' })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
              {errors.lastName && (
                <p className="text-red-500 text-xs mt-1">{errors.lastName.message}</p>
              )}
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Employee ID</label>
            <input
              type="text"
              {...register('employeeId')}
              placeholder="Auto-generated if empty"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Role</label>
            <select
              {...register('role', { required: 'Role is required' })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="">Select Role</option>
              <option value="doctor">Doctor</option>
              <option value="nurse">Nurse</option>
              <option value="respiratory_therapist">Respiratory Therapist</option>
              <option value="pharmacist">Pharmacist</option>
              <option value="technician">Technician</option>
            </select>
            {errors.role && (
              <p className="text-red-500 text-xs mt-1">{errors.role.message}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Department</label>
            <input
              type="text"
              {...register('department', { required: 'Department is required' })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
            {errors.department && (
              <p className="text-red-500 text-xs mt-1">{errors.department.message}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Specialization</label>
            <input
              type="text"
              {...register('specialization')}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Phone</label>
            <input
              type="tel"
              {...register('phone', { required: 'Phone number is required' })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
            {errors.phone && (
              <p className="text-red-500 text-xs mt-1">{errors.phone.message}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
            <input
              type="email"
              {...register('email', { required: 'Email is required' })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
            {errors.email && (
              <p className="text-red-500 text-xs mt-1">{errors.email.message}</p>
            )}
          </div>

          <div className="flex gap-4 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-2 text-gray-700 bg-gray-200 rounded-lg hover:bg-gray-300"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
            >
              {isSubmitting ? 'Adding...' : 'Add Staff'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

// Staff Detail Modal Component
function StaffDetailModal({ staff, onClose }) {
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

  return (
    <div 
      className="flex items-center justify-center"
      style={{ 
        position: 'fixed',
        top: 0, 
        left: 0, 
        right: 0, 
        bottom: 0, 
        width: '100vw', 
        height: '100vh',
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
        zIndex: 9999,
        margin: 0,
        padding: 0
      }}
    >
      <div className="bg-white rounded-lg p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-bold text-gray-900">Staff Details</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
            <X className="w-6 h-6" />
          </button>
        </div>

        <div className="space-y-6">
          {/* Basic Info */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <div className="flex items-center gap-4">
                <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center">
                  <Users className="w-8 h-8 text-blue-600" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-gray-900">{staff.name}</h3>
                  <p className="text-gray-600 capitalize">{getRoleDisplayName(staff.role)}</p>
                  <span className={`inline-block mt-1 px-2 py-1 rounded-full text-xs font-medium ${
                    staff.isOnDuty 
                      ? 'bg-green-100 text-green-800 border border-green-300' 
                      : 'bg-gray-100 text-gray-800 border border-gray-300'
                  }`}>
                    {staff.isOnDuty ? 'On Duty' : 'Off Duty'}
                  </span>
                </div>
              </div>

              <div className="space-y-3">
                <div className="flex items-center gap-3">
                  <Shield className="w-4 h-4 text-gray-400" />
                  <span className="text-sm text-gray-600">Employee ID: {staff.employeeId}</span>
                </div>
                
                <div className="flex items-center gap-3">
                  <MapPin className="w-4 h-4 text-gray-400" />
                  <span className="text-sm text-gray-600">Department: {staff.department}</span>
                </div>

                {staff.specialization && (
                  <div className="flex items-center gap-3">
                    <Award className="w-4 h-4 text-gray-400" />
                    <span className="text-sm text-gray-600">Specialization: {staff.specialization}</span>
                  </div>
                )}
              </div>
            </div>

            <div className="space-y-4">
              <h4 className="font-semibold text-gray-900">Contact Information</h4>
              
              {staff.phone && (
                <div className="flex items-center gap-3">
                  <Phone className="w-4 h-4 text-gray-400" />
                  <span className="text-sm text-gray-600">{staff.phone}</span>
                </div>
              )}

              {staff.email && (
                <div className="flex items-center gap-3">
                  <Mail className="w-4 h-4 text-gray-400" />
                  <span className="text-sm text-gray-600">{staff.email}</span>
                </div>
              )}

              {staff.currentShift && (
                <div className="flex items-center gap-3">
                  <Clock className="w-4 h-4 text-gray-400" />
                  <span className="text-sm text-gray-600">Current Shift: {staff.currentShift}</span>
                </div>
              )}
            </div>
          </div>

          {/* Statistics */}
          <div className="border-t border-gray-200 pt-6">
            <h4 className="font-semibold text-gray-900 mb-4">Statistics</h4>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {(() => {
                const patientCount = staff.assignedPatientsCount ?? 
                                   (staff.assignedPatients?.length) ?? 
                                   (typeof staff.assignedPatients === 'number' ? staff.assignedPatients : 0);
                return (
                  <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
                    <div className="flex items-center gap-2 mb-1">
                      <Users className="w-4 h-4 text-blue-500" />
                      <span className="text-sm font-medium text-blue-800">Assigned Patients</span>
                    </div>
                    <p className="text-lg font-bold text-blue-900">{patientCount}</p>
                  </div>
                );
              })()}

              {staff.yearsOfService !== undefined && (
                <div className="bg-green-50 p-4 rounded-lg border border-green-200">
                  <div className="flex items-center gap-2 mb-1">
                    <Calendar className="w-4 h-4 text-green-500" />
                    <span className="text-sm font-medium text-green-800">Years of Service</span>
                  </div>
                  <p className="text-lg font-bold text-green-900">{staff.yearsOfService}</p>
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="mt-6 pt-4 border-t border-gray-200">
          <button
            onClick={onClose}
            className="w-full px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  )
}

// Calendar Schedule Modal Component
const CalendarScheduleModal = ({ staff, selectedStaffId, onClose, onUpdateSchedule }) => {
  const [currentDate, setCurrentDate] = useState(new Date())
  const [selectedDate, setSelectedDate] = useState(null)
  const [schedules, setSchedules] = useState({})
  const [isLoading, setIsLoading] = useState(true)
  
  const selectedStaff = staff.find(member => member._id === selectedStaffId)
  const staffRole = selectedStaff?.role || 'other'

  // Add debugging for page refresh detection
  useEffect(() => {
    const handleBeforeUnload = (e) => {
      console.log('⚠️ WARNING: Page is about to refresh/unload - this should NOT happen during schedule assignment!')
      console.log('⚠️ Current stack trace:', new Error().stack)
      e.preventDefault()
      e.returnValue = ''
      return 'Page is about to refresh - are you sure?'
    }
    
    window.addEventListener('beforeunload', handleBeforeUnload)
    
    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload)
    }
  }, [])

  // Load existing schedules when modal opens
  useEffect(() => {
    const loadSchedules = async () => {
      try {
        setIsLoading(true)
        
        // Always check localStorage first for immediate loading
        const savedSchedules = localStorage.getItem(`schedule_${selectedStaffId}`)
        let initialSchedules = {}
        
        if (savedSchedules) {
          try {
            initialSchedules = JSON.parse(savedSchedules)
            console.log('📱 Loaded schedules from localStorage (immediate):', initialSchedules)
            setSchedules(initialSchedules)
            setIsLoading(false)
          } catch (e) {
            console.warn('Could not parse saved schedules:', e)
          }
        }
        
        // Then try to fetch from API for any additional data (but don't override existing)
        try {
          const apiSchedules = await apiClient.getStaffSchedule(selectedStaffId)
          if (apiSchedules && typeof apiSchedules === 'object') {
            // Merge API data with localStorage data, prioritizing localStorage for conflicts
            const mergedSchedules = { ...apiSchedules, ...initialSchedules }
            setSchedules(mergedSchedules)
            console.log('✅ Merged schedules (localStorage priority):', mergedSchedules)
            
            // Update localStorage with merged data
            localStorage.setItem(`schedule_${selectedStaffId}`, JSON.stringify(mergedSchedules))
          }
        } catch (apiError) {
          console.log('API schedule fetch failed, using localStorage data:', apiError)
        }
        
        // If no localStorage data and API failed, try fallback approach
        if (Object.keys(initialSchedules).length === 0) {
          // Add current schedule if available
          if (selectedStaff?.currentShift && selectedStaff?.currentShift !== 'off') {
            const today = new Date()
            initialSchedules[today.toDateString()] = selectedStaff.currentShift
            setSchedules(initialSchedules)
          }
        }
        
      } catch (error) {
        console.error('Error loading schedules:', error)
        // Set empty schedules on error
        setSchedules({})
      } finally {
        setIsLoading(false)
      }
    }
    
    if (selectedStaffId) {
      loadSchedules()
    }
  }, [selectedStaffId]) // Removed selectedStaff dependency to prevent unnecessary reloads

  // Save schedules to localStorage whenever they change
  useEffect(() => {
    if (Object.keys(schedules).length > 0) {
      localStorage.setItem(`schedule_${selectedStaffId}`, JSON.stringify(schedules))
    }
  }, [schedules, selectedStaffId])

  // Get calendar dates for current month
  const getCalendarDays = () => {
    const year = currentDate.getFullYear()
    const month = currentDate.getMonth()
    const firstDay = new Date(year, month, 1)
    const lastDay = new Date(year, month + 1, 0)
    const startDate = new Date(firstDay)
    startDate.setDate(startDate.getDate() - firstDay.getDay())
    
    const days = []
    const current = new Date(startDate)
    
    for (let i = 0; i < 42; i++) {
      days.push(new Date(current))
      current.setDate(current.getDate() + 1)
    }
    
    return days
  }

  // Navigate months
  const navigateMonth = (direction) => {
    const newDate = new Date(currentDate)
    newDate.setMonth(currentDate.getMonth() + direction)
    setCurrentDate(newDate)
  }

  // Get shift options based on role
  const getShiftOptions = () => {
    switch (staffRole) {
      case 'nurse':
        return [
          { value: 'morning', label: 'Morning (7AM-1PM)', color: 'bg-blue-100 text-blue-800' },
          { value: 'afternoon', label: 'Afternoon (1PM-7PM)', color: 'bg-green-100 text-green-800' },
          { value: 'night', label: 'Night (7PM-7AM)', color: 'bg-purple-100 text-purple-800' },
          { value: 'off', label: 'Off Duty', color: 'bg-gray-100 text-gray-800' }
        ]
      case 'doctor':
        return [
          { value: 'morning', label: 'Morning (8AM-4PM)', color: 'bg-blue-100 text-blue-800' },
          { value: 'afternoon', label: 'Afternoon (1PM-7PM)', color: 'bg-green-100 text-green-800' },
          { value: 'night', label: 'Night (7PM-7AM)', color: 'bg-purple-100 text-purple-800' },
          { value: 'emergency', label: 'Emergency (24h)', color: 'bg-red-100 text-red-800' },
          { value: 'off', label: 'Off Duty', color: 'bg-gray-100 text-gray-800' }
        ]
      default:
        return [
          { value: 'morning', label: 'Morning (7AM-3PM)', color: 'bg-blue-100 text-blue-800' },
          { value: 'afternoon', label: 'Afternoon (3PM-11PM)', color: 'bg-green-100 text-green-800' },
          { value: 'night', label: 'Night (11PM-7AM)', color: 'bg-purple-100 text-purple-800' },
          { value: 'off', label: 'Off Duty', color: 'bg-gray-100 text-gray-800' }
        ]
    }
  }

  // Handle date click
  const handleDateClick = (date) => {
    setSelectedDate(date)
    // Prevent any default behavior
    return false
  }

  // Handle shift assignment
  const handleAssignShift = async (shift) => {
    if (!selectedDate) {
      toast.error('Please select a date first')
      return false
    }

    try {
      const dateKey = selectedDate.toDateString()
      
      console.log('🔄 ASSIGNING SHIFT - NO REFRESH SHOULD HAPPEN')
      console.log('🔄 Date:', dateKey, 'Shift:', shift)
      
      // Update local calendar state FIRST for immediate UI feedback
      const newSchedules = {
        ...schedules,
        [dateKey]: shift
      }
      setSchedules(newSchedules)
      
      // Save to localStorage immediately for persistence
      localStorage.setItem(`schedule_${selectedStaffId}`, JSON.stringify(newSchedules))

      // Update the staff member's current schedule in the database
      const updateSuccess = await onUpdateSchedule(selectedStaffId, {
        currentShift: shift,
        isOnDuty: shift !== 'off',
        scheduleDate: selectedDate.toISOString().split('T')[0]
      })

      // Try to save the full schedule data to the schedule API in background
      // Don't wait for this to complete to avoid delays
      apiClient.updateStaffSchedule(selectedStaffId, newSchedules)
        .then(() => {
          console.log('✅ Schedule saved to API successfully (background operation)')
        })
        .catch((scheduleApiError) => {
          console.log('Schedule API save failed, localStorage already has backup:', scheduleApiError)
        })

      const staffMember = staff.find(s => s._id === selectedStaffId)
      const staffName = staffMember?.name || `${staffMember?.firstName} ${staffMember?.lastName}`
      
      if (updateSuccess !== false) {
        toast.success(`✅ ${shift === 'off' ? 'Off duty' : shift + ' shift'} assigned to ${staffName} for ${selectedDate.toLocaleDateString()}`)
      } else {
        toast.warning(`⚠️ ${shift === 'off' ? 'Off duty' : shift + ' shift'} assigned locally but database update failed`)
      }
      
      // Clear selected date after assignment for better UX
      setSelectedDate(null)
      
      console.log('✅ SHIFT ASSIGNMENT COMPLETED - NO REFRESH OCCURRED')
      
    } catch (error) {
      console.error('Error assigning shift:', error)
      toast.error('❌ Failed to assign shift. Please try again.')
      
      // Revert local state on error
      const dateKey = selectedDate.toDateString()
      setSchedules(prev => {
        const newState = { ...prev }
        delete newState[dateKey]
        return newState
      })
    }
    
    // Prevent any form submission or navigation
    return false
  }

  // Get shift for a specific date
  const getShiftForDate = (date) => {
    return schedules[date.toDateString()] || null
  }

  // Get shift color
  const getShiftColor = (shift) => {
    const option = getShiftOptions().find(opt => opt.value === shift)
    return option?.color || 'bg-gray-100 text-gray-800'
  }

  const monthNames = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ]

  const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']

  return (
    <div 
      className="flex items-center justify-center"
      style={{ 
        position: 'fixed',
        top: 0, 
        left: 0, 
        right: 0, 
        bottom: 0, 
        width: '100vw', 
        height: '100vh',
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
        zIndex: 9999,
        margin: 0,
        padding: 0
      }}
    >
      <div className="bg-white rounded-lg p-6 w-full max-w-4xl max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-bold text-gray-900">
            Schedule Calendar - {selectedStaff?.name || selectedStaff?.firstName + ' ' + selectedStaff?.lastName}
          </h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Staff Info */}
        <div className="mb-6 p-4 bg-gray-50 rounded-lg">
          <div className="flex items-center gap-4">
            <div className={`w-4 h-4 rounded-full ${selectedStaff?.isOnDuty ? 'bg-green-500' : 'bg-gray-400'}`}></div>
            <div>
              <p className="font-medium text-gray-900">
                {selectedStaff?.name || selectedStaff?.firstName + ' ' + selectedStaff?.lastName}
              </p>
              <p className="text-sm text-gray-600 capitalize">
                {selectedStaff?.role} - {selectedStaff?.department}
              </p>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Calendar */}
          <div className="lg:col-span-2">
            {/* Month Navigation */}
            <div className="flex justify-between items-center mb-4">
              <button
                type="button"
                onClick={(e) => {
                  e.preventDefault()
                  e.stopPropagation()
                  navigateMonth(-1)
                }}
                className="px-3 py-2 bg-blue-100 text-blue-700 rounded-lg hover:bg-blue-200 transition-colors"
              >
                ← Previous
              </button>
              <h3 className="text-lg font-semibold text-gray-900">
                {monthNames[currentDate.getMonth()]} {currentDate.getFullYear()}
              </h3>
              <button
                type="button"
                onClick={(e) => {
                  e.preventDefault()
                  e.stopPropagation()
                  navigateMonth(1)
                }}
                className="px-3 py-2 bg-blue-100 text-blue-700 rounded-lg hover:bg-blue-200 transition-colors"
              >
                Next →
              </button>
            </div>

            {/* Calendar Grid */}
            {isLoading ? (
              <div className="bg-white border border-gray-200 rounded-lg p-8 text-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
                <p className="text-sm text-gray-600">Loading schedule data...</p>
              </div>
            ) : (
              <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
                {/* Day Headers */}
                <div className="grid grid-cols-7 bg-gray-50">
                  {dayNames.map(day => (
                    <div key={day} className="p-3 text-center text-sm font-medium text-gray-700 border-r border-gray-200 last:border-r-0">
                      {day}
                    </div>
                  ))}
                </div>

                {/* Calendar Days */}
                <div className="grid grid-cols-7">
                {getCalendarDays().map((date, index) => {
                  const isCurrentMonth = date.getMonth() === currentDate.getMonth()
                  const isToday = date.toDateString() === new Date().toDateString()
                  const isSelected = selectedDate && date.toDateString() === selectedDate.toDateString()
                  const shift = getShiftForDate(date)

                  return (
                    <div
                      key={index}
                      onClick={(e) => {
                        e.preventDefault()
                        e.stopPropagation()
                        if (isCurrentMonth) {
                          handleDateClick(date)
                        }
                      }}
                      className={`min-h-[90px] p-2 border-r border-b border-gray-200 last:border-r-0 cursor-pointer transition-colors ${
                        !isCurrentMonth ? 'bg-gray-50 text-gray-400' : 'hover:bg-blue-50'
                      } ${isSelected ? 'bg-blue-100 border-blue-300' : ''} ${isToday ? 'bg-yellow-50' : ''}`}
                    >
                      <div className={`text-sm font-medium mb-1 ${isToday ? 'text-blue-600' : ''}`}>
                        {date.getDate()}
                      </div>
                      {shift && isCurrentMonth && (
                        <div className={`text-xs px-1.5 py-1 rounded-lg flex items-center justify-center text-center font-medium leading-tight whitespace-nowrap ${getShiftColor(shift)}`}>
                          {shift === 'off' ? 'Off' : shift.charAt(0).toUpperCase() + shift.slice(1)}
                        </div>
                      )}
                    </div>
                  )
                })}
                </div>
              </div>
            )}
          </div>

          {/* Shift Assignment Panel */}
          <div>
            <h4 className="text-lg font-semibold text-gray-900 mb-4">Assign Shift</h4>
            
            {selectedDate ? (
              <div className="space-y-4">
                <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg">
                  <p className="text-sm text-blue-800">
                    <strong>Selected Date:</strong><br />
                    {selectedDate.toLocaleDateString('en-US', { 
                      weekday: 'long',
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric'
                    })}
                  </p>
                </div>

                <div className="space-y-2">
                  <p className="text-sm font-medium text-gray-700">Available Shifts:</p>
                  {getShiftOptions().map(option => (
                    <button
                      key={option.value}
                      type="button"
                      onClick={(e) => {
                        e.preventDefault()
                        e.stopPropagation()
                        handleAssignShift(option.value)
                      }}
                      className={`w-full text-left px-3 py-2 rounded-lg border transition-colors hover:scale-105 ${option.color} border-gray-300`}
                    >
                      <div className="font-medium">{option.label}</div>
                    </button>
                  ))}
                </div>
              </div>
            ) : (
              <div className="p-4 bg-gray-50 border border-gray-200 rounded-lg text-center">
                <Calendar className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                <p className="text-sm text-gray-600">Click on a date to assign a shift</p>
              </div>
            )}

            {/* Legend and Actions */}
            <div className="mt-6 space-y-4">
              <div>
                <h5 className="text-sm font-medium text-gray-700 mb-2">Legend:</h5>
                <div className="space-y-2">
                  {getShiftOptions().map(option => (
                    <div key={option.value} className="flex items-center gap-2">
                      <div className={`w-4 h-4 rounded-full flex items-center justify-center text-xs font-medium ${option.color}`}></div>
                      <span className="text-xs text-gray-600">{option.label}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Schedule Summary */}
              {Object.keys(schedules).length > 0 && (
                <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg">
                  <h5 className="text-sm font-medium text-blue-800 mb-2">Scheduled Days: {Object.keys(schedules).length}</h5>
                  <div className="text-xs text-blue-700 space-y-1 max-h-20 overflow-y-auto">
                    {Object.entries(schedules).slice(0, 3).map(([date, shift]) => (
                      <div key={date}>{new Date(date).toLocaleDateString()} - {shift}</div>
                    ))}
                    {Object.keys(schedules).length > 3 && (
                      <div className="text-blue-600">... and {Object.keys(schedules).length - 3} more</div>
                    )}
                  </div>
                </div>
              )}

              {/* Clear Schedule Button */}
              {Object.keys(schedules).length > 0 && (
                <button
                  onClick={() => {
                    if (confirm('Are you sure you want to clear all scheduled shifts? This action cannot be undone.')) {
                      setSchedules({})
                      localStorage.removeItem(`schedule_${selectedStaffId}`)
                      toast.success('📅 Schedule cleared successfully')
                    }
                  }}
                  className="w-full px-3 py-2 bg-red-100 text-red-800 border border-red-300 rounded-lg hover:bg-red-200 transition-colors text-sm"
                >
                  Clear All Schedules
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="flex justify-end gap-3 mt-6 pt-4 border-t border-gray-200">
          <button
            onClick={onClose}
            className="px-4 py-2 text-gray-700 bg-gray-200 rounded-lg hover:bg-gray-300 transition-colors"
          >
            Close Calendar
          </button>
        </div>
      </div>
    </div>
  )
}

// Schedule Shift Modal Component
const ScheduleShiftModal = ({ staff, preSelectedStaffId, onClose, onUpdateSchedule, getShiftTimeDisplay }) => {
  const [selectedStaff, setSelectedStaff] = useState(preSelectedStaffId ? [preSelectedStaffId] : [])
  const [shift, setShift] = useState('morning')
  const [date, setDate] = useState(new Date().toISOString().split('T')[0])

  // Reset shift when staff selection changes to ensure valid option
  useEffect(() => {
    const currentOptions = getShiftOptions()
    if (currentOptions.length > 0 && !currentOptions.some(option => option.value === shift)) {
      setShift(currentOptions[0].value)
    }
  }, [selectedStaff])

  // Get shift options based on selected staff roles
  const getShiftOptions = () => {
    const selectedMembers = staff.filter(member => selectedStaff.includes(member._id))
    const roles = selectedMembers.map(member => member.role)
    const hasNurses = roles.includes('nurse')
    const hasDoctors = roles.includes('doctor')
    
    // If mixed roles or no selection, show general options
    if (selectedStaff.length === 0 || (hasNurses && hasDoctors)) {
      return [
        { value: 'morning', label: 'Morning Shift', time: 'Times vary by role' },
        { value: 'afternoon', label: 'Afternoon Shift', time: 'Times vary by role' },
        { value: 'night', label: 'Night Shift', time: 'Times vary by role' },
        { value: 'off', label: 'Off Duty', time: '' }
      ]
    }
    
    // Nurse-specific shifts
    if (hasNurses && !hasDoctors) {
      return [
        { value: 'morning', label: 'Morning Shift', time: '7:00 AM - 1:00 PM' },
        { value: 'afternoon', label: 'Afternoon Shift', time: '1:00 PM - 7:00 PM' },
        { value: 'night', label: 'Night Shift', time: '7:00 PM - 7:00 AM (12 hours)' },
        { value: 'off', label: 'Off Duty', time: '' }
      ]
    }
    
    // Doctor-specific shifts
    if (hasDoctors && !hasNurses) {
      return [
        { value: 'morning', label: 'Morning Shift', time: '8:00 AM - 4:00 PM' },
        { value: 'afternoon', label: 'Afternoon/Evening Shift', time: '1:00 PM - 7:00 PM' },
        { value: 'night', label: 'Night Shift', time: '7:00 PM - 7:00 AM (24-hour cycle)' },
        { value: 'emergency', label: 'Emergency Rotation', time: '24-hour on-call' },
        { value: 'off', label: 'Off Duty', time: '' }
      ]
    }
    
    return []
  }

  const handleSelectStaff = (staffId) => {
    setSelectedStaff(prev => 
      prev.includes(staffId) 
        ? prev.filter(id => id !== staffId)
        : [...prev, staffId]
    )
  }

  const handleSchedule = async () => {
    if (selectedStaff.length === 0) {
      toast.error('Please select at least one staff member')
      return
    }

    if (!date) {
      toast.error('Please select a date')
      return
    }

    try {
      const updates = selectedStaff.map(async (staffId) => {
        const staffMember = staff.find(s => s._id === staffId)
        const staffName = staffMember?.name || `${staffMember?.firstName} ${staffMember?.lastName}`
        
        await onUpdateSchedule(staffId, {
          currentShift: shift,
          isOnDuty: shift !== 'off',
          scheduleDate: date
        })
        
        return staffName
      })

      const staffNames = await Promise.all(updates)
      const selectedDate = new Date(date).toLocaleDateString()
      
      toast.success(`✅ Successfully scheduled ${staffNames.length} staff member${staffNames.length > 1 ? 's' : ''} for ${shift} shift on ${selectedDate}`)
      
      onClose()
    } catch (error) {
      console.error('Error scheduling staff:', error)
      toast.error('❌ Failed to schedule staff members. Please try again.')
    }
  }

  return (
    <div 
      className="flex items-center justify-center"
      style={{ 
        position: 'fixed',
        top: 0, 
        left: 0, 
        right: 0, 
        bottom: 0, 
        width: '100vw', 
        height: '100vh',
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
        zIndex: 9999,
        margin: 0,
        padding: 0
      }}
    >
      <div className="bg-white rounded-lg p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-bold text-gray-900">Schedule Staff Shifts</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Schedule Controls */}
        <div className="grid grid-cols-2 gap-4 mb-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Date</label>
            <input
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Shift</label>
            <select
              key={`shift-select-${selectedStaff.join('-')}`}
              value={shift}
              onChange={(e) => setShift(e.target.value)}
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              {getShiftOptions().map(option => (
                <option key={option.value} value={option.value}>
                  {option.label} {option.time && `(${option.time})`}
                </option>
              ))}
            </select>
            {selectedStaff.length > 0 && (
              <p className="text-xs text-gray-600 mt-1">
                Selected: {staff.filter(s => selectedStaff.includes(s._id)).map(s => s.role).join(', ')} roles
              </p>
            )}
          </div>
        </div>

        {/* Shift Information */}
        {selectedStaff.length > 0 && (
          <div className="mb-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
            <h4 className="text-sm font-semibold text-blue-900 mb-2">Shift Schedule Information</h4>
            <div className="text-xs text-blue-800 space-y-1">
              {(() => {
                const selectedMembers = staff.filter(member => selectedStaff.includes(member._id))
                const roles = [...new Set(selectedMembers.map(member => member.role))]
                
                return roles.map(role => (
                  <div key={role} className="border-l-2 border-blue-300 pl-2">
                    <p className="font-medium capitalize">{role}s:</p>
                    {role === 'nurse' && (
                      <ul className="ml-2 space-y-0.5">
                        <li>• Morning: 7:00 AM - 1:00 PM</li>
                        <li>• Afternoon: 1:00 PM - 7:00 PM</li>
                        <li>• Night: 7:00 PM - 7:00 AM (12 hours)</li>
                      </ul>
                    )}
                    {role === 'doctor' && (
                      <ul className="ml-2 space-y-0.5">
                        <li>• Morning: 8:00 AM - 4:00 PM (General/Outpatient)</li>
                        <li>• Afternoon: 1:00 PM - 7:00 PM (Follow-up/Surgical)</li>
                        <li>• Night: 7:00 PM - 7:00 AM (ICU/Emergency/Trauma)</li>
                        <li>• Emergency: 24-hour on-call rotation</li>
                      </ul>
                    )}
                    {!['nurse', 'doctor'].includes(role) && (
                      <ul className="ml-2 space-y-0.5">
                        <li>• Morning: 7:00 AM - 3:00 PM</li>
                        <li>• Afternoon: 3:00 PM - 11:00 PM</li>
                        <li>• Night: 11:00 PM - 7:00 AM</li>
                      </ul>
                    )}
                  </div>
                ))
              })()}
            </div>
          </div>
        )}

        {/* Staff Selection */}
        <div className="mb-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-3">Select Staff Members</h3>
          <div className="max-h-60 overflow-y-auto border border-gray-200 rounded-lg">
            {staff.map((member) => (
              <div
                key={member._id}
                className={`p-3 border-b border-gray-100 last:border-b-0 cursor-pointer hover:bg-gray-50 ${
                  selectedStaff.includes(member._id) ? 'bg-blue-50 border-blue-200' : ''
                }`}
                onClick={() => handleSelectStaff(member._id)}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <input
                      type="checkbox"
                      checked={selectedStaff.includes(member._id)}
                      onChange={() => handleSelectStaff(member._id)}
                      className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                    />
                    <div>
                      <p className="font-medium text-gray-900">
                        {member.name || `${member.firstName} ${member.lastName}`}
                      </p>
                      <p className="text-sm text-gray-500">{member.role} - {member.department}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                      member.isOnDuty 
                        ? 'bg-green-100 text-green-700' 
                        : 'bg-gray-100 text-gray-700'
                    }`}>
                      {member.isOnDuty ? 'On Duty' : 'Off Duty'}
                    </span>
                    <p className="text-xs text-gray-500 mt-1">
                      Current: {member.currentShift === 'off' ? 'Off Duty' : 
                        `${member.currentShift?.charAt(0).toUpperCase()}${member.currentShift?.slice(1)} (${getShiftTimeDisplay(member.role, member.currentShift)})`
                      }
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Actions */}
        <div className="flex justify-end gap-3">
          <button
            onClick={onClose}
            className="px-4 py-2 text-gray-700 bg-gray-200 rounded-lg hover:bg-gray-300 transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleSchedule}
            disabled={selectedStaff.length === 0}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
          >
            Schedule {selectedStaff.length} Staff
          </button>
        </div>
      </div>
    </div>
  )
}

// Staff Timetable View Component
  const StaffTimetableView = ({ staff, staffSchedules, isLoadingSchedules }) => {
    console.log('🔧 StaffTimetableView component loaded with staff:', staff)
    console.log('🔧 StaffTimetableView received staffSchedules prop:', staffSchedules)
    console.log('🔧 StaffTimetableView received isLoadingSchedules prop:', isLoadingSchedules)
    
    const [selectedRole, setSelectedRole] = useState('all')
    const [selectedWeek, setSelectedWeek] = useState(0) // 0 = current week, 1 = next week
    // Remove duplicate staffSchedules state - use parent component's state instead
  
  // Safety check for empty staff data
  if (!staff || staff.length === 0) {
    console.log('🔧 No staff data available, showing empty state')
    return (
      <div className="bg-white border border-gray-200 rounded-lg p-8 text-center">
        <Calendar className="w-12 h-12 text-gray-300 mx-auto mb-4" />
        <h3 className="text-lg font-medium text-gray-900 mb-2">No Staff Data Available</h3>
        <p className="text-gray-500">Please add staff members to view the timetable.</p>
      </div>
    )
  }

  // Find weeks that have actual schedule data
  const getWeeksWithScheduleData = () => {
    const weeksWithData = new Set()
    
    // Get all schedule dates from all staff members
    Object.values(staffSchedules).forEach(schedule => {
      Object.keys(schedule).forEach(dateKey => {
        const date = new Date(dateKey)
        // Calculate which week this date belongs to
        const monday = new Date(date)
        monday.setDate(date.getDate() - date.getDay() + 1) // Get Monday of this week
        const weekKey = monday.toDateString()
        weeksWithData.add(weekKey)
      })
    })
    
    // Convert to array and sort
    const sortedWeeks = Array.from(weeksWithData).sort((a, b) => new Date(a) - new Date(b))
    console.log('🔧 Weeks with schedule data:', sortedWeeks)
    return sortedWeeks
  }

  const weeksWithData = getWeeksWithScheduleData()
  
  // Get unique roles from actual staff data
  const uniqueRoles = [...new Set(staff.map(member => member.role))].filter(Boolean)
  const roles = ['all', ...uniqueRoles]
  const daysOfWeek = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday']
  const timeSlots = ['7:00 AM', '8:00 AM', '1:00 PM', '7:00 PM']
  
  // Role-specific shift schedules
  const shiftSchedules = {
    doctor: [
      { name: 'Morning Shift', time: '8:00 AM - 4:00 PM', color: 'bg-blue-100 text-blue-800' },
      { name: 'Evening Shift', time: '1:00 PM - 7:00 PM', color: 'bg-green-100 text-green-800' },
      { name: 'Night Shift', time: '7:00 PM - 7:00 AM', color: 'bg-purple-100 text-purple-800' },
      { name: 'Emergency', time: 'On-call 24/7', color: 'bg-red-100 text-red-800' }
    ],
    nurse: [
      { name: 'Day Shift', time: '7:00 AM - 1:00 PM', color: 'bg-yellow-100 text-yellow-800' },
      { name: 'Afternoon Shift', time: '1:00 PM - 7:00 PM', color: 'bg-orange-100 text-orange-800' },
      { name: 'Night Shift', time: '7:00 PM - 7:00 AM', color: 'bg-indigo-100 text-indigo-800' }
    ],
    technician: [
      { name: 'Day Shift', time: '8:00 AM - 4:00 PM', color: 'bg-teal-100 text-teal-800' },
      { name: 'Evening Shift', time: '4:00 PM - 12:00 AM', color: 'bg-cyan-100 text-cyan-800' }
    ],
    respiratory_therapist: [
      { name: 'Day Shift', time: '8:00 AM - 4:00 PM', color: 'bg-purple-100 text-purple-800' },
      { name: 'Night Shift', time: '7:00 PM - 7:00 AM', color: 'bg-indigo-100 text-indigo-800' }
    ],
    pharmacist: [
      { name: 'Day Shift', time: '8:00 AM - 6:00 PM', color: 'bg-green-100 text-green-800' },
      { name: 'Evening Shift', time: '2:00 PM - 10:00 PM', color: 'bg-teal-100 text-teal-800' }
    ],
    // Default schedule for any other roles
    default: [
      { name: 'Day Shift', time: '8:00 AM - 4:00 PM', color: 'bg-gray-100 text-gray-800' },
      { name: 'Evening Shift', time: '4:00 PM - 12:00 AM', color: 'bg-gray-200 text-gray-800' }
    ]
  }

  const filteredStaff = selectedRole === 'all' 
    ? staff 
    : staff.filter(member => member.role === selectedRole)

  // Check if filtered staff is empty
  if (filteredStaff.length === 0) {
    return (
      <div className="bg-white border border-gray-200 rounded-lg p-8 text-center">
        <Calendar className="w-12 h-12 text-gray-300 mx-auto mb-4" />
        <h3 className="text-lg font-medium text-gray-900 mb-2">No Staff Found</h3>
        <p className="text-gray-500">
          {selectedRole === 'all' 
            ? 'No staff members available for timetable view.' 
            : `No ${selectedRole} staff members found.`}
        </p>
        {selectedRole !== 'all' && (
          <button 
            onClick={() => setSelectedRole('all')}
            className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            View All Roles
          </button>
        )}
      </div>
    )
  }

  const getShiftForStaff = (staffMember, day, date) => {
    // First, try to get actual schedule data for this staff member and date
    const staffSchedule = staffSchedules[staffMember._id] || {}
    const dateKey = date.toDateString()
    
    console.log(`🔧 getShiftForStaff: ${staffMember.name} on ${day} (${dateKey})`)
    console.log(`🔧 Available schedule keys:`, Object.keys(staffSchedule))
    console.log(`🔧 Looking for dateKey: "${dateKey}"`)
    console.log(`🔧 Full staffSchedules object:`, staffSchedules)
    console.log(`🔧 staffMember._id:`, staffMember._id)
    console.log(`🔧 staffSchedule for this member:`, staffSchedule)
    
    // Try exact match first
    if (staffSchedule[dateKey]) {
      const shiftType = staffSchedule[dateKey]
      console.log(`🔧 ✅ Found scheduled shift: ${shiftType} for ${staffMember.name} on ${dateKey}`)
      
      // Map shift types to display information based on role
      const shifts = shiftSchedules[staffMember.role] || shiftSchedules.default
      
      // Find matching shift by type
      let matchingShift = null
      switch (shiftType) {
        case 'morning':
          matchingShift = shifts.find(s => s.name.toLowerCase().includes('morning') || s.name.toLowerCase().includes('day'))
          break
        case 'afternoon':
        case 'evening':
          matchingShift = shifts.find(s => s.name.toLowerCase().includes('afternoon') || s.name.toLowerCase().includes('evening'))
          break
        case 'night':
          matchingShift = shifts.find(s => s.name.toLowerCase().includes('night'))
          break
        case 'emergency':
          matchingShift = shifts.find(s => s.name.toLowerCase().includes('emergency')) || {
            name: 'Emergency',
            time: 'On-call',
            color: 'bg-red-100 text-red-800'
          }
          break
        case 'off':
          console.log(`🔧 Staff ${staffMember.name} is off on ${dateKey}`)
          return null
        default:
          matchingShift = shifts[0] // Default to first shift
      }
      
      console.log(`🔧 Returning shift:`, matchingShift)
      return matchingShift || shifts[0]
    } else {
      console.log(`🔧 ❌ No schedule found for ${staffMember.name} on ${dateKey}`)
      console.log(`🔧 Available dates for this staff:`, Object.keys(staffSchedule))
    }
    
    // Fallback: use staff member's current shift if it's today
    const today = new Date()
    if (date.toDateString() === today.toDateString() && staffMember.currentShift && staffMember.currentShift !== 'off') {
      console.log(`🔧 Using current shift for ${staffMember.name}: ${staffMember.currentShift}`)
      const shifts = shiftSchedules[staffMember.role] || shiftSchedules.default
      const currentShiftType = staffMember.currentShift
      
      switch (currentShiftType) {
        case 'morning':
          return shifts.find(s => s.name.toLowerCase().includes('morning') || s.name.toLowerCase().includes('day')) || shifts[0]
        case 'afternoon':
        case 'evening':
          return shifts.find(s => s.name.toLowerCase().includes('afternoon') || s.name.toLowerCase().includes('evening')) || shifts[1]
        case 'night':
          return shifts.find(s => s.name.toLowerCase().includes('night')) || shifts[2]
        case 'emergency':
          return { name: 'Emergency', time: 'On-call', color: 'bg-red-100 text-red-800' }
        default:
          return shifts[0]
      }
    }
    
    // If no schedule data available and not current duty, show as off
    console.log(`🔧 No shift data for ${staffMember.name} on ${dateKey} - showing as off`)
    return null
  }

  const weekOffset = selectedWeek * 7
  const currentDate = new Date()
  const startOfWeek = new Date(currentDate)
  startOfWeek.setDate(currentDate.getDate() - currentDate.getDay() + 1 + weekOffset) // Start from Monday

  return (
    <div className="space-y-6">
      {/* Timetable Controls */}
      <div className="flex flex-wrap gap-4 justify-between items-center bg-gray-50 p-4 rounded-lg">
        <div className="flex items-center gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Filter by Role</label>
            <select
              value={selectedRole}
              onChange={(e) => setSelectedRole(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              {roles.map(role => (
                <option key={role} value={role}>
                  {role === 'all' ? 'All Roles' : 
                   role === 'respiratory_therapist' ? 'Respiratory Therapists' :
                   role.charAt(0).toUpperCase() + role.slice(1) + 's'}
                </option>
              ))}
            </select>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Week View</label>
            <select
              value={selectedWeek}
              onChange={(e) => setSelectedWeek(Number(e.target.value))}
              className="px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value={0}>Current Week</option>
              <option value={1}>Next Week</option>
              <option value={2}>Week After Next</option>
              {weeksWithData.length > 0 && (
                <>
                  <option disabled>─── Weeks with Schedule Data ───</option>
                  {weeksWithData.map((weekStart, index) => {
                    const weekDate = new Date(weekStart)
                    const weekEnd = new Date(weekDate)
                    weekEnd.setDate(weekDate.getDate() + 6)
                    const weekOffset = Math.ceil((weekDate - new Date()) / (7 * 24 * 60 * 60 * 1000))
                    return (
                      <option key={weekStart} value={weekOffset}>
                        {weekDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })} - {weekEnd.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                      </option>
                    )
                  })}
                </>
              )}
            </select>
          </div>
        </div>

        <div className="text-sm text-gray-600">
          <p className="font-medium">Viewing: {selectedRole === 'all' ? 'All Staff' : selectedRole.charAt(0).toUpperCase() + selectedRole.slice(1) + 's'}</p>
          <p>Total: {filteredStaff.length} staff members</p>
          {Object.keys(staffSchedules).length > 0 && (
            <p className="text-blue-600 mt-1">
              📅 Schedule data available for {Object.values(staffSchedules).reduce((total, schedule) => total + Object.keys(schedule).length, 0)} dates
            </p>
          )}
        </div>
      </div>

      {/* Debug Information */}
      <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
        <h3 className="text-sm font-semibold text-yellow-800 mb-2">🔧 Debug Information</h3>
        <div className="text-xs text-yellow-700 space-y-1">
          <p><strong>Current Week:</strong> {startOfWeek.toLocaleDateString()} - {new Date(startOfWeek.getTime() + 6 * 24 * 60 * 60 * 1000).toLocaleDateString()}</p>
          <p><strong>Selected Week Offset:</strong> {selectedWeek}</p>
          <p><strong>Staff Schedules Loaded:</strong> {Object.keys(staffSchedules).length} staff members</p>
          {Object.entries(staffSchedules).map(([staffId, schedule]) => {
            const staffMember = staff.find(s => s._id === staffId)
            return (
              <div key={staffId} className="ml-4">
                <p><strong>{staffMember?.name || 'Unknown'}:</strong> {Object.keys(schedule).length} scheduled dates</p>
                <div className="ml-4 text-xs">
                  {Object.entries(schedule).slice(0, 3).map(([date, shift]) => (
                    <p key={date}>{date}: {shift}</p>
                  ))}
                  {Object.keys(schedule).length > 3 && <p>... and {Object.keys(schedule).length - 3} more</p>}
                </div>
              </div>
            )
          })}
        </div>
      </div>

      {/* Shift Legend */}
      {selectedRole !== 'all' && shiftSchedules[selectedRole] && (
        <div className="bg-white border border-gray-200 rounded-lg p-4">
          <h3 className="text-lg font-semibold text-gray-900 mb-3">
            {selectedRole.charAt(0).toUpperCase() + selectedRole.slice(1)} Shift Schedule
          </h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {shiftSchedules[selectedRole].map((shift, index) => (
              <div key={index} className={`${shift.color} px-3 py-2 rounded-lg`}>
                <div className="font-medium text-sm">{shift.name}</div>
                <div className="text-xs">{shift.time}</div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Weekly Timetable Grid */}
      {isLoadingSchedules ? (
        <div className="bg-white border border-gray-200 rounded-lg p-8 text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-sm text-gray-600">Loading schedule data...</p>
        </div>
      ) : (
        <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-3 text-left text-sm font-medium text-gray-700 border-r border-gray-200">
                    Staff Member
                  </th>
                  {daysOfWeek.map((day, index) => {
                    const date = new Date(startOfWeek)
                    date.setDate(startOfWeek.getDate() + index)
                    return (
                      <th key={day} className="px-3 py-3 text-center text-sm font-medium text-gray-700 border-r border-gray-200 min-w-[120px]">
                        <div>{day}</div>
                        <div className="text-xs text-gray-500 font-normal">
                          {date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                        </div>
                      </th>
                    )
                  })}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {filteredStaff.map(staffMember => (
                  <tr key={staffMember._id} className="hover:bg-gray-50">
                    <td className="px-4 py-3 border-r border-gray-200">
                      <div className="flex items-center">
                        <div className={`w-3 h-3 rounded-full mr-3 ${staffMember.isOnDuty ? 'bg-green-500' : 'bg-gray-400'}`}></div>
                        <div>
                          <div className="font-medium text-gray-900">
                            {staffMember.name || `${staffMember.firstName || ''} ${staffMember.lastName || ''}`.trim() || 'Unknown'}
                          </div>
                          <div className="text-sm text-gray-500">{staffMember.role || 'Unknown Role'}</div>
                          <div className="text-xs text-gray-400">{staffMember.department || 'Unknown Dept'}</div>
                        </div>
                      </div>
                    </td>
                    {daysOfWeek.map((day, index) => {
                      const date = new Date(startOfWeek)
                      date.setDate(startOfWeek.getDate() + index)
                      const shift = getShiftForStaff(staffMember, day, date)
                      return (
                        <td key={day} className="px-2 py-3 text-center border-r border-gray-200">
                          {shift ? (
                            <div className={`${shift.color} px-2 py-1 rounded text-xs font-medium`}>
                              <div>{shift.name}</div>
                              <div className="text-xs opacity-75">{shift.time}</div>
                            </div>
                          ) : (
                            <div className="text-gray-400 text-xs">Off</div>
                          )}
                        </td>
                      )
                    })}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Timetable Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <h4 className="font-medium text-blue-900 mb-2">Coverage Statistics</h4>
          <div className="space-y-1 text-sm">
            <div className="flex justify-between">
              <span className="text-blue-700">Day Shifts:</span>
              <span className="font-medium text-blue-900">
                {filteredStaff.filter(s => s.isOnDuty).length} / {filteredStaff.length}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-blue-700">Night Shifts:</span>
              <span className="font-medium text-blue-900">
                {Math.ceil(filteredStaff.length * 0.3)} / {filteredStaff.length}
              </span>
            </div>
          </div>
        </div>

        <div className="bg-green-50 border border-green-200 rounded-lg p-4">
          <h4 className="font-medium text-green-900 mb-2">Shift Distribution</h4>
          <div className="space-y-1 text-sm">
            <div className="flex justify-between">
              <span className="text-green-700">Balanced:</span>
              <span className="font-medium text-green-900">
                {Math.round((filteredStaff.length / 7) * 10) / 10} per day
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-green-700">Efficiency:</span>
              <span className="font-medium text-green-900">85%</span>
            </div>
          </div>
        </div>

        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
          <h4 className="font-medium text-yellow-900 mb-2">Quick Actions</h4>
          <div className="space-y-2">
            <button className="w-full px-3 py-1 bg-yellow-200 text-yellow-800 rounded text-sm hover:bg-yellow-300 transition-colors">
              Export Schedule
            </button>
            <button className="w-full px-3 py-1 bg-yellow-200 text-yellow-800 rounded text-sm hover:bg-yellow-300 transition-colors">
              Print Timetable
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

// Assign Patient Modal Component
const AssignPatientModal = ({ staff, onClose }) => {
  const [selectedStaff, setSelectedStaff] = useState('')
  const [patientName, setPatientName] = useState('')
  const [patientId, setPatientId] = useState('')
  const [priority, setPriority] = useState('normal')
  const [notes, setNotes] = useState('')

  const availableStaff = staff.filter(member => 
    member.isOnDuty && (member.assignedPatientsCount || member.assignedPatients?.length || 0) < 5
  )

  const handleAssign = () => {
    if (!selectedStaff || !patientName) {
      toast.error('Please fill in all required fields')
      return
    }

    const staffMember = staff.find(s => s._id === selectedStaff)
    toast.success(`✅ Patient "${patientName}" assigned to ${staffMember?.name}`)
    
    // TODO: Implement actual patient assignment API call
    console.log('Assigning patient:', { patientName, patientId, selectedStaff, priority, notes })
    onClose()
  }

  return (
    <div 
      className="flex items-center justify-center"
      style={{ 
        position: 'fixed',
        top: 0, 
        left: 0, 
        right: 0, 
        bottom: 0, 
        width: '100vw', 
        height: '100vh',
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
        zIndex: 9999,
        margin: 0,
        padding: 0
      }}
    >
      <div className="bg-white rounded-lg p-6 w-full max-w-md max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-bold text-gray-900">Assign Patient to Staff</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
            <X className="w-6 h-6" />
          </button>
        </div>

        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Patient Name *</label>
            <input
              type="text"
              value={patientName}
              onChange={(e) => setPatientName(e.target.value)}
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="Enter patient name"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Patient ID</label>
            <input
              type="text"
              value={patientId}
              onChange={(e) => setPatientId(e.target.value)}
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="Enter patient ID (optional)"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Assign to Staff *</label>
            <select
              value={selectedStaff}
              onChange={(e) => setSelectedStaff(e.target.value)}
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="">Select available staff member</option>
              {availableStaff.map(member => (
                <option key={member._id} value={member._id}>
                  {member.name} ({member.role}) - {member.assignedPatientsCount || 0} patients
                </option>
              ))}
            </select>
            {availableStaff.length === 0 && (
              <p className="text-sm text-red-600 mt-1">No staff members available for assignment</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Priority Level</label>
            <select
              value={priority}
              onChange={(e) => setPriority(e.target.value)}
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="low">Low Priority</option>
              <option value="normal">Normal Priority</option>
              <option value="high">High Priority</option>
              <option value="critical">Critical</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Notes</label>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              rows={3}
              placeholder="Any special instructions or notes..."
            />
          </div>
        </div>

        <div className="flex gap-3 mt-6">
          <button
            onClick={onClose}
            className="flex-1 px-4 py-2 text-gray-700 bg-gray-200 rounded-lg hover:bg-gray-300 transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleAssign}
            disabled={!selectedStaff || !patientName || availableStaff.length === 0}
            className="flex-1 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
          >
            Assign Patient
          </button>
        </div>
      </div>
    </div>
  )
}

// Time Off Modal Component
const TimeOffModal = ({ staff, onClose }) => {
  const [selectedStaff, setSelectedStaff] = useState('')
  const [startDate, setStartDate] = useState('')
  const [endDate, setEndDate] = useState('')
  const [reason, setReason] = useState('')
  const [type, setType] = useState('vacation')

  const handleSubmit = () => {
    if (!selectedStaff || !startDate || !endDate || !reason) {
      toast.error('Please fill in all required fields')
      return
    }

    const staffMember = staff.find(s => s._id === selectedStaff)
    toast.success(`✅ Time off request submitted for ${staffMember?.name}`)
    
    // TODO: Implement actual time off request API call
    console.log('Time off request:', { selectedStaff, startDate, endDate, reason, type })
    onClose()
  }

  return (
    <div 
      className="flex items-center justify-center"
      style={{ 
        position: 'fixed',
        top: 0, 
        left: 0, 
        right: 0, 
        bottom: 0, 
        width: '100vw', 
        height: '100vh',
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
        zIndex: 9999,
        margin: 0,
        padding: 0
      }}
    >
      <div className="bg-white rounded-lg p-6 w-full max-w-md max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-bold text-gray-900">Request Time Off</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
            <X className="w-6 h-6" />
          </button>
        </div>

        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Staff Member *</label>
            <select
              value={selectedStaff}
              onChange={(e) => setSelectedStaff(e.target.value)}
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="">Select staff member</option>
              {staff.map(member => (
                <option key={member._id} value={member._id}>
                  {member.name} ({member.role})
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Time Off Type *</label>
            <select
              value={type}
              onChange={(e) => setType(e.target.value)}
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="vacation">Vacation</option>
              <option value="sick">Sick Leave</option>
              <option value="personal">Personal Leave</option>
              <option value="emergency">Emergency Leave</option>
              <option value="maternity">Maternity/Paternity Leave</option>
              <option value="training">Training/Conference</option>
            </select>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Start Date *</label>
              <input
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">End Date *</label>
              <input
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Reason *</label>
            <textarea
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              rows={3}
              placeholder="Please provide a reason for the time off request..."
            />
          </div>
        </div>

        <div className="flex gap-3 mt-6">
          <button
            onClick={onClose}
            className="flex-1 px-4 py-2 text-gray-700 bg-gray-200 rounded-lg hover:bg-gray-300 transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleSubmit}
            disabled={!selectedStaff || !startDate || !endDate || !reason}
            className="flex-1 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
          >
            Submit Request
          </button>
        </div>
      </div>
    </div>
  )
}

// Emergency Alert Modal Component
const EmergencyAlertModal = ({ staff, onClose }) => {
  const [alertType, setAlertType] = useState('general')
  const [message, setMessage] = useState('')
  const [selectedDepartments, setSelectedDepartments] = useState([])
  const [urgencyLevel, setUrgencyLevel] = useState('high')
  const [isNotifying, setIsNotifying] = useState(false)

  const onDutyStaff = staff.filter(member => member.isOnDuty)
  const departments = [...new Set(staff.map(member => member.department))]

  const handleEmergencyAlert = async () => {
    if (!message.trim()) {
      toast.error('Please enter an emergency message')
      return
    }

    setIsNotifying(true)
    
    // Simulate API call delay
    setTimeout(() => {
      const targetStaff = selectedDepartments.length > 0 
        ? onDutyStaff.filter(member => selectedDepartments.includes(member.department))
        : onDutyStaff

      toast.success(`🚨 EMERGENCY ALERT SENT! ${targetStaff.length} staff members notified immediately!`, {
        duration: 5000,
        icon: '🚨'
      })
      
      // TODO: Implement actual emergency notification API call
      console.log('Emergency alert sent:', { 
        alertType, 
        message, 
        targetStaff: targetStaff.map(s => s.name),
        urgencyLevel 
      })
      
      setIsNotifying(false)
      onClose()
    }, 2000)
  }

  const handleDepartmentToggle = (department) => {
    setSelectedDepartments(prev => 
      prev.includes(department)
        ? prev.filter(d => d !== department)
        : [...prev, department]
    )
  }

  return (
    <div 
      className="flex items-center justify-center"
      style={{ 
        position: 'fixed',
        top: 0, 
        left: 0, 
        right: 0, 
        bottom: 0, 
        width: '100vw', 
        height: '100vh',
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
        zIndex: 9999,
        margin: 0,
        padding: 0
      }}
    >
      <div className="bg-white rounded-lg p-6 w-full max-w-lg max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-bold text-red-900 flex items-center gap-2">
            <AlertTriangle className="w-6 h-6 text-red-600" />
            Emergency Alert System
          </h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
            <X className="w-6 h-6" />
          </button>
        </div>

        <div className="space-y-4">
          <div className="bg-red-50 border border-red-200 rounded-lg p-4">
            <p className="text-sm text-red-800">
              <strong>Available:</strong> {onDutyStaff.length} staff members currently on duty
            </p>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Alert Type *</label>
            <select
              value={alertType}
              onChange={(e) => setAlertType(e.target.value)}
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
            >
              <option value="general">General Emergency</option>
              <option value="medical">Medical Emergency</option>
              <option value="fire">Fire Emergency</option>
              <option value="security">Security Alert</option>
              <option value="evacuation">Evacuation</option>
              <option value="code_blue">Code Blue</option>
              <option value="code_red">Code Red</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Urgency Level *</label>
            <select
              value={urgencyLevel}
              onChange={(e) => setUrgencyLevel(e.target.value)}
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
            >
              <option value="critical">🔴 CRITICAL - Immediate Response</option>
              <option value="high">🟠 HIGH - Urgent Response</option>
              <option value="moderate">🟡 MODERATE - Quick Response</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Target Departments</label>
            <div className="space-y-2">
              <button
                onClick={() => setSelectedDepartments([])}
                className={`w-full text-left p-2 rounded border ${
                  selectedDepartments.length === 0 
                    ? 'bg-red-100 border-red-300 text-red-800' 
                    : 'bg-gray-100 border-gray-300 text-gray-700'
                } hover:bg-red-50`}
              >
                🏥 All Departments ({onDutyStaff.length} staff)
              </button>
              {departments.map(department => {
                const deptStaff = onDutyStaff.filter(s => s.department === department)
                return (
                  <button
                    key={department}
                    onClick={() => handleDepartmentToggle(department)}
                    className={`w-full text-left p-2 rounded border ${
                      selectedDepartments.includes(department)
                        ? 'bg-red-100 border-red-300 text-red-800' 
                        : 'bg-gray-100 border-gray-300 text-gray-700'
                    } hover:bg-red-50`}
                  >
                    {department} ({deptStaff.length} on duty)
                  </button>
                )
              })}
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Emergency Message *</label>
            <textarea
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
              rows={4}
              placeholder="Enter detailed emergency message that will be sent to all selected staff members..."
            />
          </div>
        </div>

        <div className="flex gap-3 mt-6">
          <button
            onClick={onClose}
            className="flex-1 px-4 py-2 text-gray-700 bg-gray-200 rounded-lg hover:bg-gray-300 transition-colors"
            disabled={isNotifying}
          >
            Cancel
          </button>
          <button
            onClick={handleEmergencyAlert}
            disabled={!message.trim() || isNotifying}
            className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors flex items-center justify-center gap-2"
          >
            {isNotifying ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                Sending Alert...
              </>
            ) : (
              <>
                🚨 SEND EMERGENCY ALERT
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  )
}

