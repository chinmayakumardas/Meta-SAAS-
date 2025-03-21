require('dotenv').config();

module.exports = {
  // Server Configuration
  PORT: process.env.PORT || 5000,
  MONGO_URI: process.env.MONGO_URI || 'mongodb://localhost:27017/meta-saas',
  SESSION_SECRET: process.env.SESSION_SECRET || 'your-secret-key',
  NODE_ENV: process.env.NODE_ENV || 'development',
  JWT_SECRET: process.env.JWT_SECRET || 'your-super-secret-jwt-key',
  JWT_EXPIRY: '24h',
  PASSWORD_SALT_ROUNDS: 10,
  EMAIL_SERVICE: process.env.EMAIL_SERVICE,
  EMAIL_USER: process.env.EMAIL_USER,
  EMAIL_PASS: process.env.EMAIL_PASS,

  // Log Categories
  LOG_CATEGORIES: {
    AUTH: 'auth',
    USER: 'user',
    ROLE: 'role',
    PERMISSION: 'permission',
    APPLICATION: 'application',
    TENANT: 'tenant',
    SYSTEM: 'system',
    DOCUMENT: 'document',
    BILLING: 'billing'
  },

  // Log Levels
  LOG_LEVELS: {
    INFO: 'info',
    WARNING: 'warning',
    ERROR: 'error',
    CRITICAL: 'critical',
    DEBUG: 'debug'
  },

  // Application Status
  APPLICATION_STATUS: {
    DRAFT: 'draft',
    PENDING: 'pending',
    REVIEW: 'review',
    APPROVED: 'approved',
    REJECTED: 'rejected'
  },

  // Document Types
  DOCUMENT_TYPES: {
    BUSINESS_LICENSE: 'business_license',
    TAX_DOCUMENT: 'tax_document',
    IDENTITY_PROOF: 'identity_proof',
    ADDRESS_PROOF: 'address_proof',
    BANK_STATEMENT: 'bank_statement',
    OTHER: 'other'
  },

  // Resources for Permissions
  RESOURCES: {
    ALL: '*',
    APPLICATIONS: 'applications',
    TENANTS: 'tenants',
    ADMINS: 'admins',
    USERS: 'users',
    ROLES: 'roles',
    PERMISSIONS: 'permissions',
    DOCUMENTS: 'documents',
    LOGS: 'logs',
    SETTINGS: 'settings'
  },

  // Actions for Permissions
  ACTIONS: {
    CREATE: 'create',
    READ: 'read',
    UPDATE: 'update',
    DELETE: 'delete',
    MANAGE: 'manage',
    APPROVE: 'approve',
    REJECT: 'reject',
    EXPORT: 'export',
    IMPORT: 'import'
  },

  // Authentication
  OTP_EXPIRY_MINUTES: 10,

  // Role Configuration
  ROLES: {
    SUPER_ADMIN: 'superAdmin',
    ADMIN: 'admin',
    TENANT_ADMIN: 'tenantAdmin'
  }
};