const mongoose = require('mongoose');

const AdminSchema = new mongoose.Schema({
  email: { type: String, required: true, unique: true },
  name: { type: String, required: true },
  password: { type: String, required: true },
  role: { type: String, default: 'admin' },
  isActive: { type: Boolean, default: true },
  lastLogin: { type: Date },
  permissions: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Permission' }]
}, { timestamps: true });

// Create compound indexes for faster queries
AdminSchema.index({ role: 1, isActive: 1 });
AdminSchema.index({ createdAt: -1 });

module.exports = mongoose.model('Admin', AdminSchema);
