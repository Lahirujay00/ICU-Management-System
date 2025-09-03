const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api'

class ApiClient {
  constructor() {
    this.baseURL = API_BASE_URL
  }

  async request(endpoint, options = {}) {
    const url = `${this.baseURL}${endpoint}`
    const config = {
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
      ...options,
    }

    // Add auth token if available
    if (typeof window !== 'undefined') {
      const token = localStorage.getItem('authToken')
      if (token) {
        config.headers.Authorization = `Bearer ${token}`
      }
    }

    try {
      const response = await fetch(url, config)
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}))
        throw new Error(errorData.error?.message || `HTTP error! status: ${response.status}`)
      }

      return await response.json()
    } catch (error) {
      console.error('API request failed:', error)
      throw error
    }
  }

  // Auth endpoints
  async login(credentials) {
    return this.request('/auth/login', {
      method: 'POST',
      body: JSON.stringify(credentials),
    })
  }

  async register(userData) {
    return this.request('/auth/register', {
      method: 'POST',
      body: JSON.stringify(userData),
    })
  }

  async getProfile() {
    return this.request('/auth/profile')
  }

  // Generic methods
  async get(endpoint) {
    return this.request(endpoint)
  }

  async post(endpoint, data) {
    return this.request(endpoint, {
      method: 'POST',
      body: JSON.stringify(data),
    })
  }

  async put(endpoint, data) {
    return this.request(endpoint, {
      method: 'PUT',
      body: JSON.stringify(data),
    })
  }

  async delete(endpoint) {
    return this.request(endpoint, {
      method: 'DELETE',
    })
  }

  // Patient endpoints
  async getPatients() {
    return this.get('/patients')
  }

  async getPatient(id) {
    return this.request(`/patients/${id}`)
  }

  async createPatient(patientData) {
    return this.post('/patients', patientData)
  }

  async updatePatient(id, patientData) {
    return this.put(`/patients/${id}`, patientData)
  }

  async deletePatient(id) {
    return this.delete(`/patients/${id}`)
  }

  // Staff endpoints
  async getStaff() {
    return this.request('/staff')
  }

  async getStaffMember(id) {
    return this.request(`/staff/${id}`)
  }

  async createStaff(staffData) {
    console.log('🔧 API: Creating staff with data:', staffData)
    try {
      const result = await this.request('/staff', {
        method: 'POST',
        body: JSON.stringify(staffData),
      })
      console.log('✅ API: Staff created successfully:', result)
      return result
    } catch (error) {
      console.error('❌ API: Failed to create staff:', error)
      console.error('Request URL:', `${this.baseURL}/staff`)
      console.error('Request data:', staffData)
      throw error
    }
  }

  async updateStaff(id, staffData) {
    return this.request(`/staff/${id}`, {
      method: 'PUT',
      body: JSON.stringify(staffData),
    })
  }

  async updateStaffStatus(id, statusData) {
    console.log('🔧 API: Updating staff status for ID:', id, 'with data:', statusData);
    return this.request(`/staff/${id}/status`, {
      method: 'PUT',
      body: JSON.stringify(statusData),
    })
  }

  async getStaffSchedule(id) {
    return this.request(`/staff/${id}/schedule`)
  }

  async assignPatientToStaff(staffId, patientId, assignmentData = {}) {
    console.log('🔧 API: Assigning patient to staff:', { staffId, patientId, assignmentData })
    return this.request(`/staff/${staffId}/assign-patient`, {
      method: 'POST',
      body: JSON.stringify({
        patientId,
        ...assignmentData
      }),
    })
  }

  async unassignPatientFromStaff(staffId, patientId) {
    console.log('🔧 API: Unassigning patient from staff:', { staffId, patientId })
    return this.request(`/staff/${staffId}/unassign-patient`, {
      method: 'POST',
      body: JSON.stringify({ patientId }),
    })
  }

  async updateStaffSchedule(id, scheduleData) {
    return this.request(`/staff/${id}/schedule`, {
      method: 'POST',
      body: JSON.stringify(scheduleData),
    })
  }

  async clearStaffSchedule(id) {
    return this.request(`/staff/${id}/schedule`, {
      method: 'POST',
      body: JSON.stringify({}), // Send empty object to clear all schedules
    })
  }

  async requestTimeOff(staffId, timeOffData) {
    console.log('🔧 API: Requesting time off for staff:', staffId, 'with data:', timeOffData)
    return this.request(`/staff/${staffId}/time-off`, {
      method: 'POST',
      body: JSON.stringify(timeOffData),
    })
  }

  // Equipment endpoints
  async getEquipment() {
    return this.request('/equipment')
  }

  async getEquipmentItem(id) {
    return this.request(`/equipment/${id}`)
  }

  async createEquipment(equipmentData) {
    return this.request('/equipment', {
      method: 'POST',
      body: JSON.stringify(equipmentData),
    })
  }

  async updateEquipment(id, equipmentData) {
    return this.request(`/equipment/${id}`, {
      method: 'PUT',
      body: JSON.stringify(equipmentData),
    })
  }

  async updateEquipmentStatus(id, status) {
    return this.request(`/equipment/${id}/status`, {
      method: 'PUT',
      body: JSON.stringify({ status }),
    })
  }

  async assignEquipment(id) {
    return this.request(`/equipment/${id}/assign`, {
      method: 'POST',
    })
  }

  async unassignEquipment(id) {
    return this.request(`/equipment/${id}/unassign`, {
      method: 'POST',
    })
  }

  // Analytics endpoints
  async getAnalytics() {
    return this.request('/analytics')
  }

  // Bed endpoints
  async getBeds() {
    return this.request('/beds')
  }

  async getBed(id) {
    return this.request(`/beds/${id}`)
  }

  async createBed(bedData) {
    return this.request('/beds', {
      method: 'POST',
      body: JSON.stringify(bedData),
    })
  }

  async updateBed(id, bedData) {
    return this.request(`/beds/${id}`, {
      method: 'PUT',
      body: JSON.stringify(bedData),
    })
  }

  async assignPatientToBed(bedId, patientId) {
    return this.request(`/beds/${bedId}/assign`, {
      method: 'POST',
      body: JSON.stringify({ patientId }),
    })
  }

  async dischargePatientFromBed(bedId) {
    return this.request(`/beds/${bedId}/discharge`, {
      method: 'POST',
    })
  }

  async updateBedStatus(bedId, status) {
    return this.request(`/beds/${bedId}/status`, {
      method: 'PUT',
      body: JSON.stringify({ status }),
    })
  }

  // Dashboard endpoints
  async getDashboardOverview() {
    return this.request('/dashboard/overview')
  }

  async getDashboardStats() {
    return this.request('/dashboard/stats')
  }

  async getDashboardAlerts() {
    return this.request('/dashboard/alerts')
  }

  // Mock data for development
  getMockPatients() {
    return [
      {
        _id: '1',
        name: 'John Smith',
        patientId: 'P001',
        age: 65,
        gender: 'male',
        diagnosis: 'Acute respiratory distress syndrome',
        bedNumber: '101',
        status: 'critical',
        admissionDate: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
        attendingPhysician: 'Dr. Michael Chen',
        vitalSigns: {
          heartRate: 120,
          bloodPressure: 160,
          oxygenSaturation: 88
        },
        allergies: ['Penicillin'],
        medicalHistory: ['Hypertension', 'Diabetes'],
        medications: ['Insulin', 'Metformin']
      },
      {
        _id: '2',
        name: 'Sarah Johnson',
        patientId: 'P002',
        age: 42,
        gender: 'female',
        diagnosis: 'Post-operative monitoring',
        bedNumber: '102',
        status: 'stable',
        admissionDate: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
        attendingPhysician: 'Dr. Sarah Williams',
        vitalSigns: {
          heartRate: 78,
          bloodPressure: 120,
          oxygenSaturation: 98
        },
        allergies: [],
        medicalHistory: ['Appendectomy'],
        medications: ['Acetaminophen']
      },
      {
        _id: '3',
        name: 'Mike Wilson',
        patientId: 'P003',
        age: 58,
        gender: 'male',
        diagnosis: 'Cardiac monitoring post-MI',
        bedNumber: '103',
        status: 'observation',
        admissionDate: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
        attendingPhysician: 'Dr. Emily Rodriguez',
        vitalSigns: {
          heartRate: 72,
          bloodPressure: 130,
          oxygenSaturation: 96
        },
        allergies: ['Sulfa drugs'],
        medicalHistory: ['Myocardial Infarction', 'Hypertension'],
        medications: ['Aspirin', 'Metoprolol']
      },
      {
        _id: '4',
        name: 'Robert Brown',
        patientId: 'P004',
        age: 73,
        gender: 'male',
        diagnosis: 'Recovery complete',
        bedNumber: '104',
        status: 'discharged',
        admissionDate: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
        dischargeDate: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
        attendingPhysician: 'Dr. Michael Chen',
        vitalSigns: {
          heartRate: 75,
          bloodPressure: 125,
          oxygenSaturation: 97
        },
        allergies: [],
        medicalHistory: ['Hip replacement'],
        medications: []
      },
      {
        _id: '5',
        name: 'Lisa Martinez',
        patientId: 'P005',
        age: 35,
        gender: 'female',
        diagnosis: 'Pneumonia treatment completed',
        bedNumber: '105',
        status: 'discharged',
        admissionDate: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
        dischargeDate: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
        attendingPhysician: 'Dr. Sarah Williams',
        vitalSigns: {
          heartRate: 70,
          bloodPressure: 115,
          oxygenSaturation: 99
        },
        allergies: ['Latex'],
        medicalHistory: ['Pneumonia'],
        medications: []
      }
    ]
  }

  getMockStaff() {
    return [
      {
        _id: '1',
        name: 'Dr. Michael Chen',
        firstName: 'Michael',
        lastName: 'Chen',
        employeeId: 'DOC001',
        email: 'michael.chen@icucare.com',
        phone: '+1-555-0101',
        role: 'doctor',
        department: 'ICU',
        specialization: 'Critical Care Medicine',
        licenseNumber: 'MD123456',
        isOnDuty: true,
        currentShift: 'morning',
        shift: 'Day',
        status: 'active',
        assignedPatients: [
          { patientId: 'P001', priority: 'critical', notes: 'Requires close monitoring', assignedAt: new Date().toISOString() },
          { patientId: 'P002', priority: 'normal', notes: 'Post-op care', assignedAt: new Date().toISOString() },
          { patientId: 'P003', priority: 'high', notes: 'Cardiac monitoring', assignedAt: new Date().toISOString() }
        ],
        assignedPatientsCount: 3,
        performanceRating: 4.8,
        hireDate: '2020-03-15',
        yearsOfService: 4,
        certifications: ['Board Certified - Critical Care', 'ACLS', 'BLS']
      },
      {
        _id: '2',
        name: 'Emily Rodriguez',
        firstName: 'Emily',
        lastName: 'Rodriguez',
        employeeId: 'NUR001',
        email: 'emily.rodriguez@icucare.com',
        phone: '+1-555-0102',
        role: 'nurse',
        department: 'ICU',
        specialization: 'ICU Nursing',
        licenseNumber: 'RN789012',
        isOnDuty: true,
        currentShift: 'morning',
        shift: 'Day',
        status: 'active',
        assignedPatients: [
          { patientId: 'P002', priority: 'normal', notes: 'Post-operative monitoring', assignedAt: new Date().toISOString() },
          { patientId: 'P003', priority: 'high', notes: 'Cardiac monitoring support', assignedAt: new Date().toISOString() }
        ],
        assignedPatientsCount: 2,
        performanceRating: 4.9,
        hireDate: '2019-07-22',
        yearsOfService: 5,
        certifications: ['CCRN', 'ACLS', 'BLS', 'PALS']
      },
      {
        _id: '3',
        name: 'Dr. Sarah Williams',
        firstName: 'Sarah',
        lastName: 'Williams',
        employeeId: 'DOC002',
        email: 'sarah.williams@icucare.com',
        phone: '+1-555-0103',
        role: 'doctor',
        department: 'ICU',
        specialization: 'Emergency Medicine',
        licenseNumber: 'MD345678',
        isOnDuty: false,
        currentShift: 'off',
        shift: 'Night',
        status: 'active',
        assignedPatients: 0,
        performanceRating: 4.7,
        hireDate: '2018-11-08',
        yearsOfService: 6,
        certifications: ['Board Certified - Emergency Medicine', 'ATLS', 'ACLS', 'BLS']
      },
      {
        _id: '4',
        name: 'James Martinez',
        firstName: 'James',
        lastName: 'Martinez',
        employeeId: 'NUR002',
        email: 'james.martinez@icucare.com',
        phone: '+1-555-0104',
        role: 'nurse',
        department: 'ICU',
        specialization: 'Critical Care Nursing',
        licenseNumber: 'RN456789',
        isOnDuty: true,
        currentShift: 'afternoon',
        shift: 'Evening',
        status: 'active',
        assignedPatients: 3,
        performanceRating: 4.6,
        hireDate: '2021-02-14',
        yearsOfService: 3,
        certifications: ['CCRN', 'ACLS', 'BLS']
      },
      {
        _id: '5',
        name: 'Dr. Lisa Thompson',
        firstName: 'Lisa',
        lastName: 'Thompson',
        employeeId: 'DOC003',
        email: 'lisa.thompson@icucare.com',
        phone: '+1-555-0105',
        role: 'doctor',
        department: 'ICU',
        specialization: 'Pulmonary Critical Care',
        licenseNumber: 'MD567890',
        isOnDuty: false,
        currentShift: 'night',
        shift: 'Night',
        status: 'on_leave',
        assignedPatients: 0,
        performanceRating: 4.9,
        hireDate: '2017-05-12',
        yearsOfService: 7,
        certifications: ['Board Certified - Pulmonary Medicine', 'Board Certified - Critical Care', 'ACLS', 'BLS']
      },
      {
        _id: '6',
        name: 'Robert Wilson',
        firstName: 'Robert',
        lastName: 'Wilson',
        employeeId: 'RT001',
        email: 'robert.wilson@icucare.com',
        phone: '+1-555-0106',
        role: 'respiratory_therapist',
        department: 'ICU',
        specialization: 'Respiratory Therapy',
        licenseNumber: 'RT123456',
        isOnDuty: true,
        currentShift: 'morning',
        shift: 'Day',
        status: 'active',
        assignedPatients: 6,
        performanceRating: 4.5,
        hireDate: '2022-01-10',
        yearsOfService: 2,
        certifications: ['RRT', 'ACLS', 'BLS', 'PALS']
      }
    ]
  }

  getMockEquipment() {
    return [
      {
        _id: '1',
        name: 'Mechanical Ventilator',
        model: 'Hamilton C3',
        category: 'respiratory',
        status: 'in_use',
        quantity: 8,
        maxQuantity: 10,
        minQuantity: 2,
        location: 'ICU Ward A',
        lastMaintenance: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(),
        nextMaintenance: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000).toISOString(),
        batteryLevel: 92
      },
      {
        _id: '2',
        name: 'Patient Monitor',
        model: 'Philips IntelliVue MX40',
        category: 'monitoring',
        status: 'available',
        quantity: 15,
        maxQuantity: 20,
        minQuantity: 5,
        location: 'ICU Ward B',
        batteryLevel: 85,
        lastMaintenance: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000).toISOString(),
        nextMaintenance: new Date(Date.now() + 15 * 24 * 60 * 60 * 1000).toISOString()
      },
      {
        _id: '3',
        name: 'Infusion Pump',
        model: 'B.Braun Perfusor Space',
        category: 'surgical',
        status: 'available',
        quantity: 25,
        maxQuantity: 30,
        minQuantity: 10,
        location: 'ICU Ward A',
        batteryLevel: 78,
        lastMaintenance: new Date(Date.now() - 45 * 24 * 60 * 60 * 1000).toISOString(),
        nextMaintenance: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString()
      },
      {
        _id: '4',
        name: 'Defibrillator',
        model: 'ZOLL R Series',
        category: 'cardiac',
        status: 'maintenance',
        quantity: 3,
        maxQuantity: 5,
        minQuantity: 2,
        location: 'Emergency Room',
        batteryLevel: 45,
        lastMaintenance: new Date(Date.now() - 60 * 24 * 60 * 60 * 1000).toISOString(),
        nextMaintenance: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString()
      },
      {
        _id: '5',
        name: 'Ultrasound Machine',
        model: 'GE Vivid E90',
        category: 'diagnostic',
        status: 'in_use',
        quantity: 2,
        maxQuantity: 3,
        minQuantity: 1,
        location: 'ICU Ward C',
        batteryLevel: 67,
        lastMaintenance: new Date(Date.now() - 20 * 24 * 60 * 60 * 1000).toISOString(),
        nextMaintenance: new Date(Date.now() + 40 * 24 * 60 * 60 * 1000).toISOString()
      },
      {
        _id: '6',
        name: 'ECMO Machine',
        model: 'Maquet Cardiohelp',
        category: 'cardiac',
        status: 'available',
        quantity: 1,
        maxQuantity: 2,
        minQuantity: 1,
        location: 'ICU Ward A',
        lastMaintenance: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000).toISOString(),
        nextMaintenance: new Date(Date.now() + 20 * 24 * 60 * 60 * 1000).toISOString()
      },
      {
        _id: '7',
        name: 'Blood Gas Analyzer',
        model: 'Abbott i-STAT Alinity',
        category: 'diagnostic',
        status: 'out_of_order',
        quantity: 4,
        maxQuantity: 6,
        minQuantity: 2,
        location: 'Central Lab',
        batteryLevel: 23,
        lastMaintenance: new Date(Date.now() - 90 * 24 * 60 * 60 * 1000).toISOString(),
        nextMaintenance: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000).toISOString()
      },
      {
        _id: '8',
        name: 'IV Fluid Warmer',
        model: 'Smiths Medical Level 1',
        category: 'other',
        status: 'available',
        quantity: 6,
        maxQuantity: 8,
        minQuantity: 3,
        location: 'ICU Ward B',
        batteryLevel: 88,
        lastMaintenance: new Date(Date.now() - 25 * 24 * 60 * 60 * 1000).toISOString(),
        nextMaintenance: new Date(Date.now() + 35 * 24 * 60 * 60 * 1000).toISOString()
      }
    ]
  }

  getMockBeds() {
    return [
      {
        _id: '1',
        number: '101',
        status: 'occupied',
        roomNumber: '101',
        floor: '1',
        patient: {
          name: 'John Smith',
          admissionDate: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
          status: 'critical'
        },
        updatedAt: new Date().toISOString()
      },
      {
        _id: '2',
        number: '102',
        status: 'occupied',
        roomNumber: '102',
        floor: '1',
        patient: {
          name: 'Sarah Johnson',
          admissionDate: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
          status: 'stable'
        },
        updatedAt: new Date().toISOString()
      },
      {
        _id: '3',
        number: '103',
        status: 'available',
        roomNumber: '103',
        floor: '1',
        updatedAt: new Date().toISOString()
      }
    ]
  }

  // Discharge History endpoints
  async getDischargeHistory() {
    return this.request('/discharge-history')
  }

  async deleteDischargeRecord(id) {
    return this.delete(`/discharge-history/${id}`)
  }
}

export const apiClient = new ApiClient()
export default apiClient
