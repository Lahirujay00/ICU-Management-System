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
  Shield,
  Download,
  Printer
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
        // Start with database schedule
        let mergedSchedule = { ...result.schedule }
        
        // Merge with localStorage data (for absent markings and local changes)
        const staffScheduleKey = `staff_schedule_${result.staffId}`
        const localSchedule = JSON.parse(localStorage.getItem(staffScheduleKey) || '{}')
        
        // LocalStorage data takes precedence (especially for absent markings)
        mergedSchedule = { ...mergedSchedule, ...localSchedule }
        
        console.log(`🔧 Merged schedule for staff ${result.staffId}:`, {
          database: result.schedule,
          localStorage: localSchedule,
          merged: mergedSchedule
        })
        
        schedulesMap[result.staffId] = mergedSchedule
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

  // Helper function to get current time in Colombo Standard Time
  const getColomboTime = () => {
    return new Date().toLocaleString("en-US", {timeZone: "Asia/Colombo"})
  }

  // Helper function to get Colombo time as Date object
  const getColomboTimeAsDate = () => {
    // Get current UTC time and convert to Colombo timezone
    const now = new Date()
    // Colombo is UTC+5:30
    const utcTime = now.getTime() + (now.getTimezoneOffset() * 60000)
    const colomboTime = new Date(utcTime + (5.5 * 3600000)) // UTC+5:30
    return colomboTime
  }

  // Helper function to get current shift from timetable based on Colombo time
  const getCurrentShiftFromTimetable = (staffMember) => {
    const now = getColomboTimeAsDate()
    const today = new Date(now)
    
    // Get today's schedule from timetable
    const staffSchedule = staffSchedules[staffMember._id] || {}
    const todayKey = today.toDateString()
    const todayISOKey = today.toISOString().split('T')[0]
    
    // Check for leave first
    if (staffMember.leaveSchedule) {
      if (staffMember.leaveSchedule[todayISOKey] || staffMember.leaveSchedule[todayKey]) {
        return {
          shift: 'leave',
          isCurrentTime: true,
          display: 'On Leave'
        }
      }
    }
    
    // Get scheduled shift for today
    let scheduledShift = staffSchedule[todayKey] || staffSchedule[todayISOKey]
    
    // Try alternate date formats
    if (!scheduledShift) {
      for (const key of Object.keys(staffSchedule)) {
        try {
          const keyDate = new Date(key)
          if (keyDate.toDateString() === todayKey || keyDate.toISOString().split('T')[0] === todayISOKey) {
            scheduledShift = staffSchedule[key]
            break
          }
        } catch (e) {
          continue
        }
      }
    }
    
    // Handle absent status
    if (scheduledShift === 'absent') {
      return {
        shift: 'absent',
        isCurrentTime: false,
        display: 'Absent'
      }
    }
    
    if (!scheduledShift || scheduledShift === 'off') {
      return null // No shift scheduled for today
    }
    
    // Check if current time falls within the scheduled shift
    const currentHour = now.getHours()
    const currentMinute = now.getMinutes()
    const currentTimeMinutes = currentHour * 60 + currentMinute
    
    // Define shift time ranges based on role
    const getShiftTimeRange = (shift, role) => {
      const timeRanges = {
        doctor: {
          morning: { start: 8 * 60, end: 16 * 60 }, // 8:00 AM - 4:00 PM
          afternoon: { start: 13 * 60, end: 19 * 60 }, // 1:00 PM - 7:00 PM
          night: { start: 19 * 60, end: 7 * 60 + 24 * 60 }, // 7:00 PM - 7:00 AM next day
          emergency: { start: 0, end: 24 * 60 } // 24-hour
        },
        nurse: {
          morning: { start: 7 * 60, end: 13 * 60 }, // 7:00 AM - 1:00 PM
          afternoon: { start: 13 * 60, end: 19 * 60 }, // 1:00 PM - 7:00 PM
          night: { start: 19 * 60, end: 7 * 60 + 24 * 60 } // 7:00 PM - 7:00 AM next day
        },
        default: {
          morning: { start: 7 * 60, end: 15 * 60 }, // 7:00 AM - 3:00 PM
          afternoon: { start: 15 * 60, end: 23 * 60 }, // 3:00 PM - 11:00 PM
          night: { start: 23 * 60, end: 7 * 60 + 24 * 60 } // 11:00 PM - 7:00 AM next day
        }
      }
      
      const roleRanges = timeRanges[role] || timeRanges.default
      return roleRanges[shift] || null
    }
    
    const timeRange = getShiftTimeRange(scheduledShift, staffMember.role)
    if (!timeRange) return null
    
    // Check if current time is within shift range
    let isCurrentTime = false
    if (timeRange.end > 24 * 60) {
      // Overnight shift
      isCurrentTime = currentTimeMinutes >= timeRange.start || currentTimeMinutes <= (timeRange.end - 24 * 60)
    } else {
      // Regular shift
      isCurrentTime = currentTimeMinutes >= timeRange.start && currentTimeMinutes <= timeRange.end
    }
    
    // Safely capitalize the shift name
    const displayShift = typeof scheduledShift === 'string' 
      ? scheduledShift.charAt(0).toUpperCase() + scheduledShift.slice(1)
      : String(scheduledShift)
    
    return {
      shift: scheduledShift,
      isCurrentTime,
      display: displayShift,
      timeRange
    }
  }

  const handleToggleDutyStatus = async (staffId) => {
    try {
      console.log('🔧 handleToggleDutyStatus called with staffId:', staffId);
      
      const member = staff.find(s => s._id === staffId)
      if (!member) {
        console.error('❌ Staff member not found for ID:', staffId);
        toast.error('❌ Staff member not found')
        return
      }
      
      console.log('🔧 Found staff member:', member.name || `${member.firstName} ${member.lastName}`)
      
      const memberName = member.name || `${member.firstName} ${member.lastName}`
      
      console.log('🔧 Getting current shift info...')
      console.log('🔧 Current Colombo time:', getColomboTime())
      console.log('🔧 Current Colombo Date object:', getColomboTimeAsDate())
      
      let currentShiftInfo = null
      try {
        currentShiftInfo = getCurrentShiftFromTimetable(member)
        console.log('🔧 Current shift info:', currentShiftInfo)
      } catch (shiftError) {
        console.error('❌ Error getting current shift info:', shiftError)
        toast.error('❌ Error checking current shift schedule')
        return
      }
      
      // Check if staff member has a scheduled shift right now
      if (!member.isOnDuty) {
        // CLOCKING IN
        if (!currentShiftInfo || !currentShiftInfo.isCurrentTime) {
          const currentTime = getColomboTime()
          toast.error(`❌ ${memberName} has no scheduled shift at this time (${currentTime})`)
          return
        }
        
        console.log('🔧 Attempting to clock in staff member...')
        
        // Clock in for scheduled shift
        const newDutyStatus = true
        setStaff(prev => prev.map(m => 
          m._id === staffId 
            ? { ...m, isOnDuty: newDutyStatus, currentShift: currentShiftInfo.shift }
            : m
        ))
        
        try {
          const updateData = { 
            isOnDuty: newDutyStatus, 
            currentShift: currentShiftInfo.shift
          }
          console.log('🔧 Calling API to update staff status with data:', updateData)
          const result = await apiClient.updateStaffStatus(staffId, updateData)
          console.log('🔧 API call successful, result:', result)
          toast.success(`✅ ${memberName} clocked in for ${currentShiftInfo.display} shift`)
        } catch (apiError) {
          console.error('❌ Database status update failed:', apiError)
          console.error('❌ API Error details:', {
            message: apiError.message,
            stack: apiError.stack,
            name: apiError.name
          })
          toast.error(`❌ Failed to update ${memberName}'s status in database`)
          // Revert local state
          setStaff(prev => prev.map(m => 
            m._id === staffId 
              ? { ...m, isOnDuty: false, currentShift: 'off' }
              : m
          ))
        }
      } else {
        // CLOCKING OUT
        console.log('🔧 Attempting to clock out staff member...')
        const newDutyStatus = false
        
        // If clocking out during a scheduled shift, mark as absent in timetable
        if (currentShiftInfo && currentShiftInfo.isCurrentTime) {
          console.log('🔧 Marking as absent in timetable for early clock out...')
          
          // Use Colombo time for consistent date handling
          const colomboTime = getColomboTimeAsDate()
          const dateKey = colomboTime.toDateString()
          const isoDateKey = colomboTime.toISOString().split('T')[0]
          
          console.log('🔧 Marking absent for dates:', { dateKey, isoDateKey })
          
          // Update timetable to mark as absent
          const staffScheduleKey = `staff_schedule_${staffId}`
          const existingSchedule = JSON.parse(localStorage.getItem(staffScheduleKey) || '{}')
          existingSchedule[isoDateKey] = 'absent'
          existingSchedule[dateKey] = 'absent'
          localStorage.setItem(staffScheduleKey, JSON.stringify(existingSchedule))
          
          console.log('🔧 Updated localStorage schedule:', existingSchedule)
          
          // Update staffSchedules state
          setStaffSchedules(prev => {
            const updated = {
              ...prev,
              [staffId]: {
                ...prev[staffId],
                [dateKey]: 'absent',
                [isoDateKey]: 'absent'
              }
            }
            console.log('🔧 Updated staffSchedules state:', updated[staffId])
            return updated
          })
          
          toast(`⚠️ ${memberName} marked as ABSENT for ${currentShiftInfo.display} shift`, {
            icon: '⚠️',
            duration: 4000
          })
          
          // Force a re-render of the timetable view by triggering a state update
          setTimeout(() => {
            console.log('🔧 Forcing timetable refresh...')
            setStaffSchedules(prev => ({ ...prev }))
          }, 100)
        }
        
        setStaff(prev => prev.map(m => 
          m._id === staffId 
            ? { ...m, isOnDuty: newDutyStatus, currentShift: 'off' }
            : m
        ))
        
        try {
          const updateData = { 
            isOnDuty: newDutyStatus, 
            currentShift: 'off' 
          }
          console.log('🔧 Calling API to clock out staff with data:', updateData)
          const result = await apiClient.updateStaffStatus(staffId, updateData)
          console.log('🔧 Clock out API call successful, result:', result)
          toast.success(`✅ ${memberName} clocked out`)
        } catch (apiError) {
          console.error('❌ Database clock out update failed:', apiError)
          console.error('❌ Clock out API Error details:', {
            message: apiError.message,
            stack: apiError.stack,
            name: apiError.name
          })
          toast.error(`❌ Failed to update ${memberName}'s status in database`)
          // Revert local state
          setStaff(prev => prev.map(m => 
            m._id === staffId 
              ? { ...m, isOnDuty: true, currentShift: currentShiftInfo?.shift || 'morning' }
              : m
          ))
        }
      }
      
      // Provide feedback for patient assignment modal
      if (showAssignPatientModal) {
        const isNowOnDuty = !member.isOnDuty
        if (isNowOnDuty) {
          toast(`✅ ${memberName} is now available for patient assignments`, {
            icon: '✅',
            duration: 3000
          })
        } else {
          toast(`⚠️ ${memberName} is no longer available for new patient assignments`, {
            icon: '⚠️',
            duration: 3000
          })
        }
      }
      
    } catch (error) {
      console.error('❌ Error in handleToggleDutyStatus:', error)
      console.error('❌ Error details:', {
        message: error.message,
        stack: error.stack,
        name: error.name
      })
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
      
      // Provide feedback if assign patient modal is open and staff availability changed
      if (showAssignPatientModal && scheduleData.hasOwnProperty('isOnDuty')) {
        const updatedMember = staff.find(m => m._id === staffId)
        const memberName = updatedMember?.name || 'Staff member'
        
        if (scheduleData.isOnDuty) {
          toast(`✅ ${memberName} is now available for patient assignments`, {
            icon: '✅',
            duration: 3000
          })
        } else {
          toast(`⚠️ ${memberName} is no longer available for new patient assignments`, {
            icon: '⚠️',
            duration: 3000
          })
        }
      }
      
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
                    {(() => {
                      const currentShiftInfo = getCurrentShiftFromTimetable(member)
                      
                      return (
                        <>
                          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium w-fit ${
                            member.isOnDuty 
                              ? 'bg-green-100 text-green-800 border border-green-300' 
                              : 'bg-gray-100 text-gray-800 border border-gray-300'
                          }`}>
                            {member.isOnDuty ? '🟢 On Duty' : '⭕ Off Duty'}
                          </span>
                          
                          {/* Show current scheduled shift from timetable */}
                          {currentShiftInfo ? (
                            <div className="text-xs">
                              <div className={`flex items-center gap-1 mb-1 ${
                                currentShiftInfo.shift === 'leave' ? 'text-orange-600' :
                                currentShiftInfo.shift === 'time_off' ? 'text-pink-600' :
                                currentShiftInfo.shift === 'absent' ? 'text-red-600' :
                                currentShiftInfo.isCurrentTime ? 'text-blue-600' : 'text-gray-500'
                              }`}>
                                <Clock className="w-3 h-3" />
                                <span className="font-medium">
                                  {currentShiftInfo.shift === 'leave' ? 'On Leave' : 
                                   currentShiftInfo.shift === 'time_off' ? 'Time Off' :
                                   currentShiftInfo.shift === 'absent' ? 'Absent' :
                                   `${currentShiftInfo.display} Shift`}
                                  {member.isOnDuty && currentShiftInfo.isCurrentTime && 
                                   currentShiftInfo.shift !== 'leave' && 
                                   currentShiftInfo.shift !== 'time_off' && 
                                   currentShiftInfo.shift !== 'absent' && (
                                    <span className="ml-1 text-green-600">● ACTIVE</span>
                                  )}
                                </span>
                              </div>
                              {currentShiftInfo.shift !== 'leave' && 
                               currentShiftInfo.shift !== 'time_off' && 
                               currentShiftInfo.shift !== 'absent' && 
                               currentShiftInfo.timeRange && (
                                <div className="text-gray-500 text-xs pl-4">
                                  {getShiftTimeDisplay(member.role, currentShiftInfo.shift)}
                                </div>
                              )}
                              {!currentShiftInfo.isCurrentTime && 
                               currentShiftInfo.shift !== 'leave' && 
                               currentShiftInfo.shift !== 'time_off' && 
                               currentShiftInfo.shift !== 'absent' && (
                                <div className="text-gray-400 text-xs pl-4 italic">
                                  Scheduled for today
                                </div>
                              )}
                            </div>
                          ) : (
                            <div className="text-xs text-gray-400 italic">
                              No shift scheduled
                            </div>
                          )}
                        </>
                      )
                    })()}
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
        <StaffTimetableView 
          staff={staff} 
          staffSchedules={staffSchedules}
          isLoadingSchedules={isLoadingSchedules}
        />
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
            // Refresh staff data after closing modal
            loadStaff()
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
          setStaffSchedules={setStaffSchedules}
        />
      )}

      {/* Assign Patient Modal */}
      {showAssignPatientModal && (
        <AssignPatientModal 
          staff={staff}
          onClose={() => setShowAssignPatientModal(false)}
          onStaffUpdate={setStaff}
        />
      )}

      {/* Time Off Modal */}
      {showTimeOffModal && (
        <TimeOffModal 
          staff={staff}
          onClose={() => setShowTimeOffModal(false)}
          setStaffSchedules={setStaffSchedules}
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
  const [patientDetails, setPatientDetails] = useState({})
  const [loadingPatients, setLoadingPatients] = useState(false)

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

  // Handle unassigning patient from staff
  const handleUnassignPatient = async (patientId) => {
    try {
      // Call the API to unassign patient
      await apiClient.unassignPatientFromStaff(staff._id, patientId)
      
      // Show success message
      toast.success('✅ Patient unassigned successfully!')
      
      // Close modal to refresh the staff data in parent component
      onClose()
    } catch (error) {
      console.error('Error unassigning patient:', error)
      toast.error('❌ Failed to unassign patient. Please try again.')
    }
  }

  // Load patient details for assigned patients
  useEffect(() => {
    const loadPatientDetails = async () => {
      if (!staff.assignedPatients || !Array.isArray(staff.assignedPatients) || staff.assignedPatients.length === 0) {
        setPatientDetails({})
        setLoadingPatients(false)
        return
      }

      setLoadingPatients(true)
      try {
        // Try to get patients from API
        const patients = await apiClient.getPatients()
        const patientMap = {}
        
        staff.assignedPatients.forEach(assignment => {
          const patient = patients.find(p => p.patientId === assignment.patientId || p._id === assignment.patientId)
          if (patient) {
            patientMap[assignment.patientId] = {
              patientId: patient.patientId || patient._id,
              name: patient.name,
              bedNumber: patient.bedNumber,
              diagnosis: patient.diagnosis,
              status: patient.status,
              priority: assignment.priority,
              notes: assignment.notes,
              assignedAt: assignment.assignedAt
            }
          }
        })
        
        setPatientDetails(patientMap)
      } catch (error) {
        console.log('Failed to load patient details:', error)
        // Use mock data fallback
        const mockPatients = apiClient.getMockPatients()
        const patientMap = {}
        
        staff.assignedPatients.forEach(assignment => {
          const patient = mockPatients.find(p => p.patientId === assignment.patientId || p._id === assignment.patientId)
          if (patient) {
            patientMap[assignment.patientId] = {
              patientId: patient.patientId || patient._id,
              name: patient.name,
              bedNumber: patient.bedNumber,
              diagnosis: patient.diagnosis,
              status: patient.status,
              priority: assignment.priority,
              notes: assignment.notes,
              assignedAt: assignment.assignedAt
            }
          }
        })
        
        setPatientDetails(patientMap)
      } finally {
        setLoadingPatients(false)
      }
    }

    loadPatientDetails()
  }, [staff.assignedPatients])

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

          {/* Statistics and Assigned Patients */}
          <div className="border-t border-gray-200 pt-6">
            <h4 className="font-semibold text-gray-900 mb-4">Assigned Patients</h4>
            
            {(() => {
              const patientCount = staff.assignedPatientsCount ?? 
                                 (staff.assignedPatients?.length) ?? 
                                 (typeof staff.assignedPatients === 'number' ? staff.assignedPatients : 0);
              
              return (
                <div className="space-y-4">
                  {/* Patient Count Summary */}
                  <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
                    <div className="flex items-center gap-2 mb-1">
                      <Users className="w-4 h-4 text-blue-500" />
                      <span className="text-sm font-medium text-blue-800">Total Assigned Patients</span>
                    </div>
                    <p className="text-lg font-bold text-blue-900">{patientCount}</p>
                  </div>

                  {/* Patient Details List */}
                  {staff.assignedPatients && Array.isArray(staff.assignedPatients) && staff.assignedPatients.length > 0 ? (
                    <div className="space-y-2">
                      <h5 className="text-sm font-medium text-gray-700">Patient Details:</h5>
                      {loadingPatients ? (
                        <div className="bg-gray-50 rounded-lg p-3 text-center">
                          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600 mx-auto mb-2"></div>
                          <p className="text-xs text-gray-500">Loading patient details...</p>
                        </div>
                      ) : (
                        <div className="bg-gray-50 rounded-lg p-3 max-h-48 overflow-y-auto">
                          {staff.assignedPatients.map((assignment, index) => {
                            const patientInfo = patientDetails[assignment.patientId];
                            // Use the actual patient ID from patient info, or fall back to assignment ID
                            const displayPatientId = patientInfo?.patientId || assignment.patientId || `Patient ${index + 1}`;
                            
                            return (
                              <div key={index} className="flex items-center justify-between py-2 border-b border-gray-200 last:border-b-0">
                                <div className="flex items-center gap-3">
                                  <div className={`w-2 h-2 rounded-full ${
                                    assignment.priority === 'critical' ? 'bg-red-500' :
                                    assignment.priority === 'high' ? 'bg-orange-500' :
                                    assignment.priority === 'normal' ? 'bg-blue-500' : 'bg-gray-500'
                                  }`}></div>
                                  <div className="flex flex-col">
                                    <div className="flex items-center gap-2">
                                      <Shield className="w-3 h-3 text-blue-500" />
                                      <span className="text-sm font-medium text-blue-900">
                                        {displayPatientId}
                                      </span>
                                    </div>
                                    {patientInfo ? (
                                      <div className="text-xs text-gray-600 ml-5">
                                        <div className="font-medium">{patientInfo.name}</div>
                                        <div>Bed: {patientInfo.bedNumber}</div>
                                      </div>
                                    ) : (
                                      <div className="text-xs text-gray-500 ml-5">
                                        Patient details not available
                                      </div>
                                    )}
                                    {assignment.notes && (
                                      <div className="text-xs text-gray-500 ml-5 mt-1 italic">
                                        {assignment.notes}
                                      </div>
                                    )}
                                  </div>
                                </div>
                                <div className="flex items-center gap-2">
                                  <div className="flex flex-col items-end gap-1">
                                    {assignment.priority && (
                                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                                        assignment.priority === 'critical' ? 'bg-red-100 text-red-700' :
                                        assignment.priority === 'high' ? 'bg-orange-100 text-orange-700' :
                                        assignment.priority === 'normal' ? 'bg-blue-100 text-blue-700' : 'bg-gray-100 text-gray-700'
                                      }`}>
                                        {assignment.priority}
                                      </span>
                                    )}
                                    {assignment.assignedAt && (
                                      <div className="text-xs text-gray-500">
                                        {new Date(assignment.assignedAt).toLocaleDateString()}
                                      </div>
                                    )}
                                  </div>
                                  <button
                                    onClick={() => handleUnassignPatient(assignment.patientId)}
                                    className="p-1 text-red-500 hover:text-red-700 hover:bg-red-50 rounded transition-colors"
                                    title="Remove patient assignment"
                                  >
                                    <X className="w-3 h-3" />
                                  </button>
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      )}
                    </div>
                  ) : patientCount > 0 ? (
                    <div className="bg-gray-50 rounded-lg p-3 text-center">
                      <p className="text-sm text-gray-600">
                        {patientCount} patient{patientCount !== 1 ? 's' : ''} assigned
                      </p>
                      <p className="text-xs text-gray-500 mt-1">Details not available</p>
                    </div>
                  ) : (
                    <div className="bg-gray-50 rounded-lg p-3 text-center">
                      <p className="text-sm text-gray-600">No patients currently assigned</p>
                    </div>
                  )}
                </div>
              );
            })()}
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
const CalendarScheduleModal = ({ staff, selectedStaffId, onClose, onUpdateSchedule, setStaffSchedules }) => {
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
        toast(`⚠️ ${shift === 'off' ? 'Off duty' : shift + ' shift'} assigned locally but database update failed`, {
          icon: '⚠️',
          duration: 4000
        })
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
    // Handle both string shifts and object shifts
    const shiftValue = typeof shift === 'object' ? shift.shift || shift.type || 'unknown' : shift;
    const option = getShiftOptions().find(opt => opt.value === shiftValue)
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
                          {(() => {
                            // Handle both string shifts and object shifts
                            const shiftValue = typeof shift === 'object' ? shift.shift || shift.type || 'unknown' : shift;
                            return shiftValue === 'off' || shiftValue === 'time_off' ? 'Off' : 
                                   typeof shiftValue === 'string' ? shiftValue.charAt(0).toUpperCase() + shiftValue.slice(1) : 'N/A';
                          })()}
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
                      <div key={date}>
                        {new Date(date).toLocaleDateString()} - {
                          (() => {
                            // Handle both string shifts and object shifts
                            const shiftValue = typeof shift === 'object' ? shift.shift || shift.type || 'unknown' : shift;
                            return shiftValue === 'off' || shiftValue === 'time_off' ? 'Off' : 
                                   typeof shiftValue === 'string' ? shiftValue.charAt(0).toUpperCase() + shiftValue.slice(1) : 'N/A';
                          })()
                        }
                      </div>
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
                  onClick={async () => {
                    if (confirm('Are you sure you want to clear all scheduled shifts? This action cannot be undone.')) {
                      try {
                        // Clear schedule in database
                        await apiClient.clearStaffSchedule(selectedStaffId)
                        
                        // Clear local state and localStorage (both keys)
                        setSchedules({})
                        localStorage.removeItem(`schedule_${selectedStaffId}`)
                        localStorage.removeItem(`staff_schedule_${selectedStaffId}`)
                        
                        // Update the parent component's staffSchedules state
                        setStaffSchedules(prev => ({
                          ...prev,
                          [selectedStaffId]: {}
                        }))
                        
                        toast.success('📅 Schedule cleared successfully')
                      } catch (error) {
                        // Improved error logging
                        if (error.response) {
                          error.response.json().then(data => {
                            console.error('Failed to clear schedule:', data)
                            toast.error(`❌ Failed to clear schedule: ${data.error?.message || 'Unknown error'}`)
                          })
                        } else {
                          console.error('Failed to clear schedule:', error)
                          toast.error(`❌ Failed to clear schedule: ${error.message}`)
                        }
                      }
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
    const [selectedRole, setSelectedRole] = useState('all')
    const [selectedWeek, setSelectedWeek] = useState(0) // 0 = current week, 1 = next week
    // Remove duplicate staffSchedules state - use parent component's state instead

    // Helper function to get Colombo time as Date object (local to this component)
    const getColomboTimeAsDate = () => {
      // Get current UTC time and convert to Colombo timezone
      const now = new Date()
      // Colombo is UTC+5:30
      const utcTime = now.getTime() + (now.getTimezoneOffset() * 60000)
      const colomboTime = new Date(utcTime + (5.5 * 3600000)) // UTC+5:30
      return colomboTime
    }
  
  // Safety check for empty staff data
  if (!staff || staff.length === 0) {
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
        // Calculate which week this date belongs to - use Sunday as week start (consistent with getWeekDays)
        const sunday = new Date(date)
        sunday.setDate(date.getDate() - date.getDay()) // Get Sunday of this week
        const weekKey = sunday.toDateString()
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
  const daysOfWeek = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday']
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

  // Handler functions for export and print
  const handleExportSchedule = () => {
    try {
      // Prepare schedule data for export
      const scheduleData = {
        exportDate: new Date().toLocaleDateString(),
        weekRange: `${getWeekDays()[0].toLocaleDateString()} - ${getWeekDays()[6].toLocaleDateString()}`,
        staff: filteredStaff.map(staffMember => ({
          name: staffMember.name || `${staffMember.firstName} ${staffMember.lastName}`,
          role: staffMember.role,
          department: staffMember.department,
          schedule: getWeekDays().map(day => ({
            date: day.toLocaleDateString(),
            dayName: day.toLocaleDateString('en-US', { weekday: 'long' }),
            shift: getShiftForStaff(staffMember, day.toLocaleDateString('en-US', { weekday: 'long' }), day)?.name || 'Off',
            time: getShiftForStaff(staffMember, day.toLocaleDateString('en-US', { weekday: 'long' }), day)?.time || '-'
          }))
        }))
      }

      // Convert to CSV format
      const csvHeaders = ['Staff Name', 'Role', 'Department', ...getWeekDays().map(day => 
        day.toLocaleDateString('en-US', { weekday: 'short', month: 'numeric', day: 'numeric' })
      )]
      
      const csvRows = scheduleData.staff.map(staff => [
        staff.name,
        staff.role,
        staff.department,
        ...staff.schedule.map(day => `${day.shift} (${day.time})`)
      ])

      const csvContent = [
        csvHeaders.join(','),
        ...csvRows.map(row => row.join(','))
      ].join('\n')

      // Create and download file
      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
      const link = document.createElement('a')
      if (link.download !== undefined) {
        const url = URL.createObjectURL(blob)
        link.setAttribute('href', url)
        link.setAttribute('download', `ICU-Staff-Schedule-${new Date().toISOString().split('T')[0]}.csv`)
        link.style.visibility = 'hidden'
        document.body.appendChild(link)
        link.click()
        document.body.removeChild(link)
      }

      // Show success message
      toast.success('✅ Schedule exported successfully!')
    } catch (error) {
      console.error('Export failed:', error)
      toast.error('❌ Failed to export schedule')
    }
  }

  const handlePrintTimetable = () => {
    try {
      // Create printable content
      const printContent = `
        <html>
          <head>
            <title>ICU Staff Timetable</title>
            <style>
              body { font-family: Arial, sans-serif; margin: 20px; }
              .header { text-align: center; margin-bottom: 30px; }
              .week-info { text-align: center; margin-bottom: 20px; color: #666; }
              table { width: 100%; border-collapse: collapse; margin: 20px 0; }
              th, td { border: 1px solid #ddd; padding: 8px; text-align: left; }
              th { background-color: #f5f5f5; font-weight: bold; }
              .shift-morning { background-color: #e3f2fd; }
              .shift-afternoon { background-color: #e8f5e8; }
              .shift-night { background-color: #f3e5f5; }
              .shift-off { background-color: #f5f5f5; color: #999; }
              .role-badge { display: inline-block; padding: 2px 6px; border-radius: 3px; font-size: 11px; }
              .doctor { background-color: #e3f2fd; }
              .nurse { background-color: #e8f5e8; }
              @media print { .no-print { display: none; } }
            </style>
          </head>
          <body>
            <div class="header">
              <h1>ICU Staff Timetable</h1>
              <div class="week-info">
                Week: ${getWeekDays()[0].toLocaleDateString()} - ${getWeekDays()[6].toLocaleDateString()}<br>
                Generated: ${new Date().toLocaleDateString()} at ${new Date().toLocaleTimeString()}
              </div>
            </div>
            
            <table>
              <thead>
                <tr>
                  <th>Staff Member</th>
                  <th>Role</th>
                  ${getWeekDays().map(day => 
                    `<th>${day.toLocaleDateString('en-US', { weekday: 'short' })}<br>${day.toLocaleDateString('en-US', { month: 'numeric', day: 'numeric' })}</th>`
                  ).join('')}
                </tr>
              </thead>
              <tbody>
                ${filteredStaff.map(staffMember => {
                  const shifts = getWeekDays().map(day => {
                    const shift = getShiftForStaff(staffMember, day.toLocaleDateString('en-US', { weekday: 'long' }), day)
                    return shift ? `${shift.name}<br><small>${shift.time}</small>` : 'Off'
                  })
                  
                  return `
                    <tr>
                      <td><strong>${staffMember.name || `${staffMember.firstName} ${staffMember.lastName}`}</strong></td>
                      <td><span class="role-badge ${staffMember.role}">${staffMember.role}</span></td>
                      ${shifts.map(shift => `<td>${shift}</td>`).join('')}
                    </tr>
                  `
                }).join('')}
              </tbody>
            </table>
            
            <div style="margin-top: 30px; font-size: 12px; color: #666;">
              <p><strong>Shift Legend:</strong></p>
              <ul>
                <li>Morning: 7:00 AM - 3:00 PM</li>
                <li>Afternoon: 3:00 PM - 11:00 PM</li>
                <li>Night: 11:00 PM - 7:00 AM</li>
              </ul>
            </div>
          </body>
        </html>
      `

      // Open print window
      const printWindow = window.open('', '_blank')
      printWindow.document.write(printContent)
      printWindow.document.close()
      printWindow.focus()
      
      // Trigger print dialog
      setTimeout(() => {
        printWindow.print()
        printWindow.close()
      }, 250)

      toast.success('✅ Print dialog opened!')
    } catch (error) {
      console.error('Print failed:', error)
      toast.error('❌ Failed to open print dialog')
    }
  }

  // Get week days for current selected week
  const getWeekDays = () => {
    // Use Colombo time to ensure correct date calculations
    const colomboToday = getColomboTimeAsDate()
    
    // Create a new date object to avoid mutation
    const today = new Date(colomboToday)
    
    // Get the start of the current week (Sunday)
    const currentWeekStart = new Date(today)
    currentWeekStart.setDate(today.getDate() - today.getDay())
    
    // Calculate the selected week start
    const selectedWeekStart = new Date(currentWeekStart.getTime() + (selectedWeek * 7 * 24 * 60 * 60 * 1000))
    
    const days = []
    for (let i = 0; i < 7; i++) {
      const day = new Date(selectedWeekStart)
      day.setDate(selectedWeekStart.getDate() + i)
      days.push(day)
    }
    return days
  }

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
    
    // Try multiple date formats to match localStorage and API data
    const dateKey = date.toDateString() // "Mon Jan 01 2024"
    const isoDateKey = date.toISOString().split('T')[0] // "2024-01-01"
    
    console.log(`🔧 getShiftForStaff: ${staffMember.name} on ${day} (${dateKey})`)
    console.log(`🔧 Available schedule keys:`, Object.keys(staffSchedule))
    console.log(`🔧 Looking for dateKey: "${dateKey}" or ISO: "${isoDateKey}"`)
    console.log(`🔧 staffSchedule for ${staffMember._id}:`, staffSchedule)
    
    // Check for leave schedule first (from time off requests)
    if (staffMember.leaveSchedule) {
      if (staffMember.leaveSchedule[isoDateKey] || staffMember.leaveSchedule[dateKey]) {
        const leaveInfo = staffMember.leaveSchedule[isoDateKey] || staffMember.leaveSchedule[dateKey]
        console.log(`🔧 ✅ Found leave schedule: ${leaveInfo.type || 'leave'} for ${staffMember.name} on ${isoDateKey}`)
        
        return {
          name: `${(leaveInfo.type || 'leave').charAt(0).toUpperCase() + (leaveInfo.type || 'leave').slice(1)} Leave`,
          time: 'Off Duty',
          color: 'bg-orange-100 text-orange-800'
        }
      }
    }
    
    // Try to find schedule data with multiple date formats
    let shiftType = staffSchedule[dateKey] || staffSchedule[isoDateKey]
    
    // Also check if there's schedule data in other formats
    if (!shiftType) {
      // Try to find by matching any date format
      for (const key of Object.keys(staffSchedule)) {
        try {
          const keyDate = new Date(key)
          if (keyDate.toDateString() === dateKey || keyDate.toISOString().split('T')[0] === isoDateKey) {
            shiftType = staffSchedule[key]
            console.log(`🔧 ✅ Found shift via alternate format: ${shiftType} for ${staffMember.name}`)
            break
          }
        } catch (e) {
          // Skip invalid date keys
          continue
        }
      }
    }
    
    if (shiftType) {
      console.log(`🔧 ✅ Found scheduled shift: ${shiftType} for ${staffMember.name} on ${dateKey}`)
      
      // Handle leave shifts specially
      if (typeof shiftType === 'object' && (shiftType.shift === 'leave' || shiftType.shift === 'time_off' || shiftType.type)) {
        if (shiftType.shift === 'time_off') {
          // Handle time off with type information
          const timeOffTypeDisplay = {
            'vacation': 'Vacation',
            'sick': 'Sick Leave', 
            'personal': 'Personal Leave',
            'emergency': 'Emergency Leave',
            'maternity': 'Maternity/Paternity Leave',
            'training': 'Training/Conference'
          };
          
          return {
            name: 'Time Off',
            time: timeOffTypeDisplay[shiftType.type] || 'Time Off Type',
            color: 'bg-pink-100 text-pink-800'
          }
        } else {
          // Handle regular leave
          const shiftName = shiftType.type || 'leave';
          const displayName = shiftName.charAt(0).toUpperCase() + shiftName.slice(1) + ' Leave';
          
          return {
            name: displayName,
            time: 'Off Duty',
            color: 'bg-orange-100 text-orange-800'
          }
        }
      }
      
      // Handle string shift types
      if (typeof shiftType === 'string') {
        // Handle leave as string
        if (shiftType === 'leave' || shiftType.includes('leave')) {
          return {
            name: 'Leave',
            time: 'Off Duty',
            color: 'bg-orange-100 text-orange-800'
          }
        }
        
        // Handle time_off as string
        if (shiftType === 'time_off' || shiftType.includes('time_off')) {
          return {
            name: 'Time Off',
            time: 'Time Off Type',
            color: 'bg-pink-100 text-pink-800'
          }
        }
        
        // Map shift types to display information based on role
        const shifts = shiftSchedules[staffMember.role] || shiftSchedules.default
        
        // Find matching shift by type
        let matchingShift = null
        switch (shiftType.toLowerCase()) {
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
          case 'time_off':
            console.log(`🔧 Staff ${staffMember.name} has time off on ${dateKey}`)
            return {
              name: 'Time Off',
              time: 'Time Off Type',
              color: 'bg-pink-100 text-pink-800'
            }
          case 'absent':
            return {
              name: 'Absent',
              time: 'Unexcused',
              color: 'bg-red-100 text-red-800'
            }
          default:
            matchingShift = shifts[0] // Default to first shift
        }
        
        console.log(`🔧 Returning scheduled shift:`, matchingShift)
        return matchingShift || shifts[0]
      }
    } else {
      console.log(`🔧 ❌ No schedule found for ${staffMember.name} on ${dateKey}`)
      console.log(`🔧 Available dates for this staff:`, Object.keys(staffSchedule))
    }
    
    // Only for TODAY: use staff member's current shift if no scheduled data exists
    const today = new Date()
    if (date.toDateString() === today.toDateString() && staffMember.currentShift && staffMember.currentShift !== 'off') {
      console.log(`🔧 Using current shift for ${staffMember.name} TODAY ONLY: ${staffMember.currentShift}`)
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
  const currentDate = getColomboTimeAsDate() // Use Colombo time consistently
  const startOfWeek = new Date(currentDate)
  startOfWeek.setDate(currentDate.getDate() - currentDate.getDay() + weekOffset) // Start from Sunday (consistent with getWeekDays)

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
                {(() => {
                  // Calculate actual day shift coverage for the selected week
                  const dayShifts = filteredStaff.reduce((count, staff) => {
                    const schedule = staffSchedules[staff._id] || {}
                    const weekDays = getWeekDays()
                    return count + weekDays.filter(day => {
                      const shift = schedule[day.toDateString()]
                      return shift === 'morning' || shift === 'afternoon'
                    }).length
                  }, 0)
                  const requiredDayShifts = filteredStaff.length * 7 * 0.7 // 70% day coverage target
                  return `${dayShifts} / ${Math.ceil(requiredDayShifts)}`
                })()}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-blue-700">Night Shifts:</span>
              <span className="font-medium text-blue-900">
                {(() => {
                  // Calculate actual night shift coverage for the selected week
                  const nightShifts = filteredStaff.reduce((count, staff) => {
                    const schedule = staffSchedules[staff._id] || {}
                    const weekDays = getWeekDays()
                    return count + weekDays.filter(day => {
                      const shift = schedule[day.toDateString()]
                      return shift === 'night'
                    }).length
                  }, 0)
                  const requiredNightShifts = filteredStaff.length * 7 * 0.3 // 30% night coverage target
                  return `${nightShifts} / ${Math.ceil(requiredNightShifts)}`
                })()}
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
                {(() => {
                  // Calculate average shifts per day across all staff
                  const totalShifts = Object.values(staffSchedules).reduce((total, schedule) => {
                    return total + Object.keys(schedule).length
                  }, 0)
                  const avgPerDay = totalShifts / 7
                  return `${Math.round(avgPerDay * 10) / 10} per day`
                })()}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-green-700">Efficiency:</span>
              <span className="font-medium text-green-900">
                {(() => {
                  // Calculate efficiency based on actual vs optimal coverage
                  const totalPossibleShifts = filteredStaff.length * 7
                  const actualShifts = Object.values(staffSchedules).reduce((total, schedule) => {
                    return total + Object.keys(schedule).length
                  }, 0)
                  const efficiency = totalPossibleShifts > 0 ? Math.round((actualShifts / totalPossibleShifts) * 100) : 0
                  return `${efficiency}%`
                })()}
              </span>
            </div>
          </div>
        </div>

        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
          <h4 className="font-medium text-yellow-900 mb-2">Quick Actions</h4>
          <div className="space-y-2">
            <button 
              onClick={handleExportSchedule}
              className="w-full px-3 py-1 bg-yellow-200 text-yellow-800 rounded text-sm hover:bg-yellow-300 transition-colors flex items-center justify-center gap-1"
            >
              <Download className="w-3 h-3" />
              Export Schedule
            </button>
            <button 
              onClick={handlePrintTimetable}
              className="w-full px-3 py-1 bg-yellow-200 text-yellow-800 rounded text-sm hover:bg-yellow-300 transition-colors flex items-center justify-center gap-1"
            >
              <Printer className="w-3 h-3" />
              Print Timetable
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

// Assign Patient Modal Component
const AssignPatientModal = ({ staff, onClose, onStaffUpdate }) => {
  const [selectedStaff, setSelectedStaff] = useState('')
  const [selectedPatientId, setSelectedPatientId] = useState('')
  const [patientName, setPatientName] = useState('')
  const [bedNumber, setBedNumber] = useState('')
  const [priority, setPriority] = useState('normal')
  const [notes, setNotes] = useState('')
  const [patients, setPatients] = useState([])
  const [isLoadingPatients, setIsLoadingPatients] = useState(true)
  const [isSubmitting, setIsSubmitting] = useState(false)

  // Dynamically filter available staff based on current duty status and patient load
  const availableStaff = staff.filter(member => 
    member.isOnDuty && (member.assignedPatientsCount || member.assignedPatients?.length || 0) < 5
  )

  // Filter out discharged patients
  const availablePatients = patients.filter(patient => 
    patient.status !== 'discharged'
  )

  // Reset selected staff if they become unavailable due to shift changes
  useEffect(() => {
    if (selectedStaff && !availableStaff.find(member => member._id === selectedStaff)) {
      console.log('🔄 Selected staff member is no longer available, resetting selection')
      setSelectedStaff('')
      toast('Selected staff member is no longer available. Please select another staff member.', {
        icon: 'ℹ️',
        duration: 4000
      })
    }
  }, [selectedStaff, availableStaff])

  // Load patients when modal opens
  useEffect(() => {
    const loadPatients = async () => {
      try {
        setIsLoadingPatients(true)
        // Try to load from API first
        const apiData = await apiClient.getPatients()
        setPatients(apiData)
        console.log(`✅ Loaded ${apiData.length} patients from database`)
      } catch (apiError) {
        console.log('Patient API failed, using mock data:', apiError)
        // Fallback to mock data when database is not connected
        const mockData = apiClient.getMockPatients()
        setPatients(mockData)
        console.log(`📝 Using ${mockData.length} mock patients`)
      } finally {
        setIsLoadingPatients(false)
      }
    }
    
    loadPatients()
  }, [])

  // Handle patient selection and auto-populate fields
  const handlePatientSelection = (patientId) => {
    setSelectedPatientId(patientId)
    
    if (patientId) {
      const selectedPatient = availablePatients.find(p => p._id === patientId)
      if (selectedPatient) {
        setPatientName(selectedPatient.name)
        setBedNumber(selectedPatient.bedNumber || 'Not assigned')
      }
    } else {
      setPatientName('')
      setBedNumber('')
    }
  }

  const handleAssign = async () => {
    if (!selectedStaff || !selectedPatientId) {
      toast.error('Please select both a staff member and a patient')
      return
    }

    setIsSubmitting(true)
    try {
      const staffMember = staff.find(s => s._id === selectedStaff)
      const selectedPatient = availablePatients.find(p => p._id === selectedPatientId)
      
      // Prepare assignment data
      const assignmentData = {
        priority,
        notes,
        assignedAt: new Date().toISOString()
      }

      // Try to assign via API
      try {
        await apiClient.assignPatientToStaff(selectedStaff, selectedPatientId, assignmentData)
        
        // Update staff member's patient count in local state
        onStaffUpdate(prevStaff => 
          prevStaff.map(member => 
            member._id === selectedStaff 
              ? { 
                  ...member, 
                  assignedPatientsCount: (member.assignedPatientsCount || 0) + 1
                }
              : member
          )
        )
        
        toast.success(`✅ Patient "${patientName}" assigned to ${staffMember?.name}`)
      } catch (apiError) {
        console.error('Patient assignment API failed:', apiError)
        toast.error('❌ Failed to assign patient to staff member')
        return
      }
      
      console.log('Patient assignment:', { 
        staffId: selectedStaff, 
        staffName: staffMember?.name,
        patientId: selectedPatientId, 
        patientName, 
        bedNumber,
        priority, 
        notes 
      })
      
      onClose()
    } catch (error) {
      console.error('Error assigning patient:', error)
      toast.error('❌ Failed to assign patient')
    } finally {
      setIsSubmitting(false)
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
      <div className="bg-white rounded-lg p-6 w-full max-w-md max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h2 className="text-xl font-bold text-gray-900">Assign Patient to Staff</h2>
            <div className="flex items-center gap-4 mt-2 text-sm text-gray-600">
              <div className="flex items-center gap-1">
                <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                <span>{availableStaff.length} staff on duty</span>
              </div>
              <div className="flex items-center gap-1">
                <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                <span>{availablePatients.length} patients available</span>
              </div>
            </div>
          </div>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
            <X className="w-6 h-6" />
          </button>
        </div>

        <div className="space-y-4">
          {/* Patient Selection Dropdown */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Select Patient *</label>
            {isLoadingPatients ? (
              <div className="w-full p-3 border border-gray-300 rounded-lg bg-gray-50 flex items-center gap-2">
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600"></div>
                <span className="text-sm text-gray-600">Loading patients...</span>
              </div>
            ) : (
              <select
                value={selectedPatientId}
                onChange={(e) => handlePatientSelection(e.target.value)}
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="">Select a patient</option>
                {availablePatients.map(patient => (
                  <option key={patient._id} value={patient._id}>
                    {patient.patientId} - {patient.name} ({patient.status})
                  </option>
                ))}
              </select>
            )}
            {availablePatients.length === 0 && !isLoadingPatients && (
              <p className="text-sm text-red-600 mt-1">No patients available for assignment (all patients may be discharged)</p>
            )}
          </div>

          {/* Auto-populated Patient Name */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Patient Name</label>
            <input
              type="text"
              value={patientName}
              readOnly
              className="w-full p-3 border border-gray-300 rounded-lg bg-gray-50 text-gray-700"
              placeholder="Will be filled automatically when patient is selected"
            />
          </div>

          {/* Auto-populated Bed Number */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Bed Number</label>
            <input
              type="text"
              value={bedNumber}
              readOnly
              className="w-full p-3 border border-gray-300 rounded-lg bg-gray-50 text-gray-700"
              placeholder="Will be filled automatically when patient is selected"
            />
          </div>

          {/* Staff Selection */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Assign to Staff * 
              <span className="text-xs text-gray-500 ml-1">
                ({availableStaff.length} on duty)
              </span>
            </label>
            <select
              value={selectedStaff}
              onChange={(e) => setSelectedStaff(e.target.value)}
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="">Select available staff member</option>
              {availableStaff.map(member => {
                const patientCount = member.assignedPatientsCount || member.assignedPatients?.length || 0;
                const shiftDisplay = member.currentShift && member.currentShift !== 'off' 
                  ? ` - ${member.currentShift} shift` 
                  : '';
                return (
                  <option key={member._id} value={member._id}>
                    {member.name} ({member.role}) - {patientCount} patients{shiftDisplay}
                  </option>
                );
              })}
            </select>
            {availableStaff.length === 0 && (
              <div className="mt-2 p-3 bg-orange-50 border border-orange-200 rounded-lg">
                <p className="text-sm text-orange-800 font-medium">No staff members available for assignment</p>
                <p className="text-xs text-orange-600 mt-1">
                  Staff members need to be on duty and have less than 5 assigned patients
                </p>
              </div>
            )}
            {availableStaff.length > 0 && (
              <div className="mt-2 text-xs text-gray-600">
                <div className="flex items-center gap-1">
                  <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                  <span>Available staff will update automatically when shifts change</span>
                </div>
              </div>
            )}
          </div>

          {/* Priority Level */}
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

          {/* Notes */}
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
            disabled={!selectedStaff || !selectedPatientId || availableStaff.length === 0 || availablePatients.length === 0 || isSubmitting}
            className="flex-1 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors flex items-center justify-center gap-2"
          >
            {isSubmitting ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                Assigning...
              </>
            ) : (
              'Assign Patient'
            )}
          </button>
        </div>
      </div>
    </div>
  )
}

// Time Off Modal Component
const TimeOffModal = ({ staff, onClose, setStaffSchedules }) => {
  const [selectedStaff, setSelectedStaff] = useState('')
  const [startDate, setStartDate] = useState('')
  const [endDate, setEndDate] = useState('')
  const [reason, setReason] = useState('')
  const [type, setType] = useState('vacation')

  const handleSubmit = async () => {
    if (!selectedStaff || !startDate || !endDate || !reason) {
      toast.error('Please fill in all required fields')
      return
    }

    try {
      const staffMember = staff.find(s => s._id === selectedStaff)
      
      // Call the actual API
      const response = await apiClient.requestTimeOff(selectedStaff, {
        startDate,
        endDate,
        type,
        reason
      })
      
      console.log('✅ Time off request successful:', response)
      
      // Update the parent staffSchedules state to reflect the change immediately
      setStaffSchedules(prev => ({
        ...prev,
        [selectedStaff]: response.schedules || {}
      }))
      
      toast.success(`✅ Time off request submitted successfully for ${staffMember?.name}`)
      onClose()
    } catch (error) {
      console.error('❌ Failed to submit time off request:', error)
      toast.error('❌ Failed to submit time off request. Please try again.')
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

