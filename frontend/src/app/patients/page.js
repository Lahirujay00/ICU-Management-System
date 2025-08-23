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
  X
} from 'lucide-react'
import toast from 'react-hot-toast'
import api from '@/lib/api' // Import the API utility

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

  const { register, handleSubmit, reset, formState: { errors } } = useForm()

  const fetchPatients = async () => {
    try {
      setLoading(true);
      console.log('Fetching patients from API...');
      
      const response = await api.get('/patients');
      console.log('Patients fetched successfully:', response);
      
      // Handle both direct array and object with data property
      const patientsData = Array.isArray(response) ? response : response.data || response;
      
      setPatients(patientsData);
      setFilteredPatients(patientsData);
      
      toast.success(`Loaded ${patientsData.length} patients`);
    } catch (error) {
      console.error('Error fetching patients:', error);
      toast.error('Failed to fetch patients. Using offline mode.');
      
      // Fallback to empty array if fetch fails
      setPatients([]);
      setFilteredPatients([]);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchPatients()
    toast.success('Patient management loaded')
  }, [])

  useEffect(() => {
    filterPatients()
  }, [searchTerm, statusFilter, patients]) // Re-run filter when patients state changes

  const filterPatients = () => {
    let filtered = patients

    if (searchTerm) {
      filtered = filtered.filter(patient => 
        patient.firstName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        patient.lastName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        patient.patientId.toLowerCase().includes(searchTerm.toLowerCase()) ||
        patient.diagnosis.toLowerCase().includes(searchTerm.toLowerCase())
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
      console.log('Attempting to add patient with data:', data);
      
      // Add loading state
      toast.loading('Adding patient...', { id: 'add-patient' });
      
      // Transform the data to match backend expectations
      const transformedData = {
        name: `${data.firstName} ${data.lastName}`.trim(),
        age: data.dateOfBirth ? calculateAge(data.dateOfBirth) : 25, // Default age if calculation fails
        gender: data.gender,
        diagnosis: data.diagnosis,
        bedNumber: data.bedNumber,
        attendingPhysician: data.admittingPhysician,
        patientId: data.patientId,
        contactNumber: data.contactNumber
      };
      
      console.log('Transformed data for backend:', transformedData);
      
      const response = await api.post('/patients', transformedData);
      console.log('Patient added successfully:', response);
      
      // Success notification
      toast.success(`Patient ${transformedData.name} added successfully!`, { 
        id: 'add-patient',
        duration: 4000 
      });
      
      setShowAddPatientModal(false);
      reset(); // Clear form fields
      fetchPatients(); // Refresh patient list
    } catch (error) {
      console.error('Error adding patient:', error);
      
      // Error notification with details
      const errorMessage = error.response?.data?.error?.message || 
                          error.message || 
                          'Failed to add patient. Please try again.';
      
      toast.error(errorMessage, { 
        id: 'add-patient',
        duration: 6000 
      });
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
              {patient.firstName} {patient.lastName}
            </h3>
            <span className="text-sm text-gray-500">#{patient.patientId}</span>
            {/* Patient status is not directly available in the fetched patient object */}
            {/* <span className={getStatusColor(patient.status)}>
              {patient.status.charAt(0).toUpperCase() + patient.status.slice(1)}
            </span> */}
          </div>
          
          {/* Vital signs are not directly available in the fetched patient object */}
          {/* <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
            <div className="text-center">
              <div className="flex items-center justify-center mb-1">
                <Heart className="w-4 h-4 text-red-500 mr-1" />
                <span className="text-sm font-medium">{patient.vitalSigns.heartRate}</span>
              </div>
              <span className="text-xs text-gray-500">BPM</span>
            </div>
            
            <div className="text-center">
              <div className="flex items-center justify-center mb-1">
                <Activity className="w-4 h-4 text-blue-500 mr-1" />
                <span className="text-sm font-medium">{patient.vitalSigns.bloodPressure.systolic}/{patient.vitalSigns.bloodPressure.diastolic}</span>
              </div>
              <span className="text-xs text-gray-500">mmHg</span>
            </div>
            
            <div className="text-center">
              <div className="flex items-center justify-center mb-1">
                <Thermometer className="w-4 h-4 text-orange-500 mr-1" />
                <span className="text-sm font-medium">{patient.vitalSigns.temperature}°C</span>
              </div>
              <span className="text-xs text-gray-500">Temp</span>
            </div>
            
            <div className="text-center">
              <div className="flex items-center justify-center mb-1">
                <Droplets className="w-4 h-4 text-cyan-500 mr-1" />
                <span className="text-sm font-medium">{patient.vitalSigns.oxygenSaturation}%</span>
              </div>
              <span className="text-xs text-gray-500">SpO2</span>
            </div>
          </div> */}
          
          <div className="flex items-center justify-between text-sm text-gray-600">
            <span>Bed {patient.bedNumber} • {patient.diagnosis}</span>
            {/* <span>LOS: {patient.lengthOfStay} days</span> */}
          </div>
        </div>
        
        <div className="ml-4 flex flex-col items-end space-y-2">
          {/* Risk score and level are not directly available in the fetched patient object */}
          {/* <div className="text-right">
            <div className={`text-2xl font-bold ${getRiskColor(patient.riskLevel)}`}>
              {patient.riskScore}
            </div>
            <div className={`text-xs font-medium ${getRiskColor(patient.riskLevel)}`}>
              {patient.riskLevel.toUpperCase()} RISK
            </div>
          </div> */}
          
          <div className="flex space-x-2">
            {/* <button
              onClick={() => analyzePatientRisk(patient)}
              className="p-2 bg-primary-50 hover:bg-primary-100 rounded-lg transition-colors duration-200"
              title="AI Risk Analysis"
            >
              <Brain className="w-4 h-4 text-primary-600" />
            </button> */}
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
    const { register, handleSubmit, reset, formState: { errors } } = useForm();
  
    useEffect(() => {
      if (!show) {
        reset();
      }
    }, [show, reset]);
  
    if (!show) return null;
  
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="bg-white rounded-xl p-6 max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto"
        >
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-gray-900">Add New Patient</h2>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600"
            >
              <X className="w-6 h-6" />
            </button>
          </div>
          
          <form onSubmit={handleSubmit(onSubmit)} className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label htmlFor="patientId" className="form-label">Patient ID</label>
              <input type="text" id="patientId" {...register('patientId', { required: 'Patient ID is required' })} className="input-field" />
              {errors.patientId && <p className="text-red-500 text-sm mt-1">{errors.patientId.message}</p>}
            </div>
            <div>
              <label htmlFor="firstName" className="form-label">First Name</label>
              <input type="text" id="firstName" {...register('firstName', { required: 'First Name is required' })} className="input-field" />
              {errors.firstName && <p className="text-red-500 text-sm mt-1">{errors.firstName.message}</p>}
            </div>
            <div>
              <label htmlFor="lastName" className="form-label">Last Name</label>
              <input type="text" id="lastName" {...register('lastName', { required: 'Last Name is required' })} className="input-field" />
              {errors.lastName && <p className="text-red-500 text-sm mt-1">{errors.lastName.message}</p>}
            </div>
            <div>
              <label htmlFor="dateOfBirth" className="form-label">Date of Birth</label>
              <input type="date" id="dateOfBirth" {...register('dateOfBirth', { required: 'Date of Birth is required' })} className="input-field" />
              {errors.dateOfBirth && <p className="text-red-500 text-sm mt-1">{errors.dateOfBirth.message}</p>}
            </div>
            <div>
              <label htmlFor="gender" className="form-label">Gender</label>
              <select id="gender" {...register('gender', { required: 'Gender is required' })} className="input-field">
                <option value="">Select Gender</option>
                <option value="male">Male</option>
                <option value="female">Female</option>
                <option value="other">Other</option>
              </select>
              {errors.gender && <p className="text-red-500 text-sm mt-1">{errors.gender.message}</p>}
            </div>
            <div>
              <label htmlFor="contactNumber" className="form-label">Contact Number</label>
              <input type="text" id="contactNumber" {...register('contactNumber')} className="input-field" />
            </div>
            <div>
              <label htmlFor="diagnosis" className="form-label">Diagnosis</label>
              <input type="text" id="diagnosis" {...register('diagnosis', { required: 'Diagnosis is required' })} className="input-field" />
              {errors.diagnosis && <p className="text-red-500 text-sm mt-1">{errors.diagnosis.message}</p>}
            </div>
            <div>
              <label htmlFor="admittingPhysician" className="form-label">Admitting Physician</label>
              <input type="text" id="admittingPhysician" {...register('admittingPhysician', { required: 'Admitting Physician is required' })} className="input-field" />
              {errors.admittingPhysician && <p className="text-red-500 text-sm mt-1">{errors.admittingPhysician.message}</p>}
            </div>
            <div>
              <label htmlFor="bedNumber" className="form-label">Bed Number</label>
              <input type="text" id="bedNumber" {...register('bedNumber', { required: 'Bed Number is required' })} className="input-field" />
              {errors.bedNumber && <p className="text-red-500 text-sm mt-1">{errors.bedNumber.message}</p>}
            </div>
            
            <div className="md:col-span-2 flex justify-end space-x-2 mt-4">
              <button type="button" onClick={onClose} className="btn-secondary">Cancel</button>
              <button type="submit" className="btn-primary">Add Patient</button>
            </div>
          </form>
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
    </div>
  )
}
