const mongoose = require('mongoose');

const roleSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Role name is required'],
    trim: true
  },
  description: {
    type: String,
    required: [true, 'Role description is required']
  },
  permissions: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Permission',
    required: true
  }],
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
roleSchema.index({ name: 1 }, { unique: true });
roleSchema.index({ status: 1, isSystem: 1 });
roleSchema.index({ createdAt: -1 });

// Pre-save middleware to ensure system roles can't be modified
roleSchema.pre('save', function(next) {
  if (this.isSystem && this.isModified()) {
    const error = new Error('System roles cannot be modified');
    error.status = 400;
    return next(error);
  }
  next();
});

// Static method to create system roles
roleSchema.statics.createSystemRoles = async function() {
  const systemRoles = [
    {
      name: 'superAdmin',
      description: 'Super Administrator with full system access',
      isSystem: true
    },
    {
      name: 'admin',
      description: 'Administrator with management access',
      isSystem: true
    },
    {
      name: 'tenantAdmin',
      description: 'Tenant Administrator with tenant-specific access',
      isSystem: true
    }
  ];

  try {
    for (const role of systemRoles) {
      await this.findOneAndUpdate(
        { name: role.name },
        role,
        { upsert: true, new: true }
      );
    }
  } catch (error) {
    console.error('Error creating system roles:', error);
    throw error;
  }
};

// Method to add permissions
roleSchema.methods.addPermissions = async function(permissionIds) {
  if (this.isSystem) {
    throw new Error('Cannot modify permissions of system roles');
  }

  this.permissions = [...new Set([...this.permissions, ...permissionIds])];
  return await this.save();
};

// Method to remove permissions
roleSchema.methods.removePermissions = async function(permissionIds) {
  if (this.isSystem) {
    throw new Error('Cannot modify permissions of system roles');
  }

  this.permissions = this.permissions.filter(
    permission => !permissionIds.includes(permission.toString())
  );
  return await this.save();
};

// Method to check if role has specific permission
roleSchema.methods.hasPermission = function(permissionId) {
  return this.permissions.includes(permissionId);
};

const Role = mongoose.model('Role', roleSchema);

module.exports = Role;
