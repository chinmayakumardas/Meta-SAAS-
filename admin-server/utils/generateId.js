const crypto = require('crypto');

exports.temporaryTenantId = () => {
  return 'temp_' + crypto.randomBytes(4).toString('hex');
};

exports.permanentTenantId = () => {
  return 'tenant_' + crypto.randomBytes(6).toString('hex');
};
