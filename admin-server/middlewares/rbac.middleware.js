const appConfig = require('../config/appConfig');
const customError = require('../utils/customError');

const rbac = (allowedRoles) => {
    return (req, res, next) => {
        if (!req.session || !req.session.user) {
            return next(new customError('Unauthorized - No session', 401));
        }

        const userRole = req.session.user.role;
        if (!userRole) {
            return next(new customError('Unauthorized - No role', 401));
        }

        const roles = Array.isArray(allowedRoles) ? allowedRoles : [allowedRoles];
        
        if (!roles.includes(userRole)) {
            return next(new customError(`Forbidden - Required roles: ${roles.join(', ')}`, 403));
        }

        next();
    };
};

module.exports = { rbac };
