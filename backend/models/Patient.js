import mongoose from 'mongoose'

const vitalSignsSchema = new mongoose.Schema({
  heartRate: { type: Number, min: 0, max: 300 },
  bloodPressure: {
    systolic: { type: Number, min: 0, max: 300 },
    diastolic: { type: Number, min: 0, max: 200 }
  },
  temperature: { type: Number, min: 30, max: 45 },
  oxygenSaturation: { type: Number, min: 0, max: 100 },
  respiratoryRate: { type: Number, min: 0, max: 100 },
  timestamp: { type: Date, default: Date.now }
})

const medicationSchema = new mongoose.Schema({
  name: { type: String, required: true },
  dosage: { type: String, required: true },
  frequency: { type: String, required: true },
  route: { type: String, required: true },
  startDate: { type: Date, required: true },
  endDate: { type: Date },
  status: { type: String, enum: ['active', 'discontinued', 'completed'], default: 'active' },
  notes: String
})

const labResultSchema = new mongoose.Schema({
  testName: { type: String, required: true },
  value: { type: String, required: true },
  unit: String,
  referenceRange: String,
  status: { type: String, enum: ['normal', 'high', 'low', 'critical'], default: 'normal' },
  timestamp: { type: Date, default: Date.now },
  notes: String
})

const patientSchema = new mongoose.Schema({
  patientId: { type: String, required: true, unique: true },
  firstName: { type: String, required: true },
  lastName: { type: String, required: true },
  dateOfBirth: { type: Date, required: true },
  gender: { type: String, enum: ['male', 'female', 'other'], required: true },
  contactNumber: String,
  emergencyContact: {
    name: String,
    relationship: String,
    phone: String
  },
  
  // Medical Information
  diagnosis: { type: String, required: true },
  admittingPhysician: { type: String, required: true },
  admissionDate: { type: Date, default: Date.now },
  dischargeDate: Date,
  status: { 
    type: String, 
    enum: ['admitted', 'stable', 'observation', 'critical', 'discharged'], 
    default: 'admitted' 
  },
  
  // Clinical Data
  vitalSigns: [vitalSignsSchema],
  medications: [medicationSchema],
  labResults: [labResultSchema],
  
  // AI Risk Assessment
  riskScore: { type: Number, min: 1, max: 10, default: 5 },
  riskLevel: { 
    type: String, 
    enum: ['low', 'medium', 'high', 'critical'], 
    default: 'medium' 
  },
  lastRiskAssessment: Date,
  
  // Medical History
  allergies: [String],
  chronicConditions: [String],
  surgicalHistory: [String],
  
  // Notes and Documentation
  clinicalNotes: [{
    content: String,
    author: String,
    timestamp: { type: Date, default: Date.now }
  }],
  
  // Bed Assignment
  bedNumber: { type: String, required: true },
  roomNumber: String,
  
  // Insurance and Administrative
  insuranceProvider: String,
  insuranceNumber: String,
  
  // Timestamps
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
})

// Update timestamp on save
patientSchema.pre('save', function(next) {
  this.updatedAt = new Date()
  next()
})

// Virtual for full name
patientSchema.virtual('fullName').get(function() {
  return `${this.firstName} ${this.lastName}`
})

// Virtual for age
patientSchema.virtual('age').get(function() {
  if (!this.dateOfBirth) return null
  const today = new Date()
  const birthDate = new Date(this.dateOfBirth)
  let age = today.getFullYear() - birthDate.getFullYear()
  const monthDiff = today.getMonth() - birthDate.getMonth()
  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
    age--
  }
  return age
})

// Virtual for length of stay
patientSchema.virtual('lengthOfStay').get(function() {
  if (!this.admissionDate) return 0
  const today = this.dischargeDate || new Date()
  const diffTime = Math.abs(today - this.admissionDate)
  return Math.ceil(diffTime / (1000 * 60 * 60 * 24))
})

// Indexes for better query performance
patientSchema.index({ status: 1 })
patientSchema.index({ bedNumber: 1 })
patientSchema.index({ admissionDate: 1 })
patientSchema.index({ riskLevel: 1 })

export default mongoose.models.Patient || mongoose.model('Patient', patientSchema)
