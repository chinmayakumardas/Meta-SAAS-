const mongoose = require('mongoose');

const TenantSchema = new mongoose.Schema({
  businessName: { 
    type: String, 
    required: [true, 'Business name is required'],
    trim: true
  },
  email: { 
    type: String, 
    required: [true, 'Email is required'],
    trim: true,
    lowercase: true,
    match: [/^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/, 'Please provide a valid email']
  },
  tenantId: { 
    type: String, 
    required: [true, 'Tenant ID is required'],
    trim: true
  },
  isVerified: { type: Boolean, default: false },
  isActive: { type: Boolean, default: true },
  businessType: { 
    type: String,
    trim: true
  },
  contactNumber: { 
    type: String,
    trim: true
  },
  address: {
    street: String,
    city: String,
    state: String,
    country: String,
    zipCode: String
  },
  applicationId: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'Application' 
  },
  createdBy: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'Admin' 
  }
}, { 
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Create compound indexes for faster queries
TenantSchema.index({ tenantId: 1, email: 1, businessName: 1, isActive: 1, isVerified: 1, createdAt: -1 }, { unique: true });

// Pre-save middleware to generate tenantId if not provided
TenantSchema.pre('save', function(next) {
  if (!this.tenantId) {
    this.tenantId = this.businessName
      .toLowerCase()
      .replace(/[^a-z0-9]/g, '')
      .slice(0, 8) + 
      Math.random().toString(36).slice(2, 6);
  }
  next();
});

module.exports = mongoose.model('Tenant', TenantSchema);
