'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { useForm } from 'react-hook-form'
import { 
  Search, 
  Plus, 
  Filter, 
  Eye, 
  Edit, 
  AlertTriangle,
  Heart,
  Thermometer,
  Droplets,
  Activity,
  TrendingUp,
  Brain,
  X,
  User,
  Stethoscope
} from 'lucide-react'
import toast from 'react-hot-toast'
import api from '@/lib/api' // Import the API utility

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api'

export default function PatientsPage() {
  const [patients, setPatients] = useState([])
  const [filteredPatients, setFilteredPatients] = useState([])
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')
  const [loading, setLoading] = useState(true)
  const [selectedPatient, setSelectedPatient] = useState(null)
  const [showRiskModal, setShowRiskModal] = useState(false)
  const [riskAnalysis, setRiskAnalysis] = useState(null)
  const [analyzing, setAnalyzing] = useState(false)
  const [showAddPatientModal, setShowAddPatientModal] = useState(false)
  const [editingPatient, setEditingPatient] = useState(null)
  const [showEditModal, setShowEditModal] = useState(false)
  const [showDeleteModal, setShowDeleteModal] = useState(false)
  const [patientToDelete, setPatientToDelete] = useState(null)

  const { register, handleSubmit, reset, formState: { errors } } = useForm()

  const fetchPatients = async () => {
    try {
      setLoading(true);
      console.log('🔄 Fetching patients from API...');
      
      const response = await api.get('/patients');
      console.log('📊 Raw API response:', response);
      
      // Handle both direct array and object with data property
      const patientsData = Array.isArray(response) ? response : response.data || response;
      console.log('👥 Processed patients data:', patientsData);
      console.log('📈 Number of patients:', patientsData.length);
      
      if (!Array.isArray(patientsData)) {
        console.error('❌ Invalid patients data format:', typeof patientsData);
        throw new Error('Invalid data format received from server');
      }
      
      setPatients(patientsData);
      setFilteredPatients(patientsData);
      
      console.log('✅ Patients state updated successfully');
      // Removed the loaded amount toast message as requested
    } catch (error) {
      console.error('❌ Error fetching patients:', error);
      toast.error('❌ Failed to fetch patients. Please check your connection.');
      
      // Fallback to empty array if fetch fails
      setPatients([]);
      setFilteredPatients([]);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchPatients()
  }, [])

  useEffect(() => {
    filterPatients()
  }, [searchTerm, statusFilter, patients]) // Re-run filter when patients state changes

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

    if (statusFilter !== 'all') {
      filtered = filtered.filter(patient => patient.status === statusFilter)
    }

    setFilteredPatients(filtered)
  }

  const getStatusColor = (status) => {
    switch (status) {
      case 'stable': return 'status-stable'
      case 'observation': return 'status-observation'
      case 'critical': return 'status-critical'
      default: return 'bg-gray-100 text-gray-800 px-2 py-1 rounded-full text-sm font-medium'
    }
  }

  const getRiskColor = (riskLevel) => {
    switch (riskLevel) {
      case 'low': return 'text-success-600'
      case 'medium': return 'text-warning-600'
      case 'high': return 'text-danger-600'
      case 'critical': return 'text-red-800'
      default: return 'text-gray-600'
    }
  }

  const handleAddPatient = async (data) => {
    try {
      console.log('🚀 Starting patient creation...');
      console.log('📝 Form data received:', data);
      
      // Validate only essential fields
      if (!data.firstName || !data.lastName || !data.gender || !data.diagnosis) {
        toast.error('❌ Please fill in all required fields (First Name, Last Name, Gender, Diagnosis)');
        return;
      }
      
      // Add loading state
      toast.loading('Adding patient...', { id: 'add-patient' });
      
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
      
      console.log('🔄 Transformed data for API:', transformedData);
      console.log('🌐 API URL:', `${API_BASE_URL}/patients`);
      
      console.log('🔄 Patients state before API call:', patients.length);
      
      const response = await api.post('/patients', transformedData);
      console.log('✅ API Response received:', response);
      
      // Success notification
      toast.success(`🎉 Patient ${transformedData.name} added successfully!`, { 
        id: 'add-patient',
        duration: 5000 
      });
      
      setShowAddPatientModal(false);
      
      // Refresh patient list immediately after successful API call
      console.log('🔄 Refreshing patient list...');
      await fetchPatients();
      console.log('🔄 Patients state after refresh:', patients.length);
      
      console.log('✅ Patient creation completed successfully!');
    } catch (error) {
      console.error('❌ Error adding patient:', error);
      console.error('❌ Error details:', {
        message: error.message,
        response: error.response?.data,
        status: error.response?.status,
        stack: error.stack
      });
      
      // Error notification with details
      const errorMessage = error.response?.data?.error?.message || 
                          error.message || 
                          'Failed to add patient. Please try again.';
      
      toast.error(`❌ ${errorMessage}`, { 
        id: 'add-patient',
        duration: 8000 
      });
      
      // Make sure we don't update the patient list on error
      console.log('❌ API call failed, not updating patient list');
    }
  }

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

  // Handler functions for patient actions
  const handleViewPatient = (patient) => {
    setSelectedPatient(patient);
    // You can implement a view modal here
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
      
      await api.delete(`/patients/${patientToDelete._id}`);
      
      toast.success(`Patient ${patientToDelete.name} deleted successfully!`, { 
        id: 'delete-patient',
        duration: 5000 
      });
      
      setShowDeleteModal(false);
      setPatientToDelete(null);
      
      // Refresh patient list
      await fetchPatients();
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
      
      const response = await api.put(`/patients/${editingPatient._id}`, updatedData);
      
      toast.success(`Patient ${updatedData.name} updated successfully!`, { 
        id: 'update-patient',
        duration: 5000 
      });
      
      setShowEditModal(false);
      setEditingPatient(null);
      
      // Refresh patient list
      await fetchPatients();
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

  const PatientCard = ({ patient }) => (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="card hover:shadow-md transition-shadow duration-200"
    >
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <div className="flex items-center space-x-3 mb-3">
            <h3 className="text-lg font-semibold text-gray-900">
              {patient.name}
            </h3>
            <span className="text-sm text-gray-500">#{patient.patientId}</span>
            <span className={getStatusColor(patient.status)}>
              {patient.status.charAt(0).toUpperCase() + patient.status.slice(1)}
            </span>
          </div>
          
          <div className="flex items-center justify-between text-sm text-gray-600 mb-4">
            <span>Bed {patient.bedNumber} • {patient.diagnosis}</span>
            <span className="text-gray-500">Age: {patient.age}</span>
          </div>
          
          <div className="text-sm text-gray-600 mb-2">
            <p><strong>Attending Physician:</strong> {patient.attendingPhysician}</p>
            {patient.contactNumber && (
              <p><strong>Contact:</strong> {patient.contactNumber}</p>
            )}
          </div>
        </div>
        
        <div className="ml-4 flex flex-col items-end space-y-2">
          <div className="flex space-x-2">
            <button 
              onClick={() => handleViewPatient(patient)}
              className="p-2 bg-blue-50 hover:bg-blue-100 rounded-lg transition-colors duration-200"
              title="View Patient Details"
            >
              <Eye className="w-4 h-4 text-blue-600" />
            </button>
            <button 
              onClick={() => handleEditPatient(patient)}
              className="p-2 bg-green-50 hover:bg-green-100 rounded-lg transition-colors duration-200"
              title="Edit Patient"
            >
              <Edit className="w-4 h-4 text-green-600" />
            </button>
            <button 
              onClick={() => handleDeletePatient(patient)}
              className="p-2 bg-red-50 hover:bg-red-100 rounded-lg transition-colors duration-200"
              title="Delete Patient"
            >
              <X className="w-4 h-4 text-red-600" />
            </button>
          </div>
        </div>
      </div>
    </motion.div>
  )

  const RiskAnalysisModal = () => (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="bg-white rounded-xl p-6 max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto"
      >
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold text-gray-900">AI Risk Analysis</h2>
          <button
            onClick={() => setShowRiskModal(false)}
            className="text-gray-400 hover:text-gray-600"
          >
            ✕
          </button>
        </div>
        
        {selectedPatient && (
          <div className="mb-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              {selectedPatient.firstName} {selectedPatient.lastName} - Bed {selectedPatient.bedNumber}
            </h3>
            <p className="text-gray-600">{selectedPatient.diagnosis}</p>
          </div>
        )}
        
        {analyzing ? (
          <div className="text-center py-8">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto mb-4"></div>
            <p className="text-gray-600">Analyzing patient data with AI...</p>
          </div>
        ) : riskAnalysis ? (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="text-center p-4 bg-gray-50 rounded-lg">
                <div className="text-3xl font-bold text-primary-600 mb-2">
                  {riskAnalysis.riskScore}/10
                </div>
                <div className="text-sm text-gray-600">Risk Score</div>
              </div>
              
              <div className="text-center p-4 bg-gray-50 rounded-lg">
                <div className={`text-2xl font-bold mb-2 ${
                  riskAnalysis.riskLevel === 'low' ? 'text-success-600' :
                  riskAnalysis.riskLevel === 'medium' ? 'text-warning-600' :
                  riskAnalysis.riskLevel === 'high' ? 'text-danger-600' :
                  'text-red-800'
                }`}>
                  {riskAnalysis.riskLevel.toUpperCase()}
                </div>
                <div className="text-sm text-gray-600">Risk Level</div>
              </div>
              
              <div className="text-center p-4 bg-gray-50 rounded-lg">
                <div className="text-2xl font-bold text-blue-600 mb-2">
                  {Math.round(riskAnalysis.confidence * 100)}%
                </div>
                <div className="text-sm text-gray-600">Confidence</div>
              </div>
            </div>
            
            <div>
              <h4 className="font-semibold text-gray-900 mb-3">Risk Factors Identified</h4>
              <ul className="space-y-2">
                {riskAnalysis.riskFactors.map((factor, index) => (
                  <li key={index} className="flex items-start space-x-2">
                    <AlertTriangle className="w-4 h-4 text-warning-500 mt-0.5 flex-shrink-0" />
                    <span className="text-gray-700">{factor}</span>
                  </li>
                ))}
              </ul>
            </div>
            
            <div>
              <h4 className="font-semibold text-gray-900 mb-3">AI Recommendations</h4>
              <ul className="space-y-2">
                {riskAnalysis.recommendations.map((rec, index) => (
                  <li key={index} className="flex items-start space-x-2">
                    <TrendingUp className="w-4 h-4 text-success-500 mt-0.5 flex-shrink-0" />
                    <span className="text-gray-700">{rec}</span>
                  </li>
                ))}
              </ul>
            </div>
            
            <div className="p-4 bg-primary-50 rounded-lg">
              <div className="flex items-center space-x-2">
                <Activity className="w-5 h-5 text-primary-600" />
                <span className="font-medium text-primary-800">Recommended Monitoring Frequency:</span>
              </div>
              <p className="text-primary-700 mt-1">{riskAnalysis.monitoringFrequency}</p>
            </div>
          </div>
        ) : null}
      </motion.div>
    </div>
  )

  const AddPatientModal = ({ show, onClose, onSubmit }) => {
    const { register, handleSubmit, reset, formState: { errors, isSubmitting } } = useForm();
  
    useEffect(() => {
      if (!show) {
        reset();
      }
    }, [show, reset]);

    const handleFormSubmit = async (data) => {
      console.log('🎯 Form submitted with data:', data);
      
      try {
        await onSubmit(data);
        reset();
      } catch (error) {
        console.error('❌ Error in form submission:', error);
        toast.error(`❌ Form submission failed: ${error.message}`);
      }
    };
  
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
                  <label htmlFor="firstName" className="form-label">
                    First Name <span className="text-red-500">*</span>
                  </label>
                  <input 
                    type="text" 
                    id="firstName" 
                    {...register('firstName', { required: 'First Name is required' })} 
                    className={`input-field ${errors.firstName ? 'border-red-300' : ''}`}
                    placeholder="Enter first name"
                  />
                  {errors.firstName && <p className="text-red-500 text-sm mt-1">{errors.firstName.message}</p>}
                </div>
                
                <div>
                  <label htmlFor="lastName" className="form-label">
                    Last Name <span className="text-red-500">*</span>
                  </label>
                  <input 
                    type="text" 
                    id="lastName" 
                    {...register('lastName', { required: 'Last Name is required' })} 
                    className={`input-field ${errors.lastName ? 'border-red-300' : ''}`}
                    placeholder="Enter last name"
                  />
                  {errors.lastName && <p className="text-red-500 text-sm mt-1">{errors.lastName.message}</p>}
                </div>
                
                <div>
                  <label htmlFor="dateOfBirth" className="form-label">
                    Date of Birth <span className="text-red-500">*</span>
                  </label>
                  <input 
                    type="date" 
                    id="dateOfBirth" 
                    {...register('dateOfBirth', { required: 'Date of Birth is required' })} 
                    className={`input-field ${errors.dateOfBirth ? 'border-red-300' : ''}`}
                  />
                  {errors.dateOfBirth && <p className="text-red-500 text-sm mt-1">{errors.dateOfBirth.message}</p>}
                </div>
                
                <div>
                  <label htmlFor="gender" className="form-label">
                    Gender <span className="text-red-500">*</span>
                  </label>
                  <select 
                    id="gender" 
                    {...register('gender', { required: 'Gender is required' })} 
                    className={`input-field ${errors.gender ? 'border-red-300' : ''}`}
                  >
                    <option value="">Select Gender</option>
                    <option value="male">Male</option>
                    <option value="female">Female</option>
                    <option value="other">Other</option>
                  </select>
                  {errors.gender && <p className="text-red-500 text-sm mt-1">{errors.gender.message}</p>}
                </div>
                
                <div>
                  <label htmlFor="contactNumber" className="form-label">Contact Number</label>
                  <input 
                    type="tel" 
                    id="contactNumber" 
                    {...register('contactNumber')} 
                    className="input-field"
                    placeholder="Enter contact number"
                  />
                </div>
                
                <div>
                  <label htmlFor="patientId" className="form-label">Patient ID</label>
                  <input 
                    type="text" 
                    id="patientId" 
                    {...register('patientId')} 
                    className="input-field" 
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
                  <label htmlFor="diagnosis" className="form-label">
                    Diagnosis <span className="text-red-500">*</span>
                  </label>
                  <input 
                    type="text" 
                    id="diagnosis" 
                    {...register('diagnosis', { required: 'Diagnosis is required' })} 
                    className={`input-field ${errors.diagnosis ? 'border-red-300' : ''}`}
                    placeholder="Enter primary diagnosis"
                  />
                  {errors.diagnosis && <p className="text-red-500 text-sm mt-1">{errors.diagnosis.message}</p>}
                </div>
                
                <div>
                  <label htmlFor="admittingPhysician" className="form-label">Attending Physician</label>
                  <input 
                    type="text" 
                    id="admittingPhysician" 
                    {...register('admittingPhysician')} 
                    className="input-field" 
                    placeholder="Will be assigned if empty"
                  />
                </div>
                
                <div>
                  <label htmlFor="bedNumber" className="form-label">Bed Number</label>
                  <input 
                    type="text" 
                    id="bedNumber" 
                    {...register('bedNumber')} 
                    className="input-field" 
                    placeholder="Auto-assigned if empty"
                  />
                </div>
                
                <div>
                  <label htmlFor="status" className="form-label">Initial Status</label>
                  <select 
                    id="status" 
                    {...register('status')} 
                    className="input-field"
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
                className="px-8 py-3 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors font-medium flex items-center space-x-2 disabled:opacity-50"
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
        setValue('firstName', patient.name.split(' ')[0]);
        setValue('lastName', patient.name.split(' ').slice(1).join(' '));
        setValue('gender', patient.gender);
        setValue('diagnosis', patient.diagnosis);
        setValue('attendingPhysician', patient.attendingPhysician);
        setValue('bedNumber', patient.bedNumber);
        setValue('contactNumber', patient.contactNumber);
        setValue('patientId', patient.patientId);
      } else {
        reset();
      }
    }, [show, patient, reset, setValue]);

    const handleFormSubmit = async (data) => {
      try {
        await onSubmit(data);
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
          className="bg-white rounded-xl p-8 max-w-4xl w-full mx-4 max-h-[95vh] overflow-y-auto shadow-2xl"
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
          
          <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-8">
            {/* Personal Information Section */}
            <div className="bg-green-50 p-6 rounded-lg">
              <h3 className="text-xl font-semibold text-gray-800 mb-4 flex items-center">
                <User className="w-5 h-5 mr-2 text-green-600" />
                Personal Information
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                <div>
                  <label htmlFor="firstName" className="form-label">
                    First Name <span className="text-red-500">*</span>
                  </label>
                  <input 
                    type="text" 
                    id="firstName" 
                    {...register('firstName', { required: 'First Name is required' })} 
                    className={`input-field ${errors.firstName ? 'border-red-300' : ''}`}
                  />
                  {errors.firstName && <p className="text-red-500 text-sm mt-1">{errors.firstName.message}</p>}
                </div>
                
                <div>
                  <label htmlFor="lastName" className="form-label">
                    Last Name <span className="text-red-500">*</span>
                  </label>
                  <input 
                    type="text" 
                    id="lastName" 
                    {...register('lastName', { required: 'Last Name is required' })} 
                    className={`input-field ${errors.lastName ? 'border-red-300' : ''}`}
                  />
                  {errors.lastName && <p className="text-red-500 text-sm mt-1">{errors.lastName.message}</p>}
                </div>
                
                <div>
                  <label htmlFor="gender" className="form-label">
                    Gender <span className="text-red-500">*</span>
                  </label>
                  <select 
                    id="gender" 
                    {...register('gender', { required: 'Gender is required' })} 
                    className={`input-field ${errors.gender ? 'border-red-300' : ''}`}
                  >
                    <option value="">Select Gender</option>
                    <option value="male">Male</option>
                    <option value="female">Female</option>
                    <option value="other">Other</option>
                  </select>
                  {errors.gender && <p className="text-red-500 text-sm mt-1">{errors.gender.message}</p>}
                </div>
                
                <div>
                  <label htmlFor="contactNumber" className="form-label">Contact Number</label>
                  <input 
                    type="tel" 
                    id="contactNumber" 
                    {...register('contactNumber')} 
                    className="input-field"
                  />
                </div>
                
                <div>
                  <label htmlFor="patientId" className="form-label">Patient ID</label>
                  <input 
                    type="text" 
                    id="patientId" 
                    {...register('patientId')} 
                    className="input-field"
                    disabled
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
                  <label htmlFor="diagnosis" className="form-label">
                    Diagnosis <span className="text-red-500">*</span>
                  </label>
                  <input 
                    type="text" 
                    id="diagnosis" 
                    {...register('diagnosis', { required: 'Diagnosis is required' })} 
                    className={`input-field ${errors.diagnosis ? 'border-red-300' : ''}`}
                  />
                  {errors.diagnosis && <p className="text-red-500 text-sm mt-1">{errors.diagnosis.message}</p>}
                </div>
                
                <div>
                  <label htmlFor="attendingPhysician" className="form-label">Attending Physician</label>
                  <input 
                    type="text" 
                    id="attendingPhysician" 
                    {...register('attendingPhysician')} 
                    className="input-field"
                  />
                </div>
                
                <div>
                  <label htmlFor="bedNumber" className="form-label">Bed Number</label>
                  <input 
                    type="text" 
                    id="bedNumber" 
                    {...register('bedNumber')} 
                    className="input-field"
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

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading patients...</p>
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
            <h1 className="text-2xl font-bold text-gray-900">Patient Management</h1>
            <button 
              onClick={() => setShowAddPatientModal(true)}
              className="btn-primary flex items-center space-x-2"
            >
              <Plus className="w-4 h-4" />
              <span>Add Patient</span>
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Search and Filters */}
        <div className="mb-8">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="text"
                placeholder="Search patients by name, ID, or diagnosis..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="input-field pl-10"
              />
            </div>
            
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="input-field md:w-48"
            >
              <option value="all">All Statuses</option>
              <option value="stable">Stable</option>
              <option value="observation">Under Observation</option>
              <option value="critical">Critical</option>
            </select>
            
            <button className="btn-secondary flex items-center space-x-2">
              <Filter className="w-4 h-4" />
              <span>More Filters</span>
            </button>
          </div>
        </div>

        {/* Patient Count */}
        <div className="mb-6">
          <p className="text-gray-600">
            Showing {filteredPatients.length} of {patients.length} patients
          </p>
        </div>

        {/* Patients Grid */}
        <div className="space-y-6">
          {filteredPatients.map((patient) => (
            <PatientCard key={patient.id} patient={patient} />
          ))}
          
          {filteredPatients.length === 0 && (
            <div className="text-center py-12">
              <p className="text-gray-500">No patients found matching your criteria.</p>
            </div>
          )}
        </div>
      </div>

      {showRiskModal && <RiskAnalysisModal />}
      
      <AddPatientModal 
        show={showAddPatientModal} 
        onClose={() => setShowAddPatientModal(false)} 
        onSubmit={handleAddPatient} 
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
