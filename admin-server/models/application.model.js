const mongoose = require('mongoose');
const { APPLICATION_STATUS, DOCUMENT_TYPES } = require('../config/appConfig');

const applicationSchema = new mongoose.Schema({
  tenantId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Tenant',
    required: [true, 'Tenant ID is required']
  },
  businessDetails: {
    name: {
      type: String,
      required: [true, 'Business name is required'],
      trim: true
    },
    type: {
      type: String,
      required: [true, 'Business type is required'],
      trim: true
    },
    registrationNumber: {
      type: String,
      trim: true
    },
    foundedYear: Number,
    employeeCount: Number,
    website: String,
    description: String
  },
  contactDetails: {
    primaryContact: {
      name: {
        type: String,
        required: [true, 'Primary contact name is required'],
        trim: true
      },
      email: {
        type: String,
        required: [true, 'Primary contact email is required'],
        trim: true,
        lowercase: true,
        match: [/^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/, 'Please provide a valid email']
      },
      phone: {
        type: String,
        required: [true, 'Primary contact phone is required'],
        trim: true
      },
      designation: String
    },
    alternateContact: {
      name: String,
      email: String,
      phone: String,
      designation: String
    }
  },
  address: {
    street: {
      type: String,
      required: [true, 'Street address is required']
    },
    city: {
      type: String,
      required: [true, 'City is required']
    },
    state: {
      type: String,
      required: [true, 'State is required']
    },
    country: {
      type: String,
      required: [true, 'Country is required']
    },
    zipCode: {
      type: String,
      required: [true, 'Zip code is required']
    }
  },
  documents: [{
    type: {
      type: String,
      enum: Object.values(DOCUMENT_TYPES),
      required: true
    },
    name: {
      type: String,
      required: true
    },
    url: {
      type: String,
      required: true
    },
    mimeType: String,
    size: Number,
    uploadedAt: {
      type: Date,
      default: Date.now
    },
    verifiedAt: Date,
    verifiedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    status: {
      type: String,
      enum: ['pending', 'verified', 'rejected'],
      default: 'pending'
    },
    notes: String
  }],
  plan: {
    name: {
      type: String,
      required: [true, 'Plan name is required']
    },
    price: {
      type: Number,
      required: [true, 'Plan price is required']
    },
    billingCycle: {
      type: String,
      enum: ['monthly', 'quarterly', 'yearly'],
      required: [true, 'Billing cycle is required']
    },
    features: [String],
    addons: [{
      name: String,
      price: Number,
      description: String
    }]
  },
  status: {
    type: String,
    enum: Object.values(APPLICATION_STATUS),
    default: APPLICATION_STATUS.DRAFT
  },
  statusHistory: [{
    status: {
      type: String,
      enum: Object.values(APPLICATION_STATUS),
      required: true
    },
    changedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    changedAt: {
      type: Date,
      default: Date.now
    },
    notes: String
  }],
  notes: [{
    content: {
      type: String,
      required: true
    },
    type: {
      type: String,
      enum: ['internal', 'external'],
      default: 'internal'
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    createdAt: {
      type: Date,
      default: Date.now
    }
  }],
  reviewedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  reviewedAt: Date,
  approvedAt: Date,
  rejectedAt: Date,
  rejectionReason: String
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Create compound indexes for faster queries
applicationSchema.index({ tenantId: 1, status: 1 });
applicationSchema.index({ status: 1, createdAt: -1 });
applicationSchema.index({ 'businessDetails.name': 1, status: 1 });
applicationSchema.index({ createdAt: -1 });

// Virtual for application age
applicationSchema.virtual('age').get(function() {
  return Math.floor((Date.now() - this.createdAt) / (1000 * 60 * 60 * 24));
});

// Virtual for document count
applicationSchema.virtual('documentCount').get(function() {
  return this.documents.length;
});

// Virtual for verified document count
applicationSchema.virtual('verifiedDocumentCount').get(function() {
  return this.documents.filter(doc => doc.status === 'verified').length;
});

// Method to add status history
applicationSchema.methods.addStatusHistory = async function(status, userId, notes = '') {
  this.statusHistory.push({
    status,
    changedBy: userId,
    notes
  });

  // Update current status
  this.status = status;

  // Update relevant timestamps
  switch (status) {
    case APPLICATION_STATUS.APPROVED:
      this.approvedAt = Date.now();
      break;
    case APPLICATION_STATUS.REJECTED:
      this.rejectedAt = Date.now();
      this.rejectionReason = notes;
      break;
  }

  return await this.save();
};

// Method to add note
applicationSchema.methods.addNote = async function(content, userId, type = 'internal') {
  this.notes.push({
    content,
    type,
    createdBy: userId
  });

  return await this.save();
};

// Static method to get application statistics
applicationSchema.statics.getStatistics = async function() {
  return await this.aggregate([
    {
      $group: {
        _id: '$status',
        count: { $sum: 1 }
      }
    }
  ]);
};

const Application = mongoose.model('Application', applicationSchema);

module.exports = Application;
