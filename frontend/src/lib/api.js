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

  // Patient endpoints
  async getPatients() {
    return this.request('/patients')
  }

  async getPatient(id) {
    return this.request(`/patients/${id}`)
  }

  async createPatient(patientData) {
    return this.request('/patients', {
      method: 'POST',
      body: JSON.stringify(patientData),
    })
  }

  async updatePatient(id, patientData) {
    return this.request(`/patients/${id}`, {
      method: 'PUT',
      body: JSON.stringify(patientData),
    })
  }

  async deletePatient(id) {
    return this.request(`/patients/${id}`, {
      method: 'DELETE',
    })
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
}

export const apiClient = new ApiClient()
export default apiClient 