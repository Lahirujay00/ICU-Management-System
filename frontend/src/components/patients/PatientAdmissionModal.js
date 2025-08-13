'use client'

import { useState } from 'react'
import { X, User, Bed, Stethoscope, AlertTriangle } from 'lucide-react'

export default function PatientAdmissionModal({ isOpen, onClose, onAdmit }) {
  const [formData, setFormData] = useState({
    name: '',
    age: '',
    gender: '',
    patientId: '',
    bedNumber: '',
    diagnosis: '',
    attendingPhysician: '',
    emergencyContact: '',
    allergies: '',
    medicalHistory: ''
  })
  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: value
    }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setIsSubmitting(true)

    try {
      const patientData = {
        ...formData,
        age: parseInt(formData.age),
        status: 'critical', // Default status for new admissions
        admissionDate: new Date().toISOString(),
        vitalSigns: [],
        notes: []
      }

      await onAdmit(patientData)
      handleClose()
    } catch (error) {
      console.error('Error admitting patient:', error)
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleClose = () => {
    setFormData({
      name: '',
      age: '',
      gender: '',
      patientId: '',
      bedNumber: '',
      diagnosis: '',
      attendingPhysician: '',
      emergencyContact: '',
      allergies: '',
      medicalHistory: ''
    })
    onClose()
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex justify-between items-center p-6 border-b border-gray-200">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-blue-100 rounded-lg">
              <User className="h-6 w-6 text-blue-600" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-gray-900">Admit New Patient</h2>
              <p className="text-gray-600">Enter patient information for ICU admission</p>
            </div>
          </div>
          <button
            onClick={handleClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X className="h-6 w-6" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* Basic Information */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-2">
                Full Name *
              </label>
              <input
                type="text"
                id="name"
                name="name"
                required
                value={formData.name}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Enter patient's full name"
              />
            </div>

            <div>
              <label htmlFor="age" className="block text-sm font-medium text-gray-700 mb-2">
                Age *
              </label>
              <input
                type="number"
                id="age"
                name="age"
                required
                min="0"
                max="150"
                value={formData.age}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Age in years"
              />
            </div>

            <div>
              <label htmlFor="gender" className="block text-sm font-medium text-gray-700 mb-2">
                Gender *
              </label>
              <select
                id="gender"
                name="gender"
                required
                value={formData.gender}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="">Select gender</option>
                <option value="male">Male</option>
                <option value="female">Female</option>
                <option value="other">Other</option>
              </select>
            </div>

            <div>
              <label htmlFor="patientId" className="block text-sm font-medium text-gray-700 mb-2">
                Patient ID *
              </label>
              <input
                type="text"
                id="patientId"
                name="patientId"
                required
                value={formData.patientId}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Unique patient identifier"
              />
            </div>

            <div>
              <label htmlFor="bedNumber" className="block text-sm font-medium text-gray-700 mb-2">
                Bed Number *
              </label>
              <input
                type="text"
                id="bedNumber"
                name="bedNumber"
                required
                value={formData.bedNumber}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="ICU bed assignment"
              />
            </div>

            <div>
              <label htmlFor="attendingPhysician" className="block text-sm font-medium text-gray-700 mb-2">
                Attending Physician *
              </label>
              <input
                type="text"
                id="attendingPhysician"
                name="attendingPhysician"
                required
                value={formData.attendingPhysician}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Primary physician name"
              />
            </div>
          </div>

          {/* Medical Information */}
          <div className="space-y-4">
            <div>
              <label htmlFor="diagnosis" className="block text-sm font-medium text-gray-700 mb-2">
                Primary Diagnosis *
              </label>
              <textarea
                id="diagnosis"
                name="diagnosis"
                required
                rows="3"
                value={formData.diagnosis}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Primary reason for ICU admission"
              />
            </div>

            <div>
              <label htmlFor="allergies" className="block text-sm font-medium text-gray-700 mb-2">
                Allergies
              </label>
              <textarea
                id="allergies"
                name="allergies"
                rows="2"
                value={formData.allergies}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Known allergies (if any)"
              />
            </div>

            <div>
              <label htmlFor="medicalHistory" className="block text-sm font-medium text-gray-700 mb-2">
                Relevant Medical History
              </label>
              <textarea
                id="medicalHistory"
                name="medicalHistory"
                rows="3"
                value={formData.medicalHistory}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Previous medical conditions, surgeries, etc."
              />
            </div>

            <div>
              <label htmlFor="emergencyContact" className="block text-sm font-medium text-gray-700 mb-2">
                Emergency Contact
              </label>
              <input
                type="text"
                id="emergencyContact"
                name="emergencyContact"
                value={formData.emergencyContact}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Emergency contact person and number"
              />
            </div>
          </div>

          {/* Actions */}
          <div className="flex justify-end space-x-3 pt-4 border-t border-gray-200">
            <button
              type="button"
              onClick={handleClose}
              className="px-4 py-2 text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center space-x-2"
            >
              {isSubmitting ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                  <span>Admitting...</span>
                </>
              ) : (
                <>
                  <Stethoscope className="h-4 w-4" />
                  <span>Admit Patient</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
} 