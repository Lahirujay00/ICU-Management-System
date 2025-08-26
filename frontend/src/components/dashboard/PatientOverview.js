'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { useForm } from 'react-hook-form'
import { 
  User, 
  Heart, 
  Activity, 
  AlertTriangle, 
  TrendingUp, 
  Clock,
  Bed,
  Stethoscope,
  Plus,
  Search,
  Filter,
  Eye,
  Edit,
  X
} from 'lucide-react'
import toast from 'react-hot-toast'
import PatientCard from '../patients/PatientCard'
import VitalSignsChart from '../charts/VitalSignsChart'
import RiskAssessmentPanel from '../patients/RiskAssessmentPanel'
import PatientAdmissionModal from '../patients/PatientAdmissionModal'
import { apiClient } from '@/lib/api'

export default function PatientOverview({ detailed = false }) {
  const [patients, setPatients] = useState([])
  const [filteredPatients, setFilteredPatients] = useState([])
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedPatient, setSelectedPatient] = useState(null)
  const [isAdmissionModalOpen, setIsAdmissionModalOpen] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const [filterStatus, setFilterStatus] = useState('all')
  const [editingPatient, setEditingPatient] = useState(null)
  const [showEditModal, setShowEditModal] = useState(false)
  const [showDeleteModal, setShowDeleteModal] = useState(false)
  const [patientToDelete, setPatientToDelete] = useState(null)

  useEffect(() => {
    loadPatients()
  }, [])

  useEffect(() => {
    filterPatients()
  }, [searchTerm, filterStatus, patients])

  const loadPatients = async () => {
    try {
      console.log('🔄 Loading patients via PatientOverview...');
      setIsLoading(true);
      
      // Load patients from API
      const data = await apiClient.getPatients();
      console.log('✅ Patients loaded:', data);
      
      // Handle both direct array and object with data property
      const patientsData = Array.isArray(data) ? data : data.data || data;
      setPatients(patientsData);
      
      // Removed the loaded amount toast message as requested
    } catch (error) {
      console.error('❌ Error loading patients:', error);
      toast.error('Failed to load patients from server');
      
      // Use empty array as fallback
      setPatients([]);
    } finally {
      setIsLoading(false);
    }
  }

  const filterPatients = () => {
    let filtered = patients

    if (searchTerm) {
      filtered = filtered.filter(patient => 
        patient.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        patient.patientId?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        patient.diagnosis.toLowerCase().includes(searchTerm.toLowerCase()) ||
        patient.attendingPhysician?.toLowerCase().includes(searchTerm.toLowerCase())
      )
    }

    if (filterStatus !== 'all') {
      filtered = filtered.filter(patient => patient.status === filterStatus)
    }

    setFilteredPatients(filtered)
  }

  const handleAdmitPatient = async (patientData) => {
    try {
      console.log('🚀 Admitting patient via PatientOverview:', patientData);
      
      // Show loading toast
      toast.loading('Admitting patient...', { id: 'admit-patient' });
      
      // Make API call to save patient to database
      const response = await apiClient.createPatient(patientData);
      console.log('✅ Patient admitted successfully:', response);
      
      // Reload patients from database to get the latest data
      await loadPatients();
      
      setIsAdmissionModalOpen(false);
      
      // Show success notification
      toast.success(`Patient ${patientData.name} admitted successfully!`, { 
        id: 'admit-patient',
        duration: 5000 
      });
    } catch (error) {
      console.error('❌ Error admitting patient:', error);
      
      // Show error notification
      toast.error(`Failed to admit patient: ${error.message}`, { 
        id: 'admit-patient',
        duration: 8000 
      });
    }
  }

  const handleStatusUpdate = async (patientId, newStatus) => {
    try {
      // Update patient status in local state
      setPatients(prev => 
        prev.map(patient => 
          patient._id === patientId 
            ? { ...patient, status: newStatus }
            : patient
        )
      )
    } catch (error) {
      console.error('Error updating patient status:', error)
    }
  }

  // Handler functions for patient actions
  const handleViewPatient = (patient) => {
    setSelectedPatient(patient);
    toast.success(`Viewing details for ${patient.name}`);
  }

  const handleEditPatient = (patient) => {
    setEditingPatient(patient);
    setShowEditModal(true);
  }

  const handleDeletePatient = (patient) => {
    setPatientToDelete(patient);
    setShowDeleteModal(true);
  }

  const confirmDeletePatient = async () => {
    try {
      toast.loading('Deleting patient...', { id: 'delete-patient' });
      
      await apiClient.deletePatient(patientToDelete._id);
      
      toast.success(`Patient ${patientToDelete.name} deleted successfully!`, { 
        id: 'delete-patient',
        duration: 5000 
      });
      
      setShowDeleteModal(false);
      setPatientToDelete(null);
      
      // Refresh patient list
      await loadPatients();
    } catch (error) {
      console.error('❌ Error deleting patient:', error);
      const errorMessage = error.response?.data?.error?.message || 
                          error.message || 
                          'Failed to delete patient. Please try again.';
      
      toast.error(`❌ ${errorMessage}`, { 
        id: 'delete-patient',
        duration: 8000 
      });
    }
  }

  const handleUpdatePatient = async (updatedData) => {
    try {
      toast.loading('Updating patient...', { id: 'update-patient' });
      
      const response = await apiClient.updatePatient(editingPatient._id, updatedData);
      
      toast.success(`Patient ${updatedData.name || editingPatient.name} updated successfully!`, { 
        id: 'update-patient',
        duration: 5000 
      });
      
      setShowEditModal(false);
      setEditingPatient(null);
      
      // Refresh patient list
      await loadPatients();
    } catch (error) {
      console.error('❌ Error updating patient:', error);
      const errorMessage = error.response?.data?.error?.message || 
                          error.message || 
                          'Failed to update patient. Please try again.';
      
      toast.error(`❌ ${errorMessage}`, { 
        id: 'update-patient',
        duration: 8000 
      });
    }
  }

  // Enhanced Patient Card based on your original design but with edit/delete options and bed slot UI
  const EnhancedPatientCard = ({ patient }) => {
    const [isUpdatingStatus, setIsUpdatingStatus] = useState(false)

    const getStatusColor = (status) => {
      switch (status) {
        case 'critical':
          return 'bg-red-100 text-red-800 border-red-200'
        case 'stable':
          return 'bg-green-100 text-green-800 border-green-200'
        case 'improving':
          return 'bg-blue-100 text-blue-800 border-blue-200'
        default:
          return 'bg-gray-100 text-gray-800 border-gray-200'
      }
    }

    const getStatusIcon = (status) => {
      switch (status) {
        case 'critical':
          return <AlertTriangle className="h-4 w-4" />
        case 'stable':
          return <Heart className="h-4 w-4" />
        case 'improving':
          return <Activity className="h-4 w-4" />
        default:
          return <User className="h-4 w-4" />
      }
    }

    const getBedStatusColor = (bedNumber) => {
      // Different colors for different bed types
      const bedNum = parseInt(bedNumber?.replace(/\D/g, '') || '0')
      if (bedNum <= 10) return 'bg-blue-500'
      if (bedNum <= 20) return 'bg-green-500'
      if (bedNum <= 30) return 'bg-purple-500'
      return 'bg-orange-500'
    }

    const handleStatusChange = async (newStatus) => {
      if (isUpdatingStatus) return
      
      setIsUpdatingStatus(true)
      try {
        await handleStatusUpdate(patient._id, newStatus)
        toast.success(`Status updated to ${newStatus}`)
      } catch (error) {
        console.error('Error updating status:', error)
        toast.error('Failed to update status')
      } finally {
        setIsUpdatingStatus(false)
      }
    }

    return (
      <div className="bg-white rounded-lg shadow-md border border-gray-200 hover:shadow-lg transition-shadow">
        <div className="p-4">
          {/* Header with Bed Slot UI */}
          <div className="flex items-start justify-between mb-3">
            <div className="flex items-center space-x-3">
              {/* Bed Slot Indicator */}
              <div className="relative">
                <div className={`h-10 w-10 ${getBedStatusColor(patient.bedNumber)} rounded-lg flex items-center justify-center`}>
                  <Bed className="h-5 w-5 text-white" />
                </div>
                <div className="absolute -top-2 -right-2 bg-white border border-gray-300 rounded-full px-2 py-0.5 text-xs font-bold text-gray-700">
                  {patient.bedNumber?.replace(/\D/g, '') || 'N/A'}
                </div>
              </div>
              <div>
                <h3 className="font-semibold text-gray-900">{patient.name}</h3>
                <p className="text-sm text-gray-600">ID: {patient.patientId}</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <div className={`px-2 py-1 rounded-full text-xs font-medium border ${getStatusColor(patient.status)} flex items-center space-x-1`}>
                {getStatusIcon(patient.status)}
                <span>{patient.status}</span>
              </div>
              {/* Action buttons */}
              <div className="flex space-x-1">
                <button 
                  onClick={() => handleEditPatient(patient)}
                  className="p-1 bg-green-50 hover:bg-green-100 rounded transition-colors"
                  title="Edit Patient"
                  disabled={isUpdatingStatus}
                >
                  <Edit className="w-4 h-4 text-green-600" />
                </button>
                <button 
                  onClick={() => handleDeletePatient(patient)}
                  className="p-1 bg-red-50 hover:bg-red-100 rounded transition-colors"
                  title="Delete Patient"
                  disabled={isUpdatingStatus}
                >
                  <X className="w-4 h-4 text-red-600" />
                </button>
              </div>
            </div>
          </div>

          {/* Bed Information */}
          <div className="mb-4 p-3 bg-gradient-to-r from-blue-50 to-purple-50 rounded-lg border border-blue-200">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <Bed className="h-4 w-4 text-blue-600" />
                <span className="text-sm font-medium text-blue-900">Bed {patient.bedNumber}</span>
              </div>
              <div className="flex items-center space-x-2">
                <Clock className="h-4 w-4 text-purple-600" />
                <span className="text-sm text-purple-700">
                  {patient.admissionDate ? new Date(patient.admissionDate).toLocaleDateString() : 'Recent'}
                </span>
              </div>
            </div>
          </div>

          {/* Patient Info */}
          <div className="mb-4 p-3 bg-gray-50 rounded-lg">
            <div className="text-sm text-gray-600 space-y-1">
              <p><strong>Age:</strong> {patient.age} years</p>
              <p><strong>Gender:</strong> {patient.gender}</p>
              <p><strong>Diagnosis:</strong> {patient.diagnosis}</p>
              {patient.attendingPhysician && (
                <p><strong>Physician:</strong> {patient.attendingPhysician}</p>
              )}
            </div>
          </div>

          {/* Status Update Section */}
          <div className="mb-3">
            <label className="block text-xs font-medium text-gray-700 mb-2">Update Status:</label>
            <div className="grid grid-cols-3 gap-2">
              <button
                onClick={() => handleStatusChange('critical')}
                disabled={isUpdatingStatus || patient.status === 'critical'}
                className={`px-2 py-1 text-xs rounded border transition-colors ${
                  patient.status === 'critical'
                    ? 'bg-red-100 text-red-800 border-red-300 cursor-not-allowed'
                    : 'bg-white text-red-600 border-red-300 hover:bg-red-50'
                }`}
              >
                {isUpdatingStatus ? '...' : 'Critical'}
              </button>
              <button
                onClick={() => handleStatusChange('stable')}
                disabled={isUpdatingStatus || patient.status === 'stable'}
                className={`px-2 py-1 text-xs rounded border transition-colors ${
                  patient.status === 'stable'
                    ? 'bg-green-100 text-green-800 border-green-300 cursor-not-allowed'
                    : 'bg-white text-green-600 border-green-300 hover:bg-green-50'
                }`}
              >
                {isUpdatingStatus ? '...' : 'Stable'}
              </button>
              <button
                onClick={() => handleStatusChange('improving')}
                disabled={isUpdatingStatus || patient.status === 'improving'}
                className={`px-2 py-1 text-xs rounded border transition-colors ${
                  patient.status === 'improving'
                    ? 'bg-blue-100 text-blue-800 border-blue-300 cursor-not-allowed'
                    : 'bg-white text-blue-600 border-blue-300 hover:bg-blue-50'
                }`}
              >
                {isUpdatingStatus ? '...' : 'Improving'}
              </button>
            </div>
          </div>
        </div>
      </div>
    )
  }

  // Enhanced Add Patient Modal
  const EnhancedAddPatientModal = ({ show, onClose, onSubmit }) => {
    const { register, handleSubmit, reset, formState: { errors, isSubmitting } } = useForm();
  
    useEffect(() => {
      if (!show) {
        reset();
      }
    }, [show, reset]);

    const handleFormSubmit = async (data) => {
      try {
        // Transform the data to match backend expectations
        const transformedData = {
          name: `${data.firstName} ${data.lastName}`.trim(),
          age: data.dateOfBirth ? calculateAge(data.dateOfBirth) : 25,
          gender: data.gender,
          diagnosis: data.diagnosis,
          bedNumber: data.bedNumber || `BED-${Date.now()}`,
          attendingPhysician: data.admittingPhysician || 'Not Assigned',
          patientId: data.patientId || `PAT-${Date.now()}`,
          contactNumber: data.contactNumber || ''
        };
        
        await onSubmit(transformedData);
        reset();
      } catch (error) {
        console.error('❌ Error in form submission:', error);
        toast.error(`❌ Form submission failed: ${error.message}`);
      }
    };

    // Helper function to calculate age from date of birth
    const calculateAge = (dateOfBirth) => {
      const today = new Date();
      const birthDate = new Date(dateOfBirth);
      let age = today.getFullYear() - birthDate.getFullYear();
      const monthDiff = today.getMonth() - birthDate.getMonth();
      
      if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
        age--;
      }
      
      return Math.max(0, age);
    }
  
    if (!show) return null;
  
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="bg-white rounded-xl p-8 max-w-4xl w-full mx-4 max-h-[95vh] overflow-y-auto shadow-2xl"
        >
          <div className="flex items-center justify-between mb-8">
            <h2 className="text-3xl font-bold text-gray-900 flex items-center">
              <Plus className="w-8 h-8 mr-3 text-primary-600" />
              Add New Patient
            </h2>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 p-2 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <X className="w-6 h-6" />
            </button>
          </div>
          
          <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-8">
            {/* Personal Information Section */}
            <div className="bg-gray-50 p-6 rounded-lg">
              <h3 className="text-xl font-semibold text-gray-800 mb-4 flex items-center">
                <User className="w-5 h-5 mr-2 text-primary-600" />
                Personal Information
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                <div>
                  <label htmlFor="firstName" className="block text-sm font-medium text-gray-700 mb-2">
                    First Name <span className="text-red-500">*</span>
                  </label>
                  <input 
                    type="text" 
                    id="firstName" 
                    {...register('firstName', { required: 'First Name is required' })} 
                    className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${errors.firstName ? 'border-red-300' : 'border-gray-300'}`}
                    placeholder="Enter first name"
                  />
                  {errors.firstName && <p className="text-red-500 text-sm mt-1">{errors.firstName.message}</p>}
                </div>
                
                <div>
                  <label htmlFor="lastName" className="block text-sm font-medium text-gray-700 mb-2">
                    Last Name <span className="text-red-500">*</span>
                  </label>
                  <input 
                    type="text" 
                    id="lastName" 
                    {...register('lastName', { required: 'Last Name is required' })} 
                    className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${errors.lastName ? 'border-red-300' : 'border-gray-300'}`}
                    placeholder="Enter last name"
                  />
                  {errors.lastName && <p className="text-red-500 text-sm mt-1">{errors.lastName.message}</p>}
                </div>
                
                <div>
                  <label htmlFor="dateOfBirth" className="block text-sm font-medium text-gray-700 mb-2">
                    Date of Birth <span className="text-red-500">*</span>
                  </label>
                  <input 
                    type="date" 
                    id="dateOfBirth" 
                    {...register('dateOfBirth', { required: 'Date of Birth is required' })} 
                    className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${errors.dateOfBirth ? 'border-red-300' : 'border-gray-300'}`}
                  />
                  {errors.dateOfBirth && <p className="text-red-500 text-sm mt-1">{errors.dateOfBirth.message}</p>}
                </div>
                
                <div>
                  <label htmlFor="gender" className="block text-sm font-medium text-gray-700 mb-2">
                    Gender <span className="text-red-500">*</span>
                  </label>
                  <select 
                    id="gender" 
                    {...register('gender', { required: 'Gender is required' })} 
                    className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${errors.gender ? 'border-red-300' : 'border-gray-300'}`}
                  >
                    <option value="">Select Gender</option>
                    <option value="male">Male</option>
                    <option value="female">Female</option>
                    <option value="other">Other</option>
                  </select>
                  {errors.gender && <p className="text-red-500 text-sm mt-1">{errors.gender.message}</p>}
                </div>
                
                <div>
                  <label htmlFor="contactNumber" className="block text-sm font-medium text-gray-700 mb-2">Contact Number</label>
                  <input 
                    type="tel" 
                    id="contactNumber" 
                    {...register('contactNumber')} 
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="Enter contact number"
                  />
                </div>
                
                <div>
                  <label htmlFor="patientId" className="block text-sm font-medium text-gray-700 mb-2">Patient ID</label>
                  <input 
                    type="text" 
                    id="patientId" 
                    {...register('patientId')} 
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500" 
                    placeholder="Auto-generated if empty"
                  />
                </div>
              </div>
            </div>

            {/* Medical Information Section */}
            <div className="bg-blue-50 p-6 rounded-lg">
              <h3 className="text-xl font-semibold text-gray-800 mb-4 flex items-center">
                <Stethoscope className="w-5 h-5 mr-2 text-blue-600" />
                Medical Information
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label htmlFor="diagnosis" className="block text-sm font-medium text-gray-700 mb-2">
                    Diagnosis <span className="text-red-500">*</span>
                  </label>
                  <input 
                    type="text" 
                    id="diagnosis" 
                    {...register('diagnosis', { required: 'Diagnosis is required' })} 
                    className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${errors.diagnosis ? 'border-red-300' : 'border-gray-300'}`}
                    placeholder="Enter primary diagnosis"
                  />
                  {errors.diagnosis && <p className="text-red-500 text-sm mt-1">{errors.diagnosis.message}</p>}
                </div>
                
                <div>
                  <label htmlFor="admittingPhysician" className="block text-sm font-medium text-gray-700 mb-2">Attending Physician</label>
                  <input 
                    type="text" 
                    id="admittingPhysician" 
                    {...register('admittingPhysician')} 
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500" 
                    placeholder="Will be assigned if empty"
                  />
                </div>
                
                <div>
                  <label htmlFor="bedNumber" className="block text-sm font-medium text-gray-700 mb-2">Bed Number</label>
                  <input 
                    type="text" 
                    id="bedNumber" 
                    {...register('bedNumber')} 
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500" 
                    placeholder="Auto-assigned if empty"
                  />
                </div>
                
                <div>
                  <label htmlFor="status" className="block text-sm font-medium text-gray-700 mb-2">Initial Status</label>
                  <select 
                    id="status" 
                    {...register('status')} 
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  >
                    <option value="observation">Under Observation</option>
                    <option value="stable">Stable</option>
                    <option value="critical">Critical</option>
                  </select>
                </div>
              </div>
            </div>
            
            {/* Action Buttons */}
            <div className="flex justify-end space-x-4 pt-6 border-t">
              <button 
                type="button" 
                onClick={onClose} 
                className="px-6 py-3 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors font-medium"
                disabled={isSubmitting}
              >
                Cancel
              </button>
              <button 
                type="submit" 
                className="px-8 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium flex items-center space-x-2 disabled:opacity-50"
                disabled={isSubmitting}
              >
                {isSubmitting ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                    <span>Adding...</span>
                  </>
                ) : (
                  <>
                    <Plus className="w-4 h-4" />
                    <span>Add Patient</span>
                  </>
                )}
              </button>
            </div>
          </form>
        </motion.div>
      </div>
    );
  };

  // Edit Patient Modal
  const EditPatientModal = ({ show, patient, onClose, onSubmit }) => {
    const { register, handleSubmit, reset, setValue, formState: { errors, isSubmitting } } = useForm();
  
    useEffect(() => {
      if (show && patient) {
        // Pre-populate form with patient data
        const nameParts = patient.name.split(' ');
        setValue('firstName', nameParts[0] || '');
        setValue('lastName', nameParts.slice(1).join(' ') || '');
        setValue('gender', patient.gender);
        setValue('diagnosis', patient.diagnosis);
        setValue('attendingPhysician', patient.attendingPhysician);
        setValue('bedNumber', patient.bedNumber);
        setValue('contactNumber', patient.contactNumber || '');
        setValue('patientId', patient.patientId);
      } else {
        reset();
      }
    }, [show, patient, reset, setValue]);

    const handleFormSubmit = async (data) => {
      try {
        // Transform the data to match backend expectations
        const transformedData = {
          name: `${data.firstName} ${data.lastName}`.trim(),
          gender: data.gender,
          diagnosis: data.diagnosis,
          attendingPhysician: data.attendingPhysician,
          bedNumber: data.bedNumber,
          contactNumber: data.contactNumber,
          patientId: data.patientId
        };
        
        await onSubmit(transformedData);
        reset();
      } catch (error) {
        console.error('❌ Error in edit form submission:', error);
        toast.error(`❌ Edit failed: ${error.message}`);
      }
    };
  
    if (!show || !patient) return null;
  
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="bg-white rounded-xl p-8 max-w-2xl w-full mx-4 max-h-[95vh] overflow-y-auto shadow-2xl"
        >
          <div className="flex items-center justify-between mb-8">
            <h2 className="text-3xl font-bold text-gray-900 flex items-center">
              <Edit className="w-8 h-8 mr-3 text-green-600" />
              Edit Patient
            </h2>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 p-2 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <X className="w-6 h-6" />
            </button>
          </div>
          
          <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-6">
            {/* Personal Information */}
            <div className="bg-green-50 p-6 rounded-lg">
              <h3 className="text-xl font-semibold text-gray-800 mb-4 flex items-center">
                <User className="w-5 h-5 mr-2 text-green-600" />
                Personal Information
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label htmlFor="edit-firstName" className="block text-sm font-medium text-gray-700 mb-2">
                    First Name <span className="text-red-500">*</span>
                  </label>
                  <input 
                    type="text" 
                    id="edit-firstName" 
                    {...register('firstName', { required: 'First Name is required' })} 
                    className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 ${errors.firstName ? 'border-red-300' : 'border-gray-300'}`}
                  />
                  {errors.firstName && <p className="text-red-500 text-sm mt-1">{errors.firstName.message}</p>}
                </div>
                
                <div>
                  <label htmlFor="edit-lastName" className="block text-sm font-medium text-gray-700 mb-2">
                    Last Name <span className="text-red-500">*</span>
                  </label>
                  <input 
                    type="text" 
                    id="edit-lastName" 
                    {...register('lastName', { required: 'Last Name is required' })} 
                    className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 ${errors.lastName ? 'border-red-300' : 'border-gray-300'}`}
                  />
                  {errors.lastName && <p className="text-red-500 text-sm mt-1">{errors.lastName.message}</p>}
                </div>
                
                <div>
                  <label htmlFor="edit-gender" className="block text-sm font-medium text-gray-700 mb-2">
                    Gender <span className="text-red-500">*</span>
                  </label>
                  <select 
                    id="edit-gender" 
                    {...register('gender', { required: 'Gender is required' })} 
                    className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 ${errors.gender ? 'border-red-300' : 'border-gray-300'}`}
                  >
                    <option value="">Select Gender</option>
                    <option value="male">Male</option>
                    <option value="female">Female</option>
                    <option value="other">Other</option>
                  </select>
                  {errors.gender && <p className="text-red-500 text-sm mt-1">{errors.gender.message}</p>}
                </div>
                
                <div>
                  <label htmlFor="edit-contactNumber" className="block text-sm font-medium text-gray-700 mb-2">Contact Number</label>
                  <input 
                    type="tel" 
                    id="edit-contactNumber" 
                    {...register('contactNumber')} 
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                  />
                </div>
              </div>
            </div>

            {/* Medical Information */}
            <div className="bg-blue-50 p-6 rounded-lg">
              <h3 className="text-xl font-semibold text-gray-800 mb-4 flex items-center">
                <Stethoscope className="w-5 h-5 mr-2 text-blue-600" />
                Medical Information
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label htmlFor="edit-diagnosis" className="block text-sm font-medium text-gray-700 mb-2">
                    Diagnosis <span className="text-red-500">*</span>
                  </label>
                  <input 
                    type="text" 
                    id="edit-diagnosis" 
                    {...register('diagnosis', { required: 'Diagnosis is required' })} 
                    className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 ${errors.diagnosis ? 'border-red-300' : 'border-gray-300'}`}
                  />
                  {errors.diagnosis && <p className="text-red-500 text-sm mt-1">{errors.diagnosis.message}</p>}
                </div>
                
                <div>
                  <label htmlFor="edit-attendingPhysician" className="block text-sm font-medium text-gray-700 mb-2">Attending Physician</label>
                  <input 
                    type="text" 
                    id="edit-attendingPhysician" 
                    {...register('attendingPhysician')} 
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                  />
                </div>
                
                <div>
                  <label htmlFor="edit-bedNumber" className="block text-sm font-medium text-gray-700 mb-2">Bed Number</label>
                  <input 
                    type="text" 
                    id="edit-bedNumber" 
                    {...register('bedNumber')} 
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                  />
                </div>
                
                <div>
                  <label htmlFor="edit-patientId" className="block text-sm font-medium text-gray-700 mb-2">Patient ID</label>
                  <input 
                    type="text" 
                    id="edit-patientId" 
                    {...register('patientId')} 
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 bg-gray-100"
                    disabled
                  />
                </div>
              </div>
            </div>
            
            {/* Action Buttons */}
            <div className="flex justify-end space-x-4 pt-6 border-t">
              <button 
                type="button" 
                onClick={onClose} 
                className="px-6 py-3 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors font-medium"
                disabled={isSubmitting}
              >
                Cancel
              </button>
              <button 
                type="submit" 
                className="px-8 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors font-medium flex items-center space-x-2 disabled:opacity-50"
                disabled={isSubmitting}
              >
                {isSubmitting ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                    <span>Updating...</span>
                  </>
                ) : (
                  <>
                    <Edit className="w-4 h-4" />
                    <span>Update Patient</span>
                  </>
                )}
              </button>
            </div>
          </form>
        </motion.div>
      </div>
    );
  };

  // Delete Confirmation Modal
  const DeletePatientModal = ({ show, patient, onClose, onConfirm }) => {
    const [isDeleting, setIsDeleting] = useState(false);

    const handleDelete = async () => {
      setIsDeleting(true);
      try {
        await onConfirm();
      } finally {
        setIsDeleting(false);
      }
    };

    if (!show || !patient) return null;

    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="bg-white rounded-xl p-8 max-w-md w-full mx-4 shadow-2xl"
        >
          <div className="text-center">
            <div className="w-16 h-16 mx-auto mb-6 bg-red-100 rounded-full flex items-center justify-center">
              <AlertTriangle className="w-8 h-8 text-red-600" />
            </div>
            
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Delete Patient</h2>
            
            <p className="text-gray-600 mb-6">
              Are you sure you want to delete <strong>{patient.name}</strong>? 
              This action cannot be undone.
            </p>
            
            <div className="flex justify-center space-x-4">
              <button 
                type="button" 
                onClick={onClose} 
                className="px-6 py-3 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors font-medium"
                disabled={isDeleting}
              >
                Cancel
              </button>
              <button 
                onClick={handleDelete}
                className="px-6 py-3 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors font-medium flex items-center space-x-2 disabled:opacity-50"
                disabled={isDeleting}
              >
                {isDeleting ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                    <span>Deleting...</span>
                  </>
                ) : (
                  <>
                    <X className="w-4 h-4" />
                    <span>Delete</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </motion.div>
      </div>
    );
  };

  const criticalPatients = patients.filter(p => p.status === 'critical')
  const stablePatients = patients.filter(p => p.status === 'stable')
  const improvingPatients = patients.filter(p => p.status === 'improving')

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header with Quick Actions */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Patient Overview</h2>
          <p className="text-gray-600">Monitor patient status and vital signs in real-time</p>
        </div>
        <button
          onClick={() => setIsAdmissionModalOpen(true)}
          className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg flex items-center gap-2 transition-colors"
        >
          <Plus className="w-4 h-4" />
          Admit Patient
        </button>
      </div>

      {/* Search and Filter Controls */}
      <div className="flex flex-col md:flex-row gap-4 mb-6">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
          <input
            type="text"
            placeholder="Search patients by name, ID, or diagnosis..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          />
        </div>
        
        <button className="flex items-center space-x-2 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors">
          <Filter className="w-4 h-4" />
          <span>More Filters</span>
        </button>
      </div>

      {/* Status Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-gradient-to-r from-blue-50 to-blue-100 border border-blue-200 rounded-xl p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-blue-600">Total Patients</p>
              <p className="text-2xl font-bold text-blue-900">{patients.length}</p>
            </div>
            <User className="w-8 h-8 text-blue-600" />
          </div>
        </div>

        <div className="bg-gradient-to-r from-red-50 to-red-100 border border-red-200 rounded-xl p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-red-600">Critical</p>
              <p className="text-2xl font-bold text-red-900">{criticalPatients.length}</p>
            </div>
            <AlertTriangle className="w-8 h-8 text-red-600" />
          </div>
        </div>

        <div className="bg-gradient-to-r from-green-50 to-green-100 border border-green-200 rounded-xl p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-green-600">Stable</p>
              <p className="text-2xl font-bold text-green-900">{stablePatients.length}</p>
            </div>
            <Heart className="w-8 h-8 text-green-600" />
          </div>
        </div>

        <div className="bg-gradient-to-r from-yellow-50 to-yellow-100 border border-yellow-200 rounded-xl p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-yellow-600">Improving</p>
              <p className="text-2xl font-bold text-yellow-900">{improvingPatients.length}</p>
            </div>
            <TrendingUp className="w-8 h-8 text-yellow-600" />
          </div>
        </div>
      </div>

      {/* Filter Controls */}
      <div className="flex gap-2">
        <button
          onClick={() => setFilterStatus('all')}
          className={`px-4 py-2 rounded-lg text-sm font-medium ${
            filterStatus === 'all' 
              ? 'bg-blue-600 text-white' 
              : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
          }`}
        >
          All ({patients.length})
        </button>
        <button
          onClick={() => setFilterStatus('critical')}
          className={`px-4 py-2 rounded-lg text-sm font-medium ${
            filterStatus === 'critical' 
              ? 'bg-red-600 text-white' 
              : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
          }`}
        >
          Critical ({criticalPatients.length})
        </button>
        <button
          onClick={() => setFilterStatus('stable')}
          className={`px-4 py-2 rounded-lg text-sm font-medium ${
            filterStatus === 'stable' 
              ? 'bg-green-600 text-white' 
              : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
          }`}
        >
          Stable ({stablePatients.length})
        </button>
        <button
          onClick={() => setFilterStatus('improving')}
          className={`px-4 py-2 rounded-lg text-sm font-medium ${
            filterStatus === 'improving' 
              ? 'bg-yellow-600 text-white' 
              : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
          }`}
        >
          Improving ({improvingPatients.length})
        </button>
      </div>

      {/* Patient Count */}
      <div className="mb-6">
        <p className="text-gray-600">
          Showing {filteredPatients.length} of {patients.length} patients
        </p>
      </div>

      {/* Enhanced Patient Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
        {filteredPatients.map((patient) => (
          <EnhancedPatientCard
            key={patient._id}
            patient={patient}
          />
        ))}
        
        {filteredPatients.length === 0 && (
          <div className="col-span-full text-center py-12">
            <p className="text-gray-500">No patients found matching your criteria.</p>
          </div>
        )}
      </div>

      {/* AI Risk Assessment Panel */}
      {selectedPatient && (
        <RiskAssessmentPanel 
          patient={selectedPatient}
        />
      )}

      {/* Enhanced Modals */}
      <EnhancedAddPatientModal
        show={isAdmissionModalOpen}
        onClose={() => setIsAdmissionModalOpen(false)}
        onSubmit={handleAdmitPatient}
      />
      
      <EditPatientModal 
        show={showEditModal} 
        patient={editingPatient}
        onClose={() => {
          setShowEditModal(false);
          setEditingPatient(null);
        }} 
        onSubmit={handleUpdatePatient} 
      />
      
      <DeletePatientModal 
        show={showDeleteModal} 
        patient={patientToDelete}
        onClose={() => {
          setShowDeleteModal(false);
          setPatientToDelete(null);
        }} 
        onConfirm={confirmDeletePatient} 
      />
    </div>
  )
} 