const mongoose = require('mongoose');
const { RESOURCES, ACTIONS } = require('../config/appConfig');

const permissionSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Permission name is required'],
    trim: true,
    lowercase: true
  },
  description: {
    type: String,
    required: [true, 'Permission description is required']
  },
  resource: {
    type: String,
    required: [true, 'Resource is required'],
    enum: Object.values(RESOURCES)
  },
  actions: [{
    type: String,
    required: [true, 'At least one action is required'],
    enum: Object.values(ACTIONS)
  }],
  conditions: {
    type: Map,
    of: mongoose.Schema.Types.Mixed,
    default: new Map()
  },
  isSystem: {
    type: Boolean,
    default: false
  },
  status: {
    type: String,
    enum: ['active', 'inactive'],
    default: 'active'
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  updatedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Create compound indexes for faster queries
permissionSchema.index({ name: 1 }, { unique: true });
permissionSchema.index({ resource: 1, actions: 1, status: 1, isSystem: 1 });

// Pre-save middleware to ensure system permissions can't be modified
permissionSchema.pre('save', function(next) {
  if (this.isSystem && this.isModified()) {
    const error = new Error('System permissions cannot be modified');
    error.status = 400;
    return next(error);
  }
  next();
});

// Static method to create system permissions
permissionSchema.statics.createSystemPermissions = async function() {
  const systemPermissions = [
    {
      name: 'manage_all',
      description: 'Full system access',
      resource: RESOURCES.ALL,
      actions: Object.values(ACTIONS),
      isSystem: true
    },
    {
      name: 'manage_applications',
      description: 'Manage all application operations',
      resource: RESOURCES.APPLICATIONS,
      actions: [ACTIONS.CREATE, ACTIONS.READ, ACTIONS.UPDATE, ACTIONS.DELETE, ACTIONS.APPROVE, ACTIONS.REJECT],
      isSystem: true
    },
    {
      name: 'manage_tenants',
      description: 'Manage all tenant operations',
      resource: RESOURCES.TENANTS,
      actions: [ACTIONS.CREATE, ACTIONS.READ, ACTIONS.UPDATE, ACTIONS.DELETE, ACTIONS.MANAGE],
      isSystem: true
    }
  ];

  try {
    for (const permission of systemPermissions) {
      await this.findOneAndUpdate(
        { name: permission.name },
        permission,
        { upsert: true, new: true }
      );
    }
  } catch (error) {
    console.error('Error creating system permissions:', error);
    throw error;
  }
};

// Method to check if permission allows specific action
permissionSchema.methods.allowsAction = function(action) {
  return this.actions.includes(action);
};

// Method to check if conditions are met
permissionSchema.methods.checkConditions = function(context) {
  if (!this.conditions.size) return true;
  
  for (const [key, condition] of this.conditions) {
    const contextValue = context[key];
    if (!contextValue) return false;

    if (condition instanceof RegExp) {
      if (!condition.test(contextValue)) return false;
    } else if (Array.isArray(condition)) {
      if (!condition.includes(contextValue)) return false;
    } else if (condition !== contextValue) {
      return false;
    }
  }

  return true;
};

const Permission = mongoose.model('Permission', permissionSchema);

module.exports = Permission;
