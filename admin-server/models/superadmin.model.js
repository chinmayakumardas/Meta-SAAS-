const mongoose = require('mongoose');

const SuperAdminSchema = new mongoose.Schema({
  email: { type: String, required: true, unique: true },
  name: { type: String, required: true },
  password: { type: String, required: true },
  role: { type: String, default: 'superadmin' },
  isActive: { type: Boolean, default: true },
  lastLogin: { type: Date },
  permissions: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Permission' }],
  status: {
    type: String,
    enum: ['active', 'inactive', 'suspended'],
    default: 'active'
  },
  loginAttempts: {
    type: Number,
    default: 0
  },
  lockUntil: Date
}, { timestamps: true });

// Create compound indexes for faster queries
SuperAdminSchema.index({ role: 1, isActive: 1 });
SuperAdminSchema.index({ status: 1, createdAt: -1 });

// Method to check if account is locked
SuperAdminSchema.methods.isLocked = function() {
  return !!(this.lockUntil && this.lockUntil > Date.now());
};

// Method to increment login attempts
SuperAdminSchema.methods.incrementLoginAttempts = async function() {
  // If lock has expired, reset attempts and lock
  if (this.lockUntil && this.lockUntil < Date.now()) {
    return await this.updateOne({
      $set: { loginAttempts: 1 },
      $unset: { lockUntil: 1 }
    });
  }

  const updates = { $inc: { loginAttempts: 1 } };
  
  // Lock the account if we've reached max attempts and haven't locked it yet
  if (this.loginAttempts + 1 >= 5 && !this.isLocked()) {
    updates.$set = { lockUntil: Date.now() + 60 * 60 * 1000 }; // 1 hour lock
  }

  return await this.updateOne(updates);
};

// Method to reset login attempts
SuperAdminSchema.methods.resetLoginAttempts = function() {
  return this.updateOne({
    $set: { loginAttempts: 0 },
    $unset: { lockUntil: 1 }
  });
};

module.exports = mongoose.model('SuperAdmin', SuperAdminSchema);
