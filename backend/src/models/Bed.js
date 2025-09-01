import mongoose from 'mongoose';

const bedSchema = new mongoose.Schema({
  number: {
    type: String,
    required: true,
    unique: true,
    trim: true
  },
  roomNumber: {
    type: String,
    trim: true,
    default: null
  },
  floor: {
    type: Number,
    min: 1,
    default: 1
  },
  ward: {
    type: String,
    trim: true,
    default: 'ICU'
  },
  bedType: {
    type: String,
    enum: ['ICU', 'HDU', 'General', 'Isolation'],
    default: 'ICU'
  },
  status: {
    type: String,
    enum: ['available', 'occupied', 'cleaning', 'maintenance'],
    default: 'available'
  },
  patient: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Patient',
    default: null
  },
  equipment: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Equipment'
  }],
  features: {
    ventilator: {
      type: Boolean,
      default: false
    },
    monitor: {
      type: Boolean,
      default: true
    },
    oxygenSupply: {
      type: Boolean,
      default: true
    },
    suction: {
      type: Boolean,
      default: false
    }
  },
  notes: {
    type: String,
    trim: true
  },
  lastCleaned: {
    type: Date
  },
  lastMaintenance: {
    type: Date
  },
  assignedNurse: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Staff'
  }
}, {
  timestamps: true
});

// Indexes for better query performance
bedSchema.index({ status: 1 });
bedSchema.index({ roomNumber: 1 });
bedSchema.index({ ward: 1 });
bedSchema.index({ bedType: 1 });

// Virtual for bed availability
bedSchema.virtual('isAvailable').get(function() {
  return this.status === 'available' && !this.patient;
});

// Method to assign patient to bed
bedSchema.methods.assignPatient = function(patientId) {
  if (this.status !== 'available') {
    throw new Error('Bed is not available for assignment');
  }
  this.patient = patientId;
  this.status = 'occupied';
  return this.save();
};

// Method to discharge patient from bed
bedSchema.methods.dischargePatient = function() {
  this.patient = null;
  this.status = 'cleaning';
  return this.save();
};

// Method to complete cleaning
bedSchema.methods.completeCleaning = function() {
  if (this.status === 'cleaning') {
    this.status = 'available';
    this.lastCleaned = new Date();
  }
  return this.save();
};

// Method to mark for maintenance
bedSchema.methods.markForMaintenance = function(notes = '') {
  this.status = 'maintenance';
  this.notes = notes;
  return this.save();
};

// Method to complete maintenance
bedSchema.methods.completeMaintenance = function() {
  if (this.status === 'maintenance') {
    this.status = 'available';
    this.lastMaintenance = new Date();
    this.notes = '';
  }
  return this.save();
};

// Static method to get bed statistics
bedSchema.statics.getStats = async function() {
  const stats = await this.aggregate([
    {
      $group: {
        _id: '$status',
        count: { $sum: 1 }
      }
    }
  ]);
  
  const result = {
    total: await this.countDocuments(),
    available: 0,
    occupied: 0,
    cleaning: 0,
    maintenance: 0
  };
  
  stats.forEach(stat => {
    result[stat._id] = stat.count;
  });
  
  return result;
};

// Static method to find available beds
bedSchema.statics.findAvailable = function(bedType = null) {
  const query = { status: 'available', patient: null };
  if (bedType) {
    query.bedType = bedType;
  }
  return this.find(query).populate('assignedNurse', 'name');
};

export default mongoose.model('Bed', bedSchema);
