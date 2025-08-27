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
    return this.request('/staff', {
      method: 'POST',
      body: JSON.stringify(staffData),
    })
  }

  async updateStaff(id, staffData) {
    return this.request(`/staff/${id}`, {
      method: 'PUT',
      body: JSON.stringify(staffData),
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
        status: 'improving',
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
        assignedPatients: 3,
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
        assignedPatients: 4,
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
        name: 'Ventilator',
        category: 'Respiratory',
        status: 'in_use',
        quantity: 8,
        maxQuantity: 10,
        minQuantity: 2,
        location: 'ICU Ward A',
        lastMaintenance: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(),
        nextMaintenance: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000).toISOString()
      },
      {
        _id: '2',
        name: 'Patient Monitor',
        category: 'Monitoring',
        status: 'available',
        quantity: 15,
        maxQuantity: 20,
        minQuantity: 5,
        location: 'ICU Ward B',
        batteryLevel: 85
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
}

export const apiClient = new ApiClient()
export default apiClient
