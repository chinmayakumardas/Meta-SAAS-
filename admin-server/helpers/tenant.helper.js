// const generateId = require('../utils/generateId');

// exports.convertToPermanentId = (tenant) => {
//   if (tenant.isTemporary) {
//     tenant.tenantId = generateId.permanentTenantId();
//     tenant.isTemporary = false;
//   }
//   return tenant;
// };
const { generatePermanentTenantId } = require('../utils/generateId');

exports.convertToPermanentId = (tenant) => {
    if (tenant.isVerified && tenant.tenantId.startsWith('temp_')) {
        tenant.tenantId = generatePermanentTenantId();
    }
    return tenant;
};
