const mongoose = require('mongoose');
const { LOG_CATEGORIES } = require('../config/appConfig');

const actionLogSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'User ID is required']
  },
  action: {
    type: String,
    required: [true, 'Action is required'],
    trim: true
  },
  category: {
    type: String,
    required: [true, 'Category is required'],
    enum: Object.values(LOG_CATEGORIES)
  },
  description: {
    type: String,
    required: [true, 'Description is required'],
    trim: true
  },
  targetResource: {
    type: String,
    required: [true, 'Target resource is required'],
    trim: true
  },
  targetId: {
    type: mongoose.Schema.Types.ObjectId,
    required: [true, 'Target ID is required']
  },
  changes: {
    before: mongoose.Schema.Types.Mixed,
    after: mongoose.Schema.Types.Mixed
  },
  metadata: {
    ip: String,
    userAgent: String,
    browser: String,
    platform: String,
    deviceType: String
  },
  status: {
    type: String,
    enum: ['success', 'failed'],
    required: true
  },
  errorDetails: {
    code: String,
    message: String,
    stack: String
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Create indexes for faster queries
actionLogSchema.index({ userId: 1, createdAt: -1 });
actionLogSchema.index({ category: 1, action: 1 });
actionLogSchema.index({ targetResource: 1, targetId: 1 });
actionLogSchema.index({ status: 1, createdAt: -1 });
actionLogSchema.index({ createdAt: -1 });

// Static method to log an action
actionLogSchema.statics.logAction = async function(params) {
  const {
    userId,
    action,
    category,
    description,
    targetResource,
    targetId,
    changes,
    metadata,
    status,
    errorDetails
  } = params;

  return await this.create({
    userId,
    action,
    category,
    description,
    targetResource,
    targetId,
    changes,
    metadata,
    status,
    errorDetails
  });
};

// Static method to get user activity
actionLogSchema.statics.getUserActivity = async function(userId, options = {}) {
  const {
    startDate,
    endDate,
    categories,
    actions,
    status,
    limit = 20,
    page = 1
  } = options;

  const query = { userId };

  if (startDate && endDate) {
    query.createdAt = {
      $gte: new Date(startDate),
      $lte: new Date(endDate)
    };
  }

  if (categories?.length) {
    query.category = { $in: categories };
  }

  if (actions?.length) {
    query.action = { $in: actions };
  }

  if (status) {
    query.status = status;
  }

  const skip = (page - 1) * limit;

  const [logs, total] = await Promise.all([
    this.find(query)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .populate('userId', 'name email'),
    this.countDocuments(query)
  ]);

  return {
    logs,
    pagination: {
      page,
      limit,
      total,
      pages: Math.ceil(total / limit)
    }
  };
};

// Static method to get activity statistics
actionLogSchema.statics.getActivityStats = async function(options = {}) {
  const {
    startDate,
    endDate,
    userId
  } = options;

  const query = {};

  if (startDate && endDate) {
    query.createdAt = {
      $gte: new Date(startDate),
      $lte: new Date(endDate)
    };
  }

  if (userId) {
    query.userId = userId;
  }

  return await this.aggregate([
    { $match: query },
    {
      $group: {
        _id: {
          category: '$category',
          action: '$action',
          status: '$status'
        },
        count: { $sum: 1 }
      }
    },
    {
      $group: {
        _id: '$_id.category',
        actions: {
          $push: {
            action: '$_id.action',
            status: '$_id.status',
            count: '$count'
          }
        },
        totalCount: { $sum: '$count' }
      }
    }
  ]);
};

const ActionLog = mongoose.model('ActionLog', actionLogSchema);

module.exports = ActionLog;
