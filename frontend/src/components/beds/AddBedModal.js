'use client'

import { useState } from 'react'
import { X } from 'lucide-react'
import { apiClient } from '@/lib/api'

export default function AddBedModal({ isOpen, onClose, onBedAdded }) {
  const [formData, setFormData] = useState({
    number: '',
    roomNumber: '',
    floor: 1,
    ward: '',
    bedType: 'ICU',
    features: {
      ventilator: false,
      monitor: true,
      oxygenSupply: true,
      suction: false
    },
    notes: ''
  })
  const [isLoading, setIsLoading] = useState(false)
  const [errors, setErrors] = useState({})

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target
    
    if (name.includes('.')) {
      const [parent, child] = name.split('.')
      setFormData(prev => ({
        ...prev,
        [parent]: {
          ...prev[parent],
          [child]: type === 'checkbox' ? checked : value
        }
      }))
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: type === 'checkbox' ? checked : value
      }))
    }
    
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }))
    }
  }

  const validateForm = () => {
    const newErrors = {}
    
    if (!formData.number.trim()) {
      newErrors.number = 'Bed number is required'
    }
    
    if (!formData.roomNumber.trim()) {
      newErrors.roomNumber = 'Room number is required'
    }
    
    if (!formData.ward.trim()) {
      newErrors.ward = 'Ward is required'
    }
    
    if (formData.floor < 1) {
      newErrors.floor = 'Floor must be at least 1'
    }
    
    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    
    if (!validateForm()) {
      return
    }
    
    setIsLoading(true)
    
    try {
      const newBed = await apiClient.createBed(formData)
      onBedAdded(newBed)
      onClose()
      
      // Reset form
      setFormData({
        number: '',
        roomNumber: '',
        floor: 1,
        ward: '',
        bedType: 'ICU',
        features: {
          ventilator: false,
          monitor: true,
          oxygenSupply: true,
          suction: false
        },
        notes: ''
      })
      setErrors({})
    } catch (error) {
      console.error('Error creating bed:', error)
      if (error.message.includes('already exists')) {
        setErrors({ number: 'This bed number already exists' })
      } else {
        setErrors({ general: 'Failed to create bed. Please try again.' })
      }
    } finally {
      setIsLoading(false)
    }
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
    style={{ width: '100vw', height: '100vh', margin: 0, padding: 0 }}>
      <div className="bg-white rounded-lg p-4 shadow-xl max-w-2xl w-full mx-4 max-h-[90vh] overflow-hidden pr-2">
        {/* Header */}
        <div className="overflow-y-auto max-h-[80vh]">
        <div className="flex justify-between items-center p-6 border-b border-gray-200">
          <h2 className="text-xl font-semibold text-gray-900">Add New Bed</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6">
          {errors.general && (
            <div className="mb-4 p-3 bg-red-100 border border-red-300 text-red-700 rounded-md">
              {errors.general}
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
            {/* Bed Number */}
            <div>
              <label htmlFor="number" className="block text-sm font-medium text-gray-700 mb-1">
                Bed Number *
              </label>
              <input
                type="text"
                id="number"
                name="number"
                value={formData.number}
                onChange={handleChange}
                className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                  errors.number ? 'border-red-300 focus:ring-red-500' : 'border-gray-300'
                }`}
                placeholder="e.g., ICU-001"
              />
              {errors.number && <p className="mt-1 text-sm text-red-600">{errors.number}</p>}
            </div>

            {/* Room Number */}
            <div>
              <label htmlFor="roomNumber" className="block text-sm font-medium text-gray-700 mb-1">
                Room Number *
              </label>
              <input
                type="text"
                id="roomNumber"
                name="roomNumber"
                value={formData.roomNumber}
                onChange={handleChange}
                className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                  errors.roomNumber ? 'border-red-300 focus:ring-red-500' : 'border-gray-300'
                }`}
                placeholder="e.g., 101"
              />
              {errors.roomNumber && <p className="mt-1 text-sm text-red-600">{errors.roomNumber}</p>}
            </div>

            {/* Floor */}
            <div>
              <label htmlFor="floor" className="block text-sm font-medium text-gray-700 mb-1">
                Floor *
              </label>
              <input
                type="number"
                id="floor"
                name="floor"
                value={formData.floor}
                onChange={handleChange}
                min="1"
                className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                  errors.floor ? 'border-red-300 focus:ring-red-500' : 'border-gray-300'
                }`}
              />
              {errors.floor && <p className="mt-1 text-sm text-red-600">{errors.floor}</p>}
            </div>

            {/* Ward */}
            <div>
              <label htmlFor="ward" className="block text-sm font-medium text-gray-700 mb-1">
                Ward *
              </label>
              <input
                type="text"
                id="ward"
                name="ward"
                value={formData.ward}
                onChange={handleChange}
                className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                  errors.ward ? 'border-red-300 focus:ring-red-500' : 'border-gray-300'
                }`}
                placeholder="e.g., Cardiac ICU"
              />
              {errors.ward && <p className="mt-1 text-sm text-red-600">{errors.ward}</p>}
            </div>

            {/* Bed Type */}
            <div className="md:col-span-2">
              <label htmlFor="bedType" className="block text-sm font-medium text-gray-700 mb-1">
                Bed Type
              </label>
              <select
                id="bedType"
                name="bedType"
                value={formData.bedType}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="ICU">ICU</option>
                <option value="HDU">HDU (High Dependency Unit)</option>
                <option value="General">General</option>
                <option value="Isolation">Isolation</option>
              </select>
            </div>
          </div>

          {/* Features */}
          <div className="mb-6">
            <h3 className="text-lg font-medium text-gray-900 mb-3">Bed Features</h3>
            <div className="grid grid-cols-2 gap-3">
              <label className="flex items-center">
                <input
                  type="checkbox"
                  name="features.ventilator"
                  checked={formData.features.ventilator}
                  onChange={handleChange}
                  className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                />
                <span className="ml-2 text-sm text-gray-700">Ventilator</span>
              </label>

              <label className="flex items-center">
                <input
                  type="checkbox"
                  name="features.monitor"
                  checked={formData.features.monitor}
                  onChange={handleChange}
                  className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                />
                <span className="ml-2 text-sm text-gray-700">Patient Monitor</span>
              </label>

              <label className="flex items-center">
                <input
                  type="checkbox"
                  name="features.oxygenSupply"
                  checked={formData.features.oxygenSupply}
                  onChange={handleChange}
                  className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                />
                <span className="ml-2 text-sm text-gray-700">Oxygen Supply</span>
              </label>

              <label className="flex items-center">
                <input
                  type="checkbox"
                  name="features.suction"
                  checked={formData.features.suction}
                  onChange={handleChange}
                  className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                />
                <span className="ml-2 text-sm text-gray-700">Suction</span>
              </label>
            </div>
          </div>

          {/* Notes */}
          <div className="mb-6">
            <label htmlFor="notes" className="block text-sm font-medium text-gray-700 mb-1">
              Notes
            </label>
            <textarea
              id="notes"
              name="notes"
              value={formData.notes}
              onChange={handleChange}
              rows={3}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Additional notes or special instructions..."
            />
          </div>

          {/* Form Actions */}
          <div className="flex gap-3 justify-end">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 border border-gray-300 rounded-md hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-gray-500"
              disabled={isLoading}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
              disabled={isLoading}
            >
              {isLoading ? 'Creating...' : 'Create Bed'}
            </button>
          </div>
        </form>
      </div>
    </div>
    </div>
  )
}
