import mongoose from 'mongoose';

const vitalSignsSchema = new mongoose.Schema({
  temperature: {
    type: Number,
    min: 30,
    max: 45
  },
  bloodPressure: {
    systolic: {
      type: Number,
      min: 60,
      max: 250
    },
    diastolic: {
      type: Number,
      min: 40,
      max: 150
    }
  },
  heartRate: {
    type: Number,
    min: 40,
    max: 200
  },
  respiratoryRate: {
    type: Number,
    min: 8,
    max: 60
  },
  oxygenSaturation: {
    type: Number,
    min: 70,
    max: 100
  },
  timestamp: {
    type: Date,
    default: Date.now
  },
  recordedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  }
});

const patientNoteSchema = new mongoose.Schema({
  content: {
    type: String,
    required: true,
    trim: true
  },
  type: {
    type: String,
    enum: ['clinical', 'nursing', 'general'],
    default: 'general'
  },
  timestamp: {
    type: Date,
    default: Date.now
  },
  author: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  }
});

const patientSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Patient name is required'],
    trim: true
  },
  age: {
    type: Number,
    required: [true, 'Age is required'],
    min: [0, 'Age cannot be negative'],
    max: [150, 'Age cannot exceed 150']
  },
  gender: {
    type: String,
    enum: ['male', 'female', 'other'],
    required: [true, 'Gender is required']
  },
  admissionDate: {
    type: Date,
    required: [true, 'Admission date is required'],
    default: Date.now
  },
  diagnosis: {
    type: String,
    required: [true, 'Diagnosis is required'],
    trim: true
  },
  roomNumber: {
    type: String,
    required: [true, 'Room number is required'],
    trim: true
  },
  bedNumber: {
    type: String,
    required: [true, 'Bed number is required'],
    trim: true
  },
  patientId: {
    type: String,
    trim: true
  },
  attendingPhysician: {
    type: String,
    trim: true
  },
  status: {
    type: String,
    enum: ['stable', 'critical', 'improving', 'deteriorating', 'discharged'],
    default: 'stable'
  },
  assignedDoctor: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  assignedNurse: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  vitalSigns: [vitalSignsSchema],
  notes: [patientNoteSchema],
  emergencyContact: {
    name: String,
    relationship: String,
    phone: String
  },
  medicalHistory: [String],
  allergies: [String],
  medications: [{
    name: String,
    dosage: String,
    frequency: String,
    startDate: Date,
    endDate: Date
  }],
  dischargeDate: Date,
  dischargeReason: {
    type: String,
    enum: ['discharged', 'transfer', 'death', 'against_medical_advice'],
    default: null
  },
  dischargeNotes: {
    type: String,
    trim: true
  },
  dischargedBy: {
    type: String,
    trim: true
  },
  destination: {
    type: String,
    trim: true
  },
  isActive: {
    type: Boolean,
    default: true
  }
}, {
  timestamps: true
});

// Indexes for better query performance
patientSchema.index({ name: 'text', diagnosis: 'text' });
patientSchema.index({ status: 1 });
patientSchema.index({ roomNumber: 1 });
patientSchema.index({ admissionDate: -1 });

// Virtual for patient age in years
patientSchema.virtual('ageInYears').get(function() {
  if (this.admissionDate) {
    const today = new Date();
    const birthDate = new Date(today.getFullYear() - this.age, today.getMonth(), today.getDate());
    return today.getFullYear() - birthDate.getFullYear();
  }
  return this.age;
});

// Method to get latest vital signs
patientSchema.methods.getLatestVitals = function() {
  if (this.vitalSigns.length === 0) return null;
  return this.vitalSigns[this.vitalSigns.length - 1];
};

// Method to check if patient is critical
patientSchema.methods.isCritical = function() {
  const latestVitals = this.getLatestVitals();
  if (!latestVitals) return false;
  
  return (
    latestVitals.heartRate > 120 || latestVitals.heartRate < 50 ||
    latestVitals.bloodPressure.systolic > 180 || latestVitals.bloodPressure.systolic < 90 ||
    latestVitals.oxygenSaturation < 90 ||
    latestVitals.temperature > 39 || latestVitals.temperature < 35
  );
};

export default mongoose.model('Patient', patientSchema); 