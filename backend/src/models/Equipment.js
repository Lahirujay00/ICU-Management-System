import mongoose from 'mongoose'

const maintenanceRecordSchema = new mongoose.Schema({
  date: { type: Date, required: true },
  type: { 
    type: String, 
    enum: ['preventive', 'corrective', 'calibration', 'inspection'], 
    required: true 
  },
  description: String,
  technician: String,
  cost: Number,
  nextMaintenanceDate: Date,
  status: { 
    type: String, 
    enum: ['completed', 'scheduled', 'in_progress'], 
    default: 'completed' 
  }
})

const equipmentSchema = new mongoose.Schema({
  equipmentId: { type: String, required: true, unique: true },
  name: { type: String, required: true },
  model: String,
  manufacturer: String,
  serialNumber: String,
  
  // Equipment Details
  category: { 
    type: String, 
    enum: ['monitoring', 'respiratory', 'cardiac', 'surgical', 'diagnostic', 'other'], 
    required: true 
  },
  subcategory: String,
  description: String,
  
  // Location and Assignment
  location: { type: String, required: true },
  roomNumber: String,
  bedNumber: String,
  assignedPatient: { type: mongoose.Schema.Types.ObjectId, ref: 'Patient' },
  
  // Status and Condition
  status: { 
    type: String, 
    enum: ['available', 'in_use', 'maintenance', 'out_of_order', 'retired'], 
    default: 'available' 
  },
  condition: { 
    type: String, 
    enum: ['excellent', 'good', 'fair', 'poor', 'critical'], 
    default: 'good' 
  },
  
  // Purchase and Warranty
  purchaseDate: Date,
  warrantyExpiry: Date,
  purchaseCost: Number,
  supplier: String,
  
  // Maintenance
  maintenanceRecords: [maintenanceRecordSchema],
  lastMaintenanceDate: Date,
  nextMaintenanceDate: Date,
  maintenanceFrequency: String, // e.g., "Every 6 months"
  
  // Calibration and Certification
  calibrationRequired: { type: Boolean, default: false },
  lastCalibrationDate: Date,
  nextCalibrationDate: Date,
  calibrationFrequency: String,
  
  // Usage Tracking
  totalUsageHours: { type: Number, default: 0 },
  dailyUsageHours: { type: Number, default: 0 },
  lastUsed: Date,
  
  // Alerts and Notifications
  alertThresholds: {
    maintenanceDue: { type: Number, default: 30 }, // days before due
    calibrationDue: { type: Number, default: 30 },
    warrantyExpiry: { type: Number, default: 90 }
  },
  
  // Documentation
  userManual: String, // URL or file path
  specifications: String,
  notes: String,
  
  // Timestamps
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
  
  // Add these fields:
  quantity: { type: Number, default: 1 },
  minQuantity: { type: Number, default: 1 }
})

// Update timestamp on save
equipmentSchema.pre('save', function(next) {
  this.updatedAt = new Date()
  next()
})

// Virtual for equipment age
equipmentSchema.virtual('age').get(function() {
  if (!this.purchaseDate) return null
  const today = new Date()
  const purchaseDate = new Date(this.purchaseDate)
  let age = today.getFullYear() - purchaseDate.getFullYear()
  const monthDiff = today.getMonth() - purchaseDate.getMonth()
  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < purchaseDate.getDate())) {
    age--
  }
  return age
})

// Virtual for days until next maintenance
equipmentSchema.virtual('daysUntilMaintenance').get(function() {
  if (!this.nextMaintenanceDate) return null
  const today = new Date()
  const maintenanceDate = new Date(this.nextMaintenanceDate)
  const diffTime = maintenanceDate - today
  return Math.ceil(diffTime / (1000 * 60 * 60 * 24))
})

// Virtual for days until warranty expiry
equipmentSchema.virtual('daysUntilWarrantyExpiry').get(function() {
  if (!this.warrantyExpiry) return null
  const today = new Date()
  const warrantyDate = new Date(this.warrantyExpiry)
  const diffTime = warrantyDate - today
  return Math.ceil(diffTime / (1000 * 60 * 60 * 24))
})

// Indexes for better query performance
equipmentSchema.index({ category: 1 })
equipmentSchema.index({ status: 1 })
equipmentSchema.index({ location: 1 })
equipmentSchema.index({ assignedPatient: 1 })
equipmentSchema.index({ nextMaintenanceDate: 1 })
equipmentSchema.index({ nextCalibrationDate: 1 })

export default mongoose.models.Equipment || mongoose.model('Equipment', equipmentSchema)
