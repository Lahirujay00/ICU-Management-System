import mongoose from 'mongoose'

const scheduleSchema = new mongoose.Schema({
  date: { type: Date, required: true },
  shift: { 
    type: String, 
    enum: ['morning', 'afternoon', 'night'], 
    required: true 
  },
  startTime: { type: String, required: true },
  endTime: { type: String, required: true },
  status: { 
    type: String, 
    enum: ['scheduled', 'confirmed', 'completed', 'cancelled'], 
    default: 'scheduled' 
  }
})

const staffSchema = new mongoose.Schema({
  employeeId: { type: String, required: true, unique: true },
  firstName: { type: String, required: true },
  lastName: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  phone: { type: String, required: true },
  dateOfBirth: { type: Date, required: true },
  gender: { type: String, enum: ['male', 'female', 'other'], required: true },
  
  // Professional Information
  role: { 
    type: String, 
    enum: ['doctor', 'nurse', 'respiratory_therapist', 'pharmacist', 'technician', 'administrator'], 
    required: true 
  },
  specialization: String,
  licenseNumber: String,
  certifications: [String],
  hireDate: { type: Date, default: Date.now },
  
  // Schedule and Availability
  schedules: [scheduleSchema],
  availability: {
    monday: { type: Boolean, default: true },
    tuesday: { type: Boolean, default: true },
    wednesday: { type: Boolean, default: true },
    thursday: { type: Boolean, default: true },
    friday: { type: Boolean, default: true },
    saturday: { type: Boolean, default: false },
    sunday: { type: Boolean, default: false }
  },
  
  // Work Assignment
  assignedPatients: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Patient' }],
  currentShift: {
    type: String,
    enum: ['morning', 'afternoon', 'night', 'off'],
    default: 'off'
  },
  
  // Performance and Status
  status: { 
    type: String, 
    enum: ['active', 'on_leave', 'terminated', 'suspended'], 
    default: 'active' 
  },
  performanceRating: { type: Number, min: 1, max: 5, default: 3 },
  
  // Contact and Emergency
  emergencyContact: {
    name: String,
    relationship: String,
    phone: String
  },
  
  // Administrative
  department: { type: String, default: 'ICU' },
  supervisor: { type: mongoose.Schema.Types.ObjectId, ref: 'Staff' },
  
  // Timestamps
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
})

// Update timestamp on save
staffSchema.pre('save', function(next) {
  this.updatedAt = new Date()
  next()
})

// Virtual for full name
staffSchema.virtual('fullName').get(function() {
  return `${this.firstName} ${this.lastName}`
})

// Virtual for age
staffSchema.virtual('age').get(function() {
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

// Virtual for years of service
staffSchema.virtual('yearsOfService').get(function() {
  if (!this.hireDate) return 0
  const today = new Date()
  const hireDate = new Date(this.hireDate)
  let years = today.getFullYear() - hireDate.getFullYear()
  const monthDiff = today.getMonth() - hireDate.getMonth()
  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < hireDate.getDate())) {
    years--
  }
  return years
})

// Indexes for better query performance
staffSchema.index({ role: 1 })
staffSchema.index({ status: 1 })
staffSchema.index({ department: 1 })

export default mongoose.models.Staff || mongoose.model('Staff', staffSchema)
